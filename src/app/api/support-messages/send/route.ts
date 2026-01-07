'use server'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { extractBearerToken } from '@/lib/apiAuth'

const MAX_MESSAGE_LENGTH = 200
const ALLOWED_EMOJIS = new Set(['🙌', '❤️', '💪', '🌟', '🌱', '🤝'])

export async function POST(request: Request) {
  const token = extractBearerToken(request)

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

  let body: { recovery_user_id?: string; message?: string; emoji?: string } = {}

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Message payload is required.' }, { status: 400 })
  }

  const recoveryUserId = body.recovery_user_id?.trim()
  const rawMessage = (body.message ?? '').trim()
  const emoji = body.emoji?.trim()

  if (!recoveryUserId) {
    return NextResponse.json({ error: 'Please select who you want to encourage.' }, { status: 400 })
  }

  if (!rawMessage) {
    return NextResponse.json({ error: 'Encouragement message cannot be empty.' }, { status: 400 })
  }

  if (rawMessage.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Keep messages concise (under ${MAX_MESSAGE_LENGTH} characters).` },
      { status: 400 }
    )
  }

  if (emoji && !ALLOWED_EMOJIS.has(emoji)) {
    return NextResponse.json({ error: 'That emoji is not supported yet.' }, { status: 400 })
  }

  const { data: supporterProfile, error: supporterError } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (supporterError) {
    console.error('Error loading supporter profile', supporterError)
    return NextResponse.json({ error: 'We could not verify your account.' }, { status: 500 })
  }

  if (supporterProfile?.role !== 'supporter') {
    return NextResponse.json(
      { error: 'Only supporters can send encouragement messages right now.' },
      { status: 403 }
    )
  }

  const { data: connection, error: connectionError } = await supabaseAdmin
    .from('user_connections')
    .select('id')
    .eq('supporter_id', user.id)
    .eq('recovery_user_id', recoveryUserId)
    .eq('status', 'accepted')
    .maybeSingle()

  if (connectionError) {
    console.error('Error verifying supporter connection', connectionError)
    return NextResponse.json(
      { error: 'We could not verify your connection to that member.' },
      { status: 500 }
    )
  }

  if (!connection) {
    return NextResponse.json(
      { error: 'You can only encourage people who have invited you into their recovery circle.' },
      { status: 403 }
    )
  }

  const { error: insertError } = await supabaseAdmin.from('support_messages').insert({
    from_user_id: user.id,
    to_user_id: recoveryUserId,
    message: rawMessage,
    emoji: emoji ?? null,
  })

  if (insertError) {
    console.error('Error inserting support message', insertError)
    return NextResponse.json({ error: 'We could not send that message right now.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

