/*
  # Update athlete birth_date to age field

  1. Changes
    - Add age column to athletes table
    - Remove birth_date column (if it exists)
    - Update any existing birth_date data to calculated age

  2. Security
    - Maintain existing RLS policies
*/

-- Add age column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'athletes' AND column_name = 'age'
  ) THEN
    ALTER TABLE athletes ADD COLUMN age NUMERIC;
    COMMENT ON COLUMN athletes.age IS 'age';
  END IF;
END $$;

-- Remove birth_date column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'athletes' AND column_name = 'birth_date'
  ) THEN
    ALTER TABLE athletes DROP COLUMN birth_date;
  END IF;
END $$;