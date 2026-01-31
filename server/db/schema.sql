-- Sacred Sound Database Schema
-- PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_access TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  preferences JSONB DEFAULT '{
    "favoriteBreathPatterns": [],
    "favoriteSounds": [],
    "favoriteGuidedSessions": [],
    "defaultSessionDuration": 10,
    "autoStartSounds": false,
    "theme": "light",
    "soundVolume": 0.5,
    "notifications": {
      "enabled": false,
      "dailyReminder": "07:00",
      "streakProtection": true
    }
  }'::jsonb,
  stats JSONB DEFAULT '{
    "totalSessions": 0,
    "totalMinutes": 0,
    "breathworkMinutes": 0,
    "soundHealingMinutes": 0,
    "guidedSessionMinutes": 0,
    "currentStreak": 0,
    "longestStreak": 0,
    "lastSessionDate": null,
    "sessionsThisWeek": 0,
    "sessionsThisMonth": 0,
    "favoriteTimeOfDay": null
  }'::jsonb
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type VARCHAR(50) NOT NULL, -- 'breathwork', 'sound', 'guided'
  pattern VARCHAR(100),
  guided_session VARCHAR(100),
  duration INTEGER, -- in minutes
  mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 5),
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 5),
  completed BOOLEAN DEFAULT true,
  sounds TEXT[], -- array of sound IDs
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(100) NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON sessions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_type ON sessions(type);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date DESC);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Function to update last_access
CREATE OR REPLACE FUNCTION update_last_access()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users SET last_access = NOW() WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update last_access on session creation
CREATE TRIGGER trigger_update_last_access
AFTER INSERT ON sessions
FOR EACH ROW
EXECUTE FUNCTION update_last_access();

-- Insert a default anonymous user for testing
INSERT INTO users (id, username, email) 
VALUES ('00000000-0000-0000-0000-000000000001', 'anonymous', 'anonymous@soundheal.me')
ON CONFLICT (email) DO NOTHING;
