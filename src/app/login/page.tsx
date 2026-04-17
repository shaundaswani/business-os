import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginForm from './LoginForm'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <main className="min-h-screen flex items-center justify-center bg-os-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-xs uppercase tracking-widest text-os-muted mb-1">Business OS</div>
          <h1 className="text-2xl font-bold text-os-text">Good to see you</h1>
          <p className="text-sm text-os-text-secondary mt-1">Sign in to your command centre</p>
        </div>
        <div className="bg-os-card border border-os-border rounded-featured p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
