# Đầu vào môi trường khi thực thi

Đây là checklist thiết lập, không phải câu hỏi nghiệp vụ còn bỏ ngỏ. Task mới kiểm tra tool/runtime có sẵn trước khi hỏi người dùng. Chỉ xin đầu vào lúc issue thực sự cần; không cần thu toàn bộ secrets trước ISSUE-001.

| Đầu vào | Issue cần | Khi chưa có |
|---|---|---|
| Node24/pnpm/Docker hoạt động |001/006/024| Kiểm tra và hướng dẫn/cài theo quyền môi trường; vẫn viết mã/unit độc lập nếu Docker chưa chạy |
| Google OAuth Web client và quyền cấu hình Supabase provider |008| Hoàn thiện code/CI callback tests/runbook; actual Google smoke BLOCKED_EXTERNAL |
| Trình duyệt/điện thoại có camera/mic |024/026/030| Dùng synthetic media cho automated; manual hardware gate ghi pending |
| HTTPS local tin cậy trên điện thoại |024/028| Hướng dẫn certificate/dev origin, không dùng HTTP IP LAN cho getUserMedia |
| Supabase cloud project |031| Local Supabase đã đáp ứng local tests; cloud migrations chưa chạy |
| Vercel/Render project được người dùng cấp |031| Tạo cấu hình/build/runbook, chưa deploy; không tạo paid resource |
| LiveKit Cloud credentials hoặc host media public đã được duyệt |031| Local SFU thật vẫn chạy; Internet relay smoke chờ tài nguyên |
| SMTP gửi cho user ngoài team |031| Local inbox test thật; production email không được tuyên bố hoạt động nếu dùng mock |
| Hai mạng riêng để test media/relay |031| Local/LAN report không thay Internet report |

Không dán secrets vào issue/report hoặc commit. Dùng env/config provider. File `.env.example` chỉ tên biến và sample không hợp lệ. Khi tạo external setup guide trong ISSUE-031, dùng tên biến cụ thể trong architecture và provider UI chính thức, không bắt người dùng cung cấp password tài khoản quản trị trong chat.

Ngân sách trả phí chưa được cấp. Nhà cung cấp thay đổi quota theo thời gian, phải kiểm tài liệu chính thức lúc deploy. Nếu gói miễn phí không đạt tải yêu cầu, báo số đo và lựa chọn cụ thể; không tự mua hoặc hạ nghiệm thu.
