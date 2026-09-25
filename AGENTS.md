# AGENTS.md — LUẬT LÀM VIỆC CHO CODING AGENT

**Dự án:** Cờ Tướng Online · **Cập nhật:** 2026-09-21
**Áp dụng cho:** mọi agent viết mã trong kho này.

> Đọc **hết** file này trước khi chạm vào bất kỳ file nào. Mất 10 phút, tiết kiệm nhiều ngày sửa lỗi.

---

## 0. TÓM TẮT 60 GIÂY

```
① Kho này CHƯA CÓ MÃ NGUỒN. Chỉ có đặc tả trong docs/
② Mã được xây theo 138 đầu việc, THEO PHỤ THUỘC, trong docs/10-issues/
③ Một issue = một nhánh = một PR
④ Đặc tả là LUẬT. Thấy đặc tả sai ⇒ DỪNG, hỏi người dùng. KHÔNG tự sửa yêu cầu
⑤ Không tự hạ ngưỡng đo để báo đạt. Ghi số thật luôn tốt hơn
```

**Bắt đầu làm việc:** đọc [hướng dẫn bàn giao](docs/10-issues/AGENT-START-HERE.md), mở [docs/10-issues/INDEX.md](docs/10-issues/INDEX.md), chọn issue `TODO` đầu tiên có **mọi phụ thuộc đã `DONE`**, rồi mở file `ISSUE-NNN.md` đó ra làm theo.

---

## 1. BẮT BUỘC ĐỌC TRƯỚC KHI VIẾT DÒNG MÃ ĐẦU TIÊN

| # | File | Vì sao bắt buộc |
|---|---|---|
| 1 | [docs/00-overview/glossary.md](docs/00-overview/glossary.md) | `SPECTATOR` ≠ `WATCH`. Dùng sai từ là lỗi |
| 2 | [docs/04-business-rules/game-rules.md](docs/04-business-rules/game-rules.md) §1 | **Hệ toạ độ** — xem §2 dưới đây |
| 3 | [docs/09-technical/tech-stack.md](docs/09-technical/tech-stack.md) §3 | **Ranh giới Prisma / SQL thuần** — viết nhầm bên là mất khoá |
| 4 | [docs/10-issues/WORKFLOW.md](docs/10-issues/WORKFLOW.md) | Quy trình Git, định dạng bằng chứng, định nghĩa "xong" |
| 5 | [docs/10-issues/README.md](docs/10-issues/README.md) | Bản đồ 21 nhóm việc + 2 cổng chặn |

> Muốn hiểu tổng thể dự án sâu hơn: [docs/ONBOARDING.md](docs/ONBOARDING.md) §2.6.

Mỗi issue còn có mục **"ĐỌC TRƯỚC"** riêng — đọc **đúng mục được trỏ tới**, không đọc lướt.

---

## 2. ⭐ HỆ TOẠ ĐỘ — SAI CHỖ NÀY LÀ SAI TOÀN BỘ

```
ĐEN ở TRÊN (y=0)  ·  ĐỎ ở DƯỚI (y=9)  ·  y tăng từ trên xuống
```

| Mục | Quy ước |
|---|---|
| Ký hiệu | `(x, y)`, đếm từ **0** |
| `x` | 0 → 8, trái sang phải (**9 cột**) |
| `y` | 0 → 9, **trên xuống dưới** (**10 hàng**) |
| `y = 0` | Hàng cuối của **ĐEN** |
| `y = 9` | Hàng cuối của **ĐỎ** |
| Sông | Giữa `y = 4` và `y = 5` |
| Cung ĐEN | `x` 3–5, `y` 0–2 · Cung ĐỎ: `x` 3–5, `y` 7–9 |
| Tốt ĐỎ đã qua sông | `y ≤ 4` · Tốt ĐEN đã qua sông: `y ≥ 5` |
| Chỉ số mảng | `y * 9 + x` — mảng đúng **90** phần tử |
| Đi trước | **ĐỎ** |

**`GR-COORD-01`** — Người cầm quân đen thấy bàn **lật ngược**. Đó **chỉ là hiển thị**. Toạ độ gửi lên máy chủ **luôn** theo hệ trên, ⛔ **không** đổi theo góc nhìn.

> ⚠ Mã nguồn lần trước đã **đảo ngược** hệ này. Nếu bạn thấy tài liệu nào ghi khác — tài liệu đó sai, báo ngay.

