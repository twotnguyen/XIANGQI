# ISSUE-026 — Camera/mic trực tiếp và xem media được cho phép

- Trạng thái: DONE
- Evidence: [docs/test-reports/ISSUE-026.md](../test-reports/ISSUE-026.md)
- Yêu cầu: R11, R15
- Phụ thuộc bắt buộc: [ISSUE-015](ISSUE-015-online-ui.md), [ISSUE-017](ISSUE-017-private-chat.md), [ISSUE-025](ISSUE-025-media-authority.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

UI3 lựa chọn mỗi source, player phát đúng scope và viewer chỉ nhận track cho phép, responsive.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [06-MEDIA.md](../specs/06-MEDIA.md)
- [07-UI-AND-TESTS.md](../specs/07-UI-AND-TESTS.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `apps/web/src/features/media/MediaPanel.tsx`
- `apps/web/src/features/media/useMedia.ts`
- `apps/web/src/features/media/track-manager.ts`
- `tests/e2e/media.spec.ts`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Media transport plans/generation lifecycle25; pinned LiveKit JS SDK POC24.

**Cung cấp:** Independent camera/mic controls, local preview muted, remote audio unlock, viewer tiles, permission/error handling.

## Các bước thực hiện

- [x] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [x] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [x] **Bước 1.** Capture sau thao tác, manage original+clones refcounts, publish track theo server plan; không tự connect room name đoán.

- [x] **Bước 2.** Chỉ hiện APPLIED khi server ack; APPLYING loading, OFF stop local source ngay; vẫn cho chơi khi media lỗi.

- [x] **Bước 3.** Handle room rotation reconnect approved plan, policy OFF sau refresh/takeover/disconnect; không auto bật thiết bị.

- [x] **Bước 4.** Viewer no publish controls; âm thanh chỉ một đường, own preview muted; user gesture unlock audio/autoplay.

- [x] **Bước 5.** Test 3x3 policies,2 publishers+5 viewers, mobile tab, deny devices, source independent and end cleanup.

- [x] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [x] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-026.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| Permissions denied | browser từ chối camera | game vẫn đi được |
| A camera public mic private | 5viewers | chỉ camera A |
| OFF camera | mic public đang chạy | mic tiếp tục |
| Reload | trước đó public | OFF, không tự bật lại |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/integration.ts`, không phải API sản phẩm mới.

```ts
await pageA.getByLabel('Chia sẻ camera').selectOption('OPPONENT_AND_SPECTATORS');
await pageA.getByLabel('Chia sẻ mic').selectOption('OPPONENT_ONLY');
await expect(viewer.getByTestId('video-A')).toBeVisible();
expect(await subscribedAudioPublishers(viewer)).not.toContain('A');
```

## Lệnh kiểm chứng

Bắt buộc đối chiếu hàng **ISSUE-026** trong [ma trận test và harness](../specs/08-TEST-EXECUTION.md); ghi từng case `T026-xx` vào báo cáo theo [mẫu evidence](../handoff/EVIDENCE-TEMPLATE.md), ngoài acceptance riêng bên trên.

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:e2e -- tests/e2e/media.spec.ts
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
