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

    const { data: brokers, error: brokersError } = await supabase
      .from('broker_connections')
      .select('*')
      .eq('is_connected', true)

    if (brokersError) throw brokersError

    let synced = 0
    let failed = 0

    for (const broker of brokers || []) {
      try {
        const { data: accounts, error: accountsError } = await supabase
          .from('accounts')
          .select('*')
          .eq('broker_connection_id', broker.id)

        if (accountsError) throw accountsError

        for (const account of accounts || []) {
          await supabase
            .from('accounts')
            .update({
              last_updated: new Date().toISOString(),
            })
            .eq('id', account.id)
        }

        synced++
      } catch (error) {
        console.error(`Error syncing broker ${broker.id}:`, error)
        failed++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${synced} brokers, ${failed} failed`,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { success: false, error: 'Cron job failed' },
      { status: 500 }
    )
  }
}
