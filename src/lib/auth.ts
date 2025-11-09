import { supabase } from './supabase'
import { UserRole, UserType } from '@/types/database'

export interface AuthUser {
  id: string
  email: string
  role: UserRole | null
  full_name: string | null
  is_admin: boolean
  onboarding_completed?: boolean
  user_type?: UserType
  sobriety_start_date?: string | null
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

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Try to load profile (maybeSingle avoids 406 when no row yet)
  let profile = null

  const { data: profileRows, error: selectError } = await supabase
    .from('users')
    .select('role, full_name, is_admin, onboarding_completed, pending_support_invite_code, user_type, sobriety_start_date')
    .eq('id', user.id)
    .limit(1)

  if (selectError) {
    console.error('Error fetching user profile:', selectError)
    return null
  }

  if (profileRows && profileRows.length > 0) {
    profile = profileRows[0]
  }

  // If no profile row exists yet, create one and re-fetch
  if (!profile) {
    const insertPayload = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name ?? null,
      user_type: 'regular',
    }

    const { error: insertError } = await supabase.from('users').insert(insertPayload)
    if (insertError) {
      console.error('Error creating user profile:', insertError)
      return {
        id: user.id,
        email: user.email!,
        role: null,
        full_name: user.user_metadata?.full_name ?? null,
        is_admin: false,
        onboarding_completed: false,
      }
    }

    const { data: newProfileRows, error: refetchError } = await supabase
      .from('users')
      .select('role, full_name, is_admin, onboarding_completed, pending_support_invite_code, user_type, sobriety_start_date')
      .eq('id', user.id)
      .limit(1)

    if (refetchError) {
      console.error('Error re-fetching profile after insert:', refetchError)
    } else {
      profile = newProfileRows && newProfileRows.length > 0 ? newProfileRows[0] : null
    }
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
  }
}

export async function updateUserRole(userId: string, role: UserRole) {
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)

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
  user_type?: UserType
  is_admin?: boolean
  notification_preferences?: {
    daily_reminders: boolean
    milestone_celebrations: boolean
    supporter_messages: boolean
  }
}) {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)

  if (error) throw error
}
