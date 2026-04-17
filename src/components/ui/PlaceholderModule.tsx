interface PlaceholderModuleProps {
  name: string
  description: string
  color: string
  icon: string
  comingAfter?: string
}

export default function PlaceholderModule({
  name,
  description,
  color,
  icon,
  comingAfter,
}: PlaceholderModuleProps) {
  return (
    <div className="bg-white border border-os-border rounded-card p-8 text-center">
      <div
        className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-2xl text-white mb-4"
        style={{ background: color }}
      >
        {icon}
      </div>
      <h2 className="text-xl font-bold text-os-text mb-1">{name}</h2>
      <p className="text-sm text-os-text-secondary mb-4 max-w-xs mx-auto">{description}</p>
      <div className="inline-flex items-center gap-1.5 bg-os-tile border border-os-border rounded-full px-4 py-1.5 text-xs text-os-muted font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
        In development
      </div>
      {comingAfter && (
        <p className="text-[11px] text-os-muted mt-3">Activating after: {comingAfter}</p>
      )}
    </div>
  )
}
