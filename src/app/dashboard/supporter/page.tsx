'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import MoodCravingLogger from '@/components/tracking/MoodCravingLogger'
import MoodTrendChart from '@/components/tracking/MoodTrendChart'
import { RecentBadges } from '@/components/badges/RecentBadges'
import { AdvisoryPanel } from '@/components/dashboard/AdvisoryPanel'
import { EncouragementComposer } from '@/components/support/EncouragementComposer'
import { getCurrentUser, type AuthUser } from '@/lib/auth'
import { fetchConnectionsSummary, type ConnectionSummary } from '@/lib/connections'
import { fetchMoodHistory, type MoodHistoryPoint } from '@/lib/moodEntries'
import type { BadgeRecord } from '@/lib/badges'

export default function SupporterDashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [history, setHistory] = useState<MoodHistoryPoint[]>([])
  const [range, setRange] = useState<7 | 14 | 30>(7)
  const [badgeRefreshKey, setBadgeRefreshKey] = useState(0)
  const [latestBadges, setLatestBadges] = useState<BadgeRecord[]>([])
  const [connections, setConnections] = useState<ConnectionSummary[]>([])
  const [connectionsLoading, setConnectionsLoading] = useState(true)
  const [connectionsError, setConnectionsError] = useState<string | null>(null)

  useEffect(() => {
    getCurrentUser().then((profile) => {
      setUser(profile)
    })
  }, [])

  useEffect(() => {
    fetchMoodHistory(range)
      .then(setHistory)
      .catch(() => setHistory([]))
  }, [range])

  const refreshConnections = useCallback(() => {
    setConnectionsLoading(true)
    setConnectionsError(null)
    fetchConnectionsSummary()
      .then((summary) => {
        const accepted = summary.asSupporter.filter((connection) => connection.status === 'accepted')
        setConnections(accepted)
      })
      .catch((err: any) => {
        setConnectionsError(err.message ?? 'We could not load your support circle.')
        setConnections([])
      })
      .finally(() => setConnectionsLoading(false))
  }, [])

  useEffect(() => {
    refreshConnections()
  }, [refreshConnections])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-support-gradient/10 to-primary-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-support-gradient/10 to-primary-50 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="bg-white border border-success-100 rounded-2xl shadow-sm p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Thank you for showing up</h1>
              <p className="mt-2 text-gray-600">
                This dashboard will soon track everyone you’re supporting, share encouragement prompts, and surface resources just for loved ones and allies.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                href="/dashboard/connections"
                className="inline-flex items-center gap-2 rounded-full border border-success-200 bg-success-50 px-4 py-2 text-sm font-medium text-success-700 shadow-sm transition hover:bg-success-100"
              >
                Support circle
              </Link>
              <Link
                href="/dashboard/settings"
                className="inline-flex items-center gap-2 rounded-full border border-success-200 bg-success-50 px-4 py-2 text-sm font-medium text-success-700 shadow-sm transition hover:bg-success-100"
              >
                Privacy &amp; data controls
              </Link>
            </div>
          </div>
        </header>

        <MoodCravingLogger
          user={user}
          roleCopy={{
            title: 'How are you holding up?',
            subtitle: 'Supporters need care too. Log a quick check-in so we can surface resources that help you stay grounded.',
            success: 'Thanks for taking a moment for yourself. We’ll use these check-ins to keep you supported as well.',
          }}
          showCravings={false}
          onBadgeAwarded={(badges) => {
            setBadgeRefreshKey((value) => value + 1)
            setLatestBadges(badges)
          }}
        />

        <AdvisoryPanel range={7} />

        <RecentBadges
          refreshKey={badgeRefreshKey}
          latestBadges={latestBadges}
          title="Support milestones"
          emptyMessage="Your first supporter badge appears after your next few reflections."
        />

        <EncouragementComposer
          connections={connections}
          onSent={refreshConnections}
        />

        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Your well-being trends</h2>
              <p className="text-sm text-gray-600">
                Notice how your mood shifts as you support someone else. Taking care of you helps them too.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {[7, 14, 30].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRange(value as 7 | 14 | 30)}
                  className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                    range === value
                      ? 'border-success-500 bg-success-50 text-success-700'
                      : 'border-gray-300 text-gray-600 hover-border-success-300'
                  }`}
                >
                  Last {value} days
                </button>
              ))}
            </div>
          </div>
          <MoodTrendChart data={history} rangeLabel={`${range} days`} />
        </section>

        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-gray-900">Who you’re supporting</h2>
            <p className="text-sm text-gray-600">
              Only shows people who invited you. We hide details they keep private, but you’ll know when to reach out.
            </p>
          </div>

          {connectionsLoading ? (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-success-500" />
              Loading your support circle…
            </div>
          ) : connectionsError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{connectionsError}</div>
          ) : connections.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-sm text-gray-600">
              No active connections yet. Ask your friend to share their invite code when they’re ready for encouragement.
            </div>
          ) : (
            <ul className="space-y-3">
              {connections.map((connection) => (
                <li key={connection.id} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  <p className="font-semibold text-gray-900">
                    {connection.partner.prefers_anonymous
                      ? 'Anonymous friend'
                      : connection.partner.display_name || 'Recovery partner'}
                  </p>
                  {connection.relationship_note && <p className="mt-1 text-gray-600">{connection.relationship_note}</p>}
                  <p className="mt-1 text-xs text-gray-500">
                    Connected{' '}
                    {new Date(connection.created_at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Supporter tools on the way</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 list-disc list-inside">
              <li>Encouragement prompts you can send with one tap.</li>
              <li>When to check in—gentle nudges and milestones.</li>
              <li>Shared resources (articles, groups, crisis lines).</li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Need help yourself?</h2>
            <p className="mt-2 text-sm text-gray-600">
              Caregivers need support too. We’ll surface ally groups, therapist directories, and quick tips for staying grounded while you show up for someone else.
            </p>
            <Link
              href="#"
              className="mt-4 inline-flex items-center justify-center px-5 py-2 rounded-xl bg-success-600 hover:bg-success-700 text-white text-sm font-semibold transition-colors"
            >
              Supporter resources (coming soon)
            </Link>
          </div>
        </section>

        <footer className="text-center text-sm text-gray-500">
          Placeholder dashboard — more features arriving in the next milestone.
        </footer>
      </div>
    </div>
  )
}

