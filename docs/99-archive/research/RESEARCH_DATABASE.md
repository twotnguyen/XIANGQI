# Nghiên cứu nền tảng: Supabase và PostgreSQL cho lược đồ XIANGQI

> Đây là tài liệu nghiên cứu nguồn; tài liệu schema quyết định sau này mới là hợp đồng triển khai. Không tạo project, thay đổi cloud, hay migration từ tài liệu này.

**Ngày kiểm tra:** 2026-09-12. **Phiên bản tài liệu:** PostgreSQL 18/current và Supabase Docs đang công bố ngày kiểm tra. Supabase có thể thay đổi default privileges hoặc API; kiểm tra lại trước migration production.

## Kết luận áp dụng ngay

1. `public.profiles.user_id` phải là FK tới **primary key** `auth.users(id)`. Không tạo FK vào email, metadata, hoặc bất cứ cột/unique index nào khác của `auth.users`: Supabase chỉ bảo đảm PK của schema Auth là ổn định. `ON DELETE` là quyết định retention của ứng dụng, không phải yêu cầu của Supabase; lược đồ chuẩn chọn `RESTRICT` để không vô tình mất lịch sử. [Supabase: Managing user data](https://supabase.com/docs/guides/auth/managing-user-data), [lược đồ chuẩn](../specs/09-DATABASE-DESIGN.md)
2. Các bảng nghiệp vụ vẫn ở `public`, nhưng client browser không cần đường ghi trực tiếp: bật RLS, `REVOKE ALL` khỏi `anon, authenticated`, rồi chỉ `GRANT` tối thiểu nếu có bảng cần Data API. Backend dùng một role đăng nhập riêng (`app_server`) không có `BYPASSRLS`, với `GRANT` đúng bảng/sequence/function nó dùng. Supabase xác nhận RLS và grants là hai kiểm tra độc lập; policy không tự gỡ grant có sẵn. [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api), [Supabase roles](https://supabase.com/docs/guides/database/postgres/roles)
3. Không dùng `service_role` làm database role mặc định cho game server. Nó bỏ qua RLS và chỉ dành cho thao tác admin server-side. Role riêng giảm blast radius của lỗi SQL; RLS vẫn áp dụng nếu role đó không có `BYPASSRLS`. [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)

## Auth, profile và kiểm tra session

### Profile tham chiếu Auth

- Auth schema không được Auto API expose; dữ liệu app cần có bảng `public` riêng, RLS và grant thích hợp. Mẫu chính thức dùng PK/FK profile tới `auth.users(id)` và minh họa `ON DELETE CASCADE`; action này là mẫu, còn schema XIANGQI chọn `ON DELETE RESTRICT` vì retention history. Trigger profile có thể chặn đăng ký nếu lỗi, vì vậy migration phải có test đăng ký/trigger thật. [Supabase: Managing user data](https://supabase.com/docs/guides/auth/managing-user-data), [lược đồ chuẩn](../specs/09-DATABASE-DESIGN.md)
- `raw_user_meta_data` chỉ là dữ liệu khởi tạo UI/onboarding, không phải nguồn quyền. Lược đồ cần persist username/game profile ở `public.profiles` và kiểm tra quyền bằng dữ liệu app/server.

### Hàm đọc `auth.sessions`

- JWT có `session_id`, tương ứng PK trong `auth.sessions`; Supabase nêu rõ có thể kiểm sự tồn tại row đó cho action nhạy cảm vì sign-out xóa session. Đây là kiểm tra theo-request, không tự làm JWT đã phát hành vô hiệu ở endpoint không gọi kiểm tra. [Supabase: User sessions](https://supabase.com/docs/guides/auth/sessions), [Supabase: Managing user data](https://supabase.com/docs/guides/auth/managing-user-data)
- Nếu bọc truy vấn này trong `SECURITY DEFINER`, hàm chỉ trả `boolean` theo **cả** `session_id` và `user_id`; không trả cột Auth hoặc cho gọi SQL tuỳ ý. Schema-qualify `auth.sessions`; cố định `search_path` không chứa schema client có thể ghi (PostgreSQL khuyến nghị trusted schemas rồi `pg_temp` cuối), thu hồi `EXECUTE` khỏi `PUBLIC` và chỉ grant cho `app_server`. [PostgreSQL: writing SECURITY DEFINER safely](https://www.postgresql.org/docs/current/sql-createfunction.html), [Supabase profile-trigger example](https://supabase.com/docs/guides/auth/managing-user-data)
- Rủi ro còn lại: function owner có đặc quyền đọc Auth; thay đổi owner, search path hoặc broad `EXECUTE` có thể biến helper thành đường đọc Auth. Do đó test catalog bắt buộc xác nhận `proacl`, owner, `proconfig/search_path`, và test `anon/authenticated` bị từ chối.

## Constraints: điều gì database thực sự bảo đảm

| Invariant | Cách phù hợp | Cảnh báo |
| --- | --- | --- |
| username đã chuẩn hoá là duy nhất, nhưng Google onboarding có thể chưa có username | Trên cột username canonical nullable đã chọn trong lược đồ chuẩn, `UNIQUE` là đủ với PostgreSQL mặc định; hoặc `UNIQUE INDEX ... WHERE username IS NOT NULL` để nói rõ ý nghĩa | Unique mặc định xem các `NULL` là khác nhau; không dùng `NULLS NOT DISTINCT` ở đây. [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html) |
| format username / giới hạn số người xem / trạng thái một row | `NOT NULL` nơi bắt buộc, `CHECK` chỉ với cột cùng row | `CHECK` pass khi biểu thức là `NULL`; viết `NOT NULL` riêng. `CHECK` không dùng để đếm/so sánh row khác. [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html) |
| không có hai friendship/request cùng một cặp vô hướng | canonicalize `user_low_id < user_high_id`, sau đó `UNIQUE (user_low_id, user_high_id)` | Không để hai hướng `(A,B)` và `(B,A)`; canonicalization được `CHECK`/trigger hoặc server transaction bảo đảm. |
| một participant role trong một match | `PRIMARY KEY (match_id, user_id)` hoặc `UNIQUE (match_id, user_id)` theo row identity | FK tới `matches(id)` và `profiles(id)`; thêm index các FK ở phía referencing khi query/delete cha thường xuyên. PostgreSQL khuyên cân nhắc index này vì FK không tự tạo nó. [PostgreSQL CREATE TABLE](https://www.postgresql.org/docs/current/sql-createtable.html) |
| chỗ player/spectator, undo ancestry, phiên hoạt động, deadline | transaction server có lock + query/trigger có phạm vi hẹp | Không biểu diễn “đang hiệu lực tại `now()`” trong partial unique index: predicate/index functions phải immutable, current time không immutable. Lưu state materialized (`active`, `ended_at`, `released_at`) và chuyển state trong transaction. [PostgreSQL CREATE INDEX](https://www.postgresql.org/docs/current/sql-createindex.html) |

`CHECK` không được dùng để enforce cross-row/cross-table rule như “mỗi ván đúng hai player”, “tối đa năm spectator”, hay “move hợp lệ theo board”: docs PostgreSQL nói CHECK không tham chiếu dữ liệu row khác; dùng `UNIQUE`/FK khi biểu đạt được, còn lại authoritative server transaction và test concurrency. [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)

### Composite FK, vòng quan hệ và deferred constraints

- Composite FK là hợp lệ khi số/type cột khớp và target là `PRIMARY KEY`, `UNIQUE` **không deferrable**, hoặc unique index **không partial**. Vì vậy không được target một partial unique index từ FK. [PostgreSQL CREATE TABLE](https://www.postgresql.org/docs/current/sql-createtable.html)
- `REFERENCES`/FK có thể `DEFERRABLE`; nếu `INITIALLY DEFERRED` hoặc `SET CONSTRAINTS ... DEFERRED`, Postgres kiểm lúc commit. Dùng có chủ đích cho insert hai bảng có vòng tham chiếu trong **một transaction**, không dùng mặc định để che một mô hình vòng không cần thiết. `NOT NULL`/`CHECK` không deferrable và unique/PK deferrable không thể làm conflict arbiter của `ON CONFLICT`. [PostgreSQL CREATE TABLE](https://www.postgresql.org/docs/current/sql-createtable.html)

## Index thực dụng cho lược đồ game

- UUID equality lookup (`id`, FK `match_id`, `room_id`, `user_id`) dùng B-tree mặc định; PK/UNIQUE tự tạo B-tree. Chỉ thêm index FK/tổ hợp theo truy vấn có trong lược đồ chuẩn và chứng minh bằng `EXPLAIN`: ví dụ `moves(match_id, ply)`, `room_members(room_id, role/status)`, `chat_messages(match_id, channel, created_at)`, `ai_jobs(status, created_at)`. Các tên này là ví dụ của schema XIANGQI hiện tại, không phải danh sách bảng dùng lại được cho hệ khác. [lược đồ chuẩn](../specs/09-DATABASE-DESIGN.md)
- B-tree multi-column chỉ dùng hiệu quả với prefix bên trái. Ví dụ index `(match_id, created_at DESC)` phục vụ history của **một match**; nó không thay index `(user_id, created_at DESC)` cho lobby/history của một user. Xác nhận bằng `EXPLAIN (ANALYZE, BUFFERS)` sau khi có fixture/load test; không thêm index theo phỏng đoán.
- Username: canonical ASCII lower-case `[a-z0-9_]+` thì `UNIQUE (username)` là index và lookup chuẩn xác; không cần `lower()` expression index. Nếu sau này cho search prefix `username LIKE 'abc%'`, kiểm benchmark/collation trước khi thêm `text_pattern_ops`; không để display name là khóa login.
- Partial index dùng predicate ổn định theo row (`WHERE ended_at IS NULL`, `WHERE status = 'QUEUED'`) khi query khớp predicate; không dùng `now()`, subquery, aggregate, hay function volatile. PostgreSQL yêu cầu mọi function/operator trong index definition immutable. [PostgreSQL CREATE INDEX](https://www.postgresql.org/docs/current/sql-createindex.html)

## Kết nối và transaction trên Supabase

- Backend Render là persistent backend. Supabase hiện khuyến nghị direct connection cho persistent backend có IPv6/IPv4 add-on; nếu Render chỉ IPv4 thì shared session pooler. Migration, `pg_dump` và restore dùng direct connection. Nếu local/CI không reach direct endpoint, chạy migrations against the same mode only after proving migration tool does not require unsupported session state; prefer a direct local Supabase database for migration tests, and record this provider gate rather than silently substitute a connection mode. Copy host/role/port từ Dashboard, không tự suy luận host theo region. [Supabase: Connecting to Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres)
- Shared transaction pooler (port 6543) dành cho serverless/edge. Nó không hỗ trợ prepared statements; session state, session advisory locks, `LISTEN/NOTIFY`, temp tables qua transaction và hold cursors không tồn tại qua lần trả connection. Nếu buộc dùng nó, set driver `prepare: false` (Postgres.js/Drizzle) và đưa mọi `SET LOCAL`/lock cần thiết vào cùng transaction. [Supabase: Connecting to Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres)
- Quy tắc state của game: authoritative mutation mở **một** SQL transaction, lấy row locks trong thứ tự nhất quán `room → profiles theo user_id tăng dần → match → dependent rows`, kiểm version/idempotency, ghi event/move/clock, commit. AI command/finalizer bắt đầu từ match và không quay lại khóa profile. Không dựa session-level advisory locks nên vẫn chạy được với transaction pooler. Connection dùng `sslmode=require`/SSL required. [Supabase: Connecting to Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres), [lược đồ chuẩn](../specs/09-DATABASE-DESIGN.md)

## Kiểm chứng khi triển khai migration

1. `supabase db reset` rồi test trigger tạo profile, xoá Auth user bị chặn bởi `RESTRICT` khi history còn tồn tại, username `NULL` nhiều row và username duplicate bị từ chối.
2. `supabase test db`: mỗi bảng exposed phải test `anon` và `authenticated` allow/deny; với bảng backend-only, cả hai không có grant (`42501`). Supabase yêu cầu RLS, grant, và test mỗi table. [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
3. Integration concurrent: hai request cùng invite/join/move/claim slot chỉ tạo một receipt/move và không vượt 2 player + 5 spectator. Đây là proof cho invariant không thể đặt bằng `CHECK`.
4. Test pooler compatibility ở connection string sẽ deploy: transaction rollback, prepared statements disabled nếu port 6543, không dùng `LISTEN`, session advisory lock, temp table hay `SET` session scope.
