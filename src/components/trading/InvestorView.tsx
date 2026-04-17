import type { TradingAnalytics } from '@/types'
import { formatR, formatPercent } from '@/lib/utils'

interface InvestorViewProps {
  analytics: TradingAnalytics
  totalTrades: number
}

export default function InvestorView({ analytics, totalTrades }: InvestorViewProps) {
  const { winRate, profitFactor, totalR, maxDrawdown } = analytics

  return (
    <div className="bg-white border-2 border-os-text rounded-featured p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-os-muted">
          Investor Summary
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] text-os-muted uppercase tracking-wider mb-0.5">Net Performance</div>
          <div className={`text-3xl font-bold ${totalR >= 0 ? 'text-os-win' : 'text-os-loss'}`}>
            {formatR(totalR)}
          </div>
          <div className="text-[11px] text-os-muted mt-0.5">{totalTrades} closed trades</div>
        </div>
        <div>
          <div className="text-[10px] text-os-muted uppercase tracking-wider mb-0.5">Win Rate</div>
          <div className="text-3xl font-bold text-os-text">{formatPercent(winRate)}</div>
          <div className="text-[11px] text-os-muted mt-0.5">
            {analytics.wins}W / {analytics.losses}L
          </div>
        </div>
        <div>
          <div className="text-[10px] text-os-muted uppercase tracking-wider mb-0.5">Profit Factor</div>
          <div className="text-2xl font-bold text-os-text">{profitFactor.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-[10px] text-os-muted uppercase tracking-wider mb-0.5">Max Drawdown</div>
          <div className="text-2xl font-bold text-os-text">{maxDrawdown.toFixed(2)}R</div>
        </div>
      </div>
    </div>
  )
}
