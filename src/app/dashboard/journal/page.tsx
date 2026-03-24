'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Trade, PositionDirection, SetupQuality, PlanCompliance, EmotionalState } from '@/types/index'
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface TradeWithTags extends Trade {
  tags?: {
    emotional_state?: EmotionalState
    setup_quality?: SetupQuality
    plan_compliance?: PlanCompliance
    notes?: string
  }
}

interface JournalStats {
  totalPnL: number
  winRate: number
  avgWin: number
  avgLoss: number
  profitFactor: number
  bestTrade: number
  worstTrade: number
  mostTradedInstrument: string
}

const emotionalStateEmojis: Record<EmotionalState, string> = {
  [EmotionalState.CALM]: '😌',
  [EmotionalState.NEUTRAL]: '😐',
  [EmotionalState.ANXIOUS]: '😰',
  [EmotionalState.FRUSTRATED]: '😤',
  [EmotionalState.OVERCONFIDENT]: '😎',
}

const setupQualityLabels: Record<SetupQuality, string> = {
  [SetupQuality.POOR]: 'F',
  [SetupQuality.FAIR]: 'C',
  [SetupQuality.GOOD]: 'B',
  [SetupQuality.EXCELLENT]: 'A+',
}

const complianceLabels: Record<PlanCompliance, string> = {
  [PlanCompliance.NONE]: 'Violated',
  [PlanCompliance.PARTIAL]: 'Partial',
  [PlanCompliance.FULL]: 'Followed',
}

const complianceColors: Record<PlanCompliance, string> = {
  [PlanCompliance.NONE]: 'bg-red-50 text-red-900',
  [PlanCompliance.PARTIAL]: 'bg-amber-50 text-amber-900',
  [PlanCompliance.FULL]: 'bg-emerald-50 text-emerald-900',
}

