# Cờ Tướng Online

Ứng dụng web chơi cờ tướng trực tuyến: đánh thường với bạn bè, đánh hạng Elo, đánh với máy; có phòng riêng, người xem, chat, camera/mic.

> **Trạng thái:** đang ở **Giai đoạn 1 — chốt ý tưởng và chức năng tổng quan**. Chưa có mã nguồn, chưa có Epic/Story/Task trên Jira. Hiện có: quyết định phạm vi, danh mục màn hình, hệ thống thiết kế và bộ mockup HTML.

---

## Mục lục

- [Lộ trình](#lộ-trình)
- [Tính năng](#tính-năng)
- [Công nghệ dự kiến](#công-nghệ-dự-kiến)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Xem mockup](#xem-mockup)
- [Điểm còn mở cần chốt](#điểm-còn-mở-cần-chốt)
- [Quy trình Git](#quy-trình-git)
- [Tài liệu](#tài-liệu)
- [Bảo mật](#bảo-mật)
- [Giấy phép](#giấy-phép)

---

## Lộ trình

| Giai đoạn | Việc | Trạng thái |
|---|---|---|
| **1. Ý tưởng và chức năng tổng quan** | Chốt phạm vi, chế độ chơi, quy tắc nghiệp vụ, danh mục màn hình | **Đang làm** |
| 2. Phân tích chuyên sâu từng phần | Yêu cầu chi tiết, luật cờ, dữ liệu, kiến trúc, kiểm thử | Chưa bắt đầu |
| 3. Phân vai và lập kế hoạch Jira | Chia việc theo vai trò, tạo Epic / Story / Task, ước lượng, lịch | Chưa bắt đầu |
| 4. Xây dựng | Code, test, review, phát hành | Chưa bắt đầu |

Chỉ chuyển sang giai đoạn sau khi người dùng xác nhận giai đoạn trước đã **okay hết**.

## Tính năng

Phạm vi đã chốt trong [BA-SCOPE-DECISIONS.md](BA-SCOPE-DECISIONS.md) (25 hạng mục: 22 lõi P1, 3 mở rộng P2; cập nhật 03/10/2026).

| Nhóm | Nội dung |
|---|---|
| Tài khoản | Đăng ký username + mật khẩu + email xác minh OTP; Google OAuth (thiết lập thêm username + mật khẩu); chế độ Khách (12 giờ, hạn chế quyền); quên/đặt lại mật khẩu bằng OTP; đổi username qua OTP (tên cũ khoá 30 ngày); email không đổi được |
| Chế độ **Đánh Thường** | Ghép ngẫu nhiên, tạo phòng riêng (link, QR, mã 8 ký tự, mời bạn online), danh sách phòng công khai, xem cờ, đồng hồ 4 mức (không giới hạn / 5 / 10 / 15 phút), xin đi lại tối đa 3 lần |
| Chế độ **Đánh Hạng** | Ghép ngẫu nhiên 100% theo Elo, 10 phút mỗi bên, cấm khán giả, cấm đi lại, cấm Khách, ngắt kết nối quá 60 giây xử thua; Elo FIDE; bảng xếp hạng |
| Chế độ **Đánh Với Máy** | 3 cấp (Dễ / Trung bình / Khó), chọn phe, đi lại tối đa 3 lần, không giới hạn thời gian, lưu lịch sử và xem lại |
| Phòng | Một lần chia sẻ tạo link + mã + QR cùng quyền; ghế trống thì vào ghế, hết ghế thì làm người xem (người tạo chọn 0–5, mặc định 5); chủ phòng chuyển người giữa ghế và khán giả; khoá phòng khi đủ 2 đấu thủ; ghế đỏ/đen, xin đổi bên, sẵn sàng + đếm ngược 3 giây, chuyển quyền chủ phòng, đuổi người xem |
| Bàn cờ | SVG, quân chữ Hán, click hoặc kéo thả, chấm gợi ý các ô đi hợp lệ (không phải gợi ý nước hay), chiếu tướng, âm thanh Web Audio; luật chiếu liên tục và hòa không ăn quân |
| Chat | Kênh riêng (2 người chơi) và kênh chung, 12 sticker, bộ lọc từ thô tục, nhắn tin 1-1 giữa bạn bè |
| Camera / mic | Người chơi tự bật tắt; người xem chỉ xem/nghe, không phát |
| Bạn bè | Kết bạn hai chiều theo username, trạng thái online/đang đấu, mời vào phòng, Thách đấu |
| Mở rộng (P2) | Xuất FEN / PGN, widget số liệu AI, công cụ giả lập rớt mạng khi demo |

**Cố ý không làm:** giải đấu, gợi ý nước đi khi đánh với máy, cộng giây sau mỗi nước, đổi chữ Hán sang chữ Việt, đổi email, xoá tài khoản trong ứng dụng, báo cáo vi phạm / quản trị viên, tải ảnh đại diện, trang hồ sơ công khai, đa ngôn ngữ (đầy đủ ở BA-SCOPE Quyết định 10.2).

## Công nghệ dự kiến

> Danh sách này **kế thừa từ lần thiết kế trước** và sẽ được xác nhận lại ở Giai đoạn 2. Chưa phải quyết định cuối.

| Lớp | Công nghệ |
|---|---|
| Ngôn ngữ | TypeScript, Node.js, pnpm workspace |
| Giao diện | React, Vite, bàn cờ vẽ bằng SVG |
| Máy chủ | NestJS, Socket.IO |
| Dữ liệu và xác thực | Supabase (PostgreSQL, Auth) |
| Camera / mic | LiveKit |
| Máy cờ | TypeScript tự viết (negamax + alpha-beta), chạy ở tiến trình riêng |
| Kiểm thử | Vitest, Playwright |

## Cấu trúc thư mục

```
.
├── AGENTS.md                      Luật làm việc cho người và AI agent
├── BA-SCOPE-DECISIONS.md          Quyết định chốt phạm vi sản phẩm (nguồn luật chính)
├── DANH-MUC-MAN-HINH-XIANGQI.md   Danh mục 37 thành phần giao diện và 5 trạng thái bắt buộc
├── DESIGN.md                      Hệ thống thiết kế "Kỳ Đài Cổ Phong"
├── mockups/                       Mockup HTML/CSS tương tác (mở mockups/index.html)
├── site/                          Trang đọc tài liệu cũ, đã lỗi thời (xem lưu ý bên dưới)
└── .github/                       CODEOWNERS
```

Mã nguồn (`apps/`, `packages/`, `supabase/`, `tests/`) sẽ được tạo ở Giai đoạn 4, không tạo trước.

> **Lưu ý:** thư mục `docs/` và `Jira/` của lần thiết kế trước đã bị xoá vì mâu thuẫn với phạm vi mới (nhánh `chore/xoa-docs-va-jira-cu`). Nội dung cũ còn trong lịch sử git: `git show develop:docs/<đường-dẫn>`. `site/` dựng từ `docs/` nên không còn dữ liệu để chạy; sẽ xoá hoặc làm lại sau.

## Xem mockup

Mở [mockups/index.html](mockups/index.html) bằng trình duyệt, không cần server. Hiện có 15 trang `SCR-*.html`; các modal và panel chưa có file riêng.

## Điểm còn mở cần chốt

Ngày 03/10/2026 Product Owner uỷ quyền cho agent tự xử lý mọi mâu thuẫn và chỗ mơ hồ của Giai đoạn 1. Toàn bộ đã được ghi vào `BA-SCOPE-DECISIONS.md` (nhãn **`[RV-03/10]`**) và đồng bộ sang `DANH-MUC`, `DESIGN.md`, mockup. Phần còn lại dưới đây là việc **chỉ người dùng quyết được**.

| # | Việc | Vì sao agent không tự quyết |
|---|---|---|
| 1 | **Đọc lại và xác nhận các quyết định `[RV-03/10]` còn lại** (tìm bằng `grep "RV-03/10"`). Đã duyệt 03/10: luật chiếu liên tục và Quyết định 3.5, ván có Khách hiện ở lịch sử đối thủ, xin hòa Ranked sau 20 nước, không Tái đấu Ranked, khoá username cũ 30 ngày, không có xoá tài khoản | Agent chọn theo khuyến nghị; phần còn lại chưa phải ý Product Owner đã duyệt |
| 2 | **Thông tin dự án:** số người trong nhóm, hạn chót, tiêu chí thành công / tiêu chí chấm | Không có trong tài liệu nào |
| 3 | **Phạm vi so với nguồn lực:** có chuyển một số mục từ P1 xuống P2 không (ứng viên: chat 1-1, Mã QR, sticker, Khách) | AGENTS §3: đổi mức ưu tiên phải được đồng ý |
| 4 | Các con số tạm, chốt ở Giai đoạn 2: 120 nửa nước không ăn quân; luật đuổi quân liên tục; quy mô 50 người dùng đồng thời | Cần dữ liệu và thử nghiệm |
| 5 | Điều khoản sử dụng, chính sách quyền riêng tư, chức năng xoá tài khoản: đang để ngoài phạm vi | Có thể cần cho nộp / công bố thật |
| 6 | Mockup (`mockups/`) chưa phản ánh hết chi tiết mới (trạng thái "Đang đấu", ẩn Tái đấu ở Ranked, xin hòa sau 20 nước, thẻ tóm tắt người dùng, chọn mức giờ khi ghép Casual, chọn số người xem lúc tạo phòng, đổi chỗ ghế/khán giả, xin đi lại lùi 1–2 nước, nhãn "Bị gián đoạn"/"Bỏ dở"…) | Chờ bước 1 xong để khỏi sửa hai lần |

**Rủi ro lớn cần cân nhắc trước khi chia việc**

- Phạm vi (Elo, ghép trận, nhắn tin 1-1, Khách, OTP, 37 thành phần) so với số người và thời gian: xem mục 3 ở trên.
- Mục tiêu máy cờ "độ sâu 6 trong 3 giây bằng TypeScript thuần" chưa có phương án dự phòng nếu không đạt.
- Chạy đồng thời realtime (Socket.IO) và media (LiveKit) là điểm tích hợp rủi ro cao.
- Hàng đợi Đánh Hạng cần đủ người dùng; khi ít người sẽ hết thời gian chờ 60 giây mà không ghép được (đã có thông báo, chưa có cách giữ chân người chơi).

## Quy trình Git

| Nhánh | Vai trò |
|---|---|
| `main` | Ổn định nhất; chỉ nhận PR từ `develop` (phát hành) |
| `develop` | Nhánh làm việc chung |
| `feature/…` `fix/…` `docs/…` `chore/…` | Một thay đổi; tạo từ `develop`, PR ngược về `develop` |

- Cấm push thẳng và force push lên `main` / `develop`.
- Commit: `<loại>(<phạm vi>): <mô tả>`, loại gồm `feat`, `fix`, `test`, `docs`, `chore`, `refactor`.
- Khi Jira đã được tạo (Giai đoạn 3), thêm Key `[XW-<số>]` vào tên nhánh, commit và tiêu đề PR.

Chi tiết: [AGENTS.md §5](AGENTS.md).

## Tài liệu

| Cần | Xem |
|---|---|
| Phạm vi và quy tắc nghiệp vụ đã chốt | [BA-SCOPE-DECISIONS.md](BA-SCOPE-DECISIONS.md) |
| Danh mục màn hình, 5 trạng thái | [DANH-MUC-MAN-HINH-XIANGQI.md](DANH-MUC-MAN-HINH-XIANGQI.md) |
| Màu, chữ, thành phần, bàn cờ | [DESIGN.md](DESIGN.md) |
| Mockup | [mockups/index.html](mockups/index.html) |
| Luật làm việc cho người và AI agent | [AGENTS.md](AGENTS.md) |

## Bảo mật

- Không commit khoá bí mật; `.env` nằm trong `.gitignore`, chỉ commit `.env.example` với giá trị mẫu.
- Mọi biến `VITE_*` đều **công khai** trong trình duyệt — không đặt khoá bí mật vào đó.
- Phát hiện lỗ hổng: báo trực tiếp trưởng nhóm, không mở issue công khai.

## Giấy phép

Chưa chọn giấy phép. Font chữ Hán dùng trong bàn cờ phải tự host và lưu giấy phép của đúng font được dùng.
