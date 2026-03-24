# TradeGuard AI - MVP

Production-ready Next.js 14 monolith for TradeGuard AI. An AI-powered trading platform that helps traders master emotional trading through compliance checking, revenge score tracking, and intelligent execution delays.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI Components**: Radix UI, Tailwind CSS, Lucide Icons
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **AI**: Anthropic Claude API
- **Email**: Resend
- **Charting**: Recharts
- **Forms**: React Hook Form + Zod

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── trades/               # Trade management endpoints
│   │   ├── accounts/             # Account management endpoints
│   │   └── webhooks/             # Webhook handlers (Stripe, etc)
│   ├── auth/                     # Authentication pages (login, signup)
│   ├── dashboard/                # Protected dashboard
│   │   ├── page.tsx              # Dashboard home
│   │   ├── trades/               # Trade analytics
│   │   └── settings/             # User settings
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── providers.tsx             # Client providers
├── lib/
│   ├── stripe.ts                 # Stripe configuration
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── middleware.ts         # Auth middleware
│   │   └── server.ts             # Server Supabase client
│   └── utils.ts                  # Utility functions
├── middleware.ts                 # Next.js middleware
└── types/
    └── index.ts                  # TypeScript types
```

## Setup

### 1. Clone and install dependencies

```bash
cd tradeguard-ai-mvp
npm install
```

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `ANTHROPIC_API_KEY` - Claude API key
- `RESEND_API_KEY` - Resend email API key
- `METAAPI_TOKEN` - MetaAPI token for broker integration
- `NEXT_PUBLIC_APP_URL` - Your app's public URL

### 3. Database setup

Create the following tables in your Supabase database:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  tier VARCHAR(50) DEFAULT 'free',
  avatar_url TEXT,
  stripe_customer_id TEXT,
  subscription_status VARCHAR(50),
  trading_plan_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trading Plans
CREATE TABLE trading_plans (
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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Broker Connections
CREATE TABLE broker_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users ON DELETE CASCADE,
  broker_type VARCHAR(50) NOT NULL,
  account_number TEXT NOT NULL,
  is_demo BOOLEAN DEFAULT FALSE,
  is_connected BOOLEAN DEFAULT FALSE,
  api_key TEXT,
  api_secret TEXT,
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Accounts
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users ON DELETE CASCADE,
  broker_connection_id UUID REFERENCES broker_connections ON DELETE CASCADE,
  balance DECIMAL(15,2),
  equity DECIMAL(15,2),
  margin_used DECIMAL(15,2),
  margin_free DECIMAL(15,2),
  last_updated TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Trades
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users ON DELETE CASCADE,
  account_id UUID REFERENCES accounts ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  direction VARCHAR(10) NOT NULL,
  entry_price DECIMAL(15,8) NOT NULL,
  exit_price DECIMAL(15,8),
  volume DECIMAL(15,2) NOT NULL,
  pnl DECIMAL(15,2),
  pnl_percent DECIMAL(8,4),
  risk_reward_ratio DECIMAL(8,4),
  setup_quality VARCHAR(50),
  plan_compliance VARCHAR(50),
  emotional_state VARCHAR(50),
  entry_time TIMESTAMP NOT NULL,
  exit_time TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Alerts
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users ON DELETE CASCADE,
  level VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  action_required BOOLEAN DEFAULT FALSE,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Daily Snapshots
CREATE TABLE daily_snapshots (
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
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Features

### Core Features

- **Emotional Trading Analysis** - AI detects emotional states and prevents revenge trading
- **Plan Compliance Checking** - Real-time alerts when deviating from trading plan
- **Revenge Score Tracking** - Monitor revenge trading patterns with actionable metrics
- **Smart Execution Delays** - Configurable delays between signal and execution
- **Multi-Broker Support** - Connect MetaTrader, Interactive Brokers, OANDA, etc.
- **Enterprise Security** - Bank-level encryption and secure data handling

### Dashboard Features

- Real-time account monitoring
- Trade history and analytics
- Win/loss statistics
- Daily P&L tracking
- Broker connection management
- Subscription tier management

## API Endpoints

### Trades
- `GET /api/trades` - List user trades
- `POST /api/trades` - Create new trade

### Accounts
- `GET /api/accounts` - List user accounts
- `POST /api/accounts` - Add new account

### Authentication
- `POST /api/auth/logout` - Sign out user

### Webhooks
- `POST /api/webhooks/stripe` - Stripe webhook handler

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

```bash
vercel deploy --prod
```

### Deploy to other platforms

This app can be deployed to any platform that supports Node.js 18+ and serverless functions:
- AWS Lambda with Amplify
- Google Cloud Run
- Azure App Service
- Railway
- Render
- Heroku

## Development

### Build
```bash
npm run build
```

### Start production server
```bash
npm start
```

### Lint
```bash
npm run lint
```

## Security

- All API routes require authentication
- Database queries use parameterized statements
- Sensitive data encrypted in transit (HTTPS)
- No hardcoded secrets in code
- Webhook signature verification for Stripe
- CORS properly configured

## Performance

- Static site generation for landing page
- Incremental Static Regeneration (ISR) for dynamic content
- Image optimization with next/image
- Database query optimization with proper indexes
- Code splitting for faster page loads

## Contributing

Development follows conventional commits and feature branches.

## License

Proprietary - TradeGuard AI
