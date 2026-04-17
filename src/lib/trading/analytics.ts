import type { Trade, TradingAnalytics } from '@/types'

/**
 * Compute all analytics metrics from a list of closed trades.
 * Only closed trades with a non-null pnl_r contribute to metrics.
 */
export function computeAnalytics(trades: Trade[]): TradingAnalytics {
  const closed = trades.filter((t) => t.status === 'closed' && t.pnl_r !== null)
  const rValues = closed.map((t) => t.pnl_r!)

  const totalTrades = closed.length

  if (totalTrades === 0) {
    return {
      totalTrades: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      profitFactor: 0,
      expectancy: 0,
      maxDrawdown: 0,
      sharpe: 0,
      sortino: 0,
      totalR: 0,
      avgWin: 0,
      avgLoss: 0,
      cumulativeR: [],
    }
  }

  const wins = rValues.filter((r) => r > 0)
  const losses = rValues.filter((r) => r <= 0)

  const winCount = wins.length
  const lossCount = losses.length
  const winRate = (winCount / totalTrades) * 100

  const sumWins = wins.reduce((a, b) => a + b, 0)
  const sumLosses = Math.abs(losses.reduce((a, b) => a + b, 0))

  const profitFactor = sumLosses === 0 ? sumWins : sumWins / sumLosses

  const avgWin = winCount > 0 ? sumWins / winCount : 0
  const avgLoss = lossCount > 0 ? sumLosses / lossCount : 0
  const lossRate = lossCount / totalTrades

  const expectancy = winRate / 100 * avgWin - lossRate * avgLoss

  // Cumulative R series
  const cumulativeR: number[] = []
  let running = 0
  for (const r of rValues) {
    running += r
    cumulativeR.push(parseFloat(running.toFixed(4)))
  }

  const totalR = cumulativeR[cumulativeR.length - 1] ?? 0

  // Max drawdown (peak-to-trough on cumulative R)
  let peak = -Infinity
  let maxDrawdown = 0
  for (const val of cumulativeR) {
    if (val > peak) peak = val
    const drawdown = peak - val
    if (drawdown > maxDrawdown) maxDrawdown = drawdown
  }

  // Sharpe = mean(R) / std(R) * sqrt(252)
  const mean = totalR / totalTrades
  const variance =
    rValues.reduce((acc, r) => acc + Math.pow(r - mean, 2), 0) / totalTrades
  const stdDev = Math.sqrt(variance)
  const sharpe = stdDev === 0 ? 0 : (mean / stdDev) * Math.sqrt(252)

  // Sortino = mean(R) / downside_std(R) * sqrt(252)
  const downsideValues = rValues.filter((r) => r < 0)
  const downsideVariance =
    downsideValues.length > 0
      ? downsideValues.reduce((acc, r) => acc + r * r, 0) / totalTrades
      : 0
  const downsideStd = Math.sqrt(downsideVariance)
  const sortino = downsideStd === 0 ? 0 : (mean / downsideStd) * Math.sqrt(252)

  return {
    totalTrades,
    wins: winCount,
    losses: lossCount,
    winRate: parseFloat(winRate.toFixed(1)),
    profitFactor: parseFloat(profitFactor.toFixed(2)),
    expectancy: parseFloat(expectancy.toFixed(3)),
    maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
    sharpe: parseFloat(sharpe.toFixed(2)),
    sortino: parseFloat(sortino.toFixed(2)),
    totalR: parseFloat(totalR.toFixed(2)),
    avgWin: parseFloat(avgWin.toFixed(2)),
    avgLoss: parseFloat(avgLoss.toFixed(2)),
    cumulativeR,
  }
}
