# AGENTS.md — Hướng dẫn cho AI agent

**Dự án:** Cờ Tướng Online · **Cập nhật:** 2026-09-27 (bổ sung vòng đời Task trên Jira) · **Áp dụng cho:** mọi AI agent đọc, viết mã, viết test hoặc sửa tài liệu trong kho này.

Đọc hết file này trước khi sửa bất kỳ file nào. Các luật dưới đây đều sinh ra từ lỗi đã thật sự xảy ra ở lần xây trước (`docs/99-archive/reviews-v1/`).

---

## 0. Tóm tắt

```
① Kho CHƯA CÓ MÃ NGUỒN. Có: đặc tả (docs/), kế hoạch Jira (Jira/), trang tài liệu (site/)
② Đơn vị công việc = một Jira Task TKxx.y.z (Key XW-…). Một Task = một nhánh = một PR, đi đúng vòng đời §8
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
| 6 | §3 và §8 của file này | Làm việc với Jira: trạng thái, Git, review, bàn giao, Done |

Mỗi lần nhận Task: đọc thêm file Task, các `ISSUE-NNN.md` mà Task truy về (nhãn `src-NNN`, cột "Nguồn" trong [Jira/03-TRUY-VET.md](Jira/03-TRUY-VET.md)), và đúng các mục "ĐỌC TRƯỚC" của những issue đó. Không cần đọc cả 138 issue.

---

## 3. Jira: dự án, vai trò và quyền của agent

| Mục | Giá trị |
|---|---|
| Site / project | `xiangqi-web.atlassian.net` · project **`XW`** · board 4 |
| Phân cấp | Epic `XW-1…16` → Story `XW-17…71` → Task `XW-72…206`. Task có Parent = Epic, nối Story bằng nhãn `stxx-y` + link `Relates` |
| Sprint / version | XW Sprint 1–4 (28/09 – 23/10/2026) ↔ `v0.1.0` · `v0.2.0` · `v0.3.0` · `v1.0.0` |
| Tra mã | `TKxx.y.z` ↔ `XW-…` ↔ `ISSUE-NNN`: [Jira/03-TRUY-VET.md](Jira/03-TRUY-VET.md) · người làm / người kiểm: [Jira/07-PHAN-CONG.md](Jira/07-PHAN-CONG.md) |
| Cấu hình đầy đủ | [Jira/00-CAU-HINH-JIRA.md](Jira/00-CAU-HINH-JIRA.md) |

**Agent có thể đóng vai:** người làm Task (Dev/Design/DevOps), người review PR, hoặc Tester (Task `[QA]` và bước Ready for Test). Người dùng nói rõ vai nào; không rõ ⇒ hỏi.

**Quyền ghi lên Jira:** chuyển trạng thái, comment, tạo Bug, log work là hành động công khai với cả nhóm.
- Chỉ làm khi người dùng **cho phép trong phiên** và agent có công cụ Jira. Mặc định: **soạn sẵn** nội dung comment/Bug (mẫu ở §8.4) để người dùng tự dán.
- ⛔ Agent không sửa Summary, Sprint, Fix version, Story Points, Original Estimate, Assignee, link Blocks — đó là việc của trưởng nhóm.
- ⛔ Agent không chuyển Task **mình làm** sang `Done`. `Done` chỉ do Tester (người khác người làm) chuyển sau khi PASS.

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

## 8. Vòng đời một Task trên Jira

### 8.1 Trạng thái

```
To Do → Ready For Dev → In Progress → Ready For Test ──(merge develop)──► Done
                             ▲         (review + test)
                             └──── FAIL: Bug, sửa tiếp trên cùng PR
