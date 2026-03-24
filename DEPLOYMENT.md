# Deployment Guide

This document covers deploying TradeGuard AI to production.

## Prerequisites

- Node.js 18+ installed
- Git configured
- Accounts created for: Supabase, Stripe, Anthropic, Resend, Vercel

## Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database schema imported to Supabase
- [ ] Stripe webhooks configured
- [ ] Email domain verified in Resend
- [ ] MetaAPI token obtained
- [ ] CORS origins configured

## Step 1: Set Up Supabase

1. Create new Supabase project
2. Go to SQL Editor
3. Copy entire contents of `supabase-schema.sql`
4. Execute in SQL editor
5. Note your project URL and API keys:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Step 2: Configure Stripe

1. Log in to Stripe Dashboard
2. Create 3 products:
   - **Guardian** ($29.99/month)
   - **Sentinel** ($99.99/month)
   - **Founder** ($299.99/month)
3. Note the price IDs:
   - `STRIPE_GUARDIAN_PRICE_ID`
   - `STRIPE_SENTINEL_PRICE_ID`
   - `STRIPE_FOUNDER_PRICE_ID`
4. Get API keys:
   - `STRIPE_SECRET_KEY` (from API keys)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
5. Set up webhook:
   - Go to Webhooks section
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Subscribe to: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Note the signing secret as `STRIPE_WEBHOOK_SECRET`

## Step 3: Configure Anthropic

1. Go to Anthropic Console
2. Create API key
3. Note as `ANTHROPIC_API_KEY`

## Step 4: Configure Resend

1. Go to Resend Dashboard
2. Create API key
3. Verify your domain (follow their process)
4. Note API key as `RESEND_API_KEY`

## Step 5: Get MetaAPI Token

1. Sign up at MetaAPI
2. Create account
3. Note token as `METAAPI_TOKEN`

## Step 6: Deploy to Vercel

### Option A: Using GitHub

1. Push code to GitHub
2. Go to Vercel dashboard
3. Import project from GitHub
4. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   STRIPE_SECRET_KEY
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   STRIPE_WEBHOOK_SECRET
   STRIPE_GUARDIAN_PRICE_ID
   STRIPE_SENTINEL_PRICE_ID
   STRIPE_FOUNDER_PRICE_ID
   ANTHROPIC_API_KEY
   RESEND_API_KEY
   METAAPI_TOKEN
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```
5. Deploy

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Log in
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... add remaining env vars
```

## Step 7: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to project Settings
2. Domains section
3. Add your custom domain
4. Follow DNS configuration instructions from your DNS provider
5. Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables

## Step 8: Set Up Monitoring

### Vercel Analytics
- Enabled by default in Vercel
- View in Vercel Dashboard > Analytics

### Error Tracking
- Install Sentry for error tracking (optional)
- Configure in Vercel environment

### Database Monitoring
- Enable query performance insights in Supabase
- Monitor in Supabase Dashboard > Reports

## Post-Deployment

### Database Backups
1. In Supabase Dashboard, go to Backups
2. Enable automatic daily backups
3. Set retention to 30 days minimum

### Monitoring
1. Set up uptime monitoring with external service
2. Configure alerts for errors
3. Monitor API response times

### Security
1. Review CORS settings in Supabase
2. Check RLS policies are enabled
3. Rotate API keys periodically
4. Enable 2FA for all service accounts

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
vercel rebuild --prod
```

### Environment Variables Not Loaded
- Check Vercel dashboard environment variables match exactly
- Ensure variables starting with `NEXT_PUBLIC_` are prefixed correctly
- Redeploy after adding variables

### Database Connection Issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` and keys are correct
- Check RLS policies aren't blocking legitimate queries
- Test with Supabase Studio query editor

### Stripe Webhooks Not Working
- Verify webhook URL is accessible
- Check webhook signing secret is correct
- Enable test mode for testing

### Email Not Sending
- Verify Resend API key is correct
- Check email domain is verified in Resend
- Verify email template exists in Resend

## Rollback

If deployment has issues:

```bash
# Rollback to previous deployment
vercel rollback --prod
```

Or manually redeploy previous commit:

```bash
git checkout <previous-commit>
vercel deploy --prod
```

## Scaling Considerations

- **Database**: Supabase handles auto-scaling
- **API**: Vercel serverless functions auto-scale
- **CDN**: Vercel Edge Network handles globally
- **Real-time**: Consider Redis for caching frequent queries

## Security Checklist

- [ ] All environment variables are secret (not public)
- [ ] API keys rotated before going live
- [ ] HTTPS enabled on domain
- [ ] Database backups configured
- [ ] Error logs don't expose sensitive data
- [ ] RLS policies configured correctly
- [ ] CORS origins restricted
- [ ] CSP headers configured
- [ ] Rate limiting in place
- [ ] SQL injection prevention verified

## Performance Optimization

- Enable image optimization in next.config.js
- Use Vercel Analytics to monitor performance
- Enable CDN caching for static assets
- Consider database query optimization
- Monitor API response times

## Support

For issues:
1. Check Vercel logs: `vercel logs --prod`
2. Check Supabase logs in dashboard
3. Review error tracking service
4. Contact support for your services
