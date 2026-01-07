'use client'

import { useMemo } from 'react'
import {
  computeInviteExpiry,
  formatInviteCodeForDisplay,
  isInviteExpired,
} from '@/lib/inviteCodes'

interface InviteCodePanelProps {
  code: string | null
  expiresAt: string | null
  generating: boolean
  onGenerate: () => Promise<void> | void
}

export function InviteCodePanel({ code, expiresAt, generating, onGenerate }: InviteCodePanelProps) {
  const { displayCode, statusLabel, expiresLabel } = useMemo(() => {
    if (!code) {
      return {
        displayCode: null,
        statusLabel: 'No active code',
        expiresLabel: null,
      }
    }

    const expired = isInviteExpired(expiresAt ?? undefined)
    const display = formatInviteCodeForDisplay(code)
    const expiryText = expiresAt
      ? new Date(expiresAt).toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : new Date(computeInviteExpiry()).toLocaleString()

    return {
      displayCode: display,
      statusLabel: expired ? 'Expired' : 'Active',
      expiresLabel: expired ? 'Expired — generate a fresh code' : `Expires ${expiryText}`,
    }
  }, [code, expiresAt])

  return (
    <section className="rounded-2xl border border-primary-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">Invite a supporter</h2>
          <p className="text-sm text-gray-600">
            Share this short code with someone you trust. They’ll add it in their dashboard to connect. We keep guidance
            gentle and human-led—only the people you approve can view the insights you choose to share.
          </p>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={generating}
          className="inline-flex items-center justify-center rounded-full border border-primary-300 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 transition hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {generating ? 'Generating…' : code ? 'Regenerate code' : 'Create invite code'}
        </button>
      </div>

      <div className="mt-5 rounded-xl border border-dashed border-primary-200 bg-primary-50/70 p-4">
        {displayCode ? (
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
                Give this code to your supporter
              </p>
              <p className="mt-1 text-3xl font-bold text-primary-900">{displayCode}</p>
            </div>
            <div className="text-sm text-primary-700">
              <p className="font-medium">Status: {statusLabel}</p>
              {expiresLabel && <p>{expiresLabel}</p>}
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm text-gray-600">
            <p>No code yet. Tap “Create invite code” to share a secure, 24-hour code with a friend.</p>
            <p>Generated codes expire quickly to keep your circle private and predictable.</p>
          </div>
        )}
      </div>
    </section>
  )
}

