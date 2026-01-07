'use client'

import { useEffect, useState } from 'react'
import { fetchSupportInbox, markMessagesRead, type SupportMessage } from '@/lib/supportMessages'

interface SupportMessagesFeedProps {
  title?: string
  limit?: number
}

export function SupportMessagesFeed({ title = 'Support shared with you', limit = 5 }: SupportMessagesFeedProps) {
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markingIds, setMarkingIds] = useState<string[]>([])

  const loadMessages = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSupportInbox(limit)
      setMessages(data)
    } catch (err: any) {
      setError(err.message ?? 'We could not load support messages right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [limit])

  const unreadIds = messages.filter((msg) => !msg.read_at).map((msg) => msg.id)

  const handleMarkRead = async (ids: string[]) => {
    if (!ids.length) return
    setMarkingIds(ids)
    try {
      await markMessagesRead(ids)
      setMessages((prev) =>
        prev.map((msg) => (ids.includes(msg.id) ? { ...msg, read_at: new Date().toISOString() } : msg))
      )
    } catch (err: any) {
      setError(err.message ?? 'We could not mark those as read.')
    } finally {
      setMarkingIds([])
    }
  }

  return (
    <section className="rounded-2xl border border-primary-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600">
            Encouragement stays gentle. Supporters can cheer you on, and you decide how to respond.
          </p>
        </div>
        <button
          type="button"
          onClick={loadMessages}
          className="inline-flex items-center gap-1 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 transition hover:bg-primary-100"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-3 text-sm text-gray-600">
          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary-500" />
          Loading recent encouragement…
        </div>
      ) : error ? (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : messages.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-sm text-gray-600">
          When supporters cheer you on, their notes appear here. You decide what to act on.
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {messages.map((msg) => (
            <li
              key={msg.id}
              className={`rounded-2xl border px-4 py-3 text-sm transition ${
                msg.read_at ? 'border-gray-200 bg-gray-50' : 'border-primary-200 bg-primary-50/70'
              }`}
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">
                    {msg.sender.display_name}
                    {msg.emoji && <span className="ml-2 text-xl">{msg.emoji}</span>}
                  </p>
                  <p className="text-gray-700">{msg.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(msg.created_at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                {!msg.read_at && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead([msg.id])}
                    disabled={markingIds.includes(msg.id)}
                    className="self-start rounded-full border border-primary-200 bg-white px-3 py-1 text-xs font-medium text-primary-700 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {markingIds.includes(msg.id) ? 'Marking…' : 'Mark as read'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {unreadIds.length > 1 && (
        <button
          type="button"
          onClick={() => handleMarkRead(unreadIds)}
          disabled={markingIds.length > 0}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Mark all as read
        </button>
      )}
    </section>
  )
}

