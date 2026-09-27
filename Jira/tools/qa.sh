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
SOCK="${QA_SOCK:-$HOME/qa-tools/sock.mjs}"   # công cụ qsock (Sổ tay §5.5)
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
  qa ids                  in mọi mã đang ghi nhớ (MATCH, ROOM, PROPOSAL, INV, CODE…)
  qa get ROOM             in đúng một mã đang ghi nhớ — dùng trong lệnh khác: R1=$(qa get ROOM)

XEM TRẠNG THÁI
  qa snap [A]             tóm tắt ván: status, version, ply, lượt, đồng hồ, kết quả, đề nghị
  qa snap-full [A]        toàn bộ snapshot
  qa pos [A]              chỉ thế cờ (bàn + lượt), 1 dòng JSON — dùng để so trước/sau bằng diff
  qa sql "<câu SQL>"      chạy câu truy vấn (chỉ nên SELECT)
  qa val "<câu SQL>"      chỉ in GIÁ TRỊ (không bảng) — dùng gán biến: CTX=$(qa val "select …")

LỆNH TRONG VÁN (người = A, B, S1, C …)
  qa move <người> x1 y1 x2 y2      đi quân (x 0-8 trái→phải, y 0-9 TRÊN→DƯỚI; ĐỎ ở dưới y=9)
  qa resign <người>                đầu hàng
  qa propose <người> DRAW|UNDO     xin hoà / xin đi lại (ghi nhớ PROPOSAL)
  qa respond <người> yes|no [id]   trả lời đề nghị (mặc định đề nghị vừa tạo)
  qa withdraw <người> [id]         rút đề nghị
  qa alive <người>                 "Tôi còn đây" — xác nhận còn trong ván khi bị hỏi (chống treo ván)

DỰNG NHANH MỘT VÁN ONLINE
  qa quickmatch [0|300|600|900] [PUBLIC|CODE_ONLY|LOCKED]
                          A tạo phòng → B vào ghế chơi → A, B online → cả hai sẵn sàng → ghi nhớ MATCH
  qa online <người> [người…]   giữ người đó ONLINE (chạy qsock nghe phòng ở nền, log: qa log <người>)
  qa offline <người> [người…]  tắt kết nối nền đó ⇒ người đó OFFLINE
  qa log <người> [số dòng]     xem các sự kiện người đó đã nhận (mặc định 20 dòng cuối)
  qa cleanup                   DỰNG DỮ LIỆU: tắt mọi kết nối nền + đưa mọi người ra khỏi mọi phòng (SQL) — để làm "ván mới"

PHÒNG (phòng đang chọn = ROOM; room-create tự ghi nhớ)
  qa room-create <người> [PUBLIC|CODE_ONLY|LOCKED] [0|300|600|900] ['tên']   tạo phòng
  qa room <người>                       xem phòng (RoomView)
  qa members                            bảng thành viên phòng (đọc DB): username, role, side, ready
  qa mid <người>                        in membershipId của người đó trong phòng đang chọn
  qa lobby <người> [cursor]             danh sách sảnh
  qa join <người> WATCH|PLAY [nguồn]    vào phòng. nguồn: (bỏ trống)=roomId đang chọn · code · code:ABCD2345
                                        · token · token:<chuỗi> · inv · inv:<id>   (code/token/inv = cái vừa tạo)
  qa ready <người> yes|no               sẵn sàng / bỏ (tự đọc membershipId, revision từ DB)
                                        ghi đè để thử: QA_MEMBERSHIP=<mã> QA_READY_REV=99 QA_CFG_REV=0 qa ready …
  qa swap <người>                       xin đổi bên (ghi nhớ SWAP)
  qa swap-respond <người> yes|no [id]   · qa swap-cancel <người> [id]
  qa kick <người> <người-bị-đuổi>       đuổi người xem khỏi phòng (bị chặn vào lại)
  qa leave <người> [resign]             rời phòng (thêm chữ resign = confirmResign:true)
  qa room-set <người> '<json>'          đổi cài đặt, ví dụ '{"visibility":"LOCKED"}' (tự thêm commandId, expectedConfigRevision)

