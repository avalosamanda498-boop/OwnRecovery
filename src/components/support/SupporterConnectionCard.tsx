'use client'

import { useEffect, useMemo, useState } from 'react'
import type { SupporterConnectionInsight } from '@/lib/supporterInsights'
import { sendSupportNudge } from '@/lib/supportMessages'

interface SupporterConnectionCardProps {
  insight: SupporterConnectionInsight
  onSendEncouragement: (recoveryUserId: string) => void
  onNudgeSent?: () => void
}

type NudgeDescriptor = SupporterConnectionInsight['nudge']

interface LocalNudgeState extends NudgeDescriptor {
  feedback?: string | null
  error?: string | null
  loading: boolean
}

function createInitialNudgeState(nudge: SupporterConnectionInsight['nudge']): LocalNudgeState {
  return {
    ...nudge,
    feedback: null,
    error: null,
    loading: false,
  }
}

export function SupporterConnectionCard({ insight, onSendEncouragement, onNudgeSent }: SupporterConnectionCardProps) {
  const lastCheckIn = insight.last_check_in
  const hasSharedCheckIns =
    lastCheckIn !== null &&
    (!lastCheckIn.mood_hidden || !lastCheckIn.craving_hidden || !lastCheckIn.stress_hidden || !lastCheckIn.sleep_hidden)
  const [nudgeState, setNudgeState] = useState<LocalNudgeState>(() => createInitialNudgeState(insight.nudge))

  useEffect(() => {
    setNudgeState(createInitialNudgeState(insight.nudge))
  }, [insight.nudge])

  const nudgeDescription = useMemo(() => {
    if (nudgeState.allowed) {
      if (nudgeState.reason === 'overdue') {
        if (typeof nudgeState.days_since === 'number' && nudgeState.days_since >= 3) {
          return `It’s been about ${nudgeState.days_since} day${nudgeState.days_since === 1 ? '' : 's'} since a shared check-in.`
        }
        return 'It’s been a few days since a shared check-in.'
      }
      if (nudgeState.reason === 'never_logged') {
        return 'They haven’t shared a check-in with you yet.'
      }
      if (nudgeState.reason === 'no_shared_data') {
        return 'They’re keeping their check-ins private right now.'
      }
    }

    if (!nudgeState.allowed) {
      if (nudgeState.feedback) {
        return nudgeState.feedback
      }
      if (nudgeState.retry_after_hours) {
        if (nudgeState.next_available_at) {
          const readyAt = new Date(nudgeState.next_available_at)
          return `You nudged them recently. You can nudge again after ${readyAt.toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit',
          })}.`
        }
        return 'You nudged them recently. Give it a little more time.'
      }
      return 'You nudged them recently.'
    }

    return null
  }, [nudgeState])

  const handleSendNudge = async () => {
    if (!nudgeState.allowed || nudgeState.loading) return

    setNudgeState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      feedback: null,
    }))

    try {
      const response = await sendSupportNudge({ recovery_user_id: insight.recovery_user_id })
      setNudgeState((prev) => ({
        ...prev,
        allowed: false,
        feedback: 'We sent a gentle reminder for you.',
        retry_after_hours: response.cooldown_hours,
        last_sent_at: new Date().toISOString(),
        loading: false,
        next_available_at: response.next_available_at ?? null,
      }))
      onNudgeSent?.()
    } catch (error: any) {
      setNudgeState((prev) => {
        const details = (error?.details as Record<string, unknown> | undefined) ?? {}
        const retryAfterHours =
          typeof details.cooldown_hours === 'number' ? (details.cooldown_hours as number) : prev.retry_after_hours ?? null
        const nextAvailableAt =
          typeof details.next_available_at === 'string'
            ? (details.next_available_at as string)
            : (prev.next_available_at ?? null)
        const updatedReason = (details.reason as LocalNudgeState['reason']) ?? prev.reason
        const shouldDisable =
          typeof error?.status === 'number' && (error.status === 429 || error.status === 400 || error.status === 403)

        return {
          ...prev,
          loading: false,
          error: error?.message ?? 'We could not send that reminder.',
          retry_after_hours: retryAfterHours ?? prev.retry_after_hours,
          next_available_at: nextAvailableAt,
          reason: updatedReason,
          allowed: shouldDisable ? false : prev.allowed,
        }
      })
    }
  }

  return (
    <article className="rounded-2xl border border-primary-100 bg-white p-6 text-gray-900 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-lg font-semibold text-slate-900">{insight.display_name}</p>
          {insight.relationship_note && (
            <p className="mt-1 text-sm text-slate-900">{insight.relationship_note}</p>
          )}
          <p className="mt-1 text-xs text-slate-900">
            Connected{' '}
            {new Date(insight.connected_at).toLocaleString(undefined, {
              dateStyle: 'medium',
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSendEncouragement(insight.recovery_user_id)}
          className="inline-flex items-center gap-2 rounded-full border border-success-200 bg-success-50 px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm transition hover:bg-success-100"
        >
          Send encouragement
        </button>
      </div>

      <div className="mt-4 space-y-3 text-sm text-slate-900">
        {hasSharedCheckIns ? (
          <div className="rounded-xl border border-primary-100 bg-primary-50/80 p-4">
            <div className="flex flex-col gap-1 text-sm text-gray-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
                Latest check-in shared
              </p>
              <p className="text-xs text-gray-800">
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
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-900">
            They’re keeping check-ins private right now. A kind message or quick nudge can still mean a lot.
          </div>
        )}

        {!insight.privacy.show_notes && (
          <p className="text-xs text-gray-800">
            Personal notes stay hidden unless they choose to share them. Honor their pace and celebrate the moments they
            do share.
          </p>
        )}

        <div className="rounded-xl border border-dashed border-success-200 bg-success-50/70 p-4 text-sm text-gray-900">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-success-700">Gentle reminder</p>
            {nudgeDescription && <p className="text-sm text-gray-900">{nudgeDescription}</p>}
          </div>
          {nudgeState.error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {nudgeState.error}
            </div>
          )}
          <button
            type="button"
            onClick={handleSendNudge}
            disabled={!nudgeState.allowed || nudgeState.loading}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-success-300 ${
              nudgeState.allowed
                ? 'border border-success-200 bg-white text-success-700 shadow-sm hover:bg-slate-50 disabled:bg-slate-100'
                : 'border border-success-100 bg-success-100 text-success-600 cursor-not-allowed'
            }`}
          >
            {nudgeState.loading ? 'Sending…' : nudgeState.allowed ? 'Send gentle reminder' : 'Reminder sent'}
          </button>
        </div>
      </div>
    </article>
  )
}

function InsightLine({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-700">{label}</p>
      <p className="text-sm text-gray-900">{value ?? 'Not logged yet'}</p>
    </div>
  )
}

function formatLabel(value: string | null | undefined): string | null | undefined {
  if (!value) return value
  return value.replace(/_/g, ' ')
}

