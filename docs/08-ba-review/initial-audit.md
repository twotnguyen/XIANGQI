# BA AUDIT — PHASE 1: DISCOVERY & INITIAL AUDIT

**Ngày audit:** 2026-09-21
**Vai trò:** Senior Business Analyst / Requirements Auditor (read-only ở phase này)
**Phạm vi quét:** toàn bộ `.md` trong `/Users/twot/Documents/CODE/XIANGQI-Design` (101 file)
**Nguyên tắc:** không sửa requirement, không tự quyết thay Product Owner, không viết code.

---

## 0. PHÁT HIỆN QUAN TRỌNG NHẤT TRƯỚC KHI ĐỌC TIẾP

Ba điều làm thay đổi bản chất của đợt audit này so với giả định trong brief:

**0.1 — Đây không phải dự án ở giai đoạn thu thập yêu cầu.**
Yêu cầu nghiệp vụ đã được chốt qua 24 câu phỏng vấn có ghi biên bản (`docs/planning/PHONG_VAN_YEU_CAU.md`), đã được chuyển thành đặc tả thực thi (`docs/specs/01`–`09`), đã phân rã thành 32 issue, **và đã được implement**. Brief của Product Owner đặt ra ~40 câu hỏi mở (guest user, host transfer, số lượng AI level, spectator có xem webcam không…) — **phần lớn đã có quyết định ghi rõ trong tài liệu**. Audit này vì vậy tập trung vào cái còn thiếu/mâu thuẫn thật, không tạo câu hỏi cho những thứ đã chốt.

**0.2 — Thư mục này là bản sao docs-only của một repo đã có mã nguồn.**
`XIANGQI-Design/` không phải git repository và **không chứa mã nguồn**. `docs/` ở đây **giống hệt từng byte** với `docs/` trong `/Users/twot/Documents/CODE/XIANGQI` (repo thật, git HEAD `332ae5b`, có `apps/`, `packages/`, `tests/`, `supabase/`). Khác biệt: `README.md` ở đây rỗng (0 byte) trong khi repo thật có README đầy đủ; `AGENTS.md` ở đây đã bị ghi đè bằng chính prompt BA, không còn là hướng dẫn agent của dự án.

> **Hệ quả:** mọi đường dẫn mã nguồn trong tài liệu (`apps/server/src/...`, `tests/integration/...`) là **dangling reference** trong thư mục này. Một developer mới clone đúng `XIANGQI-Design` sẽ không chạy được gì. Cần quyết định vai trò của thư mục này (xem **Q-001**).

**0.3 — Tài liệu tự mâu thuẫn về trạng thái dự án.**
`docs/README.md` và `docs/READINESS.md` nói "**Chưa có mã ứng dụng, chưa chạy unit/integration/E2E sản phẩm**". `docs/handoff/PROGRESS.md` nói "**LOCAL_COMPLETE — 32/32 issue**, 482 test PASS, PR #54 merged". Hai câu này ở trong cùng một bộ tài liệu, không có file nào nói câu kia đã lỗi thời. Đây là contradiction P0 về mặt tài liệu (xem **BA-C-01**).

---

## 1. CURRENT DOCUMENTATION STRUCTURE

```
XIANGQI-Design/
├── AGENTS.md                      ⚠ bị ghi đè bằng prompt BA (không còn là doc dự án)
├── DU_AN_CO_TUONG_ONLINE.md       bản phân tích gốc, đã có banner SUPERSEDED
├── README.md                      ⚠ RỖNG 0 byte
└── docs/
    ├── README.md                  mục lục + thứ tự ưu tiên tài liệu
    ├── READINESS.md               kết luận sẵn sàng (PLAN_READY)
    ├── TRACEABILITY.md            R01–R16 → issue → gate
    ├── specs/       (9 file)      ★ SOURCE OF TRUTH đặc tả
    ├── issues/      (33 file)     32 issue thực thi + README (DAG)
    ├── planning/    (4 md + 2 data) biên bản phỏng vấn + 3 research + validator
    ├── handoff/     (11 file)     vận hành: start-here, progress, deploy, defense…
    ├── reviews/     (2 file)      review bàn giao + trạng thái remediation
    └── test-reports/(35 file)     evidence theo từng issue + acceptance
```

**Đánh giá kiến trúc docs:** cấu trúc này **tốt hơn** cấu trúc mẫu 00–08 mà brief đề xuất, vì nó phân tách đúng theo vòng đời (spec → issue → evidence) và đã có traceability. **Khuyến nghị: KHÔNG reorganize.** Chi tiết ở mục 9.

---

## 2. DOCUMENTATION INVENTORY

