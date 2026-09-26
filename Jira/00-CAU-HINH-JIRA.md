# 00 — CẤU HÌNH JIRA & QUY ƯỚC GHI ISSUE

**Dự án Jira:** `xiangqi-web` · **Key:** `XW` · **Site:** `xiangqi-web.atlassian.net`
**Board:** `XW board` (id 4, loại **Scrum**) · **Cập nhật:** 2026-09-26
**Nguồn kiểm tra:** Atlassian MCP (`getJiraProjectIssueTypesMetadata`, `getJiraIssueTypeMetaWithFields`, `getIssueLinkTypes`) và REST `board/4/configuration`, `board/4/sprint` — đã kiểm trực tiếp, không đoán.

> Bộ tài liệu này **không dựa vào dữ liệu đang có trên Jira**. Chỉ dùng cấu hình dự án (loại issue, trường, component, link) để biết cần ghi những gì. Toàn bộ Epic/Story/Task được soạn mới.

---

## 1. PHÂN CẤP ISSUE (đã kiểm)

| Cấp | Loại issue Jira | id | Dùng cho |
|---|---|---|---|
| 1 | **Epic** | 10000 | Một mảng chức năng lớn (16 Epic) |
| 0 | **Story** | 10013 | Một kết quả người dùng/kỹ thuật nghiệm thu được, **gói gọn trong 1 sprint** |
| −1 | **Sub-task** | 10012 | **Task** của một vai trò duy nhất, con của Story |
| 0 | Task | 10015 | *Không dùng trong kế hoạch này* (xem §1.1) |
| 0 | Bug | 10014 | Tester tạo khi kiểm thử FAIL |

### 1.1 Vì sao "Task" trong tài liệu = **Sub-task** trên Jira

Jira phân cấp cố định: `Epic (1) → Story/Task/Bug (0) → Sub-task (−1)`. Loại **Task** cùng cấp với Story nên **không thể là con của Story**. Để có cấu trúc **Epic → Story → Task** như thầy yêu cầu, mỗi Task được tạo bằng loại **Sub-task** và đặt **Parent = Story**. Trong Summary luôn có tiền tố vai trò, nên nhìn board vẫn thấy rõ đây là Task của ai.

Hệ quả cần biết:
- Sub-task **luôn nằm cùng sprint với Story cha** ⇒ mỗi Story được thiết kế để làm xong trong **1 sprint** (kể cả kiểm thử).
- Story Points đặt ở **Story**; Task ghi **ước lượng giờ** (Original Estimate).
- **Kiểm thử không phải Task riêng.** Mỗi Task phát triển/thiết kế tự mang mục **"🧪 Kiểm thử khi Ready for Test"**. Khi người làm kéo Task sang `Ready For Test`, Tester vào kiểm đúng các ca trong mục đó (xem §10). Chỉ có **20 Task `[QA]` riêng** cho việc kiểm **nhiều Task cùng lúc hoặc toàn hệ thống**: chạy lại cổng chặn, ma trận quyền, tranh chấp nhiều tab, thử tải, kịch bản xương sống, nghiệm thu, kiểm Internet thật.
- Việc Design phải xong **trước** Frontend một sprint nên được tách thành Story Design riêng (Epic EP02), liên kết `Blocks` sang Task Frontend.

---

## 2. TRƯỜNG CẦN ĐIỀN (đã kiểm từng loại issue)

