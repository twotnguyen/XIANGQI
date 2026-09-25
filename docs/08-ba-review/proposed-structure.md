# ĐỀ XUẤT CẤU TRÚC TÀI LIỆU MỚI

**Ngày:** 2026-09-21 · **Trạng thái:** chờ PO duyệt · **Căn cứ:** `DEC-001`, `DEC-009`

---

## 1. TÔI ĐẢO LẠI KHUYẾN NGHỊ Ở PHASE 1 — VÀ ĐÂY LÀ LÝ DO

Ở báo cáo Phase 1 tôi khuyến nghị **không reorganize** docs. Khuyến nghị đó dựa trên ba tiền đề:

1. Tài liệu **mô tả mã nguồn đã chạy** ⇒ đường dẫn `apps/server/src/...` có giá trị thật.
2. Có validator Python kiểm **451+ internal link** ⇒ đổi cấu trúc làm hỏng validator.
3. Mọi vấn đề tìm được là **nội dung**, không phải **vị trí file**.

`DEC-001` đã phủ định cả ba:

| Tiền đề cũ | Sau `DEC-001` |
|---|---|
| Docs mô tả code đã chạy | Docs để **code lại từ đầu**; code cũ thành tham chiếu lịch sử |
| Link tới code có giá trị | Code chưa tồn tại ⇒ link tới `apps/...` là **dangling** |
| Vấn đề chỉ là nội dung | PO yêu cầu người mới **đọc hiểu toàn bộ dự án** ⇒ vị trí và thứ tự đọc **trở thành** vấn đề |

Thêm vào đó, cấu trúc cũ (`specs/ · issues/ · handoff/ · test-reports/`) được tổ chức theo **vòng đời thực thi của agent** (spec → issue → evidence). Nó phục vụ tốt một agent đang code tuần tự, nhưng **không** phục vụ một người mới muốn hiểu "chức năng mời bạn hoạt động thế nào" — thông tin đó hiện nằm rải ở 01, 03, 04, 09 và ISSUE-011.

**Kết luận: reorganize là đúng — nhưng chỉ vì tiền đề đã đổi, không phải vì cấu trúc cũ kém.**

---

## 2. NGUYÊN TẮC THIẾT KẾ

1. **Đọc tuần tự được.** `docs/README.md` → 00 → 01 → ... Người mới đọc từ đầu tới cuối là hiểu.
2. **Tra cứu ngang được.** Người đã biết dự án muốn tra "quyền của spectator" phải tới thẳng một file.
3. **Một chức năng = một file.** Không phải đọc 5 file để hiểu 1 tính năng.
4. **WHAT tách khỏi HOW.** `01-requirements/` không chứa tên công nghệ. Stack nằm riêng.
5. **Không xoá gì.** Toàn bộ tài liệu lần build trước chuyển vào `99-archive/`, giữ nguyên nội dung.
6. **Mỗi file có ID ổn định** để traceability.

---

## 3. CẤU TRÚC ĐỀ XUẤT

