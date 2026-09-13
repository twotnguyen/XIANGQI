-- Migration 20260912000010_matches_runtime_fixes.sql
-- Synchronizes live DB schema with server runtime and contract requirements

-- 1. active_players: support room-only presence and created_at
ALTER TABLE public.active_players ALTER COLUMN match_id DROP NOT NULL;
ALTER TABLE public.active_players ADD COLUMN IF NOT EXISTS room_id uuid NULL;
ALTER TABLE public.active_players ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- 2. room_members: set default 0 for admission_epoch
ALTER TABLE public.room_members ALTER COLUMN admission_epoch SET DEFAULT 0;

-- 3. matches: defaults for required fields, updated_at column
ALTER TABLE public.matches ALTER COLUMN repetition_counts SET DEFAULT '{}'::jsonb;
ALTER TABLE public.matches ALTER COLUMN boot_id SET DEFAULT gen_random_uuid();
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS server_now_ms bigint;
ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS matches_active_move_ids_check;

-- 4. public.moves table for move logging and replay
CREATE TABLE IF NOT EXISTS public.moves (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  move_number integer NOT NULL,
  player_id uuid NULL,
  side text NOT NULL,
  from_x integer NOT NULL,
  from_y integer NOT NULL,
  to_x integer NOT NULL,
  to_y integer NOT NULL,
  piece_type text NOT NULL,
  captured_type text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT moves_pkey PRIMARY KEY (id),
  CONSTRAINT moves_match_move_number_unique UNIQUE (match_id, move_number)
);

CREATE INDEX IF NOT EXISTS moves_match_id_idx ON public.moves (match_id, move_number ASC);
GRANT ALL ON TABLE public.moves TO app_server, postgres;

-- 5. command_receipts: relax actor_key requirement, composite PK update
ALTER TABLE public.command_receipts DROP CONSTRAINT IF EXISTS command_receipts_pkey;
ALTER TABLE public.command_receipts ADD CONSTRAINT command_receipts_pkey PRIMARY KEY (match_id, command_id);
ALTER TABLE public.command_receipts ALTER COLUMN actor_key DROP NOT NULL;
ALTER TABLE public.command_receipts DROP CONSTRAINT IF EXISTS command_receipts_actor_key_check;
ALTER TABLE public.command_receipts DROP CONSTRAINT IF EXISTS command_receipts_payload_hash_length_check;
ALTER TABLE public.command_receipts DROP CONSTRAINT IF EXISTS command_receipts_result_json_check;
ALTER TABLE public.command_receipts ALTER COLUMN result DROP NOT NULL;
ALTER TABLE public.command_receipts ADD COLUMN IF NOT EXISTS expected_version bigint;
ALTER TABLE public.command_receipts ADD COLUMN IF NOT EXISTS response_snapshot jsonb;
ALTER TABLE public.command_receipts ALTER COLUMN payload_hash TYPE text USING encode(payload_hash, 'hex');

-- 6. chat_messages: room_id nullable for offline/AI matches
ALTER TABLE public.chat_messages ALTER COLUMN room_id DROP NOT NULL;

-- 7. rooms: updated_at column
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
