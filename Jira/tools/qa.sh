#!/usr/bin/env bash
# =============================================================================
# qa — công cụ dòng lệnh cho Tester dự án Cờ Tướng Online
#
# Mục đích: gửi lệnh thẳng lên máy chủ (kể cả lệnh "giả mạo") mà KHÔNG phải tự
# gõ JSON có dấu \" — gõ sai một dấu là nhận lỗi và dễ báo Bug nhầm.
#
# Cài đặt (1 lần):   xem Jira/04-HUONG-DAN-KIEM-THU.md §5
# Xem hướng dẫn:     qa help
#
# Cần có: bash, curl, jq, psql, uuidgen
# =============================================================================
set -uo pipefail

API="${QA_API:-http://127.0.0.1:3000/api/v1}"
DB="${QA_DB:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"
PASSWORD="${QA_PASSWORD:-Test@12345}"
STATE="${QA_STATE:-$HOME/.qa-state}"
mkdir -p "$STATE"

# ---------- tiện ích nội bộ ----------------------------------------------------
die()  { echo "✗ $*" >&2; exit 2; }
note() { echo "· $*" >&2; }
getv() { cat "$STATE/$1" 2>/dev/null || true; }
setv() { printf '%s' "$2" > "$STATE/$1"; }
need() { local v; v=$(getv "$1"); [ -n "$v" ] || die "Chưa có $1. $2"; printf '%s' "$v"; }

# A, B, C, N, S1..S6  →  tester_a, tester_b, …, tester_s1 …
username_of() { case "$1" in A|B|C|N|S[1-6]) echo "tester_$(echo "$1" | tr 'A-Z' 'a-z')";; *) echo "$1";; esac; }
token_of()    { local t; t=$(getv "token_$1"); [ -n "$t" ] || die "Chưa đăng nhập $1. Chạy: qa login $1"; printf '%s' "$t"; }
new_cid()     { if [ -n "${QA_CID:-}" ]; then printf '%s' "$QA_CID"; else uuidgen | tr 'A-Z' 'a-z'; fi; }

# call <người|-> <METHOD> <đường dẫn> [json]   → in JSON đẹp + dòng "→ HTTP xxx"; lưu body vào $STATE/last
call() {
  local who=$1 method=$2 path=$3 body=${4:-}
  local args=(-s -w $'\n__HTTP__%{http_code}' -X "$method" "$API$path") tok
  if [ "$who" != "-" ]; then tok=$(token_of "$who") || exit 2; args+=(-H "Authorization: Bearer $tok"); fi
  [ -n "$body" ] && args+=(-H 'Content-Type: application/json' -d "$body")
  local out json code
  out=$(curl "${args[@]}") || die "Không gọi được máy chủ $API — server đã chạy chưa? (pnpm dev)"
  json=${out%$'\n__HTTP__'*}; code=${out##*__HTTP__}
  printf '%s' "$json" > "$STATE/last"
  if [ -n "$json" ]; then echo "$json" | jq . 2>/dev/null || echo "$json"; fi
  echo "→ HTTP $code" >&2
}
# Lấy trường trong body vừa nhận (chấp nhận cả dạng có vỏ {ok,data} lẫn không)
last() { jq -r "(.data // .) | $1 // empty" "$STATE/last" 2>/dev/null; }

match_id()  { need MATCH "Chạy: qa use-match"; }
room_id()   { need ROOM  "Chạy: qa use-match (hoặc qa use-room <id>)"; }
version_of_match() {  # đọc version mới nhất bằng tài khoản A (hoặc QA_SNAP_AS)
  local who=${QA_SNAP_AS:-A} v tok mid
  tok=$(token_of "$who") || exit 2; mid=$(match_id) || exit 2
  v=$(curl -s "$API/matches/$mid/snapshot" -H "Authorization: Bearer $tok" | jq -r '(.data // .).version // empty')
  [ -n "$v" ] || die "Không đọc được version (tài khoản $who có trong phòng không? thử QA_SNAP_AS=B)"
  printf '%s' "$v"
}
yn() { case "$1" in yes|y|true|dong-y) echo true;; no|n|false|tu-choi) echo false;; *) die "Dùng yes hoặc no";; esac; }

