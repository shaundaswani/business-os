// ============================================================
// Global TypeScript types for Business OS
// ============================================================

export type Role = 'owner' | 'contributor' | 'viewer'
export type Priority = 'urgent' | 'high' | 'normal' | 'low'
export type TradeStatus = 'open' | 'partial' | 'closed'
export type Direction = 'long' | 'short'
export type SignalType = 'entry' | 'warning' | 'exit'

export type ModuleId =
  | 'overview'
  | 'trading'
  | 'jetset'
  | 'commercial'
  | 'exaim'
  | 'improveme'
  | 'residential'
  | 'personal'

export interface Profile {
  id: string
  full_name: string | null
  role: Role
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Business {
  id: ModuleId
  name: string
  color: string
  icon: string
  description: string | null
  sort_order: number
}

export interface Task {
  id: string
  title: string
  business_id: ModuleId
  assignee_id: string | null
  from_id: string | null
  priority: Priority
  due_date: string | null
  done: boolean
  cognitive_load: number | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface Signal {
  id: string
  asset: string
  direction: Direction
  signal_type: SignalType
  price: number
  timestamp: string
  raw_payload: Record<string, unknown>
  trade_id: string | null
  created_at: string
  updated_at: string
}

export interface Trade {
  id: string
  asset: string
  direction: Direction
  entry_price: number
  entry_time: string
  partial_exit_price: number | null
  partial_exit_time: string | null
  exit_price: number | null
  exit_time: string | null
  pnl_r: number | null
  status: TradeStatus
  notes: string | null
  signal_id: string | null
  created_at: string
  updated_at: string
}

export interface Biometrics {
  id: string
  user_id: string
  date: string
  sleep_hours: number | null
  hrv_ms: number | null
  metabolic_score: number | null
  stress_score: number | null
  recovery_score: number | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  body: string | null
  business_id: ModuleId | null
  read: boolean
  read_at: string | null
  created_at: string
}

// Analytics derived types
export interface TradingAnalytics {
  totalTrades: number
  wins: number
  losses: number
  winRate: number
  profitFactor: number
  expectancy: number
  maxDrawdown: number
  sharpe: number
  sortino: number
  totalR: number
  avgWin: number
  avgLoss: number
  cumulativeR: number[]
}
