# ISSUE-044 — Harness test tích hợp THẬT

**Nhóm:** E04 · **Phụ thuộc:** 043 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Mở rộng runner tối thiểu từ034 thành factory/harness chạy trên **PostgreSQL và Supabase Auth thật** — và **thất bại ồn ào** nếu dịch vụ chưa chạy.

## 2. ĐỌC TRƯỚC
[WORKFLOW.md](WORKFLOW.md) **§4 luật 2, 3, 6** · [../06-acceptance/test-scenarios.md](../06-acceptance/test-scenarios.md) §1

## 3. PHẠM VI
**✅ LÀM** — config tích hợp · factory · seed người dùng · dọn dẹp · rào đồng bộ cho test tranh chấp
**❌ KHÔNG LÀM** — test nghiệp vụ (các issue sau)

## 4. FILE TẠO
```
vitest.integration.config.ts
tests/integration/setup.ts
tests/fixtures/integration.ts
tests/integration/harness.test.ts
```

## 5. CÁC BƯỚC
1. `vitest.integration.config.ts` — gom **chỉ** `tests/integration/**`; media có lane riêng từ112, không kéo phụ thuộc media tương lai vào DB, `passWithNoTests: false`
2. **`setup.ts` — cổng thất bại ồn ào (quan trọng nhất)**:
   ```
   ① Parse DATABASE_URL, kiểm host loopback (127.0.0.1 / localhost) và DB test được khai rõ
   ② KHÔNG hợp lệ ⇒ NÉM LỖI TRƯỚC KHI mở kết nối
   ③ Thử kết nối local
   ④ Thất bại ⇒ NÉM LỖI, KHÔNG bỏ qua test
   ```
   ⚠ **Tuyệt đối không** `describe.skip` khi thiếu dịch vụ
3. **`integration.ts`** — factory:
   ```ts
   createTestApp(): Promise<{ app, dispose }>
   seedUsers(runId: string): Promise<{ A, B, S1..S6 }>   // qua Supabase Auth THẬT
   authAs(user): Promise<{ token }>                       // đăng nhập THẬT
   resetTestData(runId: string): Promise<void>            // xoá theo runId, ĐÚNG THỨ TỰ FK
   withBarrier<T>(n: number, fn): Promise<T[]>            // rào đồng bộ cho test tranh chấp
   ```
4. `dispose` **phải đóng** pool, socket, listener — kể cả khi test ném lỗi (dùng `finally`)
5. **Dọn dẹp theo `runId`**, **tuyệt đối không** `TRUNCATE` hay reset toàn bộ DB
6. Test tích hợp dùng vai trò **`app_server`**, không dùng superuser

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T044-01` | ⭐ **Tắt PostgreSQL → chạy test:integration → THẤT BẠI ỒN ÀO**, không bỏ qua |
| `T044-02` | ⭐ Trỏ `DATABASE_URL` tới host **không phải loopback** → **ném lỗi trước** khi chạy |
| `T044-03` | `createTestApp` trả app dùng được, `dispose` đóng sạch mọi tài nguyên |
| `T044-04` | `seedUsers` tạo **8 tài khoản thật** qua Supabase Auth |
| `T044-05` | `authAs` trả token **thật** từ Supabase Auth và xác minh qua provider; API có guard sẽ test ở046 (không đòi guard tương lai) |
| `T044-06` | `resetTestData` xoá **đúng** dữ liệu của `runId`, **không** đụng runId khác |
| `T044-07` | Chạy 2 bộ test song song với 2 `runId` → **không lẫn dữ liệu** |
| `T044-08` | `withBarrier(2, ...)` khiến 2 thao tác chạm điểm tranh chấp **cùng lúc** |
| `T044-09` | `dispose` chạy **cả khi test ném lỗi** |
| `T044-10` | ⭐ `pnpm test:integration` báo **0 test bị bỏ qua** |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 10 test xanh
- [ ] **`T044-01`** — thiếu dịch vụ làm test **ĐỎ**, không phải bỏ qua
- [ ] **`T044-10`** — 0 test bị bỏ qua
- [ ] `T044-02` — chặn chạy trên DB không phải local
- [ ] Test dùng vai trò `app_server`, không dùng superuser
- [ ] Dọn dẹp theo `runId`, **không** TRUNCATE

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-044.md` — output khi **tắt** PostgreSQL (phải đỏ) và khi **bật** (phải xanh).

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| **Test tích hợp LUÔN bị bỏ qua**, kể cả ở lane tích hợp — CI xanh suốt nhiều tháng (`F-11`) | `T044-01`, `T044-10` |
| Test "cơ sở dữ liệu" thực ra **tự mock chính nó** (`F-12`) | Bước 3 — seed và đăng nhập qua dịch vụ **thật** |
| Dùng superuser ⇒ mọi lỗi phân quyền bị che | Bước 6 |

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

