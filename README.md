# Cờ Tướng Online

Ứng dụng web chơi cờ tướng trực tuyến: đánh thường với bạn bè, đánh hạng Elo, đánh với máy; có phòng riêng, người xem, chat, camera/mic.

> **Trạng thái:** đang ở **Giai đoạn 3 — phân vai và lập kế hoạch Jira** (Giai đoạn 1 và 2 đã xong ngày 03/10/2026). Chưa có mã nguồn, chưa có Epic/Story/Task trên Jira thật. Tài liệu phân tích và kế hoạch nằm ở [`docs/`](docs/README.md). Hiện có: quyết định phạm vi, danh mục màn hình, hệ thống thiết kế và bộ mockup HTML.

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
| 1. Ý tưởng và chức năng tổng quan | Chốt phạm vi, chế độ chơi, quy tắc nghiệp vụ, danh mục màn hình | **Đã xong 03/10/2026** |
| 2. Phân tích chuyên sâu từng phần | Yêu cầu chi tiết, luật cờ, dữ liệu, kiến trúc, kiểm thử | **Đã xong 03/10/2026** (cả P1 và P2) |
| **3. Phân vai và lập kế hoạch Jira** | Chia việc theo vai trò, tạo Epic / Story / Task, ước lượng, lịch | **Đang làm** |
| 4. Xây dựng | Code, test, review, phát hành | Chưa bắt đầu |

Chỉ chuyển sang giai đoạn sau khi người dùng xác nhận giai đoạn trước đã **okay hết**.

## Tính năng

**Bản đặc tả hoàn thiện 04/10 đang chờ review:** [Ý tưởng](IDEA.md), [chỉ mục](docs/README.md), [hợp đồng nghiệp vụ](docs/07-hop-dong-nghiep-vu.md), [ma trận nghiệm thu](docs/08-ma-tran-nghiem-thu.md). Cả P1/P2 có US và AC; giữ nguyên ưu tiên. Không đọc/sửa Jira, kế hoạch hoặc mockup trong đợt này; các số lượng/kết luận kế hoạch ở phần dưới là ghi nhận trước đó, chưa được đối soát với bản mới.

Phạm vi đã chốt trong [BA-SCOPE-DECISIONS.md](BA-SCOPE-DECISIONS.md) (27 hạng mục trong ma trận; bổ sung đã duyệt 04/10/2026).

**Phân kỳ (nhóm 7 người, hạn 2 tuần cố định, làm cả cuối tuần):** **P1 = 8 mục tiêu cốt lõi** của Product Owner: (1) đăng ký / đăng nhập, (2) tạo phòng, (3) mời vào phòng bằng link, mã và mời bạn bè đang online, (4) khởi tạo bàn cờ, (5) hai người đánh cờ qua mạng, (6) phòng công khai / khoá / khoá nhưng có mã, tối đa 2 người xem, (7) chat + camera + mic cho hai người chơi và kênh chat riêng cho người xem, (8) đánh với máy theo cấp độ. **Mọi thứ còn lại là P2** (đã duyệt, làm sau): Đánh Hạng và Elo, ghép ngẫu nhiên, Khách, Google, quên mật khẩu, đổi username, chat 1-1 giữa bạn bè, sticker, QR, xin đi lại, tái đấu, lịch sử và replay… Chi tiết: BA-SCOPE `Phần 11`; ưu tiên từng thành phần: cột "Ưu tiên" ở DANH-MUC §7 (23 thành phần P1, 14 P2). Bảng dưới mô tả **toàn bộ** tính năng đã duyệt, kể cả P2.

