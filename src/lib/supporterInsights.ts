import { authedFetch } from '@/lib/authedFetch'
import type { PrivacySettings } from '@/types/database'
import type { MoodOption, CravingOption, StressOption, SleepOption } from '@/lib/moodEntries'

export interface SupporterConnectionInsight {
  connection_id: string
  recovery_user_id: string
  display_name: string
  prefers_anonymous: boolean
  relationship_note?: string | null
  connected_at: string
  privacy: PrivacySettings
  last_check_in: {
    created_at: string
    mood_label: MoodOption | string | null
    mood_hidden: boolean
    craving_label: CravingOption | string | null
    craving_hidden: boolean
    stress_label: StressOption | string | null
    stress_hidden: boolean
    sleep_label: SleepOption | string | null
    sleep_hidden: boolean
  } | null
  nudge: {
    allowed: boolean
    reason: 'never_logged' | 'overdue' | 'recent' | 'no_shared_data'
    days_since?: number | null
    last_sent_at?: string | null
    retry_after_hours?: number | null
    next_available_at?: string | null
  }
}

export async function fetchSupporterConnectionInsights(): Promise<SupporterConnectionInsight[]> {
  const response = await authedFetch('/api/supporter/insights', {
    method: 'GET',
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload?.error ?? 'We could not load supporter insights right now.')
  }

  return (payload.connections ?? []) as SupporterConnectionInsight[]
}

