# ISSUE-007 — Hệ toạ độ + hàm chuyển đổi

**Nhóm:** E01 · **Phụ thuộc:** 006 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Hàm chuyển đổi giữa `Square` và chỉ số mảng, cùng các hàm kiểm tra vùng bàn cờ (cung, sông, qua sông).

## 2. ĐỌC TRƯỚC
[../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) **§1** — bắt buộc đọc kỹ bảng quy ước.

## 3. PHẠM VI
**✅ LÀM** — hàm thuần về toạ độ · **❌ KHÔNG LÀM** — luật di chuyển (E02)

## 4. FILE TẠO
`packages/contracts/src/coordinates.ts`

## 5. CÁC BƯỚC
1. Viết các hàm:
   ```ts
   squareToIndex(sq: Square): number          // y * 9 + x
   indexToSquare(i: number): Square
   isOnBoard(sq: Square): boolean             // x 0..8, y 0..9, đều là số nguyên
   isInPalace(sq: Square, side: Side): boolean
   isOwnHalf(sq: Square, side: Side): boolean
   hasCrossedRiver(sq: Square, side: Side): boolean
   sameSquare(a: Square, b: Square): boolean
   ```
2. Bảng tra cứu vùng — **chép đúng từ `DEC-003`**:

   | | ĐEN | ĐỎ |
   |---|---|---|
   | Nửa sân nhà | y 0..4 | y 5..9 |
   | Cung | x 3..5, y 0..2 | x 3..5, y 7..9 |
   | Đã qua sông khi | y ≥ 5 | y ≤ 4 |

3. `isOnBoard` phải từ chối **số thập phân** và `NaN`

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T007-01` | `squareToIndex` và `indexToSquare` là **nghịch đảo** của nhau cho **cả 90 ô** |
| `T007-02` | `squareToIndex({x:0,y:0}) === 0` · `({x:8,y:9}) === 89` |
| `T007-03` | `isOnBoard` từ chối: x=-1 · x=9 · y=-1 · y=10 · x=1.5 · NaN |
| `T007-04` | Cung ĐEN: (3,0)(4,1)(5,2) → true; (3,3)(2,1)(6,1) → false |
| `T007-05` | Cung ĐỎ: (3,7)(4,8)(5,9) → true; (4,6) → false |
| `T007-06` | `hasCrossedRiver` ĐỎ: y=4 → **true**, y=5 → **false** |
| `T007-07` | `hasCrossedRiver` ĐEN: y=5 → **true**, y=4 → **false** |

> `T007-06/07` là chỗ dễ sai nhất. ĐỎ ở **dưới** (y=9) nên qua sông là **y giảm** xuống ≤ 4.

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 7 hàm
- [ ] `T007-01` chạy đủ **90 ô**, không lấy mẫu
- [ ] `T007-06` và `T007-07` đúng chiều
- [ ] Mọi hàm **thuần**, không sửa tham số đầu vào
- [ ] `pnpm test:unit` exit 0

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-007.md`

## 9. ⚠ CẠM BẪY
Sai chiều `hasCrossedRiver` ⇒ tốt đi sai luật ⇒ **AI học sai và toàn bộ luật hỏng**. Test phải khẳng định rõ ĐỎ qua sông khi **y ≤ 4**.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Export đủ 7 hàm qua contracts/index.ts. Chuyển index chỉ có tiền điều kiện integer 0..89 và square hợp lệ; caller input mạng phải qua 011. Mọi hàm predicate vùng trả false cho tọa độ ngoài bàn trước khi xét cung/sông.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/issue-007.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Duyệt y 0..9, x 0..8 đủ 90. Boundary predicates dùng x 3/5 so x 2/6, y 0/2/7/9; thêm Infinity, -Infinity, NaN và số thập phân.

- T007-01/02: tạo expected index=y*9+x độc lập; roundtrip đủ 90 và endpoint 0/89.
- T007-03: table invalid x/y, assert false chứ không cho NaN lọt comparison.
- T007-04/05: hai cung 9 ô, true đúng 9 ô/bên trên toàn 90; các ví dụ ngoài cung false.
- T007-06/07: cố định x 4, kiểm cảy 4 vày 5 cho hai bên; ownHalf là phủ định crossed chỉ trên ô hợp lệ.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { squareToIndex, indexToSquare, hasCrossedRiver } from '@xiangqi/contracts';
test('T007-01 đủ 90 ô và ranh giới sông', () => {
  for (let y=0;y<10;y++) for (let x=0;x<9;x++) {
    expect(squareToIndex({x,y})).toBe(y*9+x);
    expect(indexToSquare(y*9+x)).toEqual({x,y});
  }
  expect(hasCrossedRiver({x:4,y:4}, 'RED')).toBe(true);
  expect(hasCrossedRiver({x:4,y:5}, 'RED')).toBe(false);
  expect(hasCrossedRiver({x:4,y:5}, 'BLACK')).toBe(true);
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Đổi hướng sông RED thành y>=5; T007-06 phải đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-007.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao helper toạ độ ổn định; UI081 chỉ đổi display, không sửa các hàm này.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
