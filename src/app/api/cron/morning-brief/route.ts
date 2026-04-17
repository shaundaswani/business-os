import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * POST /api/cron/morning-brief
 * Scheduled via Vercel Cron at 02:00 UTC (06:00 GST) daily.
 *
 * Phase 1 stub — Morning Brief module activates after Trading.
 * When activated, this will:
 *   1. Fetch yesterday's closed trades + PnL
 *   2. Fetch today's tasks (urgent + high priority)
 *   3. Fetch today's calendar events
 *   4. Call Claude API to generate a daily digest
 *   5. Store digest in `documents` table
 *   6. Send notification to owner
 *
 * See workflows/morning_brief/digest.md for the full SOP.
 */
export async function GET(request: NextRequest) {
  // Vercel Cron authenticates via Authorization header in production
  const authHeader = request.headers.get('authorization')
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    ok: true,
    message: 'Morning Brief cron stub — not yet activated',
    timestamp: new Date().toISOString(),
  })
}
