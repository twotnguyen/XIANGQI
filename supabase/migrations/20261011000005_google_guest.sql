BEGIN;
-- Exact audited member-only references. Unknown variants need a new review.
LOCK TABLE public.profiles,xiangqi_realtime.tabs,xiangqi_realtime.receipts IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
  IF (SELECT pg_catalog.pg_get_constraintdef(oid) FROM pg_catalog.pg_constraint WHERE conrelid='public.profiles'::pg_catalog.regclass AND conname='profiles_user_id_fkey') IS DISTINCT FROM 'FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT'
    OR (SELECT pg_catalog.pg_get_constraintdef(oid) FROM pg_catalog.pg_constraint WHERE conrelid='xiangqi_realtime.tabs'::pg_catalog.regclass AND conname='tabs_user_id_fkey') IS DISTINCT FROM 'FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE'
    OR (SELECT pg_catalog.pg_get_constraintdef(oid) FROM pg_catalog.pg_constraint WHERE conrelid='xiangqi_realtime.receipts'::pg_catalog.regclass AND conname='receipts_user_id_fkey') IS DISTINCT FROM 'FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE' THEN
    RAISE EXCEPTION 'Actor references differ from audited baseline';
  END IF;
  IF EXISTS(SELECT 1 FROM auth.users WHERE COALESCE(raw_app_meta_data->>'provider','email') NOT IN ('email','google'))
    OR EXISTS(SELECT 1 FROM auth.identities WHERE provider='google') THEN
    RAISE EXCEPTION 'Existing OAuth origins need separate provenance review';
  END IF;
END $$;
CREATE TABLE xiangqi_auth.principals (
  id uuid PRIMARY KEY,
  kind text NOT NULL CHECK(kind IN ('member','guest')),
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  CHECK((kind='member' AND auth_user_id IS NOT NULL AND auth_user_id=id) OR (kind='guest' AND auth_user_id IS NULL))
);
CREATE TABLE xiangqi_auth.account_origins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_key text UNIQUE,
  method text NOT NULL CHECK(method IN ('email','google')),
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Record only ids for fail-closed pre-write rollback, never account PII.
CREATE TABLE xiangqi_auth.google_guest_baseline(id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE);
INSERT INTO xiangqi_auth.principals SELECT id,'member',id FROM auth.users;
INSERT INTO xiangqi_auth.account_origins(user_id,email_key,method,created_at)
  SELECT id,lower(email),COALESCE(raw_app_meta_data->>'provider','email'),COALESCE(created_at,now()) FROM auth.users;
INSERT INTO xiangqi_auth.google_guest_baseline SELECT id FROM auth.users;
CREATE FUNCTION xiangqi_auth.register_member_origin() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE method text;
BEGIN
  method:=COALESCE(NEW.raw_app_meta_data->>'provider','email');
  IF method NOT IN ('email','google') THEN RAISE EXCEPTION 'Unsupported member origin'; END IF;
  IF method='google' AND NEW.email IS NULL THEN RAISE EXCEPTION 'Google requires email'; END IF;
  IF NEW.email IS NOT NULL THEN PERFORM pg_advisory_xact_lock(hashtextextended('auth-origin:'||lower(NEW.email),0)); END IF;
  INSERT INTO xiangqi_auth.principals VALUES(NEW.id,'member',NEW.id);
  INSERT INTO xiangqi_auth.account_origins(user_id,email_key,method) VALUES(NEW.id,lower(NEW.email),method);
  RETURN NEW;
