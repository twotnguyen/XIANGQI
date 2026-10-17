BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE public.rooms IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF (SELECT pg_catalog.pg_get_expr(c.conbin,c.conrelid)
     FROM pg_catalog.pg_constraint c
     WHERE c.conrelid='public.rooms'::pg_catalog.regclass AND c.contype='c'
       AND c.conname='rooms_invite_code_check') IS DISTINCT FROM
    '((invite_code IS NULL) OR (invite_code ~ ''^[0-9]{8}$''::text))'
 THEN RAISE EXCEPTION 'Room code constraint differs from the audited migration'; END IF;
 IF EXISTS(SELECT 1 FROM public.rooms WHERE invite_code ~ '^[0-9]{8}$')
 THEN RAISE EXCEPTION 'Digit room codes exist; rollback refused'; END IF;
END $$;
ALTER TABLE public.rooms DROP CONSTRAINT rooms_invite_code_check;
-- Bản gốc 000006 có cảnh báo trước; dòng cũ đã hợp lệ nên không cần NOT VALID.
ALTER TABLE public.rooms ADD CONSTRAINT rooms_invite_code_check CHECK(invite_code IS NULL OR invite_code ~ '^[A-HJ-NP-Z2-9]{8}$') NOT VALID;
COMMIT;