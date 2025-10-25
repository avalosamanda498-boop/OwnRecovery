export type UserRole = 'recovery' | 'still_using' | 'supporter'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  created_at: string
  updated_at: string
  
  // Recovery-specific fields
  sobriety_start_date?: string
  primary_substance?: string
  biggest_challenge?: string
  check_in_time?: string
  
  // Supporter-specific fields
  connected_users?: string[]
  
  // Shared fields
  timezone?: string
  notification_preferences?: {
    daily_reminders: boolean
    milestone_celebrations: boolean
    supporter_messages: boolean
  }
}

export interface MoodEntry {
  id: string
  user_id: string
  mood: 'happy' | 'neutral' | 'sad' | 'anxious' | 'angry' | 'tired' | 'energized'
  craving_level: 'none' | 'mild' | 'strong' | 'at_risk' | 'used_today'
  note?: string
  created_at: string
  updated_at: string
}

export interface Badge {
  id: string
  user_id: string
  badge_type: 'daily_update' | 'sobriety_milestone' | 'resilience' | 'support' | 'bravery'
  badge_name: string
  description: string
  earned_at: string
  metadata?: Record<string, any>
}

export interface SupportMessage {
  id: string
  from_user_id: string
  to_user_id: string
  message: string
  emoji?: string
  created_at: string
  read_at?: string
}

export interface UserConnection {
  id: string
  supporter_id: string
  recovery_user_id: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  accepted_at?: string
}

export interface Resource {
  id: string
  title: string
  description: string
  type: 'article' | 'video' | 'worksheet' | 'meditation' | 'breathing_exercise'
  url?: string
  content?: string
  tags: string[]
  target_audience: UserRole[]
  created_at: string
  updated_at: string
}

export interface AIInteraction {
  id: string
  user_id: string
  interaction_type: 'check_in' | 'recommendation' | 'crisis_detection'
  prompt: string
  response: string
  metadata?: Record<string, any>
  created_at: string
}
