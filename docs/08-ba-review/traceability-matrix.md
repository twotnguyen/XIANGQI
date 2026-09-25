# MA TRẬN TRUY VẾT

**ID:** `TRC` · **Trạng thái:** v1 · **Cập nhật:** 2026-09-21

Mỗi yêu cầu được truy từ **nghiệp vụ → luồng → màn hình → luật → nghiệm thu**.
Yêu cầu nào **thiếu** một khâu là dấu hiệu tài liệu chưa đủ.

---

## 1. MA TRẬN CHÍNH

| Yêu cầu | Tài liệu yêu cầu | Luồng | Màn hình | Luật | Nghiệm thu |
|---|---|---|---|---|---|
| **R01** Tài khoản | REQ-AUTH | FLOW-AUTH | LOGIN · REGISTER · FORGOT · RESET · VERIFY · ONBOARDING · SETTINGS | `BR-AUTH-01..17` | `AC-AUTH-01..14` |
| **R02** Bạn bè | REQ-PROFILE-FRIENDS | FLOW-AUTH | FRIENDS · NAVBAR | `BR-FRD-01..13` | `AC-FRD-01..15` |
| **R03** Phòng + mời | REQ-ROOM · REQ-INVITE · REQ-LOBBY | FLOW-CREATE-ROOM · FLOW-JOIN-ROOM | LOBBY · CREATE-ROOM · WAITING-ROOM · INVITE-MODAL · JOIN-BY-CODE | `BR-ROOM-01..18` · `BR-INV-01..18` · `BR-LOB-01..08` | `AC-ROOM-01..17` · `AC-INV-01..19` · `AC-LOB-01..11` |
| **R04** Riêng tư + 5 người xem | REQ-SPECTATOR · REQ-ROOM | FLOW-SPECTATOR · FLOW-JOIN-ROOM | SPECTATOR-LIST · ROOM-SETTINGS · ACCESS-DENIED | `BR-SPEC-01..16` | `AC-SPEC-01..19` |
| **R05** Bàn cờ + luật | REQ-BOARD | FLOW-MATCH | GAME-ROOM | `GR-COORD` · `GR-MV-01..07` · `GR-SAFE-01..04` · `BR-BRD-01..14` | `AC-BRD-01..14` · `TS-RULE-01..21` |
| **R06** Đồng bộ | REQ-MATCH | FLOW-MATCH | GAME-ROOM · RECONNECTING | `BR-MAT-01..16` | `AC-MAT-01..17` |
| **R07** Luật kết thúc | REQ-MATCH · game-rules | FLOW-MATCH | MATCH-RESULT | `GR-END-01..05` | `AC-MAT-*` · `TS-RULE-01..04` |
| **R08** Đồng hồ | REQ-CLOCK | FLOW-MATCH | CREATE-ROOM · GAME-ROOM | `BR-CLK-01..17` | `AC-CLK-01..15` |
| **R09** Mất kết nối | REQ-DISCONNECT | FLOW-DISCONNECT | RECONNECTING · MEDIA-TAB-SWITCH | `BR-DIS-01..17` | `AC-DIS-01..16` |
| **R10** Chat 2 kênh | REQ-CHAT | FLOW-MATCH · FLOW-SPECTATOR | CHAT-PANEL | `BR-CHT-01..23` | `AC-CHT-01..20` |
| **R11** Camera/mic | REQ-MEDIA | FLOW-MEDIA | MEDIA-PANEL · MEDIA-TAB-SWITCH | `BR-MED-01..20` | `AC-MED-01..17` · `TS-MED-01..12` |
| **R12** Chơi với máy | REQ-AI | FLOW-AI | AI-SETUP · AI-GAME | `BR-AI-01..31` | `AC-AI-01..19` · `TS-AI-01..10` |
| **R13** Thao tác trong ván | REQ-GAME-ACTIONS | FLOW-MATCH | CONFIRM-RESIGN · PROPOSAL-PROMPT | `BR-ACT-01..18` | `AC-ACT-01..20` |
| **R14** Tái đấu + lịch sử | REQ-HISTORY-REMATCH | FLOW-MATCH | MATCH-RESULT · HISTORY · REPLAY | `BR-HIS-01..20` | `AC-HIS-01..19` |
| **R15** Máy tính + điện thoại | REQ-BOARD · design-tokens | (mọi luồng) | (mọi màn hình) | `DT-01..20` | `TS-UI-01..12` |
| **R16** Nghiệm thu + bàn giao | acceptance-criteria · deployment | — | — | `AC-RULE-01..06` · `DEP-01..16` | `TS-MAN-01..06` |
| **R17** ⭐ Chống treo ván | REQ-INACTIVITY | **FLOW-INACTIVITY** | **INACTIVITY-PROMPT** | `BR-INA-01..13` | `AC-INA-01..16` · `TS-TIME-02..08` |
| **R18** ⭐ Đuổi người xem | REQ-SPECTATOR §6 | **FLOW-SPECTATOR §4** | **SPECTATOR-LIST · CONFIRM-KICK** | `BR-SPEC-10..13` | `AC-SPEC-10..14` |
| **R19** ⭐ Hộp thư lời mời | REQ-INVITE §5.4 | **FLOW-JOIN-ROOM §4** | **INVITATION-INBOX** · NAVBAR | `BR-INV-16` | `AC-INV-16..17` |