LỜI MỜI
  qa code <người> PLAY|WATCH            tạo mã 8 ký tự (ghi nhớ CODE)
  qa link <người> PLAY|WATCH            tạo link (ghi nhớ TOKEN = phần sau #token=)
  qa rotate-watch <người>               chủ phòng đổi mã xem (ghi nhớ CODE mới)
  qa invite <người> <người-nhận> PLAY|WATCH   mời trực tiếp bạn bè (ghi nhớ INV)
  qa inv-respond <người> yes|no [id]    chấp nhận / từ chối lời mời trực tiếp
  qa inbox <người> · qa inbox-count <người>   hộp thư lời mời
  qa grant <người-mời> <người-nhận> PLAY|WATCH   DỰNG DỮ LIỆU: chèn thẳng lời mời DIRECT vào DB (ghi nhớ INV)
                                        — chỉ dùng khi API mời (TK08.4.2) chưa có

CHƠI VỚI MÁY
  qa ai-new <người> EASY|MEDIUM|HARD RED|BLACK [0|300|600|900]   tạo ván với máy (ghi nhớ MATCH; người chọn bên của mình)
  qa undo-ai <người>                    đi lại với máy (hiệu lực ngay)
  (đi nước, đầu hàng, xem ván: dùng qa move / qa resign / qa snap như ván online; QA_SNAP_AS=<người> nếu không phải A)

CAMERA / MICRO (ván đang chọn)   mức: OFF · OPPONENT_ONLY · OPPONENT_AND_SPECTATORS
  qa media <người> <mức camera> <mức micro>   đổi chính sách (tự đọc expectedPolicyVersion; ghi đè: QA_POLICY_VER=<số>)
  qa media-get <người>                        xem chính sách 2 người chơi
  qa media-token <người> CAMERA|MICROPHONE [clientId]   xin token (in danh sách phòng + quyền, KHÔNG in token)

CHAT (phòng đang chọn)
  qa chat <người> ROOM|PLAYERS '<nội dung>'   gửi tin (tự lấy contextId, segment đang mở của phòng)
                                        ghi đè để thử: QA_MSGID=<uuid> (gửi lại cùng tin) · QA_SEGMENT=<id> · QA_CONTEXT=<id>
  qa chat-hist <người> ROOM|PLAYERS [cursor]  lịch sử (50 tin/trang)

HỒ SƠ & BẠN BÈ
  qa uid <người>                        in user id (đọc DB) — ví dụ: qa uid B
  qa rename <người> '<tên hiển thị>'    đổi tên hiển thị (PATCH /me)
  qa search <người> <chuỗi>             tìm người dùng theo username (tự mã hoá URL)
  qa friends <người>                    3 danh sách: friends / incoming / outgoing
  qa friend-add <người> <người-đích>    gửi lời mời kết bạn (ghi nhớ FRIENDREQ)
  qa friend-respond <người> yes|no [id] chấp nhận / từ chối lời mời (mặc định lời mời vừa gửi)
  qa friend-cancel <người> [id]         người gửi huỷ lời mời
  qa unfriend <người> <người-đích>      huỷ kết bạn

SAU VÁN / LỊCH SỬ
  qa rematch <người> yes|no [matchId]   phiếu tái đấu (mặc định ván đang ghi nhớ)
  qa hist <người> [cursor]              lịch sử ván của người đó
  qa replay <người> <matchId>           xem lại ván (GET /matches/:id/replay — người chơi, hoặc thành viên phòng khi ván hiện tại đã xong)

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
cmd_get()      { local v; v=$(getv "${1:?Dùng: qa get ROOM}"); [ -n "$v" ] || die "Chưa có $1"; echo "$v"; }
cmd_ids()      { echo "MATCH=$(getv MATCH)"; echo "ROOM=$(getv ROOM)"; echo "PROPOSAL=$(getv PROPOSAL)"; echo "FRIENDREQ=$(getv FRIENDREQ)"; echo "SWAP=$(getv SWAP)"; echo "CODE=$(getv CODE)"; echo "INV=$(getv INV)"; echo "TOKEN=$(getv TOKEN | cut -c1-8)…"; }

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
cmd_val() { psql "$DB" -Atc "${1:?Dùng: qa val \"select …\"}"; }
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
cmd_alive() {
  local who=${1:?Dùng: qa alive A} body v
  token_of "$who" >/dev/null || exit 2; v=$(version_of_match) || exit 2
  body=$(jq -nc --arg c "$(new_cid)" --argjson v "$v" '{commandId:$c, expectedVersion:$v}')
  call "$who" POST "/matches/$(getv MATCH)/commands/confirm-alive" "$body"
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
cmd_replay()      { call "${1:?}" GET "/matches/${2:?Dùng: qa replay A <matchId>}/replay"; }
# ---- online / offline / dựng ván nhanh ----
cmd_online() {
  [ $# -gt 0 ] || die "Dùng: qa online A B"
  [ -f "$SOCK" ] || die "Chưa cài qsock ($SOCK). Xem Sổ tay §5.5"
  local w pid
  for w in "$@"; do
    token_of "$w" >/dev/null || exit 2
    pid=$(getv "pid_$w"); [ -n "$pid" ] && kill "$pid" 2>/dev/null
    QA_STATE="$STATE" node "$SOCK" "$w" --listen 0 room.subscribe >"$STATE/listen_$w.log" 2>&1 &
    setv "pid_$w" "$!"; echo "✓ $w online (nền, pid $!) — xem sự kiện: qa log $w"
  done
}
cmd_offline() {
  [ $# -gt 0 ] || die "Dùng: qa offline B"
  local w pid; for w in "$@"; do pid=$(getv "pid_$w")
    if [ -n "$pid" ] && kill "$pid" 2>/dev/null; then echo "✓ $w offline (đã tắt kết nối nền)"; else echo "· $w không có kết nối nền"; fi
    setv "pid_$w" ""; done
}
cmd_cleanup() {
  local f; for f in "$STATE"/pid_*; do [ -f "$f" ] && { kill "$(cat "$f")" 2>/dev/null; : > "$f"; }; done
  psql "$DB" -qc "delete from active_players; update rooms set status='CLOSED' where status<>'CLOSED'; delete from room_members; delete from user_active_room" \
    && echo "✓ Đã dọn: không còn ai trong phòng nào, mọi kết nối nền đã tắt"
  setv MATCH ""; setv ROOM ""
}
cmd_log() { local w=${1:?Dùng: qa log B}; tail -n "${2:-20}" "$STATE/listen_$w.log" 2>/dev/null || die "Chưa có log của $w (qa online $w)"; }
cmd_quickmatch() {
  local tc=${1:-600} vis=${2:-PUBLIC}
  cmd_room_create A "$vis" "$tc" "Van nhanh" >/dev/null 2>&1; [ -n "$(last '.room.id')" ] || { jq . "$STATE/last"; die "A không tạo được phòng (A đang ở phòng khác? xem qa sql \"select * from user_active_room\")"; }
  cmd_grant A B PLAY >/dev/null || exit 2
  cmd_join B PLAY inv >/dev/null 2>&1; [ "$(last '.role')" = "PLAYER" ] || { jq . "$STATE/last"; die "B không vào được ghế chơi"; }
  cmd_online A B >/dev/null || exit 2
  sleep 2
  cmd_ready A yes >/dev/null 2>&1; cmd_ready B yes >/dev/null 2>&1
  sleep 1
  cmd_use_match >/dev/null || exit 2
  echo "✓ Ván online sẵn sàng: A = ĐỎ (đi trước), B = ĐEN, thời gian ${tc}s, phòng $vis"
  echo "  MATCH=$(getv MATCH)  ROOM=$(getv ROOM)   — xem: qa snap · tắt kết nối nền: qa offline A B"
}

# ---- phòng ----
sqlv() { psql "$DB" -Atc "$1"; }
cfg_rev() { local r; r=$(room_id) || exit 2; sqlv "select config_revision from rooms where id='$r'"; }
cmd_room_create() {
  local who=${1:?"Dùng: qa room-create A [PUBLIC|CODE_ONLY|LOCKED] [0|300|600|900] ['tên']"} vis=${2:-PUBLIC} tc=${3:-0} name=${4:-"Phòng test"} rid
  call "$who" POST /rooms "$(jq -nc --arg n "$name" --arg v "$vis" --argjson t "$tc" '{name:$n, visibility:$v, timeControl:$t}')"
  rid=$(last '.room.id'); [ -n "$rid" ] && { setv ROOM "$rid"; setv MATCH ""; note "Đã ghi nhớ ROOM=$rid"; }
}
cmd_room()    { local r; r=$(room_id) || exit 2; call "${1:?Dùng: qa room A}" GET "/rooms/$r"; }
cmd_members() { local r; r=$(room_id) || exit 2
  psql "$DB" -c "select p.username, m.role, m.side, m.ready, m.ready_revision, m.membership_id from room_members m join profiles p on p.id=m.user_id where m.room_id='$r' order by m.role, m.side nulls last, p.username"; }
cmd_mid()     { local r u v; r=$(room_id) || exit 2; u=$(username_of "${1:?Dùng: qa mid A}")
  v=$(sqlv "select m.membership_id from room_members m join profiles p on p.id=m.user_id where m.room_id='$r' and p.username='$u'")
  [ -n "$v" ] || die "$u không ở trong phòng"; echo "$v"; }
cmd_lobby()   { local q=""; [ -n "${2:-}" ] && q="?cursor=$2"; call "${1:?Dùng: qa lobby A}" GET "/rooms$q"; }
cmd_join() {
  local who=${1:?} intent=${2:?"Dùng: qa join B WATCH|PLAY [nguồn]"} src=${3:-} loc
  case "$src" in
    "")      loc=$(jq -nc --arg v "$(room_id)" '{roomId:$v}') || exit 2 ;;
    code)    loc=$(jq -nc --arg v "$(need CODE 'Tạo mã trước: qa code A PLAY')" '{code:$v}') || exit 2 ;;
    code:*)  loc=$(jq -nc --arg v "${src#code:}" '{code:$v}') ;;
    token)   loc=$(jq -nc --arg v "$(need TOKEN 'Tạo link trước: qa link A PLAY')" '{token:$v}') || exit 2 ;;
    token:*) loc=$(jq -nc --arg v "${src#token:}" '{token:$v}') ;;
    inv)     loc=$(jq -nc --arg v "$(need INV 'Tạo lời mời trước: qa invite / qa grant')" '{invitationId:$v}') || exit 2 ;;
    inv:*)   loc=$(jq -nc --arg v "${src#inv:}" '{invitationId:$v}') ;;
    *)       loc=$(jq -nc --arg v "$src" '{roomId:$v}') ;;
  esac
  call "$who" POST /rooms/join "$(jq -nc --arg c "$(new_cid)" --arg i "$intent" --argjson l "$loc" '{commandId:$c, intent:$i} + $l')"
}
cmd_ready() {
  local who=${1:?} rdy r u row mid rrev crev
  rdy=$(yn "${2:?"Dùng: qa ready A yes|no"}") || exit 2; r=$(room_id) || exit 2; u=$(username_of "$who")
  row=$(sqlv "select m.membership_id||'|'||m.ready_revision||'|'||r.config_revision from room_members m join profiles p on p.id=m.user_id join rooms r on r.id=m.room_id where m.room_id='$r' and p.username='$u'")
  if [ -n "$row" ]; then IFS='|' read -r mid rrev crev <<<"$row"
  elif [ -n "${QA_MEMBERSHIP:-}" ]; then mid=""; rrev=0; crev=$(cfg_rev) || exit 2
  else die "$u không ở trong phòng $r (xem: qa members). Muốn giả mạo: QA_MEMBERSHIP=<mã> qa ready $who yes"; fi
  mid=${QA_MEMBERSHIP:-$mid}; rrev=${QA_READY_REV:-$rrev}; crev=${QA_CFG_REV:-$crev}
  call "$who" POST "/rooms/$r/ready" "$(jq -nc --arg c "$(new_cid)" --arg m "$mid" --argjson cr "$crev" --argjson rr "$rrev" --argjson v "$rdy" \
    '{commandId:$c, membershipId:$m, expectedConfigRevision:$cr, expectedReadyRevision:$rr, ready:$v}')"
}
cmd_swap() {
  local who=${1:?Dùng: qa swap A} r crev sid; r=$(room_id) || exit 2; crev=$(cfg_rev) || exit 2
  call "$who" POST "/rooms/$r/side-swap" "$(jq -nc --arg c "$(new_cid)" --argjson cr "$crev" '{commandId:$c, expectedConfigRevision:$cr}')"
  sid=$(last '.proposal.id // .proposalId // .id'); [ -n "$sid" ] && { setv SWAP "$sid"; note "Đã ghi nhớ SWAP=$sid"; }
}
cmd_swap_respond() {
  local who=${1:?} acc r sid crev; acc=$(yn "${2:?"Dùng: qa swap-respond B yes|no"}") || exit 2; r=$(room_id) || exit 2
  if [ -n "${3:-}" ]; then sid=$3; else sid=$(need SWAP "Tạo đề nghị trước (qa swap A)") || exit 2; fi
  crev=$(cfg_rev) || exit 2
  call "$who" POST "/rooms/$r/side-swap/$sid/respond" "$(jq -nc --arg c "$(new_cid)" --argjson a "$acc" --argjson cr "$crev" '{commandId:$c, accept:$a, expectedConfigRevision:$cr}')"
}
cmd_swap_cancel() {
  local who=${1:?} r sid; r=$(room_id) || exit 2
  if [ -n "${2:-}" ]; then sid=$2; else sid=$(need SWAP "Tạo đề nghị trước (qa swap A)") || exit 2; fi
  call "$who" POST "/rooms/$r/side-swap/$sid/cancel" "$(jq -nc --arg c "$(new_cid)" '{commandId:$c}')"
}
cmd_leave() {
  local who=${1:?Dùng: qa leave A [resign]} r body='{}'; r=$(room_id) || exit 2
  [ "${2:-}" = "resign" ] && body='{"confirmResign":true}'
  call "$who" POST "/rooms/$r/leave" "$body"
}
cmd_kick() { local r v; r=$(room_id) || exit 2; v=$(uid_of "${2:?Dùng: qa kick A S1}") || exit 2; call "${1:?}" POST "/rooms/$r/members/$v/kick" '{}'; }
cmd_room_set() {
  local who=${1:?} js=${2:?"Dùng: qa room-set A '{\"visibility\":\"LOCKED\"}'"} r crev; r=$(room_id) || exit 2; crev=$(cfg_rev) || exit 2
  call "$who" PATCH "/rooms/$r" "$(jq -nc --arg c "$(new_cid)" --argjson cr "$crev" --argjson x "$js" '{commandId:$c, expectedConfigRevision:$cr} + $x')"
}
# ---- chơi với máy ----
cmd_ai_new() {
  local who=${1:?} lv=${2:?"Dùng: qa ai-new A EASY|MEDIUM|HARD RED|BLACK [giây]"} side=${3:?"Thiếu bên: RED hoặc BLACK"} tc=${4:-0} id
  call "$who" POST /ai/matches "$(jq -nc --arg l "$lv" --arg s "$side" --argjson t "$tc" '{level:$l, humanSide:$s, timeControl:$t}')"
  id=$(last '.match.id // .matchId // .id'); [ -n "$id" ] && { setv MATCH "$id"; setv ROOM ""; note "Đã ghi nhớ MATCH=$id (ván với máy, không có phòng)"; }
}
cmd_undo_ai() {
  local who=${1:?Dùng: qa undo-ai A} v; token_of "$who" >/dev/null || exit 2
  v=$(QA_SNAP_AS=${QA_SNAP_AS:-$who} version_of_match) || exit 2
  call "$who" POST "/matches/$(getv MATCH)/commands/undo-ai" "$(jq -nc --arg c "$(new_cid)" --argjson v "$v" '{commandId:$c, expectedVersion:$v}')"
}

