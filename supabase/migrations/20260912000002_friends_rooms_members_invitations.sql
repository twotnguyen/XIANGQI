-- Migration 2: friends-rooms-members-invitations
-- 09-DATABASE-DESIGN.md: Section 5, 13, 15

-- 1. public.friend_relations
CREATE TABLE IF NOT EXISTS public.friend_relations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_low uuid NOT NULL,
  user_high uuid NOT NULL,
  requester_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz NULL,
  CONSTRAINT friend_relations_pkey PRIMARY KEY (id),
  CONSTRAINT friend_relations_user_pair_unique UNIQUE (user_low, user_high),
  CONSTRAINT friend_relations_user_low_fkey FOREIGN KEY (user_low)
    REFERENCES public.profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT friend_relations_user_high_fkey FOREIGN KEY (user_high)
    REFERENCES public.profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT friend_relations_requester_fkey FOREIGN KEY (requester_id)
    REFERENCES public.profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT friend_relations_user_order_check CHECK (user_low < user_high),
  CONSTRAINT friend_relations_requester_check CHECK (requester_id IN (user_low, user_high)),
  CONSTRAINT friend_relations_status_check CHECK (status IN ('PENDING', 'ACCEPTED')),
  CONSTRAINT friend_relations_acceptance_check CHECK (
    (status = 'ACCEPTED' AND accepted_at IS NOT NULL AND accepted_at >= created_at)
    OR (status = 'PENDING' AND accepted_at IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS friend_relations_user_low_idx
  ON public.friend_relations (user_low, status, created_at DESC, id);
CREATE INDEX IF NOT EXISTS friend_relations_user_high_idx
  ON public.friend_relations (user_high, status, created_at DESC, id);

-- 2. public.rooms
CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  visibility text NOT NULL DEFAULT 'PUBLIC',
  status text NOT NULL DEFAULT 'WAITING',
  room_version bigint NOT NULL DEFAULT 0,
  current_match_id uuid NULL,
  time_control smallint NOT NULL DEFAULT 0,
  watch_epoch bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz NULL,
  closed_at timestamptz NULL,
  CONSTRAINT rooms_pkey PRIMARY KEY (id),
  CONSTRAINT rooms_owner_id_fkey FOREIGN KEY (owner_id)
    REFERENCES public.profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT rooms_name_check CHECK (
    char_length(name) BETWEEN 1 AND 60
    AND name = btrim(name)
    AND name <> ''
  ),
  CONSTRAINT rooms_visibility_check CHECK (visibility IN ('PUBLIC', 'CODE_ONLY', 'LOCKED')),
  CONSTRAINT rooms_status_check CHECK (status IN ('WAITING', 'PLAYING', 'FINISHED', 'CLOSED')),
  CONSTRAINT rooms_version_check CHECK (room_version >= 0),
  CONSTRAINT rooms_time_control_check CHECK (time_control IN (0, 300, 600, 900)),
  CONSTRAINT rooms_watch_epoch_check CHECK (watch_epoch >= 0),
  CONSTRAINT rooms_status_invariants CHECK (
    (status = 'WAITING' AND current_match_id IS NULL AND finished_at IS NULL AND closed_at IS NULL)
    OR (status = 'PLAYING' AND current_match_id IS NOT NULL AND finished_at IS NULL AND closed_at IS NULL)
    OR (status = 'FINISHED' AND current_match_id IS NOT NULL AND finished_at IS NOT NULL AND closed_at IS NULL AND finished_at >= created_at)
    OR (status = 'CLOSED' AND closed_at IS NOT NULL AND closed_at >= created_at AND (finished_at IS NULL OR closed_at >= finished_at))
  )
);

CREATE INDEX IF NOT EXISTS rooms_lobby_idx
  ON public.rooms (created_at DESC, id DESC)
  WHERE visibility = 'PUBLIC' AND status <> 'CLOSED';

CREATE INDEX IF NOT EXISTS rooms_finished_idx
  ON public.rooms (finished_at, id)
  WHERE status = 'FINISHED';

CREATE INDEX IF NOT EXISTS rooms_owner_id_idx
  ON public.rooms (owner_id);

-- 3. public.room_members
CREATE TABLE IF NOT EXISTS public.room_members (
  room_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL,
  side text NULL,
  ready boolean NOT NULL DEFAULT false,
  admission_epoch bigint NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  disconnected_at timestamptz NULL,
  CONSTRAINT room_members_pkey PRIMARY KEY (room_id, user_id),
  CONSTRAINT room_members_user_unique UNIQUE (user_id),
  CONSTRAINT room_members_room_side_unique UNIQUE (room_id, side) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT room_members_room_id_fkey FOREIGN KEY (room_id)
    REFERENCES public.rooms(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT room_members_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT room_members_role_check CHECK (role IN ('PLAYER', 'SPECTATOR')),
  CONSTRAINT room_members_role_invariants CHECK (
    (role = 'PLAYER' AND side IS NOT NULL AND side IN ('RED', 'BLACK') AND admission_epoch = 0)
    OR (role = 'SPECTATOR' AND side IS NULL AND ready = false AND admission_epoch >= 0)
  )
);

CREATE INDEX IF NOT EXISTS room_members_disconnected_spectators_idx
  ON public.room_members (disconnected_at)
  WHERE role = 'SPECTATOR' AND disconnected_at IS NOT NULL;

-- 4. public.invitations
CREATE TABLE IF NOT EXISTS public.invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  recipient_id uuid NULL,
  role text NOT NULL,
  token_hash bytea NULL,
  code_hash bytea NULL,
  status text NOT NULL DEFAULT 'ACTIVE',
  epoch bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  resolved_at timestamptz NULL,
  consumed_by uuid NULL,
  CONSTRAINT invitations_pkey PRIMARY KEY (id),
  CONSTRAINT invitations_room_id_fkey FOREIGN KEY (room_id)
    REFERENCES public.rooms(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT invitations_sender_id_fkey FOREIGN KEY (sender_id)
    REFERENCES public.profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT invitations_recipient_id_fkey FOREIGN KEY (recipient_id)
    REFERENCES public.profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT invitations_consumed_by_fkey FOREIGN KEY (consumed_by)
    REFERENCES public.profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT invitations_role_check CHECK (role IN ('PLAY', 'WATCH')),
  CONSTRAINT invitations_status_check CHECK (status IN ('ACTIVE', 'CONSUMED', 'DECLINED', 'REVOKED', 'EXPIRED')),
  CONSTRAINT invitations_dates_check CHECK (expires_at > created_at),
  CONSTRAINT invitations_epoch_check CHECK (epoch >= 0 AND ((role = 'PLAY' AND epoch = 0) OR (role = 'WATCH' AND epoch >= 0))),
  CONSTRAINT invitations_direct_vs_share_check CHECK (
    (recipient_id IS NOT NULL AND role = 'PLAY' AND token_hash IS NULL AND code_hash IS NULL AND recipient_id <> sender_id)
    OR (recipient_id IS NULL AND token_hash IS NOT NULL AND code_hash IS NOT NULL AND octet_length(token_hash) = 32 AND octet_length(code_hash) = 32)
  ),
  CONSTRAINT invitations_status_lifecycle_check CHECK (
    (role = 'PLAY' OR status NOT IN ('CONSUMED', 'DECLINED'))
    AND (status <> 'DECLINED' OR recipient_id IS NOT NULL)
    AND ((status = 'CONSUMED' AND consumed_by IS NOT NULL) OR (status <> 'CONSUMED' AND consumed_by IS NULL))
    AND (status <> 'CONSUMED' OR recipient_id IS NULL OR consumed_by = recipient_id)
    AND ((status = 'ACTIVE' AND resolved_at IS NULL) OR (status <> 'ACTIVE' AND resolved_at IS NOT NULL AND resolved_at >= created_at))
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS invitations_active_code_hash_idx
  ON public.invitations (code_hash)
  WHERE status = 'ACTIVE' AND code_hash IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS invitations_active_token_hash_idx
  ON public.invitations (token_hash)
  WHERE status = 'ACTIVE' AND token_hash IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS invitations_active_direct_idx
  ON public.invitations (room_id, recipient_id)
  WHERE status = 'ACTIVE' AND recipient_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS invitations_recipient_idx
  ON public.invitations (recipient_id, created_at DESC, id DESC)
  WHERE recipient_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS invitations_room_status_idx
  ON public.invitations (room_id, status);

CREATE INDEX IF NOT EXISTS invitations_expires_active_idx
  ON public.invitations (expires_at)
  WHERE status = 'ACTIVE';

-- 5. RLS & Grants for Migration 2
ALTER TABLE public.friend_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_relations FORCE ROW LEVEL SECURITY;

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms FORCE ROW LEVEL SECURITY;

ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members FORCE ROW LEVEL SECURITY;

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.friend_relations FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.rooms FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.room_members FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.invitations FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.friend_relations, public.room_members TO app_server;
GRANT SELECT, INSERT, UPDATE ON public.rooms, public.invitations TO app_server;

DROP POLICY IF EXISTS app_server_friend_relations ON public.friend_relations;
CREATE POLICY app_server_friend_relations ON public.friend_relations
  FOR ALL TO app_server USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS app_server_rooms ON public.rooms;
CREATE POLICY app_server_rooms ON public.rooms
  FOR ALL TO app_server USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS app_server_room_members ON public.room_members;
CREATE POLICY app_server_room_members ON public.room_members
  FOR ALL TO app_server USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS app_server_invitations ON public.invitations;
CREATE POLICY app_server_invitations ON public.invitations
  FOR ALL TO app_server USING (true) WITH CHECK (true);
