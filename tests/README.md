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

**Không tự chạy test local khi coding hoặc hoàn thành tác vụ.** Chỉ dùng các lệnh test/self-check bên dưới khi người dùng yêu cầu rõ; CI GitHub giữ trách nhiệm kiểm thử tự động theo từng nhánh. Nguồn điều phối duy nhất là [AGENTS.md](../AGENTS.md#coding-nhanh-và-phạm-vi-kiểm-chứng-test-scoping-rules).

Ví dụ chạy đúng phạm vi **sau khi được yêu cầu test**:

```sh
pnpm exec vitest run tests/server/core/logger.test.ts
tests/server/db.sh test tests/server/game/chat/chat-realtime.test.ts
tests/server/db.sh stop
```

**Các lệnh toàn diện dưới đây dành cho CI hoặc yêu cầu kiểm tra toàn diện rõ ràng của người dùng, không phải checklist mỗi tác vụ:**

```sh
pnpm test                    # test không cần database (các bộ cần database tự bỏ qua)
pnpm test:fast               # như pnpm test nhưng bỏ qua timing.test.ts (chạy nhanh hơn)
pnpm test:unit               # chỉ chạy test web và packages (không động tới server)
pnpm test:core               # luật cờ + ngưỡng độ phủ 90%
pnpm typecheck               # gồm kiểm kiểu toàn bộ test (0 lỗi, chặn CI)
tests/server/db.sh test      # toàn bộ test; dựng đủ cụm cần thiết khi không lọc file
```

`db.sh test` dùng `vitest list --filesOnly` với chính đối số sẽ truyền cho lượt chạy, rồi theo các import tương đối tĩnh trong test/helper để chọn cụm. Vì vậy nhiều file/thư mục và `--exclude` đều được tính trước khi khởi động PostgreSQL; riêng test không cần SQL không yêu cầu cài PostgreSQL. Helper dùng chung giữa các miền vẫn chọn đúng database (ví dụ chat dùng cụm phòng); draw worker và game runtime dùng chung cụm 55452.

Runner xóa các biến `*_TEST_DATABASE_URL` thuộc danh sách quản lý được kế thừa, rồi chỉ cấp URL local cho cụm đã chọn; tên database chưa được khai báo hoặc import tương đối không phân giải được sẽ báo lỗi trước khi dựng cụm. Guard host/port/tên database trong các bộ test giữ nguyên. `start`, `stop`, `status`, `env`, `purge` vẫn thao tác toàn bộ danh sách cụm như trước.

Self-check của bộ chọn (chỉ chạy khi được yêu cầu; không dựng database):

```sh
node tests/server/db-scope.mjs --self-test
```

Chỉ chạy lệnh trên với database test cô lập này; không trỏ biến `*_TEST_DATABASE_URL` vào Supabase hay dữ liệu thật.

## Commit/push nhanh và CI theo phạm vi

Phạm vi kiểm chứng khi coding, commit/push và nghiệm thu được điều phối duy nhất tại [AGENTS.md — Coding nhanh và phạm vi kiểm chứng](../AGENTS.md#coding-nhanh-và-phạm-vi-kiểm-chứng-test-scoping-rules). Các lệnh ở đây không cấp quyền tự chạy test local, kể cả một file, test mới hoặc self-check; không chạy lại kết quả còn hiệu lực.

**Luồng phát triển:** push `develop` hoặc PR vào `develop` chỉ chạy lint/typecheck toàn repo và build ứng dụng bị ảnh hưởng. Không chạy các bộ core/unit/database. `.github/scripts/ci-scope.mjs` chọn build theo diff:

| Vùng thay đổi                                                             | Build trên `develop`                    |
| ------------------------------------------------------------------------- | --------------------------------------- |
| `apps/web/`, `tests/web/`                                                 | Web và dependency                       |
| `apps/server/`, `tests/server/`, `supabase/`                              | Server và dependency                    |
| `packages/`, `tests/packages/`                                            | Cả hai ứng dụng                         |
| Cấu hình gốc, workflow, đường dẫn chưa phân loại hoặc không đọc được diff | Cả hai ứng dụng; không tự bật test nặng |

PR vào `main` và push `main` chạy mọi nhóm test/build cùng toàn bộ test server trên 12 cụm PostgreSQL cô lập. Giữ cả hai sự kiện để kiểm tra cả cập nhật qua PR và push trực tiếp. Thay đổi chỉ gồm Markdown, `docs/` hoặc `.env.example` vẫn không kích hoạt workflow.

**Luồng tích hợp `main`:** core chạy một lần với coverage, sau đó `test:unit` loại thư mục core để không chạy trùng. Các lệnh local giữ nguyên để dùng khi chủ động yêu cầu kiểm tra toàn diện, không phải thủ tục trước mỗi commit/push:

```sh
pnpm test:core --bail 1
pnpm test:unit --exclude 'tests/packages/xiangqi-core/**' --bail 1
```

Self-check của bộ lọc (chỉ chạy khi được yêu cầu; không cần database/dependency ngoài Node và Git):

```sh
node .github/scripts/ci-scope.mjs --self-test
```

Self-check kiểm tra ranh giới web/server/package, ảnh hưởng package dùng chung, cổng `main`, diff push/PR trên Git thật, rename liên vùng và fallback khi thiếu commit gốc. Bộ lọc dùng diff không gộp rename để không bỏ mất vùng cũ khi chuyển file.

## Đo tải realtime trên dịch vụ đang chạy

`load/realtime.ts` dùng HTTP API, Socket.IO và luật cờ thật; không khởi động
runtime thứ hai vì startup recovery của runtime có thể tác động phòng đang có.
Chỉ chạy khi được giao đo tải trên đúng môi trường. Không trỏ các
`*_TEST_DATABASE_URL` vào Supabase để chạy các fixture reset.

Chuẩn bị riêng 50 danh tính và phiên hợp lệ trong file quyền `600`, không gửi
email; cấu trúc `{runId, users: [{userId, accessToken, appSession}]}`. Mỗi bearer
vẫn được backend xác minh bằng GoTrue thật; không dùng mock provider hoặc
chỉ decode JWT làm bằng chứng đăng nhập. Không in file proofs vào log.

```sh
REALTIME_LOAD_URL='https://HOST.ts.net:8443' \
REALTIME_LOAD_ORIGIN='https://HOST.ts.net' \
REALTIME_LOAD_PROOFS='.local/realtime-load/RUN_ID/proofs.json' \
REALTIME_LOAD_OUTPUT='.local/realtime-load/RUN_ID/result.json' \
REALTIME_LOAD_MANIFEST='.local/realtime-load/RUN_ID/resources.json' \
REALTIME_LOAD_ROUNDS=20 \
pnpm --filter @xiangqi/server exec tsx ../../tests/load/realtime.ts
```

Probe tạo 10 phòng với hai người chơi và ba người xem mỗi phòng; giữ 50 socket,
chờ đủ snapshot và 10 ván thực sự ACTIVE, rồi gửi 20 vòng nước hợp lệ đồng thời
qua 10 phòng. Đích là 200 nước, 800 mẫu gửi→snapshot của đối thủ/người xem.
ACK đo riêng, không thay cho độ trễ nhận trạng thái chính thức. Các peer phải
đồng thuận thế cờ sau mỗi vòng; lỗi hoặc thiếu mẫu không được tính PASS.

File manifest ghi room/match IDs ngay khi tạo. Probe không reset/xóa database:
người chạy phải dọn đúng resources và 50 danh tính tải sau khi lưu kết quả,
không dọn theo tên gần giống hoặc khoảng thời gian. Đo CPU/RAM tiến trình server
riêng; độ trễ chỉ có ý nghĩa với topology, phiên bản Node và đường mạng ghi nhận.
Không dùng kết quả client cùng máy để chứng nhận nhiều thiết bị hoặc camera.
