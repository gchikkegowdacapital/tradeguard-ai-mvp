import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { APIResponse, UserTier } from '@/types/index'
import { checkAllRules } from '@/lib/monitoring'
import { analyzeTradeSequence } from '@/lib/revenge-detection'
import { sendAlertEmail } from '@/lib/email'

/**
 * Cron endpoint for monitoring positions and sending alerts
 * Called every 30 seconds by Vercel Cron for paid users
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = request.headers.get('x-vercel-cron-secret')
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Get all paid users (Guardian, Sentinel, Founder)
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .in('tier', [UserTier.GUARDIAN, UserTier.SENTINEL, UserTier.FOUNDER])

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users to monitor',
        checkedUsers: 0,
        alertsSent: 0,
      })
    }

    let alertsSent = 0

    // Process each user
    for (const user of users) {
      try {
        // Fetch user's trading plan
        const { data: plan } = await supabase
          .from('trading_plans')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (!plan) continue

        // Fetch user's account
        const { data: account } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (!account) continue

        // Fetch open positions
        const { data: positions } = await supabase
          .from('positions')
          .select('*')
          .eq('user_id', user.id)

        // Fetch today's trades
        const today = new Date().toISOString().split('T')[0]
        const { data: todayTrades } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.id)
          .gte('entry_time', today + 'T00:00:00')

        // Get user settings
        const { data: settings } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single()

        const emailAlertsEnabled = settings?.emailAlerts !== false
        const alertThreshold = settings?.alertLevelThreshold || 'warning'

        // Check all rules
        const violations = checkAllRules(
          positions || [],
          account,
          plan,
          todayTrades || []
        )

        // Filter violations by alert threshold
        const alertViolations = violations.filter((v) => {
          if (alertThreshold === 'warning') {
            return v.severity === 'WARNING' || v.severity === 'CRITICAL' || v.severity === 'EMERGENCY'
          }
          if (alertThreshold === 'critical') {
            return v.severity === 'CRITICAL' || v.severity === 'EMERGENCY'
          }
          return true // 'info' - send all
        })

        // Send email alerts for violations
        if (emailAlertsEnabled) {
          for (const violation of alertViolations) {
            // Check if alert was already sent for this rule today
            const { data: existingAlert } = await supabase
              .from('alerts')
              .select('id')
              .eq('user_id', user.id)
              .eq('rule', violation.rule)
              .gte('created_at', today + 'T00:00:00')
              .single()

            if (!existingAlert) {
              // Send email
              await sendAlertEmail(user, violation)

              // Create alert record
              await supabase.from('alerts').insert({
                user_id: user.id,
                rule: violation.rule,
                severity: violation.severity,
                title: violation.rule,
                message: violation.message,
                action_required: violation.severity === 'CRITICAL' || violation.severity === 'EMERGENCY',
              })

              alertsSent++
            }
          }
        }

        // Check revenge trading signals
        if (todayTrades && todayTrades.length > 0) {
          const revengeAnalysis = analyzeTradeSequence(todayTrades, plan)

          // Store revenge score
          const { data: existingScore } = await supabase
            .from('revenge_scores')
            .select('id')
            .eq('user_id', user.id)
            .eq('date', today)
            .single()

          const winningTrades = todayTrades.filter((t: any) => t.pnl > 0).length
          const avgWin =
            todayTrades.filter((t: any) => t.pnl > 0).reduce((sum: number, t: any) => sum + t.pnl, 0) /
            Math.max(winningTrades, 1)
          const avgLoss =
            Math.abs(todayTrades.filter((t: any) => t.pnl < 0).reduce((sum: number, t: any) => sum + t.pnl, 0)) /
            Math.max(todayTrades.length - winningTrades, 1)

          if (existingScore) {
            await supabase
              .from('revenge_scores')
              .update({
                score: revengeAnalysis.score,
                trades_count: todayTrades.length,
                winning_trades: winningTrades,
                losing_trades: todayTrades.length - winningTrades,
                average_win: avgWin,
                average_loss: avgLoss,
              })
              .eq('id', existingScore.id)
          } else {
            await supabase.from('revenge_scores').insert({
              user_id: user.id,
              date: today,
              score: revengeAnalysis.score,
              trades_count: todayTrades.length,
              winning_trades: winningTrades,
              losing_trades: todayTrades.length - winningTrades,
              average_win: avgWin,
              average_loss: avgLoss,
            })
          }
        }
      } catch (userError) {
        console.error(`Error processing user ${user.id}:`, userError)
        // Continue with next user
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Monitoring completed',
      checkedUsers: users.length,
      alertsSent,
    })
  } catch (error) {
    console.error('Monitoring error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Monitoring failed',
      },
      { status: 500 }
    )
  }
}