| File | Purpose | Quality | Problems | Action |
|---|---|---|---|---|
| `README.md` (root) | — | **Major Gaps** | Rỗng 0 byte. Entry point của repo không nói gì | Viết hoặc copy từ repo thật |
| `AGENTS.md` | Hướng dẫn agent | **Obsolete** | Đã bị thay bằng prompt BA; mất hướng dẫn Git/workflow gốc | Khôi phục hoặc xác nhận chủ ý (Q-001) |
| `DU_AN_CO_TUONG_ONLINE.md` | Phân tích ban đầu | Good (as history) | Có banner SUPERSEDED rõ ràng ở dòng 1. Chứa số liệu cũ (2 người xem, Pikafish, auth tự viết) | Giữ nguyên, không sửa |
| `docs/README.md` | Mục lục + ưu tiên | **Needs Improvement** | Khẳng định "chưa có mã ứng dụng" — sai so với PROGRESS.md | Sửa (BA-C-01) |
| `docs/READINESS.md` | Kết luận readiness | **Needs Improvement** | Ghi PLAN_READY, nói chưa có build/test — lỗi thời | Sửa hoặc ghi rõ "trạng thái tại 12/09/2026" |
| `docs/TRACEABILITY.md` | R→issue→gate | Good | Chỉ 1 chiều (R→issue). Thiếu R→screen, R→AC | Bổ sung (khuyến nghị 9.3) |
| `docs/specs/01-PRODUCT.md` | Yêu cầu sản phẩm | **Good** | Phân biệt rõ **Yêu cầu** (user) vs **Thiết kế** (agent) — rất tốt | Giữ; bổ sung gap ở mục 4 |
| `docs/specs/02-ARCHITECTURE.md` | Stack/runtime/deploy | Good | Đúng chỗ (HOW tách khỏi WHAT) | Giữ |
| `docs/specs/03-STATE-MACHINES.md` | Lifecycle/lock/deadline | **Good** | Rất chi tiết. Dày đặc, khó đọc cho BA/QA | Giữ; cân nhắc sơ đồ |
| `docs/specs/04-CONTRACTS.md` | Types/API/events/DB | **Good** | Là canonical cho tên gọi | Giữ |
| `docs/specs/05-AUTH.md` | Auth contract | **Good** | Có nguồn chính thức | Giữ |
| `docs/specs/06-MEDIA.md` | Media + quyền track | **Good** | Trung thực về giới hạn revoke | Giữ; BA-G-03 (kick) |
| `docs/specs/07-UI-AND-TESTS.md` | Tokens/màn hình/fixture | **Needs Improvement** | Fixture toạ độ **ngược** với mã nguồn (BA-C-02) | Sửa toạ độ |
| `docs/specs/08-TEST-EXECUTION.md` | Ma trận test | **Needs Improvement** | Fixture F-MATE/F-STALEMATE ngược & khác hẳn implement (BA-C-02) | Sửa fixture |
| `docs/specs/09-DATABASE-DESIGN.md` | 19 bảng, RLS, retention | **Good** | Rất đầy đủ. Có ghi rõ hạng mục chưa quyết (xoá tài khoản) | Giữ |
| `docs/planning/PHONG_VAN_YEU_CAU.md` | Biên bản 24 câu | **Good** | Là nguồn gốc mọi quyết định nghiệp vụ. Ghi cả "pressure pass" | Giữ; nâng thành Decision Log (9.2) |
| `docs/planning/RESEARCH_*.md` (3) | Nghiên cứu nền | Good | Đã ghi rõ "không override spec" | Giữ |
| `docs/planning/validate_docs.py` | Validator | Good | Tồn tại và chạy được | Chạy lại sau mọi sửa |
| `docs/issues/README.md` + 32 issue | Kế hoạch thực thi | Good | DAG acyclic, mỗi issue đủ mục | Giữ |
| `docs/handoff/PROGRESS.md` | Trạng thái | **Needs Improvement** | Mâu thuẫn README/READINESS; chứa bảng test lặp 3 nơi | Sửa (BA-C-01, BA-D-01) |
| `docs/handoff/START-HERE.md` | Điểm vào | Good | — | Giữ |
| `docs/handoff/DEPLOY / GOOGLE-SETUP / EXTERNAL-*` | Runbook | Good | — | Giữ |
| `docs/handoff/DEFENSE.md` | Kịch bản bảo vệ | Good | Có số đo cụ thể, không hứa Elo | Giữ |
| `docs/handoff/EVIDENCE-TEMPLATE.md` | Mẫu evidence | Good | — | Giữ |
| `docs/reviews/AGENT-HANDOFF-REVIEW-*.md` | Review 30 finding | **Good** | Review độc lập, trung thực, ghi rõ NOT_RUN | Giữ |
| `docs/reviews/REMEDIATION-STATUS.md` | Trạng thái fix | **Needs Improvement** | F-17/F-26 ghi CONFIRMED nhưng doc chưa sửa (BA-C-02); bảng test lặp | Sửa |
| `docs/test-reports/*` (35) | Evidence | Good | Theo template, có limitation | Giữ |
| `docs/test-reports/final-coverage.md` | R01–R16 coverage | **Duplicate** | Chứa bảng registry giống hệt 2 file khác | Reference thay vì copy |

**Tổng: 101 file `.md`.** Chất lượng tổng thể **cao hơn đáng kể** so với mặt bằng dự án đồ án. Điểm mạnh nổi bật: phân biệt tường minh *yêu cầu của user* vs *quyết định của agent*; ghi rõ giới hạn của kết luận; không tự biến dự kiến thành bằng chứng.

---

## 3. FEATURE COVERAGE MATRIX

| # | Module | Requirement | Flow | Screen | State | BR | AC | Đánh giá |
|---|---|---|---|---|---|---|---|---|
| 1 | Authentication | ✅ R01 | ✅ 05 | ✅ 07 routes | ✅ | ✅ | ✅ T007/T008 | **READY** |
| 2 | User/Profile | ✅ R02 | ✅ 05 | ✅ `/onboarding` | ✅ | ✅ | ✅ | **READY** |
| 3 | Friends/Presence | ✅ R02 | ✅ 01 | ✅ `/friends` | ✅ | ✅ | ✅ T009 | **READY** |
| 4 | Lobby | ✅ R03 | ⚠ | ✅ `/lobby` | ✅ | ⚠ BA-A-02 | ✅ T010 | **GAP nhỏ** |
| 5 | Room | ✅ R03/R04 | ✅ | ✅ `/rooms/:id` | ✅ 03 | ✅ | ✅ | **READY** |
| 6 | Invite | ✅ R03 | ✅ | ⚠ modal? | ✅ | ✅ | ✅ T011 | **GAP nhỏ** |
| 7 | Player joining | ✅ R03 | ✅ | ✅ `/join#token` | ✅ | ✅ | ✅ | **READY** |
| 8 | Spectator joining | ✅ R04 | ⚠ mid-match | ✅ | ✅ | ⚠ BA-A-01 | ✅ T016 | **GAP nhỏ** |
| 9 | Chess Board | ✅ R05 | ✅ | ✅ | ✅ | ✅ | ✅ T005 | **READY** |
| 10 | Chess Rules | ✅ R05/R07 | ✅ | — | — | ✅ `xiangqi-simple-v1` | ⚠ **BA-C-02** | **CONTRADICTION** |
| 11 | Multiplayer Match | ✅ R06 | ✅ 03 | ✅ | ✅ | ✅ | ✅ T012 | **READY** |
| 12 | Realtime Sync | ✅ R06 | ✅ | — | ✅ | ✅ | ✅ T015 | **READY** |
| 13 | Disconnect/Reconnect | ✅ R09 | ✅ 03 | ✅ | ✅ | ✅ | ✅ T013 | **READY** |
| 14 | Chat (2 kênh) | ✅ R10 | ✅ | ✅ | ✅ | ✅ | ✅ T017 | **READY** |
| 15 | Webcam | ✅ R11 | ✅ 06 | ✅ | ✅ | ✅ | ✅ T026 | **READY** |
| 16 | Microphone | ✅ R11 | ✅ 06 | ✅ | ✅ | ✅ | ✅ | **READY** |
| 17 | Spectator Chat | ✅ R10 | ✅ | ✅ | ✅ | ✅ | ✅ | **READY** |
| 18 | AI Match | ✅ R12 | ✅ | ✅ `/ai/new` | ✅ | ✅ | ✅ T018–023 | **READY** |
| 19 | Match Result | ✅ R07 | ✅ | ⚠ modal? | ✅ | ✅ | ✅ | **GAP nhỏ** |
| 20 | Rematch | ✅ R14 | ✅ 03 | ✅ | ✅ | ✅ | ✅ T027 | **READY** |
| 21 | History/Replay | ✅ R14 | ✅ | ✅ `/history` | ✅ | ✅ | ✅ | **READY** |
| 22 | Error Handling | ✅ | ✅ ErrorCode | ✅ 07 | ✅ | ✅ | ✅ | **READY** |
| 23 | Permissions | ✅ | ✅ | — | ✅ | ✅ | ✅ T029 | **READY** (thiếu matrix tập trung) |
| 24 | Security BR | ✅ R16 | ✅ | — | ✅ | ✅ | ✅ T029 | **READY** |
| 25 | Notifications | ⚠ | ⚠ | ❌ | — | ❌ | ❌ | **GAP — BA-G-02** |
| 26 | **Inactivity/Abandon** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **GAP P0 — BA-G-01** |
| 27 | **Kick 1 spectator** | ❌ | ❌ | ❌ | ❌ | ⚠ tham chiếu mồ côi | ❌ | **GAP P1 — BA-G-03** |
| 28 | Guest access | — | — | — | — | ⚠ ngầm định | — | **BA-G-04** |
| 29 | Remember me / session TTL | ❌ | ❌ | ❌ | — | ❌ | ❌ | **GAP P2 — BA-G-05** |
| 30 | Xoá tài khoản | ❌ (ghi rõ chưa làm) | — | — | — | ✅ ghi rõ ngoài phạm vi | — | **OK — đã khai báo** |

