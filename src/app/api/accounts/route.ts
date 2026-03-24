import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { APIResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as APIResponse<null>,
        { status: 401 }
      )
    }

    const { data: accounts, error } = await supabase
      .from('accounts')
      .select(`
        *,
        broker_connection:broker_connection_id(*)
      `)
      .eq('user_id', user.id)

    if (error) throw error

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No connected broker',
      } as APIResponse<null>)
    }

    const account = accounts[0]

    // Calculate additional metrics
    const dailyPnL = (account.equity || 0) - (account.balance || 0)
    const dailyPnLPercent = account.balance ? (dailyPnL / account.balance) * 100 : 0
    const marginLevel = account.margin_used && account.margin_free
      ? (account.margin_used / (account.margin_used + account.margin_free)) * 100
      : 0

    // In a real app, you'd fetch open PnL from MetaApi
    const openPnL = dailyPnL

    // Get historical peak for drawdown calculation
    // For MVP, using a static calculation
    const drawdownPercent = 0

    return NextResponse.json({
      success: true,
      data: {
        balance: account.balance || 0,
        equity: account.equity || 0,
        openPnL,
        marginLevel,
        dailyPnL,
        dailyPnLPercent,
        drawdownPercent,
      },
    } as APIResponse<any>)
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch accounts' } as APIResponse<null>,
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as APIResponse<null>,
        { status: 401 }
      )
    }

    const body = await request.json()

    const { data, error } = await supabase.from('accounts').insert({
      user_id: user.id,
      broker_connection_id: body.broker_connection_id,
      balance: body.balance || 0,
      equity: body.equity || 0,
      margin_used: body.margin_used || 0,
      margin_free: body.margin_free || 0,
    })

    if (error) throw error

    return NextResponse.json(
      {
        success: true,
        data,
        message: 'Account created successfully',
      } as APIResponse<any>,
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating account:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create account' } as APIResponse<null>,
      { status: 500 }
    )
  }
}
