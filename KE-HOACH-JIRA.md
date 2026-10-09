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
| Story Points | 197 điểm | Nhập vào trường Story Points của **Task**, quy đổi từ giờ của Task theo thang Fibonacci (≤4h = 1 · ≤8h = 2 · ≤16h = 3 · ≤24h = 5 · ≤40h = 8 · >40h = 13). Story và Epic chỉ ghi **tổng điểm các Task** trong Description, không nhập vào trường Story Points để không đếm trùng |
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
- **Ngoại lệ:** Story có AC phụ thuộc kết quả đo kỹ thuật thì kéo dài tới **Task cuối cùng** của nó: US-08.3 (tiêu chí của cấp Khó chỉ chốt được sau khi đo thời gian máy nghĩ trên chính máy tính dùng để demo); US-00.5 (ngưỡng tốc độ và độ ổn định của hệ thống chỉ chốt được sau khi đo tải thật).
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

**Story Points:** gắn cho **Task** (≤4h = 1 · ≤8h = 2 · ≤16h = 3 · ≤24h = 5 · ≤40h = 8 · >40h = 13). Task nằm trong Sprint nên Jira tự vẽ **Velocity** (điểm cam kết so với điểm Task Done) và **Burndown theo điểm** cho từng Sprint. Điểm của Story ở bảng dưới = tổng điểm các Task của Story đó (chỉ để tham khảo). Giờ vẫn theo dõi bằng Time tracking (Original Estimate và Log work).

Sprint 1–4 bên dưới chứa **Task**. Cột "Story" chỉ để biết Task thực hiện Story nào.

### XIAN Sprint 1 · 08/10 – 14/10 · Release v0.1

**Sprint Goal:** Có nền tảng kỹ thuật, đăng ký/đăng nhập thật và bàn cờ đúng luật trên một máy.

| Story được thực hiện | Epic | Số Task | Giờ | Story Points |
|---|---|---|---|---|
| US-00.1 Khung dự án chung, kiểm tra tự động khi gộp mã và nhật ký vận hành | EP-00 | 2 | 24 | 5 |
| US-00.2 Cơ sở dữ liệu và phân quyền truy cập dữ liệu cho đợt phát hành đầu | EP-00 | 1 | 16 | 3 |
| US-00.3 Khung kết nối thời gian thực giữa trình duyệt và máy chủ | EP-00 | 1 | 24 | 5 |
| US-00.4 Kế hoạch kiểm thử và thử nghiệm sớm rủi ro camera/mic | EP-00 | 2 | 32 | 6 |
| US-01.1 Đăng ký tài khoản bằng tên đăng nhập, mật khẩu và mã OTP gửi qua email | EP-01 | 3 | 32 | 7 |
| US-01.2 Đăng nhập bằng tên đăng nhập và mật khẩu, tự khoá khi nhập sai nhiều lần | EP-01 | 3 | 28 | 6 |
| US-04.1 Bộ luật cờ tướng dùng chung cho cả website | EP-04 | 3 | 24 | 6 |
| US-04.2 Vẽ bàn cờ chuẩn với quân chữ Hán khi bắt đầu ván | EP-04 | 2 | 20 | 4 |
| **Cộng** | | 17 | 200 | **42** |

### XIAN Sprint 2 · 15/10 – 21/10 · Release v0.2

**Sprint Goal:** Hai người tạo phòng, vào bằng link/mã và đánh trọn một ván online có đồng hồ; máy cờ chạy được.

| Story được thực hiện | Epic | Số Task | Giờ | Story Points |
|---|---|---|---|---|
| US-02.1 Tạo phòng, ngồi ghế Đỏ/Đen, Sẵn sàng và bắt đầu ván | EP-02 | 3 | 48 | 10 |
| US-03.1 Mời bằng đường dẫn hoặc mã phòng và vào phòng | EP-03 | 3 | 32 | 7 |
| US-04.3 Đi quân bằng bấm hoặc kéo thả, có gợi ý ô đi được và âm thanh | EP-04 | 2 | 28 | 6 |
| US-05.1 Ván online: máy chủ phân xử nước đi, đồng hồ thi đấu và kết thúc ván | EP-05 | 4 | 56 | 12 |
| US-08.2 Máy cờ ba cấp độ chạy riêng, luôn đi nước hợp lệ | EP-08 | 1 | 32 | 8 |
| **Cộng** | | 13 | 196 | **43** |

### XIAN Sprint 3 · 22/10 – 28/10 · Release v0.3

**Sprint Goal:** Google/Khách, Xin đổi bên và ở lại phòng, đầu hàng/xin hoà, bạn bè và mời online, chat, camera/mic, đánh với máy.

| Story được thực hiện | Epic | Số Task | Giờ | Story Points |
|---|---|---|---|---|
| US-01.3 Đăng ký/đăng nhập bằng Google và vào chơi với tư cách Khách | EP-01 | 3 | 44 | 10 |
| US-02.2 Xin đổi bên Đỏ/Đen và ở lại phòng để đánh tiếp sau ván | EP-02 | 3 | 24 | 6 |
| US-03.2 Kết bạn, xem bạn đang trực tuyến và mời bạn vào phòng | EP-03 | 3 | 48 | 10 |
| US-05.2 Đầu hàng, rời phòng giữa ván và xin hoà | EP-05 | 3 | 24 | 6 |
| US-07.1 Hai kênh chat trong phòng (Kênh Riêng, Kênh Chung) và bộ lọc từ cấm | EP-07 | 3 | 36 | 8 |
| US-07.2 Camera, mic của người chơi và ba mức chia sẻ hình/tiếng | EP-07 | 2 | 40 | 10 |
| US-08.1 Chọn cấp độ, chọn phe và chơi một ván với máy | EP-08 | 3 | 36 | 8 |
| **Cộng** | | 20 | 252 | **58** |

