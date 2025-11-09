'use client'

import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'
import type { StreakSummary } from '@/lib/streaks'

interface RecoveryStreakRadialProps {
  streak: StreakSummary
}

export default function RecoveryStreakRadial({ streak }: RecoveryStreakRadialProps) {
  const percentage = Math.min((streak.current / streak.nextMilestone) * 100, 100)
  const data = [{ name: 'streak', value: Math.max(percentage, 2) }]

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 items-center">
      <div className="w-full md:w-48 h-48">
        <ResponsiveContainer>
          <RadialBarChart
            data={data}
            startAngle={90}
            endAngle={-270}
            innerRadius="70%"
            outerRadius="100%"
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar
              dataKey="value"
              cornerRadius={50}
              fill="#0ea5e9"
              background={{ fill: '#e0f2fe' }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center md:text-left space-y-2">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Sobriety streak
        </p>
        <p className="text-4xl font-bold text-primary-600">{streak.current} days</p>
        <p className="text-sm text-gray-600">
          Next milestone:{' '}
          <span className="font-semibold text-gray-900">{streak.nextMilestone} days</span>
        </p>
        <p className="text-sm text-gray-600">{streak.message}</p>
      </div>
    </div>
  )
}

