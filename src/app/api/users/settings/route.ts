import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { APIResponse } from '@/types/index'

interface UserSettings {
  timezone: string
  emailAlerts: boolean
  alertLevelThreshold: string
}

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

    // Get user settings (default values if not found)
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    const settings = data || {
      timezone: 'UTC',
      emailAlerts: true,
      alertLevelThreshold: 'warning',
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' } as APIResponse<null>,
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

    const body: UserSettings = await request.json()

    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', user.id)
      .single()

    let result
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('user_settings')
        .update({
          timezone: body.timezone,
          emailAlerts: body.emailAlerts,
          alertLevelThreshold: body.alertLevelThreshold,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          timezone: body.timezone,
          emailAlerts: body.emailAlerts,
          alertLevelThreshold: body.alertLevelThreshold,
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Settings saved successfully',
    } as APIResponse<any>)
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save settings' } as APIResponse<null>,
      { status: 500 }
    )
  }
}
