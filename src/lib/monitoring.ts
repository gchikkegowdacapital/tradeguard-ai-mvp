import { Position, Account, TradingPlan, Trade } from '@/types/index'

export type RuleSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'EMERGENCY'

export interface RuleViolation {
  rule: string
  severity: RuleSeverity
  message: string
  currentValue: number
  threshold: number
}

/**
 * Check if risk per trade exceeds plan limit
 */
export function checkRiskPerTrade(position: Position, plan: TradingPlan): RuleViolation | null {
  // Risk per trade = abs(entry - stop loss) * volume
  // For this check, we estimate based on current P&L exposure
  const riskPercent = Math.abs(position.pnl_percent)

  if (riskPercent > plan.daily_risk_percent) {
    return {
      rule: 'RISK_PER_TRADE',
      severity: riskPercent > plan.daily_risk_percent * 1.5 ? 'CRITICAL' : 'WARNING',
      message: `Position risk (${riskPercent.toFixed(2)}%) exceeds max per trade (${plan.daily_risk_percent}%)`,
      currentValue: riskPercent,
      threshold: plan.daily_risk_percent,
    }
  }

  return null
}

/**
 * Check if position has a stop loss
 */
export function checkStopLossPresence(position: Position, plan: TradingPlan): RuleViolation | null {
  // In this simplified version, we check if stop loss info is available
  // In a real scenario, this would check the actual stop loss from broker data
  const hasStopLoss = position.id.length > 0 // Placeholder check

  if (!hasStopLoss) {
    return {
      rule: 'STOP_LOSS_MISSING',
      severity: 'CRITICAL',
      message: `Position ${position.symbol} is missing a stop loss. Add one immediately.`,
      currentValue: 0,
      threshold: 1,
    }
  }

  return null
}

/**
 * Check if risk/reward ratio meets minimum
 */
export function checkRiskRewardRatio(position: Position, plan: TradingPlan): RuleViolation | null {
  const MIN_RR_RATIO = 1.5

  if (position.risk_reward_ratio < MIN_RR_RATIO) {
    return {
      rule: 'RISK_REWARD_RATIO',
      severity: 'WARNING',
      message: `Position ${position.symbol} R:R ratio (${position.risk_reward_ratio.toFixed(2)}) is below ${MIN_RR_RATIO}`,
      currentValue: position.risk_reward_ratio,
      threshold: MIN_RR_RATIO,
    }
  }

  return null
}

/**
 * Check total exposure across all positions
 */
export function checkTotalExposure(
  positions: Position[],
  account: Account,
  plan: TradingPlan
): RuleViolation | null {
  const totalRisk = positions.reduce((sum, p) => sum + Math.abs(p.pnl), 0)
  const riskPercent = (totalRisk / account.balance) * 100

  if (riskPercent > plan.daily_loss_limit) {
    return {
      rule: 'TOTAL_EXPOSURE',
      severity: riskPercent > plan.daily_loss_limit * 1.5 ? 'EMERGENCY' : 'CRITICAL',
      message: `Total exposure (${riskPercent.toFixed(2)}%) exceeds daily limit (${plan.daily_loss_limit}%)`,
      currentValue: riskPercent,
      threshold: plan.daily_loss_limit,
    }
  }

  if (riskPercent > plan.daily_loss_limit * 0.7) {
    return {
      rule: 'TOTAL_EXPOSURE',
      severity: 'WARNING',
      message: `Total exposure (${riskPercent.toFixed(2)}%) is approaching daily limit (${plan.daily_loss_limit}%)`,
      currentValue: riskPercent,
      threshold: plan.daily_loss_limit,
    }
  }

  return null
}

/**
 * Check if daily trade count exceeds limit
 */
