# Kế hoạch Jira — 15: Ước lượng, Sprint Planning và lịch nguồn lực

**Cập nhật 05/10/2026.** PO xác nhận ngày 05/10/2026: **8 giờ/người/ngày, kể cả cuối tuần; hạn cuối bắt buộc 05/11/2026**. PO giao agent ước lượng Task và xếp ngày riêng. Giờ là ước lượng mục tiêu ban đầu theo hạn PO, chưa được kiểm chứng bằng năng suất thực tế; không phải cam kết chắc chắn đủ giờ đạt AC. Giữ nguyên tám yêu cầu MVP, phân vai, 98 mục và đồ thị phụ thuộc. Story Points để nhóm quyết định.

## 1. Cơ sở ước lượng và quy tắc lập lịch

Lịch làm 09–12, 13–18 (UTC+7), 8 giờ gồm tự kiểm và phối hợp trong Task; ngày đầu 05/10 chỉ từ 14:00. Tối đa **3 Task đang hoạt động**, gồm triển khai, chờ review và review. Một người không làm/review/hỗ trợ hai việc cùng lúc. Người chính không mở Task mới khi Task trước còn mở. Tiền đề phải được kiểm/PASS rồi mới bắt đầu Task phụ thuộc; có thể bàn giao tuần tự **trong cùng ngày theo giờ**. Start/Due date Jira chỉ có ngày, nên thanh giao nhau cùng ngày không chứng minh ca trùng. Mục tiêu T-64 PASS 05/11 lúc 15:30, còn 2,5 giờ trong ngày cho đệm/bàn giao. Không kéo hạn. Khoảng 82% thời gian triển khai có 1–2 Task. Sprint 3 kết thúc 27/10 lúc 14:00, Sprint 4 bắt đầu ngay sau đó; cùng ngày nhưng không trùng ca. Ngày và giờ là mục tiêu, chưa ghi worklog.

Giờ công mục tiêu Task = mục tiêu thực hiện/tự kiểm + sửa lỗi dự phòng (20%, làm tròn 0,5 giờ) + review độc lập 0,5–2 giờ + hỗ trợ nếu có. Phân bổ theo độ phức tạp tương đối nhằm giữ hạn PO, chưa có dữ liệu chứng minh toàn bộ công việc đủ trong khung này. Không cộng lại dự phòng hay review; không đặt giờ riêng ở Epic/Story để tránh tính trùng. Jira dùng ngày 8 giờ nên có thể hiển thị 9,5 giờ thành 1 ngày 1 giờ 30 phút; đó là giờ công, không phải độ dài thanh Timeline. Ngày thực tế của Task còn phụ thuộc lịch làm, chờ review và tiền đề. Các ước lượng ban đầu không thay việc phải đáp ứng đầy đủ Description/AC; vượt khung phải báo ngay, không đóng Task để làm lịch đẹp. T-47 có Tình hỗ trợ 2 giờ đầu; T-55 có Nhạn hỗ trợ 2 giờ đầu.

| Sprint | ID Jira | Ngày dự kiến (UTC+7) | Release | ID Release | Task | Giờ công Task | Phạm vi PASS dự kiến |
|---|---:|---|---|---:|---:|---:|---|
| XIAN Sprint 1 | 40 | 2026-10-05 – 2026-10-11 | `v0.1` | 10036 | 18 | 106.5 | 2026-10-11 |
| XIAN Sprint 2 | 41 | 2026-10-12 – 2026-10-19 | `v0.2` | 10037 | 16 | 113 | 2026-10-19 |
| XIAN Sprint 3 | 42 | 2026-10-20 – 2026-10-27 | `v0.3` | 10038 | 19 | 125 | 2026-10-27 |
| XIAN Sprint 4 | 43 | 2026-10-27 – 2026-11-05 | `v1.0` | 10039 | 11 | 113.5 | 2026-11-05 |

## 2. Phân vai 7 thành viên và đề xuất chia mảng

### 2.1 Vai trò chuyên môn đã được PO chốt ngày 05/10/2026

Tên được giữ đúng tên hiển thị trên Jira theo bảng PO cung cấp. XIAN đã trả về đủ 7 tài khoản đang hoạt động trong danh sách người có thể nhận việc khi kiểm tra ngày 05/10/2026. Đây là quyết định phân vai chuyên môn; Assignee đã gán; giờ hiện tại là ước lượng agent theo uỷ quyền PO, chưa có năng suất thực tế.

| STT | Tên trên Jira | Vai trò đã chốt |
|---|---|---|
| 1 | TÌNH 4851_NGUYỄN NGỌC | Luật cờ, AI và các phần triển khai kỹ thuật khó nhất (PO bổ sung 05/10) |
| 2 | 4841_Lê Thị Xuân Nhạn | Frontend |
| 3 | Tưởng Lê khoa Cường-4572 | Backend; kiêm QA đúng T-53/T-58 (PO duyệt 05/10) |
| 4 | Nguyễn Minh Thư | Frontend |
| 5 | Võ Thành Đông | Backend |
| 6 | nguyenhoangtungtuyhoa | Backend |
| 7 | Gia Kỳ | QA và DevOps |

**Nguyên tắc đã được PO yêu cầu 05/10/2026:** phần khó ưu tiên giao Tình; các thành viên khác giữ đúng Frontend, Backend, QA/DevOps, chỉ cho phép tối đa một–hai người kiêm mảng. Vì vậy bản chia đều 8–9 Task bằng cách đưa người Backend sang code Frontend hoặc đo/kiểm QA được thay bằng bản dưới. Tình là ngoại lệ kỹ thuật đã được PO yêu cầu; **Cường là ngoại lệ thứ hai đã được PO duyệt 05/10/2026**, chỉ kiêm QA ở T-53/T-58. Assignee từng Task đã gán thật; PO đã giao ước lượng giờ; lịch là dự báo, không phải cam kết hoàn thành.

### 2.2 Phạm vi vai trò và hai ngoại lệ tối đa (đã chốt và áp dụng trên Jira)

| Thành viên | Vai trò chính | Giới hạn việc được giao | Kiêm mảng đã chốt |
|---|---|---|---|
| TÌNH 4851_NGUYỄN NGỌC | Luật cờ và AI; các phần kỹ thuật khó | Luật/máy cờ, lõi ván/phiên/quyền và hai tích hợp khó T-57/T-59 | Ngoại lệ 1: phần Backend và Frontend khó; có review công cụ/bằng chứng QA |
| 4841_Lê Thị Xuân Nhạn | Frontend | Khung web, tài khoản, Sảnh, phòng, bạn bè; nối API/Socket và trạng thái UI của các luồng này | Không viết Backend hoặc công cụ QA/DevOps |
| Nguyễn Minh Thư | Frontend | Bàn cờ, màn ván/AI, chat/media, thao tác/cảm ứng; nối API/Socket ở web | Không viết Backend hoặc công cụ QA/DevOps |
| Tưởng Lê khoa Cường-4572 | Backend | Hợp đồng, cấu hình xác thực, đăng ký bước 1–2, dọn tài khoản, xử lý đăng xuất ở máy chủ | Ngoại lệ 2, PO duyệt 05/10/2026: T-53 bộ kiểm luật và T-58 đo AI; không giao code Frontend |
| Võ Thành Đông | Backend | Tạo/vào phòng, ghế/Sẵn sàng, bạn bè, lời mời; chỉ sửa phần máy chủ | Không viết UI hoặc công cụ QA/DevOps |
| nguyenhoangtungtuyhoa | Backend | Schema, khung máy chủ, kiểu phòng, chat và người xem; chỉ sửa phần máy chủ | Không viết UI, không nhận T-53/T-58 |
| Gia Kỳ | QA và DevOps | Kho mã/CI, thử nghiệm, công cụ kiểm thử, môi trường, nghiệm thu và demo | Không nhận code UI hoặc logic nghiệp vụ máy chủ; lỗi trả về người làm miền |

