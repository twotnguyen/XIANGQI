# DANH SÁCH 138 ISSUE

**Trạng thái:** `TODO` · `IN_PROGRESS` · `DONE` · `BLOCKED` · `BLOCKED_EXTERNAL`
Cập nhật cột trạng thái sau mỗi lần merge. Chọn TODO nhỏ nhất có mọi dependency DONE/đã merge (DAG), không buộc thứ tự số. Bootstrap/local/external theo [execution-milestones](execution-milestones.md).

---

## E00 — NỀN TẢNG (001–005)

| # | Issue | Phụ thuộc | TT |
|---|---|---|---|
| 001 | [Khởi tạo monorepo pnpm + TypeScript strict](ISSUE-001.md) | — | TODO |
| 002 | [ESLint + Prettier + quy ước mã](ISSUE-002.md) | 001 | TODO |
| 003 | [Vitest + cấu trúc test unit](ISSUE-003.md) | 002 | TODO |
| 004 | [Playwright + cấu trúc e2e](ISSUE-004.md) | 003 | TODO |
| 005 | [CI pipeline 4 cổng](ISSUE-005.md) | 002, 003, 004 | TODO |

## E01 — CONTRACTS (006–011)

| # | Issue | Phụ thuộc | TT |
|---|---|---|---|
| 006 | [Kiểu lõi bàn cờ](ISSUE-006.md) | 003 | TODO |
| 007 | [Hệ toạ độ + chuyển đổi](ISSUE-007.md) | 006 | TODO |
| 008 | [Kiểu ván cờ](ISSUE-008.md) | 006, 010 | TODO |
| 009 | [Kiểu phòng · thành viên · lời mời](ISSUE-009.md) | 006, 008 | TODO |
| 010 | [Kiểu chat · media · AI](ISSUE-010.md) | 006 | TODO |
| 011 | [Schema Zod + mã lỗi](ISSUE-011.md) | 008, 009, 010 | TODO |

## E02 — LUẬT CỜ ⭐ (012–025)

| # | Issue | Phụ thuộc | TT |
|---|---|---|---|
| 012 | [Thế cờ ban đầu + makePosition](ISSUE-012.md) | 007 | TODO |
| 013 | [Khoá thế cờ cho luật lặp](ISSUE-013.md) | 012 | TODO |
| 014 | [Hình học tấn công](ISSUE-014.md) | 012 | TODO |
| 015 | [Nước đi Tướng + Sĩ](ISSUE-015.md) | 014 | TODO |
| 016 | [Nước đi Tượng](ISSUE-016.md) | 014 | TODO |
| 017 | [Nước đi Mã](ISSUE-017.md) | 014 | TODO |
| 018 | [Nước đi Xe](ISSUE-018.md) | 014 | TODO |
| 019 | [Nước đi Pháo](ISSUE-019.md) | 014 | TODO |
| 020 | [Nước đi Tốt](ISSUE-020.md) | 014 | TODO |
| 021 | [Luật tướng đối mặt](ISSUE-021.md) | 015 | TODO |
| 022 | [Cấm tự chiếu + lọc nước hợp lệ](ISSUE-022.md) | 015–021 | TODO |
| 023 | [applyMove + validateMove](ISSUE-023.md) | 022 | TODO |
| 024 | [Kết thúc: chiếu hết / hết nước](ISSUE-024.md) | 023, 008 | TODO |
| 025 | [Đếm lặp 3 lần](ISSUE-025.md) | 013, 024 | TODO |

## E03 — AI CƠ SỞ ⛔ (026–033)

| # | Issue | Phụ thuộc | TT |
|---|---|---|---|
| 026 | [Lượng giá vật chất + bảng vị trí](ISSUE-026.md) | 025 | TODO |
| 027 | [Lượng giá linh hoạt + an toàn tướng](ISSUE-027.md) | 026 | TODO |
| 028 | [Sắp xếp nước đi MVV-LVA](ISSUE-028.md) | 027 | TODO |
| 029 | [Minimax / negamax cơ sở](ISSUE-029.md) | 027, 028, 010 | TODO |
| 030 | [Alpha-beta pruning](ISSUE-030.md) | 028, 029 | TODO |
| 031 | [Đào sâu dần + deadline + huỷ](ISSUE-031.md) | 030 | TODO |
| **032** | [⛔ **CỔNG ĐO depth 6 / 3000 ms**](ISSUE-032.md) | 031 | TODO |
| 033 | [Bộ 20 thế cờ + oracle review tay](ISSUE-033.md) | 032 | TODO |

## E04 — CƠ SỞ DỮ LIỆU (034–045)

