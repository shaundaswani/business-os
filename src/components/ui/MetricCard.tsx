interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
  trend?: 'up' | 'down' | 'neutral'
}

export default function MetricCard({ label, value, sub, trend }: MetricCardProps) {
  const valueColor =
    trend === 'up'
      ? 'text-os-win'
      : trend === 'down'
      ? 'text-os-loss'
      : 'text-os-text'

  return (
    <div className="bg-os-tile rounded-[10px] px-4 py-3.5">
      <div className="text-[10px] uppercase tracking-wider text-os-muted mb-1">{label}</div>
      <div className={`text-xl font-semibold leading-tight ${valueColor}`}>{value}</div>
      {sub && <div className="text-[11px] text-os-text-secondary mt-0.5">{sub}</div>}
    </div>
  )
}
