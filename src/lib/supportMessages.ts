import { authedFetch } from '@/lib/authedFetch'

export interface SupportMessage {
  id: string
  from_user_id: string
  message: string
  emoji?: string | null
  metadata?: Record<string, unknown> | null
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

export interface SupportNudgeResponse {
  reason: 'never_logged' | 'overdue' | 'recent' | 'no_shared_data'
  cooldown_hours: number
  next_available_at?: string | null
}

export async function sendSupportNudge(input: {
  recovery_user_id: string
}): Promise<SupportNudgeResponse> {
  const response = await authedFetch('/api/supporter/nudge', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(payload?.error ?? 'Could not send reminder right now.') as Error & {
      details?: Record<string, unknown>
      status?: number
    }
    error.details = payload
    error.status = response.status
    throw error
  }

  return {
    reason: payload.reason,
    cooldown_hours: payload.cooldown_hours,
    next_available_at: payload.next_available_at ?? null,
  }
}

