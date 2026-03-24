import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  maxNetworkRetries: 3,
})

export const STRIPE_PLANS = {
  guardian: {
    priceId: process.env.STRIPE_GUARDIAN_PRICE_ID || 'price_guardian',
    name: 'Guardian',
    price: 2999,
    features: ['10 trades/day', 'Basic analytics', 'Email support'],
  },
  sentinel: {
    priceId: process.env.STRIPE_SENTINEL_PRICE_ID || 'price_sentinel',
    name: 'Sentinel',
    price: 9999,
    features: ['Unlimited trades', 'Advanced analytics', 'Priority support', 'AI insights'],
  },
  founder: {
    priceId: process.env.STRIPE_FOUNDER_PRICE_ID || 'price_founder',
    name: 'Founder',
    price: 29999,
    features: ['Everything in Sentinel', 'Custom AI models', 'White-label option', 'Dedicated support'],
  },
}
