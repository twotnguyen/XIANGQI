# NFR-04 (RLS theo vai trò) — đo tại local (11/10/2026)

> Đây là kiểm **bằng vai trò thật** trên catalog PostgreSQL sau khi áp đủ migrations, khác với "RLS đã khai báo".
> Raw: [evidence/role-matrix-2026-10-11.json](evidence/role-matrix-2026-10-11.json). Test: `apps/server/src/schema/rls-role-matrix.test.ts`.

## 1. Phương pháp

1. `reset()` dựng baseline 19 bảng + migrations 01–05 (đúng như các test khác).
2. Áp tiếp migrations **06–17** (rooms, match outcomes, room modes, match draw, room chat, AI reservations, AI presence, side swap, friendships, media share, room viewers, RLS hardening).
3. Đọc catalog thật: `pg_class.relrowsecurity/relforcerowsecurity`, `aclexplode(relacl)` cho `anon`, `authenticated`, `app_server`, và `pg_policy` (lệnh + vai trò nhận policy).
4. Assert 5 bất biến (bên dưới). Chạy:
   ```
   ROOM_TEST_DATABASE_URL=... pnpm vitest run apps/server/src/schema/rls-role-matrix.test.ts
   ```

## 2. Kết quả

Phạm vi: **59 bảng** thuộc 7 schema — `public` 19, `xiangqi_auth` 14, `xiangqi_room` 9, `xiangqi_chat` 6, `xiangqi_social` 4, `xiangqi_ai` 4, `xiangqi_realtime` 3.

| #   | Bất biến                                                                        | Kết quả                                                                                          |
| --- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1   | Mọi bảng ứng dụng bật **RLS + FORCE**                                           | **PASS** — 59/59 `rls=true, force=true`                                                          |
| 2   | `anon` và `authenticated` **không có** quyền bảng nào                           | **PASS** — 0/59 bảng có grant (SELECT/INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER/MAINTAIN) |
| 3   | Danh sách bảng `app_server` không truy cập được là **có chủ đích và tối thiểu** | **PASS** — đúng 2 bảng: `xiangqi_auth.google_guest_baseline`, `xiangqi_auth.role_provisioning`   |
| 4   | Mọi bảng `app_server` truy cập được đều có **policy cho `app_server`**          | **PASS** — 0 bảng thiếu policy (ngoại lệ 1 bảng có ghi chú)                                      |
| 5   | Không policy nào cấp cho `PUBLIC`/vai trò trình duyệt                           | **PASS** — 0 policy có `polroles = {}`                                                           |

Ngoại lệ có ghi chú (cố ý, không phải lỗi): `public.moves` giữ ACL `app_server` theo baseline đã audit nhưng RLS khoá chặt **không policy** (fail-closed) — migration 04 chủ động cấm tồn tại policy và máy chủ kiểm bất biến này lúc khởi động (`room-runtime.ts`).

## 3. Lỗ hổng phát hiện và đã sửa trong cùng nhánh

Trước khi sửa, **9 bảng** tạo ở các migration P2 **thiếu RLS/FORCE/policy**, và **4 bảng** `xiangqi_auth` thiếu `FORCE`:

| Nhóm                       | Bảng                                                                                                                                                                                                                                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Thiếu RLS + FORCE + policy | `xiangqi_room.match_draw_offers`, `xiangqi_room.media_share`, `xiangqi_room.room_blocks`, `xiangqi_room.seat_invites`, `xiangqi_room.side_swap_offers`, `xiangqi_social.friend_decline_counts`, `xiangqi_social.friend_requests`, `xiangqi_social.friendships`, `xiangqi_social.room_invites` |
| Có RLS, thiếu FORCE        | `xiangqi_auth.registration_intents`, `xiangqi_auth.registration_drafts`, `xiangqi_auth.username_reservations`, `xiangqi_auth.role_provisioning`                                                                                                                                               |

Cách sửa: migration **`20261011000017_rls_hardening.sql`** + rollback khoá hash `supabase/rollback/20261011000017_rls_hardening.sql`:

- `ENABLE`/`FORCE ROW LEVEL SECURITY` cho 9 bảng; `REVOKE ALL` khỏi `PUBLIC,anon,authenticated`; `CREATE POLICY app_server_all ... TO app_server USING(true) WITH CHECK(true)`.
- Chỉ thêm `FORCE` cho 4 bảng `xiangqi_auth` (không đổi policy/quyền).
- Bổ sung là **thuần tăng cường**: hành vi `app_server` không đổi (policy `USING(true)`), trình duyệt vốn đã không có quyền.

## 4. Kết luận

| Tiêu chí NFR-04 (phần RLS)                          | Kết quả                     |
| --------------------------------------------------- | --------------------------- |
| RLS bật + FORCE trên mọi bảng ứng dụng              | **PASS** (sau migration 17) |
| Vai trò trình duyệt không có quyền bảng             | **PASS**                    |
| Policy chỉ cấp cho `app_server`                     | **PASS**                    |
| **RLS kiểm theo vai trò thật (không chỉ khai báo)** | **PASS tại local**          |

## 5. Giới hạn

- Chạy trên PostgreSQL local (cùng major version với Supabase) — **chưa** chạy trên project Supabase thật; chưa kiểm policy theo JWT/`auth.uid()` vì app dùng `app_server` sau khi xác thực phiên.
- `service_role` của Supabase có quyền rộng theo thiết kế nền tảng; ma trận này tập trung `anon`, `authenticated`, `app_server` theo NFR-04.
- Chưa kiểm RLS của `storage`/`realtime` schema do Supabase quản lý.
