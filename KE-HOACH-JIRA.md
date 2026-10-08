# KẾ HOẠCH JIRA — Cờ Tướng Online (XIAN)

> **Phiên bản:** 1.0 · **Ngày lập:** 07/10/2026 · **Nguồn yêu cầu:** [BACKLOG-P1.md](BACKLOG-P1.md) (Story, AC) và [BA-SCOPE-DECISIONS.md](BA-SCOPE-DECISIONS.md) (luật).
> **Tệp nhập Jira:** [`jira/xian-import.csv`](jira/xian-import.csv) — Epic, Story (phần việc BA, có hạn riêng theo quy tắc R1) và Task (phần việc thi công) kèm người làm, giờ, Sprint, ngày bắt đầu/kết thúc.
> **Mô hình Jira (theo hướng dẫn của giảng viên):** Epic và Story là **sản phẩm của BA** — bắt đầu 07/10 (ngày BA bắt đầu đặc tả), xong khi đặc tả và AC được PO duyệt; hạn xong theo **quy tắc R1** ở mục 4. Task là **việc thi công** do đội chia, có Sprint, người làm và hạn riêng. Nghiệm thu chức năng của từng Story nằm ở Task kiểm thử của Story đó.
> **Lịch được kiểm bằng máy:** script lập lịch kiểm tự động mọi ràng buộc ở mục 1; mọi ngày giờ dưới đây là kết quả đã qua kiểm tra.

