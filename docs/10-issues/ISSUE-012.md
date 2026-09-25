# ISSUE-012 — Thế cờ ban đầu + makePosition

**Nhóm:** E02 Luật cờ · **Phụ thuộc:** 007 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Tạo thế cờ ban đầu đúng 32 quân, và hàm dựng thế cờ tuỳ ý cho test.

## 2. ĐỌC TRƯỚC
[../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) **§1 và §2** — bảng vị trí 32 quân.

## 3. PHẠM VI
**✅ LÀM** — `createInitialPosition` · `makePosition` cho test
**❌ KHÔNG LÀM** — sinh nước đi (015–020)

## 4. FILE TẠO
`packages/game-rules/src/initial.ts` · `tests/fixtures/positions.ts`

## 5. CÁC BƯỚC
1. `createInitialPosition(): Position` — đặt đúng 32 quân theo bảng `GR-INIT`:

   | Bên | y hàng cuối | Pháo | Tốt |
   |---|---|---|---|
   | **ĐEN** (trên) | **y=0** | y=2, x=1 và 7 | y=3, x=0,2,4,6,8 |
   | **ĐỎ** (dưới) | **y=9** | y=7, x=1 và 7 | y=6, x=0,2,4,6,8 |

   Hàng cuối theo thứ tự x=0→8: `ROOK HORSE ELEPHANT ADVISOR GENERAL ADVISOR ELEPHANT HORSE ROOK`

2. `turn` ban đầu = **`'RED'`**
3. Mã định danh quân ổn định, ví dụ `r-rook-0`, `b-pawn-2`
4. `makePosition(pieces, turn)` trong fixture:
   - Nhận `{type, side, x, y}[]`, tự cấp mã định danh
   - **Không** tự thêm quân nào
   - **Ném lỗi** nếu: hai quân cùng ô · toạ độ ngoài bàn · **thiếu tướng của một bên**

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T012-01` | Đúng **32** quân, **16** mỗi bên |
| `T012-02` | Đếm từng loại: 1 tướng · 2 sĩ · 2 tượng · 2 mã · 2 xe · 2 pháo · 5 tốt — mỗi bên |
| `T012-03` | **Tướng ĐEN ở (4,0)**, **tướng ĐỎ ở (4,9)** |
| `T012-04` | `turn === 'RED'` |
| `T012-05` | Pháo ĐEN ở (1,2)(7,2); pháo ĐỎ ở (1,7)(7,7) |
| `T012-06` | Tốt ĐEN ở y=3; tốt ĐỎ ở y=6 |
| `T012-07` | 58 ô còn lại đều `null` |
| `T012-08` | `makePosition` **ném lỗi** khi trùng ô |
| `T012-09` | `makePosition` **ném lỗi** khi thiếu tướng |
| `T012-10` | Gọi `createInitialPosition()` hai lần trả **hai object khác nhau** (không dùng chung tham chiếu) |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 10 test xanh
- [ ] `T012-03` khẳng định **ĐEN y=0, ĐỎ y=9**
- [ ] `makePosition` từ chối fixture thiếu tướng
- [ ] Hàm thuần, không dùng chung trạng thái

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-012.md`

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng thế nào |
|---|---|
| Mã nguồn đặt **ĐỎ ở y=0** — ngược đặc tả (`F-17`) | `T012-03` |
| Fixture "hợp lệ" nhưng **thiếu tướng** ⇒ test luật sai mà vẫn xanh | `T012-09` |

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

`createInitialPosition(): Position`; `makePosition(pieces: readonly {type:PieceType;side:Side;x:number;y:number}[], turn:Side):Position`. Fixture helper kiểm đúng 90 ô, tọa độ nguyên, duplicate square và đủ một tướng mỗi bên; không tự thêm tướng, không đòi trạng thái quân khớp số ban đầu.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/issue-012.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Expected initial viết literal bảng GR-INIT, không gọi helper sản xuất để dựng oracle. Kiểm 32 id unique và hai lần tạo không chia sẻ board/Piece mutable.

- T012-01/02/07: count board cells 32,16/bên, breakdown 1/2/2/2/2/2/5 và 58 null.
- T012-03..06: assert từng ô trong GR-INIT và turn RED.
- T012-08/09: duplicate(4,0), thiếu BLACK, thiếu RED, x 9/y 10/thậpphân →throw; không âm thầm ghi đè.
- T012-10: gọi 2 lần, deep equal nhưng reference position/board khác; nếu Piece object mutable thì cũng khôngshare.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { createInitialPosition } from '@xiangqi/game-rules';
test('T012-03 hệ tọa độ chuẩn', () => {
  const p=createInitialPosition();
  expect(p.board).toHaveLength(90);
  expect(p.board[4]).toMatchObject({type:'GENERAL',side:'BLACK'});
  expect(p.board[85]).toMatchObject({type:'GENERAL',side:'RED'});
  expect(p.turn).toBe('RED');
  expect(p.board.filter(Boolean)).toHaveLength(32);
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Đảo y của hai bên; T012-03/05/06 phải đỏ đồng thời.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-012.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao initial chuẩn và fixture validator cho 014–033; negative thiếu tướng của 014/021 phải dựng Board trực tiếp có chủ đích.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
