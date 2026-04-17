# Tools

This directory contains **Python scripts** for deterministic data operations in the Business OS WAT framework.

## Principle

AI agents (Claude Code) orchestrate — scripts execute. This separation means:
- Data pipelines are deterministic and testable
- AI makes decisions; scripts handle side effects
- Errors in scripts are recoverable; errors in AI are opaque

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install supabase python-dotenv requests
```

Copy `.env.example` to `.env` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Tool Index

| Script | Module | Purpose |
|--------|--------|---------|
| `trading/sync_trades.py` | Trading | Manual reconciliation of trades vs TradingView history |
| `morning_brief/digest.py` | Morning Brief | Generate daily AI digest (activates with Morning Brief module) |
| `biometrics/sync_hume.py` | Personal | Sync Hume Band biometric data to Supabase |
| `realestate/rent_arb.py` | Jetset / Residential | Pull market rent data and flag arbitrage opportunities |

## Usage Pattern

Always read the relevant workflow before running a tool:
```bash
cat ../workflows/<module>/<workflow>.md
python tools/<module>/<script>.py --help
```
