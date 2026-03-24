import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`
}

export function formatNumber(value: number, decimals: number = 2): string {
  return parseFloat(value.toFixed(decimals)).toLocaleString('en-US')
}

export function calculateWinRate(wins: number, total: number): number {
  if (total === 0) return 0
  return (wins / total) * 100
}

export function calculateRiskRewardRatio(
  entryPrice: number,
  stopLoss: number,
  takeProfit: number
): number {
  const risk = Math.abs(entryPrice - stopLoss)
  const reward = Math.abs(takeProfit - entryPrice)
  if (risk === 0) return 0
  return reward / risk
}

export function calculatePnL(
  entryPrice: number,
  exitPrice: number,
  volume: number,
  isLong: boolean
): number {
  const priceDifference = exitPrice - entryPrice
  return isLong ? priceDifference * volume : -priceDifference * volume
}

export function calculatePnLPercent(entryPrice: number, exitPrice: number, isLong: boolean): number {
  const priceDifference = exitPrice - entryPrice
  const percentChange = (priceDifference / entryPrice) * 100
  return isLong ? percentChange : -percentChange
}

export function getDaysSince(date: string | Date): number {
  const now = new Date()
  const pastDate = new Date(date)
  const diffTime = Math.abs(now.getTime() - pastDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
  const d = new Date(date)
  if (format === 'short') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
