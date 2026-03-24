import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 60

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*')

    if (accountsError) throw accountsError

    let created = 0
    let failed = 0

    for (const account of accounts || []) {
      try {
        const { data: todaysTrades } = await supabase
          .from('trades')
          .select('*')
          .eq('account_id', account.id)
          .gte('entry_time', `${today}T00:00:00`)
          .lt('entry_time', `${today}T23:59:59`)

        const trades = todaysTrades || []
        const winningTrades = trades.filter((t) => t.pnl > 0)
        const losingTrades = trades.filter((t) => t.pnl < 0)
        const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
        const totalPnlPercent = account.balance ? (totalPnl / account.balance) * 100 : 0

        const snapshot = {
          user_id: account.user_id,
          account_id: account.id,
          date: today,
          opening_balance: account.balance,
          closing_balance: account.balance + totalPnl,
          daily_pnl: totalPnl,
          daily_pnl_percent: totalPnlPercent,
          trades_count: trades.length,
          winning_trades: winningTrades.length,
          losing_trades: losingTrades.length,
          win_rate: trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
          largest_win: winningTrades.length > 0 ? Math.max(...winningTrades.map((t) => t.pnl)) : 0,
          largest_loss: losingTrades.length > 0 ? Math.min(...losingTrades.map((t) => t.pnl)) : 0,
        }

        const { error } = await supabase
          .from('daily_snapshots')
          .upsert(snapshot, { onConflict: 'user_id,account_id,date' })

        if (error) throw error
        created++
      } catch (error) {
        console.error(`Error creating snapshot for account ${account.id}:`, error)
        failed++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${created} snapshots, ${failed} failed`,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { success: false, error: 'Cron job failed' },
      { status: 500 }
    )
  }
}
