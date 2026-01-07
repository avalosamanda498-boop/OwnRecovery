'use client'

import { useEffect, useState } from 'react'
import {
  createMoodEntry,
  fetchLatestMoodEntry,
  MOOD_CHOICES,
  CRAVING_CHOICES,
  STRESS_CHOICES,
  SLEEP_CHOICES,
  MoodOption,
  CravingOption,
  StressOption,
  SleepOption,
} from '@/lib/moodEntries'
import type { BadgeRecord } from '@/lib/badges'
import { BadgeCelebrationToast } from '@/components/badges/BadgeCelebrationToast'
import { AuthUser } from '@/lib/auth'

interface MoodCravingLoggerProps {
  user: AuthUser
  roleCopy: {
    title: string
    subtitle: string
    success: string
  }
  showCravings?: boolean
  cravingTitle?: string
  onBadgeAwarded?: (badges: BadgeRecord[]) => void
  showLatestEntry?: boolean
}

interface MoodEntrySummary {
  mood: string
  craving_level: string
  note: string | null
  stress_level: string | null
  sleep_quality: string | null
  stress_trigger: string | null
  created_at: string
}

export default function MoodCravingLogger({
  user,
  roleCopy,
  showCravings = true,
  cravingTitle = 'Craving check-in',
  onBadgeAwarded,
  showLatestEntry = true,
}: MoodCravingLoggerProps) {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null)
  const [selectedCraving, setSelectedCraving] = useState<CravingOption | null>(showCravings ? null : 'none')
  const [selectedStress, setSelectedStress] = useState<StressOption | null>(null)
  const [selectedSleep, setSelectedSleep] = useState<SleepOption | null>(null)
  const [note, setNote] = useState('')
  const [stressTrigger, setStressTrigger] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [latestEntry, setLatestEntry] = useState<MoodEntrySummary | null>(null)
  const [earnedBadges, setEarnedBadges] = useState<BadgeRecord[]>([])

  useEffect(() => {
    if (!showLatestEntry) return
    fetchLatestMoodEntry()
      .then((entry) => {
        if (entry) {
          setLatestEntry(entry as MoodEntrySummary)
        }
      })
      .catch(() => {
        // ignore initial load errors
      })
  }, [showLatestEntry])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedMood) return

    const cravingToSave: CravingOption = showCravings
      ? selectedCraving ?? 'none'
      : 'none'

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const result = await createMoodEntry({
        mood: selectedMood,
        craving: cravingToSave,
        note,
        stress: selectedStress,
        sleep: selectedSleep,
        stressTrigger: stressTrigger || undefined,
      })

      setSuccess(roleCopy.success)
      setEarnedBadges(result.newBadges)
      if (result.newBadges.length > 0) {
        onBadgeAwarded?.(result.newBadges)
      }
      setLatestEntry(result.entry as MoodEntrySummary)
      setSelectedMood(null)
      setSelectedCraving(showCravings ? null : 'none')
      setSelectedStress(null)
      setSelectedSleep(null)
      setNote('')
      setStressTrigger('')
    } catch (err: any) {
      setError(err.message || 'Something went wrong while saving your entry.')
    } finally {
      setSubmitting(false)
    }
  }

  const buttonDisabled =
    !selectedMood ||
    (showCravings && !selectedCraving) ||
    !selectedStress ||
    !selectedSleep ||
    submitting

  return (
    <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{roleCopy.title}</h2>
        <p className="mt-1 text-sm text-gray-600">{roleCopy.subtitle}</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Track stress in plain language so these nudges stay explainable. */}
        {/* Sleep quality helps contextualize stress trends without guessing. */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">How are you feeling right now?</h3>
          <div className="flex flex-wrap gap-3">
            {MOOD_CHOICES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedMood(option.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-colors ${
                  selectedMood === option.id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 hover:border-primary-300'
                }`}
              >
                <span className="text-xl">{option.emoji}</span>
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {showCravings && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">{cravingTitle}</h3>
            <div className="flex flex-wrap gap-2">
              {CRAVING_CHOICES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedCraving(option.id)}
                  className={`px-3 py-2 rounded-full border text-sm transition-colors ${
                    selectedCraving === option.id ? 'border-danger-500 bg-danger-50 text-danger-700' : 'border-gray-300 hover:border-danger-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">How heavy is stress today?</h3>
          <div className="grid gap-2 md:grid-cols-3">
            {STRESS_CHOICES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedStress(option.id)}
                className={`rounded-2xl border px-3 py-3 text-left transition-colors ${
                  selectedStress === option.id
                    ? 'border-warning-500 bg-warning-50 text-warning-800 shadow-sm'
                    : 'border-gray-300 text-gray-700 hover:border-warning-300'
                }`}
              >
                <p className="text-sm font-semibold">{option.label}</p>
                <p className="mt-1 text-xs text-gray-600">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">How did you sleep?</h3>
          <div className="grid gap-2 md:grid-cols-3">
            {SLEEP_CHOICES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedSleep(option.id)}
                className={`rounded-2xl border px-3 py-3 text-left transition-colors ${
                  selectedSleep === option.id
                    ? 'border-primary-500 bg-primary-50 text-primary-800 shadow-sm'
                    : 'border-gray-300 text-gray-700 hover:border-primary-300'
                }`}
              >
                <p className="text-sm font-semibold">{option.label}</p>
                <p className="mt-1 text-xs text-gray-600">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Optional trigger context gives supporters actionable information. */}
        <div>
          <label htmlFor="mood-note" className="block text-sm font-medium text-gray-700">
            Notes (optional)
          </label>
          <textarea
            id="mood-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a quick reflection, trigger, or win you want to remember."
            className="input-field mt-1 h-24 resize-none"
          />
        </div>

        <div>
          <label htmlFor="stress-trigger" className="block text-sm font-medium text-gray-700">
            Noticing what’s adding pressure? (optional)
          </label>
          <input
            id="stress-trigger"
            type="text"
            maxLength={120}
            value={stressTrigger}
            onChange={(e) => setStressTrigger(e.target.value)}
            placeholder="e.g., Big meeting tomorrow, difficult conversation, feeling isolated"
            className="input-field mt-1"
          />
          <p className="mt-1 text-xs text-gray-500">Sharing triggers helps the app surface more relevant guidance.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <BadgeCelebrationToast badges={earnedBadges} onClose={() => setEarnedBadges([])} />

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={buttonDisabled}
            className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving...' : 'Log this moment'}
          </button>
        </div>
      </form>

      {showLatestEntry && latestEntry && (
        <div className="rounded-xl border border-gray-200 p-4 bg-gray-50 text-sm text-gray-700">
          <p>
            <span className="font-medium text-gray-900">Last entry:</span>{' '}
            {new Date(latestEntry.created_at).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
          <p className="mt-1">
            Mood: <span className="font-medium capitalize">{latestEntry.mood.replace('_', ' ')}</span>
          </p>
          <p className="mt-1">
            Check-in:{' '}
            <span className="font-medium capitalize">
              {showCravings
                ? latestEntry.craving_level.replace('_', ' ')
                : latestEntry.craving_level === 'none'
                ? 'No stress logged'
                : latestEntry.craving_level.replace('_', ' ')}
            </span>
          </p>
          <p className="mt-1">
            Stress:{' '}
            <span className="font-medium capitalize">
              {latestEntry.stress_level ? latestEntry.stress_level.replace('_', ' ') : 'Not logged'}
            </span>
          </p>
          <p className="mt-1">
            Sleep:{' '}
            <span className="font-medium capitalize">
              {latestEntry.sleep_quality ? latestEntry.sleep_quality.replace('_', ' ') : 'Not logged'}
            </span>
          </p>
          {latestEntry.stress_trigger && (
            <p className="mt-1 text-xs text-gray-600">
              <span className="font-medium text-gray-700">Trigger: </span>
              {latestEntry.stress_trigger}
            </p>
          )}
          {latestEntry.note && <p className="mt-2 italic text-gray-600">“{latestEntry.note}”</p>}
        </div>
      )}
    </section>
  )
}

