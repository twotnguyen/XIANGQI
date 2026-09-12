# ISSUE-024 — LiveKit local: kiểm chứng quyền và room generations

- Trạng thái: TODO
- Yêu cầu: R11, R16
- Phụ thuộc bắt buộc: [ISSUE-001](ISSUE-001-foundation.md), [ISSUE-006](ISSUE-006-database-test-harness.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

Chứng minh media source isolation và stale-token generation rotation trước triển khai UI đầy đủ.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [06-MEDIA.md](../specs/06-MEDIA.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `infra/compose.yaml`
- `infra/livekit.yaml`
- `tests/media/spike.ts`
- `docs/test-reports/media-spike.md`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** LiveKit selfhost local, tokens/grants matrix06; credentials test-only. Chạy issue sớm sau006 để phát hiện rủi ro.

**Cung cấp:** POC test-only với private/watch camera/mic, scripts repeatable, report subscribe bytes và mobile capture clone.

## Các bước thực hiện

- [ ] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [ ] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [ ] **Bước 1.** Dựng LiveKit local dev pinned image; verify API token publisher source restricted/viewer subscribe-only.

- [ ] **Bước 2.** POC2 players+viewer với camera public/mic private; không dùng fake SFU cho test này.

- [ ] **Bước 3.** Giữ viewer JWT cũ, DeleteRoom, new opaque generation, republish legal source; old JWT rejoin old room không nhận source mới.

- [ ] **Bước 4.** Capture clone vào2 rooms/source trên desktop và mobile; source stop không dừng nhầm clone riêng tư.

- [ ] **Bước 5.** Ghi CPU/network và thất bại; nếu không pass không tự bỏ quyền hoặc dùng UI hide; báo blocker kỹ thuật và sửa design trước025.

- [ ] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [ ] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-024.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| Source grants | camera token phát microphone | SFU reject |
| Private room | viewer watch JWT join private | reject |
| Old JWT | rejoin retired room | không track/byte từ generation mới |
| Clone mobile | camera/mic double publish | không lỗi capture/stop nhầm source |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/integration.ts`, không phải API sản phẩm mới.

```ts
const retired = await joinWithSavedViewerToken();
await rotateWatchCameraAndRepublish();
await retired.reconnectWithOldToken();
expect(await receivedCurrentGenerationTracks(retired)).toHaveLength(0);
```

## Lệnh kiểm chứng

Bắt buộc đối chiếu hàng **ISSUE-024** trong [ma trận test và harness](../specs/08-TEST-EXECUTION.md); ghi từng case `T024-xx` vào báo cáo theo [mẫu evidence](../handoff/EVIDENCE-TEMPLATE.md), ngoài acceptance riêng bên trên.

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:integration -- tests/media/spike.ts
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
