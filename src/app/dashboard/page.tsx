'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, TrendingUp, TrendingDown, DollarSign, Percent, Activity, Zap } from 'lucide-react'
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { RiskGauge } from '@/components/dashboard/RiskGauge'
import { PositionRow } from '@/components/dashboard/PositionRow'
import { AlertItem } from '@/components/dashboard/AlertItem'
import { EquityChart } from '@/components/dashboard/EquityChart'
import { EmptyState } from '@/components/dashboard/EmptyState'

interface AccountHealth {
  balance: number
  equity: number
  openPnL: number
  marginLevel: number
  dailyPnL: number
  dailyPnLPercent: number
  drawdownPercent: number
}

interface Position {
  id: string
  symbol: string
  direction: 'long' | 'short'
  entryPrice: number
  currentPrice: number
  pnl: number
  pnlPercent: number
  riskPercent: number
  stopLoss: number
  takeProfit: number
  volume: number
}

interface Alert {
  id: string
  level: 'info' | 'warning' | 'critical' | 'emergency'
  message: string
  timestamp: string
}

export default function DashboardPage() {
  const [accountHealth, setAccountHealth] = useState<AccountHealth | null>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [riskScore, setRiskScore] = useState(45)
  const [loading, setLoading] = useState(true)
  const [hasConnectedBroker, setHasConnectedBroker] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch account data
      const accountRes = await fetch('/api/accounts')
      if (accountRes.ok) {
        const data = await accountRes.json()
        if (data.data) {
          setAccountHealth(data.data)
          setHasConnectedBroker(true)
        }
      }

      // Fetch positions
      const posRes = await fetch('/api/positions')
      if (posRes.ok) {
        const data = await posRes.json()
        setPositions(data.data || [])
      }

      // Fetch alerts
      const alertRes = await fetch('/api/alerts')
      if (alertRes.ok) {
        const data = await alertRes.json()
        setAlerts(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!hasConnectedBroker) {
    return (
      <EmptyState
        icon={<AlertCircle className="h-12 w-12" />}
        title="Connect Your Broker"
        message="Start tracking trades and getting AI-powered risk insights by connecting your MetaTrader account."
        ctaText="Connect Broker"
        ctaHref="/dashboard/brokers"
      />
    )
  }

  const drawdownColor =
    accountHealth?.drawdownPercent || 0 > 10
      ? 'text-red-500'
      : (accountHealth?.drawdownPercent || 0) > 8
        ? 'text-orange-500'
        : (accountHealth?.drawdownPercent || 0) > 5
          ? 'text-yellow-500'
          : 'text-green-500'

  return (
    <div className="space-y-6">
      {/* Account Health Section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Account Health</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard
            label="Balance"
            value={formatCurrency(accountHealth?.balance || 0)}
            icon={<DollarSign className="h-5 w-5" />}
            color="blue"
          />
          <MetricCard
            label="Equity"
            value={formatCurrency(accountHealth?.equity || 0)}
            icon={<Activity className="h-5 w-5" />}
            color="purple"
          />
          <MetricCard
            label="Open P&L"
            value={formatCurrency(accountHealth?.openPnL || 0)}
            icon={<TrendingUp className="h-5 w-5" />}
            color={accountHealth?.openPnL && accountHealth.openPnL > 0 ? 'green' : 'red'}
          />
          <MetricCard
            label="Margin Level"
            value={`${formatNumber(accountHealth?.marginLevel || 0)}%`}
            icon={<Percent className="h-5 w-5" />}
            color="amber"
          />
        </div>
      </section>

      {/* Daily P&L and Drawdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-400">Daily P&L</h3>
          <div className={`text-3xl font-bold ${accountHealth?.dailyPnL && accountHealth.dailyPnL > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatCurrency(accountHealth?.dailyPnL || 0)}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {formatPercent((accountHealth?.dailyPnLPercent || 0) / 100)}
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-400">Drawdown from Peak</h3>
          <div className={`text-3xl font-bold ${drawdownColor}`}>
            {formatPercent((accountHealth?.drawdownPercent || 0) / 100)}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {(accountHealth?.drawdownPercent || 0) > 10
              ? 'Critical - Stop trading'
              : (accountHealth?.drawdownPercent || 0) > 8
                ? 'High risk - Reduce position size'
                : (accountHealth?.drawdownPercent || 0) > 5
                  ? 'Monitor closely'
                  : 'Healthy'}
          </p>
        </div>
      </div>

      {/* Risk Score and Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <RiskGauge score={riskScore} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <QuickStat label="Trades Today" value="3" trend="up" />
          <QuickStat label="Win Rate (20)" value="65%" trend="up" />
          <QuickStat label="Discipline Score" value="85%" trend="neutral" />
          <QuickStat label="Revenge Risk" value="Low" trend="down" />
        </div>
      </div>

      {/* Equity Curve Chart */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Equity Curve</h2>
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <EquityChart />
        </div>
      </section>

      {/* Open Positions */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Open Positions</h2>
        {positions.length > 0 ? (
          <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900">
            <div className="grid grid-cols-10 gap-4 border-b border-slate-800 px-6 py-3 text-xs font-semibold text-slate-400">
              <div className="col-span-2">Symbol</div>
              <div>Direction</div>
              <div>Entry</div>
              <div>Current</div>
              <div>P&L</div>
              <div>Risk%</div>
              <div>SL</div>
              <div>TP</div>
              <div>Actions</div>
            </div>
            {positions.map((pos) => (
              <PositionRow key={pos.id} position={pos} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-8 text-center">
            <p className="text-slate-400">No open positions</p>
          </div>
        )}
      </section>

      {/* Recent Alerts */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Alerts</h2>
          <a href="/dashboard/alerts" className="text-sm text-blue-400 hover:text-blue-300">
            View All
          </a>
        </div>
        <div className="space-y-2">
          {alerts.length > 0 ? (
            alerts.slice(0, 5).map((alert) => <AlertItem key={alert.id} alert={alert} />)
          ) : (
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 text-center">
              <p className="text-slate-400">No alerts</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function QuickStat({
  label,
  value,
  trend,
}: {
  label: string
  value: string
  trend: 'up' | 'down' | 'neutral'
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3">
      <span className="text-sm text-slate-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-white">{value}</span>
        {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
        {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
      </div>
    </div>
  )
}
