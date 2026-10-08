# BACKLOG P1 — Cờ Tướng Online (XIANGQI)

> **Phiên bản:** 2.0 · **Ngày:** 07/10/2026 · **Người lập:** BA · **PO duyệt:** cấu trúc 9 Epic / 27 Story chốt 07/10
> **Phạm vi:** P1 (MVP, hạn **05/11/2026**). P2 chỉ liệt kê ở mức Epic (mục 4.2).
> **Nguồn luật:** [BA-SCOPE-DECISIONS.md](BA-SCOPE-DECISIONS.md) — **Phần 0 (chốt 07/10) ưu tiên cao nhất**. Tài liệu này **không tạo luật mới**: mỗi tiêu chí dẫn về quyết định BA tương ứng. Nếu thấy khác BA thì BA thắng và phải báo PO.
> **Kế hoạch Task, giờ, người làm, ngày:** [KE-HOACH-JIRA.md](KE-HOACH-JIRA.md).
> **Cấu trúc:** **EP-01 → EP-08 khớp đúng 8 yêu cầu của khách hàng (YC1 → YC8)**; EP-00 là Epic nền tảng phục vụ chung.

---

## Mục lục

1. [Cách dùng tài liệu và quy ước](#1-cách-dùng-tài-liệu-và-quy-ước)
2. [Definition of Ready và Definition of Done](#2-definition-of-ready-và-definition-of-done)
3. [Vai trò người dùng](#3-vai-trò-người-dùng)
4. [Danh sách Epic](#4-danh-sách-epic)
5. [User Story và tiêu chí nghiệm thu P1](#5-user-story-và-tiêu-chí-nghiệm-thu-p1)
6. [Yêu cầu phi chức năng (NFR)](#6-yêu-cầu-phi-chức-năng-nfr)
7. [Cổng kiểm chứng kỹ thuật](#7-cổng-kiểm-chứng-kỹ-thuật)
8. [Kịch bản demo đầu-cuối D1–D10](#8-kịch-bản-demo-đầu-cuối-d1d10)
9. [Thứ tự phụ thuộc và phân bổ Sprint](#9-thứ-tự-phụ-thuộc-và-phân-bổ-sprint)
10. [Truy vết](#10-truy-vết)
11. [Giả định và điểm cần theo dõi](#11-giả-định-và-điểm-cần-theo-dõi)

---

## 1. Cách dùng tài liệu và quy ước

| Ký hiệu | Ý nghĩa | Lên Jira thành |
|---|---|---|
| `EP-xx` | Epic. EP-01 → EP-08 = yêu cầu YC1 → YC8 của khách hàng; EP-00 = nền tảng | Epic; **phần việc BA**, bắt đầu 07/10, xong khi Story muộn nhất của nó xong |
| `US-xx.y` | User Story (xx = số Epic) | Story; AC dán vào Description. **Story là phần việc BA**: Done khi đặc tả + AC được PO duyệt; bắt đầu 07/10, hạn = ngày Task đầu tiên của Story bắt đầu (ngoại lệ US-08.3, US-00.5: hạn = Task cuối, vì AC chờ kết quả đo GATE-ENGINE/GATE-REALTIME); không đặt vào Sprint (quy tắc R1, KE-HOACH-JIRA.md mục 4) |
| `AC-xx.y.z` | Tiêu chí nghiệm thu dạng **Given / When / Then** | Checklist trong Story |
| `TC-xx.y.z` | Ca kiểm thử **1-1** với AC cùng số | Tester viết bước chi tiết trong Task kiểm thử |
| `Txx` | Task: việc thi công của một người (4–32 giờ) | **Task** (cha là Epic, liên kết *relates to* tới Story), có Sprint, người làm, hạn riêng |
| `NFR-xx`, `GATE-xx` | Yêu cầu phi chức năng, cổng kiểm chứng | AC của Story EP-00 hoặc Task kỹ thuật |
| `Dx` | Kịch bản demo đầu-cuối | Story US-00.5 |

**Mức kiểm thử ở cột "Kiểm":** `U` = unit test (dev viết) · `I` = kiểm thử tích hợp/API/socket · `E2E` = Playwright · `M` = kiểm thử thủ công (Tester).

**Yêu cầu (YC) của khách hàng:** YC1 Đăng ký/đăng nhập · YC2 Tạo phòng · YC3 Mời vào phòng · YC4 Khởi tạo bàn cờ · YC5 Hai người đánh online · YC6 Chế độ phòng và người xem (tối đa 5 xem / 7 người) · YC7 Chat + camera + mic, kênh người xem riêng · YC8 Đánh với máy theo cấp độ.

**Mô hình Jira (theo hướng dẫn của giảng viên):** Epic và Story là sản phẩm của BA nên xong trước khi thi công; đội chia Story thành Task và đặt hạn cho Task. Một chức năng chỉ được coi là **đã chạy xong** khi Task kiểm thử của Story đó đạt Definition of Done (mục 2.2).

**Câu chữ giao diện** trong ngoặc kép là văn bản bắt buộc hiển thị đúng (có thể chỉnh dấu câu, không đổi nghĩa).

---

## 2. Definition of Ready và Definition of Done

### 2.1 Definition of Ready (Task được kéo vào Sprint khi)
- [ ] Story của Task đã được đặc tả (câu chuyện, AC Given/When/Then, quyết định BA nguồn) và PO duyệt.
- [ ] Các Story/Task phụ thuộc đã xong hoặc có giao diện giả (mock/contract) đã thống nhất.
- [ ] Đã tách Task (BE/FE/kiểm thử), có người nhận, ước lượng giờ và ngày bắt đầu theo KE-HOACH-JIRA.md.
- [ ] Màn hình liên quan có trong DANH-MUC (mockup chỉ tham khảo).
- [ ] Không còn câu hỏi mở chặn việc làm (nếu có thì ghi rõ và PO đã trả lời).

### 2.2 Definition of Done (chức năng của một Story được nghiệm thu khi — kiểm ở Task kiểm thử của Story)
- [ ] Mọi AC đạt; mỗi AC có TC tương ứng **PASS** và được ghi kết quả trong Jira.
- [ ] Code đã review (ít nhất 1 người, phần lõi do Tình review), merge vào `develop` qua PR, CI xanh (lint, typecheck, unit test).
- [ ] Luật nghiệp vụ kiểm ở **máy chủ**, không tin dữ liệu client gửi.
- [ ] Màn hình đủ **5 trạng thái** (`SUCCESS`, `LOADING`, `EMPTY`, `ERROR`, `DISABLED` có tooltip) theo DANH-MUC §2 và đúng `DESIGN.md`.
- [ ] Chạy được ở môi trường demo local; responsive từ 360 px; tiếng Việt.
- [ ] Không có lỗi mức Nghiêm trọng/Cao còn mở; lỗi khác đã ghi Jira.
- [ ] Không log mật khẩu, OTP, token, nội dung chat (NFR-08).
- [ ] Tài liệu (README chạy dự án, biến môi trường) được cập nhật nếu Story thay đổi chúng.

---

## 3. Vai trò người dùng

| Vai trò | Định nghĩa |
|---|---|
| **Người dùng** | Tài khoản chính thức đã đăng ký (Username + Mật khẩu hoặc Google) |
| **Khách** | Phiên tạm, nhập tên, nhãn "(Khách)" (BA 1.3, 0.3) |
| **Người chơi** | Người đang ngồi một trong hai ghế Đỏ/Đen của phòng |
| **Host** | Người chơi giữ quyền Cài đặt phòng; luôn đang ngồi ghế |
| **Người xem** | Người trong phòng không ngồi ghế; tối đa N (0–5) người |
| **Hệ thống** | Máy chủ ứng dụng, máy cờ, dịch vụ ngoài (Supabase, LiveKit, SMTP) |

---

## 4. Danh sách Epic

### 4.1 Epic P1

| Epic | Tên | Yêu cầu | Story | Mô tả ngắn |
|---|---|---|---|---|
| EP-00 | Nền tảng kỹ thuật và chất lượng | Hỗ trợ tất cả | US-00.1 – 00.5 | Việc kỹ thuật và kiểm thử chung mà 8 yêu cầu cùng dựa vào: khung dự án, CI, cơ sở dữ liệu, khung realtime, kế hoạch kiểm thử, nghiệm thu tổng và đóng gói demo. |
| EP-01 | Đăng ký và đăng nhập | YC1 | US-01.1 – 01.4 | Đăng ký bằng username + mật khẩu + OTP email hoặc Google; đăng nhập bằng username + mật khẩu (khoá thử sai), Google hoặc Khách; quản lý phiên và hồ sơ. |
| EP-02 | Tạo phòng | YC2 | US-02.1 – 02.2 | Tạo phòng, ghế Đỏ/Đen, Đổi ghế/Xin đổi bên, Sẵn sàng và đếm ngược, chuyển Host, ở lại phòng sau ván. |
| EP-03 | Mời vào phòng | YC3 | US-03.1 – 03.2 | Mời bằng link/mã 8 ký tự cho người chưa kết bạn; kết bạn và mời bạn đang online ngay trong game. |
| EP-04 | Khởi tạo bàn cờ | YC4 | US-04.1 – 04.3 | Lõi luật cờ dùng chung, bàn cờ SVG quân chữ Hán, đi cờ bằng click/kéo thả, âm thanh. |
| EP-05 | Hai người đánh cờ online | YC5 | US-05.1 – 05.3 | Máy chủ phân xử nước đi, đồng hồ, kết thúc ván, đầu hàng, xin hoà, mất kết nối và nối lại. |
| EP-06 | Chế độ phòng và người xem | YC6 | US-06.1 – 06.3 | PUBLIC / CODE_ONLY / LOCKED, danh sách phòng ở Sảnh, tối đa 5 người xem (7 người/phòng), đuổi người xem. |
| EP-07 | Chat, camera và mic | YC7 | US-07.1 – 07.2 | Kênh Riêng cho hai người chơi, Kênh Chung cho người xem, bộ lọc từ cấm; camera/mic qua LiveKit với ba mức chia sẻ. |
| EP-08 | Đánh với máy theo cấp độ | YC8 | US-08.1 – 08.3 | Máy cờ ba cấp Dễ/Trung bình/Khó, chọn phe, Ván mới, ổn định ván với máy. |

### 4.2 Epic P2 (chỉ ở mức Epic, chưa tách Story)

| Epic | Tên | Nguồn BA |
|---|---|---|
| EP-P2-01 | Đánh Hạng, Elo, bảng xếp hạng | 2.0, 5.4, 7.1, 7.2, 7.3, 8.1, 8.3 (phần Ranked) |
| EP-P2-02 | Đánh Thường ghép ngẫu nhiên | 2.0 |
| EP-P2-03 | Đề nghị mở rộng trong ván: Xin đi lại, Tái đấu có chọn phe, mức giờ Không giới hạn + chống treo ván | 0.8, 2.1, 3.2, 3.3 mục 5, 3.6 |
| EP-P2-04 | Lịch sử, Replay, FEN/PGN, lưu ván AI, đi lại với máy | 6.2, 6.3 (Undo), 7.3, 9.1 |
| EP-P2-05 | Xã hội mở rộng: chat 1-1, Thách đấu, sticker, QR | 2.2, 2.7 mục 4, 5.1, 5.2, 8.2 |
| EP-P2-06 | Khôi phục và quản lý tài khoản: quên mật khẩu/khôi phục Username, đổi Username | 1.4, 1.6, 1.7 |
| EP-P2-07 | Tiện ích demo và giao diện bổ sung: widget AI, giả lập mạng, `MODAL-MEDIA-TAB-SWITCH`, Giấy Sáng/Theo hệ thống | 1.8, 9.2, 9.3, 10.3 |

---
## 5. User Story và tiêu chí nghiệm thu P1

### EP-00 · Nền tảng kỹ thuật và chất lượng

#### US-00.1 · Khung dự án, CI và nhật ký vận hành
**Là** nhóm phát triển, **tôi muốn** một monorepo có sẵn khung ứng dụng, CI, nhật ký và điểm kiểm tra sức khoẻ, **để** mọi người code trên cùng một nền và tìm lỗi nhanh.
*Nguồn:* README (Công nghệ, Quy trình Git), BA 10.1. *Ghi chú:* cấu trúc gợi ý `apps/web` (React + Vite), `apps/server` (NestJS + Socket.IO), `packages/xiangqi-core` (luật cờ dùng chung), `packages/shared` (kiểu dữ liệu, hằng số), `packages/engine` (máy cờ).
*Nguồn:* BA 10.1 (NFR-08, NFR-09).
*Sprint:* S1.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-00.1.1 | Máy dev mới clone repo, có Node + pnpm | Chạy `pnpm install` rồi `pnpm dev` | Web và server cùng chạy; `GET /health` trả 200 | M |
| AC-00.1.2 | Một PR vào `develop` | CI chạy | Chạy lint, typecheck, unit test; bất kỳ bước nào lỗi thì PR không merge được (bảo vệ nhánh) | I |
| AC-00.1.3 | Repo | Kiểm tra file môi trường | Có `.env.example` liệt kê mọi biến; không có khoá bí mật trong git; biến `VITE_*` không chứa bí mật | M |
| AC-00.1.4 | Server chạy | Gọi `/health` | Trả trạng thái server, kết nối CSDL và máy cờ | I |
| AC-00.1.5 | Có đăng nhập, gửi OTP, chat | Đọc log | Log dạng JSON có thời gian, mức, mã sự kiện; **không** chứa mật khẩu, OTP, token, nội dung chat | M |
| AC-00.1.6 | Log và biên lai lệnh | Quá hạn lưu giữ | Biên lai lệnh xoá sau 24 giờ; log giữ tối đa 14 ngày | I |

#### US-00.2 · Cơ sở dữ liệu và phân quyền P1
**Là** nhóm phát triển, **tôi muốn** lược đồ dữ liệu P1 có migration và RLS, **để** dữ liệu nhất quán và client không ghi trái phép.
*Nguồn:* BA 1.x, 2.x, 4.2, 5.5, 10.1 (dữ liệu cá nhân). *Ghi chú:* tối thiểu `profiles`, `friendships`/`friend_requests`, `rooms`, `room_blocks`, `matches`, `match_moves`, `login_attempts`; tên bảng do nhóm chốt.
*Sprint:* S1.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-00.2.1 | Cơ sở dữ liệu trống | Chạy toàn bộ migration | Tạo đủ bảng, khoá ngoại, chỉ mục; chạy lại từ đầu không lỗi | I |
| AC-00.2.2 | Người dùng đăng nhập bằng khoá công khai ở client | Đọc/ghi dữ liệu người khác hoặc bảng ván/phòng | Bị RLS từ chối; chỉ máy chủ (khoá service) ghi được dữ liệu ván, phòng, kết quả | I |
| AC-00.2.3 | Username lưu theo chữ người dùng gõ | Kiểm tra trùng | Ràng buộc duy nhất so sánh theo chữ thường (`Twot` = `twot`) | U |

#### US-00.3 · Khung realtime
**Là** nhóm phát triển, **tôi muốn** cổng Socket.IO có xác thực, lệnh chống trùng và đồng bộ lại khi nối lại, **để** phòng, ván và chat dùng chung một cách.
*Nguồn:* BA 3.3 mục 1, 8.3, 1.8 (nhiều tab).
*Hợp đồng sự kiện:* Task của Story này công bố kiểu dữ liệu sự kiện phòng/ván trong `packages/shared` để Story phòng và Story ván làm độc lập với nhau.
*Sprint:* S1.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-00.3.1 | Kết nối không có token hợp lệ (người dùng hoặc Khách) | Mở socket | Bị từ chối kết nối | I |
| AC-00.3.2 | Client gửi cùng một `commandId` hai lần | Máy chủ xử lý | Lệnh chỉ có hiệu lực một lần; lần hai trả lại kết quả cũ | I |
| AC-00.3.3 | Client gửi lệnh với phiên bản trạng thái cũ | Máy chủ nhận | Từ chối và gửi ảnh chụp trạng thái mới nhất | I |
| AC-00.3.4 | Client mất kết nối rồi nối lại | Kết nối thành công | Nhận ảnh chụp đầy đủ (phòng, ván, đồng hồ, vai trò) và giao diện khớp máy chủ | I |
| AC-00.3.5 | Cùng tài khoản mở tab thứ hai vào cùng phòng | Tab mới kết nối | Tab mới tiếp quản; tab cũ nhận *"Phiên này đã được mở ở tab khác"* và chỉ đọc; tab cũ tự nối lại vẫn chỉ đọc | E2E |

#### US-00.4 · Kế hoạch kiểm thử và kiểm chứng sớm
**Là** nhóm, **tôi muốn** có kế hoạch kiểm thử và kiểm chứng sớm rủi ro media, **để** nghiệm thu có bằng chứng và phát hiện sớm điểm không khả thi.
*Kèm:* spike GATE-MEDIA (LiveKit Cloud) ở Sprint 1.
*Sprint:* S1.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-00.4.1 | Backlog P1 | Viết kế hoạch kiểm thử | Có phạm vi, môi trường, dữ liệu thử, tiêu chí vào/ra, quy trình báo lỗi trên Jira (mức độ: Nghiêm trọng/Cao/Trung bình/Thấp) | M |
| AC-00.4.2 | Mỗi AC | Viết TC | TC cùng số có tiền điều kiện, bước, kết quả mong đợi; truy vết 100% AC | M |
| AC-00.4.3 | Cuối mỗi Sprint | Chạy hồi quy | Báo cáo PASS/FAIL/BLOCKED theo TC, lỗi mở được ghi Jira | M |

#### US-00.5 · Nghiệm thu tổng, NFR và đóng gói demo
**Là** PO, **tôi muốn** đo NFR, chạy đủ D1–D10 và có bản demo chạy được theo hướng dẫn, **để** chứng minh 8 yêu cầu cốt lõi với khách hàng.
*Sprint:* S4.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-00.5.1 | Môi trường demo local | Chạy D1–D10 (mục 8) | Tất cả PASS; kịch bản tự động hoá được thì có test Playwright | E2E, M |
| AC-00.5.2 | Bản phát hành v1.0 | Chạy lại D1–D10 trên máy demo thật | Tất cả PASS, có ghi hình làm bằng chứng | M |
| AC-00.5.3 | Mục 6 và 7 | Đo | Mỗi NFR/GATE có số đo, ngày đo, người đo; không đạt thì ghi **BLOCKED** kèm lý do, không tự hạ ngưỡng | M |
| AC-00.5.4 | Bài tải | Chạy kịch bản 50 người dùng / 10 ván đồng thời | Báo cáo độ trễ nước đi p95, lỗi, CPU/RAM | I |
| AC-00.5.5 | Máy sạch, có Node + pnpm, có file `.env` được cấp | Làm theo README | Chạy được toàn bộ ứng dụng trong ≤ 15 phút | M |
| AC-00.5.6 | Trước buổi demo | Chuẩn bị | Có tài khoản demo, phòng mẫu và kịch bản dự phòng (Render) nếu mạng local lỗi | M |

---

### EP-01 · Đăng ký và đăng nhập (YC1)

#### US-01.1 · Đăng ký bằng Username + Mật khẩu + OTP email
**Là** khách truy cập, **tôi muốn** đăng ký bằng username, mật khẩu và email có mã OTP gửi tới hộp thư thật, **để** có tài khoản chính thức.
*Nguồn:* BA 1.1, 1.4, 1.5. *Màn hình:* `SCR-REGISTER`.
*Nguồn:* BA 0.4. *Ghi chú:* gắn vào Custom SMTP của Supabase Auth; khoá SMTP chỉ lưu phía máy chủ/Supabase.
*Sprint:* S1.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-01.1.1 | Bước 1 | Nhập username sai định dạng (không khớp `^[a-zA-Z0-9_]{3,20}$`) | Báo lỗi tại ô, không sang bước 2 | U, E2E |
| AC-01.1.2 | Bước 1 | Nhập username đã tồn tại (không phân biệt hoa thường) | Báo *"Username đã có người dùng"* | I |
| AC-01.1.3 | Bước 1 | Mật khẩu < 8 ký tự hoặc ô xác nhận không khớp | Báo lỗi, không sang bước 2 | U |
| AC-01.1.4 | Bước 2 | Nhập email đã có tài khoản | Báo *"Email này đã được đăng ký"*, **không** gửi OTP | I |
| AC-01.1.5 | Bước 2, email hợp lệ bất kỳ (kể cả Gmail ngoài nhóm) | Bấm "Xác nhận Email" | Gửi OTP 6 số qua SMTP ngoài; hiện ô nhập OTP và đồng hồ 3 phút | E2E, M |
| AC-01.1.6 | Bước 3 | Nhập đúng OTP trong 3 phút | Tài khoản `ACTIVE`, `display_name = username`, tự đăng nhập và vào Sảnh (hoặc phòng mời đang chờ) | E2E |
| AC-01.1.7 | Bước 3 | Nhập sai, mã hết hạn, hoặc bị giới hạn số lần thử | Báo lỗi rõ ràng và hướng dẫn gửi mã mới | E2E |
| AC-01.1.8 | Vừa gửi mã | Muốn gửi lại | Nút "Gửi lại mã OTP" khoá và đếm lùi 60 giây | E2E |
| AC-01.1.9 | Người dùng bỏ dở trước khi xác nhận OTP | Người khác đăng ký cùng username | Username không bị giữ chỗ; bản xác thực tạm được dọn sau khoảng 60 phút | I |
| AC-01.1.10 | Username bị người khác lấy trong lúc chờ OTP | Xác nhận OTP đúng | Báo lỗi và quay về Bước 1, không tạo tài khoản trùng | I |
| AC-01.1.11 | SMTP ngoài đã cấu hình | Đăng ký bằng Gmail không thuộc nhóm | Thư OTP tới hộp thư (mục tiêu ≤ 1 phút), tên người gửi "Cờ Tướng Online", nội dung tiếng Việt | M |
| AC-01.1.12 | Đăng ký liên tiếp 5 lần trong 1 giờ bằng 5 email khác nhau | Gửi OTP | Cả 5 thư đều gửi được (không còn giới hạn 2 thư/giờ của SMTP mặc định) | M |
| AC-01.1.13 | Dịch vụ SMTP lỗi hoặc hết hạn mức | Gửi OTP | Giao diện báo lỗi thật *"Không gửi được mã, vui lòng thử lại sau"*; tài khoản không bị kẹt | I |

#### US-01.2 · Đăng nhập bằng Username + Mật khẩu và khoá thử sai
**Là** người dùng, **tôi muốn** đăng nhập bằng username và mật khẩu an toàn, **để** vào ứng dụng mà tài khoản không bị dò mật khẩu.
*Nguồn:* BA 0.2, 1.8. *Màn hình:* `SCR-LOGIN`. *Ghi chú kỹ thuật:* Supabase Auth đăng nhập bằng email, nên máy chủ tra email từ username rồi xác thực; không trả email hay sự tồn tại của username về client.
*Sprint:* S1.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-01.2.1 | Tài khoản `twot` tồn tại | Đăng nhập bằng `TWOT` + mật khẩu đúng | Thành công, vào Sảnh (hoặc phòng mời đang chờ) | E2E |
| AC-01.2.2 | Bất kỳ | Sai mật khẩu **hoặc** username không tồn tại | Cùng một câu *"Sai tên đăng nhập hoặc mật khẩu"*, thời gian phản hồi không lộ khác biệt rõ rệt | I, E2E |
| AC-01.2.3 | Cùng username đã sai 4 lần trong 15 phút | Sai lần thứ 5 | Username bị chặn đăng nhập mật khẩu 15 phút tính từ lần sai thứ 5 | I |
| AC-01.2.4 | Username đang bị chặn | Thử đăng nhập, **kể cả đúng mật khẩu** | Báo *"Bạn đã thử quá nhiều lần, vui lòng thử lại sau 15 phút"*, không đăng nhập | I, E2E |
| AC-01.2.5 | Username **không tồn tại** sai 5 lần | Thử lần 6 | Hành vi giống hệt username có thật (cũng bị chặn, cùng câu báo) | I |
| AC-01.2.6 | Đã sai 3 lần | Đăng nhập đúng | Thành công, bộ đếm về 0 | I |
| AC-01.2.7 | Ô "Ghi nhớ đăng nhập" mặc định tick | Đăng nhập | Phiên hết hạn cố định sau 30 ngày; bỏ tick thì hết khi đóng trình duyệt hoặc sau 12 giờ, tuỳ cái nào trước | I, M |
| AC-01.2.8 | Đã đăng nhập | Mở `/login` hoặc `/register` | Tự chuyển về `/lobby` | E2E |
| AC-01.2.9 | Username đang bị chặn do sai mật khẩu 5 lần | Chủ tài khoản đăng nhập thành công bằng Google | Vẫn vào được bằng Google; bộ đếm sai mật khẩu **không** bị xoá, đăng nhập bằng mật khẩu vẫn bị chặn tới hết 15 phút (BA 0.15) | I |

#### US-01.3 · Đăng ký/đăng nhập bằng Google và chế độ Khách
**Là** người dùng mới, **tôi muốn** vào ứng dụng nhanh bằng tài khoản Google hoặc bằng tên tạm (Khách), **để** không mất thời gian đăng ký.
*Nguồn:* BA 1.2, 1.4, 0.2. *Màn hình:* `SCR-LOGIN`, `SCR-REGISTER`, `SCR-ONBOARDING`.
*Nguồn:* BA 0.3, 1.3, 1.4 mục 4, 2.4. *Màn hình:* `SCR-LOGIN`, `MODAL-GUEST-NAME`. *Ghi chú kỹ thuật:* có thể dùng đăng nhập ẩn danh của Supabase; cần spike xác nhận.
*Sprint:* S3.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-01.3.1 | Email Google chưa có tài khoản | Bấm "Đăng ký bằng Google" hoặc "Đăng nhập bằng Google" | Chuyển tới `/onboarding`: email chỉ đọc, ô Username và Mật khẩu; không yêu cầu OTP | E2E, M |
| AC-01.3.2 | Đang ở `/onboarding` | Nhập username/mật khẩu hợp lệ, bấm "Hoàn tất thiết lập" | Tạo tài khoản, `display_name = username` (không lấy họ tên Google), vào Sảnh | E2E |
| AC-01.3.3 | Email Google đã thuộc tài khoản Username + Mật khẩu | Bấm đăng ký/đăng nhập Google | Báo *"Email này đã được đăng ký"*, **không** tự liên kết hai tài khoản | I, M |
| AC-01.3.4 | Tài khoản tạo bằng Google đã hoàn tất | Bấm "Đăng nhập bằng Google" | Vào Sảnh ngay | E2E |
| AC-01.3.5 | Tài khoản tạo bằng Google đã hoàn tất | Đăng nhập bằng username + mật khẩu đã đặt | Đăng nhập thành công | E2E |
| AC-01.3.6 | Ở `/onboarding` | Thử đóng/thoát hoặc vào URL khác của ứng dụng | Không có nút X; chưa hoàn tất thì không dùng được ứng dụng | E2E |
| AC-01.3.7 | Bản Google tạm chưa hoàn tất quá 60 phút | Tác vụ dọn chạy (mỗi 5 phút) | Bản tạm bị xoá; tài khoản đã hoàn tất hoặc vừa hoàn tất không bị xoá | I |
| AC-01.3.8 | Ở `SCR-LOGIN` | Nhìn dưới nút "Guest" | Có ghi chú *"Lưu ý: Chế độ Khách (Guest) không được tham gia đánh Xếp hạng để tính điểm Elo và không lưu lịch sử ván cờ."* | E2E |
| AC-01.3.9 | Bấm "Guest" | Nhập tên 2–20 ký tự (có dấu), không chứa từ cấm, bấm "Vào chơi" | Vào Sảnh; tên hiển thị kèm **"(Khách)"** ở mọi nơi | E2E |
| AC-01.3.10 | `MODAL-GUEST-NAME` | Tên < 2, > 20 ký tự hoặc chứa từ cấm | Từ chối với thông báo lỗi tại ô | U, E2E |
| AC-01.3.11 | Khách đang có 1 phòng mở do mình tạo | Tạo phòng thứ hai | Bị chặn kèm tooltip *"Khách chỉ được mở 1 phòng cùng lúc"* | I |
| AC-01.3.12 | Phiên Khách đủ 12 giờ khi đang ngồi ghế hoặc trong ván | Hết 12 giờ | Phiên chưa hết cho đến khi Khách rời ghế/ván | I |
| AC-01.3.13 | Phiên Khách hết hạn hoặc Khách bấm Đăng xuất | Hệ thống xử lý | Về `SCR-LOGIN`; tên và dữ liệu cá nhân của Khách bị xoá; vào lại là danh tính Khách mới | I |
| AC-01.3.14 | Username đang bị chặn | Đăng nhập bằng Google của chính tài khoản đó | Vẫn đăng nhập được (bộ đếm không áp cho Google) | M |
| AC-01.3.15 | Chưa đăng nhập, mở link mời phòng | Chọn "Guest", nhập tên hợp lệ | Tự vào đúng phòng (ghế trống hoặc người xem theo sức chứa), không phải mở link lần hai | E2E |

#### US-01.4 · Phiên đăng nhập, hồ sơ và Đăng xuất
**Là** người chơi, **tôi muốn** phiên và vị trí chơi được quản lý rõ ràng và tự đặt tên hiển thị, **để** không chơi hai nơi cùng lúc và đối thủ nhận ra tôi.
*Nguồn:* BA 1.8, 2.4, 6.3 mục 4. *Ghi chú kỹ thuật:* Supabase cho phép nhiều phiên song song; cần bảng phiên/vị trí chơi phía máy chủ để thực thi luật "thiết bị khác" (spike S1).
*Nguồn:* BA 1.4, 1.6 (email chỉ đọc), Phần 11. *Màn hình:* `SCR-PROFILE-SETTINGS`, `PANEL-NAVBAR`.
*Sprint:* S4.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-01.4.1 | Đang đăng nhập | Dùng ứng dụng liên tục, làm mới token | Hạn phiên **không** được gia hạn; chỉ đăng nhập lại mới tạo hạn mới | I |
| AC-01.4.2 | Phiên chính thức hết hạn khi đang trong ván online | Hết hạn | Mất quyền điều khiển, yêu cầu đăng nhập lại; ván giữ ân hạn 60 giây, đồng hồ vẫn chạy; đăng nhập lại cùng thiết bị trong hạn thì tiếp tục | E2E |
| AC-01.4.3 | Phiên hết hạn khi đang đánh với máy | Hết hạn | Ván AI được giữ 30 phút; đăng nhập lại cùng thiết bị trong hạn thì tiếp tục | I |
| AC-01.4.4 | Tài khoản đang trong ván (online hoặc AI) ở thiết bị A | Đăng nhập thành công ở thiết bị B | Ván bị **xử thua ngay** và kết thúc; thiết bị A bị đăng xuất; thiết bị B vào **Sảnh** | E2E |
| AC-01.4.5 | Tài khoản đang ngồi ghế ở phòng `WAITING` (không có ván) ở thiết bị A | Đăng nhập ở thiết bị B | Không tạo kết quả thua; A bị đăng xuất, rời ghế theo vòng đời phòng; B vào Sảnh | I |
| AC-01.4.6 | Đang ngồi ghế ở một phòng hoặc đang trong ván AI | Bấm Tạo phòng / Vào chơi / Đánh với máy / mở mã phòng khác để ngồi ghế | Nút `DISABLED` kèm tooltip *"Bạn đang ở trong một ván/phòng khác"*; máy chủ cũng từ chối | I, E2E |
| AC-01.4.7 | Có phòng/ván đang dở | Vào Sảnh | Hiện banner *"Bạn có ván đang chơi dở — Quay lại"* dẫn về đúng phòng/ván | E2E |
| AC-01.4.8 | Đang trong ván online | Bấm Đăng xuất | Hiện xác nhận hậu quả đầu hàng; Đồng ý → ván kết thúc `RESIGN`, rời phòng, đăng xuất; Huỷ → giữ nguyên | E2E |
| AC-01.4.9 | Đang ở phòng `WAITING` | Bấm Đăng xuất | Rời phòng theo 2.3 (không xử thua) rồi đăng xuất | E2E |
| AC-01.4.10 | Ở Cài đặt hồ sơ | Nhập Display Name 2–30 ký tự hợp lệ, bấm "Lưu thay đổi" | Lưu ngay, không cần OTP; tên mới hiện ở thanh điều hướng và trong phòng ở lần cập nhật kế tiếp | E2E |
| AC-01.4.11 | Ở Cài đặt hồ sơ | Display Name chứa từ cấm hoặc sai độ dài | Từ chối lưu (không che `***`), báo lỗi tại ô | U, E2E |
| AC-01.4.12 | Ở Cài đặt hồ sơ | Xem thông tin | Thấy avatar chữ cái đầu, `@username`, email **chỉ đọc**; không có nút đổi Username (P2), không có bộ chọn giao diện | E2E |
| AC-01.4.13 | Ở Cài đặt hồ sơ | Bấm "Đăng xuất" | Đăng xuất theo AC-01.4.8/AC-01.4.9 | E2E |
| AC-01.4.14 | Khách | Mở mục Bạn bè, tab mời bạn bè trong `MODAL-INVITE`, hoặc Cài đặt hồ sơ | Bạn bè ở thanh điều hướng `DISABLED` kèm tooltip *"Đăng ký tài khoản để kết bạn"*; tab mời bạn bè ẩn (vẫn có link/mã); Cài đặt chỉ có Đăng xuất | E2E |
| AC-01.4.15 | Khách | Người dùng khác tìm username hoặc mời Khách | Khách không xuất hiện trong tìm kiếm bạn bè, không nhận được lời mời bạn bè | I |
| AC-01.4.16 | Đang trong ván ở nơi khác | Mở link mời | Luật 1.8 được kiểm trước; không tự vào phòng mới để ngồi ghế | I |
| AC-01.4.17 | Đang ngồi ghế phòng online | Bấm "Đánh với máy" | `DISABLED` theo AC-01.4.6 | E2E |

---

### EP-02 · Tạo phòng (YC2)

#### US-02.1 · Tạo phòng, ghế và bắt đầu ván
**Là** người dùng hoặc Khách, **tôi muốn** tạo phòng với tên, mức giờ, số người xem rồi cùng đối thủ Sẵn sàng để bắt đầu, **để** so tài với người mình mời.
*Nguồn:* BA 2.1, 2.3 mục 1, 2.7 mục 1, 2.8 mục 1. *Màn hình:* `MODAL-CREATE-ROOM`, `SCR-WAITING-ROOM`.
*Nguồn:* BA 2.3 mục 1, 3, 4, 5; 2.8 mục 4; 8.3. *Màn hình:* `SCR-WAITING-ROOM`.
*Sprint:* S2.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-02.1.1 | Ở Sảnh, không ngồi ghế nơi khác | Bấm "Tạo phòng" | Mở form: Tên phòng (1–60 ký tự), Mức giờ 5/10/15 phút (**mặc định 10**), Người xem *Không có người xem* hoặc 1–5 (**mặc định 5**) | E2E |
| AC-02.1.2 | Form | Tên phòng rỗng, > 60 ký tự hoặc chứa từ cấm | Từ chối, báo lỗi tại ô | U, E2E |
| AC-02.1.3 | Form hợp lệ | Bấm Tạo | Phòng tạo ở `CODE_ONLY`, có mã 8 ký tự do máy chủ sinh và link mời; người tạo là Host, ngồi **ghế Đỏ**; vào `/rooms/:id` trạng thái `WAITING` | E2E |
| AC-02.1.4 | Phòng đã tạo | Tìm cách đổi mức giờ hoặc số người xem | Không có chức năng đổi | M |
| AC-02.1.5 | Sức chứa | Kiểm tra | = 2 + số người xem đã chọn (tối đa 7) | U |
| AC-02.1.6 | Chỉ có một người ngồi ghế (Host) | Bấm "Đổi ghế" | Chuyển Đỏ ↔ Đen tùy thích, không cần ai duyệt | E2E |
| AC-02.1.7 | Đủ hai người | Mỗi người bấm "Sẵn sàng"/huỷ Sẵn sàng | Trạng thái hiển thị realtime cho cả phòng | E2E |
| AC-02.1.8 | Cả hai Sẵn sàng | Hệ thống | Đếm **3… 2… 1…** kèm âm thanh; hết đếm, máy chủ kiểm lại hai ghế, Sẵn sàng và kết nối rồi tạo ván (Match ID mới), chuyển `SCR-GAME-ROOM`, đồng hồ Đỏ chạy | E2E |
| AC-02.1.9 | Đang đếm | Một người mất kết nối | Huỷ đếm, Sẵn sàng của cả hai về chưa sẵn sàng, giữ ghế người mất kết nối 60 giây; không tạo ván, không xử thua | I, E2E |
| AC-02.1.10 | Phòng `WAITING` | Thành phần người ngồi ghế thay đổi | Sẵn sàng của cả hai reset | I |
| AC-02.1.11 | Host rời phòng `WAITING` khi còn người chơi thứ hai | Host rời | Quyền Host chuyển cho người chơi còn lại | E2E |
| AC-02.1.12 | Không còn người ngồi ghế (Host rời khi chỉ một mình, hoặc người cuối mất ghế sau 60 giây) | Hệ thống | Phòng `CLOSED`; người xem về Sảnh với thông báo *"Phòng đã đóng"*; chat phòng bị xoá | I, E2E |
| AC-02.1.13 | Host chỉ ngồi một mình rất lâu | Không ai vào | Phòng **không** tự đóng do chờ lâu (BA 0.10) | M |

#### US-02.2 · Xin đổi bên và ở lại phòng sau ván
**Là** người chơi, **tôi muốn** đề nghị đổi Đỏ/Đen và ở lại phòng để đánh tiếp sau mỗi ván, **để** chọn tiếp tục hay đổi phe mà không phải tạo phòng mới.
*Nguồn:* BA 0.6, 2.3 mục 2, 3.6. *Màn hình:* `SCR-WAITING-ROOM`, `MODAL-SIDE-SWAP-PROMPT`.
*Nguồn:* BA 0.7. *Màn hình:* `MODAL-MATCH-RESULT`, `SCR-WAITING-ROOM`.
*Sprint:* S3.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-02.2.1 | Phòng `WAITING` đủ hai người (vừa vào hoặc sau ván) | Xem cụm nút | Cả hai người chơi có nút "Xin đổi bên"; người xem không có | E2E |
| AC-02.2.2 | A bấm "Xin đổi bên" | B nhận | B thấy `MODAL-SIDE-SWAP-PROMPT` đếm 30 giây với "Đồng ý"/"Từ chối"; A thấy trạng thái chờ và nút "Rút đề nghị" | E2E |
| AC-02.2.3 | B bấm "Đồng ý" | Hệ thống | Hai người hoán đổi Đỏ ↔ Đen; Sẵn sàng của cả hai về chưa sẵn sàng | E2E |
| AC-02.2.4 | B từ chối hoặc hết 30 giây | A muốn gửi lại | Nút của A `DISABLED` 60 giây kèm tooltip đếm giây còn lại | E2E |
| AC-02.2.5 | A đang có đề nghị chờ | A bấm lại | Không gửi được đề nghị thứ hai (tối đa 1 đề nghị chờ) | I |
| AC-02.2.6 | Đề nghị đang chờ | Cả hai Sẵn sàng và bắt đầu đếm, hoặc một người rời ghế | Đề nghị tự huỷ | I |
| AC-02.2.7 | Đang đếm 3-2-1 hoặc đang ván | Xem cụm nút | Không có nút "Xin đổi bên" | E2E |
| AC-02.2.8 | Ván vừa kết thúc | Hệ thống | Hộp kết quả có "Ở lại phòng" và "Rời phòng"; phòng đã ở `WAITING`, Sẵn sàng của cả hai = chưa | E2E |
| AC-02.2.9 | Bấm "Ở lại phòng" | Hệ thống | Về phòng chờ; giữ nguyên ghế/phe, người xem, chế độ phòng, mức giờ, Host, Kênh Riêng và Kênh Chung | E2E |
| AC-02.2.10 | Cả hai Sẵn sàng | Hệ thống | Ván mới với Match ID mới, đồng hồ đặt lại đầy đủ theo mức giờ phòng | E2E |
| AC-02.2.11 | Một người chơi bấm "Rời phòng" | Hệ thống | Ghế đó trống; phòng vẫn `WAITING`; Host chuyển cho người còn lại nếu người rời là Host; phòng `LOCKED` vẫn khoá | E2E |
| AC-02.2.12 | Sau ván, không ai rời | 10 phút trôi qua | Phòng **không** tự đóng | I |
| AC-02.2.13 | Người thứ hai vừa ngồi vào ghế còn lại | Xem cụm nút | Nút "Đổi ghế" biến mất, chỉ còn "Xin đổi bên" (US-02.2); người thứ hai rời ghế thì "Đổi ghế" xuất hiện lại | E2E |
| AC-02.2.14 | Hộp kết quả | Nút | Chỉ có "Ở lại phòng" và "Rời phòng" (không Tái đấu, không Xem lại) | E2E |

---

### EP-03 · Mời vào phòng (YC3)

#### US-03.1 · Mời bằng link/mã và vào phòng
**Là** người được mời (kể cả chưa kết bạn), **tôi muốn** vào phòng bằng link hoặc mã, **để** chơi hoặc xem ngay.
*Nguồn:* BA 2.4, 2.6, 2.7, 2.8, 4.2, 0.3. *Màn hình:* `MODAL-INVITE`, `SCR-LOBBY`, `SCR-LOGIN`, `SCR-ACCESS-DENIED`.
*Sprint:* S2.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-03.1.1 | Người chơi trong phòng | Mở "Chia sẻ phòng" | Thấy link và mã 8 ký tự (chữ monospace) với nút Sao chép; P1 không có QR | E2E |
| AC-03.1.2 | Đã đăng nhập | Mở link mời hoặc nhập mã ở Sảnh | Vào phòng ngay, không cần kết bạn với Host | E2E |
| AC-03.1.3 | Chưa đăng nhập | Mở link mời | Thấy màn Đăng nhập/Đăng ký; sau khi đăng nhập hoặc đăng ký xong thì **tự vào đúng phòng** (đường vào bằng Khách: xem US-01.3), không phải mở link lần hai | E2E |
| AC-03.1.4 | Vào phòng | Còn ghế trống | Được xếp vào ghế trống (Host Đỏ → vào Đen và ngược lại) | E2E |
| AC-03.1.5 | Vào phòng | Hai ghế đã kín, còn chỗ xem | Vào làm Người xem, thông báo *"Ghế đấu đã đủ 2 người, bạn đang tham gia phòng với vai trò Người xem."* | E2E |
| AC-03.1.6 | Vào phòng | Phòng đã đủ sức chứa (hoặc "Không có người xem" và đủ 2 ghế) | `SCR-ACCESS-DENIED`: *"Phòng thi đấu đã đầy người, vui lòng chọn phòng khác!"* + nút "Quay về Sảnh chính" | E2E |
| AC-03.1.7 | Mã sai hoặc phòng đã đóng | Nhập mã | Báo *"Mã phòng không tồn tại hoặc phòng đã đóng"* | E2E |

#### US-03.2 · Bạn bè và mời bạn online
**Là** người dùng, **tôi muốn** kết bạn, biết bạn nào đang online và mời họ vào phòng ngay trong game, **để** rủ bạn chơi chỉ với một chạm.
*Nguồn:* BA 5.5, Phần 11 (Bạn bè P1 tối thiểu). *Màn hình:* `SCR-FRIENDS`.
*Nguồn:* BA 5.5 mục 4–5, 1.8 (hàng đợi). *Màn hình:* `SCR-FRIENDS`, `PANEL-NAVBAR`.
*Nguồn:* BA 2.5, 2.7 mục 3, 2.8, 4.3. *Màn hình:* `MODAL-INVITE`.
*Sprint:* S3.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-03.2.1 | Ở `SCR-FRIENDS` | Gõ tiền tố username (không phân biệt hoa thường) | Hiện kết quả gồm avatar, Display Name, `@username`, nút "Kết bạn"; không hiện Khách | E2E |
| AC-03.2.2 | Chưa là bạn | Bấm "Kết bạn" | Bên kia thấy lời mời ở tab "Lời mời kết bạn đang chờ" và ở chuông | E2E |
| AC-03.2.3 | Có lời mời đến | Bấm "Chấp nhận" / "Từ chối" | Chấp nhận → cả hai thấy nhau trong danh sách bạn; Từ chối → lời mời biến mất | E2E |
| AC-03.2.4 | Đã gửi lời mời | Bấm thu hồi | Lời mời bị huỷ ở cả hai phía | I |
| AC-03.2.5 | Lời mời chờ quá 30 ngày | Hệ thống kiểm | Lời mời tự hết hạn | I |
| AC-03.2.6 | Đã có 200 bạn **hoặc** tổng lời mời chờ (gửi + nhận) = 50 | Gửi lời mời mới | Bị chặn kèm lý do | I |
| AC-03.2.7 | A đã bị B từ chối 2 lần | A gửi lại cho B | Không gửi được | I |
| AC-03.2.8 | A và B gửi lời mời cho nhau gần như cùng lúc | Máy chủ xử lý | Chỉ giữ **một** lời mời, không tự thành bạn; bên nhận phải Chấp nhận | I |
| AC-03.2.9 | Danh sách bạn | Bấm "Huỷ kết bạn" | Hai bên không còn trong danh sách của nhau | E2E |
| AC-03.2.10 | Bạn B mở ứng dụng (có kết nối) | A xem danh sách | B hiện 🟢 Online trong ≤ 5 giây, không cần tải lại | E2E |
| AC-03.2.11 | B ngồi ghế trong một phòng | A xem danh sách | B hiện 🟠 Đang đấu | E2E |
| AC-03.2.12 | B đóng mọi tab | A xem danh sách | B chuyển ⚫ Offline (sau khi hết thời gian nhận biết mất kết nối) | E2E |
| AC-03.2.13 | Có lời mời kết bạn đang chờ | Bấm chuông ở thanh điều hướng | Liệt kê lời mời, có số đếm | E2E |
| AC-03.2.14 | Ở `SCR-FRIENDS` | Nhìn nút "Nhắn tin", "Thách đấu" | `DISABLED` kèm tooltip *"Sắp ra mắt"*; trang không có nút mời vào phòng | E2E |
| AC-03.2.15 | Người dùng đang ngồi ghế phòng tự tạo | Mở "Chia sẻ phòng" | Có tab bạn bè; người xem không thấy nút Chia sẻ | E2E |
| AC-03.2.16 | Danh sách bạn trong tab | Xem nút "Mời" | 🟢 bấm được; ⚫ `DISABLED` nhãn *"Ngoại tuyến"*; 🟠 `DISABLED` tooltip *"Bạn bè đang trong ván khác"* | E2E |
| AC-03.2.17 | Gửi mời cho bạn 🟢 | Bạn nhận | Pop-up góc màn hình *"Người chơi [Tên] mời bạn tham gia phòng cờ [Tên phòng]"* với [Tham gia] [Từ chối], đếm lùi 30 giây | E2E |
| AC-03.2.18 | Pop-up đang hiện | Bấm "Tham gia" | Vào phòng theo 2.8: ghế trống → ghế; hết ghế → người xem nếu còn chỗ; đầy → `SCR-ACCESS-DENIED` | E2E |
| AC-03.2.19 | Pop-up | Không bấm trong 30 giây hoặc bấm "Từ chối" | Pop-up biến mất, lời mời hết hiệu lực; không lưu vào chuông | E2E |
| AC-03.2.20 | Lời mời đã gửi, sau đó phòng chuyển `LOCKED` | Người nhận bấm Tham gia | Bị từ chối (lời mời chưa dùng đã bị thu hồi) | I |
| AC-03.2.21 | Người được mời đang ngồi ghế phòng khác | Bấm Tham gia | Không được ngồi ghế thứ hai; thông báo theo AC-01.4.6 | I |

---

### EP-04 · Khởi tạo bàn cờ (YC4)

#### US-04.1 · Lõi luật cờ dùng chung
**Là** hệ thống, **tôi cần** một thư viện luật cờ duy nhất dùng cho máy chủ, client và máy cờ, **để** mọi nơi phân xử giống nhau.
*Nguồn:* BA 3.3 mục 1–2, 3.5. *Ghi chú:* `packages/xiangqi-core`, phủ unit test cao (mục tiêu ≥ 90% dòng).
*Sprint:* S1.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-04.1.1 | Thế khai cuộc | Sinh nước hợp lệ | Đúng 44 nước; perft độ sâu 2 = 1.920, độ sâu 3 = 79.666 (đối chiếu số perft công bố trước khi dùng làm chuẩn) | U |
| AC-04.1.2 | Bộ thế kiểm thử | Sinh nước | Đúng luật: cản chân Mã, chặn mắt Tượng, Tượng không qua sông, Sĩ/Tướng trong cung, Pháo cần đúng một ngòi khi ăn, Tốt qua sông được đi ngang và không lùi | U |
| AC-04.1.3 | Nước làm hai Tướng đối mặt không có quân chắn, hoặc để Tướng mình bị chiếu | Kiểm tra | Bị loại khỏi nước hợp lệ | U |
| AC-04.1.4 | Bên tới lượt bị chiếu và không còn nước hợp lệ | Kiểm kết thúc | `CHECKMATE` — bên đó thua | U |
| AC-04.1.5 | Bên tới lượt **không** bị chiếu nhưng hết nước | Kiểm kết thúc | `STALEMATE` — bên đó **thua** | U |
| AC-04.1.6 | Một thế lặp lần thứ 3 trên nhánh nước hiệu lực | Kiểm kết thúc | `DRAW_REPETITION`, trừ khi mọi nước của một bên trong chu kỳ đều là nước chiếu → `PERPETUAL_CHECK`, bên chiếu thua; cả hai cùng chiếu liên tục → hoà | U |
| AC-04.1.7 | 120 nửa nước liên tiếp không ăn quân | Kiểm kết thúc | `DRAW_NO_CAPTURE` | U |
| AC-04.1.8 | Nước cuối vừa chiếu hết vừa thoả điều kiện hoà | Kiểm kết thúc | Chiếu hết được ưu tiên | U |
| AC-04.1.9 | Bất kỳ thế cờ | Tuần tự hoá rồi đọc lại (chuỗi kiểu FEN nội bộ) | Thu được đúng thế cờ, lượt đi và bộ đếm | U |
| AC-04.1.10 | Hai thế có cùng vị trí mọi quân nhưng khác bên tới lượt | Kiểm lặp thế | Không tính là cùng một thế (BA 0.12) | U |
| AC-04.1.11 | Một thế xuất hiện lần thứ 3 trên nhánh nước hiệu lực | Xác định chu kỳ để xét chiếu liên tục | Chu kỳ gồm mọi nước từ lần xuất hiện thứ 1 đến lần thứ 3 của thế đó; bên chiếu ở **mọi** nước của mình trong chu kỳ là chiếu liên tục (BA 0.12) | U |

#### US-04.2 · Khởi tạo và hiển thị bàn cờ
**Là** người chơi, **tôi muốn** thấy bàn cờ chuẩn với quân chữ Hán, **để** chơi quen thuộc như cờ thật.
*Nguồn:* BA 3.1, 6.3 mục 1, DESIGN §7. *Màn hình:* `SCR-GAME-ROOM`, `SCR-AI-GAME`.
*Sprint:* S1.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-04.2.1 | Ván mới | Bàn cờ hiện | SVG 9×10 giao điểm, sông, hai cung; 32 quân đúng vị trí; chữ Hán Đỏ 帥仕相俥傌炮兵, Đen 將士象車馬砲卒 | E2E, M |
| AC-04.2.2 | Người chơi cầm Đen | Bàn cờ hiện | Tự lật để Đen ở phía dưới | E2E |
| AC-04.2.3 | Màn hình 360 px và màn hình máy tính | Xem bàn cờ | Toàn bộ bàn cờ hiển thị không cuộn ngang, quân đủ lớn để chạm | M |
| AC-04.2.4 | Trình đọc màn hình / người mù màu | Tương tác | Quân có viền phân biệt bên; có nhãn văn bản cho quân và trạng thái lượt (WCAG 2.1 AA) | M |

#### US-04.3 · Đi cờ bằng click/kéo thả và âm thanh
**Là** người chơi, **tôi muốn** đi quân bằng click hoặc kéo thả kèm gợi ý ô hợp lệ và tiếng gõ cờ, **để** đi nhanh, không nhầm và có cảm giác như cờ thật.
*Nguồn:* BA 3.4 mục 1–2, DESIGN §4, §7.4.
*Nguồn:* BA 3.4 mục 3.
*Sprint:* S2.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-04.3.1 | Tới lượt mình | Click/chạm vào quân mình | Quân có vòng chọn; chấm tròn ở mọi ô được đi; vòng cố định (không nhấp nháy) quanh quân đối phương ăn được | E2E |
| AC-04.3.2 | Đã chọn quân | Click ô hợp lệ | Quân đi tới ô đó | E2E |
| AC-04.3.3 | Đã chọn quân | Click lại quân, click ô không hợp lệ, hoặc nhấn `Esc` | Huỷ chọn | E2E |
| AC-04.3.4 | Tới lượt mình | Kéo thả (chuột hoặc chạm giữ) vào ô hợp lệ | Hạ quân thành công | E2E |
| AC-04.3.5 | Kéo thả | Thả vào ô không hợp lệ | Quân trượt mượt về chỗ cũ | E2E |
| AC-04.3.6 | Không phải lượt mình, hoặc là người xem | Bấm/kéo quân | Không chọn được quân | E2E |
| AC-04.3.7 | Vừa có nước đi | Bàn cờ | 4 góc vuông đánh dấu ô đi và ô đến của nước gần nhất (cả người chơi lẫn người xem thấy) | E2E |
| AC-04.3.8 | Một bên bị chiếu | Bàn cờ | Vòng cảnh báo quanh Tướng + chữ *"Đang bị chiếu"* + biểu tượng; tối đa một nhịp sáng, không nhấp nháy/rung; bật giảm chuyển động thì không có hiệu ứng | E2E, M |
| AC-04.3.9 | Âm thanh bật | Đi quân / ăn quân / chiếu / kết thúc ván | Phát đúng 4 âm khác nhau tạo bằng Web Audio API (không tải file âm thanh) | M |
| AC-04.3.10 | Góc trên bàn cờ | Bấm biểu tượng loa | Tắt/bật tất cả âm thanh bàn cờ ngay; lựa chọn giữ khi chuyển ván trong cùng phiên trình duyệt | E2E |

---

### EP-05 · Hai người đánh cờ online (YC5)

#### US-05.1 · Ván online: đi cờ, đồng hồ và kết thúc ván
**Là** người chơi, **tôi muốn** nước đi được máy chủ phân xử và đồng bộ ngay, đồng hồ chính xác và kết quả rõ ràng, **để** ván đấu công bằng.
*Nguồn:* BA 3.3 mục 1, 4.3 mục 2. *Phụ thuộc:* US-00.3, US-05.1.
*Nguồn:* BA 2.1, 3.3 mục 3.
*Nguồn:* BA 3.3, 3.5 mục 5, 0.7. *Màn hình:* `MODAL-MATCH-RESULT`.
*Sprint:* S2.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-05.1.1 | Tới lượt A | A đi nước hợp lệ | Máy chủ chấp nhận; B và mọi người xem thấy nước đi (mục tiêu < 100 ms trong môi trường demo, NFR-01) | I, E2E |
| AC-05.1.2 | Client bị sửa để gửi nước sai luật hoặc đi khi không tới lượt | Máy chủ nhận | Từ chối; bàn cờ client đồng bộ lại theo máy chủ | I |
| AC-05.1.3 | Mạng chập chờn gửi trùng lệnh | Máy chủ nhận | Nước đi chỉ áp dụng một lần (AC-00.3.2) | I |
| AC-05.1.4 | Ván đang diễn ra | Mỗi nước | Nước đi được lưu bền (`match_moves`) theo NFR-09 | I |
| AC-05.1.5 | Ván bắt đầu | Hệ thống | Hai đồng hồ theo mức giờ phòng (5/10/15 phút), chỉ đồng hồ bên tới lượt chạy, không cộng giây | E2E |
| AC-05.1.6 | Đồng hồ một bên về 0 | Máy chủ | Kết thúc ván, bên đó thua `TIMEOUT` | I, E2E |
| AC-05.1.7 | Nước đi tới máy chủ khi đồng hồ người đi đã về 0 | Máy chủ xử lý | Tính giờ trước: xử `TIMEOUT`, không chấp nhận nước | I |
| AC-05.1.8 | Client bị lệch đồng hồ hoặc tab bị ẩn | Quay lại | Đồng hồ hiển thị khớp máy chủ (sai số ≤ 1 giây) | E2E |
| AC-05.1.9 | Một điều kiện kết thúc xảy ra (US-04.1) | Máy chủ | Tự kết thúc ván, không cần ai bấm | I |
| AC-05.1.10 | Ván kết thúc | Hai người chơi | Hộp kết quả: Thắng/Thua/Hoà + lý do tiếng Việt cho mọi lý do P1: chiếu hết, hết nước đi, đầu hàng, hết giờ, mất kết nối, lặp thế, thoả thuận hoà, không ăn quân 120 nửa nước, chiếu liên tục, bị gián đoạn | E2E |
| AC-05.1.11 | Ván kết thúc | Người xem | Thấy kết quả và lý do (không có nút của người chơi) | E2E |
| AC-05.1.12 | Ván kết thúc | Dữ liệu | Kết quả, lý do, thời điểm lưu bền ở `matches` | I |
| AC-05.1.13 | Người xem | Mở phòng | Thấy bàn cờ cùng hướng Đỏ ở dưới, không thao tác được quân | E2E |

#### US-05.2 · Đầu hàng và xin hoà
**Là** người chơi, **tôi muốn** đầu hàng có xác nhận và đề nghị hoà mà không chặn bàn cờ, **để** kết thúc ván văn minh, không bấm nhầm.
*Nguồn:* BA 2.3 mục 5, 3.3 mục 2. *Màn hình:* `MODAL-CONFIRM-RESIGN`, `MODAL-CONFIRM-LEAVE`.
*Nguồn:* BA 3.3 mục 2, 3.5 mục 4, 3.6 mục 2, 5. *Màn hình:* `MODAL-DRAW-PROMPT`.
*Sprint:* S3.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-05.2.1 | Đang ván | Bấm "Đầu hàng" | Xác nhận *"Bạn có chắc chắn muốn đầu hàng? Bạn sẽ bị xử THUA ngay lập tức…"*, focus ở Huỷ; Đồng ý → `RESIGN`, đối thủ thắng | E2E |
| AC-05.2.2 | Đang ván | Bấm "Rời phòng" | Cảnh báo rời phòng = đầu hàng; "Rời phòng" → thua `RESIGN` rồi rời; "Ở lại" → giữ nguyên | E2E |
| AC-05.2.3 | Host rời giữa ván | Hệ thống | Host thua `RESIGN`, quyền Host chuyển cho người còn lại | I |
| AC-05.2.4 | Có toast/thông báo đang hiện | Nhìn nút Đầu hàng | Toast không che nút Đầu hàng | M |
| AC-05.2.5 | Đang ván | A bấm "Xin hoà" | B thấy khung **không modal** đếm 30 giây "Chấp nhận Hoà"/"Từ chối"; bàn cờ và đồng hồ vẫn chạy; X/Esc chỉ thu gọn và có nút mở lại | E2E |
| AC-05.2.6 | B bấm "Chấp nhận Hoà" | Hệ thống | Ván kết thúc `DRAW_AGREEMENT` | E2E |
| AC-05.2.7 | B từ chối hoặc hết 30 giây | A muốn xin lại | Nút `DISABLED` cho tới khi A đi thêm **5 nước**, tooltip nêu số nước còn chờ | E2E |
| AC-05.2.8 | A có đề nghị đang chờ | A bấm "Rút đề nghị" | Đề nghị bị huỷ ở phía B | E2E |
| AC-05.2.9 | Đề nghị đang chờ | Ván kết thúc vì lý do khác | Đề nghị đóng; phản hồi đến sau không đổi kết quả | I |

#### US-05.3 · Mất kết nối và nối lại
**Là** người chơi, **tôi muốn** có 60 giây để quay lại khi rớt mạng, **để** không thua oan vì sự cố ngắn.
*Nguồn:* BA 3.3 mục 4, 8.3, 10.1 (ván gián đoạn). *Màn hình:* `OVERLAY-RECONNECTING`.
*Sprint:* S4.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-05.3.1 | A mất kết nối trong ván | Hệ thống | A thấy lớp phủ đếm 60 giây (không đóng bằng Esc); B thấy *"Đối thủ đang mất kết nối, thời gian chờ: 60s"*; đồng hồ ván vẫn chạy | E2E |
| AC-05.3.2 | A nối lại trong 60 giây | Hệ thống | Lớp phủ tắt, bàn cờ/đồng hồ/chat đồng bộ lại, ván tiếp tục | E2E |
| AC-05.3.3 | Quá 60 giây | Máy chủ | A thua `DISCONNECT` | I, E2E |
| AC-05.3.4 | A mất kết nối khi tới lượt A, đồng hồ A về 0 trước khi hết ân hạn | Máy chủ | Xử `TIMEOUT` | I |
| AC-05.3.5 | Cả hai cùng mất kết nối, máy chủ vẫn chạy | Cả hai quá ân hạn | Bên mất kết nối **trước** thua `DISCONNECT` | I |
| AC-05.3.6 | Máy chủ khởi động lại giữa ván | Người chơi nối lại | Hộp kết quả trung tính *"Ván bị gián đoạn"*: không thắng/thua/hoà, chỉ có nút Rời phòng | I, M |

---

### EP-06 · Chế độ phòng và người xem (YC6)

#### US-06.1 · Cài đặt phòng: PUBLIC / CODE_ONLY / LOCKED
**Là** Host, **tôi muốn** mở công khai, chỉ cho vào bằng mã, hoặc khoá phòng, **để** kiểm soát ai được vào.
*Nguồn:* BA 2.7 mục 2, 2.8 mục 5–6, 4.3. *Màn hình:* `MODAL-ROOM-SETTINGS`.
*Sprint:* S4.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-06.1.1 | Trong phòng | Người không phải Host | Không thấy nút "Cài đặt phòng" | E2E |
| AC-06.1.2 | Chưa đủ hai người chơi | Host mở Cài đặt | Lựa chọn `LOCKED` `DISABLED` kèm tooltip *"Chỉ khoá được khi đã đủ 2 người chơi"* | E2E |
| AC-06.1.3 | Đủ hai người chơi | Host chọn `LOCKED` (kể cả đang ván) | Không ai mới vào được; mọi link/mã/lời mời chưa dùng bị vô hiệu; người xem hiện có vẫn ở lại, không mất hình/tiếng | I, E2E |
| AC-06.1.4 | Phòng `LOCKED` | Người chơi mất mạng rồi nối lại trong 60 giây, người xem trong 5 phút | Vào lại được; quá hạn thì bị coi là người mới (bị chặn) | I |
| AC-06.1.5 | Phòng `LOCKED` | Host mở lại `CODE_ONLY` hoặc `PUBLIC` | Sinh **mã và link mới**; mã/link cũ không dùng được | I |
| AC-06.1.6 | Phòng `LOCKED` | Một người ngồi ghế rời đi | Phòng vẫn `LOCKED` cho đến khi Host tự mở | I |
| AC-06.1.7 | Phòng `LOCKED` | Người mới mở link/mã | Bị từ chối dù có link/mã | I, E2E |

#### US-06.2 · Sảnh và danh sách phòng công khai
**Là** người dùng hoặc Khách, **tôi muốn** Sảnh rõ ràng các lựa chọn, luật chơi và danh sách phòng công khai để vào chơi hoặc xem, **để** tìm trận mà không cần mã.
*Nguồn:* BA 0.5, 2.7. *Màn hình:* `SCR-LOBBY`.
*Nguồn:* BA 2.0, 10.4, Phần 11, DANH-MUC §7. *Màn hình:* `SCR-LOBBY`, `PANEL-NAVBAR`.
*Sprint:* S4.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-06.2.1 | Có phòng `PUBLIC` | Mở Sảnh | Mỗi dòng hiện Tên phòng · Host (kèm "(Khách)" nếu có) · Mức giờ · Trạng thái *Đang chờ*/*Đang đấu* · Người xem *x/N* (N = 0 hiện *"Không cho xem"*) | E2E |
| AC-06.2.2 | Danh sách | Sắp xếp | Phòng mở PUBLIC gần nhất lên đầu; tối đa 50 phòng | I |
| AC-06.2.3 | Đang mở Sảnh | Phòng mới mở PUBLIC, đổi trạng thái, đổi số người, đóng hoặc rời PUBLIC | Danh sách tự cập nhật trong ≤ 2 giây, không cần tải lại | E2E |
| AC-06.2.4 | Phòng còn ghế trống | Xem dòng | Có nút "Vào chơi"; có thêm "Vào xem" nếu còn chỗ xem | E2E |
| AC-06.2.5 | Phòng đủ hai ghế | Xem dòng | Chỉ có "Vào xem" (nếu còn chỗ xem); hết chỗ hoặc N = 0 thì không có nút vào | E2E |
| AC-06.2.6 | Bấm "Vào chơi" | Ghế vừa bị người khác lấy | Còn chỗ xem → vào làm Người xem kèm *"Ghế vừa có người, bạn đang xem trận"*; hết chỗ → báo phòng đầy | I |
| AC-06.2.7 | Bấm "Vào xem" | Còn chỗ | Vào làm Người xem, không tự chiếm ghế dù ghế trống | E2E |
| AC-06.2.8 | Không có phòng PUBLIC | Mở Sảnh | Trạng thái `EMPTY` có lời giải thích và nút "Tạo phòng" | E2E |
| AC-06.2.9 | Phòng `CODE_ONLY`/`LOCKED` | Mở Sảnh | Không xuất hiện | I |
| AC-06.2.10 | Mở Sảnh | Xem bốn lựa chọn | "Đánh Thường – Ghép ngẫu nhiên" và "Đánh Hạng" `DISABLED` kèm *"Sắp ra mắt"*; "Tự tạo phòng" và "Đánh với máy" hoạt động; có ô "Vào phòng bằng mã" | E2E |
| AC-06.2.11 | Mở Sảnh | Mở mục "Luật chơi" | Mở rộng/thu gọn tại chỗ (không trang/modal mới), dùng được bằng bàn phím; nội dung nêu: cách đi của 7 loại quân; chiếu hết = thua; **hết nước đi = thua**; lặp thế 3 lần = hoà; **chiếu liên tục = bên chiếu thua** (cả hai cùng chiếu = hoà); **120 nửa nước không ăn quân = hoà**; xin hoà, đầu hàng, hết giờ, mất kết nối 60 giây; **đuổi quân liên tục không xử riêng (xử hoà theo lặp thế)**; câu *"Đây là bộ luật rút gọn của ứng dụng, không phải toàn bộ luật thi đấu chính thức"* | E2E, M |
| AC-06.2.12 | Thanh điều hướng | Xem mục | Sảnh, Bạn bè hoạt động (Khách: Bạn bè `DISABLED`); Lịch sử, Bảng xếp hạng `DISABLED` *"Sắp ra mắt"*; chuông lời mời kết bạn; avatar + Display Name mở menu Cài đặt hồ sơ | E2E |
| AC-06.2.13 | Màn hình `SCR-LOGIN` | Xem liên kết "Quên mật khẩu?" | `DISABLED` kèm *"Sắp ra mắt"* | E2E |
| AC-06.2.14 | Khách | Vào phòng bằng mã/link, Vào chơi/Vào xem ở Sảnh, Đánh với máy | Đều được phép theo luật phòng | E2E |
| AC-06.2.15 | Host | Chuyển sang `PUBLIC` | Phòng xuất hiện ở danh sách Sảnh trong ≤ 2 giây | E2E |
| AC-06.2.16 | Phòng `PUBLIC` | Host chuyển sang `CODE_ONLY` hoặc `LOCKED` | Phòng biến khỏi danh sách Sảnh; yêu cầu vào từ danh sách cũ bị máy chủ từ chối | I, E2E |

#### US-06.3 · Người xem và đuổi người xem
**Là** Host hoặc người chơi, **tôi muốn** sắp xếp người giữa ghế và hàng người xem và đuổi người xem quấy rối, **để** giữ không gian thi đấu tập trung.
*Nguồn:* BA 2.6, 2.8 mục 3–4, 8.3. *Màn hình:* `SCR-WAITING-ROOM`, `PANEL-SPECTATORS`.
*Nguồn:* BA 4.2, 4.1. *Màn hình:* `PANEL-SPECTATORS`, `MODAL-CONFIRM-KICK`.
*Sprint:* S4.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-06.3.1 | Phòng có người xem | Xem `PANEL-SPECTATORS` | Tiêu đề *"Người xem (X / N)"*, danh sách tên cập nhật realtime | E2E |
| AC-06.3.2 | Phòng `WAITING`/sau ván, còn chỗ xem | Người chơi bấm "Chuyển sang người xem" | Rời ghế thành Người xem; Sẵn sàng reset | E2E |
| AC-06.3.3 | Không còn chỗ xem hoặc phòng "Không có người xem" | Xem nút "Chuyển sang người xem" | `DISABLED` kèm tooltip *"Phòng không còn chỗ cho người xem"* | E2E |
| AC-06.3.4 | Host | Bấm "Chuyển sang người xem" cho người chơi kia (còn chỗ xem) | Người đó thành Người xem | E2E |
| AC-06.3.5 | Host, còn ghế trống | Gửi "Mời xuống ghế" cho một người xem | Người xem thấy lời mời Chấp nhận/Từ chối; Chấp nhận → máy chủ kiểm lại ghế trống, quyền, vị trí chơi rồi xếp vào ghế (vẫn phải Sẵn sàng); ghế đã có người → thông báo và giữ vai trò xem; Từ chối → tiếp tục xem | E2E |
| AC-06.3.6 | Người xem | Tìm cách tự ngồi vào ghế trống | Không có thao tác này | M |
| AC-06.3.7 | Host | Tìm nút tự chuyển mình sang người xem | Nút bị ẩn | E2E |
| AC-06.3.8 | Ván đang diễn ra | Mọi thao tác đổi chỗ ghế ↔ xem | Không khả dụng | E2E |
| AC-06.3.9 | Người xem mất kết nối | Nối lại trong 5 phút | Giữ chỗ xem; quá 5 phút mất chỗ (không xử phạt) | I |
| AC-06.3.10 | Phòng có người xem | Bất kỳ người chơi nào xem danh sách | Có nút "Kick" cạnh từng người xem; người xem không có nút này | E2E |
| AC-06.3.11 | Bấm Kick | Hệ thống | Mở xác nhận *"Bạn có chắc chắn muốn đuổi người xem [Tên] ra khỏi phòng thi đấu không?"*, focus mặc định ở Huỷ | E2E |
| AC-06.3.12 | Xác nhận | Hệ thống | Người bị đuổi rời phòng về Sảnh với *"Bạn đã bị đuổi khỏi phòng thi đấu"*; mất quyền nhận hình/tiếng ngay (GATE-MEDIA ghi thời gian) | E2E, I |
| AC-06.3.13 | Người đã bị đuổi | Vào lại bằng link/mã mới, lời mời hoặc từ Sảnh | Bị chặn đến khi phòng `CLOSED` | I |
| AC-06.3.14 | Người đã bị đuổi khỏi phòng | Vào lại bằng bất kỳ cách nào | `SCR-ACCESS-DENIED`: *"Bạn đã bị đuổi và chặn tham gia phòng cờ này!"* | I, E2E |

---

### EP-07 · Chat, camera và mic (YC7)

#### US-07.1 · Hai kênh chat và bộ lọc
**Là** người chơi, **tôi muốn** một kênh riêng với đối thủ tách khỏi kênh của người xem, có lọc lời thô tục và chống spam, **để** trò chuyện văn minh và riêng tư.
*Nguồn:* BA 5.3 mục 1, 10.1 (chat khi đổi người), 4.1. *Màn hình:* `PANEL-CHAT`.
*Nguồn:* BA 5.3 mục 2.
*Sprint:* S3.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-07.1.1 | Người chơi trên máy tính vào phòng | Khung chat | Mặc định chỉ mở **Kênh Riêng**; có thể mở thêm Kênh Chung để xem song song, ẩn/hiện từng khung | E2E |
| AC-07.1.2 | Người chơi trên điện thoại | Khung chat | Hai kênh trong một khung, chuyển bằng tab, mặc định *Kênh Riêng* | E2E |
| AC-07.1.3 | Người xem | Khung chat | Chỉ có tab Kênh Chung; máy chủ từ chối mọi yêu cầu đọc/gửi Kênh Riêng từ người xem | E2E, I |
| AC-07.1.4 | A–B đang chat riêng; B xuống xem, C lên ghế | C và A mở Kênh Riêng | Chỉ thấy tin từ khi cặp A–C hình thành; B mất quyền đọc Kênh Riêng | I |
| AC-07.1.5 | Người xem mới vào | Mở Kênh Chung | Chỉ thấy tin từ lúc mình vào | I |
| AC-07.1.6 | Cùng cặp A–B Xin đổi bên hoặc đánh ván tiếp | Mở Kênh Riêng | Vẫn thấy tin cũ của cặp | I |
| AC-07.1.7 | Phòng đóng | Dữ liệu | Toàn bộ chat phòng bị xoá | I |
| AC-07.1.8 | Tin có thẻ HTML/script | Hiển thị | Hiện như văn bản thuần (NFR-10) | U, E2E |
| AC-07.1.9 | Tin chứa từ trong danh sách cấm | Gửi | Máy chủ thay từ đó bằng `***` trước khi phát cho mọi người | U, I |
| AC-07.1.10 | Biến thể né lọc (có dấu/không dấu, hoa/thường, chèn khoảng trắng hoặc ký tự đặc biệt, `0`→`o`, `1`→`i`) | Gửi | Vẫn bị che | U |
| AC-07.1.11 | Tin > 200 ký tự | Gửi | Bị chặn ở client và máy chủ | U, I |
| AC-07.1.12 | Đã gửi 5 tin trong 10 giây | Gửi tin thứ 6 | Báo *"Bạn gửi quá nhanh"*, tin không được gửi | I |
| AC-07.1.13 | Nhóm cần thêm từ cấm | Sửa tệp cấu hình danh sách | Áp dụng sau khi khởi động lại server, không sửa CSDL | M |
| AC-07.1.14 | Phòng đang ở trạng thái chờ (`WAITING`) | Người chơi và người xem mở khung chat | Có hai kênh theo vai trò như trong ván: người chơi có Kênh Riêng và Kênh Chung, người xem chỉ Kênh Chung; tin nhắn giữ nguyên khi chuyển sang ván (BA 0.13) | E2E |

#### US-07.2 · Camera, mic và mức chia sẻ
**Là** người chơi, **tôi muốn** bật camera và mic và chọn ai được thấy/nghe mình, **để** giao lưu như ngồi cùng bàn mà vẫn chủ động quyền riêng tư.
*Nguồn:* BA 4.1, 1.8 (nhiều tab), 10.1 (LiveKit Cloud, không ghi). *Màn hình:* `PANEL-MEDIA`. *Phụ thuộc:* spike GATE-MEDIA.
*Nguồn:* BA 4.1, 4.2.
*Sprint:* S3.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-07.2.1 | Người chơi vào phòng | Khung media | Camera và mic mặc định **Tắt** | E2E |
| AC-07.2.2 | Người chơi | Bật/tắt camera, bật/tắt mic | Hai nút độc lập; đối thủ thấy/nghe hoặc ngừng thấy/nghe trong ≤ 2 giây | M |
| AC-07.2.3 | Trình duyệt bị từ chối quyền camera/mic hoặc không có thiết bị | Bấm bật | Báo lỗi tiếng Việt dễ hiểu kèm cách cấp quyền; ván không bị ảnh hưởng | M |
| AC-07.2.4 | Tab mới tiếp quản phiên | Hệ thống | Camera/mic ở tab cũ tự dừng; tab mới mặc định tắt | M |
| AC-07.2.5 | Bất kỳ | Kiểm tra cấu hình | Không bật ghi hình/ghi âm; không lưu media | M |
| AC-07.2.6 | Người chơi rời ghế/rời phòng | Hệ thống | Luồng media của người đó dừng, quyền phát bị thu hồi | I |
| AC-07.2.7 | Người chơi trong phòng tự tạo | Xem mức chia sẻ | Ba mức: *Không chia sẻ* · *Chỉ đối thủ* · *Cả đối thủ và người xem*; chọn sẵn **Chỉ đối thủ**; một mức áp chung cho camera và mic đang bật | E2E |
| AC-07.2.8 | Chọn "Cả đối thủ và người xem" | Người xem | Thấy hình/nghe tiếng của người chơi đó | M |
| AC-07.2.9 | Chọn "Chỉ đối thủ" hoặc "Không chia sẻ" | Người xem / đối thủ | Người xem không nhận; "Không chia sẻ" thì đối thủ cũng không nhận | M |
| AC-07.2.10 | Người xem | Giao diện và token | Không có nút bật camera/mic; token không có quyền phát (`canPublish = false`, `canPublishData = false`) | I, E2E |
| AC-07.2.11 | Đổi mức chia sẻ giữa ván | Hệ thống | Có hiệu lực ngay (≤ 2 giây) | M |
| AC-07.2.12 | Hai người chơi đang ở phòng chờ | Bật camera/mic | Đối thủ (và người xem nếu chọn mức "Cả đối thủ và người xem") thấy/nghe ngay trong phòng chờ; khi bắt đầu ván, hình và tiếng không bị ngắt (BA 0.13) | E2E, M |
| AC-07.2.13 | Dịch vụ camera/mic lỗi, mất kết nối hoặc hết hạn mức | Đang ở phòng chờ hoặc đang ván | Ván tiếp tục bình thường, chat vẫn hoạt động, khung media hiện *"Camera/mic tạm thời không dùng được"*, không xử ai thua (BA 0.14) | I, M |

---

### EP-08 · Đánh với máy theo cấp độ (YC8)

#### US-08.1 · Thiết lập và chơi ván với máy
**Là** người chơi, **tôi muốn** chọn cấp độ và phe rồi chơi với máy không giới hạn thời gian, **để** luyện tập.
*Nguồn:* BA 2.0 mục 4, 6.3, 0.9. *Màn hình:* `MODAL-AI-SETUP`, `SCR-AI-GAME`.
*Sprint:* S3.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-08.1.1 | Ở Sảnh | Bấm "Đánh với máy" | Mở hộp chọn cấp **Dễ / Trung bình / Khó** và phe **Đỏ / Đen / Ngẫu nhiên** | E2E |
| AC-08.1.2 | Chọn Đỏ | Bắt đầu | Vào `/ai/:id`, người chơi đi trước | E2E |
| AC-08.1.3 | Chọn Đen | Bắt đầu | Máy đi nước đầu ngay; bàn cờ lật để Đen ở dưới | E2E |
| AC-08.1.4 | Chọn Ngẫu nhiên | Bắt đầu (lặp nhiều lần) | Máy chủ bốc phe; tỷ lệ xấp xỉ 50/50 | U |
| AC-08.1.5 | Đang ván AI | Màn hình | Không có đồng hồ, không có nút Xin hoà, không gợi ý nước đi, không có nút Đi lại (P2); có nút Đầu hàng | E2E |
| AC-08.1.6 | Ván AI kết thúc (kể cả đầu hàng) | Hộp kết quả | Có "Ván mới" và "Về Sảnh" | E2E |
| AC-08.1.7 | Bấm "Ván mới" | Hệ thống | Mở `MODAL-AI-SETUP` điền sẵn cấp độ và lựa chọn phe ván trước; người chơi đổi phe/cấp rồi Bắt đầu → ván mới có ID mới | E2E |

#### US-08.2 · Máy cờ ba cấp độ
**Là** người chơi, **tôi muốn** ba cấp độ khác biệt rõ rệt, **để** luyện từ dễ đến khó.
*Nguồn:* BA 6.1 (kèm tiêu chí bổ sung 05/10), 6.3 mục 3. *Ghi chú:* negamax + alpha-beta, tìm sâu dần, chạy ở tiến trình/worker riêng; dùng `xiangqi-core`.
*Sprint:* S2.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-08.2.1 | Mọi cấp, mọi thế | Máy chọn nước | Luôn là nước hợp lệ theo `xiangqi-core` | U |
| AC-08.2.2 | Hết ngân sách thời gian khi chưa đạt độ sâu mục tiêu | Máy chọn nước | Đi nước tốt nhất đã tìm được đến lúc đó | U |
| AC-08.2.3 | Máy đang suy nghĩ | Server chính xử lý các phòng khác | Phòng online không bị chậm vì máy cờ (chạy ở tiến trình riêng) | I |

#### US-08.3 · Ổn định ván với máy và hoàn thiện cấp Khó
**Là** người chơi, **tôi muốn** ván với máy không mất vô lý khi rớt mạng hoặc máy cờ lỗi, và cấp Khó đạt chất lượng đã cam kết, **để** yên tâm luyện tập.
*Nguồn:* BA 6.1 (Thử lại), 6.3 mục 4, 1.8.
*Sprint:* S4.

| AC | Given | When | Then | Kiểm |
|---|---|---|---|---|
| AC-08.3.1 | Đang ván AI | Đóng tab hoặc mất mạng, quay lại trong 30 phút | Vào lại `/ai/:id` (hoặc banner ở Sảnh) và chơi tiếp đúng thế cũ | E2E |
| AC-08.3.2 | Quá 30 phút | Hệ thống | Bỏ trạng thái ván trong bộ nhớ; không lưu lịch sử (P1) | I |
| AC-08.3.3 | Máy cờ không trả lời quá 10 giây hoặc lỗi | Hệ thống | Báo *"Máy cờ gặp sự cố"* kèm "Thử lại"; nếu chỉ quá thời gian chờ thì Thử lại tìm nước trên cùng thế; nếu ván đã Bỏ dở thì Thử lại tạo ván mới cùng cấp và phe thực tế | I, M |
| AC-08.3.4 | Bấm "Thử lại" nhiều lần liên tiếp | Hệ thống | Chỉ xử lý một lần (chặn bấm trùng) | I |
| AC-08.3.5 | Máy chủ khởi động lại | Người chơi quay lại | *"Ván không còn trạng thái để tiếp tục"*, về Sảnh hoặc tạo ván mới; không khôi phục giả | M |
| AC-08.3.6 | Đang ván AI | Chủ động Rời ván hoặc Đăng xuất | Xác nhận đầu hàng; Đồng ý → `RESIGN`, huỷ tác vụ máy, giải phóng vị trí chơi; Huỷ → giữ nguyên | E2E |
| AC-08.3.7 | Cấp Dễ / Trung bình / Khó | Máy suy nghĩ | Mục tiêu độ sâu 2 / 4 / 6; thời gian phản hồi ≤ 300 / 1.000 / 3.000 ms (đo p95 trên máy demo, GATE-ENGINE) | I |
| AC-08.3.8 | Bộ thế chiếu hết 1 nước và 2 nước bắt buộc (đáp án đã xác minh) | Cấp Khó giải | Đúng **100%** | U |
| AC-08.3.9 | Đấu máy với máy 20 ván mỗi cặp cấp | Ghi kết quả | Khó thắng Trung bình và Trung bình thắng Dễ ở đa số ván (báo cáo tỷ lệ) | M |

---
## 6. Yêu cầu phi chức năng (NFR)

| Mã | Yêu cầu | Ngưỡng / cách kiểm | Nguồn BA |
|---|---|---|---|
| NFR-01 | Đồng bộ realtime | Nước đi tới đối thủ và người xem < 100 ms (mục tiêu, đo p95 trong môi trường demo) | 4.3 |
| NFR-02 | Quy mô | 50 người dùng đồng thời, 10 phòng/ván cùng lúc không lỗi; phần camera/mic chỉ đo ~3 phòng, chỉ ghi số | 10.1 |
| NFR-03 | Máy cờ | Thời gian theo cấp ≤ 300 / 1.000 / 3.000 ms; cấp Khó 100% bộ chiếu hết ngắn | 6.1 |
| NFR-04 | Bảo mật | Máy chủ phân xử mọi luật; RLS; mật khẩu do Supabase băm; không lộ khoá trong `VITE_*`; khoá thử sai đăng nhập; giới hạn chat | 0.2, 3.3, 5.3 |
| NFR-05 | Trình duyệt và thiết bị | Bản mới Chrome, Edge, Firefox, Safari; responsive từ 360 px; bàn cờ dùng được bằng cảm ứng | 10.1 |
| NFR-06 | Trợ năng | WCAG 2.1 AA cơ bản: tương phản, nhãn, thao tác bàn phím ở form/modal, tôn trọng giảm chuyển động | 3.1, 3.4, DESIGN |
| NFR-07 | Ngôn ngữ | Toàn bộ giao diện tiếng Việt | 10.1 |
| NFR-08 | Nhật ký và sức khoẻ | Log có cấu trúc, `/health`; không log mật khẩu/OTP/token/chat | 10.1 |
| NFR-09 | Lưu giữ dữ liệu | Ván online và nước đi lưu bền; ván AI chỉ trong bộ nhớ; chat phòng xoá khi phòng đóng; biên lai lệnh xoá sau 24 giờ; log tối đa 14 ngày | 10.1 |
| NFR-10 | Hiển thị an toàn | Chat, Display Name, tên phòng, tên Khách hiển thị như văn bản thuần | 10.1 |
| NFR-11 | Quyền riêng tư media | Camera/mic mặc định tắt; không ghi, không lưu | 4.1 |
| NFR-12 | Dữ liệu cá nhân | Chỉ lưu email, username, Display Name, mật khẩu băm, bạn bè, ván; không hỏi tuổi | 10.1 |

---

## 7. Cổng kiểm chứng kỹ thuật

Các cổng nên chạy dưới dạng **Task spike ở Sprint 1** để phát hiện rủi ro sớm.

| Mã | Nội dung | Cách làm | Kết quả cần ghi |
|---|---|---|---|
| GATE-SMTP | OTP thật tới email ngoài nhóm qua SMTP ngoài | Đăng ký bằng 3 Gmail không thuộc nhóm; thử gửi 5 thư/giờ | Thời gian nhận thư, có vào Spam không, hạn mức nhà cung cấp |
| GATE-GOOGLE | Không tự liên kết tài khoản cùng email | Tạo tài khoản email X bằng mật khẩu rồi đăng nhập Google bằng X | Hệ thống báo "Email này đã được đăng ký", không gộp tài khoản |
| GATE-EMAIL | Email không đổi được | Gọi thẳng API đổi email của Supabase bằng phiên người dùng | Bị chặn (nếu cấu hình không chặn được thì ghi rõ "bị chặn ở tầng ứng dụng") |
| GATE-AUTH-USERNAME | Đăng nhập bằng username trên nền Supabase | Tra email theo username phía máy chủ + khoá thử sai | Không lộ email/sự tồn tại username; độ trễ đăng nhập |
| GATE-SESSION | Một vị trí chơi, thiết bị khác xử thua | Đăng nhập 2 trình duyệt khác nhau giữa ván | Ván xử thua đúng, thiết bị cũ bị đăng xuất |
| GATE-GUEST | Khách bằng đăng nhập ẩn danh | Tạo/huỷ phiên Khách, kiểm hạn 12 giờ | Phương án kỹ thuật chốt, giới hạn |
| GATE-MEDIA | LiveKit tự chạy (Docker) và LiveKit Cloud: quyền phát, thu hồi khi đuổi, chuyển môi trường bằng biến, HTTPS cho demo LAN (BA 0.16) | 1 phòng 2 người chơi + 5 người xem trên các máy khác nhau trong LAN; đuổi 1 người; đổi sang Cloud | CPU/RAM LiveKit tự chạy, thời gian thu hồi quyền, phút Cloud đã dùng, **không đặt ngưỡng đạt** |
| GATE-ENGINE | Độ sâu/thời gian máy cờ bằng TypeScript | Chạy bộ 50 thế giữa ván ở mỗi cấp trên máy demo | p95 thời gian, độ sâu đạt được, kết quả bộ chiếu hết |
| GATE-REALTIME | Tải Socket.IO | Kịch bản 50 client / 10 ván | p95 độ trễ, lỗi, tài nguyên |

---

## 8. Kịch bản demo đầu-cuối D1–D10

| Mã | Kịch bản | YC | Story chính |
|---|---|---|---|
| D1 | Đăng ký bằng username + mật khẩu + Gmail ngoài nhóm (OTP thật) → vào Sảnh → đổi Display Name tiếng Việt | YC1 | US-01.1, 01.4 |
| D2 | Đăng ký bằng Google → onboarding → Đăng xuất → đăng nhập bằng username/mật khẩu → Đăng xuất → đăng nhập Google | YC1 | US-01.3, 01.2 |
| D3 | Nhập sai mật khẩu 5 lần → bị chặn 15 phút (kể cả mật khẩu đúng) → đăng nhập Google vẫn được | YC1 | US-01.2 |
| D4 | A tạo phòng (10 phút, 5 người xem) → mời B (bạn online) qua pop-up → gửi mã cho C (chưa kết bạn) → C vào làm người xem; D mở link khi chưa đăng nhập → vào bằng Khách → tự vào phòng làm người xem | YC2, YC3, YC1 | US-02.1, 03.1, 03.2, 01.3 |
| D5 | A và B Xin đổi bên → Sẵn sàng → đếm 3-2-1 → đánh online (click và kéo thả), Xin hoà bị từ chối, chat Kênh Riêng; người xem chat Kênh Chung; A, B bật camera/mic, A chọn chia sẻ cả người xem → ván kết thúc bằng chiếu hết | YC4, YC5, YC7 | US-02.2, 04.x, 05.1, 05.2, 07.1, 07.2 |
| D6 | A mở PUBLIC → người lạ E thấy phòng ở Sảnh, "Vào xem" → A khoá LOCKED → F có mã cũ cũng không vào được → B đuổi E → E không vào lại được | YC6 | US-06.1, 06.2, 06.3 |
| D7 | Sau ván: "Ở lại phòng" → Xin đổi bên → ván 2; một người rời → người còn lại thành Host, phòng vẫn chờ | YC2, YC5 | US-02.2, 02.1 |
| D8 | Rút mạng một người chơi 30 giây → nối lại tiếp tục; lần hai rút quá 60 giây → xử thua `DISCONNECT` | YC5 | US-05.3 |
| D9 | Đánh với máy cấp Dễ cầm Đỏ → đầu hàng → "Ván mới" đổi sang Đen cấp Khó → máy đi trước; cho xem giải thế chiếu hết | YC8 | US-08.1, 08.2, 08.3 |
| D10 | Đang ván online ở laptop → đăng nhập cùng tài khoản trên điện thoại → ván xử thua, laptop bị đăng xuất, điện thoại vào Sảnh | YC1, YC5 | US-01.4 |

---
## 9. Thứ tự phụ thuộc và phân bổ Sprint

### 9.1 Phụ thuộc giữa các Story (A → B: B cần kết quả của A)

```text
US-00.1 ─┬─> US-00.2 ─┬─> US-01.x (tài khoản)
         │            └─> US-02.1 (phòng) ─┬─> US-03.1 (link/mã) ─┬─> US-06.x (chế độ phòng, Sảnh, người xem)
         ├─> US-00.3 (realtime) ──────────┘                      └─> US-03.2 (bạn bè, mời online)
         └─> US-04.1 (lõi luật) ─┬─> US-04.2/04.3 (bàn cờ) ─> US-05.1 (ván online) ─┬─> US-05.2, 05.3, 02.2, 07.x
                                 └─> US-08.2 (máy cờ) ─> US-08.1 ─> US-08.3          └─> US-01.4 (phiên)
Mọi Story tính năng ─> US-00.5 (nghiệm thu tổng, đóng gói, demo)
```

### 9.2 Phân bổ Sprint

| Sprint | Thời gian | Story được **thi công** (bằng Task) | Increment / Release |
|---|---|---|---|
| Đặc tả (ngoài Sprint) | 07/10 → hạn từng Story | BA đặc tả 9 Epic, 27 Story; Story nào có Task sớm thì duyệt trước (quy tắc R1) | Story được PO duyệt trước khi Task đầu tiên của nó bắt đầu |
| S1 | 08–14/10 | US-00.1, US-00.2, US-00.3, US-00.4, US-01.1, US-01.2, US-04.1, US-04.2 | **v0.1 · Nền tảng kỹ thuật, đăng ký/đăng nhập thật, bàn cờ đúng luật trên một máy** |
| S2 | 15–21/10 | US-02.1, US-03.1, US-04.3, US-05.1, US-08.2 | **v0.2 · Tạo phòng, vào bằng link/mã, hai người đánh trọn ván online có đồng hồ; máy cờ chạy được** |
| S3 | 22–28/10 | US-01.3, US-02.2, US-03.2, US-05.2, US-07.1, US-07.2, US-08.1 | **v0.3 · Google/Khách, Xin đổi bên và ở lại phòng, đầu hàng/xin hoà, bạn bè và mời online, chat, camera/mic, đánh với máy** |
| S4 | 29/10–04/11 | US-00.5, US-01.4, US-05.3, US-06.1, US-06.2, US-06.3, US-08.3 | **v1.0 · Phiên và hồ sơ, mất kết nối, chế độ phòng, Sảnh công khai, người xem, hoàn thiện máy cờ cấp Khó; nghiệm thu D1–D10 và đóng gói demo** |

Ngày bắt đầu/kết thúc, người làm và giờ của từng Task: [KE-HOACH-JIRA.md](KE-HOACH-JIRA.md).

---
## 10. Truy vết

### 10.1 Yêu cầu khách hàng → Epic → Story

| YC | Yêu cầu gốc | Epic / Story |
|---|---|---|
| YC1 | Đăng ký/đăng nhập username + mật khẩu hoặc Google | EP-01: US-01.1 – 01.4 |
| YC2 | Tạo phòng chơi để so tài | EP-02: US-02.1 – 02.2 |
| YC3 | Mời bạn vào phòng (trong game, link, mã) | EP-03: US-03.1 – 03.2 |
| YC4 | Khởi tạo bàn cờ | EP-04: US-04.1 – 04.3 |
| YC5 | Hai người đánh cờ online | EP-05: US-05.1 – 05.3 |
| YC6 | Công khai / khoá / khoá có mã, tối đa 5 người xem – 7 người/phòng | EP-06: US-06.1 – 06.3 |
| YC7 | Chat, camera, mic giữa hai người; kênh chat người xem riêng | EP-07: US-07.1 – 07.2 |
| YC8 | Đánh với máy theo cấp độ | EP-08: US-08.1 – 08.3 |
| — | Nền tảng và chất lượng phục vụ chung | EP-00: US-00.1 – 00.5 |

### 10.2 Thành phần giao diện P1 (26) → Story

| Thành phần | Story | Thành phần | Story |
|---|---|---|---|
| `SCR-LOGIN` | 01.2, 01.3, 06.2 | `SCR-REGISTER` | 01.1, 01.3 |
| `SCR-ONBOARDING` | 01.3 | `SCR-LOBBY` | 06.2, 03.1, 01.4 |
| `SCR-WAITING-ROOM` | 02.1, 02.2, 06.3 | `SCR-GAME-ROOM` | 04.2, 04.3, 05.1 – 05.3 |
| `SCR-AI-GAME` | 08.1, 08.3 | `SCR-FRIENDS` | 03.2 |
| `SCR-ACCESS-DENIED` | 03.1, 06.3 | `SCR-PROFILE-SETTINGS` | 01.4 |
| `MODAL-GUEST-NAME` | 01.3 | `MODAL-CREATE-ROOM` | 02.1 |
| `MODAL-INVITE` | 03.1, 03.2 | `MODAL-ROOM-SETTINGS` | 06.1 |
| `MODAL-AI-SETUP` | 08.1 | `MODAL-SIDE-SWAP-PROMPT` | 02.2 |
| `MODAL-DRAW-PROMPT` | 05.2 | `MODAL-CONFIRM-RESIGN` | 05.2 |
| `MODAL-CONFIRM-LEAVE` | 05.2, 08.3 | `MODAL-CONFIRM-KICK` | 06.3 |
| `MODAL-MATCH-RESULT` | 05.1, 02.2, 08.1 | `PANEL-NAVBAR` | 06.2, 03.2, 01.4 |
| `PANEL-CHAT` | 07.1 | `PANEL-MEDIA` | 07.2 |
| `PANEL-SPECTATORS` | 06.3 | `OVERLAY-RECONNECTING` | 05.3 |

### 10.3 Số lượng

| Hạng mục | Số lượng |
|---|---|
| Epic P1 / P2 | 9 / 7 |
| User Story P1 | 27 (EP-00: 5, EP-01 → EP-08: 22) |
| Tiêu chí nghiệm thu P1 | 268 (= số TC) |
| Task | 71, xem KE-HOACH-JIRA.md |
| NFR / Cổng kiểm chứng / Kịch bản demo | 12 / 9 / 10 |

---
## 11. Giả định và điểm cần theo dõi

| # | Nội dung | Loại | Xử lý |
|---|---|---|---|
| 1 | Các ngưỡng thời gian giao diện (≤ 2 giây cập nhật danh sách, ≤ 5 giây trạng thái bạn bè, ≤ 1 phút nhận OTP) do BA đề xuất | Đã chốt | **PO đồng ý 07/10** |
| 2 | Câu chữ *"Khách chỉ được mở 1 phòng cùng lúc"*, *"Đăng ký tài khoản để kết bạn"*, *"Mã phòng không tồn tại hoặc phòng đã đóng"*, *"Không gửi được mã, vui lòng thử lại sau"*, *"Phòng đã đóng"* là đề xuất của BA | Đã chốt | **PO đồng ý 07/10** |
| 3 | Lõi luật, máy cờ, LiveKit, realtime, CI/DevOps là phần khó, giao cho Tình theo quyết định PO; các Story khác phụ thuộc lõi luật và khung realtime | Rủi ro tiến độ | Kế hoạch Jira: Tình làm lõi luật + khung realtime ngay **S1** và công bố hợp đồng sự kiện trong US-00.3 để Story phòng và Story ván không phải chờ nhau |
| 4 | Thư là Tester chính cho 268 TC | Rủi ro | Nhạn/Kỳ kiêm kiểm thử Story mà mình không làm (phân trong KE-HOACH-JIRA.md); dev tự viết unit test |
| 5 | Máy cờ cấp Khó độ sâu 6 trong 3 giây bằng TypeScript chưa có số đo | Rủi ro kỹ thuật | Máy cờ chạy ở S2, GATE-ENGINE đo ở S4 (US-08.3); không đạt thì báo PO, **không tự hạ ngưỡng** |
