# ISSUE-003 — Vitest + cấu trúc test unit

**Nhóm:** E00 · **Phụ thuộc:** 002 · **Trạng thái:** TODO

---

## 1. MỤC TIÊU

Dựng bộ chạy test unit **thất bại rõ ràng** khi chọn sai đường dẫn, và có sẵn **đồng hồ giả**.

## 2. ĐỌC TRƯỚC

[WORKFLOW.md](WORKFLOW.md) §4 (7 luật viết test) · [../06-acceptance/test-scenarios.md](../06-acceptance/test-scenarios.md) §1

## 3. PHẠM VI

**✅ LÀM** — `vitest.config.ts` cho unit · đồng hồ giả tiêm vào · `tests/fixtures/` · script `test:unit`

**❌ LÀM SAU** — runner tích hợp tối thiểu (034), factory mở rộng (044) · e2e (004)

## 4. FILE TẠO

```
vitest.config.ts
tests/fixtures/test-clock.ts
tests/unit/smoke.test.ts
```

## 5. CÁC BƯỚC

1. `vitest.config.ts` — **chỉ** gom `tests/unit/**/*.test.ts` và `packages/**/*.test.ts`
2. **Bắt buộc** `passWithNoTests: false`
3. Loại trừ rõ ràng `tests/integration` · `tests/e2e` · `tests/media` · `tests/load`
4. Viết `test-clock.ts`:
   ```ts
   export interface TestClock {
     now(): number;
     set(ms: number): void;
     advance(ms: number): void;
     runDueTasks(): void;     // chạy mọi hẹn giờ đã tới hạn
     schedule(atMs: number, fn: () => void): void;
   }
   export function createTestClock(startMs?: number): TestClock;
   ```
5. Viết `smoke.test.ts` kiểm chính đồng hồ giả: `advance` đúng · `runDueTasks` chạy đúng thứ tự · hẹn giờ chưa tới hạn **không** chạy
6. Bật báo cáo độ phủ nhưng **không** đặt ngưỡng (`AC-RULE-05`)

## 6. TEST BẮT BUỘC

| Tên | Kiểm gì |
|---|---|
| `T003-01` | `pnpm test:unit` → exit 0, smoke test xanh |
| `T003-02` | `pnpm test:unit -- tests/unit/khong-ton-tai.test.ts` → **exit khác 0** |
| `T003-03` | Đồng hồ giả: `advance(1000)` làm `now()` tăng đúng 1000 |
| `T003-04` | Đồng hồ giả: hẹn giờ ở mốc 500, `advance(400); runDueTasks()` → **chưa chạy**; `advance(100); runDueTasks()` → **chạy** |
| `T003-05` | `pnpm test:unit` **không** chạy file trong `tests/integration/` |

## 7. ⛔ ĐIỀU KIỆN PASS

- [ ] `pnpm test:unit` exit 0
- [ ] Đường dẫn sai → **exit khác 0** (`passWithNoTests: false`)
- [ ] Đồng hồ giả có đủ 5 hàm và test chứng minh đúng
- [ ] Config **không** gom file tích hợp/e2e
- [ ] **0 test bị bỏ qua**

## 8. BẰNG CHỨNG

`docs/test-reports/ISSUE-003.md` — output cả trường hợp đúng và trường hợp đường dẫn sai.

## 9. ⚠ CẠM BẪY

| Lỗi lần trước | Phòng thế nào |
|---|---|
| `passWithNoTests` bật → chọn sai file vẫn xanh | `T003-02` |
| Config unit gom nhầm test tích hợp → chạy chậm, hay hỏng | `T003-05` |

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Giữ API Test Clock ở §5. `advance` chỉ đổi now; `runDueTasks` mới drain callback tới hạn, theo at Ms và thứ tự đăng ký khi bằng nhau, kể cả callback đăng ký thêm task đã tới hạn. Mọi test nghiệp vụ gọi hai bước rõ ràng. `set` phục vụ setup; không làm Date.now giả toàn cục.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/smoke.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Tạo tests/unit/smoke.test.ts. Đồng hồ bắt đầu 0, task ở 500; hai task cùng mốc 500 để kiểm thứ tự ổn định. Probe integration tạm chứa throw để chứng minh không bị unit scan.

- T003-01/03: now 0 → advance 1000 → now 1000, mỗi test clock riêng.
- T003-02: đúng path chạy ít nhất 1 test; path sai exit!=0 với no test files found.
- T003-04: advance 400+drain chưa chạy; advance 100+drain chạy đúng 1; drain lần 2 không chạy lại.
- T003-05: tạo probe integration throw ở top-level; unit xanh và reporter không liệt kê probe; xóa trong finally.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { createTestClock } from '../fixtures/test-clock';
test('T003-04 deadline inclusive, drain once', () => {
  const clock = createTestClock(0);
  const seen: number[] = [];
  clock.schedule(500, () => seen.push(clock.now()));
  clock.advance(400); clock.runDueTasks();
  expect(seen).toEqual([]);
  clock.advance(100); clock.runDueTasks(); clock.runDueTasks();
  expect(seen).toEqual([500]);
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Đổi điều kiện due từ <= thành <; T003-04 phải đỏ đúng tại 500.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/smoke.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao config không gom integration và Test Clock cho 031/092+; unit lọc path không đúng là BLOCKED mọi issue phụ thuộc.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
