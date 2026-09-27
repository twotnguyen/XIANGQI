# EP03 · Contracts dùng chung & luật cờ

> **Loại:** Epic · **Story:** [ST03.1](../story/ST03.1-contracts-kieu-du-lieu-toa-do-schema-zod-ma-loi.md), [ST03.2](../story/ST03.2-the-co-ban-dau-khoa-lap-hinh-hoc-tan-cong-nuoc-di-7-loai-qua.md), [ST03.3](../story/ST03.3-nuoc-hop-le-ap-dung-nuoc-ket-thuc-van-va-lap-3-lan.md)

| Trường Jira | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | `EP03 · Contracts dùng chung & luật cờ` |
| Components | Backend, Tester |
| Priority | Highest |
| Labels | `xq-v2`, `ep03`, `critical-path` |
| Fix versions | `v0.1.0` |
| Start date / Due date | 2026-09-29 / 2026-10-02 |
| Nguồn đặc tả | ISSUE-006 … ISSUE-025 |

---

> ⏱ **Đọc lần đầu:** khoảng 10 phút. · Từ kỹ thuật lạ ⇒ [Từ điển kỹ thuật](../05-TU-DIEN-KY-THUAT.md) · Cách kiểm thử chung ⇒ [Sổ tay kiểm thử](../04-HUONG-DAN-KIEM-THU.md)

## 1. TÓM TẮT (đọc trong 1 phút)

Hai gói dùng chung cho **cả** web, server và AI:

| Gói | Chứa | Ai dùng |
|---|---|---|
| `@xiangqi/contracts` | Kiểu dữ liệu, schema kiểm đầu vào (Zod), mã lỗi, `ApiResult` | Web, server, AI |
| `@xiangqi/game-rules` | **Luật cờ thuần**: thế ban đầu, sinh nước 7 loại quân, luật an toàn tướng, áp nước, kết thúc ván, đếm lặp | Server (phân xử), web (gợi ý nước), AI (tìm kiếm) |

Sai ở đây là sai **toàn bộ** sản phẩm — nên mọi Task đều có Tester **tự viết test phụ với đáp án đếm tay**.

## 2. BỐI CẢNH — VÌ SAO EPIC NÀY TỒN TẠI

- **R05, R07**: đủ luật di chuyển và an toàn tướng; bộ luật giản lược (hết nước là thua, lặp 3 lần là hoà).
- Lần xây trước **đảo ngược hệ toạ độ** (ĐỎ ở y=0) và phát hiện quá muộn; và **đếm lặp cả nhánh đã đi lại** (lỗi `F-02`) gây hoà sai.
- Viết luật **một lần** bằng TypeScript, dùng chung ở trình duyệt và máy chủ — lý do chọn TypeScript toàn bộ (`TECH-01`, `DEC-025`).

## 3. KHÁI NIỆM CẦN HIỂU

**⭐ Hệ toạ độ (áp dụng MỌI Task):**
```
Bàn 9 cột × 10 hàng giao điểm, toạ độ (x, y) đếm từ 0.
x: 0 → 8 trái sang phải.  y: 0 → 9 TRÊN xuống DƯỚI.
y = 0: hàng cuối của ĐEN (trên cùng).  y = 9: hàng cuối của ĐỎ (dưới cùng).
Nửa sân ĐEN y 0..4 · Nửa sân ĐỎ y 5..9 · Sông giữa y=4 và y=5.
Cung ĐEN: x 3..5, y 0..2 · Cung ĐỎ: x 3..5, y 7..9.
Tốt ĐỎ qua sông khi y ≤ 4 · Tốt ĐEN qua sông khi y ≥ 5.
Chỉ số mảng = y * 9 + x, mảng đúng 90 phần tử. ĐỎ đi trước.
Người cầm ĐEN thấy bàn lật — CHỈ là hiển thị; toạ độ gửi lên server không đổi.
```

| Khái niệm | Giải thích |
|---|---|
| **Hàm thuần** | Cùng đầu vào ⇒ cùng kết quả; không sửa tham số; không biến toàn cục |
| **Nước giả hợp lệ / hợp lệ** | Giả hợp lệ = đúng cách đi của quân. Hợp lệ = giả hợp lệ **và** không để tướng mình bị chiếu **và** không làm 2 tướng đối mặt |
| **Khoá thế cờ** | Loại + bên + vị trí mọi quân + bên đến lượt (không tính `id`) — để đếm lặp |
| **Fixture chuẩn** | F-MATE, F-STALEMATE, F-REPEAT (`game-rules.md` §6) — đáp án đã review tay |

## 4. PHẠM VI

**✅ LÀM:** kiểu + schema + mã lỗi; thế ban đầu; khoá thế cờ; hình học tấn công; sinh nước 7 loại quân; tướng đối mặt; cấm tự chiếu; validate/apply; kết thúc (chiếu hết, hết nước); lặp 3 lần.

