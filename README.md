# XIANGQI · Cờ Tướng Online

Ứng dụng web cờ tướng tiếng Việt dành cho những ván đấu cùng bạn bè và những buổi luyện tập với máy. XIANGQI kết hợp bàn cờ trực tuyến, phòng có người xem, trò chuyện và camera/mic tùy chọn trong giao diện **Kỳ Đài Cổ Phong**.

Đây là đồ án môn **Quản trị Dự án Công nghệ Thông tin**, thực hiện từ phân tích yêu cầu khách hàng đến lập kế hoạch, xây dựng và nghiệm thu sản phẩm.

> **Đang chuẩn bị triển khai.** Repo hiện có đặc tả, mockup, kế hoạch và cấu hình dịch vụ; chưa có ứng dụng web/server hoàn chỉnh để chạy. Phạm vi P1 được lập kế hoạch **880 giờ**, hạn **04/11/2026**. Xem [kế hoạch và tiến độ](KE-HOACH-JIRA.md).

[Chuẩn bị môi trường](CAU-HINH-MOI-TRUONG.md) · [Đặc tả P1](BACKLOG-P1.md) · [Mockup](mockups/index.html) · [Jira XIAN](https://xiangqi-web.atlassian.net/jira/software/c/projects/XIAN/boards/38)

## Tính năng dự kiến

- **Chơi cùng bạn bè:** tạo phòng, mời bạn bằng lời mời trong game hoặc link/mã; hai người chơi và tối đa năm người xem.
- **Bàn cờ tương tác:** quân chữ Hán, thao tác click hoặc kéo thả, gợi ý ô hợp lệ và âm thanh.
- **Ván đấu thời gian thực:** máy chủ kiểm luật và nước đi, quản lý đồng hồ, xin hòa, đầu hàng và xử lý mất kết nối.
- **Giao lưu trong phòng:** chat riêng của hai người chơi, chat chung với người xem; camera/mic mặc định tắt và chia sẻ theo quyền.
- **Luyện tập với máy:** ba cấp Dễ, Trung bình, Khó; chọn phe và bắt đầu ván mới.
- **Tài khoản và chế độ Khách:** đăng ký với OTP email, đăng nhập Google hoặc vào nhanh dưới vai trò Khách.

Đánh hạng/Elo, ghép ngẫu nhiên, lịch sử và replay thuộc P2, chưa nằm trong kế hoạch triển khai P1. Phạm vi và luật chi tiết được quản lý tại [quyết định nghiệp vụ](BA-SCOPE-DECISIONS.md).

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

Điền `.env` tổng theo [hướng dẫn Supabase, Google OAuth, SMTP và LiveKit](CAU-HINH-MOI-TRUONG.md), rồi đồng bộ:

```sh
cp .env apps/web/.env
cp .env apps/server/.env
chmod 600 .env apps/web/.env apps/server/.env
```

Khóa thật không đi kèm repo. Nhận thông tin cần thiết qua kênh riêng của nhóm hoặc dùng dự án dịch vụ riêng. `SUPABASE_ACCESS_TOKEN` là tùy chọn cho công cụ quản trị.

### 3. Chuẩn bị media và xem giao diện

- [Chạy LiveKit bằng Docker và chuyển local/Cloud](infra/livekit/README.md): cần Python 3, Docker và Docker Compose. Kiểm thử nhiều thiết bị LAN cần HTTPS/WSS và cấu hình mạng phù hợp.
- Mở [mockups/index.html](mockups/index.html) trên máy để xem giao diện tham khảo. Đây là mockup, chưa phải ứng dụng kết nối backend.
- Bộ khung web/server, phiên bản Node/pnpm và lệnh chạy ứng dụng sẽ được thiết lập ở T01. Hiện chưa có lệnh `pnpm dev` để chạy toàn bộ sản phẩm.

## Tài liệu dự án

| Nội dung | Tài liệu |
|---|---|
| Mục đích, người dùng và trải nghiệm | [IDEA.md](IDEA.md) |
| Quyết định nghiệp vụ và phạm vi | [BA-SCOPE-DECISIONS.md](BA-SCOPE-DECISIONS.md) |
| User Story, tiêu chí nghiệm thu và kiểm thử | [BACKLOG-P1.md](BACKLOG-P1.md) |
| Màn hình và thiết kế | [Danh mục màn hình](DANH-MUC-MAN-HINH-XIANGQI.md), [DESIGN.md](DESIGN.md) |
| Phân công, lịch, phụ thuộc và giờ làm | [KE-HOACH-JIRA.md](KE-HOACH-JIRA.md) |
| Dữ liệu, báo cáo và công cụ Jira | [jira/README.md](jira/README.md) |
| Cấu hình dịch vụ và kết quả kiểm chứng | [CAU-HINH-MOI-TRUONG.md](CAU-HINH-MOI-TRUONG.md) |
| Hướng dẫn cho coding agent và quy ước Git/Jira | [AGENTS.md](AGENTS.md) |

## Đóng góp

Chọn Task trong Jira, đọc Story và tiêu chí nghiệm thu liên quan trước khi sửa. Theo [quy ước nhánh, commit và PR](AGENTS.md#git-commit-và-pull-request) để truy vết thay đổi về issue. `main` và `develop` hiện không có bảo vệ nhánh; nhóm vẫn kiểm tra và review thay đổi trước khi tích hợp.

BA Done thể hiện đặc tả đã chốt, không có nghĩa Task triển khai hoặc sản phẩm đã hoàn thành. Cập nhật tiến độ theo kết quả thực tế.

## Bảo mật

Các file `.env` và `.local/` chỉ giữ trên máy. Chỉ commit mẫu trống; không đưa mật khẩu, token hoặc khóa thật vào mã, log, ảnh chụp hay issue. Biến `VITE_*` và `NEXT_PUBLIC_*` là công khai trên trình duyệt; khóa đặc quyền Supabase, LiveKit và SMTP chỉ được sử dụng phía server hoặc trong công cụ riêng.

## Giấy phép

Dự án chưa chọn giấy phép phân phối. Giấy phép của thư viện, font và tài nguyên bên thứ ba phải được giữ kèm khi sử dụng.
