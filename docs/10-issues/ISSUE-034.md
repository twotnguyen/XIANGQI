# ISSUE-034 — Supabase local + biến môi trường

**Nhóm:** E04 Cơ sở dữ liệu · **Phụ thuộc:** 005 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Chạy được Supabase ở máy cá nhân, và chuẩn hoá cách nạp cấu hình.

## 2. ĐỌC TRƯỚC
[../09-technical/deployment.md](../09-technical/deployment.md) §2, §4 · [../09-technical/tech-stack.md](../09-technical/tech-stack.md) §2.3

## 3. PHẠM VI
**✅ LÀM** — Supabase CLI local · `.env.example` · nạp và kiểm cấu hình
**❌ KHÔNG LÀM** — bảng dữ liệu (035+) · Supabase cloud

## 4. FILE TẠO
`supabase/config.toml` · `.env.example` · `apps/server/src/config/env.ts`

## 5. CÁC BƯỚC
1. `supabase init`, cấu hình cổng local: API `54321` · DB `54322` · Studio `54323` · hộp thư `54324`
2. **Bật xác minh email** trong `config.toml` — hộp thư local để nhận email thật, **không** tự động xác nhận
3. Liệt kê biến môi trường:

   | Biến | Dùng ở | Bí mật? |
   |---|---|---|
   | `DATABASE_URL` | máy chủ | ✅ |
   | `SUPABASE_URL` | máy chủ | — |
   | `SUPABASE_SECRET_KEY` | máy chủ | ✅ |
   | `SUPABASE_PUBLISHABLE_KEY` | cả hai | — |
   | `APP_ORIGIN` | máy chủ | — |
   | `PORT` | máy chủ | — |
   | `INVITE_HMAC_KEY` | máy chủ | ✅ |
   | `LIVEKIT_URL` / `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` | máy chủ | ✅ |
   | `VITE_API_URL` / `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` | giao diện | — |

4. Viết `env.ts` dùng Zod: **thiếu biến bắt buộc ⇒ dừng ngay với lỗi rõ ràng**, và **không in giá trị bí mật ra log** (`DEP-09`, `DEP-10`)
5. **Cấm** tiền tố `VITE_` cho bất kỳ khoá bí mật nào (`DEP-07`)
6. `.env.example` chỉ chứa **giá trị mẫu**
7. Dựng runner `pnpm test:integration` tối thiểu với PostgreSQL local thật và bootstrap role test. Thiếu DB phải thất bại. Các migration 035–043 dùng runner này; factory toàn bộ miền dữ liệu chỉ bổ sung ở 044. Không phụ thuộc vòng vào 044 để kiểm các migration.

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T034-01` | `supabase start` chạy được, cổng 54321 và 54322 phản hồi |
| `T034-02` | Thiếu `DATABASE_URL` → máy chủ **dừng ngay** với thông báo rõ |
| `T034-03` | Thông báo lỗi **không in** giá trị biến bí mật |
| `T034-04` | **Không** biến `VITE_*` nào chứa khoá bí mật |
| `T034-05` | `.env.example` **không** chứa giá trị thật |
| `T034-07` | Runner integration kết nối PostgreSQL thật; dừng DB làm runner thất bại, không skip |
| `T034-06` | Gói build của giao diện **không** chứa chuỗi `SUPABASE_SECRET_KEY` |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 7 test xanh
- [ ] Supabase local chạy được, hộp thư nhận được email
- [ ] Xác minh email **bật**, không auto-confirm
- [ ] `T034-06` chứng minh không rò khoá vào gói giao diện

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-034.md` — kèm output `supabase status`.

## 9. ⚠ CẠM BẪY
Đặt khoá bí mật vào biến `VITE_*` khiến nó **nằm trong gói tải về của trình duyệt** — ai cũng đọc được. `T034-06` kiểm trực tiếp nội dung gói build.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Tạo `vitest.integration.config.ts`, `tests/integration/setup.ts` và `tests/fixtures/migration-db.ts`. Export `connectMigrationDb():Promise<pg.Client>` cho migration/seeding local; `connectTestDb():Promise<pg.Client>` dùng app_server; `assertLocalTestDatabase(url:string):void` kiểm host loopback và DB test trước mở kết nối. Tách MIGRATION_DATABASE_URL và DATABASE_URL, không ghi credentials vào log. Bootstrap role app_server không SUPERUSER/BYPASSRLS tại 034; 043 thêm grants/RLS. Không chờ 044 mới tạo integration runner.

Các giao diện này phải được tạo khi thực thi; chưa có mã runtime hay bằng chứng PASS. Đọc AGENT-START-HERE và TEST-CONVENTIONS; mọi phụ thuộc phải đã merge.

### Fixture và ca kiểm có thể chạy

**File kiểm thử:** `tests/integration/issue-034.test.ts`; kiểm env thuần thêm `tests/unit/issue-034.test.ts`.

Dùng Supabase local tại bốn cổng §5, credentials runtime và migration tách biệt. Biến kiểm rò secret dùng chuỗi canary tự tạo, không in credential thật.

- T034-01: khởi động Supabase; HTTP Auth health và SELECT version/current_database/current_user trả dữ liệu thật; đăng ký nhận email trong hộp thư local.
- T034-02/03: spawn server không có DATABASE_URL phải exit khác 0; stderr nêu tên biến, không chứa canary đặt trong secret khác.
- T034-04/05/06: kiểm allowlist VITE_, env mẫu và gói web build. Tên SUPABASE_SECRET_KEY và mọi giá trị canary server không có trong assets.
- T034-07: SELECT 1 xanh khi DB chạy; dừng DB local test rồi chạy lại phải đỏ, skip=0. Khởi động lại và chạy xanh. Path integration không tồn tại phải exit khác 0.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { connectTestDb } from '../fixtures/migration-db';
test('T034-07 PostgreSQL thật và đúng role', async () => {
  const db=await connectTestDb();
  try {
    const result=await db.query<{role:string;pid:number}>(
      'SELECT current_user AS role, pg_backend_pid() AS pid');
    expect(result.rows[0]?.role).toBe('app_server');
    expect(result.rows[0]?.pid).toBeGreaterThan(0);
  } finally { await db.end(); }
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Cho setup ca tch connection error rồi return; DB off negative phải đỏ vìrunnergiảxanh, không dùng skip.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:integration -- tests/integration/issue-034.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao 2 credential roles local(chỉ tên biến), runner thật và safeconnect APIs cho 035–043;044 mở rộng factory chứ không là phụ thuộc bắt buộc. Chưa có LiveKit không cần RPC media ở mốc này.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