Ghi chú: ✅ có và đủ rõ · ⚠ có nhưng chưa đủ rõ · ❌ không tìm thấy · — không áp dụng

---

## 4. MAJOR GAPS

### BA-G-01 — Không có luật xử lý người chơi không đi nước (P0)
**Liên quan:** R08, R09, ROOM lifecycle
**Tài liệu hiện nói:** R08 — "Không giới hạn hoặc 5/10/15 phút mỗi bên; **mặc định không giới hạn**". R09 chỉ xử lý *mất kết nối* (60 giây). `01-PRODUCT.md:50` — rời phòng khi đang chơi = đầu hàng. `01-PRODUCT.md:44` — một tài khoản chỉ thuộc một phòng tại một thời điểm.
**Vấn đề:** Với time control mặc định (không giới hạn), một người chơi **vẫn online** (heartbeat 10s bình thường) nhưng **không đi nước** sẽ làm ván treo **vô thời hạn**. Không có deadline nào kích hoạt: clock là `null`, grace 60s chỉ chạy khi mất kết nối, scheduler đóng phòng 10 phút chỉ áp dụng cho room `FINISHED`.
**Đối thủ bị kẹt:** chỉ có 2 lối thoát — đầu hàng (thua), hoặc ngồi chờ. Không thể xin hoà một phía. Không thể tạo phòng khác vì bị khoá một-phòng-một-tài-khoản. Không thể chơi AI vì yêu cầu đã rời phòng online.
**Vì sao quan trọng:** đây là đường thoát duy nhất bị chặn hoàn toàn trong chế độ mặc định của sản phẩm. Ảnh hưởng trực tiếp UX và có thể dùng để "khoá" đối thủ một cách ác ý.
→ **Q-002**

### BA-G-02 — Không có mô hình notification ngoài phạm vi phòng (P1)
**Tài liệu hiện nói:** có event `invitation:received` (socket, real-time) và `GET /invitations` (≤20). `03-STATE-MACHINES.md` cuối mục rematch ghi rõ "không cần bổ sung tính năng thông báo ngoài room".
**Vấn đề:** Lời mời trực tiếp hết hạn **10 phút** và chỉ đến qua socket. Nếu người nhận đang offline hoặc ở tab khác, không có tài liệu nào định nghĩa: có badge đếm không, có toast không, có persist khi login lại không, có âm thanh không. `GET /invitations` tồn tại nhưng không có màn hình/route nào trong `07-UI-AND-TESTS.md:11` dành cho nó.
**Vì sao quan trọng:** R02 yêu cầu "lời mời chơi trong ứng dụng". Nếu lời mời chỉ sống 10 phút và chỉ hiện real-time, tỉ lệ mời thành công phụ thuộc hoàn toàn vào việc cả hai đang mở đúng tab.
→ **Q-003**

### BA-G-03 — "Kick viewer" được tham chiếu nhưng không có requirement/API (P1)
**Tài liệu hiện nói:** `06-MEDIA.md:23` — "Khi cần thu hẹp quyền hoặc **kick viewer/controller**"; `06-MEDIA.md:32` — "Khi **viewer bị kick**/đổi mã/room khoá: rotate cả hai WATCH rooms".
**Vấn đề:** Không có requirement, không có endpoint, không có business rule nào định nghĩa hành vi kick một người xem cụ thể. Toàn bộ cơ chế thu hồi trong `01-PRODUCT.md:48` và `09-DATABASE-DESIGN.md:167` là **tất-cả-hoặc-không**: đổi visibility hoặc rotate watch code → tăng `watch_epoch` → xoá **toàn bộ** spectator membership.
**Vì sao quan trọng:** chủ phòng muốn đuổi 1 người xem quấy rối hiện phải đuổi cả 5. Tầng media đã viết sẵn cơ chế cho "kick" — hoặc business thiếu, hoặc media spec đang nói về một tính năng không tồn tại. Một trong hai phải sửa.
→ **Q-004**

### BA-G-04 — Guest/người chưa đăng nhập: quyết định ngầm, chưa viết thành requirement (P2)
**Tài liệu hiện nói:** không có từ "guest"/"khách vãng lai" trong bất kỳ spec nào. `01-PRODUCT.md:44` — "PUBLIC cho **tài khoản hoàn tất onboarding** xem khi còn chỗ". `04-CONTRACTS.md` — mọi route trừ auth/health đều Bearer + onboarding.
**Vấn đề:** Thực tế guest bị chặn hoàn toàn, nhưng điều này chỉ suy ra được từ các điều kiện rải rác, không có câu nào nói "hệ thống không hỗ trợ guest". Brief của PO lại hỏi thẳng về guest.
**Vì sao quan trọng:** đây là câu hỏi đầu tiên của bất kỳ developer/QA mới nào. Cần một câu khẳng định tường minh, không cần đổi hành vi.
→ **Q-005**

### BA-G-05 — Không có chính sách thời hạn phiên / "ghi nhớ đăng nhập" (P2)
**Tài liệu hiện nói:** `05-AUTH.md` — `persistSession:true`, `autoRefreshToken:true`, có `logout {scope:CURRENT|ALL}`.
**Vấn đề:** Không có quyết định nghiệp vụ nào về: phiên sống bao lâu, có checkbox "ghi nhớ" không, có tự đăng xuất sau N ngày không, có màn quản lý thiết bị đang đăng nhập không. Hiện tại hành vi = mặc định của Supabase (đăng nhập vĩnh viễn cho tới khi logout). Đây là **technical default đang đóng vai business rule**.
→ **Q-006**

