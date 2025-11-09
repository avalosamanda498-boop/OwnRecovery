import { supabase } from './supabase'

export type MoodOption =
  | 'happy'
  | 'neutral'
  | 'sad'
  | 'anxious'
  | 'angry'
  | 'tired'
  | 'energized'

export type CravingOption = 'none' | 'mild' | 'strong' | 'at_risk' | 'used_today'

export const MOOD_CHOICES: Array<{ id: MoodOption; label: string; emoji: string }> = [
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'neutral', label: 'Neutral', emoji: '😐' },
  { id: 'sad', label: 'Sad', emoji: '😢' },
  { id: 'anxious', label: 'Anxious', emoji: '😰' },
  { id: 'angry', label: 'Angry', emoji: '😡' },
  { id: 'tired', label: 'Tired', emoji: '😴' },
  { id: 'energized', label: 'Energized', emoji: '⚡' },
]

export const CRAVING_CHOICES: Array<{ id: CravingOption; label: string }> = [
  { id: 'none', label: 'No cravings' },
  { id: 'mild', label: 'Mild urge' },
  { id: 'strong', label: 'Strong urge' },
  { id: 'at_risk', label: 'At risk of relapse' },
  { id: 'used_today', label: 'I used today' },
]

export async function createMoodEntry({
  mood,
  craving,
  note,
}: {
  mood: MoodOption
  craving: CravingOption
  note?: string
}) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('You must be signed in to log a mood entry.')
  }

  const { data, error } = await supabase
    .from('mood_entries')
    .insert({
      user_id: user.id,
      mood,
      craving_level: craving,
      note: note?.trim() || null,
    })
    .select('id, mood, craving_level, note, created_at')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function fetchLatestMoodEntry() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('You must be signed in to view mood entries.')
  }

  const { data, error } = await supabase
    .from('mood_entries')
    .select('id, mood, craving_level, note, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

const MOOD_SCORE_MAP: Record<MoodOption, number> = {
  happy: 5,
  neutral: 3,
  sad: 1,
  anxious: 2,
  angry: 2,
  tired: 2,
  energized: 4,
}

const CRAVING_SCORE_MAP: Record<Exclude<CravingOption, 'used_today'>, number> = {
  none: 1,
  mild: 2,
  strong: 4,
  at_risk: 5,
}

export interface MoodHistoryPoint {
  date: string
  moodScore: number
  moodLabel: MoodOption
  cravingScore: number
  cravingLabel: CravingOption
}

export async function fetchMoodHistory(days: number): Promise<MoodHistoryPoint[]> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('You must be signed in to view mood history.')
  }

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - (days - 1))

  const { data, error } = await supabase
    .from('mood_entries')
    .select('mood, craving_level, created_at')
    .eq('user_id', user.id)
    .gte('created_at', cutoff.toISOString())
    .order('created_at', { ascending: true })

  if (error) throw error

  if (!data) return []

  const history = data.map((entry) => {
    const date = new Date(entry.created_at)
    const dateKey = date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })

    const moodLabel = entry.mood as MoodOption
    const cravingLabel = entry.craving_level as CravingOption

    const moodScore = MOOD_SCORE_MAP[moodLabel] ?? 3
    const cravingScore =
      cravingLabel === 'used_today'
        ? 5
        : CRAVING_SCORE_MAP[cravingLabel as Exclude<CravingOption, 'used_today'>] ?? 3

    return {
      date: dateKey,
      moodScore,
      moodLabel,
      cravingScore,
      cravingLabel,
    }
  })

  return history
}

