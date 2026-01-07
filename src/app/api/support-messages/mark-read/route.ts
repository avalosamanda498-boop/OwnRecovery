'use server'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { extractBearerToken } from '@/lib/apiAuth'

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

  let body: { ids?: string[] } = {}

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Message ids are required.' }, { status: 400 })
  }

  const messageIds = body.ids?.filter((id) => typeof id === 'string' && id.trim().length > 0) ?? []

  if (messageIds.length === 0) {
    return NextResponse.json({ error: 'Message ids are required.' }, { status: 400 })
  }

  const now = new Date().toISOString()

  const { error: updateError } = await supabaseAdmin
    .from('support_messages')
    .update({ read_at: now })
    .in('id', messageIds)
    .eq('to_user_id', user.id)

  if (updateError) {
    console.error('Error marking messages read', updateError)
    return NextResponse.json({ error: 'We could not update those messages.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, read_at: now })
}

