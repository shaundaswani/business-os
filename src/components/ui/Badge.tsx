type BadgeVariant = 'default' | 'win' | 'loss' | 'warning' | 'info' | 'muted'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-600',
  win: 'bg-green-100 text-green-800',
  loss: 'bg-red-100 text-red-800',
  warning: 'bg-amber-100 text-amber-800',
  info: 'bg-blue-100 text-blue-700',
  muted: 'bg-slate-50 text-slate-500',
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide ${VARIANT_CLASSES[variant]}`}>
      {children}
    </span>
  )
}
