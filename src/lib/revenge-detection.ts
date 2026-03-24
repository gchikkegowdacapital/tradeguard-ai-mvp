import { Trade, TradingPlan, PositionDirection } from '@/types/index'

export interface RevengeSignals {
  rapidReentry: number
  positionSizeEscalation: number
  sameInstrumentRetrade: number
  tradingFrequencySpike: number
  outsideTradingHours: number
  stopLossWidening: number
  multipleAssetSwitching: number
}

export interface RevengeAnalysis {
  score: number
  label: 'Normal' | 'Elevated' | 'High' | 'Critical'
  dominantSignal: string
  recommendation: string
  signals: RevengeSignals
}

export interface RevengeAction {
  action: string
  cooldownMinutes: number
  message: string
}

const WEIGHTS = {
  rapidReentry: 0.25,
  positionSizeEscalation: 0.20,
  sameInstrumentRetrade: 0.15,
  tradingFrequencySpike: 0.15,
  outsideTradingHours: 0.10,
  stopLossWidening: 0.10,
  multipleAssetSwitching: 0.05,
}

function calculateRapidReentrySignal(trades: Trade[], lastLossIndex: number): number {
  if (lastLossIndex === -1 || lastLossIndex === 0) return 0

  const lastLossTrade = trades[lastLossIndex]
  const nextTrade = trades[lastLossIndex - 1]

  const lossTime = new Date(lastLossTrade.exit_time || lastLossTrade.entry_time).getTime()
  const nextTime = new Date(nextTrade.entry_time).getTime()
  const diffMinutes = (nextTime - lossTime) / (1000 * 60)

  if (diffMinutes < 2) return 1.0
  if (diffMinutes < 5) return 0.5
  return 0
}

function calculatePositionSizeEscalation(trades: Trade[]): number {
  if (trades.length < 2) return 0

  const recentTrades = trades.slice(0, Math.min(5, trades.length))
  const avgSize = recentTrades.reduce((sum, t) => sum + t.volume, 0) / recentTrades.length

  const latestTrade = trades[0]
  const ratio = latestTrade.volume / avgSize

  if (ratio > 2.0) return 1.0
  if (ratio > 1.5) return 0.5
  return 0
}

function calculateSameInstrumentRetradeSignal(trades: Trade[], lastLossIndex: number): number {
  if (lastLossIndex === -1 || lastLossIndex === 0) return 0

  const lastLossTrade = trades[lastLossIndex]
  const nextTrade = trades[lastLossIndex - 1]

  if (lastLossTrade.symbol !== nextTrade.symbol) return 0

  const lossTime = new Date(lastLossTrade.exit_time || lastLossTrade.entry_time).getTime()
  const nextTime = new Date(nextTrade.entry_time).getTime()
  const diffMinutes = (nextTime - lossTime) / (1000 * 60)

  if (diffMinutes < 10) return 1.0
  if (diffMinutes < 30) return 0.5
  return 0
}

function calculateTradingFrequencySpikeSignal(trades: Trade[]): number {
  if (trades.length < 2) return 0

  // Calculate current hour's trading frequency
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

  const currentHourTrades = trades.filter((t) => {
    const tradeTime = new Date(t.entry_time)
    return tradeTime >= oneHourAgo && tradeTime <= now
  }).length

  // Calculate 7-day average
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const last7DaysTrades = trades.filter((t) => {
    const tradeTime = new Date(t.entry_time)
    return tradeTime >= sevenDaysAgo && tradeTime <= now
  }).length

  const avgTradesPerHour = last7DaysTrades / (7 * 24)
  const ratio = currentHourTrades / (avgTradesPerHour || 1)

  if (ratio > 3.0) return 1.0
  if (ratio > 2.0) return 0.5
  return 0
}

function calculateOutsideTradingHoursSignal(plan: TradingPlan): number {
  if (!plan.trading_hours_start || !plan.trading_hours_end) return 0

  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTime = currentHour * 60 + currentMinute

  const [startHour, startMin] = plan.trading_hours_start.split(':').map(Number)
  const [endHour, endMin] = plan.trading_hours_end.split(':').map(Number)

  const startTime = startHour * 60 + startMin
  const endTime = endHour * 60 + endMin

  if (currentTime < startTime || currentTime > endTime) {
    return 1.0
  }
  return 0
}

function calculateStopLossWideningSignal(trades: Trade[]): number {
  if (trades.length < 2) return 0

  const recentLosingTrades = trades.filter((t) => t.pnl < 0).slice(0, 5)
  if (recentLosingTrades.length === 0) return 0

  // Check if any trades show signs of stop loss being widened
  // This is inferred from trades that went deeper into loss before exiting
  let wideningCount = 0

  for (let i = 0; i < recentLosingTrades.length - 1; i++) {
    const currentTrade = recentLosingTrades[i]
    const prevTrade = recentLosingTrades[i + 1]

    const currentRisk = Math.abs(currentTrade.entry_price - (currentTrade.exit_price || currentTrade.entry_price))
    const prevRisk = Math.abs(prevTrade.entry_price - (prevTrade.exit_price || prevTrade.entry_price))

    if (currentRisk > prevRisk * 1.5) {
      wideningCount++
    }
  }

  if (wideningCount > 2) return 1.0
  if (wideningCount > 0) return 0.5
  return 0
}

