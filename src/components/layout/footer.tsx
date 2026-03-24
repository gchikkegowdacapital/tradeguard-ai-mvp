import Link from 'next/link'
import { Shield } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-primary-600" />
              <span className="font-bold text-slate-900 dark:text-white">TradeGuard AI</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Your AI-powered trading guardian. Stop blowing up your account.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/calculator" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                  Calculator
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://blog.tradeguard.ai" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                  Blog
                </a>
              </li>
              <li>
                <a href="https://support.tradeguard.ai" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                  Support
                </a>
              </li>
              <li>
                <a href="https://twitter.com/tradeguardai" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                  Twitter
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="/terms" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                  Terms
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                  Privacy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-8 dark:border-slate-700">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © 2026 TradeGuard AI. All rights reserved.
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Not financial advice. Trading involves risk. Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
