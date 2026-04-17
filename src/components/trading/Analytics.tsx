import MetricCard from '@/components/ui/MetricCard'
import type { TradingAnalytics } from '@/types'
import { formatR, formatPercent } from '@/lib/utils'

interface AnalyticsProps {
  analytics: TradingAnalytics
}

export default function Analytics({ analytics }: AnalyticsProps) {
  const {
    totalTrades,
    wins,
    winRate,
    profitFactor,
    expectancy,
    maxDrawdown,
    sharpe,
    sortino,
    totalR,
  } = analytics

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <MetricCard
        label="Win Rate"
        value={totalTrades > 0 ? formatPercent(winRate) : '—'}
        sub={`${wins}/${totalTrades} trades`}
        trend={winRate >= 50 ? 'up' : winRate > 0 ? 'down' : 'neutral'}
      />
      <MetricCard
        label="Total R"
        value={totalTrades > 0 ? formatR(totalR) : '—'}
        sub="Net performance"
        trend={totalR > 0 ? 'up' : totalR < 0 ? 'down' : 'neutral'}
      />
      <MetricCard
        label="Profit Factor"
        value={totalTrades > 0 ? profitFactor.toFixed(2) : '—'}
        sub={profitFactor >= 1.5 ? 'Excellent' : profitFactor >= 1 ? 'Positive' : 'Negative'}
        trend={profitFactor >= 1.5 ? 'up' : profitFactor >= 1 ? 'neutral' : 'down'}
      />
      <MetricCard
        label="Expectancy"
        value={totalTrades > 0 ? `${expectancy > 0 ? '+' : ''}${expectancy.toFixed(3)}R` : '—'}
        sub="Per trade avg"
        trend={expectancy > 0 ? 'up' : expectancy < 0 ? 'down' : 'neutral'}
      />
      <MetricCard
        label="Max Drawdown"
        value={totalTrades > 0 ? `${maxDrawdown.toFixed(2)}R` : '—'}
        sub="Peak-to-trough"
        trend={maxDrawdown < 3 ? 'neutral' : 'down'}
      />
      <MetricCard
        label="Sharpe Ratio"
        value={totalTrades > 0 ? sharpe.toFixed(2) : '—'}
        sub="Risk-adjusted"
        trend={sharpe >= 1 ? 'up' : sharpe >= 0 ? 'neutral' : 'down'}
      />
      <MetricCard
        label="Sortino Ratio"
        value={totalTrades > 0 ? sortino.toFixed(2) : '—'}
        sub="Downside-adjusted"
        trend={sortino >= 1 ? 'up' : sortino >= 0 ? 'neutral' : 'down'}
      />
      <MetricCard
        label="Total Trades"
        value={totalTrades}
        sub={`${totalTrades - wins} losses`}
      />
    </div>
  )
}
