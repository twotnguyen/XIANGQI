# ISSUE-020 — Nước đi Tốt

**Nhóm:** E02 · **Phụ thuộc:** 014 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Sinh nước đi cho Tốt — hướng tiến phụ thuộc bên, và **đổi luật sau khi qua sông**.

## 2. ĐỌC TRƯỚC
[../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) **§3 `GR-MV-07`** và **§1** (chiều sông).

## 3. PHẠM VI
**✅ LÀM** — `pawnMoves()` · **❌ KHÔNG LÀM** — lọc tự chiếu (022)

## 4. FILE TẠO
`packages/game-rules/src/moves/pawn.ts`

## 5. CÁC BƯỚC
1. **Hướng tiến — theo `DEC-003`**:

   | Bên | Tiến là | Đã qua sông khi |
   |---|---|---|
   | **ĐỎ** (dưới, y=9) | `Δy = -1` (**y giảm**) | `y ≤ 4` |
   | **ĐEN** (trên, y=0) | `Δy = +1` (**y tăng**) | `y ≥ 5` |

2. **Luật đi**:
   | Trạng thái | Được đi |
   |---|---|
   | **Chưa** qua sông | **Chỉ** tiến thẳng 1 ô |
   | **Đã** qua sông | Tiến thẳng **hoặc** ngang 1 ô (`Δx = ±1, Δy = 0`) |

3. **Không bao giờ lùi.** Không phong cấp — tốt tới hàng cuối chỉ còn đi ngang
4. Ô đến: trống hoặc quân địch

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T020-01` | Tốt ĐỎ ở (4,6) **chưa qua sông** → đúng **1** nước: (4,5) |
| `T020-02` | Tốt ĐỎ ở (4,4) **đã qua sông** → đúng **3** nước: (4,3) (3,4) (5,4) |
| `T020-03` | Tốt ĐEN ở (4,3) **chưa qua sông** → đúng **1** nước: (4,4) |
| `T020-04` | Tốt ĐEN ở (4,5) **đã qua sông** → đúng **3** nước: (4,6) (3,5) (5,5) |
| `T020-05` | Tốt ĐỎ **không** đi được tới y **lớn hơn** (không lùi) |
| `T020-06` | Tốt ĐEN **không** đi được tới y **nhỏ hơn** (không lùi) |
| `T020-07` | Tốt ĐỎ ở **hàng cuối y=0** → chỉ còn **2** nước ngang |
| `T020-08` | Tốt chưa qua sông **không** đi ngang được |
| `T020-09` | Ô đến có quân mình → loại; quân địch → giữ |
| `T020-10` | Tốt ở biên x=0 đã qua sông → chỉ **2** nước (tiến + 1 ngang) |

> **Ranh giới quan trọng:** tốt ĐỎ ở **y=5 là CHƯA** qua sông; **y=4 là ĐÃ** qua sông. `T020-01` và `T020-02` phải dùng đúng hai mốc này.

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 10 test xanh
- [ ] Hướng tiến đúng chiều cho **cả hai** bên
- [ ] Mốc qua sông đúng: ĐỎ `y ≤ 4`, ĐEN `y ≥ 5`
- [ ] `T020-05/06` chứng minh **không lùi**
- [ ] Hàm thuần

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-020.md`

## 9. ⚠ CẠM BẪY
Đây là quân **dễ sai chiều nhất** vì hướng phụ thuộc bên, và vì hệ toạ độ đặt ĐỎ ở **y lớn**. Viết cứng `y+1` cho cả hai bên là lỗi kinh điển. Tám test đầu bắt đủ mọi biến thể.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Export `pawnMoves` từ game-rules/index.ts. Mỗi hàm có `(board:Board, from:Square):Move[]`; từô có quân đúng loại, suy side từ quân. Trả các Move from/to không trùng, thứ tự ổn định; không mutate board/Piece, chưa lọc tự chiếu. Caller chọn đúng loại trước khi gọi; input mạng được 011/023 kiểm riêng.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/issue-020.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Fixture makePosition 012 luôn có đúng hai tướng. Mặc định BLACK(3,0), RED(5,9) tránh các tia kiểm; khi thử tướng phải thay tướng cùng bên, không thêm tướng thứ hai. So tập đích đã đếm tay, không dùng một generator khác làm oracle.

- T020-01/02/08: RED(4,6) → (4,5); thêm RED(4,5) → chỉ(4,4) để kiểm ranh giới; RED(4,4) → (4,3),(3,4),(5,4).
- T020-03/04: BLACK(4,3) → (4,4); BLACK(4,4) → chỉ(4,5); BLACK(4,5) → (4,6),(3,5),(5,5).
- T020-05/06: duyệt mọi ô 90/bên (không chiếm vị trí tướng fixture), kết quả không có nước lùi.
- T020-07/10: RED(4,0) → (3,0),(5,0), đặt BLACK GENERAL(4,1) tránh đích; RED(0,4) → (0,3),(1,4).
- T020-09: targetforward đồng minh → loại, địch → giữ; không có phong cấp.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { pawnMoves } from '@xiangqi/game-rules';
import { makePosition } from '../fixtures/positions';
test('T020-01/07 tập đích đối chiếu tay', () => {
  const p=makePosition([
    {type:'GENERAL',side:'BLACK',x:3,y:0},
    {type:'GENERAL',side:'RED',x:5,y:9},
    {type:'PAWN',side:'RED',x:4,y:4},
  ], 'RED');
  const before=structuredClone(p);
  const destinations=pawnMoves(p.board,{x:4,y:4}).map(m => `${m.to.x},${m.to.y}`).sort();
  expect(destinations).toEqual(['4,3', '3,4', '5,4'].sort());
  expect(p).toEqual(before);
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Đổi bước RED thành y+1 hoặc ngưỡng sông y<=5; T020-01/02/05 đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-020.test.ts
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