```

Không dùng trạng thái `In Review`: **Ready For Test là bước review**. Ở đó người review duyệt code và Tester kiểm **trên nhánh PR** cùng lúc. Code chỉ vào `develop` khi cả hai đạt.

| Trạng thái | Nghĩa | Điều kiện vào | Ai chuyển | Assignee |
|---|---|---|---|---|
| `To Do` | Chưa làm được | Mới tạo, hoặc còn Task chặn chưa Done | — | Người làm |
| `Ready For Dev` | Làm được ngay | Đạt **Definition of Ready** (§8.2) | Trưởng nhóm / người làm | Người làm |
| `In Progress` | Đang code | Đã tạo nhánh | Người làm | Người làm |
| `Ready For Test` | Đang review + test | PR đã mở vào `develop`, 4 cổng xanh ở máy, đã comment bàn giao | Người làm | **Người kiểm** (theo 07-PHAN-CONG) |
| `Done` | Xong, code đã ở `develop` | ≥ 1 approve + CI xanh + Tester PASS đủ ca 🧪 ⇒ **đã merge `develop`** | Tester | Giữ Tester |

### 8.2 Definition of Ready — trước khi bắt đầu

- [ ] Người dùng đã giao đúng Task (`TKxx.y.z` / `XW-…`). Không được giao ⇒ hỏi, ⛔ không tự chọn.
- [ ] **Mọi Task trong "Is blocked by" đã `Done`** (code đã merge `develop`). Hậu tố `(Done)` còn ghi ở một số Task có cùng nghĩa. Chưa đạt ⇒ ⛔ dừng, báo Task đang chặn.
- [ ] Đã đọc file Task, các `ISSUE-NNN` nguồn (nhãn `src-NNN`) và mục ĐỌC TRƯỚC của chúng (§2).
- [ ] Task là **một** vai trò (`[BE]` `[FE]` `[AI]` `[DS]` `[OPS]` `[QA]`); mục "❌ Không làm" là ranh giới, không lấn sang Task khác.

### 8.3 Các bước của người làm

| # | Bước | Jira |
|---|---|---|
| 1 | Nhận việc, kiểm Definition of Ready | `Ready For Dev` → **`In Progress`** |
| 2 | `git fetch && git checkout -b <nhánh> origin/develop` (quy ước §8.5) | Comment "Bắt đầu" (mẫu A) |
| 3 | **Viết test trước**: test bắt buộc của issue + ca 🧪 của Task | — |
| 4 | Viết mã cho test xanh. Commit nhỏ, có Key Jira | — |
| 5 | Chạy cổng theo mốc (§7) + mục "7. TỰ KIỂM" trong Task. **Cố tình làm hỏng mã ⇒ test phải đỏ**, rồi hoàn lại | — |
| 6 | `git fetch`, rebase lên `develop` mới nhất, push, mở PR (mẫu PR ở §8.5), nhờ ≥ 1 người review | — |
| 7 | Comment bàn giao (mẫu B), đổi Assignee sang Người kiểm | **`Ready For Test`** |
| 8 | Sửa theo review và theo Bug của Tester **trên cùng nhánh PR**; push lại, báo người review/Tester | FAIL ⇒ `In Progress`, sửa xong lại `Ready For Test` |
| 9 | Đủ **≥ 1 approve (người khác người làm) + CI xanh + Tester PASS** ⇒ rebase nếu `develop` đã đổi, chạy lại cổng, **merge `develop`** | Comment "Đã merge" (mẫu D) |
| 10 | Log work giờ làm thật (so với Original Estimate) | Log work |

- ⛔ Không merge khi còn thiếu một trong ba điều kiện ở bước 9.
- Rebase sau khi Tester đã PASS mà có xung đột hoặc đổi mã ⇒ báo Tester kiểm lại các ca liên quan trước khi merge.
- Bug `Highest`/`High` sửa **trước** khi nhận Task mới.
- Agent không tự merge hay chuyển trạng thái khi người dùng chưa cho phép (§3). Dừng ở bước nào thì báo người dùng đang ở bước đó và việc tiếp theo.

### 8.4 Các bước của Tester (khi agent đóng vai Tester)

1. Chỉ kiểm Task **không do mình làm**, đang ở `Ready For Test`.
2. Lấy code của PR: `git fetch origin && gh pr checkout <số-PR>`, rồi dựng môi trường theo [sổ tay kiểm thử](Jira/04-HUONG-DAN-KIEM-THU.md) §2. Chưa có môi trường Internet (ST16.8) ⇒ kiểm trên máy local.
3. Chạy **đủ mọi ca** trong mục 🧪 của Task, đúng thứ tự, ghi output thật. Ca ⭐ FAIL ⇒ Bug `Highest`.
4. PASS ⇒ commit `docs/test-reports/TKxx.y.z.md` **vào chính nhánh PR** (commit `test(report): … [XW-<số>]`; dán **output thật** và `exit=` từng lệnh, số đo kèm máy/commit, cột Skip = 0). Comment PASS (mẫu C) trên Jira và PR.
5. FAIL ⇒ tạo Bug (mẫu E), link `Relates` tới Task, comment trên PR, chuyển Task về **`In Progress`**, đổi Assignee về người làm. Khi Task quay lại `Ready For Test`, kiểm lại **toàn bộ** ca, không chỉ ca đã FAIL.
6. Sau khi người làm merge: kiểm PR đã vào `develop`, log work giờ kiểm, chuyển **`Done`**.
7. Task `[QA]` tích hợp: kiểm trên `develop` (các Task nó kiểm đã Done); đi `Ready For Dev → In Progress → Done`, không qua `Ready For Test`.

**Story Done:** khi `project = XW AND labels = stxx-y AND statusCategory != Done` trả **0** và tiêu chí chấp nhận của Story đạt.

### 8.5 Quy ước Git gắn với Jira

Key Jira (`XW-…`) phải có trong **tên nhánh, commit và tiêu đề PR** để Jira tự liên kết vào issue (xem §8.8).

| Mục | Quy định | Ví dụ |
|---|---|---|
| Nhánh | Tạo từ `develop` (§8.9): `<loại>/XW-<số>-<ten-ngan-khong-dau>` — loại: `feature` · `fix` · `test` · `docs` · `chore` · `refactor` · `qa` | `feature/XW-72-khoi-tao-monorepo` · `fix/XW-215-chan-nhap-ma-sai` · `qa/XW-76-bao-cao` |
| Commit | `<loại>(<phạm vi>): <mô tả> [XW-<số>]` — loại: `feat` · `fix` · `test` · `docs` · `chore` · `refactor` | `feat(auth): API đăng nhập bằng username [XW-111]` |
| Tiêu đề PR | `[XW-<số>] TKxx.y.z · <tên Task>` | `[XW-72] TK01.1.1 · Khởi tạo monorepo pnpm + TypeScript` |
| Phạm vi PR | **Một Task = một PR** vào `develop` | |
| Trước khi push | Luôn `git fetch` và rebase lên `develop` mới nhất | |
| Xung đột merge | ⛔ Dừng, báo người dùng file/commit xung đột. Không tự giải quyết | |
| Commit / push / PR | Chỉ khi người dùng yêu cầu | |
| Cấm | Push thẳng / force push lên `main` hoặc `develop` · né CI (`--no-verify`, tắt job) · commit khoá bí mật | |

Nếu dùng AI hỗ trợ, thêm dòng `Co-Authored-By:` của agent ở cuối commit theo quy ước của công cụ đang dùng.

**Mô tả PR** (bắt buộc đủ các mục):

```markdown
## Jira
XW-<số> · TKxx.y.z · Story STxx.y · Nguồn: ISSUE-NNN, …

