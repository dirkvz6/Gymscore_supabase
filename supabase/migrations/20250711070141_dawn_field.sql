/*
  # Update athlete age field to text with predefined age groups

  1. Changes
    - Change `age` column from numeric to text
    - Add constraint to ensure only valid age groups are allowed
    - Update existing numeric ages to closest age group match

  2. Security
    - Maintains existing RLS policies
*/

-- First, add a new temporary column
ALTER TABLE athletes ADD COLUMN age_group text;

-- Update existing numeric ages to closest age group
UPDATE athletes 
SET age_group = CASE 
  WHEN age IS NULL THEN NULL
  WHEN age <= 9 THEN '7-9 years'
  WHEN age = 10 THEN '10 years'
  WHEN age = 11 THEN '11 years'
  WHEN age = 12 THEN '12 years'
  WHEN age = 13 THEN '13 years'
  WHEN age >= 14 THEN '14+ years'
  ELSE '7-9 years'
END;

-- Drop the old age column
ALTER TABLE athletes DROP COLUMN age;

-- Rename the new column to age
ALTER TABLE athletes RENAME COLUMN age_group TO age;

-- Add constraint to ensure only valid age groups
ALTER TABLE athletes ADD CONSTRAINT athletes_age_check 
CHECK (age IS NULL OR age IN (
  '7-9 years',
  '7-10 years', 
  '7-11 years',
  '7-13 years',
  '10 years',
  '11 years',
  '12 years',
  '13 years',
  '14+ years',
  '12-13 years'
));