#!/usr/bin/env python3
"""
tools/trading/sync_trades.py

Manual reconciliation tool — compares trades in Supabase against a
TradingView export CSV and flags discrepancies.

Usage:
  python sync_trades.py --csv <path_to_tv_export.csv> [--dry-run]

Activation: Available now (Trading module is live)
"""
import argparse
import csv
import os
import sys
from datetime import datetime

try:
    from supabase import create_client
    from dotenv import load_dotenv
except ImportError:
    print("Missing dependencies. Run: pip install supabase python-dotenv")
    sys.exit(1)

load_dotenv()


def get_supabase_client():
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required")
        sys.exit(1)
    return create_client(url, key)


def fetch_trades(supabase):
    result = supabase.table("trades").select("*").order("entry_time").execute()
    return result.data


def load_tv_csv(path: str) -> list[dict]:
    """
    Load TradingView export CSV.
    Expected columns: Date/Time, Symbol, Type, Price, PnL
    Adjust column names to match your TV export format.
    """
    trades = []
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            trades.append(row)
    return trades


def reconcile(supabase_trades: list[dict], tv_trades: list[dict], dry_run: bool):
    print(f"\nSupabase trades: {len(supabase_trades)}")
    print(f"TradingView trades: {len(tv_trades)}")

    # Stub: in production, match by asset + entry_time + direction
    # and flag any trades present in TV but not in Supabase (missed webhooks)
    print("\nReconciliation logic — implement matching for your TV CSV format.")
    print("This stub prints counts only.")

    if dry_run:
        print("\n[DRY RUN] No changes made.")
    else:
        print("\nNo automated fixes implemented yet — review manually.")


def main():
    parser = argparse.ArgumentParser(description="Reconcile Supabase trades vs TradingView export")
    parser.add_argument("--csv", required=True, help="Path to TradingView export CSV")
    parser.add_argument("--dry-run", action="store_true", help="Show diff without making changes")
    args = parser.parse_args()

    print(f"Business OS — Trade Reconciliation")
    print(f"Run at: {datetime.now().isoformat()}")
    print(f"CSV: {args.csv}")

    supabase = get_supabase_client()
    supabase_trades = fetch_trades(supabase)
    tv_trades = load_tv_csv(args.csv)

    reconcile(supabase_trades, tv_trades, args.dry_run)


if __name__ == "__main__":
    main()
