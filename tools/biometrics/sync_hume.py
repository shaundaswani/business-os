#!/usr/bin/env python3
"""
tools/biometrics/sync_hume.py

Hume Band biometric data ingestion.
Activation: Activates with Personal module.

When activated, this will:
  1. Connect to Hume Band API / export format
  2. Fetch sleep, HRV, metabolic, stress scores for date range
  3. Upsert into `biometrics` table
  4. Calculate recovery_score using the formula in lib/utils.ts

Usage:
  python sync_hume.py [--date YYYY-MM-DD] [--days 7]
"""
print("Hume Band sync — stub. Activates with Personal module.")
