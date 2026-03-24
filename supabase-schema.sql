-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  tier VARCHAR(50) DEFAULT 'free' CHECK (tier IN ('free', 'guardian', 'sentinel', 'founder')),
  avatar_url TEXT,
  stripe_customer_id TEXT,
  subscription_status VARCHAR(50) CHECK (subscription_status IN ('active', 'canceled', 'past_due')),
  trading_plan_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create trading_plans table
CREATE TABLE IF NOT EXISTS trading_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  daily_risk_percent DECIMAL(5,2),
  daily_loss_limit DECIMAL(12,2),
  max_trades_per_day INTEGER,
  trading_hours_start TIME,
  trading_hours_end TIME,
  preferred_pairs TEXT[],
  setup_rules TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create broker_connections table
CREATE TABLE IF NOT EXISTS broker_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users ON DELETE CASCADE,
  broker_type VARCHAR(50) NOT NULL CHECK (broker_type IN ('metatrader4', 'metatrader5', 'interactive_brokers', 'oanda')),
  account_number TEXT NOT NULL,
  is_demo BOOLEAN DEFAULT FALSE,
  is_connected BOOLEAN DEFAULT FALSE,
  api_key TEXT NOT NULL,
  api_secret TEXT NOT NULL,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, account_number)
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users ON DELETE CASCADE,
  broker_connection_id UUID REFERENCES broker_connections ON DELETE CASCADE,
  balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  equity DECIMAL(15,2) NOT NULL DEFAULT 0,
  margin_used DECIMAL(15,2) DEFAULT 0,
  margin_free DECIMAL(15,2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users ON DELETE CASCADE,
  account_id UUID REFERENCES accounts ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('long', 'short')),
  entry_price DECIMAL(15,8) NOT NULL,
  exit_price DECIMAL(15,8),
  volume DECIMAL(15,2) NOT NULL,
  pnl DECIMAL(15,2),
  pnl_percent DECIMAL(8,4),
  risk_reward_ratio DECIMAL(8,4),
  setup_quality VARCHAR(50) CHECK (setup_quality IN ('poor', 'fair', 'good', 'excellent')),
  plan_compliance VARCHAR(50) CHECK (plan_compliance IN ('full', 'partial', 'none')),
  emotional_state VARCHAR(50) CHECK (emotional_state IN ('calm', 'neutral', 'anxious', 'frustrated', 'overconfident')),
  entry_time TIMESTAMP WITH TIME ZONE NOT NULL,
  exit_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users ON DELETE CASCADE,
  level VARCHAR(50) NOT NULL CHECK (level IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  message TEXT,
  action_required BOOLEAN DEFAULT FALSE,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create trade_tags table
CREATE TABLE IF NOT EXISTS trade_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, name)
);

-- Create revenge_scores table
CREATE TABLE IF NOT EXISTS revenge_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users ON DELETE CASCADE,
  date DATE NOT NULL,
  score DECIMAL(5,2),
  trades_count INTEGER,
  winning_trades INTEGER,
  losing_trades INTEGER,
  average_win DECIMAL(15,2),
  average_loss DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, date)
);

-- Create daily_snapshots table
CREATE TABLE IF NOT EXISTS daily_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users ON DELETE CASCADE,
  account_id UUID REFERENCES accounts ON DELETE CASCADE,
  date DATE NOT NULL,
  opening_balance DECIMAL(15,2),
  closing_balance DECIMAL(15,2),
  daily_pnl DECIMAL(15,2),
  daily_pnl_percent DECIMAL(8,4),
  trades_count INTEGER,
  winning_trades INTEGER,
  losing_trades INTEGER,
  win_rate DECIMAL(8,4),
  largest_win DECIMAL(15,2),
  largest_loss DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, account_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_account_id ON trades(account_id);
CREATE INDEX IF NOT EXISTS idx_trades_entry_time ON trades(entry_time);
CREATE INDEX IF NOT EXISTS idx_trades_user_entry_time ON trades(user_id, entry_time DESC);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_broker_id ON accounts(broker_connection_id);

CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);

CREATE INDEX IF NOT EXISTS idx_daily_snapshots_user_id ON daily_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_snapshots_date ON daily_snapshots(date);
CREATE INDEX IF NOT EXISTS idx_daily_snapshots_user_date ON daily_snapshots(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_broker_connections_user_id ON broker_connections(user_id);

CREATE INDEX IF NOT EXISTS idx_trading_plans_user_id ON trading_plans(user_id);

-- Create RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenge_scores ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Trades policies
CREATE POLICY "Users can view their own trades" ON trades
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create trades" ON trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades" ON trades
  FOR UPDATE USING (auth.uid() = user_id);

-- Accounts policies
CREATE POLICY "Users can view their own accounts" ON accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create accounts" ON accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts" ON accounts
  FOR UPDATE USING (auth.uid() = user_id);

-- Broker connections policies
CREATE POLICY "Users can view their broker connections" ON broker_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create broker connections" ON broker_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their broker connections" ON broker_connections
  FOR UPDATE USING (auth.uid() = user_id);

-- Alerts policies
CREATE POLICY "Users can view their own alerts" ON alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create alerts" ON alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" ON alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- Trading plans policies
CREATE POLICY "Users can view their trading plans" ON trading_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create trading plans" ON trading_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their trading plans" ON trading_plans
  FOR UPDATE USING (auth.uid() = user_id);

-- Daily snapshots policies
CREATE POLICY "Users can view their daily snapshots" ON daily_snapshots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create daily snapshots" ON daily_snapshots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trade tags policies
CREATE POLICY "Users can view their trade tags" ON trade_tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create trade tags" ON trade_tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Revenge scores policies
CREATE POLICY "Users can view their revenge scores" ON revenge_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create revenge scores" ON revenge_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);
