'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Shield, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary-600" />
          <span className="text-xl font-bold text-slate-900 dark:text-white">TradeGuard AI</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/calculator" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors">
            Calculator
          </Link>
          <Link href="/pricing" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors">
            Pricing
          </Link>
          <a href="https://blog.tradeguard.ai" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors">
            Blog
          </a>
          <a href="https://support.tradeguard.ai" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors">
            Support
          </a>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/auth/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/auth/signup">
            <Button>Start Free</Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-slate-900 dark:text-white" />
          ) : (
            <Menu className="h-6 w-6 text-slate-900 dark:text-white" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="container flex flex-col gap-4 py-4">
            <Link
              href="/calculator"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              onClick={() => setIsOpen(false)}
            >
              Calculator
            </Link>
            <Link
              href="/pricing"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
            <a href="https://blog.tradeguard.ai" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
              Blog
            </a>
            <a href="https://support.tradeguard.ai" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
              Support
            </a>
            <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
              <div className="flex flex-col gap-3">
                <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Start Free</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
