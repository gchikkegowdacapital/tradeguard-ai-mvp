'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DataPoint {
  date: string
  equity: number
}

export function EquityChart() {
  // Sample data - in a real app, this would come from the API
  const data: DataPoint[] = [
    { date: 'Mon', equity: 10000 },
    { date: 'Tue', equity: 10250 },
    { date: 'Wed', equity: 10150 },
    { date: 'Thu', equity: 10500 },
    { date: 'Fri', equity: 10800 },
    { date: 'Sat', equity: 10600 },
    { date: 'Sun', equity: 10900 },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="date" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
          }}
          labelStyle={{ color: '#e2e8f0' }}
        />
        <Line
          type="monotone"
          dataKey="equity"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
