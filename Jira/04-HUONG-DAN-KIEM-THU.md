# 04 — SỔ TAY KIỂM THỬ CHO TESTER (đọc 1 lần trước khi nhận Task đầu tiên)

**Dành cho:** thành viên vai trò Tester (và cả Dev muốn tự kiểm) · **Cập nhật:** 2026-09-27

> Sổ tay này giải thích **những việc lặp lại ở mọi Task**: dựng môi trường, tạo tài khoản test, mở nhiều người chơi cùng lúc, gửi request "giả mạo", xem cơ sở dữ liệu, chạy test tự động, ghi bằng chứng, tạo Bug.
> Gặp từ kỹ thuật khó (transaction, khoá dòng, race condition…) ⇒ tra [Từ điển kỹ thuật](05-TU-DIEN-KY-THUAT.md).
> Mỗi Task vẫn ghi **đầy đủ các bước riêng của nó** ngay trong Task. Sổ tay chỉ để bạn không phải học lại cách mở terminal hay cách lấy token ở mỗi Task.

---

## 0. TESTER LÀM GÌ TRONG DỰ ÁN NÀY

1. Dev làm xong Task → mở PR (4 cổng xanh) → kéo Task sang **Ready For Test** và đổi Assignee sang bạn. Dev ghi comment trên Jira: link PR + cách chạy thử. **PR chưa merge** — trong lúc bạn kiểm, một người khác review code.
2. Bạn **lấy code của nhánh PR** (mục 2), dựng môi trường, làm **đủ mọi ca** trong mục **🧪 Kiểm thử khi Ready for Test** của Task.
3. Mỗi ca bạn ghi: **PASS** hoặc **FAIL**, kèm **bằng chứng** (ảnh chụp, log terminal, kết quả truy vấn DB).
4. Tất cả PASS → commit báo cáo `docs/test-reports/<mã-task>.md` **vào chính nhánh PR** → comment PASS trên Jira và PR. Khi PR có ≥ 1 approve + CI xanh, Dev merge `develop` → bạn kiểm PR đã merge rồi kéo Task sang **Done** → log work số giờ kiểm.
5. Có ca FAIL → tạo **Bug** (mục 10) → kéo Task về **In Progress** → đổi Assignee về Dev. Dev sửa **trên cùng PR**, xong kéo lại Ready For Test → bạn **kiểm lại TOÀN BỘ ca**, không chỉ ca đã FAIL (vì sửa chỗ này có thể làm hỏng chỗ khác).

**Ba điều tuyệt đối không làm:**
- ⛔ Không ghi PASS khi chưa tự tay chạy ca đó.
- ⛔ Không "cho qua" vì lỗi nhỏ. Nếu kết quả khác mong đợi dù chỉ một chữ ⇒ FAIL, tạo Bug mức thấp.
- ⛔ Không sửa code của Dev để test chạy qua. Tester chỉ báo lỗi.

---

## 1. CÀI ĐẶT MÁY (làm 1 lần)

| Phần mềm | Phiên bản | Kiểm bằng lệnh | Kết quả đúng |
|---|---|---|---|
| Node.js | 24 LTS | `node -v` | `v24.x.x` |
| pnpm | đúng số ghi trong `package.json` mục `packageManager` | `pnpm -v` | trùng số đó |
| Docker Desktop | bản mới, **đang chạy** | `docker ps` | không báo lỗi |
| Supabase CLI | bản ghi trong README | `supabase -v` | có số phiên bản |
| Git | bất kỳ | `git --version` | có số phiên bản |
| Trình duyệt | Chrome + Firefox (hoặc Edge) | — | — |
| `jq` (đọc JSON trong terminal) | bất kỳ | `jq --version` | có số phiên bản |

Lấy code lần đầu:
```bash
git clone <địa chỉ repo nhóm>
cd <thư mục repo>
pnpm install --frozen-lockfile
cp .env.example .env        # rồi điền biến theo README (KHÔNG commit file .env)
```

---

## 2. MỖI LẦN BẮT ĐẦU KIỂM MỘT TASK

```bash
git fetch origin
gh pr checkout <số-PR>           # lấy đúng code của PR đang kiểm (số PR ở comment Jira)
# không có gh: git checkout -b test-pr origin/<tên-nhánh-PR>
pnpm install --frozen-lockfile   # phòng khi Dev thêm thư viện
pnpm db:start                    # bật Supabase local (Postgres + Auth + hộp thư)
pnpm db:reset                    # áp lại TẤT CẢ migration từ đầu → DB sạch, đúng schema mới nhất
pnpm build
pnpm dev                         # chạy server (cổng 3000) + web (cổng 5173) — xem README nếu lệnh khác
```

Kiểm nhanh môi trường sống:

| Địa chỉ | Là gì | Đúng khi |
|---|---|---|
| http://127.0.0.1:3000/health | Máy chủ trò chơi | trả `{"ok":true}` |
| http://localhost:5173 | Giao diện web | hiện trang đăng nhập |
| http://127.0.0.1:54323 | **Supabase Studio** — xem/sửa DB bằng giao diện | mở được, thấy các bảng |
| http://127.0.0.1:54324 | **Hộp thư local** — đọc email xác minh / đặt lại mật khẩu | mở được |
| `postgresql://postgres:postgres@127.0.0.1:54322/postgres` | Chuỗi kết nối DB (dùng cho `psql`) | `psql <chuỗi> -c "select 1"` trả `1` |