# ---- camera / micro ----
cmd_media_get() { local m; m=$(match_id) || exit 2; call "${1:?Dùng: qa media-get A}" GET "/media/policy?matchId=$m"; }
cmd_media() {
  local who=${1:?} cam=${2:?"Dùng: qa media A OFF|OPPONENT_ONLY|OPPONENT_AND_SPECTATORS <mức micro>"} mic=${3:?"Thiếu mức micro"} m uid ver tok
  m=$(match_id) || exit 2; uid=$(uid_of "$who") || exit 2; tok=$(token_of "$who") || exit 2
  ver=${QA_POLICY_VER:-$(curl -s "$API/media/policy?matchId=$m" -H "Authorization: Bearer $tok" | jq -r --arg u "$uid" '((.data // .).policies // (.data // .)) | map(select(.userId==$u))[0].policyVersion // empty')}
  [ -n "$ver" ] || die "Không đọc được policyVersion của $who (thử QA_POLICY_VER=<số>)"
  call "$who" PATCH /media/policy "$(jq -nc --arg m "$m" --arg c "$cam" --arg i "$mic" --argjson v "$ver" '{matchId:$m, camera:$c, microphone:$i, expectedPolicyVersion:$v}')"
}
cmd_media_token() {
  local who=${1:?} kind=${2:?"Dùng: qa media-token A CAMERA|MICROPHONE"} m; m=$(match_id) || exit 2
  call "$who" POST /media/token "$(jq -nc --arg m "$m" --arg k "$kind" --arg c "${3:-qa-client}" '{matchId:$m, kind:$k, clientId:$c}')" >/dev/null
  jq '(.data // .) as $d | if ($d|type)=="object" and ($d.tokens? != null) then [$d.tokens[] | del(.token)] else (.error // $d | if type=="object" then del(.token) else . end) end' "$STATE/last"
}

