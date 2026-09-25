# THỨ TỰ TRIỂN KHAI VÀ CỔNG TÍCH HỢP

**Nguồn:** dependency header của từng ISSUE; [INDEX](INDEX.md) lưu trạng thái. Bảng này là một thứ tự tuần tự hợp lệ, sinh bằng cách chọn số nhỏ nhất đang đủ dependency. Không suy thứ tự từ số issue tăng liên tục.

Chỉ bắt đầu khi dependency thực tế đã DONE/merge. Nếu053 bị BLOCKED_EXTERNAL, tiếp tục issue local đủ điều kiện ở phía sau; không bỏ qua dependency của chính issue đang làm. Không bắt buộc chạy song song. Sau mỗi PR kiểm lại INDEX thay vì dùng bảng như lịch cố định.

| Bước hợp lệ | Issue / nội dung | Phụ thuộc trực tiếp |
|---|---|---|
| 1 | [ISSUE-001 — Khởi tạo monorepo pnpm + TypeScript strict](ISSUE-001.md) | không có |
| 2 | [ISSUE-002 — ESLint + Prettier + quy ước mã](ISSUE-002.md) | 001 |
| 3 | [ISSUE-003 — Vitest + cấu trúc test unit](ISSUE-003.md) | 002 |
| 4 | [ISSUE-004 — Playwright + cấu trúc e2e](ISSUE-004.md) | 003 |
| 5 | [ISSUE-005 — CI pipeline 4 cổng](ISSUE-005.md) | 002, 003, 004 |
| 6 | [ISSUE-006 — Kiểu lõi bàn cờ](ISSUE-006.md) | 003 |
| 7 | [ISSUE-007 — Hệ toạ độ + hàm chuyển đổi](ISSUE-007.md) | 006 |
| 8 | [ISSUE-010 — Kiểu chat · media · AI](ISSUE-010.md) | 006 |
| 9 | [ISSUE-008 — Kiểu ván cờ](ISSUE-008.md) | 006, 010 |
| 10 | [ISSUE-009 — Kiểu phòng · thành viên · lời mời](ISSUE-009.md) | 006, 008 |
| 11 | [ISSUE-011 — Schema Zod + mã lỗi](ISSUE-011.md) | 008, 009, 010 |
| 12 | [ISSUE-012 — Thế cờ ban đầu + makePosition](ISSUE-012.md) | 007 |
| 13 | [ISSUE-013 — Khoá thế cờ cho luật lặp](ISSUE-013.md) | 012 |
| 14 | [ISSUE-014 — Hình học tấn công](ISSUE-014.md) | 012 |
| 15 | [ISSUE-015 — Nước đi Tướng + Sĩ](ISSUE-015.md) | 014 |
| 16 | [ISSUE-016 — Nước đi Tượng](ISSUE-016.md) | 014 |
| 17 | [ISSUE-017 — Nước đi Mã](ISSUE-017.md) | 014 |
| 18 | [ISSUE-018 — Nước đi Xe](ISSUE-018.md) | 014 |
| 19 | [ISSUE-019 — Nước đi Pháo](ISSUE-019.md) | 014 |
| 20 | [ISSUE-020 — Nước đi Tốt](ISSUE-020.md) | 014 |
| 21 | [ISSUE-021 — Luật tướng đối mặt](ISSUE-021.md) | 015 |
| 22 | [ISSUE-022 — Cấm tự chiếu + lọc nước hợp lệ](ISSUE-022.md) | 015–021 |
| 23 | [ISSUE-023 — applyMove + validateMove](ISSUE-023.md) | 022 |
| 24 | [ISSUE-024 — Kết thúc ván: chiếu hết / hết nước](ISSUE-024.md) | 023, 008 |
| 25 | [ISSUE-025 — Đếm lặp 3 lần](ISSUE-025.md) | 013, 024 |
| 26 | [ISSUE-026 — Lượng giá: vật chất + bảng vị trí](ISSUE-026.md) | 025 |
| 27 | [ISSUE-027 — Lượng giá: độ linh hoạt + an toàn tướng](ISSUE-027.md) | 026 |
| 28 | [ISSUE-028 — Sắp xếp thứ tự nước đi (MVV-LVA)](ISSUE-028.md) | 027 |
| 29 | [ISSUE-029 — Minimax / negamax cơ sở](ISSUE-029.md) | 027, 028, 010 |
| 30 | [ISSUE-030 — Alpha-beta pruning](ISSUE-030.md) | 028, 029 |
| 31 | [ISSUE-031 — Đào sâu dần + deadline + huỷ](ISSUE-031.md) | 030 |
| 32 | [ISSUE-032 — CỔNG ĐO AI: depth 6 trong 3000 ms](ISSUE-032.md) | 031 |
| 33 | [ISSUE-033 — Bộ 20 thế cờ + oracle review tay](ISSUE-033.md) | 032 |
| 34 | [ISSUE-034 — Supabase local + biến môi trường](ISSUE-034.md) | 005 |
| 35 | [ISSUE-035 — Migration: profiles + trigger](ISSUE-035.md) | 034 |
| 36 | [ISSUE-036 — Migration: bạn bè](ISSUE-036.md) | 035 |
| 37 | [ISSUE-037 — Migration: phòng · thành viên · danh sách chặn](ISSUE-037.md) | 035 |
| 38 | [ISSUE-038 — Migration: ván · cây nước đi · sự kiện](ISSUE-038.md) | 037 |
| 39 | [ISSUE-039 — Migration: biên lai lệnh · đề nghị](ISSUE-039.md) | 038 |
| 40 | [ISSUE-040 — Migration: vòng chat, nhóm người đọc và tin nhắn](ISSUE-040.md) | 038 |
| 41 | [ISSUE-041 — Migration: media](ISSUE-041.md) | 038 |
| 42 | [ISSUE-042 — Migration: AI jobs · client controls](ISSUE-042.md) | 038 |
| 43 | [ISSUE-043 — RLS + grants + vai trò app_server](ISSUE-043.md) | 035–042 |
| 44 | [ISSUE-044 — Harness test tích hợp THẬT](ISSUE-044.md) | 043 |
| 45 | [ISSUE-045 — Prisma db pull + sinh client](ISSUE-045.md) | 043 |
| 46 | [ISSUE-046 — Xác thực JWT + guard](ISSUE-046.md) | 044, 011 |
| 47 | [ISSUE-047 — Đăng ký username + email](ISSUE-047.md) | 046 |
| 48 | [ISSUE-048 — Xác minh email](ISSUE-048.md) | 047 |
| 49 | [ISSUE-049 — Đăng nhập bằng username](ISSUE-049.md) | 048 |
| 50 | [ISSUE-050 — Phiên + ghi nhớ đăng nhập 30 ngày](ISSUE-050.md) | 049 |
| 51 | [ISSUE-051 — Đăng xuất thiết bị này / mọi thiết bị](ISSUE-051.md) | 050 |
| 52 | [ISSUE-052 — Quên mật khẩu + đặt lại](ISSUE-052.md) | 051 |
| 53 | [ISSUE-054 — Onboarding chọn username](ISSUE-054.md) | 049 |
| 54 | [ISSUE-055 — Giao diện tài khoản](ISSUE-055.md) | 050, 052, 054 |
| 55 | [ISSUE-053 — Google OAuth + callback](ISSUE-053.md) | 049, 052, 055 |
| 56 | [ISSUE-056 — Hồ sơ + sửa tên hiển thị](ISSUE-056.md) | 055 |
| 57 | [ISSUE-057 — Tìm người dùng](ISSUE-057.md) | 056 |
| 58 | [ISSUE-058 — Kết bạn: gửi · chấp nhận · từ chối · huỷ](ISSUE-058.md) | 057 |
| 59 | [ISSUE-061 — Tạo phòng + chế độ riêng tư](ISSUE-061.md) | 055, 040 |
| 60 | [ISSUE-063 — Vào ghế chơi + trần sức chứa (khoá)](ISSUE-063.md) | 061, 040 |
| 61 | [ISSUE-078 — Bàn cờ SVG 90 giao điểm](ISSUE-078.md) | 012, 004 |
| 62 | [ISSUE-079 — Quân cờ + chữ Hán + nhãn trợ năng](ISSUE-079.md) | 078 |
| 63 | [ISSUE-080 — Chọn quân + hiện đích hợp lệ](ISSUE-080.md) | 079, 023 |
| 64 | [ISSUE-081 — Lật bàn theo phe](ISSUE-081.md) | 080 |
| 65 | [ISSUE-082 — Điều khiển bằng bàn phím](ISSUE-082.md) | 081 |
| 66 | [ISSUE-083 — Chuyển động nước đi](ISSUE-083.md) | 082 |
| 67 | [ISSUE-084 — Socket.IO gateway + handshake](ISSUE-084.md) | 046, 063, 051, 052 |
| 68 | [ISSUE-059 — Presence online](ISSUE-059.md) | 058, 084 |
| 69 | [ISSUE-060 — Giao diện bạn bè](ISSUE-060.md) | 059 |
| 70 | [ISSUE-062 — Sảnh + phân trang + lọc trạng thái](ISSUE-062.md) | 061, 084 |
| 71 | [ISSUE-085 — Đường xử lý lệnh + thứ tự khoá](ISSUE-085.md) | 084 |
| 72 | [ISSUE-086 — Biên lai lệnh chống gửi trùng](ISSUE-086.md) | 085 |
| 73 | [ISSUE-087 — Đi nước + phiên bản + sự kiện](ISSUE-087.md) | 086, 023 |
| 74 | [ISSUE-088 — Cây nước đi + nhánh hiệu lực](ISSUE-088.md) | 087 |
| 75 | [ISSUE-089 — Finalizer kết thúc ván](ISSUE-089.md) | 088, 024 |
| 76 | [ISSUE-090 — Đồng bộ lại + snapshot](ISSUE-090.md) | 089 |
| 77 | [ISSUE-091 — Giao diện ván online thời gian thực](ISSUE-091.md) | 090, 083 |
| 78 | [ISSUE-092 — Đồng hồ: cấu hình + tính toán](ISSUE-092.md) | 087 |
| 79 | [ISSUE-093 — Bộ đếm hết giờ](ISSUE-093.md) | 092, 089 |
| 80 | [ISSUE-094 — Hiển thị đồng hồ](ISSUE-094.md) | 093, 091 |
| 81 | [ISSUE-095 — Heartbeat + presence trong ván](ISSUE-095.md) | 084 |
| 82 | [ISSUE-064 — Sẵn sàng + bắt đầu ván](ISSUE-064.md) | 063, 039, 040, 095 |
| 83 | [ISSUE-065 — Rời phòng + đóng phòng](ISSUE-065.md) | 064, 089 |
| 84 | [ISSUE-066 — Đổi cài đặt + thu hồi người xem](ISSUE-066.md) | 065, 039, 062 |
| 85 | [ISSUE-067 — Giao diện sảnh · tạo phòng · phòng chờ](ISSUE-067.md) | 066 |
| 86 | [ISSUE-068 — Mã phòng 8 ký tự + HMAC](ISSUE-068.md) | 063, 066 |
| 87 | [ISSUE-069 — Link mời + token](ISSUE-069.md) | 068 |
| 88 | [ISSUE-070 — Lời mời trực tiếp cho bạn bè](ISSUE-070.md) | 069, 058 |
| 89 | [ISSUE-071 — Hộp thư lời mời (R19)](ISSUE-071.md) | 070 |
| 90 | [ISSUE-072 — Giao diện mời · nhập mã · hộp thư](ISSUE-072.md) | 071 |
| 91 | [ISSUE-073 — Vào xem + kiểm quyền theo chế độ](ISSUE-073.md) | 068, 069, 070 |
| 92 | [ISSUE-074 — Trần 5 người xem + tranh chấp ghế](ISSUE-074.md) | 073 |
| 93 | [ISSUE-075 — Thu hồi quyền hàng loạt](ISSUE-075.md) | 074, 066 |
| 94 | [ISSUE-076 — Đuổi người xem + danh sách chặn (R18)](ISSUE-076.md) | 075 |
| 95 | [ISSUE-077 — Giao diện danh sách người xem](ISSUE-077.md) | 076 |
| 96 | [ISSUE-096 — Ân hạn 60 giây + kết quả](ISSUE-096.md) | 095, 093 |
| 97 | [ISSUE-097 — Cả hai offline + khởi động lại máy chủ](ISSUE-097.md) | 096 |
| 98 | [ISSUE-100 — Bộ đếm treo ván + trạng thái](ISSUE-100.md) | 096 |
| 99 | [ISSUE-101 — Xác nhận + gia hạn tối đa 2 lần](ISSUE-101.md) | 100 |
| 100 | [ISSUE-102 — Đếm ngược 30 giây + kết thúc INACTIVITY](ISSUE-102.md) | 101 |
| 101 | [ISSUE-104 — Đầu hàng](ISSUE-104.md) | 089, 093, 065 |
| 102 | [ISSUE-103 — Giao diện treo ván cho cả 3 phía](ISSUE-103.md) | 102, 091, 094, 104 |
| 103 | [ISSUE-105 — Đề nghị hoà / đi lại + hết hạn 30 giây](ISSUE-105.md) | 104 |
| 104 | [ISSUE-106 — Đi lại: dựng lại bàn cờ + đếm lặp](ISSUE-106.md) | 105, 088, 025, 100 |
| 105 | [ISSUE-107 — Giao diện thao tác trong ván](ISSUE-107.md) | 106, 091 |
| 106 | [ISSUE-108 — Kênh riêng người chơi](ISSUE-108.md) | 084, 040, 066 |
| 107 | [ISSUE-109 — Kênh chung: người chơi đọc và gửi](ISSUE-109.md) | 108, 073 |
| 108 | [ISSUE-110 — Công tắc ẩn/hiện + lịch sử + phân trang](ISSUE-110.md) | 109, 075, 076, 090 |
| 109 | [ISSUE-111 — Giao diện chat 2 khung](ISSUE-111.md) | 110, 091 |
| 110 | [ISSUE-112 — CỔNG MEDIA: LiveKit local + đo RTP thật](ISSUE-112.md) | 005 |
| 111 | [ISSUE-113 — Chính sách media + phiên bản](ISSUE-113.md) | 112, 041, 046 |
| 112 | [ISSUE-114 — Cấp token + 4 phòng truyền](ISSUE-114.md) | 113, 084, 073 |
| 113 | [ISSUE-115 — Thu hồi + xoay vòng thế hệ](ISSUE-115.md) | 114 |
| 114 | [ISSUE-116 — Giao diện media](ISSUE-116.md) | 115, 091 |
| 115 | [ISSUE-118 — Tiến trình AI riêng + IPC](ISSUE-118.md) | 032 |
| 116 | [ISSUE-119 — Worker thread + cờ huỷ](ISSUE-119.md) | 118 |
| 117 | [ISSUE-120 — Hàng đợi 2 chạy / 8 chờ](ISSUE-120.md) | 119 |
| 118 | [ISSUE-121 — Tích hợp ván với máy](ISSUE-121.md) | 120, 093, 097 |
| 119 | [ISSUE-122 — Đi lại với máy](ISSUE-122.md) | 121, 106 |
| 120 | [ISSUE-123 — Giao diện chơi với máy](ISSUE-123.md) | 122, 091 |
| 121 | [ISSUE-124 — Thí nghiệm 60 ván + báo cáo](ISSUE-124.md) | 123, 033 |
| 122 | [ISSUE-125 — Lịch sử ván + phân trang + quyền](ISSUE-125.md) | 121 |
| 123 | [ISSUE-126 — Xem lại theo nhánh hiệu lực](ISSUE-126.md) | 125, 106 |
| 124 | [ISSUE-127 — Tái đấu + phiếu + đổi bên](ISSUE-127.md) | 126, 065, 040 |
| 125 | [ISSUE-098 — Nhiều tab đồng bộ](ISSUE-098.md) | 097, 101, 106, 110, 127 |
| 126 | [ISSUE-099 — Camera/mic chỉ một tab](ISSUE-099.md) | 098, 116 |
| 127 | [ISSUE-117 — Test media đo luồng thật](ISSUE-117.md) | 116, 076, 099 |
| 128 | [ISSUE-128 — Bộ đếm đóng phòng 10 phút](ISSUE-128.md) | 127 |
| 129 | [ISSUE-129 — Giao diện lịch sử · xem lại · kết quả](ISSUE-129.md) | 128 |
| 130 | [ISSUE-130 — Responsive 360 · 390 · 1366 · 1920](ISSUE-130.md) | 091, 111, 116, 055, 060, 067, 072, 077, 094, 099, 103, 107, 123, 129 |
| 131 | [ISSUE-131 — Trợ năng + WCAG AA + DT-21](ISSUE-131.md) | 130 |
| 132 | [ISSUE-132 — Trạng thái màn hình đầy đủ](ISSUE-132.md) | 131 |
| 133 | [ISSUE-133 — Bảo mật: kiểm ma trận quyền](ISSUE-133.md) | 132 |
| 134 | [ISSUE-134 — Giới hạn tần suất + kích thước](ISSUE-134.md) | 133 |
| 135 | [ISSUE-135 — Thử tải 10 phòng / 70 kết nối](ISSUE-135.md) | 134, 124, 117 |
| 136 | [ISSUE-136 — Nghiệm thu R01–R19](ISSUE-136.md) | 135, 124, 117, 098, 045 |
| 137 | [ISSUE-137 — Triển khai Render + Vercel](ISSUE-137.md) | 136, 053 |
| 138 | [ISSUE-138 — Bàn giao + hồ sơ bảo vệ](ISSUE-138.md) | 136 |

