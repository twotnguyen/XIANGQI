BEGIN;
LOCK TABLE public.profiles,xiangqi_realtime.tabs,xiangqi_realtime.receipts,xiangqi_auth.principals IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM xiangqi_auth.principals p WHERE kind<>'member' OR NOT EXISTS(SELECT 1 FROM xiangqi_auth.google_guest_baseline b WHERE b.id=p.id))
    OR EXISTS(SELECT 1 FROM xiangqi_auth.google_challenges)
    OR EXISTS(SELECT 1 FROM xiangqi_auth.google_drafts)
    OR EXISTS(SELECT 1 FROM xiangqi_auth.google_creation_intents)
    OR EXISTS(SELECT 1 FROM xiangqi_auth.google_temporary_accounts)
    OR EXISTS(SELECT 1 FROM xiangqi_auth.guest_sessions) THEN
    RAISE EXCEPTION 'Rollback blocked by new actors or capabilities; preserve application data';
  END IF;
  IF (SELECT pg_catalog.pg_get_constraintdef(oid) FROM pg_catalog.pg_constraint WHERE conrelid='public.profiles'::pg_catalog.regclass AND conname='profiles_user_id_fkey') IS DISTINCT FROM 'FOREIGN KEY (user_id) REFERENCES xiangqi_auth.principals(id) ON UPDATE RESTRICT ON DELETE CASCADE'
    OR (SELECT pg_catalog.pg_get_constraintdef(oid) FROM pg_catalog.pg_constraint WHERE conrelid='xiangqi_realtime.tabs'::pg_catalog.regclass AND conname='tabs_user_id_fkey') IS DISTINCT FROM 'FOREIGN KEY (user_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE'
    OR (SELECT pg_catalog.pg_get_constraintdef(oid) FROM pg_catalog.pg_constraint WHERE conrelid='xiangqi_realtime.receipts'::pg_catalog.regclass AND conname='receipts_user_id_fkey') IS DISTINCT FROM 'FOREIGN KEY (user_id) REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE' THEN
    RAISE EXCEPTION 'Actor references changed after migration';
  END IF;
END $$;
ALTER TABLE public.profiles DROP CONSTRAINT profiles_user_id_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY(user_id) REFERENCES auth.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE xiangqi_realtime.tabs DROP CONSTRAINT tabs_user_id_fkey;
ALTER TABLE xiangqi_realtime.tabs ADD CONSTRAINT tabs_user_id_fkey FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE xiangqi_realtime.receipts DROP CONSTRAINT receipts_user_id_fkey;
ALTER TABLE xiangqi_realtime.receipts ADD CONSTRAINT receipts_user_id_fkey FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
DROP TRIGGER xiangqi_google_identity ON auth.identities;
DROP TRIGGER a_xiangqi_member_origin ON auth.users;
DROP VIEW xiangqi_auth.google_subjects;
DROP TABLE xiangqi_auth.guest_sessions,xiangqi_auth.google_drafts,xiangqi_auth.google_challenges,xiangqi_auth.google_temporary_accounts,xiangqi_auth.google_creation_intents,xiangqi_auth.account_origins,xiangqi_auth.google_guest_baseline,xiangqi_auth.principals;
DROP FUNCTION xiangqi_auth.guard_google_identity(),xiangqi_auth.register_member_origin(),xiangqi_auth.guard_actor_identity();
COMMIT;