END;
$$;
-- AFTER INSERT means member Auth FK exists. Alphabetically before legacy profile trigger.
CREATE TRIGGER a_xiangqi_member_origin AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION xiangqi_auth.register_member_origin();
-- Verified server intent predates the provider transaction; caller metadata grants no ownership.
CREATE TABLE xiangqi_auth.google_creation_intents (
  email_key text PRIMARY KEY,
  provider_id text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT statement_timestamp(),
  expires_at timestamptz NOT NULL DEFAULT statement_timestamp()+interval '5 minutes',
  CHECK(expires_at=started_at+interval '5 minutes')
);
CREATE TABLE xiangqi_auth.google_temporary_accounts (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL
);
CREATE INDEX google_temporary_cleanup ON xiangqi_auth.google_temporary_accounts(created_at,user_id);
CREATE FUNCTION xiangqi_auth.guard_google_identity() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF TG_OP='UPDATE' AND (OLD.provider='google' OR NEW.provider='google')
    AND (NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.provider IS DISTINCT FROM OLD.provider OR NEW.provider_id IS DISTINCT FROM OLD.provider_id) THEN
    RAISE EXCEPTION 'Google identity ownership is immutable';
  END IF;
  IF NEW.provider='google' AND NOT EXISTS(SELECT 1 FROM xiangqi_auth.account_origins WHERE user_id=NEW.user_id AND method='google') THEN
    RAISE EXCEPTION 'Google linking to email origin is forbidden';
  END IF;
  IF TG_OP='INSERT' AND NEW.provider='google' THEN
    INSERT INTO xiangqi_auth.google_temporary_accounts(user_id,created_at)
      SELECT o.user_id,COALESCE(u.created_at,o.created_at)
      FROM xiangqi_auth.account_origins o JOIN auth.users u ON u.id=o.user_id
      JOIN xiangqi_auth.google_creation_intents i ON i.email_key=o.email_key AND i.provider_id=NEW.provider_id
      WHERE o.user_id=NEW.user_id AND o.method='google'
        AND o.created_at>=i.started_at AND i.expires_at>statement_timestamp()
      ON CONFLICT(user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER xiangqi_google_identity BEFORE INSERT OR UPDATE ON auth.identities FOR EACH ROW EXECUTE FUNCTION xiangqi_auth.guard_google_identity();
CREATE FUNCTION xiangqi_auth.guard_actor_identity() RETURNS trigger
LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
  IF NEW IS DISTINCT FROM OLD THEN RAISE EXCEPTION 'Actor origin is immutable'; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER xiangqi_principal_immutable BEFORE UPDATE ON xiangqi_auth.principals FOR EACH ROW EXECUTE FUNCTION xiangqi_auth.guard_actor_identity();
CREATE TRIGGER xiangqi_origin_immutable BEFORE UPDATE ON xiangqi_auth.account_origins FOR EACH ROW EXECUTE FUNCTION xiangqi_auth.guard_actor_identity();
ALTER TABLE public.profiles DROP CONSTRAINT profiles_user_id_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY(user_id) REFERENCES xiangqi_auth.principals(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE xiangqi_realtime.tabs DROP CONSTRAINT tabs_user_id_fkey;
ALTER TABLE xiangqi_realtime.tabs ADD CONSTRAINT tabs_user_id_fkey FOREIGN KEY(user_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE;
ALTER TABLE xiangqi_realtime.receipts DROP CONSTRAINT receipts_user_id_fkey;
ALTER TABLE xiangqi_realtime.receipts ADD CONSTRAINT receipts_user_id_fkey FOREIGN KEY(user_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE;
CREATE VIEW xiangqi_auth.google_subjects WITH (security_barrier=true) AS SELECT user_id,provider_id FROM auth.identities WHERE provider='google';
REVOKE ALL ON xiangqi_auth.google_subjects FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT ON xiangqi_auth.google_subjects TO app_server;
CREATE TABLE xiangqi_auth.google_challenges (
  token_hash text PRIMARY KEY CHECK(token_hash ~ '^[0-9a-f]{64}$'),
  nonce_hash text NOT NULL UNIQUE CHECK(nonce_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz
);
CREATE TABLE xiangqi_auth.google_drafts (
  token_hash text PRIMARY KEY CHECK(token_hash ~ '^[0-9a-f]{64}$'),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL,
  remember boolean NOT NULL,
  owned boolean NOT NULL DEFAULT false,
  state text NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','recovering','cleanup'))
);
CREATE TABLE xiangqi_auth.guest_sessions (
  token_hash text PRIMARY KEY CHECK(token_hash ~ '^[0-9a-f]{64}$'),
  guest_id uuid NOT NULL UNIQUE REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  ended_at timestamptz,
  CHECK(expires_at=created_at+interval '12 hours')
);
CREATE INDEX guest_session_expiry ON xiangqi_auth.guest_sessions(expires_at,token_hash) WHERE ended_at IS NULL;
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['principals','account_origins','google_guest_baseline','google_challenges','google_drafts','guest_sessions','google_creation_intents','google_temporary_accounts'] LOOP
    EXECUTE format('ALTER TABLE xiangqi_auth.%I ENABLE ROW LEVEL SECURITY',t);
    EXECUTE format('ALTER TABLE xiangqi_auth.%I FORCE ROW LEVEL SECURITY',t);
    EXECUTE format('REVOKE ALL ON xiangqi_auth.%I FROM PUBLIC,anon,authenticated,app_server,service_role',t);
  END LOOP;
END $$;
GRANT SELECT,INSERT ON xiangqi_auth.principals TO app_server;
GRANT SELECT ON xiangqi_auth.account_origins TO app_server;
GRANT SELECT,INSERT,DELETE ON xiangqi_auth.google_creation_intents TO app_server;
GRANT SELECT ON xiangqi_auth.google_temporary_accounts TO app_server;
GRANT SELECT,INSERT,UPDATE,DELETE ON xiangqi_auth.google_challenges,xiangqi_auth.google_drafts,xiangqi_auth.guest_sessions TO app_server;
CREATE POLICY actor_server ON xiangqi_auth.principals TO app_server USING(true) WITH CHECK(true);
CREATE POLICY origin_server ON xiangqi_auth.account_origins TO app_server USING(true);
CREATE POLICY google_intent_server ON xiangqi_auth.google_creation_intents TO app_server USING(true) WITH CHECK(true);
CREATE POLICY google_temporary_server ON xiangqi_auth.google_temporary_accounts TO app_server USING(true);
CREATE POLICY challenge_server ON xiangqi_auth.google_challenges TO app_server USING(true) WITH CHECK(true);
CREATE POLICY google_draft_server ON xiangqi_auth.google_drafts TO app_server USING(true) WITH CHECK(true);
CREATE POLICY guest_session_server ON xiangqi_auth.guest_sessions TO app_server USING(true) WITH CHECK(true);
REVOKE ALL ON FUNCTION xiangqi_auth.register_member_origin(),xiangqi_auth.guard_google_identity(),xiangqi_auth.guard_actor_identity() FROM PUBLIC,anon,authenticated,app_server,service_role;
-- Triggers execute via their definer owner; no Auth-schema permission added to application roles.
DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM pg_catalog.pg_proc WHERE oid IN ('xiangqi_auth.register_member_origin()'::regprocedure,'xiangqi_auth.guard_google_identity()'::regprocedure) AND proowner<>'postgres'::regrole)
    OR NOT has_table_privilege('app_server','xiangqi_auth.principals','INSERT') THEN
    RAISE EXCEPTION 'Actor migration owner/grants not established';
  END IF;
END $$;
COMMIT;
