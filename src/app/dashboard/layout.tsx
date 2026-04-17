import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import TabBar from '@/components/layout/TabBar'
import CaptureBar from '@/components/layout/CaptureBar'
import OmniSearch from '@/components/layout/OmniSearch'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // AUTH BYPASSED FOR LOCAL DEV — re-enable before deploying
  // const supabase = createClient()
  // const { data: { user } } = await supabase.auth.getUser()
  // if (!user) redirect('/login')
  // const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single()

  return (
    <div className="min-h-screen bg-os-bg">
      <OmniSearch />
      <div className="max-w-[920px] mx-auto px-4 pb-16">
        <Header
          userName="Shaun"
          userRole="owner"
        />
        <CaptureBar />
        <TabBar />
        <main>{children}</main>
      </div>
    </div>
  )
}
