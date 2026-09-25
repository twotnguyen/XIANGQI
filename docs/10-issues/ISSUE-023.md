# ISSUE-023 — applyMove + validateMove

**Nhóm:** E02 · **Phụ thuộc:** 022 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Hai hàm thuần: kiểm tra một nước có hợp lệ không, và áp dụng nước để ra thế cờ mới.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-MATCH.md](../01-requirements/REQ-MATCH.md) §5 · [../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) §3–§4

## 3. PHẠM VI
**✅ LÀM** — `validateMove()` · `applyMove()` · **❌ KHÔNG LÀM** — lưu dữ liệu (E11)

## 4. FILE TẠO
`packages/game-rules/src/apply.ts`

## 5. CÁC BƯỚC
1. ```ts
   validateMove(position, move): { valid: true } | { valid: false; reason: string }
   applyMove(position, move): Position     // THUẦN — trả Position MỚI
   ```
2. `validateMove` kiểm theo thứ tự, **dừng ở lỗi đầu tiên**:
   | # | Kiểm | `reason` khi sai |
   |---|---|---|
   | 1 | `from` và `to` trong bàn | `OUT_OF_BOARD` |
   | 2 | `from` khác `to` | `SAME_SQUARE` |
   | 3 | Có quân ở `from` | `NO_PIECE` |
   | 4 | Quân đó thuộc **bên đến lượt** | `NOT_YOUR_PIECE` |
   | 5 | Nước nằm trong `getLegalMoves` | `ILLEGAL_MOVE` |
3. `applyMove` **giả định đã validate** — dời quân, xoá quân bị ăn, **đổi lượt**
4. `applyMove` **KHÔNG** sửa `position` gốc; trả bàn cờ **mới**
5. Quân bị ăn **biến mất hoàn toàn** khỏi bàn

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T023-01` | Nước hợp lệ → `{valid:true}` |
| `T023-02` | Cả **5** lý do từ chối trả đúng `reason` |
| `T023-03` | `applyMove` **không sửa** `position` gốc — so sánh sâu trước/sau |
| `T023-04` | `applyMove` **đổi lượt**: ĐỎ đi → `turn` thành `BLACK` |
| `T023-05` | Ăn quân → quân địch **biến mất**, tổng số quân **giảm 1** |
| `T023-06` | Đi vào ô trống → tổng số quân **không đổi** |
| `T023-07` | Mã định danh quân di chuyển **giữ nguyên** |
| `T023-08` | Áp dụng cùng nước 2 lần từ cùng thế → **hai kết quả giống hệt** |
| `T023-09` | Đi quân của đối thủ → `NOT_YOUR_PIECE` |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 9 test xanh
- [ ] `T023-03` chứng minh **thuần tuyệt đối**
- [ ] Đủ 5 `reason` phân biệt được
- [ ] `T023-04` đổi lượt đúng

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-023.md`

## 9. ⚠ CẠM BẪY
`applyMove` **phải thuần**. AI gọi nó hàng triệu lần trong lúc tìm kiếm — nếu nó sửa bàn gốc thì cây tìm kiếm hỏng và AI trả nước sai. `T023-03` là test bắt buộc.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

`validateMove(position:Position,move:Move)` trả discriminated union§5; `applyMove` chỉ nhận nước đã validate (không thêm giámsát tự động). Bản mới có board mới, quân di chuyển giữ id. Mã reason internal khác Error Code HTTP INVALID_MOVE.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/issue-023.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Initial đi RED pawn(0,6) → (0,5). Capture: BLACK GENERAL(3,0), RED GENERAL(5,9), RED ROOK(0,5), BLACK PAWN(0,3); target(0,3)trống đường.

- T023-01/04/06/07/08: pawnforward valid, turn BLACK,32 quân, giữ id, repeated apply cùng source deep equal.
- T023-02/09: from(-1,0) → OUT_OF_BOARD; from=to(0,6) → SAME_SQUARE; from(4,4) → NO_PIECE; BLACK pawn(0,3) khi RED turn → NOT_YOUR_PIECE; RED pawn đi ngang → ILLEGAL_MOVE. Thử payload vi phạm 2 điều để check first-error.
- T023-03: Object.freeze board/Pieces, deep clone before, output board !== input board.
- T023-05: capture giảm 4 → 3 quân, id BLACK pawn không còn ở bất kỳ ô, không chỉ assert đích.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { createInitialPosition, validateMove, applyMove } from '@xiangqi/game-rules';
test('T023-03/04/07 apply thuần', () => {
  const p=createInitialPosition(); const before=structuredClone(p);
  const move={from:{x:0,y:6},to:{x:0,y:5}};
  expect(validateMove(p,move)).toEqual({valid:true});
  const next=applyMove(p,move);
  expect(p).toEqual(before); expect(next.board).not.toBe(p.board);
  expect(next.board[54]).toBeNull(); expect(next.board[45]?.id).toBe(p.board[54]?.id);
  expect(next.turn).toBe('BLACK');
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Đổi apply thành sửa trực tiếp board gốc hoặc quên đổi turn; T023-03/04 đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-023.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao 5 reason exact và purity; server 087 phải validate trước apply và lưu SQL.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
