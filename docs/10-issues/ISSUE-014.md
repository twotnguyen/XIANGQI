# ISSUE-014 — Hình học tấn công

**Nhóm:** E02 · **Phụ thuộc:** 012 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Hàm trả lời *"ô này có bị bên kia tấn công không"* — **tính bằng hình học thuần**, tuyệt đối **không** gọi sang hàm sinh nước đi.

## 2. ĐỌC TRƯỚC
[../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) **§4 `GR-SAFE-04`** và §3 (luật đi từng quân).

## 3. PHẠM VI
**✅ LÀM** — `isSquareAttackedBy(board, square, bySide): boolean` · `findGeneral(board, side): Square | null`
**❌ KHÔNG LÀM** — sinh danh sách nước đi (015–020) · lọc tự chiếu (022)

## 4. FILE TẠO
`packages/game-rules/src/attacks.ts`

## 5. CÁC BƯỚC
1. **Luật sắt của issue này:** `attacks.ts` **KHÔNG được import** từ `moves.ts` hay bất kỳ file sinh nước đi nào. Nếu ngược lại sẽ tạo đệ quy vô hạn: sinh nước → kiểm an toàn → sinh nước → …
2. Với mỗi loại quân của `bySide`, kiểm **trực tiếp bằng hình học** xem nó có với tới `square` không:

   | Quân | Kiểm |
   |---|---|
   | Tướng | kề 1 ô thẳng, **và** phải trong cung |
   | Sĩ | kề 1 ô chéo, trong cung |
   | Tượng | chéo 2 ô, **mắt tượng trống**, chưa qua sông |
   | Mã | hình chữ 日, **chân mã trống** |
   | Xe | cùng hàng/cột, **đường đi trống hoàn toàn** |
   | Pháo | cùng hàng/cột, **đúng 1 quân chắn giữa** |
   | Tốt | kề 1 ô theo hướng tiến; **nếu đã qua sông** thì kề ngang cũng tính |

3. **Ngữ nghĩa pháo phải ghi chú rõ trong mã nguồn**:
   > Pháo **tấn công** một ô khi giữa nó và ô đó có **đúng 1** quân chắn. Với **ô trống**, hàm trả `false` — vì pháo không thể *ăn* ô trống. Việc pháo *đi tới* ô trống là chuyện của `moves.ts`, không phải của hàm này.

4. `findGeneral` trả `null` nếu không tìm thấy — **không ném lỗi**

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T014-01` | Xe tấn công dọc cột khi đường trống; **bị chặn** thì không |
| `T014-02` | Pháo tấn công khi có **đúng 1** ngòi; **0 ngòi** → false; **2 ngòi** → false |
| `T014-03` | Mã tấn công đúng 8 hướng; **chân mã bị chắn** → false |
| `T014-04` | Tượng tấn công chéo 2 ô; **mắt tượng bị chắn** → false |
| `T014-05` | Tốt ĐỎ **chưa** qua sông chỉ tấn công ô phía trước (y giảm) |
| `T014-06` | Tốt ĐỎ **đã** qua sông tấn công cả hai bên ngang |
| `T014-07` | Sĩ và tướng chỉ tấn công **trong cung** |
| `T014-08` | `findGeneral` trả đúng vị trí; bàn không có tướng → `null` |
| `T014-09` | **`attacks.ts` không import gì từ `moves.ts`** — kiểm bằng phân tích tĩnh |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 9 test xanh
- [ ] `T014-09` chứng minh **không có đệ quy chéo**
- [ ] Ngữ nghĩa pháo với ô trống có **chú thích rõ** trong mã
- [ ] Hàm thuần, không sửa `board`

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-014.md`

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng thế nào |
|---|---|
| `isSquareAttackedBy` trả `false` cho ô trống với pháo, gây hiểu nhầm (`F-26`) | Bước 3 — bắt buộc chú thích ngữ nghĩa |
| Gọi chéo sang `moves.ts` gây đệ quy vô hạn | `T014-09` |

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Giữ signature §3; Board không bị sửa. Attack geometry đọc Piece.type/side, không phụ thuộc turn và không sinh legalMoves. Cấm import trực tiếp/gián tiếp sang moves; dùng TypeScript compiler API phân tích import khi kiểm boundary.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/issue-014.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Fixture chuẩn tướng BLACK(3,0), RED(5,9) để không chắn tia thử. Xe(4,4) → (4,1); pháo(0,7) → quân RED/BLACK(0,2), ngòi(0,5)/(0,4); mã(4,4); tượng RED(4,7).

- T014-01/02: xe blocked/unblocked; pháo 0/1/2 ngòi và ô đích trống dù 1 ngòi phải false.
- T014-03/04:8 hướng mã, từng chân cùng/khác bên; tượng eye(3,6) cản → (2,5)false.
- T014-05/06: RED pawn(4,5) chỉ(4,4), RED pawn(4,4) thêm(3,4)/(5,4).
- T014-07/08: cung hai bên; findGeneral board trực tiếp thiếu tướng → null.
- T014-09: traverse dependencygraph attacks, bất kỳ path sang moves là fail; không chỉ grep một filename.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { makePosition } from '../fixtures/positions';
import { isSquareAttackedBy } from '@xiangqi/game-rules';
test('T014-02 pháo cần đúng một ngòi', () => {
  const pieces=[{type:'GENERAL',side:'BLACK',x:3,y:0},{type:'GENERAL',side:'RED',x:5,y:9},
    {type:'CANNON',side:'RED',x:0,y:7},{type:'ROOK',side:'BLACK',x:0,y:2}] as const;
  expect(isSquareAttackedBy(makePosition(pieces,'RED').board,{x:0,y:2},'RED')).toBe(false);
  const p=makePosition([...pieces,{type:'PAWN',side:'RED',x:0,y:5}], 'RED');
  expect(isSquareAttackedBy(p.board,{x:0,y:2},'RED')).toBe(true);
  expect(isSquareAttackedBy(p.board,{x:0,y:3},'RED')).toBe(false);
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Đổi pháo 1 ngòi thành>=1 hoặc gọi getLegalMoves; T014-02/static 09 phải đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-014.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao geometry độc lập, cannon-empty semantics và fixtures cho 022; chưa kiểm tự chiếu.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
