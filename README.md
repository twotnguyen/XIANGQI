# XIANGQI · Cờ Tướng Online

Ứng dụng web cờ tướng tiếng Việt dành cho những ván đấu cùng bạn bè và những buổi luyện tập với máy. XIANGQI kết hợp bàn cờ trực tuyến, phòng có người xem, trò chuyện và camera/mic tùy chọn trong giao diện **Kỳ Đài Cổ Phong**.

Đây là đồ án môn **Quản trị Dự án Công nghệ Thông tin**, thực hiện từ phân tích yêu cầu khách hàng đến lập kế hoạch, xây dựng và nghiệm thu sản phẩm.

> **Đang triển khai.** Mã nguồn trên `main` đã có web React/Vite, server NestJS/Socket.IO và các tính năng P1 đã tích hợp (đăng ký/đăng nhập, phòng, ván thời gian thực, chat, ván với máy, bạn bè, media), cùng một phần P2 (lịch sử, replay, mã QR mời). Việc nghiệm thu từng Task vẫn theo Jira và các cổng kiểm chứng trong [BACKLOG-P1.md](docs/product/BACKLOG-P1.md); nhiều Task trên Jira chưa được cập nhật trạng thái, và các kiểm chứng như camera/mic nhiều thiết bị, Google OAuth, RLS trên môi trường thật chưa hoàn tất. Phạm vi P1 được lập kế hoạch **880 giờ**, hạn **04/11/2026**. Xem [kế hoạch và tiến độ](docs/planning/KE-HOACH-JIRA.md).

