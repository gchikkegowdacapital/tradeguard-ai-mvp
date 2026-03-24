'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { AlertLevel } from '@/types/index'
import { cn } from '@/lib/utils'

interface UserSettings {
  timezone: string
  emailAlerts: boolean
  alertLevelThreshold: AlertLevel
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings>({
    timezone: 'UTC',
    emailAlerts: true,
    alertLevelThreshold: AlertLevel.WARNING,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users/settings')
      if (!response.ok) throw new Error('Failed to fetch settings')

      const data = await response.json()
      setSettings(data)
    } catch (err) {
      console.error('Error fetching settings:', err)
      setMessage({ type: 'error', text: 'Failed to load settings' })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      setMessage(null)

      const response = await fetch('/api/users/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!response.ok) throw new Error('Failed to save settings')

      setMessage({ type: 'success', text: 'Settings saved successfully' })

      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      console.error('Error saving settings:', err)
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true)
      setMessage(null)

      const response = await fetch('/api/users/account', {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete account')

      setMessage({ type: 'success', text: 'Account deleted. Redirecting...' })

      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } catch (err) {
      console.error('Error deleting account:', err)
      setMessage({ type: 'error', text: 'Failed to delete account' })
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-slate-600">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your profile, preferences, and subscription</p>
      </div>

      {message && (
        <div
          className={cn(
            'rounded-lg border px-4 py-3 mb-6',
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          )}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Profile</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1">Full Name</label>
            <input
              type="text"
              value={user?.full_name || ''}
              disabled
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-600 bg-slate-50"
            />
            <p className="text-xs text-slate-500 mt-1">Update via your account provider</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-600 bg-slate-50"
            />
            <p className="text-xs text-slate-500 mt-1">Read-only</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings((prev) => ({ ...prev, timezone: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Central European (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Asia/Singapore">Singapore (SGT)</option>
              <option value="Australia/Sydney">Sydney (AEDT)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Notification Preferences</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Email Alerts</h3>
              <p className="text-sm text-slate-600 mt-0.5">Receive email notifications for rule violations</p>
            </div>
            <button
              onClick={() => setSettings((prev) => ({ ...prev, emailAlerts: !prev.emailAlerts }))}
              className={cn(
                'relative inline-flex h-7 w-12 items-center rounded-full transition-colors',
                settings.emailAlerts ? 'bg-purple-600' : 'bg-slate-300'
              )}
            >
              <span
                className={cn(
                  'inline-block h-5 w-5 transform rounded-full bg-white transition-transform',
                  settings.emailAlerts ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Alert Level Threshold</label>
            <div className="space-y-2">
              {[AlertLevel.INFO, AlertLevel.WARNING, AlertLevel.CRITICAL].map((level) => (
                <label key={level} className="flex items-center">
                  <input
                    type="radio"
                    name="alertLevel"
                    value={level}
                    checked={settings.alertLevelThreshold === level}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        alertLevelThreshold: e.target.value as AlertLevel,
                      }))
                    }
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-slate-900 capitalize">
                    {level === AlertLevel.INFO && 'All Alerts (Info, Warning, Critical)'}
                    {level === AlertLevel.WARNING && 'Warning & Critical Only'}
                    {level === AlertLevel.CRITICAL && 'Critical Only'}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Choose which alert severities you want to receive emails for
            </p>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Subscription</h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-600 mb-2">Current Plan</p>
            <p className="text-2xl font-bold text-slate-900 capitalize">{user?.tier || 'Free'}</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="text-sm text-slate-600 mb-3">
              {user?.tier === 'free' &&
                'Upgrade to unlock VenusAI chat, advanced monitoring, and priority support.'}
              {user?.tier === 'guardian' &&
                'You have access to 5 daily VenusAI queries and core monitoring features.'}
              {user?.tier === 'sentinel' &&
                'You have access to 25 daily VenusAI queries, advanced monitoring, and priority support.'}
              {user?.tier === 'founder' &&
                'You have unlimited access to all features. Thank you for your support!'}
            </p>

            <div className="flex gap-3">
              {user?.tier !== 'free' && (
                <a
                  href={process.env.NEXT_PUBLIC_STRIPE_PORTAL_URL || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
                >
                  Manage Billing
                </a>
              )}

              {user?.tier === 'free' && (
                <a
                  href="/pricing"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  View Plans
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-red-50 rounded-lg border border-red-200 p-6">
        <h2 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h2>

        <div>
          <p className="text-sm text-red-800 mb-4">
            Deleting your account is permanent and cannot be undone. All your data will be deleted.
          </p>

          {showDeleteConfirm ? (
            <div className="bg-white rounded-lg border border-red-200 p-4 mb-4">
              <h3 className="font-semibold text-slate-900 mb-3">Delete Account?</h3>
              <p className="text-sm text-slate-600 mb-4">
                Type <span className="font-mono font-semibold">DELETE</span> to confirm
              </p>

              <input
                type="text"
                placeholder="Type DELETE to confirm"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deleting ? 'Deleting...' : 'Delete My Account'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Delete Account
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