| Trường (tên Jira) | Field id | Epic | Story | Sub-task (Task) | Ghi chú |
|---|---|:---:|:---:|:---:|---|
| Project | `project` | ✅ bắt buộc | ✅ bắt buộc | ✅ bắt buộc | `XW` (id 10003) |
| Issue Type | `issuetype` | ✅ | ✅ | ✅ | Epic / Story / Sub-task |
| Summary | `summary` | ✅ bắt buộc | ✅ bắt buộc | ✅ bắt buộc | Quy ước tên ở §4 |
| Parent | `parent` | — | Epic | **Story — bắt buộc** | Sub-task không tạo được nếu thiếu Parent |
| Description | `description` | ✅ | ✅ | ✅ | Nội dung file `.md` tương ứng trong `epic/`, `story/`, `task/` (bỏ dòng `> **Loại:**` điều hướng và bảng trường) |
| Components | `components` | ✅ | ✅ | ✅ **đúng 1** | 6 giá trị ở §3 |
| Assignee | `assignee` | Trưởng nhóm | Người chủ trì Story | Người làm Task | Khi Task sang `Ready For Test` ⇒ đổi Assignee sang **Tester**; FAIL ⇒ đổi lại người làm (§10) |
| Priority | `priority` | ✅ | ✅ | ✅ | Highest / High / Medium / Low / Lowest (mặc định Medium) |
| Labels | `labels` | ✅ | ✅ | ✅ | Quy ước ở §5 |
| Sprint | `customfield_10020` | — | ✅ | theo Story cha | Xem §6 |
| Story Points | `customfield_10040` | — | ✅ | — | Trường ước lượng của board (kiểm ở `board/4/configuration`). **Không có trên màn hình Create** ⇒ tạo xong rồi sửa, hoặc nhờ admin thêm vào Create screen |
| Start date | `customfield_10015` | ✅ | ✅ | ✅ | yyyy-mm-dd |
| Due date | `duedate` | ✅ | ✅ | ✅ | yyyy-mm-dd |
| Original Estimate | `timetracking.originalEstimate` | — | — | ✅ | Giờ **làm** (dev/design), ví dụ `6h`. Không có trên Create screen ⇒ điền sau khi tạo |
| Time tracking — Log work | `worklog` | — | — | ✅ | Tester **log work** giờ kiểm thử vào chính Task khi kiểm ở bước Ready For Test |
| *(trong Description)* Kiểm thử (Tester) | — | — | — | ✅ | Giờ kiểm ước tính, ghi ở bảng đầu Description (Jira không có trường riêng) |
| *(trong Description)* Ready for Test (dự kiến) | — | — | — | ✅ | Ngày dự kiến kéo sang `Ready For Test`; **Due date = ngày dự kiến Done** (đã kiểm xong) |
| Fix versions | `fixVersions` | ✅ | ✅ | ✅ | **Bắt buộc**, đúng 1 giá trị theo sprint — xem §6.1. Mọi file `epic/`, `story/`, `task/` đã ghi sẵn ở bảng trường |
| Linked Issues | `issuelinks` | — | ✅ | ✅ | Chỉ dùng `Blocks` và `Relates` (§7) |
| Team | `customfield_10001` | tuỳ chọn | tuỳ chọn | tuỳ chọn | Không dùng |
| Attachment | `attachment` | — | tuỳ chọn | tuỳ chọn | Ảnh thiết kế, log bằng chứng |

---

## 3. COMPONENT = VAI TRÒ (đã có sẵn trên Jira)

| Component | id | Tiền tố trong Summary | Làm gì |
|---|---|---|---|
| **Frontend** | 10001 | `[FE]` | Mã trong `apps/web` |
| **Backend** | 10000 | `[BE]` | Mã trong `apps/server`, `packages/contracts`, `packages/game-rules`, `supabase/migrations` |
| **AI** | 10002 | `[AI]` | Mã trong `packages/ai`, `apps/ai-worker`, công cụ benchmark/đấu thử |
| **Design** | 10003 | `[DS]` | Thiết kế màn hình, trạng thái, token; rà khớp thiết kế sau khi FE làm |
| **Tester** | 10004 | `[QA]` | Kiểm chứng độc lập, viết/chạy test e2e–tích hợp–tải–media, ghi bằng chứng, tạo Bug |
| **DevOps** | 10005 | `[OPS]` | Công cụ kho mã, CI, Supabase/LiveKit local, triển khai, runbook |

