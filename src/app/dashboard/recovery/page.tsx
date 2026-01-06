'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import MoodCravingLogger from '@/components/tracking/MoodCravingLogger'
import RecoveryStreakRadial from '@/components/tracking/RecoveryStreakRadial'
import MoodTrendChart from '@/components/tracking/MoodTrendChart'
import { RecentBadges } from '@/components/badges/RecentBadges'
import { getCurrentUser, type AuthUser } from '@/lib/auth'
import { fetchMoodHistory, type MoodHistoryPoint } from '@/lib/moodEntries'
import { fetchRecoveryStreak } from '@/lib/streaks'

export default function RecoveryDashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [streak, setStreak] = useState<{ current: number; nextMilestone: number; daysUntilMilestone: number; message: string } | null>(null)
  const [history, setHistory] = useState<MoodHistoryPoint[]>([])
  const [range, setRange] = useState<7 | 14 | 30>(7)

  useEffect(() => {
    getCurrentUser().then((profile) => {
      if (profile) {
        setUser(profile)
        fetchRecoveryStreak(profile).then(setStreak).catch(() => setStreak(null))
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="bg-white border border-primary-100 shadow-sm rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.full_name || 'friend'}</h1>
          <p className="mt-2 text-gray-600">
            This is your recovery home base. We’ll surface streaks, mood insights, encouragement, and a quick path to support as we build out the full experience.
          </p>
        </header>

        <MoodCravingLogger
          user={user}
          roleCopy={{
            title: 'Log how you’re doing today',
            subtitle: 'Tracking each moment helps you spot trends, celebrate wins, and reach out when cravings feel heavy.',
            success: 'Nice work staying connected to your journey. Keep showing up—you’re doing this!',
          }}
        />

        {streak && (
          <section className="bg-white border border-primary-100 rounded-2xl shadow-sm p-6">
            <RecoveryStreakRadial streak={streak} />
          </section>
        )}

        <RecentBadges />

        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Mood & craving trends</h2>
              <p className="text-sm text-gray-600">
                Track how you’ve been feeling and how cravings shift over time.
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
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 text-gray-600 hover:border-primary-300'
                  }`}
                >
                  Last {value} days
                </button>
              ))}
            </div>
          </div>
          <MoodTrendChart data={history} rangeLabel={`${range} days`} />
        </section>

        <section className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Today’s Focus</h2>
            <p className="mt-2 text-sm text-gray-600">We’ll suggest encouragement, coping tools, sleep tips, and professional resources here.</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="p-3 rounded-xl bg-primary-50 text-primary-700">Encouragement &amp; motivation</div>
              <div className="p-3 rounded-xl bg-secondary-50 text-secondary-700">Coping tools</div>
              <div className="p-3 rounded-xl bg-success-50 text-success-700">Sleep &amp; wellness</div>
              <div className="p-3 rounded-xl bg-warning-50 text-warning-700">Professional / peer support</div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900">What’s coming soon?</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 list-disc list-inside">
              <li>Streak tracker with milestones and gentle nudges.</li>
              <li>Mood, craving, and sleep logs with quick insights.</li>
              <li>Weekly AI check-ins tailored to your progress.</li>
              <li>Stories &amp; hope: real voices from recovery.</li>
            </ul>
          </div>
        </section>

        <section className="bg-white border border-danger-100 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-danger-700">Need help right now?</h2>
            <p className="mt-1 text-sm text-gray-600">This button will open immediate support options—988 Crisis Lifeline, text lines, live chat, and your emergency contact.</p>
          </div>
          <Link
            href="#"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-danger-600 hover:bg-danger-700 text-white font-semibold transition-colors"
          >
            Help Now (WIP)
          </Link>
        </section>

        <footer className="text-center text-sm text-gray-500">
          Placeholder dashboard &mdash; functionality coming in the next milestone.
        </footer>
      </div>
    </div>
  )
}

