'use server'

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { computeInviteExpiry, generateSupportInviteCode, isInviteExpired } from '@/lib/inviteCodes'

export async function POST() {
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
    console.error('Error loading user profile for invite generation', profileError)
    return NextResponse.json({ error: 'Unable to load profile' }, { status: 500 })
  }

  if (profile?.role !== 'recovery') {
    return NextResponse.json(
      { error: 'Only recovery members can create supporter invite codes.' },
      { status: 403 }
    )
  }

  const existingCode = profile.pending_support_invite_code
  const existingExpiry = profile.pending_support_invite_expires_at

  const shouldReuseExistingCode =
    existingCode && existingExpiry && !isInviteExpired(existingExpiry) ? true : false

  const inviteCode = shouldReuseExistingCode ? existingCode! : generateSupportInviteCode()
  const expiresAt = shouldReuseExistingCode ? existingExpiry! : computeInviteExpiry()

  const { error: updateError } = await supabase
    .from('users')
    .update({
      pending_support_invite_code: inviteCode,
      pending_support_invite_expires_at: expiresAt,
      last_support_invite_generated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (updateError) {
    console.error('Error updating invite code', updateError)
    return NextResponse.json({ error: 'Unable to generate invite right now' }, { status: 500 })
  }

  return NextResponse.json({
    code: inviteCode,
    expires_at: expiresAt,
  })
}

