#!/usr/bin/env bash
# Chạy test cần database bằng các cụm Postgres cô lập trên máy (khớp ci.yml).
# Mỗi bộ test khóa cứng host 127.0.0.1, cổng và tên database, nên cần đúng 12 cụm riêng.
#
#   tests/server/db.sh test [đối số vitest...]   dựng cụm (nếu chưa có) rồi chạy vitest tuần tự
#   tests/server/db.sh start | stop | status     dựng / tắt / xem các cụm
#   tests/server/db.sh env                       in các lệnh export *_TEST_DATABASE_URL
#   tests/server/db.sh purge                     tắt và xóa dữ liệu cụm
#
# Cần Postgres 17 (initdb, pg_ctl, psql, createdb). Đặt PGBIN nếu không tự tìm thấy.
# Dữ liệu nằm ở ${XQ_PG_DIR:-${TMPDIR:-/tmp}/xq-pg}; chỉ dùng cho test, không chứa dữ liệu thật.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BASE="${XQ_PG_DIR:-${TMPDIR:-/tmp}/xq-pg}"
export LC_ALL="${LC_ALL:-en_US.UTF-8}"

find_pgbin() {
  if [ -n "${PGBIN:-}" ]; then echo "$PGBIN"; return; fi
  for d in /opt/homebrew/opt/postgresql@17/bin /usr/local/opt/postgresql@17/bin /usr/lib/postgresql/17/bin; do
    [ -x "$d/initdb" ] && { echo "$d"; return; }
  done
  command -v initdb >/dev/null && { dirname "$(command -v initdb)"; return; }
  echo "Không tìm thấy Postgres (initdb). Cài Postgres 17 hoặc đặt PGBIN." >&2
  exit 1
}

# cổng:vai_trò_quản_trị:database:biến_môi_trường
CLUSTERS=(
  "55441:auth_test_admin:xiangqi_auth_test:AUTH_TEST_DATABASE_URL"
  "55442:realtime_test_admin:xiangqi_realtime_test:REALTIME_TEST_DATABASE_URL"
  "55443:schema_test_admin:xiangqi_schema_test:SCHEMA_TEST_DATABASE_URL"
  "55444:login_test_admin:xiangqi_login_test:LOGIN_TEST_DATABASE_URL"
  "55445:google_guest_test_admin:google_guest_test:GOOGLE_GUEST_TEST_DATABASE_URL"
  "55446:room_test_admin:xiangqi_room_test:ROOM_TEST_DATABASE_URL"
  "55447:match_test_admin:xiangqi_match_test:MATCH_TEST_DATABASE_URL"
  "55448:clock_test_admin:xiangqi_clock_test:CLOCK_TEST_DATABASE_URL"
  "55449:room_transaction_test_admin:xiangqi_room_transactions_test:ROOM_TRANSACTION_TEST_DATABASE_URL"
  "55450:member_realtime_test_admin:xiangqi_member_realtime_test:MEMBER_REALTIME_TEST_DATABASE_URL"
  "55451:clock_test_admin:xiangqi_clock_port_test:CLOCK_PORT_TEST_DATABASE_URL"
  "55452:room_runtime_test_admin:xiangqi_room_runtime_test:ROOM_RUNTIME_TEST_DATABASE_URL"
)
# DRAW_WORKER_TEST_DATABASE_URL dùng chung cụm 55452 với ROOM_RUNTIME_TEST_DATABASE_URL.

each_cluster() { # $1 = lệnh
  local c port admin db var
  for c in "${CLUSTERS[@]}"; do
    IFS=: read -r port admin db var <<<"$c"
    "$1" "$port" "$admin" "$db" "$var"
  done
}

start_one() {
  local port=$1 admin=$2 db=$3 dir="$BASE/$1"
  if [ ! -d "$dir" ]; then
    mkdir -p "$dir"
    "$PGBIN/initdb" -D "$dir" -U "$admin" --auth=trust -E UTF8 >/dev/null
  fi
  if ! "$PGBIN/pg_ctl" -D "$dir" status >/dev/null 2>&1; then
    "$PGBIN/pg_ctl" -D "$dir" -l "$dir/log" -w start \
      -o "-h 127.0.0.1 -p $port -k $dir -c fsync=off -c synchronous_commit=off -c max_connections=100" >/dev/null
  fi
  "$PGBIN/psql" -h 127.0.0.1 -p "$port" -U "$admin" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$db'" | grep -q 1 \
    || "$PGBIN/createdb" -h 127.0.0.1 -p "$port" -U "$admin" "$db"
}
stop_one() { local dir="$BASE/$1"; [ -d "$dir" ] && "$PGBIN/pg_ctl" -D "$dir" -m fast stop >/dev/null 2>&1 || true; }
status_one() { if "$PGBIN/pg_ctl" -D "$BASE/$1" status >/dev/null 2>&1; then echo "UP   $1 $3"; else echo "DOWN $1 $3"; fi; }
env_one() {
  echo "export $4=postgresql://$2@127.0.0.1:$1/$3"
  if [ "$4" = ROOM_RUNTIME_TEST_DATABASE_URL ]; then echo "export DRAW_WORKER_TEST_DATABASE_URL=postgresql://$2@127.0.0.1:$1/$3"; fi
}

cmd="${1:-status}"
[ $# -gt 0 ] && shift
PGBIN="$(find_pgbin)"
case "$cmd" in
  start) each_cluster start_one ;;
  stop) each_cluster stop_one ;;
  status) each_cluster status_one ;;
  env) each_cluster env_one ;;
  purge) each_cluster stop_one; rm -rf "$BASE" ;;
  test)
    each_cluster start_one
    eval "$(each_cluster env_one)"
    cd "$ROOT"
    exec pnpm exec vitest run --no-file-parallelism "$@"
    ;;
  *) sed -n '2,12p' "${BASH_SOURCE[0]}"; exit 2 ;;
esac
