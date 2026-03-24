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

    const { data: connections } = await supabase
      .from('broker_connections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return Response.json(
      { success: true, data: connections || [] } as APIResponse<unknown>,
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/brokers error:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch broker connections' } as APIResponse<null>,
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

    const { brokerType, accountId, apiToken } = await req.json()

    if (!brokerType || !accountId || !apiToken) {
      return Response.json(
        { success: false, error: 'Missing required fields' } as APIResponse<null>,
        { status: 400 }
      )
    }

    // In a real app, you'd encrypt the API token before storing
    const { data: connection, error } = await supabase
      .from('broker_connections')
      .insert({
        user_id: user.id,
        broker_type: brokerType,
        account_number: accountId,
        api_key: apiToken, // This should be encrypted in production
        is_connected: true,
        is_demo: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return Response.json(
        { success: false, error: 'Failed to save broker connection' } as APIResponse<null>,
        { status: 500 }
      )
    }

    return Response.json(
      { success: true, data: connection, message: 'Broker connection saved' } as APIResponse<unknown>,
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/brokers error:', error)
    return Response.json(
      { success: false, error: 'An error occurred' } as APIResponse<null>,
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request): Promise<Response> {
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

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json(
        { success: false, error: 'Connection ID is required' } as APIResponse<null>,
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('broker_connections')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Database error:', error)
      return Response.json(
        { success: false, error: 'Failed to delete connection' } as APIResponse<null>,
        { status: 500 }
      )
    }

    return Response.json(
      { success: true, message: 'Connection deleted' } as APIResponse<null>,
      { status: 200 }
    )
  } catch (error) {
    console.error('DELETE /api/brokers error:', error)
    return Response.json(
      { success: false, error: 'An error occurred' } as APIResponse<null>,
      { status: 500 }
    )
  }
}