**Ranh giới trong Task tích hợp:** T-28/T-46/T-52 trở lại Nhạn; T-32/T-33/T-47 trở lại Thư. Người Frontend chỉ viết phần nối ở web bằng API/Socket đã bàn giao; nếu phát hiện lỗi máy chủ, người Backend hoặc Tình sửa đúng miền rồi Frontend kiểm lại. Không gọi việc dùng API ở trình duyệt là làm Backend, cũng không yêu cầu người Backend viết UI để giữ số Task bằng nhau. Tình nhận T-57/T-59 vì đây là hai tích hợp khó và Tình là ngoại lệ được phép xuyên mảng.

**Review không đổi vai trò:** Frontend review mã/luồng web; Backend review logic và đầu ra máy chủ; QA kiểm độc lập ca và bằng chứng. Người Backend đọc phản hồi QA về API không có nghĩa nhận việc viết công cụ QA. Tình hoặc Cường (ngoại lệ thứ hai đã duyệt) review công cụ kiểm/đo. Mỗi Task vẫn có một người chính và một người review khác người chính; khi người hỗ trợ viết một phần, không dùng người đó làm người review duy nhất của phần đã viết.


## 3. Tải từng thành viên

| Thành viên | Task chính | Giờ thực hiện | Giờ sửa lỗi dự phòng | Giờ review | Giờ hỗ trợ | Tổng giờ Task |
|---|---:|---:|---:|---:|---:|---:|
| Gia Kỳ | 8 | 41 | 9.5 | 9 | 0 | 59.5 |
| TÌNH 4851_NGUYỄN NGỌC | 15 | 117 | 27.5 | 6.5 | 2 | 153 |
| nguyenhoangtungtuyhoa | 5 | 17 | 5 | 14 | 0 | 36 |
| Tưởng Lê khoa Cường-4572 | 7 | 31.5 | 8 | 9 | 0 | 48.5 |
| 4841_Lê Thị Xuân Nhạn | 12 | 47 | 13 | 10.5 | 2 | 72.5 |
| Nguyễn Minh Thư | 12 | 41 | 10.5 | 12 | 0 | 63.5 |
| Võ Thành Đông | 5 | 15.5 | 4 | 5.5 | 0 | 25 |

Tổng giờ trên là **458 giờ công mục tiêu**, đã gồm tự kiểm/phối hợp trong Task; chưa có năng suất thực tế. Không giả định người có ít giờ Task phải bận đủ 8 giờ mỗi ngày; những khoảng trống là sức chứa chưa dùng/chờ đầu vào. Tình có tải lớn nhất vì giữ phần khó theo quyết định PO. Giới hạn vai trò làm giờ các thành viên khác không bằng nhau; lịch không tuyên bố đã cân bằng tuyệt đối.

## 4. Lịch riêng của 64 Task và tiền đề

