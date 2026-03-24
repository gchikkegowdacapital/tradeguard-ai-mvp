import { z } from 'zod'

export const TradingPlanSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  maxRiskPerTrade: z.number().min(0.1).max(5).default(1),
  maxDailyLoss: z.number().min(1).max(10).default(3),
  maxDailyLossDollars: z.number().min(0).default(0),
  maxTotalDrawdown: z.number().min(5).max(30).default(10),
  maxTradesPerDay: z.number().min(1).max(50).default(5),
  maxConcurrentPositions: z.number().min(1).max(20).default(3),
  minRiskRewardRatio: z.enum(['1:1', '1:1.5', '1:2', '1:3']).default('1:1.5'),
  tradingHoursStart: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').default('09:00'),
  tradingHoursEnd: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').default('17:00'),
  maxPositionSizeLots: z.number().min(0.01).default(1),
  allowedInstruments: z.array(z.string()).min(1, 'Select at least one instrument').default(['EUR/USD']),
  cooldownAfterLossMinutes: z.number().min(0).max(120).default(15),
  maxConsecutiveLossesBeforePause: z.number().min(1).max(10).default(3),
  stopLossRequired: z.boolean().default(true),
  propFirmMode: z.boolean().default(false),
  propFirmTemplate: z.enum(['FTMO', 'MyForexFunds', 'TheFundedTrader', 'Custom']).optional(),
  propFirmDailyDrawdown: z.number().min(0).optional(),
  propFirmMaxDrawdown: z.number().min(0).optional(),
  propFirmProfitTarget: z.number().min(0).optional(),
})

export type TradingPlanInput = z.infer<typeof TradingPlanSchema>

export const INSTRUMENTS = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'USD/CHF',
  'AUD/USD',
  'USD/CAD',
  'NZD/USD',
  'EUR/GBP',
  'EUR/JPY',
  'GBP/JPY',
  'GOLD',
  'CRUDE OIL',
  'BTC/USD',
  'SPY',
  'QQQ',
]

export const PROP_FIRM_TEMPLATES = {
  FTMO: {
    dailyDrawdown: 5,
    maxDrawdown: 10,
    profitTarget: 10,
  },
  MyForexFunds: {
    dailyDrawdown: 5,
    maxDrawdown: 12,
    profitTarget: 8,
  },
  TheFundedTrader: {
    dailyDrawdown: 4,
    maxDrawdown: 8,
    profitTarget: 10,
  },
}
