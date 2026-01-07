'use server'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function extractToken(request: Request): string | null {
  const header = request.headers.get('authorization') || request.headers.get('Authorization')
  if (!header) return null
  const [scheme, token] = header.split(' ')
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) return null
  return token
}

export async function DELETE(
  request: Request,
  { params }: { params: { id?: string } }
) {
  const connectionId = params.id

  if (!connectionId) {
    return NextResponse.json({ error: 'Connection id is required.' }, { status: 400 })
  }

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

  const { data: connection, error: loadError } = await supabaseAdmin
    .from('user_connections')
    .select('id, supporter_id, recovery_user_id')
    .eq('id', connectionId)
    .maybeSingle()

  if (loadError) {
    console.error('Error loading connection before deletion', loadError)
    return NextResponse.json({ error: 'Unable to remove connection' }, { status: 500 })
  }

  if (!connection) {
    return NextResponse.json(
      { error: 'We could not find that connection. It may have already been removed.' },
      { status: 404 }
    )
  }

  if (connection.supporter_id !== user.id && connection.recovery_user_id !== user.id) {
    return NextResponse.json({ error: 'You are not part of this connection.' }, { status: 403 })
  }

  const { error: deleteError } = await supabaseAdmin
    .from('user_connections')
    .delete()
    .eq('id', connectionId)

  if (deleteError) {
    console.error('Error deleting connection', deleteError)
    return NextResponse.json(
      { error: 'We could not remove that connection. Try again in a moment.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}

