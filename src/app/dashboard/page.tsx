import { redirect } from 'next/navigation'

// Default dashboard route redirects to trading (live module)
export default function DashboardIndexPage() {
  redirect('/dashboard/trading')
}
