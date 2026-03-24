# TradeGuard AI MVP - Quick Start Guide

## Installation

1. Install dependencies (if not already installed):
```bash
npm install zod recharts lucide-react
```

2. Ensure environment variables are set in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL= http://127.0.0.1:54323
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) in your browser

## Database Setup

Run these migrations in Supabase to create required tables:

### Trading Plans Table
```sql
create table trading_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id),
  title text not null,
  description text,
  max_risk_per_trade numeric not null,
  max_daily_loss numeric not null,
  max_daily_loss_dollars numeric,
  max_total_drawdown numeric not null,
  max_trades_per_day integer not null,
  max_concurrent_positions integer not null,
  min_risk_reward_ratio text not null,
  trading_hours_start text not null,
  trading_hours_end text not null,
  max_position_size_lots numeric not null,
  allowed_instruments text[] not null,
  cooldown_after_loss_minutes integer not null,
  max_consecutive_losses_before_pause integer not null,
  stop_loss_required boolean default true,
  prop_firm_mode boolean default false,
  prop_firm_template text,
  prop_firm_daily_drawdown numeric,
  prop_firm_max_drawdown numeric,
  prop_firm_profit_target numeric,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index on trading_plans(user_id);
```

### Broker Connections Table
```sql
create table broker_connections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id),
  broker_type text not null,
  account_number text not null,
  is_connected boolean default false,
  is_demo boolean default false,
  api_key text not null,
  api_secret text,
  last_sync timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index on broker_connections(user_id);
```

## Features Overview

### Dashboard Home (/dashboard)
- Account health metrics (Balance, Equity, P&L, Margin)
- Risk score circular gauge
- Open positions table
- Recent alerts feed
- Equity curve chart
- Quick stats indicators

### Trading Plan Builder (/dashboard/plan)
- Build your trading rules with 14 parameters
- Real-time validation
- Prop firm mode for funded trading
- Save to database

### Broker Management (/dashboard/brokers)
- Connect MetaTrader 4/5 accounts
- Test connections before saving
- Manage multiple broker connections
- View connection status

## API Endpoints

### Trading Plans
- `GET /api/plans` - Get active plan
- `POST /api/plans` - Save new plan

### Brokers
- `GET /api/brokers` - List connections
- `POST /api/brokers` - Add connection
- `DELETE /api/brokers?id={id}` - Remove connection
- `POST /api/brokers/test` - Test connection

### Account Data
- `GET /api/accounts` - Get account metrics
- `GET /api/positions` - Get open positions
- `GET /api/alerts` - Get recent alerts
- `POST /api/alerts` - Create alert

## Component Structure

```
Dashboard Layout
├── Sidebar Navigation
│   ├── Nav Items (Dashboard, Calculator, Journal, Copilot, Settings)
│   ├── Upgrade Section (free tier)
│   └── User Info & Logout
├── Top Bar
│   ├── Mobile Hamburger
│   ├── Notification Bell
│   └── Account Dropdown
└── Main Content
    └── Page-specific content
```

## Form Validation

All forms use Zod validation:
- Real-time field validation
- Error messages display inline
- Toast notifications on success/error
- Submit button disabled during loading

## Styling Guide

### Dark Theme Colors
- Background: `#0f172a` / `bg-slate-950`
- Sidebar: `#0f172a` / `bg-slate-950`
- Cards: `#0f172a` / `bg-slate-900`
- Borders: `#334155` / `border-slate-800`
- Text: `#e2e8f0` / `text-white`

### Component Colors
- Success: `#22c55e` (green-500)
- Danger: `#ef4444` (red-500)
- Warning: `#eab308` (yellow-500)
- Info: `#3b82f6` (blue-500)
- Orange: `#f97316` (orange-500)

## Responsive Breakpoints

- Mobile: < 768px (hamburger menu, full-width)
- Tablet: 768px - 1024px (2-column layouts)
- Desktop: > 1024px (3-4 column layouts)

## Common Tasks

### Add a New Field to Trading Plan
1. Add to Zod schema in `src/lib/schemas/tradingPlan.ts`
2. Add to form in `src/app/dashboard/plan/page.tsx`
3. Add to database migration
4. Handle in API route `/api/plans`

### Add New Alert Level
1. Update `AlertLevel` enum in `src/types/index.ts`
2. Add color config in `src/components/dashboard/AlertItem.tsx`
3. Update API validation in `/api/alerts`

### Customize Risk Gauge Colors
Edit `src/components/dashboard/RiskGauge.tsx`:
```typescript
if (score >= 80) {
  color = '#22c55e' // green
} else if (score >= 60) {
  color = '#eab308' // yellow
} // ... etc
```

## Troubleshooting

### Pages Not Loading
- Check Supabase connection (env vars)
- Clear Next.js cache: `rm -rf .next`
- Restart dev server: `npm run dev`

### Form Not Validating
- Check Zod schema matches form fields
- Verify field names in state match schema
- Check browser console for errors

### API Errors
- Verify user is authenticated (check Supabase auth)
- Check database tables exist
- Review API route error handling
- Check request/response format

### Styling Issues
- Ensure TailwindCSS is configured correctly
- Check for conflicting CSS classes
- Verify dark mode is enabled: `dark` class or config

## Next Steps

1. Create missing pages (Calculator, Journal, Settings, Copilot)
2. Integrate MetaApi SDK for real broker connections
3. Add WebSocket for real-time position updates
4. Implement equity curve data aggregation
5. Add trading journal/trade logger
6. Create risk analytics dashboard
7. Add email/push notifications
8. Implement backup/export functionality

## Support & Documentation

- **Dashboard Implementation**: See `DASHBOARD_IMPLEMENTATION.md`
- **API Reference**: See `API_REFERENCE.md`
- **Project Status**: See `COMPLETION_SUMMARY.txt`
- **File List**: See `FILES_MANIFEST.txt`

## Performance Tips

1. Use React.memo for expensive components
2. Lazy load components with dynamic imports
3. Optimize images with next/image
4. Use SWR or React Query for data fetching
5. Implement pagination for large lists
6. Cache API responses appropriately

## Security Considerations

1. Never commit API tokens or secrets
2. Encrypt broker API tokens before storage
3. Validate all user input on backend
4. Use HTTPS in production
5. Implement rate limiting on APIs
6. Add CORS headers as needed
7. Sanitize database queries

## Deployment

```bash
# Build for production
npm run build

# Test production build locally
npm run start

# Deploy to Vercel
vercel deploy

# Deploy to other platforms
# Follow platform-specific instructions
```

---

Ready to start building! Visit http://localhost:3000/dashboard to see your new dashboard.
