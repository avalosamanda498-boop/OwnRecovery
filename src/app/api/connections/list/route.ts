'use server'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type RawConnection = {
  id: string
  supporter_id: string
  recovery_user_id: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  accepted_at: string | null
  relationship_note: string | null
}

function extractToken(request: Request): string | null {
  const header = request.headers.get('authorization') || request.headers.get('Authorization')
  if (!header) return null
  const [scheme, token] = header.split(' ')
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) return null
  return token
}

export async function GET(request: Request) {
  const token = extractToken(request)

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Service role not available on server. Ensure SUPABASE_SERVICE_ROLE_KEY is configured.' },
      { status: 500 }
    )
  }

  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token)

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('role, pending_support_invite_code, pending_support_invite_expires_at')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('Error loading profile for connection list', profileError)
    return NextResponse.json({ error: 'Unable to load connections' }, { status: 500 })
  }

  const [asRecoveryResult, asSupporterResult] = await Promise.all([
    supabaseAdmin
      .from('user_connections')
      .select('id, supporter_id, recovery_user_id, status, created_at, accepted_at, relationship_note')
      .eq('recovery_user_id', user.id)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('user_connections')
      .select('id, supporter_id, recovery_user_id, status, created_at, accepted_at, relationship_note')
      .eq('supporter_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  if (asRecoveryResult.error) {
    console.error('Error fetching recovery connections', asRecoveryResult.error)
  }
  if (asSupporterResult.error) {
    console.error('Error fetching supporter connections', asSupporterResult.error)
  }

  const asRecoveryConnections = (asRecoveryResult.data ?? []) as RawConnection[]
  const asSupporterConnections = (asSupporterResult.data ?? []) as RawConnection[]

  const partnerIds = new Set<string>()

  for (const connection of asRecoveryConnections) {
    partnerIds.add(connection.supporter_id)
  }
  for (const connection of asSupporterConnections) {
    partnerIds.add(connection.recovery_user_id)
  }

  const partnerDetails = new Map<
    string,
    {
      display_name: string
      prefers_anonymous: boolean
    }
  >()

  if (partnerIds.size > 0) {
    const { data: partnerRows, error: partnerError } = await supabaseAdmin
      .from('users')
      .select('id, full_name, prefers_anonymous')
      .in('id', Array.from(partnerIds))

    if (partnerError) {
      console.error('Error fetching partner details', partnerError)
    } else if (partnerRows) {
      partnerRows.forEach((row) => {
        partnerDetails.set(row.id, {
          display_name: row.prefers_anonymous
            ? 'Anonymous member'
            : row.full_name || 'Support partner',
          prefers_anonymous: row.prefers_anonymous ?? false,
        })
      })
    }
  }

  const defaultName = (fallback: string) => ({
    display_name: fallback,
    prefers_anonymous: true,
  })

  const connectionsAsRecovery = asRecoveryConnections.map((connection) => ({
    id: connection.id,
    supporter_id: connection.supporter_id,
    recovery_user_id: connection.recovery_user_id,
    status: connection.status,
    created_at: connection.created_at,
    accepted_at: connection.accepted_at,
    relationship_note: connection.relationship_note,
    partner: partnerDetails.get(connection.supporter_id) ?? defaultName('Supporter'),
  }))

  const connectionsAsSupporter = asSupporterConnections.map((connection) => ({
    id: connection.id,
    supporter_id: connection.supporter_id,
    recovery_user_id: connection.recovery_user_id,
    status: connection.status,
    created_at: connection.created_at,
    accepted_at: connection.accepted_at,
    relationship_note: connection.relationship_note,
    partner: partnerDetails.get(connection.recovery_user_id) ?? defaultName('Recovery partner'),
  }))

  return NextResponse.json({
    role: profile?.role ?? null,
    asRecovery: connectionsAsRecovery,
    asSupporter: connectionsAsSupporter,
    pendingInvite: {
      code: profile?.pending_support_invite_code ?? null,
      expires_at: profile?.pending_support_invite_expires_at ?? null,
    },
  })
}

