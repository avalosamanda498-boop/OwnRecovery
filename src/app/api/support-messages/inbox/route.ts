'use server'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { extractBearerToken } from '@/lib/apiAuth'

export async function GET(request: Request) {
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

  const url = new URL(request.url)
  const limitParam = url.searchParams.get('limit')
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 0, 1), 25) : 10

  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token)

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: messages, error: messagesError } = await supabaseAdmin
    .from('support_messages')
    .select('id, from_user_id, message, emoji, created_at, read_at')
    .eq('to_user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (messagesError) {
    console.error('Error loading support inbox', messagesError)
    return NextResponse.json({ error: 'We could not load your messages.' }, { status: 500 })
  }

  const senderIds = Array.from(new Set((messages ?? []).map((row) => row.from_user_id)))
  const senders = new Map<
    string,
    {
      display_name: string
      prefers_anonymous: boolean
    }
  >()

  if (senderIds.length > 0) {
    const { data: senderRows, error: senderError } = await supabaseAdmin
      .from('users')
      .select('id, full_name, prefers_anonymous')
      .in('id', senderIds)

    if (senderError) {
      console.error('Error loading sender details', senderError)
    } else if (senderRows) {
      senderRows.forEach((row) => {
        senders.set(row.id, {
          display_name: row.prefers_anonymous ? 'Anonymous supporter' : row.full_name || 'Supporter',
          prefers_anonymous: row.prefers_anonymous ?? false,
        })
      })
    }
  }

  const mapped = (messages ?? []).map((row) => ({
    id: row.id,
    from_user_id: row.from_user_id,
    message: row.message,
    emoji: row.emoji,
    created_at: row.created_at,
    read_at: row.read_at,
    sender: senders.get(row.from_user_id) ?? {
      display_name: 'Supporter',
      prefers_anonymous: true,
    },
  }))

  return NextResponse.json({ messages: mapped })
}

