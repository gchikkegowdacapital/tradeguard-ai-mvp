# TradeGuard AI - Complete Setup Checklist

Follow this checklist to set up TradeGuard AI from scratch to production.

## Phase 1: Local Development Setup

### Prerequisites
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Git installed and configured
- [ ] Text editor (VS Code recommended)
- [ ] GitHub account created

### 1.1 Clone & Install
- [ ] Run `npm install` in project directory
- [ ] Verify no build errors
- [ ] Check `package.json` has all dependencies

### 1.2 Supabase Setup
- [ ] Create Supabase account at [supabase.com](https://supabase.com)
- [ ] Create new project
- [ ] Wait for project initialization (5-10 min)
- [ ] Go to Settings > API
- [ ] Copy Project URL → save as `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copy Anon Key → save as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Copy Service Role Key → save as `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Go to SQL Editor
- [ ] Create new query
- [ ] Copy entire contents of `supabase-schema.sql`
- [ ] Paste and execute
- [ ] Wait for completion (check for any errors)
- [ ] Verify tables created in Table Editor

### 1.3 Environment Variables
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Fill in Supabase credentials:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Add dummy values for development:
  - `STRIPE_SECRET_KEY=sk_test_...`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`
  - `STRIPE_WEBHOOK_SECRET=whsec_test_...`
  - `ANTHROPIC_API_KEY=sk-ant-...`
  - `RESEND_API_KEY=re_...`
  - `METAAPI_TOKEN=dummy`
  - `NEXT_PUBLIC_APP_URL=http://localhost:3000`

### 1.4 Start Development Server
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Verify landing page loads
- [ ] Check browser console for errors

### 1.5 Test Auth Flow
- [ ] Click "Get Started"
- [ ] Sign up with test email
- [ ] Verify sign up succeeds
- [ ] Check redirected to dashboard
- [ ] Verify user appears in Supabase Auth
- [ ] Test logout (settings page)
- [ ] Test login with created account
- [ ] Verify all pages load without errors

---

## Phase 2: API & Features Testing

### 2.1 Health Check
- [ ] Test `GET /api/health` returns 200
- [ ] Response has status, timestamp, version

### 2.2 Database Access
- [ ] Logged-in user can fetch trades from `/api/trades`
- [ ] Empty response expected (no trades yet)
- [ ] Pagination parameters work

### 2.3 Dashboard Pages
- [ ] Dashboard home loads
- [ ] Shows stats cards (all showing 0 or no data)
- [ ] "No Trading Accounts Connected" message displays
- [ ] Trades page loads
- [ ] Settings page loads
- [ ] All navigation links work

### 2.4 Form Validation
- [ ] Login requires email and password
- [ ] Signup requires name, email, password
- [ ] Password minimum length enforced (8 chars)
- [ ] Error messages display on invalid input
- [ ] Form disables during submission

---

## Phase 3: Stripe Integration

### 3.1 Stripe Account Setup
- [ ] Create Stripe account at [stripe.com](https://stripe.com)
- [ ] Go to Develop > API keys
- [ ] Copy Secret Key → save as `STRIPE_SECRET_KEY`
- [ ] Copy Publishable Key → save as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Enable Test Mode (if not already)

### 3.2 Create Products
- [ ] In Stripe Dashboard, go to Products
- [ ] Create product "Guardian"
  - [ ] Add price: $29.99/month (recurring)
  - [ ] Copy Price ID → save as `STRIPE_GUARDIAN_PRICE_ID`
- [ ] Create product "Sentinel"
  - [ ] Add price: $99.99/month (recurring)
  - [ ] Copy Price ID → save as `STRIPE_SENTINEL_PRICE_ID`
- [ ] Create product "Founder"
  - [ ] Add price: $299.99/month (recurring)
  - [ ] Copy Price ID → save as `STRIPE_FOUNDER_PRICE_ID`

### 3.3 Webhook Setup
- [ ] In Stripe Dashboard, go to Webhooks
- [ ] Add endpoint: `https://your-domain.com/api/webhooks/stripe`
  - (For localhost, use ngrok or similar for testing)
- [ ] Select events to listen for:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- [ ] Copy Signing Secret → save as `STRIPE_WEBHOOK_SECRET`
- [ ] Test webhook delivery

### 3.4 Update Environment
- [ ] Add all Stripe keys to `.env.local`
- [ ] Restart dev server
- [ ] Verify no errors in console

---

## Phase 4: AI & Email Services

### 4.1 Anthropic (Claude API)
- [ ] Go to [console.anthropic.com](https://console.anthropic.com)
- [ ] Create API key
- [ ] Copy → save as `ANTHROPIC_API_KEY`
- [ ] Add to `.env.local`
- [ ] Test API connection (optional, can do later)

### 4.2 Resend (Email)
- [ ] Go to [resend.com](https://resend.com)
- [ ] Create account
- [ ] Create API key
- [ ] Copy → save as `RESEND_API_KEY`
- [ ] Verify domain (follow their process)
- [ ] Add to `.env.local`

### 4.3 MetaAPI (Broker Integration)
- [ ] Go to [metaapi.cloud](https://metaapi.cloud)
- [ ] Create account
- [ ] Generate API token
- [ ] Copy → save as `METAAPI_TOKEN`
- [ ] Add to `.env.local`

---

## Phase 5: Code Quality & Security

### 5.1 TypeScript Check
- [ ] Run `npm run build` (builds TypeScript)
- [ ] No TypeScript errors
- [ ] All type definitions imported correctly

### 5.2 Linting
- [ ] Run `npm run lint`
- [ ] Fix any warnings/errors
- [ ] Code follows style guide

### 5.3 Security Audit
- [ ] Check `.env.local` is in `.gitignore`
- [ ] No secrets in code
- [ ] No API keys logged
- [ ] RLS policies enabled in database
- [ ] Auth middleware protecting dashboard
- [ ] All API routes have auth checks

### 5.4 Database Security
- [ ] Test RLS policies work
  - [ ] Logged-in user cannot see other users' data
  - [ ] Unauthenticated users get permission error
- [ ] Verify row-level security enabled in Supabase

---

## Phase 6: Production Preparation

### 6.1 Code Review
- [ ] All code commented where needed
- [ ] No console.log left in production code
- [ ] Error handling comprehensive
- [ ] Form validation on all inputs
- [ ] Loading states on buttons/forms

### 6.2 Environment Variables
- [ ] All required vars documented
- [ ] Development values different from production
- [ ] Secrets not in repo
- [ ] `.env.local.example` updated

### 6.3 Database Backup
- [ ] In Supabase, enable automatic backups
- [ ] Set retention to 30+ days
- [ ] Test restore process

### 6.4 Performance Testing
- [ ] Dashboard loads in <2 seconds
- [ ] API endpoints respond in <500ms
- [ ] No N+1 database queries
- [ ] Images optimized with next/image

### 6.5 Mobile Testing
- [ ] Test on iPhone (iOS Safari)
- [ ] Test on Android (Chrome)
- [ ] Forms work on mobile
- [ ] Navigation accessible on mobile
- [ ] No horizontal scroll

---

## Phase 7: Deployment to Vercel

### 7.1 Git Repository
- [ ] Initialize git repo (if not already)
- [ ] Add all files: `git add .`
- [ ] Commit: `git commit -m "Initial commit"`
- [ ] Create GitHub repo
- [ ] Push code to GitHub

### 7.2 Vercel Setup
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Sign in with GitHub
- [ ] Import project from GitHub
- [ ] Vercel auto-detects Next.js
- [ ] Add environment variables (all from `.env.local`):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `STRIPE_SECRET_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_GUARDIAN_PRICE_ID`
  - `STRIPE_SENTINEL_PRICE_ID`
  - `STRIPE_FOUNDER_PRICE_ID`
  - `ANTHROPIC_API_KEY`
  - `RESEND_API_KEY`
  - `METAAPI_TOKEN`
  - `NEXT_PUBLIC_APP_URL=https://your-domain.com`

### 7.3 Initial Deployment
- [ ] Click "Deploy"
- [ ] Wait for build to complete (3-5 min)
- [ ] Verify deployment success
- [ ] Test Vercel URL (vercel auto-generates domain)
- [ ] Verify landing page loads
- [ ] Check browser console for errors
- [ ] Test auth flow on production
- [ ] Test database connection from production

### 7.4 Custom Domain (Optional)
- [ ] In Vercel, go to Settings > Domains
- [ ] Add your custom domain
- [ ] Follow DNS instructions from domain registrar
- [ ] Wait for DNS propagation (5-48 hours)
- [ ] Verify SSL certificate auto-generated

---

## Phase 8: Post-Deployment

### 8.1 Update Stripe Webhooks
- [ ] Update Stripe webhook URL to production domain
- [ ] Test webhook delivery from Stripe dashboard

### 8.2 Email Configuration
- [ ] Test email sending from production
- [ ] Verify domain is whitelisted in Resend
- [ ] Check email deliverability

### 8.3 Monitoring Setup
- [ ] Enable Vercel Analytics
- [ ] Set up error tracking (optional: Sentry)
- [ ] Monitor database performance in Supabase

### 8.4 Backup & Recovery
- [ ] Test database backup/restore
- [ ] Document recovery procedure
- [ ] Set backup schedule

### 8.5 Documentation
- [ ] Update README with production URL
- [ ] Document deployment process
- [ ] Create runbook for common issues
- [ ] Document API endpoints for team

---

## Phase 9: Team & Launch

### 9.1 Team Training
- [ ] Train team on codebase
- [ ] Show how to run locally
- [ ] Explain architecture
- [ ] Document common workflows

### 9.2 Testing in Production
- [ ] QA team tests all features
- [ ] Load testing if applicable
- [ ] User acceptance testing
- [ ] Document any issues found

### 9.3 Monitoring & Alerts
- [ ] Set up uptime monitoring
- [ ] Configure error alerts
- [ ] Monitor database performance
- [ ] Set up cost monitoring

### 9.4 Launch
- [ ] Final security audit
- [ ] Legal review (ToS, Privacy)
- [ ] Marketing/communication ready
- [ ] Support team trained
- [ ] Go live! 🚀

---

## Troubleshooting Guide

### Build Fails
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Error
- Verify Supabase URL in `.env.local`
- Check Supabase project is running
- Test connection from Supabase Studio

### Auth Not Working
- Clear browser cookies
- Check Supabase Auth settings
- Verify email config in Supabase

### Stripe Webhook Fails
- Verify signing secret matches
- Check webhook endpoint is accessible
- Test with Stripe CLI in development

### Pages Not Loading
- Check for TypeScript errors: `npm run build`
- Check server logs in Vercel
- Clear `.next` cache

### Database Queries Slow
- Check indexes are created (supabase-schema.sql)
- Monitor with Supabase Performance Insights
- Add missing indexes if needed

---

## Quick Reference

### Common Commands
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run linter
npm test                 # Run tests (if configured)
```

### Important URLs
- Landing: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard
- Pricing: http://localhost:3000/pricing
- Supabase Studio: dashboard.supabase.com
- Stripe Dashboard: dashboard.stripe.com
- Vercel Dashboard: vercel.com/dashboard

### Key Files
- Environment: `.env.local`
- Database Schema: `supabase-schema.sql`
- Main App: `src/app/layout.tsx`
- Styles: `src/app/globals.css`
- Types: `src/types/index.ts`

---

## Support Contacts

- **Next.js Issues**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Help**: [supabase.com/docs](https://supabase.com/docs)
- **Stripe Support**: [stripe.com/docs](https://stripe.com/docs)
- **Vercel Help**: [vercel.com/docs](https://vercel.com/docs)

---

**Status**: Ready for setup! Start with Phase 1 and work through each phase sequentially.

Good luck! 🚀
