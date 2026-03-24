import { ReactNode } from 'react'
import { Shield } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <Shield className="h-8 w-8 text-primary-600" />
          TradeGuard AI
        </Link>
      </div>
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-8 shadow-lg">
            {children}
          </div>
          <p className="mt-6 text-center text-sm text-slate-400">
            © 2026 TradeGuard AI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
