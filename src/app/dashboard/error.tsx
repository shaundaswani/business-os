'use client'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-3xl mb-3">⚠</div>
      <h2 className="font-bold text-os-text mb-1">Dashboard error</h2>
      <p className="text-sm text-os-text-secondary mb-4 max-w-xs">
        {error.message ?? 'Something went wrong loading the dashboard.'}
      </p>
      <button
        onClick={reset}
        className="bg-os-text text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors"
      >
        Reload
      </button>
    </div>
  )
}
