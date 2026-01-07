'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getCurrentUser, updateUserProfile, type AuthUser } from '@/lib/auth'
import type { PrivacySettings } from '@/types/database'

type AsyncState = 'idle' | 'saving' | 'success' | 'error'

export default function SettingsPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [prefersAnonymous, setPrefersAnonymous] = useState(false)
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    show_mood_trends: true,
    show_craving_levels: true,
    show_notes: false,
    show_streak: true,
    show_badges: true,
  })
  const [status, setStatus] = useState<AsyncState>('idle')
  const [deleteState, setDeleteState] = useState<AsyncState>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getCurrentUser().then((profile) => {
      if (!profile) return
      setUser(profile)
      setPrefersAnonymous(profile.prefers_anonymous ?? false)
      setPrivacySettings({
        show_mood_trends: profile.privacy_settings?.show_mood_trends ?? true,
        show_craving_levels: profile.privacy_settings?.show_craving_levels ?? true,
        show_notes: profile.privacy_settings?.show_notes ?? false,
        show_streak: profile.privacy_settings?.show_streak ?? true,
        show_badges: profile.privacy_settings?.show_badges ?? true,
      })
    })
  }, [])

  const handleSave = async () => {
    if (!user) return
    setStatus('saving')
    setError(null)

    try {
      await updateUserProfile(user.id, {
        prefers_anonymous: prefersAnonymous,
        privacy_settings: privacySettings,
      })
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2500)
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong while saving your preferences.')
      setStatus('error')
    }
  }

  const handleDeleteData = async () => {
    if (!window.confirm('Deleting removes your profile, history, and badges. This cannot be undone. Continue?')) {
      return
    }

    setDeleteState('saving')
    setError(null)

    try {
      const response = await fetch('/api/user/delete', { method: 'DELETE' })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error ?? 'Could not delete your data right now.')
      }
      setDeleteState('success')
      window.location.href = '/'
    } catch (err: any) {
      setError(err.message ?? 'We could not delete your data.')
      setDeleteState('error')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="rounded-3xl border border-primary-100 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">Privacy & safeguards</h1>
          <p className="mt-2 text-sm text-gray-600">
            Own Recovery keeps AI as gentle guidance while humans stay in control. Review how you appear to supporters,
            and manage your data here.
          </p>
          <Link href="/dashboard" className="mt-4 inline-flex text-sm text-primary-600 underline">
            Back to dashboard
          </Link>
        </header>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <header>
            <h2 className="text-lg font-semibold text-gray-900">Anonymous mode</h2>
            <p className="mt-1 text-sm text-gray-600">
              Use a non-identifiable display name anywhere supporters might see your information.
            </p>
          </header>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              checked={prefersAnonymous}
              onChange={(event) => setPrefersAnonymous(event.target.checked)}
            />
            <span className="text-sm text-gray-700">
              Show me as “Anonymous” to supporters and hide identifying details. I acknowledge my supporters will still
              see mood and craving trends that I choose to share.
            </span>
          </label>

          <button
            type="button"
            onClick={handleSave}
            disabled={status === 'saving'}
            className="inline-flex items-center gap-2 self-start rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'saving' ? 'Saving…' : 'Save preference'}
          </button>

          {status === 'success' && (
            <p className="text-xs font-medium text-emerald-700">Preference saved. You stay in control.</p>
          )}
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <header>
            <h2 className="text-lg font-semibold text-gray-900">What supporters can see</h2>
            <p className="mt-1 text-sm text-gray-600">
              You stay in control. Choose which insights appear for the supporters you invite. We always explain when
              something is hidden so expectations stay clear.
            </p>
          </header>

          <PrivacyToggle
            label="Mood & energy trends"
            description="Share the mood chart so supporters can spot patterns and offer help at the right moments."
            checked={privacySettings.show_mood_trends}
            onChange={(value) =>
              setPrivacySettings((prev) => ({ ...prev, show_mood_trends: value }))
            }
          />

          <PrivacyToggle
            label="Cravings & stress levels"
            description="Allow supporters to see craving intensity and stress load so guidance stays grounded in what you’re feeling."
            checked={privacySettings.show_craving_levels}
            onChange={(value) =>
              setPrivacySettings((prev) => ({ ...prev, show_craving_levels: value }))
            }
          />

          <PrivacyToggle
            label="Personal notes"
            description="Keep written reflections private. When off, supporters know you logged a note but can’t read it."
            checked={privacySettings.show_notes}
            onChange={(value) => setPrivacySettings((prev) => ({ ...prev, show_notes: value }))}
          />

          <PrivacyToggle
            label="Sobriety or streak progress"
            description="Share your streak ring and milestone messages, or keep that progress personal."
            checked={privacySettings.show_streak}
            onChange={(value) => setPrivacySettings((prev) => ({ ...prev, show_streak: value }))}
          />

          <PrivacyToggle
            label="Badges & celebrations"
            description="Show celebrations and badges so supporters can celebrate wins with you."
            checked={privacySettings.show_badges}
            onChange={(value) => setPrivacySettings((prev) => ({ ...prev, show_badges: value }))}
          />

          <p className="text-xs text-gray-500">
            Changes apply instantly once you save. Supporters never see more than you allow, and every alert remains a
            suggestion—you choose what to act on.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
          <header>
            <h2 className="text-lg font-semibold text-rose-800">Delete my data</h2>
            <p className="mt-1 text-sm text-rose-700">
              This will delete your account, check-in history, badges, and supporter connections. You can always start
              fresh later.
            </p>
          </header>

          <button
            type="button"
            onClick={handleDeleteData}
            disabled={deleteState === 'saving'}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleteState === 'saving' ? 'Deleting…' : 'Delete everything and sign me out'}
          </button>

          <p className="text-xs text-rose-700">
            Advisory only: We recommend letting a supporter know before deleting so they understand why your data
            disappeared.
          </p>
        </section>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-semibold">We ran into an issue</p>
            <p className="mt-1">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function PrivacyToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50/80 p-4 transition hover:bg-gray-100">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="space-y-1 text-sm text-gray-700">
        <span className="block font-semibold text-gray-900">{label}</span>
        <span>{description}</span>
      </span>
    </label>
  )
}