| Nhóm | Nội dung |
|---|---|
| Tài khoản | Đăng ký username + mật khẩu + email xác minh OTP; Google OAuth (thiết lập thêm username + mật khẩu); chế độ Khách (12 giờ, hạn chế quyền); quên/đặt lại mật khẩu bằng OTP; đổi username qua OTP (tên cũ khoá 30 ngày); email không đổi được |
| Chế độ **Đánh Thường** | Ghép ngẫu nhiên, tạo phòng riêng (link, QR, mã 8 ký tự, mời bạn online), danh sách phòng công khai, xem cờ, đồng hồ 4 mức (không giới hạn / 5 / 10 / 15 phút), xin đi lại tối đa 3 lần |
| Chế độ **Đánh Hạng** | Ghép ngẫu nhiên 100% theo Elo, 10 phút mỗi bên, cấm người xem, cấm đi lại, cấm Khách, ngắt kết nối quá 60 giây xử thua; Elo FIDE; bảng xếp hạng |
| Chế độ **Đánh Với Máy** | 3 cấp (Dễ / Trung bình / Khó), chọn phe, đi lại tối đa 3 lần, không giới hạn thời gian, lưu lịch sử và xem lại |
| Phòng | Một lần chia sẻ tạo link + mã + QR cùng quyền; ghế trống thì vào ghế, hết ghế thì làm người xem (người tạo chọn 0–2, mặc định 2); chủ phòng chuyển người giữa ghế và người xem; khoá phòng khi đủ 2 người chơi; ghế đỏ/đen, xin đổi bên, sẵn sàng + đếm ngược 3 giây, chuyển quyền chủ phòng, đuổi người xem |
| Bàn cờ | SVG, quân chữ Hán, click hoặc kéo thả, chấm gợi ý các ô đi hợp lệ (không phải gợi ý nước hay), chiếu tướng, âm thanh Web Audio; luật chiếu liên tục và hòa không ăn quân |
| Chat | Kênh riêng (2 người chơi) và kênh chung, 12 sticker, bộ lọc từ thô tục, nhắn tin 1-1 giữa bạn bè |
| Camera / mic | Người chơi tự bật tắt; người xem chỉ xem/nghe, không phát |
| Bạn bè | Kết bạn hai chiều theo username, trạng thái online/đang đấu, mời vào phòng, Thách đấu |
| Mở rộng (P2) | Xuất FEN / PGN, widget số liệu AI, công cụ giả lập rớt mạng khi demo |

**Cố ý không làm:** giải đấu, gợi ý nước đi khi đánh với máy, cộng giây sau mỗi nước, đổi chữ Hán sang chữ Việt, đổi email, xoá tài khoản trong ứng dụng, báo cáo vi phạm / quản trị viên, tải ảnh đại diện, trang hồ sơ công khai, đa ngôn ngữ (đầy đủ ở BA-SCOPE Quyết định 10.2).

## Công nghệ dự kiến

