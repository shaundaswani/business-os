'use client'

import { useState, useRef } from 'react'

const MODULE_KEYWORDS: Record<string, string[]> = {
  trading: ['trade', 'backtest', 'signal', 'gold', 'xauusd', 'eurusd', 'forex', 'rsi', 'chart'],
  jetset: ['jetset', 'jbc', 'coworking', 'tenant', 'unit', 'parking', 'prime tower'],
  commercial: ['commercial', 'one tower', 'court tower', 'lease', 'renewal', 'rent'],
  exaim: ['exaim', 'pitch', 'moe', 'marking', 'ai', 'exam', 'charterhouse', 'b2g'],
  improveme: ['improve', 'improve me', 'newsletter', 'camp', 'classcard', 'tutor', 'enrolment'],
  residential: ['residential', 'dewa', 'marina', 'downtown', 'jbr', 'apartment'],
  personal: ['personal', 'health', 'goal', 'finance'],
  overview: ['meeting', 'brief', 'review', 'calendar'],
}

function detectModule(text: string): string {
  const lower = text.toLowerCase()
  for (const [module, keywords] of Object.entries(MODULE_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return module
  }
  return 'overview'
}

function detectPriority(text: string): string {
  const lower = text.toLowerCase()
  if (lower.includes('urgent') || lower.includes('asap') || lower.includes('immediately')) return 'urgent'
  if (lower.includes('high') || lower.includes('important') || lower.includes('today')) return 'high'
  if (lower.includes('low') || lower.includes('whenever')) return 'low'
  return 'normal'
}

const PRIORITY_LABELS: Record<string, string> = {
  urgent: 'Urgent',
  high: 'High',
  normal: 'Normal',
  low: 'Low',
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-800',
  high: 'bg-amber-100 text-amber-800',
  normal: 'bg-blue-100 text-blue-700',
  low: 'bg-green-100 text-green-700',
}

const MODULE_NAMES: Record<string, string> = {
  overview: 'Morning Brief',
  trading: 'Trading',
  jetset: 'Jetset BC',
  commercial: 'Commercial',
  exaim: 'ExAIm',
  improveme: 'Improve ME',
  residential: 'Residential',
  personal: 'Personal',
}

export default function CaptureBar() {
  const [text, setText] = useState('')
  const [detectedModule, setDetectedModule] = useState<string | null>(null)
  const [detectedPriority, setDetectedPriority] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    setText(val)
    if (val.trim().length > 3) {
      setDetectedModule(detectModule(val))
      setDetectedPriority(detectPriority(val))
    } else {
      setDetectedModule(null)
      setDetectedPriority(null)
    }
    setSuccess(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)

    // TODO: POST to /api/tasks with text, detectedModule, detectedPriority
    await new Promise((r) => setTimeout(r, 600))

    setSubmitting(false)
    setSuccess(true)
    setText('')
    setDetectedModule(null)
    setDetectedPriority(null)
    setTimeout(() => setSuccess(false), 2000)
  }

  return (
    <div className="bg-white border-2 border-os-text rounded-featured p-4 mb-5">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-base">⚡</span>
        <strong className="text-sm text-os-text">Capture anything</strong>
        <span className="text-[11px] text-os-muted">Type or dictate — auto-routes to the right place</span>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 items-start">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          rows={2}
          placeholder='Try: "Hannah, chase tenant unit 14 — urgent" or "Backtest RSI on gold"'
          className="flex-1 bg-os-tile border border-os-border rounded-[10px] px-3.5 py-3 text-[13px] text-os-text outline-none resize-none leading-relaxed focus:border-os-muted transition-colors w-full"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit(e as unknown as React.FormEvent)
          }}
        />
      </form>

      {(detectedModule || detectedPriority) && (
        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          <span className="text-[11px] text-os-muted">Auto-detected:</span>
          {detectedModule && (
            <span className="text-[11px] bg-os-tile border border-os-border rounded px-2 py-0.5 text-os-text font-semibold">
              {MODULE_NAMES[detectedModule]}
            </span>
          )}
          {detectedPriority && (
            <span className={`text-[11px] rounded px-2 py-0.5 font-semibold ${PRIORITY_COLORS[detectedPriority]}`}>
              {PRIORITY_LABELS[detectedPriority]}
            </span>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !text.trim()}
            className={[
              'ml-auto bg-os-text text-white border-none rounded-lg px-4 py-1.5 text-xs font-semibold cursor-pointer transition-all',
              success ? 'bg-green-500' : '',
              submitting || !text.trim() ? 'opacity-40 cursor-default' : 'hover:bg-slate-700',
            ].join(' ')}
          >
            {success ? '✓ Added' : submitting ? 'Adding…' : 'Add task ⏎'}
          </button>
        </div>
      )}
    </div>
  )
}