### XIAN Sprint 4 · 29/10 – 04/11 · Release v1.0

**Sprint Goal:** Phiên và hồ sơ, chế độ phòng, Sảnh công khai, người xem, mất kết nối, hoàn thiện máy cờ; nghiệm thu D1–D10 và đóng gói demo.

| Story được thực hiện | Epic | Số Task | Giờ | Story Points |
|---|---|---|---|---|
| US-00.5 Nghiệm thu toàn bộ, đo yêu cầu phi chức năng và đóng gói bản demo | EP-00 | 4 | 48 | 10 |
| US-01.4 Quản lý phiên đăng nhập, một vị trí chơi, trang Cài đặt hồ sơ và Đăng xuất | EP-01 | 3 | 36 | 8 |
| US-05.3 Mất kết nối giữa ván, 60 giây chờ nối lại và ván bị gián đoạn | EP-05 | 2 | 20 | 4 |
| US-06.1 Chủ phòng đổi chế độ phòng: công khai, chỉ vào bằng mã, khoá | EP-06 | 3 | 28 | 6 |
| US-06.2 Sảnh: bốn lựa chọn chơi, Luật chơi và danh sách phòng công khai | EP-06 | 3 | 36 | 8 |
| US-06.3 Quản lý người xem: chuyển giữa ghế và hàng người xem, đuổi người xem | EP-06 | 3 | 36 | 8 |
| US-08.3 Ổn định ván với máy và hoàn thiện cấp Khó | EP-08 | 3 | 40 | 10 |
| **Cộng** | | 21 | 244 | **54** |

---

## 5. Danh sách Task theo Sprint

Cột **Phụ thuộc** chỉ ghi Task phải xong trực tiếp trước đó.

### XIAN Sprint 1

| Task | Tên | Story | Người | Giờ | Điểm | Bắt đầu | Kết thúc | Phụ thuộc |
|---|---|---|---|---|---|---|---|
| T01 | Dựng kho mã chung, kiểm tra tự động trên GitHub, nhật ký và đường dẫn /health | US-00.1 | Tình | 8 | 2 | 08/10 sáng | 08/10 chiều | — |
| T02 | Viết kế hoạch kiểm thử, mẫu ca kiểm thử, quy trình báo lỗi và ca kiểm thử Sprint 1 | US-00.4 | Thư | 16 | 3 | 08/10 sáng | 09/10 chiều | — |
| T03 | Dựng khung giao diện chung: bảng màu, bố cục, điều hướng và thành phần 5 trạng thái | US-00.1 | Nhạn | 16 | 3 | 09/10 sáng | 10/10 chiều | T01 |
| T04 | Làm phần máy chủ cho đăng ký 3 bước có mã OTP qua email và dọn đăng ký bỏ dở | US-01.1 | Đông | 16 | 3 | 09/10 sáng | 10/10 chiều | T01 |
| T05 | Viết luật đi và ăn quân cho 7 loại quân cờ (phần 1/3 bộ luật cờ) | US-04.1 | Tình | 8 | 2 | 09/10 sáng | 09/10 chiều | T01 |
| T06 | Thử nghiệm kỹ thuật camera/mic: LiveKit tự chạy, LiveKit Cloud và HTTPS trong mạng nội bộ | US-00.4 | Cường | 16 | 3 | 10/10 sáng | 11/10 chiều | T01 |
| T07 | Lọc nước hợp lệ, nhận biết chiếu, chiếu hết và hết nước (phần 2/3 bộ luật cờ) | US-04.1 | Tình | 8 | 2 | 10/10 sáng | 10/10 chiều | T05 |
| T08 | Làm màn Đăng ký 3 bước: tài khoản, email, nhập mã OTP | US-01.1 | Nhạn | 12 | 3 | 11/10 sáng | 12/10 sáng | T03, T04 |
| T09 | Làm phần máy chủ cho đăng nhập bằng tên đăng nhập, khoá khi sai 5 lần và ghi nhớ đăng nhập | US-01.2 | Đông | 16 | 3 | 11/10 sáng | 12/10 chiều | T04 |
| T10 | Viết luật kết thúc ván, đếm thế cờ theo độ sâu và đo độ phủ kiểm thử (phần 3/3) | US-04.1 | Tình | 8 | 2 | 11/10 sáng | 11/10 chiều | T07 |
| T11 | Vẽ bàn cờ SVG với quân chữ Hán, lật bàn, co giãn từ 360 px và nhãn trợ năng | US-04.2 | Kỳ | 16 | 3 | 11/10 sáng | 12/10 chiều | T01 |
| T12 | Dựng khung kết nối thời gian thực Socket.IO và công bố hợp đồng sự kiện | US-00.3 | Tình | 24 | 5 | 12/10 sáng | 14/10 chiều | T01 |
| T13 | Kiểm thử chức năng đăng ký có mã OTP (13 tiêu chí, gồm Gmail thật ngoài nhóm) | US-01.1 | Thư | 4 | 1 | 12/10 chiều | 12/10 chiều | T08 |
| T14 | Tạo cơ sở dữ liệu, phân quyền theo từng dòng, tệp thay đổi cấu trúc và dữ liệu mẫu | US-00.2 | Tùng | 16 | 3 | 13/10 sáng | 14/10 chiều | T01 |
| T15 | Làm màn Đăng nhập: tên đăng nhập, mật khẩu, ghi nhớ đăng nhập, báo khoá thử sai | US-01.2 | Nhạn | 8 | 2 | 13/10 sáng | 13/10 chiều | T03, T09 |
| T16 | Kiểm thử chức năng hiển thị bàn cờ trên nhiều trình duyệt và điện thoại | US-04.2 | Thư | 4 | 1 | 13/10 sáng | 13/10 sáng | T11 |
| T17 | Kiểm thử chức năng đăng nhập bằng tên đăng nhập và khoá khi thử sai (9 tiêu chí) | US-01.2 | Thư | 4 | 1 | 14/10 sáng | 14/10 sáng | T15 |