**Luật gán:**
1. **Mỗi Task đúng 1 component.** Không Task nào vừa sửa `apps/web` vừa sửa `apps/server`.
2. Chọn theo **nội dung công việc**, không theo chức danh người nhận. Thành viên AI làm Task luật cờ thì Task đó vẫn là `Backend`.
3. **Mọi Task phát triển/thiết kế (FE/BE/AI/OPS/DS) đều có mục "🧪 Kiểm thử khi Ready for Test"** do **Tester** thực hiện (không phải người làm Task). Developer vẫn tự viết unit/integration test trong Task của mình; bước Ready For Test là kiểm chứng **độc lập**. Việc Tester kiểm ở bước này là **một bước của quy trình**, không làm Task thành hai vai trò.
   Task `[QA]` riêng (component Tester) chỉ dùng cho kiểm thử **tích hợp nhiều Task / toàn hệ thống**.
4. Story có thể mang nhiều component (hợp của các Task con).

---

## 4. QUY ƯỚC ĐẶT TÊN (Summary)

| Loại | Mẫu | Ví dụ |
|---|---|---|
| Epic | `EPxx · <tên mảng>` | `EP06 · Tài khoản & xác thực` |
| Story | `STxx.y · <kết quả>` | `ST06.3 · Đăng nhập, phiên 30 ngày và đăng xuất` |
| Task | `[VAI TRÒ] TKxx.y.z · <việc cụ thể>` | `[BE] TK06.3.1 · API đăng nhập bằng username + ghi nhớ 30 ngày` |
| Bug | `[BUG][<vai trò sửa>] <mô tả ngắn> (từ TKxx.y.z)` | `[BUG][BE] Nhập mã phòng sai 20 lần không bị chặn (từ TK16.2.2)` |

Mã `EPxx / STxx.y / TKxx.y.z` là mã **trong tài liệu**, giúp tra cứu và tạo link khi đưa lên Jira. Sau khi tạo, ghi lại key Jira thật (`XW-…`) vào cột "Key Jira" của [03-TRUY-VET.md](03-TRUY-VET.md).

---

## 5. NHÃN (Labels)

| Nhóm | Giá trị | Gắn cho |
|---|---|---|
| Kế hoạch | `xq-v2` | **Mọi** issue của kế hoạch này (lọc nhanh, tách khỏi issue cũ) |
| Vai trò | `role-fe` `role-be` `role-ai` `role-ds` `role-qa` `role-ops` | Task (trùng component, để lọc JQL nhanh). `role-qa` chỉ có ở 20 Task Tester tích hợp |
| Epic | `ep01` … `ep16` | Story, Task |
| Sprint | `sprint-1` … `sprint-4` | Story, Task |
| Nguồn | `src-001` … `src-138` | Story/Task truy về issue đặc tả trong `docs/10-issues/` |
| Đặc biệt | `gate` | Cổng chặn (đo AI 032, đo media 112) |
| | `race` | Có kiểm tranh chấp đồng thời |
| | `security` | Có kiểm giả mạo quyền |
| | `external` | Cần tài nguyên ngoài (Google, SMTP thật, Render/Vercel, LiveKit Cloud) — có thể thành `BLOCKED_EXTERNAL` |
| | `critical-path` | Nằm trên đường găng của 4 tuần |

---

## 6. SPRINT

Board chỉ có sẵn `XW Sprint 1` (id 3, trạng thái future). **Cần tạo thêm Sprint 2–4** trước khi gán.

| Sprint | Tên trên Jira | Bắt đầu | Kết thúc | Mục tiêu sprint |
|---|---|---|---|---|
| 1 | `XW Sprint 1` | 2026-09-28 | 2026-10-04 | Kho mã + CI + Supabase local; contracts + **luật cờ đầy đủ**; migration hồ sơ/phòng/ván; design system + bàn cờ |
| 2 | `XW Sprint 2` | 2026-10-05 | 2026-10-11 | Migration chat/media/phiên + RLS + harness; guard + đăng ký/xác minh; **cổng AI**; **cổng media**; bàn cờ SVG; tạo phòng/nhận người |
| 3 | `XW Sprint 3` | 2026-10-12 | 2026-10-18 | Đăng nhập/phiên, Google; gateway + đường lệnh + đi nước + finalizer + snapshot; sảnh/phòng chờ; đồng hồ; media BE; AI tiến trình riêng; bạn bè; triển khai bản đầu |
| 4 | `XW Sprint 4` | 2026-10-19 | 2026-10-23 | Màn phòng chơi realtime; lời mời; người xem; mất kết nối; chống treo ván; thao tác ván; lịch sử/tái đấu; chat; media UI; chơi với máy; hoàn thiện; quyền; tải; nghiệm thu; bàn giao |