export function checkMaxTrades(todayTrades: Trade[], plan: TradingPlan): RuleViolation | null {
  const tradeCount = todayTrades.length

  if (tradeCount > plan.max_trades_per_day) {
    return {
      rule: 'MAX_TRADES_EXCEEDED',
      severity: 'CRITICAL',
      message: `Trade count (${tradeCount}) exceeds daily limit (${plan.max_trades_per_day})`,
      currentValue: tradeCount,
      threshold: plan.max_trades_per_day,
    }
  }

  if (tradeCount >= plan.max_trades_per_day * 0.8) {
    return {
      rule: 'MAX_TRADES_APPROACHING',
      severity: 'WARNING',
      message: `Trade count (${tradeCount}) is approaching daily limit (${plan.max_trades_per_day})`,
      currentValue: tradeCount,
      threshold: plan.max_trades_per_day,
    }
  }

  return null
}

/**
 * Check if concurrent position count exceeds limit
 */
export function checkMaxConcurrent(positions: Position[], plan: TradingPlan): RuleViolation | null {
  const MAX_CONCURRENT = 5 // Default value, could be added to TradingPlan
  const positionCount = positions.length

  if (positionCount > MAX_CONCURRENT) {
    return {
      rule: 'MAX_CONCURRENT_EXCEEDED',
      severity: 'WARNING',
      message: `Open positions (${positionCount}) exceed recommended limit (${MAX_CONCURRENT})`,
      currentValue: positionCount,
      threshold: MAX_CONCURRENT,
    }
  }

  return null
}

/**
 * Check if current time is within allowed trading hours
 */
export function checkTradingHours(plan: TradingPlan): RuleViolation | null {
  if (!plan.trading_hours_start || !plan.trading_hours_end) {
    return null
  }

  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTime = currentHour * 60 + currentMinute

  const [startHour, startMin] = plan.trading_hours_start.split(':').map(Number)
  const [endHour, endMin] = plan.trading_hours_end.split(':').map(Number)

  const startTime = startHour * 60 + startMin
  const endTime = endHour * 60 + endMin

  if (currentTime < startTime || currentTime > endTime) {
    return {
      rule: 'OUTSIDE_TRADING_HOURS',
      severity: 'INFO',
      message: `Current time (${currentHour}:${String(currentMinute).padStart(2, '0')}) is outside trading hours (${plan.trading_hours_start}-${plan.trading_hours_end})`,
      currentValue: currentTime,
      threshold: startTime,
    }
  }

  return null
}

/**
 * Check margin utilization levels
 */
export function checkMarginUtilization(account: Account): RuleViolation | null {
  if (account.margin_used === 0 || account.margin_used + account.margin_free === 0) {
    return null
  }

  const utilization = (account.margin_used / (account.margin_used + account.margin_free)) * 100

  if (utilization >= 85) {
    return {
      rule: 'MARGIN_CRITICAL',
      severity: 'EMERGENCY',
      message: `Margin utilization (${utilization.toFixed(1)}%) is critical. Risk of liquidation.`,
      currentValue: utilization,
      threshold: 85,
    }
  }

  if (utilization >= 70) {
    return {
      rule: 'MARGIN_HIGH',
      severity: 'CRITICAL',
      message: `Margin utilization (${utilization.toFixed(1)}%) is high. Close some positions.`,
      currentValue: utilization,
      threshold: 70,
    }
  }

  if (utilization >= 50) {
    return {
      rule: 'MARGIN_WARNING',
      severity: 'WARNING',
      message: `Margin utilization (${utilization.toFixed(1)}%) is elevated. Monitor closely.`,
      currentValue: utilization,
      threshold: 50,
    }
  }

  return null
}

/**
 * Check daily P&L against daily loss limit
 */
