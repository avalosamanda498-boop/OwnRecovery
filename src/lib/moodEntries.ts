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

