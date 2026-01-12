'use client'

import { useEffect, useState } from 'react'
import { evaluateAlerts, type AdvisoryAlert } from '@/lib/advisoryAlerts'
import { fetchMoodHistory } from '@/lib/moodEntries'

interface AdvisoryPanelProps {
  range?: 7 | 14 | 30
}

const ALERT_STYLES: Record<AdvisoryAlert['severity'], string> = {
  info: 'border-primary-100 bg-white',
  watch: 'border-amber-100 bg-white',
  take_action: 'border-rose-100 bg-white',
}

const ALERT_BADGE: Record<AdvisoryAlert['severity'], string> = {
  info: 'Steady check-in',
  watch: 'Support recommended',
  take_action: 'Reach out now',
}

export function AdvisoryPanel({ range = 7 }: AdvisoryPanelProps) {
  const [alerts, setAlerts] = useState<AdvisoryAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // Evaluate recent logs client-side so guidance stays transparent and human-led.
        const history = await fetchMoodHistory(range)
        if (!mounted) return
        setAlerts(evaluateAlerts(history))
      } catch (err: any) {
        if (!mounted) return
        setError(err.message ?? 'We could not load recent insights right now.')
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [range])

  if (loading) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-600">Reviewing your recent check-ins…</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
        <p className="font-semibold">We hit a snag</p>
        <p className="mt-1">{error}</p>
      </section>
    )
  }

  if (alerts.length === 0) {
    return (
      <section className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-5 shadow-sm">
        <p className="text-sm font-semibold text-emerald-900">All signals are steady.</p>
        <p className="mt-1 text-xs text-emerald-800">
          Insights stay gentle nudges. Keep logging each day so we can surface support early when you need it.
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-3">
      {alerts.map((alert) => (
        <article
          key={alert.id}
          className={`rounded-2xl border p-5 text-gray-900 shadow-sm transition ${ALERT_STYLES[alert.severity]}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                {ALERT_BADGE[alert.severity]}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-gray-900">{alert.headline}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{alert.message}</p>
            </div>
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">
              Gentle reminder • You choose the next step
            </span>
          </div>
        </article>
      ))}
    </section>
  )
}

