import { supabase } from './supabase'
import { getCurrentUser } from './auth'
import { fetchRecoveryStreak, fetchLogBasedStreak } from './streaks'
import type { AuthUser } from './auth'
import type { CravingOption } from './moodEntries'

type BadgeType =
  | 'first_log'
  | 'streak_3'
  | 'streak_7'
  | 'streak_14'
  | 'streak_30'
  | 'bravery_log'

export interface BadgeRecord {
  id: string
  badge_type: BadgeType
  badge_name: string
  description: string | null
  icon: string | null
  metadata: Record<string, any> | null
  earned_at: string
}

interface BadgeDefinition {
  type: BadgeType
  name: string
  description: string
  icon: string
}

const BADGE_DEFINITIONS: Record<BadgeType, BadgeDefinition> = {
  first_log: {
    type: 'first_log',
    name: 'First Check-In',
    description: 'Logged your very first mood entry. Every journey starts with a check-in.',
    icon: '✨',
  },
  streak_3: {
    type: 'streak_3',
    name: '3-Day Momentum',
    description: 'Three days in a row—consistency is building.',
    icon: '🔥',
  },
  streak_7: {
    type: 'streak_7',
    name: 'One Week Strong',
    description: 'Seven consecutive days of showing up for yourself.',
    icon: '🌟',
  },
  streak_14: {
    type: 'streak_14',
    name: 'Two-Week Flow',
    description: 'Fourteen days of momentum—keep leaning into the habits that help.',
    icon: '💪',
  },
  streak_30: {
    type: 'streak_30',
    name: '30-Day Milestone',
    description: 'Thirty days in a row. Celebrate the progress and keep moving forward.',
    icon: '🏆',
  },
  bravery_log: {
    type: 'bravery_log',
    name: 'Bravery Badge',
    description: 'You logged during a tough craving. Courage looks like honesty.',
    icon: '🛡️',
  },
}

async function ensureProfile(userId: string): Promise<AuthUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select(
      'id, email, full_name, role, is_admin, onboarding_completed, user_type, sobriety_start_date'
    )
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Error loading user profile for badges', error)
    return null
  }

  if (!data) return null

  return {
    id: data.id,
    email: data.email ?? '',
    role: (data.role as AuthUser['role']) ?? null,
    full_name: data.full_name ?? null,
    is_admin: data.is_admin ?? false,
    onboarding_completed: data.onboarding_completed ?? false,
    user_type: data.user_type ?? 'regular',
    sobriety_start_date: data.sobriety_start_date ?? null,
  }
}

async function insertBadge(userId: string, definition: BadgeDefinition, metadata?: Record<string, any>) {
  const { data, error } = await supabase
    .from('badges')
    .insert({
      user_id: userId,
      badge_type: definition.type,
      badge_name: definition.name,
      description: definition.description,
      icon: definition.icon,
      metadata: metadata ?? null,
    })
    .select('id, badge_type, badge_name, description, icon, metadata, earned_at')
    .single()

  if (error) {
    console.error('Error inserting badge', error)
    return null
  }

  return data as BadgeRecord
}

export async function checkAndAwardBadges(userId: string, cravingLevel: CravingOption) {
  const profile = await ensureProfile(userId)
  if (!profile) return [] as BadgeRecord[]

  const { data: existingRows, error: existingError } = await supabase
    .from('badges')
    .select('badge_type')
    .eq('user_id', userId)

  if (existingError) {
    console.error('Error fetching user badges', existingError)
    return []
  }

  const existingTypes = new Set<BadgeType>(
    (existingRows ?? []).map((row) => row.badge_type as BadgeType)
  )

  const awarded: BadgeRecord[] = []

  const { count: totalEntries } = await supabase
    .from('mood_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (!existingTypes.has('first_log') && (totalEntries ?? 0) === 1) {
    const badge = await insertBadge(userId, BADGE_DEFINITIONS.first_log)
    if (badge) {
      awarded.push(badge)
      existingTypes.add('first_log')
    }
  }

  let streakCurrent = 0
  if (profile.role === 'recovery') {
    const streak = await fetchRecoveryStreak(profile)
    streakCurrent = streak.current
    const thresholds: Array<[BadgeType, number]> = [
      ['streak_3', 3],
      ['streak_7', 7],
      ['streak_14', 14],
      ['streak_30', 30],
    ]

    for (const [type, minDays] of thresholds) {
      if (!existingTypes.has(type) && streakCurrent >= minDays) {
        const badge = await insertBadge(userId, BADGE_DEFINITIONS[type])
        if (badge) {
          awarded.push(badge)
          existingTypes.add(type)
        }
      }
    }
  } else if (profile.role === 'still_using') {
    const streak = await fetchLogBasedStreak(profile)
    streakCurrent = streak.current
    const thresholds: Array<[BadgeType, number]> = [
      ['streak_3', 3],
      ['streak_7', 7],
    ]

    for (const [type, minDays] of thresholds) {
      if (!existingTypes.has(type) && streakCurrent >= minDays) {
        const badge = await insertBadge(userId, BADGE_DEFINITIONS[type])
        if (badge) {
          awarded.push(badge)
          existingTypes.add(type)
        }
      }
    }
  }

  if (
    !existingTypes.has('bravery_log') &&
    (cravingLevel === 'strong' || cravingLevel === 'at_risk' || cravingLevel === 'used_today')
  ) {
    const badge = await insertBadge(userId, BADGE_DEFINITIONS.bravery_log, {
      craving_level: cravingLevel,
    })
    if (badge) {
      awarded.push(badge)
      existingTypes.add('bravery_log')
    }
  }

  return awarded
}

export async function fetchRecentBadges(limit = 3): Promise<BadgeRecord[]> {
  const current = await getCurrentUser()
  if (!current) return []

  const { data, error } = await supabase
    .from('badges')
    .select('id, badge_type, badge_name, description, icon, metadata, earned_at')
    .eq('user_id', current.id)
    .order('earned_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent badges', error)
    return []
  }

  return (data ?? []) as BadgeRecord[]
}
