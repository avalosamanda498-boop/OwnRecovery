'use client'

import { useEffect, useState } from 'react'
import { createMoodEntry, fetchLatestMoodEntry, MOOD_CHOICES, CRAVING_CHOICES, MoodOption, CravingOption } from '@/lib/moodEntries'
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
}

interface MoodEntrySummary {
  mood: string
  craving_level: string
  note: string | null
  created_at: string
}

export default function MoodCravingLogger({
  user,
  roleCopy,
  showCravings = true,
  cravingTitle = 'Craving check-in',
}: MoodCravingLoggerProps) {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null)
  const [selectedCraving, setSelectedCraving] = useState<CravingOption | null>(showCravings ? null : 'none')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [latestEntry, setLatestEntry] = useState<MoodEntrySummary | null>(null)

  useEffect(() => {
    fetchLatestMoodEntry()
      .then((entry) => {
        if (entry) {
          setLatestEntry(entry as MoodEntrySummary)
        }
      })
      .catch(() => {
        // ignore initial load errors
      })
  }, [])

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
      const entry = await createMoodEntry({
        mood: selectedMood,
        craving: cravingToSave,
        note,
      })

      setSuccess(roleCopy.success)
      setLatestEntry(entry as MoodEntrySummary)
      setSelectedMood(null)
      setSelectedCraving(showCravings ? null : 'none')
      setNote('')
    } catch (err: any) {
      setError(err.message || 'Something went wrong while saving your entry.')
    } finally {
      setSubmitting(false)
    }
  }

  const buttonDisabled = !selectedMood || (showCravings && !selectedCraving) || submitting

  return (
    <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{roleCopy.title}</h2>
        <p className="mt-1 text-sm text-gray-600">{roleCopy.subtitle}</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
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

      {latestEntry && (
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
          {latestEntry.note && <p className="mt-2 italic text-gray-600">“{latestEntry.note}”</p>}
        </div>
      )}
    </section>
  )
}