| # | Issue | Phụ thuộc | TT |
|---|---|---|---|
| 034 | [Supabase local + biến môi trường](ISSUE-034.md) | 005 | TODO |
| 035 | [Migration: profiles + trigger](ISSUE-035.md) | 034 | TODO |
| 036 | [Migration: bạn bè](ISSUE-036.md) | 035 | TODO |
| 037 | [Migration: phòng · thành viên · danh sách chặn](ISSUE-037.md) | 035 | TODO |
| 038 | [Migration: ván · cây nước đi · sự kiện](ISSUE-038.md) | 037 | TODO |
| 039 | [Migration: biên lai lệnh · đề nghị](ISSUE-039.md) | 038 | TODO |
| 040 | [Migration: chat 2 kênh](ISSUE-040.md) | 038 | TODO |
| 041 | [Migration: media](ISSUE-041.md) | 038 | TODO |
| 042 | [Migration: AI jobs · client controls](ISSUE-042.md) | 038 | TODO |
| 043 | [RLS + grants + vai trò app_server](ISSUE-043.md) | 035–042 | TODO |
| 044 | [Harness test tích hợp THẬT](ISSUE-044.md) | 043 | TODO |
| 045 | [Prisma db pull + sinh client](ISSUE-045.md) | 043 | TODO |

## E05 — TÀI KHOẢN (046–055)

| # | Issue | Phụ thuộc | TT |
|---|---|---|---|
| 046 | [Xác thực JWT + guard](ISSUE-046.md) | 044, 011 | TODO |
| 047 | [Đăng ký username + email](ISSUE-047.md) | 046 | TODO |
| 048 | [Xác minh email](ISSUE-048.md) | 047 | TODO |
| 049 | [Đăng nhập bằng username](ISSUE-049.md) | 048 | TODO |
| 050 | [Phiên + ghi nhớ đăng nhập 30 ngày](ISSUE-050.md) | 049 | TODO |
| 051 | [Đăng xuất thiết bị này / mọi thiết bị](ISSUE-051.md) | 050 | TODO |
| 052 | [Quên mật khẩu + đặt lại](ISSUE-052.md) | 051 | TODO |
| 053 | [Google OAuth + callback](ISSUE-053.md) | 049, 052, 055 | TODO |
| 054 | [Onboarding chọn username](ISSUE-054.md) | 049 | TODO |
| 055 | [Giao diện tài khoản](ISSUE-055.md) | 050, 052, 054 | TODO |

## E06 — HỒ SƠ & BẠN BÈ (056–060)

| # | Issue | Phụ thuộc | TT |
|---|---|---|---|
| 056 | [Hồ sơ + sửa tên hiển thị](ISSUE-056.md) | 055 | TODO |
| 057 | [Tìm người dùng](ISSUE-057.md) | 056 | TODO |
| 058 | [Kết bạn: gửi · chấp nhận · từ chối · huỷ](ISSUE-058.md) | 057 | TODO |
| 059 | [Presence online](ISSUE-059.md) | 058, 084 | TODO |
| 060 | [Giao diện bạn bè](ISSUE-060.md) | 059 | TODO |

## E07 — PHÒNG (061–067)

| # | Issue | Phụ thuộc | TT |
|---|---|---|---|
| 061 | [Tạo phòng + chế độ riêng tư](ISSUE-061.md) | 055, 040 | TODO |
| 062 | [Sảnh + phân trang + lọc trạng thái](ISSUE-062.md) | 061, 084 | TODO |
| 063 | [Vào ghế chơi + trần sức chứa (khoá)](ISSUE-063.md) | 061, 040 | TODO |
| 064 | [Sẵn sàng + bắt đầu ván](ISSUE-064.md) | 063, 039, 040, 095 | TODO |
| 065 | [Rời phòng + đóng phòng](ISSUE-065.md) | 064, 089 | TODO |
| 066 | [Đổi cài đặt + thu hồi người xem](ISSUE-066.md) | 065, 039, 062 | TODO |
| 067 | [Giao diện sảnh · tạo phòng · phòng chờ](ISSUE-067.md) | 066 | TODO |

## E08 — MỜI (068–072)

| # | Issue | Phụ thuộc | TT |
|---|---|---|---|
| 068 | [Mã phòng 8 ký tự + HMAC](ISSUE-068.md) | 063, 066 | TODO |
| 069 | [Link mời + token](ISSUE-069.md) | 068 | TODO |
| 070 | [Lời mời trực tiếp cho bạn bè](ISSUE-070.md) | 069, 058 | TODO |
| 071 | [Hộp thư lời mời — R19](ISSUE-071.md) | 070 | TODO |
| 072 | [Giao diện mời · nhập mã · hộp thư](ISSUE-072.md) | 071 | TODO |

## E09 — NGƯỜI XEM (073–077)