### XIAN Sprint 2

| Task | Tên | Story | Người | Giờ | Điểm | Bắt đầu | Kết thúc | Phụ thuộc |
|---|---|---|---|---|---|---|---|
| T18 | Lập trình máy chủ phòng: tạo phòng, mã, ghế, Sẵn sàng, đếm 3-2-1, chuyển chủ phòng | US-02.1 | Cường | 24 | 5 | 15/10 sáng | 17/10 chiều | T12, T14 |
| T19 | Làm thao tác đi quân bằng bấm/kéo thả, gợi ý ô, dấu nước đi và âm thanh | US-04.3 | Kỳ | 24 | 5 | 15/10 sáng | 17/10 chiều | T10, T11 |
| T20 | Xây dịch vụ ván online trên máy chủ: tạo ván, phân xử nước đi, tự kết thúc và lưu ván | US-05.1 | Tình | 24 | 5 | 15/10 sáng | 17/10 chiều | T10, T12 |
| T21 | Làm giao diện hộp Tạo phòng và trang phòng chờ (ghế, Sẵn sàng, đếm ngược) | US-02.1 | Nhạn | 16 | 3 | 18/10 sáng | 19/10 chiều | T03, T18 |
| T22 | Lập trình máy chủ vào phòng bằng mã/đường dẫn, xếp ghế hoặc chỗ xem, tự vào sau đăng nhập | US-03.1 | Tùng | 16 | 3 | 18/10 sáng | 19/10 chiều | T18 |
| T23 | Thêm đồng hồ thi đấu và xử thua hết giờ vào dịch vụ ván trên máy chủ | US-05.1 | Đông | 8 | 2 | 18/10 sáng | 18/10 chiều | T20 |
| T24 | Viết máy cờ ba cấp độ, tìm nước sâu dần và chạy ở luồng riêng | US-08.2 | Tình | 32 | 8 | 18/10 sáng | 21/10 chiều | T10 |
| T25 | Nối màn hình phòng thi đấu với máy chủ: đi cờ, đồng hồ hai bên và hộp kết quả | US-05.1 | Kỳ | 16 | 3 | 19/10 sáng | 20/10 chiều | T19, T23 |
| T26 | Làm giao diện Chia sẻ phòng, ô nhập mã ở Sảnh và tự vào phòng sau đăng nhập | US-03.1 | Nhạn | 8 | 2 | 20/10 sáng | 20/10 chiều | T21, T22 |
| T27 | Kiểm thử thao tác đi quân, gợi ý ô, dấu hiệu và âm thanh trên máy tính và điện thoại | US-04.3 | Thư | 4 | 1 | 20/10 sáng | 20/10 sáng | T19 |
| T28 | Kiểm thử chức năng tạo phòng, ghế, Sẵn sàng và bắt đầu ván | US-02.1 | Kỳ | 8 | 2 | 21/10 sáng | 21/10 chiều | T26 |
| T29 | Kiểm thử chức năng mời bằng đường dẫn/mã và vào phòng | US-03.1 | Thư | 8 | 2 | 21/10 sáng | 21/10 chiều | T26 |
| T30 | Kiểm thử chức năng ván online: đi cờ, đồng hồ và kết thúc ván | US-05.1 | Nhạn | 8 | 2 | 21/10 sáng | 21/10 chiều | T25, T26 |

### XIAN Sprint 3

