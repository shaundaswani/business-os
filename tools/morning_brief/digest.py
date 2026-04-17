#!/usr/bin/env python3
"""
tools/morning_brief/digest.py

Daily Morning Brief digest generator.
Called by the Vercel Cron job at 06:00 GST via /api/cron/morning-brief.

Activation: Activates with Morning Brief module (next after Trading)

When activated, this will:
  1. Fetch yesterday's closed trades + PnL summary
  2. Fetch today's urgent/high priority tasks
  3. Fetch today's calendar events
  4. Call Claude API to generate a structured digest
  5. Store digest in `documents` table
  6. Insert notification for owner

Usage (manual):
  python digest.py [--date YYYY-MM-DD]
"""
import sys

print("Morning Brief digest — stub")
print("This script activates when the Morning Brief module goes live.")
print("See workflows/trading/signal_processing.md for the WAT pattern.")
print("Activation order: Trading → Morning Brief → Jetset BC → Commercial")

sys.exit(0)
