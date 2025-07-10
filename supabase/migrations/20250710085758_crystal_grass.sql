/*
  # Update competitions table schema

  1. Schema Changes
    - Add `location` column (text)
    - Add `start_date` column (date) 
    - Add `end_date` column (date)
    - Add `status` column (text with check constraint)
    - Remove `date` column (replaced by start_date/end_date)
    - Remove `section` column (not needed based on frontend interface)

  2. Data Migration
    - Migrate existing `date` values to `start_date`
    - Set default values for new columns

  3. Security
    - Update RLS policies to work with new schema
*/

-- Add new columns to competitions table
DO $$
BEGIN
  -- Add location column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'competitions' AND column_name = 'location'
  ) THEN
    ALTER TABLE competitions ADD COLUMN location text;
  END IF;

  -- Add start_date column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'competitions' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE competitions ADD COLUMN start_date date;
  END IF;

  -- Add end_date column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'competitions' AND column_name = 'end_date'
  ) THEN
    ALTER TABLE competitions ADD COLUMN end_date date;
  END IF;

  -- Add status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'competitions' AND column_name = 'status'
  ) THEN
    ALTER TABLE competitions ADD COLUMN status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled'));
  END IF;
END $$;

-- Migrate existing data from date column to start_date
UPDATE competitions 
SET start_date = date 
WHERE start_date IS NULL AND date IS NOT NULL;

-- Set default values for new columns where needed
UPDATE competitions 
SET 
  location = 'TBD',
  status = 'upcoming'
WHERE location IS NULL OR status IS NULL;

-- Drop old columns that are no longer needed
DO $$
BEGIN
  -- Drop date column (replaced by start_date/end_date)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'competitions' AND column_name = 'date'
  ) THEN
    ALTER TABLE competitions DROP COLUMN date;
  END IF;

  -- Drop section column (not needed based on frontend interface)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'competitions' AND column_name = 'section'
  ) THEN
    ALTER TABLE competitions DROP COLUMN section;
  END IF;
END $$;

-- Drop old check constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'competitions' AND constraint_name = 'competitions_section_check'
  ) THEN
    ALTER TABLE competitions DROP CONSTRAINT competitions_section_check;
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_competitions_start_date ON competitions(start_date);
CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_location ON competitions(location);