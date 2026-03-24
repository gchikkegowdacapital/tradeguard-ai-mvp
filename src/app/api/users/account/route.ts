import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { APIResponse } from '@/types/index'

export async function DELETE(request: NextRequest) {
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

    // Delete all related data
    // Note: In production, you'd want to use database triggers for cascading deletes

    // Delete user's trades
    await supabase
      .from('trades')
      .delete()
      .eq('user_id', user.id)

    // Delete user's positions
    await supabase
      .from('positions')
      .delete()
      .eq('user_id', user.id)

    // Delete user's accounts
    await supabase
      .from('accounts')
      .delete()
      .eq('user_id', user.id)

    // Delete user's alerts
    await supabase
      .from('alerts')
      .delete()
      .eq('user_id', user.id)

    // Delete user's trading plans
    await supabase
      .from('trading_plans')
      .delete()
      .eq('user_id', user.id)

    // Delete user's broker connections
    await supabase
      .from('broker_connections')
      .delete()
      .eq('user_id', user.id)

    // Delete user's trade tags
    await supabase
      .from('trade_tags')
      .delete()
      .eq('user_id', user.id)

    // Delete user's settings
    await supabase
      .from('user_settings')
      .delete()
      .eq('user_id', user.id)

    // Delete user's revenge scores
    await supabase
      .from('revenge_scores')
      .delete()
      .eq('user_id', user.id)

    // Delete user's daily snapshots
    await supabase
      .from('daily_snapshots')
      .delete()
      .eq('user_id', user.id)

    // Delete from users table
    await supabase
      .from('users')
      .delete()
      .eq('id', user.id)

    // Delete auth user
    await supabase.auth.admin.deleteUser(user.id)

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    } as APIResponse<null>)
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete account' } as APIResponse<null>,
      { status: 500 }
    )
  }
}
