# 02 — RÀ SOÁT 138 ISSUE ĐẶC TẢ: CÓ CHỒNG LẤN VAI TRÒ KHÔNG?

**Ngày rà:** 2026-09-26 · **Nguồn:** `docs/10-issues/ISSUE-001.md` … `ISSUE-138.md` (mục FILE TẠO/SỬA, CÁC BƯỚC, TEST BẮT BUỘC)
**Cách rà:** đọc từng issue, xác định mã sẽ nằm ở đâu (`apps/web` = Frontend · `apps/server`, `packages/contracts`, `packages/game-rules`, `supabase/migrations` = Backend · `packages/ai`, `apps/ai-worker` = AI · công cụ/CI/hạ tầng/triển khai = DevOps · thiết kế = Design · kiểm chứng độc lập = Tester), rồi so với yêu cầu "mỗi Task đúng một vai trò".

## 1. KẾT LUẬN NHANH

| Phát hiện | Số issue | Ý nghĩa |
|---|---:|---|
| **Mọi issue gộp "viết mã + tự kiểm thử + ghi bằng chứng" trong một đầu việc** | **138/138** | Bộ 138 issue viết cho *coding agent* (một PR làm hết). Với nhóm người, phần **kiểm chứng độc lập** do Tester làm: mỗi Task phát triển trong kế hoạch mới có mục **🧪 Kiểm thử khi Ready for Test** (Tester kiểm khi Task được kéo sang `Ready For Test`); phần kiểm **nhiều Task/toàn hệ thống** thành 20 Task `[QA]` riêng |
| **Gộp từ 2 vai trò phát triển trở lên trong cùng một issue** | **19** | Ví dụ 047/049/050/054/056/069/099/110 sửa cả `apps/web` lẫn `apps/server`; 034, 053, 112, 120, 135, 137, 138 gộp DevOps/AI/Backend/Frontend. Đã tách thành Task riêng từng vai trò |
| **Không có issue nào cho Design** | 0 issue Design | Thiết kế màn hình, trạng thái, bàn cờ chưa được giao cho ai ⇒ bổ sung Epic **EP02** (4 Story, 7 Task Design) + 1 Task Design rà khớp sản phẩm (TK16.2.4) |
| **Phân vai cũ sai** | 003, 004, 044 xếp "Tester" nhưng là mã công cụ/harness; 048, 052 xếp Backend dù mã chính ở web | Đã xếp lại theo nội dung công việc |
| **Phụ thuộc nối tiếp được giữ đúng thứ tự** | — | Mọi quan hệ "đầu ra A là đầu vào B" được đặt `Blocks`; không để song song. Một số phụ thuộc trong đặc tả **thừa về kỹ thuật** đã được nới để vừa 4 tuần — xem [01-KE-HOACH-4-TUAN.md §7](01-KE-HOACH-4-TUAN.md) |

## 2. BẢNG CHI TIẾT 138 ISSUE

Cột "Chồng lấn": vai trò **phát triển** có trong issue gốc (chưa tính phần kiểm thử mà mọi issue đều gộp). Cột "Task mới": các Task trong kế hoạch Jira truy về issue đó (một Task có thể gom nhiều issue nhỏ cùng vai trò). 🧪 = Task có mục kiểm thử do Tester làm ở bước Ready For Test; `[QA]` = Task Tester tích hợp riêng.

