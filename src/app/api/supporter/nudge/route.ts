'use server'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { extractBearerToken } from '@/lib/apiAuth'
import type { PrivacySettings } from '@/types/database'

const NUDGE_COOLDOWN_HOURS = 18

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  show_mood_trends: true,
  show_craving_levels: true,
  show_notes: false,
  show_streak: true,
  show_badges: true,
}

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

  let body: { recovery_user_id?: string } = {}

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Reminder payload is required.' }, { status: 400 })
  }

  const recoveryUserId = body.recovery_user_id?.trim()

  if (!recoveryUserId) {
    return NextResponse.json({ error: 'Choose who you want to nudge first.' }, { status: 400 })
  }

  const { data: supporterProfile, error: supporterProfileError } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (supporterProfileError) {
    console.error('Error loading supporter profile for nudge', supporterProfileError)
    return NextResponse.json({ error: 'We could not verify your supporter status.' }, { status: 500 })
  }

  if (supporterProfile?.role !== 'supporter') {
    return NextResponse.json({ error: 'Only supporters can send reminders right now.' }, { status: 403 })
  }

  const { data: connection, error: connectionError } = await supabaseAdmin
    .from('user_connections')
    .select('id, supporter_id, recovery_user_id, status')
    .eq('supporter_id', user.id)
    .eq('recovery_user_id', recoveryUserId)
    .eq('status', 'accepted')
    .maybeSingle()

  if (connectionError) {
    console.error('Error verifying supporter connection for nudge', connectionError)
    return NextResponse.json({ error: 'We could not verify your connection.' }, { status: 500 })
  }

  if (!connection) {
    return NextResponse.json(
      { error: 'You can only nudge people who invited you into their recovery circle.' },
      { status: 403 }
    )
  }

  const { data: recoveryProfile, error: recoveryProfileError } = await supabaseAdmin
    .from('users')
    .select('privacy_settings')
    .eq('id', recoveryUserId)
    .maybeSingle()

  if (recoveryProfileError) {
    console.error('Error loading recovery profile for nudge', recoveryProfileError)
  }

  const privacy: PrivacySettings = {
    ...DEFAULT_PRIVACY_SETTINGS,
    ...(recoveryProfile?.privacy_settings ?? {}),
  }

  const now = new Date()
  const msPerDay = 1000 * 60 * 60 * 24
  const msPerHour = 1000 * 60 * 60

  let nudgeReason: 'never_logged' | 'overdue' | 'recent' | 'no_shared_data' = 'no_shared_data'
  let daysSince: number | null = null

  if (privacy.show_mood_trends || privacy.show_craving_levels) {
    const { data: latestEntry, error: latestEntryError } = await supabaseAdmin
      .from('mood_entries')
      .select('created_at')
      .eq('user_id', recoveryUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestEntryError) {
      console.error('Error loading latest mood entry for nudge', latestEntryError)
    }

    if (!latestEntry) {
      nudgeReason = 'never_logged'
    } else {
      const createdAt = new Date(latestEntry.created_at)
      const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / msPerDay)
      daysSince = Math.max(diffDays, 0)
      nudgeReason = diffDays >= 3 ? 'overdue' : 'recent'
    }
  } else {
    nudgeReason = 'no_shared_data'
  }

  const { data: lastNudge, error: lastNudgeError } = await supabaseAdmin
    .from('support_messages')
    .select('created_at')
    .eq('from_user_id', user.id)
    .eq('to_user_id', recoveryUserId)
    .eq('metadata->>kind', 'nudge')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (lastNudgeError) {
    console.error('Error loading last nudge', lastNudgeError)
  }

  const lastNudgeAt = lastNudge ? new Date(lastNudge.created_at) : null
  const hoursSinceLastNudge =
    lastNudgeAt !== null ? (now.getTime() - lastNudgeAt.getTime()) / msPerHour : null
  const withinCooldown = hoursSinceLastNudge !== null && hoursSinceLastNudge < NUDGE_COOLDOWN_HOURS

  if (withinCooldown) {
    const retryAfterHours =
      hoursSinceLastNudge !== null
        ? Math.max(0, Math.ceil(NUDGE_COOLDOWN_HOURS - hoursSinceLastNudge))
        : NUDGE_COOLDOWN_HOURS

    return NextResponse.json(
      {
        error: 'You nudged them recently. Give it a little more time.',
        reason: 'recent',
        cooldown_hours: NUDGE_COOLDOWN_HOURS,
        next_available_at: new Date(now.getTime() + retryAfterHours * msPerHour).toISOString(),
      },
      { status: 429 }
    )
  }

  const nudgeAllowed =
    nudgeReason === 'overdue' || nudgeReason === 'never_logged' || nudgeReason === 'no_shared_data'

  if (!nudgeAllowed) {
    return NextResponse.json(
      {
        error: 'They checked in recently. Give them a little space before nudging again.',
        reason: nudgeReason,
        cooldown_hours: NUDGE_COOLDOWN_HOURS,
      },
      { status: 400 }
    )
  }

  const encouragementMessage =
    nudgeReason === 'no_shared_data'
      ? 'Your supporter is here when you want to share. There’s no rush—check in whenever it feels right.'
      : 'Just a kind reminder from your supporter. When you’re ready, share a quick check-in so they know how you’re doing.'

  const { error: insertError } = await supabaseAdmin.from('support_messages').insert({
    from_user_id: user.id,
    to_user_id: recoveryUserId,
    message: encouragementMessage,
    metadata: {
      kind: 'nudge',
      reason: nudgeReason,
      days_since_last_shared: daysSince,
      sent_at: now.toISOString(),
      cooldown_hours: NUDGE_COOLDOWN_HOURS,
    },
  })

  if (insertError) {
    console.error('Error inserting nudge message', insertError)
    return NextResponse.json({ error: 'We could not send that reminder right now.' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    reason: nudgeReason,
    cooldown_hours: NUDGE_COOLDOWN_HOURS,
    next_available_at: new Date(now.getTime() + NUDGE_COOLDOWN_HOURS * msPerHour).toISOString(),
  })
}

