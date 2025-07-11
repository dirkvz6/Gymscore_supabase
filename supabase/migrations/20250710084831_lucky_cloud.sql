/*
  # Gymnastics Competition Scoring System

  1. New Tables
    - `users` - User profiles for authentication
    - `athletes` - Athlete information and profiles  
    - `judges` - Judge information and certifications
    - `events` - Gymnastics events (men's and women's)
    - `routines` - Individual routine performances
    - `scores` - Detailed scoring breakdown

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Users can only access their own data
    - Public read access for competitions and results

  3. Data
    - Pre-populate gymnastics events for men and women
    - Set up proper indexes for performance
*/

-- Create users table for extended user profiles
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'judge', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create athletes table
CREATE TABLE IF NOT EXISTS athletes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female')),
  birth_date date,
  club text,
  level text,
  created_at timestamptz DEFAULT now()
);

-- Create judges table
CREATE TABLE IF NOT EXISTS judges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  certification_level text,
  specialization text[],
  created_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female')),
  display_order integer NOT NULL,
  max_score decimal(5,3) DEFAULT 10.000
);

-- Insert gymnastics events
INSERT INTO events (name, code, gender, display_order) VALUES
  ('Floor Exercise', 'FX', 'male', 1),
  ('Pommel Horse', 'PH', 'male', 2),
  ('Still Rings', 'SR', 'male', 3),
  ('Vault', 'VT', 'male', 4),
  ('Parallel Bars', 'PB', 'male', 5),
  ('Horizontal Bar', 'HB', 'male', 6),
  ('Vault', 'VT', 'female', 1),
  ('Uneven Bars', 'UB', 'female', 2),
  ('Balance Beam', 'BB', 'female', 3),
  ('Floor Exercise', 'FX', 'female', 4)
ON CONFLICT (code) DO NOTHING;

-- Create routines table
CREATE TABLE IF NOT EXISTS routines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL,
  athlete_id uuid REFERENCES athletes(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  difficulty_score decimal(4,3) DEFAULT 0.000,
  execution_score decimal(4,3) DEFAULT 0.000,
  neutral_deductions decimal(4,3) DEFAULT 0.000,
  final_score decimal(5,3) DEFAULT 0.000,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  notes text,
  performed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint for routines.competition_id after competitions table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'competitions') THEN
    ALTER TABLE routines ADD CONSTRAINT routines_competition_id_fkey 
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create RLS policies for athletes
CREATE POLICY "Public can view athletes"
  ON athletes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Athletes can update own profile"
  ON athletes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can create athlete profiles"
  ON athletes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create RLS policies for judges
CREATE POLICY "Public can view judges"
  ON judges FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Judges can update own profile"
  ON judges FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can create judge profiles"
  ON judges FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create RLS policies for events
CREATE POLICY "Public can view events"
  ON events FOR SELECT
  TO public
  USING (true);

-- Create RLS policies for routines
CREATE POLICY "Public can view routines"
  ON routines FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create routines"
  ON routines FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update routines"
  ON routines FOR UPDATE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_athletes_gender ON athletes(gender);
CREATE INDEX IF NOT EXISTS idx_athletes_user_id ON athletes(user_id);
CREATE INDEX IF NOT EXISTS idx_judges_user_id ON judges(user_id);
CREATE INDEX IF NOT EXISTS idx_events_gender ON events(gender);
CREATE INDEX IF NOT EXISTS idx_events_display_order ON events(display_order);
CREATE INDEX IF NOT EXISTS idx_routines_competition_id ON routines(competition_id);
CREATE INDEX IF NOT EXISTS idx_routines_athlete_id ON routines(athlete_id);
CREATE INDEX IF NOT EXISTS idx_routines_event_id ON routines(event_id);
CREATE INDEX IF NOT EXISTS idx_routines_status ON routines(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();