[Chuẩn bị môi trường](docs/setup/CAU-HINH-MOI-TRUONG.md) · [Đặc tả P1](docs/product/BACKLOG-P1.md) · [Mockup](docs/design/mockups/index.html) · [Jira XIAN](https://xiangqi-web.atlassian.net/jira/software/c/projects/XIAN/boards/38)

## Tính năng dự kiến

- **Chơi cùng bạn bè:** tạo phòng, mời bạn bằng lời mời trong game hoặc link/mã; hai người chơi và tối đa năm người xem.
- **Bàn cờ tương tác:** quân chữ Hán, thao tác click hoặc kéo thả, gợi ý ô hợp lệ và âm thanh.
- **Ván đấu thời gian thực:** máy chủ kiểm luật và nước đi, quản lý đồng hồ, xin hòa, đầu hàng và xử lý mất kết nối.
- **Giao lưu trong phòng:** chat riêng của hai người chơi, chat chung với người xem; camera/mic mặc định tắt và chia sẻ theo quyền.
- **Luyện tập với máy:** ba cấp Dễ, Trung bình, Khó; chọn phe và bắt đầu ván mới.
- **Tài khoản và chế độ Khách:** đăng ký với OTP email, đăng nhập Google hoặc vào nhanh dưới vai trò Khách.

Đánh hạng/Elo, ghép ngẫu nhiên, lịch sử và replay thuộc P2, chưa nằm trong kế hoạch triển khai P1. Phạm vi và luật chi tiết được quản lý tại [quyết định nghiệp vụ](docs/product/BA-SCOPE-DECISIONS.md).

## Công nghệ

| Thành phần | Công nghệ đã chọn |
|---|---|
| Ngôn ngữ và workspace | TypeScript, Node.js, pnpm |
| Giao diện | React, Vite, SVG |
| API và realtime | NestJS, Socket.IO |
| Database và xác thực | Supabase PostgreSQL, Supabase Auth, Google OAuth, SMTP ngoài |
| Camera/mic | LiveKit tự chạy bằng Docker khi phát triển/demo LAN; LiveKit Cloud cho demo Internet |
| Máy cờ | TypeScript, negamax và alpha-beta, chạy trong tiến trình riêng |
| Kiểm thử ứng dụng | Vitest, Playwright |

Socket.IO đồng bộ ván cờ và chat; LiveKit truyền hình/tiếng. Máy chủ phân xử nước đi và cấp quyền truy cập media. Việc lỗi camera/mic không được làm gián đoạn ván cờ.

## Bắt đầu

### 1. Lấy mã nguồn

```sh
git clone https://github.com/twotnguyen/XIANGQI.git
cd XIANGQI
```

`main` là nhánh mặc định; `develop` dùng để tích hợp công việc của nhóm.

### 2. Chuẩn bị môi trường riêng

```sh
umask 077
[ -e .env ] || cp .env.example .env
mkdir -p apps/web apps/server
```

Điền `.env` tổng theo [hướng dẫn Supabase, Google OAuth, SMTP và LiveKit](docs/setup/CAU-HINH-MOI-TRUONG.md), rồi đồng bộ:

```sh
cp .env apps/web/.env
cp .env apps/server/.env
chmod 600 .env apps/web/.env apps/server/.env
```

Khóa thật không đi kèm repo. Nhận thông tin cần thiết qua kênh riêng của nhóm hoặc dùng dự án dịch vụ riêng. `SUPABASE_ACCESS_TOKEN` là tùy chọn cho công cụ quản trị.

### 3. Chạy bộ khung ứng dụng

Dùng Node.js 22 LTS (tối thiểu 22.13) theo `.node-version` và pnpm 10.34.6 theo `packageManager`. Nếu dùng Corepack: `corepack enable` rồi `corepack install`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Web ở `http://localhost:5173`, server ở `http://localhost:3000`. Chạy `curl http://localhost:3000/health` để kiểm tra HTTP 200; `server` là `ok`, `database` phản ánh kết nối khi bật đăng ký, `engine` vẫn là `not_connected`. `/dev/board` hiển thị bàn cờ; `/dev/register` kiểm giao diện đăng ký ba bước. Các route kiểm thành phần này chưa thay thế luồng Sảnh/phòng hoàn chỉnh. Socket.IO từ chối kết nối đến khi T12 tích hợp xác thực.

Server nạp `apps/server/.env`; Vite nạp `apps/web/.env` và chỉ công khai tiền tố `VITE_`. Bộ khung dùng mặc định local khi không có file môi trường; PORT, CORS_ORIGINS và LOG_LEVEL được kiểm tra mà không in giá trị lỗi. Secret của dịch vụ chưa tích hợp không bắt buộc để chạy bộ khung.

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm format:check
```

CI chạy lint, typecheck, test và build trên push/PR của `main` và `develop`. `packages/shared` chứa kiểu dữ liệu dùng chung; `packages/xiangqi-core` chứa luật; `packages/engine` chứa máy cờ. Các package nội bộ xuất TypeScript source; server dùng `tsx` cả khi chạy bản build (`pnpm --filter @xiangqi/server start`), còn web được Vite đóng gói.

Build web luôn dùng React production, kể cả khi `.env` dùng `NODE_ENV=development` cho server. CI có PostgreSQL 17 riêng để chạy kiểm thử SQL/HTTP đăng ký; chạy local theo [hướng dẫn database](supabase/README.md). Đăng ký mặc định tắt: chỉ bật `AUTH_REGISTRATION_ENABLED=true` sau khi migration, quyền runtime và cấu hình SMTP/OTP trên đúng project đã được kiểm chứng. Runtime dùng `DIRECT_URL` với direct/session pooler, không dùng transaction pooler 6543. Kiểm thử tự động dùng Auth HTTP fixture; nhận OTP thật, hoàn tất vào Sảnh và các cổng nghiệm thu vẫn cần bằng chứng riêng.

Nhật ký vận hành là JSON trên stdout/stderr, có `time`, `level`, `event`; chỉ chấp nhận mã sự kiện cố định và port dạng số, bỏ chuỗi/payload tùy ý để tránh lộ mật khẩu, OTP, token, chat. Ứng dụng không ghi file hay giữ log bền (thời gian lưu trong ứng dụng là 0 ngày). Nếu triển khai bộ thu log ngoài, phải cấu hình xóa sau tối đa 14 ngày; repo chưa triển khai bộ thu log. Biên lai lệnh và việc xóa sau 24 giờ thuộc T12, chưa tồn tại ở bộ khung.

### 4. Chuẩn bị media và xem giao diện

- [Chạy LiveKit bằng Docker và chuyển local/Cloud](infra/livekit/README.md): cần Python 3, Docker và Docker Compose. Kiểm thử nhiều thiết bị LAN cần HTTPS/WSS và cấu hình mạng phù hợp.
- Mở [docs/design/mockups/index.html](docs/design/mockups/index.html) trên máy để xem giao diện tham khảo. Đây là mockup, chưa phải ứng dụng kết nối backend.
- `pnpm dev` chạy bộ khung; các kiểm thử nghiệp vụ và media xuyên suốt ứng dụng sẽ được triển khai theo backlog.

## Cấu trúc thư mục

```text
XIANGQI/
├─ apps/
│  ├─ web/            React + Vite. src/ chia theo tính năng: auth, board, lobby, rooms (rooms/match),
│  │                  chat, ai, friends, history, media, profile; dùng chung: ui, layouts, routing, theme, styles
│  └─ server/         NestJS + Socket.IO. src/ chia theo miền: auth, google, guest, login, session, room
│                     (room/runtime, room/public), match, clock, realtime, chat, ai, history, friend, media,
│                     profile, schema; core/ giữ config, logger, bộ lọc nội dung riêng tư; main.ts/app.ts là điểm vào
├─ packages/          shared (kiểu dùng chung), xiangqi-core (luật), engine (máy cờ)
├─ supabase/          migration, rollback, baseline, kiểm thử SQL, mẫu email
├─ infra/livekit/     Docker và báo cáo spike LiveKit
├─ scripts/           công cụ dòng lệnh (chuyển LiveKit local/Cloud)
├─ docs/
│  ├─ product/        IDEA, quyết định BA, backlog P1/P2
│  ├─ design/         DESIGN, danh mục màn hình, mockups/
│  ├─ planning/       KE-HOACH-JIRA.md và jira/ (dữ liệu, công cụ, báo cáo, kiểm thử)
│  └─ setup/          hướng dẫn cấu hình môi trường và dịch vụ
├─ .github/           CI, CODEOWNERS
└─ .local/            ghi chú, log, bản sao lưu cá nhân (Git bỏ qua)
```

## Tài liệu dự án

| Nội dung | Tài liệu |
|---|---|
| Mục đích, người dùng và trải nghiệm | [IDEA.md](docs/product/IDEA.md) |
| Quyết định nghiệp vụ và phạm vi | [BA-SCOPE-DECISIONS.md](docs/product/BA-SCOPE-DECISIONS.md) |
| User Story, tiêu chí nghiệm thu và kiểm thử | [P1](docs/product/BACKLOG-P1.md), [P2](docs/product/BACKLOG-P2.md) |
| Phạm vi P1/P2 và tiến độ triển khai | [Danh mục](docs/planning/jira/reports/PHAM-VI-P1-P2.md), [Kế hoạch triển khai](docs/planning/jira/reports/KE-HOACH-TRIEN-KHAI-P1-P2.md) |
| Màn hình và thiết kế | [Danh mục màn hình](docs/design/DANH-MUC-MAN-HINH-XIANGQI.md), [DESIGN.md](docs/design/DESIGN.md) |
| Phân công, lịch, phụ thuộc và giờ làm | [KE-HOACH-JIRA.md](docs/planning/KE-HOACH-JIRA.md) |
| Dữ liệu, báo cáo và công cụ Jira | [docs/planning/jira/README.md](docs/planning/jira/README.md) |
| Cấu hình dịch vụ và kết quả kiểm chứng | [CAU-HINH-MOI-TRUONG.md](docs/setup/CAU-HINH-MOI-TRUONG.md) |
| Hướng dẫn cho coding agent và quy ước Git/Jira | [AGENTS.md](AGENTS.md) |

## Đóng góp

Chọn Task trong Jira, đọc Story và tiêu chí nghiệm thu liên quan trước khi sửa. Theo [quy ước nhánh, commit và PR](AGENTS.md#git-commit-và-pull-request) để truy vết thay đổi về issue. `main` và `develop` hiện không có bảo vệ nhánh; nhóm vẫn kiểm tra và review thay đổi trước khi tích hợp.

BA Done thể hiện đặc tả đã chốt, không có nghĩa Task triển khai hoặc sản phẩm đã hoàn thành. Cập nhật tiến độ theo kết quả thực tế.

## Bảo mật

Các file `.env` và `.local/` chỉ giữ trên máy. Chỉ commit mẫu trống; không đưa mật khẩu, token hoặc khóa thật vào mã, log, ảnh chụp hay issue. Biến `VITE_*` và `NEXT_PUBLIC_*` là công khai trên trình duyệt; khóa đặc quyền Supabase, LiveKit và SMTP chỉ được sử dụng phía server hoặc trong công cụ riêng.

## Giấy phép

Dự án chưa chọn giấy phép phân phối. Giấy phép của thư viện, font và tài nguyên bên thứ ba phải được giữ kèm khi sử dụng.
