import { createClient } from '@/lib/supabase/server'
import { APIResponse } from '@/types'
import { TradingPlanInput, TradingPlanSchema } from '@/lib/schemas/tradingPlan'
import { ZodError } from 'zod'

export async function GET(req: Request): Promise<Response> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' } as APIResponse<null>, {
        status: 401,
      })
    }

    const { data: plan } = await supabase
      .from('trading_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return Response.json({ success: true, data: plan } as APIResponse<unknown>, { status: 200 })
  } catch (error) {
    console.error('GET /api/plans error:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch trading plan' } as APIResponse<null>,
      { status: 500 }
    )
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' } as APIResponse<null>, {
        status: 401,
      })
    }

    const body = await req.json()

    // Validate with Zod
    const validated = TradingPlanSchema.parse(body)

    // Insert or update trading plan
    const { data: plan, error } = await supabase
      .from('trading_plans')
      .insert({
        user_id: user.id,
        title: validated.title,
        description: validated.description,
        max_risk_per_trade: validated.maxRiskPerTrade,
        max_daily_loss: validated.maxDailyLoss,
        max_daily_loss_dollars: validated.maxDailyLossDollars,
        max_total_drawdown: validated.maxTotalDrawdown,
        max_trades_per_day: validated.maxTradesPerDay,
        max_concurrent_positions: validated.maxConcurrentPositions,
        min_risk_reward_ratio: validated.minRiskRewardRatio,
        trading_hours_start: validated.tradingHoursStart,
        trading_hours_end: validated.tradingHoursEnd,
        max_position_size_lots: validated.maxPositionSizeLots,
        allowed_instruments: validated.allowedInstruments,
        cooldown_after_loss_minutes: validated.cooldownAfterLossMinutes,
        max_consecutive_losses_before_pause: validated.maxConsecutiveLossesBeforePause,
        stop_loss_required: validated.stopLossRequired,
        prop_firm_mode: validated.propFirmMode,
        prop_firm_template: validated.propFirmTemplate,
        prop_firm_daily_drawdown: validated.propFirmDailyDrawdown,
        prop_firm_max_drawdown: validated.propFirmMaxDrawdown,
        prop_firm_profit_target: validated.propFirmProfitTarget,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return Response.json(
        { success: false, error: 'Failed to save trading plan' } as APIResponse<null>,
        { status: 500 }
      )
    }

    return Response.json(
      { success: true, data: plan, message: 'Trading plan saved successfully' } as APIResponse<unknown>,
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.errors[0]?.message || 'Validation failed'
      return Response.json({ success: false, error: message } as APIResponse<null>, {
        status: 400,
      })
    }

    console.error('POST /api/plans error:', error)
    return Response.json(
      { success: false, error: 'An error occurred while saving the plan' } as APIResponse<null>,
      { status: 500 }
    )
  }
}
