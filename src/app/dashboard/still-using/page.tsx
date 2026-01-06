'use client'

import { useEffect, useState } from 'react'
import MoodCravingLogger from '@/components/tracking/MoodCravingLogger'
import LogStreakGraph from '@/components/tracking/LogStreakGraph'
import MoodTrendChart from '@/components/tracking/MoodTrendChart'
import { RecentBadges } from '@/components/badges/RecentBadges'
import { getCurrentUser, type AuthUser } from '@/lib/auth'
import { fetchMoodHistory, type MoodHistoryPoint } from '@/lib/moodEntries'
import { fetchLogBasedStreak } from '@/lib/streaks'
import type { BadgeRecord } from '@/lib/badges'

export default function StillUsingDashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [streak, setStreak] = useState<{ current: number; nextMilestone: number; daysUntilMilestone: number; message: string } | null>(null)
  const [history, setHistory] = useState<MoodHistoryPoint[]>([])
  const [range, setRange] = useState<7 | 14 | 30>(7)
  const [badgeRefreshKey, setBadgeRefreshKey] = useState(0)
  const [latestBadges, setLatestBadges] = useState<BadgeRecord[]>([])

  useEffect(() => {
    getCurrentUser().then((profile) => {
      setUser(profile)
      if (profile) {
        fetchLogBasedStreak(profile).then(setStreak).catch(() => setStreak(null))
      }
    })
  }, [])

  useEffect(() => {
    fetchMoodHistory(range)
      .then(setHistory)
      .catch(() => setHistory([]))
  }, [range])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 to-primary-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="bg-white border border-secondary-100 shadow-sm rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900">You’re here—and that matters</h1>
          <p className="mt-2 text-gray-600">
            This space grows with you. We’ll surface gentle prompts, coping ideas, and real stories whenever you’re ready.
          </p>
        </header>

        <MoodCravingLogger
          user={user}
          roleCopy={{
            title: 'Check in with yourself',
            subtitle: 'Log how today feels—no pressure, no judgment. Honest check-ins help us pair the right tools when you need them.',
            success: 'Thanks for being honest with yourself today. Every check-in is a step toward feeling more in control.',
          }}
          onBadgeAwarded={(badges) => {
            setBadgeRefreshKey((value) => value + 1)
            setLatestBadges(badges)
          }}
        />

        {streak && (
          <section className="bg-white border border-secondary-100 rounded-2xl shadow-sm p-6">
            <LogStreakGraph current={streak.current} nextMilestone={streak.nextMilestone} role="still_using" />
          </section>
        )}

        <RecentBadges
          refreshKey={badgeRefreshKey}
          latestBadges={latestBadges}
          emptyMessage="Your first badge will appear after your next few check-ins."
        />

        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Mood & craving trends</h2>
              <p className="text-sm text-gray-600">
                Notice what lifts you up and what makes urges stronger across the week.
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
                      ? 'border-secondary-500 bg-secondary-50 text-secondary-700'
                      : 'border-gray-300 text-gray-600 hover-border-secondary-300'
                  }`}
                >
                  Last {value} days
                </button>
              ))}
            </div>
          </div>
          <MoodTrendChart data={history} rangeLabel={`${range} days`} />
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">A few ways to check in</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 list-disc list-inside">
              <li>Log how you’re feeling—no judgment, just honesty.</li>
              <li>Try a grounding or breathing exercise when urges hit.</li>
              <li>Explore recovery info at your own pace.</li>
              <li>Reach out to talk when the cravings feel heavy.</li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Soon you’ll see…</h2>
            <p className="mt-2 text-sm text-gray-600">
              Stage-of-change reminders, progress reflections, and a curated feed of coping supports. We’ll also celebrate every step—big or small.
            </p>
          </div>
        </section>

        <section className="bg-white border border-warning-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-warning-700">Quick links (coming soon)</h2>
          <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm text-gray-700">
            <div className="p-3 rounded-xl bg-warning-50">Help managing cravings</div>
            <div className="p-3 rounded-xl bg-primary-50">Talk to someone</div>
            <div className="p-3 rounded-xl bg-success-50">Recovery info &amp; success stories</div>
            <div className="p-3 rounded-xl bg-secondary-50">I’m not ready yet</div>
          </div>
        </section>

        <footer className="text-center text-sm text-gray-500">
          Placeholder dashboard &mdash; the full experience is being built right now.
        </footer>
      </div>
    </div>
  )
}

