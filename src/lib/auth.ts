import { supabase } from './supabase'
import { UserRole, UserType, type PrivacySettings } from '@/types/database'

export interface AuthUser {
  id: string
  email: string
  role: UserRole | null
  full_name: string | null
  is_admin: boolean
  onboarding_completed?: boolean
  user_type?: UserType
  sobriety_start_date?: string | null
  prefers_anonymous?: boolean
  pending_support_invite_code?: string | null
  pending_support_invite_expires_at?: string | null
  last_support_invite_generated_at?: string | null
  privacy_settings?: PrivacySettings
}

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) throw error
  return data
}

export async function signIn(identifier: string, password: string) {
  const trimmed = identifier.trim()
  const isEmail = trimmed.includes('@')
  const cleaned = trimmed.replace(/\s+/g, '')

  const payload = isEmail
    ? { email: cleaned, password }
    : { phone: normalizePhone(cleaned), password }

  const { data, error } = await supabase.auth.signInWithPassword(payload as any)

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  let profile: any = null

  const { data: profileRows, error: selectError } = await supabase
    .from('users')
    .select(
      'role, full_name, is_admin, onboarding_completed, pending_support_invite_code, pending_support_invite_expires_at, last_support_invite_generated_at, user_type, sobriety_start_date, prefers_anonymous, privacy_settings'
    )
    .eq('id', user.id)
    .limit(1)

  if (selectError) {
    console.error('Error fetching user profile:', selectError)
  } else if (profileRows && profileRows.length > 0) {
    profile = profileRows[0]
  }

  if (!profile) {
    profile =
      (await ensureUserProfile({
        id: user.id,
        email: user.email ?? '',
        full_name: user.user_metadata?.full_name ?? null,
        user_type: 'regular',
        prefers_anonymous: false,
      })) ?? null
  }

  return {
    id: user.id,
    email: user.email!,
    role: profile?.role || null,
    full_name: profile?.full_name || null,
    is_admin: profile?.is_admin || false,
    onboarding_completed: profile?.onboarding_completed || false,
    user_type: (profile?.user_type as UserType) || 'regular',
    sobriety_start_date: profile?.sobriety_start_date || null,
    prefers_anonymous: profile?.prefers_anonymous ?? false,
    pending_support_invite_code: profile?.pending_support_invite_code ?? null,
    pending_support_invite_expires_at: profile?.pending_support_invite_expires_at ?? null,
    last_support_invite_generated_at: profile?.last_support_invite_generated_at ?? null,
    privacy_settings: (profile?.privacy_settings as PrivacySettings) ?? undefined,
  }
}

export async function updateUserRole(userId: string, role: UserRole) {
  await ensureUserProfile({ id: userId })

  const { error } = await supabase
    .from('users')
    .upsert({ id: userId, role, updated_at: new Date().toISOString() }, { onConflict: 'id' })

  if (error) throw error
}

export async function updateUserProfile(userId: string, updates: {
  full_name?: string
  role?: UserRole
  sobriety_start_date?: string
  primary_substance?: string
  biggest_challenge?: string
  check_in_time?: string
  stage_of_change?: string
  onboarding_completed?: boolean
  support_relationship?: string
  pending_support_invite_code?: string | null
  pending_support_invite_expires_at?: string | null
  last_support_invite_generated_at?: string | null
  user_type?: UserType
  is_admin?: boolean
  notification_preferences?: {
    daily_reminders: boolean
    milestone_celebrations: boolean
    supporter_messages: boolean
  }
  prefers_anonymous?: boolean
  privacy_settings?: PrivacySettings
}) {
  await ensureUserProfile({ id: userId })

  const payload = {
    id: userId,
    ...pruneUndefined(updates),
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('users')
    .upsert(payload, { onConflict: 'id' })

  if (error) throw error
}

function pruneUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined)) as Partial<T>
}

async function ensureUserProfile(payload: {
  id: string
  email?: string | null
  full_name?: string | null
  user_type?: UserType
  prefers_anonymous?: boolean
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let email = payload.email ?? user?.email ?? user?.phone ?? ''
  if (!email) {
    email = `user-${payload.id}@placeholder.local`
  }

  const fullName = payload.full_name ?? (user?.user_metadata?.full_name as string | null) ?? null

  const base = pruneUndefined({
    id: payload.id,
    email,
    full_name: fullName,
    user_type: payload.user_type ?? 'regular',
    prefers_anonymous: payload.prefers_anonymous ?? false,
    updated_at: new Date().toISOString(),
  })

  const { data, error } = await supabase
    .from('users')
    .upsert(base, { onConflict: 'id' })
    .select(
      'role, full_name, is_admin, onboarding_completed, pending_support_invite_code, pending_support_invite_expires_at, last_support_invite_generated_at, user_type, sobriety_start_date, prefers_anonymous, privacy_settings'
    )
    .maybeSingle()

  if (error) {
    console.error('Error ensuring user profile', error)
    return null
  }

  return data
}

function normalizePhone(input: string) {
  const trimmed = input.trim()
  if (trimmed.startsWith('+')) {
    return trimmed
  }

  const digitsOnly = trimmed.replace(/[^\d]/g, '')
  if (!digitsOnly) return trimmed

  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`
  }

  if (digitsOnly.startsWith('1') && digitsOnly.length === 11) {
    return `+${digitsOnly}`
  }

  return `+${digitsOnly}`
}