| Issue | Nhóm | Tên | Chồng lấn vai trò trong issue gốc | Story mới | Task mới (vai trò) | Ghi chú cách tách |
|---|---|---|---|---|---|---|
| 001 | E00 | Khởi tạo monorepo pnpm + TypeScript strict | Không — 1 vai trò (DevOps) + phần kiểm thử | ST01.1 | TK01.1.1 [OPS] 🧪, TK01.1.5 [QA] | Tạo khung 6 package (gồm cả web, server, ai-worker) nhưng chỉ là việc dựng kho mã ⇒ xếp DevOps; kiểm chứng tách sang Tester. |
| 002 | E00 | ESLint + Prettier + quy ước mã | Không — 1 vai trò (DevOps) + phần kiểm thử | ST01.1 | TK01.1.2 [OPS] 🧪, TK01.1.5 [QA] |  |
| 003 | E00 | Vitest + cấu trúc test unit | Không — 1 vai trò (DevOps) + phần kiểm thử | ST01.1 | TK01.1.3 [OPS] 🧪 | Gốc xếp "Tester"; thực chất là cấu hình công cụ ⇒ DevOps làm, Tester kiểm chứng. |
| 004 | E00 | Playwright + cấu trúc e2e | Không — 1 vai trò (DevOps) + phần kiểm thử | ST01.1 | TK01.1.4 [OPS] 🧪 | Gốc xếp "Tester"; cấu hình Playwright ⇒ DevOps làm, Tester kiểm chứng (Tester là người dùng chính của công cụ). |
| 005 | E00 | CI pipeline 4 cổng | Không — 1 vai trò (DevOps) + phần kiểm thử | ST01.2 | TK01.2.1 [OPS] 🧪 |  |
| 006 | E01 | Kiểu lõi bàn cờ | Không — 1 vai trò (Backend) + phần kiểm thử | ST03.1 | TK03.1.1 [BE] 🧪 |  |
| 007 | E01 | Hệ toạ độ + hàm chuyển đổi | Không — 1 vai trò (Backend) + phần kiểm thử | ST03.1 | TK03.1.1 [BE] 🧪 |  |
| 008 | E01 | Kiểu ván cờ | Không — 1 vai trò (Backend) + phần kiểm thử | ST03.1 | TK03.1.2 [BE] 🧪 |  |
| 009 | E01 | Kiểu phòng · thành viên · lời mời | Không — 1 vai trò (Backend) + phần kiểm thử | ST03.1 | TK03.1.2 [BE] 🧪 |  |
| 010 | E01 | Kiểu chat · media · AI | Không — 1 vai trò (Backend) + phần kiểm thử | ST03.1 | TK03.1.2 [BE] 🧪 |  |
| 011 | E01 | Schema Zod + mã lỗi | Không — 1 vai trò (Backend) + phần kiểm thử | ST03.1 | TK03.1.2 [BE] 🧪 |  |
| 012 | E02 | Thế cờ ban đầu + makePosition | Không — 1 vai trò (Backend) + phần kiểm thử | ST03.2 | TK03.2.1 [BE] 🧪 |  |
| 013 | E02 | Khoá thế cờ cho luật lặp | Không — 1 vai trò (Backend) + phần kiểm thử | ST03.2 | TK03.2.1 [BE] 🧪 |  |
| 014 | E02 | Hình học tấn công | Không — 1 vai trò (Backend) + phần kiểm thử | ST03.2 | TK03.2.1 [BE] 🧪 |  |
| 015 | E02 | Nước đi Tướng + Sĩ | Không — 1 vai trò (Backend) + phần kiểm thử | ST03.2 | TK03.2.2 [BE] 🧪 |  |
| 016 | E02 | Nước đi Tượng | Không — 1 vai trò (Backend) + phần kiểm thử | ST03.2 | TK03.2.2 [BE] 🧪 |  |
| 017 | E02 | Nước đi Mã | Không — 1 vai trò (Backend) + phần kiểm thử | ST03.2 | TK03.2.3 [BE] 🧪 |  |
| 018 | E02 | Nước đi Xe | Không — 1 vai trò (Backend) + phần kiểm thử | ST03.2 | TK03.2.3 [BE] 🧪 |  |
| 019 | E02 | Nước đi Pháo | Không — 1 vai trò (Backend) + phần kiểm thử | ST03.2 | TK03.2.3 [BE] 🧪 |  |
| 020 | E02 | Nước đi Tốt | Không — 1 vai trò (Backend) + phần kiểm thử | ST03.2 | TK03.2.2 [BE] 🧪 |  |
| 021 | E02 | Luật tướng đối mặt | Không — 1 vai trò (Backend) + phần kiểm thử | ST03.3 | TK03.3.1 [BE] 🧪 |  |
| 022 | E02 | Cấm tự chiếu + lọc nước hợp lệ | Không — 1 vai trò (Backend) + phần kiểm thử | ST03.3 | TK03.3.1 [BE] 🧪 |  |
| 023 | E02 | applyMove + validateMove | Không — 1 vai trò (Backend) + phần kiểm thử | ST03.3 | TK03.3.2 [BE] 🧪 |  |
| 024 | E02 | Kết thúc ván: chiếu hết / hết nước | Không — 1 vai trò (Backend) + phần kiểm thử | ST03.3 | TK03.3.3 [BE] 🧪 |  |
| 025 | E02 | Đếm lặp 3 lần | Không — 1 vai trò (Backend) + phần kiểm thử | ST03.3 | TK03.3.3 [BE] 🧪 |  |
| 026 | E03 | Lượng giá: vật chất + bảng vị trí | Không — 1 vai trò (AI) + phần kiểm thử | ST04.1 | TK04.1.1 [AI] 🧪 |  |
| 027 | E03 | Lượng giá: độ linh hoạt + an toàn tướng | Không — 1 vai trò (AI) + phần kiểm thử | ST04.1 | TK04.1.1 [AI] 🧪 |  |
| 028 | E03 | Sắp xếp thứ tự nước đi (MVV-LVA) | Không — 1 vai trò (AI) + phần kiểm thử | ST04.1 | TK04.1.2 [AI] 🧪 |  |
| 029 | E03 | Minimax / negamax cơ sở | Không — 1 vai trò (AI) + phần kiểm thử | ST04.2 | TK04.2.1 [AI] 🧪 |  |
| 030 | E03 | Alpha-beta pruning | Không — 1 vai trò (AI) + phần kiểm thử | ST04.2 | TK04.2.1 [AI] 🧪 |  |
| 031 | E03 | Đào sâu dần + deadline + huỷ | Không — 1 vai trò (AI) + phần kiểm thử | ST04.2 | TK04.2.2 [AI] 🧪 |  |
| 032 | E03 | CỔNG ĐO AI: depth 6 trong 3000 ms | Không — 1 vai trò (AI) + phần kiểm thử | ST04.3 | TK04.3.1 [AI] 🧪 | Gộp đo benchmark (AI) + chạy lại độc lập (Tester) ⇒ tách 2 Task. |
| 033 | E03 | Bộ 20 thế cờ + oracle review tay | Không — 1 vai trò (AI) + phần kiểm thử | ST04.3 | TK04.3.2 [AI] 🧪 | Gộp tạo corpus (AI) + review tay oracle (người khác) ⇒ tách: AI tạo, Tester review và chạy chấm. |
| 034 | E04 | Supabase local + biến môi trường | CÓ — gộp DevOps + Backend + phần kiểm thử | ST01.2 | TK01.2.2 [OPS] 🧪, TK01.2.3 [BE] 🧪, TK01.2.4 [QA] | Gộp dựng Supabase local (DevOps) + module env.ts trong apps/server (Backend) ⇒ tách 2 Task. |
| 035 | E04 | Migration: profiles + trigger | Không — 1 vai trò (Backend) + phần kiểm thử | ST05.1 | TK05.1.1 [BE] 🧪 |  |
| 036 | E04 | Migration: bạn bè | Không — 1 vai trò (Backend) + phần kiểm thử | ST05.1 | TK05.1.1 [BE] 🧪 |  |
| 037 | E04 | Migration: phòng · thành viên · danh sách chặn | Không — 1 vai trò (Backend) + phần kiểm thử | ST05.1 | TK05.1.2 [BE] 🧪 |  |
| 038 | E04 | Migration: ván · cây nước đi · sự kiện | Không — 1 vai trò (Backend) + phần kiểm thử | ST05.1 | TK05.1.3 [BE] 🧪 |  |
| 039 | E04 | Migration: biên lai lệnh · đề nghị | Không — 1 vai trò (Backend) + phần kiểm thử | ST05.1 | TK05.1.3 [BE] 🧪 |  |
| 040 | E04 | Migration: vòng chat, nhóm người đọc và tin nhắn | Không — 1 vai trò (Backend) + phần kiểm thử | ST05.2 | TK05.2.1 [BE] 🧪 |  |
| 041 | E04 | Migration: media | Không — 1 vai trò (Backend) + phần kiểm thử | ST05.2 | TK05.2.2 [BE] 🧪 |  |
| 042 | E04 | Migration: AI jobs · client controls | Không — 1 vai trò (Backend) + phần kiểm thử | ST05.2 | TK05.2.2 [BE] 🧪 |  |
| 043 | E04 | RLS + grants + vai trò app_server | Không — 1 vai trò (Backend) + phần kiểm thử | ST05.2 | TK05.2.3 [BE] 🧪 |  |
| 044 | E04 | Harness test tích hợp THẬT | Không — 1 vai trò (Backend) + phần kiểm thử | ST05.3 | TK05.3.1 [BE] 🧪 | Gốc xếp "Tester"; là mã harness dùng DB/transaction ⇒ Backend làm, Tester kiểm chứng. |
| 045 | E04 | Prisma db pull + sinh client | Không — 1 vai trò (Backend) + phần kiểm thử | ST05.3 | TK05.3.2 [BE] 🧪 |  |
| 046 | E05 | Xác thực JWT + guard | Không — 1 vai trò (Backend) + phần kiểm thử | ST06.1 | TK06.1.1 [BE] 🧪 |  |
| 047 | E05 | Đăng ký username + email | CÓ — gộp Backend + Frontend + phần kiểm thử | ST06.1 | TK06.1.2 [BE] 🧪, TK06.1.3 [FE] 🧪 | FILE gồm cả apps/web (màn đăng ký) và apps/server (username.service) ⇒ tách BE + FE. |
| 048 | E05 | Xác minh email | Không — 1 vai trò (Frontend) + phần kiểm thử | ST06.1 | TK06.1.3 [FE] 🧪 | Chỉ Frontend, nhưng ghép vào Story đăng ký (ST06.1) để luồng đăng ký → xác minh là một kết quả người dùng. |
| 049 | E05 | Đăng nhập bằng username | CÓ — gộp Backend + Frontend + phần kiểm thử | ST06.2 | TK06.2.1 [BE] 🧪, TK06.2.3 [FE] 🧪 | FILE gồm apps/server (login.controller/service) + apps/web (login.tsx) ⇒ tách BE + FE. |
| 050 | E05 | Phiên + ghi nhớ đăng nhập 30 ngày | CÓ — gộp Backend + Frontend + phần kiểm thử | ST06.2 | TK06.2.2 [BE] 🧪, TK06.2.3 [FE] 🧪 | FILE gồm apps/server (app-session.service) + apps/web (session.ts, supabase.ts) ⇒ tách BE + FE. |
| 051 | E05 | Đăng xuất thiết bị này / mọi thiết bị | CÓ — gộp Backend + Frontend + phần kiểm thử | ST06.2 | TK06.2.2 [BE] 🧪, TK06.2.3 [FE] 🧪 |  |
| 052 | E05 | Quên mật khẩu + đặt lại | CÓ — gộp Backend + Frontend + phần kiểm thử | ST06.3 | TK06.3.1 [BE] 🧪, TK06.3.2 [FE] 🧪 | FILE ghi apps/web nhưng CÁC BƯỚC có endpoint server đặt fence + job ⇒ tách BE + FE. |
| 053 | E05 | Google OAuth + callback | CÓ — gộp DevOps + Frontend + phần kiểm thử | ST06.4 | TK06.4.1 [OPS] 🧪, TK06.4.2 [FE] 🧪, TK06.4.3 [QA] | Gộp cấu hình Google Cloud/Supabase (DevOps) + nút/callback web (Frontend) ⇒ tách OPS + FE. |
| 054 | E05 | Onboarding chọn username | CÓ — gộp Backend + Frontend + phần kiểm thử | ST06.3 | TK06.3.1 [BE] 🧪, TK06.3.2 [FE] 🧪 | FILE gồm complete-profile.controller (server) + onboarding.tsx (web) ⇒ tách BE + FE. |
| 055 | E05 | Giao diện tài khoản | Không — 1 vai trò (Frontend) + phần kiểm thử | ST01.3, ST06.1, ST06.2, ST06.3 | TK01.3.1 [FE] 🧪, TK06.1.3 [FE] 🧪, TK06.2.3 [FE] 🧪, TK06.3.2 [FE] 🧪 | Gốc gộp 6 màn + router + tokens.css ⇒ router/tokens tách vào ST01.3; 6 màn chia vào FE của ST06.1–06.3; thiết kế tách sang EP02. |
| 056 | E06 | Hồ sơ + sửa tên hiển thị | CÓ — gộp Backend + Frontend + phần kiểm thử | ST07.1 | TK07.1.1 [BE] 🧪, TK07.1.2 [FE] 🧪 | FILE gồm apps/server/modules/profiles + apps/web/SettingsPage ⇒ tách BE + FE. |
| 057 | E06 | Tìm người dùng | Không — 1 vai trò (Backend) + phần kiểm thử | ST07.1 | TK07.1.1 [BE] 🧪 |  |
| 058 | E06 | Kết bạn: gửi · chấp nhận · từ chối · huỷ | Không — 1 vai trò (Backend) + phần kiểm thử | ST07.1 | TK07.1.1 [BE] 🧪 |  |
| 059 | E06 | Presence online | Không — 1 vai trò (Backend) + phần kiểm thử | ST07.2 | TK07.2.1 [BE] 🧪 |  |
| 060 | E06 | Giao diện bạn bè | Không — 1 vai trò (Frontend) + phần kiểm thử | ST07.2 | TK07.2.2 [FE] 🧪 |  |
| 061 | E07 | Tạo phòng + chế độ riêng tư | Không — 1 vai trò (Backend) + phần kiểm thử | ST08.1 | TK08.1.1 [BE] 🧪 |  |
| 062 | E07 | Sảnh + phân trang + lọc trạng thái | Không — 1 vai trò (Backend) + phần kiểm thử | ST08.2 | TK08.2.1 [BE] 🧪 | Phụ thuộc gateway (084) cho realtime sảnh ⇒ đặt sau gateway. |
| 063 | E07 | Vào ghế chơi + trần sức chứa (khoá) | Không — 1 vai trò (Backend) + phần kiểm thử | ST08.1 | TK08.1.2 [BE] 🧪 |  |
| 064 | E07 | Sẵn sàng + bắt đầu ván | Không — 1 vai trò (Backend) + phần kiểm thử | ST08.2 | TK08.2.2 [BE] 🧪 | Gồm cả đổi bên trước ván (side-swap) ⇒ BE; giao diện ở 067. |
| 065 | E07 | Rời phòng + đóng phòng | Không — 1 vai trò (Backend) + phần kiểm thử | ST08.3 | TK08.3.1 [BE] 🧪 |  |
| 066 | E07 | Đổi cài đặt + thu hồi người xem | Không — 1 vai trò (Backend) + phần kiểm thử | ST08.3 | TK08.3.2 [BE] 🧪 |  |
| 067 | E07 | Giao diện sảnh · tạo phòng · phòng chờ | Không — 1 vai trò (Frontend) + phần kiểm thử | ST08.2, ST08.3 | TK08.2.3 [FE] 🧪, TK08.3.3 [FE] 🧪 | Chỉ Frontend; tách phần hộp thoại cài đặt/xác nhận rời sang ST08.3 để đi cùng API 065/066. |
| 068 | E08 | Mã phòng 8 ký tự + HMAC | Không — 1 vai trò (Backend) + phần kiểm thử | ST08.4 | TK08.4.1 [BE] 🧪 |  |
| 069 | E08 | Link mời + token | CÓ — gộp Backend + Frontend + phần kiểm thử | ST08.4 | TK08.4.1 [BE] 🧪, TK08.4.3 [FE] 🧪 | FILE gồm link.service (server) + JoinPage (web) ⇒ BE ở TK08.4.1, FE ở TK08.4.3. |
| 070 | E08 | Lời mời trực tiếp cho bạn bè | Không — 1 vai trò (Backend) + phần kiểm thử | ST08.4 | TK08.4.2 [BE] 🧪 |  |
| 071 | E08 | Hộp thư lời mời (R19) | Không — 1 vai trò (Backend) + phần kiểm thử | ST08.4 | TK08.4.2 [BE] 🧪 |  |
| 072 | E08 | Giao diện mời · nhập mã · hộp thư | Không — 1 vai trò (Frontend) + phần kiểm thử | ST08.4 | TK08.4.3 [FE] 🧪 |  |
| 073 | E09 | Vào xem + kiểm quyền theo chế độ | Không — 1 vai trò (Backend) + phần kiểm thử | ST09.1 | TK09.1.1 [BE] 🧪, TK09.1.2 [QA] |  |
| 074 | E09 | Trần 5 người xem + tranh chấp ghế | Không — 1 vai trò (Backend) + phần kiểm thử | ST09.1 | TK09.1.1 [BE] 🧪, TK09.1.2 [QA] |  |
| 075 | E09 | Thu hồi quyền hàng loạt | Không — 1 vai trò (Backend) + phần kiểm thử | ST09.2 | TK09.2.1 [BE] 🧪 |  |
| 076 | E09 | Đuổi người xem + danh sách chặn (R18) | Không — 1 vai trò (Backend) + phần kiểm thử | ST09.2 | TK09.2.1 [BE] 🧪 |  |
| 077 | E09 | Giao diện danh sách người xem | Không — 1 vai trò (Frontend) + phần kiểm thử | ST09.2 | TK09.2.2 [FE] 🧪 |  |
| 078 | E10 | Bàn cờ SVG 90 giao điểm | Không — 1 vai trò (Frontend) + phần kiểm thử | ST10.1 | TK10.1.1 [FE] 🧪 |  |
| 079 | E10 | Quân cờ + chữ Hán + nhãn trợ năng | Không — 1 vai trò (Frontend) + phần kiểm thử | ST10.1 | TK10.1.1 [FE] 🧪 |  |
| 080 | E10 | Chọn quân + hiện đích hợp lệ | Không — 1 vai trò (Frontend) + phần kiểm thử | ST10.1 | TK10.1.2 [FE] 🧪 |  |
| 081 | E10 | Lật bàn theo phe | Không — 1 vai trò (Frontend) + phần kiểm thử | ST10.1 | TK10.1.2 [FE] 🧪 |  |
| 082 | E10 | Điều khiển bằng bàn phím | Không — 1 vai trò (Frontend) + phần kiểm thử | ST10.1 | TK10.1.3 [FE] 🧪 |  |
| 083 | E10 | Chuyển động nước đi | Không — 1 vai trò (Frontend) + phần kiểm thử | ST10.1 | TK10.1.3 [FE] 🧪 |  |
| 084 | E11 | Socket.IO gateway + handshake | Không — 1 vai trò (Backend) + phần kiểm thử | ST10.2 | TK10.2.1 [BE] 🧪, TK10.2.4 [QA] |  |
| 085 | E11 | Đường xử lý lệnh + thứ tự khoá | Không — 1 vai trò (Backend) + phần kiểm thử | ST10.2 | TK10.2.3 [BE] 🧪 |  |
| 086 | E11 | Biên lai lệnh chống gửi trùng | Không — 1 vai trò (Backend) + phần kiểm thử | ST10.2 | TK10.2.3 [BE] 🧪 |  |
| 087 | E11 | Đi nước + phiên bản + sự kiện | Không — 1 vai trò (Backend) + phần kiểm thử | ST10.3 | TK10.3.1 [BE] 🧪 |  |
| 088 | E11 | Cây nước đi + nhánh hiệu lực | Không — 1 vai trò (Backend) + phần kiểm thử | ST10.3 | TK10.3.1 [BE] 🧪 |  |
| 089 | E11 | Finalizer kết thúc ván | Không — 1 vai trò (Backend) + phần kiểm thử | ST10.3 | TK10.3.2 [BE] 🧪 |  |
| 090 | E11 | Đồng bộ lại + snapshot | Không — 1 vai trò (Backend) + phần kiểm thử | ST10.3 | TK10.3.3 [BE] 🧪 |  |
| 091 | E11 | Giao diện ván online thời gian thực | Không — 1 vai trò (Frontend) + phần kiểm thử | ST10.4 | TK10.4.1 [FE] 🧪 | Chỉ Frontend; phần hiển thị đồng hồ (094) gộp cùng Story ST10.4. |
| 092 | E12 | Đồng hồ: cấu hình + tính toán | Không — 1 vai trò (Backend) + phần kiểm thử | ST11.1 | TK11.1.1 [BE] 🧪 |  |
| 093 | E12 | Bộ đếm hết giờ | Không — 1 vai trò (Backend) + phần kiểm thử | ST11.1 | TK11.1.1 [BE] 🧪 |  |
| 094 | E12 | Hiển thị đồng hồ | Không — 1 vai trò (Frontend) + phần kiểm thử | ST10.4 | TK10.4.2 [FE] 🧪 |  |
| 095 | E13 | Heartbeat + presence trong ván | Không — 1 vai trò (Backend) + phần kiểm thử | ST10.2 | TK10.2.2 [BE] 🧪 | Presence dùng cho cả phòng chờ ⇒ đặt chung Story gateway ST10.2 (trước ready/start). |
| 096 | E13 | Ân hạn 60 giây + kết quả | CÓ — gộp Backend + Frontend + phần kiểm thử | ST11.2 | TK11.2.1 [BE] 🧪, TK11.2.2 [FE] 🧪 |  |
| 097 | E13 | Cả hai offline + khởi động lại máy chủ | Không — 1 vai trò (Backend) + phần kiểm thử | ST11.2 | TK11.2.1 [BE] 🧪 |  |
| 098 | E13 | Nhiều tab đồng bộ | Chỉ kiểm thử + phần kiểm thử | ST16.1 | TK16.1.1 [QA] | Không có mã mới đáng kể (cơ chế chống xung đột đã có) ⇒ Story kiểm chứng chỉ gồm Task Tester. |
| 099 | E13 | Camera/mic chỉ một tab | CÓ — gộp Backend + Frontend + phần kiểm thử | ST14.3 | TK14.3.2 [BE] 🧪, TK14.3.3 [FE] 🧪, TK14.3.4 [QA] | FILE gồm device-owner.service (server) + useDeviceOwnership (web) ⇒ tách BE + FE. |
| 100 | E14 | Bộ đếm treo ván + trạng thái | Không — 1 vai trò (Backend) + phần kiểm thử | ST11.3 | TK11.3.1 [BE] 🧪 |  |
| 101 | E14 | Xác nhận + gia hạn tối đa 2 lần | Không — 1 vai trò (Backend) + phần kiểm thử | ST11.3 | TK11.3.1 [BE] 🧪 |  |
| 102 | E14 | Đếm ngược 30 giây + kết thúc INACTIVITY | Không — 1 vai trò (Backend) + phần kiểm thử | ST11.3 | TK11.3.1 [BE] 🧪 |  |
| 103 | E14 | Giao diện treo ván cho cả 3 phía | Không — 1 vai trò (Frontend) + phần kiểm thử | ST11.3 | TK11.3.2 [FE] 🧪 | Chỉ Frontend; cần thiết kế vùng cảnh báo không modal ⇒ Design ở TK02.3.1. |
| 104 | E15 | Đầu hàng | Không — 1 vai trò (Backend) + phần kiểm thử | ST12.1 | TK12.1.1 [BE] 🧪, TK12.1.4 [QA] |  |
| 105 | E15 | Đề nghị hoà / đi lại + hết hạn 30 giây | Không — 1 vai trò (Backend) + phần kiểm thử | ST12.1 | TK12.1.1 [BE] 🧪, TK12.1.4 [QA] |  |
| 106 | E15 | Đi lại: dựng lại bàn cờ + đếm lặp | Không — 1 vai trò (Backend) + phần kiểm thử | ST12.1 | TK12.1.2 [BE] 🧪 |  |
| 107 | E15 | Giao diện thao tác trong ván | Không — 1 vai trò (Frontend) + phần kiểm thử | ST12.1 | TK12.1.3 [FE] 🧪 |  |
| 108 | E16 | Kênh riêng người chơi | Không — 1 vai trò (Backend) + phần kiểm thử | ST13.1 | TK13.1.1 [BE] 🧪 |  |
| 109 | E16 | Kênh chung: người chơi đọc và gửi | Không — 1 vai trò (Backend) + phần kiểm thử | ST13.1 | TK13.1.1 [BE] 🧪 | CÁC BƯỚC có dòng minh bạch/nhãn hiển thị (UI) nhưng phần mã là contract server ⇒ BE; hiển thị ở TK13.2.2. |
| 110 | E16 | Công tắc ẩn/hiện + lịch sử + phân trang | CÓ — gộp Backend + Frontend + phần kiểm thử | ST13.2 | TK13.2.1 [BE] 🧪, TK13.2.2 [FE] 🧪 | FILE gồm useChannelVisibility (web) + cleanup (server) ⇒ tách BE + FE. |
| 111 | E16 | Giao diện chat 2 khung | Không — 1 vai trò (Frontend) + phần kiểm thử | ST13.2 | TK13.2.2 [FE] 🧪 |  |
| 112 | E17 | CỔNG MEDIA: LiveKit local + đo RTP thật | CÓ — gộp DevOps + Backend + phần kiểm thử | ST14.1 | TK14.1.1 [OPS] 🧪, TK14.1.2 [BE] 🧪, TK14.1.3 [QA] | Gộp hạ tầng LiveKit Docker (DevOps) + lane test media/spike (mã test dùng SDK server) + đo độc lập ⇒ tách OPS + BE + QA. |
| 113 | E17 | Chính sách media + phiên bản | Không — 1 vai trò (Backend) + phần kiểm thử | ST14.2 | TK14.2.1 [BE] 🧪 |  |
| 114 | E17 | Cấp token + 4 phòng truyền | Không — 1 vai trò (Backend) + phần kiểm thử | ST14.2 | TK14.2.1 [BE] 🧪 |  |
| 115 | E17 | Thu hồi + xoay vòng thế hệ | Không — 1 vai trò (Backend) + phần kiểm thử | ST14.2 | TK14.2.2 [BE] 🧪 |  |
| 116 | E17 | Giao diện media | Không — 1 vai trò (Frontend) + phần kiểm thử | ST14.3 | TK14.3.1 [FE] 🧪 |  |
| 117 | E17 | Test media đo luồng thật | Chỉ kiểm thử + phần kiểm thử | ST14.4 | TK14.4.1 [QA] | Bản thân là việc kiểm thử ⇒ Tester. |
| 118 | E18 | Tiến trình AI riêng + IPC | Không — 1 vai trò (AI) + phần kiểm thử | ST15.1 | TK15.1.1 [AI] 🧪, TK15.1.5 [QA] |  |
| 119 | E18 | Worker thread + cờ huỷ | Không — 1 vai trò (AI) + phần kiểm thử | ST15.1 | TK15.1.2 [AI] 🧪, TK15.1.5 [QA] |  |
| 120 | E18 | Hàng đợi 2 chạy / 8 chờ | CÓ — gộp Backend + AI + phần kiểm thử | ST15.1 | TK15.1.3 [AI] 🧪, TK15.1.4 [BE] 🧪, TK15.1.6 [QA] | FILE gồm apps/ai-worker/supervisor (AI) + apps/server/modules/ai/queue.service (Backend) ⇒ tách AI + BE. |
| 121 | E18 | Tích hợp ván với máy | Không — 1 vai trò (Backend) + phần kiểm thử | ST15.2 | TK15.2.1 [BE] 🧪 |  |
| 122 | E18 | Đi lại với máy | Không — 1 vai trò (Backend) + phần kiểm thử | ST15.2 | TK15.2.1 [BE] 🧪 |  |
| 123 | E18 | Giao diện chơi với máy | Không — 1 vai trò (Frontend) + phần kiểm thử | ST15.2 | TK15.2.2 [FE] 🧪 |  |
| 124 | E18 | Thí nghiệm 60 ván + báo cáo | Không — 1 vai trò (AI) + phần kiểm thử | ST15.3 | TK15.3.1 [AI] 🧪 | Thí nghiệm chạy trên packages/ai ⇒ AI làm, Tester chạy lại cùng seed. Đưa lên Sprint 3 (không cần giao diện 123). |
| 125 | E19 | Lịch sử ván + phân trang + quyền | Không — 1 vai trò (Backend) + phần kiểm thử | ST12.2 | TK12.2.1 [BE] 🧪 |  |
| 126 | E19 | Xem lại theo nhánh hiệu lực | Không — 1 vai trò (Backend) + phần kiểm thử | ST12.2 | TK12.2.1 [BE] 🧪 |  |
| 127 | E19 | Tái đấu + phiếu + đổi bên | Không — 1 vai trò (Backend) + phần kiểm thử | ST12.3 | TK12.3.1 [BE] 🧪 |  |
| 128 | E19 | Bộ đếm đóng phòng 10 phút | Không — 1 vai trò (Backend) + phần kiểm thử | ST12.3 | TK12.3.1 [BE] 🧪 |  |
| 129 | E19 | Giao diện lịch sử · xem lại · kết quả | Không — 1 vai trò (Frontend) + phần kiểm thử | ST12.2, ST12.3 | TK12.2.2 [FE] 🧪, TK12.3.2 [FE] 🧪 |  |
| 130 | E20 | Responsive 360 · 390 · 1366 · 1920 | CÓ — gộp Frontend + Design + phần kiểm thử | ST16.2 | TK16.2.1 [FE] 🧪, TK16.2.4 [DS] 🧪 | Gốc gộp rà responsive + rà thiết kế ⇒ FE sửa, Design rà khớp, Tester kiểm. |
| 131 | E20 | Trợ năng + WCAG AA + DT-21 | CÓ — gộp Frontend + Design + phần kiểm thử | ST16.2 | TK16.2.2 [FE] 🧪, TK16.2.4 [DS] 🧪, TK16.2.5 [QA] | Gộp sửa trợ năng (FE) + đo tương phản/giả lập mù màu (Design rà) + kiểm (Tester). |
| 132 | E20 | Trạng thái màn hình đầy đủ | Không — 1 vai trò (Frontend) + phần kiểm thử | ST16.2 | TK16.2.3 [FE] 🧪, TK16.2.5 [QA] | Chỉ Frontend; tách thành Task riêng TK16.2.3 để làm song song với trợ năng. |
| 133 | E20 | Bảo mật: kiểm ma trận quyền | Chỉ kiểm thử + phần kiểm thử | ST16.3 | TK16.3.1 [QA] | Bản thân là bộ test giả mạo ⇒ Tester. |
| 134 | E20 | Giới hạn tần suất + kích thước | Không — 1 vai trò (Backend) + phần kiểm thử | ST16.7 | TK16.7.1 [BE] 🧪 | Backend; tách thành Story riêng ST16.7 làm sớm ở Sprint 3. |
| 135 | E20 | Thử tải 10 phòng / 70 kết nối | Không — 1 vai trò (DevOps) + phần kiểm thử | ST16.4, ST16.8 | TK16.4.1 [QA], TK16.8.4 [OPS] 🧪 | Gộp chuẩn bị môi trường tải (DevOps) + kịch bản/chạy/báo cáo (Tester) ⇒ tách. |
| 136 | E20 | Nghiệm thu R01–R19 | Chỉ kiểm thử + phần kiểm thử | ST16.5 | TK16.5.1 [QA], TK16.5.2 [QA] | Bản thân là nghiệm thu ⇒ Tester; tách 2 Task song song (kịch bản xương sống / đối chiếu R01–R19). |
| 137 | E20 | Triển khai Render + Vercel | CÓ — gộp DevOps + Backend + phần kiểm thử | ST16.6, ST16.8 | TK16.6.1 [QA], TK16.8.1 [BE] 🧪, TK16.8.2 [OPS] 🧪, TK16.8.3 [QA] | Gộp endpoint /healthz (Backend) + triển khai (DevOps) + kiểm trên Internet (Tester) ⇒ tách 3 vai trò; phần hạ tầng làm sớm ở Sprint 3 (ST16.8). |
| 138 | E20 | Bàn giao + hồ sơ bảo vệ | CÓ — gộp DevOps + AI + phần kiểm thử | ST16.6 | TK16.6.2 [OPS] 🧪, TK16.6.3 [AI] 🧪, TK16.6.4 [QA] | Gộp tài liệu bàn giao của mọi vai trò ⇒ tách: DevOps (README/handover/known-limitations), AI (defense-notes), Tester (người lạ chạy thử). |

