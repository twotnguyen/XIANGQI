BEGIN;
CREATE SCHEMA xiangqi_realtime;
REVOKE ALL ON SCHEMA xiangqi_realtime FROM PUBLIC;
CREATE TABLE xiangqi_realtime.tabs (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  tab_id uuid NOT NULL,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id,room_id,tab_id)
);
CREATE TABLE xiangqi_realtime.controllers (
  user_id uuid NOT NULL,
  room_id uuid NOT NULL,
  tab_id uuid NOT NULL,
  connection_id text NOT NULL,
  generation integer NOT NULL CHECK(generation>0),
  PRIMARY KEY(user_id,room_id),
  FOREIGN KEY(user_id,room_id,tab_id) REFERENCES xiangqi_realtime.tabs(user_id,room_id,tab_id) ON DELETE CASCADE
);
CREATE TABLE xiangqi_realtime.receipts (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  command_id uuid NOT NULL,
  fingerprint text NOT NULL CHECK(length(fingerprint)=64),
  response jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now()+interval '24 hours'),
  PRIMARY KEY(user_id,room_id,command_id)
);
CREATE INDEX realtime_receipts_expiry ON xiangqi_realtime.receipts(expires_at);
ALTER TABLE xiangqi_realtime.tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_realtime.tabs FORCE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_realtime.controllers ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_realtime.controllers FORCE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_realtime.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_realtime.receipts FORCE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA xiangqi_realtime FROM PUBLIC;
GRANT USAGE ON SCHEMA xiangqi_realtime TO app_server;
GRANT SELECT,INSERT ON xiangqi_realtime.tabs TO app_server;
GRANT SELECT,INSERT,UPDATE ON xiangqi_realtime.controllers TO app_server;
GRANT SELECT,INSERT,DELETE ON xiangqi_realtime.receipts TO app_server;
CREATE POLICY realtime_server_tabs ON xiangqi_realtime.tabs TO app_server USING(true) WITH CHECK(true);
CREATE POLICY realtime_server_controllers ON xiangqi_realtime.controllers TO app_server USING(true) WITH CHECK(true);
CREATE POLICY realtime_server_receipts ON xiangqi_realtime.receipts TO app_server USING(true) WITH CHECK(true);
COMMIT;
