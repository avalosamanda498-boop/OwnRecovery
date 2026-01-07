export type UserRole = 'recovery' | 'still_using' | 'supporter'
export type UserType = 'regular' | 'supporter' | 'admin'

export interface User {
  id: string
  email: string
  full_name: string
  role?: UserRole
  avatar_url?: string
  created_at: string
  updated_at: string
  
  // Recovery-specific fields
  sobriety_start_date?: string
  primary_substance?: string
  biggest_challenge?: string
  check_in_time?: string
  stage_of_change?: string
  onboarding_completed?: boolean
  last_mood_log_at?: string
  last_support_action_at?: string
  
  // Supporter-specific fields
  connected_users?: string[]
  support_relationship?: string
  pending_support_invite_code?: string
  pending_support_invite_expires_at?: string
  last_support_invite_generated_at?: string
  user_type?: UserType
  
  // Shared fields
  timezone?: string
  notification_preferences?: {
    daily_reminders: boolean
    milestone_celebrations: boolean
    supporter_messages: boolean
  }
  prefers_anonymous?: boolean
  is_admin?: boolean
}

export interface MoodEntry {
  id: string
  user_id: string
  mood: 'happy' | 'neutral' | 'sad' | 'anxious' | 'angry' | 'tired' | 'energized'
  craving_level: 'none' | 'mild' | 'strong' | 'at_risk' | 'used_today'
  note?: string
  stress_level?: 'low' | 'moderate' | 'high'
  sleep_quality?: 'rested' | 'okay' | 'poor'
  stress_trigger?: string | null
  created_at: string
  updated_at: string
}

export interface Badge {
  id: string
  user_id: string
  badge_type: 'first_log' | 'streak_3' | 'streak_7' | 'streak_14' | 'streak_30' | 'bravery_log'
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
  relationship_note?: string
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