# ---------- các lệnh ----------------------------------------------------------
cmd_help() { cat <<'EOF'
qa — công cụ gửi lệnh cho Tester

ĐĂNG NHẬP (lưu token để các lệnh sau dùng)
  qa login A              đăng nhập tester_a (mật khẩu Test@12345). Dùng được: A B C N S1..S6
  qa login-all            đăng nhập A B C S1 S2 S3
  qa whoami A             xem hồ sơ của A

CHỌN VÁN / PHÒNG ĐANG KIỂM
  qa use-match            chọn ván mới nhất trong DB (ghi nhớ MATCH và ROOM)
  qa use-match <id>       chọn ván theo mã
  qa use-room <id>        chọn phòng theo mã
  qa ids                  in MATCH, ROOM, PROPOSAL đang ghi nhớ

XEM TRẠNG THÁI
  qa snap [A]             tóm tắt ván: status, version, ply, lượt, đồng hồ, kết quả, đề nghị
  qa snap-full [A]        toàn bộ snapshot
  qa pos [A]              chỉ thế cờ (bàn + lượt), 1 dòng JSON — dùng để so trước/sau bằng diff
  qa sql "<câu SQL>"      chạy câu truy vấn (chỉ nên SELECT)

LỆNH TRONG VÁN (người = A, B, S1, C …)
  qa move <người> x1 y1 x2 y2      đi quân (x 0-8 trái→phải, y 0-9 TRÊN→DƯỚI; ĐỎ ở dưới y=9)
  qa resign <người>                đầu hàng
  qa propose <người> DRAW|UNDO     xin hoà / xin đi lại (ghi nhớ PROPOSAL)
  qa respond <người> yes|no [id]   trả lời đề nghị (mặc định đề nghị vừa tạo)
  qa withdraw <người> [id]         rút đề nghị

SAU VÁN / LỊCH SỬ
  qa rematch <người> yes|no [matchId]   phiếu tái đấu (mặc định ván đang ghi nhớ)
  qa hist <người> [cursor]              lịch sử ván của người đó
  qa replay <người> <matchId>           xem lại (đường lịch sử cá nhân)
  qa room-replay <người> <matchId>      xem lại (đường trong phòng)

GỬI BẤT KỲ
  qa raw <người|-> <METHOD> <đường dẫn> ['<json>']    ví dụ: qa raw A GET /history
                                                      dùng "-" thay người để gửi KHÔNG có token

MẸO
  QA_CID=<uuid> qa resign A     dùng lại đúng một commandId (kiểm "gửi trùng lệnh")
  qa cid                        in một commandId mới để dùng lại
  QA_SNAP_AS=B qa snap          đọc snapshot bằng tài khoản B
  Kết quả mỗi lệnh: JSON trả về + dòng "→ HTTP <mã>". Lỗi có dạng {"ok":false,"error":{"code":"…"}}
EOF
}

cmd_login() {
  local who=${1:?"Dùng: qa login A"} user body tok
  user=$(username_of "$who")
  body=$(jq -nc --arg u "$user" --arg p "$PASSWORD" '{username:$u, password:$p, rememberMe:true}')
  call - POST /auth/login "$body" >/dev/null
  tok=$(last '.access_token')
  [ -n "$tok" ] || { jq . "$STATE/last" 2>/dev/null; die "Đăng nhập $user thất bại (đã đăng ký + xác minh email chưa?)"; }
  setv "token_$who" "$tok"; echo "✓ Đã đăng nhập $who ($user)"
}
cmd_login_all() { for w in A B C S1 S2 S3; do cmd_login "$w" || true; done; }
cmd_whoami()    { call "${1:?Dùng: qa whoami A}" GET /me; }

cmd_use_match() {
  local id=${1:-} room
  if [ -z "$id" ]; then id=$(psql "$DB" -Atc "select id from matches order by started_at desc limit 1"); fi
  [ -n "$id" ] || die "Chưa có ván nào trong DB"
  room=$(psql "$DB" -Atc "select coalesce(room_id::text,'') from matches where id='$id'")
  setv MATCH "$id"; setv ROOM "$room"; setv PROPOSAL ""
  echo "✓ MATCH=$id"; echo "✓ ROOM=${room:-(ván với máy — không có phòng)}"
}
cmd_use_room() { setv ROOM "${1:?Dùng: qa use-room <id>}"; echo "✓ ROOM=$1"; }
cmd_ids()      { echo "MATCH=$(getv MATCH)"; echo "ROOM=$(getv ROOM)"; echo "PROPOSAL=$(getv PROPOSAL)"; }

cmd_snap() {
  local who=${1:-${QA_SNAP_AS:-A}} tok mid
  tok=$(token_of "$who") || exit 2; mid=$(match_id) || exit 2
  curl -s "$API/matches/$mid/snapshot" -H "Authorization: Bearer $tok" \
  | jq '(.data // .) as $s | if $s.version == null then . else {
      status: $s.status, version: $s.version, ply: $s.ply, turn: $s.position.turn,
      redMs: $s.clock.redMs, blackMs: $s.clock.blackMs,
      outcome: $s.outcome, proposal: $s.proposal,
      activeMoves: ($s.activeMoveIds | length) } end'
}
cmd_pos() {  # in riêng thế cờ (board + lượt) dạng JSON gọn, để so sánh bằng diff
  local who=${1:-${QA_SNAP_AS:-A}} tok mid
  tok=$(token_of "$who") || exit 2; mid=$(match_id) || exit 2
  curl -s "$API/matches/$mid/snapshot" -H "Authorization: Bearer $tok" | jq -c '(.data // .).position'
}
cmd_snap_full() { local mid; mid=$(match_id) || exit 2; call "${1:-A}" GET "/matches/$mid/snapshot"; }
cmd_sql() { psql "$DB" -c "${1:?Dùng: qa sql \"select …\"}"; }

