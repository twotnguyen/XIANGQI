# EP01 · Nền tảng kho mã & môi trường phát triển

> **Loại:** Epic · **Story:** [ST01.1](../story/ST01.1-kho-ma-monorepo-lint-va-khung-kiem-thu.md), [ST01.2](../story/ST01.2-ci-4-cong-va-supabase-local.md), [ST01.3](../story/ST01.3-khung-ung-dung-web-router-token-bo-cuc.md)

| Trường Jira | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | `EP01 · Nền tảng kho mã & môi trường phát triển` |
| Components | DevOps, Backend, Frontend, Tester |
| Priority | Highest |
| Labels | `xq-v2`, `ep01`, `critical-path` |
| Fix versions | `v0.1.0` |
| Start date / Due date | 2026-09-28 / 2026-09-30 |
| Nguồn đặc tả | ISSUE-001, 002, 003, 004, 005, 034, một phần 055 (router, tokens) |

**Mô tả (Description):**

**Mục tiêu:** Trước khi ai viết chức năng, cả nhóm phải có một kho mã chạy được giống hệt nhau trên mọi máy: cài bằng một lệnh, build/typecheck/lint/test bằng một lệnh, CI chặn merge khi đỏ, Supabase chạy local, và khung ứng dụng web có sẵn router + màu sắc chuẩn để Frontend gắn màn hình vào.

**Phạm vi (làm):**
- Monorepo pnpm 6 package, TypeScript nghiêm ngặt, khoá chính xác phiên bản.
- ESLint + Prettier + luật chặn import sai ranh giới kiến trúc.
- Vitest (unit) có đồng hồ giả tiêm vào; Playwright (e2e) có 2 kích thước màn hình và 8 phiên độc lập.
- CI GitHub Actions 4 cổng: `lint → typecheck → build → test:unit` + e2e smoke, chặn test bị bỏ qua và `.only`.
- Supabase local (Postgres + Auth + hộp thư), file biến môi trường mẫu, module đọc cấu hình ở server, runner test tích hợp tối thiểu.
- Khung ứng dụng web: router, file token màu/khoảng cách, bố cục trang, client gọi API/Supabase.

**Không làm:** logic nghiệp vụ, bảng dữ liệu (EP05), LiveKit (EP14), triển khai Internet (EP16).

**Danh sách Story:**

| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST01.1](../story/ST01.1-kho-ma-monorepo-lint-va-khung-kiem-thu.md) | Kho mã monorepo, lint và khung kiểm thử | 1 | 8 |
| [ST01.2](../story/ST01.2-ci-4-cong-va-supabase-local.md) | CI 4 cổng và Supabase local | 1 | 5 |
| [ST01.3](../story/ST01.3-khung-ung-dung-web-router-token-bo-cuc.md) | Khung ứng dụng web (router, token, bố cục) | 1 | 2 |

**Tiêu chí hoàn thành Epic:** thành viên mới clone kho, làm theo README, chạy được `pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck && pnpm build && pnpm test:unit && pnpm test:e2e` đều exit 0; `supabase start` chạy; mở PR có lỗi thì CI đỏ và không merge được.

**Rủi ro:** trễ Epic này là trễ toàn bộ dự án — mọi Story khác phụ thuộc. Ưu tiên tuyệt đối ngày 28–30/09.
