'use client'

import { useEffect, useState } from 'react'
import MoodCravingLogger from '@/components/tracking/MoodCravingLogger'
import LogStreakGraph from '@/components/tracking/LogStreakGraph'
import { getCurrentUser, type AuthUser } from '@/lib/auth'
import { fetchLogBasedStreak } from '@/lib/streaks'

export default function StillUsingDashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [streak, setStreak] = useState<{ current: number; nextMilestone: number; daysUntilMilestone: number; message: string } | null>(null)

  useEffect(() => {
    getCurrentUser().then((profile) => {
      setUser(profile)
      if (profile) {
        fetchLogBasedStreak(profile).then(setStreak).catch(() => setStreak(null))
      }
    })
  }, [])
        {streak && (
          <section className="bg-white border border-secondary-100 rounded-2xl shadow-sm p-6">
            <LogStreakGraph current={streak.current} nextMilestone={streak.nextMilestone} role="still_using" />
          </section>
        )}

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
        />

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

