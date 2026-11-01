BEGIN;
ALTER TABLE public.rooms ADD COLUMN media_generation uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE xiangqi_room.outbox ADD COLUMN media_generation uuid;

-- Existing fixed provider rooms must be removed even when no revoke was pending.
WITH bumped AS (
  UPDATE public.rooms SET room_version=room_version+1 WHERE closed_at IS NULL RETURNING id,room_version
)
INSERT INTO xiangqi_room.outbox(id,room_id,room_version,type,payload)
SELECT gen_random_uuid(),id,room_version,'media.revoke-room','{"legacyNamespace":true}'::jsonb FROM bumped;

CREATE FUNCTION xiangqi_room.rotate_media_generation() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
  IF NEW.type IN ('media.revoke-user','media.revoke-room') THEN
    SELECT media_generation INTO NEW.media_generation FROM public.rooms WHERE id=NEW.room_id FOR UPDATE;
    UPDATE public.rooms SET media_generation=pg_catalog.gen_random_uuid() WHERE id=NEW.room_id;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER rotate_media_generation BEFORE INSERT ON xiangqi_room.outbox
FOR EACH ROW EXECUTE FUNCTION xiangqi_room.rotate_media_generation();
COMMIT;
