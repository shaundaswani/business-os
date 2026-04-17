import { createClient } from '@/lib/supabase/server'
import { computeAnalytics } from '@/lib/trading/analytics'
import type { Trade, Signal } from '@/types'
import Analytics from '@/components/trading/Analytics'
import TradeLog from '@/components/trading/TradeLog'
import OpenPositions from '@/components/trading/OpenPositions'
import SignalFeed from '@/components/trading/SignalFeed'
import InvestorView from '@/components/trading/InvestorView'
import ManualTradeModal from '@/components/trading/ManualTradeModal'
import EquityChart from '@/components/ui/EquityChart'

export const revalidate = 0 // always fresh from Supabase

export default async function TradingPage() {
  const supabase = createClient()

  const [tradesResult, signalsResult, profileResult] = await Promise.all([
    supabase
      .from('trades')
      .select('*')
      .order('entry_time', { ascending: false }),
    supabase
      .from('signals')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(20),
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return null
      return supabase.from('profiles').select('role').eq('id', user.id).single()
    }),
  ])

  const trades = (tradesResult.data ?? []) as Trade[]
  const signals = (signalsResult.data ?? []) as Signal[]
  const userRole = profileResult?.data?.role ?? 'viewer'

  const openTrades = trades.filter((t) => t.status === 'open' || t.status === 'partial')
  const closedTrades = trades.filter((t) => t.status === 'closed')
  const analytics = computeAnalytics(closedTrades)

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-os-muted mb-0.5">Trading</div>
          <h2 className="text-lg font-bold text-os-text">
            {openTrades.length > 0
              ? `${openTrades.length} open position${openTrades.length > 1 ? 's' : ''}`
              : 'No open positions'}
          </h2>
        </div>
        {userRole !== 'viewer' && <ManualTradeModal />}
      </div>

      {/* Analytics metrics grid */}
      <Analytics analytics={analytics} />

      {/* Equity curve */}
      {analytics.cumulativeR.length > 1 && (
        <div className="bg-white border border-os-border rounded-card p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-os-muted mb-3">
            Equity Curve (R)
          </div>
          <EquityChart data={analytics.cumulativeR} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Open positions */}
        <OpenPositions initialTrades={openTrades} />

        {/* Live signal feed */}
        <SignalFeed initialSignals={signals} />
      </div>

      {/* Trade log */}
      <TradeLog trades={closedTrades} />

      {/* Investor view (viewer role summary) */}
      {userRole === 'viewer' && (
        <InvestorView analytics={analytics} totalTrades={closedTrades.length} />
      )}
    </div>
  )
}