| Task | Tên | Story | Người | Giờ | Điểm | Bắt đầu | Kết thúc | Phụ thuộc |
|---|---|---|---|---|---|---|---|
| T31 | Lập trình máy chủ bạn bè, trạng thái trực tuyến và mời bạn vào phòng | US-03.2 | Tùng | 24 | 5 | 22/10 sáng | 24/10 chiều | T22 |
| T32 | Xử lý đầu hàng, rời phòng giữa ván và xin hoà trên máy chủ | US-05.2 | Đông | 12 | 3 | 22/10 sáng | 23/10 sáng | T20 |
| T33 | Làm camera/mic qua LiveKit: cấp quyền theo vai trò, ba mức chia sẻ và khung camera/mic | US-07.2 | Tình | 32 | 8 | 22/10 sáng | 25/10 chiều | T06, T22, T25 |
| T34 | Làm dịch vụ máy chủ cho ván với máy: tạo ván, chọn phe, đầu hàng, Ván mới | US-08.1 | Cường | 16 | 3 | 22/10 sáng | 23/10 chiều | T20, T24 |
| T35 | Làm phần máy chủ cho đăng ký/đăng nhập Google, màn Thiết lập tài khoản và phiên Khách | US-01.3 | Đông | 24 | 5 | 23/10 chiều | 26/10 sáng | T09, T14 |
| T36 | Làm giao diện nút Đầu hàng, cảnh báo rời phòng và khung đề nghị hoà | US-05.2 | Kỳ | 8 | 2 | 23/10 chiều | 24/10 sáng | T25, T32 |
| T37 | Xây dịch vụ chat hai kênh trên máy chủ, kèm bộ lọc từ cấm và giới hạn tốc độ gửi | US-07.1 | Cường | 16 | 3 | 24/10 sáng | 25/10 chiều | T18 |
| T38 | Làm hộp chọn cấp độ/phe và màn hình đánh với máy | US-08.1 | Kỳ | 12 | 3 | 24/10 chiều | 25/10 chiều | T19, T34 |
| T39 | Kiểm thử chức năng đầu hàng, rời phòng giữa ván và xin hoà | US-05.2 | Thư | 4 | 1 | 25/10 sáng | 25/10 sáng | T36 |
| T40 | Làm giao diện trang Bạn bè, chuông lời mời, tab mời bạn và hộp lời mời vào phòng | US-03.2 | Nhạn | 16 | 3 | 25/10 chiều | 27/10 sáng | T31 |
| T41 | Lập trình máy chủ cho Xin đổi bên và đưa phòng về phòng chờ sau ván | US-02.2 | Tùng | 12 | 3 | 26/10 sáng | 27/10 sáng | T18, T20 |
| T42 | Làm khung chat hai kênh dùng chung cho phòng chờ và phòng thi đấu | US-07.1 | Tình | 12 | 3 | 26/10 sáng | 27/10 sáng | T25, T37 |
| T43 | Kiểm thử chức năng chọn cấp độ, chọn phe và chơi ván với máy | US-08.1 | Thư | 8 | 2 | 26/10 sáng | 26/10 chiều | T38 |
| T44 | Làm giao diện Google, màn Thiết lập tài khoản, hộp nhập tên Khách và nhãn «(Khách)» | US-01.3 | Kỳ | 12 | 3 | 26/10 chiều | 27/10 chiều | T15, T35 |
| T45 | Kiểm thử camera, mic và ba mức chia sẻ trên hai máy thật và một điện thoại | US-07.2 | Thư | 8 | 2 | 27/10 sáng | 27/10 chiều | T33 |
| T46 | Làm giao diện Xin đổi bên và hai nút Ở lại phòng / Rời phòng sau ván | US-02.2 | Tình | 8 | 2 | 27/10 chiều | 28/10 sáng | T25, T41 |
| T47 | Kiểm thử chức năng hai kênh chat và bộ lọc từ cấm | US-07.1 | Nhạn | 8 | 2 | 27/10 chiều | 28/10 sáng | T42 |
| T48 | Kiểm thử đăng ký/đăng nhập Google và chế độ Khách với tài khoản Google thật (15 tiêu chí) | US-01.3 | Thư | 8 | 2 | 28/10 sáng | 28/10 chiều | T44 |
| T49 | Kiểm thử chức năng bạn bè, trạng thái trực tuyến và mời bạn vào phòng | US-03.2 | Kỳ | 8 | 2 | 28/10 sáng | 28/10 chiều | T40 |
| T50 | Kiểm thử chức năng Xin đổi bên và ở lại phòng sau ván | US-02.2 | Nhạn | 4 | 1 | 28/10 chiều | 28/10 chiều | T46 |

### XIAN Sprint 4

