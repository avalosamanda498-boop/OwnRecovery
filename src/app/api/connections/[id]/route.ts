'use server'

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function DELETE(
  _request: Request,
  { params }: { params: { id?: string } }
) {
  const connectionId = params.id

  if (!connectionId) {
    return NextResponse.json({ error: 'Connection id is required.' }, { status: 400 })
  }

  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: connection, error: loadError } = await supabase
    .from('user_connections')
    .select('id')
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

  const { error: deleteError } = await supabase
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