**Kết quả: 19/19 yêu cầu có đủ cả 5 khâu.** Không có yêu cầu nào thiếu luồng, màn hình, luật hay nghiệm thu.

---

## 2. TRUY NGƯỢC: QUYẾT ĐỊNH → TÀI LIỆU

| Quyết định | Nội dung | Đã ghi vào |
|---|---|---|
| `DEC-001` | XIANGQI-Design là nguồn chính thức, mục tiêu xây lại | README · toàn bộ cấu trúc |
| `DEC-002` | Chống treo ván 3 phút → 30 giây | REQ-INACTIVITY · FLOW-INACTIVITY · scope R17 |
| `DEC-003` | Toạ độ theo spec | game-rules §1 · REQ-BOARD |
| `DEC-004` | Có đuổi người xem | REQ-SPECTATOR §6 · scope R18 |
| `DEC-005` | 5 người xem | scope · REQ-SPECTATOR · business-rules §3 |
| `DEC-006` | Không hỗ trợ khách | REQ-AUTH `BR-AUTH-09` · actors ACT-01 |
| `DEC-007` | Phiên 30 ngày + ghi nhớ | REQ-AUTH `BR-AUTH-10` · session-state §2 |
| `DEC-008` | Hộp thư lời mời | REQ-INVITE §5.4 · scope R19 |
| `DEC-009` | Chuẩn tài liệu 15 mục | Mọi file REQ-* |
| `DEC-010` | Chỉ ván không giới hạn | `BR-INA-08` · REQ-CLOCK · FLOW-INACTIVITY §1 |
| `DEC-011` | 2 lần gia hạn liên tiếp | `BR-INA-03/04` · FLOW-INACTIVITY §3 |
| `DEC-012` | Không áp dụng ván với máy | `BR-INA-09` · `BR-AI-12` |
| `DEC-013` | Đối thủ + người xem đều thấy | `BR-INA-10` · REQ-SPECTATOR · data-flows §5 |
| `DEC-014` | Cả hai người chơi đuổi được | `BR-SPEC-10` · permissions §5 |
| `DEC-015` | Chặn trong phạm vi phòng | `BR-SPEC-11/12` · data-model §2.5 |
| `DEC-016` | 4 chi tiết BA tự quyết | `BR-INA-06/07/10` · glossary §8 |
| `DEC-017` | Cấu trúc + tiếng Việt | Toàn bộ `docs/` |
| `DEC-018` | **Kênh chung**: người chơi đọc/gửi được, có công tắc ẩn/hiện độc lập | REQ-CHAT · permissions §7 · glossary §6 · actors · scope R10 · data-flows §3 |
| `DEC-019` | Hết nước đi **giữ nguyên là THUA** | Không đổi gì — `GR-END-01`, R07, `F-STALEMATE` giữ nguyên |
| `DEC-020` | **Bỏ khoá tab** cho phần chơi cờ và chat | session-state v2 · permissions (bỏ cột tab) · glossary §5 · REQ-DISCONNECT · REQ-CHAT · REQ-INACTIVITY · REQ-ROOM · data-flows §9 |
| `DEC-021` | Camera/mic: **tab bật trước giữ**, tab khác có nút chuyển | REQ-MEDIA `BR-MED-18..20` · session-state §4 · `SCR-MEDIA-TAB-SWITCH` |
| `DEC-022` | Người xem vào được **giữa trận** | REQ-SPECTATOR `BR-SPEC-17` |
| `DEC-023` | Sảnh **không** hiện phòng đã xong ván; mã/link vẫn vào được | REQ-LOBBY `BR-LOB-09/10` · REQ-SPECTATOR `BR-SPEC-18` |
| `DEC-024` | **WCAG 2.1 AA** + số đo thật + `DT-21` phân biệt hai phe | design-tokens §2 · REQ-BOARD `BR-BRD-15` · `TS-UI-13/14` |
| `DEC-025` | **Stack chính thức: TypeScript toàn bộ** + `TECH-07..11` | 09-technical/tech-stack v2 · architecture `ARCH-15/16` · deployment `DEP-13` |