> ⚠ `pnpm db:reset` **xoá sạch dữ liệu** trong DB local. Làm điều này ở đầu mỗi Task để kết quả không bị dữ liệu cũ làm sai.

---

## 3. BỘ TÀI KHOẢN TEST CHUẨN

Mọi Task dùng **cùng một bộ tên** để báo cáo dễ đọc:

| Ký hiệu | Username | Mật khẩu | Vai trò thường dùng |
|---|---|---|---|
| **A** | `tester_a` | `Test@12345` | Người chơi 1 — thường là **chủ phòng (Host)**, cầm **ĐỎ** ở ván đầu |
| **B** | `tester_b` | `Test@12345` | Người chơi 2 — cầm **ĐEN** ở ván đầu |
| **C** | `tester_c` | `Test@12345` | **Người ngoài** — không ở trong phòng, dùng để thử truy cập trái phép |
| **S1…S5** | `tester_s1` … `tester_s5` | `Test@12345` | **Người xem (SPECTATOR)** |
| **S6** | `tester_s6` | `Test@12345` | Người xem thứ 6 — dùng để thử "phòng đã đủ 5 người xem" |
| **N** | `tester_n` | `Test@12345` | Tài khoản **mới, chưa chơi ván nào** — dùng để thử trạng thái trống |

**Cách tạo tài khoản (sau mỗi lần `pnpm db:reset`):**
1. Mở http://localhost:5173 → **Đăng ký** → nhập username, email dạng `tester_a@example.test`, mật khẩu.
2. Mở hộp thư local http://127.0.0.1:54324 → mở email xác minh → bấm link.
3. Lặp lại cho các tài khoản Task cần (Task ghi rõ cần tài khoản nào).

> Mẹo: nếu nhóm đã có script tạo nhanh (ví dụ `pnpm seed:testers`) thì dùng script, **nhưng** các Task về đăng ký/xác minh email thì **bắt buộc** đăng ký qua giao diện thật.

---

## 4. MỞ NHIỀU NGƯỜI DÙNG CÙNG LÚC

Một ván cờ cần ít nhất 2 người (A và B), thường thêm người xem S1. Mỗi người phải là một **phiên đăng nhập độc lập**.

| Cách | Có độc lập không? | Ghi chú |
|---|---|---|
| Chrome profile khác nhau (góc trên phải → *Thêm hồ sơ*) | ✅ Có | **Khuyên dùng.** Tạo sẵn 3 profile: "A", "B", "S1" |
| Chrome + Firefox + Edge | ✅ Có | Mỗi trình duyệt một người |
| Nhiều cửa sổ ẩn danh Chrome | ❌ **KHÔNG** | Mọi cửa sổ ẩn danh Chrome **chung một phiên** → A và B sẽ thành cùng một người |
| Hai tab trong cùng một cửa sổ | ❌ KHÔNG | Đó là **cùng một người, hai tab** — chỉ dùng khi Task kiểm "nhiều tab" |

**Kiểm giao diện điện thoại:** Chrome → F12 → biểu tượng điện thoại (Toggle device toolbar) → chọn kích thước **360 × 800** và **390 × 844**. Máy tính kiểm ở **1366 × 768** và **1920 × 1080**.

---

## 5. GỬI LỆNH THẲNG LÊN MÁY CHỦ (kiểm "giả mạo") — DÙNG CÔNG CỤ `qa`

**Vì sao phải làm:** luật số 1 của dự án là *"máy chủ quyết định"*. Giao diện ẩn nút "Đầu hàng" với người xem **chưa đủ** — kẻ gian có thể tự gửi request. Tester phải **tự gửi** lệnh trái phép và xác nhận máy chủ **từ chối**.

Tự gõ `curl` với JSON rất dễ sai dấu `\"` ⇒ nhận lỗi ⇒ tưởng máy chủ lỗi. Vì vậy dự án có công cụ **`qa`** ([Jira/tools/qa.sh](tools/qa.sh)) — gõ lệnh ngắn, công cụ tự tạo JSON, tự lấy `version` mới nhất, tự tạo `commandId`.

### 5.1 Cài `qa` (1 lần)
```bash
# từ thư mục gốc repo
chmod +x Jira/tools/qa.sh
echo "alias qa='$(pwd)/Jira/tools/qa.sh'" >> ~/.zshrc     # dùng bash thì thay bằng ~/.bashrc
source ~/.zshrc
qa help                                                   # phải in ra bảng hướng dẫn
```
Cần có `jq`, `psql`, `uuidgen` (macOS có sẵn `uuidgen`; `brew install jq libpq` nếu thiếu).

### 5.2 Các lệnh hay dùng

