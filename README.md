# Cờ Tướng Online

Ứng dụng web chơi cờ tướng trực tuyến tiếng Việt: tự tạo phòng mời bạn so tài, người xem, chat, camera/mic, đánh với máy theo cấp độ. Đồ án môn **Quản trị Dự án Công nghệ Thông tin**: mô phỏng toàn bộ quy trình làm dự án với khách hàng, từ phỏng vấn yêu cầu, lập kế hoạch trên Jira đến bàn giao.

> **Trạng thái (10/10/2026):** kế hoạch repo đã đồng bộ Jira XIAN: **9 Epic + 27 Story BA Done, 71 Task To Do, 880 giờ**, hạn hoàn thành và Release v1.0 **04/11/2026**. Cả **4 Sprint chưa bắt đầu**. [Kế hoạch](KE-HOACH-JIRA.md), [trạng thái hiện hành](jira/CURRENT-JIRA-STATE.md), [bản kiểm tra](jira/KIEM-TRA-KE-HOACH.md) và [CSV đối chiếu](jira/xian-import.csv) cùng dùng snapshot Jira; không phải bằng chứng phần mềm đã được nghiệm thu.

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
| 2. Phân tích chi tiết | Quyết định nghiệp vụ, review BA, backlog P1 (US/AC/TC, NFR, cổng kiểm chứng) | Quyết định BA cập nhật đến 09/10; AC/TC đã đặc tả, chưa chạy kiểm thử |
| **3. Lập kế hoạch Jira** | Tách Task, ước lượng giờ, phân công 7 người, xếp Sprint, tạo lên XIAN | **Đã đồng bộ Jira, chưa bắt đầu Sprint** |
| 4. Xây dựng và nghiệm thu | Code, test, demo D1–D10, bàn giao | Dự kiến S1–S4 (10/10 – 04/11), tổng duyệt và hạn hoàn thành 04/11 |

Chỉ chuyển giai đoạn khi PO xác nhận giai đoạn trước đã ổn.

## Lịch Sprint

| Sprint | Thời gian | Mục tiêu | Release |
|---|---|---|---|
| BA/kế hoạch | Đã chốt | 36 Epic/Story Done; không phải Sprint triển khai | — |
| S1 | 10/10 – 16/10 | Khung ứng dụng, đăng ký OTP, lõi luật/bàn cờ; thử nghiệm sớm media, xác thực và phiên | v0.1 |
| S2 | 17/10 – 23/10 | Tạo/vào phòng, ván online cơ bản, Google/Khách, bản máy cờ đầu tiên để đo | v0.2 |
| S3 | 24/10 – 30/10 | Hoàn tất triển khai P1: bạn bè, chat/media, AI, phiên, Sảnh/người xem, phục hồi; kiểm thử chuyên đề | v0.3 |
| S4 | 31/10 – 04/11 | Hồi quy, đo ngưỡng cuối, đóng gói 03/11 và tổng duyệt D1–D10 ngày 04/11 (8 giờ) | v1.0 |

Làm cả cuối tuần. Lập kế hoạch tối đa **8 giờ/người/ngày**, mỗi người một Task/ngày. Task phụ thuộc bắt đầu từ ngày sau khi Task trước kết thúc; **cao nhất 7 Task chạy song song trong lịch mới** (chi tiết: KE-HOACH-JIRA.md). Đây là lịch dự kiến đã kiểm ràng buộc; công suất trống không tự bảo đảm mọi việc sẽ đúng ước lượng.

> Trường Sprint là nguồn lịch chính. Đã sửa 13 nhãn sprint trên Jira; 71/71 Task có nhãn khớp Sprint thực tế. Kết quả ở [báo cáo kiểm tra](jira/KIEM-TRA-KE-HOACH.md).

## Nhóm

| Thành viên | Chuyên môn | Vai trò |
|---|---|---|
| Tình (Twot) | Full-stack (FE, BE, DevOps, AI) | Scrum Master, PO; nhận phần khó và quan trọng |
| Đông | Backend | Developer |
| Tùng | Backend | Developer, phụ trách BE và trọn chuỗi luật cờ |
| Cường | Backend | Developer BE, hỗ trợ FE khi đã giảm việc BE |
| Nhạn | Frontend | Developer FE, hỗ trợ kiểm thử |
| Kỳ | Frontend | Developer, kiêm kiểm thử khi cần |
| Thư | Tester | Kiểm thử chính |

Phân công chi tiết theo Task, số giờ từng người từng Sprint: [KE-HOACH-JIRA.md](KE-HOACH-JIRA.md) mục 2, 3 và 6.

