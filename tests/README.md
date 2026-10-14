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
pnpm test:core               # luật cờ + ngưỡng độ phủ 90%
pnpm typecheck               # gồm kiểm kiểu toàn bộ test (0 lỗi, chặn CI)
tests/server/db.sh test      # toàn bộ test, gồm các bộ cần database (dựng 12 cụm Postgres 17 cục bộ)
tests/server/db.sh test tests/server/game/room   # chỉ một nhóm
tests/server/db.sh stop      # tắt các cụm (db.sh purge để xóa dữ liệu)
```

Mỗi bộ test cần database khóa cứng host `127.0.0.1`, cổng và tên database (xem guard trong `*.test-helper.ts`
và `ci.yml`), nên `db.sh` dựng đúng từng cụm riêng. Kết quả chuẩn khi chạy đầy đủ: mọi test pass, 0 skip.

Chỉ chạy lệnh trên với database test cô lập này; không trỏ biến `*_TEST_DATABASE_URL` vào Supabase hay dữ liệu thật.
