# ISSUE-025 — Backend media policy, token và thu hồi

- Trạng thái: TODO
- Yêu cầu: R11, R04, R09
- Phụ thuộc bắt buộc: [ISSUE-008](ISSUE-008-google-profile.md), [ISSUE-016](ISSUE-016-spectators.md), [ISSUE-024](ISSUE-024-media-spike.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

Máy chủ cấp quyền từng source/người phát và rotate generations khi thu hồi, không chỉ client hide.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [06-MEDIA.md](../specs/06-MEDIA.md)
- [04-CONTRACTS.md](../specs/04-CONTRACTS.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `apps/server/src/modules/media/service.ts`
- `apps/server/src/modules/media/transport.ts`
- `apps/server/src/modules/media/reconciler.ts`
- `apps/server/src/modules/media/routes.ts`
- `tests/integration/media-policy.test.ts`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Membership/controller/session grants; media DB tables; POC24 đã pass.

**Cung cấp:** /media/session,/media/policy,/media/end; policy job serialize/retry/APPLYING/APPLIED; access revocation hook.

## Các bước thực hiện

- [ ] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [ ] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [ ] **Bước 1.** Derive room identities/grants server, no-store tokens60s; viewer/public source conditions; reject unknown privilege fields.

- [ ] **Bước 2.** Persist desired policy/version/job; transaction ngắn, external SFU side effects ngoài DB lock.

- [ ] **Bước 3.** Implement revoke rotation theo06, DeleteRoom ack trước new publish, old generation never reuse; failure preserve desired restrictive state.

- [ ] **Bước 4.** Wire spectator eviction/logout/takeover/end/restart rotate/delete đúng rooms; policy mặc định OFF.

- [ ] **Bước 5.** Matrix tests race A/B policies, duplicate request/job, API failure, old-token rejoin.

- [ ] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [ ] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-025.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| A public B private | viewer token plan | chỉ A watch tracks |
| Camera private mic public | viewer plan | không camera private |
| Policy write B | A gửi userId B | schema/permission reject |
| SFU error | DeleteRoom fail | APPLYING/error, không falsely APPLIED |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/integration.ts`, không phải API sản phẩm mới.

```ts
await setPolicy('A','CAMERA','OPPONENT_ONLY');
const plan = await mediaPlanAs('S1');
expect(plan.transports.every(t=>t.audience==='WATCH')).toBe(true);
expect(plan.transports.some(t=>t.roomName===privateCameraRoom)).toBe(false);
```

## Lệnh kiểm chứng

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:integration -- tests/integration/media-policy.test.ts
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
