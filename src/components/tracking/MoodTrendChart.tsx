import { useMemo } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  Area,
} from 'recharts'
import type { MoodHistoryPoint } from '@/lib/moodEntries'

interface MoodTrendChartProps {
  data: MoodHistoryPoint[]
  rangeLabel: string
}

function moodScoreLabel(score: number) {
  if (score >= 5) return 'Very positive'
  if (score >= 4) return 'Positive'
  if (score >= 3) return 'Neutral'
  if (score >= 2) return 'Low'
  return 'Very low'
}

export default function MoodTrendChart({ data, rangeLabel }: MoodTrendChartProps) {
  const chartData = useMemo(() => {
    const aggregated = new Map<string, { moodScore: number; cravingScore: number; count: number }>()

    data.forEach((point) => {
      const bucket = aggregated.get(point.date)
      if (bucket) {
        bucket.moodScore += point.moodScore
        bucket.cravingScore += point.cravingScore
        bucket.count += 1
      } else {
        aggregated.set(point.date, {
          moodScore: point.moodScore,
          cravingScore: point.cravingScore,
          count: 1,
        })
      }
    })

    return Array.from(aggregated.entries()).map(([date, values]) => ({
      date,
      moodScore: Number((values.moodScore / values.count).toFixed(2)),
      cravingScore: Number((values.cravingScore / values.count).toFixed(2)),
    }))
  }, [data])

  if (!chartData.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-600 text-center">
        No mood history yet for the past {rangeLabel}. Log how you’re feeling to start seeing trends.
      </div>
    )
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            domain={[0, 5]}
            ticks={[1, 2, 3, 4, 5]}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(14, 165, 233, 0.1)' }}
            formatter={(value: number, name) => {
              if (name === 'Mood') {
                return [moodScoreLabel(value), 'Mood']
              }
              return [value.toFixed(1), 'Cravings']
            }}
          />
          <Area
            type="monotone"
            dataKey="cravingScore"
            name="Cravings"
            fill="#fef3c7"
            stroke="#f59e0b"
            strokeWidth={2}
            fillOpacity={0.6}
          />
          <Line
            type="monotone"
            dataKey="moodScore"
            name="Mood"
            stroke="#0ea5e9"
            strokeWidth={3}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

