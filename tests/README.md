# Kiểm thử

Toàn bộ test, helper và dữ liệu test nằm ở đây; `apps/` và `packages/` chỉ chứa mã chạy.

```text
tests/
├─ server/     phản chiếu apps/server/src (account/, game/, core/) + fixtures/ (SQL dựng database test)
├─ web/        phản chiếu apps/web/src (app/, features/, shared/)
├─ packages/   shared/, xiangqi-core/, engine/ (+ worker-fixtures/: worker giả cho test engine)
└─ tsconfig.json         kiểm kiểu toàn bộ test (server + web + packages) — chặn CI qua `pnpm typecheck`; IDE dùng chung
```

Quy ước đặt tên: `x.test.ts` (test), `x.test-helper.ts` (hàm dùng chung), `x.test-cases.ts` (bộ ca dùng chung),
`fixtures.ts` (dữ liệu mẫu). File test nằm ở đường dẫn tương ứng với file nguồn, ví dụ
`apps/server/src/game/room/room-store.ts` ↔ `tests/server/game/room/room.test.ts`.

## Import mã nguồn

Test import mã nguồn bằng alias (chỉ có hiệu lực trong `tests/`, mã nguồn vẫn import tương đối):

| Alias       | Trỏ tới                       |
| ----------- | ----------------------------- |
| `@server/…` | `apps/server/src/…`           |
| `@web/…`    | `apps/web/src/…`              |
| `@core/…`   | `packages/xiangqi-core/src/…` |
| `@engine/…` | `packages/engine/src/…`       |
| `@shared/…` | `packages/shared/src/…`       |

Cấu hình ở `vitest.config.ts` (chạy) và `tests/tsconfig.json` (kiểm kiểu/IDE). Thư viện test dùng trực tiếp
(`react`, `pg`, `@nestjs/*`, …) khai báo trong `tests/package.json` (package workspace `@xiangqi/tests`).

## Chạy

```sh
pnpm test                    # test không cần database (các bộ cần database tự bỏ qua)
pnpm test:fast               # như pnpm test nhưng bỏ qua timing.test.ts (chạy nhanh hơn)
pnpm test:unit               # chỉ chạy test web và packages (không động tới server)
pnpm test:core               # luật cờ + ngưỡng độ phủ 90%
pnpm typecheck               # gồm kiểm kiểu toàn bộ test (0 lỗi, chặn CI)
tests/server/db.sh test      # toàn bộ test, gồm các bộ cần database (dựng 12 cụm Postgres 17 cục bộ)
tests/server/db.sh test tests/server/game/room   # chỉ một nhóm
tests/server/db.sh stop      # tắt các cụm (db.sh purge để xóa dữ liệu)
```

Mỗi bộ test cần database khóa cứng host `127.0.0.1`, cổng và tên database (xem guard trong `*.test-helper.ts`
và `ci.yml`), nên `db.sh` dựng đúng từng cụm riêng. Kết quả chuẩn khi chạy đầy đủ: mọi test pass, 0 skip.

Chỉ chạy lệnh trên với database test cô lập này; không trỏ biến `*_TEST_DATABASE_URL` vào Supabase hay dữ liệu thật.

## Commit/push nhanh và CI theo phạm vi

Tác vụ chỉ commit/push không chạy lại lint/test/build hay chờ CI. Agent kiểm tra nhánh, diff/whitespace và bí mật staged, commit/push rồi trả mã commit. Trong lúc code, chỉ chạy file test hoặc smoke phần vừa sửa; không tự quét hàng trăm test web/packages/server. Không lặp lại kiểm tra nếu mã/dependency/cấu hình liên quan chưa đổi. Push thành công không phải bằng chứng test đã đạt.

**Luồng phát triển:** push `develop` hoặc PR vào `develop` chỉ chạy lint/typecheck toàn repo và build ứng dụng bị ảnh hưởng. Không chạy các bộ core/unit/database. `.github/scripts/ci-scope.mjs` chọn build theo diff:

| Vùng thay đổi | Build trên `develop` |
|---|---|
| `apps/web/`, `tests/web/` | Web và dependency |
| `apps/server/`, `tests/server/`, `supabase/` | Server và dependency |
| `packages/`, `tests/packages/` | Cả hai ứng dụng |
| Cấu hình gốc, workflow, đường dẫn chưa phân loại hoặc không đọc được diff | Cả hai ứng dụng; không tự bật test nặng |

PR vào `main` và push `main` luôn chạy mọi nhóm test/build cùng toàn bộ test server trên 12 cụm PostgreSQL cô lập. Giữ cả hai sự kiện để bảo vệ cả cập nhật qua PR và push trực tiếp; không chạy thêm toàn bộ database local chỉ để chờ CI chạy lại. Thay đổi chỉ gồm Markdown, `docs/` hoặc `.env.example` vẫn không kích hoạt workflow.

**Luồng tích hợp `main`:** core chạy một lần với coverage, sau đó `test:unit` loại thư mục core để không chạy trùng. Các lệnh local giữ nguyên để dùng khi chủ động yêu cầu kiểm tra toàn diện, không phải thủ tục trước mỗi commit/push:

```sh
pnpm test:core --bail 1
pnpm test:unit --exclude 'tests/packages/xiangqi-core/**' --bail 1
```

Self-check của bộ lọc (không cần database/dependency ngoài Node và Git):

```sh
node .github/scripts/ci-scope.mjs --self-test
```

Self-check kiểm tra ranh giới web/server/package, ảnh hưởng package dùng chung, cổng `main`, diff push/PR trên Git thật, rename liên vùng và fallback khi thiếu commit gốc. Bộ lọc dùng diff không gộp rename để không bỏ mất vùng cũ khi chuyển file.
