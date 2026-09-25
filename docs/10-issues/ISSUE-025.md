# ISSUE-025 — Đếm lặp 3 lần

**Nhóm:** E02 · **Phụ thuộc:** 013, 024 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Đếm số lần một thế cờ xuất hiện, để kích hoạt hoà do lặp — và **chỉ đếm trên nhánh đang có hiệu lực**.

## 2. ĐỌC TRƯỚC
[../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) **§5 `GR-END-02`** và **§6 fixture F-REPEAT**

## 3. PHẠM VI
**✅ LÀM** — bộ đếm lặp thuần + fixture F-REPEAT
**❌ KHÔNG LÀM** — lưu vào cơ sở dữ liệu (E11) · dựng lại sau đi lại (106)

## 4. FILE TẠO
`packages/game-rules/src/repetition.ts`

## 5. CÁC BƯỚC
1. ```ts
   export type RepetitionCounts = Readonly<Record<string, number>>;
   countFromMoves(initial: Position, moves: Move[]): RepetitionCounts
   occurrencesOf(counts: RepetitionCounts, position: Position): number
   ```
2. **Thế cờ ban đầu tính là lần xuất hiện thứ 1**
3. Các lần xuất hiện **không cần liên tiếp**
4. `countFromMoves` **phải** gọi `validateMove` trước mỗi `applyMove` — fixture sai phải ném lỗi, không âm thầm bỏ qua
5. Dựng **F-REPEAT** đúng `game-rules.md` §6:
   | Nửa nước | Bên | Nước đi |
   |---|---|---|
   | 1 | ĐỎ | Mã (1,9) → (2,7) |
   | 2 | ĐEN | Mã (1,0) → (2,2) |
   | 3 | ĐỎ | Mã (2,7) → (1,9) |
   | 4 | ĐEN | Mã (2,2) → (1,0) |
6. Hàm **thuần** — trả object mới, không sửa đầu vào

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T025-01` | Thế ban đầu, **0 nước** → đếm = **1** |
| `T025-02` | **F-REPEAT sau 4 nửa nước** → đếm thế ban đầu = **2**, `getTerminalOutcome` trả **null** |
| `T025-03` | **F-REPEAT sau 8 nửa nước** → đếm = **3**, outcome **REPETITION**, winner **null** |
| `T025-04` | Cùng bàn cờ **khác lượt** → đếm **riêng biệt**, không gộp |
| `T025-05` | Lặp **không liên tiếp** (xen nước khác rồi quay lại) → vẫn đếm đúng |
| `T025-06` | `countFromMoves` **ném lỗi** khi gặp nước không hợp lệ |
| `T025-07` | Hàm thuần — không sửa `counts` hay `initial` |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 7 test xanh
- [ ] `T025-02` và `T025-03` dùng **đúng** chuỗi nước F-REPEAT
- [ ] `T025-04` chứng minh lượt đi tách khoá
- [ ] `T025-06` chứng minh có kiểm hợp lệ trước khi áp dụng
- [ ] Hàm thuần

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-025.md` — in bảng đếm sau mỗi 4 nửa nước.

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| Đếm lặp tính **cả nhánh đã bị đi lại** ⇒ báo hoà sai (`F-02`) | API nhận **danh sách nước của nhánh hiệu lực**, không nhận toàn bộ lịch sử |
| Fixture áp dụng nước mà không kiểm hợp lệ ⇒ thế cờ rác | `T025-06` |

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Giữ RepetitionCounts/countFromMoves/occurrencesOf theo§5; nhận readonly Move[] để caller khôngsợmutation. Chỉ caller chọn active branch; purefunction không biết DBtree. countFromMoves validate từng nước, throw kèm ply/reason khi sai.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/issue-025.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

F-REPEAT gồm 4 Move literal ở§5; lặp 2 vòng. Ghi boardturn sau ply 0..8 và key, không lấy counts nhập tay. Nhánh âm dùng bỏ 4 nước cuối rồi tính lại, phải 2 không 3.

- T025-01..03: countsinitial 1/2/3 tương ứng 0/4/8 ply, outcome null/null/REPETITION.
- T025-04: occurrencesOf sameboardoppositeturn tra riêng, không gộp.
- T025-05: count tại ply 0,4,8 không liên tiếp nhưng vẫn 3.
- T025-06: thay nước 1 thành mã(1,9) → (1,8) bất hợp lệ;throw đúng ply 1, khôngpartialsuccess.
- T025-07: freeze initial/moves, counts lần trước không đổi sau call khác; active prefix 4 và full 8 khác 2/3.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { createInitialPosition, countFromMoves, occurrencesOf } from '@xiangqi/game-rules';
test('T025-02/03 F-REPEAT', () => {
  const p=createInitialPosition();
  const cycle=[{from:{x:1,y:9},to:{x:2,y:7}},{from:{x:1,y:0},to:{x:2,y:2}},
    {from:{x:2,y:7},to:{x:1,y:9}},{from:{x:2,y:2},to:{x:1,y:0}}];
  expect(occurrencesOf(countFromMoves(p,cycle),p)).toBe(2);
  expect(occurrencesOf(countFromMoves(p,[...cycle,...cycle]),p)).toBe(3);
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Bỏ tính initial hoặc gộp turn key; T025-01/03/04 đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-025.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao active branch API và fixture lặp;106 rebuild chỉ activeMoveIds, không truyền cả cây.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
