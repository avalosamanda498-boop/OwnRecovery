'use client'

import type { MoodHistoryPoint } from './moodEntries'

export interface AdvisoryAlert {
  id: string
  severity: 'info' | 'watch' | 'take_action'
  headline: string
  message: string
}

export function evaluateAlerts(history: MoodHistoryPoint[]): AdvisoryAlert[] {
  if (!history.length) return []

  // Rules stay human-readable so supporters understand why an alert fires.
  const latest = history[history.length - 1]
  const previous = history.length > 1 ? history[history.length - 2] : null
  const alerts: AdvisoryAlert[] = []

  // Helper to push unique ids for React keys
  const pushAlert = (alert: AdvisoryAlert) => {
    alerts.push(alert)
  }

  // Elevated craving alert
  if (latest.cravingLabel === 'used_today') {
    pushAlert({
      id: 'craving-used-today',
      severity: 'take_action',
      headline: 'You logged “I used today.”',
      message:
        'Consider contacting a supporter or trusted person and revisit your immediate care plan. You’re not alone—take the next supportive step now.',
    })
  } else if (latest.cravingLabel === 'at_risk' || latest.cravingLabel === 'strong') {
    pushAlert({
      id: 'craving-high',
      severity: 'watch',
      headline: 'Cravings feel heavy today.',
      message:
        'Pair today with grounding tactics or reach out to someone in your support circle. Your honesty helps keep you safe.',
    })
  }

  // Stress and sleep combination
  if (latest.stressLabel === 'high' && latest.sleepLabel === 'poor') {
    pushAlert({
      id: 'stress-sleep',
      severity: 'watch',
      headline: 'Stress is high and sleep was rough.',
      message:
        'Consider short regulation breaks and checking in with a supporter. When stress and sleep stack together, human support can make the difference.',
    })
  }

  // Mood dip compared to previous day
  if (previous && latest.moodScore + 1 <= previous.moodScore) {
    pushAlert({
      id: 'mood-drop',
      severity: 'info',
      headline: 'Mood dipped since your last log.',
      message:
        'Reflect on what shifted. If it feels helpful, share the change with someone who can listen and encourage you.',
    })
  }

  // No check-ins for multiple days
  const DAY_IN_MS = 24 * 60 * 60 * 1000
  const today = new Date()
  const latestDate = new Date(history[history.length - 1].isoDate)
  if (today.getTime() - latestDate.getTime() > DAY_IN_MS * 2) {
    pushAlert({
      id: 'log-gap',
      severity: 'info',
      headline: 'We haven’t seen a log in a couple of days.',
      message:
        'Consistency builds momentum. Try a brief reflection today, and invite a supporter to check in if that feels useful.',
    })
  }

  return alerts
}

