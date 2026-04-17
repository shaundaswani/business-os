type ClassValue = string | number | boolean | null | undefined | ClassValue[]

// Simple class name utility — no external dependency
export function cn(...inputs: ClassValue[]): string {
  return inputs
    .flat(Infinity as 20)
    .filter(Boolean)
    .join(' ')
    .trim()
}

// Format numbers
export function formatR(r: number | null): string {
  if (r === null) return '—'
  return `${r > 0 ? '+' : ''}${r.toFixed(2)}R`
}

export function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`
}

export function formatPrice(price: number): string {
  if (price > 1000) return price.toLocaleString('en-US', { maximumFractionDigits: 2 })
  if (price > 10) return price.toFixed(2)
  return price.toFixed(4)
}

// Date helpers
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// Biometric scoring
export function calcRecoveryScore(bio: {
  sleep_hours: number | null
  hrv_ms: number | null
  metabolic_score: number | null
  stress_score: number | null
}): number {
  let score = 0
  const sleep = bio.sleep_hours ?? 0
  const hrv = bio.hrv_ms ?? 0
  const metabolic = bio.metabolic_score ?? 0
  const stress = bio.stress_score ?? 100

  if (sleep >= 7) score += 25
  else if (sleep >= 5) score += 15
  else score += 5

  if (hrv >= 50) score += 25
  else if (hrv >= 30) score += 15
  else score += 5

  score += metabolic * 0.3
  score += (100 - stress) * 0.2

  return Math.round(Math.min(100, Math.max(0, score)))
}