## Phạm vi

### P1 — MVP, hạn 04/11/2026 (8 mục tiêu cốt lõi của khách hàng)

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

> Công nghệ được PO xác nhận 03/10/2026, hạ tầng media cập nhật theo BA 0.16. Các cổng kiểm chứng ở BACKLOG-P1 mục 7: S1 thử sớm xác thực/media/phiên bằng bản thử nghiệm; S2 đo bản máy cờ đầu tiên; S3 tối ưu và tích hợp; S4 đo ngưỡng cuối trên ứng dụng đầy đủ. Thử sớm không thay thế nghiệm thu cuối.

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
├── jira/                         Dữ liệu, công cụ và kết quả lập kế hoạch
│   ├── plan-data.json            Nguồn dữ liệu lịch, phân công và phạm vi Task
│   ├── workload-assessment.json  Đánh giá nội dung từng Task, độc lập với giờ
│   ├── DANH-GIA-KHOI-LUONG.md     Lý do đánh giá tải của 71 Task
│   ├── PHAN-CONG-CAN-BANG.md      Phân công theo vai trò, nội dung và tải công việc
│   ├── COMPONENTS-LABELS.md      Danh mục và phân loại Components/Labels của 107 mục
│   ├── descriptions.json         Nội dung Description độc lập cho 107 mục Jira
│   ├── build_plan.py             Sinh và kiểm tra kế hoạch
│   ├── xian-import.csv           Tệp nhập 107 mục Epic/Story/Task
│   ├── AC-TASK-MAP.json          Ánh xạ AC tới Task triển khai/kiểm thử
│   ├── TRUY-VET-AC.md            Bản đồ nghiệm thu
│   ├── JIRA-MUC-CHI-TIET.md       Mô tả đầy đủ các mục Jira
│   └── KIEM-TRA-KE-HOACH.md       Kết quả kiểm ràng buộc kế hoạch
├── IDEA.md                        Giới thiệu sản phẩm ngắn gọn
├── DANH-MUC-MAN-HINH-XIANGQI.md   37 thành phần giao diện (26 P1, 11 P2) và 5 trạng thái bắt buộc
├── DESIGN.md                      Hệ thống thiết kế "Kỳ Đài Cổ Phong"
├── mockups/                       Mockup HTML tham khảo (mở mockups/index.html)
├── site/                          Trang đọc tài liệu cũ, đã lỗi thời, sẽ xoá
└── .github/                       CODEOWNERS
```

Mã nguồn sản phẩm (`apps/`, `packages/`, `supabase/`, `tests/`) dự kiến tạo ở Sprint 1; công cụ trong `jira/` chỉ phục vụ lập kế hoạch. Thư mục `docs/` và `Jira/` cũ đã bị xoá (commit `c4cf29d`), nội dung chỉ còn trong lịch sử git và **không còn hiệu lực**.

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
| Khối lượng P1 lớn (880 giờ kế hoạch) | Có ván online cơ bản ở S2, triển khai xong đầu S4; tổng duyệt chiếm ngày 04/11, không còn nửa ngày dự phòng cố định. Không đưa 8 → 12 giờ/ngày vào lịch cơ sở; báo PO sớm nếu lệch ước lượng |
| Phần khó về realtime, máy cờ, LiveKit và CI vẫn tập trung ở Tình | Tùng sở hữu lõi luật; công bố giao diện kết nối đầu S1 để làm song song; theo dõi tải điều phối chưa có giờ riêng |
| Máy cờ cấp Khó độ sâu 6 trong 3 giây bằng TypeScript chưa có số đo | S1 chuẩn bị bộ thế/đáp án, S2 đo bản đầu tiên, S3 tối ưu, S4 kiểm GATE-ENGINE cuối; không đạt thì báo PO, không tự hạ ngưỡng |
| Socket.IO và LiveKit chạy đồng thời, hạn mức LiveKit Cloud miễn phí | S1 thử media LAN/Cloud/HTTPS; S3 tích hợp; S4 đo realtime/tải và ghi bằng chứng đầy đủ |
| Supabase đăng nhập bằng email, nhiều phiên song song | S1 thử sớm cơ chế username/phiên; kiểm lại luồng tích hợp khi đủ tính năng, không coi bản thử là đã nghiệm thu |
| Một Tester cho toàn bộ TC | Nhạn/Kỳ/Tình hỗ trợ kiểm thử độc lập; Thư giữ hồi quy và tổng duyệt; dev tự viết unit test |

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
