'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, Trash2, CheckCircle, XCircle, Plus } from 'lucide-react'

interface BrokerConnection {
  id: string
  brokerType: string
  accountId: string
  isConnected: boolean
  lastSync: string
}

export default function BrokersPage() {
  const [connections, setConnections] = useState<BrokerConnection[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [brokerType, setBrokerType] = useState<'metatrader4' | 'metatrader5'>('metatrader4')
  const [accountId, setAccountId] = useState('')
  const [apiToken, setApiToken] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchConnections()
  }, [])

  const fetchConnections = async () => {
    try {
      const res = await fetch('/api/brokers')
      if (res.ok) {
        const data = await res.json()
        setConnections(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch connections:', err)
    }
  }

  const testConnection = async () => {
    if (!accountId || !apiToken) {
      setError('Please enter Account ID and API Token')
      return
    }

    setTestingConnection(true)
    setError('')

    try {
      const res = await fetch('/api/brokers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brokerType, accountId, apiToken }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Connection test successful!')
      } else {
        setError(data.error || 'Connection test failed')
      }
    } catch (err) {
      setError('An error occurred while testing the connection')
    } finally {
      setTestingConnection(false)
    }
  }

  const saveConnection = async () => {
    if (!accountId || !apiToken) {
      setError('Please enter Account ID and API Token')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/brokers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brokerType,
          accountId,
          apiToken,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Broker connection saved successfully!')
        setAccountId('')
        setApiToken('')
        setShowAddForm(false)
        fetchConnections()
      } else {
        setError(data.error || 'Failed to save connection')
      }
    } catch (err) {
      setError('An error occurred while saving the connection')
    } finally {
      setLoading(false)
    }
  }

  const deleteConnection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this connection?')) return

    try {
      const res = await fetch(`/api/brokers?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchConnections()
        setSuccess('Connection deleted')
      }
    } catch (err) {
      setError('Failed to delete connection')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Connected Brokers</h1>
        <p className="mt-2 text-slate-400">Manage your MetaTrader connections</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/30 p-4 text-red-300">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-800 bg-green-900/30 p-4 text-green-300">
          <div className="flex gap-2">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <p>{success}</p>
          </div>
        </div>
      )}

      {/* Connected Brokers */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Your Connections</h2>

        {connections.length > 0 ? (
          <div className="space-y-3">
            {connections.map((conn) => (
              <div
                key={conn.id}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div
                      className={conn.isConnected ? 'h-3 w-3 rounded-full bg-green-500' : 'h-3 w-3 rounded-full bg-red-500'}
                    />
                    <div>
                      <p className="font-semibold text-white">
                        {conn.brokerType === 'metatrader4' ? 'MetaTrader 4' : 'MetaTrader 5'}
                      </p>
                      <p className="text-sm text-slate-400">Account: {conn.accountId}</p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {conn.isConnected ? 'Connected' : 'Disconnected'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {conn.lastSync ? `Last sync: ${new Date(conn.lastSync).toLocaleString()}` : 'Never synced'}
                  </p>
                </div>

                <button
                  onClick={() => deleteConnection(conn.id)}
                  className="ml-4 rounded-lg p-2 text-slate-400 hover:bg-red-900/30 hover:text-red-400"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-8 text-center">
            <p className="text-slate-400">No brokers connected yet</p>
          </div>
        )}
      </section>

      {/* Add Broker */}
      <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="mb-6 flex items-center gap-2 text-lg font-semibold text-white hover:text-blue-400"
        >
          <Plus className="h-5 w-5" />
          Add Broker Connection
        </button>

        {showAddForm && (
          <div className="space-y-6 border-t border-slate-800 pt-6">
            {/* Instructions */}
            <div className="rounded-lg bg-blue-900/30 p-4 text-sm text-blue-300">
              <p className="font-semibold">Setup Instructions:</p>
              <ol className="mt-3 space-y-2">
                <li>1. Create a MetaApi account at metaapi.cloud</li>
                <li>2. Add your MetaTrader 4/5 account in MetaApi dashboard</li>
                <li>3. Copy your Account ID from MetaApi</li>
                <li>4. Get your API Token from account settings</li>
                <li>5. Paste both values below</li>
              </ol>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white">Broker Type</label>
                <select
                  value={brokerType}
                  onChange={(e) => setBrokerType(e.target.value as 'metatrader4' | 'metatrader5')}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="metatrader4">MetaTrader 4</option>
                  <option value="metatrader5">MetaTrader 5</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white">MetaApi Account ID</label>
                <input
                  type="text"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="e.g., 12345678"
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white">MetaApi Token</label>
                <input
                  type="password"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder="Your MetaApi token"
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-slate-400">Token is encrypted and stored securely</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 border-t border-slate-800 pt-6">
                <button
                  onClick={testConnection}
                  disabled={testingConnection || !accountId || !apiToken}
                  className="flex-1 rounded-lg border border-slate-700 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {testingConnection ? 'Testing...' : 'Test Connection'}
                </button>

                <button
                  onClick={saveConnection}
                  disabled={loading || !accountId || !apiToken}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Connection'}
                </button>

                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setError('')
                    setSuccess('')
                  }}
                  className="flex-1 rounded-lg border border-slate-700 px-4 py-2 font-medium text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
