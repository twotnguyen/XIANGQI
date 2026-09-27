# AGENTS.md — Hướng dẫn cho AI agent

**Dự án:** Cờ Tướng Online · **Cập nhật:** 2026-09-27 · **Áp dụng cho:** mọi AI agent đọc, viết mã, viết test hoặc sửa tài liệu trong kho này.

Đọc hết file này trước khi sửa bất kỳ file nào. Các luật dưới đây đều sinh ra từ lỗi đã thật sự xảy ra ở lần xây trước (`docs/99-archive/reviews-v1/`).

---

## 0. Tóm tắt

```
① Kho CHƯA CÓ MÃ NGUỒN. Có: đặc tả (docs/), kế hoạch Jira (Jira/), trang tài liệu (site/)
② Đơn vị công việc = một Jira Task TKxx.y.z (Key XW-…). Một Task = một nhánh = một PR
③ Đặc tả là LUẬT. Thấy mâu thuẫn hoặc sai ⇒ DỪNG, báo người dùng. Không tự đổi yêu cầu
④ Viết test trước. Test phải bắt được lỗi mục tiêu
⑤ Không hạ ngưỡng để báo đạt. Ghi số thật
```

---

## 1. Nguồn thông tin và thứ tự ưu tiên

| Ưu tiên | Nguồn | Vai trò |
|---|---|---|
| 1 | Yêu cầu trực tiếp của người dùng trong phiên làm việc | Cao nhất |
| 2 | File này (`AGENTS.md`) | Luật làm việc |
| 3 | `docs/` — đặc tả: `01-requirements`, `04-business-rules`, `05-data-and-realtime`, `07-decisions`, `09-technical`, `10-issues/ISSUE-NNN.md` | **Cái gì** phải đúng. Là luật |
| 4 | `Jira/task/TKxx.y.z-….md` | **Làm thế nào**: file, bước, bẫy, ca kiểm thử. Cụ thể hoá đặc tả, không thay đặc tả |
| 5 | `Jira/06-HOP-DONG-API-SU-KIEN.md` | Chốt đường dẫn HTTP và tên sự kiện Socket.IO |

- Task và đặc tả mâu thuẫn ⇒ **dừng**, báo người dùng: trích hai chỗ, nêu tác động. Không tự chọn bên.
- Chi tiết đánh dấu 🟡 trong Task là **đề xuất**: được đổi, nhưng phải sửa lại chính file Task đó (và `Jira/tools/qa.sh` nếu liên quan) trong cùng PR, ghi rõ lý do trong mô tả PR.
- Thêm/đổi endpoint hoặc sự kiện realtime ⇒ cập nhật `Jira/06-HOP-DONG-API-SU-KIEN.md` cùng PR.
- `docs/99-archive/` là lịch sử: ⛔ không dùng làm căn cứ, ⛔ không xoá, không sửa.
- Mỗi luật chỉ định nghĩa ở **một** chỗ. Thấy cùng một luật ghi khác nhau ở hai nơi ⇒ báo.
- `docs/01-requirements/` nói **cái gì**, `docs/09-technical/` nói **bằng gì**. Thấy tên thư viện trong `01-` ⇒ lỗi tài liệu, báo.

---

## 2. Bắt buộc đọc trước khi viết dòng mã đầu tiên

| # | File | Vì sao |
|---|---|---|
| 1 | [docs/00-overview/glossary.md](docs/00-overview/glossary.md) | Dùng sai thuật ngữ là lỗi (`SPECTATOR` ≠ `WATCH`) |
| 2 | [docs/04-business-rules/game-rules.md](docs/04-business-rules/game-rules.md) §1 | Hệ toạ độ — xem §4 dưới đây |
| 3 | [docs/09-technical/tech-stack.md](docs/09-technical/tech-stack.md) §3 | Ranh giới Prisma / SQL thuần — xem §6 |
| 4 | [docs/09-technical/architecture.md](docs/09-technical/architecture.md) | Máy chủ quyết định, thứ tự khoá, tiến trình AI |
| 5 | [docs/10-issues/TEST-CONVENTIONS.md](docs/10-issues/TEST-CONVENTIONS.md) | Fixture, oracle, đặt tên test, lane |
| 6 | [Jira/00-CAU-HINH-JIRA.md](Jira/00-CAU-HINH-JIRA.md) §10 | Trạng thái Task, Ready for Test, Done |

