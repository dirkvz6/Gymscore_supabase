/*
  # Add location column to competitions table

  1. Changes
    - Add `location` column to `competitions` table if it doesn't exist
    - Column is nullable TEXT type to store competition location information

  2. Security
    - No changes to existing RLS policies needed
*/

-- Add location column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'competitions' AND column_name = 'location'
  ) THEN
    ALTER TABLE competitions ADD COLUMN location TEXT;
  END IF;
END $$;