## Cổng kiểm chứng xuyên issue

Một issue nền tảng có thể kiểm invariant DB/hàm trước khi UI, socket hoặc media được xây. Điều này phải ghi rõ ngay trong test/PASS của issue sớm. Bảng dưới giao đích kiểm chức năng hoàn chỉnh; không cho phép dùng spy hay fixture tự dựng để gọi tích hợp đã đạt.

| Khả năng sớm | Bằng chứng khi đã có đủ chức năng |
|---|---|
| Auth/session046–055; callback giữ join intent |084 tái kiểm HTTP/socket hết hạn;069/070 join thật sau callback;117 thu hồi SFU sau logout;053/137 provider Internet |
| Create061, membership063–066, invitation storage037 và API068–070 |062 socket sảnh;064 ready/start;073 admission mọi locator;090 quyền snapshot;110 chặn delivery/history;117 chặn media |
| Leave/kick065/076 và đổi quyền066/075 |104 đầu hàng thật khi rời ván;110 transport chat;117 revoke SFU với byte/frame;133 rà toàn đường vào |
| Command transaction085, move087, finalizer089 |093 race timeout;104 race timer với endpoint resign;097 recovery;136 kịch bản kết thúc xuyên chức năng |
| Disconnect096–098, prompt100–103 |102 khôi phục deadline sau reconnect;103 UI nonmodal;099 chuyển media owner theo nguồn;117 kiểm SFU |
| Chat context040/061, send108/109 |110 delivery/history không leak;127 tái đấu thật thay context, giữ quyền segment cũ |
| Media112–116 |117 ma trận revoke/reconnect/multi-tab bằng SFU thật;137 hai thiết bị/hai mạng + Cloud semantics |
| AI026–033, worker118–123 |032 cổng depth/latency;124 oracle chất lượng/60 ván;135 tải đồng thời;137 đo lại môi trường Internet |
| Từng module/AC local |136 tổng hợp333 AC theo môi trường, mọi AC local có bằng chứng;053/137 hoàn tất external;138 bàn giao được cập nhật cuối |

## Hoàn thành

138 có thể bàn giao hồ sơ local trước137 theo DEC-047. Toàn dự án chỉ hoàn thành khi mọi138 issue đã DONE, AC bắt buộc đều có kết quả đạt cho môi trường tương ứng và các cổng ngoài AC tại [AC-COVERAGE](AC-COVERAGE.md) đã chứng minh. Bảng thứ tự không phải bằng chứng test hoặc tiến độ.
