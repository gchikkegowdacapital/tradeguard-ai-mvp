import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency, formatPercent } from '@/lib/utils'

export default async function TradesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_time', { ascending: false })

  const winningTrades = trades?.filter((t) => t.pnl > 0) || []
  const losingTrades = trades?.filter((t) => t.pnl < 0) || []
  const totalPnL = trades?.reduce((sum, t) => sum + (t.pnl || 0), 0) || 0
  const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length : 0
  const avgLoss = losingTrades.length > 0 ? losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length : 0

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-5">
        <StatBox label="Total Trades" value={trades?.length || 0} />
        <StatBox label="Wins" value={winningTrades.length} color="success" />
        <StatBox label="Losses" value={losingTrades.length} color="danger" />
        <StatBox label="Avg Win" value={formatCurrency(avgWin)} color="success" />
        <StatBox label="Avg Loss" value={formatCurrency(avgLoss)} color="danger" />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">All Trades</h2>
        </div>
        {trades && trades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-900 dark:text-white">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-900 dark:text-white">
                    Direction
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-slate-900 dark:text-white">
                    Entry
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-slate-900 dark:text-white">
                    Exit
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-slate-900 dark:text-white">
                    Volume
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-slate-900 dark:text-white">
                    P&L
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-900 dark:text-white">
                    Quality
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-900 dark:text-white">
                    Compliance
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-900 dark:text-white">
                    Emotion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {trades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {trade.symbol}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                          trade.direction === 'long'
                            ? 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-200'
                            : 'bg-danger-100 text-danger-700 dark:bg-danger-900 dark:text-danger-200'
                        }`}
                      >
                        {trade.direction.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-600 dark:text-slate-400">
                      {formatCurrency(trade.entry_price)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-600 dark:text-slate-400">
                      {trade.exit_price ? formatCurrency(trade.exit_price) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-600 dark:text-slate-400">
                      {trade.volume}
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-medium ${
                        trade.pnl > 0
                          ? 'text-success-600 dark:text-success-400'
                          : trade.pnl < 0
                            ? 'text-danger-600 dark:text-danger-400'
                            : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {formatCurrency(trade.pnl)} ({formatPercent(trade.pnl_percent / 100)})
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <BadgeLabel text={trade.setup_quality} color="primary" />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <BadgeLabel text={trade.plan_compliance} color="warning" />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <BadgeLabel text={trade.emotional_state} color="secondary" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">No trades recorded yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatBox({
  label,
  value,
  color = 'primary',
}: {
  label: string
  value: string | number
  color?: 'primary' | 'success' | 'danger'
}) {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200',
    success: 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-200',
    danger: 'bg-danger-100 text-danger-700 dark:bg-danger-900 dark:text-danger-200',
  }

  return (
    <div className={`rounded-lg p-4 ${colorClasses[color]}`}>
      <p className="text-xs font-medium uppercase">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  )
}

function BadgeLabel({
  text,
  color = 'primary',
}: {
  text: string
  color?: 'primary' | 'success' | 'danger' | 'warning' | 'secondary'
}) {
  const colorMap = {
    primary: 'badge-primary',
    success: 'badge-success',
    danger: 'badge-danger',
    warning: 'badge-warning',
    secondary: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  }

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colorMap[color]}`}>
      {text}
    </span>
  )
}
