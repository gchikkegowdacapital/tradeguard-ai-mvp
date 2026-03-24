'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, Mail, Lock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || 'free'
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signupError) {
        setError(signupError.message)
        return
      }

      if (authData.user) {
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          email,
          full_name: fullName,
          tier: plan === 'founder' ? 'founder' : plan === 'sentinel' ? 'sentinel' : plan === 'guardian' ? 'guardian' : 'free',
        })

        if (profileError) {
          setError('Failed to create profile')
          return
        }

        router.push(`/dashboard?plan=${plan}`)
      }
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
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-2xl font-bold text-white">Create Your Account</h1>
          {plan !== 'free' && (
            <Badge variant="primary">{plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</Badge>
          )}
        </div>
        <p className="text-slate-400">
          Join 1,000+ traders protecting their capital
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
          type="text"
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="John Doe"
          required
          disabled={loading}
          icon={<User className="h-5 w-5" />}
        />

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
          minLength={8}
          disabled={loading}
          icon={<Lock className="h-5 w-5" />}
        />

        <p className="text-xs text-slate-400">
          At least 8 characters
        </p>

        <Button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 text-base font-medium"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <div className="border-t border-slate-700 pt-6 space-y-4">
        <p className="text-xs text-slate-400">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>

        <p className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-primary-400 hover:text-primary-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
