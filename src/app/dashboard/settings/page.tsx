'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getCurrentUser, updateUserProfile, type AuthUser } from '@/lib/auth'

type AsyncState = 'idle' | 'saving' | 'success' | 'error'

export default function SettingsPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [prefersAnonymous, setPrefersAnonymous] = useState(false)
  const [status, setStatus] = useState<AsyncState>('idle')
  const [deleteState, setDeleteState] = useState<AsyncState>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getCurrentUser().then((profile) => {
      if (!profile) return
      setUser(profile)
      setPrefersAnonymous(profile.prefers_anonymous ?? false)
    })
  }, [])

  const handleSave = async () => {
    if (!user) return
    setStatus('saving')
    setError(null)

    try {
      await updateUserProfile(user.id, {
        prefers_anonymous: prefersAnonymous,
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
            Own Recovery keeps AI advisory and humans in control. Review how you appear to supporters, and manage your
            data here.
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

