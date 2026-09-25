# ISSUE-013 — Khoá thế cờ cho luật lặp

**Nhóm:** E02 · **Phụ thuộc:** 012 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Hàm sinh chuỗi khoá duy nhất cho một thế cờ, dùng để đếm lặp 3 lần.

## 2. ĐỌC TRƯỚC
[../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) **§5 `GR-END-02`** — bảng "tính vào / không tính".

## 3. PHẠM VI
**✅ LÀM** — `positionKey(position): string` · **❌ KHÔNG LÀM** — đếm lặp (025)

## 4. FILE TẠO
`packages/game-rules/src/position-key.ts`

## 5. CÁC BƯỚC
1. Khoá **PHẢI tính vào**: loại quân · bên · vị trí của **mọi** quân còn trên bàn · **bên đến lượt**
2. Khoá **TUYỆT ĐỐI KHÔNG tính**: mã định danh quân · góc nhìn hiển thị · thời gian · số thứ tự nước
3. Sinh khoá **ổn định**: duyệt bàn theo chỉ số 0→89, ghi `<type><side>@<index>`, nối lại, cuối cùng nối `|turn`
4. Hàm **thuần**, cùng input luôn cho cùng output

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T013-01` | Cùng thế cờ gọi 2 lần → **cùng khoá** |
| `T013-02` | **Đổi mã định danh hai quân cùng loại cùng bên → KHOÁ KHÔNG ĐỔI** |
| `T013-03` | **Cùng bàn cờ, khác `turn` → KHOÁ KHÁC NHAU** |
| `T013-04` | Dời một quân sang ô khác → khoá khác |
| `T013-05` | Đổi loại một quân → khoá khác |
| `T013-06` | Đổi bên một quân → khoá khác |
| `T013-07` | Dựng cùng thế cờ theo **thứ tự đặt quân khác nhau** → **cùng khoá** |

> `T013-02` và `T013-03` là hai test cốt lõi — chúng định nghĩa chính xác luật lặp.

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 7 test xanh
- [ ] `T013-02`: mã định danh **không** ảnh hưởng khoá
- [ ] `T013-03`: lượt đi **có** ảnh hưởng khoá
- [ ] `T013-07`: thứ tự dựng **không** ảnh hưởng khoá
- [ ] Hàm thuần

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-013.md` — kèm ví dụ chuỗi khoá thực tế.

## 9. ⚠ CẠM BẪY
Nếu khoá **tính cả mã định danh quân**, hai thế cờ giống hệt nhau sẽ ra khoá khác ⇒ **không bao giờ đếm đủ 3 lần** ⇒ luật hoà do lặp **không bao giờ kích hoạt**. Test `T013-02` bắt đúng lỗi này.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

`positionKey(position:Position):string` duyệt 90 ô theo index rồi turn. Serialization có delimiter xác định type/side/index; không hash dùng id, không random, không đọc UI.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/issue-013.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Lấy initial; clone Piece đổi id tất cả quân, đảo thứ tự descriptor khi dùng makePosition; thay độc lập turn/type/side/position trên board clone.

- T013-01/02/07: repeat call/renameids/reorder input đều cùng key.
- T013-03: cùng boardturn BLACK khác RED.
- T013-04..06: dời RED pawn(0,6) → (0,5), đổi type ROOK, đổi side BLACK từng bản clone →key khác; input gốc không đổi.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { createInitialPosition, positionKey } from '@xiangqi/game-rules';
test('T013-02/03 id không tính, turn có tính', () => {
  const p=createInitialPosition();
  const renamed={...p,board:p.board.map((piece,i) => piece ? {...piece,id:`other-${i}`} : null)};
  expect(positionKey(renamed)).toBe(positionKey(p));
  expect(positionKey({...p,turn:'BLACK'})).not.toBe(positionKey(p));
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Thêm piece.id vào key; T013-02 phải đỏ; bỏ turn thì T013-03 đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-013.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao định dạng key ví dụ và tính ổn định;025/AI dùng cùng hàm, không tự tạo key khác.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