---

## 5. CONTRADICTIONS

### BA-C-01 — Trạng thái dự án mâu thuẫn trực tiếp (P0)
| Nguồn | Khẳng định |
|---|---|
| `docs/README.md` §Trạng thái | "**Chưa có mã ứng dụng, chưa chạy unit/integration/E2E sản phẩm.** Mọi issue TODO là việc cần thực hiện" |
| `docs/READINESS.md` dòng 1 | "Trạng thái: **PLAN_READY**… Chưa có kết quả build/test/game/Google/media/AI performance" |
| `docs/specs/08-TEST-EXECUTION.md` dòng cuối | "Tại thời điểm lập plan, **không có test ứng dụng nào đã chạy**" |
| `docs/handoff/PROGRESS.md` | "Trạng thái sản phẩm: **LOCAL_COMPLETE** — 32/32 issue… **482 test PASS** trên CI Run #34777360077" |
| `docs/test-reports/final-coverage.md` | "16/16 yêu cầu… **100% PASS**… LOCAL_COMPLETE" |
| Thực tế kiểm chứng | Repo thật `/Users/twot/Documents/CODE/XIANGQI` có mã nguồn đầy đủ, git HEAD `332ae5b` |

`docs/README.md` là file mục lục — nơi developer mới đọc **đầu tiên**. Hiện nó nói sai về trạng thái dự án.
→ **Q-007**

### BA-C-02 — Toạ độ bàn cờ trong spec NGƯỢC với mã nguồn; fixture "đáp án độc lập" không phải fixture đã dùng (P0)
**Đây là finding quan trọng nhất về mặt kỹ thuật-nghiệp vụ.**

| Nguồn | Quy ước |
|---|---|
| `07-UI-AND-TESTS.md:21` | "Hai tướng **(4,0) BLACK** và **(4,9) RED**, tốt đỏ (4,4) **đã qua sông**" |
| `08-TEST-EXECUTION.md` §Fixture | "BLACK ở trên"; **F-MATE:** `BLACK GENERAL(4,0)`, `RED GENERAL(4,9)`, RED ROOK(3,2)(4,2)(5,2) |
| **Mã nguồn thật** `packages/game-rules/src/initial.ts` | "**RED at bottom (y=0..4), BLACK at top (y=5..9)**" — RED back rank y=0, BLACK back rank y=9 |
| **Fixture thật** `tests/fixtures/terminal-positions.ts` | `RED GENERAL(4,0)`, `BLACK GENERAL(4,9)`, RED ROOK **(3,9)(5,9)(4,7)** |

Ba vấn đề chồng nhau:
1. **Trục y bị đảo.** Spec đặt RED ở y=9, code đặt RED ở y=0.
2. **Fixture F-MATE trong spec khác hoàn toàn fixture đã implement** — không chỉ là phản chiếu: spec dùng 3 xe ở hàng 2, code dùng 2 xe hàng 9 + 1 xe (4,7). Spec 08 tuyên bố các fixture này là "**đáp án độc lập, review tay**" để không lấy `getLegalMoves` làm oracle cho chính nó. Nhưng oracle được viết trong tài liệu **không phải** oracle được dùng trong test.
3. **Hệ quả lan sang UI.** `07-UI-AND-TESTS.md:9` ví dụ aria-label "Mã đỏ, cột 2 **hàng 10**" — chỉ đúng nếu RED ở y=9. Với code (RED y=0) mã đỏ ở hàng 1. Và "tốt đỏ (4,4) **đã qua sông**" là **sai** theo code: với RED ở y=0..4, ô (4,4) vẫn thuộc nửa sân RED.

**Lịch sử:** review `AGENT-HANDOFF-REVIEW-20260913-1706.md` đã bắt đúng lỗi này (finding **F-17**, P2). `REMEDIATION-STATUS.md` đánh F-17 = **`CONFIRMED`** với ghi chú "*Đã ghi nhận và làm rõ trong tài liệu; mã nguồn chuẩn hoá theo toạ độ canonical*" — nhưng **spec 07 và 08 chưa hề được sửa**; toạ độ ngược vẫn còn nguyên ở HEAD hiện tại. Finding được đóng bằng ghi chú, không bằng thay đổi.

**Vì sao là P0 chứ không phải P2 như review cũ đánh giá:** brief của PO đặt tiêu chuẩn "*nếu giao cho hai team khác nhau, cả hai có implement ra cùng behavior không?*". Ở đây, một developer/QA đọc spec 07+08 sẽ dựng bàn cờ **lật ngược**, viết test mate **sai**, và mọi assertion toạ độ sẽ fail — trong khi tài liệu tuyên bố đó là "đáp án đã review tay".
→ **Q-008**

### BA-C-03 — `F-26` đóng bằng ghi chú, ngữ nghĩa vẫn chưa nằm trong contract (P2)
`REMEDIATION-STATUS.md` ghi F-26 (`isSquareAttackedBy` trả `false` cho ô trống với pháo) = `CONFIRMED`, "*đã làm rõ ngữ nghĩa hình học trong tài liệu*". Nhưng `04-CONTRACTS.md` — nơi định nghĩa API module luật — **không có** hàm `isSquareAttackedBy` và không mô tả ngữ nghĩa này. Việc "làm rõ trong tài liệu" nằm ở comment mã nguồn, không ở contract. Tương tự F-17: finding đóng mà artifact được viện dẫn không phản ánh.
→ gộp vào **Q-008**

### BA-C-04 — Brief của Product Owner chứa số liệu đã bị thay thế (P1)
Brief (mục 6) ghi: "*Có tối đa **2 spectator** trong trường hợp room giới hạn người xem*". Con số 2 đến từ `DU_AN_CO_TUONG_ONLINE.md:32` — bản phân tích **đã bị thay thế**. Câu 7 của phỏng vấn (`PHONG_VAN_YEU_CAU.md:100-104`) ghi rõ PO đã **nâng từ 2 lên 5**, và "*mọi con số 2 người xem/4 thành viên tối đa cần đổi thành 5 người xem/7 thành viên*". Toàn bộ spec, DB, test (5 viewer + viewer thứ 6 bị từ chối) và mã nguồn đều theo số **5**.
**Không tự sửa** — cần PO xác nhận đây là nhầm lẫn khi soạn brief chứ không phải quyết định đảo ngược.
→ **Q-009**

---

## 6. AMBIGUITIES

