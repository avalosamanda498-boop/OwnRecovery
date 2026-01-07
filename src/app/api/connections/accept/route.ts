'use server'

import { NextResponse } from 'next/server'
import {
  normalizeInviteCode,
  SUPPORT_INVITE_LENGTH,
  isInviteExpired,
} from '@/lib/inviteCodes'
import { supabaseAdmin } from '@/lib/supabase'

function extractToken(request: Request): string | null {
  const header = request.headers.get('authorization') || request.headers.get('Authorization')
  if (!header) return null
  const [scheme, token] = header.split(' ')
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) return null
  return token
}

export async function POST(request: Request) {
  const token = extractToken(request)

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Service role not available. Please confirm server configuration.' },
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

  let body: { code?: string; relationship_note?: string } = {}

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'An invite code is required.' }, { status: 400 })
  }

  const normalizedCode = normalizeInviteCode(body.code ?? '')

  if (!normalizedCode || normalizedCode.length !== SUPPORT_INVITE_LENGTH) {
    return NextResponse.json(
      { error: 'Please provide the 6-character invite code from your recovery partner.' },
      { status: 400 }
    )
  }

  const { data: supporterProfile, error: supporterProfileError } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (supporterProfileError) {
    console.error('Error fetching supporter profile', supporterProfileError)
    return NextResponse.json({ error: 'Unable to load profile' }, { status: 500 })
  }

  if (supporterProfile?.role !== 'supporter') {
    return NextResponse.json(
      { error: 'Only supporters can accept an invite code.' },
      { status: 403 }
    )
  }

  const { data: recoveryUser, error: lookupError } = await supabaseAdmin
    .from('users')
    .select('id, pending_support_invite_code, pending_support_invite_expires_at')
    .eq('pending_support_invite_code', normalizedCode)
    .maybeSingle()

  if (lookupError) {
    console.error('Error looking up recovery user by invite code', lookupError)
    return NextResponse.json(
      { error: 'We could not verify that invite code. Try again in a moment.' },
      { status: 500 }
    )
  }

  if (!recoveryUser) {
    return NextResponse.json(
      { error: 'That invite code is not active. Ask your partner to share a fresh code.' },
      { status: 404 }
    )
  }

  if (isInviteExpired(recoveryUser.pending_support_invite_expires_at)) {
    return NextResponse.json(
      { error: 'This invite code has expired. Ask your partner to generate a new one.' },
      { status: 410 }
    )
  }

  const sanitizedNote = body.relationship_note?.trim() ?? null
  const truncatedNote =
    sanitizedNote && sanitizedNote.length > 160
      ? `${sanitizedNote.slice(0, 157)}…`
      : sanitizedNote

  const { data: existingConnection, error: existingError } = await supabaseAdmin
    .from('user_connections')
    .select('id, status')
    .eq('supporter_id', user.id)
    .eq('recovery_user_id', recoveryUser.id)
    .maybeSingle()

  if (existingError) {
    console.error('Error checking existing connection', existingError)
    return NextResponse.json({ error: 'Unable to create connection right now.' }, { status: 500 })
  }

  if (existingConnection) {
    if (existingConnection.status === 'accepted') {
      return NextResponse.json({ success: true })
    }

    const { error: updateError } = await supabaseAdmin
      .from('user_connections')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        relationship_note: truncatedNote,
      })
      .eq('id', existingConnection.id)

    if (updateError) {
      console.error('Error updating existing connection', updateError)
      return NextResponse.json(
        { error: 'We could not complete that request. Please try again.' },
        { status: 500 }
      )
    }
  } else {
    const { error: insertError } = await supabaseAdmin.from('user_connections').insert({
      supporter_id: user.id,
      recovery_user_id: recoveryUser.id,
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      relationship_note: truncatedNote,
    })

    if (insertError) {
      console.error('Error creating connection', insertError)
      return NextResponse.json(
        { error: 'We could not complete that request. Please try again.' },
        { status: 500 }
      )
    }
  }

  const { error: clearCodeError } = await supabaseAdmin
    .from('users')
    .update({
      pending_support_invite_code: null,
      pending_support_invite_expires_at: null,
    })
    .eq('id', recoveryUser.id)

  if (clearCodeError) {
    console.error('Error clearing pending invite code', clearCodeError)
  }

  return NextResponse.json({ success: true })
}

