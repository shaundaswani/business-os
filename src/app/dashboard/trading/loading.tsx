export default function TradingLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-os-border rounded-[10px]" />
        ))}
      </div>
      <div className="h-56 bg-os-border rounded-card" />
      <div className="h-36 bg-os-border rounded-card" />
    </div>
  )
}