### BA-A-01 — Người xem vào giữa trận: cho phép ngầm, chưa viết thành rule (P2)
Không có câu nào nói rõ spectator được/không được join khi room đang `PLAYING`. Suy ra là **được** từ: index sảnh `WHERE status<>'CLOSED'` (`09:150`), và "người xem mới đọc được lịch sử kênh SPECTATORS của **match hiện tại**" (`01:60`). Nhưng suy luận không phải đặc tả.

### BA-A-02 — Sảnh có hiển thị phòng `FINISHED` không? (P2)
`01-PRODUCT.md:44` — "PUBLIC xuất hiện sảnh… khi còn chỗ". `09-DATABASE-DESIGN.md:150` — index sảnh `WHERE visibility='PUBLIC' AND status<>'CLOSED'`, tức **bao gồm `FINISHED`**. Phòng FINISHED sống 10 phút cho replay/rematch. Người lạ có thấy và vào xem phòng đang trong cửa sổ rematch không? Business (01) và implementation hint (09) không khớp nhau.

### BA-A-03 — Không có permission matrix tập trung (P2)
Quyền được đặc tả đầy đủ nhưng **rải rác** across 01/03/04/06/09 và test case T029. Brief yêu cầu một bảng `Action × Actor`. Hiện phải đọc 5 file để trả lời "spectator có được gửi chat PLAYERS không?". Đây là vấn đề *trình bày*, không phải thiếu quyết định — nhưng ảnh hưởng trực tiếp tới tốc độ onboarding của QA.

### BA-A-04 — Màn hình/modal chưa được liệt kê đầy đủ (P2)
`07-UI-AND-TESTS.md:11` liệt kê **routes**, nhưng không có screen inventory cho modal/panel. Các thứ chắc chắn tồn tại nhưng không có mục riêng: Invite Modal, Match Result Modal, Join-by-code input, Confirm-resign dialog, AI difficulty selection, Spectator list panel. Spec có nói "mỗi page có empty/loading/error/retry/unauthorized" — tốt — nhưng không áp cho modal (đặc biệt: **modal có close/cancel behavior gì?**).

### BA-A-05 — Requirement chủ quan còn sót (P2)
Phần lớn requirement trong bộ này **testable** (một điểm mạnh thực sự). Còn sót vài chỗ: `07`: "chữ và trạng thái **không chỉ biểu đạt qua màu**" (chưa nêu chuẩn contrast cụ thể — WCAG AA?); `02`: "Một instance server **trong bản đồ án**" (không nêu ngưỡng nào thì phải scale).

---

## 7. DUPLICATE INFORMATION

### BA-D-01 — Bảng "Đăng Ký Kiểm Thử Tự Động" lặp nguyên văn ở 3 file (P1)
`handoff/PROGRESS.md`, `reviews/REMEDIATION-STATUS.md`, `test-reports/final-coverage.md` chứa **cùng một bảng** (7 dòng: unit 298 / integration 82 / media 8 / e2e 94 / AI 20 / load 1 / Orca 8) cùng phần "Giải Thích Minh Bạch Chênh Lệch Số Lượng Test" lặp lại.
**Rủi ro:** lần chạy test tiếp theo phải sửa 3 nơi; sửa sót 1 nơi sẽ tạo contradiction mới. Vi phạm RULE 3 (One Source of Truth).
**Khuyến nghị:** canonical = `test-reports/final-coverage.md`; hai file kia reference link.

### BA-D-02 — Trạng thái 32 issue lặp ở 2 nơi (P2)
`handoff/PROGRESS.md` (bảng registry 32 dòng) và `docs/issues/README.md` (DAG + trạng thái). Hiện chưa lệch, nhưng cùng loại rủi ro.

### BA-D-03 — Phạm vi sản phẩm lặp ở 3 nơi (P2)
`docs/README.md` §"Phạm vi đã chốt", `specs/01-PRODUCT.md` §"Mục tiêu và ranh giới", `handoff/DEFENSE.md`. Nội dung tương thích, nhưng canonical phải là `01-PRODUCT.md`; hai chỗ kia nên tóm tắt + link.

---

## 8. MISSING FLOWS / SCREENS / STATES / EDGE CASES

### 8.1 Flow thiếu
- **FLOW-ABANDON** — người chơi online nhưng không đi nước (BA-G-01). **Không tồn tại.**
- **FLOW-NOTIFY** — vòng đời lời mời khi người nhận offline (BA-G-02). Có API, không có flow/screen.
- **FLOW-KICK** — đuổi 1 spectator (BA-G-03). Media layer tham chiếu, business không có.

### 8.2 Screen/modal thiếu mô tả (BA-A-04)
Invite Modal · Match Result Modal · Join-by-code · Confirm-resign · Spectator list · Invitation inbox (`GET /invitations` không có route).

### 8.3 State — đánh giá: **tốt**
Room `WAITING→PLAYING→FINISHED→CLOSED` (+ `FINISHED→PLAYING` qua rematch) và Match `ACTIVE→FINISHED|INTERRUPTED` được định nghĩa đầy đủ trong `03-STATE-MACHINES.md`, có cả invalid transition, lock order, deadline priority (TIMEOUT > DISCONNECT), và mapping outcome→status. **Không có gap.** Các state phụ (proposal, media generation, ai_job, control lease) đều có. Đây là phần mạnh nhất của bộ tài liệu.

### 8.4 Edge case — đã phủ tốt (ghi nhận)
Đã có: cả hai offline → INTERRUPTED không winner · server restart → SERVER_RESTART · lost ack → retry idempotent trả `appliedVersion` gốc + snapshot mới · duplicate `commandId` khác payload → `COMMAND_ID_REUSED` · multiple tabs → control lease + takeover · undo hủy AI job · race hai vote rematch · viewer thứ 6 · tranh ghế cuối trong transaction · SFU mất mạng → giữ `APPLYING` không báo `APPLIED` giả.

### 8.5 Edge case còn thiếu
- Người chơi không đi nước (BA-G-01).
- Lời mời trực tiếp khi người nhận **đang ở phòng khác** — `ALREADY_IN_ROOM` có trong `ErrorCode` nhưng không có flow mô tả UX phía người mời (có báo không? mời có bị tiêu thụ không?).
- Hai lời mời trực tiếp cùng lúc tới cùng một người từ hai phòng khác nhau — chấp nhận cái nào, cái còn lại ra sao?

---

## 9. INITIAL RECOMMENDATIONS

### 9.1 KHÔNG reorganize docs (khuyến nghị mạnh)
Cấu trúc `specs/ · issues/ · planning/ · handoff/ · reviews/ · test-reports/` **tốt hơn** cấu trúc mẫu `00-overview…08-ba-review` trong brief: nó tách đúng theo vòng đời, đã có traceability, đã có validator tự động kiểm 451+ internal link. Reorganize sẽ phá toàn bộ link, làm hỏng validator, và **không giải quyết bất kỳ finding nào ở trên**. Mọi vấn đề tìm được là *nội dung*, không phải *vị trí file*.