## Thay đổi
- …

## Kiểm thử đã chạy
| Lệnh | Kết quả |
|---|---|
| pnpm lint && pnpm typecheck && pnpm build && pnpm test:unit | exit=0, N test, 0 skip |
| pnpm test:integration (nếu chạm DB) | … |

## Đã thử làm hỏng mã
<đổi gì> ⇒ test <tên> đỏ ⇒ đã hoàn lại

## Thay đổi mục 🟡 / hợp đồng API (nếu có)
…
```

### 8.6 Mẫu comment Jira

```text
A · Bắt đầu (người làm)
Bắt đầu TKxx.y.z. Nhánh: feature/XW-<số>-… · Task chặn đã Done: TK…, TK….

B · Bàn giao Ready For Test (người làm)
PR: <link> (chưa merge) · 4 cổng xanh ở máy: lint · typecheck · build · test:unit (N test, 0 skip).
Cách chạy thử: gh pr checkout <số>; <lệnh / URL / tài khoản test>.
Đã làm: … · Chưa làm / giới hạn: … · Thay đổi 🟡: …
Review: <người review> · Người kiểm: <tên> — theo mục 🧪 (N ca).

C · Tester PASS (Tester)
PASS N/N ca trên nhánh PR @<sha>. Báo cáo: docs/test-reports/TKxx.y.z.md (đã commit vào PR). Chờ approve + CI để merge.

