'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      router.push('/dashboard')
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
        <p className="mt-2 text-slate-400">
          Sign in to your TradeGuard account to continue
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-danger-700 bg-danger-900/30 p-4">
          <AlertCircle className="h-5 w-5 text-danger-400 flex-shrink-0" />
          <p className="text-sm text-danger-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={loading}
          icon={<Mail className="h-5 w-5" />}
        />

        <Input
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          disabled={loading}
          icon={<Lock className="h-5 w-5" />}
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 text-base font-medium"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="border-t border-slate-700 pt-6 space-y-4">
        <p className="text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="font-medium text-primary-400 hover:text-primary-300">
            Sign up
          </Link>
        </p>

        <p className="text-center text-sm text-slate-400">
          <Link href="/auth/reset" className="text-primary-400 hover:text-primary-300">
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  )
}