Đề xuất thay vào đó — bổ sung 3 file, giữ nguyên phần còn lại:
```
docs/
├── specs/00-GLOSSARY.md        ← MỚI (RULE 4)
├── specs/10-PERMISSIONS.md     ← MỚI (permission matrix, BA-A-03)
└── ba-review/                  ← MỚI (thư mục này)
    ├── initial-audit.md
    └── open-questions.md       ← sau khi PO trả lời
```

### 9.2 Nâng biên bản phỏng vấn thành Decision Log có ID
`PHONG_VAN_YEU_CAU.md` đã là decision record chất lượng cao (có context, decision, hệ quả, cả "pressure pass"). Chỉ thiếu **ID ổn định**. Gán `DEC-001`…`DEC-024` tương ứng Câu 1–24, giữ nguyên nội dung. Chi phí thấp, lợi ích traceability cao.

### 9.3 Mở rộng TRACEABILITY.md sang downstream
Hiện: `R → issue → gate`. Bổ sung 2 cột: `→ screen/route` và `→ AC ID`, để thoả yêu cầu `Requirement → Flow → Screen → BR → AC` của brief.

### 9.4 Khử trùng lặp theo BA-D-01/02/03
Chọn canonical, thay bản sao bằng link. Nên làm **trước** lần chạy test tiếp theo.

### 9.5 Sửa BA-C-02 là ưu tiên số 1 về nội dung
Đây là lỗi duy nhất trong bộ này có thể khiến developer/QA mới implement **sai**. Chi phí sửa thấp (2 file, ~10 dòng), rủi ro không sửa cao.

---

## 10. ĐÁNH GIÁ DOCUMENTATION READINESS

**Điểm: 7.5/10 — READY WITH CORRECTIONS** (không chấm cảm tính; căn cứ bên dưới)

| Tiêu chí | Điểm | Căn cứ |
|---|---|---|
| Độ phủ requirement | 9/10 | 30/30 module có requirement, trừ 3 gap thật (BA-G-01/02/03) |
| Tính testable | 9/10 | Hầu hết có số đo cụ thể (300/1000/3000ms, p95<100ms, 5 viewer, 60s grace); rất ít câu chủ quan |
| Tính nhất quán | **5/10** | 1 contradiction P0 về trạng thái (BA-C-01), 1 P0 về toạ độ (BA-C-02), 1 P1 brief-vs-spec (BA-C-04) |
| One Source of Truth | **6/10** | 3 cụm trùng lặp (BA-D-01/02/03) |
| Terminology | **6/10** | **Không có glossary.** Hai bộ từ vựng song song cho cùng khái niệm: `SPECTATOR`/`WATCH`/"người xem"/"viewer"; `PLAYER`/`PLAY`; "ván"/"match"/"game"; "phòng"/"room" |
| Traceability | 8/10 | R→issue→gate tốt; thiếu R→screen, R→AC |
| State machine | 10/10 | Đầy đủ, có invalid transition, lock order, deadline priority |
| Edge case | 8/10 | Phủ rất tốt; thiếu abandon + 2 case invite |
| Tách WHAT/HOW | 9/10 | 01 = WHAT, 02 = HOW, tách rõ ràng — làm tốt hơn đa số dự án |
| Trung thực về giới hạn | 10/10 | Ghi rõ NOT_RUN, giới hạn self-host vs Cloud, không hứa Elo, không biến dự kiến thành bằng chứng |

**Kết luận:** bộ tài liệu này **đủ chất lượng để implement** (và thực tế đã được implement). Nó **không** ở trạng thái "requirement mơ hồ" như brief giả định. Vấn đề thực sự là: (a) hai contradiction P0 cần sửa, (b) 3 gap nghiệp vụ thật cần PO quyết, (c) thiếu glossary + permission matrix, (d) trùng lặp cần khử.

**Không nâng lên 9–10 vì:** BA-C-01 nằm ở đúng file mà người mới đọc đầu tiên; BA-C-02 là lỗi có thể gây implement sai và đã từng bị đóng mà không sửa; thiếu glossary là vi phạm trực tiếp RULE 4.

---

## 11. QUESTION BACKLOG — ROUND 1 (P0/P1)

> Chỉ 9 câu. Nhóm theo domain. **Không tự quyết bất kỳ câu nào.**

### Q-001 — Vai trò của thư mục `XIANGQI-Design` là gì? · **P0 · Meta**
**Related:** toàn bộ tài liệu
**Tài liệu hiện nói:** `docs/` ở đây giống hệt từng byte `docs/` trong `/Users/twot/Documents/CODE/XIANGQI` (repo có mã nguồn, git HEAD `332ae5b`). Thư mục này không phải git repo, `README.md` rỗng, `AGENTS.md` đã bị ghi đè bằng prompt BA.
**Problem:** Không rõ đây là bản sao để audit, hay sẽ trở thành nguồn tài liệu chính thức tách khỏi code.
**Why it matters:** Quyết định **mọi thay đổi tiếp theo viết vào đâu**. Nếu sửa ở đây mà repo thật không đồng bộ → tạo ngay contradiction mới giữa hai bản.
**Options:**
- **A.** Bản sao tạm để audit → tôi ghi báo cáo ở đây, các sửa đổi cuối cùng áp vào `XIANGQI/docs/`.
- **B.** Đây là nguồn chính thức mới, `XIANGQI/docs/` sẽ được đồng bộ ngược từ đây.
- **C.** Hai bản tồn tại song song với vai trò khác nhau (cần định nghĩa rõ).
**BA Recommendation (chỉ là khuyến nghị):** **A.** Tài liệu nên sống cùng mã nguồn để link `apps/server/src/...` còn giá trị và validator còn chạy được.
**Decision needed:** chọn A/B/C.

---

