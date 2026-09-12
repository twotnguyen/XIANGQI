# ISSUE-029 — Kiểm thử phân quyền và bảo mật trước bàn giao

- Trạng thái: TODO
- Yêu cầu: R01, R04, R06, R10, R11, R16
- Phụ thuộc bắt buộc: [ISSUE-008](ISSUE-008-google-profile.md), [ISSUE-016](ISSUE-016-spectators.md), [ISSUE-017](ISSUE-017-private-chat.md), [ISSUE-025](ISSUE-025-media-authority.md), [ISSUE-027](ISSUE-027-history-rematch.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

Các đường truy cập trực tiếp/giả mạo/retry không vượt quyền, secret không lộ frontend/log.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [04-CONTRACTS.md](../specs/04-CONTRACTS.md)
- [05-AUTH.md](../specs/05-AUTH.md)
- [06-MEDIA.md](../specs/06-MEDIA.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `tests/integration/security.test.ts`
- `apps/server/src/auth/`
- `apps/server/src/app.ts`
- `apps/server/src/realtime/`
- `docs/test-reports/security.md`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Auth/RLS/media generation and room policies final; authorized fixtures.

**Cung cấp:** Security regression suite, rate/payload/CORS/CSP headers, report actionable risks.

## Các bước thực hiện

- [ ] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [ ] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [ ] **Bước 1.** Test anon/authenticated direct Data API denied incl private schema/function; expired/revoked JWT cả HTTP/socket/media.

- [ ] **Bước 2.** IDOR mọi history/chat/member/token, fake role/userId, control epoch cũ; malicious watcher publish/private subscribe.

- [ ] **Bước 3.** Rate login/join/chat, payload sizes JSON64KB/socket16KB; validate no arbitrary SQL/shell paths.

- [ ] **Bước 4.** Scan frontend build/log fixture for secret sentinels; CSP connect-src allowed Auth/API/LiveKit only + required worker/media blob.

- [ ] **Bước 5.** Revoke realtime access after lock/logout/rotate and stale JWT retired media generations; source data already received explicitly outside revocation guarantee.

- [ ] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [ ] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-029.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| JWT old logout | call move/chat/media | 401 |
| Role injection | viewer declares PLAYER | reject |
| XSS message | render malicious markup | no execute |
| Secret sentinel | build search | 0 server secrets |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/integration.ts`, không phải API sản phẩm mới.

```ts
const token = await tokenFor('A');
await logoutCurrent(token);
const r = await app.inject({method:'GET',url:'/api/v1/me',headers:{authorization:`Bearer ${token}`}});
expect(r.statusCode).toBe(401);
```

## Lệnh kiểm chứng

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:integration -- tests/integration/security.test.ts
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
