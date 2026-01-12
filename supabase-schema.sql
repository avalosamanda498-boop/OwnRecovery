-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('recovery', 'still_using', 'supporter');
CREATE TYPE mood_type AS ENUM ('happy', 'neutral', 'sad', 'anxious', 'angry', 'tired', 'energized');
CREATE TYPE craving_level AS ENUM ('none', 'mild', 'strong', 'at_risk', 'used_today');
CREATE TYPE resource_type AS ENUM ('article', 'video', 'worksheet', 'meditation', 'breathing_exercise');
CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE interaction_type AS ENUM ('check_in', 'recommendation', 'crisis_detection');

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    phone TEXT,
    full_name VARCHAR(255) NOT NULL,
    role user_role,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Recovery-specific fields
    sobriety_start_date DATE,
    primary_substance VARCHAR(100),
    biggest_challenge TEXT,
    check_in_time TIME,
    stage_of_change TEXT,
    onboarding_completed BOOLEAN DEFAULT false,
    support_relationship TEXT,
    last_mood_log_at DATE,
    last_support_action_at DATE,
    
    -- Supporter connection fields
    pending_support_invite_code TEXT,
    pending_support_invite_expires_at TIMESTAMP WITH TIME ZONE,
    last_support_invite_generated_at TIMESTAMP WITH TIME ZONE,
    
    -- Shared fields
    timezone VARCHAR(50) DEFAULT 'UTC',
    notification_preferences JSONB DEFAULT '{
        "daily_reminders": true,
        "milestone_celebrations": true,
        "supporter_messages": true
    }'::jsonb,
    prefers_anonymous BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    user_type TEXT DEFAULT 'regular',
    privacy_settings JSONB DEFAULT '{
        "show_mood_trends": true,
        "show_craving_levels": true,
        "show_notes": false,
        "show_streak": true,
        "show_badges": true
    }'::jsonb
);

-- Mood entries table
CREATE TABLE mood_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mood mood_type NOT NULL,
    craving_level craving_level NOT NULL,
    note TEXT,
    stress_level TEXT CHECK (stress_level IN ('low', 'moderate', 'high')),
    sleep_quality TEXT CHECK (sleep_quality IN ('rested', 'okay', 'poor')),
    stress_trigger TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges table
CREATE TABLE badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Support messages table
CREATE TABLE support_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    emoji VARCHAR(10),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- User connections table (for supporters)
CREATE TABLE user_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    supporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recovery_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status connection_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    relationship_note TEXT,
    UNIQUE(supporter_id, recovery_user_id)
);

-- Resources table
CREATE TABLE resources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type resource_type NOT NULL,
    url TEXT,
    content TEXT,
    tags TEXT[] DEFAULT '{}',
    target_audience user_role[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI interactions table
CREATE TABLE ai_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interaction_type interaction_type NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX idx_mood_entries_created_at ON mood_entries(created_at);
CREATE INDEX idx_badges_user_id ON badges(user_id);
CREATE INDEX idx_support_messages_to_user_id ON support_messages(to_user_id);
CREATE INDEX idx_support_messages_from_user_id ON support_messages(from_user_id);
CREATE INDEX idx_user_connections_supporter_id ON user_connections(supporter_id);
CREATE INDEX idx_user_connections_recovery_user_id ON user_connections(recovery_user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_pending_support_invite_code ON users(pending_support_invite_code);
CREATE INDEX idx_ai_interactions_user_id ON ai_interactions(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mood_entries_updated_at BEFORE UPDATE ON mood_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Mood entries policies
CREATE POLICY "Users can view own mood entries" ON mood_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood entries" ON mood_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood entries" ON mood_entries
    FOR UPDATE USING (auth.uid() = user_id);

-- Badges policies
CREATE POLICY "Users can view own badges" ON badges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON badges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Support messages policies
CREATE POLICY "Users can view messages to them" ON support_messages
    FOR SELECT USING (auth.uid() = to_user_id);

CREATE POLICY "Users can view messages from them" ON support_messages
    FOR SELECT USING (auth.uid() = from_user_id);

CREATE POLICY "Users can send messages" ON support_messages
    FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update messages sent to them" ON support_messages
    FOR UPDATE USING (auth.uid() = to_user_id);

-- User connections policies
CREATE POLICY "Users can view connections where they are supporter" ON user_connections
    FOR SELECT USING (auth.uid() = supporter_id);

CREATE POLICY "Users can view connections where they are recovery user" ON user_connections
    FOR SELECT USING (auth.uid() = recovery_user_id);

CREATE POLICY "Users can create connections as supporter" ON user_connections
    FOR INSERT WITH CHECK (auth.uid() = supporter_id);

CREATE POLICY "Recovery users can update connection status" ON user_connections
    FOR UPDATE USING (auth.uid() = recovery_user_id);

CREATE POLICY "Users can delete connections they are part of" ON user_connections
    FOR DELETE USING (auth.uid() = supporter_id OR auth.uid() = recovery_user_id);

-- Resources are public (read-only for users)
CREATE POLICY "Anyone can view resources" ON resources
    FOR SELECT USING (true);

-- AI interactions policies
CREATE POLICY "Users can view own AI interactions" ON ai_interactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI interactions" ON ai_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert some sample resources
INSERT INTO resources (title, description, type, tags, target_audience) VALUES
('5-Minute Breathing Exercise', 'A simple breathing technique to help manage stress and cravings', 'breathing_exercise', ARRAY['stress', 'cravings', 'breathing'], ARRAY['recovery'::user_role, 'still_using'::user_role]),
('Understanding Addiction', 'Educational content about the science of addiction and recovery', 'article', ARRAY['education', 'addiction', 'recovery'], ARRAY['recovery'::user_role, 'still_using'::user_role, 'supporter'::user_role]),
('Daily Check-in Meditation', 'A guided meditation for daily reflection and mindfulness', 'meditation', ARRAY['meditation', 'mindfulness', 'daily'], ARRAY['recovery'::user_role, 'still_using'::user_role]),
('CBT Worksheet: Thought Patterns', 'A worksheet to help identify and challenge negative thought patterns', 'worksheet', ARRAY['CBT', 'thoughts', 'therapy'], ARRAY['recovery'::user_role, 'still_using'::user_role]),
('Recovery Success Stories', 'Inspiring stories from people who have successfully navigated their recovery journey', 'video', ARRAY['stories', 'inspiration', 'hope'], ARRAY['recovery'::user_role, 'still_using'::user_role, 'supporter'::user_role]);
