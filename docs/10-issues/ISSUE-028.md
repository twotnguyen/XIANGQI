# ISSUE-028 — Sắp xếp thứ tự nước đi (MVV-LVA)

**Nhóm:** E03 · **Phụ thuộc:** 027 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Sắp xếp nước đi để nước tốt được duyệt trước — điều kiện để alpha-beta cắt tỉa hiệu quả.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-AI.md](../01-requirements/REQ-AI.md) §10 `BR-AI-22`

## 3. PHẠM VI
**✅ LÀM** — `orderMoves()` · **❌ KHÔNG LÀM** — tìm kiếm (029, 030)

## 4. FILE TẠO
`packages/ai/src/ordering.ts`

## 5. CÁC BƯỚC
1. ```ts
   orderMoves(position: Position, moves: Move[], pvMove?: Move): Move[]
   ```
2. **Thứ tự ưu tiên**:
   | Hạng | Loại nước |
   |---|---|
   | 1 | Nước trong **đường đi chính** (`pvMove`) nếu có |
   | 2 | **Nước ăn quân**, sắp theo **MVV-LVA**: ăn quân giá trị cao bằng quân giá trị thấp lên trước |
   | 3 | Nước không ăn — giữ nguyên thứ tự gốc |
3. **Thứ tự phải TẤT ĐỊNH** — cùng input luôn cho cùng output. Cần cho so sánh ở issue 030 và tái lập ở 124
4. **Không cấp phát mảng mới trong vòng lặp tìm kiếm** — cho phép sắp xếp tại chỗ nếu có chú thích rõ

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T028-01` | Nước ăn xếp **trước** nước không ăn |
| `T028-02` | MVV-LVA: **tốt ăn xe** xếp trước **xe ăn tốt** |
| `T028-03` | `pvMove` được đưa lên **vị trí đầu tiên** |
| `T028-04` | **Tất định**: gọi 2 lần → **mảng giống hệt** |
| `T028-05` | Không có nước ăn → thứ tự gốc **giữ nguyên** |
| `T028-06` | Số lượng nước **không đổi** sau sắp xếp — không mất, không thêm |
| `T028-07` | `pvMove` không nằm trong `moves` → không lỗi, bỏ qua |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 7 test xanh
- [ ] `T028-04` chứng minh tất định
- [ ] `T028-06` chứng minh không mất nước
- [ ] `T028-02` chứng minh MVV-LVA đúng chiều

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-028.md`

## 9. ⚠ CẠM BẪY
Thứ tự **không tất định** sẽ khiến issue 030 (so sánh minimax với alpha-beta) cho kết quả **khác nhau mỗi lần chạy** ⇒ không chứng minh được gì. `T028-04` là bắt buộc.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

`orderMoves(position:Position,moves:Move[],pvMove?:Move):Move[]` được mutate mảng moves caller-owned tại chỗ nhưng không mutate Move/Position; ghi rõ trả cùng array. Ties giữ input index. PV so from/to bằngtọađộ, không objectidentity.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/issue-028.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Fixture hai tướng(3,0)/(5,9); RED PAWN(0,4), BLACK ROOK(0,3), RED ROOK(8,5), BLACK PAWN(8,4). Moves tốt ăn xe, xe ăn pawn và quiet rook(8,5) → (7,5); PV là object clone quiet.

- T028-01/02: đầu vào quiet, xe ăn pawn, tốt ăn xe →tốt ăn xe trước xe ăn pawn trước quiet.
- T028-03: PVquiet lên đầu dù giá trị ăn thấp; object clone vẫn nhận.
- T028-04/05: clonearray hai lần →equal; quiet-only giữ thứ tự.
- T028-06: multiset from/to trước/sau bằng nhau; không dedup âm thầm.
- T028-07: PVkhôngthuộcinput không thêm, không throw.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { orderMoves } from '@xiangqi/ai';
import { makePosition } from '../fixtures/positions';
test('T028-02 MVV-LVA', () => {
  const p=makePosition([{type:'GENERAL',side:'BLACK',x:3,y:0},
    {type:'GENERAL',side:'RED',x:5,y:9},{type:'PAWN',side:'RED',x:0,y:4},
    {type:'ROOK',side:'BLACK',x:0,y:3},{type:'ROOK',side:'RED',x:8,y:5},
    {type:'PAWN',side:'BLACK',x:8,y:4}], 'RED');
  const high={from:{x:0,y:4},to:{x:0,y:3}};
  const low={from:{x:8,y:5},to:{x:8,y:4}};
  expect(orderMoves(p,[low,high])).toEqual([high,low]);
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** ĐảoMVV-LVAưu tiên quân đi thay quân ăn; T028-02 đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-028.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao deterministic tie-break và hợp đồng sửa mảng;029/030 dùng cùng ordering khi so sánh.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
