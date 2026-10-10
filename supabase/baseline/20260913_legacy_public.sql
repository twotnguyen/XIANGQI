-- XIANGQI pre-20261011000001 public baseline: 19 audited September tables.

-- Schema only. Requires managed auth.users and Supabase roles; no Auth recreation or seeds.

-- Source: fresh read-only catalog 2026-10-10T22:27:33Z, reverting only documented T04 changes.

BEGIN;

SET LOCAL search_path = public, pg_catalog;

CREATE TABLE public."active_players" (
  "user_id" uuid NOT NULL,
  "match_id" uuid,
  "acquired_at" timestamp with time zone DEFAULT now() NOT NULL,
  "room_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public."active_players" OWNER TO postgres;

CREATE TABLE public."ai_jobs" (
  "match_id" uuid NOT NULL,
  "id" uuid,
  "expected_version" bigint,
  "status" text DEFAULT 'IDLE'::text NOT NULL,
  "job_version" bigint DEFAULT 0 NOT NULL,
  "attempts" smallint DEFAULT 0 NOT NULL,
  "queued_at" timestamp with time zone,
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "deadline_at" timestamp with time zone,
  "last_error_code" text
);

ALTER TABLE public."ai_jobs" OWNER TO postgres;

CREATE TABLE public."chat_messages" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "room_id" uuid,
  "match_id" uuid NOT NULL,
  "sender_id" uuid NOT NULL,
  "channel" text NOT NULL,
  "client_message_id" uuid NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public."chat_messages" OWNER TO postgres;

CREATE TABLE public."client_controls" (
  "user_id" uuid NOT NULL,
  "room_id" uuid,
  "match_id" uuid,
  "controller_id" uuid NOT NULL,
  "controller_tab_id" uuid NOT NULL,
  "session_id" uuid NOT NULL,
  "control_epoch" bigint DEFAULT 1 NOT NULL,
  "lease_until" timestamp with time zone NOT NULL,
  "disconnected_at" timestamp with time zone,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public."client_controls" OWNER TO postgres;

CREATE TABLE public."command_receipts" (
  "match_id" uuid NOT NULL,
  "actor_key" text,
  "command_id" uuid NOT NULL,
  "command_type" text NOT NULL,
  "payload_hash" text NOT NULL,
  "applied_version" bigint NOT NULL,
  "result" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "expected_version" bigint,
  "response_snapshot" jsonb
);

ALTER TABLE public."command_receipts" OWNER TO postgres;

CREATE TABLE public."friend_relations" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_low" uuid NOT NULL,
  "user_high" uuid NOT NULL,
  "requester_id" uuid NOT NULL,
  "status" text DEFAULT 'PENDING'::text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "accepted_at" timestamp with time zone
);

ALTER TABLE public."friend_relations" OWNER TO postgres;

CREATE TABLE public."invitations" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "room_id" uuid NOT NULL,
  "sender_id" uuid NOT NULL,
  "recipient_id" uuid,
  "role" text NOT NULL,
  "token_hash" bytea,
  "code_hash" bytea,
  "status" text DEFAULT 'ACTIVE'::text NOT NULL,
  "epoch" bigint DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "resolved_at" timestamp with time zone,
  "consumed_by" uuid
);

ALTER TABLE public."invitations" OWNER TO postgres;

CREATE TABLE public."match_events" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "match_id" uuid NOT NULL,
  "version" bigint NOT NULL,
  "type" text NOT NULL,
  "payload" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public."match_events" OWNER TO postgres;

CREATE TABLE public."match_moves" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "match_id" uuid NOT NULL,
  "parent_move_id" uuid,
  "event_version" bigint NOT NULL,
  "side" text NOT NULL,
  "move" jsonb NOT NULL,
  "search_meta" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public."match_moves" OWNER TO postgres;

CREATE TABLE public."matches" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "room_id" uuid,
  "mode" text NOT NULL,
  "status" text DEFAULT 'ACTIVE'::text NOT NULL,
  "red_user_id" uuid,
  "black_user_id" uuid,
  "ai_side" text,
  "ai_level" text,
  "position" jsonb NOT NULL,
  "version" bigint DEFAULT 0 NOT NULL,
  "ply" integer DEFAULT 0 NOT NULL,
  "time_control" smallint DEFAULT 0 NOT NULL,
  "clock" jsonb,
  "rule_set_version" text DEFAULT 'xiangqi-simple-v1'::text NOT NULL,
  "outcome" jsonb,
  "active_move_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "repetition_counts" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "proposal" jsonb,
  "boot_id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "ended_at" timestamp with time zone,
  "server_now_ms" bigint,
  "updated_at" timestamp with time zone DEFAULT now()
);

ALTER TABLE public."matches" OWNER TO postgres;

CREATE TABLE public."media_policies" (
  "match_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "camera_audience" text DEFAULT 'OFF'::text NOT NULL,
  "microphone_audience" text DEFAULT 'OFF'::text NOT NULL,
  "policy_version" bigint DEFAULT 0 NOT NULL,
  "applied_camera_audience" text DEFAULT 'OFF'::text NOT NULL,
  "applied_microphone_audience" text DEFAULT 'OFF'::text NOT NULL,
  "applied_version" bigint DEFAULT 0 NOT NULL,
  "status" text DEFAULT 'APPLIED'::text NOT NULL,
  "epoch" bigint DEFAULT 0 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public."media_policies" OWNER TO postgres;

CREATE TABLE public."media_policy_jobs" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "match_id" uuid NOT NULL,
  "reason" text NOT NULL,
  "desired_versions" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "target_watch_epoch" bigint NOT NULL,
  "target_controls" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "effects" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "status" text DEFAULT 'PENDING'::text NOT NULL,
  "attempts" smallint DEFAULT 0 NOT NULL,
  "next_attempt_at" timestamp with time zone,
  "last_error" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "completed_at" timestamp with time zone
);

ALTER TABLE public."media_policy_jobs" OWNER TO postgres;

CREATE TABLE public."media_transports" (
  "match_id" uuid NOT NULL,
  "kind" text NOT NULL,
  "audience" text NOT NULL,
  "generation" bigint NOT NULL,
  "room_name" text NOT NULL,
  "status" text DEFAULT 'READY'::text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "retired_at" timestamp with time zone
);

ALTER TABLE public."media_transports" OWNER TO postgres;

CREATE TABLE public."moves" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "match_id" uuid NOT NULL,
  "move_number" integer NOT NULL,
  "player_id" uuid,
  "side" text NOT NULL,
  "from_x" integer NOT NULL,
  "from_y" integer NOT NULL,
  "to_x" integer NOT NULL,
  "to_y" integer NOT NULL,
  "piece_type" text NOT NULL,
  "captured_type" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public."moves" OWNER TO postgres;

CREATE TABLE public."profiles" (
  "user_id" uuid NOT NULL,
  "username" text,
  "display_name" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "id" uuid GENERATED ALWAYS AS (user_id) STORED
);

ALTER TABLE public."profiles" OWNER TO postgres;

