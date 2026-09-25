# ISSUE-004 — Playwright + cấu trúc e2e

**Nhóm:** E00 · **Phụ thuộc:** 003 · **Trạng thái:** TODO

---

## 1. MỤC TIÊU

Dựng bộ chạy e2e với **8 phiên trình duyệt độc lập** và **2 kích thước màn hình**, sẵn sàng cho kịch bản 2 người chơi + 5 người xem + người thứ 6 bị từ chối.

## 2. ĐỌC TRƯỚC

[../06-acceptance/test-scenarios.md](../06-acceptance/test-scenarios.md) §1–§2 · [../03-screens/design-tokens.md](../03-screens/design-tokens.md) §6–§7

## 3. PHẠM VI

**✅ LÀM** — `playwright.config.ts` · 2 project (desktop 1366 / mobile 360) · helper tạo nhiều phiên · smoke test

**❌ KHÔNG LÀM** — kịch bản nghiệp vụ thật (các issue sau)

## 4. FILE TẠO

```
playwright.config.ts
tests/e2e/helpers/sessions.ts
tests/e2e/smoke.spec.ts
```

## 5. CÁC BƯỚC

1. Cài Playwright, chỉ trình duyệt **Chromium**
2. Hai project:
   | Tên | Kích thước |
   |---|---|
   | `desktop` | 1366 × 768 |
   | `mobile` | 360 × 800 |
3. `webServer` tự khởi động web + server trước khi chạy, có thăm dò sẵn sàng — **không** dùng `sleep` cố định
4. Viết `sessions.ts`:
   ```ts
   // Tạo N ngữ cảnh trình duyệt ĐỘC LẬP (mỗi cái cookie/storage riêng)
   export async function createSessions(browser: Browser, n: number): Promise<BrowserContext[]>;
   export async function closeSessions(ctxs: BrowserContext[]): Promise<void>;
   ```
5. `smoke.spec.ts`: mở trang chủ ở cả 2 project, thấy chữ *"Cờ Tướng Online"*
6. Thêm test tạo **8 ngữ cảnh** cùng lúc và xác nhận **không dùng chung** storage
7. Bật lưu vết khi thất bại; **thêm `test-results/` vào `.gitignore`**

## 6. TEST BẮT BUỘC

| Tên | Kiểm gì |
|---|---|
| `T004-01` | `pnpm test:e2e` → exit 0, smoke xanh ở **cả 2** project |
| `T004-02` | `pnpm test:e2e -- tests/e2e/khong-ton-tai.spec.ts` → **exit khác 0** |
| `T004-03` | Tạo **8 ngữ cảnh** đồng thời, mỗi cái ghi `localStorage` khác nhau → đọc lại **không lẫn** |
| `T004-04` | Ở project `mobile` (360px), trang chủ **không tràn ngang** |

## 7. ⛔ ĐIỀU KIỆN PASS

- [ ] `pnpm test:e2e` exit 0 ở cả 2 project
- [ ] Đường dẫn sai → exit khác 0
- [ ] `T004-03` chứng minh 8 phiên **thật sự độc lập**
- [ ] `T004-04` chứng minh không tràn ngang ở 360px
- [ ] `webServer` dùng thăm dò sẵn sàng, **không** `sleep`
- [ ] `test-results/` đã bị bỏ qua trong git

## 8. BẰNG CHỨNG

`docs/test-reports/ISSUE-004.md` — output cả 2 project + chứng minh 8 phiên độc lập.

## 9. ⚠ CẠM BẪY

Kịch bản xương sống cần **8 phiên độc lập** (2 chơi + 5 xem + 1 bị từ chối). Nếu `sessions.ts` dùng chung storage thì mọi test người xem sẽ **sai âm thầm** — người thứ 6 sẽ "vào được" vì thực ra là cùng một phiên.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Helper create Sessions/close Sessions ở §5 trả Browser Context thực riêng biệt, không dùng một context rồi nhiều page. Config desktop 1366 × 768 và mobile 360 × 800; create Sessions thất bại giữa chừng phải đóng các context đã tạo.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/e2e/smoke.spec.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Dùng trang smoke 001 làm cùng origin cho localStorage; tám context, mỗi context một page. Test không cần Auth, rooms hay server service tương lai.

- T004-01: smoke ở cả desktop/mobile, heading hiện thật; report phải có hai project.
- T004-02: path sai → exit!=0, không fallback chạy toàn bộ.
- T004-03: mở 8 context bằng Promise.all; set marker riêng i, đọc lại từng i, đóng context số 0 và assert context 1 còn marker 1.
- T004-04: mobile đo documentElement.scrollWidth <= innerWidth; không chỉ chụp ảnh.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { test, expect } from '@playwright/test';
import { createSessions, closeSessions } from './helpers/sessions';
test('T004-03 storage độc lập', async ({ browser, baseURL }) => {
  if (!baseURL) throw new Error('Thiếu baseURL');
  const contexts = await createSessions(browser, 8);
  try {
    const pages = await Promise.all(contexts.map(c => c.newPage()));
    await Promise.all(pages.map(async (p, i) => {
      await p.goto(baseURL);
      await p.evaluate(v => localStorage.setItem('probe', v), String(i));
    }));
    const values = await Promise.all(pages.map(p => p.evaluate(() => localStorage.getItem('probe'))));
    expect(values).toEqual(['0','1','2','3','4','5','6','7']);
  } finally { await closeSessions(contexts); }
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Cho create Sessions trả cùng context 8 lần; T004-03 phải đỏ vì marker bị ghi đè.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:e2e -- tests/e2e/smoke.spec.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:e2e
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao smoke/config/helper và vết lỗi; nghiệp vụ ghế 7+1 chỉ được chứng minh ở issue có join.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