# ---- chat ----
cmd_chat() {
  local who=${1:?} ch=${2:?"Dùng: qa chat A ROOM|PLAYERS 'nội dung'"} msg=${3?"Thiếu nội dung"} r ctx seg mid body
  r=$(room_id) || exit 2
  ctx=${QA_CONTEXT:-$(sqlv "select current_chat_context_id from rooms where id='$r'")}
  mid=${QA_MSGID:-$(new_cid)}
  if [ "$ch" = "PLAYERS" ]; then
    seg=${QA_SEGMENT:-$(sqlv "select id from chat_private_segments where context_id='$ctx' and closed_at is null")}
    body=$(jq -nc --arg c "$ctx" --arg s "$seg" --arg m "$mid" --arg t "$msg" '{contextId:$c, channel:"PLAYERS", privateSegmentId:$s, clientMessageId:$m, content:$t}')
  else
    body=$(jq -nc --arg c "$ctx" --arg m "$mid" --arg t "$msg" '{contextId:$c, channel:"ROOM", clientMessageId:$m, content:$t}')
  fi
  call "$who" POST "/rooms/$r/chat" "$body"
}
cmd_chat_hist() { local r q; r=$(room_id) || exit 2; q="?channel=${2:?Dùng: qa chat-hist A ROOM}"; [ -n "${3:-}" ] && q="$q&cursor=$3"; call "${1:?}" GET "/rooms/$r/chat$q"; }

