'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: string
  icon: React.ReactNode
  color?: 'blue' | 'purple' | 'green' | 'red' | 'amber'
  trend?: 'up' | 'down' | null
}

const colorMap = {
  blue: 'bg-blue-900/30 border-blue-800 text-blue-400',
  purple: 'bg-purple-900/30 border-purple-800 text-purple-400',
  green: 'bg-green-900/30 border-green-800 text-green-400',
  red: 'bg-red-900/30 border-red-800 text-red-400',
  amber: 'bg-amber-900/30 border-amber-800 text-amber-400',
}

export function MetricCard({
  label,
  value,
  icon,
  color = 'blue',
  trend,
}: MetricCardProps) {
  return (
    <div className={cn(
      'rounded-lg border px-6 py-4',
      colorMap[color]
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={cn('rounded-full p-3', colorMap[color])}>
          {icon}
        </div>
      </div>
    </div>
  )
}
