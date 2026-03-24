import { APIResponse } from '@/types'

export async function POST(req: Request): Promise<Response> {
  try {
    const { brokerType, accountId, apiToken } = await req.json()

    if (!brokerType || !accountId || !apiToken) {
      return Response.json(
        { success: false, error: 'Missing required fields' } as APIResponse<null>,
        { status: 400 }
      )
    }

    // In a real app, this would test the actual MetaApi connection
    // For MVP, we'll simulate a successful test
    const isValid = accountId.length > 0 && apiToken.length > 10

    if (!isValid) {
      return Response.json(
        { success: false, error: 'Invalid account ID or API token format' } as APIResponse<null>,
        { status: 400 }
      )
    }

    // Simulate MetaApi connection test
    // In production, you would call the MetaApi SDK here
    return Response.json(
      {
        success: true,
        data: {
          connected: true,
          accountId,
          brokerType,
          lastCheck: new Date().toISOString(),
        },
        message: 'Connection test successful',
      } as APIResponse<unknown>,
      { status: 200 }
    )
  } catch (error) {
    console.error('POST /api/brokers/test error:', error)
    return Response.json(
      { success: false, error: 'An error occurred while testing the connection' } as APIResponse<null>,
      { status: 500 }
    )
  }
}
