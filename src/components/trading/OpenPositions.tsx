'use client'

import { useState } from 'react'
import { useRealtimeChannel } from '@/lib/supabase/realtime'
import type { Trade } from '@/types'
import Badge from '@/components/ui/Badge'
import { formatPrice, formatDateTime } from '@/lib/utils'

interface OpenPositionsProps {
  initialTrades: Trade[]
}

export default function OpenPositions({ initialTrades }: OpenPositionsProps) {
  const [trades, setTrades] = useState<Trade[]>(initialTrades)

  useRealtimeChannel<Trade>({
    table: 'trades',
    event: '*',
    onData: ({ eventType, new: newTrade, old: oldTrade }) => {
      setTrades((prev) => {
        if (eventType === 'INSERT' && (newTrade.status === 'open' || newTrade.status === 'partial')) {
          return [newTrade, ...prev]
        }
        if (eventType === 'UPDATE') {
          if (newTrade.status === 'closed') {
            return prev.filter((t) => t.id !== newTrade.id)
          }
          return prev.map((t) => (t.id === newTrade.id ? newTrade : t))
        }
        if (eventType === 'DELETE') {
          return prev.filter((t) => t.id !== oldTrade.id)
        }
        return prev
      })
    },
  })

  const openTrades = trades.filter((t) => t.status === 'open' || t.status === 'partial')

  return (
    <div className="bg-white border border-os-border rounded-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-os-muted">
          Open Positions
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-os-muted">Live</span>
        </div>
      </div>

      {openTrades.length === 0 ? (
        <div className="py-8 text-center text-sm text-os-muted">No open positions</div>
      ) : (
        <div className="space-y-2">
          {openTrades.map((trade) => (
            <div key={trade.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
              <div>
                <div className="text-sm font-semibold text-os-text">{trade.asset}</div>
                <div className="text-[11px] text-os-muted">{formatDateTime(trade.entry_time)}</div>
              </div>
              <div className="flex-1" />
              <Badge variant={trade.direction === 'long' ? 'win' : 'loss'}>
                {trade.direction.toUpperCase()}
              </Badge>
              {trade.status === 'partial' && (
                <Badge variant="warning">PARTIAL</Badge>
              )}
              <div className="text-right">
                <div className="text-sm font-semibold text-os-text">
                  {formatPrice(trade.entry_price)}
                </div>
                {trade.partial_exit_price && (
                  <div className="text-[11px] text-os-muted">
                    Partial @ {formatPrice(trade.partial_exit_price)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
