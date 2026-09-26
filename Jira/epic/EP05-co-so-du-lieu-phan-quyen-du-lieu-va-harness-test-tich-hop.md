# EP05 · Cơ sở dữ liệu, phân quyền dữ liệu và harness test tích hợp

> **Loại:** Epic · **Story:** [ST05.1](../story/ST05.1-migration-ho-so-ban-be-phong-loi-moi-van-va-cay-nuoc-di.md), [ST05.2](../story/ST05.2-migration-chat-media-ai-phien-rls.md), [ST05.3](../story/ST05.3-harness-test-tich-hop-that-prisma-db-pull-pool-sql.md)

| Trường Jira | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | `EP05 · Cơ sở dữ liệu, phân quyền dữ liệu và harness test tích hợp` |
| Components | Backend, Tester |
| Priority | Highest |
| Labels | `xq-v2`, `ep05`, `critical-path` |
| Fix versions | `v0.2.0` |
| Start date / Due date | 2026-09-29 / 2026-10-07 |
| Nguồn đặc tả | ISSUE-035 … ISSUE-045 |

**Mục tiêu:** Toàn bộ schema PostgreSQL (Supabase) viết bằng **file `.sql` migration qua Supabase CLI**, có ràng buộc ở tầng dữ liệu (CHECK, UNIQUE, FK, unique hoãn kiểm, index có điều kiện), bật **RLS chặn mặc định** trên mọi bảng, vai trò `app_server` cho máy chủ; harness test tích hợp chạy trên **PostgreSQL + Supabase Auth thật**; Prisma chỉ `db pull` để sinh kiểu.

**Luật bắt buộc cho mọi Task trong Epic:**
- ⛔ **Không bao giờ chạy `prisma migrate`.** Prisma sẽ xoá RLS, CHECK, unique hoãn kiểm. Đổi schema **chỉ** bằng file `supabase/migrations/<timestamp>_<tên>.sql`, áp bằng `pnpm db:reset`.
- Test migration đặt ở `tests/integration/issue-0NN.test.ts`, chạy bằng `pnpm test:integration` trên **PostgreSQL thật**; thiếu DB ⇒ test **đỏ**, không skip. Kiểm lỗi bằng **mã SQLSTATE**: `23514` (CHECK), `23505` (UNIQUE), `23503` (FK).
- Test không dùng superuser để kiểm quyền (superuser che mọi lỗi phân quyền).
- Thứ tự khoá dòng toàn hệ thống: **phòng → người → ván** (ghi chú trong migration để các Epic sau tuân theo).

**Danh sách Story:**
| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST05.1](../story/ST05.1-migration-ho-so-ban-be-phong-loi-moi-van-va-cay-nuoc-di.md) | Migration hồ sơ, bạn bè, phòng, lời mời, ván và cây nước đi | 1 | 8 |
| [ST05.2](../story/ST05.2-migration-chat-media-ai-phien-rls.md) | Migration chat, media, AI, phiên + RLS | 2 | 8 |
| [ST05.3](../story/ST05.3-harness-test-tich-hop-that-prisma-db-pull-pool-sql.md) | Harness test tích hợp thật + Prisma db pull + pool SQL | 2 | 3 |

**Tiêu chí hoàn thành Epic:** `pnpm db:reset` từ DB sạch áp toàn bộ migration không lỗi; 100% bảng ứng dụng bật RLS; khoá anon và authenticated không đọc/ghi được bảng nào; harness đỏ khi tắt DB; `pnpm prisma:migrate` bị chặn.
