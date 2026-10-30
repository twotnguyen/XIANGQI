BEGIN;
SET LOCAL search_path=pg_catalog,public;

DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='profiles')
 OR EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='theme_choice')
 THEN RAISE EXCEPTION 'account theme precondition failed'; END IF;
END $$;

-- NULL = chưa chọn, server trả Kỳ Đài Cổ Phong. Không lưu giá trị OS.
ALTER TABLE public.profiles ADD COLUMN theme_choice text
 CHECK (theme_choice IN ('co-phong','paper-light','system'));

COMMIT;
