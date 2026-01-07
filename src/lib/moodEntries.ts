import { supabase } from './supabase'
import { checkAndAwardBadges, type BadgeRecord } from './badges'

export type MoodOption =
  | 'happy'
  | 'neutral'
  | 'sad'
  | 'anxious'
  | 'angry'
  | 'tired'
  | 'energized'

export type CravingOption = 'none' | 'mild' | 'strong' | 'at_risk' | 'used_today'
export type StressOption = 'low' | 'moderate' | 'high'
export type SleepOption = 'rested' | 'okay' | 'poor'

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

export const STRESS_CHOICES: Array<{ id: StressOption; label: string; description: string }> = [
  { id: 'low', label: 'Steady', description: 'Feeling grounded and steady' },
  { id: 'moderate', label: 'Tense', description: 'Noticeable tension or jitters' },
  { id: 'high', label: 'Overloaded', description: 'Stress feels heavy right now' },
]

export const SLEEP_CHOICES: Array<{ id: SleepOption; label: string; description: string }> = [
  { id: 'rested', label: 'Rested', description: 'Slept well and feel replenished' },
  { id: 'okay', label: 'Fair', description: 'Sleep was average or disrupted' },
  { id: 'poor', label: 'Rough', description: 'Sleep was short, restless, or absent' },
]

export interface CreateMoodEntryResult {
  entry: {
    id: string
    mood: MoodOption
    craving_level: CravingOption
    note: string | null
    stress_level: StressOption | null
    sleep_quality: SleepOption | null
    stress_trigger: string | null
    created_at: string
  }
  newBadges: BadgeRecord[]
}

export async function createMoodEntry({
  mood,
  craving,
  note,
  stress,
  sleep,
  stressTrigger,
}: {
  mood: MoodOption
  craving: CravingOption
  note?: string
  stress?: StressOption | null
  sleep?: SleepOption | null
  stressTrigger?: string | null
}): Promise<CreateMoodEntryResult> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('You must be signed in to log a mood entry.')
  }

  const safeNote = note?.trim() || null
  const safeTrigger = stressTrigger?.trim() || null

  // Guardrails keep notes concise so AI messaging stays explainable.
  if (safeNote && safeNote.length > 500) {
    throw new Error('Notes must be 500 characters or fewer to keep reflections focused.')
  }

  if (safeTrigger && safeTrigger.length > 120) {
    throw new Error('Trigger descriptions must be 120 characters or fewer.')
  }

  const { data, error } = await supabase
    .from('mood_entries')
    .insert({
      user_id: user.id,
      mood,
      craving_level: craving,
      note: safeNote,
      stress_level: stress ?? null,
      sleep_quality: sleep ?? null,
      stress_trigger: safeTrigger,
    })
    .select('id, mood, craving_level, note, created_at, stress_level, sleep_quality, stress_trigger')
    .single()

  if (error || !data) {
    throw error || new Error('No mood entry returned after insert.')
  }

  const newBadges = await checkAndAwardBadges(user.id, craving)

  return {
    entry: data as CreateMoodEntryResult['entry'],
    newBadges,
  }
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
    .select('id, mood, craving_level, note, created_at, stress_level, sleep_quality, stress_trigger')
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
  isoDate: string
  moodScore: number
  moodLabel: MoodOption
  cravingScore: number
  cravingLabel: CravingOption
  stressScore: number | null
  stressLabel: StressOption | null
  sleepScore: number | null
  sleepLabel: SleepOption | null
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
    .select('mood, craving_level, stress_level, sleep_quality, created_at')
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
    const stressLabel = (entry.stress_level as StressOption) ?? null
    const sleepLabel = (entry.sleep_quality as SleepOption) ?? null

    const moodScore = MOOD_SCORE_MAP[moodLabel] ?? 3
    const cravingScore =
      cravingLabel === 'used_today'
        ? 5
        : CRAVING_SCORE_MAP[cravingLabel as Exclude<CravingOption, 'used_today'>] ?? 3

    return {
      date: dateKey,
      isoDate: date.toISOString(),
      moodScore,
      moodLabel,
      cravingScore,
      stressScore:
        stressLabel === null
          ? null
          : stressLabel === 'low'
          ? 1
          : stressLabel === 'moderate'
          ? 3
          : 5,
      stressLabel,
      sleepScore:
        sleepLabel === null
          ? null
          : sleepLabel === 'rested'
          ? 5
          : sleepLabel === 'okay'
          ? 3
          : 1,
      sleepLabel,
      cravingLabel,
    }
  })

  return history
}

