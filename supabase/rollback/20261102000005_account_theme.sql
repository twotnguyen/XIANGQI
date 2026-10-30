BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE public.profiles IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.profiles WHERE theme_choice IS NOT NULL)
 THEN RAISE EXCEPTION 'Account theme choices exist; rollback refused'; END IF;
END $$;
ALTER TABLE public.profiles DROP COLUMN theme_choice;
COMMIT;
