import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { User, UserTier, Trade, Position, TradingPlan, Alert } from '@/types/index'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface ChatRequest {
  message: string
  conversationId?: string
}

interface ConversationWithMessages {
  id: string
  user_id: string
  created_at: string
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    created_at?: string
  }>
}

/**
 * Get user's query limit based on tier
 */
function getQueryLimit(tier: UserTier): number {
  const limits: Record<UserTier, number> = {
    [UserTier.GUARDIAN]: 5,
    [UserTier.SENTINEL]: 25,
    [UserTier.FOUNDER]: 1000,
    [UserTier.FREE]: 0,
  }
  return limits[tier] || 0
}

/**
 * Check if user has exceeded daily query limit
 */
async function checkQueryLimit(
  supabase: any,
  userId: string,
  tier: UserTier
): Promise<{ allowed: boolean; remaining: number }> {
  const limit = getQueryLimit(tier)

  if (limit === 0) {
    return { allowed: false, remaining: 0 }
  }

  // Get today's query count
  const today = new Date().toISOString().split('T')[0]
  const { count } = await supabase
    .from('ai_conversations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('date', today)

  const remaining = Math.max(0, limit - (count || 0))
  return { allowed: remaining > 0, remaining }
}

/**
 * Assemble user context from database
 */
async function assembleUserContext(supabase: any, userId: string): Promise<string> {
  // Fetch trading plan
  const { data: planData } = await supabase
    .from('trading_plans')
    .select('*')
    .eq('user_id', userId)
    .single()

  // Fetch recent trades
  const { data: tradesData } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .order('entry_time', { ascending: false })
    .limit(10)

  // Fetch current positions
  const { data: positionsData } = await supabase
    .from('positions')
    .select('*')
    .eq('user_id', userId)

  // Fetch recent alerts
  const { data: alertsData } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch revenge score
  const today = new Date().toISOString().split('T')[0]
  const { data: revengeData } = await supabase
    .from('revenge_scores')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  let context = 'USER TRADING CONTEXT:\n\n'

  if (planData) {
    context += `TRADING PLAN:\n`
    context += `- Daily Risk: ${planData.daily_risk_percent}%\n`
    context += `- Daily Loss Limit: ${planData.daily_loss_limit}%\n`
    context += `- Max Trades/Day: ${planData.max_trades_per_day}\n`
    context += `- Trading Hours: ${planData.trading_hours_start}-${planData.trading_hours_end}\n`
    context += `- Preferred Pairs: ${planData.preferred_pairs.join(', ')}\n`
    context += `- Setup Rules: ${planData.setup_rules}\n\n`
  }

  if (tradesData && tradesData.length > 0) {
    context += `RECENT TRADES (last 10):\n`
    tradesData.forEach((trade: Trade) => {
      const duration =
        trade.exit_time && trade.entry_time
          ? Math.floor(
              (new Date(trade.exit_time).getTime() - new Date(trade.entry_time).getTime()) / (1000 * 60)
            )
          : 'ongoing'
      context += `- ${trade.symbol} ${trade.direction} @ ${trade.entry_price} → ${trade.exit_price || 'N/A'} (P&L: ${trade.pnl.toFixed(2)}, ${trade.pnl_percent.toFixed(2)}%) [${duration}min]\n`
    })
    context += '\n'
  }

  if (positionsData && positionsData.length > 0) {
    context += `OPEN POSITIONS (${positionsData.length}):\n`
    positionsData.forEach((pos: Position) => {
      context += `- ${pos.symbol} ${pos.direction} @ ${pos.entry_price} (Current: ${pos.current_price}, P&L: ${pos.pnl.toFixed(2)}, ${pos.pnl_percent.toFixed(2)}%)\n`
    })
    context += '\n'
  } else {
    context += `NO OPEN POSITIONS\n\n`
  }

  if (alertsData && alertsData.length > 0) {
    context += `RECENT ALERTS:\n`
    alertsData.forEach((alert: Alert) => {
      context += `- [${alert.level}] ${alert.title}: ${alert.message}\n`
    })
    context += '\n'
  }

  if (revengeData) {
    context += `TODAY'S TRADING BEHAVIOR:\n`
    context += `- Revenge Score: ${revengeData.score}/100\n`
    context += `- Trades: ${revengeData.trades_count}\n`
    context += `- Win Rate: ${revengeData.winning_trades}/${revengeData.trades_count}\n`
    context += `- Avg Win: ${revengeData.average_win.toFixed(2)}\n`
    context += `- Avg Loss: ${revengeData.average_loss.toFixed(2)}\n`
  }

  return context
}

/**
 * Generate system prompt for Claude
 */
function getSystemPrompt(userContext: string): string {
  return `You are VenusAI, a personal trading risk coach for TradeGuard AI. Your role is to help traders manage risk, avoid emotional trading, and stay disciplined.

CRITICAL RULES:
- NEVER recommend specific trades (buy/sell/hold)
- NEVER predict prices or market direction
- NEVER provide financial advice beyond risk management and emotional discipline
- Always reference the user's own trading plan and recent data
- Be direct, concise, and supportive
- If the user is showing revenge trading patterns, be firm but compassionate
- Celebrate discipline and plan adherence
- Challenge rule violations with empathy

RESPONSE GUIDELINES:
- Keep responses to 3-4 sentences max (except for detailed explanations)
- End every response with a relevant risk insight
- Include this disclaimer only if discussing trading positions: "This is educational guidance, not financial advice."
- Use the user's trading data to personalize your response

${userContext}`
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user details
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check query limit
    const { allowed, remaining } = await checkQueryLimit(supabase, user.id, userData.tier)

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Query limit exceeded',
          message: userData.tier === UserTier.FREE ? 'Upgrade to unlock VenusAI' : 'Daily query limit reached',
          tier: userData.tier,
          remaining: 0,
        },
        { status: 429 }
      )
    }

    const { message, conversationId }: ChatRequest = await request.json()

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Get conversation history or create new
    let conversation: ConversationWithMessages | null = null

    if (conversationId) {
      const { data } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single()

      conversation = data
    }

    // Assemble context
    const userContext = await assembleUserContext(supabase, user.id)
    const systemPrompt = getSystemPrompt(userContext)

    // Build messages array for Claude
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = []

    if (conversation?.messages) {
      messages.push(...conversation.messages)
    }

    messages.push({
      role: 'user',
      content: message,
    })

    // Create a ReadableStream for streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messageStream = await client.messages.stream({
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 500,
            system: systemPrompt,
            messages: messages,
          })

          let fullResponse = ''

          for await (const event of messageStream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const text = event.delta.text
              fullResponse += text
              controller.enqueue(new TextEncoder().encode(text))
            }
          }

          // Save conversation to Supabase
          if (conversation) {
            // Update existing conversation
            await supabase
              .from('ai_conversations')
              .update({
                messages: [...messages, { role: 'assistant', content: fullResponse }],
              })
              .eq('id', conversationId)
          } else {
            // Create new conversation
            const newId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            await supabase.from('ai_conversations').insert({
              id: newId,
              user_id: user.id,
              messages: [
                { role: 'user', content: message },
                { role: 'assistant', content: fullResponse },
              ],
              date: new Date().toISOString().split('T')[0],
            })
          }

          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        }
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Remaining-Queries': remaining.toString(),
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
