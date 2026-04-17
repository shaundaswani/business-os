'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

interface EquityChartInnerProps {
  data: number[]
}

export default function EquityChartInner({ data }: EquityChartInnerProps) {
  const isPositive = data[data.length - 1] >= 0
  const lineColor = isPositive ? '#16A34A' : '#DC2626'
  const fillColor = isPositive ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)'

  const chartData = {
    labels: data.map((_, i) => `T${i + 1}`),
    datasets: [
      {
        data,
        borderColor: lineColor,
        backgroundColor: fillColor,
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: data.length <= 20 ? 3 : 0,
        pointHoverRadius: 5,
        pointBackgroundColor: lineColor,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number } }) => `${ctx.parsed.y > 0 ? '+' : ''}${ctx.parsed.y.toFixed(2)}R`,
        },
        backgroundColor: '#0F172A',
        titleColor: '#94A3B8',
        bodyColor: '#FFFFFF',
        bodyFont: { family: 'DM Sans' },
        padding: 8,
        cornerRadius: 6,
      },
    },
    scales: {
      x: {
        grid: { color: '#F1F5F9' },
        ticks: {
          color: '#94A3B8',
          font: { family: 'DM Sans', size: 10 },
          maxTicksLimit: 8,
        },
        border: { display: false },
      },
      y: {
        grid: { color: '#F1F5F9' },
        ticks: {
          color: '#94A3B8',
          font: { family: 'DM Sans', size: 10 },
          callback: (val: string | number) => `${Number(val) > 0 ? '+' : ''}${Number(val).toFixed(1)}R`,
        },
        border: { display: false },
      },
    },
  }

  return (
    <div className="h-[180px]">
      <Line data={chartData} options={options as Parameters<typeof Line>[0]['options']} />
    </div>
  )
}
