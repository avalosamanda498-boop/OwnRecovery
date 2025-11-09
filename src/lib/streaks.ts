import { supabase } from './supabase'
import { AuthUser } from './auth'

export interface StreakSummary {
  current: number
  nextMilestone: number
  daysUntilMilestone: number
  message: string
  milestones: number[]
}

const DEFAULT_MILESTONES = [1, 3, 5, 7, 10, 14, 21, 30, 45, 60, 90, 120, 180, 270, 365]

function getNextMilestone(current: number, milestones = DEFAULT_MILESTONES) {
  return milestones.find((m) => m > current) ?? current + 1
}

function streakSummary(current: number, context: { role: string }) {
  const nextMilestone = getNextMilestone(current)
  const daysUntilMilestone = Math.max(nextMilestone - current, 0)

  let message = ''
  switch (context.role) {
    case 'recovery':
      message =
        current === 0
          ? 'Set your sobriety start date to begin tracking streaks.'
          : `Keep showing up—${daysUntilMilestone} day(s) until your next sobriety milestone.`
      break
    case 'still_using':
      message =
        current === 0
          ? 'Log how you feel today to start a consistency streak.'
          : `You’re building momentum. ${daysUntilMilestone} day(s) to the next check-in milestone.`
      break
    case 'supporter':
      message =
        current === 0
          ? 'Check in or log how you’re doing to start your supporter streak.'
          : `Thanks for showing up. ${daysUntilMilestone} day(s) until the next celebration.`
      break
    default:
      message = ''
  }

  return { current, nextMilestone, daysUntilMilestone, message, milestones }
}

export async function fetchRecoveryStreak(user: AuthUser): Promise<StreakSummary> {
  if (!user.sobriety_start_date) {
    return streakSummary(0, { role: 'recovery' })
  }

  const start = new Date(user.sobriety_start_date)
  const now = new Date()
  const days = Math.max(Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1, 0)

  return streakSummary(days, { role: 'recovery' })
}

export async function fetchLogBasedStreak(user: AuthUser): Promise<StreakSummary> {
  const {
    data,
    error,
  } = await supabase
    .from('mood_entries')
    .select('created_at, craving_level')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) {
    throw error
  }

  if (!data || data.length === 0) {
    return streakSummary(0, { role: user.role ?? 'still_using' })
  }

  const today = new Date()
  const todayKey = today.toISOString().slice(0, 10)

  // If a recovery user logs "used_today", streak resets
  const relapseEntry = data.find((entry) => entry.craving_level === 'used_today')
  if (user.role === 'recovery' && relapseEntry) {
    return streakSummary(0, { role: 'recovery' })
  }

  // Build a set of days with logs
  const loggedDays = new Set<string>()
  data.forEach((entry) => {
    loggedDays.add(new Date(entry.created_at).toISOString().slice(0, 10))
  })

  // Count consecutive days going backwards from today
  let streak = 0
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const key = date.toISOString().slice(0, 10)
    if (loggedDays.has(key)) {
      streak += 1
    } else {
      if (i === 0) {
        // allow same-day missing as zero streak
        break
      }
      break
    }
  }

  return streakSummary(streak, { role: user.role ?? 'still_using' })
}

