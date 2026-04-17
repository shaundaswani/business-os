'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TradeForm {
  asset: string
  direction: 'long' | 'short'
  entry_price: string
  entry_time: string
  exit_price: string
  exit_time: string
  notes: string
}

const DEFAULT_FORM: TradeForm = {
  asset: 'XAUUSD',
  direction: 'long',
  entry_price: '',
  entry_time: new Date().toISOString().slice(0, 16),
  exit_price: '',
  exit_time: '',
  notes: '',
}

function calcPnlR(direction: 'long' | 'short', entry: number, exit: number): number {
  if (direction === 'long') return (exit - entry) / (entry * 0.005)
  return (entry - exit) / (entry * 0.005)
}

export default function ManualTradeModal() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<TradeForm>(DEFAULT_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateField(field: keyof TradeForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const entry = parseFloat(form.entry_price)
    const exit = form.exit_price ? parseFloat(form.exit_price) : null

    if (isNaN(entry) || entry <= 0) {
      setError('Invalid entry price')
      setSubmitting(false)
      return
    }

    const pnl_r = exit ? parseFloat(calcPnlR(form.direction, entry, exit).toFixed(4)) : null
    const status = exit ? 'closed' : 'open'

    // Manual trades use a dedicated RPC that enforces RBAC and handles
    // both open and closed trades in a single call
    const supabase = createClient()
    const { error: rpcError } = await supabase.rpc('insert_manual_trade', {
      p_asset: form.asset.toUpperCase(),
      p_direction: form.direction,
      p_entry_price: entry,
      p_entry_time: new Date(form.entry_time).toISOString(),
      p_exit_price: exit ?? null,
      p_exit_time: exit && form.exit_time ? new Date(form.exit_time).toISOString() : null,
      p_notes: form.notes || null,
    })

    if (rpcError) {
      setError(rpcError.message)
      setSubmitting(false)
      return
    }

    setOpen(false)
    setForm(DEFAULT_FORM)
    setSubmitting(false)
    // Trigger page refresh to show new trade
    window.location.reload()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-os-text text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
      >
        + Manual trade
      </button>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
    >
      <div className="bg-white rounded-featured w-[480px] max-w-[92vw] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-os-border">
          <div className="w-8 h-8 bg-os-text text-white rounded-lg flex items-center justify-center text-sm">
            +
          </div>
          <div className="font-bold text-os-text flex-1">Log Manual Trade</div>
          <button
            onClick={() => setOpen(false)}
            className="text-os-muted hover:text-os-text transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-os-muted uppercase tracking-wider mb-1">
                Asset
              </label>
              <input
                value={form.asset}
                onChange={(e) => updateField('asset', e.target.value)}
                className="w-full border border-os-border rounded-lg px-3 py-2 text-sm text-os-text bg-os-tile outline-none focus:border-slate-400"
                placeholder="XAUUSD"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-os-muted uppercase tracking-wider mb-1">
                Direction
              </label>
              <select
                value={form.direction}
                onChange={(e) => updateField('direction', e.target.value)}
                className="w-full border border-os-border rounded-lg px-3 py-2 text-sm text-os-text bg-os-tile outline-none focus:border-slate-400"
              >
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-os-muted uppercase tracking-wider mb-1">
                Entry Price
              </label>
              <input
                type="number"
                step="any"
                value={form.entry_price}
                onChange={(e) => updateField('entry_price', e.target.value)}
                className="w-full border border-os-border rounded-lg px-3 py-2 text-sm text-os-text bg-os-tile outline-none focus:border-slate-400"
                placeholder="2312.40"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-os-muted uppercase tracking-wider mb-1">
                Entry Time
              </label>
              <input
                type="datetime-local"
                value={form.entry_time}
                onChange={(e) => updateField('entry_time', e.target.value)}
                className="w-full border border-os-border rounded-lg px-3 py-2 text-sm text-os-text bg-os-tile outline-none focus:border-slate-400"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-os-muted uppercase tracking-wider mb-1">
                Exit Price <span className="text-os-muted font-normal">(optional)</span>
              </label>
              <input
                type="number"
                step="any"
                value={form.exit_price}
                onChange={(e) => updateField('exit_price', e.target.value)}
                className="w-full border border-os-border rounded-lg px-3 py-2 text-sm text-os-text bg-os-tile outline-none focus:border-slate-400"
                placeholder="Leave blank if open"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-os-muted uppercase tracking-wider mb-1">
                Exit Time <span className="text-os-muted font-normal">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={form.exit_time}
                onChange={(e) => updateField('exit_time', e.target.value)}
                disabled={!form.exit_price}
                className="w-full border border-os-border rounded-lg px-3 py-2 text-sm text-os-text bg-os-tile outline-none focus:border-slate-400 disabled:opacity-40"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-os-muted uppercase tracking-wider mb-1">
              Notes <span className="text-os-muted font-normal">(optional)</span>
            </label>
            <input
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              className="w-full border border-os-border rounded-lg px-3 py-2 text-sm text-os-text bg-os-tile outline-none focus:border-slate-400"
              placeholder="Setup notes…"
            />
          </div>

          {form.entry_price && form.exit_price && (
            <div className="bg-os-tile rounded-lg px-4 py-2 text-sm">
              Preview P&L:{' '}
              <span className={`font-bold ${calcPnlR(form.direction, parseFloat(form.entry_price), parseFloat(form.exit_price)) >= 0 ? 'text-os-win' : 'text-os-loss'}`}>
                {calcPnlR(form.direction, parseFloat(form.entry_price), parseFloat(form.exit_price)).toFixed(2)}R
              </span>
            </div>
          )}

          {error && <p className="text-xs text-os-loss font-medium">{error}</p>}

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="bg-os-tile text-os-text-secondary border border-os-border rounded-lg px-4 py-2 text-sm font-semibold hover:bg-os-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-os-text text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-40"
            >
              {submitting ? 'Saving…' : 'Log trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
