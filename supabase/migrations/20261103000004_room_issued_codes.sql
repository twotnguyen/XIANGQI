BEGIN;
-- YC3 AC-YC3-RV-03: mã 8 chữ số đã cấp cho một phòng không bao giờ được cấp lại (kể cả mã bị xoay đi khi khóa rồi mở lại).
CREATE TABLE xiangqi_room.issued_codes (
  code text PRIMARY KEY CHECK(code ~ '^[0-9]{8}$'),
  issued_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
INSERT INTO xiangqi_room.issued_codes(code)
SELECT invite_code FROM public.rooms WHERE invite_code ~ '^[0-9]{8}$' ON CONFLICT DO NOTHING;
ALTER TABLE xiangqi_room.issued_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_room.issued_codes FORCE ROW LEVEL SECURITY;
REVOKE ALL ON xiangqi_room.issued_codes FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT ON xiangqi_room.issued_codes TO app_server;
CREATE POLICY issued_codes_server ON xiangqi_room.issued_codes TO app_server USING(true) WITH CHECK(true);
COMMIT;
