# ISSUE-017 — Nước đi Mã

**Nhóm:** E02 · **Phụ thuộc:** 014 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Sinh nước đi cho Mã, có luật **cản chân mã**.

## 2. ĐỌC TRƯỚC
[../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) **§3 `GR-MV-04`** — bảng ô cản chân.

## 3. PHẠM VI
**✅ LÀM** — `horseMoves()` · **❌ KHÔNG LÀM** — lọc tự chiếu (022)

## 4. FILE TẠO
`packages/game-rules/src/moves/horse.ts`

## 5. CÁC BƯỚC
1. Tám hướng chữ **日**: (`|Δx|=1, |Δy|=2`) hoặc (`|Δx|=2, |Δy|=1`)
2. **Cản chân mã — bảng chính xác**:

   | Hướng đi | Ô cản chân |
   |---|---|
   | `Δy = ±2` (dọc dài) | `(x1, y1 + Δy/2)` |
   | `Δx = ±2` (ngang dài) | `(x1 + Δx/2, y1)` |

   Ô cản **có quân bất kỳ bên nào** ⇒ hướng đó **bị loại**.

3. **Mã không bị giới hạn sông hay cung** — đi khắp bàn
4. Ô đến: trống hoặc quân địch

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T017-01` | Mã ở giữa bàn, không bị cản → đúng **8** nước |
| `T017-02` | Mã ĐỎ ở (1,9), đặt quân ở **(1,8)** → nước tới **(0,7)** và **(2,7)** đều **bị loại** |
| `T017-03` | Bỏ quân cản ở (1,8) → hai nước đó **hợp lệ trở lại** |
| `T017-04` | Cản chân là **quân cùng bên** → vẫn **bị loại** |
| `T017-05` | Cản chân cho hướng **ngang dài**: mã ở (4,4), quân ở (5,4) → (6,3) và (6,5) bị loại |
| `T017-06` | Mã ở góc (0,0) → đúng **2** nước |
| `T017-07` | Mã ở biên (0,4) → đúng **4** nước |
| `T017-08` | Mã **qua sông được** — không bị giới hạn nửa sân |
| `T017-09` | Ô đến có quân mình → loại; quân địch → giữ |
| `T017-10` | Ô cản **khác** ô đến — chứng minh bằng thế cờ có quân ở ô đến nhưng chân trống |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 10 test xanh
- [ ] `T017-02` dùng **đúng** toạ độ trong bảng `GR-MV-04`
- [ ] `T017-04` chứng minh quân cùng bên cũng cản
- [ ] `T017-05` chứng minh hướng ngang dài cản đúng ô
- [ ] Hàm thuần

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-017.md`

## 9. ⚠ CẠM BẪY
Lỗi kinh điển: **nhầm ô cản với ô đến**, hoặc chỉ kiểm cản cho hướng dọc mà quên hướng ngang. `T017-05` và `T017-10` bắt đúng hai lỗi này.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Export `horseMoves` từ game-rules/index.ts. Mỗi hàm có `(board:Board, from:Square):Move[]`; từô có quân đúng loại, suy side từ quân. Trả các Move from/to không trùng, thứ tự ổn định; không mutate board/Piece, chưa lọc tự chiếu. Caller chọn đúng loại trước khi gọi; input mạng được 011/023 kiểm riêng.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/issue-017.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Fixture makePosition 012 luôn có đúng hai tướng. Mặc định BLACK(3,0), RED(5,9) tránh các tia kiểm; khi thử tướng phải thay tướng cùng bên, không thêm tướng thứ hai. So tập đích đã đếm tay, không dùng một generator khác làm oracle.

- T017-01: HORSE(4,4) → (3,2),(5,2),(2,3),(6,3),(2,5),(6,5),(3,6),(5,6), đúng 8 không trùng.
- T017-02..04: RED(1,9), blocker(1,8) lần lượt BLACK pawn/RED pawn; (0,7),(2,7) đều bị loại; bỏ blocker giữ cả hai.
- T017-05: HORSE(4,4), blocker(5,4) → loại(6,3),(6,5), các hướng khác giữ.
- T017-06..08: góc(0,0) → (1,2),(2,1); biên(0,4) → 4 ô; chọn mã RED(4,5) → (3,3) để chứng minh qua sông.
- T017-09/10: chân trống, địch ở(6,5) → ăn được; đồng minh ở cùng ô → loại; không nhầm ô đích thành chân.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { horseMoves } from '@xiangqi/game-rules';
import { makePosition } from '../fixtures/positions';
test('T017-01/07 tập đích đối chiếu tay', () => {
  const p=makePosition([
    {type:'GENERAL',side:'BLACK',x:3,y:0},
    {type:'GENERAL',side:'RED',x:5,y:9},
    {type:'HORSE',side:'RED',x:4,y:4},
  ], 'RED');
  const before=structuredClone(p);
  const destinations=horseMoves(p.board,{x:4,y:4}).map(m => `${m.to.x},${m.to.y}`).sort();
  expect(destinations).toEqual(['3,2', '5,2', '2,3', '6,3', '2,5', '6,5', '3,6', '5,6'].sort());
  expect(p).toEqual(before);
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Dùng ô đích làm chân mã hoặc chỉ kiểm dọc; T017-05/10 đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-017.test.ts
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
