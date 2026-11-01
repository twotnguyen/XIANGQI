BEGIN;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.rooms WHERE closed_at IS NULL)
     OR EXISTS (
       SELECT 1 FROM xiangqi_room.outbox
       WHERE type IN ('media.revoke-user','media.revoke-room') AND delivered_at IS NULL
     ) THEN
    RAISE EXCEPTION 'Close rooms and deliver media revocations before rolling back generation fencing';
  END IF;
END $$;
DROP TRIGGER rotate_media_generation ON xiangqi_room.outbox;
DROP FUNCTION xiangqi_room.rotate_media_generation();
DELETE FROM xiangqi_room.outbox WHERE type='media.revoke-room' AND media_generation IS NULL AND payload='{"legacyNamespace":true}'::jsonb;
ALTER TABLE xiangqi_room.outbox DROP COLUMN media_generation;
ALTER TABLE public.rooms DROP COLUMN media_generation;
COMMIT;