---

## 3. BẢY LUẬT TUYỆT ĐỐI

Vi phạm bất kỳ luật nào ⇒ **PR bị từ chối**, không cần xem tiếp.

| # | Luật | Nghĩa cụ thể |
|---|---|---|
| **1** | **Máy chủ quyết định** | Client chỉ gửi **ý định**. ⛔ Không bao giờ tin dữ liệu client gửi lên |
| **2** | **Không có quyền ⇒ không nhận dữ liệu** | Lọc ở **máy chủ**, ⛔ không phải gửi hết rồi ẩn ở giao diện |
| **3** | **Đường xử lý lệnh ván dùng SQL thuần** | `TECH-07` — xem §4 |
| **4** | **Máy cờ chạy tiến trình riêng** | `TECH-09` — Node một luồng, để chung = treo mọi ván 3 giây |
| **5** | **Test thời gian dùng đồng hồ giả tiêm vào** | ⛔ Không `sleep` thật, không `setTimeout` chờ |
| **6** | **Test dữ liệu chạy trên PostgreSQL thật** | ⛔ Không mock. Thiếu DB ⇒ test phải **ĐỎ**, không được bỏ qua |
| **7** | **Không tự hạ tiêu chí** | Không đạt ⇒ ghi **số thật** + `BLOCKED`, ⛔ không sửa ngưỡng |

---

## 4. ⭐ `TECH-07` — RANH GIỚI PRISMA / SQL THUẦN

> Đây là ranh giới **quan trọng nhất của backend**. Viết nhầm bên là **mất khoá dòng** → đúng loại lỗi tranh chấp mà đặc tả đang phòng.

| Dùng **Prisma** | Dùng **SQL thuần** |
|---|---|
| Hồ sơ, tên hiển thị | **Đi một nước cờ** |
| Bạn bè, lời mời kết bạn | **Đầu hàng · xin hoà · xin đi lại** |
| Lời mời phòng, mã, link | **Nhận người vào phòng** (đếm sức chứa) |
| Lịch sử tin nhắn (đọc, có predicate quyền) | **Bắt đầu ván** (hai người sẵn sàng) |
| | **Gửi chat** (khoá/kiểm membership, segment rồi ghi để tuyến tính với thu hồi quyền) |
| Lịch sử ván (đọc) | **Tái đấu** (đổi bên) |
| Danh sách sảnh | **Mọi bộ đếm thời hạn** kết thúc ván |
| | **Đuổi người xem · thu hồi quyền** |

**Quy tắc nhận biết:**

```
Cần KHOÁ DÒNG, hoặc THỨ TỰ KHOÁ, hoặc ĐẾM-RỒI-GHI trong cùng transaction
   ⇒ SQL THUẦN
Còn lại ⇒ Prisma
```

**Kèm theo:**
- ⛔ **Không bao giờ chạy `prisma migrate`.** Prisma sẽ **xoá** RLS, CHECK constraint và unique hoãn kiểm mà nó không hiểu. Đổi schema **chỉ** bằng file `.sql` qua Supabase CLI
- Prisma chỉ dùng **`db pull`** để sinh kiểu dữ liệu
- **Thứ tự khoá luôn là: phòng → người → ván.** Đảo thứ tự = deadlock
- ⛔ **Không giữ khoá trong lúc gọi ra ngoài** (`ARCH-07`) — chờ máy cờ 3 giây trong khi giữ khoá ván = đứng cả ván đó

---

## 5. LỆNH

### Bốn cổng bắt buộc trước khi mở PR

```bash
pnpm lint && pnpm typecheck && pnpm build && pnpm test:unit
```

**Từ ISSUE-003 trở đi, cả bốn phải exit code 0.** Bootstrap: ISSUE-001 bắt install/build/typecheck/HTTP thật; ISSUE-002 thêm lint; ISSUE-003 thêm unit thật. Không tạo script xanh rỗng để giả cổng chưa tồn tại. Xem [execution-milestones](docs/10-issues/execution-milestones.md).

### Thêm tuỳ loại issue

| Issue chạm gì | Chạy thêm |
|---|---|
| Cơ sở dữ liệu | `pnpm test:integration` |
| Giao diện | `pnpm test:e2e` |
| Camera / mic | `pnpm test:media` |
| Hiệu năng | `pnpm test:load` |

