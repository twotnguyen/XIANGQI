# Tra cứu 71 Task P1 để gắn mã commit

Dùng khi phân loại thay đổi, chọn nhánh và viết commit. Phạm vi: T01–T71; không gồm Task P2. BE = server; FE = giao diện web.

Nguồn: [ánh xạ Jira chính thức](reports/ANH-XA-JIRA-107-MUC.md), [mô tả và nghiệm thu từng mục](reports/JIRA-MUC-CHI-TIET.md). Đây là bản tra cứu ngắn, không thay thế Description/AC và không xác nhận Task đã hoàn thành.

## Quy tắc khi được yêu cầu commit

1. Đọc thay đổi thực tế, chọn Task theo **mục đích công việc**, không chỉ theo tên file hoặc trang. Đối chiếu Description/AC nếu có giao thoa; không gán mã gần đúng chỉ để có mã Jira.
2. Dùng **Jira Key `XIAN-…`** trong tiêu đề commit. `T01`, `T21`… chỉ là mã kế hoạch, không đủ để Jira liên kết commit.
3. Mẫu: `<type>(<scope>): XIAN-<số> <mô tả>`. Type theo việc thực hiện: `feat`, `fix`, `docs`, `refactor`, `perf`, `ci`, `chore`, `test`. Không dùng Smart Commit (`#done`, `#time`…).
4. Thay đổi và test hồi quy đi kèm một chức năng thường cùng mã Task triển khai. Chọn Task kiểm thử khi công việc chính là xây dựng/chạy bộ nghiệm thu của Task đó; không chuyển mọi thay đổi file test sang Task kiểm thử.
5. Nhiều công việc độc lập: tách commit theo Task, stage riêng từng phần. Thay đổi dùng chung không thể tách hợp lý: ghi các Jira Key thực sự liên quan trong tiêu đề; không thêm mã không thuộc phạm vi.
6. Nếu yêu cầu commit theo nhánh Task: tra nhánh remote chứa đúng Jira Key, dùng nhánh đã có; không tự tạo nhánh trùng, reset/force-push hoặc chuyển nhánh khi có nguy cơ mất thay đổi. Mặc định vẫn theo quy trình nhánh của repo; có mã Task không đồng nghĩa phải đổi nhánh.
7. Nếu ngoài 71 Task này (ví dụ P2), tra issue thật trước khi gắn mã. Chỉ hỏi người dùng khi tài liệu và Jira vẫn không xác định được phạm vi; không tự suy ra Jira Key bằng phép cộng.
8. Trước commit, nêu mã Task đã chọn và lý do ngắn. Không tự commit/push hoặc đổi trạng thái Jira nếu chưa được yêu cầu. Gắn mã commit không tự đánh dấu Task Done.

Jira chỉ hiển thị commit/nhánh khi tích hợp GitHub–Jira đang hoạt động và repo được kết nối. Tên nhánh chứa `XIAN-…` không thay thế Jira Key trong tiêu đề commit; sau push chỉ báo Jira đã ghi nhận khi đã quan sát được trên issue.

### Ví dụ chọn nhanh

- Bố cục phòng chờ → `XIAN-57`; khung camera/mic và nút thao tác media → `XIAN-94`; khung chat → `XIAN-78`; sao chép mã/link mời → `XIAN-62`.
- Giao diện `/settings` → `XIAN-101`; cài đặt quyền truy cập/thời gian của phòng → `XIAN-93`.
- Cấu hình CI → `XIAN-37`; sửa test lỗi do thay đổi UI → chọn Task của hành vi được kiểm tra, không mặc định gán cho CI.

```text
fix(media): XIAN-94 căn giữa nút camera và mic
fix(rooms): XIAN-62 giữ kích thước nút khi sao chép mã phòng
feat(profile): XIAN-101 bố trí cài đặt theo sidebar
```

## Danh mục Task

