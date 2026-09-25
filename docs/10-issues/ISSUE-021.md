# ISSUE-021 — Luật tướng đối mặt

**Nhóm:** E02 · **Phụ thuộc:** 015 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Hàm phát hiện hai tướng **nhìn thẳng nhau** trên cùng cột mà không có quân chắn.

## 2. ĐỌC TRƯỚC
[../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) **§4 `GR-SAFE-01`**

## 3. PHẠM VI
**✅ LÀM** — `generalsFaceEachOther(board): boolean`
**❌ KHÔNG LÀM** — lọc nước đi (022)

## 4. FILE TẠO
`packages/game-rules/src/moves/flying-general.ts`

## 5. CÁC BƯỚC
1. Tìm cả hai tướng. Thiếu một trong hai → trả `false`
2. Hai tướng **khác cột** → trả `false`
3. Cùng cột → đếm quân **giữa** chúng. **0 quân** → trả `true` (vi phạm)
4. Hàm này được issue 022 gọi **sau khi giả lập nước đi**

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T021-01` | Hai tướng cùng cột 4, **không** quân chắn → `true` |
| `T021-02` | Hai tướng cùng cột 4, **1 quân** chắn → `false` |
| `T021-03` | Hai tướng **khác cột** → `false` |
| `T021-04` | Quân chắn là quân **bất kỳ bên nào** đều tính |
| `T021-05` | Thiếu một tướng → `false`, **không ném lỗi** |
| `T021-06` | Hai tướng cùng cột, **nhiều quân** chắn → `false` |
| `T021-07` | Không sửa `board` |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 7 test xanh
- [ ] `T021-05` không ném lỗi khi thiếu tướng
- [ ] Hàm thuần

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-021.md`

## 9. ⚠ CẠM BẪY
Luật này áp dụng cho **mọi nước đi**, kể cả nước chỉ **dời quân đang chắn** đi chỗ khác — lúc đó hai tướng lộ mặt nhau. Issue 022 phải gọi hàm này **sau khi giả lập**, không phải chỉ khi tướng di chuyển.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

`generalsFaceEachOther(board:Board):boolean`; dùng findGeneral 014 và scan giữa hai y, loại trừ chính ô tướng. Không thêm nước ăn tướng.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/issue-021.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Board tối thiểu tướng BLACK(4,0), RED(4,9), blocker PAWN(4,5). Trường hợp thiếu tướng dùng Board 90 thủ công vì makePosition cốý từ chối.

- T021-01/02/04/06:0 blocker true,1 blocker RED/BLACK false,2 blockers y 4/y 5 false.
- T021-03: đổi BLACK sang(3,0) → false.
- T021-05: remove BLACK rồi remove RED từng case → false không throw.
- T021-07: deepfreeze board+piece rồi gọi, đầu vào unchanged.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { generalsFaceEachOther } from '@xiangqi/game-rules';
import { makePosition } from '../fixtures/positions';
test('T021-01/02 quân chắn bất kỳ bên', () => {
  const generals=[{type:'GENERAL',side:'BLACK',x:4,y:0},{type:'GENERAL',side:'RED',x:4,y:9}] as const;
  expect(generalsFaceEachOther(makePosition(generals,'RED').board)).toBe(true);
  for (const side of ['RED','BLACK'] as const) {
    expect(generalsFaceEachOther(makePosition([...generals,{type:'PAWN',side,x:4,y:5}],'RED').board)).toBe(false);
  }
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Cho scan chỉ đếm quân địch; T021-04 phải đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-021.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao pure detector,022 gọi sau mô phỏng mọi nước.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