| Task | Tên | Story | Người | Giờ | Điểm | Bắt đầu | Kết thúc | Phụ thuộc |
|---|---|---|---|---|---|---|---|
| T51 | Chạy kiểm thử hồi quy toàn bộ và 10 kịch bản demo đầu-cuối (vòng 1) | US-00.5 | Thư | 24 | 5 | 29/10 sáng | 31/10 chiều | toàn bộ Task tính năng Sprint 1–3 (15 Task cuối, xem liên kết trên Jira) |
| T52 | Xử lý mất kết nối giữa ván: 60 giây chờ, nối lại, ván bị gián đoạn và lớp phủ | US-05.3 | Tình | 16 | 3 | 29/10 sáng | 30/10 chiều | T25 |
| T53 | Làm phía máy chủ ba chế độ phòng (công khai, chỉ vào bằng mã, khoá) và thu hồi mã | US-06.1 | Đông | 16 | 3 | 29/10 sáng | 30/10 chiều | T22 |
| T54 | Làm phía máy chủ danh sách phòng công khai ở Sảnh và nút Vào chơi/Vào xem | US-06.2 | Cường | 12 | 3 | 29/10 sáng | 30/10 sáng | T22 |
| T55 | Làm phía máy chủ vai trò người xem, đổi chỗ ghế ↔ xem, mời xuống ghế, đuổi và chặn | US-06.3 | Tùng | 16 | 3 | 29/10 sáng | 30/10 chiều | T22 |
| T56 | Làm phần máy chủ cho hạn phiên cố định, một vị trí chơi, đăng nhập thiết bị khác và đăng xuất | US-01.4 | Cường | 24 | 5 | 30/10 chiều | 02/11 sáng | T18, T20, T35 |
| T57 | Làm giao diện hộp thoại Cài đặt phòng cho chủ phòng | US-06.1 | Nhạn | 8 | 2 | 31/10 sáng | 31/10 chiều | T53 |
| T58 | Làm giao diện danh sách người xem, nút đuổi (Kick) và thao tác đổi chỗ ghế | US-06.3 | Kỳ | 12 | 3 | 31/10 sáng | 01/11 sáng | T55 |
| T59 | Tinh chỉnh cấp Khó, đo thời gian trên máy demo, bộ thế chiếu hết và giao diện sự cố máy cờ | US-08.3 | Tình | 20 | 5 | 31/10 sáng | 02/11 sáng | T24 |
| T60 | Kiểm thử mất kết nối, nối lại và ván bị gián đoạn bằng rút mạng thật | US-05.3 | Thư | 4 | 1 | 01/11 sáng | 01/11 sáng | T52 |
| T61 | Hoàn thiện giao diện Sảnh: bốn lựa chọn, Luật chơi, danh sách phòng, thanh điều hướng | US-06.2 | Nhạn | 16 | 3 | 01/11 sáng | 02/11 chiều | T54 |
| T62 | Kiểm thử chức năng chủ phòng đổi chế độ phòng (công khai, chỉ vào bằng mã, khoá) | US-06.1 | Thư | 4 | 1 | 01/11 chiều | 01/11 chiều | T57 |
| T63 | Giữ ván với máy 30 phút, xử lý máy cờ treo, Thử lại và máy chủ khởi động lại | US-08.3 | Đông | 12 | 3 | 01/11 chiều | 02/11 chiều | T34 |
| T64 | Kiểm thử quản lý người xem và đuổi người xem (đủ 7 người, có camera/mic) | US-06.3 | Thư | 8 | 2 | 02/11 sáng | 02/11 chiều | T33, T58 |
| T65 | Làm trang Cài đặt hồ sơ, Đăng xuất có xác nhận, banner ván dở và giới hạn giao diện của Khách | US-01.4 | Tình | 8 | 2 | 02/11 chiều | 03/11 sáng | T56 |
| T66 | Viết kịch bản tải và đo các yêu cầu phi chức năng, mốc kiểm chứng kỹ thuật | US-00.5 | Tùng | 16 | 3 | 03/11 sáng | 04/11 chiều | T33, T37, T52, T55 |
| T67 | Kiểm thử Sảnh và danh sách phòng công khai | US-06.2 | Thư | 8 | 2 | 03/11 sáng | 03/11 chiều | T61 |
| T68 | Kiểm thử ổn định ván với máy và đối chiếu báo cáo đo máy cờ cấp Khó | US-08.3 | Kỳ | 8 | 2 | 03/11 sáng | 03/11 chiều | T59, T63 |
| T69 | Kiểm thử phiên đăng nhập, một vị trí chơi, hồ sơ và đăng xuất trên hai thiết bị thật (17 tiêu chí) | US-01.4 | Nhạn | 4 | 1 | 03/11 chiều | 03/11 chiều | T65 |
| T70 | Đóng gói bản demo v1.0, viết hướng dẫn chạy và chuẩn bị dữ liệu demo | US-00.5 | Tình | 4 | 1 | 04/11 sáng | 04/11 sáng | toàn bộ Task tính năng Sprint 4 (7 Task cuối, xem liên kết trên Jira) |
| T71 | Chạy 10 kịch bản demo đầu-cuối vòng cuối trên máy demo và ghi hình làm bằng chứng | US-00.5 | Thư | 4 | 1 | 04/11 chiều | 04/11 chiều | T70 |

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
| T01 | Dựng kho mã chung, kiểm tra tự động trên GitHub, nhật ký và đường dẫn /health | 08/10 sáng | 08/10 chiều | 8 |
| T05 | Viết luật đi và ăn quân cho 7 loại quân cờ (phần 1/3 bộ luật cờ) | 09/10 sáng | 09/10 chiều | 8 |
| T07 | Lọc nước hợp lệ, nhận biết chiếu, chiếu hết và hết nước (phần 2/3 bộ luật cờ) | 10/10 sáng | 10/10 chiều | 8 |
| T10 | Viết luật kết thúc ván, đếm thế cờ theo độ sâu và đo độ phủ kiểm thử (phần 3/3) | 11/10 sáng | 11/10 chiều | 8 |
| T12 | Dựng khung kết nối thời gian thực Socket.IO và công bố hợp đồng sự kiện | 12/10 sáng | 14/10 chiều | 24 |
| T20 | Xây dịch vụ ván online trên máy chủ: tạo ván, phân xử nước đi, tự kết thúc và lưu ván | 15/10 sáng | 17/10 chiều | 24 |
| T24 | Viết máy cờ ba cấp độ, tìm nước sâu dần và chạy ở luồng riêng | 18/10 sáng | 21/10 chiều | 32 |
| T33 | Làm camera/mic qua LiveKit: cấp quyền theo vai trò, ba mức chia sẻ và khung camera/mic | 22/10 sáng | 25/10 chiều | 32 |
| T42 | Làm khung chat hai kênh dùng chung cho phòng chờ và phòng thi đấu | 26/10 sáng | 27/10 sáng | 12 |
| T46 | Làm giao diện Xin đổi bên và hai nút Ở lại phòng / Rời phòng sau ván | 27/10 chiều | 28/10 sáng | 8 |
| T52 | Xử lý mất kết nối giữa ván: 60 giây chờ, nối lại, ván bị gián đoạn và lớp phủ | 29/10 sáng | 30/10 chiều | 16 |
| T59 | Tinh chỉnh cấp Khó, đo thời gian trên máy demo, bộ thế chiếu hết và giao diện sự cố máy cờ | 31/10 sáng | 02/11 sáng | 20 |
| T65 | Làm trang Cài đặt hồ sơ, Đăng xuất có xác nhận, banner ván dở và giới hạn giao diện của Khách | 02/11 chiều | 03/11 sáng | 8 |
| T70 | Đóng gói bản demo v1.0, viết hướng dẫn chạy và chuẩn bị dữ liệu demo | 04/11 sáng | 04/11 sáng | 4 |

