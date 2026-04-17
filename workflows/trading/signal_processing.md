# Workflow: Trading Signal Processing

**Module:** Trading  
**Trigger:** TradingView webhook → `POST /api/webhook/trading`  
**Last updated:** 2026-04-11

---

## Purpose

Ingest TradingView alerts and convert them into trade records in Supabase, maintaining the entry → partial → closed state machine.

---

## Inputs

```json
{
  "asset": "XAUUSD",
  "direction": "long | short",
  "signal_type": "entry | warning | exit",
  "price": 2312.40,
  "timestamp": "2026-04-11T09:00:00Z"
}
```

Header: `x-webhook-secret: <WEBHOOK_SECRET>`

---

## Steps

### 1. Authentication
- Validate `x-webhook-secret` header using `crypto.timingSafeEqual()`
- Return 401 immediately if mismatch (do not leak timing information)

### 2. Payload Validation
- Parse JSON body
- Validate against Zod schema in `lib/trading/matching.ts`
- `asset` is normalized to UPPERCASE
- Return 422 with Zod error details if invalid

### 3. Signal Processing (via DB function)
Call the `process_trading_signal` Postgres function — **do not write to tables directly**.

#### entry
- INSERT new signal record
- INSERT new trade with `status: 'open'`, `entry_price`, `entry_time`
- Back-link: UPDATE signal with `trade_id`

#### warning
- INSERT signal record
- UPDATE most recent `open` trade for same `asset + direction`:
  - Set `partial_exit_price`, `partial_exit_time`
  - Set `status: 'partial'`
- **Edge case:** If no open trade found, signal is recorded but no trade is updated. Monitor for orphaned warning signals.

#### exit
- INSERT signal record
- UPDATE most recent `open` or `partial` trade for same `asset + direction`:
  - Set `exit_price`, `exit_time`
  - Calculate `pnl_r` using formula below
  - Set `status: 'closed'`
- **Edge case:** If multiple open trades exist for same asset + direction, matches the most recent by `entry_time DESC`.

---

## pnl_r Formula

Fixed 0.5% risk per trade:

- **Long:** `(exit_price − entry_price) / (entry_price × 0.005)`
- **Short:** `(entry_price − exit_price) / (entry_price × 0.005)`

---

## Edge Cases & Known Issues

| Scenario | Behaviour |
|----------|-----------|
| `warning` received with no open trade | Signal logged, no trade updated — investigate in audit log |
| `exit` received with no open/partial trade | Signal logged, no trade updated — check for duplicate exits |
| Same asset, multiple open trades | Matches most recent by `entry_time DESC` |
| Invalid JSON body | Returns 400 |
| Zod validation failure | Returns 422 with issue details |
| DB error | Returns 500, error logged server-side |

---

## Tools Called

None — the webhook route calls the `process_trading_signal` Postgres SECURITY DEFINER function directly. For manual reconciliation, use `tools/trading/sync_trades.py`.

---

## Monitoring

- Check Vercel function logs for `[webhook]` prefix errors
- Monitor `signals` table for entries with `trade_id IS NULL` (orphaned signals)
- Monitor `trades` with `status IN ('open', 'partial')` older than 48 hours (stale positions)