> Bootstrap 001/002 theo WORKFLOW; từ003 đủ bốn cổng. E2e tạo ở004, integration tối thiểu ở034 rồi harness044, media112, load135. Chưa có lane không được giả PASS. Xem [TEST-CONVENTIONS](docs/10-issues/TEST-CONVENTIONS.md).

---

## 6. QUY TRÌNH MỘT ISSUE

```
① Đọc issue + đúng các mục ở "ĐỌC TRƯỚC"
② Kiểm PHỤ THUỘC đã MERGE chưa — chưa thì DỪNG, làm issue khác
③ Tạo nhánh:  issue/NNN-ten-ngan
④ VIẾT TEST TRƯỚC, theo mục TEST BẮT BUỘC của issue
⑤ Viết mã cho test xanh
⑥ Chạy các cổng đúng mốc bootstrap; từ 003 đủ 4 cổng
⑦ Tự đối chiếu CHECKLIST PASS (mục ĐIỀU KIỆN PASS) — thiếu một ô là chưa xong
⑧ Ghi bằng chứng: docs/test-reports/ISSUE-NNN.md
⑨ Commit · push · mở PR
⑩ Merge xong ⇒ cập nhật trạng thái trong docs/10-issues/INDEX.md
```

### Git

| Mục | Quy định |
|---|---|
| Nhánh | `issue/NNN-ten-ngan` — ví dụ `issue/017-nuoc-di-ma` |
| Commit | `<loại>(<phạm vi>): <mô tả> [ISSUE-NNN]` |
| Loại | `feat` · `fix` · `test` · `docs` · `chore` · `refactor` |
| Phạm vi | một issue = **một PR** vào `main` |
| Trước khi push | **luôn** `git fetch` và kiểm commit mới trên remote |
| Xung đột merge | ⛔ **DỪNG**, báo người dùng file/commit. **Không tự giải quyết** |
| Cấm | force push · né CI · commit khoá bí mật |

**Cuối mỗi commit message:**
```
Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

**Cuối mỗi mô tả PR:**
```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## 7. LUẬT VIẾT TEST

| # | Luật |
|---|---|
| 1 | **Thời gian**: dùng đồng hồ giả **tiêm vào**, ⛔ không `sleep` thật |
| 2 | **Dữ liệu**: chạy trên **PostgreSQL thật**, ⛔ không mock |
| 3 | **Tranh chấp**: phải có **rào đồng bộ** + **2 kết nối riêng**, nếu không sẽ không tái hiện được |
| 4 | **Quyền**: phải **GIẢ MẠO dữ liệu gửi thẳng lên máy chủ**. Kiểm nút bị vô hiệu ở giao diện là **CHƯA ĐỦ** |
| 5 | **Media**: phải **đo luồng dữ liệu thật** (byte RTP > 0), ⛔ không assert object tự tạo |
| 6 | ⛔ **Cấm `.only`. Cấm test bị bỏ qua.** Cột `Skip` trong báo cáo phải là **0** |
| 7 | ⭐ **Test phải BẮT được lỗi mục tiêu** |

**Luật 7 quan trọng nhất:** viết test xong, **cố tình làm hỏng mã** xem test có đỏ không. Test luôn xanh dù mã sai là test vô dụng.

---

## 8. ⛔ HAI CỔNG CHẶN

| Cổng | Issue | Điều kiện qua | Không đạt thì |
|---|---|---|---|
| **Máy cờ** | [032](docs/10-issues/ISSUE-032.md) | Độ sâu **6** trong **3000 ms**, p95 trên 20 thế × 5 lần lặp | ⛔ Cấm làm tiếp nhóm E18. Tối ưu theo đúng thứ tự trong `TECH-08` |
| **Media** | [112](docs/10-issues/ISSUE-112.md) | LiveKit local cho **byte RTP > 0** và **khung hình > 0** thật | ⛔ Cấm làm tiếp 113–117 |

⛔ **Không được hạ ngưỡng để đi tiếp.** Ghi số thật, rồi tối ưu theo thứ tự đã quy định.

---

## 9. KHI GẶP VẤN ĐỀ — LÀM GÌ

