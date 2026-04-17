'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const MODULE_COLORS: Record<string, string> = {
  trading: '#7C3AED',
  jetset: '#0891B2',
  commercial: '#6366F1',
  exaim: '#DC2626',
  improveme: '#059669',
  residential: '#2563EB',
  personal: '#818CF8',
  overview: '#0F172A',
}

const MODULE_ROUTES: Record<string, string> = {
  trading: '/dashboard/trading',
  jetset: '/dashboard/jetset',
  commercial: '/dashboard/commercial',
  exaim: '/dashboard/exaim',
  improveme: '/dashboard/improveme',
  residential: '/dashboard/residential',
  personal: '/dashboard/personal',
  overview: '/dashboard/morning-brief',
}

// Static search index — in production this would query Supabase
const SEARCH_INDEX = [
  { type: 'Module', title: 'Trading', sub: 'Live module — signals, trades, analytics', biz: 'trading' },
  { type: 'Module', title: 'Morning Brief', sub: 'Daily digest and overview', biz: 'overview' },
  { type: 'Module', title: 'Jetset BC', sub: 'Business centre management', biz: 'jetset' },
  { type: 'Module', title: 'Commercial', sub: 'Commercial property portfolio', biz: 'commercial' },
  { type: 'Module', title: 'ExAIm', sub: 'AI exam preparation platform', biz: 'exaim' },
  { type: 'Module', title: 'Improve ME', sub: 'Education institute', biz: 'improveme' },
  { type: 'Module', title: 'Residential', sub: 'Residential property portfolio', biz: 'residential' },
  { type: 'Module', title: 'Personal', sub: 'Goals, health, finance', biz: 'personal' },
]

interface SearchResult {
  type: string
  title: string
  sub: string
  biz: string
  href: string
}

export default function OmniSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const router = useRouter()

  const results: SearchResult[] = query.trim().length === 0
    ? SEARCH_INDEX.map((item) => ({ ...item, href: MODULE_ROUTES[item.biz] }))
    : SEARCH_INDEX
        .filter((item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.sub.toLowerCase().includes(query.toLowerCase()),
        )
        .map((item) => ({ ...item, href: MODULE_ROUTES[item.biz] }))

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setSelected(0)
  }, [])

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') close()
    }

    function onCustomEvent() {
      setOpen(true)
    }

    document.addEventListener('keydown', onKeydown)
    document.addEventListener('open-omni-search', onCustomEvent)
    return () => {
      document.removeEventListener('keydown', onKeydown)
      document.removeEventListener('open-omni-search', onCustomEvent)
    }
  }, [close])

  function handleKeyNav(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && results[selected]) {
      router.push(results[selected].href)
      close()
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]"
      style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) close() }}
    >
      <div className="bg-white rounded-2xl w-[600px] max-w-[92vw] shadow-2xl overflow-hidden"
        style={{ animation: 'slideUp 0.18s ease' }}>
        <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>

        <input
          autoFocus
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(0) }}
          onKeyDown={handleKeyNav}
          placeholder="Search tasks, tenants, trades, modules…"
          className="w-full border-none outline-none px-5 py-4 text-base text-os-text bg-transparent placeholder:text-slate-300"
        />

        <div className="border-t border-slate-50 max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <div className="py-6 text-center text-[13px] text-os-muted">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            results.slice(0, 12).map((result, i) => (
              <button
                key={i}
                onClick={() => { router.push(result.href); close() }}
                className={[
                  'w-full flex items-center gap-3 px-5 py-3 text-left transition-colors text-[13px]',
                  i === selected ? 'bg-os-tile' : 'hover:bg-os-tile',
                ].join(' ')}
              >
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: MODULE_COLORS[result.biz] ?? '#64748B' }}
                >
                  {result.type[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-os-text truncate">{result.title}</div>
                  <div className="text-[11px] text-os-muted truncate">{result.sub}</div>
                </div>
                <span className="text-[10px] bg-os-tile border border-os-border rounded px-2 py-0.5 text-os-text-secondary shrink-0">
                  {result.type}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="border-t border-slate-50 px-5 py-2.5 flex gap-4 text-[11px] text-os-muted">
          <span><kbd className="bg-os-tile border border-os-border rounded px-1">↑↓</kbd> Navigate</span>
          <span><kbd className="bg-os-tile border border-os-border rounded px-1">Enter</kbd> Open</span>
          <span><kbd className="bg-os-tile border border-os-border rounded px-1">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  )
}
