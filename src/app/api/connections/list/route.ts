'use server'

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
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

export async function GET() {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role, pending_support_invite_code, pending_support_invite_expires_at')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('Error loading profile for connection list', profileError)
    return NextResponse.json({ error: 'Unable to load connections' }, { status: 500 })
  }

  const [asRecoveryResult, asSupporterResult] = await Promise.all([
    supabase
      .from('user_connections')
      .select('id, supporter_id, recovery_user_id, status, created_at, accepted_at, relationship_note')
      .eq('recovery_user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('user_connections')
      .select('id, supporter_id, recovery_user_id, status, created_at, accepted_at, relationship_note')
      .eq('supporter_id', user.id)
      .order('created_at', { ascending: false }),
  ])

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

  if (partnerIds.size > 0 && supabaseAdmin) {
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
    status: connection.status,
    created_at: connection.created_at,
    accepted_at: connection.accepted_at,
    relationship_note: connection.relationship_note,
    partner: partnerDetails.get(connection.supporter_id) ?? defaultName('Supporter'),
  }))

  const connectionsAsSupporter = asSupporterConnections.map((connection) => ({
    id: connection.id,
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

