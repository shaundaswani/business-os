import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { parseWebhookPayload } from '@/lib/trading/matching'
import { ZodError } from 'zod'

export const runtime = 'nodejs'

function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder()
  const aBytes = encoder.encode(a)
  const bBytes = encoder.encode(b)

  // Must be same length to compare byte-by-byte without leaking length via timing
  if (aBytes.length !== bBytes.length) return false

  let result = 0
  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i] ^ bBytes[i]
  }
  return result === 0
}

export async function POST(request: NextRequest) {
  // 1. Validate webhook secret
  const incomingSecret = request.headers.get('x-webhook-secret') ?? ''
  const expectedSecret = process.env.WEBHOOK_SECRET ?? ''

  if (!expectedSecret || !timingSafeEqual(incomingSecret, expectedSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse and validate payload
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  let payload
  try {
    payload = parseWebhookPayload(body)
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid payload', issues: err.issues },
        { status: 422 },
      )
    }
    return NextResponse.json({ error: 'Validation failed' }, { status: 422 })
  }

  // 3. Process signal via SECURITY DEFINER function (no direct table writes)
  const supabase = createServiceClient()

  const { data, error } = await supabase.rpc('process_trading_signal', {
    p_asset: payload.asset,
    p_direction: payload.direction,
    p_signal_type: payload.signal_type,
    p_price: payload.price,
    p_timestamp: payload.timestamp,
    p_raw_payload: body as Record<string, unknown>,
  })

  if (error) {
    console.error('[webhook] process_trading_signal error:', error)
    return NextResponse.json({ error: 'Signal processing failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, result: data }, { status: 200 })
}

// Reject non-POST methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
