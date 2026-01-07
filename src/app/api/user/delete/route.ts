'use server'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE() {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      {
        error: 'Service role not available on server. Ensure SUPABASE_SERVICE_ROLE_KEY is configured.',
      },
      { status: 500 }
    )
  }

  const userId = user.id

  // Remove relational data prior to deleting the user.
  await supabaseAdmin.from('badges').delete().eq('user_id', userId)
  await supabaseAdmin.from('mood_entries').delete().eq('user_id', userId)
  await supabaseAdmin.from('user_connections').delete().or(`supporter_id.eq.${userId},recovery_user_id.eq.${userId}`)

  // Delete the profile row and auth user (cascades to other tables because of FK).
  await supabaseAdmin.from('users').delete().eq('id', userId)
  await supabaseAdmin.auth.admin.deleteUser(userId)

  return NextResponse.json({ success: true })
}