### Đông — Backend · 104 giờ

| Task | Tên | Bắt đầu | Kết thúc | Giờ |
|---|---|---|---|---|
| T04 | Làm phần máy chủ cho đăng ký 3 bước có mã OTP qua email và dọn đăng ký bỏ dở | 09/10 sáng | 10/10 chiều | 16 |
| T09 | Làm phần máy chủ cho đăng nhập bằng tên đăng nhập, khoá khi sai 5 lần và ghi nhớ đăng nhập | 11/10 sáng | 12/10 chiều | 16 |
| T23 | Thêm đồng hồ thi đấu và xử thua hết giờ vào dịch vụ ván trên máy chủ | 18/10 sáng | 18/10 chiều | 8 |
| T32 | Xử lý đầu hàng, rời phòng giữa ván và xin hoà trên máy chủ | 22/10 sáng | 23/10 sáng | 12 |
| T35 | Làm phần máy chủ cho đăng ký/đăng nhập Google, màn Thiết lập tài khoản và phiên Khách | 23/10 chiều | 26/10 sáng | 24 |
| T53 | Làm phía máy chủ ba chế độ phòng (công khai, chỉ vào bằng mã, khoá) và thu hồi mã | 29/10 sáng | 30/10 chiều | 16 |
| T63 | Giữ ván với máy 30 phút, xử lý máy cờ treo, Thử lại và máy chủ khởi động lại | 01/11 chiều | 02/11 chiều | 12 |

### Tùng — Backend · 100 giờ

| Task | Tên | Bắt đầu | Kết thúc | Giờ |
|---|---|---|---|---|
| T14 | Tạo cơ sở dữ liệu, phân quyền theo từng dòng, tệp thay đổi cấu trúc và dữ liệu mẫu | 13/10 sáng | 14/10 chiều | 16 |
| T22 | Lập trình máy chủ vào phòng bằng mã/đường dẫn, xếp ghế hoặc chỗ xem, tự vào sau đăng nhập | 18/10 sáng | 19/10 chiều | 16 |
| T31 | Lập trình máy chủ bạn bè, trạng thái trực tuyến và mời bạn vào phòng | 22/10 sáng | 24/10 chiều | 24 |
| T41 | Lập trình máy chủ cho Xin đổi bên và đưa phòng về phòng chờ sau ván | 26/10 sáng | 27/10 sáng | 12 |
| T55 | Làm phía máy chủ vai trò người xem, đổi chỗ ghế ↔ xem, mời xuống ghế, đuổi và chặn | 29/10 sáng | 30/10 chiều | 16 |
| T66 | Viết kịch bản tải và đo các yêu cầu phi chức năng, mốc kiểm chứng kỹ thuật | 03/11 sáng | 04/11 chiều | 16 |

### Cường — Backend · 108 giờ

| Task | Tên | Bắt đầu | Kết thúc | Giờ |
|---|---|---|---|---|
| T06 | Thử nghiệm kỹ thuật camera/mic: LiveKit tự chạy, LiveKit Cloud và HTTPS trong mạng nội bộ | 10/10 sáng | 11/10 chiều | 16 |
| T18 | Lập trình máy chủ phòng: tạo phòng, mã, ghế, Sẵn sàng, đếm 3-2-1, chuyển chủ phòng | 15/10 sáng | 17/10 chiều | 24 |
| T34 | Làm dịch vụ máy chủ cho ván với máy: tạo ván, chọn phe, đầu hàng, Ván mới | 22/10 sáng | 23/10 chiều | 16 |
| T37 | Xây dịch vụ chat hai kênh trên máy chủ, kèm bộ lọc từ cấm và giới hạn tốc độ gửi | 24/10 sáng | 25/10 chiều | 16 |
| T54 | Làm phía máy chủ danh sách phòng công khai ở Sảnh và nút Vào chơi/Vào xem | 29/10 sáng | 30/10 sáng | 12 |
| T56 | Làm phần máy chủ cho hạn phiên cố định, một vị trí chơi, đăng nhập thiết bị khác và đăng xuất | 30/10 chiều | 02/11 sáng | 24 |

### Nhạn — Frontend, kiêm kiểm thử · 124 giờ

