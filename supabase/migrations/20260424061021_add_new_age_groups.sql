/*
  # Add new age groups to athletes constraint

  1. Changes
    - Drop existing `athletes_age_check` constraint
    - Re-create it with three additional age groups: '9-11 years', '11-12 years', '12-14 years'
  2. Security
    - No RLS changes
*/

ALTER TABLE athletes DROP CONSTRAINT IF EXISTS athletes_age_check;

ALTER TABLE athletes ADD CONSTRAINT athletes_age_check
  CHECK (
    age IS NULL OR age = ANY (ARRAY[
      '7-8 years',
      '7-9 years',
      '7-10 years',
      '7-11 years',
      '7-13 years',
      '9 years',
      '9-10 years',
      '9-11 years',
      '10 years',
      '10-11 years',
      '11 years',
      '11-12 years',
      '12 years',
      '12-13 years',
      '12-14 years',
      '13 years',
      '14+ years'
    ])
  );
