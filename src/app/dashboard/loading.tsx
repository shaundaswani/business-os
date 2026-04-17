export default function DashboardLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-5 bg-os-border rounded w-1/3" />
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-os-border rounded-card" />
        ))}
      </div>
      <div className="h-48 bg-os-border rounded-card" />
    </div>
  )
}
