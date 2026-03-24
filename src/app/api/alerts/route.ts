import { createClient } from '@/lib/supabase/server'
import { APIResponse } from '@/types'
import { AlertLevel } from '@/types'

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

    const { data: alerts } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', user.id)
      .eq('resolved', false)
      .order('created_at', { ascending: false })
      .limit(10)

    return Response.json(
      { success: true, data: alerts || [] } as APIResponse<unknown>,
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/alerts error:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch alerts' } as APIResponse<null>,
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

    const { level, title, message, actionRequired } = await req.json()

    if (!level || !title || !message) {
      return Response.json(
        { success: false, error: 'Missing required fields' } as APIResponse<null>,
        { status: 400 }
      )
    }

    const { data: alert, error } = await supabase
      .from('alerts')
      .insert({
        user_id: user.id,
        level: level as AlertLevel,
        title,
        message,
        action_required: actionRequired || false,
        resolved: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return Response.json(
        { success: false, error: 'Failed to create alert' } as APIResponse<null>,
        { status: 500 }
      )
    }

    return Response.json(
      { success: true, data: alert, message: 'Alert created' } as APIResponse<unknown>,
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/alerts error:', error)
    return Response.json(
      { success: false, error: 'An error occurred' } as APIResponse<null>,
      { status: 500 }
    )
  }
}
