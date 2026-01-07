'use client'

import type { SupporterConnectionInsight } from '@/lib/supporterInsights'

interface SupporterConnectionCardProps {
  insight: SupporterConnectionInsight
  onSendEncouragement: (recoveryUserId: string) => void
}

export function SupporterConnectionCard({ insight, onSendEncouragement }: SupporterConnectionCardProps) {
  const lastCheckIn = insight.last_check_in
  const hasSharedCheckIns =
    lastCheckIn !== null &&
    (!lastCheckIn.mood_hidden || !lastCheckIn.craving_hidden || !lastCheckIn.stress_hidden || !lastCheckIn.sleep_hidden)

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-lg font-semibold text-gray-900">{insight.display_name}</p>
          {insight.relationship_note && (
            <p className="mt-1 text-sm text-gray-600">{insight.relationship_note}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Connected{' '}
            {new Date(insight.connected_at).toLocaleString(undefined, {
              dateStyle: 'medium',
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSendEncouragement(insight.recovery_user_id)}
          className="inline-flex items-center gap-2 rounded-full border border-success-200 bg-success-50 px-4 py-1.5 text-xs font-medium text-success-700 transition hover:bg-success-100"
        >
          Send encouragement
        </button>
      </div>

      <div className="mt-4 space-y-3 text-sm text-gray-700">
        {hasSharedCheckIns ? (
          <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4">
            <div className="flex flex-col gap-1 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                Latest check-in shared
              </p>
              <p className="text-xs text-sky-600">
                Logged{' '}
                {new Date(lastCheckIn!.created_at).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
              {lastCheckIn && (
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <InsightLine
                    label="Mood"
                    value={lastCheckIn.mood_hidden ? 'Keeping this private' : formatLabel(lastCheckIn.mood_label)}
                  />
                  <InsightLine
                    label="Cravings"
                    value={
                      lastCheckIn.craving_hidden ? 'Keeping this private' : formatLabel(lastCheckIn.craving_label)
                    }
                  />
                  <InsightLine
                    label="Stress"
                    value={
                      lastCheckIn.stress_hidden
                        ? 'Keeping this private'
                        : formatLabel(lastCheckIn.stress_label) ?? 'Not logged'
                    }
                  />
                  <InsightLine
                    label="Sleep"
                    value={
                      lastCheckIn.sleep_hidden
                        ? 'Keeping this private'
                        : formatLabel(lastCheckIn.sleep_label) ?? 'Not logged'
                    }
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
            They’re keeping check-ins private right now. A kind message or quick nudge can still mean a lot.
          </div>
        )}

        {!insight.privacy.show_notes && (
          <p className="text-xs text-gray-500">
            Personal notes stay hidden unless they choose to share them. Honor their pace and celebrate the moments they
            do share.
          </p>
        )}
      </div>
    </article>
  )
}

function InsightLine({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm text-gray-800">{value ?? 'Not logged yet'}</p>
    </div>
  )
}

function formatLabel(value: string | null | undefined): string | null | undefined {
  if (!value) return value
  return value.replace(/_/g, ' ')
}