D · Đã merge (người làm)
Đã merge <link PR> vào develop @<sha> (approve: <người>, CI xanh, Tester PASS). Nhờ <Tester> chuyển Done.

E · Bug (Tester tạo issue loại Bug)
Summary: [BUG][<vai trò sửa>] <mô tả ngắn> (từ TKxx.y.z)
Priority: Highest nếu ca ⭐ hoặc chặn cả nhóm; còn lại High/Medium
Bước tái hiện: 1… 2… 3…
Mong đợi: … · Thực tế: … (dán output/ảnh)
Môi trường: nhánh PR @<sha>, trình duyệt/OS
Link: Relates → XW-<Task>
```

### 8.7 Definition of Done

Một Task chỉ **Done** khi **tất cả** đúng; thiếu một ô là chưa xong:

- [ ] Mọi ca 🧪 của Task và test bắt buộc của issue nguồn có test tương ứng, xanh
- [ ] Cổng theo mốc (§7) exit 0 trên máy và CI; **0 test bị bỏ qua**
- [ ] Đã thử làm hỏng mã và test đỏ
- [ ] PR có ≥ 1 approve của người khác người làm
- [ ] Tester (khác người làm) PASS đủ ca trên nhánh PR; báo cáo `docs/test-reports/TKxx.y.z.md` (hoặc đường dẫn mục Bằng chứng của Task) đã nằm trong PR
- [ ] Tài liệu cập nhật cùng PR: Task (nếu đổi mục 🟡), `Jira/06-HOP-DONG-API-SU-KIEN.md` (nếu đổi API/sự kiện), `.env.example` (nếu thêm biến)
- [ ] PR **đã merge `develop`**
- [ ] Giờ làm và giờ kiểm đã log work
- [ ] Mọi Task truy về một `ISSUE-NNN` đã Done ⇒ cập nhật trạng thái issue đó trong [docs/10-issues/INDEX.md](docs/10-issues/INDEX.md)

Không đạt ngưỡng đo hoặc thiếu tài nguyên ngoài ⇒ giữ Task ở trạng thái hiện tại, bật **Flagged**, thêm nhãn `blocked` / `blocked-external`, ghi **số thật** trong comment. ⛔ Không merge, không chuyển `Done`.

### 8.8 Liên kết tự động Jira ↔ kho mã

Repo `twotnguyen/XIANGQI` nối với Jira bằng app **GitHub for Jira** (GitLab: "GitLab for Jira Cloud"; Bitbucket Cloud: Jira → Settings → Products → Development tools) — việc cài app do người dùng/admin làm. Khi đã nối, Jira **tự** gắn nhánh, commit, PR và build vào issue có Key xuất hiện trong chúng, nên agent không cần dán link từng commit vào Jira; comment bàn giao (mẫu B) vẫn ghi link PR. Luôn ghi Key theo bảng dưới, kể cả khi app chưa cài — lịch sử sẽ được nạp lại (backfill) sau khi nối.

**Agent phải làm đúng:**

| Nơi | Quy tắc | Đúng | Sai |
|---|---|---|---|
| Tên nhánh | Có Key, **chữ hoa**, có gạch nối | `feature/XW-72-khoi-tao-monorepo` | `feature/xw-72-…`, `feature/XW72-…`, `feature/TK01.1.1-…` |
| Mỗi commit | Kết thúc bằng `[XW-<số>]` | `feat(repo): khởi tạo monorepo [XW-72]` | Commit không có Key (bị "mồ côi", không hiện trong issue) |
| Tiêu đề PR | Bắt đầu bằng `[XW-<số>]` | `[XW-72] TK01.1.1 · Khởi tạo monorepo` | Chỉ ghi `TK01.1.1` |
| Mô tả PR | Mục `## Jira` ghi Key (mẫu §8.5) | `XW-72 · TK01.1.1 · …` | |
| Commit sửa Bug | Ghi Key **của Bug**; nếu sửa trên nhánh PR của Task thì ghi cả hai | `fix(auth): chặn nhập mã sai [XW-215][XW-111]` | |

