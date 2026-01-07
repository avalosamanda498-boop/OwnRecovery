import { authedFetch } from '@/lib/authedFetch'

export interface SupportMessage {
  id: string
  from_user_id: string
  message: string
  emoji?: string | null
  created_at: string
  read_at?: string | null
  sender: {
    id: string
    display_name: string
    prefers_anonymous: boolean
  }
}

export async function fetchSupportInbox(limit = 5): Promise<SupportMessage[]> {
  const response = await authedFetch(`/api/support-messages/inbox?limit=${limit}`, {
    method: 'GET',
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data?.error ?? 'We could not load your messages right now.')
  }

  return data.messages as SupportMessage[]
}

export async function markMessagesRead(messageIds: string[]): Promise<void> {
  if (!messageIds.length) return

  const response = await authedFetch('/api/support-messages/mark-read', {
    method: 'POST',
    body: JSON.stringify({ ids: messageIds }),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload?.error ?? 'Could not update messages.')
  }
}

export async function sendEncouragement(input: {
  recovery_user_id: string
  message: string
  emoji?: string | null
}): Promise<void> {
  const response = await authedFetch('/api/support-messages/send', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload?.error ?? 'We could not send that message. Try again soon.')
  }
}

