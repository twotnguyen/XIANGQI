BEGIN;
LOCK TABLE xiangqi_auth.username_accounts IN ACCESS EXCLUSIVE MODE;
LOCK TABLE xiangqi_auth.account_origins IN ACCESS EXCLUSIVE MODE;
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM xiangqi_auth.username_accounts) THEN
    RAISE EXCEPTION 'Refusing rollback: username contact emails exist';
  END IF;
END $$;
DROP TRIGGER xiangqi_origin_immutable ON xiangqi_auth.account_origins;
CREATE TRIGGER xiangqi_origin_immutable BEFORE UPDATE ON xiangqi_auth.account_origins
  FOR EACH ROW EXECUTE FUNCTION xiangqi_auth.guard_actor_identity();
REVOKE UPDATE (email_key) ON xiangqi_auth.account_origins FROM app_server;
DROP TRIGGER xiangqi_username_account_immutable ON xiangqi_auth.username_accounts;
DROP TABLE xiangqi_auth.username_accounts;
DROP FUNCTION xiangqi_auth.guard_username_account();
DROP FUNCTION xiangqi_auth.guard_origin_update();
COMMIT;
