# ISSUE-022 — Cấm tự chiếu + lọc nước hợp lệ

**Nhóm:** E02 · **Phụ thuộc:** 015–021 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Gộp nước đi của mọi quân, rồi **lọc bỏ** nước làm tướng mình bị chiếu hoặc hai tướng đối mặt.

## 2. ĐỌC TRƯỚC
[../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) **§4 toàn bộ**

## 3. PHẠM VI
**✅ LÀM** — `getPseudoLegalMoves()` · `isInCheck()` · `getLegalMoves()`
**❌ KHÔNG LÀM** — phát hiện kết thúc ván (024)

## 4. FILE TẠO
`packages/game-rules/src/moves/index.ts` · `check.ts`

## 5. CÁC BƯỚC
1. `getPseudoLegalMoves(position)` — gộp nước của **mọi quân thuộc bên đến lượt**, gọi 7 hàm đã viết ở 015–020
2. `isInCheck(board, side)` — tìm tướng của `side`, gọi `isSquareAttackedBy(board, ô tướng, bên kia)`. **Không có tướng → trả `false`**
3. `getLegalMoves(position)` — **thuật toán bắt buộc theo đúng thứ tự**:
   ```
   với mỗi nước giả hợp lệ:
     ① GIẢ LẬP nước đi trên BẢN SAO bàn cờ
     ② nếu isInCheck(bảnSao, bênĐangĐi)          → LOẠI
     ③ nếu generalsFaceEachOther(bảnSao)          → LOẠI
     ④ còn lại                                    → GIỮ
   ```
4. **Tuyệt đối không** sửa `position` gốc — luôn giả lập trên bản sao
5. Kết quả trả về có **thứ tự ổn định** (cùng input → cùng thứ tự) — cần cho AI so sánh

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T022-01` | Thế ban đầu → đúng **44** nước hợp lệ cho ĐỎ |
| `T022-02` | Tướng đang bị chiếu → **mọi** nước trả về đều **gỡ được chiếu** |
| `T022-03` | Nước để tướng mình bị chiếu → **bị loại** |
| `T022-04` | **Dời quân đang chắn giữa hai tướng → BỊ LOẠI** (tướng đối mặt) |
| `T022-05` | `isInCheck` phát hiện đúng chiếu bởi xe · pháo · mã · tốt |
| `T022-06` | `isInCheck` trả `false` khi không bị chiếu |
| `T022-07` | `getLegalMoves` **không sửa** `position` đầu vào |
| `T022-08` | Gọi 2 lần → **cùng thứ tự** kết quả |
| `T022-09` | Thế cờ bí → trả **mảng rỗng** |
| `T022-10` | Nước ăn quân chiếu để gỡ chiếu → **được giữ** |

> **`T022-01` cần 44.** Thế cờ ban đầu cờ tướng: tốt 5×1=5 · pháo 2×12=24... — tự đếm tay và ghi rõ cách đếm vào báo cáo, **không** lấy output hàm làm đáp án.

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 10 test xanh
- [ ] `T022-04` chứng minh luật tướng đối mặt áp cho **mọi** nước
- [ ] `T022-07` chứng minh hàm thuần
- [ ] `T022-08` chứng minh thứ tự ổn định
- [ ] Số ở `T022-01` được **đếm tay** và ghi cách đếm

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-022.md` — kèm cách đếm tay cho `T022-01`.

## 9. ⚠ CẠM BẪY
| Lỗi hay gặp | Phòng |
|---|---|
| Chỉ kiểm tướng đối mặt khi **tướng** di chuyển | `T022-04` |
| Giả lập trên bàn **gốc** rồi hoàn tác sai | `T022-07` |
| Thứ tự nước thay đổi giữa các lần gọi ⇒ AI không tái lập được | `T022-08` |

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Export getPseudoLegalMoves(position:Position):Move[], isInCheck(board:Board, side:Side):boolean, getLegalMoves(position:Position):Move[]. Mô phỏng nội bộ copy board+dời quân, không import applyMove 023 (tránh vòng phụ thuộc); chỉ sau 023 có hàm public apply.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/issue-022.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Initial 32 quân. Fixture ghim: tướng BLACK(4,0), RED(4,9), RED ROOK(4,5); move(4,5) → (3,5) lộ tướng. Fixture tự chiếu: BLACK GENERAL(3,0), BLACK ROOK(4,0), RED GENERAL(4,9), RED ROOK(4,5). Fixture bí dùng bảng F-STALEMATE GR §6 ngay tại test này, không import terminal-positions 024 tương lai.

- T022-01: count 44 và histogram GENERAL1, ADVISOR2, ELEPHANT4, HORSE4, ROOK4, CANNON24, PAWN5; viết đích từng quân để oracle độc lập.
- T022-02/03/10: tự chiếu fixture, rook chắn không đi ngang nhưng ăn BLACK ROOK theo cột gỡ chiếu khi hợp lệ; đang chiếu dùng BLACK ROOK(4,7), RED ROOK(3,7) có nước ăn(4,7).
- T022-04: quân chắn(4,5) đi ngang bị loại dù không phải tướng.
- T022-05/06: từng attacker xe/pháo/mã/tốt đặt đúng geometry 014; thêm blocker làm not check.
- T022-07/08/09: freeze initial, hai lần exact order; F-STALEMATE trả[]; không xác nhận an toàn bằng gọi lại getLegalMoves.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { getLegalMoves } from '@xiangqi/game-rules';
import { makePosition } from '../fixtures/positions';
test('T022-04 quân chắn rời cột tướng bị loại', () => {
  const p=makePosition([{type:'GENERAL',side:'BLACK',x:4,y:0},
    {type:'GENERAL',side:'RED',x:4,y:9},{type:'ROOK',side:'RED',x:4,y:5}], 'RED');
  expect(getLegalMoves(p)).not.toContainEqual({from:{x:4,y:5},to:{x:3,y:5}});
  expect(getLegalMoves(p)).toContainEqual({from:{x:4,y:5},to:{x:4,y:4}});
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Chỉ gọi flying-general khi quân đi là GENERAL; T022-04 đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-022.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao 44 nước đếm tay, ổn định và local simulation;023/AI dùng public API.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
