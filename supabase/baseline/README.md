# Baseline public XIANGQI — T14/XIAN-50 tranche 1

`20260913_legacy_public.sql` là bản schema-only có phiên bản của **19 bảng public đã audit**, trước nâng cấp đăng ký `20261011000001`. Đây là baseline dựng database trống, không phải migration để chạy lại trên project đã có dữ liệu. Chưa áp dụng file này hoặc hardening `000004` lên Supabase live.

Nguồn: catalog PostgreSQL17.6 của project XIANGQI đã kiểm chỉ đọc ngày11/10/2026 (UTC2026-10-10T22:27:33Z), qua session pooler5432, CA được kiểm chứng. Không dùng dữ liệu tài khoản/chat/hash/token để sinh DDL. Baseline giữ đúng tên cột, generated `profiles.id=user_id`, defaults, FK, constraints, indexes, RLS/FORCE, chính sách và ACL đã audit; chỉ phục hồi các phần pre-T04 đã được mô tả trong rollback000001: hai cột completion/pending chưa tồn tại, username check cũ, chưa có lower(username) index, hai function profile/registration cũ và quyền profile cũ. Constraint `matches_active_move_ids_check` vẫn NOT VALID theo catalog; không ngầm xác nhận dữ liệu legacy đã hợp lệ.

Dependency production là **Supabase managed `auth.users` và các role postgres/anon/authenticated/service_role/app_server**. Baseline không CREATE schema/table Auth, không CREATE/ALTER ROLE hay password, không sao chép provider/system schema. Custom `on_auth_user_created` trên auth.users là trigger ứng dụng đã audit; Auth schema/tables phải tồn tại trước. Managed `rls_auto_enable` event trigger không thuộc baseline. Ba function ứng dụng có owner/search_path/grants rõ ràng. Không chứa INSERT/COPY seed hoặc identity thật.

Chuỗi rebuild explicit khi database trống:

1. Managed Auth/roles dependency (local dùng fixture giả có nhãn riêng).
2. Baseline public19bảng.
3. `20261011000001_email_registration.sql` (T04 bàn giao).
4. `20261011000002_realtime.sql` (T12 bàn giao).
5. `20261011000003_username_login.sql` (T09 đã commit và kiểm CI PostgreSQL17.6; dùng bản cố định theo dependency của nhánh này).
6. `20261011000004_legacy_moves_security.sql` (tranche1).

Project live đã có baseline +000001: chỉ nâng cấp theo các migration đã được review/freeze, **không chạy baseline lại**. Bản legacy trước hardening có quyền trình duyệt nguy hiểm; không mở ứng dụng/REST runtime giữa baseline và chuỗi nâng cấp hoàn chỉnh. Chưa có migration ledger11filelegacy trong repo; baseline này không giả là11filegốc hoặc tái ghi lịch sử Supabase.

## Hardening `moves`

Catalog xác nhận `PUBLIC` không có quyền; anon/authenticated/service_role/app_server có ALL gồm PG17 `MAINTAIN`, grantorpostgres; ownerpostgres, RLS=true, FORCE=false, không policy hoặc columnACL. `000004` kiểm đúng trạng thái này, khóa bảng trong transaction, thu hồi ALL PUBLIC/anon/authenticated, bật FORCE RLS. Không thay service/app_server grants, FK/cột/index hoặc dữ liệu; không thêm policy app_server cho legacy moves. Vì không có policy, app_server vẫn có ACL nhưng RLS chặn truy cập row; service_role BYPASSRLS giữ hoạt động cũ. `match_moves` vẫn là bảng canonical, không được triển khai dual-write mới trong tranche này.

Rollback chỉ chấp nhận đúng ACL/FORCE/owner/RLS/no-policy/no-columnACL dự kiến sau hardening, rồi phục hồi quyền anon/authenticated và FORCE=false đã audit. Có thể rollback sau service data writes vì không đụng row; nếu metadata/quyền bị thay đổi sau migration, từ chối để tránh ghi đè. Rollback khôi phục **quyền legacy không an toàn**, chỉ dùng khi được review rõ. Không generic ACL journal/framework hoặc tự hỗ trợ variant chưa audit.

## Ranh giới còn lại

Tranche1 không tạo room_blocks, guest/session cleanup, room settings, chat waiting/pair model, media room-scope, outcome enum hoặc P2 tables. Các phần đó chờ contract tính năng freeze. Empty rebuild19bảng + migrations được kiểm không chứng minh T14 toàn phạm vi đã Done hoặc RLS/guest/game app features đã hoàn tất. Không thay Jira/Sprint.
