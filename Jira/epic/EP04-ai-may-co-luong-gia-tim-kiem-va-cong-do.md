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

---

> ⏱ **Đọc lần đầu:** khoảng 10 phút. · Từ kỹ thuật lạ ⇒ [Từ điển kỹ thuật](../05-TU-DIEN-KY-THUAT.md) · Cách kiểm thử chung ⇒ [Sổ tay kiểm thử](../04-HUONG-DAN-KIEM-THU.md)

## 1. TÓM TẮT (đọc trong 1 phút)

Máy cờ **tự viết** — **không** dùng engine có sẵn (Pikafish…), **không** mạng nơ-ron — bằng **negamax + alpha-beta + đào sâu dần**, 3 cấp độ cố định:

| Cấp | Độ sâu tối đa | Ngân sách suy nghĩ |
|---|---|---|
| EASY (Dễ) | 2 | 300 ms |
| MEDIUM (Trung bình) | 4 | 1000 ms |
| HARD (Khó) | 6 | 3000 ms |

Đây là **nội dung học thuật chính khi bảo vệ đồ án** ⇒ mọi con số phải **đo thật** và **tái lập được**.

## 2. BỐI CẢNH — VÌ SAO EPIC NÀY TỒN TẠI

- **R12**: AI tự viết, 3 cấp với ngân sách 300 / 1000 / 3000 ms.
- Lần xây trước chỉ benchmark **depth 2**; câu hỏi *"TypeScript có chạy nổi depth 6 trong 3 giây không"* **chưa có đáp án** ⇒ đặt **cổng chặn** ISSUE-032 ngay sau luật cờ, trước khi viết phần còn lại của AI.
- Lần trước báo "78,86% cắt tỉa" nhưng **giấu** 6/20 thế tăng node — Epic này cấm mọi hình thức làm đẹp số liệu.

## 3. KHÁI NIỆM CẦN HIỂU

| Khái niệm | Giải thích |
|---|---|
| **Lượng giá** | Hàm chấm điểm thế cờ (vật chất + vị trí + linh hoạt + an toàn tướng) |
| **Negamax** | Minimax viết gọn bằng một hàm đảo dấu mỗi tầng |
| **Alpha-beta** | Cắt các nhánh chắc chắn không tốt hơn ⇒ cùng kết quả, ít node hơn |
| **Đào sâu dần** | Tìm depth 1, 2, 3… tới khi hết giờ; luôn có nước để trả |
| **p95 nearest-rank** | Sắp 100 mẫu, lấy phần tử thứ 95 — ⇒ ≥ 95/100 mẫu phải xong trong ngân sách |
| **Oracle** | Đáp án do **người** viết và **người khác** review, không lấy từ AI |

## 4. PHẠM VI

**✅ LÀM:** lượng giá; sắp xếp nước; negamax; alpha-beta + báo cáo so sánh node; đào sâu dần + hết giờ + huỷ; ⛔ cổng đo depth; corpus chất lượng 20 thế có review tay.

**❌ KHÔNG LÀM**
| Việc | Ở đâu |
|---|---|
| Tiến trình AI riêng, worker, hàng đợi 2/8 | EP15 |
| Đưa AI vào ván, giao diện chơi với máy | EP15 |
| Thí nghiệm 60 ván | TK15.3.1 |
| Engine có sẵn, mạng nơ-ron, quy đổi Elo | ⛔ Ngoài phạm vi |

## 5. LUẬT CHUNG CHO MỌI TASK AI

| Luật | Nghĩa |
|---|---|
| Ranh giới gói | `packages/ai` chỉ import `@xiangqi/contracts`, `@xiangqi/game-rules` (lint chặn cái khác) |
| **Không cấp phát trong vòng lặp nóng** | Không `map/filter/reduce`, spread, object tạm — dùng `for` theo chỉ số, tái dùng bộ đệm. Nguyên nhân số 1 khiến AI chậm |
| Tất định | Cùng thế + độ sâu + seed ⇒ cùng nước, điểm, số node |
| Nước trả về luôn hợp lệ | Kiểm lại bằng `validateMove` |
| Xét lịch sử lặp | Tìm kiếm nhận `RepetitionCounts` |
| Đồng hồ | Unit test dùng đồng hồ giả tiêm vào; **chỉ** benchmark dùng `performance.now()` |
| **Không hạ ngưỡng** | Không giảm độ sâu, ngân sách, số mẫu; không loại outlier; không đổi corpus sau khi thấy số |

