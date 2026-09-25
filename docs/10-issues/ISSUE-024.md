# ISSUE-024 — Kết thúc ván: chiếu hết / hết nước

**Nhóm:** E02 · **Phụ thuộc:** 023, 008 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Phát hiện ván kết thúc do hết nước đi — phân biệt **chiếu hết** và **hết nước**, và **cả hai đều THUA**.

## 2. ĐỌC TRƯỚC
[../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) **§5 `GR-END-01`, `GR-END-03`** và **§6 fixture F-MATE, F-STALEMATE**

## 3. PHẠM VI
**✅ LÀM** — `getTerminalOutcome(position, occurrences)` · fixture F-MATE, F-STALEMATE
**❌ LÀM SAU** — đếm lặp (025)

## 4. FILE TẠO
`packages/game-rules/src/terminal.ts` · `tests/fixtures/terminal-positions.ts`

## 5. CÁC BƯỚC
1. ```ts
   getTerminalOutcome(position, occurrences: number): Outcome | null
   ```
2. **Thứ tự kiểm — bắt buộc đúng (`GR-END-03`)**:
   ```
   ① legalMoves rỗng?
        ├─ CÓ  → isInCheck ? CHECKMATE : STALEMATE
        │        winner = ĐỐI THỦ của bên đến lượt   (CẢ HAI ĐỀU THUA)
        └─ KHÔNG → tiếp ②
   ② occurrences >= 3 ?
        ├─ CÓ  → REPETITION, winner = null (HOÀ)
        └─ KHÔNG → trả null
   ```
3. **`GR-END-01` — điểm khác cờ vua:** hết nước đi mà **không** bị chiếu vẫn là **THUA**, không phải hoà
4. Dựng **đúng** hai fixture trong `game-rules.md` §6:

   **F-MATE** — ĐEN đến lượt:
   | Bên | Quân | Vị trí |
   |---|---|---|
   | ĐEN | Tướng | (4,0) |
   | ĐỎ | Tướng | (4,9) |
   | ĐỎ | Tốt | (4,5) |
   | ĐỎ | Xe | (3,2) · (4,2) · (5,2) |

   **F-STALEMATE** — ĐEN đến lượt:
   | Bên | Quân | Vị trí |
   |---|---|---|
   | ĐEN | Tướng | (4,0) |
   | ĐỎ | Tướng | (4,9) |
   | ĐỎ | Tốt | (4,5) |
   | ĐỎ | Xe | (3,1) · (5,1) |

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T024-01` | **F-MATE**: `isInCheck` = **true** · `getLegalMoves` = **rỗng** · outcome `CHECKMATE` · winner **RED** |
| `T024-02` | **F-STALEMATE**: `isInCheck` = **false** · `getLegalMoves` = **rỗng** · outcome `STALEMATE` · winner **RED** |
| `T024-03` | Thế ban đầu, `occurrences=1` → **null** |
| `T024-04` | Còn nước đi, `occurrences=3` → `REPETITION`, winner **null** |
| `T024-05` | **Hết nước ĐỒNG THỜI `occurrences=3`** → trả **CHECKMATE/STALEMATE**, KHÔNG phải REPETITION |
| `T024-06` | `occurrences=2` → **null** |
| `T024-07` | Hàm thuần |

> `T024-05` kiểm **thứ tự ưu tiên** `GR-END-03` — hết nước **thắng** lặp.

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 7 test xanh
- [ ] Hai fixture dùng **đúng toạ độ** trong `game-rules.md` §6
- [ ] `T024-02` khẳng định hết nước là **THUA**, không phải hoà
- [ ] `T024-05` chứng minh thứ tự ưu tiên đúng
- [ ] Báo cáo ghi **lập luận tay** vì sao hai fixture đúng — **không** lấy output hàm làm đáp án

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-024.md` — chép lập luận từng đường thoát của tướng ĐEN từ `game-rules.md` §6.

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| Fixture trong tài liệu **khác** fixture thật trong mã, và toạ độ bị **lật ngược** (`F-17`) | Bước 4 — chép **đúng** bảng, `T024-01/02` |
| Lấy chính `getLegalMoves` làm đáp án cho `getLegalMoves` | Bước 8 — bắt buộc lập luận tay |

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

`getTerminalOutcome(position:Position,occurrences:number):Outcome|null`; Outcome 008 là dependency cần có. Tạo `makeMatePosition()` và `makeStalematePosition()` trong terminal-positions.ts trả Position mới từ makePosition 012 đúng bảng§5.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/issue-024.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Hai fixtureF-MATE/F-STALEMATE theo GR §6, BLACK turn. Không đảo tọađộ. Ba ô thoát BLACK(3,0),(5,0),(4,1) đều có lập luận bằng tia xe, không derive expected từ code.

- T024-01/02: assert isInCheck true/false, legal[] và Outcome RED tương ứng; tất cả assertions bắt buộc.
- T024-03/04/06: initial occurrences 1,2 → null,3 và 4 → REPETITION/nullwinner.
- T024-05: mỗi fixture F occurrences 3 vẫn CHECKMATE/STALEMATE, không hoà.
- T024-07: snapshot before/after và call repeat.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { getTerminalOutcome } from '@xiangqi/game-rules';
import { makeStalematePosition } from '../fixtures/terminal-positions';
test('T024-05 hết nước ưu tiên lặp và vẫn thua', () => {
  expect(getTerminalOutcome(makeStalematePosition(),3))
    .toEqual({reason:'STALEMATE',winner:'RED'});
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Đảo thứ tự repetition trướclegalempty; T024-05 đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-024.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao 2 fixture và chứng minh tay; occurrencecount do 025/server cung cấp.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
