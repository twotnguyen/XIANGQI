# ISSUE-031 — Triển khai Vercel/Render/Supabase và media online

- Trạng thái: TODO
- Yêu cầu: R16
- Phụ thuộc bắt buộc: [ISSUE-030](ISSUE-030-acceptance-load.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

Có cấu hình deploy tái lập và smoke Internet khi được cấp tài nguyên; không mua dịch vụ tự động.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [02-ARCHITECTURE.md](../specs/02-ARCHITECTURE.md)
- [05-AUTH.md](../specs/05-AUTH.md)
- [06-MEDIA.md](../specs/06-MEDIA.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `infra/Dockerfile.server`
- `infra/render.yaml`
- `apps/web/vercel.json`
- `docs/handoff/DEPLOY.md`
- `docs/handoff/EXTERNAL-SETUP.md`
- `docs/test-reports/online-smoke.md`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Local gates30; user-provided Vercel/Render/Supabase/Google/SMTP/LiveKit resources; exact values supplied at execution not stored secrets.

**Cung cấp:** Docker game+AI, static SPA redirects, DB migration deploy, env checklist, backup/restore, HTTPS/WebRTC relay evidence.

## Các bước thực hiện

- [ ] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [ ] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [ ] **Bước 1.** Build web static và server Docker Node24 child workers; APP_ORIGIN/CORS/redirect allowlists exact; no private VITE keys.

- [ ] **Bước 2.** Deploy to existing authorized resources, inspect provider CLI/API setup; nếu thiếu credentials ghi BLOCKED_EXTERNAL đúng phần, vẫn hoàn thiện configs/runbook.

- [ ] **Bước 3.** Supabase cloud migrations non-destructive, project backup before change; không local reset cloud.

- [ ] **Bước 4.** Media Cloud token config hoặc authorized SFU host; do not put SFU on Render HTTP-only plan; no paid resource creation.

- [ ] **Bước 5.** Smoke2 networks, Google/email callbacks, reconnect/restart,7 media peers+relay; document free sleep and no HA, rehearse rollback.

- [ ] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [ ] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-031.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| Static deep link | open /rooms/id direct | SPA loads |
| OAuth production | Google/email redirect | same profile and no open redirect |
| Two networks | media forced relay | audio/video allowed tracks live |
| Restart deploy | active ván | INTERRUPTED no arbitrary winner |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/integration.ts`, không phải API sản phẩm mới.

```ts
// Manual gate recorded with provider/resource IDs, no secrets.
// HTTPS origin A and a second network B must exchange legal moves.
// Save ICE/relay statistics and allowed track IDs, never the call recording.
```

## Lệnh kiểm chứng

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm build
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
