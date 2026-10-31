#!/usr/bin/env bash
# Chạy test cần database bằng các cụm Postgres cô lập trên máy (khớp ci.yml).
# Chỉ dựng các cụm được test đã chọn (và helper import) sử dụng; guard host/port/database giữ nguyên.
#
#   tests/server/db.sh test [đối số vitest...]   chọn cụm cần thiết rồi chạy vitest tuần tự
#   tests/server/db.sh start | stop | status     dựng / tắt / xem các cụm
#   tests/server/db.sh env                       in các lệnh export *_TEST_DATABASE_URL
#   tests/server/db.sh purge                     tắt và xóa dữ liệu cụm
#
# Cần Postgres 17 (initdb, pg_ctl, psql, createdb). Đặt PGBIN nếu không tự tìm thấy.
# Dữ liệu nằm ở ${XQ_PG_DIR:-${TMPDIR:-/tmp}/xq-pg}; chỉ dùng cho test, không chứa dữ liệu thật.
# XQ_PG_DOCKER=1 (chỉ với test): thay vì initdb/pg_ctl, mỗi cụm cần thiết chạy là một container
# postgres:17.6 (tmpfs, bind 127.0.0.1 ở cổng cụm); container bị xóa khi lệnh kết thúc hoặc bị ngắt.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BASE="${XQ_PG_DIR:-${TMPDIR:-/tmp}/xq-pg}"
export LC_ALL="${LC_ALL:-en_US.UTF-8}"
REQUIRED_DATABASES=all

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
    [[ "$REQUIRED_DATABASES" = all || " $REQUIRED_DATABASES " = *" $var "* ]] || continue
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

PG_IMAGE=postgres:17.6
RUN_ID=""
CHILD=""
DOCKER_CONTAINERS=()

docker_cleanup() { # chỉ xóa container do lần chạy này tạo
  [ -n "$CHILD" ] && kill -- "-$CHILD" 2>/dev/null || true
  local name
  for name in ${DOCKER_CONTAINERS[@]+"${DOCKER_CONTAINERS[@]}"}; do
    docker rm -f -v "$name" >/dev/null 2>&1 || true
  done
}
docker_start_one() { # $1 = cổng, $2 = admin, $3 = database
  local name="$RUN_ID-$1"
  DOCKER_CONTAINERS+=("$name")
  docker run -d --name "$name" \
    -e POSTGRES_USER="$2" -e POSTGRES_DB="$3" -e POSTGRES_HOST_AUTH_METHOD=trust \
    --tmpfs /var/lib/postgresql/data \
    -p "127.0.0.1:$1:5432" \
    "$PG_IMAGE" -c fsync=off -c synchronous_commit=off -c max_connections=100 >/dev/null
}
docker_wait_one() { # $1 = cổng, $2 = admin, $3 = database; sẵn sàng khi truy vấn qua TCP trong container
  local name="$RUN_ID-$1" i
  for i in $(seq 1 120); do
    if docker exec "$name" psql -h 127.0.0.1 -U "$2" -d "$3" -tAc 'SELECT 1' >/dev/null 2>&1; then return 0; fi
    if [ "$(docker inspect -f '{{.State.Running}}' "$name" 2>/dev/null)" != true ]; then
      docker logs "$name" >&2 || true
      echo "Container $name thoát trước khi sẵn sàng." >&2
      return 1
    fi
    sleep 0.5
  done
  echo "Hết thời gian chờ container $name (cổng $1)." >&2
  return 1
}
docker_test() { # đối số vitest; luôn chạy vitest như tiến trình con để cleanup chạy sau đó
  if ! command -v docker >/dev/null || ! docker info >/dev/null 2>&1; then
    echo "XQ_PG_DOCKER=1 cần Docker đang chạy." >&2
    exit 1
  fi
  RUN_ID="xq-pg-$$-$RANDOM-$(date +%s)"
  trap docker_cleanup EXIT
  trap 'exit 130' INT
  trap 'exit 143' TERM
  trap 'exit 129' HUP
  each_cluster docker_start_one
  each_cluster docker_wait_one
  eval "$(each_cluster env_one)"
  local status=0
  set -m
  pnpm exec vitest run --no-file-parallelism "$@" &
  CHILD=$!
  wait "$CHILD" || status=$?
  CHILD=""
  exit "$status"
}

cmd="${1:-status}"
[ $# -gt 0 ] && shift
if [ "$cmd" != test ]; then PGBIN="$(find_pgbin)"; fi
case "$cmd" in
  start) each_cluster start_one ;;
  stop) each_cluster stop_one ;;
  status) each_cluster status_one ;;
  env) each_cluster env_one ;;
  purge) each_cluster stop_one; rm -rf "$BASE" ;;
  test)
    cd "$ROOT"
    files="$(pnpm exec vitest list --filesOnly "$@")"
    REQUIRED_DATABASES="$(printf '%s\n' "$files" | node tests/server/db-scope.mjs "${CLUSTERS[@]##*:}")"
    for cluster in "${CLUSTERS[@]}"; do unset "${cluster##*:}"; done
    unset DRAW_WORKER_TEST_DATABASE_URL
    if [ "${XQ_PG_DOCKER:-0}" = 1 ]; then docker_test "$@"; fi
    if [ -n "$REQUIRED_DATABASES" ]; then PGBIN="$(find_pgbin)"; fi
    each_cluster start_one
    eval "$(each_cluster env_one)"
    exec pnpm exec vitest run --no-file-parallelism "$@"
    ;;
  *) sed -n '2,12p' "${BASH_SOURCE[0]}"; exit 2 ;;
esac
