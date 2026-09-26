# 04 — SỔ TAY KIỂM THỬ CHO TESTER (đọc 1 lần trước khi nhận Task đầu tiên)

**Dành cho:** thành viên vai trò Tester (và cả Dev muốn tự kiểm) · **Cập nhật:** 2026-09-27

> Sổ tay này giải thích **những việc lặp lại ở mọi Task**: dựng môi trường, tạo tài khoản test, mở nhiều người chơi cùng lúc, gửi request "giả mạo", xem cơ sở dữ liệu, chạy test tự động, ghi bằng chứng, tạo Bug.
> Gặp từ kỹ thuật khó (transaction, khoá dòng, race condition…) ⇒ tra [Từ điển kỹ thuật](05-TU-DIEN-KY-THUAT.md).
> Mỗi Task vẫn ghi **đầy đủ các bước riêng của nó** ngay trong Task. Sổ tay chỉ để bạn không phải học lại cách mở terminal hay cách lấy token ở mỗi Task.

---

## 0. TESTER LÀM GÌ TRONG DỰ ÁN NÀY

1. Dev làm xong Task → mở PR → PR được review → CI xanh → merge vào `main` → Dev kéo Task sang **Ready For Test** và đổi Assignee sang bạn. Dev ghi comment trên Jira: link PR + cách chạy thử.
2. Bạn **lấy code mới nhất** của `main`, dựng môi trường, làm **đủ mọi ca** trong mục **🧪 Kiểm thử khi Ready for Test** của Task.
3. Mỗi ca bạn ghi: **PASS** hoặc **FAIL**, kèm **bằng chứng** (ảnh chụp, log terminal, kết quả truy vấn DB).
4. Tất cả PASS → ghi báo cáo `docs/test-reports/<mã-task>.md` → kéo Task sang **Done** → log work số giờ kiểm.
5. Có ca FAIL → tạo **Bug** (mục 10) → kéo Task về **In Progress** → đổi Assignee về Dev. Dev sửa xong kéo lại Ready For Test → bạn **kiểm lại TOÀN BỘ ca**, không chỉ ca đã FAIL (vì sửa chỗ này có thể làm hỏng chỗ khác).

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
git checkout main
git pull                         # lấy code mới nhất, có PR của Dev vừa merge
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
| Phiếu tái đấu | `qa rematch A yes` | |
| Lịch sử / xem lại | `qa hist A` · `qa replay A <mã ván>` | |
| Chạy câu SQL | `qa sql "select status from matches"` | Chỉ nên `select` |
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
| Lệnh trả `404` với đường dẫn lạ | Dev đặt đường dẫn khác đề xuất ⇒ xem comment PR, gửi bằng `qa raw` và báo Dev cập nhật Task |

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