| Task | Tên | Bắt đầu | Kết thúc | Giờ |
|---|---|---|---|---|
| T03 | Dựng khung giao diện chung: bảng màu, bố cục, điều hướng và thành phần 5 trạng thái | 09/10 sáng | 10/10 chiều | 16 |
| T08 | Làm màn Đăng ký 3 bước: tài khoản, email, nhập mã OTP | 11/10 sáng | 12/10 sáng | 12 |
| T15 | Làm màn Đăng nhập: tên đăng nhập, mật khẩu, ghi nhớ đăng nhập, báo khoá thử sai | 13/10 sáng | 13/10 chiều | 8 |
| T21 | Làm giao diện hộp Tạo phòng và trang phòng chờ (ghế, Sẵn sàng, đếm ngược) | 18/10 sáng | 19/10 chiều | 16 |
| T26 | Làm giao diện Chia sẻ phòng, ô nhập mã ở Sảnh và tự vào phòng sau đăng nhập | 20/10 sáng | 20/10 chiều | 8 |
| T30 | Kiểm thử chức năng ván online: đi cờ, đồng hồ và kết thúc ván | 21/10 sáng | 21/10 chiều | 8 |
| T40 | Làm giao diện trang Bạn bè, chuông lời mời, tab mời bạn và hộp lời mời vào phòng | 25/10 chiều | 27/10 sáng | 16 |
| T47 | Kiểm thử chức năng hai kênh chat và bộ lọc từ cấm | 27/10 chiều | 28/10 sáng | 8 |
| T50 | Kiểm thử chức năng Xin đổi bên và ở lại phòng sau ván | 28/10 chiều | 28/10 chiều | 4 |
| T57 | Làm giao diện hộp thoại Cài đặt phòng cho chủ phòng | 31/10 sáng | 31/10 chiều | 8 |
| T61 | Hoàn thiện giao diện Sảnh: bốn lựa chọn, Luật chơi, danh sách phòng, thanh điều hướng | 01/11 sáng | 02/11 chiều | 16 |
| T69 | Kiểm thử phiên đăng nhập, một vị trí chơi, hồ sơ và đăng xuất trên hai thiết bị thật (17 tiêu chí) | 03/11 chiều | 03/11 chiều | 4 |

### Kỳ — Frontend, kiêm kiểm thử · 124 giờ

| Task | Tên | Bắt đầu | Kết thúc | Giờ |
|---|---|---|---|---|
| T11 | Vẽ bàn cờ SVG với quân chữ Hán, lật bàn, co giãn từ 360 px và nhãn trợ năng | 11/10 sáng | 12/10 chiều | 16 |
| T19 | Làm thao tác đi quân bằng bấm/kéo thả, gợi ý ô, dấu nước đi và âm thanh | 15/10 sáng | 17/10 chiều | 24 |
| T25 | Nối màn hình phòng thi đấu với máy chủ: đi cờ, đồng hồ hai bên và hộp kết quả | 19/10 sáng | 20/10 chiều | 16 |
| T28 | Kiểm thử chức năng tạo phòng, ghế, Sẵn sàng và bắt đầu ván | 21/10 sáng | 21/10 chiều | 8 |
| T36 | Làm giao diện nút Đầu hàng, cảnh báo rời phòng và khung đề nghị hoà | 23/10 chiều | 24/10 sáng | 8 |
| T38 | Làm hộp chọn cấp độ/phe và màn hình đánh với máy | 24/10 chiều | 25/10 chiều | 12 |
| T44 | Làm giao diện Google, màn Thiết lập tài khoản, hộp nhập tên Khách và nhãn «(Khách)» | 26/10 chiều | 27/10 chiều | 12 |
| T49 | Kiểm thử chức năng bạn bè, trạng thái trực tuyến và mời bạn vào phòng | 28/10 sáng | 28/10 chiều | 8 |
| T58 | Làm giao diện danh sách người xem, nút đuổi (Kick) và thao tác đổi chỗ ghế | 31/10 sáng | 01/11 sáng | 12 |
| T68 | Kiểm thử ổn định ván với máy và đối chiếu báo cáo đo máy cờ cấp Khó | 03/11 sáng | 03/11 chiều | 8 |

### Thư — Tester · 120 giờ

