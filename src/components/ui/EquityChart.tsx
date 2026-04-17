'use client'

import dynamic from 'next/dynamic'

// Lazy-load Chart.js to avoid SSR window errors
const EquityChartInner = dynamic(() => import('./EquityChartInner'), { ssr: false })

interface EquityChartProps {
  data: number[]
}

export default function EquityChart({ data }: EquityChartProps) {
  return <EquityChartInner data={data} />
}
