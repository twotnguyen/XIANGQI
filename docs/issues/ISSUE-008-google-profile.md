# ISSUE-008 — Google PKCE và onboarding username

- Trạng thái: TODO
- Yêu cầu: R01, R02
- Phụ thuộc bắt buộc: [ISSUE-007](ISSUE-007-password-auth.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

Google login về đúng user, user mới chọn username, cùng email verified không tạo profile trùng.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [05-AUTH.md](../specs/05-AUTH.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `apps/web/src/features/auth/GoogleLogin.tsx`
- `apps/web/src/features/auth/Onboarding.tsx`
- `apps/web/src/features/auth/AuthCallback.tsx`
- `apps/server/src/auth/routes.ts`
- `tests/e2e/google-auth.spec.ts`
- `docs/handoff/GOOGLE-SETUP.md`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Supabase PKCE browser singleton và auth API 007; provider credentials do người dùng cấu hình, không tạo giả.

**Cung cấp:** Google button, callback→onboarding/lobby, PATCH /me displayName; runbook exact local/prod callback placeholders chỉ ở env hướng dẫn.

## Các bước thực hiện

- [ ] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [ ] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [ ] **Bước 1.** OAuth signInWithOAuth provider google, exact redirect, callback exchange một lần và xóa code query.

- [ ] **Bước 2.** Onboarding claim username transaction one-time; tên hiển thị separate và không lấy metadata làm quyền.

- [ ] **Bước 3.** Test mock callback CI gồm missing verifier/expired code; ghi rõ mock không thay smoke provider thật.

- [ ] **Bước 4.** Soạn Google Console/Supabase allowlist guide, không cần manual linking UI; test same verified email → cùng user_id, khác email không merge.

- [ ] **Bước 5.** Account menu sửa displayName, signout; email không lộ ở profile public.

- [ ] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [ ] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-008.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| Google mới | profile username null | bị chuyển onboarding và game API ONBOARDING_REQUIRED |
| Tranh username | hai onboarding cùng tên | một thắng, bên kia chọn lại |
| Link cùng email | user password verified rồi Google cùng email | cùng user_id/history |
| Open redirect | callback next=external | không điều hướng external |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/integration.ts`, không phải API sản phẩm mới.

```ts
await page.goto('/onboarding');
await page.getByLabel('Tên đăng nhập').fill('player_new');
await page.getByRole('button',{name:'Hoàn tất'}).click();
await expect(page).toHaveURL(/\/lobby$/);
```

## Lệnh kiểm chứng

Bắt buộc đối chiếu hàng **ISSUE-008** trong [ma trận test và harness](../specs/08-TEST-EXECUTION.md); ghi từng case `T008-xx` vào báo cáo theo [mẫu evidence](../handoff/EVIDENCE-TEMPLATE.md), ngoài acceptance riêng bên trên.

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:e2e -- tests/e2e/google-auth.spec.ts
```

Kỳ vọng: exit 0 và toàn bộ tình huống trong bảng có bằng chứng. Sau code TypeScript chạy thêm `pnpm typecheck` và `pnpm lint`; sau thay đổi bundling/runtime chạy `pnpm build`. Lệnh là mục tiêu sẽ có từ ISSUE-001, chưa phải đã chạy ở giai đoạn lập kế hoạch. Nếu local gate đã qua và chỉ thiếu provider smoke, ghi LOCAL_DONE kèm external pending; nếu thiếu service chặn chính local acceptance thì BLOCKED_EXTERNAL. Không thay actual provider PASS bằng mock. Xem định nghĩa trạng thái trong START-HERE.

## Điều kiện hoàn thành

- [ ] Đầu ra đúng hợp đồng, không để implementation placeholder hoặc handler trả success giả.
- [ ] Mọi dòng trong bảng nghiệm thu được kiểm chứng, gồm đường thất bại và quyền truy cập liên quan.
- [ ] Dependency consumers vẫn tương thích; nếu đổi contract cập nhật spec và test consumer trong cùng thay đổi.
- [ ] Evidence có command, exit code, môi trường, số test, artifact; phân biệt automated/mock/manual/external.
- [ ] Issue và PROGRESS cập nhật cùng trạng thái; phần chưa xong có bước tiếp theo cụ thể.

## Bàn giao cho issue sau

Ghi API/file thực tế đã tạo, khác biệt có lý do so với đường dẫn dự kiến, test đã chạy và limitation còn tồn tại trong evidence. Không yêu cầu người thực hiện sau đọc lịch sử chat để hiểu kết quả.