function calculateMultipleAssetSwitchingSignal(trades: Trade[]): number {
  if (trades.length < 3) return 0

  const last30MinTrades = trades.filter((t) => {
    const tradeTime = new Date(t.entry_time).getTime()
    const now = new Date().getTime()
    return now - tradeTime <= 30 * 60 * 1000
  })

  const uniqueSymbols = new Set(last30MinTrades.map((t) => t.symbol)).size

  if (uniqueSymbols >= 5) return 1.0
  if (uniqueSymbols >= 3) return 0.5
  return 0
}

function getLastLosingTradeIndex(trades: Trade[]): number {
  for (let i = 0; i < trades.length; i++) {
    if (trades[i].pnl < 0) return i
  }
  return -1
}

export function analyzeTradeSequence(
  recentTrades: Trade[],
  plan: TradingPlan
): RevengeAnalysis {
  if (recentTrades.length === 0) {
    return {
      score: 0,
      label: 'Normal',
      dominantSignal: 'No recent trades',
      recommendation: 'Keep following your trading plan.',
      signals: {
        rapidReentry: 0,
        positionSizeEscalation: 0,
        sameInstrumentRetrade: 0,
        tradingFrequencySpike: 0,
        outsideTradingHours: 0,
        stopLossWidening: 0,
        multipleAssetSwitching: 0,
      },
    }
  }

  // Sort trades by entry_time descending (most recent first)
  const sortedTrades = [...recentTrades].sort(
    (a, b) => new Date(b.entry_time).getTime() - new Date(a.entry_time).getTime()
  )

  const lastLossIndex = getLastLosingTradeIndex(sortedTrades)

  const signals: RevengeSignals = {
    rapidReentry: calculateRapidReentrySignal(sortedTrades, lastLossIndex),
    positionSizeEscalation: calculatePositionSizeEscalation(sortedTrades),
    sameInstrumentRetrade: calculateSameInstrumentRetradeSignal(sortedTrades, lastLossIndex),
    tradingFrequencySpike: calculateTradingFrequencySpikeSignal(sortedTrades),
    outsideTradingHours: calculateOutsideTradingHoursSignal(plan),
    stopLossWidening: calculateStopLossWideningSignal(sortedTrades),
    multipleAssetSwitching: calculateMultipleAssetSwitchingSignal(sortedTrades),
  }

  const score =
    (signals.rapidReentry * WEIGHTS.rapidReentry +
      signals.positionSizeEscalation * WEIGHTS.positionSizeEscalation +
      signals.sameInstrumentRetrade * WEIGHTS.sameInstrumentRetrade +
      signals.tradingFrequencySpike * WEIGHTS.tradingFrequencySpike +
      signals.outsideTradingHours * WEIGHTS.outsideTradingHours +
      signals.stopLossWidening * WEIGHTS.stopLossWidening +
      signals.multipleAssetSwitching * WEIGHTS.multipleAssetSwitching) * 100

  const label = getRevengeLabel(score)

  // Find dominant signal
  const signalEntries = Object.entries(signals).map(([key, value]) => ({
    signal: key,
    value: value * WEIGHTS[key as keyof typeof WEIGHTS],
  }))
  const dominantSignal = signalEntries.sort((a, b) => b.value - a.value)[0]?.signal || 'None'

  const recommendation = getRevengeRecommendation(score, dominantSignal)

  return {
    score: Math.round(score),
    label,
    dominantSignal,
    recommendation,
    signals,
  }
}

export function getRevengeLabel(score: number): 'Normal' | 'Elevated' | 'High' | 'Critical' {
  if (score >= 75) return 'Critical'
  if (score >= 50) return 'High'
  if (score >= 25) return 'Elevated'
  return 'Normal'
}

function getRevengeRecommendation(score: number, dominantSignal: string): string {
  if (score >= 75) {
    return 'CRITICAL: Step away from trading immediately. You\'re showing strong revenge trading signals. Take a break, review your plan, and return when calm.'
  }
  if (score >= 50) {
    return 'HIGH RISK: Your recent trading shows revenge patterns. Reduce position sizes and slow down. Wait at least 30 minutes before your next trade.'
  }
  if (score >= 25) {
    return 'ELEVATED: You\'re showing some revenge trading signals. Review your last few trades and ensure they follow your plan. Consider taking a brief break.'
  }
  return 'You\'re trading within your normal patterns. Keep following your plan and maintain discipline.'
}

export function getRevengeAction(score: number): RevengeAction {
  if (score >= 75) {
    return {
      action: 'HALT_TRADING',
      cooldownMinutes: 120,
      message: 'Trading has been paused due to critical revenge trading signals. You can resume after 2 hours.',
    }
  }
  if (score >= 50) {
    return {
      action: 'REDUCE_POSITION_SIZE',
      cooldownMinutes: 60,
      message: 'Position sizes are now limited to 50% of your plan. This will be lifted after 1 hour.',
    }
  }
  if (score >= 25) {
    return {
      action: 'WARN',
      cooldownMinutes: 30,
      message: 'Warning: Revenge trading signals detected. Wait 30 minutes before next trade.',
    }
  }
  return {
    action: 'NONE',
    cooldownMinutes: 0,
    message: 'Trading normally.',
  }
}
