import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { APIResponse } from '@/types/index'

interface TradeTagsRequest {
  emotional_state?: string
  setup_quality?: string
  plan_compliance?: string
  notes?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const tradeId = params.id

    // Verify trade belongs to user
    const { data: trade } = await supabase
      .from('trades')
      .select('id')
      .eq('id', tradeId)
      .eq('user_id', user.id)
      .single()

    if (!trade) {
      return NextResponse.json(
        { success: false, error: 'Trade not found' } as APIResponse<null>,
        { status: 404 }
      )
    }

    // Get tags
    const { data: tags, error } = await supabase
      .from('trade_tags')
      .select('*')
      .eq('trade_id', tradeId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: tags || null,
    } as APIResponse<any>)
  } catch (error) {
    console.error('Error fetching trade tags:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tags' } as APIResponse<null>,
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const tradeId = params.id
    const body: TradeTagsRequest = await request.json()

    // Verify trade belongs to user and check 30-min window
    const { data: trade } = await supabase
      .from('trades')
      .select('entry_time, exit_time')
      .eq('id', tradeId)
      .eq('user_id', user.id)
      .single()

    if (!trade) {
      return NextResponse.json(
        { success: false, error: 'Trade not found' } as APIResponse<null>,
        { status: 404 }
      )
    }

    // Check if still within 30-min window of trade entry
    const tradeTime = new Date(trade.entry_time).getTime()
    const now = new Date().getTime()
    const diffMinutes = (now - tradeTime) / (1000 * 60)

    if (diffMinutes > 30) {
      return NextResponse.json(
        { success: false, error: 'Can only tag trades within 30 minutes of entry' } as APIResponse<null>,
        { status: 400 }
      )
    }

    // Check if tags already exist
    const { data: existingTags } = await supabase
      .from('trade_tags')
      .select('id')
      .eq('trade_id', tradeId)
      .single()

    let result
    if (existingTags) {
      // Update existing tags
      const { data, error } = await supabase
        .from('trade_tags')
        .update({
          emotional_state: body.emotional_state,
          setup_quality: body.setup_quality,
          plan_compliance: body.plan_compliance,
          notes: body.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('trade_id', tradeId)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new tags
      const { data, error } = await supabase
        .from('trade_tags')
        .insert({
          trade_id: tradeId,
          user_id: user.id,
          emotional_state: body.emotional_state,
          setup_quality: body.setup_quality,
          plan_compliance: body.plan_compliance,
          notes: body.notes,
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: 'Tags saved successfully',
      } as APIResponse<any>,
      { status: 201 }
    )
  } catch (error) {
    console.error('Error saving trade tags:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save tags' } as APIResponse<null>,
      { status: 500 }
    )
  }
}