| Jira Key | Mã kế hoạch | Công việc chính / khi chọn mã |
|---|---|---|
| XIAN-37 | T01 | Nền tảng monorepo, CI, nhật ký vận hành và `/health`. |
| XIAN-38 | T02 | Kế hoạch kiểm thử, test case nền tảng, dữ liệu chuẩn luật và máy cờ. |
| XIAN-39 | T03 | Khung UI dùng chung: theme, layout, router, thành phần với 5 trạng thái. |
| XIAN-40 | T04 | BE đăng ký, SMTP, OTP email, phục hồi tài khoản và thử xác thực sớm. |
| XIAN-41 | T05 | Lõi bàn cờ; nước đi và ăn quân của 7 loại quân. |
| XIAN-42 | T06 | Spike camera/mic qua LAN, Cloud, HTTPS và thử mô hình phiên. |
| XIAN-43 | T07 | Lõi luật: nước hợp lệ, chiếu, chiếu hết và hết nước đi. |
| XIAN-44 | T08 | FE đăng ký tài khoản theo luồng 3 bước. |
| XIAN-45 | T09 | BE đăng nhập username/mật khẩu, khóa thử sai, ghi nhớ đăng nhập. |
| XIAN-46 | T10 | Lõi luật kết thúc ván, perft và độ phủ kiểm thử luật. |
| XIAN-47 | T11 | FE bàn cờ SVG, 32 quân, lật bàn, responsive và nhãn trợ năng. |
| XIAN-48 | T12 | Nền tảng realtime Socket.IO, kết nối và hợp đồng sự kiện. |
| XIAN-49 | T13 | Kiểm thử US-01.1: đăng ký username/mật khẩu và OTP email. |
| XIAN-50 | T14 | Lược đồ DB P1, RLS, migration và dữ liệu mẫu. |
| XIAN-51 | T15 | FE form đăng nhập, ghi nhớ đăng nhập và thông báo an toàn. |
| XIAN-52 | T16 | Kiểm thử US-04.2: khởi tạo và hiển thị bàn cờ. |
| XIAN-53 | T17 | Kiểm thử US-01.2: đăng nhập và khóa thử sai. |
| XIAN-54 | T18 | BE tạo phòng, mã/link, ghế, đổi ghế, sẵn sàng, đếm ngược và chuyển Host. |
| XIAN-55 | T19 | FE đi cờ click/kéo thả, gợi ý ô, đánh dấu và âm thanh. |
| XIAN-56 | T20 | BE ván online: tạo ván, phân xử nước đi, kết thúc và lưu ván. |
| XIAN-57 | T21 | FE hộp tạo phòng và phòng chờ: bố cục, ghế, sẵn sàng, đếm ngược. |
| XIAN-58 | T22 | BE vào phòng bằng mã/link, xếp ghế/người xem, vào lại sau đăng nhập. |
| XIAN-59 | T23 | BE đồng hồ thi đấu và xử lý hết giờ. |
| XIAN-60 | T24 | Máy cờ 3 cấp, negamax/alpha-beta, tìm sâu dần và worker riêng. |
| XIAN-61 | T25 | FE phòng đấu online, đồng hồ, kết quả và lớp phủ nối lại. |
| XIAN-62 | T26 | FE chia sẻ/sao chép mã và link phòng, nhập mã, vào phòng sau đăng nhập. |
| XIAN-63 | T27 | Kiểm thử US-04.3: thao tác đi cờ và âm thanh. |
| XIAN-64 | T28 | Kiểm thử US-02.1: tạo phòng, ghế và bắt đầu ván. |
| XIAN-65 | T29 | Kiểm thử US-03.1: mời và vào phòng bằng mã/link. |
| XIAN-66 | T30 | Kiểm thử US-05.1: ván online, nước đi, đồng hồ và kết thúc. |
| XIAN-67 | T31 | BE bạn bè, trạng thái online và mời bạn vào phòng. |
| XIAN-68 | T32 | BE đầu hàng, rời giữa ván và xin hòa với thời hạn 30 giây. |
| XIAN-69 | T33 | BE LiveKit: token, quyền phát/nhận, thu hồi quyền và mức chia sẻ. |
| XIAN-70 | T34 | BE ván AI: tạo ván, chọn phe, đầu hàng và ván mới. |
| XIAN-71 | T35 | BE đăng ký/đăng nhập Google, onboarding và phiên Khách. |
| XIAN-72 | T36 | FE nút đầu hàng, xin hòa và popup đếm ngược đề nghị hòa. |
| XIAN-73 | T37 | BE hai kênh chat, lọc từ cấm và giới hạn tốc độ. |
| XIAN-74 | T38 | FE thiết lập/chơi AI và hiển thị sự cố máy cờ. |
| XIAN-75 | T39 | Kiểm thử US-05.2: đầu hàng và xin hòa. |
| XIAN-76 | T40 | FE bạn bè, chuông thông báo, tab mời và popup lời mời. |
| XIAN-77 | T41 | BE xin đổi bên và đưa phòng về chờ sau ván. |
| XIAN-78 | T42 | FE khung chat hai kênh, bố cục và thao tác gửi tin. |
| XIAN-79 | T43 | Kiểm thử US-08.1: thiết lập và chơi ván AI. |
| XIAN-80 | T44 | FE Google, onboarding, tên Khách và giới hạn chức năng Khách. |
| XIAN-81 | T45 | Kiểm thử US-07.2: camera, mic và mức chia sẻ. |
| XIAN-82 | T46 | FE xin đổi bên, popup kết thúc ván, ở lại/rời phòng. |
| XIAN-83 | T47 | Kiểm thử US-07.1: hai kênh chat và bộ lọc. |
| XIAN-84 | T48 | Kiểm thử US-01.3: Google và chế độ Khách. |
| XIAN-85 | T49 | Kiểm thử US-03.2: bạn bè và mời bạn online. |
| XIAN-86 | T50 | Kiểm thử US-02.2: đổi bên và ở lại phòng sau ván. |
| XIAN-87 | T51 | Hồi quy tích hợp toàn bộ chức năng và vòng demo D1–D10 đầy đủ. |
| XIAN-88 | T52 | BE mất kết nối, ân hạn, đồng bộ lại và khởi động lại server. |
| XIAN-89 | T53 | BE chế độ PUBLIC/CODE_ONLY/LOCKED và thu hồi mã phòng. |
| XIAN-90 | T54 | BE danh sách phòng PUBLIC realtime, vào chơi và vào xem. |
| XIAN-91 | T55 | BE giới hạn người xem, chuyển ghế/xem, đuổi và chặn. |
| XIAN-92 | T56 | BE phiên cố định, một vị trí chơi, thiết bị khác xử thua và đăng xuất. |
| XIAN-93 | T57 | FE cài đặt phòng: quyền truy cập và thời gian ván. |
| XIAN-94 | T58 | FE danh sách người xem, thao tác ghế, khung camera/mic và quyền thao tác. |
| XIAN-95 | T59 | Tinh chỉnh máy cờ và đo GATE-ENGINE trên dữ liệu đã xác minh. |
| XIAN-96 | T60 | Kiểm thử US-05.3: mất kết nối và nối lại. |
| XIAN-97 | T61 | FE Sảnh, bốn lựa chọn, luật chơi, danh sách phòng và thanh điều hướng. |
| XIAN-98 | T62 | Kiểm thử US-06.1: cài đặt và chế độ truy cập phòng. |
| XIAN-99 | T63 | BE giữ ván AI 30 phút, thử lại và khởi động lại. |
| XIAN-100 | T64 | Kiểm thử US-06.3: người xem và đuổi người xem. |
| XIAN-101 | T65 | FE cài đặt hồ sơ, đăng xuất và banner quay lại ván dở. |
| XIAN-102 | T66 | Đo tải/NFR và đối soát bằng chứng chín cổng kỹ thuật. |
| XIAN-103 | T67 | Kiểm thử US-06.2: Sảnh và danh sách phòng công khai. |
| XIAN-104 | T68 | Kiểm thử US-08.3: ổn định ván AI và cấp Khó. |
| XIAN-105 | T69 | Kiểm thử US-01.4: phiên đăng nhập, hồ sơ và đăng xuất. |
| XIAN-106 | T70 | Kiểm cổng phát hành, đóng gói v1.0 và hướng dẫn demo. |
| XIAN-107 | T71 | Tổng duyệt D1–D10 trên bản phát hành và ghi hình. |
