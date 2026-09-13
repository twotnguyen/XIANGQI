-- Migration 11: match ancestry runtime log
-- Decision (F-01/F-02/F-02b/F-18): public.match_moves (created in migration 3 per spec
-- 09 §6.3) is the canonical runtime move log with parent_move_id ancestry. The flat legacy
-- public.moves table stops being written by the server; its rows stay as audit and the
-- UNIQUE(match_id, move_number) constraint that made "move after undo" fail with 23505 is
-- dropped. Everything here is additive: no audit row is deleted, no table is dropped.

-- 1. public.match_moves is the runtime log: index the branch reads and re-assert the
--    spec 09 §13 privileges (SELECT/INSERT only, append-only).
CREATE INDEX IF NOT EXISTS match_moves_match_id_event_version_idx
  ON public.match_moves (match_id, event_version);

REVOKE ALL ON TABLE public.match_moves FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.match_moves TO app_server;

-- 2. Legacy audit table: keep the rows, drop the constraint that forced move_number to be
--    unique per match (the F-01 crash source), and keep an ordered audit scan available.
ALTER TABLE public.moves DROP CONSTRAINT IF EXISTS moves_match_move_number_unique;
CREATE INDEX IF NOT EXISTS moves_match_id_move_number_idx
  ON public.moves (match_id, move_number);

-- 3. Backfill public.match_moves from legacy rows for matches that predate the ancestry
--    log. Each legacy row maps to the MOVE event that recorded it; the event payload
--    `moveId` is reused as the canonical id so an already-populated
--    matches.active_move_ids keeps resolving. Parent is the previous row of the same
--    match, i.e. the effective (move_number <= ply) prefix only: rows abandoned by a
--    legacy undo are deliberately not inserted as part of the live branch.
DO $$
DECLARE
  r record;
  ev record;
  prev_match uuid := NULL;
  prev_move uuid := NULL;
  new_id uuid;
BEGIN
  FOR r IN
    SELECT mv.match_id, mv.move_number, mv.side, mv.from_x, mv.from_y,
           mv.to_x, mv.to_y, mv.created_at, m.ply
    FROM public.moves mv
    JOIN public.matches m ON m.id = mv.match_id
    WHERE mv.move_number <= m.ply
      AND NOT EXISTS (SELECT 1 FROM public.match_moves mm WHERE mm.match_id = mv.match_id)
    ORDER BY mv.match_id, mv.move_number
  LOOP
    IF prev_match IS DISTINCT FROM r.match_id THEN
      prev_match := r.match_id;
      prev_move := NULL;
    END IF;

    SELECT e.version, e.payload
      INTO ev
      FROM public.match_events e
      WHERE e.match_id = r.match_id AND e.type = 'MOVE'
      ORDER BY e.version ASC
      OFFSET (r.move_number - 1) LIMIT 1;

    -- Without its MOVE event there is no event_version to satisfy the deferred composite
    -- FK, so the orphan legacy row stays audit-only and out of the ancestry log.
    IF ev.version IS NULL THEN
      CONTINUE;
    END IF;

    new_id := CASE
      WHEN (ev.payload->>'moveId') ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        THEN (ev.payload->>'moveId')::uuid
      ELSE gen_random_uuid()
    END;

    INSERT INTO public.match_moves
      (id, match_id, parent_move_id, event_version, side, move, search_meta, created_at)
    VALUES (
      new_id,
      r.match_id,
      prev_move,
      ev.version,
      r.side,
      jsonb_build_object(
        'from', jsonb_build_object('x', r.from_x, 'y', r.from_y),
        'to', jsonb_build_object('x', r.to_x, 'y', r.to_y)
      ),
      NULL,
      r.created_at
    );

    prev_move := new_id;
  END LOOP;
END $$;

-- 4. Backfill matches.active_move_ids from the effective ancestry (spec 09 §6.1: array
--    length = ply). Only rows whose length disagrees with ply are touched; the canonical
--    chain is ordered by event_version because parent.event_version < child.event_version.
UPDATE public.matches m
SET active_move_ids = COALESCE((
      SELECT jsonb_agg(mm.id ORDER BY mm.event_version)
      FROM public.match_moves mm
      WHERE mm.match_id = m.id
    ), '[]'::jsonb)
WHERE (jsonb_typeof(m.active_move_ids) <> 'array'
       OR jsonb_array_length(m.active_move_ids) <> m.ply)
  AND EXISTS (SELECT 1 FROM public.match_moves mm WHERE mm.match_id = m.id);

-- matches.repetition_counts stays a rebuildable cache (spec 09 §6.1/§11): legacy rows keep
-- their value and the service rewrites it from the effective branch on the next mutation.

-- 5. Re-assert the length invariant dropped by migration 20260912000010. NOT VALID keeps
--    legacy rows with unverifiable counts from aborting the migration while every new
--    write is checked.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'matches_active_move_ids_check'
      AND conrelid = 'public.matches'::regclass
  ) THEN
    ALTER TABLE public.matches
      ADD CONSTRAINT matches_active_move_ids_check CHECK (
        jsonb_typeof(active_move_ids) = 'array' AND jsonb_array_length(active_move_ids) = ply
      ) NOT VALID;
  END IF;
END $$;
