'use client'

import { useState } from 'react'

interface AcceptInviteFormProps {
  onSubmit: (payload: { code: string; relationship_note?: string }) => Promise<void>
  submitting: boolean
  feedback?: {
    error?: string | null
    success?: string | null
  }
}

export function AcceptInviteForm({ onSubmit, submitting, feedback }: AcceptInviteFormProps) {
  const [code, setCode] = useState('')
  const [note, setNote] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onSubmit({ code, relationship_note: note.trim() ? note.trim() : undefined })
  }

  return (
    <section className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Join someone’s support circle</h2>
          <p className="mt-1 text-sm text-gray-600">
            Enter the six-character code your recovery partner sent you. We’ll add you as a
            supporter so you can see the insights they choose to share and offer encouragement.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[220px_1fr]">
          <div>
            <label htmlFor="support-invite-code" className="block text-sm font-medium text-gray-700">
              Invite code
            </label>
            <input
              id="support-invite-code"
              name="support-invite-code"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              required
              className="input-field mt-1 uppercase tracking-widest"
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="support-relationship" className="block text-sm font-medium text-gray-700">
              Relationship note (optional)
            </label>
            <textarea
              id="support-relationship"
              name="support-relationship"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Eg. Sponsor from 2024, weekly accountability buddy"
              maxLength={160}
              className="input-field mt-1"
              rows={3}
            />
            <p className="mt-1 text-xs text-gray-500">
              This note appears only inside the app so you both remember how you’re connected.
            </p>
          </div>
        </div>

        {feedback?.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {feedback.error}
          </div>
        )}

        {feedback?.success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {feedback.success}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full bg-secondary-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-secondary-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Connecting…' : 'Connect as supporter'}
          </button>
        </div>
      </form>
    </section>
  )
}

