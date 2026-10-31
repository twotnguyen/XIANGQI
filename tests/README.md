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

**Không tự chạy test local khi coding hoặc hoàn thành tác vụ.** Chỉ dùng các lệnh test/self-check bên dưới khi người dùng yêu cầu rõ; CI GitHub giữ trách nhiệm kiểm thử tự động theo từng nhánh. Nguồn điều phối duy nhất là [AGENTS.md](../AGENTS.md#kiểm-chứng).

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

CI dùng cùng runner với `XQ_PG_DOCKER=1`: chỉ dựng container `postgres:17.6`
cho các cụm đã chọn, bind cổng trên `127.0.0.1`, dữ liệu trong tmpfs và dọn
container của chính lượt chạy khi kết thúc hoặc lỗi. Không dùng Supabase hay
database có sẵn. Các guard URL và chế độ tuần tự trong mỗi shard giữ nguyên.

Các helper room/match/clock/runtime dùng `fixtures/apply-sql.test-helper.ts`
để gửi `SET ROLE postgres` cùng **một file SQL**, giảm từ ba xuống hai lượt
trao đổi với PostgreSQL cho mỗi migration/baseline. Không gộp nhiều migration,
không bỏ `beforeEach` reset schema hay replay migration; `ROLLBACK; RESET ROLE`
vẫn chạy sau thành công hoặc lỗi, rồi connection luôn được trả về pool.
Test SQL thật kiểm cả commit tường minh, transaction chưa commit, lỗi giữa
file và khôi phục role. Các test migration/rollback gốc vẫn giữ nguyên.

Self-check của bộ chọn (chỉ chạy khi được yêu cầu; không dựng database):

```sh
node tests/server/db-scope.mjs --self-test
```

Chỉ chạy lệnh trên với database test cô lập này; không trỏ biến `*_TEST_DATABASE_URL` vào Supabase hay dữ liệu thật.

## Commit/push nhanh và CI theo phạm vi

Phạm vi kiểm chứng khi coding, commit/push và nghiệm thu được điều phối duy nhất tại [AGENTS.md — Coding nhanh và phạm vi kiểm chứng](../AGENTS.md#kiểm-chứng). Các lệnh ở đây không cấp quyền tự chạy test local, kể cả một file, test mới hoặc self-check; không chạy lại kết quả còn hiệu lực.

**Phân quyền thành viên:** ruleset GitHub [Protected branches: owner-only updates](https://github.com/twotnguyen/XIANGQI/rules/26200968) giới hạn tạo/cập nhật/xóa `main` và `develop`, chỉ tài khoản `twotnguyen` (ID `195888848`) được bypass. Thành viên giữ quyền push nhánh riêng và mở PR vào `develop`, nhưng không được push trực tiếp hoặc tự merge vào hai nhánh tích hợp. Chủ repo review rồi merge PR vào `develop`, hoặc có thể code/push thẳng `develop`. `main` vẫn chịu protection riêng, kể cả chủ repo: bắt buộc PR phát hành và required checks. Quyền bypass ruleset này không bỏ qua protection riêng của `main`; không cấp bypass cho cả nhóm admin hay bot.

**Luồng phát triển:** push `develop` hoặc PR vào `develop` có thay đổi mã chạy lint/typecheck toàn repo, build ứng dụng bị ảnh hưởng và unit/core; không chạy database. Nếu lượt push xác minh được đã có PR `develop` → `main` trong cùng repository bao phủ **đúng head SHA**, build/unit chỉ chạy ở PR phát hành. API lỗi, head chưa đồng bộ hoặc không có PR thì push vẫn chạy bình thường. Mở PR sau khi lượt push đã hoàn tất không thu hồi công việc đã chạy. `.github/scripts/ci-scope.mjs` chọn build theo diff:

| Vùng thay đổi                                                             | Build trên `develop`                    |
| ------------------------------------------------------------------------- | --------------------------------------- |
| `apps/web/`, `tests/web/`                                                 | Web và dependency                       |
| `apps/server/`, `tests/server/`, `supabase/`                              | Server và dependency                    |
| `packages/`, `tests/packages/`                                            | Cả hai ứng dụng                         |
| Cấu hình gốc, workflow, đường dẫn chưa phân loại hoặc không đọc được diff | Cả hai ứng dụng; không tự bật test nặng |

**Cửa phát hành:** chỉ PR `develop` → `main` trong chính repository được chấp nhận. PR có thay đổi mã luôn chạy mọi nhóm test/build, gồm sáu shard server với PostgreSQL cô lập; không tái sử dụng trạng thái xanh của lượt push để bỏ kiểm tra bản tích hợp. Không kích hoạt CI khi push `main`: kết quả kiểm chứng nằm trên PR trước merge, không tạo check xanh giả cho commit merge.

`.github/scripts/server-shards.mjs` khám phá danh sách test hiện tại bằng Vitest,
rồi chia longest-first theo thời gian từng file trong `server-test-timings.json`.
Baseline lấy từ log Vitest của run `41100975346` (155 file), không dùng thời gian
job của GitHub vì số đó không khớp log thực thi trong lần đo này. File mới vẫn
được gán shard với chi phí dự phòng; file đã xóa không được gọi lại. Mỗi file
hiện tại phải thuộc đúng một shard và chạy tuần tự trong shard.

Xem kế hoạch hoặc tự kiểm bộ chia (không chạy test/database):

```sh
node .github/scripts/server-shards.mjs --self-test
node .github/scripts/server-shards.mjs --plan
```

Khi cập nhật baseline, lấy dòng tổng thời gian **từng file** trong log Vitest
của cả sáu shard đã thành công, cập nhật map đường dẫn → milliseconds và giữ
đầy đủ file mới. Thời gian kế hoạch là ước lượng để cân tải, không phải cam kết
thời gian CI; setup runner/container, import và cleanup còn có chi phí riêng.

Đối chiếu danh sách hiện tại sau tối ưu: 156 file được chọn đúng một lần,
tải ước lượng mỗi shard khoảng 70,26 giây và tổng số cụm PostgreSQL cần dựng
là 32 thay vì 72 (12 cụm × 6 shard). Đây là kế hoạch tính từ baseline, chưa
phải thời gian end-to-end của một lượt GitHub Actions mới.

Smoke trong Linux/Docker cô lập với Node 22: 5 regression SQL pass; 50 test
room/chat pass ở cả helper trước và sau tối ưu; một shard thật gồm 26 file,
250 test pass và không còn container test sau khi kết thúc. Lượt đo room/chat
đơn lẻ là 7,92 giây trước và 7,81 giây sau; chênh lệch nhỏ, chưa đủ kết luận
mức tăng tốc fixture ổn định.

**PR chỉ sửa tài liệu:** workflow vẫn chạy với Markdown, `docs/` hoặc `.env.example`; kiểm tra nguồn PR và bộ lọc vẫn chạy, nhưng bỏ qua cài dependency/lint/typecheck/build/unit/database. Hai required checks vẫn kết thúc thành công nếu các kiểm tra nhẹ đạt. Không đọc được diff thì chạy đầy đủ thay vì coi là tài liệu.

**Protection `main`:** bắt buộc PR, áp dụng cả admin, required checks `Fast Checks & Build (full tests on main)` và `Database Integration Gate`, yêu cầu cập nhật theo base mới nhất; không bắt người khác approve trong repo cá nhân. Giữ tên check cũ để không làm đứt protection. Quy tắc nhánh nguồn do required CI check kiểm tra cả tên `develop` và repository nguồn; GitHub không có bộ lọc nhánh nguồn tương đương trong branch protection. Dùng merge commit cho PR phát hành rồi fast-forward `develop` theo `main`.

Core chạy một lần với coverage, sau đó `test:unit` loại thư mục core để không chạy trùng. Các lệnh local giữ nguyên để dùng khi chủ động yêu cầu kiểm tra toàn diện, không phải thủ tục trước mỗi commit/push:

```sh
pnpm test:core --bail 1
pnpm test:unit --exclude 'tests/packages/xiangqi-core/**' --bail 1
```

Self-check của bộ lọc (chỉ chạy khi được yêu cầu; không cần database/dependency ngoài Node và Git):

```sh
node .github/scripts/ci-scope.mjs --self-test
```

Self-check kiểm tra ranh giới web/server/package, ảnh hưởng package dùng chung, cổng PR `main`, docs-only và docs trộn mã trong đợt phát hành, diff push/PR trên Git thật, rename liên vùng và fallback khi thiếu commit gốc. Bộ lọc dùng diff không gộp rename để không bỏ mất vùng cũ khi chuyển file.

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
REALTIME_LOAD_URL='http://127.0.0.1:3000' \
REALTIME_LOAD_ORIGIN='https://HOST.ts.net' \
REALTIME_LOAD_PROOFS='.local/realtime-load/RUN_ID/proofs.json' \
REALTIME_LOAD_OUTPUT='.local/realtime-load/RUN_ID/result.json' \
REALTIME_LOAD_MANIFEST='.local/realtime-load/RUN_ID/resources.json' \
REALTIME_LOAD_ROUNDS=20 \
pnpm --filter @xiangqi/server exec tsx ../../tests/load/realtime.ts
```

Probe chạy trên máy chủ và gọi trực tiếp NestJS (không qua `/api`); origin web vẫn
phải có trong `CORS_ORIGINS`. Không cần mở cổng API riêng ra tailnet.

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
