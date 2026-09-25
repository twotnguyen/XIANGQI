# ISSUE-005 — CI pipeline 4 cổng

**Nhóm:** E00 · **Phụ thuộc:** 002, 003, 004 · **Trạng thái:** TODO

---

## 1. MỤC TIÊU

Dựng CI chạy **4 cổng bắt buộc** trên mọi PR, và **không cho phép bỏ qua test âm thầm**.

## 2. ĐỌC TRƯỚC

[WORKFLOW.md](WORKFLOW.md) §3, §8 · [../06-acceptance/acceptance-criteria.md](../06-acceptance/acceptance-criteria.md) §6

## 3. PHẠM VI

**✅ LÀM** — workflow CI 4 cổng · pin phiên bản Node · cài theo lockfile · **chặn merge khi đỏ**

**❌ LÀM SAU** — lane tích hợp tối thiểu (034), factory mở rộng (044) · lane media (112) · lane tải (135)

## 4. FILE TẠO

`.github/workflows/ci.yml`

## 5. CÁC BƯỚC

1. Kích hoạt: `pull_request` vào `main` và `push` lên `main`
2. Pin **chính xác** phiên bản Node (ví dụ `24.x.y`, không phải `24`)
3. `pnpm install --frozen-lockfile` — **cấm** `--no-frozen-lockfile`
4. Bốn bước tuần tự, **dừng ngay khi bước nào đỏ**:
   ```
   pnpm lint  →  pnpm typecheck  →  pnpm build  →  pnpm test:unit
   ```
5. Thêm bước **kiểm tra không có test bị bỏ qua**: đọc output của Vitest, nếu `skipped > 0` thì **làm CI đỏ**
6. Thêm bước chặn `.only`: `grep -rn "\.only(" tests/ packages/` → có kết quả là **đỏ**
7. Bật bộ nhớ đệm cho pnpm store
8. Chạy `pnpm test:e2e` smoke thật trên cả hai project; tải lên vết Playwright khi thất bại

## 6. TEST BẮT BUỘC

| Tên | Kiểm gì |
|---|---|
| `T005-01` | PR sạch → CI **xanh**, cả 4 cổng chạy |
| `T005-02` | PR có lỗi lint → CI **đỏ** ở bước lint |
| `T005-03` | PR có lỗi kiểu → CI **đỏ** ở bước typecheck |
| `T005-04` | PR có test đỏ → CI **đỏ** ở bước test |
| `T005-05` | PR có test `.skip` → CI **đỏ** |
| `T005-06` | PR có `.only` → CI **đỏ** |

> `T005-05` và `T005-06` phải được chứng minh bằng **PR thử thật**, không chỉ đọc file cấu hình.

## 7. ⛔ ĐIỀU KIỆN PASS

- [ ] CI chạy đủ **4 cổng** trên PR
- [ ] Phiên bản Node được pin **chính xác**
- [ ] Dùng `--frozen-lockfile`
- [ ] `T005-05` chứng minh test bị bỏ qua làm CI **đỏ**
- [ ] `T005-06` chứng minh `.only` làm CI **đỏ**
- [ ] Nhánh `main` bật bảo vệ, **bắt buộc CI xanh** mới merge được

## 8. BẰNG CHỨNG

`docs/test-reports/ISSUE-005.md` — link tới 6 lần chạy CI tương ứng 6 test trên.

## 9. ⚠ CẠM BẪY

| Lỗi lần trước | Phòng thế nào |
|---|---|
| Test tích hợp **luôn bị bỏ qua**, kể cả ở lane tích hợp — CI vẫn xanh suốt (`F-11`) | `T005-05` biến test bị bỏ qua thành **lỗi CI** |
| Không ai để ý `.only` sót lại | `T005-06` |

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Workflow `ci.yml` xuất các check có tên ổn định được branch protection yêu cầu; thêm `tests/unit/issue-005.test.ts` kiểm parser báo cáo và `scripts/assert-test-report.mjs` đọc JSON thực. CI âm chạy PR thử thật, không hợp nhất probe.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/issue-005.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Sáu commit thử độc lập dựa cùng baseline xanh. Lưu URL run + SHA + check kết luận cho từng T005; quyền sửa branch protection là tài nguyên cần có.

- T005-01: PR sạch có lint/typecheck/build/unit/e 2 e, ít nhất 1 unit và 2 smoke projects.
- T005-02..04: đưa từng lỗi lint/type/test riêng; xác định đúng step đỏ, các step sau không giả báo chạy.
- T005-05: thêm test.skip rồi đẩy PR thử; JSON skipped>0 làm validator đỏ dù runner exit 0.
- T005-06: thêm test.only trong probe; CI đỏ trước merge; cuối cùng xóa probes, chạy xanh toàn bộ.

**Ca trọng yếu — nội dung để triển khai:**

```js
// scripts/assert-test-report.mjs; Vitest root script xuất artifacts/unit-results.json.
import { readFileSync } from 'node:fs';
const report = JSON.parse(readFileSync(process.argv[2], 'utf8'));
if (report.numTotalTests < 1 || report.numPendingTests > 0 || report.numFailedTests > 0) {
  throw new Error('CI yêu cầu test thực chạy, fail=0, skip=0');
}
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Đổi validator thành bỏ qua pending; PR T005-05 phải chứng minh lỗ hổng và bị test validator bắt.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-005.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:e2e
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao 6 URL CI, branch protection screenshot/API evidence; thiếu quyền cấu hình bắt buộc ghi BLOCKED_EXTERNAL, không coi YAML là chứng minh merge bị chặn.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
