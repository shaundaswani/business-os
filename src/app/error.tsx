'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-os-bg font-sans">
        <div className="max-w-md text-center p-8">
          <div className="text-4xl mb-4">⚠</div>
          <h2 className="text-xl font-bold text-os-text mb-2">Something went wrong</h2>
          <p className="text-os-text-secondary text-sm mb-6">
            {error.message ?? 'An unexpected error occurred.'}
          </p>
          <button
            onClick={reset}
            className="bg-os-text text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
