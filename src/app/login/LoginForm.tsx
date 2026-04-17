'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magicSent, setMagicSent] = useState(false)

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  async function handleMagicLink() {
    if (!email) {
      setError('Enter your email first')
      return
    }
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/dashboard` },
    })

    if (error) {
      setError(error.message)
    } else {
      setMagicSent(true)
    }
    setLoading(false)
  }

  if (magicSent) {
    return (
      <div className="text-center py-4">
        <div className="text-2xl mb-3">📬</div>
        <p className="font-semibold text-os-text">Check your email</p>
        <p className="text-sm text-os-text-secondary mt-1">
          We sent a magic link to <span className="font-medium">{email}</span>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-os-text-secondary uppercase tracking-wider mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-os-border rounded-lg px-3 py-2 text-sm text-os-text bg-os-bg outline-none focus:border-slate-400 transition-colors"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-os-text-secondary uppercase tracking-wider mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border border-os-border rounded-lg px-3 py-2 text-sm text-os-text bg-os-bg outline-none focus:border-slate-400 transition-colors"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="text-xs text-os-loss font-medium">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-os-text text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-40"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-os-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-os-card px-2 text-xs text-os-muted">or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleMagicLink}
        disabled={loading}
        className="w-full border border-os-border text-os-text-secondary font-semibold text-sm py-2.5 rounded-lg hover:bg-os-bg transition-colors disabled:opacity-40"
      >
        Send magic link
      </button>
    </form>
  )
}
