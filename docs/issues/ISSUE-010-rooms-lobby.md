# ISSUE-010 — Phòng chờ, ghế và sẵn sàng

- Trạng thái: TODO
- Yêu cầu: R03, R04, R08
- Phụ thuộc bắt buộc: [ISSUE-006](ISSUE-006-database-test-harness.md), [ISSUE-007](ISSUE-007-password-auth.md), [ISSUE-009](ISSUE-009-friends-presence.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

Tạo phòng và lobby đúng ba chế độ; ghế player/ready không thể vượt trần hoặc chiếm nhiều phòng.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [01-PRODUCT.md](../specs/01-PRODUCT.md)
- [04-CONTRACTS.md](../specs/04-CONTRACTS.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `apps/server/src/modules/rooms/service.ts`
- `apps/server/src/modules/rooms/repository.ts`
- `apps/server/src/modules/rooms/routes.ts`
- `apps/web/src/features/lobby/`
- `apps/web/src/features/room/`
- `tests/integration/rooms.test.ts`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Authenticated onboarded profile, rooms/member SQL; time control enum 0/300/600/900.

**Cung cấp:** Room DTO, create/list/get/patch/ready/leave routes; prepareStart(tx,roomId) validated state cho ISSUE-012 tạo match.

## Controller dùng chung

Dùng bảng client_controls của contracts, không đặt authority chỉ trong room_members. POST /control/takeover suy ngữ cảnh từ user và dùng được cho AI không có roomId; ISSUE-021 nối context AI vào cùng service. Room waiting tạo control record; bắt đầu ván bổ sung matchId trong transaction.

## Các bước thực hiện

- [ ] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [ ] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [ ] **Bước 1.** Create owner red in one transaction, time selection default 0; public listing paginate 20 chỉ PUBLIC.

- [ ] **Bước 2.** Giữ lock room và user order khi join/leave; unique current membership/user. Ready reset khi ghế đổi.

- [ ] **Bước 3.** Room owner policy/name edit; timeControl chỉ WAITING. Start validation needs 2 ready, defer actual start to 012 service integration.

- [ ] **Bước 4.** UI seats/invite placeholder disabled đến 011; chủ rời WAITING đóng, khách rời reset.

- [ ] **Bước 5.** Control lease tab ID/controller epoch, tab mới observer và takeover command; server kiểm epoch mutation.

- [ ] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [ ] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-010.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| Owner create | default time | RED seat, timeControl 0 |
| Private list | CODE_ONLY/LOCKED | không xuất hiện |
| Ghế nhiều phòng | A tạo thêm khi đang member | ALREADY_IN_ROOM |
| Takeover | tab2 takeover | tab1 mutation CONTROL_REQUIRED |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/integration.ts`, không phải API sản phẩm mới.

```ts
const app = await createTestApp();
const r = await app.inject({method:'POST',url:'/api/v1/rooms',headers:await authAs('A'),payload:{name:'Phòng thử',visibility:'PUBLIC',timeControl:0}});
expect(r.json().data.timeControl).toBe(0);
expect(r.json().data.members).toHaveLength(1);
```

## Lệnh kiểm chứng

Bắt buộc đối chiếu hàng **ISSUE-010** trong [ma trận test và harness](../specs/08-TEST-EXECUTION.md); ghi từng case `T010-xx` vào báo cáo theo [mẫu evidence](../handoff/EVIDENCE-TEMPLATE.md), ngoài acceptance riêng bên trên.

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:integration -- tests/integration/rooms.test.ts
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