Mỗi lần nhận Task: đọc thêm file Task, các `ISSUE-NNN.md` mà Task truy về (nhãn `src-NNN`, cột "Nguồn" trong [Jira/03-TRUY-VET.md](Jira/03-TRUY-VET.md)), và đúng các mục "ĐỌC TRƯỚC" của những issue đó. Không cần đọc cả 138 issue.

---

## 3. Nhận một Task

1. Người dùng giao Task theo mã `TKxx.y.z` hoặc Key `XW-…`. Tra [Jira/03-TRUY-VET.md](Jira/03-TRUY-VET.md) để ra file Task, Story, Epic và issue nguồn.
2. Không được giao việc cụ thể ⇒ hỏi người dùng. Không tự chọn Task.
3. Kiểm **Is blocked by** trong bảng đầu file Task:
   - Mã có hậu tố `(Done)` ⇒ Task đó phải **Done** (Tester đã PASS).
   - Mã không hậu tố ⇒ Task đó phải tới **Ready For Test** (PR đã merge `main`).
   - Chưa đủ ⇒ ⛔ **dừng**, báo người dùng Task nào đang chặn.
4. Mỗi Task chỉ **một** vai trò (tiền tố `[BE]` `[FE]` `[AI]` `[DS]` `[OPS]` `[QA]`). Không làm lấn sang phạm vi Task khác; mục "❌ Không làm" trong Task là ranh giới.

---

## 4. ⭐ Hệ toạ độ — sai chỗ này là sai toàn bộ

```
ĐEN ở TRÊN (y = 0) · ĐỎ ở DƯỚI (y = 9) · y tăng từ trên xuống · ĐỎ đi trước
```

| Mục | Quy ước |
|---|---|
| Ký hiệu | `(x, y)`, đếm từ 0 |
| `x` | 0 → 8, trái sang phải (9 cột) |
| `y` | 0 → 9, trên xuống dưới (10 hàng) |
| Sông | Giữa `y = 4` và `y = 5` |
| Cung ĐEN / ĐỎ | `x` 3–5, `y` 0–2 / `x` 3–5, `y` 7–9 |
| Tốt đã qua sông | ĐỎ: `y ≤ 4` · ĐEN: `y ≥ 5` |
| Chỉ số mảng | `y * 9 + x`, mảng đúng 90 phần tử |

`GR-COORD-01`: người cầm quân đen thấy bàn **lật ngược** — **chỉ là hiển thị**. Toạ độ gửi lên máy chủ luôn theo hệ trên, ⛔ không đổi theo góc nhìn. Mã lần trước đã đảo ngược hệ này; tài liệu nào ghi khác là tài liệu sai ⇒ báo.

---

## 5. Bảy luật tuyệt đối

Vi phạm bất kỳ luật nào ⇒ PR bị từ chối.

| # | Luật | Nghĩa cụ thể |
|---|---|---|
| 1 | **Máy chủ quyết định** | Client chỉ gửi ý định. ⛔ Không tin dữ liệu client gửi lên |
| 2 | **Không có quyền ⇒ không nhận dữ liệu** | Lọc ở máy chủ, ⛔ không gửi hết rồi ẩn ở giao diện |
| 3 | **Đường xử lý lệnh ván dùng SQL thuần** | `TECH-07` — xem §6 |
| 4 | **Máy cờ chạy tiến trình riêng** | `TECH-09` — Node một luồng; chạy chung = treo mọi ván 3 giây |
| 5 | **Test thời gian dùng đồng hồ giả tiêm vào** | ⛔ Không `sleep` thật, không `setTimeout` để chờ |
| 6 | **Test dữ liệu chạy trên PostgreSQL thật** | ⛔ Không mock. Thiếu DB ⇒ test phải **đỏ**, không được bỏ qua |
| 7 | **Không tự hạ tiêu chí** | Không đạt ⇒ ghi số thật + `BLOCKED`, ⛔ không sửa ngưỡng |

---

## 6. ⭐ `TECH-07` — Ranh giới Prisma / SQL thuần

```
Cần KHOÁ DÒNG, THỨ TỰ KHOÁ, hoặc ĐẾM-RỒI-GHI trong cùng transaction ⇒ SQL THUẦN
Còn lại ⇒ Prisma
```

