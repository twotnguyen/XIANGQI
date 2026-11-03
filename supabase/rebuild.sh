#!/usr/bin/env bash
# Dựng schema XIANGQI trên một database TRỐNG: baseline rồi 45 migration theo thứ tự tên file.
#
#   REBUILD_DATABASE_URL=postgresql://... pnpm db:rebuild               # project Supabase mới
#   REBUILD_DATABASE_URL=postgresql://... pnpm db:rebuild --local-auth  # PostgreSQL thường, không có Supabase
#
# --local-auth: tạo Auth/role giả lập (tests/server/fixtures/managed-auth.test-fixture.sql). Cần superuser,
#   chỉ dùng cho database local. Không bao giờ dùng với Supabase: Supabase đã có schema auth thật.
# Không xóa gì: database đã có bảng của dự án thì script dừng. Cần psql (PostgreSQL client); đặt PGBIN nếu không có trong PATH.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
URL="${REBUILD_DATABASE_URL:-}"
LOCAL_AUTH=false
for arg in "$@"; do
  case "$arg" in
    --local-auth) LOCAL_AUTH=true ;;
    *) echo "Tham số không hợp lệ: $arg" >&2; exit 2 ;;
  esac
done

fail() { echo "db:rebuild: $*" >&2; exit 1; }
[ -n "$URL" ] || fail "thiếu REBUILD_DATABASE_URL (chuỗi kết nối direct hoặc session pooler 5432)."
# Transaction pooler không giữ SET ROLE/khóa giữa các câu lệnh của migration.
[[ "$URL" == *":6543"* ]] && fail "không dùng transaction pooler 6543; dùng direct hoặc session pooler 5432."

PSQL="${PGBIN:+$PGBIN/}psql"
command -v "$PSQL" >/dev/null || fail "không tìm thấy psql; cài PostgreSQL client hoặc đặt PGBIN."
sql() { "$PSQL" "$URL" -X -q -v ON_ERROR_STOP=1 "$@"; }
query() { sql -tAc "$1"; }

# Chỉ dựng trên database trống: không bao giờ chạy baseline lên project đã có dữ liệu.
[ "$(query "SELECT to_regclass('public.profiles') IS NOT NULL OR to_regnamespace('xiangqi_auth') IS NOT NULL")" = f ] \
  || fail "database đã có schema của dự án; script chỉ dựng database trống. Nâng cấp project đang chạy bằng từng migration mới (xem supabase/README.md)."

if $LOCAL_AUTH; then
  [ "$(query "SELECT to_regnamespace('auth') IS NULL")" = t ] \
    || fail "--local-auth chỉ dành cho PostgreSQL không có Supabase, nhưng database đã có schema auth."
  echo "→ Auth và role giả lập (chỉ dùng local)"
  sql -f "$ROOT/tests/server/fixtures/managed-auth.test-fixture.sql"
  # Bảng identities tối thiểu mà migration Google/Khách tham chiếu; Supabase thật đã có sẵn.
  query "ALTER SCHEMA public OWNER TO postgres; GRANT app_server TO postgres WITH SET TRUE;
    CREATE TABLE auth.identities(id uuid PRIMARY KEY,user_id uuid REFERENCES auth.users(id),provider text NOT NULL,
      provider_id text NOT NULL,identity_data jsonb DEFAULT '{}',UNIQUE(provider,provider_id));
    ALTER TABLE auth.identities OWNER TO supabase_auth_admin;
    GRANT SELECT,TRIGGER,REFERENCES ON auth.identities TO postgres" >/dev/null
else
  [ "$(query "SELECT to_regclass('auth.users') IS NOT NULL")" = t ] \
    || fail "không thấy auth.users. Với Supabase, kết nối đúng project; với PostgreSQL thường, chạy thêm --local-auth."
  [ "$(query "SELECT current_user")" = postgres ] || fail "hãy kết nối bằng user postgres của project Supabase."
  [ "$(query "SELECT count(*) FROM pg_roles WHERE rolname='app_server'")" = 1 ] \
    || fail "chưa có role app_server. Tạo trước trong SQL Editor: CREATE ROLE app_server NOLOGIN NOBYPASSRLS; (xem supabase/README.md)."
fi

files=("$ROOT/supabase/baseline/20260913_legacy_public.sql" "$ROOT"/supabase/migrations/*.sql)
for file in "${files[@]}"; do
  echo "→ ${file#"$ROOT/"}"
  # Migration kiểm current_user = postgres; SET ROLE giữ đúng chủ sở hữu khi đăng nhập bằng superuser local.
  { echo "SET ROLE postgres;"; cat "$file"; } | sql -f - || fail "lỗi khi áp ${file#"$ROOT/"}; database có thể dở dang, hãy tạo lại database trống rồi chạy lại."
done

echo "✓ Đã áp ${#files[@]} file. Số bảng theo schema:"
query "SELECT table_schema||': '||count(*) FROM information_schema.tables
  WHERE table_schema='public' OR table_schema LIKE 'xiangqi\_%' GROUP BY table_schema ORDER BY table_schema"
