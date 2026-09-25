# ISSUE-026 — Lượng giá: vật chất + bảng vị trí

**Nhóm:** E03 AI · **Phụ thuộc:** 025 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Hàm chấm điểm một thế cờ dựa trên **giá trị quân** và **vị trí quân**.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-AI.md](../01-requirements/REQ-AI.md) **§10 `BR-AI-23`** · [../09-technical/tech-stack.md](../09-technical/tech-stack.md) §4

## 3. PHẠM VI
**✅ LÀM** — giá trị quân · bảng vị trí · `evaluate()` cơ bản
**❌ LÀM SAU** — độ linh hoạt và an toàn tướng (027)

## 4. FILE TẠO
`packages/ai/src/evaluate.ts` · `packages/ai/src/piece-values.ts`

## 5. CÁC BƯỚC
1. Giá trị quân (đơn vị centipawn), đề xuất khởi điểm:
   | Quân | Điểm |
   |---|---|
   | Tướng | 100000 (vô hạn thực dụng) |
   | Xe | 900 |
   | Pháo | 450 |
   | Mã | 400 |
   | Tượng | 200 |
   | Sĩ | 200 |
   | Tốt chưa qua sông | 100 |
   | **Tốt đã qua sông** | **200** |
2. Bảng vị trí 9×10 cho từng loại quân. **Bảng của ĐEN là bản PHẢN CHIẾU của ĐỎ theo trục y** — viết một bảng, lật để dùng cho bên kia
3. ```ts
   evaluate(position: Position): number   // điểm THEO GÓC NHÌN BÊN ĐẾN LƯỢT
   ```
4. **Quy ước dấu bắt buộc:** điểm dương = **tốt cho bên đến lượt**
5. **Hàm thuần, không cấp phát object trong vòng lặp** — sẽ bị gọi hàng triệu lần (`TECH-08`)

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T026-01` | Thế cờ ban đầu → điểm ≈ **0** (cân bằng), sai lệch < 50 |
| `T026-02` | **ĐỐI XỨNG**: cùng thế cờ, đổi `turn` → điểm **đảo dấu** |
| `T026-03` | Bên nhiều hơn một **xe** → điểm hơn ≥ 800 |
| `T026-04` | Tốt **đã qua sông** được điểm cao hơn tốt chưa qua sông |
| `T026-05` | Bảng vị trí của ĐEN là **phản chiếu chính xác** của ĐỎ |
| `T026-06` | Hàm **không sửa** `position` |
| `T026-07` | Gọi 1000 lần → **không rò bộ nhớ**, kết quả ổn định |

> `T026-02` là test quan trọng nhất — hàm lượng giá **không đối xứng** sẽ làm AI chơi lệch một bên.

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 7 test xanh
- [ ] `T026-02` chứng minh đối xứng tuyệt đối
- [ ] `T026-05` chứng minh bảng vị trí phản chiếu đúng
- [ ] **Không cấp phát object** trong vòng lặp lượng giá
- [ ] Hàm thuần

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-026.md` — in bảng giá trị quân và điểm thế cờ ban đầu.

## 9. ⚠ CẠM BẪY
**Cấp phát bộ nhớ trong hàm lượng giá là nguyên nhân số 1 khiến AI chậm.** Tránh `map`, `filter`, tạo mảng tạm. Dùng vòng `for` trên chỉ số. Đây là điều kiện để vượt **cổng đo 032**.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

`evaluate(position:Position):number` public; nội bộ export `PIECE_VALUES` và `PIECE_SQUARE_TABLES` readonly để kiểm size/mirror. Mỗi bảng RED90 số hữu hạn; BLACK tra cùng x, y → 9−y. Giá trị quân trong§5 là cấu hình ban đầu, không ngưỡng nghiệm thu tự hạ.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/issue-026.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

InitialP0, Pplus thêm RED ROOK(4,5) vào ô trống, Pminus bỏ một RED ROOK; pawn river fixtures cùng vị trí tương ứng hai bên. T026-07 dùng 1000 calls, sample heap chỉ báo quan sát, kết hợp kiểm không cache/global giữ Position; không assert heap chênh 0 vì GC.

- T026-01/02: abs(evalinitial)<50; mỗi fixture đổi riêng turn → đúng−score.
- T026-03: Pplus soP0>=800; giữ nguyên side/turn, không thay vị trí các quân khác.
- T026-04/05: pawn material RED y 5=100, y 4=200 và BLACK y 4=100, y 5=200; mọi 7 × 90 ô PSTmirror chính xác.
- T026-06/07: deepfreeze input,1000 calls đồng kết quả; ghi heap before/after/GCmode và audit không object tạm trong loop.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { createInitialPosition } from '@xiangqi/game-rules';
import { evaluate } from '@xiangqi/ai';
test('T026-02 quy ước dấu', () => {
  const initial=createInitialPosition();
  const board=[...initial.board]; board[81]=null;
  const p={board,turn:'RED' as const};
  const score=evaluate(p);
  expect(score).toBeLessThan(-800);
  expect(evaluate({...p,turn:'BLACK'})).toBe(-score);
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Bỏ đổi dấu theo turn hoặc lật bảng vị trí theo x; T026-02/05 đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-026.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao bảng 90 ô/hệ số cụ thể và số thật; chưa coi 1000 calls là proof p95 hay memorybound;026 BLOCKED nếu đối xứng/≥800 không đạt.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
