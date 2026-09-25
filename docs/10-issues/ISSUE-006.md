# ISSUE-006 — Kiểu lõi bàn cờ

**Nhóm:** E01 Contracts · **Phụ thuộc:** 003 · **Trạng thái:** TODO

---

## 1. MỤC TIÊU

Định nghĩa kiểu dữ liệu nền cho bàn cờ trong `@xiangqi/contracts` — mọi package khác dùng chung.

## 2. ĐỌC TRƯỚC

| Tài liệu | Mục |
|---|---|
| [../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) | **§1 hệ toạ độ** — bắt buộc |
| [../00-overview/glossary.md](../00-overview/glossary.md) | §2 phòng và ván |

## 3. PHẠM VI

**✅ LÀM** — kiểu thuần cho bàn cờ và quân

**❌ KHÔNG LÀM** — logic sinh nước đi (E02) · Zod (011) · kiểu ván/phòng (008, 009)

## 4. FILE TẠO

`packages/contracts/src/game.ts` · cập nhật `packages/contracts/src/index.ts`

## 5. CÁC BƯỚC

1. Khai báo:
   ```ts
   export type Side = 'RED' | 'BLACK';
   export type PieceType =
     | 'GENERAL' | 'ADVISOR' | 'ELEPHANT'
     | 'HORSE' | 'ROOK' | 'CANNON' | 'PAWN';
   export type Square = { x: number; y: number };   // x 0..8, y 0..9
   export type Piece  = { id: string; type: PieceType; side: Side };
   export type Board  = readonly (Piece | null)[];  // đúng 90 phần tử
   export type Move   = { from: Square; to: Square };
   export type Position = { board: Board; turn: Side };
   ```
2. Hằng số:
   ```ts
   export const BOARD_WIDTH = 9;
   export const BOARD_HEIGHT = 10;
   export const BOARD_SIZE = 90;
   export const RULE_SET_VERSION = 'xiangqi-simple-v1';
   ```
3. **Chú thích bắt buộc ngay đầu file** — chép nguyên:
   ```
   HỆ TOẠ ĐỘ (DEC-003):
     y = 0  → hàng TRÊN CÙNG  = hàng cuối của ĐEN
     y = 9  → hàng DƯỚI CÙNG  = hàng cuối của ĐỎ
     y tăng từ TRÊN xuống DƯỚI
     Nửa sân ĐEN: y 0..4   |   Nửa sân ĐỎ: y 5..9
     Sông giữa y=4 và y=5
     Cung ĐEN: x 3..5, y 0..2   |   Cung ĐỎ: x 3..5, y 7..9
     ĐỎ đi trước
   ```
4. Export tất cả từ `index.ts`

## 6. TEST BẮT BUỘC

| Tên | Kiểm gì |
|---|---|
| `T006-01` | `BOARD_SIZE === 90` và `=== BOARD_WIDTH * BOARD_HEIGHT` |
| `T006-02` | Kiểu biên dịch được: tạo `Piece`, `Move`, `Position` hợp lệ |
| `T006-03` | `Board` là `readonly` — gán phần tử trực tiếp **không biên dịch được** |
| `T006-04` | `RULE_SET_VERSION === 'xiangqi-simple-v1'` |

## 7. ⛔ ĐIỀU KIỆN PASS

- [ ] Đủ 7 kiểu + 4 hằng số
- [ ] Khối chú thích hệ toạ độ có ở đầu file, **đúng nguyên văn**
- [ ] `pnpm typecheck` exit 0
- [ ] `T006-03` chứng minh `Board` bất biến
- [ ] `packages/contracts` **không** import package nội bộ nào (luật 002)

## 8. BẰNG CHỨNG

`docs/test-reports/ISSUE-006.md`

## 9. ⚠ CẠM BẪY

**Đây là chỗ nguy hiểm nhất của cả dự án.** Lần trước mã nguồn đặt ĐỎ ở `y=0`, **ngược** với đặc tả — phát hiện muộn, và tài liệu không bao giờ được sửa (`F-17`).

`DEC-003` đã chốt: **ĐEN ở y=0 (trên), ĐỎ ở y=9 (dưới)**. Khối chú thích ở bước 3 là để **không ai hiểu nhầm lần nữa**.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Các export giữ nguyên §5, `Board` readonly ở compile-time nhưng chưa kiểm đủ 90 phần tử runtime (schema/fixture đảm trách). Thêm test type `tests/unit/issue-006.types.ts` vào tsconfig kiểm thử; export từ package public index.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/issue-006.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Tạo board 90 bằng Array.from, một Piece RED/GENERAL, Move(4,9) → (4,8), Position.turn RED. Type-negative dùng @ts-expect-error có lý do; không cast any.

- T006-01/04: import hằng từ package public, assert exact 90/9/10/ruleset.
- T006-02: object satisfies Piece/Move/Position; typecheck phải bao gồm file types.
- T006-03: trong hàm không thực thi, phép board[0]=null gắn @ts-expect-error; nếu Board mutable thì compiler báo directive thừa → đỏ.

**Ca trọng yếu — nội dung để triển khai:**

```ts
// tests/unit/issue-006.types.ts — thuộc tsconfig test.
import type { Board, Piece, Position } from '@xiangqi/contracts';
export const piece = {id:'r-general',type:'GENERAL',side:'RED'} satisfies Piece;
export const position: Position = {board:Array.from({length:90}, () => null),turn:'RED'};
export function rejectMutation(board: Board): void {
  // @ts-expect-error Board chỉ đọc: đổi thành mutable phải làm typecheck đỏ.
  board[0] = null;
}
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Bỏ readonly khỏi Board; T006-03/typecheck phải đỏ do @ts-expect-error không còn cần.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-006.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao 7 kiểu 4 hằng từ package index; chưa coi TS array type là validator input mạng.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