```
docs/
├── README.md                         ★ ĐIỂM VÀO — thứ tự đọc bắt buộc
│
├── 00-overview/
│   ├── product-overview.md           Sản phẩm là gì, cho ai, giải quyết gì
│   ├── scope.md                      Trong/ngoài phạm vi (dứt khoát)
│   ├── glossary.md                   ★ Thuật ngữ thống nhất (RULE 4)
│   └── actors.md                     Guest/User/Host/Player/Opponent/Spectator/AI/System
│
├── 01-requirements/                  ★ WHAT — mỗi file đủ 15 mục theo DEC-009
│   ├── README.md                     Danh mục R01…Rxx + trạng thái
│   ├── REQ-AUTH.md                   Đăng ký, đăng nhập, xác minh, khôi phục, Google, phiên
│   ├── REQ-PROFILE-FRIENDS.md        Hồ sơ, kết bạn, presence
│   ├── REQ-LOBBY.md                  Sảnh, danh sách phòng công khai
│   ├── REQ-ROOM.md                   Tạo phòng, ghế, ready, chế độ riêng tư, rời phòng
│   ├── REQ-INVITE.md                 Mời trực tiếp, link, mã phòng
│   ├── REQ-SPECTATOR.md              Vào xem, trần 5, thu hồi, đuổi người xem (DEC-004)
│   ├── REQ-BOARD.md                  Khởi tạo bàn cờ, hiển thị, thao tác
│   ├── REQ-CHESS-RULES.md            Luật xiangqi-simple-v1 đầy đủ
│   ├── REQ-MATCH.md                  Vòng đời ván, lượt, đồng bộ, kết thúc
│   ├── REQ-CLOCK.md                  Đồng hồ 0/5/10/15
│   ├── REQ-INACTIVITY.md             ★ MỚI — chống treo ván (DEC-002)
│   ├── REQ-DISCONNECT.md             Mất mạng, reconnect, nhiều tab
│   ├── REQ-GAME-ACTIONS.md           Đầu hàng, xin hòa, đi lại
│   ├── REQ-CHAT.md                   2 kênh PLAYERS / SPECTATORS
│   ├── REQ-MEDIA.md                  Camera + mic, 3 mức chia sẻ
│   ├── REQ-AI.md                     Đấu máy, 3 cấp độ
│   └── REQ-HISTORY-REMATCH.md        Lịch sử, xem lại, tái đấu
│
├── 02-flows/                         Sơ đồ luồng người dùng, có nhánh lỗi
│   ├── FLOW-AUTH.md
│   ├── FLOW-CREATE-ROOM.md
│   ├── FLOW-JOIN-ROOM.md             (player + spectator + mã + link)
│   ├── FLOW-MATCH.md                 Ván online từ ready tới kết thúc
│   ├── FLOW-INACTIVITY.md            ★ MỚI
│   ├── FLOW-DISCONNECT.md
│   ├── FLOW-MEDIA.md
│   └── FLOW-AI.md
│
├── 03-screens/                       ★ PO yêu cầu: "từng màn hình"
│   ├── screen-inventory.md           Bảng tổng: mọi page/modal/panel
│   ├── SCR-*.md                      Mỗi màn hình: mục đích, layout, phần tử,
│   │                                 state (Loading/Empty/Error/Disabled/Success),
│   │                                 hành động → đích, quyền, responsive
│   └── design-tokens.md              Màu, font, spacing, hit target
│
├── 04-business-rules/
│   ├── business-rules.md             BR-001… tập trung, có ID
│   ├── permissions.md                ★ Ma trận Action × Actor
│   └── game-rules.md                 Toạ độ (DEC-003), luật đi, terminal, lặp
│
├── 05-data-and-realtime/             ★ PO yêu cầu: "luồng dữ liệu"
│   ├── data-model.md                 Thực thể nghiệp vụ + quan hệ (WHAT, không DDL)
│   ├── data-flows.md                 Mỗi event: ai tạo → server validate gì →
│   │                                 state nào đổi → client nào nhận → UI đổi ra sao
│   ├── state-machines.md             Room + Match + Proposal + Media + AI job
│   └── session-state.md              Phiên, tab, control lease
│
├── 06-acceptance/
│   ├── acceptance-criteria.md        AC-001… theo từng requirement
│   └── test-scenarios.md             Kịch bản cho QA
│
├── 07-decisions/
│   ├── decision-log.md               DEC-001…
│   └── interview-log.md              ← chuyển từ planning/PHONG_VAN_YEU_CAU.md
│
├── 08-ba-review/
│   ├── initial-audit.md
│   ├── open-questions.md
│   └── traceability-matrix.md        Requirement → Flow → Screen → BR → AC
│
├── 09-technical/                     HOW — tách hẳn khỏi 01 (RULE 6)
│   ├── architecture.md
│   ├── tech-stack.md
│   └── deployment.md
│
└── 99-archive/                       ★ KHÔNG XOÁ — tài liệu lần build trước
    ├── README.md                     Giải thích đây là gì, vì sao giữ
    ├── specs-v1/                     ← docs/specs/ hiện tại (9 file)
    ├── issues-v1/                    ← docs/issues/ (33 file)
    ├── handoff-v1/                   ← docs/handoff/ (11 file)
    ├── reviews-v1/                   ← docs/reviews/ (2 file)
    ├── test-reports-v1/              ← docs/test-reports/ (35 file)
    ├── research/                     ← docs/planning/RESEARCH_*.md (3 file)
    └── original-analysis.md          ← DU_AN_CO_TUONG_ONLINE.md
```

---

## 4. ĐỐI CHIẾU: TÀI LIỆU CŨ ĐI ĐÂU

**Không file nào bị xoá.** Nội dung được chuyển hoá, bản gốc lưu trong `99-archive/`.