### 6.1 FIX VERSIONS — MỖI SPRINT MỘT BẢN PHÁT HÀNH (chốt 2026-09-27)

Jira hiện chỉ có `v1.0.0` (ngày 28/09–03/10). **Trước khi tạo issue**, vào *Project settings → Releases* (hoặc trang **Releases** của dự án): sửa `v1.0.0` và tạo thêm 3 version:

| Version | Tên hiển thị (Description) | Start date | Release date | Gồm | Điều kiện bấm **Release** |
|---|---|---|---|---|---|
| `v0.1.0` | Nền tảng & luật cờ | 2026-09-28 | 2026-10-04 | Story/Task của Sprint 1 | Mọi issue gắn `v0.1.0` Done; demo Sprint 1 đạt |
| `v0.2.0` | Dữ liệu, AI, cổng đo | 2026-10-05 | 2026-10-11 | Story/Task của Sprint 2 | Như trên cho `v0.2.0`; có số đo thật cổng AI và cổng media (đạt hoặc BLOCKED ghi số) |
| `v0.3.0` | Phòng, ván online, API | 2026-10-12 | 2026-10-18 | Story/Task của Sprint 3 | Như trên cho `v0.3.0` |
| `v1.0.0` | Hoàn thiện & bàn giao | 2026-10-19 | 2026-10-23 | Story/Task của Sprint 4 | Như trên + hồ sơ bàn giao |

**Quy tắc gán:**
1. **Story:** version = version của sprint chứa Story.
2. **Task (Sub-task):** cùng version với Story cha (Task luôn cùng sprint với Story).
3. **Epic:** version của sprint **kết thúc muộn nhất** trong các Story con (Epic trải Sprint 2–4 ⇒ `v1.0.0`). Trang Releases vẫn đếm được từng Story/Task theo version riêng của nó.
4. **Bug:** gán version của sprint **đang chạy** lúc tạo Bug (Bug phải sửa xong trong version đó).
5. Story bị dời sang sprint sau ⇒ đổi version của Story **và** toàn bộ Task con cho khớp; không để version cũ.
6. Cuối mỗi sprint (buổi review): mở trang **Releases**, version đạt điều kiện ⇒ bấm **Release**; còn issue chưa Done ⇒ dời theo quy tắc 5 rồi mới Release. Không Release khi còn issue mở.

Số lượng: `v0.1.0` 9 Story/25 Task · `v0.2.0` 11 Story/25 Task · `v0.3.0` 15 Story/40 Task · `v1.0.0` 20 Story/45 Task. Epic: `v0.1.0` EP01, EP03 · `v0.2.0` EP02, EP04, EP05 · `v0.3.0` EP06, EP07 · `v1.0.0` EP08–EP16.

---

## 7. LIÊN KẾT PHỤ THUỘC (đã kiểm loại link)

| Loại link | id | Chiều | Dùng khi |
|---|---|---|---|
| **Blocks** | 10000 | A `blocks` B ⇔ B `is blocked by` A | **Đầu ra của A là đầu vào của B.** B chỉ được bắt đầu khi A tới **`Ready For Test`** (code đã merge `main`) — hoặc **`Done`** nếu trong Task B ghi `A (Done)` |
| Relates | 10003 | hai chiều | Liên quan nhưng **làm song song được** |
| Duplicate, Cloners | — | — | Không dùng |

