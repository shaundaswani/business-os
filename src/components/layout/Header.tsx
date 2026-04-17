'use client'

import { greeting } from '@/lib/utils'
import type { Role } from '@/types'

interface HeaderProps {
  userName: string
  userRole: Role
}

export default function Header({ userName, userRole }: HeaderProps) {
  const firstName = userName.split(' ')[0]

  return (
    <header className="pt-7 pb-4 border-b border-os-border mb-4 flex justify-between items-baseline flex-wrap gap-2">
      <div>
        <div className="text-[11px] uppercase tracking-widest text-os-muted mb-1 flex items-center gap-2">
          Business OS
          {userRole === 'owner' && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #F59E0B, #EF4444, #8B5CF6)',
                color: '#FFF',
                letterSpacing: '0.06em',
              }}>
              GOD MODE
            </span>
          )}
        </div>
        <h1 className="text-[26px] font-bold text-os-text leading-none">
          {greeting()}, {firstName}
        </h1>
        <button
          className="text-[11px] text-os-muted flex items-center gap-1 mt-1 hover:text-os-text-secondary transition-colors"
          onClick={() => {
            // OmniSearch opens via custom event
            document.dispatchEvent(new CustomEvent('open-omni-search'))
          }}
        >
          <kbd className="bg-os-tile border border-os-border rounded px-1.5 py-0.5 text-[10px] font-mono">⌘</kbd>
          <kbd className="bg-os-tile border border-os-border rounded px-1.5 py-0.5 text-[10px] font-mono">K</kbd>
          <span>Search anything across all businesses</span>
        </button>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold text-os-text" suppressHydrationWarning>
          {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </div>
        <div className="text-[11px] text-os-muted" suppressHydrationWarning>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
      </div>
    </header>
  )
}
