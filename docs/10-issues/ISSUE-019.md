# ISSUE-019 — Nước đi Pháo

**Nhóm:** E02 · **Phụ thuộc:** 014 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Sinh nước đi cho Pháo — **quân duy nhất đi khác cách ăn**.

## 2. ĐỌC TRƯỚC
[../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) **§3 `GR-MV-06`**

## 3. PHẠM VI
**✅ LÀM** — `cannonMoves()` · **❌ KHÔNG LÀM** — lọc tự chiếu (022)

## 4. FILE TẠO
`packages/game-rules/src/moves/cannon.ts`

## 5. CÁC BƯỚC
1. **Hai luật tách biệt:**

   | Hành động | Điều kiện |
   |---|---|
   | **ĐI** (ô đến trống) | Đường đi **hoàn toàn trống** — y như xe |
   | **ĂN** (ô đến có quân địch) | Giữa pháo và mục tiêu có **ĐÚNG 1** quân — gọi là **ngòi** |

2. Ngòi là quân **bất kỳ bên nào**
3. **0 ngòi** ⇒ không ăn được. **2 ngòi trở lên** ⇒ không ăn được
4. **Không** ăn quân cùng bên, dù đúng 1 ngòi
5. Thuật toán mỗi hướng: trượt qua ô trống (thêm nước ĐI) → gặp quân đầu tiên = ngòi → tiếp tục trượt → gặp quân thứ hai: nếu là **địch** thì thêm nước ĂN, rồi dừng

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T019-01` | Pháo trên bàn trống → đi được như xe, đúng **17** nước |
| `T019-02` | Pháo ĐỎ (0,7), địch (0,2), **0 quân** giữa → **KHÔNG** ăn được |
| `T019-03` | Thêm **1 ngòi** ở (0,5) → **ĂN ĐƯỢC** (0,2) |
| `T019-04` | Thêm **ngòi thứ hai** ở (0,4) → **KHÔNG** ăn được nữa |
| `T019-05` | Ngòi là quân **cùng bên** → vẫn ăn được (ngòi không phân biệt bên) |
| `T019-06` | Mục tiêu là quân **cùng bên**, đúng 1 ngòi → **KHÔNG** ăn |
| `T019-07` | Có ngòi thì pháo **không đi được** tới ô trống **phía sau ngòi** |
| `T019-08` | Cả bốn hướng đều áp dụng đúng luật ngòi |
| `T019-09` | Không sửa `board` |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 9 test xanh
- [ ] `T019-02/03/04` chứng minh đủ **0 / 1 / 2 ngòi**
- [ ] `T019-05` chứng minh ngòi **không phân biệt bên**
- [ ] `T019-07` chứng minh không đi xuyên ngòi
- [ ] Hàm thuần

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-019.md`

## 9. ⚠ CẠM BẪY
Pháo là quân **dễ code sai nhất**. Hai lỗi hay gặp: **(1)** cho pháo đi tới ô trống **sau ngòi** — sai, đi phải trống hoàn toàn; **(2)** đếm ngòi sai khi có nhiều quân. Ba test `T019-02/03/04` là bộ ba bắt buộc.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Export `cannonMoves` từ game-rules/index.ts. Mỗi hàm có `(board:Board, from:Square):Move[]`; từô có quân đúng loại, suy side từ quân. Trả các Move from/to không trùng, thứ tự ổn định; không mutate board/Piece, chưa lọc tự chiếu. Caller chọn đúng loại trước khi gọi; input mạng được 011/023 kiểm riêng.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/issue-019.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Fixture makePosition 012 luôn có đúng hai tướng. Mặc định BLACK(3,0), RED(5,9) tránh các tia kiểm; khi thử tướng phải thay tướng cùng bên, không thêm tướng thứ hai. So tập đích đã đếm tay, không dùng một generator khác làm oracle.

- T019-01: CANNON(4,4), generals(3,0)/(5,9) → 17 ô trống không cùng tia.
- T019-02..06: RED CANNON(0,7), target BLACK ROOK(0,2), screen(0,5), second(0,4); so 0/1/2 screens; đổi screen RED/BLACK không đổi, target RED phải bị loại.
- T019-07: screen(0,5), ô(0,4)/(0,3) trống không được đi; (0,6) được đi.
- T019-08/09: quay cấu hình sang 4 tia quanh(4,4) với screen 1 ô, target 3 ô; freeze và deep compare board.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { cannonMoves } from '@xiangqi/game-rules';
import { makePosition } from '../fixtures/positions';
test('T019-01/07 tập đích đối chiếu tay', () => {
  const p=makePosition([
    {type:'GENERAL',side:'BLACK',x:3,y:0},
    {type:'GENERAL',side:'RED',x:5,y:9},
    {type:'CANNON',side:'RED',x:4,y:4},
  ], 'RED');
  const before=structuredClone(p);
  const destinations=cannonMoves(p.board,{x:4,y:4}).map(m => `${m.to.x},${m.to.y}`).sort();
  expect(destinations).toEqual(['0,4', '1,4', '2,4', '3,4', '5,4', '6,4', '7,4', '8,4', '4,0', '4,1', '4,2', '4,3', '4,5', '4,6', '4,7', '4,8', '4,9'].sort());
  expect(p).toEqual(before);
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Cho pháo tới ô trống sau ngòi; T019-07 đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-019.test.ts
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
