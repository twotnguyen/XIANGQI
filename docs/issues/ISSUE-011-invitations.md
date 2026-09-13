# ISSUE-011 — Mời trong game, link và mã theo vai trò

- Trạng thái: DONE
- Evidence: [docs/test-reports/ISSUE-011.md](../test-reports/ISSUE-011.md)
- Yêu cầu: R02, R03, R04
- Phụ thuộc bắt buộc: [ISSUE-010](ISSUE-010-rooms-lobby.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

Bạn nhận lời mời trong app kể cả offline; link/mã vào đúng role và không dùng lại lời mời chơi.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [01-PRODUCT.md](../specs/01-PRODUCT.md)
- [04-CONTRACTS.md](../specs/04-CONTRACTS.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `apps/server/src/modules/invitations/service.ts`
- `apps/server/src/modules/invitations/routes.ts`
- `apps/web/src/features/room/InvitePanel.tsx`
- `apps/web/src/features/auth/JoinRedirect.tsx`
- `tests/integration/invitations.test.ts`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Room/member locks; friend accepted; INVITE_HMAC_KEY server.

**Cung cấp:** Invitation APIs, /join fragment landing, inbox notifications, PLAY/WATCH code/token generation and atomic consume.

## Các bước thực hiện

- [x] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [x] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [x] **Bước 1.** Crypto random mã 8 ký tự alphabet spec và token 32 byte, HMAC hashes, TTL direct10m/share24h.

- [x] **Bước 2.** Direct only accepted friend, recipient-bound; inbox persisted, online emit riêng recipient; accept seat transaction.

- [x] **Bước 3.** Role WATCH không ngồi ghế; public direct roomId chỉ WATCH. Handle expired/revoked/consumed cùng INVITE_INVALID tránh lộ secret.

- [x] **Bước 4.** Join trước login giữ fragment token sessionStorage và xóa URL; sau callback exchange grant và clear token.

- [x] **Bước 5.** Chủ rotate watch code tăng epoch; actual viewer eviction service từ 016 được gọi khi có memberships.

- [x] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [x] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-011.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| Consume PLAY | hai accept đồng thời | 1 seat và token consumed một lần |
| Sai role | WATCH code yêu cầu PLAY | INVITE_INVALID |
| Offline invite | B offline login sau | inbox có lời mời chưa hết hạn |
| Link sau auth | redirect Google | token giữ đúng tab, không nằm log URL |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/integration.ts`, không phải API sản phẩm mới.

```ts
const grant = await createWatchGrantForTest('A');
const r = await app.inject({method:'POST',url:'/api/v1/rooms/join',headers:await authAs('B'),payload:{code:grant.code,role:'PLAY'}});
expect(r.statusCode).toBe(403);
expect(r.json().error.code).toBe('INVITE_INVALID');
```

## Lệnh kiểm chứng

Bắt buộc đối chiếu hàng **ISSUE-011** trong [ma trận test và harness](../specs/08-TEST-EXECUTION.md); ghi từng case `T011-xx` vào báo cáo theo [mẫu evidence](../handoff/EVIDENCE-TEMPLATE.md), ngoài acceptance riêng bên trên.

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:integration -- tests/integration/invitations.test.ts
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