| Muốn làm | Gõ | Ghi chú |
|---|---|---|
| Đăng nhập một người | `qa login A` | Dùng được `A B C N S1…S6` (xem §3). Token được nhớ cho các lệnh sau |
| Đăng nhập nhiều người | `qa login-all` | A, B, C, S1, S2, S3 |
| Chọn ván đang kiểm | `qa use-match` | Lấy ván mới nhất trong DB; nhớ luôn mã phòng |
| Xem nhanh ván | `qa snap` | status, version, ply, lượt, đồng hồ, kết quả, đề nghị |
| So bàn cờ trước/sau | `qa pos > truoc.json` … `qa pos > sau.json` rồi `diff truoc.json sau.json` | Không in gì = giống hệt |
| Đi quân | `qa move A 1 7 4 7` | từ `(1,7)` tới `(4,7)` — xem cách ghi toạ độ ở §12 |
| Đầu hàng | `qa resign A` | |
| Xin hoà / xin đi lại | `qa propose A DRAW` · `qa propose A UNDO` | Nhớ mã đề nghị vừa tạo |
| Trả lời đề nghị | `qa respond B yes` · `qa respond B no` | Mặc định trả lời đề nghị vừa tạo |
| Rút đề nghị | `qa withdraw A` | |
| "Tôi còn đây" (chống treo ván) | `qa alive A` | |
| Phiếu tái đấu | `qa rematch A yes` | |
| Lịch sử / xem lại | `qa hist A` · `qa replay A <mã ván>` | |
| ⭐ **Dựng nhanh 1 ván online** | `qa quickmatch 600` | A tạo phòng → B vào → A, B online → sẵn sàng → nhớ MATCH. Cần đã `qa login A`, `qa login B` và cài `qsock` (§5.5). A = ĐỎ, B = ĐEN |
| Dọn để làm ván mới | `qa cleanup` rồi `qa quickmatch 600` | Tắt kết nối nền + đưa mọi người ra khỏi phòng bằng SQL (chỉ dựng dữ liệu) |
| Giữ ai đó online / cho offline | `qa online S1` · `qa offline B` · `qa log B` | Chạy `qsock` nghe phòng ở nền; `qa log` xem sự kiện người đó nhận |
| Tạo phòng | `qa room-create A PUBLIC 600 'Phòng 1'` | Chế độ `PUBLIC`/`CODE_ONLY`/`LOCKED`; thời gian 0/300/600/900 giây. Tự nhớ ROOM |
| Xem phòng / thành viên | `qa room A` · `qa members` | `members` đọc DB: username, role, side, ready |
| Vào phòng | `qa join S1 WATCH` · `qa join B PLAY inv` · `qa join B PLAY code` · `qa join C WATCH code:ABCD2345` | Nguồn: bỏ trống = mã phòng; `code`/`token`/`inv` = cái vừa tạo |
| Sẵn sàng / đổi bên | `qa ready A yes` · `qa swap A` · `qa swap-respond B yes` | Tự đọc membershipId, revision |
| Rời / cài đặt phòng / đuổi | `qa leave B` · `qa leave B resign` · `qa room-set A '{"visibility":"LOCKED"}'` · `qa kick A S1` | |
| Mã / link / mời | `qa code A PLAY` · `qa link A WATCH` · `qa rotate-watch A` · `qa invite A B PLAY` · `qa inv-respond B yes` · `qa inbox B` | |
| Dựng lời mời bằng SQL | `qa grant A B PLAY` | **Chỉ** khi API mời (TK08.4.2) chưa có |
| Chơi với máy | `qa ai-new A HARD BLACK 300` · `qa undo-ai A` · `qa snap` | Tạo ván xong nhớ MATCH; đi nước bằng `qa move A …` |
| Camera / micro | `qa media A OPPONENT_ONLY OFF` · `qa media-get S1` · `qa media-token S1 CAMERA` | Mức: `OFF`, `OPPONENT_ONLY`, `OPPONENT_AND_SPECTATORS`. `media-token` **không in token** (chỉ phòng + quyền) |
| Chat | `qa chat A ROOM 'Xin chào'` · `qa chat A PLAYERS 'Riêng'` · `qa chat-hist S1 ROOM` | Tự lấy kênh của phòng đang chọn. Gửi lại đúng 1 tin: `M=$(qa cid); QA_MSGID=$M qa chat A ROOM 'x'` (2 lần) |
| Lấy user id | `qa uid B` | Đọc DB theo username |
| Đổi tên hiển thị | `qa rename A 'Nguyễn Văn Á'` | |
| Tìm người dùng | `qa search A min` | Tự mã hoá ký tự đặc biệt (`%`, `'`…) |
| Bạn bè | `qa friends A` · `qa friend-add A B` · `qa friend-respond B yes` · `qa friend-cancel A` · `qa unfriend A B` | `friend-add` nhớ mã lời mời vừa gửi |
| Chạy câu SQL | `qa sql "select status from matches"` | Chỉ nên `select` |
| Lấy **một giá trị** SQL gán vào biến | `CTX=$(qa val "select current_chat_context_id from rooms where id='$(qa get ROOM)'")` | In đúng giá trị, không kẻ bảng |
| Gửi lại **đúng** một lệnh | `CID=$(qa cid)` rồi `QA_CID=$CID qa resign A` hai lần | Kiểm chống gửi trùng |
| Gửi request bất kỳ | `qa raw A GET /history` · `qa raw - GET /history` | `-` = không gửi token |

