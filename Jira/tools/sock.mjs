// =============================================================================
// sock.mjs — gửi MỘT sự kiện Socket.IO lên máy chủ, in ack rồi thoát.
// Dùng chung trạng thái với công cụ `qa` (~/.qa-state): token, MATCH, ROOM, PROPOSAL.
//
// Cài (1 lần) — xem Jira/04-HUONG-DAN-KIEM-THU.md §5.5:
//   mkdir -p ~/qa-tools && cp Jira/tools/sock.mjs ~/qa-tools/
//   cd ~/qa-tools && npm init -y >/dev/null && npm i socket.io-client@4 >/dev/null
//   echo "alias qsock='node ~/qa-tools/sock.mjs'" >> ~/.zshrc && source ~/.zshrc
//
// Dùng:
//   qsock <người> <sự-kiện> ['<json bổ sung>']
//   qsock S1 match.resign                         tự thêm matchId, commandId, expectedVersion
//   qsock A  match.propose '{"kind":"DRAW"}'
//   qsock S1 match.respondProposal '{"accept":true}'   tự thêm proposalId (đề nghị vừa tạo bằng qa)
//   qsock A  match.resync '{}'
//   QA_CID=<uuid> qsock A match.resign            dùng lại đúng một commandId
//   QA_RAW=1 qsock A match.resign '{"matchId":"…","commandId":"…","expectedVersion":3}'   KHÔNG tự thêm gì
//
// Chế độ NGHE (in mọi sự kiện máy chủ đẩy tới người này, kèm giờ:phút:giây):
//   qsock B --listen            nghe tới khi bấm Ctrl+C
//   qsock B --listen 40         nghe 40 giây rồi tự thoát
//   qsock B --listen 0 lobby.subscribe   kết nối xong gửi lobby.subscribe rồi nghe (0 = không giới hạn thời gian)
//
// Thử giả mạo kết nối:
//   QA_TOKEN=none qsock A --listen 5                    không gửi token
//   QA_TOKEN="$(qa get token_A)x" qsock A --listen 5    token bị sửa 1 ký tự
//   QA_WEB_ORIGIN=https://evil.example qsock A --listen 5   Origin lạ
// =============================================================================
import { io } from 'socket.io-client';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { randomUUID } from 'node:crypto';

const STATE = process.env.QA_STATE ?? `${homedir()}/.qa-state`;
const ORIGIN_HTTP = process.env.QA_ORIGIN_HTTP ?? 'http://127.0.0.1:3000';
const API = process.env.QA_API ?? `${ORIGIN_HTTP}/api/v1`;
const WEB_ORIGIN = process.env.QA_WEB_ORIGIN ?? 'http://localhost:5173';
const read = (k) => { try { return readFileSync(`${STATE}/${k}`, 'utf8').trim(); } catch { return ''; } };
const die = (m) => { console.error(`✗ ${m}`); process.exit(2); };

const [who, event, extraJson = '{}', subEvent] = process.argv.slice(2);
if (!who || !event) die("Dùng: qsock <người> <sự-kiện> ['<json>']  — ví dụ: qsock S1 match.resign  ·  nghe: qsock B --listen");
// QA_TOKEN=none ⇒ không gửi token · QA_TOKEN=<chuỗi> ⇒ dùng chuỗi đó (thử token giả/sửa chữ ký)
const token = process.env.QA_TOKEN === 'none' ? undefined
  : (process.env.QA_TOKEN || read(`token_${who}`) || die(`Chưa đăng nhập ${who}. Chạy: qa login ${who}`));

if (event === '--listen') {
  const secs = Number(extraJson === '{}' ? 0 : extraJson) || 0;
  const hms = () => new Date().toTimeString().slice(0, 8);
  const s = io(`${ORIGIN_HTTP}/ws`, {
    transports: ['websocket'], auth: { accessToken: token, tabId: `qa-listen-${Date.now()}` },
    extraHeaders: { Origin: WEB_ORIGIN }, reconnection: false,
  });
  s.on('connect_error', (e) => { console.log(`✗ CONNECT_ERROR: ${e.message}`); process.exit(1); });
  s.on('connect', () => {
    console.error(`· ${hms()} ${who} đã kết nối, đang nghe${secs ? ` ${secs} giây` : ' (Ctrl+C để dừng)'}…`);
    if (subEvent) {
      const p = subEvent.startsWith('room.') ? { roomId: read('ROOM') } : subEvent.startsWith('match.') ? { matchId: read('MATCH') } : {};
      s.emit(subEvent, p, (ack) => console.error(`· đã gửi ${subEvent} ${JSON.stringify(p)} → ack ${JSON.stringify(ack)}`));
    }
  });
  s.on('disconnect', (r) => { console.log(`${hms()}  [ngắt kết nối] ${r}`); process.exit(0); });
  s.onAny((ev, ...args) => console.log(`${hms()}  ${ev}  ${JSON.stringify(args.length === 1 ? args[0] : args)}`));
  if (secs > 0) setTimeout(() => { s.close(); process.exit(0); }, secs * 1000);
} else {
let extra; try { extra = JSON.parse(extraJson); } catch { die('JSON bổ sung không hợp lệ'); }

let payload = extra;
if (!process.env.QA_RAW) {
  const matchId = read('MATCH');
  payload = { ...extra };
  if (event.startsWith('match.')) {
    if (!matchId) die('Chưa có MATCH. Chạy: qa use-match');
    payload.matchId ??= matchId;
    if (event !== 'match.resync') {
      payload.commandId ??= process.env.QA_CID || randomUUID();
      if (!('expectedVersion' in payload) && event !== 'match.withdrawProposal') {
        const snapAs = read(`token_${process.env.QA_SNAP_AS || 'A'}`) || token;
        const r = await fetch(`${API}/matches/${matchId}/snapshot`, { headers: { Authorization: `Bearer ${snapAs}` } });
        const j = await r.json().catch(() => ({}));
        const v = (j.data ?? j).version;
        if (v == null) die('Không đọc được version (thử QA_SNAP_AS=B)');
        payload.expectedVersion = v;
      }
      if (/respondProposal|withdrawProposal/.test(event)) payload.proposalId ??= read('PROPOSAL') || die('Chưa có PROPOSAL (qa propose …)');
    }
  }
  if (event.startsWith('room.')) payload.roomId ??= read('ROOM');
}

console.error(`→ gửi ${event} bằng ${who}: ${JSON.stringify(payload)}`);
const s = io(`${ORIGIN_HTTP}/ws`, {
  transports: ['websocket'],
  auth: { accessToken: token, tabId: `qa-${Date.now()}` },
  extraHeaders: { Origin: WEB_ORIGIN },
  reconnection: false,
});
const timer = setTimeout(() => { console.log('✗ Không nhận được ack sau 5 giây'); s.close(); process.exit(1); }, 5000);
s.on('connect_error', (e) => { clearTimeout(timer); console.log(`✗ CONNECT_ERROR: ${e.message}`); process.exit(1); });
s.on('connect', () => {
  s.emit(event, payload, (ack) => {
    clearTimeout(timer);
    console.log(JSON.stringify(ack, null, 2));
    s.close();
    process.exit(0);
  });
});
}