| Prisma | SQL thuần |
|---|---|
| Hồ sơ, tên hiển thị | Đi một nước cờ |
| Bạn bè, lời mời kết bạn | Đầu hàng · xin hoà · xin đi lại |
| Lời mời phòng, mã, link | Nhận người vào phòng (đếm sức chứa) |
| Đọc lịch sử tin nhắn (có predicate quyền) | Bắt đầu ván (hai người sẵn sàng) |
| Đọc lịch sử ván | Gửi chat (khoá/kiểm membership rồi ghi, tuyến tính với thu hồi quyền) |
| Danh sách sảnh | Tái đấu (đổi bên) · mọi bộ đếm thời hạn kết thúc ván · đuổi người xem · thu hồi quyền |

- ⛔ **Không bao giờ chạy `prisma migrate`** — nó xoá RLS, CHECK và unique hoãn kiểm. Đổi schema **chỉ** bằng file `.sql` trong `supabase/migrations/` qua Supabase CLI. Prisma chỉ dùng `db pull` để sinh kiểu.
- Thứ tự khoá luôn là **phòng → người → ván**. Đảo thứ tự = deadlock.
- ⛔ Không giữ khoá khi gọi ra ngoài (`ARCH-07`): chờ máy cờ, LiveKit, email… phải nằm ngoài transaction.

---

## 7. Lệnh và cổng kiểm

### Bốn cổng bắt buộc trước khi mở PR

```bash
pnpm lint && pnpm typecheck && pnpm build && pnpm test:unit
```

Các lane được bật dần theo Task. Lane chưa có phải in `NOT_IMPLEMENTED — xem <Task>` và thoát mã 1. ⛔ Không tạo script xanh rỗng để giả cổng.

| Lane / cổng | Có từ Task |
|---|---|
| `install` · `build` · `typecheck` · `pnpm dev` + `/health` | TK01.1.1 |
| `lint` | TK01.1.2 |
| `test:unit` (từ đây đủ 4 cổng, exit 0) | TK01.1.3 |
| `test:e2e` | TK01.1.4 |
| `test:integration` (tối thiểu → harness đầy đủ) | TK01.2.2 → TK05.3.1 |
| `test:ai` | TK04.3.1 |
| `test:media` | TK14.1.2 |
| `test:load` | TK16.4.1 |

Chạy thêm tuỳ phần mã chạm tới: cơ sở dữ liệu ⇒ `test:integration`; giao diện ⇒ `test:e2e`; camera/mic ⇒ `test:media`; hiệu năng ⇒ `test:load`.

### Hai cổng chặn

| Cổng | Task | Điều kiện qua | Không đạt thì |
|---|---|---|---|
| Máy cờ | [TK04.3.1](Jira/task/TK04.3.1-corpus-hieu-nang-20-the-benchmark-cong-depth-lane-test-ai.md) | Độ sâu **6** trong **3000 ms**, p95 trên 20 thế × 5 lần lặp | ⛔ Không làm tiếp EP15. Tối ưu theo đúng thứ tự `TECH-08` |
| Media | [ST14.1](Jira/story/ST14.1-cong-media-livekit-local-do-byte-rtp-that.md) (TK14.1.1–14.1.3) | LiveKit local cho **byte RTP > 0** và **khung hình > 0** thật | ⛔ Không làm tiếp ST14.2–ST14.3 |

---

## 8. Quy trình một Task

```
① Đọc Task + issue nguồn + mục ĐỌC TRƯỚC           (§2, §3)
② Kiểm Is blocked by — chưa đủ thì DỪNG
③ git fetch; tạo nhánh từ main: issue/TKxx.y.z-ten-ngan
④ VIẾT TEST TRƯỚC theo test bắt buộc của issue và ca 🧪 của Task
⑤ Viết mã cho test xanh
⑥ Chạy các cổng đúng mốc (§7)
⑦ Làm mục "7. TỰ KIỂM TRƯỚC KHI CHUYỂN READY FOR TEST" trong Task
⑧ Cố tình làm hỏng mã, xác nhận test đỏ, rồi hoàn lại
⑨ Commit · push · mở PR
⑩ Báo người dùng: link PR, lệnh đã chạy + kết quả thật, việc còn thiếu
```

Agent **không** tự kéo Task trên Jira sang Done. Ready For Test chỉ sau khi PR đã review, CI xanh và đã merge; người dùng hoặc người làm Task sẽ chuyển trạng thái.

### Git

