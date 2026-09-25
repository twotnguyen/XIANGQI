# ISSUE-007 — Username/password, xác minh và khôi phục email

- Trạng thái: DONE
- Evidence: [docs/test-reports/ISSUE-007.md](../test-reports/ISSUE-007.md)
- Yêu cầu: R01
- Phụ thuộc bắt buộc: [ISSUE-006](ISSUE-006-database-test-harness.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

Đăng ký/xác minh/username login/reset/logout chạy thật với Supabase local mail inbox.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [05-AUTH.md](../specs/05-AUTH.md)
- [04-CONTRACTS.md](../specs/04-CONTRACTS.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `apps/web/src/lib/supabase.ts`
- `apps/web/src/features/auth/`
- `apps/server/src/auth/authenticate.ts`
- `apps/server/src/auth/session.ts`
- `apps/server/src/auth/routes.ts`
- `tests/integration/auth.test.ts`
- `tests/e2e/password-auth.spec.ts`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Profile trigger/session-active SQL từ 006; browser PKCE và no email mapping exposure từ 05.

**Cung cấp:** /auth/login,/auth/logout,/me,/auth/complete-profile; SPA /register,/login,/auth/callback,/auth/reset-password.

## Các bước thực hiện

- [x] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [x] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [x] **Bước 1.** Tạo browser Supabase client; signup/resend/recovery trực tiếp SDK theo đúng verifier browser, generic messages và mail inbox test.

- [x] **Bước 2.** BFF resolver username→user_id→admin email chỉ server, signInWithPassword trên client không persist; trả session tối thiểu no-store, browser setSession.

- [x] **Bước 3.** Verify claims+session active, getUser cho identity/profile state; chặn unverified/onboarding khỏi game.

- [x] **Bước 4.** Admin signOut server cho CURRENT/ALL; đóng socket hooks có registry extension, browser clear sau thành công; reset password buộc logout ALL.

- [x] **Bước 5.** UI loading/error/expired callback, rate limit login 5/phút/IP+username; không log auth bodies.

- [x] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [x] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-007.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| Username login | đúng/sai mật khẩu | session hoặc lỗi chung |
| Chưa xác minh | email signup chưa click | không vào lobby |
| Reset | link local mail dùng một lần | password mới login, session cũ bị reject |
| Mapping | publishable key SELECT profiles/email lookup | không truy cập email người khác |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/integration.ts`, không phải API sản phẩm mới.

```ts
const app = await createTestApp();
const bad = await app.inject({method:'POST',url:'/api/v1/auth/login',payload:{username:'missing_user',password:'bad-password'}});
expect(bad.statusCode).toBe(401);
expect(bad.json().error.code).toBe('UNAUTHENTICATED');
```

## Lệnh kiểm chứng

Bắt buộc đối chiếu hàng **ISSUE-007** trong [ma trận test và harness](../specs/08-TEST-EXECUTION.md); ghi từng case `T007-xx` vào báo cáo theo [mẫu evidence](../handoff/EVIDENCE-TEMPLATE.md), ngoài acceptance riêng bên trên.

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:integration -- tests/integration/auth.test.ts
```

Kỳ vọng: exit 0 và toàn bộ tình huống trong bảng có bằng chứng. Sau code TypeScript chạy thêm `pnpm typecheck` và `pnpm lint`; sau thay đổi bundling/runtime chạy `pnpm build`. Lệnh là mục tiêu sẽ có từ ISSUE-001, chưa phải đã chạy ở giai đoạn lập kế hoạch. Nếu local gate đã qua và chỉ thiếu provider smoke, ghi LOCAL_DONE kèm external pending; nếu thiếu service chặn chính local acceptance thì BLOCKED_EXTERNAL. Không thay actual provider PASS bằng mock. Xem định nghĩa trạng thái trong START-HERE.

## Điều kiện hoàn thành

- [x] Đầu ra đúng hợp đồng, không để implementation placeholder hoặc handler trả success giả.
- [x] Mọi dòng trong bảng nghiệm thu được kiểm chứng, gồm đường thất bại và quyền truy cập liên quan.
- [x] Dependency consumers vẫn tương thích; nếu đổi contract cập nhật spec và test consumer trong cùng thay đổi.
- [x] Evidence có command, exit code, môi trường, số test, artifact; phân biệt automated/mock/manual/external.
- [x] Issue và PROGRESS cập nhật cùng trạng thái; phần chưa xong có bước tiếp theo cụ thể.

## Bàn giao cho issue sau

Ghi API/file thực tế đã tạo, khác biệt có lý do so với đường dẫn dự kiến, test đã chạy và limitation còn tồn tại trong evidence. Không yêu cầu người thực hiện sau đọc lịch sử chat để hiểu kết quả.