Mở rộng runner 034, không thay real DB bằng mock. `tests/fixtures/integration.ts` xuất giao diện TypeScript sau (mọi factory dispose trong finally):

```ts
import type { INestApplication } from '@nestjs/common';
import type { Pool } from 'pg';
import type { TestClock } from './test-clock';
export type TestUser={id:string;email:string;username:string;password:string};
export type UserKey='A'|'B'|'S1'|'S2'|'S3'|'S4'|'S5'|'S6';
export type TestApp={app:INestApplication;baseUrl:string;db:Pool;clock:TestClock;dispose():Promise<void>};
export function createTestApp(options?:{clock?:TestClock}):Promise<TestApp>;
export function seedUsers(runId:string):Promise<Record<UserKey,TestUser>>;
export function authAs(user:TestUser):Promise<{token:string;authSessionId:string}>;
export function resetTestData(runId:string):Promise<void>;
export function withBarrier<T>(count:number,worker:(index:number,wait:()=>Promise<void>)=>Promise<T>):Promise<T[]>;
```
Các chữ ký là exports cần triển khai, không phải khai báo hàm rỗng để compiler xanh. `db` dùng app_server; fixture admin Auth riêng không được đưa vào TestApp hay client. App chỉ cần health 001 tại mốc 044, guard 046/session 050 còn là successor.

Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); mọi phụ thuộc ở đầu issue phải đã merge. Các đoạn mã dưới đây là hợp đồng/test sẽ tạo khi thực thi, **không phải mã đã tồn tại hay bằng chứng PASS**.

### Fixture và ca kiểm có thể chạy

**File kiểm thử:** `tests/integration/harness.test.ts`. Mỗi runId tạo tám Auth user thật. Admin-confirm chỉ là fixture cho ca đã đăng nhập; không dùng nó làm bằng chứng email verification. authAs lấy JWT và authSessionId từ phiên provider thật. App ở mốc này chỉ cần health của 001, chưa đòi guard 046 hay UI bootstrap 050.

- T044-01/02/10: DB local dừng thì runner exit khác 0, skip=0; URL ngoài loopback bị từ chối trước mở kết nối. Path không tồn tại phải fail.
- T044-03/09: start app có health 200; mở tài nguyên rồi cố ý throw trong test body. finally gọi dispose, pool đóng và không còn listener/handle mở.
- T044-04/05: tám user ID khác nhau; Auth provider xác minh token thật, authSessionId khớp phiên. Không tạo JWT giả.
- T044-06/07: hai runId X/Y chạy đồng thời; reset X chỉ xóa X đúng thứ tự FK, dữ liệu Y giữ nguyên. Không TRUNCATE hay reset toàn DB.
- T044-08: hai worker mỗi bên lấy một connection và PID khác nhau. Cả hai gọi wait trước thao tác giành cùng row lock; barrier chỉ nhả khi đủ hai bên. Không đặt barrier sau khi một bên đã giữ lock vì sẽ gây deadlock.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { createTestApp, withBarrier } from '../fixtures/integration';
test('T044-08 hai connection độc lập cùng qua barrier', async () => {
  const fixture=await createTestApp();
  try {
    const pids=await withBarrier(2,async (_index,wait) => {
      const client=await fixture.db.connect();
      try {
        const result=await client.query<{pid:number}>('SELECT pg_backend_pid() AS pid');
        const pid=result.rows[0]?.pid;
        if (pid===undefined) throw new Error('Thiếu PID');
        await wait(); // trước khi giành row lock trong ca tranh chấp nghiệp vụ
        return pid;
      } finally { client.release(); }
    });
    expect(new Set(pids).size).toBe(2);
  } finally { await fixture.dispose(); }
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Dùng một client cho hai worker hoặc resetTestData xóa toàn DB; T044-08/06 đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:integration -- tests/integration/harness.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao các giao diện đầy đủ, safe DB guard, runIsolation và cleanup proof; thiếu Docker/DB local là BLOCKED setup, không được skip. Hỗ trợ Auth thật không chứng minh Google OAuth/SMTP Internet PASS.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
