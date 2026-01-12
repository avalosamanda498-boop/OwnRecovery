'use server'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { extractBearerToken } from '@/lib/apiAuth'
import type { PrivacySettings } from '@/types/database'

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  show_mood_trends: true,
  show_craving_levels: true,
  show_notes: false,
  show_streak: true,
  show_badges: true,
}

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

  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token)

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: supporterProfile, error: supporterProfileError } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (supporterProfileError) {
    console.error('Error loading supporter profile for insights', supporterProfileError)
    return NextResponse.json({ error: 'We could not verify your supporter status.' }, { status: 500 })
  }

  if (supporterProfile?.role !== 'supporter') {
    return NextResponse.json({ error: 'Only supporters can view these insights.' }, { status: 403 })
  }

  const { data: connections, error: connectionsError } = await supabaseAdmin
    .from('user_connections')
    .select(
      `
        id,
        supporter_id,
        recovery_user_id,
        created_at,
        accepted_at,
        relationship_note,
        status,
        recovery:recovery_user_id (
          full_name,
          prefers_anonymous,
          privacy_settings
        )
      `
    )
    .eq('supporter_id', user.id)
    .eq('status', 'accepted')
    .order('created_at', { ascending: true })

  if (connectionsError) {
    console.error('Error loading supporter connections', connectionsError)
    return NextResponse.json({ error: 'We could not load your support circle.' }, { status: 500 })
  }

  if (!connections || connections.length === 0) {
    return NextResponse.json({ connections: [] })
  }

  type ConnectionRow = (typeof connections)[number] & {
    recovery: {
      full_name: string | null
      prefers_anonymous: boolean | null
      privacy_settings: PrivacySettings | null
    } | null
  }

  const castConnections = connections as ConnectionRow[]

  const connectionsWithPrivacy = castConnections.map((connection) => {
    const privacy = connection.recovery?.privacy_settings
      ? { ...DEFAULT_PRIVACY_SETTINGS, ...connection.recovery.privacy_settings }
      : { ...DEFAULT_PRIVACY_SETTINGS }

    return {
      id: connection.id,
      recovery_user_id: connection.recovery_user_id,
      display_name: connection.recovery?.prefers_anonymous
        ? 'Anonymous friend'
        : connection.recovery?.full_name || 'Recovery partner',
      prefers_anonymous: connection.recovery?.prefers_anonymous ?? false,
      relationship_note: connection.relationship_note,
      connected_at: connection.accepted_at ?? connection.created_at,
      privacy,
    }
  })

  const recoveryUserIds = connectionsWithPrivacy.map((connection) => connection.recovery_user_id)

  const userIdsNeedingMood = connectionsWithPrivacy
    .filter(
      (connection) =>
        connection.privacy.show_mood_trends ||
        connection.privacy.show_craving_levels ||
        connection.privacy.show_streak ||
        connection.privacy.show_notes
    )
    .map((connection) => connection.recovery_user_id)

  let latestEntriesByUser = new Map<
    string,
    {
      mood: string | null
      craving_level: string | null
      stress_level: string | null
      sleep_quality: string | null
      created_at: string
    }
  >()

  if (userIdsNeedingMood.length > 0) {
    const { data: latestEntries, error: entriesError } = await supabaseAdmin
      .from('mood_entries')
      .select('user_id, mood, craving_level, stress_level, sleep_quality, created_at')
      .in('user_id', Array.from(new Set(userIdsNeedingMood)))
      .order('created_at', { ascending: false })

    if (entriesError) {
      console.error('Error loading latest mood entries for supporter insights', entriesError)
    } else if (latestEntries) {
      latestEntriesByUser = latestEntries.reduce((map, entry) => {
        if (!map.has(entry.user_id)) {
          map.set(entry.user_id, {
            mood: entry.mood ?? null,
            craving_level: entry.craving_level ?? null,
            stress_level: entry.stress_level ?? null,
            sleep_quality: entry.sleep_quality ?? null,
            created_at: entry.created_at,
          })
        }
        return map
      }, new Map<string, { mood: string | null; craving_level: string | null; stress_level: string | null; sleep_quality: string | null; created_at: string }>())
    }
  }

  let latestNudgesByUser = new Map<
    string,
    {
      created_at: string
      metadata: Record<string, unknown> | null
    }
  >()

  if (recoveryUserIds.length > 0) {
    const { data: recentNudges, error: nudgesError } = await supabaseAdmin
      .from('support_messages')
      .select('to_user_id, created_at, metadata')
      .eq('from_user_id', user.id)
      .in('to_user_id', Array.from(new Set(recoveryUserIds)))
      .eq('metadata->>kind', 'nudge')
      .order('created_at', { ascending: false })

    if (nudgesError) {
      console.error('Error loading supporter nudges', nudgesError)
    } else if (recentNudges) {
      latestNudgesByUser = recentNudges.reduce((map, row) => {
        if (!map.has(row.to_user_id)) {
          map.set(row.to_user_id, {
            created_at: row.created_at,
            metadata: (row.metadata as Record<string, unknown> | null) ?? null,
          })
        }
        return map
      }, new Map<string, { created_at: string; metadata: Record<string, unknown> | null }>())
    }
  }

  const snapshots = connectionsWithPrivacy.map((connection) => {
    const latestEntry = latestEntriesByUser.get(connection.recovery_user_id)
    const lastNudge = latestNudgesByUser.get(connection.recovery_user_id)
    const now = new Date()
    const msPerDay = 1000 * 60 * 60 * 24
    const msPerHour = 1000 * 60 * 60
    const cooldownHours = 18

    let nudgeReason: 'never_logged' | 'overdue' | 'recent' | 'no_shared_data' = 'no_shared_data'
    let daysSince: number | null = null

    if (connection.privacy.show_mood_trends || connection.privacy.show_craving_levels) {
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

    const lastNudgeAt = lastNudge ? new Date(lastNudge.created_at) : null
    const hoursSinceNudge =
      lastNudgeAt !== null ? (now.getTime() - lastNudgeAt.getTime()) / msPerHour : null
    const withinCooldown = hoursSinceNudge !== null && hoursSinceNudge < cooldownHours
    const retryAfterHours =
      withinCooldown && hoursSinceNudge !== null
        ? Math.max(0, Math.ceil(cooldownHours - hoursSinceNudge))
        : null

    const nudgeAllowed =
      !withinCooldown && (nudgeReason === 'overdue' || nudgeReason === 'never_logged' || nudgeReason === 'no_shared_data')

    const nextAvailableAt =
      withinCooldown && lastNudgeAt
        ? new Date(lastNudgeAt.getTime() + cooldownHours * msPerHour).toISOString()
        : null

    const lastCheckIn =
      latestEntry && (connection.privacy.show_mood_trends || connection.privacy.show_craving_levels)
        ? {
            created_at: latestEntry.created_at,
            mood_label: connection.privacy.show_mood_trends ? latestEntry.mood : null,
            mood_hidden: !connection.privacy.show_mood_trends,
            craving_label: connection.privacy.show_craving_levels ? latestEntry.craving_level : null,
            craving_hidden: !connection.privacy.show_craving_levels,
            stress_label: connection.privacy.show_mood_trends ? latestEntry.stress_level : null,
            stress_hidden: !connection.privacy.show_mood_trends,
            sleep_label: connection.privacy.show_mood_trends ? latestEntry.sleep_quality : null,
            sleep_hidden: !connection.privacy.show_mood_trends,
          }
        : null

    return {
      connection_id: connection.id,
      recovery_user_id: connection.recovery_user_id,
      display_name: connection.display_name,
      prefers_anonymous: connection.prefers_anonymous,
      relationship_note: connection.relationship_note,
      connected_at: connection.connected_at,
      privacy: connection.privacy,
      last_check_in: lastCheckIn,
      nudge: {
        allowed: nudgeAllowed,
        reason: nudgeReason,
        days_since: daysSince,
        last_sent_at: lastNudge?.created_at ?? null,
        retry_after_hours: retryAfterHours,
        next_available_at: nextAvailableAt,
      },
    }
  })

  return NextResponse.json({ connections: snapshots })
}

