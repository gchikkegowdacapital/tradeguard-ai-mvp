'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Activity,
  Shield,
  Calculator,
  Brain,
  TrendingUp,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function HomePage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  const prices = {
    monthly: { guardian: 19, sentinel: 49, founder: 299 },
    annual: { guardian: 228, sentinel: 588, founder: 3588 },
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-slate-950 to-slate-950 opacity-50" />
        <div className="container relative z-10">
          <div className="text-center">
            <div className="inline-block mb-6">
              <Badge variant="primary">Stop Blowing Up Your Trading Account</Badge>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance mb-6">
              Stop Blowing Up Your Trading Account
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto mb-8 text-balance">
              Real-time behavioral monitoring that catches revenge trading, enforces your plan, and protects your capital — before it's too late.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/auth/signup">
                <Button size="lg" className="gap-2">
                  Start Free <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                See How It Works
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-slate-400">
              <div>
                <p className="font-semibold text-white">Trusted by 1,000+ traders</p>
              </div>
              <div className="hidden sm:block w-px h-6 bg-slate-700" />
              <div>
                <p className="font-semibold text-white">74-89% of retail traders lose money</p>
                <p className="text-xs">Be the exception</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 border-t border-slate-800">
        <div className="container">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">The Trader's Death Spiral</h2>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <DeathSpiralPhase
              number="1"
              title="Cautious Success"
              description="You're making money. Following rules. Everything feels good."
              icon="📈"
            />
            <DeathSpiralPhase
              number="2"
              title="Overconfidence"
              description="A few wins and suddenly you feel invincible. Rules start bending."
              icon="🚀"
            />
            <DeathSpiralPhase
              number="3"
              title="Catastrophic Loss"
              description="One emotional decision. One oversized position. Account drops 30%+."
              icon="💥"
            />
            <DeathSpiralPhase
              number="4"
              title="Terminal Decline"
              description="Revenge trading to recover losses. The spiral accelerates until you're out."
              icon="📉"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6 p-8 bg-gradient-to-br from-danger-900/30 to-slate-900/50 rounded-lg border border-danger-900/50">
            <div>
              <p className="text-sm text-slate-400 mb-2">The Stats Are Brutal</p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-danger-400 font-bold">70-90%</span>
                  <span className="text-slate-300">of retail traders lose money</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-danger-400 font-bold">#1 killer:</span>
                  <span className="text-slate-300">Revenge trading after losses</span>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-2">The Solution</p>
              <p className="text-slate-300">
                TradeGuard AI catches the spiral before it starts. Real-time monitoring, emotional detection, and hard stops that protect you from yourself.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 border-t border-slate-800">
        <div className="container">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">How TradeGuard Protects You</h2>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <FeatureCard
              icon={<Activity className="h-8 w-8" />}
              title="Real-Time Monitoring"
              description="See every position, every risk metric, every violation — live. No delays, no surprises."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Revenge Trading Shield"
              description="AI detects emotional trading patterns and stops you before you do damage."
            />
            <FeatureCard
              icon={<Calculator className="h-8 w-8" />}
              title="Smart Position Sizing"
              description="Never over-risk again. Auto-calculated position sizes for every trade."
            />
            <FeatureCard
              icon={<Brain className="h-8 w-8" />}
              title="AI Risk Coach"
              description="Your personal trading psychologist, available 24/7 to help you stay disciplined."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 border-t border-slate-800">
        <div className="container">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <HowItWorksStep
              number="1"
              title="Connect Broker"
              description="Safely connect your MT4, MT5, or other broker account. API encryption, zero exposure."
              icon={<TrendingUp className="h-8 w-8" />}
            />
            <div className="hidden md:flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-primary-500" />
            </div>
            <HowItWorksStep
              number="2"
              title="Set Your Rules"
              description="Define your trading plan. Daily risk limits, max trades, preferred pairs, emotional thresholds."
              icon={<Shield className="h-8 w-8" />}
            />
            <div className="hidden md:flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-primary-500" />
            </div>
            <HowItWorksStep
              number="3"
              title="Trade Protected"
              description="AI monitors every move. Alerts before violations. Optional hard stops. Full control, with guardrails."
              icon={<Brain className="h-8 w-8" />}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 border-t border-slate-800">
        <div className="container">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-8">Simple, Transparent Pricing</h2>

          <div className="flex justify-center gap-4 mb-16">
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

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <PricingCard
              name="Free"
              price={0}
              period={billingCycle}
              description="Get started with the basics"
              features={[
                'Position size calculator',
                'Trading journal',
                'Basic analytics',
                '1 broker connection',
                'Community support',
              ]}
              cta="Get Started"
              highlighted={false}
            />
            <PricingCard
              name="Guardian"
              price={prices[billingCycle].guardian}
              period={billingCycle}
              description="For active traders"
              features={[
                'Everything in Free',
                '50 trades/month limit',
                'Real-time alerts',
                'AI-powered insights',
                'Email support',
              ]}
              cta="Start Free Trial"
              highlighted={true}
            />
            <PricingCard
              name="Sentinel"
              price={prices[billingCycle].sentinel}
              period={billingCycle}
              description="For serious traders"
              features={[
                'Everything in Guardian',
                'Unlimited trades',
                'Advanced analytics',
                'Priority support',
                '5 broker connections',
                'API access',
              ]}
              cta="Start Free Trial"
              highlighted={false}
            />
          </div>

          <div className="p-8 bg-gradient-to-r from-primary-600/20 to-primary-500/20 rounded-lg border border-primary-500/30 text-center mb-12">
            <h3 className="text-2xl font-bold mb-4">Founder Pass (Limited Time)</h3>
            <p className="text-slate-300 mb-6">Lifetime access to Sentinel for a one-time payment. Limited to 100 founders.</p>
            <Link href="/auth/signup?plan=founder">
              <Button size="lg">Get Founder Pass - $299</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 border-t border-slate-800">
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
                  ['Real-time Alerts', false, true, true],
                  ['AI Insights', false, true, true],
                  ['Revenge Detection', false, true, true],
                  ['Advanced Analytics', false, false, true],
                  ['Priority Support', false, false, true],
                  ['API Access', false, false, true],
                  ['Multiple Brokers', '1', '3', '5+'],
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

      {/* FAQ Section */}
      <section className="py-20 border-t border-slate-800">
        <div className="container">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Frequently Asked Questions</h2>

          <div className="max-w-2xl mx-auto space-y-4">
            {[
              {
                question: 'Is my broker data safe?',
                answer: 'Yes. We use bank-level AES-256 encryption for all data in transit and at rest. Your API keys are encrypted with your personal encryption key. We never store passwords or execute trades on your behalf.',
              },
              {
                question: 'Does TradeGuard execute trades?',
                answer: 'No. TradeGuard AI is monitoring and advisory only. You maintain full control over your trading account. We can send alerts and suggestions, but you execute every trade.',
              },
              {
                question: 'Which brokers are supported?',
                answer: 'We support MT4, MT5, Interactive Brokers, OANDA, and more. New broker integrations are added monthly. Check your broker compatibility in the dashboard.',
              },
              {
                question: 'Can I cancel anytime?',
                answer: 'Yes. Monthly plans can be canceled immediately. No lock-in period, no penalties. Your data can be exported at any time.',
              },
              {
                question: 'Is this financial advice?',
                answer: 'No. TradeGuard AI is a risk management and monitoring tool, not financial advice. Always do your own research and consult a financial advisor before trading.',
              },
              {
                question: 'How does the AI copilot work?',
                answer: 'Our AI analyzes your emotional patterns, plan compliance, and trade setup quality using Claude API. It provides personalized coaching to help you improve discipline and reduce losses from emotional decisions.',
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition-colors"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-800/30 transition-colors"
                >
                  <span className="font-semibold text-lg text-white">{faq.question}</span>
                  {expandedFaq === i ? (
                    <ChevronUp className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === i && (
                  <div className="px-6 pb-6 text-slate-300 border-t border-slate-700">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="p-8 rounded-lg border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-800/20 hover:border-slate-700 transition-colors">
      <div className="h-12 w-12 rounded-lg bg-primary-600/20 text-primary-400 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  )
}

function DeathSpiralPhase({
  number,
  title,
  description,
  icon,
}: {
  number: string
  title: string
  description: string
  icon: string
}) {
  return (
    <div className="p-6 rounded-lg border border-slate-700 bg-slate-900/50">
      <div className="text-4xl mb-4">{icon}</div>
      <div className="inline-block px-3 py-1 rounded-full bg-slate-700 text-xs font-semibold mb-3">
        Phase {number}
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  )
}

function HowItWorksStep({
  number,
  title,
  description,
  icon,
}: {
  number: string
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="p-8 rounded-lg border border-slate-800 bg-slate-900/50">
      <div className="h-12 w-12 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center mb-4 font-bold">
        {number}
      </div>
      <div className="text-primary-400 mb-4">{icon}</div>
      <h3 className="font-bold text-xl mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  )
}

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  highlighted = false,
}: {
  name: string
  price: number
  period: string
  description: string
  features: string[]
  cta: string
  highlighted?: boolean
}) {
  return (
    <div
      className={`rounded-lg border p-8 transition-all ${
        highlighted
          ? 'border-primary-500/50 bg-gradient-to-br from-primary-900/30 to-slate-900/50 ring-2 ring-primary-500/20 md:scale-105'
          : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
      }`}
    >
      {highlighted && (
        <Badge variant="primary" className="mb-4">
          Most Popular
        </Badge>
      )}
      <h3 className="text-2xl font-bold">{name}</h3>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-4xl font-bold">
          {price === 0 ? 'Free' : `$${price}`}
        </span>
        {price > 0 && (
          <span className="text-slate-400">
            /{period === 'monthly' ? 'month' : 'year'}
          </span>
        )}
      </div>
      <Link href={`/auth/signup?plan=${name.toLowerCase()}`} className="block mt-8">
        <Button className={`w-full ${highlighted ? '' : 'variant-outline'}`}>
          {cta}
        </Button>
      </Link>
      <ul className="mt-8 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-3 text-slate-300">
            <Check className="h-5 w-5 text-success-500 flex-shrink-0" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
