BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE public.rooms IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF (SELECT pg_catalog.pg_get_expr(c.conbin,c.conrelid)
     FROM pg_catalog.pg_constraint c
     WHERE c.conrelid='public.rooms'::pg_catalog.regclass AND c.contype='c'
       AND c.conname='rooms_invite_code_check') IS DISTINCT FROM
    '((invite_code IS NULL) OR (invite_code ~ ''^[A-HJ-NP-Z2-9]{8}$''::text))'
 THEN RAISE EXCEPTION 'Room code constraint differs from the audited baseline'; END IF;
 IF EXISTS(SELECT 1 FROM public.rooms WHERE closed_at IS NULL AND invite_code !~ '^[0-9]{8}$')
 THEN RAISE EXCEPTION 'Open rooms with legacy invite codes must close before migration'; END IF;
END $$;
ALTER TABLE public.rooms DROP CONSTRAINT rooms_invite_code_check;
-- NOT VALID: giữ nguyên lịch sử mã cũ của phòng đã đóng; INSERT/UPDATE vẫn kiểm mã số.
ALTER TABLE public.rooms ADD CONSTRAINT rooms_invite_code_check CHECK(invite_code IS NULL OR invite_code ~ '^[0-9]{8}$') NOT VALID;
COMMIT;