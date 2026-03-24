export enum AlertLevel {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export enum BrokerType {
  METATRADER4 = 'metatrader4',
  METATRADER5 = 'metatrader5',
  INTERACTIVE_BROKERS = 'interactive_brokers',
  OANDA = 'oanda',
}

export enum EmotionalState {
  CALM = 'calm',
  NEUTRAL = 'neutral',
  ANXIOUS = 'anxious',
  FRUSTRATED = 'frustrated',
  OVERCONFIDENT = 'overconfident',
}

export enum SetupQuality {
  POOR = 'poor',
  FAIR = 'fair',
  GOOD = 'good',
  EXCELLENT = 'excellent',
}

export enum PlanCompliance {
  FULL = 'full',
  PARTIAL = 'partial',
  NONE = 'none',
}

export enum UserTier {
  GUARDIAN = 'guardian',
  SENTINEL = 'sentinel',
  FOUNDER = 'founder',
  FREE = 'free',
}

export enum PositionDirection {
  LONG = 'long',
  SHORT = 'short',
}

export interface User {
  id: string
  email: string
  full_name: string
  tier: UserTier
  avatar_url?: string
  created_at: string
  updated_at: string
  trading_plan_id?: string
  stripe_customer_id?: string
  subscription_status?: 'active' | 'canceled' | 'past_due'
}

export interface TradingPlan {
  id: string
  user_id: string
  title: string
  description: string
  daily_risk_percent: number
  daily_loss_limit: number
  max_trades_per_day: number
  trading_hours_start: string
  trading_hours_end: string
  preferred_pairs: string[]
  setup_rules: string
  created_at: string
  updated_at: string
}

export interface BrokerConnection {
  id: string
  user_id: string
  broker_type: BrokerType
  account_number: string
  is_demo: boolean
  is_connected: boolean
  api_key: string
  api_secret: string
  last_sync: string
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  user_id: string
  broker_connection_id: string
  balance: number
  equity: number
  margin_used: number
  margin_free: number
  last_updated: string
  created_at: string
}

export interface Position {
  id: string
  user_id: string
  account_id: string
  symbol: string
  direction: PositionDirection
  entry_price: number
  current_price: number
  volume: number
  pnl: number
  pnl_percent: number
  risk_reward_ratio: number
  opened_at: string
  created_at: string
}

export interface Trade {
  id: string
  user_id: string
  account_id: string
  symbol: string
  direction: PositionDirection
  entry_price: number
  exit_price?: number
  volume: number
  pnl: number
  pnl_percent: number
  risk_reward_ratio: number
  setup_quality: SetupQuality
  plan_compliance: PlanCompliance
  emotional_state: EmotionalState
  entry_time: string
  exit_time?: string
  notes?: string
  created_at: string
}

export interface Alert {
  id: string
  user_id: string
  level: AlertLevel
  title: string
  message: string
  action_required: boolean
  resolved: boolean
  created_at: string
  resolved_at?: string
}

export interface TradeTag {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface RevengeScore {
  id: string
  user_id: string
  date: string
  score: number
  trades_count: number
  winning_trades: number
  losing_trades: number
  average_win: number
  average_loss: number
  created_at: string
}

export interface DailySnapshot {
  id: string
  user_id: string
  account_id: string
  date: string
  opening_balance: number
  closing_balance: number
  daily_pnl: number
  daily_pnl_percent: number
  trades_count: number
  winning_trades: number
  losing_trades: number
  win_rate: number
  largest_win: number
  largest_loss: number
  created_at: string
}

export interface CreateTradeInput {
  symbol: string
  direction: PositionDirection
  entry_price: number
  exit_price?: number
  volume: number
  setup_quality: SetupQuality
  plan_compliance: PlanCompliance
  emotional_state: EmotionalState
  notes?: string
}

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface StripeWebhookPayload {
  type: string
  data: {
    object: {
      id: string
      customer: string
      status?: string
      items?: {
        data: Array<{
          price: {
            id: string
          }
        }>
      }
    }
  }
}