| Task | Tên | Bắt đầu | Kết thúc | Giờ |
|---|---|---|---|---|
| T02 | Viết kế hoạch kiểm thử, mẫu ca kiểm thử, quy trình báo lỗi và ca kiểm thử Sprint 1 | 08/10 sáng | 09/10 chiều | 16 |
| T13 | Kiểm thử chức năng đăng ký có mã OTP (13 tiêu chí, gồm Gmail thật ngoài nhóm) | 12/10 chiều | 12/10 chiều | 4 |
| T16 | Kiểm thử chức năng hiển thị bàn cờ trên nhiều trình duyệt và điện thoại | 13/10 sáng | 13/10 sáng | 4 |
| T17 | Kiểm thử chức năng đăng nhập bằng tên đăng nhập và khoá khi thử sai (9 tiêu chí) | 14/10 sáng | 14/10 sáng | 4 |
| T27 | Kiểm thử thao tác đi quân, gợi ý ô, dấu hiệu và âm thanh trên máy tính và điện thoại | 20/10 sáng | 20/10 sáng | 4 |
| T29 | Kiểm thử chức năng mời bằng đường dẫn/mã và vào phòng | 21/10 sáng | 21/10 chiều | 8 |
| T39 | Kiểm thử chức năng đầu hàng, rời phòng giữa ván và xin hoà | 25/10 sáng | 25/10 sáng | 4 |
| T43 | Kiểm thử chức năng chọn cấp độ, chọn phe và chơi ván với máy | 26/10 sáng | 26/10 chiều | 8 |
| T45 | Kiểm thử camera, mic và ba mức chia sẻ trên hai máy thật và một điện thoại | 27/10 sáng | 27/10 chiều | 8 |
| T48 | Kiểm thử đăng ký/đăng nhập Google và chế độ Khách với tài khoản Google thật (15 tiêu chí) | 28/10 sáng | 28/10 chiều | 8 |
| T51 | Chạy kiểm thử hồi quy toàn bộ và 10 kịch bản demo đầu-cuối (vòng 1) | 29/10 sáng | 31/10 chiều | 24 |
| T60 | Kiểm thử mất kết nối, nối lại và ván bị gián đoạn bằng rút mạng thật | 01/11 sáng | 01/11 sáng | 4 |
| T62 | Kiểm thử chức năng chủ phòng đổi chế độ phòng (công khai, chỉ vào bằng mã, khoá) | 01/11 chiều | 01/11 chiều | 4 |
| T64 | Kiểm thử quản lý người xem và đuổi người xem (đủ 7 người, có camera/mic) | 02/11 sáng | 02/11 chiều | 8 |
| T67 | Kiểm thử Sảnh và danh sách phòng công khai | 03/11 sáng | 03/11 chiều | 8 |
| T71 | Chạy 10 kịch bản demo đầu-cuối vòng cuối trên máy demo và ghi hình làm bằng chứng | 04/11 chiều | 04/11 chiều | 4 |

---

## 8. Mô tả chi tiết từng Task

Mỗi mục dưới đây là **Description** dán vào Jira (đã có sẵn trong CSV), viết để người không tham gia lập kế hoạch đọc vẫn hiểu và tự làm được: bối cảnh, mục tiêu, việc phải chờ, các bước làm, sản phẩm bàn giao, cách kiểm tra, lưu ý và giải thích thuật ngữ.

Toàn bộ Description của 9 Epic, 27 Story và 71 Task (kèm bảng trường Jira) nằm trong [`jira/JIRA-MUC-CHI-TIET.md`](jira/JIRA-MUC-CHI-TIET.md) và cột `Description` của `jira/xian-import.csv`.

---

## 9. Cách nhập lên Jira

1. **Xoá 98 mục cũ** trên XIAN (BA Phần 0 mục 0.1): lọc `project = XIAN`, Bulk change → Delete.
2. **Tạo 4 Sprint** trên board với đúng tên `XIAN Sprint 1` … `XIAN Sprint 4` và ngày ở mục 4; tạo 4 **Fix version** `v0.1`, `v0.2`, `v0.3`, `v1.0`.
3. **Mời đủ 7 thành viên** vào dự án; sửa cột `Assignee` và `Reporter` trong CSV thành email Atlassian của từng người (CSV đang để tên tiếng Việt để dễ đọc). `Assignee` của 9 Epic và 27 Story là Tình (BA/PO); `Reporter` của cả 107 mục là Tình (PO). Người nhập cần quyền *Modify Reporter*, nếu không Jira tự đặt Reporter là người nhập.
4. **Trước khi nhập, bật 2 trường trên màn hình tạo mục của XIAN** (hiện chưa có): **Time tracking** cho Task (để nhận `Original Estimate`) và **Story Points** cho Task (Project settings → Issue types / Screens). Board settings → Estimation: chọn **Story Points** để Jira vẽ Velocity và Burndown theo điểm; giờ vẫn ghi bằng Time tracking.
4b. Jira → **Settings → System → External system import → CSV** (hoặc *Import issues* trong dự án), chọn `jira/xian-import.csv`, mã hoá UTF-8, định dạng ngày `dd/MM/yyyy`.
5. Ghép cột: `Issue Id` → Issue Id · `Parent Id` → Parent Id · `Issue Type` · `Summary` · `Description` · `Assignee` · `Reporter` · `Sprint` · `Fix Version` · `Original Estimate` (giây) · `Start date` · `Due date` · `Labels` (2 cột) · `Priority` · `Status` · `Story Points` · cột `Story` → liên kết *relates to* · các cột `Blocked by` → liên kết *is blocked by* (giá trị là `Issue Id` của dòng tương ứng trong CSV).
6. Sau khi nhập: kiểm tra Story và Task nằm dưới đúng Epic (cột `Parent Id`), mỗi Task có liên kết *relates to* tới Story của nó. Nếu Jira của nhóm không nhận Epic qua `Parent Id`, chọn các mục rồi Bulk change → Parent.
6b. Epic, Story và Task đều nhập với `Status` = **To Do**. Epic/Story **không có Sprint** (nằm ở backlog), chỉ có `Start date` 07/10 và `Due date` theo quy tắc R1 (mục 4). BA chuyển Story sang **Done** khi PO duyệt đặc tả, không muộn hơn `Due date`; Epic sang Done khi Story cuối cùng của nó Done.
7. Nếu cột `Sprint` không tự gán (tuỳ cấu hình Jira), lọc theo nhãn `sprint-1` … `sprint-4` rồi Bulk change → Sprint.

> Nguồn hướng dẫn CSV: tài liệu Atlassian "Importing data from CSV" (thời gian ước lượng tính bằng **giây**; quan hệ cha–con tạo bằng `Issue Id`/`Parent Id`).
