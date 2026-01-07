export interface ConnectionParticipant {
  id: string
  display_name: string
  prefers_anonymous: boolean
}

export interface ConnectionSummary {
  id: string
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

export async function fetchConnectionsSummary(): Promise<ConnectionListResponse> {
  const response = await fetch('/api/connections/list', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  return handleResponse<ConnectionListResponse>(response)
}

export async function generateSupportInvite(): Promise<{ code: string; expires_at: string }> {
  const response = await fetch('/api/connections/generate-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  return handleResponse<{ code: string; expires_at: string }>(response)
}

export async function acceptSupportInvite(input: { code: string; relationship_note?: string }): Promise<void> {
  const response = await fetch('/api/connections/accept', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  await handleResponse<{ success: boolean }>(response)
}

export async function removeConnection(connectionId: string): Promise<void> {
  const response = await fetch(`/api/connections/${connectionId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  await handleResponse<{ success: boolean }>(response)
}