| Mục | Quy định |
|---|---|
| Nhánh | `issue/TKxx.y.z-ten-ngan`, ví dụ `issue/TK01.1.1-khoi-tao-monorepo`. Test phụ của Tester: `qa/TKxx.y.z-…` |
| Commit | `<loại>(<phạm vi>): <mô tả> [TKxx.y.z]` — loại: `feat` · `fix` · `test` · `docs` · `chore` · `refactor` |
| PR | Một Task = một PR vào `main`. Tiêu đề chứa `TKxx.y.z`; mô tả ghi Key `XW-…`, các `ISSUE-NNN` nguồn, lệnh đã chạy và kết quả |
| Trước khi push | Luôn `git fetch` và kiểm commit mới trên `main` |
| Xung đột merge | ⛔ Dừng, báo người dùng file/commit xung đột. Không tự giải quyết |
| Commit / push / PR | Chỉ khi người dùng yêu cầu hoặc Task yêu cầu rõ |
| Cấm | Force push · né CI (`--no-verify`, tắt job) · commit khoá bí mật |

Nếu dùng AI hỗ trợ, thêm dòng `Co-Authored-By:` của agent ở cuối commit theo quy ước của công cụ đang dùng.

### Bằng chứng

- Ghi vào đúng đường dẫn mục **Bằng chứng** của Task/issue (ví dụ `docs/test-reports/TKxx.y.z.md`, `docs/test-reports/ai/ISSUE-032.md`).
- Ghi **output thật** (dán chữ) và `exit=` của từng lệnh; số đo thật kèm máy/commit. Cột Skip phải là **0**.
- Khi mọi Task truy về một `ISSUE-NNN` đã Done, cập nhật trạng thái issue đó trong [docs/10-issues/INDEX.md](docs/10-issues/INDEX.md).

### Một Task được coi là xong khi

- [ ] Mọi ca trong mục 🧪 của Task và test bắt buộc của issue nguồn có test tương ứng, xanh
- [ ] Cổng theo mốc (§7) exit 0; 0 test bị bỏ qua
- [ ] Đã thử làm hỏng mã và test đỏ
- [ ] PR đã merge `main`, có bằng chứng theo mục trên

---

## 9. Luật viết test

| # | Luật |
|---|---|
| 1 | Thời gian: đồng hồ giả **tiêm vào**, ⛔ không `sleep` thật |
| 2 | Dữ liệu: PostgreSQL **thật**, ⛔ không mock |
| 3 | Tranh chấp: phải có **rào đồng bộ** + **2 kết nối riêng**, nếu không sẽ không tái hiện được |
| 4 | Quyền: phải **giả mạo dữ liệu gửi thẳng lên máy chủ**. Kiểm nút bị vô hiệu ở giao diện là chưa đủ |
| 5 | Media: đo **luồng dữ liệu thật** (byte RTP > 0), ⛔ không assert object tự tạo |
| 6 | ⛔ Cấm `.only`, cấm `.skip`, cấm test bị bỏ qua |
| 7 | ⭐ Test phải **bắt được lỗi mục tiêu**: làm hỏng mã ⇒ test phải đỏ |
| 8 | Test đỏ ⇒ sửa **mã**, ⛔ không sửa test cho dễ qua |

---

## 10. Khi gặp vấn đề

| Tình huống | Làm gì |
|---|---|
| Không đạt ngưỡng đo | Ghi **số thật** + `BLOCKED`, ⛔ không hạ ngưỡng |
| Thiếu tài nguyên ngoài (Google, LiveKit Cloud, SMTP, Render/Vercel…) | `BLOCKED_EXTERNAL`, ghi rõ thiếu gì và phần nào đã/chưa chứng minh. Xem [EXTERNAL-SETUP](docs/10-issues/EXTERNAL-SETUP.md). ⛔ Không thay bằng giả lập rồi báo đạt |
| Tài liệu sai hoặc mâu thuẫn | ⛔ Dừng, báo người dùng. Không tự đổi yêu cầu |
| Task bị chặn | ⛔ Dừng, báo Task đang chặn |
| Không hiểu yêu cầu | Hỏi. ⛔ Đừng đoán |
| Thiếu quyền (Git remote, Jira, dịch vụ) | Báo người dùng, không tìm cách vòng |

`BLOCKED_EXTERNAL` **không phải** Done (`AC-RULE-02`).

---

## 11. Thuật ngữ

