# ISSUE-006 — Supabase migrations và test integration thật

- Trạng thái: TODO
- Yêu cầu: R01, R03, R06, R16
- Phụ thuộc bắt buộc: [ISSUE-002](ISSUE-002-contracts-position.md)
- Phạm vi bàn giao: một lát chức năng kiểm chứng được; đọc [hướng dẫn thực thi](../handoff/START-HERE.md) trước issue đầu tiên.

## Mục tiêu và giới hạn

DB local tái tạo được từ migration, transaction/constraints/RLS sẵn cho các service.

Chỉ sửa các module phục vụ mục tiêu này. Các chức năng khác thuộc issue riêng. Không đánh dấu DONE chỉ vì có giao diện/nút hoặc mock API.

## Đọc trước

- [09-DATABASE-DESIGN.md](../specs/09-DATABASE-DESIGN.md) — nguồn bảng/cột/khóa/check/index/grants/JSON và DB-01…19
- [04-CONTRACTS.md](../specs/04-CONTRACTS.md)
- [05-AUTH.md](../specs/05-AUTH.md)

Spec là nguồn quyết định; nghiên cứu và bản phân tích ban đầu chỉ để tham khảo. Nếu phát hiện mâu thuẫn kỹ thuật thật, ghi vào decision log và sửa hợp đồng/issue bị ảnh hưởng cùng nhau trước tiếp tục.

## Tệp và trách nhiệm

- `supabase/config.toml`
- `supabase/migrations/`
- `supabase/seed.sql`
- `apps/server/src/db/pool.ts`
- `apps/server/src/db/transaction.ts`
- `tests/fixtures/users.ts`
- `tests/fixtures/integration.ts`
- `tests/integration/database.test.ts`

Đây là đường dẫn dự kiến từ repo root. Nếu implementation trước đó đã có module tương đương, dùng module đó và ghi mapping trong evidence; không tạo phiên bản trùng. Mỗi file test mới phải import helper thật hoặc định nghĩa helper trong chính suite, không để tên minh họa chưa triển khai.

## Hợp đồng đầu vào / đầu ra

**Nhận:** Từ điển schema09, mapping DTO04; Supabase Auth owns auth.users, không tự passwordHash/sessions app thay Auth.

**Cung cấp:** SQL migrations, pg Pool/withTransaction(), private session-active function; createTestApp(), authAs(user), seedUsers(), resetTestData() trong harness.

## Các bước thực hiện

- [ ] Đọc dependency evidence, kiểm tra trạng thái mã hiện tại và chạy suite liên quan đã có. Ghi lỗi có sẵn riêng trước sửa.
- [ ] Với mỗi bước logic dưới đây, viết case nghiệm thu tương ứng trước, chạy thấy lỗi đúng nguyên nhân rồi mới triển khai bước đó. UI thuần dùng visual/E2E.

- [ ] **Bước 1.** Chạy Supabase CLI local; xác nhận target local trước reset. Tạo tables/check/FKs/indices theo09 (rematch tables do027 thêm), add circular FK sau bảng tồn tại.

- [ ] **Bước 2.** Trigger profile signup từ 05; username unique lowercase nullable onboarding. Function kiểm auth.sessions SECURITY DEFINER search_path rỗng, server-only grants.

- [ ] **Bước 3.** Enable RLS/revoke app tables khỏi anon/authenticated; role SQL server có quyền cần thiết, không quyền sửa auth tables.

- [ ] **Bước 4.** Test isolated run prefix; seed A/B/S1..S6 qua test admin Auth rồi profile, không commit password thực.

- [ ] **Bước 5.** Harness createTestApp tạo app factory+DB riêng và inject HTTP; authAs trả Bearer của fixture verified; teardown đóng pool/sockets.

- [ ] Viết các test dưới đây trước phần logic tương ứng, chạy thấy lỗi đúng nguyên nhân; triển khai tối thiểu rồi chạy lại. Thay đổi UI thuần dùng visual/E2E, không tạo unit test chỉ soi class CSS.
- [ ] Chạy lệnh kiểm chứng, ghi output thật vào `docs/test-reports/ISSUE-006.md`, cập nhật issue và [tiến độ](../handoff/PROGRESS.md).

## Tình huống nghiệm thu

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc |
|---|---|---|
| Migration sạch | local reset từ đầu | tất cả constraints có |
| RLS | anon/authenticated đọc app tables/private function | bị từ chối |
| Rollback | insert event rồi throw | không event/snapshot nửa chừng |
| Cạnh tranh username | 2 users cùng normalized name | chỉ 1 được cấp username |

## Mẫu assertion trọng tâm

Đoạn dưới là mẫu test/pseudocode để chỉ rõ assertion; đưa vào suite với fixture thật của issue. Tên helper chưa nằm trong contracts là test helper cần định nghĩa tại suite hoặc `tests/fixtures/integration.ts`, không phải API sản phẩm mới.

```ts
const before = await countTestRooms();
await expect(withTransaction(async tx => {
  await insertTestRoom(tx);
  throw new Error('rollback');
})).rejects.toThrow('rollback');
expect(await countTestRooms()).toBe(before);
```

## Lệnh kiểm chứng

Bắt buộc đối chiếu hàng **ISSUE-006** trong [ma trận test và harness](../specs/08-TEST-EXECUTION.md); ghi từng case `T006-xx` vào báo cáo theo [mẫu evidence](../handoff/EVIDENCE-TEMPLATE.md), ngoài acceptance riêng bên trên.

Chạy từ repo root sau khi dependencies của issue đã hoàn thành:

```bash
pnpm test:integration -- tests/integration/database.test.ts
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
