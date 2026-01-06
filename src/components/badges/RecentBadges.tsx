'use client'

import { useEffect, useState } from 'react'
import { fetchRecentBadges, type BadgeRecord } from '@/lib/badges'

interface RecentBadgesProps {
  title?: string
  emptyMessage?: string
  refreshKey?: number
}

export function RecentBadges({
  title = 'Recent Celebrations',
  emptyMessage = 'Keep logging to unlock your first badge!',
  refreshKey = 0,
}: RecentBadgesProps) {
  const [badges, setBadges] = useState<BadgeRecord[]>([])

  useEffect(() => {
    fetchRecentBadges(3)
      .then((data) => setBadges(data))
      .catch(() => setBadges([]))
  }, [refreshKey])

  return (
    <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600">Badges you’ve earned from recent check-ins.</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {badges.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
            {emptyMessage}
          </div>
        )}

        {badges.map((badge) => (
          <div key={badge.id} className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl">
              {badge.icon ?? '🌟'}
            </div>
            <div className="space-y-1 text-sm text-gray-700">
              <p className="font-semibold text-gray-900">{badge.badge_name}</p>
              {badge.description && <p>{badge.description}</p>}
              <p className="text-xs text-gray-500">
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

