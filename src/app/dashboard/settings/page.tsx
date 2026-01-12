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
      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#040511] via-[#0b1730] to-[#041029]" />
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[color:var(--accent-secondary)]" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#040511] via-[#0b1730] to-[#041029]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(110,64,255,0.18),transparent_55%)]" />
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="panel-light p-8">
          <h1 className="text-3xl font-bold text-primary">Privacy & safeguards</h1>
          <p className="mt-2 text-sm text-secondary">
            Own Recovery keeps AI as gentle guidance while humans stay in control. Review how you appear to supporters,
            and manage your data here.
          </p>
          <Link href="/dashboard" className="mt-4 inline-flex text-sm text-[color:var(--accent-secondary)] underline">
            Back to dashboard
          </Link>
        </header>

        <section className="panel-light space-y-4">
          <header>
            <h2 className="text-lg font-semibold text-primary">Anonymous mode</h2>
            <p className="mt-1 text-sm text-secondary">
              Use a non-identifiable display name anywhere supporters might see your information.
            </p>
          </header>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-[color:var(--border-soft)] bg-[rgba(29,38,64,0.72)] text-[color:var(--accent-secondary)] focus:ring-[color:var(--accent-secondary)]"
              checked={prefersAnonymous}
              onChange={(event) => setPrefersAnonymous(event.target.checked)}
            />
            <span className="text-sm text-secondary">
              Show me as “Anonymous” to supporters and hide identifying details. I acknowledge my supporters will still
              see mood and craving trends that I choose to share.
            </span>
          </label>

          <button
            type="button"
            onClick={handleSave}
            disabled={status === 'saving'}
            className="btn-primary inline-flex items-center gap-2 self-start px-5 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'saving' ? 'Saving…' : 'Save preference'}
          </button>

          {status === 'success' && (
            <p className="text-xs font-medium text-[color:#6df3c4]">Preference saved. You stay in control.</p>
          )}
        </section>

        <section className="panel-light space-y-4">
          <header>
            <h2 className="text-lg font-semibold text-primary">What supporters can see</h2>
            <p className="mt-1 text-sm text-secondary">
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

          <p className="text-xs text-secondary">
            Changes apply instantly once you save. Supporters never see more than you allow, and every alert remains a
            suggestion—you choose what to act on.
          </p>
        </section>

        <section className="rounded-3xl border border-[color:rgba(234,84,124,0.35)] bg-[color:rgba(70,24,38,0.65)] p-6 shadow-[0_30px_70px_-50px_rgba(234,84,124,0.35)] text-secondary">
          <header>
            <h2 className="text-lg font-semibold text-primary">Delete my data</h2>
            <p className="mt-1 text-sm text-secondary">
              This will delete your account, check-in history, badges, and supporter connections. You can always start
              fresh later.
            </p>
          </header>

          <button
            type="button"
            onClick={handleDeleteData}
            disabled={deleteState === 'saving'}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-[color:rgba(234,128,152,0.45)] bg-[rgba(74,26,38,0.75)] px-4 py-2 text-sm font-semibold text-primary shadow-[0_18px_45px_-28px_rgba(234,84,124,0.45)] transition hover:border-[color:rgba(234,156,176,0.6)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleteState === 'saving' ? 'Deleting…' : 'Delete everything and sign me out'}
          </button>

          <p className="text-xs text-secondary">
            Advisory only: We recommend letting a supporter know before deleting so they understand why your data
            disappeared.
          </p>
        </section>

        {error && (
          <div className="rounded-2xl border border-[color:rgba(234,128,152,0.45)] bg-[color:rgba(74,26,38,0.75)] p-4 text-sm text-primary">
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
    <label className="panel-light-muted flex items-start gap-3 transition hover:border-[color:var(--accent-secondary)]/45">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-[color:var(--border-soft)] bg-[rgba(29,38,64,0.72)] text-[color:var(--accent-secondary)] focus:ring-[color:var(--accent-secondary)]"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="space-y-1 text-sm text-secondary">
        <span className="block font-semibold text-primary">{label}</span>
        <span>{description}</span>
      </span>
    </label>
  )
}

