'use client'

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
    const aggregated = new Map<
      string,
      {
        moodScore: number
        cravingScore: number
        stressScore: number
        sleepScore: number
        moodCount: number
        cravingCount: number
        stressCount: number
        sleepCount: number
      }
    >()

    data.forEach((point) => {
      const bucket = aggregated.get(point.date)
      if (bucket) {
        bucket.moodScore += point.moodScore
        bucket.cravingScore += point.cravingScore
        bucket.moodCount += 1
        bucket.cravingCount += 1
        if (point.stressScore !== null) {
          bucket.stressScore += point.stressScore
          bucket.stressCount += 1
        }
        if (point.sleepScore !== null) {
          bucket.sleepScore += point.sleepScore
          bucket.sleepCount += 1
        }
      } else {
        aggregated.set(point.date, {
          moodScore: point.moodScore,
          cravingScore: point.cravingScore,
          stressScore: point.stressScore ?? 0,
          sleepScore: point.sleepScore ?? 0,
          moodCount: 1,
          cravingCount: 1,
          stressCount: point.stressScore !== null ? 1 : 0,
          sleepCount: point.sleepScore !== null ? 1 : 0,
        })
      }
    })

    return Array.from(aggregated.entries()).map(([date, values]) => ({
      date,
      moodScore: Number((values.moodScore / Math.max(values.moodCount, 1)).toFixed(2)),
      cravingScore: Number((values.cravingScore / Math.max(values.cravingCount, 1)).toFixed(2)),
      stressScore:
        values.stressCount > 0 ? Number((values.stressScore / values.stressCount).toFixed(2)) : null,
      sleepScore: values.sleepCount > 0 ? Number((values.sleepScore / values.sleepCount).toFixed(2)) : null,
    }))
  }, [data])

  const trendInsight = useMemo(() => {
    if (!chartData.length) return null

    const mostRecent = chartData[chartData.length - 1]
    const previous = chartData.length > 1 ? chartData[chartData.length - 2] : null

    if (!previous) {
      return 'Daily logs build the trend picture. Keep checking in to surface helpful patterns.'
    }

    const messages: string[] = []

    if (mostRecent.moodScore > previous.moodScore + 0.5) {
      messages.push('Mood lifted compared to yesterday—celebrate what helped you reset.')
    } else if (mostRecent.moodScore + 0.5 < previous.moodScore) {
      messages.push('Mood dipped today. Consider a grounding tool or quick outreach.')
    }

    if (mostRecent.cravingScore > previous.cravingScore + 0.5) {
      messages.push('Cravings climbed—review your safety plan or coping stack.')
    }

    if (mostRecent.stressScore !== null && previous.stressScore !== null) {
      if (mostRecent.stressScore > previous.stressScore + 0.5) {
        messages.push('Stress ticked up. Breathing exercises or a short walk can help reset.')
      }
    }

    if (mostRecent.sleepScore !== null && mostRecent.sleepScore <= 2) {
      messages.push('Sleep was rough. Pair today with lighter commitments and extra support.')
    }

    if (!messages.length) {
      messages.push('Trends look steady. Keep checking in so we can spot changes early.')
    }

    return messages.join(' ')
  }, [chartData])

  if (!chartData.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-600 text-center">
        No mood history yet for the past {rangeLabel}. Log how you’re feeling to start seeing trends.
      </div>
    )
  }

  return (
    <div className="space-y-3">
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
              cursor={{ fill: 'rgba(14, 165, 233, 0.08)' }}
              formatter={(value: number, name) => {
                if (name === 'Mood') {
                  return [moodScoreLabel(value), 'Mood']
                }
                if (name === 'Stress') {
                  return [value.toFixed(1), 'Stress (higher = heavier)']
                }
                if (name === 'Sleep') {
                  return [value.toFixed(1), 'Sleep (higher = more restored)']
                }
                return [value.toFixed(1), 'Cravings']
              }}
            />
            <Area
              type="monotone"
              dataKey="cravingScore"
              name="Cravings"
              fill="#fde68a"
              stroke="#f59e0b"
              strokeWidth={2}
              fillOpacity={0.35}
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
            <Line
              type="monotone"
              dataKey="stressScore"
              name="Stress"
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth={2}
              dot={{ r: 2 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="sleepScore"
              name="Sleep"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 2 }}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {trendInsight && (
        <div className="rounded-2xl border border-primary-100 bg-primary-50/60 p-4 text-sm text-[#19254a]">
          <p className="font-medium text-[#0b132d]">Today’s interpretation</p>
          <p className="mt-1 text-[#1f2c52]">{trendInsight}</p>
        </div>
      )}
    </div>
  )
}

