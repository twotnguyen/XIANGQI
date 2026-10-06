# Cờ Tướng Online

Ứng dụng web chơi cờ tướng trực tuyến: đánh thường với bạn bè, đánh hạng Elo, đánh với máy; có phòng riêng, người xem, chat, camera/mic.

> **Trạng thái:** đang ở **Giai đoạn 3 — phân vai và lập kế hoạch Jira** (Giai đoạn 1 và 2 đã xong ngày 03/10/2026). Chưa có mã nguồn; đã tạo 98 mục trên Jira XIAN ngày 05/10/2026, có Assignee/Sprint/Fix version. Có 9 Components, 4 Sprint tương lai và 4 Releases chưa phát hành; giờ/điểm và sức chứa chưa chốt. Tra Key thực ở [kế hoạch Jira mục 6](Jira/ke-hoach-moi/01-components-epic-khung-task.md#6-đối-chiếu-jira-thực--tạo-và-phân-công-ngày-05102026). Tài liệu phân tích và kế hoạch nằm ở [`docs/`](docs/README.md). Hiện có: quyết định phạm vi, danh mục màn hình, hệ thống thiết kế và bộ mockup HTML.

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

**Bản đặc tả hoàn thiện 04/10 đang chờ review:** [Ý tưởng](IDEA.md), [chỉ mục](docs/README.md), [hợp đồng nghiệp vụ](docs/07-hop-dong-nghiep-vu.md), [ma trận nghiệm thu](docs/08-ma-tran-nghiem-thu.md). Cả P1/P2 có US và AC; giữ nguyên ưu tiên. Đã đồng bộ đặc tả MVP theo lần PO chốt lại 05/10 (PUBLIC ở Sảnh, tối đa 5 người xem/7 người trong phòng theo đính chính PO, hạn phiên cố định); tài liệu kế hoạch `docs/06` chỉ là lịch sử. Không sửa Jira; chỉ đồng bộ lựa chọn riêng tư trong ba mockup Sảnh/phòng chờ/phòng chơi; các số lượng/kết luận kế hoạch ở phần dưới là ghi nhận trước đó, chưa đối soát với bản mới.

Phạm vi đã chốt trong [BA-SCOPE-DECISIONS.md](BA-SCOPE-DECISIONS.md) (27 hạng mục trong ma trận; bổ sung đã duyệt 04/10/2026).

**Phân kỳ (nhóm 7 người; phạm vi P1 giữ nguyên, lịch hiện hành theo kế hoạch Jira 05/10/2026):** **P1 = 8 mục tiêu cốt lõi** của Product Owner: (1) đăng ký / đăng nhập (kể cả bằng Google, PO kéo lên P1 ngày 04/10/2026), (2) tạo phòng, (3) mời vào phòng bằng link, mã và mời bạn bè đang online, (4) khởi tạo bàn cờ, (5) hai người đánh cờ qua mạng, (6) phòng PUBLIC tại Sảnh, CODE_ONLY qua mã/link hoặc LOCKED chặn người mới, tối đa 5 người xem, (7) chat + camera + mic cho hai người chơi và kênh chat riêng cho người xem, (8) đánh với máy theo cấp độ. **Mọi thứ còn lại là P2** (đã duyệt, làm sau): Đánh Hạng và Elo, ghép ngẫu nhiên, Khách, quên mật khẩu, đổi username, chat 1-1 giữa bạn bè, sticker, QR, xin đi lại, tái đấu, lịch sử và replay… Chi tiết: BA-SCOPE `Phần 11`; ưu tiên từng thành phần: cột "Ưu tiên" ở DANH-MUC §7 (24 thành phần P1, 13 P2; PO xác nhận lại 05/10/2026). Bảng dưới mô tả **toàn bộ** tính năng đã duyệt, kể cả P2.

| Nhóm | Nội dung |
|---|---|
| Tài khoản | Đăng ký username + mật khẩu + email xác minh OTP; Google OAuth (thiết lập thêm username + mật khẩu); chế độ Khách (12 giờ, hạn chế quyền); khôi phục Username/đặt lại mật khẩu bằng OTP (P2); đổi username qua OTP (tên cũ khoá 30 ngày); email không đổi được |
| **Đánh Thường ghép ngẫu nhiên (P2)** | Ghép hai người, không Elo, cố định 15 phút mỗi bên; không người xem/chia sẻ phòng, chỉ chat/camera/mic giữa hai người; có Xin đi lại/Tái đấu theo BA 2.0, 3.2, 3.6 |
| **Tự tạo phòng (P1)** | Mời nhanh bạn bè online hoặc link/mã cho người chưa kết bạn; PUBLIC xuất hiện tại Sảnh, CODE_ONLY/LOCKED không xuất hiện; chọn 5/10/15 phút, tối đa 5 người xem; P2 thêm QR, Không giới hạn, Xin đi lại và Tái đấu |
| Chế độ **Đánh Hạng** | Ghép ngẫu nhiên 100% theo Elo, 10 phút mỗi bên, cấm người xem, cấm đi lại, cấm Khách, ngắt kết nối quá 60 giây xử thua; Elo FIDE; bảng xếp hạng |
| Chế độ **Đánh Với Máy** | 3 cấp (Dễ / Trung bình / Khó), chọn phe, đi lại tối đa 3 lần, không giới hạn thời gian, lưu lịch sử và xem lại |
| Phòng | Một lần chia sẻ tạo link + mã + QR cùng quyền; vào qua các cách chia sẻ thì ghế trống vào ghế, hết ghế làm người xem khi còn chỗ (người tạo chọn 0–5, mặc định 5); Vào xem từ Sảnh luôn là Người xem; chủ phòng chuyển người giữa ghế và người xem, mời xuống ghế cần người xem chấp nhận và không giữ ghế (BA 2.8); khoá phòng khi đủ 2 người chơi; ghế đỏ/đen, xin đổi bên, sẵn sàng + đếm ngược 3 giây, chuyển quyền chủ phòng, đuổi người xem |
| Bàn cờ | SVG, quân chữ Hán, click hoặc kéo thả, chấm gợi ý các ô đi hợp lệ (không phải gợi ý nước hay), chiếu tướng, âm thanh Web Audio; luật chiếu liên tục và hòa không ăn quân |
| Chat | Kênh riêng (2 người chơi) và kênh chung, 12 sticker, bộ lọc từ thô tục, nhắn tin 1-1 giữa bạn bè |
| Camera / mic | Mặc định tắt; phòng tự tạo chọn sẵn Chỉ đối thủ, chủ động chọn chia sẻ cả người xem (BA 4.1); người xem chỉ xem/nghe, không phát |
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
├── Jira/ke-hoach-moi/             Kế hoạch Jira hiện hành (8 Epic, 26 Story, 64 Task, bảng đối chiếu tiêu chí, bảng chuẩn bị Sprint Planning); đã tạo trên XIAN, có Key/Assignee/Sprint/Fix version; giờ Task đã ước lượng, Story Points chưa chốt
├── Jira/scrum-jira-2026-10-04/    Cẩm nang Scrum/Jira tham khảo (bản nháp Epic/Story/Task cũ đã bị PO xoá 04/10/2026 để lập kế hoạch lại)
├── mockups/                       Mockup HTML/CSS tương tác (mở mockups/index.html)
├── site/                          Trang đọc tài liệu cũ, đã lỗi thời (xem lưu ý bên dưới)
└── .github/                       CODEOWNERS
```

Mã nguồn (`apps/`, `packages/`, `supabase/`, `tests/`) sẽ được tạo ở Giai đoạn 4, không tạo trước.

> **Lưu ý:** thư mục `docs/` và `Jira/` của lần thiết kế trước đã bị xoá vì mâu thuẫn với phạm vi mới (nhánh `chore/xoa-docs-va-jira-cu`). Nội dung cũ còn trong lịch sử git: `git show develop:docs/<đường-dẫn>`. `site/` dựng từ `docs/` nên không còn dữ liệu để chạy; sẽ xoá hoặc làm lại sau.

## Xem mockup

Mở [mockups/index.html](mockups/index.html) bằng trình duyệt, không cần server. Hiện có 15 trang `SCR-*.html`; các modal và panel chưa có file riêng.

## Điểm còn mở cần chốt

Ngày 03/10/2026 Product Owner đã duyệt toàn bộ quyết định Giai đoạn 1 và 2 (OTP chọn Phương án B), cho bắt đầu Giai đoạn 3 và chốt: **hạn 2 tuần cố định, làm cả cuối tuần (**đính chính 04/10/2026: PO không cho phép dừng bớt phần mà yêu cầu đẩy nhanh tiến độ để đủ 14 ngày; PO chốt giữ đủ P1 trong 14 ngày với 7 người và chấp nhận rủi ro, BA 10.1**); tạo Jira vào dự án XIAN sau khi review tài liệu `.md`**. Các bản nháp Epic/Story/Task cũ ở `Jira/` đã bị PO xoá 04/10/2026 để lập kế hoạch lại từ đầu (chưa tạo gì trên Jira); kế hoạch ở [docs/06](docs/06-ke-hoach-jira.md). Cần bạn:

| # | Việc | Ghi chú |
|---|---|---|
| 1 | **Lập lại kế hoạch từ đầu** (PO đã xoá 176 bản nháp `Jira/` ngày 04/10/2026), review rồi cho phép tạo lên Jira dự án XIAN | Kế hoạch mới đã lập ở `Jira/ke-hoach-moi/` (xếp "bản chơi được" Sprint 1–2 trước, mở rộng Sprint 3–4); PO đã cho phép, đã tạo đủ 98 mục và gán Assignee/Sprint/Fix version ngày 05/10/2026; tra Key ở tệp 01 mục 6; nhóm cần ước lượng/kiểm sức chứa |
| 2 | Phân công 7 thành viên đúng chuyên môn | Đã gán Assignee cho đủ 98 mục ngày 05/10/2026; Tình giữ phần khó, Cường kiêm đúng hai Task QA đã duyệt; tra bảng thực ở Jira/ke-hoach-moi/01 mục 6 |
| 3 | Tiêu chí giảng viên | PO đã cung cấp: Description Epic/Story/Task đầy đủ, đặc biệt Task phải hiểu được khi chưa tham gia đặc tả; thứ tự tiền đề rõ, phân công 7 người hợp lý. Đã viết đủ Description và kiểm đối chiếu; giờ/điểm/sức chứa còn do nhóm xác nhận |
| 4 | Điều khoản sử dụng, chính sách quyền riêng tư, chức năng xoá tài khoản: để ngoài phạm vi | Có thể cần nếu công bố thật |
| 5 | Mockup (`mockups/`) là bản mẫu, chưa cập nhật hết theo phân kỳ P1/P2 và các chi tiết mới | Cập nhật khi dựng giao diện thật |
| 6 | Đối soát tài liệu chi tiết theo các quyết định 05/10/2026 | Các quyết định về danh sách công khai, hạn phiên và câu trả lời đính kèm đã ghi vào BA/`docs/`. Bốn điểm review MVP mới (mất mạng khi đếm, chấp nhận lời mời xuống ghế, mức chia sẻ chọn sẵn, nghiệm thu chiếu hết ở cấp Khó) được PO duyệt 05/10 và đã đồng bộ. Hai điểm P2 về chat khi cùng cặp đổi bên/Tái đấu và hỗ trợ quên Username đã được PO duyệt và đồng bộ theo BA 5.3/1.7; vẫn P2. Thiết kế kỹ thuật còn cần review. `Jira/ke-hoach-moi/` đã đối soát và đưa lên XIAN ngày 05/10; mockup chỉ đồng bộ lựa chọn riêng tư trong ba mẫu liên quan |

**Lịch sử 03/10/2026, đã bị thay thế 04/10/2026:** thứ tự dừng phần (docs/06 mục 1b) và mốc ngày 4/7/10/12/14 (mục 1c). PO quyết định giữ đủ P1 trong 14 ngày, không dừng phần (BA 10.1); các mốc chỉ dùng để theo dõi và báo PO sớm. PO cho phép thay hạn theo lịch khả thi ngày 05/10/2026; các nhận định về Mức/khối lượng ở docs/06 là ước lượng lịch sử của agent, chưa được nhóm xác nhận và không đại diện kế hoạch hiện hành.

**Rủi ro lớn cần cân nhắc trước khi chia việc**

- **Ước lượng lịch sử của agent từng báo rủi ro tiến độ cao** (128 ngày công so với khoảng 78,4 có sẵn; [docs/06](docs/06-ke-hoach-jira.md)). Các con số chưa được nhóm xác nhận, không dùng để kết luận kế hoạch mới không kịp hoặc điền ước lượng cho nhóm. PO đã chọn giữ đủ P1 và nhận rủi ro (04/10); kế hoạch mới giảm rủi ro bằng cách làm "bản chơi được" trước (xem `Jira/ke-hoach-moi/15-bang-chuan-bi-sprint-planning.md` để kiểm sức chứa khi có ước lượng giờ); không áp dụng "hộp thời gian" dừng ở mức kịp; theo dõi bằng các mốc và báo PO khi trễ. Hai hạng mục khó nhất là camera/mic (LiveKit) và máy cờ tự viết.
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
- Khi Jira đã được tạo (Giai đoạn 3), thêm Key `[XIAN-<số>]` vào tên nhánh, commit và tiêu đề PR.

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

## Lịch Jira hiện hành — cập nhật 05/10/2026

PO xác nhận ngày 05/10/2026: **8 giờ/người/ngày, kể cả cuối tuần; hạn cuối bắt buộc 05/11/2026**. PO giao agent ước lượng Task và xếp ngày riêng. Giờ là ước lượng mục tiêu ban đầu theo hạn PO, chưa được kiểm chứng bằng năng suất thực tế; không phải cam kết chắc chắn đủ giờ đạt AC. Giữ nguyên tám yêu cầu MVP, phân vai, 98 mục và đồ thị phụ thuộc. Story Points để nhóm quyết định.

Đã lập lịch riêng và ước lượng cho 64 Task, cập nhật mốc của 26 Story và 8 Epic. Bốn Release: **v0.1, v0.2, v0.3, v1.0**; mốc MVP đầy đủ dự kiến **05/11/2026**, tối đa ba Task hoạt động. Xem [lịch nguồn lực và ước lượng](Jira/ke-hoach-moi/15-bang-chuan-bi-sprint-planning.md) và [98 mục/Key/ngày thật trên Jira](Jira/ke-hoach-moi/01-components-epic-khung-task.md#6-đối-chiếu-jira-thực--tạo-và-phân-công-ngày-05102026). Đây là kế hoạch trước triển khai; chưa có mã nguồn hay bằng chứng nghiệm thu sản phẩm.