export default function JournalPage() {
  const { user } = useAuth()
  const [trades, setTrades] = useState<TradeWithTags[]>([])
  const [stats, setStats] = useState<JournalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [filters, setFilters] = useState({
    symbol: '',
    direction: '' as PositionDirection | '',
    dateFrom: '',
    dateTo: '',
    pnlDirection: '' as 'profit' | 'loss' | '',
  })

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  })

  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null)
  const [editingTags, setEditingTags] = useState<Record<string, TradeWithTags['tags']>>({})

  // Fetch trades
  useEffect(() => {
    fetchTrades()
  }, [filters, pagination.page])

  const fetchTrades = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.symbol && { symbol: filters.symbol }),
        ...(filters.direction && { direction: filters.direction }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.pnlDirection && { pnlDirection: filters.pnlDirection }),
      })

      const response = await fetch(`/api/trades?${params}`)
      if (!response.ok) throw new Error('Failed to fetch trades')

      const data = await response.json()
      setTrades(data.data || [])
      setPagination((prev) => ({
        ...prev,
        total: data.total || 0,
      }))

      // Calculate stats
      if (data.data && data.data.length > 0) {
        calculateStats(data.data)
      }
    } catch (err) {
      console.error('Error fetching trades:', err)
      setError('Failed to load trade journal')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (trades: TradeWithTags[]) => {
    const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0)
    const winningTrades = trades.filter((t) => t.pnl > 0)
    const losingTrades = trades.filter((t) => t.pnl < 0)

    const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length : 0
    const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length) : 0

    const profitFactor = avgLoss > 0 ? (avgWin * winningTrades.length) / (avgLoss * losingTrades.length) : 0

    const bestTrade = Math.max(...trades.map((t) => t.pnl), 0)
    const worstTrade = Math.min(...trades.map((t) => t.pnl), 0)

    const symbolCounts = trades.reduce(
      (acc, t) => {
        acc[t.symbol] = (acc[t.symbol] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
    const mostTradedInstrument = Object.entries(symbolCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

    setStats({
      totalPnL,
      winRate: trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
      avgWin,
      avgLoss,
      profitFactor,
      bestTrade,
      worstTrade,
      mostTradedInstrument,
    })
  }

  const handleSaveTagsClick = async (tradeId: string) => {
    const tags = editingTags[tradeId]
    if (!tags) return

    try {
      const response = await fetch(`/api/trades/${tradeId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tags),
      })

      if (!response.ok) throw new Error('Failed to save tags')

      // Update local state
      setTrades((prev) =>
        prev.map((t) =>
          t.id === tradeId
            ? { ...t, tags }
            : t
        )
      )

      setEditingTags((prev) => {
        const newEditing = { ...prev }
        delete newEditing[tradeId]
        return newEditing
      })

      setExpandedTradeId(null)
    } catch (err) {
      console.error('Error saving tags:', err)
      setError('Failed to save tags')
    }
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Trade Journal</h1>
        <p className="text-slate-600 mt-1">Track emotions, setup quality, and plan compliance for every trade</p>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          <StatCard label="Total P&L" value={formatCurrency(stats.totalPnL)} color={stats.totalPnL >= 0 ? 'emerald' : 'red'} />
          <StatCard label="Win Rate" value={formatPercent(stats.winRate / 100, 1)} />
          <StatCard label="Avg Win" value={formatCurrency(stats.avgWin)} color="emerald" />
          <StatCard label="Avg Loss" value={formatCurrency(stats.avgLoss)} color="red" />
          <StatCard label="Profit Factor" value={stats.profitFactor.toFixed(2) + 'x'} />
          <StatCard label="Best Trade" value={formatCurrency(stats.bestTrade)} color="emerald" />
          <StatCard label="Most Traded" value={stats.mostTradedInstrument} />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900 mb-4">Filters</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Symbol (e.g., EURUSD)"
            value={filters.symbol}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, symbol: e.target.value }))
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <select
            value={filters.direction}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, direction: e.target.value as PositionDirection | '' }))
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Directions</option>
            <option value={PositionDirection.LONG}>Long</option>
            <option value={PositionDirection.SHORT}>Short</option>
          </select>

          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <select
            value={filters.pnlDirection}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, pnlDirection: e.target.value as 'profit' | 'loss' | '' }))
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All P&L</option>
            <option value="profit">Profit Only</option>
            <option value="loss">Loss Only</option>
          </select>
        </div>
      </div>

      {/* Trades Table */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">{error}</div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">Loading trades...</div>
      ) : trades.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">
          No trades found. Start trading and log them to see them here.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Symbol</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Direction</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Entry</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Exit</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">P&L</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">P&L %</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Tags</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {trades.map((trade) => {
                    const duration = trade.exit_time
                      ? Math.floor(
                          (new Date(trade.exit_time).getTime() - new Date(trade.entry_time).getTime()) /
                            (1000 * 60)
                        )
                      : null

                    const isExpanded = expandedTradeId === trade.id
                    const tags = editingTags[trade.id] || trade.tags || {}

                    return (
                      <tr key={trade.id}>
                        <td
                          className="px-4 py-3 text-sm text-slate-900 cursor-pointer hover:bg-slate-50"
                          onClick={() => setExpandedTradeId(isExpanded ? null : trade.id)}
                        >
                          {formatDate(trade.entry_time)}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">{trade.symbol}</td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={cn(
                              'px-2 py-1 rounded text-xs font-semibold',
                              trade.direction === PositionDirection.LONG
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-red-100 text-red-900'
                            )}
                          >
                            {trade.direction === PositionDirection.LONG ? 'LONG' : 'SHORT'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-slate-900">{trade.entry_price.toFixed(4)}</td>
                        <td className="px-4 py-3 text-sm text-right text-slate-900">
                          {trade.exit_price?.toFixed(4) || '—'}
                        </td>
                        <td
                          className={cn(
                            'px-4 py-3 text-sm text-right font-semibold',
                            trade.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'
                          )}
                        >
                          {formatCurrency(trade.pnl)}
                        </td>
                        <td
                          className={cn(
                            'px-4 py-3 text-sm text-right font-semibold',
                            trade.pnl_percent >= 0 ? 'text-emerald-600' : 'text-red-600'
                          )}
                        >
                          {formatPercent(trade.pnl_percent / 100, 2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {duration !== null ? `${duration}m` : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            {tags.emotional_state && (
                              <span title={tags.emotional_state}>
                                {emotionalStateEmojis[tags.emotional_state]}
                              </span>
                            )}
                            {tags.setup_quality && (
                              <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded text-xs font-semibold">
                                {setupQualityLabels[tags.setup_quality]}
                              </span>
                            )}
                            {tags.plan_compliance && (
                              <span
                                className={cn(
                                  'px-2 py-0.5 rounded text-xs font-semibold',
                                  complianceColors[tags.plan_compliance]
                                )}
                              >
                                {complianceLabels[tags.plan_compliance]}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expanded Trade Details */}
          {expandedTradeId && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Trade Details - {trades.find((t) => t.id === expandedTradeId)?.symbol}
                </h3>

                {/* Tag Editing Form */}
                <div className="space-y-4">
                  {/* Emotional State */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Emotional State
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(emotionalStateEmojis).map(([state, emoji]) => (
                        <button
                          key={state}
                          onClick={() => {
                            setEditingTags((prev) => ({
                              ...prev,
                              [expandedTradeId]: {
                                ...prev[expandedTradeId],
                                emotional_state: state as EmotionalState,
                              },
                            }))
                          }}
                          className={cn(
                            'px-4 py-2 rounded-lg border-2 transition-all',
                            (editingTags[expandedTradeId]?.emotional_state || trades.find((t) => t.id === expandedTradeId)?.tags?.emotional_state) === state
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-slate-200 hover:border-slate-300'
                          )}
                        >
                          {emoji} {state.charAt(0).toUpperCase() + state.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Setup Quality */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Setup Quality
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(setupQualityLabels).map(([quality, label]) => (
                        <button
                          key={quality}
                          onClick={() => {
                            setEditingTags((prev) => ({
                              ...prev,
                              [expandedTradeId]: {
                                ...prev[expandedTradeId],
                                setup_quality: quality as SetupQuality,
                              },
                            }))
                          }}
                          className={cn(
                            'px-4 py-2 rounded-lg border-2 transition-all font-semibold',
                            (editingTags[expandedTradeId]?.setup_quality || trades.find((t) => t.id === expandedTradeId)?.tags?.setup_quality) === quality
                              ? 'border-blue-500 bg-blue-50 text-blue-900'
                              : 'border-slate-200 hover:border-slate-300'
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Plan Compliance */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Plan Compliance
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(complianceLabels).map(([compliance, label]) => (
                        <button
                          key={compliance}
                          onClick={() => {
                            setEditingTags((prev) => ({
                              ...prev,
                              [expandedTradeId]: {
                                ...prev[expandedTradeId],
                                plan_compliance: compliance as PlanCompliance,
                              },
                            }))
                          }}
                          className={cn(
                            'px-4 py-2 rounded-lg border-2 transition-all font-semibold',
                            (editingTags[expandedTradeId]?.plan_compliance || trades.find((t) => t.id === expandedTradeId)?.tags?.plan_compliance) === compliance
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                              : 'border-slate-200 hover:border-slate-300'
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={editingTags[expandedTradeId]?.notes || trades.find((t) => t.id === expandedTradeId)?.tags?.notes || ''}
                      onChange={(e) => {
                        setEditingTags((prev) => ({
                          ...prev,
                          [expandedTradeId]: {
                            ...prev[expandedTradeId],
                            notes: e.target.value,
                          },
                        }))
                      }}
                      placeholder="What happened during this trade? Any lessons learned?"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => handleSaveTagsClick(expandedTradeId)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      Save Tags
                    </button>
                    <button
                      onClick={() => setExpandedTradeId(null)}
                      className="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-slate-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} trades
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                const pageNum = Math.max(1, pagination.page - 2) + idx
                if (pageNum > totalPages) return null

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagination((prev) => ({ ...prev, page: pageNum }))}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      pagination.page === pageNum
                        ? 'bg-purple-600 text-white'
                        : 'border border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    {pageNum}
                  </button>
                )
              })}

              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                disabled={pagination.page === totalPages}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color?: 'emerald' | 'red'
}) {
  const colorClasses: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-900',
    red: 'bg-red-50 text-red-900',
    default: 'bg-slate-50 text-slate-900',
  }

  return (
    <div className={cn('rounded-lg border border-slate-200 p-4', colorClasses[color || 'default'])}>
      <p className="text-xs font-semibold opacity-75">{label}</p>
      <p className="text-lg font-bold mt-1">{value}</p>
    </div>
  )
}
