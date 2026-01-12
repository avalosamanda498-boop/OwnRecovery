'use client'

import { useEffect, useState } from 'react'
import { fetchRecentBadges, type BadgeRecord } from '@/lib/badges'

interface RecentBadgesProps {
  title?: string
  emptyMessage?: string
  refreshKey?: number
  latestBadges?: BadgeRecord[]
}

export function RecentBadges({
  title = 'Recent Celebrations',
  emptyMessage = 'Keep logging to unlock your first badge!',
  refreshKey = 0,
  latestBadges = [],
}: RecentBadgesProps) {
  const [badges, setBadges] = useState<BadgeRecord[]>([])

  useEffect(() => {
    fetchRecentBadges(3)
      .then((data) => setBadges(data))
      .catch(() => setBadges([]))
  }, [refreshKey])

  useEffect(() => {
    if (!latestBadges.length) return

    setBadges((prev) => {
      const merged = new Map<string, BadgeRecord>()
      for (const badge of [...latestBadges, ...prev]) {
        merged.set(badge.id, badge)
      }
      return Array.from(merged.values()).sort(
        (a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime()
      )
    })
  }, [latestBadges])

  return (
    <section className="panel-light">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-500">{title}</h2>
          <p className="text-sm text-gray-600">Badges you’ve earned from recent check-ins.</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {badges.length === 0 && (
          <div className="panel-light-muted border border-dashed border-slate-300/70 text-sm text-gray-900">
            {emptyMessage}
          </div>
        )}

        {badges.map((badge) => (
          <div
            key={badge.id}
            className="flex items-start gap-3 rounded-xl border border-amber-200/70 bg-amber-50/90 p-4 shadow-[0_18px_40px_-30px_rgba(124,88,20,0.35)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-200/70 bg-white text-2xl text-amber-600 shadow-[0_10px_24px_-18px_rgba(122,91,24,0.45)]">
              {badge.icon ?? '🌟'}
            </div>
            <div className="space-y-1 text-sm text-slate-900">
              <p className="font-semibold text-slate-900">{badge.badge_name}</p>
              {badge.description && <p className="text-slate-900">{badge.description}</p>}
              <p className="text-xs text-slate-900">
                {new Date(badge.earned_at).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

