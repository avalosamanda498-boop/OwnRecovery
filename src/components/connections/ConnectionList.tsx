'use client'

import { ConnectionSummary } from '@/lib/connections'

interface ConnectionListProps {
  title: string
  description: string
  emptyState: {
    headline: string
    message: string
  }
  connections: ConnectionSummary[]
  onRemove: (connectionId: string) => Promise<void>
  removingId?: string | null
  removeLabel?: string
}

export function ConnectionList({
  title,
  description,
  emptyState,
  connections,
  onRemove,
  removingId,
  removeLabel = 'Remove connection',
}: ConnectionListProps) {
  if (!connections.length) {
    return (
      <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center shadow-sm">
        <h3 className="text-base font-semibold text-gray-900">{emptyState.headline}</h3>
        <p className="mt-2 text-sm text-gray-600">{emptyState.message}</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 space-y-1">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      <ul className="space-y-4">
        {connections.map((connection) => (
          <li
            key={connection.id}
            className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 transition"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-base font-semibold text-gray-900">
                  {connection.partner.display_name}
                </p>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  {connection.status === 'accepted' ? 'Active supporter' : connection.status}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Connected{' '}
                  {new Date(connection.created_at).toLocaleString(undefined, {
                    dateStyle: 'medium',
                  })}
                </p>
                {connection.relationship_note && (
                  <p className="mt-2 rounded-lg bg-white px-3 py-2 text-sm text-gray-700">
                    “{connection.relationship_note}”
                  </p>
                )}
              </div>

              <div className="flex flex-col items-stretch gap-2 md:items-end">
                {connection.accepted_at && (
                  <p className="text-xs text-gray-500">
                    Accepted{' '}
                    {new Date(connection.accepted_at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(connection.id)}
                  disabled={removingId === connection.id}
                  className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 transition hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {removingId === connection.id ? 'Removing…' : removeLabel}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

