'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { getCurrentUser, type AuthUser } from '@/lib/auth'
import {
  acceptSupportInvite,
  fetchConnectionsSummary,
  generateSupportInvite,
  removeConnection,
  type ConnectionListResponse,
} from '@/lib/connections'
import { InviteCodePanel } from '@/components/connections/InviteCodePanel'
import { AcceptInviteForm } from '@/components/connections/AcceptInviteForm'
import { ConnectionList } from '@/components/connections/ConnectionList'

export default function ConnectionsPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [summary, setSummary] = useState<ConnectionListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteMessage, setInviteMessage] = useState<string | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [generateLoading, setGenerateLoading] = useState(false)
  const [acceptSubmitting, setAcceptSubmitting] = useState(false)
  const [acceptFeedback, setAcceptFeedback] = useState<{ error?: string | null; success?: string | null }>({})
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    getCurrentUser()
      .then((profile) => setUser(profile))
      .catch(() => setUser(null))
  }, [])

  const refreshConnections = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchConnectionsSummary()
      setSummary(data)
    } catch (err: any) {
      setError(err.message ?? 'We could not load your connections right now.')
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshConnections()
  }, [refreshConnections])

  const handleGenerateInvite = async () => {
    setInviteError(null)
    setInviteMessage(null)
    setGenerateLoading(true)

    try {
      const result = await generateSupportInvite()
      setSummary((current) =>
        current
          ? {
              ...current,
              pendingInvite: {
                code: result.code,
                expires_at: result.expires_at,
              },
            }
          : {
              role: user?.role ?? null,
              asRecovery: [],
              asSupporter: [],
              pendingInvite: {
                code: result.code,
                expires_at: result.expires_at,
              },
            }
      )
      setInviteMessage('Code ready. Share it with someone you trust within the next 24 hours.')
    } catch (err: any) {
      setInviteError(err.message ?? 'We could not generate a code right now.')
    } finally {
      setGenerateLoading(false)
    }
  }

  const handleAcceptInvite = async ({ code, relationship_note }: { code: string; relationship_note?: string }) => {
    setAcceptSubmitting(true)
    setAcceptFeedback({})
    try {
      await acceptSupportInvite({ code, relationship_note })
      setAcceptFeedback({
        success: 'Connection confirmed. You can now view the shared insights in your dashboard.',
      })
      await refreshConnections()
    } catch (err: any) {
      setAcceptFeedback({
        error: err.message ?? 'We could not accept that code. Double-check it and try again.',
      })
    } finally {
      setAcceptSubmitting(false)
    }
  }

  const handleRemoveConnection = async (connectionId: string) => {
    setRemovingId(connectionId)
    try {
      await removeConnection(connectionId)
      await refreshConnections()
    } catch (err: any) {
      setError(err.message ?? 'We could not remove that connection. Try again in a moment.')
    } finally {
      setRemovingId(null)
    }
  }

  if (loading && !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-b-2 border-primary-600" />
          <p className="text-sm text-gray-600">Gathering your support circle…</p>
        </div>
      </div>
    )
  }

  if (error && !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-md rounded-2xl bg-white p-6 text-center shadow">
          <p className="text-base font-semibold text-gray-900">We couldn’t load your connections.</p>
          <p className="mt-2 text-sm text-gray-600">{error}</p>
          <button
            type="button"
            onClick={refreshConnections}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  const activeSummary = summary ?? {
    role: user?.role ?? null,
    asRecovery: [],
    asSupporter: [],
    pendingInvite: {
      code: null,
      expires_at: null,
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="rounded-2xl border border-primary-100 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Build your support circle
              </h1>
              <p className="mt-2 text-gray-600">
                Own Recovery keeps humans in the loop. Invite trusted supporters, share only the
                insights you’re comfortable sharing, and stay in control of every connection.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 shadow-sm transition hover:bg-primary-100"
            >
              Back to dashboard
            </Link>
          </div>
        </header>

        {activeSummary.role === 'recovery' && (
          <InviteCodePanel
            code={activeSummary.pendingInvite.code}
            expiresAt={activeSummary.pendingInvite.expires_at}
            generating={generateLoading}
            onGenerate={handleGenerateInvite}
          />
        )}

        {inviteError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {inviteError}
          </div>
        )}
        {inviteMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {inviteMessage}
          </div>
        )}

        {activeSummary.role === 'supporter' && (
          <AcceptInviteForm
            onSubmit={handleAcceptInvite}
            submitting={acceptSubmitting}
            feedback={acceptFeedback}
          />
        )}

        {activeSummary.role === 'still_using' && (
          <section className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Support circle coming soon</h2>
            <p className="mt-2 text-sm text-gray-600">
              We’re designing a tailored support experience for members who are still using. For
              now, you can stay connected with supporters through shared resources and check-ins.
            </p>
          </section>
        )}

        {(activeSummary.role === 'recovery' || activeSummary.asRecovery.length > 0) && (
          <ConnectionList
            title="Your supporters"
            description="People you’ve invited into your recovery journey."
            emptyState={{
              headline: 'No supporters yet',
              message: 'Generate a code to invite someone you trust into your recovery circle.',
            }}
            connections={activeSummary.asRecovery}
            onRemove={handleRemoveConnection}
            removingId={removingId}
            removeLabel="Remove supporter"
          />
        )}

        {(activeSummary.role === 'supporter' || activeSummary.asSupporter.length > 0) && (
          <ConnectionList
            title="People you support"
            description="You’ll see gentle alerts and trends they choose to share."
            emptyState={{
              headline: 'No connections yet',
              message: 'Add a code from a recovery partner to show up as their supporter.',
            }}
            connections={activeSummary.asSupporter}
            onRemove={handleRemoveConnection}
            removingId={removingId}
            removeLabel="Leave this circle"
          />
        )}
      </div>
    </div>
  )
}

