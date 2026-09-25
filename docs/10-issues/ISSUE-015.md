# ISSUE-015 — Nước đi Tướng + Sĩ

**Nhóm:** E02 · **Phụ thuộc:** 014 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Sinh nước đi **giả hợp lệ** (chưa lọc tự chiếu) cho Tướng và Sĩ.

## 2. ĐỌC TRƯỚC
[../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) **§3 `GR-MV-01`, `GR-MV-02`**

## 3. PHẠM VI
**✅ LÀM** — `generalMoves()` · `advisorMoves()` — trả nước **chưa lọc** tự chiếu
**❌ KHÔNG LÀM** — tướng đối mặt (021) · lọc tự chiếu (022)

## 4. FILE TẠO
`packages/game-rules/src/moves/general.ts` · `moves/advisor.ts`

## 5. CÁC BƯỚC
1. **Tướng** — 1 ô **thẳng** (4 hướng), **chỉ trong cung**:
   - ĐEN: x 3..5, y 0..2 · ĐỎ: x 3..5, y 7..9
   - Ô đến: trống hoặc có quân **địch**
2. **Sĩ** — 1 ô **chéo** (4 hướng), **chỉ trong cung**
   - Hệ quả: sĩ chỉ có **5 vị trí** khả dĩ — 4 góc cung + tâm cung
3. Cả hai hàm **không** kiểm tướng đối mặt và **không** kiểm tự chiếu — để issue 021, 022 lo
4. Không sửa `board`

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T015-01` | Tướng ĐEN ở **tâm cung (4,1)** → đúng **4** nước |
| `T015-02` | Tướng ĐEN ở **góc cung (3,0)** → đúng **2** nước |
| `T015-03` | Tướng **không** ra ngoài cung: thử mọi hướng ở biên cung |
| `T015-04` | Tướng ĐỎ ở (4,8) → 4 nước, tất cả trong y 7..9 |
| `T015-05` | Tướng **không** đi chéo |
| `T015-06` | Sĩ ở **tâm cung** → đúng **4** nước |
| `T015-07` | Sĩ ở **góc cung** → đúng **1** nước (chỉ về tâm) |
| `T015-08` | Sĩ **không** đi thẳng |
| `T015-09` | Cả hai: ô đến có **quân mình** → **loại**; có **quân địch** → **giữ** (ăn) |
| `T015-10` | Không hàm nào sửa `board` đầu vào |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 10 test xanh
- [ ] Tướng và sĩ **không bao giờ** ra ngoài cung ở mọi test
- [ ] Số nước ở tâm/góc cung đúng chính xác
- [ ] Hàm thuần

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-015.md`

## 9. ⚠ CẠM BẪY
Cung ĐEN (y 0..2) và cung ĐỎ (y 7..9) **khác nhau**. Viết cứng một khoảng y cho cả hai bên là lỗi phổ biến — `T015-01` và `T015-04` bắt đúng lỗi này.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Export `generalMoves / advisorMoves` từ game-rules/index.ts. Mỗi hàm có `(board:Board, from:Square):Move[]`; từô có quân đúng loại, suy side từ quân. Trả các Move from/to không trùng, thứ tự ổn định; không mutate board/Piece, chưa lọc tự chiếu. Caller chọn đúng loại trước khi gọi; input mạng được 011/023 kiểm riêng.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/issue-015.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Fixture makePosition 012 luôn có đúng hai tướng. Mặc định BLACK(3,0), RED(5,9) tránh các tia kiểm; khi thử tướng phải thay tướng cùng bên, không thêm tướng thứ hai. So tập đích đã đếm tay, không dùng một generator khác làm oracle.

- T015-01..05: BLACK GENERAL(4,1) → (3,1),(5,1),(4,0),(4,2); (3,0) → (4,0),(3,1); RED(4,8) phản chiếu y; mọi biên cung không có ô ngoài.
- T015-06..08: BLACK ADVISOR(4,1) → 4 góc(3,0),(5,0),(3,2),(5,2), ở(3,0) → chỉ(4,1); không đi thẳng.
- T015-09/10: đặt đồng minh rồi địch tại(3,1) khi tướng ở(4,1); loại/giữ tương ứng; deepfreeze board trước mỗi call.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { generalMoves } from '@xiangqi/game-rules';
import { makePosition } from '../fixtures/positions';
test('T015-01/07 tập đích đối chiếu tay', () => {
  const p=makePosition([
    {type:'GENERAL',side:'RED',x:5,y:9},
    {type:'GENERAL',side:'BLACK',x:4,y:1},
  ], 'BLACK');
  const before=structuredClone(p);
  const destinations=generalMoves(p.board,{x:4,y:1}).map(m => `${m.to.x},${m.to.y}`).sort();
  expect(destinations).toEqual(['3,1', '5,1', '4,0', '4,2'].sort());
  expect(p).toEqual(before);
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Cho Tướng đi chéo hoặc dùng cung RED cho BLACK; T015-01/05 đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-015.test.ts
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