- Một nhánh / một PR chỉ mang Key của **một** Task (cộng Key Bug khi sửa Bug). ⛔ Không nhét Key của Task khác để "gắn nhờ".
- Key lấy từ [Jira/03-TRUY-VET.md](Jira/03-TRUY-VET.md); ⛔ không đoán số.
- ⛔ **Không dùng smart commit để chuyển trạng thái** (`#done`, `#ready-for-test`…) — trạng thái đi theo §8.1 và do đúng người chuyển. Chỉ được dùng `#comment`, `#time` khi người dùng yêu cầu.
- Sửa lại commit/nhánh đã push để thêm Key: ⛔ không force push lên nhánh đang có review; nếu cần, tạo commit mới có Key và báo người dùng.

**Tự động hoá trên Jira (nếu nhóm đã bật):** tạo nhánh ⇒ Task sang `In Progress`; mở PR ⇒ Task sang `Ready For Test`. Khi đã có rule này, agent **không** chuyển tay trùng lặp; chỉ kiểm lại trạng thái. PR merged **không** tự chuyển `Done` — Tester chuyển (§8.4).

**Kiểm sau khi push/mở PR** (nếu agent có quyền đọc Jira): mở issue, khung **Development** phải hiện đúng nhánh / commit / PR. Không hiện ⇒ kiểm Key (chữ hoa, gạch nối, đúng số) rồi báo người dùng; app chưa cài hoặc chưa cấp quyền repo là việc của người dùng, không tự cấu hình.

---

### 8.9 Mô hình nhánh và phát hành

| Nhánh | Vai trò | Bảo vệ (GitHub Ruleset) |
|---|---|---|
| `main` | **Ổn định nhất, deploy từ đây.** Chỉ nhận PR `develop → main` (phát hành) hoặc `hotfix/XW-…` | Cấm push thẳng, cấm force push, cấm xoá; PR cần **1 approve của Code Owner** (trưởng nhóm hoặc Tester, file `.github/CODEOWNERS`); CI bắt buộc xanh (`quality`, `e2e`); chỉ admin repo được bỏ qua |
| `develop` | Nhánh làm việc chung — **mọi Task** merge vào đây | Cấm push thẳng, cấm force push, cấm xoá; PR cần **1 approve**; CI bắt buộc xanh sau khi TK01.2.1 có CI |
| `feature/…` `fix/…` `test/…` `docs/…` `chore/…` `refactor/…` `qa/…` | Một Task / một Bug | Tạo từ `develop`, xoá tự động sau khi merge |

- Agent **luôn** tạo nhánh từ `origin/develop` và mở PR vào `develop`. ⛔ Không mở PR vào `main`, không push thẳng `main`/`develop`.
- **Phát hành** (cuối mỗi sprint, trùng Fix version `v0.1.0` … `v1.0.0`): trưởng nhóm hoặc Tester mở PR `develop → main` tiêu đề `release: vX.Y.Z`, kiểm nhanh kịch bản demo sprint, merge, gắn tag `vX.Y.Z` trên `main`, bấm **Release** version trên Jira.
- **Hotfix** lỗi trên bản đã deploy: nhánh `hotfix/XW-<số>-…` từ `main`, PR vào `main` (cần Code Owner), rồi merge `main` ngược về `develop` để không mất bản sửa.
- Chỉ **admin repo** (trưởng nhóm) được bỏ qua bảo vệ (push thẳng, merge khi CI đỏ) — dùng khi khẩn cấp và phải ghi lý do trong PR/commit.

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
| Dựng giao diện: token, thành phần, bàn cờ, bố cục, Figma | [DESIGN.md](DESIGN.md) |
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
⛔ Làm Task khi Task chặn chưa Done
⛔ Tự chuyển Task mình làm sang Done; merge PR khi chưa có approve của người khác + CI xanh + Tester PASS
⛔ Tự giải quyết xung đột merge
⛔ Thêm công nghệ ngoài bảng đã chốt (Redis, Tailwind, thư viện UI dựng sẵn…)
```

---

## 15. Nếu chỉ nhớ được một điều

> **Ghi số thật luôn tốt hơn báo cáo đẹp.**
> Một Task ghi `BLOCKED` kèm số đo thật thì có ích. Một Task ghi Done mà ngưỡng đã bị hạ thì gây hại — vì nó giấu vấn đề tới lúc không sửa được nữa.
