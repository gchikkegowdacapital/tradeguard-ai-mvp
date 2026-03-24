'use client'

interface RiskGaugeProps {
  score: number // 0-100
}

export function RiskGauge({ score }: RiskGaugeProps) {
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (score / 100) * circumference

  let color = '#22c55e' // green
  let label = 'Low Risk'

  if (score >= 80) {
    color = '#22c55e'
    label = 'Low Risk'
  } else if (score >= 60) {
    color = '#eab308'
    label = 'Moderate Risk'
  } else if (score >= 40) {
    color = '#f97316'
    label = 'High Risk'
  } else {
    color = '#ef4444'
    label = 'Critical Risk'
  }

  return (
    <div className="flex flex-col items-center rounded-lg border border-slate-800 bg-slate-900 p-6">
      <h3 className="mb-6 text-sm font-semibold text-slate-400">Risk Score</h3>

      <div className="relative mb-6">
        <svg width="200" height="200" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="45"
            fill="none"
            stroke="#334155"
            strokeWidth="8"
          />

          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-white">{score}</div>
          <div className="text-xs text-slate-400">/ 100</div>
        </div>
      </div>

      <div className="text-center">
        <p className="font-semibold text-white">{label}</p>
        <p className="mt-2 text-xs text-slate-400">
          {score >= 80
            ? 'Trading plan adherence is excellent'
            : score >= 60
              ? 'Monitor discipline closely'
              : score >= 40
                ? 'High discipline violations detected'
                : 'Critical issues - pause trading'}
        </p>
      </div>

      <div className="mt-6 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Factors:</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs text-slate-400">Position sizing ✓</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-yellow-500" />
          <span className="text-xs text-slate-400">Revenge trading risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs text-slate-400">Daily limits ✓</span>
        </div>
      </div>
    </div>
  )
}
