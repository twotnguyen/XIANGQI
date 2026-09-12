-- Migration 4: ai-chat-media
-- 09-DATABASE-DESIGN.md: Section 7.2, 8, 9, 13, 15

-- 1. public.ai_jobs
CREATE TABLE IF NOT EXISTS public.ai_jobs (
  match_id uuid NOT NULL,
  id uuid NULL,
  expected_version bigint NULL,
  status text NOT NULL DEFAULT 'IDLE',
  job_version bigint NOT NULL DEFAULT 0,
  attempts smallint NOT NULL DEFAULT 0,
  queued_at timestamptz NULL,
  started_at timestamptz NULL,
  completed_at timestamptz NULL,
  deadline_at timestamptz NULL,
  last_error_code text NULL,
  CONSTRAINT ai_jobs_pkey PRIMARY KEY (match_id),
  CONSTRAINT ai_jobs_id_unique UNIQUE (id),
  CONSTRAINT ai_jobs_match_id_fkey FOREIGN KEY (match_id)
    REFERENCES public.matches(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT ai_jobs_status_check CHECK (status IN ('IDLE', 'QUEUED', 'THINKING', 'FAILED')),
  CONSTRAINT ai_jobs_job_version_check CHECK (job_version >= 0),
  CONSTRAINT ai_jobs_attempts_check CHECK (attempts BETWEEN 0 AND 2),
  CONSTRAINT ai_jobs_timing_check CHECK (
    (id IS NULL AND expected_version IS NULL AND queued_at IS NULL AND deadline_at IS NULL AND status = 'IDLE' AND attempts = 0)
    OR
    (id IS NOT NULL AND expected_version IS NOT NULL AND expected_version >= 0 AND queued_at IS NOT NULL AND deadline_at IS NOT NULL AND deadline_at >= queued_at)
  ),
  CONSTRAINT ai_jobs_status_lifecycle_check CHECK (
    (status IN ('QUEUED', 'THINKING') AND id IS NOT NULL AND completed_at IS NULL)
    OR
    (status = 'FAILED' AND id IS NOT NULL AND completed_at IS NOT NULL AND completed_at >= queued_at)
    OR
    (status = 'IDLE' AND (
      (id IS NULL AND completed_at IS NULL)
      OR
      (id IS NOT NULL AND completed_at IS NOT NULL AND completed_at >= queued_at)
    ))
  ),
  CONSTRAINT ai_jobs_thinking_started_check CHECK (
    (status <> 'THINKING')
    OR
    (status = 'THINKING' AND started_at IS NOT NULL AND started_at >= queued_at AND attempts >= 1)
  )
);

CREATE INDEX IF NOT EXISTS ai_jobs_active_queue_idx
  ON public.ai_jobs (status, queued_at, match_id)
  WHERE status IN ('QUEUED', 'THINKING');

-- 2. public.chat_messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  match_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  channel text NOT NULL,
  client_message_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chat_messages_pkey PRIMARY KEY (id),
  CONSTRAINT chat_messages_room_id_fkey FOREIGN KEY (room_id)
    REFERENCES public.rooms(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT chat_messages_sender_id_fkey FOREIGN KEY (sender_id)
    REFERENCES public.profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT chat_messages_match_room_fk FOREIGN KEY (match_id, room_id)
    REFERENCES public.matches(id, room_id) MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT chat_messages_client_msg_unique UNIQUE (match_id, sender_id, client_message_id),
  CONSTRAINT chat_messages_channel_check CHECK (channel IN ('PLAYERS', 'SPECTATORS')),
  CONSTRAINT chat_messages_content_check CHECK (
    char_length(content) BETWEEN 1 AND 1000
    AND btrim(content) <> ''
  )
);

CREATE INDEX IF NOT EXISTS chat_messages_room_match_channel_idx
  ON public.chat_messages (room_id, match_id, channel, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS chat_messages_retention_idx
  ON public.chat_messages (created_at, id);

-- 3. public.media_policies
CREATE TABLE IF NOT EXISTS public.media_policies (
  match_id uuid NOT NULL,
  user_id uuid NOT NULL,
  camera_audience text NOT NULL DEFAULT 'OFF',
  microphone_audience text NOT NULL DEFAULT 'OFF',
  policy_version bigint NOT NULL DEFAULT 0,
  applied_camera_audience text NOT NULL DEFAULT 'OFF',
  applied_microphone_audience text NOT NULL DEFAULT 'OFF',
  applied_version bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'APPLIED',
  epoch bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT media_policies_pkey PRIMARY KEY (match_id, user_id),
  CONSTRAINT media_policies_match_id_fkey FOREIGN KEY (match_id)
    REFERENCES public.matches(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT media_policies_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT media_policies_camera_audience_check CHECK (
    camera_audience IN ('OFF', 'OPPONENT_ONLY', 'OPPONENT_AND_SPECTATORS')
  ),
  CONSTRAINT media_policies_mic_audience_check CHECK (
    microphone_audience IN ('OFF', 'OPPONENT_ONLY', 'OPPONENT_AND_SPECTATORS')
  ),
  CONSTRAINT media_policies_applied_camera_check CHECK (
    applied_camera_audience IN ('OFF', 'OPPONENT_ONLY', 'OPPONENT_AND_SPECTATORS')
  ),
  CONSTRAINT media_policies_applied_mic_check CHECK (
    applied_microphone_audience IN ('OFF', 'OPPONENT_ONLY', 'OPPONENT_AND_SPECTATORS')
  ),
  CONSTRAINT media_policies_status_check CHECK (status IN ('APPLYING', 'APPLIED')),
  CONSTRAINT media_policies_version_bounds_check CHECK (
    policy_version >= 0 AND applied_version >= 0 AND applied_version <= policy_version
  ),
  CONSTRAINT media_policies_epoch_check CHECK (epoch >= 0),
  CONSTRAINT media_policies_applied_invariant_check CHECK (
    (status = 'APPLIED' AND policy_version = applied_version AND camera_audience = applied_camera_audience AND microphone_audience = applied_microphone_audience)
    OR
    (status = 'APPLYING')
  )
);

-- 4. public.media_transports
CREATE TABLE IF NOT EXISTS public.media_transports (
  match_id uuid NOT NULL,
  kind text NOT NULL,
  audience text NOT NULL,
  generation bigint NOT NULL,
  room_name text NOT NULL,
  status text NOT NULL DEFAULT 'READY',
  created_at timestamptz NOT NULL DEFAULT now(),
  retired_at timestamptz NULL,
  CONSTRAINT media_transports_pkey PRIMARY KEY (match_id, kind, audience, generation),
  CONSTRAINT media_transports_room_name_unique UNIQUE (room_name),
  CONSTRAINT media_transports_match_id_fkey FOREIGN KEY (match_id)
    REFERENCES public.matches(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT media_transports_kind_check CHECK (kind IN ('CAMERA', 'MICROPHONE')),
  CONSTRAINT media_transports_audience_check CHECK (audience IN ('PRIVATE', 'WATCH')),
  CONSTRAINT media_transports_generation_check CHECK (generation >= 1),
  CONSTRAINT media_transports_status_check CHECK (status IN ('READY', 'ROTATING', 'RETIRED')),
  CONSTRAINT media_transports_retired_check CHECK (
    (status = 'RETIRED' AND retired_at IS NOT NULL AND retired_at >= created_at)
    OR
    (status <> 'RETIRED' AND retired_at IS NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS media_transports_active_unique_idx
  ON public.media_transports (match_id, kind, audience)
  WHERE status IN ('READY', 'ROTATING');

CREATE INDEX IF NOT EXISTS media_transports_rotating_idx
  ON public.media_transports (status, match_id)
  WHERE status = 'ROTATING';

-- 5. public.media_policy_jobs
CREATE TABLE IF NOT EXISTS public.media_policy_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL,
  reason text NOT NULL,
  desired_versions jsonb NOT NULL DEFAULT '[]'::jsonb,
  target_watch_epoch bigint NOT NULL,
  target_controls jsonb NOT NULL DEFAULT '[]'::jsonb,
  effects jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'PENDING',
  attempts smallint NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NULL,
  last_error text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz NULL,
  CONSTRAINT media_policy_jobs_pkey PRIMARY KEY (id),
  CONSTRAINT media_policy_jobs_match_id_fkey FOREIGN KEY (match_id)
    REFERENCES public.matches(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT media_policy_jobs_reason_check CHECK (
    reason IN ('POLICY', 'MEMBERSHIP', 'CONTROL', 'END', 'RESTART')
  ),
  CONSTRAINT media_policy_jobs_status_check CHECK (
    status IN ('PENDING', 'RUNNING', 'RETRY', 'FAILED', 'SUCCEEDED')
  ),
  CONSTRAINT media_policy_jobs_attempts_check CHECK (attempts BETWEEN 0 AND 4),
  CONSTRAINT media_policy_jobs_target_watch_epoch_check CHECK (target_watch_epoch >= 0),
  CONSTRAINT media_policy_jobs_desired_versions_check CHECK (
    jsonb_typeof(desired_versions) = 'array' AND jsonb_array_length(desired_versions) <= 2
  ),
  CONSTRAINT media_policy_jobs_target_controls_check CHECK (
    jsonb_typeof(target_controls) = 'array' AND jsonb_array_length(target_controls) <= 7
  ),
  CONSTRAINT media_policy_jobs_effects_check CHECK (
    jsonb_typeof(effects) = 'array' AND jsonb_array_length(effects) <= 4
  ),
  CONSTRAINT media_policy_jobs_last_error_check CHECK (
    last_error IS NULL OR char_length(last_error) <= 1000
  ),
  CONSTRAINT media_policy_jobs_completed_check CHECK (
    (status = 'SUCCEEDED' AND completed_at IS NOT NULL AND completed_at >= created_at)
    OR
    (status <> 'SUCCEEDED' AND completed_at IS NULL)
  ),
  CONSTRAINT media_policy_jobs_retry_check CHECK (
    (status = 'RETRY' AND next_attempt_at IS NOT NULL)
    OR
    (status <> 'RETRY' AND next_attempt_at IS NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS media_policy_jobs_active_unique_idx
  ON public.media_policy_jobs (match_id)
  WHERE status <> 'SUCCEEDED';

CREATE INDEX IF NOT EXISTS media_policy_jobs_retry_idx
  ON public.media_policy_jobs (next_attempt_at, id)
  WHERE status = 'RETRY';

CREATE INDEX IF NOT EXISTS media_policy_jobs_audit_idx
  ON public.media_policy_jobs (match_id, created_at DESC, id DESC);

-- 6. RLS & Grants for Migration 4
ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_jobs FORCE ROW LEVEL SECURITY;

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages FORCE ROW LEVEL SECURITY;

ALTER TABLE public.media_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_policies FORCE ROW LEVEL SECURITY;

ALTER TABLE public.media_transports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_transports FORCE ROW LEVEL SECURITY;

ALTER TABLE public.media_policy_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_policy_jobs FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.ai_jobs FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.chat_messages FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.media_policies FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.media_transports FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.media_policy_jobs FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON public.ai_jobs, public.media_policies, public.media_transports, public.media_policy_jobs TO app_server;
GRANT SELECT, INSERT, DELETE ON public.chat_messages TO app_server;

DROP POLICY IF EXISTS app_server_ai_jobs ON public.ai_jobs;
CREATE POLICY app_server_ai_jobs ON public.ai_jobs
  FOR ALL TO app_server USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS app_server_chat_messages ON public.chat_messages;
CREATE POLICY app_server_chat_messages ON public.chat_messages
  FOR ALL TO app_server USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS app_server_media_policies ON public.media_policies;
CREATE POLICY app_server_media_policies ON public.media_policies
  FOR ALL TO app_server USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS app_server_media_transports ON public.media_transports;
CREATE POLICY app_server_media_transports ON public.media_transports
  FOR ALL TO app_server USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS app_server_media_policy_jobs ON public.media_policy_jobs;
CREATE POLICY app_server_media_policy_jobs ON public.media_policy_jobs
  FOR ALL TO app_server USING (true) WITH CHECK (true);
