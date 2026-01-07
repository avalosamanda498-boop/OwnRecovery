export interface ConnectionParticipant {
  id: string
  display_name: string
  prefers_anonymous: boolean
}

export interface ConnectionSummary {
  id: string
  supporter_id: string
  recovery_user_id: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  accepted_at?: string | null
  relationship_note?: string | null
  partner: ConnectionParticipant
}

export interface ConnectionListResponse {
  role: 'recovery' | 'still_using' | 'supporter' | null
  asRecovery: ConnectionSummary[]
  asSupporter: ConnectionSummary[]
  pendingInvite: {
    code: string | null
    expires_at: string | null
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>
  }

  const message = await response.json().catch(() => ({}))
  throw new Error(message?.error ?? 'We could not complete that request right now.')
}

import { authedFetch } from '@/lib/authedFetch'

export async function fetchConnectionsSummary(): Promise<ConnectionListResponse> {
  const response = await authedFetch('/api/connections/list', {
    method: 'GET',
    cache: 'no-store',
  })

  return handleResponse<ConnectionListResponse>(response)
}

export async function generateSupportInvite(): Promise<{ code: string; expires_at: string }> {
  const response = await authedFetch('/api/connections/generate-code', {
    method: 'POST',
  })

  return handleResponse<{ code: string; expires_at: string }>(response)
}

export async function acceptSupportInvite(input: { code: string; relationship_note?: string }): Promise<void> {
  const response = await authedFetch('/api/connections/accept', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  await handleResponse<{ success: boolean }>(response)
}

export async function removeConnection(connectionId: string): Promise<void> {
  const response = await authedFetch(`/api/connections/${connectionId}`, {
    method: 'DELETE',
  })

  await handleResponse<{ success: boolean }>(response)
}