> Danh sách này **đã được Product Owner xác nhận 03/10/2026** (docs/README, quyết định 12). Khả năng đáp ứng của OTP, LiveKit, máy cờ và lựa chọn triển khai vẫn cần kiểm chứng theo các cổng ở docs/05; không đồng nhất đã chọn công nghệ với đã thử nghiệm đạt.

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
├── docs/                          Tài liệu phân tích chuyên sâu Giai đoạn 2 và kế hoạch Giai đoạn 3 (bắt đầu từ docs/README.md)
├── Jira/                          Bản nháp mỗi Epic, Story, Task một tệp .md để review (chưa tạo trên Jira thật)
├── mockups/                       Mockup HTML/CSS tương tác (mở mockups/index.html)
├── site/                          Trang đọc tài liệu cũ, đã lỗi thời (xem lưu ý bên dưới)
└── .github/                       CODEOWNERS
```

Mã nguồn (`apps/`, `packages/`, `supabase/`, `tests/`) sẽ được tạo ở Giai đoạn 4, không tạo trước.

> **Lưu ý:** thư mục `docs/` và `Jira/` của lần thiết kế trước đã bị xoá vì mâu thuẫn với phạm vi mới (nhánh `chore/xoa-docs-va-jira-cu`). Nội dung cũ còn trong lịch sử git: `git show develop:docs/<đường-dẫn>`. `site/` dựng từ `docs/` nên không còn dữ liệu để chạy; sẽ xoá hoặc làm lại sau.

## Xem mockup

Mở [mockups/index.html](mockups/index.html) bằng trình duyệt, không cần server. Hiện có 15 trang `SCR-*.html`; các modal và panel chưa có file riêng.

## Điểm còn mở cần chốt

Ngày 03/10/2026 Product Owner đã duyệt toàn bộ quyết định Giai đoạn 1 và 2 (OTP chọn Phương án B), cho bắt đầu Giai đoạn 3 và chốt: **hạn 2 tuần cố định, làm cả cuối tuần (**đính chính 04/10/2026: PO không cho phép dừng bớt phần mà yêu cầu đẩy nhanh tiến độ để đủ 14 ngày; PO chốt giữ đủ P1 trong 14 ngày với 7 người và chấp nhận rủi ro, BA 10.1**); tạo Jira vào dự án XIAN sau khi review tài liệu `.md`**. Các tệp Epic/Story/Task nằm ở [`Jira/`](Jira/README.md) (bản nháp, chưa tạo trên Jira); kế hoạch ở [docs/06](docs/06-ke-hoach-jira.md). Cần bạn:

| # | Việc | Ghi chú |
|---|---|---|
| 1 | **Review các tệp ở `Jira/`** (10 Epic, 53 Story, 78 Task cho P1; 6 Epic và 28 Story P2) rồi cho phép tạo lên Jira dự án XIAN | Đã nói **chưa tạo, cần review thêm**; chưa tạo gì trên Jira |
| 2 | Gán tên 7 người vào R1–R7 | Đã chọn để trống, gán sau (Assignee trống, nhãn R1–R7 vẫn có) |
| 3 | Tiêu chí chấm của buổi nộp ngoài kịch bản demo D1–D10 | |
| 4 | Điều khoản sử dụng, chính sách quyền riêng tư, chức năng xoá tài khoản: để ngoài phạm vi | Có thể cần nếu công bố thật |
| 5 | Mockup (`mockups/`) là bản mẫu, chưa cập nhật hết theo phân kỳ P1/P2 và các chi tiết mới | Cập nhật khi dựng giao diện thật |

**Lịch sử 03/10/2026, đã bị thay thế 04/10/2026:** thứ tự dừng phần (docs/06 mục 1b) và mốc ngày 4/7/10/12/14 (mục 1c). PO quyết định giữ đủ P1 trong 14 ngày, không dừng phần (BA 10.1); các mốc chỉ dùng để theo dõi và báo PO sớm. Cần biết: hạn 14 ngày cố định, theo ước lượng cơ sở **không mức nào kịp**; chỉ Mức 1 kịp ở kịch bản rất lạc quan.

**Rủi ro lớn cần cân nhắc trước khi chia việc**

- **Nhóm 7 người trong 2 tuần không đủ cho toàn bộ 8 mục tiêu P1 theo ước lượng cơ sở** (128 ngày công so với khoảng 78,4 có sẵn; xem [docs/06](docs/06-ke-hoach-jira.md)). PO đã chọn giữ đủ P1 và nhận rủi ro (04/10); không áp dụng "hộp thời gian" dừng ở mức kịp; theo dõi bằng các mốc và báo PO khi trễ. Hai hạng mục khó nhất là camera/mic (LiveKit) và máy cờ tự viết.
- Mục tiêu máy cờ "độ sâu 6 trong 3 giây bằng TypeScript thuần" chưa có số đo thực tế. Phương án nghiệp vụ khi không kịp đã chốt (đi nước tốt nhất tìm được; lỗi hoặc quá 10 giây thì ván "Bỏ dở" và nút Thử lại, BA-SCOPE 6.1). Dự phòng tiến độ (gợi ý, chưa bắt buộc): 3 cấp vẫn là P1; nếu trễ thì báo PO, không tự bỏ cấp nào.
- Chạy đồng thời realtime (Socket.IO) và media (LiveKit) là điểm tích hợp rủi ro cao.

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
| Ý tưởng và trải nghiệm trọng tâm | [IDEA.md](IDEA.md) |
| Hợp đồng và truy vết nghiệm thu | [docs/README.md](docs/README.md) |
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