**❌ KHÔNG LÀM**
| Việc | Ở đâu |
|---|---|
| Lưu nước đi, cây nước đi trong DB | EP05, EP10 |
| Đồng hồ, hết giờ | EP11 |
| Máy cờ AI | EP04 |
| Phân xử chiếu dai / đuổi dai | ⛔ Ngoài phạm vi (`GR-END-04`) |

## 5. LUẬT CHUNG CHO MỌI TASK

| Luật | Nghĩa |
|---|---|
| Gói luật **thuần** | `packages/game-rules` chỉ import `@xiangqi/contracts` (lint chặn `pg`, `@nestjs/*`, `fs`, `react`…) |
| Không sửa đầu vào | Mọi hàm nhận `Position`/`Board` phải trả **bản mới**; test `Object.freeze` đệ quy để chứng minh |
| Test đặt tên có mã | Ví dụ `[T017-02] mã bị cản chân` |
| **Đáp án lập luận tay** | Không lấy output của chính hàm đang test làm đáp án |
| Ca toạ độ bắt buộc | Mọi Task có ít nhất 1 ca khẳng định **ĐEN ở y=0, ĐỎ ở y=9** |

## 6. ĐẦU VÀO

EP01: monorepo, `pnpm test:unit` thật, đồng hồ giả (TK01.1.1, TK01.1.3).

## 7. DANH SÁCH STORY

| Story | Tên | Sprint | SP | Vai trò |
|---|---|---|---|---|
| [ST03.1](../story/ST03.1-contracts-kieu-du-lieu-toa-do-schema-zod-ma-loi.md) | Contracts: kiểu dữ liệu, toạ độ, schema Zod, mã lỗi | 1 | 3 | BE |
| [ST03.2](../story/ST03.2-the-co-ban-dau-khoa-lap-hinh-hoc-tan-cong-nuoc-di-7-loai-qua.md) | Thế cờ ban đầu, khoá lặp, hình học tấn công, nước đi 7 loại quân | 1 | 3 | BE |
| [ST03.3](../story/ST03.3-nuoc-hop-le-ap-dung-nuoc-ket-thuc-van-va-lap-3-lan.md) | Nước hợp lệ, áp dụng nước, kết thúc ván và lặp 3 lần | 1 | 3 | BE |

```
TK03.1.1 ─┬─► TK03.1.2 ────────────────────────────────┐
          └─► TK03.2.1 ─┬─► TK03.2.2 ─┐                ├─► TK03.3.3
                        └─► TK03.2.3 ─┴─► TK03.3.1 ─► TK03.3.2 ─┘
```

**Gợi ý nhân lực:** đường găng Sprint 1. Người A làm ST03.1 rồi hỗ trợ; người B làm TK03.2.1 → TK03.2.2 → ST03.3; thành viên nhóm AI (chưa có việc AI Sprint 1) nhận TK03.2.3 — component vẫn **Backend**.

## 8. TIÊU CHÍ HOÀN THÀNH EPIC

- [ ] 3 Story Done; mọi Task có báo cáo và file test phụ của Tester đã merge.
- [ ] `getLegalMoves(createInitialPosition())` trả đúng **44**.
- [ ] 3 fixture cho đúng kết quả: F-MATE ⇒ `CHECKMATE` ĐỎ thắng; F-STALEMATE ⇒ `STALEMATE` ĐỎ thắng; F-REPEAT 8 nửa nước ⇒ `REPETITION` hoà.
- [ ] `pnpm test:unit` xanh, 0 skipped; Tester ký xác nhận hệ toạ độ (ĐEN y=0, ĐỎ y=9).

## 9. KỊCH BẢN DEMO (~10 phút)

1. Chạy test: `pnpm test:unit -- packages/game-rules` — đọc tên các test chính.
2. Chạy test `T022-01` với `--reporter=verbose` ⇒ thấy `getLegalMoves(createInitialPosition()).length` = 44.
3. Dựng F-STALEMATE, gọi `getTerminalOutcome` ⇒ `STALEMATE`, winner `RED` — giải thích vì sao khác cờ vua.
4. Chạy F-REPEAT 8 nửa nước ⇒ hoà.

## 10. RỦI RO VÀ CÁCH GIẢM

| Rủi ro | Khả năng | Ảnh hưởng | Cách giảm |
|---|---|---|---|
| Đảo toạ độ lần nữa | Thấp | Rất cao | Khối chú thích bắt buộc; ca QA toạ độ ở mọi Task |
| Test tự lấy output làm đáp án | Trung bình | Cao | Tester viết test phụ đếm tay; review PR kiểm |
| Luật chậm khiến AI không đạt cổng depth 6 | Trung bình | Cao | Viết đúng trước; tối ưu ở EP04 theo thứ tự `TECH-08` (bỏ cấp phát trong vòng lặp…) — **không** tối ưu sớm làm sai luật |
| Hiểu nhầm "hết nước = hoà" | Trung bình | Cao | Ghi đậm trong mọi Task; ca QA03.3.3-03 |
