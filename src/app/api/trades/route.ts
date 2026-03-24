import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateTradeInput, APIResponse } from '@/types'
import { calculatePnL, calculatePnLPercent } from '@/lib/utils'

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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const symbol = searchParams.get('symbol')
    const direction = searchParams.get('direction')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const pnlDirection = searchParams.get('pnlDirection')

    // Build base query
    let query = supabase
      .from('trades')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('entry_time', { ascending: false })

    // Apply filters
    if (symbol) {
      query = query.eq('symbol', symbol.toUpperCase())
    }

    if (direction) {
      query = query.eq('direction', direction)
    }

    if (dateFrom) {
      query = query.gte('entry_time', dateFrom + 'T00:00:00')
    }

    if (dateTo) {
      query = query.lte('entry_time', dateTo + 'T23:59:59')
    }

    // Execute query
    const { data, count, error } = await query

    if (error) throw error

    // Filter by P&L direction in memory
    let filtered = data || []
    if (pnlDirection === 'profit') {
      filtered = filtered.filter((t: any) => t.pnl > 0)
    } else if (pnlDirection === 'loss') {
      filtered = filtered.filter((t: any) => t.pnl < 0)
    }

    // Apply pagination
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedTrades = filtered.slice(start, end)

    // Fetch trade tags for these trades
    const tradeIds = paginatedTrades.map((t: any) => t.id)
    const { data: tagsData } = await supabase
      .from('trade_tags')
      .select('*')
      .in('trade_id', tradeIds)

    // Map tags to trades
    const tradesWithTags = paginatedTrades.map((trade: any) => {
      const tags = tagsData?.find((t: any) => t.trade_id === trade.id)
      return tags ? { ...trade, tags } : trade
    })

    return NextResponse.json({
      success: true,
      data: tradesWithTags,
      total: filtered.length,
      page,
      limit,
      pages: Math.ceil(filtered.length / limit),
    } as APIResponse<any>)
  } catch (error) {
    console.error('Error fetching trades:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trades' } as APIResponse<null>,
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

    const body = (await request.json()) as CreateTradeInput & { account_id: string }

    const pnl = body.exit_price
      ? calculatePnL(
          body.entry_price,
          body.exit_price,
          body.volume,
          body.direction === 'long'
        )
      : 0

    const pnlPercent = body.exit_price
      ? calculatePnLPercent(body.entry_price, body.exit_price, body.direction === 'long')
      : 0

    const { data, error } = await supabase.from('trades').insert({
      user_id: user.id,
      account_id: body.account_id,
      symbol: body.symbol,
      direction: body.direction,
      entry_price: body.entry_price,
      exit_price: body.exit_price,
      volume: body.volume,
      pnl,
      pnl_percent: pnlPercent,
      setup_quality: body.setup_quality,
      plan_compliance: body.plan_compliance,
      emotional_state: body.emotional_state,
      entry_time: new Date().toISOString(),
      notes: body.notes,
    })

    if (error) throw error

    return NextResponse.json(
      {
        success: true,
        data,
        message: 'Trade created successfully',
      } as APIResponse<any>,
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating trade:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create trade' } as APIResponse<null>,
      { status: 500 }
    )
  }
}