**25/25 quyết định đã được viết vào tài liệu.**

---

## 3. TRUY NGƯỢC: LỖI LẦN TRƯỚC → PHÒNG NGỪA

| Lỗi cũ | Luật phòng ngừa | Kiểm thử hồi quy |
|---|---|---|
| Đi nước mới sau đi lại gây lỗi trùng khoá | `BR-MAT-09` · data-model §2.8 (cây nước đi) | `TS-REG-01` · `AC-MAT-12` |
| Đếm lặp tính cả nhánh đã bỏ | `BR-MAT-10` · `GR-END-02` | `TS-REG-02` · `AC-MAT-11` |
| Vào phòng theo mã bỏ qua kiểm chế độ | `BR-LOB-08` · FLOW-JOIN-ROOM §1 | `TS-REG-03` · `TS-AUTH-15` |
| Thu hồi quyền người xem là code chết | `BR-SPEC-06` · `BR-MED-06` | `TS-REG-04` · `AC-MED-07` |
| Không có bộ đếm thời hạn | `ARCH-08` (5 bộ đếm) | `TS-REG-05` · `TS-TIME-*` |
| Test dữ liệu tự mock chính nó | `AC-RULE-02` · quy tắc kiểm thử §3.5 | `TS-REG-06` |
| **Toạ độ spec ngược với mã nguồn** | `DEC-003` · `GR-COORD` | `TS-RULE-01/02` |

**7/7 lỗi trọng yếu đã có luật phòng ngừa và kiểm thử hồi quy.**

---

## 4. KIỂM TRA NGƯỢC: CÓ GÌ THỪA KHÔNG

| Câu hỏi | Kết quả |
|---|---|
| Màn hình nào **không phục vụ** yêu cầu nào? | **Không có** — xem screen-inventory §7 |
| Luồng nào **không thuộc** yêu cầu nào? | **Không có** — 9/9 luồng đều map |
| Luật nào **không thuộc** module nào? | **Không có** — 290 luật đều có tiền tố module |
| Hành động nào **không có đích**? | **Không có** — xem screen-inventory §8 |
| Cửa sổ nào **không đóng được**? | **4 cửa sổ chặn có chủ ý** — xem screen-inventory §5 |

---

## 5. LIÊN QUAN

[initial-audit.md](initial-audit.md) · [open-questions.md](open-questions.md) · [../07-decisions/decision-log.md](../07-decisions/decision-log.md) · [../06-acceptance/](../06-acceptance/)