## 6. ⛔ CỔNG CHẶN ISSUE-032

HARD phải hoàn thành **depth 6** với **p95 ≤ 3000 ms** trên 20 thế × 5 lần (MEDIUM depth 4 ≤ 1000 ms, EASY depth 2 ≤ 300 ms). **Không đạt ⇒ cấm làm EP15**, tối ưu **đúng thứ tự**:
1. Bỏ cấp phát trong sinh nước + lượng giá.
2. Cải thiện sắp xếp nước (killer move, history heuristic).
3. Bảng ghi nhớ thế cờ (transposition table).
4. Chỉ khi cả 3 không đủ ⇒ báo trưởng nhóm xét đổi ngôn ngữ **toàn bộ** backend + AI.

## 7. ĐẦU VÀO

EP03: luật cờ đầy đủ (`getLegalMoves`, `applyMove`, `getTerminalOutcome`, `positionKey`, `countFromMoves`, fixture).

## 8. DANH SÁCH STORY

| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST04.1](../story/ST04.1-luong-gia-the-co-va-sap-xep-nuoc.md) | Lượng giá thế cờ và sắp xếp nước | 2 | 3 |
| [ST04.2](../story/ST04.2-tim-kiem-negamax-alpha-beta-va-dao-sau-dan.md) | Tìm kiếm negamax, alpha-beta và đào sâu dần | 2 | 5 |
| [ST04.3](../story/ST04.3-cong-do-depth-6-3000-ms-va-bo-20-the-co-co-dap-an-tay.md) | ⛔ Cổng đo depth 6/3000 ms và bộ 20 thế cờ có đáp án tay | 2 | 5 |

## 9. TIÊU CHÍ HOÀN THÀNH EPIC

- [ ] Cổng 032 **PASS với số đo thật** (đủ 3 cấp) và được Tester chạy lại độc lập trên máy khác.
- [ ] Corpus chất lượng 20 thế được **người khác** review tay; HARD đúng ≥ 16/20, hợp lệ 20/20, tránh lặp 5/5.
- [ ] Báo cáo so sánh negamax/alpha-beta liệt kê **mọi** thế.
- [ ] Nếu cổng chưa đạt: Epic **Flagged**, có số thật và Task tối ưu theo thứ tự mục 6 — **không** coi là Done.

## 10. KỊCH BẢN DEMO (~10 phút)

1. Mở `docs/test-reports/ai/ISSUE-032.md`: bảng p50/p95/p99 3 cấp + cấu hình máy.
2. Chạy thế "chiếu hết sau 1 nước" (QA04.2.1-01): AI tìm ra nước chiếu hết.
3. Mở báo cáo so sánh node: giải thích vì sao alpha-beta ít node hơn.
4. Mở bảng chấm 20 thế chất lượng.

## 11. RỦI RO VÀ CÁCH GIẢM

| Rủi ro | Khả năng | Ảnh hưởng | Cách giảm |
|---|---|---|---|
| Không đạt depth 6 / 3000 ms | Trung bình | Rất cao (chặn EP15) | Đo sớm (lượng giá có số đo tốc độ ngay TK04.1.1); tối ưu đúng thứ tự; Sprint 2 dành buffer |
| Số đo khác nhau giữa các máy | Cao | Trung bình | Ghi cấu hình máy; Tester chạy lại độc lập; máy chủ thật đo lại ở TK16.6.1 |
| Không có người biết cờ để review corpus | Trung bình | Cao | Chọn thế đơn giản, chiến thuật rõ; nhờ bạn ngoài nhóm biết cờ review (ghi tên thật) |
| Bị cám dỗ "làm đẹp số" khi sát hạn | Trung bình | Rất cao (gian lận học thuật) | Luật mục 5; Tester kiểm protocol (QA04.3.1-02) |
