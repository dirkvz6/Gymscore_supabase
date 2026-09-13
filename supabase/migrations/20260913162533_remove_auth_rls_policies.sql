/*
# Remove authentication-based RLS policies — switch to single-tenant (no auth)

## Purpose
The app no longer has a sign-in screen. All users interact with the app
anonymously via the Supabase anon key. The previous policies required
`authenticated` role with `auth.uid()` ownership checks, which would block
all writes from the anon-key client. This migration replaces those with
permissive anon+authenticated policies so the app can read and write all
competition data without a login.

## Tables affected
- `competitions` — INSERT/UPDATE/DELETE opened to anon+authenticated
- `athletes` — INSERT/UPDATE/DELETE opened to anon+authenticated
- `routines` — INSERT/UPDATE/DELETE opened to anon+authenticated
- `judges` — INSERT/UPDATE/DELETE opened to anon+authenticated
- `competition_athletes` — INSERT/UPDATE/DELETE opened to anon+authenticated
- `users` — table no longer used by the app but kept for data safety; policies left as-is

## Security note
This is a single-tenant app with no sign-in. All data is intentionally
shared/public. `USING (true)` / `WITH CHECK (true)` is correct here.
*/

-- competitions: replace authenticated-only write policies with anon+authenticated
DROP POLICY IF EXISTS "Authenticated users can create competitions" ON competitions;
DROP POLICY IF EXISTS "Owners can delete competitions" ON competitions;
DROP POLICY IF EXISTS "Owners can update competitions" ON competitions;

CREATE POLICY "anon_insert_competitions" ON competitions FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_competitions" ON competitions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_competitions" ON competitions FOR DELETE
  TO anon, authenticated USING (true);

-- athletes: replace authenticated-only write policies with anon+authenticated
DROP POLICY IF EXISTS "Athletes can update own profile" ON athletes;
DROP POLICY IF EXISTS "Authenticated users can create athlete profiles" ON athletes;
DROP POLICY IF EXISTS "Authenticated users can delete athletes" ON athletes;
DROP POLICY IF EXISTS "Authenticated users can update athletes" ON athletes;

CREATE POLICY "anon_insert_athletes" ON athletes FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_athletes" ON athletes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_athletes" ON athletes FOR DELETE
  TO anon, authenticated USING (true);

-- routines: replace authenticated-only write policies with anon+authenticated
DROP POLICY IF EXISTS "Authenticated users can create routines" ON routines;
DROP POLICY IF EXISTS "Authenticated users can delete routines" ON routines;
DROP POLICY IF EXISTS "Authenticated users can update routines" ON routines;

CREATE POLICY "anon_insert_routines" ON routines FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_routines" ON routines FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_routines" ON routines FOR DELETE
  TO anon, authenticated USING (true);

-- judges: replace authenticated-only write policies with anon+authenticated
DROP POLICY IF EXISTS "Authenticated users can create judge profiles" ON judges;
DROP POLICY IF EXISTS "Judges can update own profile" ON judges;

CREATE POLICY "anon_insert_judges" ON judges FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_judges" ON judges FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_judges" ON judges FOR DELETE
  TO anon, authenticated USING (true);

-- competition_athletes: replace owner-scoped policies with anon+authenticated
DROP POLICY IF EXISTS "Owners can add participants" ON competition_athletes;
DROP POLICY IF EXISTS "Owners can update participants" ON competition_athletes;
DROP POLICY IF EXISTS "Owners can remove participants" ON competition_athletes;

CREATE POLICY "anon_insert_competition_athletes" ON competition_athletes FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_competition_athletes" ON competition_athletes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_competition_athletes" ON competition_athletes FOR DELETE
  TO anon, authenticated USING (true);
