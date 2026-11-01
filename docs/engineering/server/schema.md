# Kiểm T14 baseline/hardening trên cluster riêng

`schema.test.ts` chỉ chạy khi `SCHEMA_TEST_DATABASE_URL` chỉ đến **127.0.0.1:55443/xiangqi_schema_test**. Database/cluster này dành riêng fixture T14; không dùng Supabase live, authDB55441 hoặc loginDB55444. Suite reset schema public/auth/xiangqi_* trong database này. Role bootstrap chỉ tạo role chưa có, không ALTER flags hoặc mật khẩu; membership do fixture admin của cluster riêng quản lý. `managed-auth.test-fixture.sql` là mô phỏng tối thiểu của managed dependency, không được deploy lên Supabase.

```sh
SCHEMA_TEST_DATABASE_URL=postgresql://schema_test_admin@127.0.0.1:55443/xiangqi_schema_test pnpm exec vitest run tests/server/core/schema/schema.test.ts
```

Node22.23.3, PostgreSQL17.11 (Homebrew): **7/7 tests PASS**. TDD RED trước hardening: baseline/rebuild PASS, ba permission/FORCE/rollback guards FAIL với stub; GREEN khi áp dụng exact migration/inverse. Các checks gồm:

- Dựng từ trống hai lần đủ19bảng và chạy000001→000002→000003→000004, giữ generated profileID.
- Không tạo managed Auth/roles trong baseline; thiếu Auth dependency thì transaction từ chối, không để lại public tables dở dang.
- anon/authenticated bị42501 khi SELECT/INSERT/UPDATE/DELETE/TRUNCATE; kiểm ACL không có REFERENCES/TRIGGER/MAINTAIN hoặc bất kỳ quyền bảng nào.
- Service_role vẫn sửa row thật; migration+rollback giữ row/FK và hoàn nguyên exact semantic ACL grantor/options, FORCE/RLS/owner/column metadata.
- TEMP catalog shadow không che được policy mới: catalog được định danh pg_catalog và migration ghim search_path. Regression RED với guard cũ, GREEN sau sửa.
- Original PUBLIC grants chưa audit làm migration từ chối; privilege/columnACL/FORCE changes sau hardening làm rollback từ chối và không ghi đè thay đổi đó.

Source baseline giữ NOT VALID constraint đã audit, không claim mọi data legacy valid. Test không gọi provider/email, không có user thật, không chứng minh full T14/P1/P2 gates. CI của nhánh này đã cấu hình service PostgreSQL17.6 riêng ở cổng55443 và biến SCHEMA_TEST_DATABASE_URL; kết quả run trên GitHub phải được xác minh sau push. Dependency T09 dùng commit đã kiểm trên PostgreSQL17.6, không lấy WIP từ thư mục gốc.

## Rollout media generation — YC7

Migration `20261103000010_media_generation.sql` chỉ tăng `room_version` và ghi thu hồi namespace cũ cho phòng chưa đóng (`closed_at IS NULL`). Phòng đã đóng dùng mã legacy trước ràng buộc 8 chữ số được giữ nguyên; cập nhật chúng sẽ kích hoạt lại CHECK `NOT VALID` và làm transaction migration thất bại. Bản sửa này đã nằm trong SQL áp lên Cloud trước khi YC9 được kiểm chứng; không áp lại hoặc sửa lịch sử migration. Hồi quy: `tests/server/game/media/media.revocation.test.ts` (12 ca đạt local trong lượt sửa review).