| Dùng | ⛔ Không dùng |
|---|---|
| `PLAYER` / người chơi | đấu thủ, kỳ thủ |
| `SPECTATOR` / người xem | viewer, khán giả, observer |
| `AI` / máy | bot, engine, máy tính |
| Host / chủ phòng | owner, room master |

`SPECTATOR` là **vai trò** của thành viên trong phòng (cặp với `PLAYER`). `WATCH` là **loại quyền** của lời mời / mã / link (cặp với `PLAY`). Dùng mã `WATCH` vào phòng ⇒ trở thành `SPECTATOR`. ⛔ Không viết "vé SPECTATOR" hay "vai trò WATCH". Bảng đầy đủ: [glossary](docs/00-overview/glossary.md).

---

## 12. Cấu trúc thư mục đích

Hình thành dần qua các Task — ⛔ không tạo trước.

```
apps/
  web/src/          app/ (router, providers) · features/ · components/board/ · lib/ (api, socket, supabase) · styles/tokens.css
  server/src/       auth/ · modules/ · realtime/ (gateway, broadcast, presence) · db/ (pool, transaction, sql/)
  ai-worker/src/    main · supervisor · search-worker
packages/
  contracts/src/    kiểu + schema Zod dùng chung
  game-rules/src/   luật cờ thuần, KHÔNG phụ thuộc gì
  ai/src/           lượng giá · tìm kiếm
supabase/migrations/
tests/              fixtures/ · unit/ · integration/ · e2e/ · media/ · load/
```

---

## 13. Bản đồ tài liệu

| Cần gì | Vào đây |
|---|---|
| Chức năng hoạt động ra sao | `docs/01-requirements/` |
| Người dùng đi qua những bước nào | `docs/02-flows/` |
| Màn hình có gì, trạng thái nào | `docs/03-screens/` |
| Luật cờ · luật nghiệp vụ · ai được làm gì | `docs/04-business-rules/` |
| Dữ liệu và realtime | `docs/05-data-and-realtime/` |
| Thế nào là đạt | `docs/06-acceptance/` |
| Vì sao quyết định như vậy | `docs/07-decisions/decision-log.md` |
| Kiến trúc · công nghệ · triển khai | `docs/09-technical/` |
| Đặc tả từng đầu việc (ISSUE-NNN) | `docs/10-issues/` |
| Task được giao, cách làm, ca kiểm thử | `Jira/task/` · tra mã ở `Jira/03-TRUY-VET.md` |
| API HTTP và sự kiện Socket.IO | `Jira/06-HOP-DONG-API-SU-KIEN.md` |
| Cách Tester kiểm, công cụ `qa.sh` / `sock.mjs` | `Jira/04-HUONG-DAN-KIEM-THU.md`, `Jira/tools/` |
| Từ kỹ thuật | `Jira/05-TU-DIEN-KY-THUAT.md` |

Sửa file trong `docs/` ⇒ chạy `node site/build.mjs` để cập nhật trang tài liệu.

---

## 14. ⛔ Tuyệt đối không

```
⛔ Tự phát minh yêu cầu — không có trong docs/ ⇒ HỎI
⛔ Tự đổi yêu cầu khi thấy tài liệu sai ⇒ BÁO
⛔ Hạ ngưỡng đo để báo đạt
⛔ Thay tài nguyên ngoài bằng giả lập rồi báo Done
⛔ Chạy prisma migrate
⛔ Để máy cờ chạy chung tiến trình máy chủ
⛔ Commit khoá bí mật; đặt khoá bí mật vào biến VITE_* (mọi biến VITE_* đều CÔNG KHAI)
⛔ Xoá hoặc sửa docs/99-archive/
⛔ Force push, né CI
⛔ Dùng .only / .skip, để test bị bỏ qua
⛔ Làm Task khi Task chặn chưa tới trạng thái yêu cầu
⛔ Tự giải quyết xung đột merge
⛔ Thêm công nghệ ngoài bảng đã chốt (Redis, Tailwind, thư viện UI dựng sẵn…)
```

---

## 15. Nếu chỉ nhớ được một điều

> **Ghi số thật luôn tốt hơn báo cáo đẹp.**
> Một Task ghi `BLOCKED` kèm số đo thật thì có ích. Một Task ghi Done mà ngưỡng đã bị hạ thì gây hại — vì nó giấu vấn đề tới lúc không sửa được nữa.
