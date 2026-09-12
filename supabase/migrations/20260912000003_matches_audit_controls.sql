-- Migration 3: matches-audit-controls
-- 09-DATABASE-DESIGN.md: Section 6, 7.1, 11, 13, 15

-- 1. public.matches
CREATE TABLE IF NOT EXISTS public.matches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid NULL,
  mode text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE',
  red_user_id uuid NULL,
  black_user_id uuid NULL,
  ai_side text NULL,
  ai_level text NULL,
  position jsonb NOT NULL,
  version bigint NOT NULL DEFAULT 0,
  ply integer NOT NULL DEFAULT 0,
  time_control smallint NOT NULL DEFAULT 0,
  clock jsonb NULL,
  rule_set_version text NOT NULL DEFAULT 'xiangqi-simple-v1',
  outcome jsonb NULL,
  active_move_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  repetition_counts jsonb NOT NULL,
  proposal jsonb NULL,
  boot_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz NULL,
  CONSTRAINT matches_pkey PRIMARY KEY (id),
  CONSTRAINT matches_id_room_id_unique UNIQUE (id, room_id),
  CONSTRAINT matches_room_id_fkey FOREIGN KEY (room_id)
    REFERENCES public.rooms(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT matches_red_user_id_fkey FOREIGN KEY (red_user_id)
    REFERENCES public.profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT matches_black_user_id_fkey FOREIGN KEY (black_user_id)
    REFERENCES public.profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT matches_mode_check CHECK (mode IN ('ONLINE', 'AI')),
  CONSTRAINT matches_status_check CHECK (status IN ('ACTIVE', 'FINISHED', 'INTERRUPTED')),
  CONSTRAINT matches_rule_set_version_check CHECK (rule_set_version = 'xiangqi-simple-v1'),
  CONSTRAINT matches_counters_check CHECK (version >= 0 AND ply >= 0),
  CONSTRAINT matches_time_control_check CHECK (time_control IN (0, 300, 600, 900)),
  CONSTRAINT matches_clock_presence_check CHECK (
    (time_control = 0 AND clock IS NULL) OR (time_control > 0 AND clock IS NOT NULL)
  ),
  CONSTRAINT matches_mode_invariants CHECK (
    (mode = 'ONLINE' AND room_id IS NOT NULL AND red_user_id IS NOT NULL AND black_user_id IS NOT NULL AND red_user_id <> black_user_id AND ai_side IS NULL AND ai_level IS NULL)
    OR
    (mode = 'AI' AND room_id IS NULL AND ai_level IN ('EASY', 'MEDIUM', 'HARD') AND (
      (ai_side = 'RED' AND red_user_id IS NULL AND black_user_id IS NOT NULL)
      OR
      (ai_side = 'BLACK' AND black_user_id IS NULL AND red_user_id IS NOT NULL)
    ))
  ),
  CONSTRAINT matches_status_invariants CHECK (
    (status = 'ACTIVE' AND outcome IS NULL AND ended_at IS NULL)
    OR
    (status IN ('FINISHED', 'INTERRUPTED') AND outcome IS NOT NULL AND ended_at IS NOT NULL AND ended_at >= created_at AND proposal IS NULL)
  ),
  CONSTRAINT matches_active_move_ids_check CHECK (
    jsonb_typeof(active_move_ids) = 'array' AND jsonb_array_length(active_move_ids) = ply
  ),
  CONSTRAINT matches_proposal_check CHECK (
    (mode = 'AI' AND proposal IS NULL)
    OR
    (mode = 'ONLINE' AND (proposal IS NULL OR jsonb_typeof(proposal) = 'object'))
  ),
  CONSTRAINT matches_position_json_check CHECK (
    jsonb_typeof(position) = 'object'
    AND jsonb_typeof(position->'board') = 'array'
    AND jsonb_array_length(position->'board') = 90
    AND (position->>'turn') IN ('RED', 'BLACK')
  ),
  CONSTRAINT matches_repetition_counts_json_check CHECK (
    jsonb_typeof(repetition_counts) = 'object'
  ),
  CONSTRAINT matches_clock_json_check CHECK (
    clock IS NULL OR (
      jsonb_typeof(clock) = 'object'
      AND (clock->'redMs') IS NOT NULL
      AND (clock->'blackMs') IS NOT NULL
    )
  ),
  CONSTRAINT matches_outcome_json_check CHECK (
    outcome IS NULL OR (
      jsonb_typeof(outcome) = 'object'
      AND (outcome->'reason') IS NOT NULL
      AND (
        (outcome->>'reason' IN ('BOTH_OFFLINE', 'SERVER_RESTART', 'AI_UNAVAILABLE', 'AGREED_DRAW', 'REPETITION')
         AND (outcome->'winner' IS NULL OR jsonb_typeof(outcome->'winner') = 'null'))
        OR
        (outcome->>'reason' IN ('CHECKMATE', 'STALEMATE', 'TIMEOUT', 'RESIGN')
         AND (outcome->>'winner') IN ('RED', 'BLACK'))
      )
    )
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS matches_active_room_idx
  ON public.matches (room_id)
  WHERE status = 'ACTIVE' AND room_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS matches_red_user_history_idx
  ON public.matches (red_user_id, created_at DESC, id DESC)
  WHERE red_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS matches_black_user_history_idx
  ON public.matches (black_user_id, created_at DESC, id DESC)
  WHERE black_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS matches_boot_recovery_idx
  ON public.matches (boot_id, id)
  WHERE status = 'ACTIVE';

CREATE INDEX IF NOT EXISTS matches_room_history_idx
  ON public.matches (room_id, created_at DESC, id DESC)
  WHERE room_id IS NOT NULL;

-- Guard trigger on matches
CREATE OR REPLACE FUNCTION public.guard_match_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Immutable match attributes
  IF NEW.room_id IS DISTINCT FROM OLD.room_id
     OR NEW.mode <> OLD.mode
     OR NEW.red_user_id IS DISTINCT FROM OLD.red_user_id
     OR NEW.black_user_id IS DISTINCT FROM OLD.black_user_id
     OR NEW.ai_side IS DISTINCT FROM OLD.ai_side
     OR NEW.ai_level IS DISTINCT FROM OLD.ai_level
     OR NEW.time_control <> OLD.time_control
     OR NEW.rule_set_version <> OLD.rule_set_version
     OR NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'Immutable match attributes cannot be modified';
  END IF;

  -- Terminal matches cannot be modified or re-activated
  IF OLD.status IN ('FINISHED', 'INTERRUPTED') THEN
    RAISE EXCEPTION 'Terminal match is immutable';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_match_updates ON public.matches;
CREATE TRIGGER trg_guard_match_updates
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_match_updates();

-- Circular FK from rooms to matches
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'rooms_current_match_fk' AND table_name = 'rooms'
  ) THEN
    ALTER TABLE public.rooms
      ADD CONSTRAINT rooms_current_match_fk
      FOREIGN KEY (current_match_id, id)
      REFERENCES public.matches(id, room_id)
      MATCH SIMPLE DEFERRABLE INITIALLY IMMEDIATE;
  END IF;
END $$;

-- 2. public.active_players
CREATE TABLE IF NOT EXISTS public.active_players (
  user_id uuid NOT NULL,
  match_id uuid NOT NULL,
  acquired_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT active_players_pkey PRIMARY KEY (user_id),
  CONSTRAINT active_players_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT active_players_match_id_fkey FOREIGN KEY (match_id)
    REFERENCES public.matches(id) ON UPDATE RESTRICT ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS active_players_match_id_idx
  ON public.active_players (match_id);

-- 3. public.match_events
CREATE TABLE IF NOT EXISTS public.match_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL,
  version bigint NOT NULL,
  type text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT match_events_pkey PRIMARY KEY (id),
  CONSTRAINT match_events_match_version_unique UNIQUE (match_id, version),
  CONSTRAINT match_events_match_id_fkey FOREIGN KEY (match_id)
    REFERENCES public.matches(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT match_events_version_check CHECK (version >= 0),
  CONSTRAINT match_events_type_check CHECK (
    type IN ('START', 'MOVE', 'UNDO', 'PROPOSAL_CREATED', 'PROPOSAL_RESOLVED', 'RESULT')
  ),
  CONSTRAINT match_events_start_version_check CHECK (
    (type = 'START' AND version = 0) OR (type <> 'START' AND version > 0)
  ),
  CONSTRAINT match_events_payload_json_check CHECK (
    jsonb_typeof(payload) = 'object'
  )
);

-- 4. public.match_moves
CREATE TABLE IF NOT EXISTS public.match_moves (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL,
  parent_move_id uuid NULL,
  event_version bigint NOT NULL,
  side text NOT NULL,
  move jsonb NOT NULL,
  search_meta jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT match_moves_pkey PRIMARY KEY (id),
  CONSTRAINT match_moves_match_id_id_unique UNIQUE (match_id, id),
  CONSTRAINT match_moves_match_event_version_unique UNIQUE (match_id, event_version),
  CONSTRAINT match_moves_match_id_fkey FOREIGN KEY (match_id)
    REFERENCES public.matches(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT match_moves_parent_fk FOREIGN KEY (match_id, parent_move_id)
    REFERENCES public.match_moves(match_id, id) MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT match_moves_event_version_fk FOREIGN KEY (match_id, event_version)
    REFERENCES public.match_events(match_id, version) MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT match_moves_parent_move_check CHECK (parent_move_id IS NULL OR parent_move_id <> id),
  CONSTRAINT match_moves_event_version_check CHECK (event_version > 0),
  CONSTRAINT match_moves_side_check CHECK (side IN ('RED', 'BLACK')),
  CONSTRAINT match_moves_move_json_check CHECK (
    jsonb_typeof(move) = 'object'
    AND (move->'from'->>'x') ~ '^[0-8]$' AND (move->'from'->>'y') ~ '^[0-9]$'
    AND (move->'to'->>'x') ~ '^[0-8]$' AND (move->'to'->>'y') ~ '^[0-9]$'
    AND NOT (move->'from'->>'x' = move->'to'->>'x' AND move->'from'->>'y' = move->'to'->>'y')
  ),
  CONSTRAINT match_moves_search_meta_json_check CHECK (
    search_meta IS NULL OR jsonb_typeof(search_meta) = 'object'
  )
);

CREATE INDEX IF NOT EXISTS match_moves_parent_idx
  ON public.match_moves (match_id, parent_move_id);

-- 5. public.command_receipts
CREATE TABLE IF NOT EXISTS public.command_receipts (
  match_id uuid NOT NULL,
  actor_key text NOT NULL,
  command_id uuid NOT NULL,
  command_type text NOT NULL,
  payload_hash bytea NOT NULL,
  applied_version bigint NOT NULL,
  result jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT command_receipts_pkey PRIMARY KEY (match_id, actor_key, command_id),
  CONSTRAINT command_receipts_match_id_fkey FOREIGN KEY (match_id)
    REFERENCES public.matches(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT command_receipts_event_version_fk FOREIGN KEY (match_id, applied_version)
    REFERENCES public.match_events(match_id, version) MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT command_receipts_payload_hash_length_check CHECK (octet_length(payload_hash) = 32),
  CONSTRAINT command_receipts_applied_version_check CHECK (applied_version > 0),
  CONSTRAINT command_receipts_command_type_check CHECK (
    command_type IN ('MOVE', 'RESIGN', 'PROPOSE', 'RESPOND', 'UNDO_AI')
  ),
  CONSTRAINT command_receipts_actor_key_check CHECK (
    actor_key = 'AI' OR actor_key ~ '^USER:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  ),
  CONSTRAINT command_receipts_result_json_check CHECK (
    jsonb_typeof(result) = 'object'
    AND (
      ((result->>'kind') = 'APPLIED' AND (result->'errorCode' IS NULL OR jsonb_typeof(result->'errorCode') = 'null'))
      OR
      ((result->>'kind') = 'DEADLINE_FINALIZED' AND (result->>'errorCode') = 'MATCH_ENDED')
    )
  )
);

-- 6. public.client_controls
CREATE TABLE IF NOT EXISTS public.client_controls (
  user_id uuid NOT NULL,
  room_id uuid NULL,
  match_id uuid NULL,
  controller_id uuid NOT NULL,
  controller_tab_id uuid NOT NULL,
  session_id uuid NOT NULL,
  control_epoch bigint NOT NULL DEFAULT 1,
  lease_until timestamptz NOT NULL,
  disconnected_at timestamptz NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT client_controls_pkey PRIMARY KEY (user_id),
  CONSTRAINT client_controls_controller_id_unique UNIQUE (controller_id),
  CONSTRAINT client_controls_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT client_controls_room_member_fk FOREIGN KEY (room_id, user_id)
    REFERENCES public.room_members(room_id, user_id) MATCH SIMPLE ON DELETE CASCADE,
  CONSTRAINT client_controls_match_id_fkey FOREIGN KEY (match_id)
    REFERENCES public.matches(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT client_controls_match_room_fk FOREIGN KEY (match_id, room_id)
    REFERENCES public.matches(id, room_id) MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT client_controls_epoch_check CHECK (control_epoch >= 1),
  CONSTRAINT client_controls_context_check CHECK (room_id IS NOT NULL OR match_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS client_controls_session_idx ON public.client_controls (session_id);
CREATE INDEX IF NOT EXISTS client_controls_lease_idx ON public.client_controls (lease_until);
CREATE INDEX IF NOT EXISTS client_controls_match_idx ON public.client_controls (match_id) WHERE match_id IS NOT NULL;

-- 7. RLS & Grants for Migration 3
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches FORCE ROW LEVEL SECURITY;

ALTER TABLE public.active_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_players FORCE ROW LEVEL SECURITY;

ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events FORCE ROW LEVEL SECURITY;

ALTER TABLE public.match_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_moves FORCE ROW LEVEL SECURITY;

ALTER TABLE public.command_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.command_receipts FORCE ROW LEVEL SECURITY;

ALTER TABLE public.client_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_controls FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.matches FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.active_players FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.match_events FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.match_moves FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.command_receipts FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.client_controls FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON public.matches TO app_server;
GRANT SELECT, INSERT, DELETE ON public.active_players TO app_server;
GRANT SELECT, INSERT ON public.match_events, public.match_moves, public.command_receipts TO app_server;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_controls TO app_server;

DROP POLICY IF EXISTS app_server_matches ON public.matches;
CREATE POLICY app_server_matches ON public.matches
  FOR ALL TO app_server USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS app_server_active_players ON public.active_players;
CREATE POLICY app_server_active_players ON public.active_players
  FOR ALL TO app_server USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS app_server_match_events ON public.match_events;
CREATE POLICY app_server_match_events ON public.match_events
  FOR ALL TO app_server USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS app_server_match_moves ON public.match_moves;
CREATE POLICY app_server_match_moves ON public.match_moves
  FOR ALL TO app_server USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS app_server_command_receipts ON public.command_receipts;
CREATE POLICY app_server_command_receipts ON public.command_receipts
  FOR ALL TO app_server USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS app_server_client_controls ON public.client_controls;
CREATE POLICY app_server_client_controls ON public.client_controls
  FOR ALL TO app_server USING (true) WITH CHECK (true);