### Q-002 — Người chơi online nhưng không đi nước thì xử lý thế nào? · **P0 · Game lifecycle**
**Related:** R08, R09, BA-G-01
**Tài liệu hiện nói:** mặc định **không giới hạn thời gian**; R09 chỉ xử lý mất kết nối (60s); rời phòng khi đang chơi = đầu hàng; một tài khoản chỉ ở một phòng.
**Problem:** Ván treo vô thời hạn. Đối thủ chỉ có thể đầu hàng (thua) hoặc chờ mãi, và bị khoá không tạo được phòng khác hay chơi AI.
**Why it matters:** xảy ra ở **chế độ mặc định**, không phải edge case hiếm. Có thể bị lợi dụng để khoá tài khoản đối thủ.
**Options:**
- **A.** Thêm deadline mỗi nước khi `timeControl=0` (ví dụ 5 phút/nước); hết hạn → xử như DISCONNECT (bên không đi thua).
- **B.** Thêm nút "Yêu cầu kết thúc do bỏ bàn": sau N phút đối thủ không đi, người còn lại được claim thắng.
- **C.** Cho phép rời phòng mà **không** bị tính thua nếu đối thủ đã không đi quá N phút → ván `INTERRUPTED`, không winner.
- **D.** Đổi mặc định sang có giới hạn (5/10/15 phút) để vấn đề tự biến mất.
- **E.** Chấp nhận hiện trạng — đây là đồ án, không cần xử lý.
**BA Recommendation (chỉ là khuyến nghị):** **C** — rẻ nhất, không thêm luật thắng/thua mới, không đụng finalizer, và giải quyết đúng vấn đề cốt lõi (người chơi bị kẹt). **A** đúng đắn nhất về mặt sản phẩm nhưng phải đụng clock/scheduler/AC.
**Decision needed:** chọn phương án, và nếu A/B/C thì cho biết **N** bằng bao nhiêu phút.

---

### Q-003 — Lời mời trực tiếp khi người nhận không online thì sao? · **P1 · Invite**
**Related:** R02, R03, BA-G-02
**Tài liệu hiện nói:** `invitation:received` qua socket; `GET /invitations` trả ≤20 pending/recent; lời mời trực tiếp **hết hạn 10 phút**; `03-STATE-MACHINES.md` ghi "không cần bổ sung tính năng thông báo ngoài room".
**Problem:** `GET /invitations` tồn tại nhưng **không có route/màn hình nào** trong danh sách routes. Không rõ có badge/toast/persist hay không.
**Why it matters:** nếu chỉ real-time, mời bạn gần như chỉ dùng được khi cả hai đang cùng mở app — làm R02 mất phần lớn giá trị.
**Options:**
- **A.** Thêm Invitation Inbox: badge đếm trên navbar + danh sách, đọc `GET /invitations` khi login.
- **B.** Chỉ toast real-time; ai offline thì mất lời mời (hiện trạng).
- **C.** Giữ real-time nhưng kéo dài hạn (ví dụ 60 phút) và hiện lại khi login trong hạn.
**BA Recommendation (chỉ là khuyến nghị):** **A** — API đã có sẵn, chỉ thiếu màn hình; chi phí thấp nhất so với giá trị.
**Decision needed:** chọn A/B/C; nếu C thì thời hạn bao lâu.

---

### Q-004 — Chủ phòng có được đuổi **một** người xem cụ thể không? · **P1 · Spectator**
**Related:** R04, BA-G-03
**Tài liệu hiện nói:** `06-MEDIA.md` nhắc "kick viewer" **hai lần** và đã thiết kế sẵn rotation cho tình huống đó. Nhưng không có requirement/endpoint/BR nào. Cơ chế duy nhất là đổi visibility hoặc rotate watch code → thu hồi **toàn bộ** người xem.
**Problem:** tài liệu media đang tham chiếu một tính năng không tồn tại ở tầng nghiệp vụ.
**Why it matters:** hoặc thiếu tính năng, hoặc spec media sai. Phải sửa một trong hai — không thể để nguyên.
**Options:**
- **A.** Thêm kick 1 spectator: `POST /rooms/:id/members/:userId/remove` (owner only), người bị kick không tự vào lại bằng mã cũ.
- **B.** Không thêm; sửa `06-MEDIA.md` bỏ chữ "kick viewer", chỉ còn "thu hồi toàn bộ".
- **C.** Không thêm ở bản này nhưng ghi vào backlog và sửa spec media cho khớp hiện trạng.
**BA Recommendation (chỉ là khuyến nghị):** **B hoặc C** cho bản đồ án — mã nguồn đã hoàn thành, thêm tính năng lúc này tốn kém; sửa 2 dòng spec là đủ để hết mâu thuẫn. Chọn **A** nếu PO coi chống quấy rối là bắt buộc.
**Decision needed:** chọn A/B/C.

---

### Q-005 — Xác nhận: hệ thống **không** hỗ trợ guest, đúng không? · **P1 · Auth**
**Related:** R01, R04, BA-G-04
**Tài liệu hiện nói:** không có từ "guest" ở bất kỳ spec nào. Suy ra từ: "PUBLIC cho **tài khoản hoàn tất onboarding** xem khi còn chỗ" + mọi route đều Bearer + onboarding gate.
**Problem:** quyết định tồn tại nhưng chỉ ở dạng ngầm định rải rác. Brief của PO lại hỏi thẳng về guest.
**Why it matters:** câu hỏi đầu tiên của mọi developer/QA mới. Cần một câu khẳng định tường minh.
**Options:**
- **A.** Xác nhận không hỗ trợ guest → tôi viết thành requirement tường minh trong `01-PRODUCT.md`. **Không đổi hành vi, không đụng code.**
- **B.** Muốn cho guest xem phòng PUBLIC (read-only, không chat) → đây là **thay đổi phạm vi**, cần issue mới.
**BA Recommendation (chỉ là khuyến nghị):** **A** — khớp hiện trạng, chi phí bằng 0.
**Decision needed:** A hay B.

---

### Q-006 — Chính sách phiên đăng nhập: có "ghi nhớ đăng nhập" / thời hạn không? · **P1 · Auth**
**Related:** R01, BA-G-05
**Tài liệu hiện nói:** `persistSession:true`, `autoRefreshToken:true`, có `logout {CURRENT|ALL}`. Không có quyết định nghiệp vụ nào về thời hạn.
**Problem:** hành vi hiện tại = mặc định kỹ thuật của Supabase (đăng nhập vĩnh viễn tới khi logout). Đây là **technical default đang đóng vai business rule** — vi phạm RULE 6.
**Why it matters:** nếu demo trên máy chung/máy trường, phiên vĩnh viễn là rủi ro thật.
**Options:**
- **A.** Giữ nguyên, ghi tường minh thành BR: "phiên duy trì đến khi đăng xuất; không có ghi nhớ tuỳ chọn".
- **B.** Thêm checkbox "Ghi nhớ đăng nhập": bỏ tick → `sessionStorage`, đóng browser là mất phiên.
- **C.** Thêm tự đăng xuất sau N ngày không hoạt động.
**BA Recommendation (chỉ là khuyến nghị):** **A** cho bản đồ án; **B** nếu có demo trên máy dùng chung.
**Decision needed:** chọn A/B/C.

---

