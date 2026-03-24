# Quick Start Guide

Get TradeGuard AI running locally in 5 minutes.

## Prerequisites

- Node.js 18+ ([download](https://nodejs.org/))
- Git ([download](https://git-scm.com/))
- A text editor (VS Code recommended)

## 1. Clone and Install

```bash
cd tradeguard-ai-mvp
npm install
```

## 2. Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Create a new project (or use existing)
3. Go to Settings > API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon Key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service Role Key → `SUPABASE_SERVICE_ROLE_KEY`

## 3. Set Up Database

1. In Supabase, go to SQL Editor
2. Create new query
3. Copy the entire contents of `supabase-schema.sql`
4. Paste into editor and execute
5. Wait for completion

## 4. Configure Environment

Create `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# For development, these can be dummy values:
STRIPE_SECRET_KEY=sk_test_dummy
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_dummy
STRIPE_WEBHOOK_SECRET=whsec_test_dummy
STRIPE_GUARDIAN_PRICE_ID=price_dummy_1
STRIPE_SENTINEL_PRICE_ID=price_dummy_2
STRIPE_FOUNDER_PRICE_ID=price_dummy_3

ANTHROPIC_API_KEY=sk-ant-dummy
RESEND_API_KEY=re_dummy
METAAPI_TOKEN=dummy_token

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 6. Create Test Account

1. Click "Get Started" or go to `/auth/signup`
2. Sign up with any email and password
3. You'll be redirected to the dashboard

## 7. Explore the App

### Landing Page
- Shows features and pricing tiers
- Responsive design showcase

### Dashboard
- Home: Overview of account and recent trades
- Trades: Trade history and analytics
- Settings: Manage brokers and notifications

### Key Pages
- `/` - Landing page
- `/pricing` - Pricing plans
- `/auth/login` - Login
- `/auth/signup` - Sign up
- `/dashboard` - Main dashboard (requires login)
- `/dashboard/trades` - Trade analytics
- `/dashboard/settings` - User settings

## API Endpoints

### Trades
```bash
# Get trades
curl http://localhost:3000/api/trades \
  -H "Authorization: Bearer your-token"

# Create trade
curl -X POST http://localhost:3000/api/trades \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "symbol": "EURUSD",
    "direction": "long",
    "entry_price": 1.0950,
    "volume": 1.0,
    "setup_quality": "good",
    "plan_compliance": "full",
    "emotional_state": "calm",
    "account_id": "uuid"
  }'
```

### Health Check
```bash
curl http://localhost:3000/api/health
```

## Database Schema Overview

### Core Tables
- **users** - User accounts and subscription info
- **trading_plans** - User trading rules and limits
- **broker_connections** - Connected trading brokers
- **accounts** - Trading accounts
- **trades** - Individual trades
- **daily_snapshots** - Daily trading statistics
- **alerts** - User notifications

## Development Tips

### Code Structure
- Pages in `src/app/` (App Router)
- API routes in `src/app/api/`
- Types in `src/types/`
- Utilities in `src/lib/`

### Styling
- Tailwind CSS for styling
- Custom colors in `tailwind.config.ts`
- Utility classes defined in `src/app/globals.css`

### Database Queries
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data, error } = await supabase
  .from('trades')
  .select('*')
  .eq('user_id', user.id)
```

### Client-Side Queries
```typescript
import { createClient } from '@/lib/supabase/client'

'use client'

const supabase = createClient()
const { data, error } = await supabase
  .from('trades')
  .select('*')
```

## Testing Features Locally

### Test Authentication
1. Sign up with test email
2. Check Supabase Auth logs for email confirmation
3. Test login/logout flow

### Test Trades
1. Go to dashboard (redirects to `/dashboard`)
2. You'll see "No Trading Accounts Connected"
3. (To add trades, would need broker integration)

### Test API
```bash
# Health check
curl http://localhost:3000/api/health

# Get trades (requires auth token from Supabase)
curl http://localhost:3000/api/trades
```

## Next Steps

### Before Production

1. **Set up Stripe**
   - Create Stripe account
   - Add products and pricing
   - Update price IDs

2. **Set up Anthropic**
   - Get API key
   - Test Claude integration

3. **Set up Resend**
   - Create account
   - Verify domain
   - Get API key

4. **Set up MetaAPI**
   - Create account
   - Get token
   - Configure brokers

5. **Add Real UI Components**
   - Complete forms for trades
   - Add charts with Recharts
   - Implement broker connections

6. **Deploy to Vercel**
   - Follow DEPLOYMENT.md
   - Configure all environment variables
   - Test Stripe webhooks

## Troubleshooting

### Port 3000 Already in Use
```bash
# Use different port
npm run dev -- -p 3001
```

### Database Connection Error
- Check `.env.local` has correct Supabase URL and keys
- Verify Supabase project is running
- Check network connectivity

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### TypeScript Errors
- Ensure all `@/*` path imports use correct paths
- Check types in `src/types/index.ts`
- Run `npm run lint` for full check

## Resources

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [React Hook Form](https://react-hook-form.com)
- [Stripe Docs](https://stripe.com/docs)
- [Anthropic Docs](https://docs.anthropic.com)

## Getting Help

1. Check error messages in browser console
2. Check server logs in terminal
3. Look at Supabase logs for database errors
4. Review code comments for implementation notes

Happy coding! 🚀
