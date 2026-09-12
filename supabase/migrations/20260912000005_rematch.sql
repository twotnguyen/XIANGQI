-- Migration 5: rematch (early inclusion from ISSUE-027)
-- 09-DATABASE-DESIGN.md: Section 10, 13, 15

-- 1. public.room_rematch_votes
CREATE TABLE IF NOT EXISTS public.room_rematch_votes (
  room_id uuid NOT NULL,
  match_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT room_rematch_votes_pkey PRIMARY KEY (room_id, match_id, user_id),
  CONSTRAINT room_rematch_votes_room_id_fkey FOREIGN KEY (room_id)
    REFERENCES public.rooms(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT room_rematch_votes_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT room_rematch_votes_match_room_fk FOREIGN KEY (match_id, room_id)
    REFERENCES public.matches(id, room_id) MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT
);

-- 2. public.room_command_receipts
CREATE TABLE IF NOT EXISTS public.room_command_receipts (
  room_id uuid NOT NULL,
  actor_id uuid NOT NULL,
  command_id uuid NOT NULL,
  command_type text NOT NULL,
  expected_match_id uuid NOT NULL,
  payload_hash bytea NOT NULL,
  new_match_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT room_command_receipts_pkey PRIMARY KEY (room_id, actor_id, command_id),
  CONSTRAINT room_command_receipts_room_id_fkey FOREIGN KEY (room_id)
    REFERENCES public.rooms(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT room_command_receipts_actor_id_fkey FOREIGN KEY (actor_id)
    REFERENCES public.profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT room_command_receipts_expected_match_fk FOREIGN KEY (expected_match_id, room_id)
    REFERENCES public.matches(id, room_id) MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT room_command_receipts_new_match_fk FOREIGN KEY (new_match_id, room_id)
    REFERENCES public.matches(id, room_id) MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT room_command_receipts_command_type_check CHECK (command_type = 'REMATCH'),
  CONSTRAINT room_command_receipts_payload_hash_check CHECK (octet_length(payload_hash) = 32),
  CONSTRAINT room_command_receipts_distinct_match_check CHECK (
    new_match_id IS NULL OR new_match_id <> expected_match_id
  )
);

-- 3. RLS & Grants for Migration 5
ALTER TABLE public.room_rematch_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_rematch_votes FORCE ROW LEVEL SECURITY;

ALTER TABLE public.room_command_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_command_receipts FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.room_rematch_votes FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.room_command_receipts FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, DELETE ON public.room_rematch_votes TO app_server;
GRANT SELECT, INSERT ON public.room_command_receipts TO app_server;

DROP POLICY IF EXISTS app_server_room_rematch_votes ON public.room_rematch_votes;
CREATE POLICY app_server_room_rematch_votes ON public.room_rematch_votes
  FOR ALL TO app_server USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS app_server_room_command_receipts ON public.room_command_receipts;
CREATE POLICY app_server_room_command_receipts ON public.room_command_receipts
  FOR ALL TO app_server USING (true) WITH CHECK (true);
