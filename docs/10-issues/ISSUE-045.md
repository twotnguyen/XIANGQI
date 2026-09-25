# ISSUE-045 — Prisma db pull + sinh client

**Nhóm:** E04 · **Phụ thuộc:** 043 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Sinh kiểu dữ liệu TypeScript từ schema **đã có sẵn**, và **khoá chặt** việc Prisma không được quản lý schema.

## 2. ĐỌC TRƯỚC
[../09-technical/tech-stack.md](../09-technical/tech-stack.md) **§2.3 và §3** — ranh giới Prisma / SQL thuần.

## 3. PHẠM VI
**✅ LÀM** — `prisma db pull` · sinh client · **chặn** `prisma migrate`
**❌ TUYỆT ĐỐI KHÔNG LÀM** — `prisma migrate` dưới mọi hình thức

## 4. FILE TẠO
`apps/server/prisma/schema.prisma` · `apps/server/src/db/prisma.ts` · `apps/server/src/db/pool.ts` · `apps/server/src/db/transaction.ts`

## 5. CÁC BƯỚC
1. `schema.prisma` chỉ khai `generator` và `datasource`, bật `multiSchema` cho `["auth","public"]`
2. Chạy **`prisma db pull`** để hút schema từ database — **không** viết model bằng tay
3. `prisma generate` sinh client
4. **Chặn bằng script**: thêm vào `package.json`
   ```json
   "prisma:migrate": "echo 'CẤM. Schema do Supabase CLI quản lý (TECH-10).' && exit 1"
   ```
5. Viết `pool.ts` — pool `pg` cho **SQL thuần**, dùng vai trò `app_server`
6. Viết `transaction.ts` với helper:
   ```ts
   withTransaction<T>(fn: (client) => Promise<T>): Promise<T>
   ```
   **Tự động rollback** khi ném lỗi
7. Thêm `docs/DB-BOUNDARY.md` — bảng ranh giới Prisma / SQL thuần, chép từ `tech-stack.md` §3

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T045-01` | `prisma db pull` chạy được, sinh đủ model cho mọi bảng |
| `T045-02` | `prisma generate` → client biên dịch được |
| `T045-03` | Đọc `profiles` bằng Prisma client → thành công |
| `T045-04` | ⭐ `pnpm prisma:migrate` → **exit khác 0** với thông báo cấm |
| `T045-05` | **Không** thư mục `prisma/migrations/` nào tồn tại |
| `T045-06` | Pool `pg` chạy được `SELECT ... FOR UPDATE` trong transaction |
| `T045-07` | `withTransaction` **rollback** khi hàm bên trong ném lỗi |
| `T045-08` | `withTransaction` **commit** khi thành công |
| `T045-09` | Pool kết nối bằng vai trò `app_server`, **không** superuser |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 9 test xanh trên PostgreSQL thật
- [ ] **`T045-04`** chứng minh `prisma migrate` bị chặn
- [ ] **`T045-05`** không có thư mục migration của Prisma
- [ ] `T045-06` chứng minh `FOR UPDATE` chạy được qua pool
- [ ] `T045-07` chứng minh rollback tự động
- [ ] File `DB-BOUNDARY.md` tồn tại

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-045.md`

## 9. ⚠ CẠM BẪY
Chạy `prisma migrate` **một lần** là Prisma giành quyền quản lý schema, rồi sẽ **xoá mất** RLS, CHECK constraint, index có điều kiện và unique hoãn kiểm — những thứ Prisma **tự thừa nhận** không quản lý được. `T045-04` khoá cửa này lại.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Tạo `transaction.ts` cùng pool/prisma adapter. Export `withTransaction<T>(fn:(client:PoolClient)=>Promise<T>):Promise<T>`: acquire, BEGIN, await callback, COMMIT; lỗi thì ROLLBACK, rethrow lỗi gốc; finally release. Prisma runtime và pg dùng app_server. db pull dùng role introspection riêng được đọc auth/public; không lưu credentials trong schema và không dùng role đó cho runtime.

Các giao diện này phải được tạo khi thực thi; chưa có mã runtime hay bằng chứng PASS. Đọc AGENT-START-HERE và TEST-CONVENTIONS; mọi phụ thuộc phải đã merge.

### Fixture và ca kiểm có thể chạy

**File kiểm thử:** `tests/integration/issue-045.test.ts`. Seed profile A bằng migration fixture 034, không phụ thuộc factory 044. Chụp catalog RLS/CHECK/unique deferred/index trước và sau introspection.

- T045-01/02: db pull đủ models, generate và compile; catalog DB không đổi. Chỉ credential introspection được đọc Auth schema.
- T045-03/09: Prisma đọc đúng profile A; cả Prisma runtime và pg pool dùng app_server không SUPERUSER/BYPASSRLS.
- T045-04/05: pnpm prisma:migrate exit khác 0, thông báo cấm; không có prisma/migrations. Không chạy Prisma migrate thật để thử chặn.
- T045-06: connection 1 BEGIN và FOR UPDATE profile A; connection 2 BEGIN rồi FOR UPDATE NOWAIT cùng hàng bị 55P03. Hai PID khác nhau; rollback và release trong finally, không sleep.
- T045-07/08: callback UPDATE display_name rồi throw: connection khác đọc vẫn tên cũ; callback thành công thì thấy tên mới. Giữ lỗi gốc và không để connection còn được checkout sau dispose.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { withTransaction } from '../../apps/server/src/db/transaction';
test('T045-07 rollback và trả lỗi gốc', async () => {
  const failure=new Error('intentional rollback probe');
  await expect(withTransaction(async client => {
    await client.query('CREATE TEMP TABLE rollback_probe(value integer) ON COMMIT DROP');
    await client.query('INSERT INTO rollback_probe VALUES (1)');
    throw failure;
  })).rejects.toBe(failure);
});
```
Ca trên kiểm đường lỗi; bổ sung UPDATE profile A/SELECT bằng connection khác như T045-07 để chứng minh dữ liệu ứng dụng không commit, không chỉ nhận đúng exception.

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Bỏ ROLLBACK hoặc COMMIT trước khi await callback; T045-07 đỏ do profile đổi; quên release phải detectpoolcheckedout sau cleanup.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:integration -- tests/integration/issue-045.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao Prisma schema/generated types, SQL pool+txhelper và catalog proof. DB-BOUNDARY liên kết nguồn TECH07 không định nghĩa lại luật khác; commandscritical không dùng Prisma.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