cmd_move() {
  local who=${1:?} x1=${2:?} y1=${3:?} x2=${4:?} y2=${5:?} body v
  token_of "$who" >/dev/null || exit 2; v=$(version_of_match) || exit 2
  body=$(jq -nc --arg c "$(new_cid)" --argjson v "$v" \
    --argjson x1 "$x1" --argjson y1 "$y1" --argjson x2 "$x2" --argjson y2 "$y2" \
    '{commandId:$c, expectedVersion:$v, from:{x:$x1,y:$y1}, to:{x:$x2,y:$y2}}')
  call "$who" POST "/matches/$(getv MATCH)/commands/move" "$body"
}
cmd_resign() {
  local who=${1:?Dùng: qa resign A} body v
  token_of "$who" >/dev/null || exit 2; v=$(version_of_match) || exit 2
  body=$(jq -nc --arg c "$(new_cid)" --argjson v "$v" '{commandId:$c, expectedVersion:$v}')
  call "$who" POST "/matches/$(getv MATCH)/commands/resign" "$body"
}
cmd_propose() {
  local who=${1:?} kind=${2:?"Dùng: qa propose A DRAW|UNDO"} body pid v
  token_of "$who" >/dev/null || exit 2; v=$(version_of_match) || exit 2
  body=$(jq -nc --arg c "$(new_cid)" --argjson v "$v" --arg k "$kind" '{commandId:$c, expectedVersion:$v, kind:$k}')
  call "$who" POST "/matches/$(getv MATCH)/commands/propose" "$body"
  pid=$(last '.proposal.id'); [ -n "$pid" ] && { setv PROPOSAL "$pid"; note "Đã ghi nhớ PROPOSAL=$pid"; }
}
cmd_respond() {
  local who=${1:?} acc pid body v
  token_of "$who" >/dev/null || exit 2
  acc=$(yn "${2:?"Dùng: qa respond B yes|no"}") || exit 2
  if [ -n "${3:-}" ]; then pid=$3; else pid=$(need PROPOSAL "Tạo đề nghị trước (qa propose) hoặc truyền mã") || exit 2; fi
  v=$(version_of_match) || exit 2
  body=$(jq -nc --arg c "$(new_cid)" --argjson v "$v" --arg p "$pid" --argjson a "$acc" \
    '{commandId:$c, expectedVersion:$v, proposalId:$p, accept:$a}')
  call "$who" POST "/matches/$(getv MATCH)/commands/respond" "$body"
}
cmd_withdraw() {
  local who=${1:?} pid body
  if [ -n "${2:-}" ]; then pid=$2; else pid=$(need PROPOSAL "Tạo đề nghị trước hoặc truyền mã") || exit 2; fi
  body=$(jq -nc --arg c "$(new_cid)" --arg p "$pid" '{commandId:$c, proposalId:$p}')
  call "$who" POST "/matches/$(getv MATCH)/commands/withdraw" "$body"
}
cmd_rematch() {
  local who=${1:?} acc mid body room
  acc=$(yn "${2:?"Dùng: qa rematch A yes|no"}") || exit 2
  if [ -n "${3:-}" ]; then mid=$3; else mid=$(match_id) || exit 2; fi
  room=$(room_id) || exit 2
  body=$(jq -nc --arg c "$(new_cid)" --arg m "$mid" --argjson a "$acc" '{commandId:$c, expectedMatchId:$m, accept:$a}')
  call "$who" POST "/rooms/$room/rematch" "$body"
}
cmd_hist()        { local q=""; [ -n "${2:-}" ] && q="?cursor=$2"; call "${1:?}" GET "/history$q"; }
cmd_replay()      { call "${1:?}" GET "/history/${2:?Dùng: qa replay A <matchId>}/replay"; }
cmd_room_replay() { local r; r=$(room_id) || exit 2; call "${1:?}" GET "/rooms/$r/replay/${2:?Dùng: qa room-replay S1 <matchId>}"; }
cmd_raw()         { call "${1:?}" "${2:?}" "${3:?}" "${4:-}"; }
cmd_cid()         { new_cid; echo; }

# ---------- điều phối ---------------------------------------------------------
sub=${1:-help}; shift || true
case "$sub" in
  help|-h|--help) cmd_help ;;
  login) cmd_login "$@" ;;          login-all) cmd_login_all ;;     whoami) cmd_whoami "$@" ;;
  use-match) cmd_use_match "$@" ;;  use-room) cmd_use_room "$@" ;;  ids) cmd_ids ;;
  snap) cmd_snap "$@" ;;            snap-full) cmd_snap_full "$@" ;; sql) cmd_sql "$@" ;;
  pos) cmd_pos "$@" ;;
  move) cmd_move "$@" ;;            resign) cmd_resign "$@" ;;
  propose) cmd_propose "$@" ;;      respond) cmd_respond "$@" ;;    withdraw) cmd_withdraw "$@" ;;
  rematch) cmd_rematch "$@" ;;
  hist) cmd_hist "$@" ;;            replay) cmd_replay "$@" ;;      room-replay) cmd_room_replay "$@" ;;
  raw) cmd_raw "$@" ;;              cid) cmd_cid ;;
  *) echo "Lệnh không có: $sub"; echo; cmd_help; exit 2 ;;
esac
