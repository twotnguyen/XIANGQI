-- SYNTHETIC LOCAL TEST DEPENDENCY ONLY. Never apply to Supabase managed Auth.
-- Dedicated schema cluster has no real identities, passwords, tokens or provider.
DO $$ BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='postgres') THEN CREATE ROLE postgres LOGIN BYPASSRLS CREATEROLE; END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='anon') THEN CREATE ROLE anon NOLOGIN NOBYPASSRLS; END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN CREATE ROLE authenticated NOLOGIN NOBYPASSRLS; END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='service_role') THEN CREATE ROLE service_role NOLOGIN BYPASSRLS; END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='app_server') THEN CREATE ROLE app_server LOGIN NOBYPASSRLS; END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='supabase_auth_admin') THEN CREATE ROLE supabase_auth_admin LOGIN NOINHERIT NOBYPASSRLS; END IF;
END $$;
CREATE SCHEMA auth AUTHORIZATION supabase_auth_admin;
CREATE TABLE auth.users(
 id uuid PRIMARY KEY,
 email text UNIQUE,
 email_change text DEFAULT '',
 email_confirmed_at timestamptz,
 raw_user_meta_data jsonb DEFAULT '{}',
 raw_app_meta_data jsonb DEFAULT '{}',
 created_at timestamptz DEFAULT now()
);
ALTER TABLE auth.users OWNER TO supabase_auth_admin;
GRANT USAGE ON SCHEMA public TO anon,authenticated,service_role,app_server;
-- Simulate managed migration-owner privileges, never application Auth access.
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT ALL ON auth.users TO postgres;
DO $$ BEGIN EXECUTE format('GRANT CREATE ON DATABASE %I TO postgres',current_database()); END $$;
GRANT app_server TO postgres WITH ADMIN TRUE, SET FALSE, INHERIT FALSE;
