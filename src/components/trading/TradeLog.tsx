import type { Trade } from '@/types'
import Badge from '@/components/ui/Badge'
import { formatR, formatPrice, formatDate } from '@/lib/utils'

interface TradeLogProps {
  trades: Trade[]
}

export default function TradeLog({ trades }: TradeLogProps) {
  return (
    <div className="bg-white border border-os-border rounded-card p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-os-muted mb-3">
        Trade Log
      </div>

      {trades.length === 0 ? (
        <div className="py-8 text-center text-sm text-os-muted">No closed trades yet</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr>
                {['Date', 'Pair', 'Dir', 'Entry', 'Exit', 'P&L (R)', 'Result'].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] uppercase tracking-wider text-os-muted py-2 pr-4 border-b-2 border-os-border font-semibold"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => {
                const isWin = (trade.pnl_r ?? 0) > 0
                return (
                  <tr key={trade.id} className="hover:bg-os-tile transition-colors">
                    <td className="py-2 pr-4 text-os-text-secondary border-b border-slate-50">
                      {formatDate(trade.entry_time)}
                    </td>
                    <td className="py-2 pr-4 font-semibold text-os-text border-b border-slate-50">
                      {trade.asset}
                    </td>
                    <td className="py-2 pr-4 border-b border-slate-50">
                      <Badge variant={trade.direction === 'long' ? 'win' : 'loss'}>
                        {trade.direction.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-2 pr-4 text-os-text border-b border-slate-50">
                      {formatPrice(trade.entry_price)}
                    </td>
                    <td className="py-2 pr-4 text-os-text border-b border-slate-50">
                      {trade.exit_price ? formatPrice(trade.exit_price) : '—'}
                    </td>
                    <td className={`py-2 pr-4 font-semibold border-b border-slate-50 ${isWin ? 'text-os-win' : 'text-os-loss'}`}>
                      {formatR(trade.pnl_r)}
                    </td>
                    <td className="py-2 border-b border-slate-50">
                      <Badge variant={isWin ? 'win' : 'loss'}>
                        {isWin ? 'WIN' : 'LOSS'}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
