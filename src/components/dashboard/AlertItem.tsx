'use client'

import { AlertCircle, AlertTriangle, AlertOctagon, Info } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface Alert {
  id: string
  level: 'info' | 'warning' | 'critical' | 'emergency'
  message: string
  timestamp: string
}

interface AlertItemProps {
  alert: Alert
}

export function AlertItem({ alert }: AlertItemProps) {
  const levelConfig = {
    info: {
      icon: <Info className="h-4 w-4" />,
      bgColor: 'bg-blue-900/30 border-blue-800',
      badgeColor: 'bg-blue-900 text-blue-300',
      textColor: 'text-blue-300',
    },
    warning: {
      icon: <AlertTriangle className="h-4 w-4" />,
      bgColor: 'bg-yellow-900/30 border-yellow-800',
      badgeColor: 'bg-yellow-900 text-yellow-300',
      textColor: 'text-yellow-300',
    },
    critical: {
      icon: <AlertCircle className="h-4 w-4" />,
      bgColor: 'bg-orange-900/30 border-orange-800',
      badgeColor: 'bg-orange-900 text-orange-300',
      textColor: 'text-orange-300',
    },
    emergency: {
      icon: <AlertOctagon className="h-4 w-4" />,
      bgColor: 'bg-red-900/30 border-red-800',
      badgeColor: 'bg-red-900 text-red-300',
      textColor: 'text-red-300',
    },
  }

  const config = levelConfig[alert.level]

  return (
    <div className={`flex gap-4 rounded-lg border px-4 py-3 ${config.bgColor}`}>
      <div className={config.textColor}>{config.icon}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`rounded px-2 py-1 text-xs font-semibold ${config.badgeColor}`}>
            {alert.level.toUpperCase()}
          </span>
          <span className="text-sm text-white">{alert.message}</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">{formatDateTime(alert.timestamp)}</p>
      </div>
    </div>
  )
}
