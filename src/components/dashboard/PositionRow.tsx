'use client'

import { ArrowUp, ArrowDown, MoreVertical } from 'lucide-react'
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils'

interface Position {
  id: string
  symbol: string
  direction: 'long' | 'short'
  entryPrice: number
  currentPrice: number
  pnl: number
  pnlPercent: number
  riskPercent: number
  stopLoss: number
  takeProfit: number
  volume: number
}

interface PositionRowProps {
  position: Position
}

export function PositionRow({ position }: PositionRowProps) {
  const isProfit = position.pnl > 0
  const isLong = position.direction === 'long'

  return (
    <div className="grid grid-cols-10 gap-4 border-b border-slate-800 px-6 py-4 text-sm text-slate-300 hover:bg-slate-800/50">
      <div className="col-span-2 font-semibold text-white">{position.symbol}</div>

      <div className="flex items-center gap-1">
        {isLong ? (
          <>
            <ArrowUp className="h-4 w-4 text-green-500" />
            <span className="text-green-400">Long</span>
          </>
        ) : (
          <>
            <ArrowDown className="h-4 w-4 text-red-500" />
            <span className="text-red-400">Short</span>
          </>
        )}
      </div>

      <div>{formatCurrency(position.entryPrice)}</div>
      <div>{formatCurrency(position.currentPrice)}</div>

      <div className={isProfit ? 'text-green-400' : 'text-red-400'}>
        {formatCurrency(position.pnl)}
        <span className="ml-1 text-xs">
          {formatPercent(position.pnlPercent / 100)}
        </span>
      </div>

      <div className={position.riskPercent > 2 ? 'text-orange-400' : 'text-green-400'}>
        {formatPercent(position.riskPercent / 100)}
      </div>

      <div className="text-xs text-slate-500">{formatCurrency(position.stopLoss)}</div>
      <div className="text-xs text-slate-500">{formatCurrency(position.takeProfit)}</div>

      <div className="flex items-center justify-end gap-2">
        <button className="rounded p-1 hover:bg-slate-700">
          <MoreVertical className="h-4 w-4 text-slate-400" />
        </button>
      </div>
    </div>
  )
}