CREATE TABLE public."room_command_receipts" (
  "room_id" uuid NOT NULL,
  "actor_id" uuid NOT NULL,
  "command_id" uuid NOT NULL,
  "command_type" text NOT NULL,
  "expected_match_id" uuid NOT NULL,
  "payload_hash" bytea NOT NULL,
  "new_match_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public."room_command_receipts" OWNER TO postgres;

CREATE TABLE public."room_members" (
  "room_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "role" text NOT NULL,
  "side" text,
  "ready" boolean DEFAULT false NOT NULL,
  "admission_epoch" bigint DEFAULT 0 NOT NULL,
  "joined_at" timestamp with time zone DEFAULT now() NOT NULL,
  "disconnected_at" timestamp with time zone
);

ALTER TABLE public."room_members" OWNER TO postgres;

CREATE TABLE public."room_rematch_votes" (
  "room_id" uuid NOT NULL,
  "match_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public."room_rematch_votes" OWNER TO postgres;

CREATE TABLE public."rooms" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "owner_id" uuid NOT NULL,
  "name" text NOT NULL,
  "visibility" text DEFAULT 'PUBLIC'::text NOT NULL,
  "status" text DEFAULT 'WAITING'::text NOT NULL,
  "room_version" bigint DEFAULT 0 NOT NULL,
  "current_match_id" uuid,
  "time_control" smallint DEFAULT 0 NOT NULL,
  "watch_epoch" bigint DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "finished_at" timestamp with time zone,
  "closed_at" timestamp with time zone,
  "updated_at" timestamp with time zone DEFAULT now()
);

ALTER TABLE public."rooms" OWNER TO postgres;

ALTER TABLE public."active_players" ADD CONSTRAINT "active_players_pkey" PRIMARY KEY (user_id);

ALTER TABLE public."ai_jobs" ADD CONSTRAINT "ai_jobs_attempts_check" CHECK (((attempts >= 0) AND (attempts <= 2)));

ALTER TABLE public."ai_jobs" ADD CONSTRAINT "ai_jobs_id_unique" UNIQUE (id);

ALTER TABLE public."ai_jobs" ADD CONSTRAINT "ai_jobs_job_version_check" CHECK ((job_version >= 0));

ALTER TABLE public."ai_jobs" ADD CONSTRAINT "ai_jobs_pkey" PRIMARY KEY (match_id);

ALTER TABLE public."ai_jobs" ADD CONSTRAINT "ai_jobs_status_check" CHECK ((status = ANY (ARRAY['IDLE'::text, 'QUEUED'::text, 'THINKING'::text, 'FAILED'::text])));

ALTER TABLE public."ai_jobs" ADD CONSTRAINT "ai_jobs_status_lifecycle_check" CHECK ((((status = ANY (ARRAY['QUEUED'::text, 'THINKING'::text])) AND (id IS NOT NULL) AND (completed_at IS NULL)) OR ((status = 'FAILED'::text) AND (id IS NOT NULL) AND (completed_at IS NOT NULL) AND (completed_at >= queued_at)) OR ((status = 'IDLE'::text) AND (((id IS NULL) AND (completed_at IS NULL)) OR ((id IS NOT NULL) AND (completed_at IS NOT NULL) AND (completed_at >= queued_at))))));

ALTER TABLE public."ai_jobs" ADD CONSTRAINT "ai_jobs_thinking_started_check" CHECK (((status <> 'THINKING'::text) OR ((status = 'THINKING'::text) AND (started_at IS NOT NULL) AND (started_at >= queued_at) AND (attempts >= 1))));

ALTER TABLE public."ai_jobs" ADD CONSTRAINT "ai_jobs_timing_check" CHECK ((((id IS NULL) AND (expected_version IS NULL) AND (queued_at IS NULL) AND (deadline_at IS NULL) AND (status = 'IDLE'::text) AND (attempts = 0)) OR ((id IS NOT NULL) AND (expected_version IS NOT NULL) AND (expected_version >= 0) AND (queued_at IS NOT NULL) AND (deadline_at IS NOT NULL) AND (deadline_at >= queued_at))));

ALTER TABLE public."chat_messages" ADD CONSTRAINT "chat_messages_channel_check" CHECK ((channel = ANY (ARRAY['PLAYERS'::text, 'SPECTATORS'::text])));

ALTER TABLE public."chat_messages" ADD CONSTRAINT "chat_messages_client_msg_unique" UNIQUE (match_id, sender_id, client_message_id);

ALTER TABLE public."chat_messages" ADD CONSTRAINT "chat_messages_content_check" CHECK ((((char_length(content) >= 1) AND (char_length(content) <= 1000)) AND (btrim(content) <> ''::text)));

ALTER TABLE public."chat_messages" ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY (id);

ALTER TABLE public."client_controls" ADD CONSTRAINT "client_controls_context_check" CHECK (((room_id IS NOT NULL) OR (match_id IS NOT NULL)));

ALTER TABLE public."client_controls" ADD CONSTRAINT "client_controls_controller_id_unique" UNIQUE (controller_id);

ALTER TABLE public."client_controls" ADD CONSTRAINT "client_controls_epoch_check" CHECK ((control_epoch >= 1));

ALTER TABLE public."client_controls" ADD CONSTRAINT "client_controls_pkey" PRIMARY KEY (user_id);

ALTER TABLE public."command_receipts" ADD CONSTRAINT "command_receipts_applied_version_check" CHECK ((applied_version > 0));

ALTER TABLE public."command_receipts" ADD CONSTRAINT "command_receipts_command_type_check" CHECK ((command_type = ANY (ARRAY['MOVE'::text, 'RESIGN'::text, 'PROPOSE'::text, 'RESPOND'::text, 'UNDO_AI'::text])));

ALTER TABLE public."command_receipts" ADD CONSTRAINT "command_receipts_pkey" PRIMARY KEY (match_id, command_id);

ALTER TABLE public."friend_relations" ADD CONSTRAINT "friend_relations_acceptance_check" CHECK ((((status = 'ACCEPTED'::text) AND (accepted_at IS NOT NULL) AND (accepted_at >= created_at)) OR ((status = 'PENDING'::text) AND (accepted_at IS NULL))));

ALTER TABLE public."friend_relations" ADD CONSTRAINT "friend_relations_pkey" PRIMARY KEY (id);

ALTER TABLE public."friend_relations" ADD CONSTRAINT "friend_relations_requester_check" CHECK (((requester_id = user_low) OR (requester_id = user_high)));

ALTER TABLE public."friend_relations" ADD CONSTRAINT "friend_relations_status_check" CHECK ((status = ANY (ARRAY['PENDING'::text, 'ACCEPTED'::text])));

ALTER TABLE public."friend_relations" ADD CONSTRAINT "friend_relations_user_order_check" CHECK ((user_low < user_high));

ALTER TABLE public."friend_relations" ADD CONSTRAINT "friend_relations_user_pair_unique" UNIQUE (user_low, user_high);

ALTER TABLE public."invitations" ADD CONSTRAINT "invitations_dates_check" CHECK ((expires_at > created_at));

ALTER TABLE public."invitations" ADD CONSTRAINT "invitations_direct_vs_share_check" CHECK ((((recipient_id IS NOT NULL) AND (role = 'PLAY'::text) AND (token_hash IS NULL) AND (code_hash IS NULL) AND (recipient_id <> sender_id)) OR ((recipient_id IS NULL) AND (token_hash IS NOT NULL) AND (code_hash IS NOT NULL) AND (octet_length(token_hash) = 32) AND (octet_length(code_hash) = 32))));

ALTER TABLE public."invitations" ADD CONSTRAINT "invitations_epoch_check" CHECK (((epoch >= 0) AND (((role = 'PLAY'::text) AND (epoch = 0)) OR ((role = 'WATCH'::text) AND (epoch >= 0)))));

ALTER TABLE public."invitations" ADD CONSTRAINT "invitations_pkey" PRIMARY KEY (id);

ALTER TABLE public."invitations" ADD CONSTRAINT "invitations_role_check" CHECK ((role = ANY (ARRAY['PLAY'::text, 'WATCH'::text])));

ALTER TABLE public."invitations" ADD CONSTRAINT "invitations_status_check" CHECK ((status = ANY (ARRAY['ACTIVE'::text, 'CONSUMED'::text, 'DECLINED'::text, 'REVOKED'::text, 'EXPIRED'::text])));

ALTER TABLE public."invitations" ADD CONSTRAINT "invitations_status_lifecycle_check" CHECK ((((role = 'PLAY'::text) OR (status <> ALL (ARRAY['CONSUMED'::text, 'DECLINED'::text]))) AND ((status <> 'DECLINED'::text) OR (recipient_id IS NOT NULL)) AND (((status = 'CONSUMED'::text) AND (consumed_by IS NOT NULL)) OR ((status <> 'CONSUMED'::text) AND (consumed_by IS NULL))) AND ((status <> 'CONSUMED'::text) OR (recipient_id IS NULL) OR (consumed_by = recipient_id)) AND (((status = 'ACTIVE'::text) AND (resolved_at IS NULL)) OR ((status <> 'ACTIVE'::text) AND (resolved_at IS NOT NULL) AND (resolved_at >= created_at)))));

ALTER TABLE public."match_events" ADD CONSTRAINT "match_events_match_version_unique" UNIQUE (match_id, version);

ALTER TABLE public."match_events" ADD CONSTRAINT "match_events_payload_json_check" CHECK ((jsonb_typeof(payload) = 'object'::text));

ALTER TABLE public."match_events" ADD CONSTRAINT "match_events_pkey" PRIMARY KEY (id);

ALTER TABLE public."match_events" ADD CONSTRAINT "match_events_start_version_check" CHECK ((((type = 'START'::text) AND (version = 0)) OR ((type <> 'START'::text) AND (version > 0))));

ALTER TABLE public."match_events" ADD CONSTRAINT "match_events_type_check" CHECK ((type = ANY (ARRAY['START'::text, 'MOVE'::text, 'UNDO'::text, 'PROPOSAL_CREATED'::text, 'PROPOSAL_RESOLVED'::text, 'RESULT'::text])));

ALTER TABLE public."match_events" ADD CONSTRAINT "match_events_version_check" CHECK ((version >= 0));

ALTER TABLE public."match_moves" ADD CONSTRAINT "match_moves_event_version_check" CHECK ((event_version > 0));

ALTER TABLE public."match_moves" ADD CONSTRAINT "match_moves_match_event_version_unique" UNIQUE (match_id, event_version);

ALTER TABLE public."match_moves" ADD CONSTRAINT "match_moves_match_id_id_unique" UNIQUE (match_id, id);

ALTER TABLE public."match_moves" ADD CONSTRAINT "match_moves_move_json_check" CHECK (COALESCE(((jsonb_typeof(move) = 'object'::text) AND (move ? 'from'::text) AND (move ? 'to'::text) AND (jsonb_typeof((move -> 'from'::text)) = 'object'::text) AND (jsonb_typeof((move -> 'to'::text)) = 'object'::text) AND ((move -> 'from'::text) ? 'x'::text) AND ((move -> 'from'::text) ? 'y'::text) AND ((move -> 'to'::text) ? 'x'::text) AND ((move -> 'to'::text) ? 'y'::text) AND (jsonb_typeof(((move -> 'from'::text) -> 'x'::text)) = 'number'::text) AND (((move -> 'from'::text) ->> 'x'::text) ~ '^[0-8]$'::text) AND (jsonb_typeof(((move -> 'from'::text) -> 'y'::text)) = 'number'::text) AND (((move -> 'from'::text) ->> 'y'::text) ~ '^[0-9]$'::text) AND (jsonb_typeof(((move -> 'to'::text) -> 'x'::text)) = 'number'::text) AND (((move -> 'to'::text) ->> 'x'::text) ~ '^[0-8]$'::text) AND (jsonb_typeof(((move -> 'to'::text) -> 'y'::text)) = 'number'::text) AND (((move -> 'to'::text) ->> 'y'::text) ~ '^[0-9]$'::text) AND (NOT ((((move -> 'from'::text) ->> 'x'::text) = ((move -> 'to'::text) ->> 'x'::text)) AND (((move -> 'from'::text) ->> 'y'::text) = ((move -> 'to'::text) ->> 'y'::text))))), false));

ALTER TABLE public."match_moves" ADD CONSTRAINT "match_moves_parent_move_check" CHECK (((parent_move_id IS NULL) OR (parent_move_id <> id)));

ALTER TABLE public."match_moves" ADD CONSTRAINT "match_moves_pkey" PRIMARY KEY (id);

ALTER TABLE public."match_moves" ADD CONSTRAINT "match_moves_search_meta_json_check" CHECK (((search_meta IS NULL) OR (jsonb_typeof(search_meta) = 'object'::text)));

ALTER TABLE public."match_moves" ADD CONSTRAINT "match_moves_side_check" CHECK ((side = ANY (ARRAY['RED'::text, 'BLACK'::text])));

ALTER TABLE public."matches" ADD CONSTRAINT "matches_active_move_ids_check" CHECK (((jsonb_typeof(active_move_ids) = 'array'::text) AND (jsonb_array_length(active_move_ids) = ply))) NOT VALID;

ALTER TABLE public."matches" ADD CONSTRAINT "matches_clock_json_check" CHECK (((clock IS NULL) OR COALESCE(((jsonb_typeof(clock) = 'object'::text) AND (clock ? 'redMs'::text) AND (jsonb_typeof((clock -> 'redMs'::text)) = 'number'::text) AND (((clock ->> 'redMs'::text))::bigint >= 0) AND (clock ? 'blackMs'::text) AND (jsonb_typeof((clock -> 'blackMs'::text)) = 'number'::text) AND (((clock ->> 'blackMs'::text))::bigint >= 0) AND (clock ? 'runningSinceEpochMs'::text) AND (jsonb_typeof((clock -> 'runningSinceEpochMs'::text)) = 'number'::text) AND (((clock ->> 'runningSinceEpochMs'::text))::bigint >= 0)), false)));

ALTER TABLE public."matches" ADD CONSTRAINT "matches_clock_presence_check" CHECK ((((time_control = 0) AND (clock IS NULL)) OR ((time_control > 0) AND (clock IS NOT NULL))));

ALTER TABLE public."matches" ADD CONSTRAINT "matches_counters_check" CHECK (((version >= 0) AND (ply >= 0)));

ALTER TABLE public."matches" ADD CONSTRAINT "matches_id_room_id_unique" UNIQUE (id, room_id);

ALTER TABLE public."matches" ADD CONSTRAINT "matches_mode_check" CHECK ((mode = ANY (ARRAY['ONLINE'::text, 'AI'::text])));

ALTER TABLE public."matches" ADD CONSTRAINT "matches_mode_invariants" CHECK (COALESCE((((mode = 'ONLINE'::text) AND (room_id IS NOT NULL) AND (red_user_id IS NOT NULL) AND (black_user_id IS NOT NULL) AND (red_user_id <> black_user_id) AND (ai_side IS NULL) AND (ai_level IS NULL)) OR ((mode = 'AI'::text) AND (room_id IS NULL) AND (ai_level IS NOT NULL) AND (ai_level = ANY (ARRAY['EASY'::text, 'MEDIUM'::text, 'HARD'::text])) AND (ai_side IS NOT NULL) AND (((ai_side = 'RED'::text) AND (red_user_id IS NULL) AND (black_user_id IS NOT NULL)) OR ((ai_side = 'BLACK'::text) AND (black_user_id IS NULL) AND (red_user_id IS NOT NULL))))), false));

ALTER TABLE public."matches" ADD CONSTRAINT "matches_pkey" PRIMARY KEY (id);

ALTER TABLE public."matches" ADD CONSTRAINT "matches_position_json_check" CHECK (COALESCE(((jsonb_typeof("position") = 'object'::text) AND ("position" ? 'board'::text) AND (jsonb_typeof(("position" -> 'board'::text)) = 'array'::text) AND (jsonb_array_length(("position" -> 'board'::text)) = 90) AND ("position" ? 'turn'::text) AND (("position" ->> 'turn'::text) = ANY (ARRAY['RED'::text, 'BLACK'::text]))), false));

ALTER TABLE public."matches" ADD CONSTRAINT "matches_proposal_check" CHECK (((proposal IS NULL) OR ((mode = 'ONLINE'::text) AND COALESCE(((jsonb_typeof(proposal) = 'object'::text) AND (proposal ? 'id'::text) AND ((proposal ->> 'id'::text) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'::text) AND (proposal ? 'kind'::text) AND ((proposal ->> 'kind'::text) = ANY (ARRAY['DRAW'::text, 'UNDO'::text])) AND (proposal ? 'requester'::text) AND ((proposal ->> 'requester'::text) = ANY (ARRAY['RED'::text, 'BLACK'::text])) AND (proposal ? 'basePly'::text) AND (jsonb_typeof((proposal -> 'basePly'::text)) = 'number'::text) AND (((proposal ->> 'basePly'::text))::integer >= 0) AND (proposal ? 'createdVersion'::text) AND (jsonb_typeof((proposal -> 'createdVersion'::text)) = 'number'::text) AND (((proposal ->> 'createdVersion'::text))::bigint >= 0) AND (proposal ? 'expiresAtMs'::text) AND (jsonb_typeof((proposal -> 'expiresAtMs'::text)) = 'number'::text) AND (((proposal ->> 'expiresAtMs'::text))::bigint >= 0)), false))));

ALTER TABLE public."matches" ADD CONSTRAINT "matches_repetition_counts_json_check" CHECK ((jsonb_typeof(repetition_counts) = 'object'::text));

ALTER TABLE public."matches" ADD CONSTRAINT "matches_rule_set_version_check" CHECK ((rule_set_version = 'xiangqi-simple-v1'::text));

ALTER TABLE public."matches" ADD CONSTRAINT "matches_status_and_outcome_invariants" CHECK ((((status = 'ACTIVE'::text) AND (outcome IS NULL) AND (ended_at IS NULL)) OR ((status = 'INTERRUPTED'::text) AND (ended_at IS NOT NULL) AND (ended_at >= created_at) AND (proposal IS NULL) AND (outcome IS NOT NULL) AND COALESCE(((jsonb_typeof(outcome) = 'object'::text) AND (outcome ? 'reason'::text) AND (outcome ? 'winner'::text) AND ((outcome ->> 'reason'::text) = ANY (ARRAY['BOTH_OFFLINE'::text, 'SERVER_RESTART'::text, 'AI_UNAVAILABLE'::text])) AND (jsonb_typeof((outcome -> 'winner'::text)) = 'null'::text)), false)) OR ((status = 'FINISHED'::text) AND (ended_at IS NOT NULL) AND (ended_at >= created_at) AND (proposal IS NULL) AND (outcome IS NOT NULL) AND COALESCE(((jsonb_typeof(outcome) = 'object'::text) AND (outcome ? 'reason'::text) AND (outcome ? 'winner'::text) AND ((((outcome ->> 'reason'::text) = ANY (ARRAY['AGREED_DRAW'::text, 'REPETITION'::text])) AND (jsonb_typeof((outcome -> 'winner'::text)) = 'null'::text)) OR (((outcome ->> 'reason'::text) = ANY (ARRAY['CHECKMATE'::text, 'STALEMATE'::text, 'TIMEOUT'::text, 'RESIGN'::text, 'DISCONNECT'::text])) AND ((outcome ->> 'winner'::text) = ANY (ARRAY['RED'::text, 'BLACK'::text]))))), false))));

ALTER TABLE public."matches" ADD CONSTRAINT "matches_status_check" CHECK ((status = ANY (ARRAY['ACTIVE'::text, 'FINISHED'::text, 'INTERRUPTED'::text])));

ALTER TABLE public."matches" ADD CONSTRAINT "matches_time_control_check" CHECK ((time_control = ANY (ARRAY[0, 300, 600, 900])));

ALTER TABLE public."media_policies" ADD CONSTRAINT "media_policies_applied_camera_check" CHECK ((applied_camera_audience = ANY (ARRAY['OFF'::text, 'OPPONENT_ONLY'::text, 'OPPONENT_AND_SPECTATORS'::text])));

ALTER TABLE public."media_policies" ADD CONSTRAINT "media_policies_applied_invariant_check" CHECK ((((status = 'APPLIED'::text) AND (policy_version = applied_version) AND (camera_audience = applied_camera_audience) AND (microphone_audience = applied_microphone_audience)) OR (status = 'APPLYING'::text)));

ALTER TABLE public."media_policies" ADD CONSTRAINT "media_policies_applied_mic_check" CHECK ((applied_microphone_audience = ANY (ARRAY['OFF'::text, 'OPPONENT_ONLY'::text, 'OPPONENT_AND_SPECTATORS'::text])));

ALTER TABLE public."media_policies" ADD CONSTRAINT "media_policies_camera_audience_check" CHECK ((camera_audience = ANY (ARRAY['OFF'::text, 'OPPONENT_ONLY'::text, 'OPPONENT_AND_SPECTATORS'::text])));

ALTER TABLE public."media_policies" ADD CONSTRAINT "media_policies_epoch_check" CHECK ((epoch >= 0));

ALTER TABLE public."media_policies" ADD CONSTRAINT "media_policies_mic_audience_check" CHECK ((microphone_audience = ANY (ARRAY['OFF'::text, 'OPPONENT_ONLY'::text, 'OPPONENT_AND_SPECTATORS'::text])));

ALTER TABLE public."media_policies" ADD CONSTRAINT "media_policies_pkey" PRIMARY KEY (match_id, user_id);

ALTER TABLE public."media_policies" ADD CONSTRAINT "media_policies_status_check" CHECK ((status = ANY (ARRAY['APPLYING'::text, 'APPLIED'::text])));

ALTER TABLE public."media_policies" ADD CONSTRAINT "media_policies_version_bounds_check" CHECK (((policy_version >= 0) AND (applied_version >= 0) AND (applied_version <= policy_version)));

ALTER TABLE public."media_policy_jobs" ADD CONSTRAINT "media_policy_jobs_attempts_check" CHECK (((attempts >= 0) AND (attempts <= 4)));

ALTER TABLE public."media_policy_jobs" ADD CONSTRAINT "media_policy_jobs_completed_check" CHECK ((((status = 'SUCCEEDED'::text) AND (completed_at IS NOT NULL) AND (completed_at >= created_at)) OR ((status <> 'SUCCEEDED'::text) AND (completed_at IS NULL))));

ALTER TABLE public."media_policy_jobs" ADD CONSTRAINT "media_policy_jobs_desired_versions_check" CHECK (((jsonb_typeof(desired_versions) = 'array'::text) AND (jsonb_array_length(desired_versions) <= 2)));

ALTER TABLE public."media_policy_jobs" ADD CONSTRAINT "media_policy_jobs_effects_check" CHECK (((jsonb_typeof(effects) = 'array'::text) AND (jsonb_array_length(effects) <= 4)));

ALTER TABLE public."media_policy_jobs" ADD CONSTRAINT "media_policy_jobs_last_error_check" CHECK (((last_error IS NULL) OR (char_length(last_error) <= 1000)));

ALTER TABLE public."media_policy_jobs" ADD CONSTRAINT "media_policy_jobs_pkey" PRIMARY KEY (id);

ALTER TABLE public."media_policy_jobs" ADD CONSTRAINT "media_policy_jobs_reason_check" CHECK ((reason = ANY (ARRAY['POLICY'::text, 'MEMBERSHIP'::text, 'CONTROL'::text, 'END'::text, 'RESTART'::text])));

ALTER TABLE public."media_policy_jobs" ADD CONSTRAINT "media_policy_jobs_retry_check" CHECK ((((status = 'RETRY'::text) AND (next_attempt_at IS NOT NULL)) OR ((status <> 'RETRY'::text) AND (next_attempt_at IS NULL))));

ALTER TABLE public."media_policy_jobs" ADD CONSTRAINT "media_policy_jobs_status_check" CHECK ((status = ANY (ARRAY['PENDING'::text, 'RUNNING'::text, 'RETRY'::text, 'FAILED'::text, 'SUCCEEDED'::text])));

ALTER TABLE public."media_policy_jobs" ADD CONSTRAINT "media_policy_jobs_target_controls_check" CHECK (((jsonb_typeof(target_controls) = 'array'::text) AND (jsonb_array_length(target_controls) <= 7)));

ALTER TABLE public."media_policy_jobs" ADD CONSTRAINT "media_policy_jobs_target_watch_epoch_check" CHECK ((target_watch_epoch >= 0));

ALTER TABLE public."media_transports" ADD CONSTRAINT "media_transports_audience_check" CHECK ((audience = ANY (ARRAY['PRIVATE'::text, 'WATCH'::text])));

ALTER TABLE public."media_transports" ADD CONSTRAINT "media_transports_generation_check" CHECK ((generation >= 1));

ALTER TABLE public."media_transports" ADD CONSTRAINT "media_transports_kind_check" CHECK ((kind = ANY (ARRAY['CAMERA'::text, 'MICROPHONE'::text])));

ALTER TABLE public."media_transports" ADD CONSTRAINT "media_transports_pkey" PRIMARY KEY (match_id, kind, audience, generation);

ALTER TABLE public."media_transports" ADD CONSTRAINT "media_transports_retired_check" CHECK ((((status = 'RETIRED'::text) AND (retired_at IS NOT NULL) AND (retired_at >= created_at)) OR ((status <> 'RETIRED'::text) AND (retired_at IS NULL))));

ALTER TABLE public."media_transports" ADD CONSTRAINT "media_transports_room_name_unique" UNIQUE (room_name);

ALTER TABLE public."media_transports" ADD CONSTRAINT "media_transports_status_check" CHECK ((status = ANY (ARRAY['READY'::text, 'ROTATING'::text, 'RETIRED'::text])));

ALTER TABLE public."moves" ADD CONSTRAINT "moves_pkey" PRIMARY KEY (id);

ALTER TABLE public."profiles" ADD CONSTRAINT "profiles_display_name_check" CHECK ((((char_length(display_name) >= 1) AND (char_length(display_name) <= 40)) AND (display_name = btrim(display_name)) AND (display_name <> ''::text)));

ALTER TABLE public."profiles" ADD CONSTRAINT "profiles_pkey" PRIMARY KEY (user_id);

ALTER TABLE public."profiles" ADD CONSTRAINT "profiles_username_check" CHECK (username IS NULL OR username ~ '^[a-z0-9_]{3,24}$');

ALTER TABLE public."profiles" ADD CONSTRAINT "profiles_username_unique" UNIQUE (username);

ALTER TABLE public."room_command_receipts" ADD CONSTRAINT "room_command_receipts_command_type_check" CHECK ((command_type = 'REMATCH'::text));

ALTER TABLE public."room_command_receipts" ADD CONSTRAINT "room_command_receipts_distinct_match_check" CHECK (((new_match_id IS NULL) OR (new_match_id <> expected_match_id)));

ALTER TABLE public."room_command_receipts" ADD CONSTRAINT "room_command_receipts_payload_hash_check" CHECK ((octet_length(payload_hash) = 32));

ALTER TABLE public."room_command_receipts" ADD CONSTRAINT "room_command_receipts_pkey" PRIMARY KEY (room_id, actor_id, command_id);

ALTER TABLE public."room_members" ADD CONSTRAINT "room_members_pkey" PRIMARY KEY (room_id, user_id);

ALTER TABLE public."room_members" ADD CONSTRAINT "room_members_role_check" CHECK ((role = ANY (ARRAY['PLAYER'::text, 'SPECTATOR'::text])));

ALTER TABLE public."room_members" ADD CONSTRAINT "room_members_role_invariants" CHECK ((((role = 'PLAYER'::text) AND (side IS NOT NULL) AND (side = ANY (ARRAY['RED'::text, 'BLACK'::text])) AND (admission_epoch = 0)) OR ((role = 'SPECTATOR'::text) AND (side IS NULL) AND (ready = false) AND (admission_epoch >= 0))));

ALTER TABLE public."room_members" ADD CONSTRAINT "room_members_room_side_unique" UNIQUE (room_id, side) DEFERRABLE;

ALTER TABLE public."room_rematch_votes" ADD CONSTRAINT "room_rematch_votes_pkey" PRIMARY KEY (room_id, match_id, user_id);

ALTER TABLE public."rooms" ADD CONSTRAINT "rooms_name_check" CHECK ((((char_length(name) >= 1) AND (char_length(name) <= 60)) AND (name = btrim(name)) AND (name <> ''::text)));

ALTER TABLE public."rooms" ADD CONSTRAINT "rooms_pkey" PRIMARY KEY (id);

ALTER TABLE public."rooms" ADD CONSTRAINT "rooms_status_check" CHECK ((status = ANY (ARRAY['WAITING'::text, 'PLAYING'::text, 'FINISHED'::text, 'CLOSED'::text])));

ALTER TABLE public."rooms" ADD CONSTRAINT "rooms_status_invariants" CHECK ((((status = 'WAITING'::text) AND (current_match_id IS NULL) AND (finished_at IS NULL) AND (closed_at IS NULL)) OR ((status = 'PLAYING'::text) AND (current_match_id IS NOT NULL) AND (finished_at IS NULL) AND (closed_at IS NULL)) OR ((status = 'FINISHED'::text) AND (current_match_id IS NOT NULL) AND (finished_at IS NOT NULL) AND (closed_at IS NULL) AND (finished_at >= created_at)) OR ((status = 'CLOSED'::text) AND (closed_at IS NOT NULL) AND (closed_at >= created_at) AND ((finished_at IS NULL) OR (closed_at >= finished_at)))));

ALTER TABLE public."rooms" ADD CONSTRAINT "rooms_time_control_check" CHECK ((time_control = ANY (ARRAY[0, 300, 600, 900])));

ALTER TABLE public."rooms" ADD CONSTRAINT "rooms_version_check" CHECK ((room_version >= 0));

ALTER TABLE public."rooms" ADD CONSTRAINT "rooms_visibility_check" CHECK ((visibility = ANY (ARRAY['PUBLIC'::text, 'CODE_ONLY'::text, 'LOCKED'::text])));

ALTER TABLE public."rooms" ADD CONSTRAINT "rooms_watch_epoch_check" CHECK ((watch_epoch >= 0));

ALTER TABLE public."active_players" ADD CONSTRAINT "active_players_match_id_fkey" FOREIGN KEY (match_id) REFERENCES matches(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."active_players" ADD CONSTRAINT "active_players_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."ai_jobs" ADD CONSTRAINT "ai_jobs_match_id_fkey" FOREIGN KEY (match_id) REFERENCES matches(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."chat_messages" ADD CONSTRAINT "chat_messages_match_room_fk" FOREIGN KEY (match_id, room_id) REFERENCES matches(id, room_id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."chat_messages" ADD CONSTRAINT "chat_messages_room_id_fkey" FOREIGN KEY (room_id) REFERENCES rooms(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."chat_messages" ADD CONSTRAINT "chat_messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."client_controls" ADD CONSTRAINT "client_controls_match_id_fkey" FOREIGN KEY (match_id) REFERENCES matches(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."client_controls" ADD CONSTRAINT "client_controls_match_room_fk" FOREIGN KEY (match_id, room_id) REFERENCES matches(id, room_id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."client_controls" ADD CONSTRAINT "client_controls_room_member_fk" FOREIGN KEY (room_id, user_id) REFERENCES room_members(room_id, user_id) ON DELETE CASCADE;

ALTER TABLE public."client_controls" ADD CONSTRAINT "client_controls_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."command_receipts" ADD CONSTRAINT "command_receipts_event_version_fk" FOREIGN KEY (match_id, applied_version) REFERENCES match_events(match_id, version) ON UPDATE RESTRICT ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE public."command_receipts" ADD CONSTRAINT "command_receipts_match_id_fkey" FOREIGN KEY (match_id) REFERENCES matches(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."friend_relations" ADD CONSTRAINT "friend_relations_requester_fkey" FOREIGN KEY (requester_id) REFERENCES profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."friend_relations" ADD CONSTRAINT "friend_relations_user_high_fkey" FOREIGN KEY (user_high) REFERENCES profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."friend_relations" ADD CONSTRAINT "friend_relations_user_low_fkey" FOREIGN KEY (user_low) REFERENCES profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."invitations" ADD CONSTRAINT "invitations_consumed_by_fkey" FOREIGN KEY (consumed_by) REFERENCES profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."invitations" ADD CONSTRAINT "invitations_recipient_id_fkey" FOREIGN KEY (recipient_id) REFERENCES profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."invitations" ADD CONSTRAINT "invitations_room_id_fkey" FOREIGN KEY (room_id) REFERENCES rooms(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."invitations" ADD CONSTRAINT "invitations_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."match_events" ADD CONSTRAINT "match_events_match_id_fkey" FOREIGN KEY (match_id) REFERENCES matches(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."match_moves" ADD CONSTRAINT "match_moves_event_version_fk" FOREIGN KEY (match_id, event_version) REFERENCES match_events(match_id, version) ON UPDATE RESTRICT ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE public."match_moves" ADD CONSTRAINT "match_moves_match_id_fkey" FOREIGN KEY (match_id) REFERENCES matches(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."match_moves" ADD CONSTRAINT "match_moves_parent_fk" FOREIGN KEY (match_id, parent_move_id) REFERENCES match_moves(match_id, id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."matches" ADD CONSTRAINT "matches_black_user_id_fkey" FOREIGN KEY (black_user_id) REFERENCES profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."matches" ADD CONSTRAINT "matches_red_user_id_fkey" FOREIGN KEY (red_user_id) REFERENCES profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."matches" ADD CONSTRAINT "matches_room_id_fkey" FOREIGN KEY (room_id) REFERENCES rooms(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."media_policies" ADD CONSTRAINT "media_policies_match_id_fkey" FOREIGN KEY (match_id) REFERENCES matches(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."media_policies" ADD CONSTRAINT "media_policies_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."media_policy_jobs" ADD CONSTRAINT "media_policy_jobs_match_id_fkey" FOREIGN KEY (match_id) REFERENCES matches(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."media_transports" ADD CONSTRAINT "media_transports_match_id_fkey" FOREIGN KEY (match_id) REFERENCES matches(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."moves" ADD CONSTRAINT "moves_match_id_fkey" FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE;

ALTER TABLE public."profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."room_command_receipts" ADD CONSTRAINT "room_command_receipts_actor_id_fkey" FOREIGN KEY (actor_id) REFERENCES profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."room_command_receipts" ADD CONSTRAINT "room_command_receipts_expected_match_fk" FOREIGN KEY (expected_match_id, room_id) REFERENCES matches(id, room_id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."room_command_receipts" ADD CONSTRAINT "room_command_receipts_new_match_fk" FOREIGN KEY (new_match_id, room_id) REFERENCES matches(id, room_id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."room_command_receipts" ADD CONSTRAINT "room_command_receipts_room_id_fkey" FOREIGN KEY (room_id) REFERENCES rooms(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."room_members" ADD CONSTRAINT "room_members_room_id_fkey" FOREIGN KEY (room_id) REFERENCES rooms(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."room_members" ADD CONSTRAINT "room_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."room_rematch_votes" ADD CONSTRAINT "room_rematch_votes_match_room_fk" FOREIGN KEY (match_id, room_id) REFERENCES matches(id, room_id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."room_rematch_votes" ADD CONSTRAINT "room_rematch_votes_room_id_fkey" FOREIGN KEY (room_id) REFERENCES rooms(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."room_rematch_votes" ADD CONSTRAINT "room_rematch_votes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public."rooms" ADD CONSTRAINT "rooms_current_match_fk" FOREIGN KEY (current_match_id, id) REFERENCES matches(id, room_id) DEFERRABLE;

ALTER TABLE public."rooms" ADD CONSTRAINT "rooms_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES profiles(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;

CREATE INDEX active_players_match_id_idx ON public.active_players USING btree (match_id);

CREATE INDEX ai_jobs_active_queue_idx ON public.ai_jobs USING btree (status, queued_at, match_id) WHERE (status = ANY (ARRAY['QUEUED'::text, 'THINKING'::text]));

CREATE INDEX chat_messages_retention_idx ON public.chat_messages USING btree (created_at, id);

CREATE INDEX chat_messages_room_match_channel_idx ON public.chat_messages USING btree (room_id, match_id, channel, created_at DESC, id DESC);

CREATE INDEX client_controls_lease_idx ON public.client_controls USING btree (lease_until);

CREATE INDEX client_controls_match_idx ON public.client_controls USING btree (match_id) WHERE (match_id IS NOT NULL);

CREATE INDEX client_controls_session_idx ON public.client_controls USING btree (session_id);

CREATE INDEX friend_relations_user_high_idx ON public.friend_relations USING btree (user_high, status, created_at DESC, id);

CREATE INDEX friend_relations_user_low_idx ON public.friend_relations USING btree (user_low, status, created_at DESC, id);

CREATE UNIQUE INDEX invitations_active_code_hash_idx ON public.invitations USING btree (code_hash) WHERE ((status = 'ACTIVE'::text) AND (code_hash IS NOT NULL));

CREATE UNIQUE INDEX invitations_active_direct_idx ON public.invitations USING btree (room_id, recipient_id) WHERE ((status = 'ACTIVE'::text) AND (recipient_id IS NOT NULL));

CREATE UNIQUE INDEX invitations_active_token_hash_idx ON public.invitations USING btree (token_hash) WHERE ((status = 'ACTIVE'::text) AND (token_hash IS NOT NULL));

CREATE INDEX invitations_expires_active_idx ON public.invitations USING btree (expires_at) WHERE (status = 'ACTIVE'::text);

CREATE INDEX invitations_recipient_idx ON public.invitations USING btree (recipient_id, created_at DESC, id DESC) WHERE (recipient_id IS NOT NULL);

CREATE INDEX invitations_room_status_idx ON public.invitations USING btree (room_id, status);

CREATE INDEX match_moves_match_id_event_version_idx ON public.match_moves USING btree (match_id, event_version);

CREATE INDEX match_moves_parent_idx ON public.match_moves USING btree (match_id, parent_move_id);

CREATE UNIQUE INDEX matches_active_room_idx ON public.matches USING btree (room_id) WHERE ((status = 'ACTIVE'::text) AND (room_id IS NOT NULL));

CREATE INDEX matches_black_user_history_idx ON public.matches USING btree (black_user_id, created_at DESC, id DESC) WHERE (black_user_id IS NOT NULL);

CREATE INDEX matches_boot_recovery_idx ON public.matches USING btree (boot_id, id) WHERE (status = 'ACTIVE'::text);

CREATE INDEX matches_red_user_history_idx ON public.matches USING btree (red_user_id, created_at DESC, id DESC) WHERE (red_user_id IS NOT NULL);

CREATE INDEX matches_room_history_idx ON public.matches USING btree (room_id, created_at DESC, id DESC) WHERE (room_id IS NOT NULL);

CREATE UNIQUE INDEX media_policy_jobs_active_unique_idx ON public.media_policy_jobs USING btree (match_id) WHERE (status <> 'SUCCEEDED'::text);

CREATE INDEX media_policy_jobs_audit_idx ON public.media_policy_jobs USING btree (match_id, created_at DESC, id DESC);

CREATE INDEX media_policy_jobs_retry_idx ON public.media_policy_jobs USING btree (next_attempt_at, id) WHERE (status = 'RETRY'::text);

CREATE UNIQUE INDEX media_transports_active_unique_idx ON public.media_transports USING btree (match_id, kind, audience) WHERE (status = ANY (ARRAY['READY'::text, 'ROTATING'::text]));

CREATE INDEX media_transports_rotating_idx ON public.media_transports USING btree (status, match_id) WHERE (status = 'ROTATING'::text);

CREATE INDEX moves_match_id_idx ON public.moves USING btree (match_id, move_number);

CREATE INDEX moves_match_id_move_number_idx ON public.moves USING btree (match_id, move_number);

CREATE INDEX profiles_username_pattern_idx ON public.profiles USING btree (username text_pattern_ops);

CREATE INDEX room_members_disconnected_spectators_idx ON public.room_members USING btree (disconnected_at) WHERE ((role = 'SPECTATOR'::text) AND (disconnected_at IS NOT NULL));

CREATE INDEX rooms_finished_idx ON public.rooms USING btree (finished_at, id) WHERE (status = 'FINISHED'::text);

CREATE INDEX rooms_lobby_idx ON public.rooms USING btree (created_at DESC, id DESC) WHERE ((visibility = 'PUBLIC'::text) AND (status <> 'CLOSED'::text));

CREATE INDEX rooms_owner_id_idx ON public.rooms USING btree (owner_id);

CREATE OR REPLACE FUNCTION public.guard_match_updates()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$
;

ALTER FUNCTION public."guard_match_updates"() OWNER TO postgres;

REVOKE ALL ON FUNCTION public."guard_match_updates"() FROM PUBLIC,anon,authenticated,app_server;

GRANT EXECUTE ON FUNCTION public."guard_match_updates"() TO service_role;

CREATE OR REPLACE FUNCTION public.guard_profile_updates()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  IF NEW.user_id <> OLD.user_id THEN
    RAISE EXCEPTION 'Cannot change user_id in profiles';
  END IF;

  IF OLD.username IS NOT NULL AND NEW.username IS DISTINCT FROM OLD.username THEN
    RAISE EXCEPTION 'Username is immutable once set';
  END IF;

  IF NEW.username IS NOT NULL AND NEW.username !~ '^[a-z0-9_]{3,24}$' THEN
    RAISE EXCEPTION 'Invalid username format';
  END IF;

  RETURN NEW;
END;
$function$
;

ALTER FUNCTION public."guard_profile_updates"() OWNER TO postgres;

REVOKE ALL ON FUNCTION public."guard_profile_updates"() FROM PUBLIC,anon,authenticated,app_server;

GRANT EXECUTE ON FUNCTION public."guard_profile_updates"() TO service_role;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_provider text;
  v_raw_username text;
  v_raw_display text;
  v_username text := NULL;
  v_display_name text;
  v_has_username_key boolean;
BEGIN
  v_provider := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');
  v_has_username_key := (NEW.raw_user_meta_data ? 'signup_username');
  v_raw_username := NEW.raw_user_meta_data->>'signup_username';
  v_raw_display := NULLIF(btrim(NEW.raw_user_meta_data->>'signup_display_name'), '');

  -- If provider is email OR metadata explicitly contains signup_username:
  IF v_provider = 'email' OR v_has_username_key THEN
    IF v_raw_username IS NULL OR btrim(v_raw_username) = '' THEN
      RAISE EXCEPTION 'signup_username is required for email signup and cannot be blank';
    END IF;
    IF btrim(v_raw_username) !~ '^[a-z0-9_]{3,24}$' THEN
      RAISE EXCEPTION 'Invalid username format in signup metadata: %', v_raw_username;
    END IF;
    v_username := btrim(v_raw_username);
  ELSE
    -- Google / OAuth onboarding: username starts as NULL
    v_username := NULL;
  END IF;

  IF v_raw_display IS NOT NULL THEN
    v_display_name := substring(v_raw_display FROM 1 FOR 40);
  ELSE
    v_raw_display := NULLIF(btrim(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')), '');
    IF v_raw_display IS NOT NULL THEN
      v_display_name := substring(v_raw_display FROM 1 FOR 40);
    ELSE
      v_display_name := 'Người chơi';
    END IF;
  END IF;

  IF v_display_name IS NULL OR btrim(v_display_name) = '' THEN
    v_display_name := 'Người chơi';
  END IF;

  INSERT INTO public.profiles (user_id, username, display_name, created_at, updated_at)
  VALUES (NEW.id, v_username, v_display_name, now(), now());

  RETURN NEW;
END;
$function$
;

ALTER FUNCTION public."handle_new_user"() OWNER TO postgres;

REVOKE ALL ON FUNCTION public."handle_new_user"() FROM PUBLIC,anon,authenticated,app_server;

GRANT EXECUTE ON FUNCTION public."handle_new_user"() TO service_role;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER trg_guard_match_updates BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION public.guard_match_updates();

CREATE TRIGGER trg_guard_profile_updates BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.guard_profile_updates();

ALTER TABLE public."active_players" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."active_players" FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public."active_players" FROM PUBLIC,anon,authenticated,app_server,service_role;

ALTER TABLE public."ai_jobs" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."ai_jobs" FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public."ai_jobs" FROM PUBLIC,anon,authenticated,app_server,service_role;

ALTER TABLE public."chat_messages" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."chat_messages" FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public."chat_messages" FROM PUBLIC,anon,authenticated,app_server,service_role;

ALTER TABLE public."client_controls" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."client_controls" FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public."client_controls" FROM PUBLIC,anon,authenticated,app_server,service_role;

ALTER TABLE public."command_receipts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."command_receipts" FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public."command_receipts" FROM PUBLIC,anon,authenticated,app_server,service_role;

ALTER TABLE public."friend_relations" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."friend_relations" FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public."friend_relations" FROM PUBLIC,anon,authenticated,app_server,service_role;

ALTER TABLE public."invitations" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."invitations" FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public."invitations" FROM PUBLIC,anon,authenticated,app_server,service_role;

ALTER TABLE public."match_events" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."match_events" FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public."match_events" FROM PUBLIC,anon,authenticated,app_server,service_role;

ALTER TABLE public."match_moves" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."match_moves" FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public."match_moves" FROM PUBLIC,anon,authenticated,app_server,service_role;

ALTER TABLE public."matches" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."matches" FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public."matches" FROM PUBLIC,anon,authenticated,app_server,service_role;

ALTER TABLE public."media_policies" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."media_policies" FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public."media_policies" FROM PUBLIC,anon,authenticated,app_server,service_role;

ALTER TABLE public."media_policy_jobs" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."media_policy_jobs" FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public."media_policy_jobs" FROM PUBLIC,anon,authenticated,app_server,service_role;

ALTER TABLE public."media_transports" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."media_transports" FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public."media_transports" FROM PUBLIC,anon,authenticated,app_server,service_role;

ALTER TABLE public."moves" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public."moves" FROM PUBLIC,anon,authenticated,app_server,service_role;

ALTER TABLE public."profiles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."profiles" FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public."profiles" FROM PUBLIC,anon,authenticated,app_server,service_role;

ALTER TABLE public."room_command_receipts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."room_command_receipts" FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public."room_command_receipts" FROM PUBLIC,anon,authenticated,app_server,service_role;

ALTER TABLE public."room_members" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."room_members" FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public."room_members" FROM PUBLIC,anon,authenticated,app_server,service_role;

ALTER TABLE public."room_rematch_votes" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."room_rematch_votes" FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public."room_rematch_votes" FROM PUBLIC,anon,authenticated,app_server,service_role;

ALTER TABLE public."rooms" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."rooms" FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public."rooms" FROM PUBLIC,anon,authenticated,app_server,service_role;

CREATE POLICY "app_server_active_players" ON public."active_players" AS PERMISSIVE FOR ALL TO "app_server" USING (true) WITH CHECK (true);

CREATE POLICY "app_server_ai_jobs" ON public."ai_jobs" AS PERMISSIVE FOR ALL TO "app_server" USING (true) WITH CHECK (true);

CREATE POLICY "app_server_chat_messages" ON public."chat_messages" AS PERMISSIVE FOR ALL TO "app_server" USING (true) WITH CHECK (true);

CREATE POLICY "app_server_client_controls" ON public."client_controls" AS PERMISSIVE FOR ALL TO "app_server" USING (true) WITH CHECK (true);

CREATE POLICY "app_server_command_receipts" ON public."command_receipts" AS PERMISSIVE FOR ALL TO "app_server" USING (true) WITH CHECK (true);

CREATE POLICY "app_server_friend_relations" ON public."friend_relations" AS PERMISSIVE FOR ALL TO "app_server" USING (true) WITH CHECK (true);

CREATE POLICY "app_server_invitations" ON public."invitations" AS PERMISSIVE FOR ALL TO "app_server" USING (true) WITH CHECK (true);

CREATE POLICY "app_server_match_events" ON public."match_events" AS PERMISSIVE FOR ALL TO "app_server" USING (true) WITH CHECK (true);

CREATE POLICY "app_server_match_moves" ON public."match_moves" AS PERMISSIVE FOR ALL TO "app_server" USING (true) WITH CHECK (true);

CREATE POLICY "app_server_matches" ON public."matches" AS PERMISSIVE FOR ALL TO "app_server" USING (true) WITH CHECK (true);

CREATE POLICY "app_server_media_policies" ON public."media_policies" AS PERMISSIVE FOR ALL TO "app_server" USING (true) WITH CHECK (true);

CREATE POLICY "app_server_media_policy_jobs" ON public."media_policy_jobs" AS PERMISSIVE FOR ALL TO "app_server" USING (true) WITH CHECK (true);

CREATE POLICY "app_server_media_transports" ON public."media_transports" AS PERMISSIVE FOR ALL TO "app_server" USING (true) WITH CHECK (true);

CREATE POLICY "app_server_profiles" ON public."profiles" AS PERMISSIVE FOR ALL TO "app_server" USING (true) WITH CHECK (true);

CREATE POLICY "app_server_room_command_receipts" ON public."room_command_receipts" AS PERMISSIVE FOR ALL TO "app_server" USING (true) WITH CHECK (true);

CREATE POLICY "app_server_room_members" ON public."room_members" AS PERMISSIVE FOR ALL TO "app_server" USING (true) WITH CHECK (true);

CREATE POLICY "app_server_room_rematch_votes" ON public."room_rematch_votes" AS PERMISSIVE FOR ALL TO "app_server" USING (true) WITH CHECK (true);

CREATE POLICY "app_server_rooms" ON public."rooms" AS PERMISSIVE FOR ALL TO "app_server" USING (true) WITH CHECK (true);

GRANT INSERT,SELECT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN ON public."active_players" TO "service_role";

GRANT INSERT,SELECT,DELETE ON public."active_players" TO "app_server";

GRANT INSERT,SELECT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN ON public."ai_jobs" TO "service_role";

GRANT INSERT,SELECT,UPDATE ON public."ai_jobs" TO "app_server";

GRANT INSERT,SELECT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN ON public."chat_messages" TO "service_role";

GRANT INSERT,SELECT,DELETE ON public."chat_messages" TO "app_server";

GRANT INSERT,SELECT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN ON public."client_controls" TO "service_role";

GRANT INSERT,SELECT,UPDATE,DELETE ON public."client_controls" TO "app_server";

GRANT INSERT,SELECT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN ON public."command_receipts" TO "service_role";

GRANT INSERT,SELECT ON public."command_receipts" TO "app_server";

GRANT INSERT,SELECT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN ON public."friend_relations" TO "service_role";

GRANT INSERT,SELECT,UPDATE,DELETE ON public."friend_relations" TO "app_server";

GRANT INSERT,SELECT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN ON public."invitations" TO "service_role";

GRANT INSERT,SELECT,UPDATE ON public."invitations" TO "app_server";

GRANT INSERT,SELECT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN ON public."match_events" TO "service_role";

GRANT INSERT,SELECT ON public."match_events" TO "app_server";

GRANT INSERT,SELECT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN ON public."match_moves" TO "service_role";

GRANT INSERT,SELECT ON public."match_moves" TO "app_server";

GRANT INSERT,SELECT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN ON public."matches" TO "service_role";

GRANT INSERT,SELECT,UPDATE ON public."matches" TO "app_server";

GRANT INSERT,SELECT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN ON public."media_policies" TO "service_role";

GRANT INSERT,SELECT,UPDATE ON public."media_policies" TO "app_server";

GRANT INSERT,SELECT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN ON public."media_policy_jobs" TO "service_role";

GRANT INSERT,SELECT,UPDATE ON public."media_policy_jobs" TO "app_server";

GRANT INSERT,SELECT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN ON public."media_transports" TO "service_role";

GRANT INSERT,SELECT,UPDATE ON public."media_transports" TO "app_server";

GRANT INSERT,SELECT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN ON public."moves" TO "anon";

GRANT INSERT,SELECT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN ON public."moves" TO "authenticated";

GRANT INSERT,SELECT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN ON public."moves" TO "service_role";

GRANT INSERT,SELECT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN ON public."moves" TO "app_server";

GRANT INSERT,SELECT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN ON public."profiles" TO "service_role";

GRANT SELECT ON public.profiles TO app_server;

GRANT INSERT,SELECT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN ON public."room_command_receipts" TO "service_role";

GRANT INSERT,SELECT ON public."room_command_receipts" TO "app_server";

GRANT INSERT,SELECT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN ON public."room_members" TO "service_role";

GRANT INSERT,SELECT,UPDATE,DELETE ON public."room_members" TO "app_server";

GRANT INSERT,SELECT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN ON public."room_rematch_votes" TO "service_role";

GRANT INSERT,SELECT,DELETE ON public."room_rematch_votes" TO "app_server";

GRANT INSERT,SELECT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN ON public."rooms" TO "service_role";

GRANT INSERT,SELECT,UPDATE ON public."rooms" TO "app_server";

GRANT UPDATE(username,display_name,updated_at) ON public.profiles TO app_server;

GRANT USAGE ON SCHEMA public TO app_server;

COMMIT;
