# Cờ Tướng Online

Ứng dụng web chơi cờ tướng trực tuyến tiếng Việt: tự tạo phòng mời bạn so tài, người xem, chat, camera/mic, đánh với máy theo cấp độ. Đồ án môn **Quản trị Dự án Công nghệ Thông tin**: mô phỏng toàn bộ quy trình làm dự án với khách hàng, từ phỏng vấn yêu cầu, lập kế hoạch trên Jira đến bàn giao.

> **Trạng thái (07/10/2026):** **Giai đoạn 3 — lập kế hoạch Jira.** Đặc tả đã được PO chốt lại ngày 07/10 sau review BA ([BA Phần 0](BA-SCOPE-DECISIONS.md#phần-0-quyết-định-chốt-07102026--ưu-tiên-cao-nhất)); backlog P1 ở [BACKLOG-P1.md](BACKLOG-P1.md) (9 Epic, 27 Story, 268 tiêu chí nghiệm thu) và kế hoạch Task ở [KE-HOACH-JIRA.md](KE-HOACH-JIRA.md) (71 Task có người làm, giờ, ngày; tệp nhập [`jira/xian-import.csv`](jira/xian-import.csv)) đang chờ PO duyệt. Jira XIAN sẽ được **xoá 98 mục cũ và nhập lại từ tệp này**. Chưa có mã nguồn. **Hạn cuối: 05/11/2026.**

---

## Mục lục

- [Lộ trình](#lộ-trình)
- [Lịch Sprint](#lịch-sprint)
- [Nhóm](#nhóm)
- [Phạm vi](#phạm-vi)
- [Công nghệ](#công-nghệ)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Tài liệu](#tài-liệu)
- [Rủi ro lớn](#rủi-ro-lớn)
- [Quy trình Git](#quy-trình-git)
- [Bảo mật](#bảo-mật)
- [Giấy phép](#giấy-phép)

---

## Lộ trình

| Giai đoạn | Việc | Trạng thái |
|---|---|---|
| 1. Ý tưởng và chức năng tổng quan | Phỏng vấn khách hàng, chốt phạm vi, danh mục màn hình | Xong 03/10/2026 |
| 2. Phân tích chi tiết | Quyết định nghiệp vụ, review BA, backlog P1 (US/AC/TC, NFR, cổng kiểm chứng) | Chốt lại 07/10/2026; backlog chờ PO duyệt |
| **3. Lập kế hoạch Jira** | Tách Task, ước lượng giờ, phân công 7 người, xếp Sprint, tạo lên XIAN | **Đang làm** |
| 4. Xây dựng và nghiệm thu | Code, test, demo D1–D10, bàn giao | S1–S4 (08/10 – 04/11), demo 05/11 |

Chỉ chuyển giai đoạn khi PO xác nhận giai đoạn trước đã ổn.

## Lịch Sprint

| Sprint | Thời gian | Mục tiêu | Release |
|---|---|---|---|
| S0 | 07/10 | Chốt tài liệu, dựng Jira, chuẩn bị dịch vụ | — |
| S1 | 08/10 – 14/10 | Nền tảng kỹ thuật, đăng ký/đăng nhập thật, bàn cờ đúng luật trên một máy | v0.1 |
| S2 | 15/10 – 21/10 | Tạo phòng, vào bằng link/mã, hai người đánh trọn ván online có đồng hồ; máy cờ chạy được | v0.2 |
| S3 | 22/10 – 28/10 | Google/Khách, Xin đổi bên, đầu hàng/xin hoà, bạn bè và mời online, chat, camera/mic, đánh với máy | v0.3 |
| S4 | 29/10 – 04/11 | Phiên và hồ sơ, chế độ phòng, Sảnh công khai, người xem, mất kết nối, hoàn thiện máy cờ; nghiệm thu D1–D10 | v1.0 |
| Demo | **05/11** | Nộp và demo | |

Làm cả cuối tuần. Lập kế hoạch theo **8 giờ/người/ngày**; phần 8 → 12 giờ là dự phòng. Mỗi người chỉ làm một Task tại một thời điểm, Task phụ thuộc chỉ bắt đầu khi Task trước xong, **tối đa 5 Task chạy song song** (chi tiết: KE-HOACH-JIRA.md mục 1 và 6).

## Nhóm

| Thành viên | Chuyên môn | Vai trò |
|---|---|---|
| Tình (Twot) | Full-stack (FE, BE, DevOps, AI) | Scrum Master, PO; nhận phần khó và quan trọng |
| Đông | Backend | Developer |
| Tùng | Backend | Developer |
| Cường | Backend | Developer |
| Nhạn | Frontend | Developer, kiêm kiểm thử khi cần |
| Kỳ | Frontend | Developer, kiêm kiểm thử khi cần |
| Thư | Tester | Kiểm thử chính |

Phân công chi tiết theo Task, số giờ từng người từng Sprint: [KE-HOACH-JIRA.md](KE-HOACH-JIRA.md) mục 3 và 7.

## Phạm vi

### P1 — MVP, hạn 05/11/2026 (8 mục tiêu cốt lõi của khách hàng)

| # | Mục tiêu | Nội dung P1 |
|---|---|---|
| 1 | Đăng ký / đăng nhập | Đăng ký username + mật khẩu + **OTP email** (SMTP ngoài) hoặc **Google** (đặt thêm username + mật khẩu, không OTP); đăng nhập username + mật khẩu (khoá 15 phút sau 5 lần sai), Google hoặc **Khách** |
| 2 | Tạo phòng | Tên phòng, 5/10/15 phút, 0–5 người xem; ghế Đỏ/Đen, **Xin đổi bên**, Sẵn sàng + đếm 3-2-1; sau ván ở lại phòng đánh tiếp |
| 3 | Mời vào phòng | Mời bạn bè online ngay trong game (pop-up 30 giây), gửi link hoặc mã 8 ký tự; kết bạn hai chiều |
| 4 | Khởi tạo bàn cờ | SVG, quân chữ Hán, click/kéo thả, chấm ô hợp lệ, âm thanh |
| 5 | Đánh online | Máy chủ phân xử, đồng hồ, xin hoà, đầu hàng, ân hạn mất kết nối 60 giây |
| 6 | Chế độ phòng | `PUBLIC` (hiện ở Sảnh, nút Vào chơi/Vào xem), `CODE_ONLY` (chỉ mã/link), `LOCKED` (chặn người mới); tối đa 5 người xem, 7 người/phòng; đuổi người xem |
| 7 | Chat + camera + mic | Kênh Riêng cho 2 người chơi, Kênh Chung cho người xem; camera/mic qua LiveKit, 3 mức chia sẻ |
| 8 | Đánh với máy | Dễ / Trung bình / Khó, chọn phe, Ván mới đổi phe/cấp |

### P2 — làm sau (đã đặc tả trong BA, chưa vào kế hoạch)

Đánh Hạng + Elo + bảng xếp hạng · Đánh Thường ghép ngẫu nhiên · Tái đấu (chọn Giữ phe/Đổi phe) · Xin đi lại · Lịch sử, Replay, FEN/PGN · chat 1-1, Thách đấu, sticker, QR · quên mật khẩu/khôi phục Username, đổi Username · mức giờ Không giới hạn · widget AI, công cụ demo · giao diện Giấy Sáng/Theo hệ thống. Danh sách đầy đủ: BA Phần 11.

**Cố ý không làm:** giải đấu, gợi ý nước đi, cộng giây, chữ Việt trên quân, đổi email, xoá tài khoản, báo cáo vi phạm/quản trị viên, tải ảnh đại diện, trang hồ sơ công khai, đa ngôn ngữ (BA 10.2).

## Công nghệ

> PO xác nhận 03/10/2026. Khả năng đáp ứng của SMTP, Google OAuth, LiveKit, máy cờ và đăng nhập bằng username trên Supabase được kiểm bằng các cổng kiểm chứng ở BACKLOG-P1 mục 7 ngay Sprint 1.

| Lớp | Công nghệ |
|---|---|
| Ngôn ngữ | TypeScript, Node.js, pnpm workspace |
| Giao diện | React, Vite, bàn cờ vẽ bằng SVG |
| Máy chủ | NestJS, Socket.IO |
| Dữ liệu và xác thực | Supabase (PostgreSQL, Auth), SMTP ngoài gói miễn phí cho email OTP |
| Camera / mic | LiveKit: tự chạy bằng Docker khi dev và demo LAN; LiveKit Cloud gói miễn phí khi demo qua Internet (không chạy được trên Render vì cần UDP) |
| Máy cờ | TypeScript tự viết (negamax + alpha-beta), tiến trình riêng |
| Kiểm thử | Vitest, Playwright |
| Chạy demo | Máy local qua HTTPS (ưu tiên); dự phòng: web + server trên Render, camera/mic qua LiveKit Cloud |

## Cấu trúc thư mục

```
.
├── BA-SCOPE-DECISIONS.md          Quyết định nghiệp vụ và phạm vi (nguồn luật; Phần 0 ưu tiên cao nhất)
├── BACKLOG-P1.md                  9 Epic → 27 User Story → AC → TC của P1, NFR, cổng kiểm chứng, demo, phụ thuộc
├── KE-HOACH-JIRA.md               71 Task: người làm, giờ, ngày, phụ thuộc, mô tả chi tiết, mức song song
├── jira/xian-import.csv           Tệp nhập Jira (Epic, Story, Task)
├── IDEA.md                        Giới thiệu sản phẩm ngắn gọn
├── DANH-MUC-MAN-HINH-XIANGQI.md   37 thành phần giao diện (26 P1, 11 P2) và 5 trạng thái bắt buộc
├── DESIGN.md                      Hệ thống thiết kế "Kỳ Đài Cổ Phong"
├── mockups/                       Mockup HTML tham khảo (mở mockups/index.html)
├── site/                          Trang đọc tài liệu cũ, đã lỗi thời, sẽ xoá
└── .github/                       CODEOWNERS
```

Mã nguồn (`apps/`, `packages/`, `supabase/`, `tests/`) tạo ở Sprint 1. Thư mục `docs/` và `Jira/` cũ đã bị xoá (commit `c4cf29d`), nội dung chỉ còn trong lịch sử git và **không còn hiệu lực**.

## Tài liệu

| Cần | Xem |
|---|---|
| Sản phẩm là gì, cho ai | [IDEA.md](IDEA.md) |
| Luật nghiệp vụ, phạm vi P1/P2 | [BA-SCOPE-DECISIONS.md](BA-SCOPE-DECISIONS.md) |
| User Story, tiêu chí nghiệm thu, kiểm thử P1 | [BACKLOG-P1.md](BACKLOG-P1.md) |
| Task, phân công, lịch, nhập Jira | [KE-HOACH-JIRA.md](KE-HOACH-JIRA.md), [jira/xian-import.csv](jira/xian-import.csv) |
| Màn hình, modal, trạng thái giao diện | [DANH-MUC-MAN-HINH-XIANGQI.md](DANH-MUC-MAN-HINH-XIANGQI.md) |
| Màu, chữ, thành phần, bàn cờ | [DESIGN.md](DESIGN.md) |
| Mockup | [mockups/index.html](mockups/index.html) (chỉ tham khảo, khác đặc tả thì theo đặc tả) |

Thứ tự ưu tiên khi mâu thuẫn: **BA Phần 0 → BA → BACKLOG-P1 → DANH-MUC → DESIGN → mockup**.

## Rủi ro lớn

| Rủi ro | Ứng phó |
|---|---|
| Khối lượng P1 lớn so với 4 tuần (884 giờ kế hoạch) | Làm "bản chơi được" trước (v0.2 cuối S2); S4 nhiều việc, chỉ còn 03–04/11 dự phòng nên dùng 8 → 12 giờ/ngày khi trễ; theo dõi burndown, báo PO sớm |
| Phần khó (lõi luật, realtime, máy cờ, LiveKit, CI) tập trung vào một người | Lõi luật và khung realtime làm đầu S1, công bố giao diện sớm để người khác làm song song bằng mock |
| Máy cờ cấp Khó độ sâu 6 trong 3 giây bằng TypeScript chưa có số đo | GATE-ENGINE ở S1; không đạt thì báo PO, không tự hạ ngưỡng |
| Socket.IO và LiveKit chạy đồng thời, hạn mức LiveKit Cloud miễn phí | GATE-MEDIA, GATE-REALTIME ở S1 |
| Supabase đăng nhập bằng email, nhiều phiên song song | GATE-AUTH-USERNAME, GATE-SESSION ở S1 |
| Một Tester cho toàn bộ TC | Nhạn/Kỳ kiêm kiểm thử; dev tự viết unit test |

## Quy trình Git

| Nhánh | Vai trò |
|---|---|
| `main` | Ổn định nhất; chỉ nhận PR từ `develop` (phát hành) |
| `develop` | Nhánh làm việc chung |
| `feature/…` `fix/…` `docs/…` `chore/…` | Một thay đổi; tạo từ `develop`, PR ngược về `develop` |

- Cấm push thẳng và force push lên `main` / `develop`.
- Commit: `<loại>(<phạm vi>): <mô tả>`, loại gồm `feat`, `fix`, `test`, `docs`, `chore`, `refactor`.
- Khi Jira đã tạo, thêm Key `[XIAN-<số>]` vào tên nhánh, commit và tiêu đề PR.

## Bảo mật

- Không commit khoá bí mật; `.env` nằm trong `.gitignore`, chỉ commit `.env.example` với giá trị mẫu.
- Mọi biến `VITE_*` đều **công khai** trong trình duyệt — không đặt khoá bí mật vào đó (khoá SMTP, LiveKit, service key Supabase chỉ ở máy chủ).
- Phát hiện lỗ hổng: báo trực tiếp trưởng nhóm, không mở issue công khai.

## Giấy phép

Chưa chọn giấy phép. Font chữ Hán dùng trong bàn cờ phải tự host và lưu giấy phép của đúng font được dùng.