| # | Issue | Phụ thuộc | TT |
|---|---|---|---|
| 073 | [Vào xem + kiểm quyền theo chế độ](ISSUE-073.md) | 068, 069, 070 | TODO |
| 074 | [Trần 5 người + tranh chấp ghế](ISSUE-074.md) | 073 | TODO |
| 075 | [Thu hồi quyền hàng loạt](ISSUE-075.md) | 074, 066 | TODO |
| 076 | [Đuổi người xem + danh sách chặn — R18](ISSUE-076.md) | 075 | TODO |
| 077 | [Giao diện danh sách người xem](ISSUE-077.md) | 076 | TODO |

## E10 — BÀN CỜ UI (078–083)

| # | Issue | Phụ thuộc | TT |
|---|---|---|---|
| 078 | [Bàn cờ SVG 90 giao điểm](ISSUE-078.md) | 012, 004 | TODO |
| 079 | [Quân cờ + chữ Hán + nhãn trợ năng](ISSUE-079.md) | 078 | TODO |
| 080 | [Chọn quân + hiện đích hợp lệ](ISSUE-080.md) | 079, 023 | TODO |
| 081 | [Lật bàn theo phe](ISSUE-081.md) | 080 | TODO |
| 082 | [Điều khiển bằng bàn phím](ISSUE-082.md) | 081 | TODO |
| 083 | [Chuyển động nước đi](ISSUE-083.md) | 082 | TODO |

## E11 — VÁN ONLINE (084–091)

| # | Issue | Phụ thuộc | TT |
|---|---|---|---|
| 084 | [Socket.IO gateway + handshake](ISSUE-084.md) | 046, 063, 051, 052 | TODO |
| 085 | [Đường xử lý lệnh + thứ tự khoá](ISSUE-085.md) | 084 | TODO |
| 086 | [Biên lai lệnh chống gửi trùng](ISSUE-086.md) | 085 | TODO |
| 087 | [Đi nước + phiên bản + sự kiện](ISSUE-087.md) | 086, 023 | TODO |
| 088 | [Cây nước đi + nhánh hiệu lực](ISSUE-088.md) | 087 | TODO |
| 089 | [Finalizer kết thúc ván](ISSUE-089.md) | 088, 024 | TODO |
| 090 | [Đồng bộ lại + snapshot](ISSUE-090.md) | 089 | TODO |
| 091 | [Giao diện ván online realtime](ISSUE-091.md) | 090, 083 | TODO |

## E12 — ĐỒNG HỒ (092–094)

| # | Issue | Phụ thuộc | TT |
|---|---|---|---|
| 092 | [Đồng hồ: cấu hình + tính toán](ISSUE-092.md) | 087 | TODO |
| 093 | [Bộ đếm hết giờ](ISSUE-093.md) | 092, 089 | TODO |
| 094 | [Hiển thị đồng hồ](ISSUE-094.md) | 093, 091 | TODO |

## E13 — MẤT KẾT NỐI (095–099)

| # | Issue | Phụ thuộc | TT |
|---|---|---|---|
| 095 | [Heartbeat + presence trong ván](ISSUE-095.md) | 084 | TODO |
| 096 | [Ân hạn 60 giây + kết quả](ISSUE-096.md) | 095, 093 | TODO |
| 097 | [Cả hai offline + khởi động lại máy chủ](ISSUE-097.md) | 096 | TODO |
| 098 | [Nhiều tab đồng bộ](ISSUE-098.md) | 097, 101, 106, 110, 127 | TODO |
| 099 | [Camera/mic chỉ một tab](ISSUE-099.md) | 098, 116 | TODO |

## E14 — CHỐNG TREO VÁN ⭐ R17 (100–103)

| # | Issue | Phụ thuộc | TT |
|---|---|---|---|
| 100 | [Bộ đếm treo ván + trạng thái](ISSUE-100.md) | 096 | TODO |
| 101 | [Xác nhận + gia hạn tối đa 2 lần](ISSUE-101.md) | 100 | TODO |
| 102 | [Đếm ngược 30 giây + kết thúc INACTIVITY](ISSUE-102.md) | 101 | TODO |
| 103 | [Giao diện treo ván cho cả 3 phía](ISSUE-103.md) | 102, 091, 094, 104 | TODO |

## E15 — THAO TÁC TRONG VÁN (104–107)

| # | Issue | Phụ thuộc | TT |
|---|---|---|---|
| 104 | [Đầu hàng](ISSUE-104.md) | 089, 093, 065 | TODO |
| 105 | [Đề nghị hoà / đi lại + hết hạn 30 giây](ISSUE-105.md) | 104 | TODO |
| 106 | [Đi lại: dựng lại bàn cờ + đếm lặp](ISSUE-106.md) | 105, 088, 025, 100 | TODO |
| 107 | [Giao diện thao tác trong ván](ISSUE-107.md) | 106, 091 | TODO |