| Task / Jira | Công việc | Người chính | Review độc lập | Tiền đề phải PASS | Sprint / Release | Bắt đầu | Hạn | Giờ công |
|---|---|---|---|---|---|---|---|---:|
| [T-01 / XIAN-35](https://xiangqi-web.atlassian.net/browse/XIAN-35) | Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động | Gia Kỳ | TÌNH 4851_NGUYỄN NGỌC | — | 1 / `v0.1` | 2026-10-05 | 2026-10-05 | 3 |
| [T-02 / XIAN-36](https://xiangqi-web.atlassian.net/browse/XIAN-36) | Soạn "hợp đồng chung" giữa trình duyệt và máy chủ | Tưởng Lê khoa Cường-4572 | nguyenhoangtungtuyhoa | T-01 | 1 / `v0.1` | 2026-10-06 | 2026-10-06 | 5.5 |
| [T-03 / XIAN-37](https://xiangqi-web.atlassian.net/browse/XIAN-37) | Cấu hình Supabase: gửi mã OTP đăng ký và đăng nhập Google | Tưởng Lê khoa Cường-4572 | Gia Kỳ | T-01 | 1 / `v0.1` | 2026-10-05 | 2026-10-06 | 2.5 |
| [T-04 / XIAN-38](https://xiangqi-web.atlassian.net/browse/XIAN-38) | Dựng cơ sở dữ liệu: các bảng và quy tắc quyền truy cập | nguyenhoangtungtuyhoa | Tưởng Lê khoa Cường-4572 | T-01 | 1 / `v0.1` | 2026-10-05 | 2026-10-06 | 6 |
| [T-05 / XIAN-39](https://xiangqi-web.atlassian.net/browse/XIAN-39) | Luật cờ: mô hình bàn cờ, thế khởi đầu, nước đi của từng loại quân | TÌNH 4851_NGUYỄN NGỌC | Gia Kỳ | T-01 | 1 / `v0.1` | 2026-10-05 | 2026-10-06 | 8.5 |
| [T-06 / XIAN-40](https://xiangqi-web.atlassian.net/browse/XIAN-40) | Dựng khung máy chủ: nhận kết nối có xác thực và chuyển lệnh | nguyenhoangtungtuyhoa | Tưởng Lê khoa Cường-4572 | T-01, T-02, T-03 | 1 / `v0.1` | 2026-10-06 | 2026-10-07 | 4.5 |
| [T-07 / XIAN-41](https://xiangqi-web.atlassian.net/browse/XIAN-41) | Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo) | 4841_Lê Thị Xuân Nhạn | Nguyễn Minh Thư | T-01, T-02 | 1 / `v0.1` | 2026-10-06 | 2026-10-07 | 6 |
| [T-08 / XIAN-42](https://xiangqi-web.atlassian.net/browse/XIAN-42) | Luật cờ: nước hợp lệ, chiếu, chiếu hết, hết nước, lặp thế, 120 nửa nước | TÌNH 4851_NGUYỄN NGỌC | Gia Kỳ | T-05 | 1 / `v0.1` | 2026-10-06 | 2026-10-08 | 14 |
| [T-09 / XIAN-43](https://xiangqi-web.atlassian.net/browse/XIAN-43) | Ba cơ chế dùng chung ở máy chủ: lọc từ cấm, chống làm hai lần, giới hạn tốc độ | TÌNH 4851_NGUYỄN NGỌC | Tưởng Lê khoa Cường-4572 | T-02, T-04, T-06 | 1 / `v0.1` | 2026-10-08 | 2026-10-09 | 7 |
| [T-10 / XIAN-44](https://xiangqi-web.atlassian.net/browse/XIAN-44) | Giao diện: thanh điều hướng, Sảnh, tạo phòng và nhập mã vào phòng | 4841_Lê Thị Xuân Nhạn | Nguyễn Minh Thư | T-02, T-07 | 1 / `v0.1` | 2026-10-08 | 2026-10-08 | 6 |
| [T-11 / XIAN-45](https://xiangqi-web.atlassian.net/browse/XIAN-45) | Giao diện: phòng chờ và màn từ chối vào phòng | 4841_Lê Thị Xuân Nhạn | Nguyễn Minh Thư | T-02, T-07 | 1 / `v0.1` | 2026-10-08 | 2026-10-09 | 4.5 |
| [T-12 / XIAN-46](https://xiangqi-web.atlassian.net/browse/XIAN-46) | Giao diện: bàn cờ SVG, quân chữ Hán, lật bàn cho phe Đen | Nguyễn Minh Thư | 4841_Lê Thị Xuân Nhạn | T-05, T-07 | 1 / `v0.1` | 2026-10-07 | 2026-10-08 | 4.5 |
| [T-13 / XIAN-47](https://xiangqi-web.atlassian.net/browse/XIAN-47) | Máy chủ: đăng ký bước 1 và 2 (kiểm tra tên đăng nhập, gửi mã OTP) | Tưởng Lê khoa Cường-4572 | Võ Thành Đông | T-03, T-04, T-06 | 1 / `v0.1` | 2026-10-07 | 2026-10-07 | 4.5 |
| [T-14 / XIAN-48](https://xiangqi-web.atlassian.net/browse/XIAN-48) | Máy cờ: chương trình chạy riêng, ba cấp độ, thử nghiệm sơ bộ tốc độ | TÌNH 4851_NGUYỄN NGỌC | Gia Kỳ | T-08 | 2 / `v0.2` | 2026-10-12 | 2026-10-13 | 12 |
| [T-15 / XIAN-49](https://xiangqi-web.atlassian.net/browse/XIAN-49) | Máy chủ: trạng thái phòng, mỗi người một chỗ chơi và tạo phòng | Võ Thành Đông | nguyenhoangtungtuyhoa | T-04, T-06, T-09 | 1 / `v0.1` | 2026-10-09 | 2026-10-10 | 6 |
| [T-16 / XIAN-50](https://xiangqi-web.atlassian.net/browse/XIAN-50) | Giao diện: bấm chọn quân và chấm gợi ý ô đi | Nguyễn Minh Thư | 4841_Lê Thị Xuân Nhạn | T-08, T-12 | 1 / `v0.1` | 2026-10-08 | 2026-10-09 | 2.5 |
| [T-17 / XIAN-51](https://xiangqi-web.atlassian.net/browse/XIAN-51) | Máy chủ: đăng nhập, quản lý phiên và hồ sơ | TÌNH 4851_NGUYỄN NGỌC | Tưởng Lê khoa Cường-4572 | T-03, T-04, T-06, T-09 | 1 / `v0.1` | 2026-10-10 | 2026-10-11 | 12 |
| [T-18 / XIAN-52](https://xiangqi-web.atlassian.net/browse/XIAN-52) | Máy chủ: đăng ký bước 3 (xác minh mã, hoàn tất tài khoản) | TÌNH 4851_NGUYỄN NGỌC | Gia Kỳ | T-13 | 1 / `v0.1` | 2026-10-09 | 2026-10-10 | 6 |
| [T-19 / XIAN-53](https://xiangqi-web.atlassian.net/browse/XIAN-53) | Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh | Võ Thành Đông | Tưởng Lê khoa Cường-4572 | T-09, T-15 | 1 / `v0.1` | 2026-10-10 | 2026-10-10 | 3.5 |
| [T-20 / XIAN-54](https://xiangqi-web.atlassian.net/browse/XIAN-54) | Giao diện: kéo thả quân, đánh dấu nước vừa đi, cảnh báo chiếu, âm thanh | Nguyễn Minh Thư | 4841_Lê Thị Xuân Nhạn | T-16 | 2 / `v0.2` | 2026-10-12 | 2026-10-12 | 3.5 |
| [T-21 / XIAN-55](https://xiangqi-web.atlassian.net/browse/XIAN-55) | Giao diện: đăng ký ba bước, đăng nhập, hồ sơ, đăng xuất | 4841_Lê Thị Xuân Nhạn | Nguyễn Minh Thư | T-02, T-07 | 2 / `v0.2` | 2026-10-12 | 2026-10-13 | 8.5 |
| [T-22 / XIAN-56](https://xiangqi-web.atlassian.net/browse/XIAN-56) | Thử nghiệm OTP thật và đăng nhập Google; chặn người chưa hoàn tất đăng ký và chặn đổi email | Gia Kỳ | Tưởng Lê khoa Cường-4572 | T-03, T-17, T-18 | 2 / `v0.2` | 2026-10-13 | 2026-10-14 | 4.5 |
| [T-23 / XIAN-57](https://xiangqi-web.atlassian.net/browse/XIAN-57) | Máy chủ: chọn ghế, Sẵn sàng, đếm 3 giây, bắt đầu ván | Võ Thành Đông | nguyenhoangtungtuyhoa | T-05, T-19 | 2 / `v0.2` | 2026-10-13 | 2026-10-13 | 4.5 |
| [T-24 / XIAN-58](https://xiangqi-web.atlassian.net/browse/XIAN-58) | Giao diện ván: bàn cờ nối mạng, đồng hồ, nút, hộp kết quả, khung xin hoà | Nguyễn Minh Thư | 4841_Lê Thị Xuân Nhạn | T-02, T-07, T-20 | 2 / `v0.2` | 2026-10-13 | 2026-10-13 | 7 |
| [T-25 / XIAN-59](https://xiangqi-web.atlassian.net/browse/XIAN-59) | Nối web với máy chủ: đăng ký, đăng nhập, hồ sơ | 4841_Lê Thị Xuân Nhạn | Nguyễn Minh Thư | T-17, T-18, T-21, T-22 | 2 / `v0.2` | 2026-10-14 | 2026-10-14 | 4.5 |
| [T-26 / XIAN-60](https://xiangqi-web.atlassian.net/browse/XIAN-60) | Giao diện: chọn cấp và phe, màn ván với máy, thông báo sự cố | Nguyễn Minh Thư | 4841_Lê Thị Xuân Nhạn | T-02, T-07, T-10, T-20 | 2 / `v0.2` | 2026-10-13 | 2026-10-14 | 3.5 |
| [T-27 / XIAN-61](https://xiangqi-web.atlassian.net/browse/XIAN-61) | Máy chủ: bộ xử lý lệnh của ván và xử lý nước đi | TÌNH 4851_NGUYỄN NGỌC | nguyenhoangtungtuyhoa | T-04, T-08, T-09, T-23 | 2 / `v0.2` | 2026-10-13 | 2026-10-15 | 14 |
| [T-28 / XIAN-62](https://xiangqi-web.atlassian.net/browse/XIAN-62) | Nối web với máy chủ: tạo phòng, vào phòng, ghế, Sẵn sàng, bắt đầu ván | 4841_Lê Thị Xuân Nhạn | Nguyễn Minh Thư | T-10, T-11, T-23, T-25 | 2 / `v0.2` | 2026-10-14 | 2026-10-15 | 4.5 |
| [T-29 / XIAN-63](https://xiangqi-web.atlassian.net/browse/XIAN-63) | Máy chủ: đồng hồ ván, kết thúc ván, đầu hàng, xin hoà | TÌNH 4851_NGUYỄN NGỌC | nguyenhoangtungtuyhoa | T-27 | 2 / `v0.2` | 2026-10-15 | 2026-10-16 | 12 |
| [T-30 / XIAN-64](https://xiangqi-web.atlassian.net/browse/XIAN-64) | Nối web với máy chủ: đi nước, đồng bộ thế cờ giữa hai trình duyệt | Nguyễn Minh Thư | 4841_Lê Thị Xuân Nhạn | T-24, T-27, T-28 | 2 / `v0.2` | 2026-10-15 | 2026-10-15 | 3.5 |
| [T-31 / XIAN-65](https://xiangqi-web.atlassian.net/browse/XIAN-65) | Máy chủ: ván với máy (cấp, phe, một chỗ chơi, vào lại 30 phút) và xử lý sự cố máy cờ | TÌNH 4851_NGUYỄN NGỌC | nguyenhoangtungtuyhoa | T-14, T-15, T-17, T-27 | 2 / `v0.2` | 2026-10-16 | 2026-10-18 | 12 |
| [T-32 / XIAN-66](https://xiangqi-web.atlassian.net/browse/XIAN-66) | Nối web với máy chủ: bắt đầu ván đầy đủ, đồng hồ, kết thúc ván, đầu hàng, xin hoà | Nguyễn Minh Thư | 4841_Lê Thị Xuân Nhạn | T-29, T-30 | 2 / `v0.2` | 2026-10-16 | 2026-10-17 | 6 |
| [T-33 / XIAN-67](https://xiangqi-web.atlassian.net/browse/XIAN-67) | Nối web, máy chủ và máy cờ thật: ván với máy | Nguyễn Minh Thư | 4841_Lê Thị Xuân Nhạn | T-26, T-31 | 2 / `v0.2` | 2026-10-18 | 2026-10-18 | 4.5 |
| [T-34 / XIAN-68](https://xiangqi-web.atlassian.net/browse/XIAN-68) | Nghiệm thu bản chơi được: đăng ký, tạo phòng, mời, đánh online và đánh với máy chạy trọn | Gia Kỳ | Võ Thành Đông | T-25, T-28, T-32, T-33 | 2 / `v0.2` | 2026-10-18 | 2026-10-19 | 8.5 |
| [T-35 / XIAN-69](https://xiangqi-web.atlassian.net/browse/XIAN-69) | Thử nghiệm LiveKit Cloud: camera/micro theo từng người, thu hồi quyền | TÌNH 4851_NGUYỄN NGỌC | Gia Kỳ | T-01, T-34 | 3 / `v0.3` | 2026-10-20 | 2026-10-21 | 12 |
| [T-36 / XIAN-70](https://xiangqi-web.atlassian.net/browse/XIAN-70) | Giao diện: camera/micro, bật tắt độc lập, mức chia sẻ, thông báo quyền và lỗi | Nguyễn Minh Thư | 4841_Lê Thị Xuân Nhạn | T-07, T-34, T-35 | 3 / `v0.3` | 2026-10-21 | 2026-10-22 | 6 |
| [T-37 / XIAN-71](https://xiangqi-web.atlassian.net/browse/XIAN-71) | Dựng khung kiểm thử tự động trên nhiều trình duyệt (Playwright) | Gia Kỳ | TÌNH 4851_NGUYỄN NGỌC | T-01, T-07, T-34 | 3 / `v0.3` | 2026-10-21 | 2026-10-22 | 3 |
| [T-38 / XIAN-72](https://xiangqi-web.atlassian.net/browse/XIAN-72) | Dựng môi trường demo: chạy cục bộ trước, Render làm dự phòng | Gia Kỳ | TÌNH 4851_NGUYỄN NGỌC | T-01, T-06, T-07, T-34 | 3 / `v0.3` | 2026-10-22 | 2026-10-24 | 3 |
| [T-39 / XIAN-73](https://xiangqi-web.atlassian.net/browse/XIAN-73) | Giao diện: cài đặt phòng, đổi chỗ ghế/xem, danh sách người xem, xác nhận đuổi | 4841_Lê Thị Xuân Nhạn | Nguyễn Minh Thư | T-02, T-07, T-11, T-34 | 3 / `v0.3` | 2026-10-20 | 2026-10-21 | 4.5 |
| [T-40 / XIAN-74](https://xiangqi-web.atlassian.net/browse/XIAN-74) | Giao diện: bạn bè (tìm, lời mời, danh sách, mời vào phòng) | 4841_Lê Thị Xuân Nhạn | Nguyễn Minh Thư | T-02, T-07, T-10, T-11, T-34 | 3 / `v0.3` | 2026-10-20 | 2026-10-20 | 6 |
| [T-41 / XIAN-75](https://xiangqi-web.atlassian.net/browse/XIAN-75) | Máy chủ: kết bạn, lời mời và danh sách bạn có trạng thái | Võ Thành Đông | Tưởng Lê khoa Cường-4572 | T-04, T-06, T-09, T-15, T-34 | 3 / `v0.3` | 2026-10-21 | 2026-10-21 | 6 |
| [T-42 / XIAN-76](https://xiangqi-web.atlassian.net/browse/XIAN-76) | Máy chủ: tác vụ định kỳ dọn và phục hồi tài khoản đăng ký dở | Tưởng Lê khoa Cường-4572 | Gia Kỳ | T-18, T-34 | 3 / `v0.3` | 2026-10-20 | 2026-10-20 | 3.5 |
| [T-43 / XIAN-77](https://xiangqi-web.atlassian.net/browse/XIAN-77) | Máy chủ: kiểu phòng (công khai, chỉ mã, khoá) và danh sách phòng ở Sảnh | nguyenhoangtungtuyhoa | Võ Thành Đông | T-19, T-34 | 3 / `v0.3` | 2026-10-20 | 2026-10-20 | 4.5 |
| [T-44 / XIAN-78](https://xiangqi-web.atlassian.net/browse/XIAN-78) | Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng | TÌNH 4851_NGUYỄN NGỌC | nguyenhoangtungtuyhoa | T-23, T-34, T-43 | 3 / `v0.3` | 2026-10-21 | 2026-10-22 | 8.5 |
| [T-45 / XIAN-79](https://xiangqi-web.atlassian.net/browse/XIAN-79) | Máy chủ: mời bạn đang online vào phòng | Võ Thành Đông | Tưởng Lê khoa Cường-4572 | T-19, T-34, T-41, T-43 | 3 / `v0.3` | 2026-10-22 | 2026-10-22 | 3 |
| [T-46 / XIAN-80](https://xiangqi-web.atlassian.net/browse/XIAN-80) | Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời | 4841_Lê Thị Xuân Nhạn | Nguyễn Minh Thư | T-28, T-32, T-34, T-39, T-43, T-44 | 3 / `v0.3` | 2026-10-23 | 2026-10-24 | 6 |
| [T-47 / XIAN-81](https://xiangqi-web.atlassian.net/browse/XIAN-81) | Bảng nước đi: ký hiệu tiếng Việt và hiển thị | Nguyễn Minh Thư | 4841_Lê Thị Xuân Nhạn | T-07, T-08, T-27, T-34 | 3 / `v0.3` | 2026-10-21 | 2026-10-21 | 6.5 |
| [T-48 / XIAN-82](https://xiangqi-web.atlassian.net/browse/XIAN-82) | Máy chủ: chat hai kênh, quyền đọc, giới hạn tin, lọc từ cấm | nguyenhoangtungtuyhoa | Võ Thành Đông | T-04, T-09, T-19, T-34, T-44 | 3 / `v0.3` | 2026-10-24 | 2026-10-24 | 6 |
| [T-49 / XIAN-83](https://xiangqi-web.atlassian.net/browse/XIAN-83) | Máy chủ: cấp quyền camera/micro theo vai và mở nhiều tab (tab mới tiếp quản) | TÌNH 4851_NGUYỄN NGỌC | Tưởng Lê khoa Cường-4572 | T-17, T-29, T-31, T-34, T-35, T-44 | 3 / `v0.3` | 2026-10-23 | 2026-10-24 | 12 |
| [T-50 / XIAN-84](https://xiangqi-web.atlassian.net/browse/XIAN-84) | Máy chủ: người xem theo dõi trực tiếp, lọc dữ liệu theo vai trò | nguyenhoangtungtuyhoa | Võ Thành Đông | T-19, T-27, T-29, T-34, T-44 | 3 / `v0.3` | 2026-10-22 | 2026-10-23 | 4.5 |
| [T-51 / XIAN-85](https://xiangqi-web.atlassian.net/browse/XIAN-85) | Máy chủ: rời phòng giữa ván, mất kết nối, giữ chỗ, kết nối lại, ván gián đoạn | TÌNH 4851_NGUYỄN NGỌC | nguyenhoangtungtuyhoa | T-17, T-29, T-34, T-44 | 3 / `v0.3` | 2026-10-24 | 2026-10-25 | 12 |
| [T-52 / XIAN-86](https://xiangqi-web.atlassian.net/browse/XIAN-86) | Nối web với máy chủ: bạn bè | 4841_Lê Thị Xuân Nhạn | Nguyễn Minh Thư | T-28, T-31, T-40, T-41, T-45, T-46 | 4 / `v1.0` | 2026-10-28 | 2026-10-28 | 4.5 |
| [T-53 / XIAN-87](https://xiangqi-web.atlassian.net/browse/XIAN-87) | Kiểm thử luật cờ: đếm nước đi độc lập và bộ kiểm thử chạy tự động | Tưởng Lê khoa Cường-4572 | TÌNH 4851_NGUYỄN NGỌC | T-01, T-08, T-47 | 4 / `v1.0` | 2026-10-28 | 2026-10-29 | 12 |
| [T-54 / XIAN-88](https://xiangqi-web.atlassian.net/browse/XIAN-88) | Nối web với máy chủ: bấm đường dẫn mời, đăng nhập rồi vào đúng phòng | 4841_Lê Thị Xuân Nhạn | Nguyễn Minh Thư | T-11, T-19, T-25, T-31, T-32, T-33, T-43, T-44, T-51 | 4 / `v1.0` | 2026-10-27 | 2026-10-28 | 3 |
| [T-55 / XIAN-89](https://xiangqi-web.atlassian.net/browse/XIAN-89) | Đăng xuất giữa ván: xác nhận, đầu hàng, rời phòng rồi đăng xuất | Tưởng Lê khoa Cường-4572 | nguyenhoangtungtuyhoa | T-21, T-25, T-29, T-31, T-44 | 4 / `v1.0` | 2026-10-27 | 2026-10-28 | 6.5 |
| [T-56 / XIAN-90](https://xiangqi-web.atlassian.net/browse/XIAN-90) | Giao diện chat hai kênh và nối web với máy chủ | Nguyễn Minh Thư | 4841_Lê Thị Xuân Nhạn | T-02, T-07, T-09, T-46, T-48, T-50 | 3 / `v0.3` | 2026-10-24 | 2026-10-25 | 6 |
| [T-57 / XIAN-91](https://xiangqi-web.atlassian.net/browse/XIAN-91) | Nối web với máy chủ: mất kết nối, người xem, bảng nước đi, phòng khoá | TÌNH 4851_NGUYỄN NGỌC | Nguyễn Minh Thư | T-25, T-31, T-32, T-33, T-46, T-47, T-49, T-50, T-51 | 3 / `v0.3` | 2026-10-26 | 2026-10-27 | 12 |
| [T-58 / XIAN-92](https://xiangqi-web.atlassian.net/browse/XIAN-92) | Đo máy cờ đầy đủ (GATE-AI): tốc độ, độ sâu, sức mạnh, độ ổn định | Tưởng Lê khoa Cường-4572 | TÌNH 4851_NGUYỄN NGỌC | T-14, T-31, T-53 | 4 / `v1.0` | 2026-10-29 | 2026-10-31 | 14 |
| [T-59 / XIAN-93](https://xiangqi-web.atlassian.net/browse/XIAN-93) | Nối camera/micro thật: theo đối tượng nhận, đổi vai, đuổi, tab (web, máy chủ, LiveKit) | TÌNH 4851_NGUYỄN NGỌC | 4841_Lê Thị Xuân Nhạn | T-30, T-36, T-44, T-49, T-56, T-57 | 4 / `v1.0` | 2026-10-27 | 2026-10-29 | 16.5 |
| [T-60 / XIAN-94](https://xiangqi-web.atlassian.net/browse/XIAN-94) | Giao diện: đủ 5 trạng thái cho mọi màn hình; tính năng chưa làm hiển thị đúng quy tắc | 4841_Lê Thị Xuân Nhạn | Nguyễn Minh Thư | T-10, T-21, T-24, T-25, T-26, T-32, T-33, T-40, T-46, T-52, T-56, T-57, T-59 | 4 / `v1.0` | 2026-10-29 | 2026-10-31 | 12 |
| [T-61 / XIAN-95](https://xiangqi-web.atlassian.net/browse/XIAN-95) | Giao diện: dùng được từ 360 px và bằng cảm ứng; trợ năng | Nguyễn Minh Thư | 4841_Lê Thị Xuân Nhạn | T-60 | 4 / `v1.0` | 2026-10-31 | 2026-11-01 | 8.5 |
| [T-62 / XIAN-96](https://xiangqi-web.atlassian.net/browse/XIAN-96) | Nghiệm thu từng tiêu chí P1 (MVP) và chạy kịch bản demo D1–D10 | Gia Kỳ | Võ Thành Đông | T-22, T-25, T-32, T-33, T-34, T-37, T-42, T-46, T-52, T-53, T-54, T-55, T-56, T-57, T-58, T-59, T-60, T-61 | 4 / `v1.0` | 2026-11-01 | 2026-11-02 | 14 |
| [T-63 / XIAN-97](https://xiangqi-web.atlassian.net/browse/XIAN-97) | Nghiệm thu phi chức năng: bài tải, quyền camera/micro, trình duyệt, bảo mật | Gia Kỳ | nguyenhoangtungtuyhoa | T-22, T-32, T-53, T-56, T-57, T-58, T-59, T-61 | 4 / `v1.0` | 2026-11-02 | 2026-11-04 | 14 |
| [T-64 / XIAN-98](https://xiangqi-web.atlassian.net/browse/XIAN-98) | Chuẩn bị demo, sửa lỗi cuối, kiểm lại và bàn giao bằng chứng | Gia Kỳ | TÌNH 4851_NGUYỄN NGỌC | T-03, T-22, T-38, T-62, T-63 | 4 / `v1.0` | 2026-11-04 | 2026-11-05 | 8.5 |

## 5. Phân tách ước lượng và giờ bàn giao

| Task | Thực hiện | Sửa lỗi dự phòng | Review | Hỗ trợ | Tổng giờ | Kết thúc thực hiện/tự kiểm | Bắt đầu review | Hoàn thành review/PASS dự kiến |
|---|---:|---:|---:|---:|---:|---|---|---|
| T-01 | 2 | 0.5 | 0.5 | 0 | 3 | 2026-10-05 16:30 | 2026-10-05 16:30 | 2026-10-05 17:00 |
| T-02 | 3.5 | 1 | 1 | 0 | 5.5 | 2026-10-06 16:00 | 2026-10-06 16:00 | 2026-10-06 17:00 |
| T-03 | 1.5 | 0.5 | 0.5 | 0 | 2.5 | 2026-10-06 10:00 | 2026-10-06 10:00 | 2026-10-06 10:30 |
| T-04 | 4 | 1 | 1 | 0 | 6 | 2026-10-06 14:00 | 2026-10-06 16:00 | 2026-10-06 17:00 |
| T-05 | 6 | 1.5 | 1 | 0 | 8.5 | 2026-10-06 16:30 | 2026-10-06 16:30 | 2026-10-06 17:30 |
| T-06 | 3 | 1 | 0.5 | 0 | 4.5 | 2026-10-07 12:00 | 2026-10-07 13:00 | 2026-10-07 13:30 |
| T-07 | 4 | 1 | 1 | 0 | 6 | 2026-10-07 14:00 | 2026-10-07 14:00 | 2026-10-07 15:00 |
| T-08 | 10 | 2 | 2 | 0 | 14 | 2026-10-08 13:30 | 2026-10-08 13:30 | 2026-10-08 15:30 |
| T-09 | 5 | 1 | 1 | 0 | 7 | 2026-10-09 13:30 | 2026-10-09 13:30 | 2026-10-09 14:30 |
| T-10 | 4 | 1 | 1 | 0 | 6 | 2026-10-08 15:00 | 2026-10-08 15:00 | 2026-10-08 16:00 |
| T-11 | 3 | 1 | 0.5 | 0 | 4.5 | 2026-10-09 11:00 | 2026-10-09 11:00 | 2026-10-09 11:30 |
| T-12 | 3 | 1 | 0.5 | 0 | 4.5 | 2026-10-08 10:00 | 2026-10-08 15:00 | 2026-10-08 15:30 |
| T-13 | 3 | 1 | 0.5 | 0 | 4.5 | 2026-10-07 17:30 | 2026-10-07 17:30 | 2026-10-07 18:00 |
| T-14 | 8 | 2 | 2 | 0 | 12 | 2026-10-13 11:00 | 2026-10-13 11:00 | 2026-10-13 14:00 |
| T-15 | 4 | 1 | 1 | 0 | 6 | 2026-10-10 10:30 | 2026-10-10 10:30 | 2026-10-10 11:30 |
| T-16 | 1.5 | 0.5 | 0.5 | 0 | 2.5 | 2026-10-08 18:00 | 2026-10-09 11:00 | 2026-10-09 11:30 |
| T-17 | 8 | 2 | 2 | 0 | 12 | 2026-10-11 14:30 | 2026-10-11 14:30 | 2026-10-11 16:30 |
| T-18 | 4 | 1 | 1 | 0 | 6 | 2026-10-10 10:30 | 2026-10-10 10:30 | 2026-10-10 11:30 |
| T-19 | 2.5 | 0.5 | 0.5 | 0 | 3.5 | 2026-10-10 15:30 | 2026-10-10 15:30 | 2026-10-10 16:00 |
| T-20 | 2.5 | 0.5 | 0.5 | 0 | 3.5 | 2026-10-12 12:00 | 2026-10-12 17:30 | 2026-10-12 18:00 |
| T-21 | 6 | 1.5 | 1 | 0 | 8.5 | 2026-10-12 17:30 | 2026-10-12 17:30 | 2026-10-13 09:30 |
| T-22 | 3 | 1 | 0.5 | 0 | 4.5 | 2026-10-13 18:00 | 2026-10-14 09:00 | 2026-10-14 09:30 |
| T-23 | 3 | 1 | 0.5 | 0 | 4.5 | 2026-10-13 14:00 | 2026-10-13 14:00 | 2026-10-13 14:30 |
| T-24 | 5 | 1 | 1 | 0 | 7 | 2026-10-13 16:30 | 2026-10-13 16:30 | 2026-10-13 17:30 |
| T-25 | 3 | 1 | 0.5 | 0 | 4.5 | 2026-10-14 14:30 | 2026-10-14 14:30 | 2026-10-14 15:00 |
| T-26 | 2.5 | 0.5 | 0.5 | 0 | 3.5 | 2026-10-14 11:30 | 2026-10-14 14:30 | 2026-10-14 15:00 |
| T-27 | 10 | 2 | 2 | 0 | 14 | 2026-10-15 09:30 | 2026-10-15 09:30 | 2026-10-15 11:30 |
| T-28 | 3 | 1 | 0.5 | 0 | 4.5 | 2026-10-15 10:00 | 2026-10-15 10:00 | 2026-10-15 10:30 |
| T-29 | 8 | 2 | 2 | 0 | 12 | 2026-10-16 14:30 | 2026-10-16 14:30 | 2026-10-16 16:30 |
| T-30 | 2.5 | 0.5 | 0.5 | 0 | 3.5 | 2026-10-15 15:30 | 2026-10-15 15:30 | 2026-10-15 16:00 |
| T-31 | 8 | 2 | 2 | 0 | 12 | 2026-10-18 09:30 | 2026-10-18 09:30 | 2026-10-18 11:30 |
| T-32 | 4 | 1 | 1 | 0 | 6 | 2026-10-17 13:30 | 2026-10-17 13:30 | 2026-10-17 14:30 |
| T-33 | 3 | 1 | 0.5 | 0 | 4.5 | 2026-10-18 16:30 | 2026-10-18 16:30 | 2026-10-18 17:00 |
| T-34 | 6 | 1.5 | 1 | 0 | 8.5 | 2026-10-19 16:30 | 2026-10-19 16:30 | 2026-10-19 17:30 |
| T-35 | 8 | 2 | 2 | 0 | 12 | 2026-10-21 11:00 | 2026-10-21 11:00 | 2026-10-21 14:00 |
| T-36 | 4 | 1 | 1 | 0 | 6 | 2026-10-22 14:00 | 2026-10-22 14:00 | 2026-10-22 15:00 |
| T-37 | 2 | 0.5 | 0.5 | 0 | 3 | 2026-10-21 16:30 | 2026-10-22 15:30 | 2026-10-22 16:00 |
| T-38 | 2 | 0.5 | 0.5 | 0 | 3 | 2026-10-23 09:30 | 2026-10-24 11:00 | 2026-10-24 11:30 |
| T-39 | 3 | 1 | 0.5 | 0 | 4.5 | 2026-10-21 11:00 | 2026-10-21 11:00 | 2026-10-21 11:30 |
| T-40 | 4 | 1 | 1 | 0 | 6 | 2026-10-20 15:00 | 2026-10-20 15:00 | 2026-10-20 16:00 |
| T-41 | 4 | 1 | 1 | 0 | 6 | 2026-10-21 15:00 | 2026-10-21 15:00 | 2026-10-21 16:00 |
| T-42 | 2.5 | 0.5 | 0.5 | 0 | 3.5 | 2026-10-20 12:00 | 2026-10-20 13:00 | 2026-10-20 13:30 |
| T-43 | 3 | 1 | 0.5 | 0 | 4.5 | 2026-10-20 17:30 | 2026-10-20 17:30 | 2026-10-20 18:00 |
| T-44 | 6 | 1.5 | 1 | 0 | 8.5 | 2026-10-22 15:30 | 2026-10-22 15:30 | 2026-10-22 16:30 |
| T-45 | 2 | 0.5 | 0.5 | 0 | 3 | 2026-10-22 17:30 | 2026-10-22 17:30 | 2026-10-22 18:00 |
| T-46 | 4 | 1 | 1 | 0 | 6 | 2026-10-23 18:00 | 2026-10-24 09:00 | 2026-10-24 10:00 |
| T-47 | 3 | 1 | 0.5 | 2 | 6.5 | 2026-10-21 16:30 | 2026-10-21 16:30 | 2026-10-21 17:00 |
| T-48 | 4 | 1 | 1 | 0 | 6 | 2026-10-24 16:00 | 2026-10-24 16:00 | 2026-10-24 17:00 |
| T-49 | 8 | 2 | 2 | 0 | 12 | 2026-10-24 11:00 | 2026-10-24 11:00 | 2026-10-24 14:00 |
| T-50 | 3 | 1 | 0.5 | 0 | 4.5 | 2026-10-23 11:30 | 2026-10-23 11:30 | 2026-10-23 12:00 |
| T-51 | 8 | 2 | 2 | 0 | 12 | 2026-10-25 16:00 | 2026-10-25 16:00 | 2026-10-25 18:00 |
| T-52 | 3 | 1 | 0.5 | 0 | 4.5 | 2026-10-28 15:00 | 2026-10-28 15:00 | 2026-10-28 15:30 |
| T-53 | 8 | 2 | 2 | 0 | 12 | 2026-10-29 11:30 | 2026-10-29 11:30 | 2026-10-29 14:30 |
| T-54 | 2 | 0.5 | 0.5 | 0 | 3 | 2026-10-28 09:30 | 2026-10-28 09:30 | 2026-10-28 10:00 |
| T-55 | 3 | 1 | 0.5 | 2 | 6.5 | 2026-10-27 18:00 | 2026-10-28 09:00 | 2026-10-28 09:30 |
| T-56 | 4 | 1 | 1 | 0 | 6 | 2026-10-25 14:00 | 2026-10-25 14:00 | 2026-10-25 15:00 |
| T-57 | 8 | 2 | 2 | 0 | 12 | 2026-10-27 11:00 | 2026-10-27 11:00 | 2026-10-27 14:00 |
| T-58 | 10 | 2 | 2 | 0 | 14 | 2026-10-31 09:30 | 2026-10-31 09:30 | 2026-10-31 11:30 |
| T-59 | 12 | 2.5 | 2 | 0 | 16.5 | 2026-10-29 11:30 | 2026-10-29 11:30 | 2026-10-29 14:30 |
| T-60 | 8 | 2 | 2 | 0 | 12 | 2026-10-30 16:30 | 2026-10-30 16:30 | 2026-10-31 09:30 |
| T-61 | 6 | 1.5 | 1 | 0 | 8.5 | 2026-10-31 18:00 | 2026-11-01 09:00 | 2026-11-01 10:00 |
| T-62 | 10 | 2 | 2 | 0 | 14 | 2026-11-02 15:00 | 2026-11-02 15:00 | 2026-11-02 17:00 |
| T-63 | 10 | 2 | 2 | 0 | 14 | 2026-11-04 12:00 | 2026-11-04 13:00 | 2026-11-04 15:00 |
| T-64 | 6 | 1.5 | 1 | 0 | 8.5 | 2026-11-05 14:30 | 2026-11-05 14:30 | 2026-11-05 15:30 |

## 6. Điều chỉnh theo tiến độ thực tế

Khi đầu vào chưa PASS, dịch Task phụ thuộc và báo tác động lên Story/Epic/Release; lấy việc độc lập đủ điều kiện, đúng vai trò và còn giới hạn ba Task để làm. Khi ước lượng lệch, cập nhật Remaining Estimate, lịch review và Sprint; chỉ ghi worklog sau khi làm thật. Không tự hạ tiêu chí, bỏ Google/AI/media/người xem hoặc chuyển P1 sang P2. Story Points vẫn để nhóm thống nhất. T-34 là cửa kiểm bản lõi; T-62/T-63 kiểm MVP đầy đủ, T-64 chuẩn bị demo/bàn giao. Tất cả Gate/AC vẫn NOT_RUN cho đến khi có sản phẩm và bằng chứng.

## 7. Liên kết và cách đọc Timeline

**Blocks** là điều kiện tiền đề; **Relates** là truy vết triển khai Story–Task. Story bao trùm các Task nên ngày có thể giao nhau hợp lệ. Kiểm ngày trên 237 Blocks, không áp luật tiền đề lên 145 Relates. Nếu Timeline hiển thị nhầm loại quan hệ, đối chiếu Linked work items trong chi tiết issue. Khi trình bày lịch triển khai, lọc loại Task và tắt Show inline hierarchy after filtering để ẩn thanh Epic; Story và tiêu chí vẫn xem đầy đủ ở Backlog/chi tiết. Không xoá liên kết truy vết chỉ để làm biểu đồ đẹp.

## 8. Điều chỉnh theo yêu cầu ít Task song song

PO chọn tối đa 3 Task đang mở, thường 1–2 Task triển khai. Lịch tính theo nửa giờ: 366/446 ca nửa giờ có triển khai (82,1%) chỉ có 1–2 Task; 80 ca còn lại có 3 Task triển khai độc lập. Ca chỉ review không tính vào mẫu số này. Chờ review vẫn tính vào giới hạn 3 Task đang mở. Không có ca một người làm hai việc. Giữ vai trò, bao gồm ngoại lệ Cường kiểm thử T-53/T-58 đã duyệt.

Giảm việc phạm vi hẹp, tăng việc quan trọng; bảng là giờ công tổng đã gồm tự kiểm, sửa lỗi dự phòng và review, không phải số ngày trên thanh Timeline.

| Task | Công việc | Giờ trước | Giờ mới |
|---|---|---:|---:|
| T-03 / XIAN-37 | Cấu hình Supabase: gửi mã OTP đăng ký và đăng nhập Google | 5 | 2.5 |
| T-16 / XIAN-50 | Giao diện: bấm chọn quân và chấm gợi ý ô đi | 5 | 2.5 |
| T-19 / XIAN-53 | Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh | 5.5 | 3.5 |
| T-20 / XIAN-54 | Giao diện: kéo thả quân, đánh dấu nước vừa đi, cảnh báo chiếu, âm thanh | 6 | 3.5 |
| T-54 / XIAN-88 | Nối web với máy chủ: bấm đường dẫn mời, đăng nhập rồi vào đúng phòng | 6 | 3 |
| T-08 / XIAN-42 | Luật cờ: nước hợp lệ, chiếu, chiếu hết, hết nước, lặp thế, 120 nửa nước | 12 | 14 |
| T-27 / XIAN-61 | Máy chủ: bộ xử lý lệnh của ván và xử lý nước đi | 12 | 14 |
| T-51 / XIAN-85 | Máy chủ: rời phòng giữa ván, mất kết nối, giữ chỗ, kết nối lại, ván gián đoạn | 10.5 | 12 |
| T-58 / XIAN-92 | Đo máy cờ đầy đủ (GATE-AI): tốc độ, độ sâu, sức mạnh, độ ổn định | 12 | 14 |
| T-59 / XIAN-93 | Nối camera/micro thật: theo đối tượng nhận, đổi vai, đuổi, tab (web, máy chủ, LiveKit) | 13.5 | 16.5 |
| T-63 / XIAN-97 | Nghiệm thu phi chức năng: bài tải, quyền camera/micro, trình duyệt, bảo mật | 12 | 14 |

## 9. Bảng ca hằng ngày để trình bày với giảng viên

Mỗi dòng liệt kê việc có ca trong ngày theo thứ tự bắt đầu; số Task khác nhau trong ngày có thể lớn hơn 3 vì bàn giao xong rồi mở việc tiếp. Giới hạn 3 áp dụng tại từng thời điểm, gồm cả chờ review. Xem giờ bắt đầu/kết thúc chính xác trong Description từng Task và mục 5.

| Ngày | Các Task có ca thực hiện/review/hỗ trợ | Số Task mở đồng thời lớn nhất |
|---|---|---:|
| 2026-10-05 | T-01, T-05, T-04, T-03 | 3 |
| 2026-10-06 | T-05, T-04, T-03, T-02, T-07, T-06, T-08 | 3 |
| 2026-10-07 | T-07, T-06, T-08, T-13, T-12 | 3 |
| 2026-10-08 | T-08, T-12, T-10, T-09, T-11, T-16 | 3 |
| 2026-10-09 | T-09, T-11, T-16, T-18, T-15 | 3 |
| 2026-10-10 | T-18, T-15, T-19, T-17 | 2 |
| 2026-10-11 | T-17 | 1 |
| 2026-10-12 | T-14, T-21, T-20 | 3 |
| 2026-10-13 | T-14, T-21, T-23, T-24, T-22, T-27, T-26 | 3 |
| 2026-10-14 | T-27, T-26, T-22, T-25, T-28 | 3 |
| 2026-10-15 | T-27, T-28, T-30, T-29 | 2 |
| 2026-10-16 | T-29, T-31, T-32 | 2 |
| 2026-10-17 | T-31, T-32 | 2 |
| 2026-10-18 | T-31, T-33, T-34 | 1 |
| 2026-10-19 | T-34 | 1 |
| 2026-10-20 | T-35, T-40, T-42, T-43, T-39 | 3 |
| 2026-10-21 | T-35, T-39, T-41, T-47, T-37, T-44, T-36 | 3 |
| 2026-10-22 | T-44, T-36, T-45, T-37, T-38, T-50 | 3 |
| 2026-10-23 | T-38, T-50, T-49, T-46 | 3 |
| 2026-10-24 | T-49, T-46, T-48, T-38, T-51, T-56 | 3 |
| 2026-10-25 | T-51, T-56 | 2 |
| 2026-10-26 | T-57 | 1 |
| 2026-10-27 | T-57, T-59, T-55, T-54 | 3 |
| 2026-10-28 | T-59, T-54, T-55, T-53, T-52 | 3 |
| 2026-10-29 | T-59, T-53, T-60, T-58 | 2 |
| 2026-10-30 | T-60, T-58 | 2 |
| 2026-10-31 | T-58, T-60, T-61 | 2 |
| 2026-11-01 | T-61, T-62 | 1 |
| 2026-11-02 | T-62, T-63 | 1 |
| 2026-11-03 | T-63 | 1 |
| 2026-11-04 | T-63, T-64 | 1 |
| 2026-11-05 | T-64 | 1 |

## 10. Cách xem lịch Task trên Jira

[Xem Timeline theo ngày của Task](https://xiangqi-web.atlassian.net/jira/software/c/projects/XIAN/boards/39/timeline?rangeMode=WEEKS&hideDependencies=true&jql=type%20%3D%20Task). Board 39 dùng cùng 98 mục của XIAN, không tạo lại issue; Board 38 vẫn quản lý Scrum/Sprint. Timeline Scrum 38 đang dùng khung Sprint cho thanh con, vì vậy để trình bày ngày riêng dùng Board 39. Tắt đường phụ thuộc chỉ ẩn hình vẽ, giữ nguyên 237 Blocks và 145 Relates. Epic là khoảng từ việc đầu tới nghiệm thu cuối; các thanh Epic giao nhau không đồng nghĩa tất cả Task chạy cùng lúc. Chế độ lọc Task và tắt phân cấp đã hiển thị đủ 64 Task, gồm sáu Task chung không Parent; bảng ở mục 4 và List cũng có danh sách đầy đủ.

**Chế độ trình bày hiện tại:** Filter = Task; View settings → **Show inline hierarchy after filtering: tắt**, **Dependencies: tắt**. Bật lại phân cấp khi cần xem cấu trúc Epic; không cần sửa Parent hay xoá issue.

## 11. Mốc Epic và cách đọc việc chồng thời gian

Epic chứa nhiều phần triển khai, tích hợp và kiểm thử ở các thời điểm khác nhau. Start date bao gồm cả Task dùng chung liên quan tới Story; ngày bắt đầu Task trực tiếp cho thấy khi nhóm bắt tay vào phần riêng của Epic. Due date đã sửa theo Task/Story hoàn thành muộn nhất, không gán tất cả 05/11. Assignee Epic điều phối phạm vi; sức chứa được kiểm ở ca Task, review và hỗ trợ.

| Epic / Jira | Bắt đầu phần Task trực tiếp | Bắt đầu phạm vi liên quan | Hoàn tất phạm vi liên quan |
|---|---|---|---|
| E-01 / XIAN-1 | 2026-10-05 14:00 | 2026-10-05 | 2026-11-04 |
| E-02 / XIAN-2 | 2026-10-08 09:00 | 2026-10-08 | 2026-10-31 |
| E-03 / XIAN-3 | 2026-10-20 09:00 | 2026-10-08 | 2026-10-31 |
| E-04 / XIAN-4 | 2026-10-05 17:00 | 2026-10-05 | 2026-11-01 |
| E-05 / XIAN-5 | 2026-10-13 09:30 | 2026-10-06 | 2026-11-04 |
| E-06 / XIAN-6 | 2026-10-20 13:30 | 2026-10-08 | 2026-11-02 |
| E-07 / XIAN-7 | 2026-10-20 09:00 | 2026-10-08 | 2026-11-04 |
| E-08 / XIAN-8 | 2026-10-12 09:00 | 2026-10-08 | 2026-10-31 |

Hạn bàn giao dự án vẫn 05/11; Epic chỉ Done khi tất cả Story/tiêu chí đã kiểm thật đạt. Bảng không khẳng định sản phẩm đã hoàn thành.

**Kiểm cấu hình sau chỉnh lịch 05/10/2026:** đọc lại Jira đủ 98 mục: ngày/Sprint/Release/Assignee/ước lượng và Description khớp bản chuẩn; 64 Task tổng 458 giờ; 237 Blocks, 145 Relates; 4 Sprint future, 4 Release unreleased. Kiểm ca: tối đa 3 Task mở, không trùng người, tối đa 8 giờ/người/ngày; mốc cuối 05/11 15:30. Đây là kiểm kế hoạch, mọi kiểm sản phẩm vẫn NOT_RUN.
