# EP04 · AI máy cờ: lượng giá, tìm kiếm và cổng đo

> **Loại:** Epic · **Story:** [ST04.1](../story/ST04.1-luong-gia-the-co-va-sap-xep-nuoc.md), [ST04.2](../story/ST04.2-tim-kiem-negamax-alpha-beta-va-dao-sau-dan.md), [ST04.3](../story/ST04.3-cong-do-depth-6-3000-ms-va-bo-20-the-co-co-dap-an-tay.md)

| Trường Jira | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | `EP04 · AI máy cờ: lượng giá, tìm kiếm và cổng đo` |
| Components | AI, Tester |
| Priority | Highest |
| Labels | `xq-v2`, `ep04`, `gate`, `critical-path` |
| Fix versions | `v0.2.0` |
| Start date / Due date | 2026-10-05 / 2026-10-08 |
| Nguồn đặc tả | ISSUE-026 … ISSUE-033 |

**Mục tiêu:** AI **tự viết** (không dùng engine có sẵn như Pikafish, không mạng nơ-ron) bằng minimax/negamax + alpha-beta + đào sâu dần, có 3 cấp độ khó. Đây là **nội dung học thuật chính khi bảo vệ đồ án**, nên mọi con số phải đo thật và tái lập được.

**Ba cấp độ (cố định, không được đổi):**
| Cấp | Độ sâu tối đa | Ngân sách suy nghĩ |
|---|---|---|
| EASY (Dễ) | 2 | 300 ms |
| MEDIUM (Trung bình) | 4 | 1000 ms |
| HARD (Khó) | 6 | 3000 ms |

**⛔ Cổng chặn (ISSUE-032):** HARD phải hoàn thành **depth 6** với **p95 ≤ 3000 ms** trên 20 thế × 5 lần lặp (tương tự MEDIUM depth 4 ≤ 1000 ms, EASY depth 2 ≤ 300 ms). **Không đạt ⇒ cấm làm Epic EP15 (tích hợp AI vào ván)** và phải tối ưu theo đúng thứ tự: (1) bỏ cấp phát bộ nhớ trong vòng lặp → (2) cải thiện sắp xếp nước (killer move, history heuristic) → (3) bảng ghi nhớ thế cờ (transposition table) → (4) chỉ khi cả 3 không đủ mới báo trưởng nhóm xét đổi ngôn ngữ **toàn bộ** backend + AI. **Tuyệt đối không hạ độ sâu hay ngân sách** để báo đạt.

**Luật chung cho mọi Task AI:**
- Mã trong `packages/ai/` chỉ import `@xiangqi/contracts` và `@xiangqi/game-rules` (lint đã chặn cái khác).
- Hàm lượng giá và tìm kiếm **không cấp phát object/mảng trong vòng lặp nóng** (không `map`, `filter`, spread, object tạm) — dùng vòng `for` theo chỉ số, tái dùng bộ đệm. Đây là nguyên nhân số 1 khiến AI chậm.
- Kết quả **tất định**: cùng input (thế cờ, độ sâu, seed) → cùng nước, cùng điểm, cùng số node.
- Nước trả về **luôn hợp lệ** (kiểm lại bằng `validateMove`).
- AI **phải xét lịch sử lặp** (`RepetitionCounts`) khi tìm nước.
- Test thời gian dùng **đồng hồ giả tiêm vào**; chỉ benchmark mới dùng `performance.now()` thật.

**Danh sách Story:**
| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST04.1](../story/ST04.1-luong-gia-the-co-va-sap-xep-nuoc.md) | Lượng giá thế cờ và sắp xếp nước | 2 | 3 |
| [ST04.2](../story/ST04.2-tim-kiem-negamax-alpha-beta-va-dao-sau-dan.md) | Tìm kiếm negamax, alpha-beta và đào sâu dần | 2 | 5 |
| [ST04.3](../story/ST04.3-cong-do-depth-6-3000-ms-va-bo-20-the-co-co-dap-an-tay.md) | ⛔ Cổng đo depth 6/3000 ms và bộ 20 thế cờ có đáp án tay | 2 | 5 |

**Tiêu chí hoàn thành Epic:** cổng 032 **PASS với số đo thật** (hoặc Epic dừng ở trạng thái Flagged + số thật + kế hoạch tối ưu); corpus 20 thế được người khác review tay, HARD đúng ≥ 16/20 và 5/5 thế tránh lặp.
