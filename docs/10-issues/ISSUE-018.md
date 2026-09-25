# ISSUE-018 — Nước đi Xe

**Nhóm:** E02 · **Phụ thuộc:** 014 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Sinh nước đi cho Xe — trượt thẳng, chặn bởi quân đầu tiên.

## 2. ĐỌC TRƯỚC
[../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) **§3 `GR-MV-05`**

## 3. PHẠM VI
**✅ LÀM** — `rookMoves()` · **❌ KHÔNG LÀM** — lọc tự chiếu (022)

## 4. FILE TẠO
`packages/game-rules/src/moves/rook.ts`

## 5. CÁC BƯỚC
1. Bốn hướng thẳng: trên · dưới · trái · phải
2. Trượt từng ô cho tới khi:
   - Gặp **ô trống** → thêm nước, **đi tiếp**
   - Gặp **quân địch** → thêm nước (ăn), **DỪNG**
   - Gặp **quân mình** → **DỪNG**, không thêm
   - Ra ngoài bàn → **DỪNG**
3. Xe **không** bị giới hạn sông hay cung

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T018-01` | Xe ở (4,4) trên **bàn trống** (chỉ có 2 tướng) → đúng **17** nước (8 ngang + 9 dọc, trừ ô đang đứng) |
| `T018-02` | Quân **mình** ở (4,2) → dừng trước nó, **không** thêm (4,2) |
| `T018-03` | Quân **địch** ở (4,2) → **thêm** (4,2) rồi dừng; **không** có (4,1) |
| `T018-04` | Xe ở góc (0,0) → đúng **17** nước |
| `T018-05` | Xe bị kẹp hai bên bởi quân mình sát cạnh → **0** nước theo hướng đó |
| `T018-06` | Bốn hướng đều được duyệt, không thiếu hướng nào |
| `T018-07` | Xe **qua sông được**, **vào cung địch được** |
| `T018-08` | Không sửa `board` |

> `T018-01` cần bàn cờ có **đúng 2 tướng** (theo luật fixture `T012-09`), đặt xa để không ảnh hưởng.

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 8 test xanh
- [ ] `T018-03` chứng minh **dừng sau khi ăn**, không đi xuyên
- [ ] `T018-01` số nước đúng chính xác
- [ ] Hàm thuần

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-018.md`

## 9. ⚠ CẠM BẪY
Lỗi hay gặp: sau khi ăn quân địch vẫn **tiếp tục trượt** qua nó. `T018-03` khẳng định rõ (4,1) **không** nằm trong kết quả.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Export `rookMoves` từ game-rules/index.ts. Mỗi hàm có `(board:Board, from:Square):Move[]`; từô có quân đúng loại, suy side từ quân. Trả các Move from/to không trùng, thứ tự ổn định; không mutate board/Piece, chưa lọc tự chiếu. Caller chọn đúng loại trước khi gọi; input mạng được 011/023 kiểm riêng.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/issue-018.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Fixture makePosition 012 luôn có đúng hai tướng. Mặc định BLACK(3,0), RED(5,9) tránh các tia kiểm; khi thử tướng phải thay tướng cùng bên, không thêm tướng thứ hai. So tập đích đã đếm tay, không dùng một generator khác làm oracle.

- T018-01: ROOK(4,4), generals BLACK(3,0), RED(5,9) không cùng tia → 17 ô độc lập bằng 4 tia.
- T018-02/03: blocker(4,2) RED → chỉ(4,3) hướng lên; BLACK → thêm(4,2), loại(4,1)/(4,0).
- T018-04: ROOK(0,0), đặt BLACK GENERAL(3,1), RED GENERAL(5,9) để không chắn hàng 0/cột 0 → 17.
- T018-05/06: blockers đồng minh tại(3,4),(5,4),(4,3),(4,5) → rỗng; bỏ từng blocker chứng minh mỗi tia.
- T018-07/08: xe(4,4) đi sang y 5 vày 2 khi tia trống; freeze đầu vào.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { rookMoves } from '@xiangqi/game-rules';
import { makePosition } from '../fixtures/positions';
test('T018-01/07 tập đích đối chiếu tay', () => {
  const p=makePosition([
    {type:'GENERAL',side:'BLACK',x:3,y:0},
    {type:'GENERAL',side:'RED',x:5,y:9},
    {type:'ROOK',side:'RED',x:4,y:4},
  ], 'RED');
  const before=structuredClone(p);
  const destinations=rookMoves(p.board,{x:4,y:4}).map(m => `${m.to.x},${m.to.y}`).sort();
  expect(destinations).toEqual(['0,4', '1,4', '2,4', '3,4', '5,4', '6,4', '7,4', '8,4', '4,0', '4,1', '4,2', '4,3', '4,5', '4,6', '4,7', '4,8', '4,9'].sort());
  expect(p).toEqual(before);
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Quên break sau ăn; T018-03 đỏ do có(4,1).
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-018.test.ts
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
