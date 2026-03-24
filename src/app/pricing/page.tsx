'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  const prices = {
    monthly: { free: 0, guardian: 19, sentinel: 49, founder: 299 },
    annual: { free: 0, guardian: 228, sentinel: 588, founder: 3588 },
  }

  const plans = [
    {
      name: 'Free',
      price: prices[billingCycle].free,
      period: billingCycle,
      description: 'Get started with the basics',
      features: [
        'Position size calculator',
        'Trading journal',
        'Basic analytics',
        '1 broker connection',
        'Community support',
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Guardian',
      price: prices[billingCycle].guardian,
      period: billingCycle,
      description: 'For active traders',
      features: [
        'Everything in Free',
        '50 trades/month limit',
        'Real-time alerts',
        'AI-powered insights',
        'Email support',
        'Daily snapshots',
      ],
      cta: 'Start Free Trial',
      highlighted: true,
    },
    {
      name: 'Sentinel',
      price: prices[billingCycle].sentinel,
      period: billingCycle,
      description: 'For serious traders',
      features: [
        'Everything in Guardian',
        'Unlimited trades',
        'Advanced analytics',
        'Priority support',
        '5 broker connections',
        'API access',
        'Custom trading plans',
        'Revenge score tracking',
      ],
      cta: 'Start Free Trial',
      highlighted: false,
    },
  ]

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="py-20 border-b border-slate-800">
        <div className="container">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
              Choose the plan that fits your trading style. All plans include bank-level security.
            </p>

            <div className="flex justify-center gap-4 mb-12">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  billingCycle === 'annual'
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Annual <span className="ml-2 text-xs bg-success-600 px-2 py-1 rounded">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-lg border p-8 transition-all ${
                  plan.highlighted
                    ? 'border-primary-500/50 bg-gradient-to-br from-primary-900/30 to-slate-900/50 ring-2 ring-primary-500/20 md:scale-105'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                {plan.highlighted && (
                  <Badge variant="primary" className="mb-4">
                    Most Popular
                  </Badge>
                )}
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="mt-2 text-sm text-slate-400">{plan.description}</p>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-slate-400">
                      /{plan.period === 'monthly' ? 'month' : 'year'}
                    </span>
                  )}
                </div>

                <Link href={`/auth/signup?plan=${plan.name.toLowerCase()}`} className="block mt-8">
                  <Button className={`w-full ${plan.highlighted ? '' : 'variant-outline'}`}>
                    {plan.cta}
                  </Button>
                </Link>

                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-slate-300">
                      <Check className="h-5 w-5 text-success-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="p-8 bg-gradient-to-r from-primary-600/20 to-primary-500/20 rounded-lg border border-primary-500/30 text-center">
            <h3 className="text-2xl font-bold mb-4">Founder Pass (Limited Time)</h3>
            <p className="text-slate-300 mb-6">
              Lifetime access to Sentinel for a one-time payment. Limited to 100 founders.
            </p>
            <Link href="/auth/signup?plan=founder">
              <Button size="lg">Get Founder Pass - $299</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 border-b border-slate-800">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Feature Comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-4 px-4 font-semibold">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold">Free</th>
                  <th className="text-center py-4 px-4 font-semibold">Guardian</th>
                  <th className="text-center py-4 px-4 font-semibold">Sentinel</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Position Calculator', true, true, true],
                  ['Trading Journal', true, true, true],
                  ['Basic Analytics', true, true, true],
                  ['Real-time Alerts', false, true, true],
                  ['AI Insights', false, true, true],
                  ['Revenge Detection', false, true, true],
                  ['Advanced Analytics', false, false, true],
                  ['Priority Support', false, false, true],
                  ['API Access', false, false, true],
                  ['Broker Connections', '1', '1', '5+'],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-slate-700 hover:bg-slate-800/30">
                    <td className="py-4 px-4 text-slate-300">{row[0]}</td>
                    <td className="py-4 px-4 text-center">
                      {typeof row[1] === 'boolean' ? (
                        row[1] ? <Check className="h-5 w-5 text-success-500 mx-auto" /> : '—'
                      ) : (
                        row[1]
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof row[2] === 'boolean' ? (
                        row[2] ? <Check className="h-5 w-5 text-success-500 mx-auto" /> : '—'
                      ) : (
                        row[2]
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof row[3] === 'boolean' ? (
                        row[3] ? <Check className="h-5 w-5 text-success-500 mx-auto" /> : '—'
                      ) : (
                        row[3]
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-b border-slate-800">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to master emotional trading?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join 1,000+ traders using TradeGuard AI to improve their discipline and profits
          </p>
          <Link href="/auth/signup">
            <Button size="lg">Start Free Trial</Button>
          </Link>
          <p className="mt-6 text-sm text-slate-400">
            No credit card required. 30-day money-back guarantee.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
