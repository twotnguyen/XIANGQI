# ISSUE-001 — Workspace, toolchain và ứng dụng khởi động được

- Trạng thái: TODO
- Yêu cầu: R16
- Phụ thuộc bắt buộc: Không có
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

Có web local và API health chạy, workspace build/lint/typecheck/unit qua; chuẩn bị script cho các lane test sau.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [02-ARCHITECTURE.md](../specs/02-ARCHITECTURE.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `package.json`
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `apps/web/src/app/router.tsx`
- `apps/server/src/app.ts`
- `apps/server/src/main.ts`
- `infra/compose.yaml`
- `.github/workflows/ci.yml`
- `tests/unit/health.test.ts`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Workspace hiện chỉ có Markdown; không có code để giữ tương thích. Node 24 LTS, pnpm, React/Vite/Fastify và cấu trúc spec đã chốt.

**Cung cấp:** createApp() trả FastifyInstance không tự listen; GET /health trả {status:"ok"}; root scripts trong architecture, .env.example, lockfile và báo cáo toolchain.

## Các bước thực hiện

- [ ] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [ ] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [ ] **Bước 1.** Kiểm tra runtime/Docker có sẵn; chọn exact phiên bản tương thích Node 24, ghi quyết định và khóa lockfile. Không cài package trùng chức năng.

- [ ] **Bước 2.** Tạo pnpm workspace, TypeScript strict, package exports, build theo dependency; package luật/AI mới có manifest, không giả triển khai.

- [ ] **Bước 3.** Tạo app factory và entrypoint riêng, health, web shell tiếng Việt; một lệnh dev khởi động web/server, child AI được bổ sung ISSUE-021.

- [ ] **Bước 4.** Tạo scripts unit/integration/e2e/ai/load forward arguments; script cho suite chưa tồn tại phải báo chưa có suite, không trả PASS giả. CI ban đầu chỉ chạy suite đã tạo.

- [ ] **Bước 5.** Tạo gitignore env/build/artifacts và README local; nếu chưa có git chỉ git init local, không tự tạo remote/push.

- [ ] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [ ] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-001.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| Khởi động sạch | pnpm install --frozen-lockfile rồi build | exit 0, web/API import được |
| Health factory | inject GET /health không mở port | 200, status ok |
| Thiếu DATABASE_URL ở module DB sau này | config validation | lỗi tên biến, không in secret |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/positions.ts`, không phải API sản phẩm mới.

```ts
const app = await createApp();
const res = await app.inject({ method: 'GET', url: '/health' });
expect(res.statusCode).toBe(200);
expect(res.json()).toEqual({ status: 'ok' });
await app.close();
```

## Lệnh kiểm chứng

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:unit -- tests/unit/health.test.ts
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