**Giả mạo = dùng lệnh của người chơi nhưng đăng nhập bằng người khác.** Ví dụ người xem S1 đầu hàng thay người chơi: `qa resign S1`.

### 5.3 Đọc kết quả

Mỗi lệnh in JSON trả về, và dòng cuối là mã HTTP:
```text
$ qa resign S1
{
  "ok": false,
  "error": { "code": "FORBIDDEN", "message": "Bạn không có quyền thực hiện thao tác này" },
  "requestId": "3f1c…"
}
→ HTTP 403
```
- Dòng `→ HTTP …` được in ra kênh lỗi (stderr) nên vẫn hiện trên màn hình, nhưng **không** lẫn vào JSON ⇒ nối thẳng sang `jq` được, ví dụ `qa hist A | jq '.data.items | length'`.
- `"ok": true` ⇒ máy chủ chấp nhận; dữ liệu nằm trong `"data"`.
- `"ok": false` ⇒ bị từ chối; **so `error.code`** với cột "Mong đợi" trong Task. `message` là câu tiếng Việt, có thể khác chút ít.

| `error.code` | Nghĩa |
|---|---|
| `VALIDATION_ERROR` | Dữ liệu gửi lên sai định dạng, thiếu trường hoặc có **trường thừa** |
| `UNAUTHENTICATED` | Chưa đăng nhập / token sai / phiên đã bị thu hồi |
| `FORBIDDEN` | Đăng nhập rồi nhưng **không có quyền** làm việc này |
| `MATCH_ENDED` | Ván đã kết thúc, không nhận lệnh nữa |
| `VERSION_CONFLICT` | `expectedVersion` đã cũ (ván vừa thay đổi) |
| `PROPOSAL_PENDING` | Đã có một đề nghị đang chờ |
| `PROPOSAL_EXPIRED` | Đề nghị đã hết hạn / không còn chờ |
| `CONFLICT` | Lệnh nhắm vào trạng thái đã không còn (ví dụ tái đấu cho ván cũ) |
| `ROOM_CLOSED` | Phòng đã đóng |
| `RATE_LIMITED` | Gửi quá nhanh |

Số HTTP đi kèm mỗi `code` theo bảng ánh xạ trong `packages/contracts/src/errors.ts` (TK03.1.2). Chụp **cả** JSON lẫn dòng `→ HTTP` làm bằng chứng. `code` đúng mà số HTTP khác bảng ⇒ FAIL mức Low.

### 5.4 Khi `qa` báo lỗi
| Thấy | Làm |
|---|---|
| `✗ Chưa đăng nhập A` | `qa login A` |
| `✗ Chưa có MATCH` | `qa use-match` |
| `✗ Không gọi được máy chủ` | Server chưa chạy ⇒ `pnpm dev` |
| `Đăng nhập tester_a thất bại` | Tài khoản chưa đăng ký hoặc chưa xác minh email (§3) |
| `Không đọc được version` | A không ở trong phòng ⇒ `QA_SNAP_AS=B qa …` |
| Lệnh trả `404` với đường dẫn lạ | Đối chiếu [Hợp đồng API & sự kiện](06-HOP-DONG-API-SU-KIEN.md). Code khác bảng ⇒ Bug cho Dev (hoặc Dev phải cập nhật bảng + `qa.sh` cùng PR); tạm thời gửi bằng `qa raw` |

### 5.5 Gửi lệnh qua Socket.IO — công cụ `qsock`