| Tình huống | Làm gì |
|---|---|
| Test đỏ | Sửa **mã**. ⛔ Không sửa test cho dễ qua |
| Không đạt ngưỡng đo | Ghi **số thật** + `BLOCKED`. ⛔ Không hạ ngưỡng |
| Thiếu tài nguyên ngoài (Google/LiveKit/SMTP…) | `BLOCKED_EXTERNAL` + ghi rõ thiếu gì. Xem [EXTERNAL-SETUP.md](docs/10-issues/EXTERNAL-SETUP.md). ⛔ Không thay bằng giả lập rồi báo đạt |
| **Phát hiện tài liệu sai hoặc mâu thuẫn** | ⛔ **DỪNG**, báo người dùng. **Không tự đổi yêu cầu** |
| Phụ thuộc chưa merge | ⛔ **DỪNG**. Chọn issue khác |
| Không hiểu yêu cầu | **Hỏi**, ⛔ đừng đoán |

> Đặc tả là **luật**, không phải gợi ý. Nhưng đặc tả cũng **có thể sai** — khi đó việc của bạn là **báo**, không phải tự quyết.

---

## 10. TRẠNG THÁI ISSUE

| Trạng thái | Nghĩa |
|---|---|
| `TODO` | Chưa làm |
| `IN_PROGRESS` | Đang làm, đã có nhánh |
| `DONE` | Đã merge, **mọi** ô trong checklist PASS đã đạt |
| `BLOCKED` | Chưa đạt kiểm thử/cổng hoặc còn điều kiện nội bộ cản triển khai; ghi bằng chứng và lý do |
| `BLOCKED_EXTERNAL` | Chờ tài nguyên ngoài, ghi rõ phần nào đã làm và chưa chứng minh |

> ⚠ **`BLOCKED_EXTERNAL` KHÔNG phải `DONE`.** Không được chạy bằng giả lập rồi báo đạt (`AC-RULE-02`).

### Một issue `DONE` khi **tất cả** đúng

- [ ] Mọi ô trong CHECKLIST PASS đã tick
- [ ] Cổng theo mốc bootstrap đạt; từ ISSUE-003 trở đi đủ 4 cổng exit 0
- [ ] **0 test bị bỏ qua**
- [ ] Có `docs/test-reports/ISSUE-NNN.md`
- [ ] PR đã merge vào `main`
- [ ] `INDEX.md` đã cập nhật

Thiếu **một** ô ⇒ **chưa xong**.

---

## 11. THUẬT NGỮ — DÙNG ĐÚNG TỪ

| Dùng | ⛔ Không dùng |
|---|---|
| `PLAYER` / người chơi | đấu thủ, kỳ thủ |
| `SPECTATOR` / người xem | viewer, khán giả, observer |
| `AI` / máy | bot, engine, máy tính |
| Host / chủ phòng | owner, room master |

⭐ **`SPECTATOR` ≠ `WATCH`** — đây là hai khái niệm khác nhau:

| | `SPECTATOR` | `WATCH` |
|---|---|---|
| Là gì | **Vai trò** của thành viên trong phòng | **Loại quyền** của lời mời / mã / link |
| Cặp đối xứng | `PLAYER` | `PLAY` |

Dùng mã `WATCH` để vào phòng ⇒ **trở thành** `SPECTATOR`.
⛔ Không viết "vé SPECTATOR" hay "vai trò WATCH".

Bảng đầy đủ: [docs/00-overview/glossary.md](docs/00-overview/glossary.md)

---

## 12. CẤU TRÚC THƯ MỤC ĐÍCH

Sẽ dần hình thành qua các issue — ⛔ **không tự tạo trước**:

```
apps/
  web/src/
    app/            router · providers
    features/       auth · friends · lobby · room · match · chat · media · ai · history
    components/board/
    lib/            api · socket · supabase
    styles/         tokens.css
  server/src/
    auth/           guard · strategy · service
    modules/        friends · rooms · invitations · matches · chat · media · ai · history
    realtime/       gateway · broadcast · presence
    db/             pool · transaction · sql/
  ai-worker/src/    main · supervisor · search-worker
packages/
  contracts/src/    kiểu + Zod dùng chung
  game-rules/src/   luật cờ thuần, KHÔNG phụ thuộc gì
  ai/src/           lượng giá · tìm kiếm
supabase/migrations/
tests/
  fixtures/ · unit/ · integration/ · e2e/ · media/ · load/
docs/               ← đặc tả, xem §13
```

---

## 13. BẢN ĐỒ TÀI LIỆU

