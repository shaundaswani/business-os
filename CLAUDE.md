# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run type-check   # TypeScript check (no emit)
```

No test runner or linter is configured yet.

## What This Is

Business OS is a single-founder dashboard consolidating 8 business verticals. Only **Trading** is fully implemented. **Morning Brief** has a cron stub (Phase 2). The other 6 modules (`Jetset`, `Commercial`, `ExAIM`, `ImproveMe`, `Residential`, `Personal`) render `<PlaceholderModule>` components.

## Architecture

**Stack:** Next.js 16 App Router · TypeScript (strict) · Tailwind CSS · Supabase (Postgres + Auth + Realtime) · Chart.js · Zod · Vercel

**Path alias:** `@/*` → `src/*`

```
src/
  app/
    api/webhook/trading/   # TradingView webhook → Supabase RPC
    api/cron/              # Vercel Cron jobs (morning-brief at 02:00 UTC)
    auth/callback/         # OAuth code exchange
    dashboard/             # App shell layout + 8 module pages
    login/                 # Magic-link / password auth
  components/
    layout/                # Header, TabBar, OmniSearch, CaptureBar
    trading/               # SignalFeed, Analytics, EquityCurve, etc.
    ui/                    # Reusable primitives (MetricCard, Badge, etc.)
  lib/
    supabase/              # server.ts, client.ts, realtime.ts
    trading/               # Analytics calculations, webhook parsing
    utils.ts               # Formatting helpers
  types/                   # Global TypeScript types
supabase/migrations/       # 001–005 SQL migrations (raw SQL, no ORM)
tools/                     # Python scripts for deterministic data ops
workflows/                 # Markdown SOPs (WAT framework)
```

## Auth

Supabase Auth (magic link + email/password). Flow: `/login` → `/auth/callback` → `/dashboard`.

**Auth is currently disabled for local dev** — the auth guards in `src/app/dashboard/layout.tsx` and `src/proxy.ts` are commented out. Re-enable before deploying to production.

Two Supabase client variants:
- `createClient()` in `src/lib/supabase/server.ts` — anon key + RLS (use in RSC and API routes)
- `createServiceClient()` in `src/lib/supabase/server.ts` — service role, bypasses RLS (API routes only, never expose to client)
- `src/lib/supabase/client.ts` — browser client for `'use client'` components

## Database

No ORM — direct Supabase client + raw SQL migrations in `supabase/migrations/`.

Key tables: `profiles`, `businesses` (8 rows seeded), `business_access` (RBAC), `tasks`, `signals`, `trades`, `biometrics`, `documents`, `audit_log`.

**Trading schema has a circular FK:** `signals.trade_id ↔ trades.signal_id`, resolved via `DEFERRABLE INITIALLY DEFERRED` constraints.

**Never write directly to `signals` or `trades` from API routes.** Use the `process_trading_signal(payload jsonb)` SECURITY DEFINER RPC — it's the only safe entry point for signal/trade mutations and is called from `/api/webhook/trading`.

RLS is enabled on all tables. Policies: owner = full access, contributor = create/update (no delete), viewer = read-only. Helper functions `current_user_role()` and `user_has_business_access(uuid)` are available in SQL.

## Trading Module

The only fully live module. Data flow:
1. Server Component fetches trades + signals via Supabase
2. Client subscribes to Realtime `signals` INSERT channel (`useRealtimeChannel` hook in `src/lib/supabase/realtime.ts`)
3. Analytics computed client-side from closed trades with non-null `pnl_r` (Sharpe, Sortino, win rate, max drawdown, expectancy)
4. Equity curve = cumulative R rendered with Chart.js

PnL uses R-multiples: risk = 0.5% of entry price. Long R = `(exit - entry) / (entry × 0.005)`, short R = `(entry - exit) / (entry × 0.005)`.

Webhook at `/api/webhook/trading` validates `WEBHOOK_SECRET` via timing-safe comparison before calling the RPC.

## Design System (Tailwind)

Custom tokens defined in `tailwind.config.ts`:
- Base: `os-bg`, `os-text`, `os-card`, `os-border`, `os-muted`
- Status banners: `os-info-*`, `os-alert-*`, `os-danger-*`
- Module accent colors: `mod-trading` (purple), `mod-jetset` (cyan), `mod-commercial` (indigo), `mod-residential` (emerald), `mod-personal` (rose), etc.
- Border radius: `rounded-card` (12px), `rounded-featured` (14px)
- Font: DM Sans

## Workflows / Agents / Tools (WAT) Framework

- `workflows/` — Markdown SOPs that agents read before executing tasks
- `tools/` — Python scripts for deterministic data operations (agents orchestrate, scripts mutate)
- Currently only `workflows/trading/signal_processing.md` is documented

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY    # Public anon key
SUPABASE_SERVICE_ROLE_KEY        # Secret — server only, never import in client components
WEBHOOK_SECRET                   # TradingView webhook validation
CRON_SECRET                      # Vercel Cron bearer token (production)
```

## Vercel Cron

Configured in `vercel.json`: `/api/cron/morning-brief` runs at `0 2 * * *` (02:00 UTC).
