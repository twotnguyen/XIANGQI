-- Migration 9: profiles-id-alias
-- Add generated column id to public.profiles for query and backward compatibility

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS id uuid GENERATED ALWAYS AS (user_id) STORED;