**Luật phụ thuộc (bắt buộc):**
1. `[DS]` → `[FE]` cùng màn hình: `Blocks`.
2. `[BE]` API/sự kiện → `[FE]` gọi API/sự kiện đó: `Blocks`. FE **không** làm song song với BE khi cần dữ liệu thật.
3. Các Task phát triển mà một Task `[QA]` tích hợp kiểm → Task `[QA]` đó: `Blocks` (Task `[QA]` bắt đầu khi chúng tới `Ready For Test`).
6. **Phải chờ `Done`** (ghi `(Done)` sau mã Task trong trường "Is blocked by"): cổng chặn AI (TK04.3.1, TK04.3.2) và media (TK14.1.3); nền quyền và nền test (RLS TK05.2.3, harness TK05.3.1, guard TK06.1.1); đường xử lý lệnh ván TK10.2.3 và finalizer TK10.3.2; và mọi chỗ Task sau cần kết quả **đã được kiểm** (ví dụ số đo thật cho hồ sơ bàn giao). Khi tạo trên Jira, ghi rõ `Chờ Done: XW-…` trong Description vì link `Blocks` không phân biệt hai mức này.
4. Story sau cần kết quả Story trước: link `Blocks` giữa **Story** và giữa **Task đầu vào → Task đầu ra** cụ thể.
5. Hai Task **chỉ được song song** khi không Task nào dùng đầu ra của Task kia — khi đó ghi `Relates` hoặc không link.

Khi tạo bằng MCP `createIssueLink`: `inwardIssue` = việc **chặn** (làm trước), `outwardIssue` = việc **bị chặn** (làm sau), `type = Blocks`.

---

## 8. ĐỘ ƯU TIÊN

| Priority | Dùng cho |
|---|---|
| **Highest** | Cổng chặn (032, 112); việc trên đường găng mà trễ 1 ngày là trễ cả kế hoạch |
| **High** | Chức năng lõi R01–R19 |
| **Medium** | Giao diện phụ, hoàn thiện, báo cáo |
| **Low** | Tối ưu không bắt buộc để nghiệm thu |

---

## 9. STORY POINTS & ƯỚC LƯỢNG

Story Points (Fibonacci) quy đổi từ **tổng giờ làm + giờ kiểm thử** của các Task con (cả nhóm, kể cả Tester) để dùng một thước đo:

| Tổng giờ | ≤ 4h | 5–8h | 9–13h | 14–20h | 21–32h | > 32h |
|---|---|---|---|---|---|---|
| Story Points | 1 | 2 | 3 | 5 | 8 | 13 (phải tách) |

Ước lượng giờ Task: `XS ≤ 2h` · `S 3–4h` · `M 5–6h` · `L 7–8h`. Không Task nào > 8h; lớn hơn thì tách.

---

## 10. WORKFLOW TRẠNG THÁI (đã kiểm trên Jira)

Workflow của dự án có các trạng thái: `To Do` · `Ready For Dev` · `In Progress` · `In Review` · `Ready For Test` · `Done` (và `Red` do Jira tự quản lý — **không dùng**). Mọi chuyển trạng thái là global (chuyển được từ bất kỳ trạng thái nào). Board có 5 cột: **TO DO · READY FOR DEV · IN PROGRESS · READY FOR TEST · DONE**. `In Review` không có cột riêng ⇒ trong lúc PR chờ review, Task **giữ `In Progress`**.

### 10.1 Task phát triển / thiết kế (FE · BE · AI · OPS · DS)

```
To Do ──► Ready For Dev ──► In Progress ──► Ready For Test ──► Done
                                  ▲                 │
                                  └──── FAIL ◄──────┘  (Tester tạo Bug, đổi Assignee về người làm)
```