## 3. NGUYÊN TẮC ĐÃ ÁP DỤNG KHI TÁCH

1. **Một Task = một vai trò = một component Jira.** Không Task nào vừa sửa `apps/web` vừa sửa `apps/server`.
2. **Tester kiểm mọi Task phát triển/thiết kế ở bước `Ready For Test`** theo mục 🧪 ghi sẵn trong Task (ca kiểm thử + tiêu chí PASS cụ thể). Developer vẫn tự viết unit test cho mã mình. Kiểm thử cần nhiều Task cùng lúc (cổng chặn, ma trận quyền, tranh chấp nhiều tab, tải, nghiệm thu, Internet) là 20 Task `[QA]` riêng.
3. **Gom issue nhỏ cùng vai trò** vào một Task (ví dụ 015+016+020 → TK03.2.2) để số Task hợp lý cho 4 tuần; **tách issue lớn nhiều vai trò** thành nhiều Task.
4. **Nối tiếp thì Blocks, độc lập thì song song.** Ví dụ: TK03.2.2 (Tướng/Sĩ/Tượng/Tốt) và TK03.2.3 (Mã/Xe/Pháo) song song; TK03.3.1 chờ cả hai.
5. **Không đổi yêu cầu nghiệp vụ** của đặc tả — chỉ đổi cách chia việc và một số phụ thuộc lập lịch (có ghi lý do).