| Tài liệu cũ | Số phận | Đích đến của nội dung |
|---|---|---|
| `specs/01-PRODUCT.md` | Tách nhỏ | → `00-overview/scope.md` + toàn bộ `01-requirements/` |
| `specs/02-ARCHITECTURE.md` | Chuyển | → `09-technical/architecture.md` + `tech-stack.md` + `deployment.md` |
| `specs/03-STATE-MACHINES.md` | Tách | → `05-data-and-realtime/state-machines.md` + `data-flows.md` + `session-state.md` |
| `specs/04-CONTRACTS.md` | Tách đôi | Phần nghiệp vụ → `05/data-model.md`; phần API/type → `09-technical/` |
| `specs/05-AUTH.md` | Tách đôi | WHAT → `REQ-AUTH.md`; HOW (Supabase/PKCE) → `09-technical/` |
| `specs/06-MEDIA.md` | Tách đôi | WHAT → `REQ-MEDIA.md`; HOW (LiveKit/generation) → `09-technical/` |
| `specs/07-UI-AND-TESTS.md` | Tách đôi | UI → `03-screens/`; fixture/test → `06-acceptance/` |
| `specs/08-TEST-EXECUTION.md` | Chuyển | → `06-acceptance/test-scenarios.md` |
| `specs/09-DATABASE-DESIGN.md` | Tách đôi | Thực thể nghiệp vụ → `05/data-model.md`; DDL/RLS → `09-technical/` |
| `planning/PHONG_VAN_YEU_CAU.md` | Chuyển nguyên | → `07-decisions/interview-log.md` |
| `planning/RESEARCH_*.md` | Lưu trữ | → `99-archive/research/` |
| `issues/` (33) | Lưu trữ | → `99-archive/issues-v1/` — kế hoạch build **mới** sinh lại sau khi requirement chốt |
| `handoff/` (11) | Lưu trữ phần lớn | `DEPLOY`/`GOOGLE-SETUP` → `09-technical/deployment.md`; còn lại archive |
| `test-reports/` (35) | Lưu trữ | → `99-archive/test-reports-v1/` — là evidence của **lần build trước** |
| `reviews/` (2) | Lưu trữ | → `99-archive/reviews-v1/` — vẫn có giá trị: 30 finding là bài học cho lần rebuild |
| `DU_AN_CO_TUONG_ONLINE.md` | Lưu trữ | → `99-archive/original-analysis.md` |
| `READINESS.md`, `TRACEABILITY.md` | Thay thế | → `08-ba-review/traceability-matrix.md` |

---

## 5. VÌ SAO GIỮ `99-archive/` THAY VÌ XOÁ

Theo đúng nguyên tắc "không xoá tài liệu chỉ vì thấy redundant trước khi hiểu vai trò":

1. **`reviews-v1/` có giá trị cao nhất.** 30 finding của lần review trước (F-01…F-29) là danh sách **những lỗi thật đã xảy ra** khi implement bộ spec này: undo gây UNIQUE violation, đếm lặp tính cả nhánh đã undo, join theo roomId bỏ qua visibility, thu hồi quyền người xem là code chết... Lần rebuild phải **phòng trước** những lỗi này. Đây là tài sản, không phải rác.
2. **`test-reports-v1/`** chứa số đo thật (p95 67.64ms, 78.86% pruning) — dùng làm mốc so sánh cho bản mới.
3. **`issues-v1/`** là bằng chứng bộ spec này **đã từng phân rã được** thành 32 bước thực thi có DAG không chu kỳ.
4. Nếu sau này PO muốn quay lại dùng mã nguồn cũ, tài liệu tương ứng vẫn còn nguyên vẹn.

---

## 6. THỨ TỰ THỰC HIỆN ĐỀ XUẤT

| Bước | Nội dung | Phụ thuộc |
|---|---|---|
| 1 | `00-overview/` (4 file) — glossary, actors, scope, overview | **Không** — làm được ngay |
| 2 | `04-business-rules/game-rules.md` — luật cờ + toạ độ `DEC-003` | **Không** |
| 3 | `01-requirements/` các file không có open question | **Không** |
| 4 | `REQ-INACTIVITY.md`, `REQ-SPECTATOR.md`, `REQ-INVITE.md`, `REQ-AUTH.md` | **Cần Round 2** (Q-010…Q-017, Q-003, Q-005, Q-006) |
| 5 | `02-flows/`, `03-screens/` | Cần 01 xong |
| 6 | `05-data-and-realtime/` | Cần 01 xong |
| 7 | `04-business-rules/permissions.md` | Cần 01 + 03 |
| 8 | `06-acceptance/` | Cần 01 + 04 |
| 9 | `08-ba-review/traceability-matrix.md` | Cần tất cả |
| 10 | Audit vòng 2 — completeness + consistency | Cần tất cả |

**Bước 1–3 không phụ thuộc Round 2** ⇒ tôi làm ngay trong lúc chờ PO trả lời.

---

## 7. CẦN PO DUYỆT

1. **Cấu trúc thư mục** ở §3 — đồng ý hay muốn đổi?
2. **`99-archive/`** — đồng ý giữ toàn bộ tài liệu cũ thay vì xoá?
3. **Ngôn ngữ tài liệu** — giữ **tiếng Việt** như hiện tại? (Đề xuất: có, vì team đọc tiếng Việt; riêng tên type/enum/ID giữ tiếng Anh cho khớp code.)