# ---- lời mời ----
cmd_code() {
  local who=${1:?} g=${2:?"Dùng: qa code A PLAY|WATCH"} r c; r=$(room_id) || exit 2
  call "$who" POST "/rooms/$r/codes" "$(jq -nc --arg g "$g" '{grantRole:$g}')"
  c=$(last '.code'); [ -n "$c" ] && { setv CODE "$c"; note "Đã ghi nhớ CODE=$c"; }
}
cmd_link() {
  local who=${1:?} g=${2:?"Dùng: qa link A PLAY|WATCH"} r u; r=$(room_id) || exit 2
  call "$who" POST "/rooms/$r/links" "$(jq -nc --arg g "$g" '{grantRole:$g}')"
  u=$(last '.url'); [ -n "$u" ] && { setv TOKEN "${u##*#token=}"; note "Đã ghi nhớ TOKEN (phần sau #token=)"; }
}
cmd_rotate_watch() {
  local who=${1:?Dùng: qa rotate-watch A} r c; r=$(room_id) || exit 2
  call "$who" POST "/rooms/$r/watch-code" '{"rotate":true}'
  c=$(last '.code'); [ -n "$c" ] && { setv CODE "$c"; note "Đã ghi nhớ CODE=$c"; }
}
cmd_invite() {
  local who=${1:?} to g=${3:?"Dùng: qa invite A B PLAY|WATCH"} r id; r=$(room_id) || exit 2; to=$(uid_of "${2:?}") || exit 2
  call "$who" POST "/rooms/$r/invitations" "$(jq -nc --arg t "$to" --arg g "$g" '{recipientId:$t, grantRole:$g}')"
  id=$(last '.invitation.id // .id'); [ -n "$id" ] && { setv INV "$id"; note "Đã ghi nhớ INV=$id"; }
}
cmd_inv_respond() {
  local who=${1:?} acc id; acc=$(yn "${2:?"Dùng: qa inv-respond B yes|no"}") || exit 2
  if [ -n "${3:-}" ]; then id=$3; else id=$(need INV "Tạo lời mời trước (qa invite)") || exit 2; fi
  call "$who" POST "/invitations/$id/respond" "$(jq -nc --argjson a "$acc" '{accept:$a}')"
}
cmd_inbox()       { local q=""; [ -n "${2:-}" ] && q="?cursor=$2"; call "${1:?Dùng: qa inbox B}" GET "/invitations$q"; }
cmd_inbox_count() { call "${1:?Dùng: qa inbox-count B}" GET /invitations/count; }
cmd_grant() {
  local from to g=${3:?"Dùng: qa grant A B PLAY|WATCH"} r ep id; r=$(room_id) || exit 2
  from=$(uid_of "${1:?}") || exit 2; to=$(uid_of "${2:?}") || exit 2
  ep=NULL; [ "$g" = "WATCH" ] && ep="(select watch_epoch from rooms where id='$r')"
  id=$(sqlv "insert into invitations (id, room_id, issuer_id, recipient_id, kind, grant_role, status, watch_epoch, created_at, expires_at)
             values (gen_random_uuid(), '$r', '$from', '$to', 'DIRECT', '$g', 'PENDING', $ep, now(), now() + interval '10 minutes') returning id" | head -1)
  [ -n "$id" ] || die "Không chèn được lời mời (xem lỗi psql ở trên)"
  setv INV "$id"; echo "✓ INV=$id (DIRECT $g, hạn 10 phút — dữ liệu dựng bằng SQL)"
}

# ---- hồ sơ & bạn bè ----
uid_of() { local u id; u=$(username_of "${1:?}"); id=$(psql "$DB" -Atc "select id from profiles where username='$u'");
           [ -n "$id" ] || die "Không có người dùng $u trong DB"; printf '%s' "$id"; }
cmd_uid()    { uid_of "${1:?Dùng: qa uid B}"; echo; }
cmd_rename() { call "${1:?}" PATCH /me "$(jq -nc --arg n "${2?Dùng: qa rename A 'Tên mới'}" '{displayName:$n}')"; }
cmd_search() { local q; q=$(jq -rn --arg s "${2?Dùng: qa search A min}" '$s|@uri'); call "${1:?}" GET "/users?prefix=$q"; }
cmd_friends(){ call "${1:?Dùng: qa friends A}" GET /friends; }
cmd_friend_add() {
  local who=${1:?} target id rid
  target=$(uid_of "${2:?Dùng: qa friend-add A B}") || exit 2
  call "$who" POST /friends/requests "$(jq -nc --arg t "$target" '{targetUserId:$t}')"
  rid=$(last '.relationId // .id'); [ -n "$rid" ] && { setv FRIENDREQ "$rid"; note "Đã ghi nhớ FRIENDREQ=$rid"; }
}
cmd_friend_respond() {
  local who=${1:?} acc rid
  acc=$(yn "${2:?"Dùng: qa friend-respond B yes|no"}") || exit 2
  if [ -n "${3:-}" ]; then rid=$3; else rid=$(need FRIENDREQ "Gửi lời mời trước (qa friend-add) hoặc truyền mã") || exit 2; fi
  call "$who" POST "/friends/requests/$rid/respond" "$(jq -nc --argjson a "$acc" '{accept:$a}')"
}
cmd_friend_cancel() {
  local who=${1:?} rid
  if [ -n "${2:-}" ]; then rid=$2; else rid=$(need FRIENDREQ "Gửi lời mời trước hoặc truyền mã") || exit 2; fi
  call "$who" DELETE "/friends/requests/$rid"
}
cmd_unfriend() { local t; t=$(uid_of "${2:?Dùng: qa unfriend A B}") || exit 2; call "${1:?}" DELETE "/friends/$t"; }

cmd_raw()         { call "${1:?}" "${2:?}" "${3:?}" "${4:-}"; }
cmd_cid()         { new_cid; echo; }

# ---------- điều phối ---------------------------------------------------------
sub=${1:-help}; shift || true
case "$sub" in
  help|-h|--help) cmd_help ;;
  login) cmd_login "$@" ;;          login-all) cmd_login_all ;;     whoami) cmd_whoami "$@" ;;
  use-match) cmd_use_match "$@" ;;  use-room) cmd_use_room "$@" ;;  ids) cmd_ids ;;  get) cmd_get "$@" ;;
  snap) cmd_snap "$@" ;;            snap-full) cmd_snap_full "$@" ;; sql) cmd_sql "$@" ;;  val) cmd_val "$@" ;;
  pos) cmd_pos "$@" ;;
  move) cmd_move "$@" ;;            resign) cmd_resign "$@" ;;
  propose) cmd_propose "$@" ;;      respond) cmd_respond "$@" ;;    withdraw) cmd_withdraw "$@" ;;
  rematch) cmd_rematch "$@" ;;       alive) cmd_alive "$@" ;;
  hist) cmd_hist "$@" ;;            replay) cmd_replay "$@" ;;
  quickmatch) cmd_quickmatch "$@" ;;  cleanup) cmd_cleanup ;;  online) cmd_online "$@" ;;  offline) cmd_offline "$@" ;;  log) cmd_log "$@" ;;
  room-create) cmd_room_create "$@" ;;  room) cmd_room "$@" ;;  members) cmd_members ;;  mid) cmd_mid "$@" ;;  lobby) cmd_lobby "$@" ;;
  ai-new) cmd_ai_new "$@" ;;        undo-ai) cmd_undo_ai "$@" ;;
  media) cmd_media "$@" ;;          media-get) cmd_media_get "$@" ;;  media-token) cmd_media_token "$@" ;;
  kick) cmd_kick "$@" ;;            chat) cmd_chat "$@" ;;          chat-hist) cmd_chat_hist "$@" ;;
  join) cmd_join "$@" ;;            ready) cmd_ready "$@" ;;        leave) cmd_leave "$@" ;;  room-set) cmd_room_set "$@" ;;
  swap) cmd_swap "$@" ;;            swap-respond) cmd_swap_respond "$@" ;;  swap-cancel) cmd_swap_cancel "$@" ;;
  code) cmd_code "$@" ;;            link) cmd_link "$@" ;;          rotate-watch) cmd_rotate_watch "$@" ;;
  invite) cmd_invite "$@" ;;        inv-respond) cmd_inv_respond "$@" ;;
  inbox) cmd_inbox "$@" ;;          inbox-count) cmd_inbox_count "$@" ;;  grant) cmd_grant "$@" ;;
  uid) cmd_uid "$@" ;;              rename) cmd_rename "$@" ;;      search) cmd_search "$@" ;;
  friends) cmd_friends "$@" ;;      friend-add) cmd_friend_add "$@" ;;
  friend-respond) cmd_friend_respond "$@" ;;  friend-cancel) cmd_friend_cancel "$@" ;;  unfriend) cmd_unfriend "$@" ;;
  raw) cmd_raw "$@" ;;              cid) cmd_cid ;;
  *) echo "Lệnh không có: $sub"; echo; cmd_help; exit 2 ;;
esac