| Cần gì | Vào đây |
|---|---|
| Một chức năng hoạt động ra sao | `docs/01-requirements/` |
| Người dùng đi qua những bước nào | `docs/02-flows/` |
| Màn hình có gì, trạng thái nào | `docs/03-screens/` |
| Luật cờ · luật nghiệp vụ · ai được làm gì | `docs/04-business-rules/` |
| Dữ liệu chảy thế nào khi realtime | `docs/05-data-and-realtime/` |
| Thế nào là đạt | `docs/06-acceptance/` |
| **Vì sao lại quyết như vậy** | `docs/07-decisions/decision-log.md` |
| Kiến trúc · công nghệ · triển khai | `docs/09-technical/` |
| **Đầu việc phải làm** | `docs/10-issues/` |

**Ba quy tắc đọc tài liệu:**

1. `01-requirements/` nói **CÁI GÌ**, `09-technical/` nói **BẰNG GÌ**. Thấy tên thư viện trong `01-` ⇒ lỗi tài liệu, báo ngay
2. Mỗi luật chỉ có **một** chỗ định nghĩa. Chỗ khác chỉ **liên kết tới**. Thấy cùng một luật ghi khác nhau ở hai nơi ⇒ lỗi, báo ngay
3. `99-archive/` là **lịch sử**, ⛔ **không** dùng làm căn cứ triển khai và ⛔ **không xoá**

---

## 14. ⛔ NHỮNG VIỆC TUYỆT ĐỐI KHÔNG LÀM

```
⛔ Không tự phát minh yêu cầu. Không có trong docs/ ⇒ HỎI
⛔ Không tự đổi yêu cầu khi thấy tài liệu sai ⇒ BÁO
⛔ Không hạ ngưỡng đo để báo đạt
⛔ Không thay tài nguyên ngoài bằng giả lập rồi đánh dấu DONE
⛔ Không dùng prisma migrate
⛔ Không để máy cờ chạy chung tiến trình máy chủ
⛔ Không commit khoá bí mật
⛔ Không đặt khoá bí mật vào biến VITE_* (mọi biến VITE_* đều CÔNG KHAI)
⛔ Không xoá docs/99-archive/
⛔ Không force push, không né CI
⛔ Không dùng .only, không để test bị bỏ qua
⛔ Không làm issue khi phụ thuộc chưa merge
⛔ Không tự giải quyết xung đột merge
⛔ Không thêm công nghệ ngoài bảng đã chốt (Redis, Tailwind, thư viện UI dựng sẵn…)
```

---

## 15. VÌ SAO NGHIÊM NGẶT ĐẾN VẬY

Dự án này **đã được xây một lần và thất bại ở 30 chỗ cụ thể** — lưu ở `docs/99-archive/reviews-v1/`.

Mỗi luật trong file này tương ứng với **một lỗi đã thật sự xảy ra**:

| Luật | Lỗi nó phòng |
|---|---|
| SQL thuần cho đường xử lý lệnh ván | Mất khoá dòng ⇒ hai nước đi cùng lúc |
| Nước đi lưu dạng **cây** | Đi lại xong đi nước mới ⇒ lỗi trùng khoá (`F-01`) |
| Đếm lặp chỉ trên **nhánh có hiệu lực** | Hoà sai (`F-02`) |
| Kiểm quyền ở **mọi** đường vào | Vào bằng mã bỏ qua kiểm riêng tư (`F-03`) |
| Test chạy trên PostgreSQL thật | Test tự mock chính nó (`F-11`, `F-12`) |
| Media đo byte RTP thật | Camera "kết nối" nhưng không có gói tin (`F-14`) |
| Thử tải phải **đồng thời** | Báo cáo thử tải không phải thử tải (`F-15`) |

**Mỗi issue có mục "⚠ CẠM BẪY" ở cuối** — chỉ đúng lỗi sẽ gặp ở chính chỗ đó. **Đọc nó.**

---

## 16. NẾU BẠN CHỈ NHỚ ĐƯỢC MỘT ĐIỀU

> **Ghi số thật luôn tốt hơn báo cáo đẹp.**
>
> Một issue ghi `BLOCKED` kèm số đo thật thì có ích.
> Một issue ghi `DONE` mà ngưỡng đã bị hạ xuống thì **gây hại** — vì nó giấu vấn đề cho tới lúc không sửa được nữa.