## Mục lục
1. [Nguyên tắc lập kế hoạch và kết quả kiểm tra](#1-nguyên-tắc-lập-kế-hoạch-và-kết-quả-kiểm-tra)
2. [Số lượng và cấu trúc Jira](#2-số-lượng-và-cấu-trúc-jira)
3. [Nguồn lực và phân công](#3-nguồn-lực-và-phân-công)
4. [Sprint](#4-sprint)
5. [Danh sách Task theo Sprint](#5-danh-sách-task-theo-sprint)
6. [Mức song song theo ngày](#6-mức-song-song-theo-ngày)
7. [Lịch từng người](#7-lịch-từng-người)
8. [Mô tả chi tiết từng Task](#8-mô-tả-chi-tiết-từng-task)
9. [Cách nhập lên Jira](#9-cách-nhập-lên-jira)

---

## 1. Nguyên tắc lập kế hoạch và kết quả kiểm tra

| # | Nguyên tắc (PO và tiêu chí giảng viên) | Kết quả kiểm tra |
|---|---|---|
| 1 | Mỗi người chỉ làm **một Task tại một thời điểm** | Đạt: không có nửa ngày nào một người có 2 Task |
| 2 | Task B cần kết quả Task A thì **B chỉ bắt đầu khi A xong**, không chạy song song | Đạt: 169 quan hệ phụ thuộc đều đúng thứ tự |
| 3 | Trong lúc chờ, người rảnh nhận Task **không liên quan** đến Task đang chờ | Đạt: lịch xếp tự động theo phụ thuộc |
| 4 | Tối đa 7 Task song song, mỗi Task một người; **càng ít Task song song càng tốt** | **Tối đa 5 Task song song** (thấp nhất có thể để kịp hạn 05/11, đã chứng minh bằng bộ giải), trung bình 4.0 |
| 5 | Story (việc BA) xong **chậm nhất** ở Task cuối cùng của nó; mặc định xong trước khi Task đầu tiên của Story bắt đầu (quy tắc R1) | Đạt: 25/27 Story có hạn = ngày Task đầu tiên; 2 ngoại lệ (US-08.3, US-00.5) có hạn = ngày Task cuối; Epic xong theo Story muộn nhất |
| 5b | Các Task cùng một Story được xếp gọn trong một Sprint để Sprint Goal rõ ràng | Đạt |
| 6 | Người kiểm thử không kiểm Story do chính mình làm | Đạt |
| 7 | Tình nhận phần khó và quan trọng, làm nhiều giờ nhất; phần còn lại chia đều, đúng chuyên môn | Tình 212 giờ; 6 người còn lại 100–124 giờ |
| 8 | Lập theo 8 giờ/người/ngày, làm cả cuối tuần; 8 → 12 giờ là dự phòng | Đạt; tính năng S4 xong trước 03/11, chừa 03–04/11 cho đóng gói và chạy demo cuối |

**Đơn vị lịch:** nửa ngày (4 giờ). "Sáng" = 4 giờ đầu, "chiều" = 4 giờ sau của ngày làm việc 8 giờ.

---

## 2. Số lượng và cấu trúc Jira

| Loại Jira | Số lượng | Ghi chú |
|---|---|---|
| Epic | 9 | EP-00 Nền tảng + EP-01 → EP-08 khớp 8 yêu cầu khách hàng (YC1 → YC8); việc BA, bắt đầu 07/10, xong theo Story muộn nhất (mục 4) |
| Story | 27 | Mỗi Story có AC Given/When/Then trong BACKLOG-P1.md; việc BA, bắt đầu 07/10, hạn theo quy tắc R1, **không thuộc Sprint** (nằm ở backlog) |
| Task (loại Task, cha là Epic, liên kết tới Story) | 71 | 20 Task kiểm thử + 51 Task phát triển/kỹ thuật |
| Sprint | 4 | Sprint 1–4, mỗi Sprint 7 ngày, chỉ chứa Task. Epic/Story không đặt vào Sprint |
| Release (Fix version) | 4 | v0.1, v0.2, v0.3, v1.0 |
| Tổng giờ kế hoạch | 892 | Trên khả năng 7 người × 8 giờ × 28 ngày = 1.568 giờ |

---

## 3. Nguồn lực và phân công

| Thành viên | Vai trò | Số Task | Giờ S1 | Giờ S2 | Giờ S3 | Giờ S4 | Tổng giờ | Phụ trách chính |
|---|---|---|---|---|---|---|---|---|
| Tình | Scrum Master, full-stack | 14 | 56 | 56 | 52 | 48 | **212** | US-00.1 Khung dự án, CI và nhật ký vận hành; US-04.1 Lõi luật cờ dùng chung; US-00.3 Khung realtime; US-05.1 Ván online: đi cờ, đồng hồ và kết thúc ván; US-08.2 Máy cờ ba cấp độ; US-07.2 Camera, mic và mức chia sẻ; US-07.1 Hai kênh chat và bộ lọc; US-02.2 Xin đổi bên và ở lại phòng sau ván; US-05.3 Mất kết nối và nối lại; US-08.3 Ổn định ván với máy và hoàn thiện cấp Khó; US-01.4 Phiên đăng nhập, hồ sơ và Đăng xuất; US-00.5 Nghiệm thu tổng, NFR và đóng gói demo |
| Đông | Backend | 7 | 32 | 8 | 36 | 28 | **104** | US-01.1 Đăng ký bằng Username + Mật khẩu + OTP email; US-01.2 Đăng nhập bằng Username + Mật khẩu và khoá thử sai; US-05.1 Ván online: đi cờ, đồng hồ và kết thúc ván; US-05.2 Đầu hàng và xin hoà; US-01.3 Đăng ký/đăng nhập bằng Google và chế độ Khách; US-06.1 Cài đặt phòng: PUBLIC / CODE_ONLY / LOCKED; US-08.3 Ổn định ván với máy và hoàn thiện cấp Khó |
| Tùng | Backend | 6 | 16 | 16 | 36 | 32 | **100** | US-00.2 Cơ sở dữ liệu và phân quyền P1; US-03.1 Mời bằng link/mã và vào phòng; US-03.2 Bạn bè và mời bạn online; US-02.2 Xin đổi bên và ở lại phòng sau ván; US-06.3 Người xem và đuổi người xem; US-00.5 Nghiệm thu tổng, NFR và đóng gói demo |
| Cường | Backend | 6 | 16 | 24 | 32 | 36 | **108** | US-00.4 Kế hoạch kiểm thử và kiểm chứng sớm; US-02.1 Tạo phòng, ghế và bắt đầu ván; US-08.1 Thiết lập và chơi ván với máy; US-07.1 Hai kênh chat và bộ lọc; US-06.2 Sảnh và danh sách phòng công khai; US-01.4 Phiên đăng nhập, hồ sơ và Đăng xuất |
| Nhạn | Frontend, kiêm kiểm thử | 12 | 36 | 32 | 28 | 28 | **124** | US-00.1 Khung dự án, CI và nhật ký vận hành; US-01.1 Đăng ký bằng Username + Mật khẩu + OTP email; US-01.2 Đăng nhập bằng Username + Mật khẩu và khoá thử sai; US-02.1 Tạo phòng, ghế và bắt đầu ván; US-03.1 Mời bằng link/mã và vào phòng; US-03.2 Bạn bè và mời bạn online; US-06.1 Cài đặt phòng: PUBLIC / CODE_ONLY / LOCKED; US-06.2 Sảnh và danh sách phòng công khai; kiểm thử 4 Story |
| Kỳ | Frontend, kiêm kiểm thử | 10 | 16 | 48 | 40 | 20 | **124** | US-04.2 Khởi tạo và hiển thị bàn cờ; US-04.3 Đi cờ bằng click/kéo thả và âm thanh; US-05.1 Ván online: đi cờ, đồng hồ và kết thúc ván; US-05.2 Đầu hàng và xin hoà; US-08.1 Thiết lập và chơi ván với máy; US-01.3 Đăng ký/đăng nhập bằng Google và chế độ Khách; US-06.3 Người xem và đuổi người xem; kiểm thử 3 Story |
| Thư | Tester | 16 | 28 | 12 | 28 | 52 | **120** | US-00.4 Kế hoạch kiểm thử và kiểm chứng sớm; US-00.5 Nghiệm thu tổng, NFR và đóng gói demo; kiểm thử 13 Story |

> Khả năng mỗi người mỗi Sprint là 56 giờ (7 ngày × 8 giờ). Giờ trống còn lại dùng cho review code, sửa lỗi phát sinh và họp Scrum; không xếp thêm Task để giữ mức song song thấp.

---

## 4. Sprint

### Ngày của Epic và Story (việc BA) — quy tắc R1

- **Bắt đầu** của mọi Epic/Story = **07/10**, ngày BA bắt đầu đặc tả.
- **Kết thúc mặc định của Story** = ngày Task đầu tiên của Story đó bắt đầu: đội chỉ kéo Task vào làm khi Story đã được PO duyệt (Definition of Ready).
- **Ngoại lệ:** Story có AC phụ thuộc kết quả đo kỹ thuật thì kéo dài tới **Task cuối cùng** của nó: US-08.3 (GATE-ENGINE: cấp Khó phải đo thời gian nghĩ trên máy demo mới chốt được AC); US-00.5 (GATE-REALTIME: ngưỡng NFR chỉ chốt được sau khi đo tải thật).
- **Kết thúc của Epic** = ngày kết thúc muộn nhất trong các Story của nó.
- Trên Jira, Epic/Story nhập với trạng thái **To Do**; BA chuyển sang **Done** khi PO duyệt, không muộn hơn hạn dưới đây. Story không đặt vào Sprint nào.

| Epic | Bắt đầu | Hạn xong | Story (hạn xong · Task đầu → Task cuối) |
|---|---|---|---|
| EP-04 Khởi tạo bàn cờ | 07/10 | **15/10** | US-04.1 **09/10** · 09/10 → 11/10<br>US-04.2 **11/10** · 11/10 → 13/10<br>US-04.3 **15/10** · 15/10 → 20/10 |
| EP-03 Mời vào phòng | 07/10 | **22/10** | US-03.1 **18/10** · 18/10 → 21/10<br>US-03.2 **22/10** · 22/10 → 28/10 |
| EP-07 Chat, camera và mic | 07/10 | **24/10** | US-07.2 **22/10** · 22/10 → 27/10<br>US-07.1 **24/10** · 24/10 → 28/10 |
| EP-02 Tạo phòng | 07/10 | **26/10** | US-02.1 **15/10** · 15/10 → 21/10<br>US-02.2 **26/10** · 26/10 → 28/10 |
| EP-05 Hai người đánh cờ online | 07/10 | **29/10** | US-05.1 **15/10** · 15/10 → 21/10<br>US-05.2 **22/10** · 22/10 → 25/10<br>US-05.3 **29/10** · 29/10 → 01/11 |
| EP-06 Chế độ phòng và người xem | 07/10 | **29/10** | US-06.1 **29/10** · 29/10 → 01/11<br>US-06.2 **29/10** · 29/10 → 03/11<br>US-06.3 **29/10** · 29/10 → 02/11 |
| EP-01 Đăng ký và đăng nhập | 07/10 | **30/10** | US-01.1 **09/10** · 09/10 → 12/10<br>US-01.2 **11/10** · 11/10 → 14/10<br>US-01.3 **23/10** · 23/10 → 28/10<br>US-01.4 **30/10** · 30/10 → 03/11 |
| EP-08 Đánh với máy theo cấp độ | 07/10 | **03/11** | US-08.2 **18/10** · 18/10 → 21/10<br>US-08.1 **22/10** · 22/10 → 26/10<br>US-08.3 **03/11** ⚠ · 31/10 → 03/11 |
| EP-00 Nền tảng kỹ thuật và chất lượng | 07/10 | **04/11** | US-00.1 **08/10** · 08/10 → 10/10<br>US-00.4 **08/10** · 08/10 → 11/10<br>US-00.3 **12/10** · 12/10 → 14/10<br>US-00.2 **13/10** · 13/10 → 14/10<br>US-00.5 **04/11** ⚠ · 29/10 → 04/11 |

⚠ = ngoại lệ, hạn xong là ngày Task cuối cùng.

Sprint 1–4 bên dưới chứa **Task**. Cột "Story" chỉ để biết Task thực hiện Story nào.

### XIAN Sprint 1 · 08/10 – 14/10 · Release v0.1

**Sprint Goal:** Có nền tảng kỹ thuật, đăng ký/đăng nhập thật và bàn cờ đúng luật trên một máy.

| Story được thực hiện | Epic | Số Task | Giờ |
|---|---|---|---|
| US-00.1 Khung dự án, CI và nhật ký vận hành | EP-00 | 2 | 24 |
| US-00.2 Cơ sở dữ liệu và phân quyền P1 | EP-00 | 1 | 16 |
| US-00.3 Khung realtime | EP-00 | 1 | 24 |
| US-00.4 Kế hoạch kiểm thử và kiểm chứng sớm | EP-00 | 2 | 32 |
| US-01.1 Đăng ký bằng Username + Mật khẩu + OTP email | EP-01 | 3 | 32 |
| US-01.2 Đăng nhập bằng Username + Mật khẩu và khoá thử sai | EP-01 | 3 | 28 |
| US-04.1 Lõi luật cờ dùng chung | EP-04 | 3 | 24 |
| US-04.2 Khởi tạo và hiển thị bàn cờ | EP-04 | 2 | 20 |

### XIAN Sprint 2 · 15/10 – 21/10 · Release v0.2

**Sprint Goal:** Hai người tạo phòng, vào bằng link/mã và đánh trọn một ván online có đồng hồ; máy cờ chạy được.

| Story được thực hiện | Epic | Số Task | Giờ |
|---|---|---|---|
| US-02.1 Tạo phòng, ghế và bắt đầu ván | EP-02 | 3 | 48 |
| US-03.1 Mời bằng link/mã và vào phòng | EP-03 | 3 | 32 |
| US-04.3 Đi cờ bằng click/kéo thả và âm thanh | EP-04 | 2 | 28 |
| US-05.1 Ván online: đi cờ, đồng hồ và kết thúc ván | EP-05 | 4 | 56 |
| US-08.2 Máy cờ ba cấp độ | EP-08 | 1 | 32 |

### XIAN Sprint 3 · 22/10 – 28/10 · Release v0.3

**Sprint Goal:** Google/Khách, Xin đổi bên và ở lại phòng, đầu hàng/xin hoà, bạn bè và mời online, chat, camera/mic, đánh với máy.

| Story được thực hiện | Epic | Số Task | Giờ |
|---|---|---|---|
| US-01.3 Đăng ký/đăng nhập bằng Google và chế độ Khách | EP-01 | 3 | 44 |
| US-02.2 Xin đổi bên và ở lại phòng sau ván | EP-02 | 3 | 24 |
| US-03.2 Bạn bè và mời bạn online | EP-03 | 3 | 48 |
| US-05.2 Đầu hàng và xin hoà | EP-05 | 3 | 24 |
| US-07.1 Hai kênh chat và bộ lọc | EP-07 | 3 | 36 |
| US-07.2 Camera, mic và mức chia sẻ | EP-07 | 2 | 40 |
| US-08.1 Thiết lập và chơi ván với máy | EP-08 | 3 | 36 |

### XIAN Sprint 4 · 29/10 – 04/11 · Release v1.0

**Sprint Goal:** Phiên và hồ sơ, chế độ phòng, Sảnh công khai, người xem, mất kết nối, hoàn thiện máy cờ; nghiệm thu D1–D10 và đóng gói demo.

| Story được thực hiện | Epic | Số Task | Giờ |
|---|---|---|---|
| US-00.5 Nghiệm thu tổng, NFR và đóng gói demo | EP-00 | 4 | 48 |
| US-01.4 Phiên đăng nhập, hồ sơ và Đăng xuất | EP-01 | 3 | 36 |
| US-05.3 Mất kết nối và nối lại | EP-05 | 2 | 20 |
| US-06.1 Cài đặt phòng: PUBLIC / CODE_ONLY / LOCKED | EP-06 | 3 | 28 |
| US-06.2 Sảnh và danh sách phòng công khai | EP-06 | 3 | 36 |
| US-06.3 Người xem và đuổi người xem | EP-06 | 3 | 36 |
| US-08.3 Ổn định ván với máy và hoàn thiện cấp Khó | EP-08 | 3 | 40 |

---

## 5. Danh sách Task theo Sprint

Cột **Phụ thuộc** chỉ ghi Task phải xong trực tiếp trước đó.

### XIAN Sprint 1

| Task | Tên | Story | Người | Giờ | Bắt đầu | Kết thúc | Phụ thuộc |
|---|---|---|---|---|---|---|---|
| T01 | Dựng monorepo, CI, nhật ký và /health | US-00.1 | Tình | 8 | 08/10 sáng | 08/10 chiều | — |
| T02 | Kế hoạch kiểm thử, mẫu TC, quy trình lỗi, TC Sprint 1 | US-00.4 | Thư | 16 | 08/10 sáng | 09/10 chiều | — |
| T03 | Khung giao diện chung: theme, layout, router, thành phần 5 trạng thái | US-00.1 | Nhạn | 16 | 09/10 sáng | 10/10 chiều | T01 |
| T04 | BE đăng ký 3 bước, OTP qua SMTP ngoài, dọn bản tạm | US-01.1 | Đông | 16 | 09/10 sáng | 10/10 chiều | T01 |
| T05 | Lõi luật cờ (1/3): bàn cờ và nước đi, ăn quân của 7 loại quân | US-04.1 | Tình | 8 | 09/10 sáng | 09/10 chiều | T01 |
| T06 | Spike media: LiveKit tự chạy + LiveKit Cloud, HTTPS demo LAN (GATE-MEDIA) | US-00.4 | Cường | 16 | 10/10 sáng | 11/10 chiều | T01 |
| T07 | Lõi luật cờ (2/3): nước hợp lệ, chiếu, chiếu hết, hết nước | US-04.1 | Tình | 8 | 10/10 sáng | 10/10 chiều | T05 |
| T08 | FE màn Đăng ký 3 bước | US-01.1 | Nhạn | 12 | 11/10 sáng | 12/10 sáng | T03, T04 |
| T09 | BE đăng nhập username, khoá thử sai, ghi nhớ đăng nhập | US-01.2 | Đông | 16 | 11/10 sáng | 12/10 chiều | T04 |
| T10 | Lõi luật cờ (3/3): luật kết thúc ván, perft, độ phủ kiểm thử | US-04.1 | Tình | 8 | 11/10 sáng | 11/10 chiều | T07 |
| T11 | FE bàn cờ SVG: vẽ, quân, lật bàn, responsive, nhãn trợ năng | US-04.2 | Kỳ | 16 | 11/10 sáng | 12/10 chiều | T01 |
| T12 | Khung realtime Socket.IO | US-00.3 | Tình | 24 | 12/10 sáng | 14/10 chiều | T01 |
| T13 | Kiểm thử US-01.1 | US-01.1 | Thư | 4 | 12/10 chiều | 12/10 chiều | T08 |
| T14 | Lược đồ CSDL P1, RLS, migration, dữ liệu mẫu | US-00.2 | Tùng | 16 | 13/10 sáng | 14/10 chiều | T01 |
| T15 | FE màn Đăng nhập | US-01.2 | Nhạn | 8 | 13/10 sáng | 13/10 chiều | T03, T09 |
| T16 | Kiểm thử US-04.2 | US-04.2 | Thư | 4 | 13/10 sáng | 13/10 sáng | T11 |
| T17 | Kiểm thử US-01.2 | US-01.2 | Thư | 4 | 14/10 sáng | 14/10 sáng | T15 |

### XIAN Sprint 2

| Task | Tên | Story | Người | Giờ | Bắt đầu | Kết thúc | Phụ thuộc |
|---|---|---|---|---|---|---|---|
| T18 | BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host | US-02.1 | Cường | 24 | 15/10 sáng | 17/10 chiều | T12, T14 |
| T19 | FE đi cờ click/kéo thả, gợi ý ô, đánh dấu, âm thanh | US-04.3 | Kỳ | 24 | 15/10 sáng | 17/10 chiều | T10, T11 |
| T20 | BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván | US-05.1 | Tình | 24 | 15/10 sáng | 17/10 chiều | T10, T12 |
| T21 | FE hộp Tạo phòng và phòng chờ: ghế, Sẵn sàng, đếm ngược | US-02.1 | Nhạn | 16 | 18/10 sáng | 19/10 chiều | T03, T18 |
| T22 | BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập | US-03.1 | Tùng | 16 | 18/10 sáng | 19/10 chiều | T18 |
| T23 | BE đồng hồ thi đấu và hết giờ | US-05.1 | Đông | 8 | 18/10 sáng | 18/10 chiều | T20 |
| T24 | Máy cờ 3 cấp: negamax + alpha-beta, tìm sâu dần, tiến trình riêng | US-08.2 | Tình | 32 | 18/10 sáng | 21/10 chiều | T10 |
| T25 | FE phòng thi đấu: nối nước đi, đồng hồ, hộp kết quả | US-05.1 | Kỳ | 16 | 19/10 sáng | 20/10 chiều | T19, T23 |
| T26 | FE Chia sẻ phòng, nhập mã ở Sảnh, tự vào phòng sau đăng nhập | US-03.1 | Nhạn | 8 | 20/10 sáng | 20/10 chiều | T21, T22 |
| T27 | Kiểm thử US-04.3 | US-04.3 | Thư | 4 | 20/10 sáng | 20/10 sáng | T19 |
| T28 | Kiểm thử US-02.1 | US-02.1 | Kỳ | 8 | 21/10 sáng | 21/10 chiều | T26 |
| T29 | Kiểm thử US-03.1 | US-03.1 | Thư | 8 | 21/10 sáng | 21/10 chiều | T26 |
| T30 | Kiểm thử US-05.1 | US-05.1 | Nhạn | 8 | 21/10 sáng | 21/10 chiều | T25, T26 |

### XIAN Sprint 3

| Task | Tên | Story | Người | Giờ | Bắt đầu | Kết thúc | Phụ thuộc |
|---|---|---|---|---|---|---|---|
| T31 | BE bạn bè, trạng thái online, mời bạn online vào phòng | US-03.2 | Tùng | 24 | 22/10 sáng | 24/10 chiều | T22 |
| T32 | BE đầu hàng, rời phòng giữa ván, xin hoà | US-05.2 | Đông | 12 | 22/10 sáng | 23/10 sáng | T20 |
| T33 | Camera/mic LiveKit: token, quyền phát, mức chia sẻ, khung media (BE + FE) | US-07.2 | Tình | 32 | 22/10 sáng | 25/10 chiều | T06, T22, T25 |
| T34 | BE ván với máy: tạo ván, chọn phe, đầu hàng, Ván mới | US-08.1 | Cường | 16 | 22/10 sáng | 23/10 chiều | T20, T24 |
| T35 | BE đăng ký/đăng nhập Google, onboarding, phiên Khách | US-01.3 | Đông | 24 | 23/10 chiều | 26/10 sáng | T09, T14 |
| T36 | FE nút Đầu hàng, Xin hoà và khung đề nghị | US-05.2 | Kỳ | 8 | 23/10 chiều | 24/10 sáng | T25, T32 |
| T37 | BE hai kênh chat, bộ lọc từ cấm, giới hạn tốc độ | US-07.1 | Cường | 16 | 24/10 sáng | 25/10 chiều | T18 |
| T38 | FE hộp chọn cấp/phe và màn đánh với máy | US-08.1 | Kỳ | 12 | 24/10 chiều | 25/10 chiều | T19, T34 |
| T39 | Kiểm thử US-05.2 | US-05.2 | Thư | 4 | 25/10 sáng | 25/10 sáng | T36 |
| T40 | FE màn Bạn bè, chuông, tab mời bạn bè, pop-up lời mời | US-03.2 | Nhạn | 16 | 25/10 chiều | 27/10 sáng | T31 |
| T41 | BE Xin đổi bên và phòng về chờ sau ván | US-02.2 | Tùng | 12 | 26/10 sáng | 27/10 sáng | T18, T20 |
| T42 | FE khung chat hai kênh | US-07.1 | Tình | 12 | 26/10 sáng | 27/10 sáng | T25, T37 |
| T43 | Kiểm thử US-08.1 | US-08.1 | Thư | 8 | 26/10 sáng | 26/10 chiều | T38 |
| T44 | FE nút Google, Onboarding, hộp tên Khách, ẩn chức năng cho Khách | US-01.3 | Kỳ | 12 | 26/10 chiều | 27/10 chiều | T15, T35 |
| T45 | Kiểm thử US-07.2 | US-07.2 | Thư | 8 | 27/10 sáng | 27/10 chiều | T33 |
| T46 | FE hộp Xin đổi bên, Ở lại phòng / Rời phòng | US-02.2 | Tình | 8 | 27/10 chiều | 28/10 sáng | T25, T41 |
| T47 | Kiểm thử US-07.1 | US-07.1 | Nhạn | 8 | 27/10 chiều | 28/10 sáng | T42 |
| T48 | Kiểm thử US-01.3 | US-01.3 | Thư | 8 | 28/10 sáng | 28/10 chiều | T44 |
| T49 | Kiểm thử US-03.2 | US-03.2 | Kỳ | 8 | 28/10 sáng | 28/10 chiều | T40 |
| T50 | Kiểm thử US-02.2 | US-02.2 | Nhạn | 4 | 28/10 chiều | 28/10 chiều | T46 |

### XIAN Sprint 4

| Task | Tên | Story | Người | Giờ | Bắt đầu | Kết thúc | Phụ thuộc |
|---|---|---|---|---|---|---|---|
| T51 | Hồi quy toàn bộ và chạy D1–D10 vòng 1 | US-00.5 | Thư | 24 | 29/10 sáng | 31/10 chiều | toàn bộ Task tính năng Sprint 1–3 (15 Task cuối, xem liên kết trên Jira) |
| T52 | Mất kết nối: ân hạn 60 giây, nối lại, ván bị gián đoạn, lớp phủ (BE + FE) | US-05.3 | Tình | 16 | 29/10 sáng | 30/10 chiều | T25 |
| T53 | BE chế độ PUBLIC / CODE_ONLY / LOCKED, thu hồi mã | US-06.1 | Đông | 16 | 29/10 sáng | 30/10 chiều | T22 |
| T54 | BE danh sách phòng PUBLIC realtime, Vào chơi/Vào xem | US-06.2 | Cường | 12 | 29/10 sáng | 30/10 sáng | T22 |
| T55 | BE người xem, chuyển ghế ↔ xem, mời xuống ghế, đuổi và chặn | US-06.3 | Tùng | 16 | 29/10 sáng | 30/10 chiều | T22 |
| T56 | BE phiên cố định, một vị trí chơi, thiết bị khác xử thua, đăng xuất | US-01.4 | Cường | 24 | 30/10 chiều | 02/11 sáng | T18, T20, T35 |
| T57 | FE Cài đặt phòng | US-06.1 | Nhạn | 8 | 31/10 sáng | 31/10 chiều | T53 |
| T58 | FE danh sách người xem, nút Kick, thao tác ghế | US-06.3 | Kỳ | 12 | 31/10 sáng | 01/11 sáng | T55 |
| T59 | Tinh chỉnh cấp Khó, bộ thế chiếu hết, GATE-ENGINE, giao diện sự cố máy cờ | US-08.3 | Tình | 20 | 31/10 sáng | 02/11 sáng | T24 |
| T60 | Kiểm thử US-05.3 | US-05.3 | Thư | 4 | 01/11 sáng | 01/11 sáng | T52 |
| T61 | FE Sảnh: bốn lựa chọn, Luật chơi, danh sách phòng, thanh điều hướng | US-06.2 | Nhạn | 16 | 01/11 sáng | 02/11 chiều | T54 |
| T62 | Kiểm thử US-06.1 | US-06.1 | Thư | 4 | 01/11 chiều | 01/11 chiều | T57 |
| T63 | BE giữ ván AI 30 phút, Thử lại, khởi động lại | US-08.3 | Đông | 12 | 01/11 chiều | 02/11 chiều | T34 |
| T64 | Kiểm thử US-06.3 | US-06.3 | Thư | 8 | 02/11 sáng | 02/11 chiều | T33, T58 |
| T65 | FE Cài đặt hồ sơ, Đăng xuất, banner ván dở | US-01.4 | Tình | 8 | 02/11 chiều | 03/11 sáng | T56 |
| T66 | Kịch bản tải và đo NFR (GATE-REALTIME) | US-00.5 | Tùng | 16 | 03/11 sáng | 04/11 chiều | T33, T37, T52, T55 |
| T67 | Kiểm thử US-06.2 | US-06.2 | Thư | 8 | 03/11 sáng | 03/11 chiều | T61 |
| T68 | Kiểm thử US-08.3 | US-08.3 | Kỳ | 8 | 03/11 sáng | 03/11 chiều | T59, T63 |
| T69 | Kiểm thử US-01.4 | US-01.4 | Nhạn | 4 | 03/11 chiều | 03/11 chiều | T65 |
| T70 | Đóng gói demo, hướng dẫn chạy, dữ liệu demo | US-00.5 | Tình | 4 | 04/11 sáng | 04/11 sáng | toàn bộ Task tính năng Sprint 4 (7 Task cuối, xem liên kết trên Jira) |
| T71 | Chạy D1–D10 vòng cuối trên máy demo, ghi hình | US-00.5 | Thư | 4 | 04/11 chiều | 04/11 chiều | T70 |

---

## 6. Mức song song theo ngày

Số Task đang chạy cùng lúc (sáng / chiều) và ai đang làm. **Cao nhất 5**, trung bình 4.0; không có lúc nào 6 hoặc 7 Task chạy cùng lúc.

| Ngày | Sprint | Sáng | Chiều | Người đang làm (sáng → chiều) |
|---|---|---|---|---|
| T5 08/10 | S1 | 2 | 2 | Tình, Thư → Tình, Thư |
| T6 09/10 | S1 | 4 | 4 | Tình, Đông, Nhạn, Thư → Tình, Đông, Nhạn, Thư |
| T7 10/10 | S1 | 4 | 4 | Tình, Đông, Cường, Nhạn → Tình, Đông, Cường, Nhạn |
| CN 11/10 | S1 | 5 | 5 | Tình, Đông, Cường, Nhạn, Kỳ → Tình, Đông, Cường, Nhạn, Kỳ |
| T2 12/10 | S1 | 4 | 4 | Tình, Đông, Nhạn, Kỳ → Tình, Đông, Kỳ, Thư |
| T3 13/10 | S1 | 4 | 3 | Tình, Tùng, Nhạn, Thư → Tình, Tùng, Nhạn |
| T4 14/10 | S1 | 3 | 2 | Tình, Tùng, Thư → Tình, Tùng |
| T5 15/10 | S2 | 3 | 3 | Tình, Cường, Kỳ → Tình, Cường, Kỳ |
| T6 16/10 | S2 | 3 | 3 | Tình, Cường, Kỳ → Tình, Cường, Kỳ |
| T7 17/10 | S2 | 3 | 3 | Tình, Cường, Kỳ → Tình, Cường, Kỳ |
| CN 18/10 | S2 | 4 | 4 | Tình, Đông, Tùng, Nhạn → Tình, Đông, Tùng, Nhạn |
| T2 19/10 | S2 | 4 | 4 | Tình, Tùng, Nhạn, Kỳ → Tình, Tùng, Nhạn, Kỳ |
| T3 20/10 | S2 | 4 | 3 | Tình, Nhạn, Kỳ, Thư → Tình, Nhạn, Kỳ |
| T4 21/10 | S2 | 4 | 4 | Tình, Nhạn, Kỳ, Thư → Tình, Nhạn, Kỳ, Thư |
| T5 22/10 | S3 | 4 | 4 | Tình, Đông, Tùng, Cường → Tình, Đông, Tùng, Cường |
| T6 23/10 | S3 | 4 | 5 | Tình, Đông, Tùng, Cường → Tình, Đông, Tùng, Cường, Kỳ |
| T7 24/10 | S3 | 5 | 5 | Tình, Đông, Tùng, Cường, Kỳ → Tình, Đông, Tùng, Cường, Kỳ |
| CN 25/10 | S3 | 5 | 5 | Tình, Đông, Cường, Kỳ, Thư → Tình, Đông, Cường, Nhạn, Kỳ |
| T2 26/10 | S3 | 5 | 5 | Tình, Đông, Tùng, Nhạn, Thư → Tình, Tùng, Nhạn, Kỳ, Thư |
| T3 27/10 | S3 | 5 | 4 | Tình, Tùng, Nhạn, Kỳ, Thư → Tình, Nhạn, Kỳ, Thư |
| T4 28/10 | S3 | 4 | 3 | Tình, Nhạn, Kỳ, Thư → Nhạn, Kỳ, Thư |
| T5 29/10 | S4 | 5 | 5 | Tình, Đông, Tùng, Cường, Thư → Tình, Đông, Tùng, Cường, Thư |
| T6 30/10 | S4 | 5 | 5 | Tình, Đông, Tùng, Cường, Thư → Tình, Đông, Tùng, Cường, Thư |
| T7 31/10 | S4 | 5 | 5 | Tình, Cường, Nhạn, Kỳ, Thư → Tình, Cường, Nhạn, Kỳ, Thư |
| CN 01/11 | S4 | 5 | 5 | Tình, Cường, Nhạn, Kỳ, Thư → Tình, Đông, Cường, Nhạn, Thư |
| T2 02/11 | S4 | 5 | 4 | Tình, Đông, Cường, Nhạn, Thư → Tình, Đông, Nhạn, Thư |
| T3 03/11 | S4 | 4 | 4 | Tình, Tùng, Kỳ, Thư → Tùng, Nhạn, Kỳ, Thư |
| T4 04/11 | S4 | 2 | 2 | Tình, Tùng → Tùng, Thư |

---

## 7. Lịch từng người

### Tình — Scrum Master, full-stack · 212 giờ

| Task | Tên | Bắt đầu | Kết thúc | Giờ |
|---|---|---|---|---|
| T01 | Dựng monorepo, CI, nhật ký và /health | 08/10 sáng | 08/10 chiều | 8 |
| T05 | Lõi luật cờ (1/3): bàn cờ và nước đi, ăn quân của 7 loại quân | 09/10 sáng | 09/10 chiều | 8 |
| T07 | Lõi luật cờ (2/3): nước hợp lệ, chiếu, chiếu hết, hết nước | 10/10 sáng | 10/10 chiều | 8 |
| T10 | Lõi luật cờ (3/3): luật kết thúc ván, perft, độ phủ kiểm thử | 11/10 sáng | 11/10 chiều | 8 |
| T12 | Khung realtime Socket.IO | 12/10 sáng | 14/10 chiều | 24 |
| T20 | BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván | 15/10 sáng | 17/10 chiều | 24 |
| T24 | Máy cờ 3 cấp: negamax + alpha-beta, tìm sâu dần, tiến trình riêng | 18/10 sáng | 21/10 chiều | 32 |
| T33 | Camera/mic LiveKit: token, quyền phát, mức chia sẻ, khung media (BE + FE) | 22/10 sáng | 25/10 chiều | 32 |
| T42 | FE khung chat hai kênh | 26/10 sáng | 27/10 sáng | 12 |
| T46 | FE hộp Xin đổi bên, Ở lại phòng / Rời phòng | 27/10 chiều | 28/10 sáng | 8 |
| T52 | Mất kết nối: ân hạn 60 giây, nối lại, ván bị gián đoạn, lớp phủ (BE + FE) | 29/10 sáng | 30/10 chiều | 16 |
| T59 | Tinh chỉnh cấp Khó, bộ thế chiếu hết, GATE-ENGINE, giao diện sự cố máy cờ | 31/10 sáng | 02/11 sáng | 20 |
| T65 | FE Cài đặt hồ sơ, Đăng xuất, banner ván dở | 02/11 chiều | 03/11 sáng | 8 |
| T70 | Đóng gói demo, hướng dẫn chạy, dữ liệu demo | 04/11 sáng | 04/11 sáng | 4 |

### Đông — Backend · 104 giờ

| Task | Tên | Bắt đầu | Kết thúc | Giờ |
|---|---|---|---|---|
| T04 | BE đăng ký 3 bước, OTP qua SMTP ngoài, dọn bản tạm | 09/10 sáng | 10/10 chiều | 16 |
| T09 | BE đăng nhập username, khoá thử sai, ghi nhớ đăng nhập | 11/10 sáng | 12/10 chiều | 16 |
| T23 | BE đồng hồ thi đấu và hết giờ | 18/10 sáng | 18/10 chiều | 8 |
| T32 | BE đầu hàng, rời phòng giữa ván, xin hoà | 22/10 sáng | 23/10 sáng | 12 |
| T35 | BE đăng ký/đăng nhập Google, onboarding, phiên Khách | 23/10 chiều | 26/10 sáng | 24 |
| T53 | BE chế độ PUBLIC / CODE_ONLY / LOCKED, thu hồi mã | 29/10 sáng | 30/10 chiều | 16 |
| T63 | BE giữ ván AI 30 phút, Thử lại, khởi động lại | 01/11 chiều | 02/11 chiều | 12 |

### Tùng — Backend · 100 giờ

| Task | Tên | Bắt đầu | Kết thúc | Giờ |
|---|---|---|---|---|
| T14 | Lược đồ CSDL P1, RLS, migration, dữ liệu mẫu | 13/10 sáng | 14/10 chiều | 16 |
| T22 | BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập | 18/10 sáng | 19/10 chiều | 16 |
| T31 | BE bạn bè, trạng thái online, mời bạn online vào phòng | 22/10 sáng | 24/10 chiều | 24 |
| T41 | BE Xin đổi bên và phòng về chờ sau ván | 26/10 sáng | 27/10 sáng | 12 |
| T55 | BE người xem, chuyển ghế ↔ xem, mời xuống ghế, đuổi và chặn | 29/10 sáng | 30/10 chiều | 16 |
| T66 | Kịch bản tải và đo NFR (GATE-REALTIME) | 03/11 sáng | 04/11 chiều | 16 |

### Cường — Backend · 108 giờ

| Task | Tên | Bắt đầu | Kết thúc | Giờ |
|---|---|---|---|---|
| T06 | Spike media: LiveKit tự chạy + LiveKit Cloud, HTTPS demo LAN (GATE-MEDIA) | 10/10 sáng | 11/10 chiều | 16 |
| T18 | BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host | 15/10 sáng | 17/10 chiều | 24 |
| T34 | BE ván với máy: tạo ván, chọn phe, đầu hàng, Ván mới | 22/10 sáng | 23/10 chiều | 16 |
| T37 | BE hai kênh chat, bộ lọc từ cấm, giới hạn tốc độ | 24/10 sáng | 25/10 chiều | 16 |
| T54 | BE danh sách phòng PUBLIC realtime, Vào chơi/Vào xem | 29/10 sáng | 30/10 sáng | 12 |
| T56 | BE phiên cố định, một vị trí chơi, thiết bị khác xử thua, đăng xuất | 30/10 chiều | 02/11 sáng | 24 |

### Nhạn — Frontend, kiêm kiểm thử · 124 giờ

| Task | Tên | Bắt đầu | Kết thúc | Giờ |
|---|---|---|---|---|
| T03 | Khung giao diện chung: theme, layout, router, thành phần 5 trạng thái | 09/10 sáng | 10/10 chiều | 16 |
| T08 | FE màn Đăng ký 3 bước | 11/10 sáng | 12/10 sáng | 12 |
| T15 | FE màn Đăng nhập | 13/10 sáng | 13/10 chiều | 8 |
| T21 | FE hộp Tạo phòng và phòng chờ: ghế, Sẵn sàng, đếm ngược | 18/10 sáng | 19/10 chiều | 16 |
| T26 | FE Chia sẻ phòng, nhập mã ở Sảnh, tự vào phòng sau đăng nhập | 20/10 sáng | 20/10 chiều | 8 |
| T30 | Kiểm thử US-05.1 | 21/10 sáng | 21/10 chiều | 8 |
| T40 | FE màn Bạn bè, chuông, tab mời bạn bè, pop-up lời mời | 25/10 chiều | 27/10 sáng | 16 |
| T47 | Kiểm thử US-07.1 | 27/10 chiều | 28/10 sáng | 8 |
| T50 | Kiểm thử US-02.2 | 28/10 chiều | 28/10 chiều | 4 |
| T57 | FE Cài đặt phòng | 31/10 sáng | 31/10 chiều | 8 |
| T61 | FE Sảnh: bốn lựa chọn, Luật chơi, danh sách phòng, thanh điều hướng | 01/11 sáng | 02/11 chiều | 16 |
| T69 | Kiểm thử US-01.4 | 03/11 chiều | 03/11 chiều | 4 |

### Kỳ — Frontend, kiêm kiểm thử · 124 giờ

| Task | Tên | Bắt đầu | Kết thúc | Giờ |
|---|---|---|---|---|
| T11 | FE bàn cờ SVG: vẽ, quân, lật bàn, responsive, nhãn trợ năng | 11/10 sáng | 12/10 chiều | 16 |
| T19 | FE đi cờ click/kéo thả, gợi ý ô, đánh dấu, âm thanh | 15/10 sáng | 17/10 chiều | 24 |
| T25 | FE phòng thi đấu: nối nước đi, đồng hồ, hộp kết quả | 19/10 sáng | 20/10 chiều | 16 |
| T28 | Kiểm thử US-02.1 | 21/10 sáng | 21/10 chiều | 8 |
| T36 | FE nút Đầu hàng, Xin hoà và khung đề nghị | 23/10 chiều | 24/10 sáng | 8 |
| T38 | FE hộp chọn cấp/phe và màn đánh với máy | 24/10 chiều | 25/10 chiều | 12 |
| T44 | FE nút Google, Onboarding, hộp tên Khách, ẩn chức năng cho Khách | 26/10 chiều | 27/10 chiều | 12 |
| T49 | Kiểm thử US-03.2 | 28/10 sáng | 28/10 chiều | 8 |
| T58 | FE danh sách người xem, nút Kick, thao tác ghế | 31/10 sáng | 01/11 sáng | 12 |
| T68 | Kiểm thử US-08.3 | 03/11 sáng | 03/11 chiều | 8 |

### Thư — Tester · 120 giờ

| Task | Tên | Bắt đầu | Kết thúc | Giờ |
|---|---|---|---|---|
| T02 | Kế hoạch kiểm thử, mẫu TC, quy trình lỗi, TC Sprint 1 | 08/10 sáng | 09/10 chiều | 16 |
| T13 | Kiểm thử US-01.1 | 12/10 chiều | 12/10 chiều | 4 |
| T16 | Kiểm thử US-04.2 | 13/10 sáng | 13/10 sáng | 4 |
| T17 | Kiểm thử US-01.2 | 14/10 sáng | 14/10 sáng | 4 |
| T27 | Kiểm thử US-04.3 | 20/10 sáng | 20/10 sáng | 4 |
| T29 | Kiểm thử US-03.1 | 21/10 sáng | 21/10 chiều | 8 |
| T39 | Kiểm thử US-05.2 | 25/10 sáng | 25/10 sáng | 4 |
| T43 | Kiểm thử US-08.1 | 26/10 sáng | 26/10 chiều | 8 |
| T45 | Kiểm thử US-07.2 | 27/10 sáng | 27/10 chiều | 8 |
| T48 | Kiểm thử US-01.3 | 28/10 sáng | 28/10 chiều | 8 |
| T51 | Hồi quy toàn bộ và chạy D1–D10 vòng 1 | 29/10 sáng | 31/10 chiều | 24 |
| T60 | Kiểm thử US-05.3 | 01/11 sáng | 01/11 sáng | 4 |
| T62 | Kiểm thử US-06.1 | 01/11 chiều | 01/11 chiều | 4 |
| T64 | Kiểm thử US-06.3 | 02/11 sáng | 02/11 chiều | 8 |
| T67 | Kiểm thử US-06.2 | 03/11 sáng | 03/11 chiều | 8 |
| T71 | Chạy D1–D10 vòng cuối trên máy demo, ghi hình | 04/11 chiều | 04/11 chiều | 4 |

---

## 8. Mô tả chi tiết từng Task

Mỗi mục dưới đây là **Description** dán vào Jira (đã có sẵn trong CSV). Người nhận chưa tham gia đặc tả vẫn hiểu được việc cần làm nhờ đủ các phần: mục tiêu, đầu vào, việc cần làm, đầu ra, cách kiểm và điều kiện PASS.

### EP-00 · Nền tảng kỹ thuật và chất lượng

#### T01 · Dựng monorepo, CI, nhật ký và /health

**Mục tiêu:** Dựng monorepo, CI, nhật ký và /health — phục vụ US-00.1 Khung dự án, CI và nhật ký vận hành (EP-00 Nền tảng kỹ thuật và chất lượng).
**Đầu vào (phải xong trước):** Không có.
**Việc cần làm:**
- Tạo pnpm workspace: `apps/web` (React + Vite + TS), `apps/server` (NestJS), `packages/shared`, `packages/xiangqi-core`, `packages/engine`
- Cấu hình ESLint, Prettier, TypeScript strict, Vitest; GitHub Actions chạy lint + typecheck + test cho mọi PR vào `develop`; bật bảo vệ nhánh
- Server: logger JSON (thời gian, mức, mã sự kiện, lọc mật khẩu/OTP/token/chat), endpoint `/health`; `.env.example` đủ biến (gồm `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` để chuyển giữa LiveKit tự chạy và LiveKit Cloud)
**Đầu ra:** Repo chạy được bằng `pnpm dev`, CI xanh trên PR mẫu, README mục "Chạy dự án".
**Cách kiểm và điều kiện PASS:** AC-00.1.1 → AC-00.1.6. PASS khi: clone mới chạy được web + server, `/health` trả 200, PR cố ý lỗi lint bị CI chặn, log không chứa dữ liệu nhạy cảm.
**Lịch:** Tình · 8 giờ · 08/10 sáng → 08/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-00.1; luật ở BA-SCOPE-DECISIONS.md.

#### T03 · Khung giao diện chung: theme, layout, router, thành phần 5 trạng thái

**Mục tiêu:** Khung giao diện chung: theme, layout, router, thành phần 5 trạng thái — phục vụ US-00.1 Khung dự án, CI và nhật ký vận hành (EP-00 Nền tảng kỹ thuật và chất lượng).
**Đầu vào (phải xong trước):** T01 (Dựng monorepo, CI, nhật ký và /health).
**Việc cần làm:**
- Áp design token Kỳ Đài Cổ Phong (DESIGN.md) thành biến CSS; layout chung, router các trang P1, trang Sảnh khung (nút Tạo phòng, Vào phòng bằng mã, Đánh với máy)
- Thành phần dùng chung: Button, Input, Modal, Toast, Tooltip, Skeleton, EmptyState, ErrorState với đủ 5 trạng thái
- Thanh điều hướng `PANEL-NAVBAR` khung (mục chưa làm hiện "Sắp ra mắt")
**Đầu ra:** Bộ thành phần giao diện và khung trang để các Task FE sau dùng lại.
**Cách kiểm và điều kiện PASS:** PASS khi: mỗi thành phần có trang demo đủ 5 trạng thái; hiển thị đúng ở 360 px và 1440 px; tương phản đạt WCAG AA (kiểm bằng công cụ trình duyệt).
**Lịch:** Nhạn · 16 giờ · 09/10 sáng → 10/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-00.1; luật ở BA-SCOPE-DECISIONS.md.

#### T14 · Lược đồ CSDL P1, RLS, migration, dữ liệu mẫu

**Mục tiêu:** Lược đồ CSDL P1, RLS, migration, dữ liệu mẫu — phục vụ US-00.2 Cơ sở dữ liệu và phân quyền P1 (EP-00 Nền tảng kỹ thuật và chất lượng).
**Đầu vào (phải xong trước):** T01 (Dựng monorepo, CI, nhật ký và /health).
**Việc cần làm:**
- Thiết kế các bảng P1 còn lại: `friend_requests`, `friendships`, `rooms`, `room_members`, `room_blocks`, `matches`, `match_moves` (bảng `profiles`, `login_attempts` do Task đăng ký/đăng nhập tạo; `command_receipts` do Task realtime tạo)
- Viết migration Supabase + RLS: client chỉ đọc dữ liệu được phép; ván/phòng/kết quả chỉ máy chủ ghi
- Chỉ mục duy nhất username theo chữ thường; script dữ liệu mẫu (tài khoản demo)
**Đầu ra:** Migration chạy lại được từ đầu, sơ đồ dữ liệu (ảnh/markdown) trong repo.
**Cách kiểm và điều kiện PASS:** AC-00.2.1 → AC-00.2.3. PASS khi: test tích hợp chứng minh RLS chặn đọc/ghi trái phép và trùng `Twot`/`twot` bị từ chối.
**Lịch:** Tùng · 16 giờ · 13/10 sáng → 14/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-00.2; luật ở BA-SCOPE-DECISIONS.md.

#### T12 · Khung realtime Socket.IO

**Mục tiêu:** Khung realtime Socket.IO — phục vụ US-00.3 Khung realtime (EP-00 Nền tảng kỹ thuật và chất lượng).
**Đầu vào (phải xong trước):** T01 (Dựng monorepo, CI, nhật ký và /health).
**Việc cần làm:**
- Cổng Socket.IO trong NestJS: xác thực JWT Supabase (người dùng và Khách), room theo `roomId`
- Phong bì lệnh có `commandId` + phiên bản trạng thái; lưu biên lai chống trùng (migration bảng `command_receipts` trong Task này); gửi ảnh chụp trạng thái khi nối lại
- Tiếp quản tab: tab mới giành quyền, tab cũ chỉ đọc; **công bố hợp đồng sự kiện phòng/ván trong `packages/shared`**
**Đầu ra:** Khung realtime + tài liệu hợp đồng sự kiện để Story phòng và Story ván làm độc lập.
**Cách kiểm và điều kiện PASS:** AC-00.3.1 → AC-00.3.5. PASS khi: test tích hợp socket xanh (từ chối token sai, lệnh trùng chỉ áp một lần, nối lại nhận ảnh chụp, tab cũ thành chỉ đọc).
**Lịch:** Tình · 24 giờ · 12/10 sáng → 14/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-00.3; luật ở BA-SCOPE-DECISIONS.md.

#### T02 · Kế hoạch kiểm thử, mẫu TC, quy trình lỗi, TC Sprint 1

**Mục tiêu:** Kế hoạch kiểm thử, mẫu TC, quy trình lỗi, TC Sprint 1 — phục vụ US-00.4 Kế hoạch kiểm thử và kiểm chứng sớm (EP-00 Nền tảng kỹ thuật và chất lượng).
**Đầu vào (phải xong trước):** Không có.
**Việc cần làm:**
- Viết kế hoạch kiểm thử: phạm vi, môi trường, dữ liệu thử, tiêu chí vào/ra, mức độ lỗi, quy trình báo lỗi trên Jira
- Tạo mẫu TC (tiền điều kiện, bước, kết quả mong đợi) và viết TC cho các Story Sprint 1
- Thống nhất với nhóm cách đặt mã TC trùng số AC
**Đầu ra:** Tài liệu kế hoạch kiểm thử + bộ TC Sprint 1 trên Jira/Confluence hoặc repo.
**Cách kiểm và điều kiện PASS:** AC-00.4.1, AC-00.4.2. PASS khi: PO duyệt kế hoạch; 100% AC của Story S1 có TC tương ứng.
**Lịch:** Thư · 16 giờ · 08/10 sáng → 09/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-00.4; luật ở BA-SCOPE-DECISIONS.md.

#### T06 · Spike media: LiveKit tự chạy + LiveKit Cloud, HTTPS demo LAN (GATE-MEDIA)

**Mục tiêu:** Spike media: LiveKit tự chạy + LiveKit Cloud, HTTPS demo LAN (GATE-MEDIA) — phục vụ US-00.4 Kế hoạch kiểm thử và kiểm chứng sớm (EP-00 Nền tảng kỹ thuật và chất lượng).
**Đầu vào (phải xong trước):** T01 (Dựng monorepo, CI, nhật ký và /health).
**Việc cần làm:**
- Chạy LiveKit mã nguồn mở bằng Docker (`livekit/livekit-server --dev`, cổng 7880/7881/7882 UDP) trên máy dev và trên laptop demo; viết hướng dẫn cho cả nhóm
- Tạo dự án LiveKit Cloud gói miễn phí làm phương án demo qua Internet; xác nhận chỉ cần đổi `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`
- Dựng trang thử: 2 người phát camera/mic + 5 người chỉ nhận, thu hồi quyền một người; thử trên các máy khác cùng mạng LAN qua **HTTPS** (mkcert) vì trình duyệt chỉ cho bật camera trên HTTPS hoặc localhost
- Ghi số đo: CPU/RAM của LiveKit tự chạy, thời gian thu hồi quyền, phút sử dụng LiveKit Cloud
**Đầu ra:** Báo cáo GATE-MEDIA (1–2 trang), `docker-compose` chạy LiveKit, hướng dẫn HTTPS cho demo LAN, đoạn code mẫu cho US-07.2.
**Cách kiểm và điều kiện PASS:** PASS khi: 2 máy khác nhau trong LAN thấy/nghe nhau qua HTTPS với LiveKit tự chạy, đổi sang LiveKit Cloud chỉ bằng biến môi trường; báo cáo đủ số đo (không đặt ngưỡng đạt, theo BA 10.1).
**Lịch:** Cường · 16 giờ · 10/10 sáng → 11/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-00.4; luật ở BA-SCOPE-DECISIONS.md.

#### T51 · Hồi quy toàn bộ và chạy D1–D10 vòng 1

**Mục tiêu:** Hồi quy toàn bộ và chạy D1–D10 vòng 1 — phục vụ US-00.5 Nghiệm thu tổng, NFR và đóng gói demo (EP-00 Nền tảng kỹ thuật và chất lượng).
**Đầu vào (phải xong trước):** toàn bộ Task tính năng Sprint 1–3 (15 Task cuối, xem liên kết trên Jira).
**Việc cần làm:**
- Chạy hồi quy toàn bộ TC của Story S1–S3 và kịch bản D1–D10 phần đã có
- Ghi lỗi lên Jira, xác nhận lại lỗi đã sửa
**Đầu ra:** Báo cáo hồi quy vòng 1.
**Cách kiểm và điều kiện PASS:** AC-00.5.1. PASS khi không còn lỗi Nghiêm trọng/Cao mở của Story S1–S3.
**Lịch:** Thư · 24 giờ · 29/10 sáng → 31/10 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-00.5; luật ở BA-SCOPE-DECISIONS.md.

#### T66 · Kịch bản tải và đo NFR (GATE-REALTIME)

**Mục tiêu:** Kịch bản tải và đo NFR (GATE-REALTIME) — phục vụ US-00.5 Nghiệm thu tổng, NFR và đóng gói demo (EP-00 Nền tảng kỹ thuật và chất lượng).
**Đầu vào (phải xong trước):** T33 (Camera/mic LiveKit: token, quyền phát, mức chia sẻ, khung media (BE + FE)), T37 (BE hai kênh chat, bộ lọc từ cấm, giới hạn tốc độ), T52 (Mất kết nối: ân hạn 60 giây, nối lại, ván bị gián đoạn, lớp phủ (BE + FE)), T55 (BE người xem, chuyển ghế ↔ xem, mời xuống ghế, đuổi và chặn).
**Việc cần làm:**
- Viết kịch bản tải (50 client, 10 ván đồng thời) bằng công cụ chọn được (ví dụ k6 hoặc script Node)
- Đo p95 độ trễ nước đi, lỗi, CPU/RAM; đo nhẹ camera/mic ~3 phòng, chỉ ghi số (GATE-REALTIME, NFR-01, NFR-02)
**Đầu ra:** Kịch bản tải trong repo + báo cáo số đo.
**Cách kiểm và điều kiện PASS:** AC-00.5.3, AC-00.5.4. PASS khi báo cáo đủ số đo; chỉ số không đạt được ghi BLOCKED kèm lý do.
**Lịch:** Tùng · 16 giờ · 03/11 sáng → 04/11 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-00.5; luật ở BA-SCOPE-DECISIONS.md.

#### T70 · Đóng gói demo, hướng dẫn chạy, dữ liệu demo

**Mục tiêu:** Đóng gói demo, hướng dẫn chạy, dữ liệu demo — phục vụ US-00.5 Nghiệm thu tổng, NFR và đóng gói demo (EP-00 Nền tảng kỹ thuật và chất lượng).
**Đầu vào (phải xong trước):** toàn bộ Task tính năng Sprint 4 (7 Task cuối, xem liên kết trên Jira).
**Việc cần làm:**
- Đóng gói chạy demo local (hướng dẫn trong README, ≤ 15 phút): web + server + LiveKit tự chạy qua Docker, HTTPS cho máy khác trong LAN; tài khoản và phòng mẫu; phương án dự phòng: web + server trên Render, camera/mic qua LiveKit Cloud miễn phí
**Đầu ra:** Bản phát hành v1.0 và hướng dẫn chạy.
**Cách kiểm và điều kiện PASS:** AC-00.5.5, AC-00.5.6. PASS khi một thành viên không tham gia đóng gói chạy được theo README.
**Lịch:** Tình · 4 giờ · 04/11 sáng → 04/11 sáng · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-00.5; luật ở BA-SCOPE-DECISIONS.md.

#### T71 · Chạy D1–D10 vòng cuối trên máy demo, ghi hình

**Mục tiêu:** Chạy D1–D10 vòng cuối trên máy demo, ghi hình — phục vụ US-00.5 Nghiệm thu tổng, NFR và đóng gói demo (EP-00 Nền tảng kỹ thuật và chất lượng).
**Đầu vào (phải xong trước):** T70 (Đóng gói demo, hướng dẫn chạy, dữ liệu demo).
**Việc cần làm:**
- Chạy D1–D10 lần cuối trên máy demo, ghi hình làm bằng chứng
**Đầu ra:** Video và báo cáo D1–D10.
**Cách kiểm và điều kiện PASS:** AC-00.5.2. PASS khi 10/10 kịch bản đạt.
**Lịch:** Thư · 4 giờ · 04/11 chiều → 04/11 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-00.5; luật ở BA-SCOPE-DECISIONS.md.

### EP-01 · Đăng ký và đăng nhập

#### T04 · BE đăng ký 3 bước, OTP qua SMTP ngoài, dọn bản tạm

**Mục tiêu:** BE đăng ký 3 bước, OTP qua SMTP ngoài, dọn bản tạm — phục vụ US-01.1 Đăng ký bằng Username + Mật khẩu + OTP email (EP-01 Đăng ký và đăng nhập).
**Đầu vào (phải xong trước):** T01 (Dựng monorepo, CI, nhật ký và /health).
**Việc cần làm:**
- API đăng ký 3 bước: kiểm username (định dạng, trùng không phân biệt hoa thường), mật khẩu, email đã tồn tại
- Gửi OTP 6 số qua Supabase Auth với **SMTP ngoài** (cấu hình Custom SMTP, chọn nhà cung cấp gói miễn phí), hạn 3 phút, gửi lại sau 60 giây
- Migration bảng `profiles`; hoàn tất: tạo hồ sơ `display_name = username`, tự đăng nhập; kiểm lại trùng ở bước cuối; tác vụ dọn bản tạm sau ~60 phút; GATE-SMTP, GATE-EMAIL
**Đầu ra:** API đăng ký + cấu hình SMTP + báo cáo GATE-SMTP.
**Cách kiểm và điều kiện PASS:** AC U/I của US-01.1 (định dạng, trùng username/email, OTP, bỏ dở, tranh chấp username, lỗi SMTP). PASS khi test tích hợp xanh và gửi được OTP tới 3 Gmail ngoài nhóm.
**Lịch:** Đông · 16 giờ · 09/10 sáng → 10/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-01.1; luật ở BA-SCOPE-DECISIONS.md.

#### T08 · FE màn Đăng ký 3 bước

**Mục tiêu:** FE màn Đăng ký 3 bước — phục vụ US-01.1 Đăng ký bằng Username + Mật khẩu + OTP email (EP-01 Đăng ký và đăng nhập).
**Đầu vào (phải xong trước):** T03 (Khung giao diện chung: theme, layout, router, thành phần 5 trạng thái), T04 (BE đăng ký 3 bước, OTP qua SMTP ngoài, dọn bản tạm).
**Việc cần làm:**
- Màn `SCR-REGISTER` 3 bước: username/mật khẩu → email → 6 ô OTP có đếm 3 phút và nút Gửi lại (đếm 60 giây)
- Hiển thị lỗi tại ô, đủ 5 trạng thái; chuyển vào Sảnh hoặc phòng mời đang chờ sau khi xong
**Đầu ra:** Màn Đăng ký hoạt động với API thật.
**Cách kiểm và điều kiện PASS:** AC E2E của US-01.1. PASS khi Playwright chạy được luồng đăng ký thành công và các luồng lỗi chính.
**Lịch:** Nhạn · 12 giờ · 11/10 sáng → 12/10 sáng · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-01.1; luật ở BA-SCOPE-DECISIONS.md.

#### T13 · Kiểm thử US-01.1

**Mục tiêu:** Kiểm thử US-01.1 — phục vụ US-01.1 Đăng ký bằng Username + Mật khẩu + OTP email (EP-01 Đăng ký và đăng nhập).
**Đầu vào (phải xong trước):** T08 (FE màn Đăng ký 3 bước).
**Việc cần làm:**
- Chạy TC của US-01.1, gồm đăng ký bằng Gmail thật ngoài nhóm
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-01.1 đạt.
**Lịch:** Thư · 4 giờ · 12/10 chiều → 12/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-01.1; luật ở BA-SCOPE-DECISIONS.md.

#### T09 · BE đăng nhập username, khoá thử sai, ghi nhớ đăng nhập

**Mục tiêu:** BE đăng nhập username, khoá thử sai, ghi nhớ đăng nhập — phục vụ US-01.2 Đăng nhập bằng Username + Mật khẩu và khoá thử sai (EP-01 Đăng ký và đăng nhập).
**Đầu vào (phải xong trước):** T04 (BE đăng ký 3 bước, OTP qua SMTP ngoài, dọn bản tạm).
**Việc cần làm:**
- API đăng nhập bằng username (tra email phía máy chủ, không trả về client), không phân biệt hoa thường, câu báo lỗi chung
- Migration bảng `login_attempts`; bộ đếm thử sai theo username chuẩn hoá (kể cả username không tồn tại): 5 lần/15 phút → chặn 15 phút; đăng nhập mật khẩu đúng thì đặt lại, đăng nhập Google **không** đặt lại (BA 0.15)
- Ghi nhớ đăng nhập: 30 ngày hoặc phiên trình duyệt/12 giờ; GATE-AUTH-USERNAME
**Đầu ra:** API đăng nhập + bảng `login_attempts` + báo cáo GATE-AUTH-USERNAME.
**Cách kiểm và điều kiện PASS:** AC U/I của US-01.2. PASS khi test tích hợp chứng minh khoá đúng, không lộ username tồn tại, đúng câu thông báo.
**Lịch:** Đông · 16 giờ · 11/10 sáng → 12/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-01.2; luật ở BA-SCOPE-DECISIONS.md.

#### T15 · FE màn Đăng nhập

**Mục tiêu:** FE màn Đăng nhập — phục vụ US-01.2 Đăng nhập bằng Username + Mật khẩu và khoá thử sai (EP-01 Đăng ký và đăng nhập).
**Đầu vào (phải xong trước):** T03 (Khung giao diện chung: theme, layout, router, thành phần 5 trạng thái), T09 (BE đăng nhập username, khoá thử sai, ghi nhớ đăng nhập).
**Việc cần làm:**
- Màn `SCR-LOGIN`: username, mật khẩu, Ghi nhớ đăng nhập (mặc định tick), nút Google và Guest hiển thị (hoạt động ở US-01.3), "Quên mật khẩu?" `DISABLED`
- Hiện thông báo khoá thử sai; đã đăng nhập vào `/login` thì về Sảnh
**Đầu ra:** Màn Đăng nhập hoạt động với API thật.
**Cách kiểm và điều kiện PASS:** AC E2E của US-01.2. PASS khi Playwright đăng nhập `TWOT` thành công và thấy câu khoá sau 5 lần sai.
**Lịch:** Nhạn · 8 giờ · 13/10 sáng → 13/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-01.2; luật ở BA-SCOPE-DECISIONS.md.

#### T17 · Kiểm thử US-01.2

**Mục tiêu:** Kiểm thử US-01.2 — phục vụ US-01.2 Đăng nhập bằng Username + Mật khẩu và khoá thử sai (EP-01 Đăng ký và đăng nhập).
**Đầu vào (phải xong trước):** T15 (FE màn Đăng nhập).
**Việc cần làm:**
- Chạy TC của US-01.2
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-01.2 đạt.
**Lịch:** Thư · 4 giờ · 14/10 sáng → 14/10 sáng · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-01.2; luật ở BA-SCOPE-DECISIONS.md.

#### T35 · BE đăng ký/đăng nhập Google, onboarding, phiên Khách

**Mục tiêu:** BE đăng ký/đăng nhập Google, onboarding, phiên Khách — phục vụ US-01.3 Đăng ký/đăng nhập bằng Google và chế độ Khách (EP-01 Đăng ký và đăng nhập).
**Đầu vào (phải xong trước):** T09 (BE đăng nhập username, khoá thử sai, ghi nhớ đăng nhập), T14 (Lược đồ CSDL P1, RLS, migration, dữ liệu mẫu).
**Việc cần làm:**
- Google OAuth trên Supabase: email chưa có → onboarding đặt username + mật khẩu; email đã có → báo trùng, không tự liên kết (GATE-GOOGLE); dọn bản tạm 60 phút
- Phiên Khách (đăng nhập ẩn danh, GATE-GUEST): tên tạm qua bộ lọc, nhãn "(Khách)", hạn 12 giờ (không hết khi đang ngồi ghế), xoá dữ liệu khi hết hạn; khoá thử sai không áp cho Google
**Đầu ra:** API Google + Khách + báo cáo GATE-GOOGLE, GATE-GUEST.
**Cách kiểm và điều kiện PASS:** AC U/I của US-01.3. PASS khi test tích hợp xanh và GATE-GOOGLE xác nhận không gộp tài khoản.
**Lịch:** Đông · 24 giờ · 23/10 chiều → 26/10 sáng · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-01.3; luật ở BA-SCOPE-DECISIONS.md.

#### T44 · FE nút Google, Onboarding, hộp tên Khách, ẩn chức năng cho Khách

**Mục tiêu:** FE nút Google, Onboarding, hộp tên Khách, ẩn chức năng cho Khách — phục vụ US-01.3 Đăng ký/đăng nhập bằng Google và chế độ Khách (EP-01 Đăng ký và đăng nhập).
**Đầu vào (phải xong trước):** T15 (FE màn Đăng nhập), T35 (BE đăng ký/đăng nhập Google, onboarding, phiên Khách).
**Việc cần làm:**
- Nút Google ở Đăng nhập/Đăng ký, màn `SCR-ONBOARDING` (không có nút X)
- Nút Guest + `MODAL-GUEST-NAME`, nhãn "(Khách)", vào phòng từ link mời bằng Khách
**Đầu ra:** Luồng Google và Khách hoạt động trên giao diện.
**Cách kiểm và điều kiện PASS:** AC E2E của US-01.3. PASS khi Playwright vào bằng Khách từ link mời và tự vào phòng.
**Lịch:** Kỳ · 12 giờ · 26/10 chiều → 27/10 chiều · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-01.3; luật ở BA-SCOPE-DECISIONS.md.

#### T48 · Kiểm thử US-01.3

**Mục tiêu:** Kiểm thử US-01.3 — phục vụ US-01.3 Đăng ký/đăng nhập bằng Google và chế độ Khách (EP-01 Đăng ký và đăng nhập).
**Đầu vào (phải xong trước):** T44 (FE nút Google, Onboarding, hộp tên Khách, ẩn chức năng cho Khách).
**Việc cần làm:**
- Chạy TC của US-01.3 với tài khoản Google thật
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-01.3 đạt.
**Lịch:** Thư · 8 giờ · 28/10 sáng → 28/10 chiều · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-01.3; luật ở BA-SCOPE-DECISIONS.md.

#### T56 · BE phiên cố định, một vị trí chơi, thiết bị khác xử thua, đăng xuất

**Mục tiêu:** BE phiên cố định, một vị trí chơi, thiết bị khác xử thua, đăng xuất — phục vụ US-01.4 Phiên đăng nhập, hồ sơ và Đăng xuất (EP-01 Đăng ký và đăng nhập).
**Đầu vào (phải xong trước):** T18 (BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host), T20 (BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván), T35 (BE đăng ký/đăng nhập Google, onboarding, phiên Khách).
**Việc cần làm:**
- Hạn phiên cố định (không gia hạn khi làm mới token), hết hạn trong ván: ân hạn 60 giây / ván AI 30 phút
- Một vị trí chơi: chặn ngồi ghế/ván thứ hai; đăng nhập thiết bị khác khi đang ván → xử thua, đăng xuất thiết bị cũ (GATE-SESSION)
- Đăng xuất chủ động: đang ván → đầu hàng có xác nhận; ở phòng chờ → rời phòng; banner ván dở
- Giới hạn của Khách: không xuất hiện trong tìm kiếm bạn bè, không nhận lời mời bạn bè
**Đầu ra:** Quản lý phiên phía máy chủ + test tích hợp + báo cáo GATE-SESSION.
**Cách kiểm và điều kiện PASS:** AC U/I của US-01.4. PASS khi test tích hợp xanh cho cả hai thiết bị.
**Lịch:** Cường · 24 giờ · 30/10 chiều → 02/11 sáng · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-01.4; luật ở BA-SCOPE-DECISIONS.md.

#### T65 · FE Cài đặt hồ sơ, Đăng xuất, banner ván dở

**Mục tiêu:** FE Cài đặt hồ sơ, Đăng xuất, banner ván dở — phục vụ US-01.4 Phiên đăng nhập, hồ sơ và Đăng xuất (EP-01 Đăng ký và đăng nhập).
**Đầu vào (phải xong trước):** T56 (BE phiên cố định, một vị trí chơi, thiết bị khác xử thua, đăng xuất).
**Việc cần làm:**
- `SCR-PROFILE-SETTINGS`: Display Name (2–30, lọc từ cấm), email chỉ đọc, avatar chữ cái, Đăng xuất có xác nhận
- Banner "Bạn có ván đang chơi dở — Quay lại", tooltip nút bị khoá do đang ở ván khác
- Với Khách: mục Bạn bè `DISABLED`, tab mời bạn bè ẩn, Cài đặt chỉ có Đăng xuất
**Đầu ra:** Giao diện hồ sơ và phiên.
**Cách kiểm và điều kiện PASS:** AC E2E của US-01.4. PASS khi Playwright đổi Display Name và thấy banner ván dở.
**Lịch:** Tình · 8 giờ · 02/11 chiều → 03/11 sáng · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-01.4; luật ở BA-SCOPE-DECISIONS.md.

#### T69 · Kiểm thử US-01.4

**Mục tiêu:** Kiểm thử US-01.4 — phục vụ US-01.4 Phiên đăng nhập, hồ sơ và Đăng xuất (EP-01 Đăng ký và đăng nhập).
**Đầu vào (phải xong trước):** T65 (FE Cài đặt hồ sơ, Đăng xuất, banner ván dở).
**Việc cần làm:**
- Chạy TC của US-01.4, gồm đăng nhập trên hai thiết bị thật
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-01.4 đạt.
**Lịch:** Nhạn · 4 giờ · 03/11 chiều → 03/11 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-01.4; luật ở BA-SCOPE-DECISIONS.md.

### EP-02 · Tạo phòng

#### T18 · BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host

**Mục tiêu:** BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host — phục vụ US-02.1 Tạo phòng, ghế và bắt đầu ván (EP-02 Tạo phòng).
**Đầu vào (phải xong trước):** T12 (Khung realtime Socket.IO), T14 (Lược đồ CSDL P1, RLS, migration, dữ liệu mẫu).
**Việc cần làm:**
- API tạo phòng (tên, mức giờ 5/10/15, số người xem 0–5), mã 8 ký tự, link mời; Host ngồi Đỏ; phòng mặc định CODE_ONLY
- Ghế, Đổi ghế tự do khi một người ngồi ghế, Sẵn sàng, đếm 3-2-1 (huỷ khi mất kết nối), phát sự kiện bắt đầu ván theo hợp đồng
- Chuyển Host, đóng phòng khi không còn người ngồi ghế, giới hạn 1 phòng cho Khách
**Đầu ra:** Dịch vụ phòng + test tích hợp.
**Cách kiểm và điều kiện PASS:** AC U/I của US-02.1. PASS khi test tích hợp xanh cho tạo phòng, Sẵn sàng/đếm, mất kết nối khi đếm, chuyển Host, đóng phòng.
**Lịch:** Cường · 24 giờ · 15/10 sáng → 17/10 chiều · XIAN Sprint 2.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-02.1; luật ở BA-SCOPE-DECISIONS.md.

#### T21 · FE hộp Tạo phòng và phòng chờ: ghế, Sẵn sàng, đếm ngược

**Mục tiêu:** FE hộp Tạo phòng và phòng chờ: ghế, Sẵn sàng, đếm ngược — phục vụ US-02.1 Tạo phòng, ghế và bắt đầu ván (EP-02 Tạo phòng).
**Đầu vào (phải xong trước):** T03 (Khung giao diện chung: theme, layout, router, thành phần 5 trạng thái), T18 (BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host).
**Việc cần làm:**
- `MODAL-CREATE-ROOM` (kiểm tra trường), trang phòng chờ: hai ghế, Đổi ghế (khi một người), Sẵn sàng, đếm 3-2-1 có âm thanh
- Hiển thị Host, trạng thái realtime, đủ 5 trạng thái
**Đầu ra:** Màn Tạo phòng và phòng chờ nối với API thật.
**Cách kiểm và điều kiện PASS:** AC E2E của US-02.1. PASS khi Playwright tạo phòng và hai trình duyệt cùng Sẵn sàng để vào ván.
**Lịch:** Nhạn · 16 giờ · 18/10 sáng → 19/10 chiều · XIAN Sprint 2.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-02.1; luật ở BA-SCOPE-DECISIONS.md.

#### T28 · Kiểm thử US-02.1

**Mục tiêu:** Kiểm thử US-02.1 — phục vụ US-02.1 Tạo phòng, ghế và bắt đầu ván (EP-02 Tạo phòng).
**Đầu vào (phải xong trước):** T26 (FE Chia sẻ phòng, nhập mã ở Sảnh, tự vào phòng sau đăng nhập).
**Việc cần làm:**
- Chạy TC của US-02.1 với hai trình duyệt
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-02.1 đạt.
**Lịch:** Kỳ · 8 giờ · 21/10 sáng → 21/10 chiều · XIAN Sprint 2.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-02.1; luật ở BA-SCOPE-DECISIONS.md.

#### T41 · BE Xin đổi bên và phòng về chờ sau ván

**Mục tiêu:** BE Xin đổi bên và phòng về chờ sau ván — phục vụ US-02.2 Xin đổi bên và ở lại phòng sau ván (EP-02 Tạo phòng).
**Đầu vào (phải xong trước):** T18 (BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host), T20 (BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván).
**Việc cần làm:**
- Xin đổi bên khi phòng chờ có đủ 2 người: 30 giây, đồng ý → hoán đổi + reset Sẵn sàng, từ chối → chờ 60 giây, 1 đề nghị chờ, tự huỷ khi đếm hoặc đổi ghế
- Sau ván: phòng về WAITING ngay, giữ ghế/người xem/chế độ/mức giờ, không hạn đóng 10 phút
**Đầu ra:** API đổi bên và vòng đời sau ván + test tích hợp.
**Cách kiểm và điều kiện PASS:** AC U/I của US-02.2. PASS khi test tích hợp xanh.
**Lịch:** Tùng · 12 giờ · 26/10 sáng → 27/10 sáng · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-02.2; luật ở BA-SCOPE-DECISIONS.md.

#### T46 · FE hộp Xin đổi bên, Ở lại phòng / Rời phòng

**Mục tiêu:** FE hộp Xin đổi bên, Ở lại phòng / Rời phòng — phục vụ US-02.2 Xin đổi bên và ở lại phòng sau ván (EP-02 Tạo phòng).
**Đầu vào (phải xong trước):** T25 (FE phòng thi đấu: nối nước đi, đồng hồ, hộp kết quả), T41 (BE Xin đổi bên và phòng về chờ sau ván).
**Việc cần làm:**
- Nút Xin đổi bên, `MODAL-SIDE-SWAP-PROMPT`, trạng thái chờ + Rút đề nghị, nút Đổi ghế ẩn khi đủ 2 người
- Hộp kết quả: Ở lại phòng / Rời phòng
**Đầu ra:** Giao diện đổi bên và sau ván.
**Cách kiểm và điều kiện PASS:** AC E2E của US-02.2. PASS khi Playwright đổi bên thành công và đánh ván thứ hai trong cùng phòng.
**Lịch:** Tình · 8 giờ · 27/10 chiều → 28/10 sáng · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-02.2; luật ở BA-SCOPE-DECISIONS.md.

#### T50 · Kiểm thử US-02.2

**Mục tiêu:** Kiểm thử US-02.2 — phục vụ US-02.2 Xin đổi bên và ở lại phòng sau ván (EP-02 Tạo phòng).
**Đầu vào (phải xong trước):** T46 (FE hộp Xin đổi bên, Ở lại phòng / Rời phòng).
**Việc cần làm:**
- Chạy TC của US-02.2
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-02.2 đạt.
**Lịch:** Nhạn · 4 giờ · 28/10 chiều → 28/10 chiều · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-02.2; luật ở BA-SCOPE-DECISIONS.md.

### EP-03 · Mời vào phòng

#### T22 · BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập

**Mục tiêu:** BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập — phục vụ US-03.1 Mời bằng link/mã và vào phòng (EP-03 Mời vào phòng).
**Đầu vào (phải xong trước):** T18 (BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host).
**Việc cần làm:**
- API vào phòng bằng mã/link: xếp ghế trống, hết ghế làm người xem nếu còn chỗ, đầy thì từ chối
- Lưu đích chuyển hướng khi chưa đăng nhập để tự vào phòng sau đăng nhập/đăng ký
**Đầu ra:** API vào phòng + test tích hợp.
**Cách kiểm và điều kiện PASS:** AC U/I của US-03.1. PASS khi test tích hợp xanh cho ghế trống, người xem, phòng đầy, mã sai.
**Lịch:** Tùng · 16 giờ · 18/10 sáng → 19/10 chiều · XIAN Sprint 2.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-03.1; luật ở BA-SCOPE-DECISIONS.md.

#### T26 · FE Chia sẻ phòng, nhập mã ở Sảnh, tự vào phòng sau đăng nhập

**Mục tiêu:** FE Chia sẻ phòng, nhập mã ở Sảnh, tự vào phòng sau đăng nhập — phục vụ US-03.1 Mời bằng link/mã và vào phòng (EP-03 Mời vào phòng).
**Đầu vào (phải xong trước):** T21 (FE hộp Tạo phòng và phòng chờ: ghế, Sẵn sàng, đếm ngược), T22 (BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập).
**Việc cần làm:**
- `MODAL-INVITE` phần link + mã (Sao chép), ô nhập mã ở Sảnh, tự chuyển vào phòng sau đăng nhập
- `SCR-ACCESS-DENIED` cho phòng đầy/mã sai
**Đầu ra:** Luồng mời bằng link/mã chạy với API thật.
**Cách kiểm và điều kiện PASS:** AC E2E của US-03.1. PASS khi Playwright: người thứ hai vào bằng mã, người thứ ba thành người xem, phòng đầy bị từ chối.
**Lịch:** Nhạn · 8 giờ · 20/10 sáng → 20/10 chiều · XIAN Sprint 2.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-03.1; luật ở BA-SCOPE-DECISIONS.md.

#### T29 · Kiểm thử US-03.1

**Mục tiêu:** Kiểm thử US-03.1 — phục vụ US-03.1 Mời bằng link/mã và vào phòng (EP-03 Mời vào phòng).
**Đầu vào (phải xong trước):** T26 (FE Chia sẻ phòng, nhập mã ở Sảnh, tự vào phòng sau đăng nhập).
**Việc cần làm:**
- Chạy TC của US-03.1 (đăng nhập, chưa đăng nhập, phòng đầy)
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-03.1 đạt.
**Lịch:** Thư · 8 giờ · 21/10 sáng → 21/10 chiều · XIAN Sprint 2.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-03.1; luật ở BA-SCOPE-DECISIONS.md.

#### T31 · BE bạn bè, trạng thái online, mời bạn online vào phòng

**Mục tiêu:** BE bạn bè, trạng thái online, mời bạn online vào phòng — phục vụ US-03.2 Bạn bè và mời bạn online (EP-03 Mời vào phòng).
**Đầu vào (phải xong trước):** T22 (BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập).
**Việc cần làm:**
- Tìm theo tiền tố username, lời mời kết bạn (gửi, nhận, thu hồi, hết hạn 30 ngày, giới hạn 200/50, bị từ chối 2 lần), huỷ kết bạn; Khách bị loại
- Trạng thái Online/Đang đấu/Offline realtime, chuông lời mời
- Mời bạn online vào phòng: pop-up 30 giây, Tham gia dùng API vào phòng, thu hồi khi phòng khoá
**Đầu ra:** API bạn bè, trạng thái, lời mời vào phòng + test tích hợp.
**Cách kiểm và điều kiện PASS:** AC U/I của US-03.2. PASS khi test tích hợp xanh.
**Lịch:** Tùng · 24 giờ · 22/10 sáng → 24/10 chiều · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-03.2; luật ở BA-SCOPE-DECISIONS.md.

#### T40 · FE màn Bạn bè, chuông, tab mời bạn bè, pop-up lời mời

**Mục tiêu:** FE màn Bạn bè, chuông, tab mời bạn bè, pop-up lời mời — phục vụ US-03.2 Bạn bè và mời bạn online (EP-03 Mời vào phòng).
**Đầu vào (phải xong trước):** T31 (BE bạn bè, trạng thái online, mời bạn online vào phòng).
**Việc cần làm:**
- `SCR-FRIENDS` (tìm kiếm, hai tab, Nhắn tin/Thách đấu `DISABLED`), chuông ở thanh điều hướng
- Tab mời bạn bè trong `MODAL-INVITE` theo trạng thái, pop-up lời mời phía người nhận; ẩn với Khách
**Đầu ra:** Giao diện bạn bè và mời online.
**Cách kiểm và điều kiện PASS:** AC E2E của US-03.2. PASS khi Playwright kết bạn và mời bạn online vào phòng thành công.
**Lịch:** Nhạn · 16 giờ · 25/10 chiều → 27/10 sáng · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-03.2; luật ở BA-SCOPE-DECISIONS.md.

#### T49 · Kiểm thử US-03.2

**Mục tiêu:** Kiểm thử US-03.2 — phục vụ US-03.2 Bạn bè và mời bạn online (EP-03 Mời vào phòng).
**Đầu vào (phải xong trước):** T40 (FE màn Bạn bè, chuông, tab mời bạn bè, pop-up lời mời).
**Việc cần làm:**
- Chạy TC của US-03.2 với 3 tài khoản
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-03.2 đạt.
**Lịch:** Kỳ · 8 giờ · 28/10 sáng → 28/10 chiều · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-03.2; luật ở BA-SCOPE-DECISIONS.md.

### EP-04 · Khởi tạo bàn cờ

#### T05 · Lõi luật cờ (1/3): bàn cờ và nước đi, ăn quân của 7 loại quân

**Mục tiêu:** Lõi luật cờ (1/3): bàn cờ và nước đi, ăn quân của 7 loại quân — phục vụ US-04.1 Lõi luật cờ dùng chung (EP-04 Khởi tạo bàn cờ).
**Đầu vào (phải xong trước):** T01 (Dựng monorepo, CI, nhật ký và /health).
**Việc cần làm:**
- Biểu diễn bàn cờ 9×10 và thế cờ; tuần tự hoá/đọc lại thế cờ (chuỗi kiểu FEN nội bộ)
- Sinh nước đi và ăn quân cho từng loại quân: Tướng và Sĩ (trong cung), Tượng (đi chéo 2 ô, bị chặn mắt, không qua sông), Xe (đi thẳng), Mã (bị cản chân), Pháo (đi như Xe, **ăn phải nhảy qua đúng một ngòi**), Tốt (chưa qua sông chỉ tiến, qua sông được đi ngang, không lùi)
- Unit test riêng cho từng loại quân, mỗi loại ít nhất một thế bị chặn và một thế ăn quân
**Đầu ra:** Hàm sinh nước giả hợp lệ (chưa xét tự chiếu) cho 7 loại quân trong `packages/xiangqi-core`.
**Cách kiểm và điều kiện PASS:** AC-04.1.2, AC-04.1.9 và phần "thế khai cuộc có đúng 44 nước" của AC-04.1.1. PASS khi unit test của cả 7 loại quân và test tuần tự hoá xanh trong CI.
**Lịch:** Tình · 8 giờ · 09/10 sáng → 09/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-04.1; luật ở BA-SCOPE-DECISIONS.md.

#### T07 · Lõi luật cờ (2/3): nước hợp lệ, chiếu, chiếu hết, hết nước

**Mục tiêu:** Lõi luật cờ (2/3): nước hợp lệ, chiếu, chiếu hết, hết nước — phục vụ US-04.1 Lõi luật cờ dùng chung (EP-04 Khởi tạo bàn cờ).
**Đầu vào (phải xong trước):** T05 (Lõi luật cờ (1/3): bàn cờ và nước đi, ăn quân của 7 loại quân).
**Việc cần làm:**
- Lọc nước giả hợp lệ: loại nước làm hai Tướng đối mặt không có quân chắn và nước để Tướng mình bị chiếu
- Hàm kiểm tra đang bị chiếu; xác định chiếu hết (`CHECKMATE`) và hết nước không bị chiếu (`STALEMATE` — bên hết nước thua)
- API công khai `legalMoves(position)`, `isCheck(position)`, `applyMove(position, move)` để giao diện, máy chủ và máy cờ dùng chung
**Đầu ra:** Bộ sinh nước hợp lệ hoàn chỉnh và nhận biết chiếu/chiếu hết/hết nước.
**Cách kiểm và điều kiện PASS:** AC-04.1.3, AC-04.1.4, AC-04.1.5. PASS khi unit test các thế Tướng đối mặt, tự chiếu, chiếu hết và hết nước xanh trong CI.
**Lịch:** Tình · 8 giờ · 10/10 sáng → 10/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-04.1; luật ở BA-SCOPE-DECISIONS.md.

#### T10 · Lõi luật cờ (3/3): luật kết thúc ván, perft, độ phủ kiểm thử

**Mục tiêu:** Lõi luật cờ (3/3): luật kết thúc ván, perft, độ phủ kiểm thử — phục vụ US-04.1 Lõi luật cờ dùng chung (EP-04 Khởi tạo bàn cờ).
**Đầu vào (phải xong trước):** T07 (Lõi luật cờ (2/3): nước hợp lệ, chiếu, chiếu hết, hết nước).
**Việc cần làm:**
- Lịch sử thế cờ trên nhánh nước hiệu lực (thế giống nhau = cùng vị trí mọi quân **và** cùng bên tới lượt; chu kỳ = các nước từ lần xuất hiện thứ 1 đến lần thứ 3 — BA 0.12): lặp 3 lần → hoà, chiếu liên tục → bên chiếu thua (cả hai cùng chiếu → hoà), 120 nửa nước không ăn quân → hoà, chiếu hết được ưu tiên hơn mọi kết quả hoà
- Perft độ sâu 2 và 3 từ thế khai cuộc, đối chiếu số đã công bố
- Viết tài liệu ngắn cho API; đo độ phủ unit test của cả gói
**Đầu ra:** Gói `packages/xiangqi-core` hoàn chỉnh, có tài liệu và độ phủ ≥ 90%.
**Cách kiểm và điều kiện PASS:** AC-04.1.6, AC-04.1.7, AC-04.1.8 và phần perft của AC-04.1.1. PASS khi toàn bộ unit test xanh, perft khớp số công bố, độ phủ dòng ≥ 90%.
**Lịch:** Tình · 8 giờ · 11/10 sáng → 11/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-04.1; luật ở BA-SCOPE-DECISIONS.md.

#### T11 · FE bàn cờ SVG: vẽ, quân, lật bàn, responsive, nhãn trợ năng

**Mục tiêu:** FE bàn cờ SVG: vẽ, quân, lật bàn, responsive, nhãn trợ năng — phục vụ US-04.2 Khởi tạo và hiển thị bàn cờ (EP-04 Khởi tạo bàn cờ).
**Đầu vào (phải xong trước):** T01 (Dựng monorepo, CI, nhật ký và /health).
**Việc cần làm:**
- Vẽ bàn cờ SVG 9×10, sông, cung; 32 quân chữ Hán theo DESIGN.md §7; lật bàn khi cầm Đen
- Co giãn từ 360 px, quân đủ lớn để chạm; nhãn trợ năng cho quân và lượt đi
**Đầu ra:** Component `<Board>` hiển thị từ một thế cờ cho trước.
**Cách kiểm và điều kiện PASS:** AC E2E/M của US-04.2. PASS khi: ảnh chụp đúng 32 quân đúng vị trí, lật đúng khi cầm Đen, hiển thị trọn ở 360 px.
**Lịch:** Kỳ · 16 giờ · 11/10 sáng → 12/10 chiều · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-04.2; luật ở BA-SCOPE-DECISIONS.md.

#### T16 · Kiểm thử US-04.2

**Mục tiêu:** Kiểm thử US-04.2 — phục vụ US-04.2 Khởi tạo và hiển thị bàn cờ (EP-04 Khởi tạo bàn cờ).
**Đầu vào (phải xong trước):** T11 (FE bàn cờ SVG: vẽ, quân, lật bàn, responsive, nhãn trợ năng).
**Việc cần làm:**
- Viết và chạy TC của US-04.2 trên Chrome, Firefox, Safari và một điện thoại thật
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-04.2 đạt, không còn lỗi Nghiêm trọng/Cao.
**Lịch:** Thư · 4 giờ · 13/10 sáng → 13/10 sáng · XIAN Sprint 1.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-04.2; luật ở BA-SCOPE-DECISIONS.md.

#### T19 · FE đi cờ click/kéo thả, gợi ý ô, đánh dấu, âm thanh

**Mục tiêu:** FE đi cờ click/kéo thả, gợi ý ô, đánh dấu, âm thanh — phục vụ US-04.3 Đi cờ bằng click/kéo thả và âm thanh (EP-04 Khởi tạo bàn cờ).
**Đầu vào (phải xong trước):** T10 (Lõi luật cờ (3/3): luật kết thúc ván, perft, độ phủ kiểm thử), T11 (FE bàn cờ SVG: vẽ, quân, lật bàn, responsive, nhãn trợ năng).
**Việc cần làm:**
- Chọn quân bằng click/chạm, kéo thả chuột và cảm ứng, trượt về khi thả sai; chấm ô hợp lệ, vòng quân ăn được (lấy từ `xiangqi-core`)
- Đánh dấu nước vừa đi (4 góc), cảnh báo chiếu không nhấp nháy, tôn trọng giảm chuyển động
- 4 âm thanh Web Audio API + nút tắt tiếng giữ trong phiên
**Đầu ra:** Bàn cờ chơi được hai bên trên một máy (chế độ thử).
**Cách kiểm và điều kiện PASS:** AC E2E của US-04.3. PASS khi Playwright đi được nước bằng click và kéo thả, nước sai bị từ chối.
**Lịch:** Kỳ · 24 giờ · 15/10 sáng → 17/10 chiều · XIAN Sprint 2.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-04.3; luật ở BA-SCOPE-DECISIONS.md.

#### T27 · Kiểm thử US-04.3

**Mục tiêu:** Kiểm thử US-04.3 — phục vụ US-04.3 Đi cờ bằng click/kéo thả và âm thanh (EP-04 Khởi tạo bàn cờ).
**Đầu vào (phải xong trước):** T19 (FE đi cờ click/kéo thả, gợi ý ô, đánh dấu, âm thanh).
**Việc cần làm:**
- Chạy TC của US-04.3 trên máy tính và điện thoại
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-04.3 đạt.
**Lịch:** Thư · 4 giờ · 20/10 sáng → 20/10 sáng · XIAN Sprint 2.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-04.3; luật ở BA-SCOPE-DECISIONS.md.

### EP-05 · Hai người đánh cờ online

#### T20 · BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván

**Mục tiêu:** BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván — phục vụ US-05.1 Ván online: đi cờ, đồng hồ và kết thúc ván (EP-05 Hai người đánh cờ online).
**Đầu vào (phải xong trước):** T10 (Lõi luật cờ (3/3): luật kết thúc ván, perft, độ phủ kiểm thử), T12 (Khung realtime Socket.IO).
**Việc cần làm:**
- Dịch vụ ván: tạo ván từ sự kiện phòng (theo hợp đồng ở US-00.3), giữ trạng thái, nhận ý định đi cờ, phân xử bằng `xiangqi-core`
- Phát nước đi tới hai người chơi và người xem; tự kết thúc ván theo luật; lưu `matches`, `match_moves`
- Từ chối nước sai luật/không đúng lượt, đồng bộ lại client
**Đầu ra:** Dịch vụ ván online có API socket và test tích hợp.
**Cách kiểm và điều kiện PASS:** AC U/I của US-05.1 (trừ đồng hồ). PASS khi test tích hợp xanh và độ trễ phát nước đi đo được trong môi trường demo.
**Lịch:** Tình · 24 giờ · 15/10 sáng → 17/10 chiều · XIAN Sprint 2.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-05.1; luật ở BA-SCOPE-DECISIONS.md.

#### T23 · BE đồng hồ thi đấu và hết giờ

**Mục tiêu:** BE đồng hồ thi đấu và hết giờ — phục vụ US-05.1 Ván online: đi cờ, đồng hồ và kết thúc ván (EP-05 Hai người đánh cờ online).
**Đầu vào (phải xong trước):** T20 (BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván).
**Việc cần làm:**
- Đồng hồ máy chủ theo mức giờ phòng, chỉ chạy bên tới lượt, không cộng giây; tính giờ trước khi xét nước
- Hết giờ → kết thúc `TIMEOUT`; gửi thời gian còn lại trong ảnh chụp
**Đầu ra:** Đồng hồ tích hợp trong dịch vụ ván.
**Cách kiểm và điều kiện PASS:** AC U/I về đồng hồ của US-05.1. PASS khi test tích hợp xanh cho hết giờ và nước đến muộn.
**Lịch:** Đông · 8 giờ · 18/10 sáng → 18/10 chiều · XIAN Sprint 2.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-05.1; luật ở BA-SCOPE-DECISIONS.md.

#### T25 · FE phòng thi đấu: nối nước đi, đồng hồ, hộp kết quả

**Mục tiêu:** FE phòng thi đấu: nối nước đi, đồng hồ, hộp kết quả — phục vụ US-05.1 Ván online: đi cờ, đồng hồ và kết thúc ván (EP-05 Hai người đánh cờ online).
**Đầu vào (phải xong trước):** T19 (FE đi cờ click/kéo thả, gợi ý ô, đánh dấu, âm thanh), T23 (BE đồng hồ thi đấu và hết giờ).
**Việc cần làm:**
- Nối `<Board>` với dịch vụ ván: gửi ý định, nhận nước đi, khoá bàn khi không tới lượt, người xem chỉ xem
- Hiển thị đồng hồ hai bên, đồng bộ lại khi tab ẩn
- Hộp kết quả với lý do tiếng Việt
**Đầu ra:** Màn phòng thi đấu chơi được trọn ván giữa hai trình duyệt.
**Cách kiểm và điều kiện PASS:** AC E2E của US-05.1. PASS khi Playwright đánh trọn một ván chiếu hết giữa hai trình duyệt và người xem thấy cùng bàn cờ.
**Lịch:** Kỳ · 16 giờ · 19/10 sáng → 20/10 chiều · XIAN Sprint 2.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-05.1; luật ở BA-SCOPE-DECISIONS.md.

#### T30 · Kiểm thử US-05.1

**Mục tiêu:** Kiểm thử US-05.1 — phục vụ US-05.1 Ván online: đi cờ, đồng hồ và kết thúc ván (EP-05 Hai người đánh cờ online).
**Đầu vào (phải xong trước):** T25 (FE phòng thi đấu: nối nước đi, đồng hồ, hộp kết quả), T26 (FE Chia sẻ phòng, nhập mã ở Sảnh, tự vào phòng sau đăng nhập).
**Việc cần làm:**
- Chạy TC của US-05.1 với 2 người chơi + 1 người xem
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-05.1 đạt.
**Lịch:** Nhạn · 8 giờ · 21/10 sáng → 21/10 chiều · XIAN Sprint 2.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-05.1; luật ở BA-SCOPE-DECISIONS.md.

#### T32 · BE đầu hàng, rời phòng giữa ván, xin hoà

**Mục tiêu:** BE đầu hàng, rời phòng giữa ván, xin hoà — phục vụ US-05.2 Đầu hàng và xin hoà (EP-05 Hai người đánh cờ online).
**Đầu vào (phải xong trước):** T20 (BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván).
**Việc cần làm:**
- Đầu hàng (`RESIGN`), rời phòng giữa ván = đầu hàng, chuyển Host
- Xin hoà: đề nghị 30 giây, chấp nhận → `DRAW_AGREEMENT`, từ chối/hết hạn → chờ 5 nước, rút đề nghị, đóng khi ván kết thúc
**Đầu ra:** API đề nghị trong ván + test tích hợp.
**Cách kiểm và điều kiện PASS:** AC U/I của US-05.2. PASS khi test tích hợp xanh cho đầu hàng, hoà, thời gian chờ 5 nước.
**Lịch:** Đông · 12 giờ · 22/10 sáng → 23/10 sáng · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-05.2; luật ở BA-SCOPE-DECISIONS.md.

#### T36 · FE nút Đầu hàng, Xin hoà và khung đề nghị

**Mục tiêu:** FE nút Đầu hàng, Xin hoà và khung đề nghị — phục vụ US-05.2 Đầu hàng và xin hoà (EP-05 Hai người đánh cờ online).
**Đầu vào (phải xong trước):** T25 (FE phòng thi đấu: nối nước đi, đồng hồ, hộp kết quả), T32 (BE đầu hàng, rời phòng giữa ván, xin hoà).
**Việc cần làm:**
- `MODAL-CONFIRM-RESIGN`, `MODAL-CONFIRM-LEAVE` (focus ở Huỷ)
- Khung Xin hoà không modal (thu gọn, mở lại, đếm 30 giây), nút `DISABLED` có tooltip số nước còn chờ
**Đầu ra:** Giao diện đầu hàng và xin hoà.
**Cách kiểm và điều kiện PASS:** AC E2E của US-05.2. PASS khi Playwright đầu hàng và xin hoà được giữa hai trình duyệt.
**Lịch:** Kỳ · 8 giờ · 23/10 chiều → 24/10 sáng · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-05.2; luật ở BA-SCOPE-DECISIONS.md.

#### T39 · Kiểm thử US-05.2

**Mục tiêu:** Kiểm thử US-05.2 — phục vụ US-05.2 Đầu hàng và xin hoà (EP-05 Hai người đánh cờ online).
**Đầu vào (phải xong trước):** T36 (FE nút Đầu hàng, Xin hoà và khung đề nghị).
**Việc cần làm:**
- Chạy TC của US-05.2
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-05.2 đạt.
**Lịch:** Thư · 4 giờ · 25/10 sáng → 25/10 sáng · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-05.2; luật ở BA-SCOPE-DECISIONS.md.

#### T52 · Mất kết nối: ân hạn 60 giây, nối lại, ván bị gián đoạn, lớp phủ (BE + FE)

**Mục tiêu:** Mất kết nối: ân hạn 60 giây, nối lại, ván bị gián đoạn, lớp phủ (BE + FE) — phục vụ US-05.3 Mất kết nối và nối lại (EP-05 Hai người đánh cờ online).
**Đầu vào (phải xong trước):** T25 (FE phòng thi đấu: nối nước đi, đồng hồ, hộp kết quả).
**Việc cần làm:**
- Máy chủ: ân hạn 60 giây (đồng hồ vẫn chạy), `TIMEOUT` vs `DISCONNECT`, cả hai mất kết nối thì bên mất trước thua, khởi động lại → "Ván bị gián đoạn"
- Client: `OVERLAY-RECONNECTING` theo vai trò, tự nối lại và đồng bộ ảnh chụp
**Đầu ra:** Xử lý mất kết nối đầu-cuối.
**Cách kiểm và điều kiện PASS:** AC của US-05.3 mức U/I/E2E. PASS khi test tích hợp xanh và Playwright mô phỏng rớt mạng 30 giây rồi nối lại thành công.
**Lịch:** Tình · 16 giờ · 29/10 sáng → 30/10 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-05.3; luật ở BA-SCOPE-DECISIONS.md.

#### T60 · Kiểm thử US-05.3

**Mục tiêu:** Kiểm thử US-05.3 — phục vụ US-05.3 Mất kết nối và nối lại (EP-05 Hai người đánh cờ online).
**Đầu vào (phải xong trước):** T52 (Mất kết nối: ân hạn 60 giây, nối lại, ván bị gián đoạn, lớp phủ (BE + FE)).
**Việc cần làm:**
- Chạy TC của US-05.3 (rút mạng thật trên thiết bị)
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-05.3 đạt.
**Lịch:** Thư · 4 giờ · 01/11 sáng → 01/11 sáng · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-05.3; luật ở BA-SCOPE-DECISIONS.md.

### EP-06 · Chế độ phòng và người xem

#### T53 · BE chế độ PUBLIC / CODE_ONLY / LOCKED, thu hồi mã

**Mục tiêu:** BE chế độ PUBLIC / CODE_ONLY / LOCKED, thu hồi mã — phục vụ US-06.1 Cài đặt phòng: PUBLIC / CODE_ONLY / LOCKED (EP-06 Chế độ phòng và người xem).
**Đầu vào (phải xong trước):** T22 (BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập).
**Việc cần làm:**
- Chuyển PUBLIC / CODE_ONLY / LOCKED (chỉ Host); LOCKED chỉ bật khi đủ 2 người chơi và giữ khoá khi thiếu ghế
- Khoá: chặn người mới, vô hiệu link/mã/lời mời chưa dùng; mở lại sinh mã/link mới; người đang trong phòng giữ quyền nối lại
**Đầu ra:** API chế độ phòng + test tích hợp.
**Cách kiểm và điều kiện PASS:** AC U/I của US-06.1. PASS khi test tích hợp xanh cho khoá, thu hồi mã và mở lại.
**Lịch:** Đông · 16 giờ · 29/10 sáng → 30/10 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-06.1; luật ở BA-SCOPE-DECISIONS.md.

#### T57 · FE Cài đặt phòng

**Mục tiêu:** FE Cài đặt phòng — phục vụ US-06.1 Cài đặt phòng: PUBLIC / CODE_ONLY / LOCKED (EP-06 Chế độ phòng và người xem).
**Đầu vào (phải xong trước):** T53 (BE chế độ PUBLIC / CODE_ONLY / LOCKED, thu hồi mã).
**Việc cần làm:**
- `MODAL-ROOM-SETTINGS` (chỉ Host), LOCKED `DISABLED` khi chưa đủ 2 người chơi, hiển thị mã/link mới sau khi mở lại
**Đầu ra:** Giao diện Cài đặt phòng.
**Cách kiểm và điều kiện PASS:** AC E2E của US-06.1. PASS khi Playwright khoá phòng và người có mã cũ bị từ chối.
**Lịch:** Nhạn · 8 giờ · 31/10 sáng → 31/10 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-06.1; luật ở BA-SCOPE-DECISIONS.md.

#### T62 · Kiểm thử US-06.1

**Mục tiêu:** Kiểm thử US-06.1 — phục vụ US-06.1 Cài đặt phòng: PUBLIC / CODE_ONLY / LOCKED (EP-06 Chế độ phòng và người xem).
**Đầu vào (phải xong trước):** T57 (FE Cài đặt phòng).
**Việc cần làm:**
- Chạy TC của US-06.1
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-06.1 đạt.
**Lịch:** Thư · 4 giờ · 01/11 chiều → 01/11 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-06.1; luật ở BA-SCOPE-DECISIONS.md.

#### T54 · BE danh sách phòng PUBLIC realtime, Vào chơi/Vào xem

**Mục tiêu:** BE danh sách phòng PUBLIC realtime, Vào chơi/Vào xem — phục vụ US-06.2 Sảnh và danh sách phòng công khai (EP-06 Chế độ phòng và người xem).
**Đầu vào (phải xong trước):** T22 (BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập).
**Việc cần làm:**
- Danh sách phòng PUBLIC: cột theo BA 0.5, mới nhất trước, tối đa 50, đẩy cập nhật realtime khi phòng đổi trạng thái/số người/chế độ
- "Vào chơi" (ghế vừa hết → người xem nếu còn chỗ) và "Vào xem"; Khách được dùng
**Đầu ra:** API danh sách Sảnh + test tích hợp.
**Cách kiểm và điều kiện PASS:** AC U/I của US-06.2. PASS khi test tích hợp xanh và danh sách cập nhật ≤ 2 giây.
**Lịch:** Cường · 12 giờ · 29/10 sáng → 30/10 sáng · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-06.2; luật ở BA-SCOPE-DECISIONS.md.

#### T61 · FE Sảnh: bốn lựa chọn, Luật chơi, danh sách phòng, thanh điều hướng

**Mục tiêu:** FE Sảnh: bốn lựa chọn, Luật chơi, danh sách phòng, thanh điều hướng — phục vụ US-06.2 Sảnh và danh sách phòng công khai (EP-06 Chế độ phòng và người xem).
**Đầu vào (phải xong trước):** T54 (BE danh sách phòng PUBLIC realtime, Vào chơi/Vào xem).
**Việc cần làm:**
- Sảnh đầy đủ: bốn lựa chọn (hai lựa chọn P2 `DISABLED` "Sắp ra mắt"), mục Luật chơi mở rộng/thu gọn theo AC, danh sách phòng PUBLIC với nút Vào chơi/Vào xem, trạng thái EMPTY
- Hoàn thiện thanh điều hướng theo AC
**Đầu ra:** Màn Sảnh hoàn chỉnh.
**Cách kiểm và điều kiện PASS:** AC E2E của US-06.2. PASS khi Playwright thấy phòng PUBLIC mới xuất hiện và vào xem được.
**Lịch:** Nhạn · 16 giờ · 01/11 sáng → 02/11 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-06.2; luật ở BA-SCOPE-DECISIONS.md.

#### T67 · Kiểm thử US-06.2

**Mục tiêu:** Kiểm thử US-06.2 — phục vụ US-06.2 Sảnh và danh sách phòng công khai (EP-06 Chế độ phòng và người xem).
**Đầu vào (phải xong trước):** T61 (FE Sảnh: bốn lựa chọn, Luật chơi, danh sách phòng, thanh điều hướng).
**Việc cần làm:**
- Chạy TC của US-06.2, đối chiếu nội dung Luật chơi với BA 3.3/3.5/10.4
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-06.2 đạt.
**Lịch:** Thư · 8 giờ · 03/11 sáng → 03/11 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-06.2; luật ở BA-SCOPE-DECISIONS.md.

#### T55 · BE người xem, chuyển ghế ↔ xem, mời xuống ghế, đuổi và chặn

**Mục tiêu:** BE người xem, chuyển ghế ↔ xem, mời xuống ghế, đuổi và chặn — phục vụ US-06.3 Người xem và đuổi người xem (EP-06 Chế độ phòng và người xem).
**Đầu vào (phải xong trước):** T22 (BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập).
**Việc cần làm:**
- Vai trò người xem, sức chứa X/N, giữ chỗ 5 phút khi mất kết nối
- Chuyển ghế ↔ người xem, Host mời xuống ghế (chấp nhận/từ chối, không giữ ghế), không đổi chỗ khi đang ván
- Đuổi người xem (cả hai người chơi), chặn đến khi phòng đóng, phát sự kiện đuổi cho Task media
**Đầu ra:** API người xem + test tích hợp.
**Cách kiểm và điều kiện PASS:** AC U/I của US-06.3. PASS khi test tích hợp xanh cho sức chứa, mời xuống ghế, đuổi và chặn.
**Lịch:** Tùng · 16 giờ · 29/10 sáng → 30/10 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-06.3; luật ở BA-SCOPE-DECISIONS.md.

#### T58 · FE danh sách người xem, nút Kick, thao tác ghế

**Mục tiêu:** FE danh sách người xem, nút Kick, thao tác ghế — phục vụ US-06.3 Người xem và đuổi người xem (EP-06 Chế độ phòng và người xem).
**Đầu vào (phải xong trước):** T55 (BE người xem, chuyển ghế ↔ xem, mời xuống ghế, đuổi và chặn).
**Việc cần làm:**
- `PANEL-SPECTATORS` (X/N, cập nhật realtime), nút Kick + `MODAL-CONFIRM-KICK`
- Nút Chuyển sang người xem / Mời xuống ghế, tooltip khi không còn chỗ
**Đầu ra:** Giao diện quản lý người xem.
**Cách kiểm và điều kiện PASS:** AC E2E của US-06.3. PASS khi Playwright đuổi một người xem và người đó không vào lại được.
**Lịch:** Kỳ · 12 giờ · 31/10 sáng → 01/11 sáng · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-06.3; luật ở BA-SCOPE-DECISIONS.md.

#### T64 · Kiểm thử US-06.3

**Mục tiêu:** Kiểm thử US-06.3 — phục vụ US-06.3 Người xem và đuổi người xem (EP-06 Chế độ phòng và người xem).
**Đầu vào (phải xong trước):** T33 (Camera/mic LiveKit: token, quyền phát, mức chia sẻ, khung media (BE + FE)), T58 (FE danh sách người xem, nút Kick, thao tác ghế).
**Việc cần làm:**
- Chạy TC của US-06.3, gồm kiểm mất hình/tiếng ngay khi bị đuổi
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-06.3 đạt.
**Lịch:** Thư · 8 giờ · 02/11 sáng → 02/11 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-06.3; luật ở BA-SCOPE-DECISIONS.md.

### EP-07 · Chat, camera và mic

#### T37 · BE hai kênh chat, bộ lọc từ cấm, giới hạn tốc độ

**Mục tiêu:** BE hai kênh chat, bộ lọc từ cấm, giới hạn tốc độ — phục vụ US-07.1 Hai kênh chat và bộ lọc (EP-07 Chat, camera và mic).
**Đầu vào (phải xong trước):** T18 (BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host).
**Việc cần làm:**
- Kênh Riêng (chỉ hai người chơi, mốc theo cặp) và Kênh Chung (người xem thấy từ lúc vào); hoạt động cả ở phòng chờ lẫn trong ván (BA 0.13); xoá chat khi phòng đóng
- Bộ lọc từ cấm (chuẩn hoá dấu, hoa/thường, ký tự chèn, `0→o`, `1→i`), tệp cấu hình danh sách; 200 ký tự, 5 tin/10 giây
**Đầu ra:** Dịch vụ chat + test.
**Cách kiểm và điều kiện PASS:** AC U/I của US-07.1. PASS khi unit test bộ lọc và test tích hợp quyền kênh xanh.
**Lịch:** Cường · 16 giờ · 24/10 sáng → 25/10 chiều · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-07.1; luật ở BA-SCOPE-DECISIONS.md.

#### T42 · FE khung chat hai kênh

**Mục tiêu:** FE khung chat hai kênh — phục vụ US-07.1 Hai kênh chat và bộ lọc (EP-07 Chat, camera và mic).
**Đầu vào (phải xong trước):** T25 (FE phòng thi đấu: nối nước đi, đồng hồ, hộp kết quả), T37 (BE hai kênh chat, bộ lọc từ cấm, giới hạn tốc độ).
**Việc cần làm:**
- `PANEL-CHAT` dùng chung cho phòng chờ và phòng thi đấu: máy tính mặc định chỉ Kênh Riêng, mở thêm Kênh Chung; điện thoại dùng tab; người xem chỉ Kênh Chung; hiển thị văn bản thuần
**Đầu ra:** Khung chat hai kênh.
**Cách kiểm và điều kiện PASS:** AC E2E của US-07.1. PASS khi Playwright: người xem không thấy Kênh Riêng, tin thô tục bị che `***`.
**Lịch:** Tình · 12 giờ · 26/10 sáng → 27/10 sáng · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-07.1; luật ở BA-SCOPE-DECISIONS.md.

#### T47 · Kiểm thử US-07.1

**Mục tiêu:** Kiểm thử US-07.1 — phục vụ US-07.1 Hai kênh chat và bộ lọc (EP-07 Chat, camera và mic).
**Đầu vào (phải xong trước):** T42 (FE khung chat hai kênh).
**Việc cần làm:**
- Chạy TC của US-07.1
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-07.1 đạt.
**Lịch:** Nhạn · 8 giờ · 27/10 chiều → 28/10 sáng · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-07.1; luật ở BA-SCOPE-DECISIONS.md.

#### T33 · Camera/mic LiveKit: token, quyền phát, mức chia sẻ, khung media (BE + FE)

**Mục tiêu:** Camera/mic LiveKit: token, quyền phát, mức chia sẻ, khung media (BE + FE) — phục vụ US-07.2 Camera, mic và mức chia sẻ (EP-07 Chat, camera và mic).
**Đầu vào (phải xong trước):** T06 (Spike media: LiveKit tự chạy + LiveKit Cloud, HTTPS demo LAN (GATE-MEDIA)), T22 (BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập), T25 (FE phòng thi đấu: nối nước đi, đồng hồ, hộp kết quả).
**Việc cần làm:**
- Máy chủ: cấp token LiveKit theo vai trò (người xem `canPublish=false`), áp mức chia sẻ, thu hồi khi rời ghế/bị đuổi
- Client: `PANEL-MEDIA` ở **cả phòng chờ và phòng thi đấu**, không ngắt khi chuyển sang ván (BA 0.13); bật/tắt camera và mic độc lập (mặc định tắt), chọn 3 mức chia sẻ (chọn sẵn Chỉ đối thủ), báo lỗi quyền thiết bị, dừng khi tab bị tiếp quản
- Lỗi dịch vụ media/hết hạn mức: ván và chat tiếp tục, khung media hiện "Camera/mic tạm thời không dùng được" (BA 0.14)
**Đầu ra:** Camera/mic hoạt động giữa hai người chơi và người xem.
**Cách kiểm và điều kiện PASS:** AC của US-07.2. PASS khi test tích hợp token xanh và thử thật trên 2 máy + 1 người xem đúng theo mức chia sẻ.
**Lịch:** Tình · 32 giờ · 22/10 sáng → 25/10 chiều · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-07.2; luật ở BA-SCOPE-DECISIONS.md.

#### T45 · Kiểm thử US-07.2

**Mục tiêu:** Kiểm thử US-07.2 — phục vụ US-07.2 Camera, mic và mức chia sẻ (EP-07 Chat, camera và mic).
**Đầu vào (phải xong trước):** T33 (Camera/mic LiveKit: token, quyền phát, mức chia sẻ, khung media (BE + FE)).
**Việc cần làm:**
- Chạy TC của US-07.2 trên hai máy thật và một điện thoại
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-07.2 đạt.
**Lịch:** Thư · 8 giờ · 27/10 sáng → 27/10 chiều · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-07.2; luật ở BA-SCOPE-DECISIONS.md.

### EP-08 · Đánh với máy theo cấp độ

#### T34 · BE ván với máy: tạo ván, chọn phe, đầu hàng, Ván mới

**Mục tiêu:** BE ván với máy: tạo ván, chọn phe, đầu hàng, Ván mới — phục vụ US-08.1 Thiết lập và chơi ván với máy (EP-08 Đánh với máy theo cấp độ).
**Đầu vào (phải xong trước):** T20 (BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván), T24 (Máy cờ 3 cấp: negamax + alpha-beta, tìm sâu dần, tiến trình riêng).
**Việc cần làm:**
- API ván với máy: tạo ván `/ai/:id` theo cấp và phe (Ngẫu nhiên do máy chủ bốc), máy đi trước khi người cầm Đen
- Đầu hàng, kết thúc, Ván mới (giữ cấp/phe để điền sẵn), không đồng hồ, không xin hoà
**Đầu ra:** Dịch vụ ván với máy + test tích hợp.
**Cách kiểm và điều kiện PASS:** AC U/I của US-08.1. PASS khi test tích hợp xanh, tỷ lệ phe Ngẫu nhiên xấp xỉ 50/50 trên 200 lần.
**Lịch:** Cường · 16 giờ · 22/10 sáng → 23/10 chiều · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-08.1; luật ở BA-SCOPE-DECISIONS.md.

#### T38 · FE hộp chọn cấp/phe và màn đánh với máy

**Mục tiêu:** FE hộp chọn cấp/phe và màn đánh với máy — phục vụ US-08.1 Thiết lập và chơi ván với máy (EP-08 Đánh với máy theo cấp độ).
**Đầu vào (phải xong trước):** T19 (FE đi cờ click/kéo thả, gợi ý ô, đánh dấu, âm thanh), T34 (BE ván với máy: tạo ván, chọn phe, đầu hàng, Ván mới).
**Việc cần làm:**
- `MODAL-AI-SETUP` (cấp, phe), màn `SCR-AI-GAME` dùng lại `<Board>`, hộp kết quả Ván mới / Về Sảnh
**Đầu ra:** Giao diện đánh với máy.
**Cách kiểm và điều kiện PASS:** AC E2E của US-08.1. PASS khi Playwright đánh với máy ở cả ba cấp và bấm Ván mới đổi phe.
**Lịch:** Kỳ · 12 giờ · 24/10 chiều → 25/10 chiều · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-08.1; luật ở BA-SCOPE-DECISIONS.md.

#### T43 · Kiểm thử US-08.1

**Mục tiêu:** Kiểm thử US-08.1 — phục vụ US-08.1 Thiết lập và chơi ván với máy (EP-08 Đánh với máy theo cấp độ).
**Đầu vào (phải xong trước):** T38 (FE hộp chọn cấp/phe và màn đánh với máy).
**Việc cần làm:**
- Chạy TC của US-08.1
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-08.1 đạt.
**Lịch:** Thư · 8 giờ · 26/10 sáng → 26/10 chiều · XIAN Sprint 3.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-08.1; luật ở BA-SCOPE-DECISIONS.md.

#### T24 · Máy cờ 3 cấp: negamax + alpha-beta, tìm sâu dần, tiến trình riêng

**Mục tiêu:** Máy cờ 3 cấp: negamax + alpha-beta, tìm sâu dần, tiến trình riêng — phục vụ US-08.2 Máy cờ ba cấp độ (EP-08 Đánh với máy theo cấp độ).
**Đầu vào (phải xong trước):** T10 (Lõi luật cờ (3/3): luật kết thúc ván, perft, độ phủ kiểm thử).
**Việc cần làm:**
- Negamax + alpha-beta, tìm sâu dần, bảng chuyển vị đơn giản, sắp xếp nước; hàm lượng giá vật chất + vị trí
- Chạy ở tiến trình/worker riêng; ngân sách 300 / 1.000 / 3.000 ms theo cấp; luôn trả nước hợp lệ tốt nhất đã tìm được
**Đầu ra:** Gói `packages/engine` + tiến trình máy cờ gọi được từ server.
**Cách kiểm và điều kiện PASS:** AC-08.2.1 → AC-08.2.3. PASS khi unit test xanh và chạy 100 thế ngẫu nhiên không trả nước sai luật.
**Lịch:** Tình · 32 giờ · 18/10 sáng → 21/10 chiều · XIAN Sprint 2.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-08.2; luật ở BA-SCOPE-DECISIONS.md.

#### T59 · Tinh chỉnh cấp Khó, bộ thế chiếu hết, GATE-ENGINE, giao diện sự cố máy cờ

**Mục tiêu:** Tinh chỉnh cấp Khó, bộ thế chiếu hết, GATE-ENGINE, giao diện sự cố máy cờ — phục vụ US-08.3 Ổn định ván với máy và hoàn thiện cấp Khó (EP-08 Đánh với máy theo cấp độ).
**Đầu vào (phải xong trước):** T24 (Máy cờ 3 cấp: negamax + alpha-beta, tìm sâu dần, tiến trình riêng).
**Việc cần làm:**
- Tinh chỉnh lượng giá và cắt tỉa để cấp Khó đạt độ sâu 6 trong 3 giây; đo p95 cả ba cấp trên máy demo (GATE-ENGINE)
- Bộ thế chiếu hết 1 và 2 nước có đáp án đã xác minh: cấp Khó giải 100%; đấu máy với máy 20 ván mỗi cặp cấp
- Giao diện "Máy cờ gặp sự cố" + Thử lại trên `SCR-AI-GAME`
**Đầu ra:** Máy cờ hoàn thiện + báo cáo GATE-ENGINE.
**Cách kiểm và điều kiện PASS:** AC về thời gian, chiếu hết và phân cấp sức mạnh của US-08.3. PASS khi đạt ngưỡng; không đạt thì ghi BLOCKED và báo PO, không tự hạ ngưỡng.
**Lịch:** Tình · 20 giờ · 31/10 sáng → 02/11 sáng · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-08.3; luật ở BA-SCOPE-DECISIONS.md.

#### T63 · BE giữ ván AI 30 phút, Thử lại, khởi động lại

**Mục tiêu:** BE giữ ván AI 30 phút, Thử lại, khởi động lại — phục vụ US-08.3 Ổn định ván với máy và hoàn thiện cấp Khó (EP-08 Đánh với máy theo cấp độ).
**Đầu vào (phải xong trước):** T34 (BE ván với máy: tạo ván, chọn phe, đầu hàng, Ván mới).
**Việc cần làm:**
- Giữ ván AI 30 phút khi mất kết nối, vào lại `/ai/:id`
- Máy cờ không trả lời quá 10 giây: Thử lại (cùng thế hoặc ván mới theo BA 6.1), chặn bấm trùng; khởi động lại máy chủ → thông báo không tiếp tục được; Rời ván/Đăng xuất = đầu hàng có xác nhận
**Đầu ra:** Xử lý ổn định ván AI + test tích hợp.
**Cách kiểm và điều kiện PASS:** AC U/I về ổn định của US-08.3. PASS khi test tích hợp xanh.
**Lịch:** Đông · 12 giờ · 01/11 chiều → 02/11 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-08.3; luật ở BA-SCOPE-DECISIONS.md.

#### T68 · Kiểm thử US-08.3

**Mục tiêu:** Kiểm thử US-08.3 — phục vụ US-08.3 Ổn định ván với máy và hoàn thiện cấp Khó (EP-08 Đánh với máy theo cấp độ).
**Đầu vào (phải xong trước):** T59 (Tinh chỉnh cấp Khó, bộ thế chiếu hết, GATE-ENGINE, giao diện sự cố máy cờ), T63 (BE giữ ván AI 30 phút, Thử lại, khởi động lại).
**Việc cần làm:**
- Chạy TC của US-08.3, đối chiếu báo cáo GATE-ENGINE
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** PASS khi 100% TC của US-08.3 đạt hoặc có ghi BLOCKED được PO xác nhận.
**Lịch:** Kỳ · 8 giờ · 03/11 sáng → 03/11 chiều · XIAN Sprint 4.
**Tham chiếu:** AC và TC đầy đủ ở BACKLOG-P1.md mục US-08.3; luật ở BA-SCOPE-DECISIONS.md.

---

## 9. Cách nhập lên Jira

1. **Xoá 98 mục cũ** trên XIAN (BA Phần 0 mục 0.1): lọc `project = XIAN`, Bulk change → Delete.
2. **Tạo 4 Sprint** trên board với đúng tên `XIAN Sprint 1` … `XIAN Sprint 4` và ngày ở mục 4; tạo 4 **Fix version** `v0.1`, `v0.2`, `v0.3`, `v1.0`.
3. **Mời đủ 7 thành viên** vào dự án; sửa cột `Assignee` trong CSV thành email Atlassian của từng người (CSV đang để tên tiếng Việt để dễ đọc).
4. Jira → **Settings → System → External system import → CSV** (hoặc *Import issues* trong dự án), chọn `jira/xian-import.csv`, mã hoá UTF-8, định dạng ngày `dd/MM/yyyy`.
5. Ghép cột: `Issue Id` → Issue Id · `Parent Id` → Parent Id · `Issue Type` · `Summary` · `Description` · `Assignee` · `Sprint` · `Fix Version` · `Original Estimate` (giây) · `Start date` · `Due date` · `Labels` (2 cột) · `Priority` · `Status` · cột `Story` → liên kết *relates to* · các cột `Blocked by` → liên kết *is blocked by* (giá trị là `Issue Id` của dòng tương ứng trong CSV).
6. Sau khi nhập: kiểm tra Story và Task nằm dưới đúng Epic (cột `Parent Id`), mỗi Task có liên kết *relates to* tới Story của nó. Nếu Jira của nhóm không nhận Epic qua `Parent Id`, chọn các mục rồi Bulk change → Parent.
6b. Epic, Story và Task đều nhập với `Status` = **To Do**. Epic/Story **không có Sprint** (nằm ở backlog), chỉ có `Start date` 07/10 và `Due date` theo quy tắc R1 (mục 4). BA chuyển Story sang **Done** khi PO duyệt đặc tả, không muộn hơn `Due date`; Epic sang Done khi Story cuối cùng của nó Done.
7. Nếu cột `Sprint` không tự gán (tuỳ cấu hình Jira), lọc theo nhãn `sprint-1` … `sprint-4` rồi Bulk change → Sprint.

> Nguồn hướng dẫn CSV: tài liệu Atlassian "Importing data from CSV" (thời gian ước lượng tính bằng **giây**; quan hệ cha–con tạo bằng `Issue Id`/`Parent Id`).
