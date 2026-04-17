-- ============================================================
-- 005_manual_trade_rpc.sql
-- Dedicated RPC for manual trade entry from the UI.
--
-- Why a separate function from process_trading_signal:
--   - process_trading_signal is called by the webhook (service role)
--     and handles signal→trade matching logic.
--   - insert_manual_trade is called by authenticated users from the
--     browser and must enforce RBAC (owner/contributor only) while
--     supporting full open or closed trade entry in one call.
-- ============================================================

CREATE OR REPLACE FUNCTION insert_manual_trade(
  p_asset        text,
  p_direction    text,
  p_entry_price  numeric,
  p_entry_time   timestamptz,
  p_exit_price   numeric    DEFAULT NULL,
  p_exit_time    timestamptz DEFAULT NULL,
  p_notes        text       DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role     text;
  v_trade_id uuid;
  v_pnl_r    numeric;
  v_status   text;
BEGIN
  -- RBAC check: only owner or contributor may log manual trades
  SELECT role INTO v_role FROM profiles WHERE id = auth.uid();
  IF v_role NOT IN ('owner', 'contributor') THEN
    RAISE EXCEPTION 'Insufficient permissions to log manual trades';
  END IF;

  -- Validate direction
  IF p_direction NOT IN ('long', 'short') THEN
    RAISE EXCEPTION 'direction must be ''long'' or ''short''';
  END IF;

  -- Determine status and pnl_r
  IF p_exit_price IS NOT NULL THEN
    IF p_direction = 'long' THEN
      v_pnl_r := (p_exit_price - p_entry_price) / (p_entry_price * 0.005);
    ELSE
      v_pnl_r := (p_entry_price - p_exit_price) / (p_entry_price * 0.005);
    END IF;
    v_pnl_r  := round(v_pnl_r::numeric, 4);
    v_status := 'closed';
  ELSE
    v_pnl_r  := NULL;
    v_status := 'open';
  END IF;

  INSERT INTO trades (
    asset, direction,
    entry_price, entry_time,
    exit_price, exit_time,
    pnl_r, status, notes
  )
  VALUES (
    upper(p_asset), p_direction,
    p_entry_price, p_entry_time,
    p_exit_price, COALESCE(p_exit_time, CASE WHEN p_exit_price IS NOT NULL THEN now() END),
    v_pnl_r, v_status, p_notes
  )
  RETURNING id INTO v_trade_id;

  RETURN v_trade_id;
END;
$$;
