'use client'

import { useState } from 'react'
import { useRealtimeChannel } from '@/lib/supabase/realtime'
import type { Signal } from '@/types'
import Badge from '@/components/ui/Badge'
import { formatPrice, formatDateTime } from '@/lib/utils'

interface SignalFeedProps {
  initialSignals: Signal[]
}

const SIGNAL_TYPE_VARIANT = {
  entry: 'win',
  warning: 'warning',
  exit: 'muted',
} as const

export default function SignalFeed({ initialSignals }: SignalFeedProps) {
  const [signals, setSignals] = useState<Signal[]>(initialSignals)

  useRealtimeChannel<Signal>({
    table: 'signals',
    event: 'INSERT',
    onData: ({ new: newSignal }) => {
      setSignals((prev) => [newSignal, ...prev].slice(0, 30))
    },
  })

  return (
    <div className="bg-white border border-os-border rounded-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-os-muted">
          Signal Feed
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-[10px] text-os-muted">TradingView</span>
        </div>
      </div>

      {signals.length === 0 ? (
        <div className="py-8 text-center text-sm text-os-muted">
          Awaiting signals from TradingView…
        </div>
      ) : (
        <div className="space-y-0 divide-y divide-slate-50">
          {signals.slice(0, 10).map((signal) => (
            <div key={signal.id} className="flex items-center gap-3 py-2.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-os-text">{signal.asset}</span>
                  <Badge variant={SIGNAL_TYPE_VARIANT[signal.signal_type]}>
                    {signal.signal_type.toUpperCase()}
                  </Badge>
                  <Badge variant={signal.direction === 'long' ? 'win' : 'loss'}>
                    {signal.direction.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-[11px] text-os-muted mt-0.5">
                  {formatDateTime(signal.timestamp)}
                </div>
              </div>
              <div className="text-sm font-semibold text-os-text shrink-0">
                {formatPrice(signal.price)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
