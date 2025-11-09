import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import type { StreakSummary } from '@/lib/streaks'

interface LogStreakGraphProps {
  streak: StreakSummary
  role: 'still_using' | 'supporter'
}

export default function LogStreakGraph({ streak, role }: LogStreakGraphProps) {
  const bars = streak.milestones
    .filter((milestone) => milestone <= streak.nextMilestone)
    .map((milestone) => ({
      milestone,
      reached: milestone <= streak.current ? 1 : 0,
    }))

  if (!bars.find((bar) => bar.milestone === streak.nextMilestone)) {
    bars.push({
      milestone: streak.nextMilestone,
      reached: 0,
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {role === 'still_using' ? 'Consistency streak' : 'Supporter streak'}
          </p>
          <p className="text-3xl font-bold text-primary-600">{streak.current} days</p>
        </div>
        <p className="text-sm text-gray-600 md:text-right">{streak.message}</p>
      </div>
      <div className="w-full h-40">
        <ResponsiveContainer>
          <BarChart data={bars} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="milestone"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              label={{ value: 'Milestones (days)', position: 'insideBottom', offset: -5 }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(14, 165, 233, 0.1)' }}
              formatter={(value, _name, props) =>
                props.payload.reached
                  ? ['Reached', `${props.payload.milestone} days`]
                  : ['Upcoming', `${props.payload.milestone} days`]
              }
            />
            <Bar
              dataKey="reached"
              fill="#0ea5e9"
              radius={[8, 8, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