export function checkDailyLoss(account: Account, previousBalance: number, plan: TradingPlan): RuleViolation | null {
  const dailyPnL = account.balance - previousBalance
  const dailyLossPercent = (Math.abs(dailyPnL) / previousBalance) * 100

  if (dailyPnL < 0 && dailyLossPercent > plan.daily_loss_limit) {
    return {
      rule: 'DAILY_LOSS_EXCEEDED',
      severity: 'CRITICAL',
      message: `Daily loss (${dailyLossPercent.toFixed(2)}%) exceeds limit (${plan.daily_loss_limit}%). Stop trading for today.`,
      currentValue: dailyLossPercent,
      threshold: plan.daily_loss_limit,
    }
  }

  if (dailyPnL < 0 && dailyLossPercent > plan.daily_loss_limit * 0.7) {
    return {
      rule: 'DAILY_LOSS_WARNING',
      severity: 'WARNING',
      message: `Daily loss (${dailyLossPercent.toFixed(2)}%) is approaching limit (${plan.daily_loss_limit}%)`,
      currentValue: dailyLossPercent,
      threshold: plan.daily_loss_limit,
    }
  }

  return null
}

/**
 * Check account drawdown against max allowed
 */
export function checkDrawdown(
  account: Account,
  accountPeak: number,
  plan: TradingPlan
): RuleViolation | null {
  const MAX_DRAWDOWN = 10 // Default 10%, could be added to TradingPlan
  const drawdownPercent = ((accountPeak - account.equity) / accountPeak) * 100

  if (drawdownPercent > MAX_DRAWDOWN) {
    return {
      rule: 'DRAWDOWN_EXCEEDED',
      severity: 'CRITICAL',
      message: `Account drawdown (${drawdownPercent.toFixed(2)}%) exceeds maximum (${MAX_DRAWDOWN}%). Consider closing positions.`,
      currentValue: drawdownPercent,
      threshold: MAX_DRAWDOWN,
    }
  }

  if (drawdownPercent > MAX_DRAWDOWN * 0.7) {
    return {
      rule: 'DRAWDOWN_WARNING',
      severity: 'WARNING',
      message: `Account drawdown (${drawdownPercent.toFixed(2)}%) is approaching maximum (${MAX_DRAWDOWN}%)`,
      currentValue: drawdownPercent,
      threshold: MAX_DRAWDOWN,
    }
  }

  return null
}

/**
 * Run all rule checks and return violations
 */
export function checkAllRules(
  positions: Position[],
  account: Account,
  plan: TradingPlan,
  todayTrades: Trade[],
  previousBalance?: number,
  accountPeak?: number
): RuleViolation[] {
  const violations: RuleViolation[] = []

  // Check each position
  positions.forEach((position) => {
    const riskViolation = checkRiskPerTrade(position, plan)
    if (riskViolation) violations.push(riskViolation)

    const rrViolation = checkRiskRewardRatio(position, plan)
    if (rrViolation) violations.push(rrViolation)
  })

  // Check total exposure
  const exposureViolation = checkTotalExposure(positions, account, plan)
  if (exposureViolation) violations.push(exposureViolation)

  // Check max trades
  const maxTradesViolation = checkMaxTrades(todayTrades, plan)
  if (maxTradesViolation) violations.push(maxTradesViolation)

  // Check max concurrent
  const maxConcurrentViolation = checkMaxConcurrent(positions, plan)
  if (maxConcurrentViolation) violations.push(maxConcurrentViolation)

  // Check trading hours
  const tradingHoursViolation = checkTradingHours(plan)
  if (tradingHoursViolation) violations.push(tradingHoursViolation)

  // Check margin
  const marginViolation = checkMarginUtilization(account)
  if (marginViolation) violations.push(marginViolation)

  // Check daily loss
  if (previousBalance) {
    const dailyLossViolation = checkDailyLoss(account, previousBalance, plan)
    if (dailyLossViolation) violations.push(dailyLossViolation)
  }

  // Check drawdown
  if (accountPeak) {
    const drawdownViolation = checkDrawdown(account, accountPeak, plan)
    if (drawdownViolation) violations.push(drawdownViolation)
  }

  return violations
}
