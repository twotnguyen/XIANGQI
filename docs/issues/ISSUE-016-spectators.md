# ISSUE-016 — Năm người xem, mã phòng và thu hồi quyền

- Trạng thái: DONE
- Evidence: [docs/test-reports/ISSUE-016.md](../test-reports/ISSUE-016.md)
- Yêu cầu: R04, R15
- Phụ thuộc bắt buộc: [ISSUE-011](ISSUE-011-invitations.md), [ISSUE-012](ISSUE-012-authoritative-match.md), [ISSUE-015](ISSUE-015-online-ui.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

PUBLIC/CODE_ONLY/LOCKED đúng quyền, không bao giờ vượt 5 viewers.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [01-PRODUCT.md](../specs/01-PRODUCT.md)
- [03-STATE-MACHINES.md](../specs/03-STATE-MACHINES.md)
- [04-CONTRACTS.md](../specs/04-CONTRACTS.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `apps/server/src/modules/rooms/spectators.ts`
- `apps/server/src/realtime/gateway.ts`
- `apps/web/src/features/room/SpectatorPanel.tsx`
- `tests/integration/spectators.test.ts`
- `tests/e2e/spectators.spec.ts`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Room lock/membership epoch, code rotation, role-aware UI; media revocation hook contract sẽ nối 025.

**Cung cấp:** admitSpectator(), revokeSpectators() service và access:revoked; read-only board giữa ván.

## Các bước thực hiện

- [x] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [x] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [x] **Bước 1.** Room lock count<5 + unique member trong transaction; race viewer thứ5/6 tests DB connections độc lập.

- [x] **Bước 2.** Mã WATCH và epoch; chế độ chuyển/rotate thu hồi memberships theo product, unsubscribe socket board/history/chat.

- [x] **Bước 3.** Viewer disconnect 15s retain seat rồi release; reconnect đọc epoch, không tin recovery room cache.

- [x] **Bước 4.** Hook domain access revoked phát sau commit, media handler 025 phải subscribe; kiểm thiếu handler không ảnh hưởng board tests.

- [x] **Bước 5.** UI count /5, room full, khóa/sai mã, midgame snapshot và orientation toggle local.

- [x] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [x] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-016.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| 6 viewers | 6 requests cùng lúc cho 5 ghế | 5 success,1 ROOM_FULL |
| PUBLIC→LOCKED | đang có5 viewers | 0 viewers và không nhận move mới |
| Mã cũ | rotate rồi join | INVITE_INVALID |
| Viewer HTTP move | sửa client | FORBIDDEN |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/integration.ts`, không phải API sản phẩm mới.

```ts
const results = await Promise.all(['S1','S2','S3','S4','S5','S6'].map(u=>joinWatch(u,room.id)));
expect(results.filter(r=>r.ok)).toHaveLength(5);
expect(results.filter(r=>!r.ok && r.error.code==='ROOM_FULL')).toHaveLength(1);
```

## Lệnh kiểm chứng

Bắt buộc đối chiếu hàng **ISSUE-016** trong [ma trận test và harness](../specs/08-TEST-EXECUTION.md); ghi từng case `T016-xx` vào báo cáo theo [mẫu evidence](../handoff/EVIDENCE-TEMPLATE.md), ngoài acceptance riêng bên trên.

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:integration -- tests/integration/spectators.test.ts
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