Máy chủ có **2 cổng vào**: HTTP và [Socket.IO](05-TU-DIEN-KY-THUAT.md#socket). Cả hai phải chặn giả mạo như nhau, nên một số Task yêu cầu thử cả cổng socket.

**Cài (1 lần):**
```bash
mkdir -p ~/qa-tools && cp Jira/tools/sock.mjs ~/qa-tools/
cd ~/qa-tools && npm init -y >/dev/null && npm i socket.io-client@4 >/dev/null && cd -
echo "alias qsock='node ~/qa-tools/sock.mjs'" >> ~/.zshrc && source ~/.zshrc
```
**Dùng** (dùng chung token và ván đang chọn với `qa` — nhớ `qa login …` và `qa use-match` trước):

| Muốn | Gõ |
|---|---|
| Người xem S1 đầu hàng qua socket | `qsock S1 match.resign` |
| A xin hoà qua socket | `qsock A match.propose '{"kind":"DRAW"}'` |
| B đồng ý đề nghị vừa tạo | `qsock B match.respondProposal '{"accept":true}'` |
| Thêm trường thừa để thử giả mạo | `qsock S1 match.resign '{"side":"RED"}'` |
| **Nghe** mọi sự kiện máy chủ đẩy tới B (in kèm giờ) | `qsock B --listen` (Ctrl+C để dừng) · `qsock B --listen 40` (tự dừng sau 40 giây) |
| Nghe sau khi **đăng ký** một kênh (sảnh, phòng) | `qsock B --listen 0 lobby.subscribe` · `qsock S1 --listen 0 room.subscribe` (tự thêm `roomId` đang chọn) — `0` = không giới hạn thời gian |
| Thử kết nối **giả mạo** | `QA_TOKEN=none qsock A --listen 5` (không token) · `QA_TOKEN="$(qa get token_A)x" qsock A --listen 5` (sửa chữ ký) · `QA_WEB_ORIGIN=https://evil.example qsock A --listen 5` (Origin lạ) |

Ví dụ output khi nghe:
```
· 14:02:10 B đã kết nối, đang nghe (Ctrl+C để dừng)…
14:02:15  presence.changed  {"userId":"3f1c…","online":true}
```
Mẹo: mở **mỗi người một cửa sổ terminal** nghe (`qsock B --listen`, `qsock C --listen`) rồi thao tác ở cửa sổ khác — nhìn được ai nhận, ai không.

`qsock` tự thêm `matchId`, `commandId`, `expectedVersion`, `proposalId`. Kết quả in ra là **ack** — cùng dạng `{"ok": …}` như HTTP. `✗ CONNECT_ERROR` = server chưa chạy hoặc token hết hạn (chạy lại `qa login`).

> Công cụ `qa` gọi các đường dẫn API **đề xuất** trong Task (🟡). Nếu Dev đổi đường dẫn thì Dev sửa luôn `Jira/tools/qa.sh` trong cùng PR.

## 6. XEM CƠ SỞ DỮ LIỆU

**Cách 1 — giao diện (dễ):** http://127.0.0.1:54323 → *Table Editor* để xem bảng, *SQL Editor* để chạy câu truy vấn.

**Cách 2 — terminal:**
```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
# trong psql:
select id, status, outcome_reason, outcome_winner, version from matches order by started_at desc limit 3;
\q
```

Chỉ **đọc** (`select`). ⛔ Không tự `update`/`delete` dữ liệu trong lúc kiểm, trừ khi Task ghi rõ cần sửa tay để tạo tình huống.

---

## 7. CHẠY TEST TỰ ĐỘNG

Dev viết test tự động trong thư mục `tests/`. Tester chạy lại để xác nhận chúng **thật sự xanh trên máy mình**, không chỉ trên máy Dev.

| Lệnh | Chạy gì | Cần gì đang chạy |
|---|---|---|
| `pnpm test:unit` | Test hàm thuần (luật cờ, đồng hồ…) | Không cần gì |
| `pnpm test:integration` | Test máy chủ + DB thật | `pnpm db:start` |
| `pnpm test:e2e` | Test mở trình duyệt thật, bấm như người dùng | `pnpm db:start` (Playwright tự bật app theo cấu hình) |
| `pnpm test:media` | Test camera/mic thật | LiveKit local |
| `pnpm test:ai` | Đo tốc độ máy cờ | Không cần gì |
| `pnpm test:load` | Thử tải | Máy thử tải |

**Chạy riêng một file:** thêm `-- <đường dẫn>`, ví dụ `pnpm test:integration -- tests/integration/issue-104.test.ts`.

**Đọc kết quả** — cuối output có dòng tổng kết, ví dụ:
```
 Test Files  1 passed (1)
      Tests  12 passed | 0 failed | 0 skipped (12)
```
- `failed` phải là **0**.
- `skipped` phải là **0** — có test bị bỏ qua ⇒ **FAIL** (luật dự án cấm bỏ qua test).
- Số `Tests` phải **≥** số test Task yêu cầu. Ít hơn ⇒ Dev chưa viết đủ ⇒ FAIL.
- Chụp màn hình dòng tổng kết làm bằng chứng.

**Kiểm test có thật không (không chỉ tin con số):** mở file test, tìm tên test có ID Task yêu cầu (ví dụ `T104-08`). Đọc lướt xem test có đúng làm điều mô tả không. Test tên "đầu hàng và hết giờ đồng thời" mà bên trong chỉ gửi một lệnh ⇒ FAIL.

---

## 8. "ĐỒNG HỒ GIẢ" LÀ GÌ VÀ TESTER KIỂM CA THỜI GIAN THẾ NÀO

Nhiều luật phụ thuộc thời gian: đề nghị hết hạn **30 giây**, phòng tự đóng sau **10 phút**, ân hạn mất mạng **60 giây**, chống treo ván **3 phút**. Chờ thật thì test chậm và không chính xác tới từng mili-giây.

Vì vậy máy chủ **không gọi giờ hệ thống trực tiếp**, mà hỏi giờ từ một đối tượng `Clock` được "tiêm" vào. Trong test tự động, Dev thay bằng `TestClock` — một đồng hồ **giả**, có thể:
- `advance(30000)`: tua nhanh 30 giây trong nháy mắt.
- `runDueTasks()`: chạy các việc hẹn giờ đã tới hạn.

**Hệ quả cho Tester:** trên app đang chạy thật (`pnpm dev`) **không** tua được đồng hồ. Vì thế ca thời gian được kiểm bằng **hai cách**, Task sẽ ghi rõ dùng cách nào:

| Cách | Làm gì | Dùng khi |
|---|---|---|
| **Cách T (test tự động)** | Chạy file test tự động Task chỉ định + mở file test đọc xem có đúng các mốc biên (ví dụ `29999 ms`, `30000 ms`, `30001 ms`) | Mốc chính xác tới mili-giây, mốc dài (10 phút+), tình huống đồng thời |
| **Cách M (tay, giờ thật)** | Làm trên app thật, dùng đồng hồ bấm giờ điện thoại | Mốc ngắn (30 giây, 60 giây) — để xác nhận **giao diện** hiển thị và tự cập nhật đúng |

---

## 9. KIỂM "ĐỒNG THỜI" (race condition) LÀ GÌ

Ví dụ: A bấm "Đầu hàng" đúng lúc đồng hồ của A hết giờ. Máy chủ phải cho ra **đúng một kết quả** (hoặc thua vì đầu hàng, hoặc thua vì hết giờ), **không bao giờ** hai kết quả, không bao giờ lỗi 500.

Tay người **không** bấm đủ đồng thời để tạo tình huống này một cách chắc chắn. Nên ca "đồng thời" luôn kiểm bằng **Cách T**: Dev viết test dùng **rào đồng bộ** (`withBarrier`) và **2 kết nối DB riêng**. Tester:
1. Chạy file test.
2. Mở file test, xác nhận test có dùng `withBarrier` (hoặc tương đương) và **2** kết nối — không chỉ `Promise.all` đơn thuần.
3. Xác nhận test có kiểm **số dòng trong DB** (ví dụ "chỉ 1 sự kiện kết thúc"), không chỉ kiểm mã HTTP.

---

## 10. KHI CÓ LỖI — TẠO BUG

**Summary:** `[BUG][<vai trò sửa: BE/FE/AI/OPS/DS>] <mô tả ngắn> (từ TKxx.y.z)`
Ví dụ: `[BUG][BE] Người xem gửi lệnh đầu hàng vẫn được chấp nhận (từ TK12.1.1)`

**Mẫu nội dung (copy):**
```
Ca kiểm thử: QA12.1.1-03
Môi trường: main @ <7 ký tự đầu mã commit>, macOS/Windows, Chrome <phiên bản>
Tiền điều kiện: <trạng thái trước khi làm, ví dụ: ván ACTIVE giữa A (ĐỎ) và B (ĐEN), S1 là người xem>
Các bước tái hiện:
  1. ...
  2. ...
Kết quả mong đợi: <chép từ Task>
Kết quả thực tế: <chính xác thấy gì, dán log / mã HTTP / câu chữ>
Bằng chứng: <đính kèm ảnh / file log>
Mức độ: Highest | High | Medium | Low
```

**Chọn mức độ:**
| Mức | Khi nào | Ví dụ |
|---|---|---|
| Highest | Lỗi bảo mật/quyền, mất dữ liệu, sai kết quả ván | Người xem đầu hàng thay người chơi được |
| High | Chức năng chính không chạy | Bấm "Đồng ý hoà" không có gì xảy ra |
| Medium | Chạy nhưng sai chi tiết | Đếm ngược hiển thị lệch 5 giây |
| Low | Chữ/giao diện | Sai chính tả, lệch 2px |

Link Bug với Task bằng quan hệ **Relates**. Kéo Task về **In Progress**, đổi Assignee về Dev.

---

## 11. GHI BÁO CÁO BẰNG CHỨNG

File: `docs/test-reports/<mã-task>.md` (ví dụ `docs/test-reports/TK12.1.1.md`). Ảnh để cạnh file, trong thư mục `docs/test-reports/img/<mã-task>/`.

**Mẫu (copy):**
```markdown
# Báo cáo kiểm thử TK12.1.1

- Người kiểm: <tên>
- Ngày: 2026-10-19
- Commit main: <mã commit>
- Môi trường: <hệ điều hành>, Node <v>, Chrome <v>

## Kết quả tổng
| Tổng ca | PASS | FAIL | Không chạy |
|---|---|---|---|
| 14 | 14 | 0 | 0 |

## Chi tiết từng ca
| ID | Kết quả | Bằng chứng | Ghi chú |
|---|---|---|---|
| QA12.1.1-01 | PASS | img/TK12.1.1/01-resign.png | |
| ... | | | |

## Test tự động
Lệnh: `pnpm test:integration -- tests/integration/issue-104.test.ts`
Kết quả: 12 passed | 0 failed | 0 skipped (dán nguyên dòng tổng kết)

## Bug đã tạo (nếu có)
- XW-123 (đã sửa, kiểm lại PASS ngày ...)
```

Cột "Không chạy" phải bằng **0** mới được Done.

---

## 12. BẢNG TỪ CẦN NHỚ

| Từ | Nghĩa |
|---|---|
| **PLAYER** / người chơi | Người ngồi một trong 2 ghế chơi, được đi cờ |
| **SPECTATOR** / người xem | Thành viên phòng chỉ xem, tối đa 5 |
| **PLAY / WATCH** | **Loại mã/link mời**: mã PLAY để vào chơi, mã WATCH để vào xem. ⚠ WATCH **không** phải vai trò |
| **Host** / chủ phòng | Người tạo phòng, mặc định cầm ĐỎ |
| **Match** / ván | Một ván cờ. Tái đấu tạo **ván mới** |
| **Room** / phòng | Nơi chứa người; sống lâu hơn ván |
| **version** | Số tăng mỗi khi trạng thái ván thay đổi. Chỉ tăng, không bao giờ giảm |
| **ply** / nửa nước | Mỗi lần **một bên** đi = 1 nửa nước. ĐỎ đi + ĐEN đáp = 2 nửa nước |
| **commandId** | Mã duy nhất mỗi lệnh; gửi lại cùng mã ⇒ máy chủ trả kết quả cũ, không làm lại |
| **ACTIVE / FINISHED / INTERRUPTED** | Ván đang chơi / đã kết thúc có kết quả / bị gián đoạn (không ai thắng) |
| **Toạ độ** | `(x, y)`, x 0–8 trái→phải, y 0–9 **trên→dưới**. ĐEN ở trên (y=0), ĐỎ ở dưới (y=9). ĐỎ đi trước. Ví dụ: Xe ĐỎ góc trái dưới = `(0,9)`, Pháo ĐỎ trái = `(1,7)`, Tướng ĐEN = `(4,0)`. Người cầm ĐEN thấy bàn lật nhưng toạ độ **không đổi** |

---

## 13. KIỂM THỬ TASK THIẾT KẾ (Design — `[DS]`)

Task thiết kế không có code, nên **"Ready for Test"** nghĩa là: người thiết kế đã
1. chia sẻ **link Figma** (quyền *can view* cho cả nhóm) trong comment Jira,
2. đính **ảnh PNG** mọi frame vào Task (Attachment),
3. dán **bảng chữ** (mọi câu thông báo chính xác từng chữ) vào comment.

### 13.1 Công cụ
| Việc | Làm thế nào |
|---|---|
| Xem mã màu, khoảng cách, cỡ chữ | Mở link Figma → chọn một lớp (layer) → bảng bên phải tab **Inspect** (hoặc **Dev Mode**) hiện mã màu `#…`, `padding`, `gap`, `font-size`, kích thước |
| Đo khoảng cách giữa 2 lớp | Chọn lớp 1 → giữ **Alt** (Option trên Mac) → rê chuột lên lớp 2 ⇒ Figma hiện số px màu đỏ |
| Đo tương phản chữ/nền | Mở https://webaim.org/resources/contrastchecker/ → dán mã màu chữ vào *Foreground*, mã nền vào *Background* → đọc **Contrast Ratio** và các ô *WCAG AA: Pass/Fail* |
| Xem như người mù màu / ảnh đen trắng | Mở ảnh PNG trong Chrome → F12 → nút ⋮ → *More tools* → **Rendering** → *Emulate vision deficiencies* → chọn **Achromatopsia** (đen trắng), **Protanopia**, **Deuteranopia** |
| Xem kích thước frame | Chọn frame → góc phải trên bảng thuộc tính có `W` × `H` |

### 13.2 Ngưỡng tương phản (WCAG 2.1 AA — `DEC-024`)
| Loại | Ngưỡng tối thiểu |
|---|---|
| Chữ thường (< 24 px, hoặc < 18,66 px đậm) | **4,5 : 1** |
| Chữ lớn (≥ 24 px, hoặc ≥ 18,66 px đậm) | **3 : 1** |
| Đồ hoạ cần thiết để hiểu (viền nút, biểu tượng, quân cờ, viền tiêu điểm) | **3 : 1** |

### 13.3 Năm trạng thái bắt buộc mỗi màn
**Đang tải** (khung xương, không trắng trơn) · **Trống** (giải thích vì sao + gợi ý hành động) · **Lỗi** (nói rõ + nút *Thử lại*) · **Vô hiệu** (phải có câu giải thích vì sao) · **Thành công**. Trạng thái nào không áp dụng cho một màn thì thiết kế phải ghi *"Không áp dụng vì …"*.

### 13.4 Bằng chứng
Báo cáo `docs/test-reports/<mã-task>.md` gồm bảng ca PASS/FAIL, ảnh chụp chỗ đo (Inspect, WebAIM), ảnh giả lập mù màu. Bug thiết kế: `[BUG][DS] … (từ TKxx.y.z)`, đính ảnh khoanh vùng lỗi.

---

## 14. TESTER VIẾT TEST PHỤ (`tests/unit/qa/`)

Với phần **luật cờ, AI, contracts** (hàm thuần, không giao diện), cách kiểm nhanh và chắc nhất là Tester **tự viết một file test nhỏ** với đáp án **đếm tay** — độc lập với test của Dev.

### 14.1 Mẫu file (copy rồi sửa)
```ts
// tests/unit/qa/qa-TK03.2.2.test.ts   ← đặt tên theo mã Task
import { describe, it, expect } from 'vitest';
import { makePosition } from '../../fixtures/positions';
import { pawnMoves } from '@xiangqi/game-rules';            // hàm cần kiểm (tên theo Task)

// so 2 danh sách ô KHÔNG phụ thuộc thứ tự
const toSet = (moves: { to: { x: number; y: number } }[]) => new Set(moves.map((m) => `${m.to.x},${m.to.y}`));

describe('QA TK03.2.2', () => {
  it('QA03.2.2-07 Tốt ĐỎ (4,5) chưa qua sông chỉ tiến', () => {
    const pos = makePosition([
      { type: 'GENERAL', side: 'BLACK', x: 4, y: 0 },
      { type: 'GENERAL', side: 'RED',   x: 3, y: 9 },
      { type: 'PAWN',    side: 'RED',   x: 4, y: 5 },
    ], 'RED');
    expect(toSet(pawnMoves(pos.board, { x: 4, y: 5 }))).toEqual(new Set(['4,4']));
  });
});
```
Chạy: `pnpm test:unit -- tests/unit/qa/qa-TK03.2.2.test.ts`

### 14.2 Quy tắc
- Đáp án phải **tự suy ra bằng tay** (vẽ ra giấy nếu cần) — **không** chạy hàm rồi chép kết quả làm đáp án.
- Mọi thế cờ dựng bằng `makePosition` và **có đủ 2 tướng**; đặt hai tướng **khác cột** hoặc có quân chắn, để luật "tướng đối mặt" không làm lệch kết quả (trừ khi ca đang kiểm đúng luật đó).
- Toạ độ: x 0–8 trái→phải, y 0–9 **trên→dưới**; **ĐEN ở trên (y=0), ĐỎ ở dưới (y=9)**.
- File test phụ **được commit** (nhánh `qa/XW-<số>-ten-ngan`, mở PR riêng) để làm test hồi quy về sau.
- Ca "thử phá" (sửa tạm code của Dev để xem test đỏ) làm trên nhánh tạm, **không** commit, xong `git checkout .`.

---

## 15. KIỂM MIGRATION / RÀNG BUỘC DB BẰNG SQL

Dùng cho các Task tạo bảng (EP05) và mọi ca "kiểm DB chặn dữ liệu sai".

### 15.1 Kết nối
```bash
# quyền quản trị — CHỈ để dựng dữ liệu thử
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
# quyền máy chủ thật (app_server) — để kiểm phân quyền (mật khẩu theo README/.env)
psql "$DATABASE_URL"
```
Trong `psql`, bật hiện **mã lỗi**: `\set VERBOSITY verbose` ⇒ lỗi in dạng `ERROR:  23514: new row … violates check constraint "…"`.

| Mã SQLSTATE | Nghĩa |
|---|---|
| `23514` | Vi phạm **CHECK** (giá trị không hợp lệ) |
| `23505` | Vi phạm **UNIQUE** (trùng) |
| `23503` | Vi phạm **khoá ngoại** (trỏ tới dòng không có / xoá dòng đang được trỏ) |
| `23502` | Cột **NOT NULL** bị để trống |
| `42501` | **Không có quyền** (permission denied) |

### 15.2 Thử mà không làm bẩn dữ liệu
```sql
BEGIN;
  INSERT INTO rooms (…) VALUES (…);     -- thử
  -- xem lỗi / xem kết quả
ROLLBACK;                               -- huỷ mọi thứ vừa làm
```
Lỗi xảy ra giữa `BEGIN` thì mọi lệnh sau bị bỏ ⇒ gõ `ROLLBACK;` rồi làm lại. Lỡ làm bẩn ⇒ `pnpm db:reset` (xoá sạch, áp lại migration).

### 15.3 Tạo user Supabase Auth để thử
**Cách 1 (giao diện):** Studio http://127.0.0.1:54323 → *Authentication* → *Add user* → nhập email + mật khẩu, tick *Auto confirm*.
**Cách 2 (lệnh, có metadata):**
```bash
SECRET=<secret key lấy từ pnpm db:status>
curl -s -X POST http://127.0.0.1:54321/auth/v1/admin/users \
  -H "apikey: $SECRET" -H "Authorization: Bearer $SECRET" -H 'Content-Type: application/json' \
  -d '{"email":"alice@test.local","password":"Test@12345","email_confirm":true,
       "user_metadata":{"signup_username":"alice","signup_display_name":"Alice"}}' | jq '{id, email}'
```

### 15.4 Sinh nhiều dòng để kiểm index (`EXPLAIN`)
```sql
-- ví dụ 1000 phòng trộn trạng thái (sửa tên cột theo migration thật)
INSERT INTO rooms (id, name, owner_id, visibility, status, room_version, time_control, created_at)
SELECT gen_random_uuid(), 'P'||g, '<user_id có sẵn>',
       (ARRAY['PUBLIC','CODE_ONLY','LOCKED'])[1 + g % 3],
       (ARRAY['WAITING','PLAYING','FINISHED','CLOSED'])[1 + g % 4],
       0, 0, now() - (g || ' minutes')::interval
FROM generate_series(1, 1000) g;
ANALYZE rooms;                          -- cập nhật thống kê để planner chọn index
EXPLAIN SELECT … ;                      -- tìm dòng có "Index Scan" / "Bitmap Index Scan"
```

### 15.5 Xem cấu trúc bảng, ràng buộc, index
```sql
\d+ rooms                                                        -- cột, CHECK, index, FK của bảng
SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'public.rooms'::regclass;
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'rooms';
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';   -- RLS bật chưa
```
