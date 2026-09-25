# ISSUE-009 — Bạn bè và trạng thái online

- Trạng thái: DONE
- Evidence: [docs/test-reports/ISSUE-009.md](../test-reports/ISSUE-009.md)
- Yêu cầu: R02
- Phụ thuộc bắt buộc: [ISSUE-007](ISSUE-007-password-auth.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

Quan hệ bạn bè hai chiều và presence hoạt động, không lộ email/phòng riêng.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [01-PRODUCT.md](../specs/01-PRODUCT.md)
- [04-CONTRACTS.md](../specs/04-CONTRACTS.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `apps/server/src/modules/friends/service.ts`
- `apps/server/src/modules/friends/routes.ts`
- `apps/server/src/realtime/presence.ts`
- `apps/web/src/features/friends/`
- `tests/integration/friends.test.ts`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Auth profile, DB friend_relations; socket session validation từ auth được áp dụng ở gateway.

**Cung cấp:** Friends HTTP APIs 04, friend:updated/presence:changed, UI tìm/gửi/hủy/chấp nhận/từ chối/hủy bạn.

## Các bước thực hiện

- [x] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [x] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [x] **Bước 1.** Tạo unique ordered pair, gửi chéo trả pending hiện tại, chỉ recipient respond, sender cancel.

- [x] **Bước 2.** Search prefix >=3 tối đa 20, output profile tối thiểu; bỏ self khỏi kết quả gợi ý.

- [x] **Bước 3.** Online lease 30s heartbeat 10s, nhiều tabs vẫn 1 user online; emit cho bạn bè không broadcast toàn hệ thống.

- [x] **Bước 4.** Render danh sách pending/accepted/empty; invite button sẽ nối ISSUE-011, không fake gửi trước.

- [x] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [x] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-009.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| Gửi chéo | A→B và B→A cùng lúc | 1 pending relation |
| Người ngoài | C accept request A→B | 403 |
| Nhiều tab | đóng 1/2 sockets A | A vẫn online |
| Riêng tư | friends DTO | không email hay room private |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/integration.ts`, không phải API sản phẩm mới.

```ts
const app = await createTestApp();
const r = await app.inject({method:'POST',url:'/api/v1/friends/requests',headers:await authAs('A'),payload:{recipientId:users.B.id}});
expect(r.statusCode).toBe(200);
expect(r.json().data.status).toBe('PENDING');
```

## Lệnh kiểm chứng

Bắt buộc đối chiếu hàng **ISSUE-009** trong [ma trận test và harness](../specs/08-TEST-EXECUTION.md); ghi từng case `T009-xx` vào báo cáo theo [mẫu evidence](../handoff/EVIDENCE-TEMPLATE.md), ngoài acceptance riêng bên trên.

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:integration -- tests/integration/friends.test.ts
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
