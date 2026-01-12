-- Database updates for Phase 1: Authentication System

-- Enable Supabase Auth email/password (this is done in Supabase dashboard)
-- Go to Authentication > Settings > Auth Providers > Email

-- Create function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, user_type, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'regular',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies for users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (for the trigger)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Make sure the first user becomes admin (run this after first user signs up)
-- UPDATE users SET is_admin = true WHERE id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- Phase 1 onboarding enhancements
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stage_of_change TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS support_relationship TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pending_support_invite_code TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pending_support_invite_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_support_invite_generated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE users ALTER COLUMN role DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'regular';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_mood_log_at DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_support_action_at DATE;
CREATE INDEX IF NOT EXISTS idx_users_pending_support_invite_code ON users(pending_support_invite_code);
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{
    "show_mood_trends": true,
    "show_craving_levels": true,
    "show_notes": false,
    "show_streak": true,
    "show_badges": true
  }'::jsonb;

-- Phase 2 mood & craving tracking
CREATE TABLE IF NOT EXISTS public.mood_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mood mood_type NOT NULL,
  craving_level craving_level NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON public.mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_created_at ON public.mood_entries(created_at);

ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own mood entries" ON public.mood_entries;
DROP POLICY IF EXISTS "Users can view their own mood entries" ON public.mood_entries;
DROP POLICY IF EXISTS "Users can update their own mood entries" ON public.mood_entries;
DROP POLICY IF EXISTS "Users can delete their own mood entries" ON public.mood_entries;

CREATE POLICY "Users can insert their own mood entries" ON public.mood_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own mood entries" ON public.mood_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood entries" ON public.mood_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood entries" ON public.mood_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Phase 2 badges system
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  metadata JSONB,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure legacy enum-based schemas convert to flexible text-based badge types
ALTER TABLE public.badges
  ALTER COLUMN badge_type TYPE TEXT USING badge_type::TEXT;

DROP TYPE IF EXISTS public.badge_type;

-- Bring older schemas up to date with the current badge shape
ALTER TABLE public.badges
  ADD COLUMN IF NOT EXISTS icon TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB;

ALTER TABLE public.support_messages
  ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add wellness context to mood entries
ALTER TABLE public.mood_entries
  ADD COLUMN IF NOT EXISTS stress_level TEXT CHECK (stress_level IN ('low', 'moderate', 'high')),
  ADD COLUMN IF NOT EXISTS sleep_quality TEXT CHECK (sleep_quality IN ('rested', 'okay', 'poor')),
  ADD COLUMN IF NOT EXISTS stress_trigger TEXT;

ALTER TABLE public.user_connections
  ADD COLUMN IF NOT EXISTS relationship_note TEXT;

-- Allow users to opt into anonymous mode
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS prefers_anonymous BOOLEAN DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS badges_user_type_unique ON public.badges(user_id, badge_type);
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON public.badges(user_id);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own badges" ON public.badges;
DROP POLICY IF EXISTS "Users can insert own badges" ON public.badges;
DROP POLICY IF EXISTS "Users can delete own badges" ON public.badges;
DROP POLICY IF EXISTS "Users can update own badges" ON public.badges;

CREATE POLICY "Users can view own badges" ON public.badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON public.badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own badges" ON public.badges
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update own badges" ON public.badges
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete connections they are part of" ON public.user_connections;
CREATE POLICY "Users can delete connections they are part of" ON public.user_connections
  FOR DELETE USING (auth.uid() = supporter_id OR auth.uid() = recovery_user_id);