## E16 — CHAT (108–111)

| # | Issue | Phụ thuộc | TT |
|---|---|---|---|
| 108 | [Kênh riêng người chơi](ISSUE-108.md) | 084, 040, 066 | TODO |
| 109 | [Kênh chung — người chơi đọc và gửi](ISSUE-109.md) | 108, 073 | TODO |
| 110 | [Công tắc ẩn/hiện + lịch sử + phân trang](ISSUE-110.md) | 109, 075, 076, 090 | TODO |
| 111 | [Giao diện chat 2 khung](ISSUE-111.md) | 110, 091 | TODO |

## E17 — MEDIA ⛔ (112–117)

| # | Issue | Phụ thuộc | TT |
|---|---|---|---|
| **112** | [⛔ **LiveKit local + spike đo RTP thật**](ISSUE-112.md) | 005 | TODO |
| 113 | [Chính sách media + phiên bản](ISSUE-113.md) | 112, 041, 046 | TODO |
| 114 | [Cấp token + 4 phòng truyền](ISSUE-114.md) | 113, 084, 073 | TODO |
| 115 | [Thu hồi + xoay vòng thế hệ](ISSUE-115.md) | 114 | TODO |
| 116 | [Giao diện media](ISSUE-116.md) | 115, 091 | TODO |
| 117 | [Test media đo luồng thật](ISSUE-117.md) | 116, 076, 099 | TODO |

## E18 — AI HOÀN THIỆN (118–124)

| # | Issue | Phụ thuộc | TT |
|---|---|---|---|
| 118 | [Tiến trình AI riêng + IPC](ISSUE-118.md) | 032 | TODO |
| 119 | [Worker thread + cờ huỷ](ISSUE-119.md) | 118 | TODO |
| 120 | [Hàng đợi 2 chạy / 8 chờ](ISSUE-120.md) | 119 | TODO |
| 121 | [Tích hợp ván với máy](ISSUE-121.md) | 120, 093, 097 | TODO |
| 122 | [Đi lại với máy](ISSUE-122.md) | 121, 106 | TODO |
| 123 | [Giao diện chơi với máy](ISSUE-123.md) | 122, 091 | TODO |
| 124 | [Thí nghiệm 60 ván + báo cáo](ISSUE-124.md) | 123, 033 | TODO |

## E19 — LỊCH SỬ & TÁI ĐẤU (125–129)

| # | Issue | Phụ thuộc | TT |
|---|---|---|---|
| 125 | [Lịch sử ván + phân trang + quyền](ISSUE-125.md) | 121 | TODO |
| 126 | [Xem lại theo nhánh hiệu lực](ISSUE-126.md) | 125, 106 | TODO |
| 127 | [Tái đấu + phiếu + đổi bên](ISSUE-127.md) | 126, 065, 040 | TODO |
| 128 | [Bộ đếm đóng phòng 10 phút](ISSUE-128.md) | 127 | TODO |
| 129 | [Giao diện lịch sử · xem lại · kết quả](ISSUE-129.md) | 128 | TODO |

## E20 — HOÀN THIỆN (130–138)

| # | Issue | Phụ thuộc | TT |
|---|---|---|---|
| 130 | [Responsive 360 · 390 · 1366 · 1920](ISSUE-130.md) | 091, 111, 116, 055, 060, 067, 072, 077, 094, 099, 103, 107, 123, 129 | TODO |
| 131 | [Trợ năng + WCAG AA + DT-21](ISSUE-131.md) | 130 | TODO |
| 132 | [Trạng thái màn hình đầy đủ](ISSUE-132.md) | 131 | TODO |
| 133 | [Bảo mật: kiểm ma trận quyền](ISSUE-133.md) | 132 | TODO |
| 134 | [Giới hạn tần suất + kích thước](ISSUE-134.md) | 133 | TODO |
| 135 | [Thử tải 10 phòng / 70 kết nối](ISSUE-135.md) | 134, 124, 117 | TODO |
| 136 | [Nghiệm thu R01–R19](ISSUE-136.md) | 135, 124, 117, 098, 045 | TODO |
| 137 | [Triển khai Render + Vercel](ISSUE-137.md) | 136, 053 | TODO |
| 138 | [Bàn giao + hồ sơ bảo vệ](ISSUE-138.md) | 136 | TODO |

---

## THỐNG KÊ

| | |
|---|---|
| Tổng issue | **138** |
| Cổng chặn | **2** — issue 032 (AI) và 112 (media) |
| Issue chỉ backend | 61 |
| Issue chỉ giao diện | 27 |
| External nghiệm thu | 053 và137; local048/052/112–117 không cần cloud — xem [EXTERNAL-SETUP.md](EXTERNAL-SETUP.md) |
