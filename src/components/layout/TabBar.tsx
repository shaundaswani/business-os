'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { id: 'overview',    label: 'Morning Brief', href: '/dashboard/morning-brief' },
  { id: 'trading',     label: 'Trading',        href: '/dashboard/trading' },
  { id: 'jetset',      label: 'Jetset BC',      href: '/dashboard/jetset' },
  { id: 'commercial',  label: 'Commercial',     href: '/dashboard/commercial' },
  { id: 'exaim',       label: 'ExAIm',          href: '/dashboard/exaim' },
  { id: 'improveme',   label: 'Improve ME',     href: '/dashboard/improveme' },
  { id: 'residential', label: 'Residential',    href: '/dashboard/residential' },
  { id: 'personal',    label: 'Personal',       href: '/dashboard/personal' },
]

export default function TabBar() {
  const pathname = usePathname()

  return (
    <nav
      className="flex gap-0.5 overflow-x-auto pb-0.5 mb-5 border-b border-os-border"
      style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      aria-label="Module navigation"
    >
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={[
              'whitespace-nowrap px-3 py-2 text-[11.5px] font-semibold rounded-t-lg transition-all duration-150 border-b-2',
              active
                ? 'bg-os-text text-white border-os-text'
                : 'text-os-text-secondary border-transparent hover:bg-os-tile',
            ].join(' ')}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