| Trạng thái | Điều kiện vào | Ai chuyển | Assignee |
|---|---|---|---|
| To Do | Mới tạo; hoặc còn Task chặn chưa tới mức cần | — | Người làm |
| Ready For Dev | Mọi Task chặn đã tới **`Ready For Test`** (hoặc **`Done`** với mục ghi `(Done)`) | Trưởng nhóm / người làm (lúc Daily) | Người làm |
| In Progress | Đã tạo nhánh `issue/<mã-task>-ten-ngan`, đang làm; PR đang chờ review cũng giữ ở đây | Người làm | Người làm |
| Ready For Test | PR **đã review**, **CI xanh** (lint · typecheck · build · test:unit + lane liên quan), **đã merge `main`**. Người làm ghi comment: link PR + cách chạy thử | Người làm | **Đổi sang Tester** |
| Done | Tester chạy **đủ ca** trong mục "🧪 Kiểm thử khi Ready for Test", **PASS**, ghi bằng chứng vào `docs/test-reports/<mã-task>.md` và log work giờ kiểm | Tester | Giữ Tester |

**Khi Tester FAIL:** tạo `Bug` (`[BUG][<vai trò>] … (từ TKxx.y.z)`, link `Relates` tới Task, dán bước tái hiện + kết quả thật), chuyển Task về **`In Progress`**, đổi Assignee về người làm. Sửa xong ⇒ lại `Ready For Test`, Tester kiểm lại **toàn bộ** ca (không chỉ ca đã FAIL). Bug mức `Highest`/`High` được sửa **trước** khi người làm nhận Task mới.

**Task sau đã bắt đầu từ lúc Task trước ở `Ready For Test`, nếu Task trước FAIL thì sao:** người làm Task sau vẫn tiếp tục; bản sửa Bug merge vào `main` rồi Task sau rebase. Nếu Bug làm đổi hợp đồng API/dữ liệu mà Task sau đang dùng ⇒ báo trưởng nhóm trong ngày.

### 10.2 Task Tester tích hợp `[QA]` (20 Task)

`To Do ──► Ready For Dev ──► In Progress ──► Done` (không qua `Ready For Test`, vì chính Tester làm).
- `Ready For Dev` khi mọi Task chặn đã tới mức ghi trong "Is blocked by".
- `Done` khi mọi ca PASS và đã có báo cáo; FAIL ⇒ tạo Bug gán đúng Task gây lỗi, Task `[QA]` giữ `In Progress` tới khi Bug được sửa và chạy lại PASS.

### 10.3 Story

Story `Done` khi **mọi Sub-task Done** và tiêu chí chấp nhận của Story đạt. Story chỉ được tính vào kết quả sprint khi Done.

**Không đạt ngưỡng đo / thiếu tài nguyên ngoài:** giữ Task ở `In Progress` (hoặc `Ready For Test` nếu đang kiểm), bật **Flagged** (`customfield_10021`), thêm nhãn `blocked` hoặc `blocked-external`, ghi **số đo thật** trong comment. **Không hạ ngưỡng** để chuyển Done.

---

## 11. MẪU NỘI DUNG (Description)

### Epic
Mục tiêu · Phạm vi (làm / không làm) · Danh sách Story · Tiêu chí hoàn thành Epic · Rủi ro.

### Story
Câu chuyện người dùng · Bối cảnh · Phạm vi · Tiêu chí chấp nhận (Given/When/Then) · Thứ tự Task · Định nghĩa Done.

### Task phát triển (FE/BE/AI/OPS/DS)
Mục tiêu · **Đầu vào cần có** · **Việc cần làm** (từng bước, giá trị cụ thể) · **File/module** · **Không làm** · **Bẫy dễ gặp** · **Bàn giao cho Task sau** · **Tự kiểm trước khi chuyển Ready For Test** · **🧪 Kiểm thử khi Ready for Test** (người kiểm, giờ kiểm, phạm vi, ca kiểm thử ID · bước · mong đợi, tiêu chí PASS, bằng chứng, nếu FAIL).

### Task Tester tích hợp (QA)
Mục tiêu · **Điều kiện bắt đầu** · **Môi trường & dữ liệu** · **Ca kiểm thử** (ID · bước · kết quả mong đợi) · **Tiêu chí PASS** · **Bằng chứng phải nộp** · **Nếu FAIL**.

Mọi chi tiết cần để làm/kiểm (luật, số liệu, định dạng, mã lỗi) được **ghi thẳng trong Task**, không bắt người nhận phải đi đọc tài liệu khác mới hiểu việc.
