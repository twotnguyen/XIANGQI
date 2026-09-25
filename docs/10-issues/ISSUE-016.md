# ISSUE-016 — Nước đi Tượng

**Nhóm:** E02 · **Phụ thuộc:** 014 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Sinh nước đi cho Tượng, có **cản mắt tượng** và **cấm qua sông**.

## 2. ĐỌC TRƯỚC
[../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) **§3 `GR-MV-03`**

## 3. PHẠM VI
**✅ LÀM** — `elephantMoves()` · **❌ KHÔNG LÀM** — lọc tự chiếu (022)

## 4. FILE TẠO
`packages/game-rules/src/moves/elephant.ts`

## 5. CÁC BƯỚC
1. Đi **chéo đúng 2 ô**: `|Δx| === 2 && |Δy| === 2` — 4 hướng
2. **Mắt tượng** là ô giữa: `((x1+x2)/2, (y1+y2)/2)`. Ô đó **có quân bất kỳ bên nào** ⇒ **không đi được**
3. **Cấm qua sông** — theo `DEC-003`:
   | Bên | Được ở |
   |---|---|
   | **ĐEN** (trên) | y **0..4** |
   | **ĐỎ** (dưới) | y **5..9** |
4. Ô đến: trống hoặc quân địch

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T016-01` | Tượng ĐỎ ở (2,9) → nước tới (0,7) và (4,7), **mắt trống** |
| `T016-02` | Đặt quân ở mắt (1,8) → nước tới (0,7) **bị loại** |
| `T016-03` | Đặt quân ở mắt (3,8) → nước tới (4,7) **bị loại** |
| `T016-04` | Mắt bị chắn bởi **quân CÙNG BÊN** → vẫn **bị loại** |
| `T016-05` | **Tượng ĐỎ ở (4,5) KHÔNG đi được tới y=3** (qua sông) |
| `T016-06` | **Tượng ĐEN ở (4,4) KHÔNG đi được tới y=6** (qua sông) |
| `T016-07` | Tượng ở giữa bàn, mắt trống hết → đúng **4** nước |
| `T016-08` | Tượng ở góc → số nước giảm đúng |
| `T016-09` | Ô đến có quân mình → loại; quân địch → giữ |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 9 test xanh
- [ ] `T016-04` chứng minh mắt bị chắn bởi **quân cùng bên** cũng cản
- [ ] `T016-05` và `T016-06` đúng chiều sông theo `DEC-003`
- [ ] Hàm thuần

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-016.md`

## 9. ⚠ CẠM BẪY
Hai lỗi hay gặp: **(1)** chỉ kiểm mắt bị chắn bởi quân địch — sai, quân **cùng bên** cũng cản; **(2)** nhầm chiều sông. ĐỎ ở **dưới** nên ĐỎ bị giới hạn ở **y 5..9**.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Export `elephantMoves` từ game-rules/index.ts. Mỗi hàm có `(board:Board, from:Square):Move[]`; từô có quân đúng loại, suy side từ quân. Trả các Move from/to không trùng, thứ tự ổn định; không mutate board/Piece, chưa lọc tự chiếu. Caller chọn đúng loại trước khi gọi; input mạng được 011/023 kiểm riêng.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/issue-016.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Fixture makePosition 012 luôn có đúng hai tướng. Mặc định BLACK(3,0), RED(5,9) tránh các tia kiểm; khi thử tướng phải thay tướng cùng bên, không thêm tướng thứ hai. So tập đích đã đếm tay, không dùng một generator khác làm oracle.

- T016-01..04: RED ELEPHANT(2,9), mắt(1,8)/(3,8), đích(0,7)/(4,7); từng mắt trống/địch/đồng minh, không cản chéo hướng còn lại.
- T016-05/06: RED(4,5) cấm y 3, BLACK(4,4) cấm y 6.
- T016-07: RED(4,7) mắt trống → 4 ô(2,5),(6,5),(2,9),(6,9); không dùng(4,4) để đòi 4 nước.
- T016-08/09: RED(0,9) → chỉ(2,7); đặt đồng minh/địch ở đích, loại/giữ; mắt vẫn trống.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { elephantMoves } from '@xiangqi/game-rules';
import { makePosition } from '../fixtures/positions';
test('T016-01/07 tập đích đối chiếu tay', () => {
  const p=makePosition([
    {type:'GENERAL',side:'BLACK',x:3,y:0},
    {type:'GENERAL',side:'RED',x:5,y:9},
    {type:'ELEPHANT',side:'RED',x:4,y:7},
  ], 'RED');
  const before=structuredClone(p);
  const destinations=elephantMoves(p.board,{x:4,y:7}).map(m => `${m.to.x},${m.to.y}`).sort();
  expect(destinations).toEqual(['2,5', '6,5', '2,9', '6,9'].sort());
  expect(p).toEqual(before);
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Bỏ cản mắt đồng minh hoặc đảo nửa sân; T016-04/05/06 đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-016.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao export, thứ tự sinh ổn định và bảng đích fixture;022 tổng hợp và lọc an toàn, không sửa giả hợp lệ ở issue này.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
