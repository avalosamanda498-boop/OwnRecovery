import { supabase } from './supabase'
import { UserRole } from '@/types/database'

export interface AuthUser {
  id: string
  email: string
  role: UserRole | null
  full_name: string | null
  is_admin: boolean
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

  // Get user profile from our users table
  const { data: profile, error } = await supabase
    .from('users')
    .select('role, full_name, is_admin')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return {
    id: user.id,
    email: user.email!,
    role: profile?.role || null,
    full_name: profile?.full_name || null,
    is_admin: profile?.is_admin || false,
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
}) {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)

  if (error) throw error
}
