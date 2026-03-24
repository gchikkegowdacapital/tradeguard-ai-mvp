import { createClient } from '@/lib/supabase/server'
import { APIResponse } from '@/types'

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

    // Fetch open positions (where exit_time is null)
    const { data: positions } = await supabase
      .from('positions')
      .select('*')
      .eq('user_id', user.id)
      .is('exit_time', null)
      .order('opened_at', { ascending: false })

    return Response.json(
      { success: true, data: positions || [] } as APIResponse<unknown>,
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/positions error:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch positions' } as APIResponse<null>,
      { status: 500 }
    )
  }
}
