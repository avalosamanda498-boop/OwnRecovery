'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import MoodCravingLogger from '@/components/tracking/MoodCravingLogger'
import MoodTrendChart from '@/components/tracking/MoodTrendChart'
import { AdvisoryPanel } from '@/components/dashboard/AdvisoryPanel'
import { EncouragementComposer } from '@/components/support/EncouragementComposer'
import { SupporterConnectionCard } from '@/components/support/SupporterConnectionCard'
import { getCurrentUser, type AuthUser } from '@/lib/auth'
import { fetchMoodHistory, type MoodHistoryPoint } from '@/lib/moodEntries'
import {
  fetchSupporterConnectionInsights,
  type SupporterConnectionInsight,
} from '@/lib/supporterInsights'

export default function SupporterDashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [history, setHistory] = useState<MoodHistoryPoint[]>([])
  const [range, setRange] = useState<7 | 14 | 30>(7)
  const [insights, setInsights] = useState<SupporterConnectionInsight[]>([])
  const [insightsLoading, setInsightsLoading] = useState(true)
  const [insightsError, setInsightsError] = useState<string | null>(null)
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null)

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

  const loadInsights = useCallback(() => {
    setInsightsLoading(true)
    setInsightsError(null)
    fetchSupporterConnectionInsights()
      .then((data) => {
        setInsights(data)
        setSelectedRecipient((current) => {
          if (data.length === 0) {
            return null
          }
          if (!current) {
            return data[0].recovery_user_id
          }
          return data.some((item) => item.recovery_user_id === current)
            ? current
            : data[0].recovery_user_id
        })
      })
      .catch((err: any) => {
        setInsightsError(err.message ?? 'We could not load your support circle.')
        setInsights([])
        setSelectedRecipient(null)
      })
      .finally(() => setInsightsLoading(false))
  }, [])

  useEffect(() => {
    loadInsights()
  }, [loadInsights])

  if (!user) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-950/85 via-[#071129]/85 to-[#031220]" />
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-neon-cyan" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-950/85 via-[#071129]/85 to-[#031220] opacity-95" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_22%_24%,rgba(21,197,226,0.22),transparent_58%)]" />
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="panel-light p-8 shadow-[0_35px_90px_-45px_rgba(0,242,254,0.35)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-primary">Thank you for showing up</h1>
              <p className="mt-2 text-secondary">
                This dashboard will soon track everyone you’re supporting, share encouragement prompts, and surface resources just for loved ones and allies.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="/dashboard/connections"
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-soft)] bg-[color:rgba(32,38,66,0.75)] px-4 py-2 text-sm font-medium text-primary transition hover:border-[color:var(--accent-secondary)]/45"
              >
                Support circle
              </Link>
              <Link
                href="/dashboard/resources"
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-soft)] bg-[color:rgba(32,38,66,0.75)] px-4 py-2 text-sm font-medium text-primary transition hover:border-[color:var(--accent-secondary)]/45"
              >
                Resource library
              </Link>
              <Link
                href="/dashboard/settings"
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-soft)] bg-[color:rgba(32,38,66,0.75)] px-4 py-2 text-sm font-medium text-primary transition hover:border-[color:var(--accent-secondary)]/45"
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
          showLatestEntry={false}
        />

        <AdvisoryPanel range={7} />

        <EncouragementComposer
          connections={insights.map((connection) => ({
            recovery_user_id: connection.recovery_user_id,
            display_name: connection.display_name,
            prefers_anonymous: connection.prefers_anonymous,
          }))}
          initialRecoveryUserId={selectedRecipient}
          onSent={loadInsights}
        />

        <section className="panel-light space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-primary">Your well-being trends</h2>
              <p className="text-sm text-secondary">
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
                      ? 'border-[color:rgba(60,213,255,0.65)] bg-[color:rgba(28,46,70,0.6)] text-[color:var(--accent-secondary)]'
                      : 'border-[color:var(--border-soft)] text-secondary hover:border-[color:rgba(60,213,255,0.4)]'
                  }`}
                >
                  Last {value} days
                </button>
              ))}
            </div>
          </div>
          <MoodTrendChart data={history} rangeLabel={`${range} days`} />
        </section>

        <section className="panel-light space-y-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-primary">Who you’re supporting</h2>
            <p className="text-sm text-secondary">
              Only shows people who invited you. We hide details they keep private, but you’ll know when to reach out.
            </p>
          </div>

          {insightsLoading ? (
            <div className="flex items-center gap-3 text-sm text-secondary">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-[color:var(--accent-secondary)]" />
              Loading your support circle…
            </div>
          ) : insightsError ? (
            <div className="rounded-xl border border-[color:rgba(234,128,152,0.45)] bg-[color:rgba(74,26,38,0.75)] px-4 py-3 text-sm text-primary">
              {insightsError}
            </div>
          ) : insights.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[color:var(--border-soft)] bg-[color:rgba(32,38,66,0.65)] px-4 py-4 text-sm text-secondary">
              No active connections yet. Ask your friend to share their invite code when they’re ready for encouragement.
            </div>
          ) : (
            <ul className="space-y-3">
              {insights.map((connection) => (
                <li key={connection.connection_id}>
                  <SupporterConnectionCard
                    insight={connection}
                    onSendEncouragement={(recoveryUserId) => setSelectedRecipient(recoveryUserId)}
                    onNudgeSent={loadInsights}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="panel-light h-full">
            <h2 className="text-lg font-semibold text-primary">Supporter tools on the way</h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-secondary">
              <li>Encouragement prompts you can send with one tap.</li>
              <li>When to check in—gentle nudges and milestones.</li>
              <li>Shared resources (articles, groups, crisis lines).</li>
            </ul>
          </div>

          <div className="panel-light h-full">
            <h2 className="text-lg font-semibold text-primary">Need help yourself?</h2>
            <p className="mt-2 text-sm text-secondary">
              Caregivers need support too. We’ll surface ally groups, therapist directories, and quick tips for staying grounded while you show up for someone else.
            </p>
            <Link
              href="#"
              className="btn-primary mt-4 inline-flex items-center justify-center px-5 py-2 text-sm font-semibold"
            >
              Supporter resources (coming soon)
            </Link>
          </div>
        </section>

        <footer className="text-center text-sm text-secondary">
          Placeholder dashboard — more features arriving in the next milestone.
        </footer>
      </div>
    </div>
  )
}

