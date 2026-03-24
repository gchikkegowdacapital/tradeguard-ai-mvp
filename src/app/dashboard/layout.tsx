'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Calculator,
  BookOpen,
  Brain,
  Settings,
  Zap,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const userTier = 'FREE' // This would come from user data in a real app

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/calculator', label: 'Calculator', icon: Calculator },
    { href: '/dashboard/journal', label: 'Journal', icon: BookOpen },
    { href: '/dashboard/copilot', label: 'AI Copilot', icon: Brain, badge: 'Pro' },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]

  const showUpgrade = userTier === 'FREE'

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-64 transform bg-slate-950 transition-transform duration-300 ease-in-out md:static md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'border-r border-slate-800 z-50'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-b border-slate-800 p-6">
            <h2 className="text-xl font-bold text-white">TradeGuard</h2>
            <p className="mt-1 text-xs text-slate-400">AI-Powered Risk Management</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              const isPro = item.badge === 'Pro'

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                  {isPro && (
                    <span className="rounded bg-purple-900/50 px-2 py-0.5 text-xs font-semibold text-purple-300">
                      Pro
                    </span>
                  )}
                </Link>
              )
            })}

            {/* Upgrade Section */}
            {showUpgrade && (
              <div className="mt-6 rounded-lg border border-slate-700 bg-slate-900/50 p-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-semibold text-white">Upgrade to Pro</span>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Unlock AI Copilot and advanced trading features
                </p>
                <button className="mt-3 w-full rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700">
                  Upgrade Now
                </button>
              </div>
            )}
          </nav>

          {/* User Section */}
          <div className="border-t border-slate-800 p-4">
            <div className="mb-4 rounded-lg bg-slate-900 p-3">
              <p className="text-xs text-slate-500">Account Tier</p>
              <p className="mt-1 font-semibold text-white">{userTier}</p>
            </div>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/50 hover:text-white"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="sticky top-0 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 md:hidden"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Right Side */}
            <div className="ml-auto flex items-center gap-4">
              {/* Notification Bell */}
              <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
              </button>

              {/* Account Dropdown */}
              <div className="relative">
                <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-800">
                  <div className="h-8 w-8 rounded-full bg-slate-700" />
                  <span className="text-slate-300">Account</span>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