### Q-007 — Trạng thái chính thức của dự án là gì, và file nào là canonical? · **P0 · Meta**
**Related:** BA-C-01
**Tài liệu hiện nói:** `docs/README.md` + `READINESS.md` + `08-TEST-EXECUTION.md` ⇒ "chưa có mã, chưa chạy test". `PROGRESS.md` + `final-coverage.md` ⇒ "LOCAL_COMPLETE, 482 test PASS". Repo thật có mã nguồn đầy đủ.
**Problem:** developer mới đọc `docs/README.md` trước tiên và sẽ hiểu sai hoàn toàn.
**Why it matters:** contradiction nằm ở đúng entry point.
**Options:**
- **A.** `PROGRESS.md` là canonical về trạng thái → tôi sửa `docs/README.md` và `READINESS.md` thành "*plan đã thực thi xong local; trạng thái hiện tại xem PROGRESS.md*", và thêm ghi chú thời điểm cho các câu "chưa chạy test".
- **B.** Có lý do khác khiến README cố ý giữ nguyên (ví dụ tài liệu nộp kèm đồ án phải mô tả giai đoạn plan).
**BA Recommendation (chỉ là khuyến nghị):** **A** — kèm thêm một dòng "Trạng thái cập nhật lần cuối: <ngày>" ở đầu mỗi file trạng thái để tránh tái diễn.
**Decision needed:** A hay B; nếu A thì xác nhận cho tôi sửa 2 file đó (sau khi có Q-001).

---

### Q-008 — Chuẩn toạ độ bàn cờ: lấy mã nguồn hay lấy spec? · **P0 · Chess rules**
**Related:** R05, R07, BA-C-02, BA-C-03, finding F-17/F-26
**Tài liệu hiện nói:**
- `07-UI-AND-TESTS.md:21`: tướng BLACK (4,0), RED (4,9); tốt đỏ (4,4) "đã qua sông".
- `08-TEST-EXECUTION.md`: F-MATE = BLACK GENERAL(4,0), RED GENERAL(4,9), RED ROOK(3,2)(4,2)(5,2) — tuyên bố là "đáp án độc lập review tay".
- **Mã nguồn:** RED ở y=0..4 (đáy), BLACK ở y=5..9; fixture thật = RED GENERAL(4,0), BLACK GENERAL(4,9), RED ROOK(3,9)(5,9)(4,7).
- `REMEDIATION-STATUS.md` đóng F-17 = `CONFIRMED` với ghi chú "đã làm rõ trong tài liệu" — **nhưng spec 07/08 chưa được sửa**.
**Problem:** ba thứ lệch nhau: trục y ngược; fixture trong spec khác hẳn fixture đã implement; ví dụ aria-label "hàng 10" và "tốt (4,4) đã qua sông" đều sai theo mã nguồn.
**Why it matters:** đây là lỗi duy nhất trong bộ tài liệu có thể khiến hai team implement ra hai behavior khác nhau. Và finding từng được đóng bằng ghi chú thay vì sửa — nếu lặp lại, nó sẽ tiếp tục tồn tại.
**Options:**
- **A.** Mã nguồn là canonical (RED y=0 đáy, BLACK y=9) → tôi sửa `07` và `08`: lật toạ độ, **thay F-MATE/F-STALEMATE bằng đúng fixture đang dùng**, sửa ví dụ aria-label và "tốt đã qua sông". Không đụng code.
- **B.** Spec là canonical → phải đổi mã nguồn + toàn bộ fixture + test. Chi phí rất cao, rủi ro hồi quy lớn.
- **C.** Giữ nguyên, chỉ thêm ghi chú cảnh báo ở đầu 2 file.
**BA Recommendation (chỉ là khuyến nghị):** **A**, dứt khoát. Đồng thời đổi verdict F-17 từ `CONFIRMED` sang `FIXED` **chỉ sau khi** spec đã thực sự sửa — và bổ sung ngữ nghĩa `isSquareAttackedBy` vào `04-CONTRACTS.md` để đóng F-26 đúng cách.
**Decision needed:** chọn A/B/C.

---

### Q-009 — Xác nhận giới hạn người xem là **5**, không phải 2 · **P1 · Spectator**
**Related:** R04, BA-C-04
**Tài liệu hiện nói:** brief của PO (mục 6) ghi "*tối đa **2 spectator***". Nhưng `PHONG_VAN_YEU_CAU.md` Câu 7 ghi PO đã **nâng 2 → 5**, và yêu cầu đổi mọi con số cũ thành 5 người xem / 7 thành viên. Spec, DB (`trần 5 người xem`), test (5 viewer + viewer thứ 6 bị từ chối), mã nguồn đều theo **5**. Con số 2 chỉ còn trong `DU_AN_CO_TUONG_ONLINE.md` — file đã có banner SUPERSEDED.
**Problem:** brief mới nhất của PO mâu thuẫn với quyết định PO đã chốt trước đó.
**Why it matters:** nếu **5** đúng → không cần làm gì (và tôi bỏ qua con số trong brief). Nếu **2** là quyết định mới → phải sửa spec + DB constraint + test + load test (70 client → 40) + mã nguồn.
**Options:**
- **A.** **5** vẫn đúng; con số 2 trong brief là do trích nhầm từ tài liệu cũ.
- **B.** Đổi lại thành **2** — đây là thay đổi phạm vi thật, cần issue riêng.
**BA Recommendation (chỉ là khuyến nghị):** **A** — mọi bằng chứng đều chỉ về 5. Nhưng **tôi không tự kết luận**, vì brief là phát ngôn mới nhất của PO.
**Decision needed:** A hay B.

---

## 12. CÂU HỎI HOÃN SANG ROUND SAU

Đã soạn nhưng **chưa hỏi** ở round này (P2, không blocking): BA-A-01 spectator join giữa trận · BA-A-02 sảnh có hiện phòng FINISHED không · BA-A-04 close/cancel behavior của từng modal · BA-A-05 chuẩn contrast (WCAG AA?) · hai lời mời cùng lúc tới một người · UX khi mời người đang ở phòng khác · BA-D-01/02/03 khử trùng lặp (là việc làm, không phải câu hỏi).

Round dự kiến: **R2** Room + Invite + Spectator (P2) · **R3** UI/Screen inventory + permission matrix · **R4** Glossary review.

---

## 13. ĐIỀU TÔI KHÔNG LÀM Ở PHASE NÀY

Theo đúng STARTING PROCEDURE:
- Không sửa bất kỳ file tài liệu nào (chỉ **tạo mới** file audit này).
- Không reorganize docs.
- Không tự trả lời Q-001…Q-009.
- Không viết/sửa mã nguồn.
- Không xoá file nào, kể cả file có dấu hiệu trùng lặp.

**DỪNG — chờ Product Owner trả lời Round 1.**
