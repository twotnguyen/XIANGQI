# Truy vết nghiệm thu — 268 AC / 71 Task

> Phân công dự kiến, **chưa có TC đã thực thi, chưa có PASS**. TC dùng mã AC tương ứng, thêm hậu tố cho nhiều nhánh. Tiêu chí nguồn: BACKLOG-P1; dữ liệu máy đọc: AC-TASK-MAP.json.

Task được nghiệm thu theo đúng AC giao trong bảng. Các AC chưa đủ đầu vào chuyển tới Task tích hợp được ghi rõ; không công bố 100% Story từ kiểm cục bộ. T51 kiểm hồi quy đầy đủ sau mọi triển khai, có thể song song QA chuyên đề; T70 chờ cả hai nhóm và T66. Mỗi bằng chứng cần bản dựng, môi trường, dữ liệu, ngày/người chạy và kết quả PASS/FAIL/BLOCKED.

## US-00.1 · Khung dự án, CI và nhật ký vận hành

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-00.1.1 | T01 | T01 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-00.1.2 | T01 | T01 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-00.1.3 | T01 | T01 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-00.1.4 | T01, T14, T24 | T51 | Tích hợp/đối soát | /health của máy cờ và CSDL cần các module thật; T01 kiểm khung endpoint sớm. |
| AC-00.1.5 | T01, T04, T09, T37 | T51 | Tích hợp/đối soát | Kiểm log trong luồng đăng nhập, OTP và chat thật sau tích hợp; không kết luận PASS toàn AC từ logger giả. |
| AC-00.1.6 | T01, T12 | T51 | Tích hợp/đối soát | T01 cấu hình hạn log, T12 tạo/lưu/dọn biên lai; dùng đồng hồ kiểm thử để xác minh 24 giờ và 14 ngày. |

## US-00.2 · Cơ sở dữ liệu và phân quyền P1

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-00.2.1 | T04, T09, T12, T14 | T51 | Tích hợp/đối soát | T14 kiểm cục bộ các bảng/tệp đã bàn giao. T51 dựng mới bằng toàn bộ tệp của đăng ký, đăng nhập, kết nối và dữ liệu, rồi kiểm quyền đầy đủ; không nghiệm thu trước khi T09 hoàn tất. |
| AC-00.2.2 | T04, T09, T12, T14 | T51 | Tích hợp/đối soát | T14 kiểm cục bộ các bảng/tệp đã bàn giao. T51 dựng mới bằng toàn bộ tệp của đăng ký, đăng nhập, kết nối và dữ liệu, rồi kiểm quyền đầy đủ; không nghiệm thu trước khi T09 hoàn tất. |
| AC-00.2.3 | T14 | T14 | Task | T14 nghiệm thu migration, ràng buộc và RLS bằng test trực tiếp CSDL; kiểm schema/phân quyền tích hợp lại ở T51. Hồi quy tại T51. |

## US-00.3 · Khung realtime

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-00.3.1 | T12 | T12 | Task | T12 kiểm hợp đồng socket với token/fixture hợp lệ và không hợp lệ; xác minh lại trong các luồng thật tại T51. Hồi quy tại T51. |
| AC-00.3.2 | T12 | T12 | Task | T12 kiểm hợp đồng socket với token/fixture hợp lệ và không hợp lệ; xác minh lại trong các luồng thật tại T51. Hồi quy tại T51. |
| AC-00.3.3 | T12 | T12 | Task | T12 kiểm hợp đồng socket với token/fixture hợp lệ và không hợp lệ; xác minh lại trong các luồng thật tại T51. Hồi quy tại T51. |
| AC-00.3.4 | T12, T18, T20, T23, T25, T52 | T51 | Tích hợp/đối soát | T12 kiểm contract snapshot sớm; ảnh chụp đầy đủ phòng/ván/đồng hồ/vai trò và nối lại trên giao diện cần tích hợp tính năng. |
| AC-00.3.5 | T12, T21, T25 | T51 | Tích hợp/đối soát | T12 kiểm quyền tiếp quản tab ở mức socket; E2E hai tab cùng phòng cần giao diện/phòng/ván thật, kể cả tab cũ tự reconnect. |

## US-00.4 · Kế hoạch kiểm thử và kiểm chứng sớm

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-00.4.1 | T02 | T02 | Task | T02 lập và duyệt kế hoạch kiểm thử, môi trường, mẫu TC, quy trình lỗi. Hồi quy tại T51. |
| AC-00.4.2 | T02, T13, T16, T17, T27, T28, T29, T30, T39, T43, T45, T47, T48, T49, T50, T60, T62, T64, T67, T68, T69 | T70 | Tích hợp/đối soát | T02 đặt mẫu/quy trình; từng Task viết và chạy TC, lưu báo cáo hồi quy theo Sprint. T70 đối soát đủ báo cáo sau khi mọi QA xong; không yêu cầu T51 chờ các QA song song. |
| AC-00.4.3 | T02, T13, T16, T17, T27, T28, T29, T30, T39, T43, T45, T47, T48, T49, T50, T60, T62, T64, T67, T68, T69, T51 | T70 | Tích hợp/đối soát | T02 đặt mẫu/quy trình; từng Task viết và chạy TC, lưu báo cáo hồi quy theo Sprint. T70 đối soát đủ báo cáo sau khi mọi QA xong; không yêu cầu T51 chờ các QA song song. |

## US-00.5 · Nghiệm thu tổng, NFR và đóng gói demo

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-00.5.1 | T01, T02, T03, T04, T05, T06, T07, T08, T09, T10, T11, T12, T14, T15, T18, T19, T20, T21, T22, T23, T24, T25, T26, T31, T32, T33, T34, T35, T36, T37, T38, T40, T41, T42, T44, T46, T52, T53, T54, T55, T56, T57, T58, T59, T61, T63, T65 | T51 | Tích hợp/đối soát | T51 chạy D1–D10 đầy đủ sau toàn bộ triển khai, song song QA chuyên đề; T70 chờ mọi QA và NFR trước phát hành. |
| AC-00.5.2 | T71 | T71 | Tích hợp/đối soát | T71 chạy lại D1–D10 trên bản đóng gói và máy demo thật, ghi hình. Hồi quy tại T51. |
| AC-00.5.3 | T01, T02, T03, T04, T05, T06, T07, T08, T09, T10, T11, T12, T14, T15, T18, T19, T20, T21, T22, T23, T24, T25, T26, T31, T32, T33, T34, T35, T36, T37, T38, T40, T41, T42, T44, T46, T52, T53, T54, T55, T56, T57, T58, T59, T61, T63, T65 | T66 | Tích hợp/đối soát | Đo/đối soát 12 NFR và 9 gate sau toàn bộ triển khai, gồm UI media/Sảnh. QA chức năng chạy song song; T70 chờ tất cả kết quả. |
| AC-00.5.4 | T66 | T66 | Tích hợp/đối soát | T66 kiểm tải 50 người/10 ván trên bản tính năng đầy đủ và ghi p95, lỗi, CPU/RAM. Hồi quy tại T51. |
| AC-00.5.5 | T70 | T70 | Tích hợp/đối soát | T70 kiểm chạy theo README trên máy sạch, dữ liệu/tài khoản demo và phương án Render; T71 xác nhận bản đóng gói thực tế. Hồi quy tại T51. |
| AC-00.5.6 | T70 | T70 | Tích hợp/đối soát | T70 kiểm chạy theo README trên máy sạch, dữ liệu/tài khoản demo và phương án Render; T71 xác nhận bản đóng gói thực tế. Hồi quy tại T51. |

## US-01.1 · Đăng ký bằng Username + Mật khẩu + OTP email

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-01.1.1 | T04, T08 | T13 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.1.2 | T04 | T13 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.1.3 | T04, T08 | T13 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.1.4 | T04 | T13 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.1.5 | T04, T08 | T13 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.1.6 | T04, T08, T22, T26 | T51 | Tích hợp/đối soát | T13 kiểm ACTIVE, tên mặc định và đăng nhập; nhánh link mời phải kiểm sau T22/T26, nên nghiệm thu đầy đủ tại T51. |
| AC-01.1.7 | T04, T08 | T13 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.1.8 | T04, T08 | T13 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.1.9 | T04 | T13 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.1.10 | T04 | T13 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.1.11 | T04 | T13 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.1.12 | T04 | T13 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.1.13 | T04, T08 | T13 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |

## US-01.2 · Đăng nhập bằng Username + Mật khẩu và khoá thử sai

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-01.2.1 | T09, T15, T22, T26 | T51 | Tích hợp/đối soát | T17 kiểm username không phân biệt hoa thường và vào Sảnh; nhánh quay vào phòng mời kiểm sau tích hợp T22/T26. |
| AC-01.2.2 | T09, T15 | T17 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.2.3 | T09, T15 | T17 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.2.4 | T09, T15 | T17 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.2.5 | T09, T15 | T17 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.2.6 | T09, T15 | T17 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.2.7 | T09, T15 | T17 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.2.8 | T15, T03 | T17 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.2.9 | T09, T35, T44 | T48 | Tích hợp/đối soát | AC Google không xoá khoá mật khẩu không thuộc nghiệm thu cục bộ T17; T48 kiểm sau Google/Onboarding thật. Hồi quy tại T51. |

## US-01.3 · Đăng ký/đăng nhập bằng Google và chế độ Khách

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-01.3.1 | T35, T44 | T48 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.3.2 | T35, T44, T04 | T48 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.3.3 | T35, T44 | T48 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.3.4 | T35, T44 | T48 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.3.5 | T35, T44 | T48 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.3.6 | T35, T44 | T48 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.3.7 | T35 | T48 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.3.8 | T44 | T48 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.3.9 | T35, T44, T37 | T48 | Task | Tên Khách dùng bộ lọc chung T37; T48 kiểm tên hợp lệ, bị cấm, độ dài và nhãn Khách trên giao diện đã tích hợp. Hồi quy tại T51. |
| AC-01.3.10 | T35, T44, T37 | T48 | Task | Tên Khách dùng bộ lọc chung T37; T48 kiểm tên hợp lệ, bị cấm, độ dài và nhãn Khách trên giao diện đã tích hợp. Hồi quy tại T51. |
| AC-01.3.11 | T35, T18 | T48 | Task | T48 kiểm giới hạn một phòng Khách bằng thao tác tạo phòng thật; API T18 phải thực thi giới hạn danh tính Khách từ T35. Hồi quy tại T51. |
| AC-01.3.12 | T35, T56, T18, T34, T37 | T51 | Tích hợp/đối soát | Hạn/xoá phiên Khách phải phối hợp vị trí chơi online/AI và dọn dữ liệu chat; T48 chỉ kiểm phần phiên cục bộ, T51 nghiệm thu toàn nhánh. |
| AC-01.3.13 | T35, T56, T18, T34, T37 | T51 | Tích hợp/đối soát | Hạn/xoá phiên Khách phải phối hợp vị trí chơi online/AI và dọn dữ liệu chat; T48 chỉ kiểm phần phiên cục bộ, T51 nghiệm thu toàn nhánh. |
| AC-01.3.14 | T35, T09 | T48 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.3.15 | T35, T44, T22, T26 | T48 | Task | T48 cần luồng link/mã T22/T26 để kiểm tự vào phòng sau tạo phiên Khách. Hồi quy tại T51. |

## US-01.4 · Phiên đăng nhập, hồ sơ và Đăng xuất

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-01.4.1 | T56 | T69 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.4.2 | T56, T65, T52, T23 | T69 | Task | T69 cần hết hạn phiên, ân hạn/nối lại và đồng hồ thật; không dùng mock T52 để kết luận toàn AC PASS. Hồi quy tại T51. |
| AC-01.4.3 | T56, T63 | T69 | Task | T69 cần giữ ván AI 30 phút T63; bao gồm đăng nhập lại cùng thiết bị. Hồi quy tại T51. |
| AC-01.4.4 | T56, T65, T20, T34 | T69 | Task | T69 kiểm cả online và AI trên hai thiết bị, kết quả ván và phiên cũ bị thu hồi. Hồi quy tại T51. |
| AC-01.4.5 | T56, T18, T65 | T69 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.4.6 | T56, T65, T18, T22, T34, T38, T61 | T69 | Task | T69 kiểm máy chủ từ chối và trạng thái nút trên mọi lối vào phòng/AI; cần T61 và T38 hoàn tất. Hồi quy tại T51. |
| AC-01.4.7 | T56, T65, T63 | T69 | Task | T69 kiểm banner trỏ đúng phòng online và ván AI được giữ; cần dữ liệu trạng thái thật. Hồi quy tại T51. |
| AC-01.4.8 | T56, T65, T32 | T69 | Task | T69 dùng xác nhận/đầu hàng T32; kiểm Đồng ý và Huỷ. Hồi quy tại T51. |
| AC-01.4.9 | T56, T18, T65 | T69 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.4.10 | T56, T65, T37 | T69 | Task | T56/T65 nhận cả API và giao diện cập nhật Display Name; tái sử dụng lọc từ cấm T37. Đây là phân bổ trong Task hiện có, không thêm yêu cầu BA. Hồi quy tại T51. |
| AC-01.4.11 | T56, T65, T37 | T69 | Task | T56/T65 nhận cả API và giao diện cập nhật Display Name; tái sử dụng lọc từ cấm T37. Đây là phân bổ trong Task hiện có, không thêm yêu cầu BA. Hồi quy tại T51. |
| AC-01.4.12 | T65 | T69 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.4.13 | T56, T65, T32, T18 | T69 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.4.14 | T35, T44, T40, T61, T65 | T69 | Task | T69 kiểm hạn chế Khách ở navbar, tab mời và hồ sơ sau khi các giao diện đều xong. Hồi quy tại T51. |
| AC-01.4.15 | T56, T31, T35 | T69 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.4.16 | T56, T22, T26 | T69 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-01.4.17 | T56, T65, T18, T22, T34, T38, T61 | T69 | Task | T69 kiểm máy chủ từ chối và trạng thái nút trên mọi lối vào phòng/AI; cần T61 và T38 hoàn tất. Hồi quy tại T51. |

## US-02.1 · Tạo phòng, ghế và bắt đầu ván

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-02.1.1 | T18, T21, T37 | T28 | Task | T28 kiểm form và API tên phòng, gồm bộ lọc từ cấm T37; phải có bộ lọc thật trước khi nghiệm thu nhánh từ cấm. Hồi quy tại T51. |
| AC-02.1.2 | T18, T21, T37 | T28 | Task | T28 kiểm form và API tên phòng, gồm bộ lọc từ cấm T37; phải có bộ lọc thật trước khi nghiệm thu nhánh từ cấm. Hồi quy tại T51. |
| AC-02.1.3 | T18, T21 | T28 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-02.1.4 | T18, T21 | T28 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-02.1.5 | T18 | T28 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-02.1.6 | T18, T21 | T28 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-02.1.7 | T18, T21 | T28 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-02.1.8 | T18, T21, T20, T23, T25 | T28 | Task | T28 chỉ PASS bắt đầu ván khi đã có tạo Match, chuyển màn và đồng hồ Đỏ T20/T23/T25. Hồi quy tại T51. |
| AC-02.1.9 | T18, T21, T52 | T51 | Tích hợp/đối soát | T28 kiểm huỷ đếm/reset sẵn sàng cục bộ; giữ ghế 60 giây và reconnect đúng phải có T52, nghiệm thu toàn AC tại T51. |
| AC-02.1.10 | T18 | T28 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-02.1.11 | T18, T21 | T28 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-02.1.12 | T18, T21, T52, T37 | T51 | Tích hợp/đối soát | Đóng phòng do mất ghế sau 60 giây và xoá chat cần T52/T37, không kết luận PASS đầy đủ tại T28 sớm. |
| AC-02.1.13 | T18, T21 | T28 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |

## US-02.2 · Xin đổi bên và ở lại phòng sau ván

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-02.2.1 | T41, T46 | T50 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-02.2.2 | T41, T46 | T50 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-02.2.3 | T41, T46 | T50 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-02.2.4 | T41, T46 | T50 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-02.2.5 | T41 | T50 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-02.2.6 | T41 | T50 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-02.2.7 | T41, T46 | T50 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-02.2.8 | T41, T46 | T50 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-02.2.9 | T41, T46, T37, T42, T53, T55 | T51 | Tích hợp/đối soát | Ở lại phải giữ chat hai kênh, người xem, chế độ phòng thật; T50 kiểm vòng đời cục bộ, T51 kiểm bảo toàn toàn bộ trạng thái. |
| AC-02.2.10 | T41, T46 | T50 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-02.2.11 | T41, T46, T18, T53 | T51 | Tích hợp/đối soát | Nhánh LOCKED vẫn khoá khi người chơi rời cần T53; T50 kiểm chuyển Host/rỗng ghế, T51 kiểm toàn AC. |
| AC-02.2.12 | T41 | T50 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-02.2.13 | T41, T46 | T50 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-02.2.14 | T41, T46 | T50 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |

## US-03.1 · Mời bằng link/mã và vào phòng

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-03.1.1 | T22, T26 | T29 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-03.1.2 | T22, T26 | T29 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-03.1.3 | T22, T26, T04, T08, T09, T15 | T29 | Task | T29 kiểm quay lại link mời sau đăng nhập/đăng ký email; đường Khách có AC-01.3.15 tại T48. Hồi quy tại T51. |
| AC-03.1.4 | T22, T26 | T29 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-03.1.5 | T22, T26 | T29 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-03.1.6 | T22, T26 | T29 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-03.1.7 | T22, T26 | T29 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |

## US-03.2 · Bạn bè và mời bạn online

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-03.2.1 | T31, T40, T35 | T49 | Task | T49 cần danh tính Khách để kiểm không hiện trong tìm username. Hồi quy tại T51. |
| AC-03.2.2 | T31, T40 | T49 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-03.2.3 | T31, T40 | T49 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-03.2.4 | T31 | T49 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-03.2.5 | T31 | T49 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-03.2.6 | T31 | T49 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-03.2.7 | T31 | T49 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-03.2.8 | T31 | T49 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-03.2.9 | T31, T40 | T49 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-03.2.10 | T31, T40 | T49 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-03.2.11 | T31, T18, T34 | T49 | Task | T49 cần vị trí phòng/ván thật để kiểm trạng thái Đang đấu, kể cả AI theo luật vị trí chơi. Hồi quy tại T51. |
| AC-03.2.12 | T31, T40 | T49 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-03.2.13 | T31, T40 | T49 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-03.2.14 | T31, T40 | T49 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-03.2.15 | T31, T40 | T49 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-03.2.16 | T31, T40, T56 | T49 | Task | T49 cần trạng thái Online/Offline/Đang đấu và vị trí chơi T56; sửa phụ thuộc Task kiểm thử, không kiểm bằng mock để PASS. Hồi quy tại T51. |
| AC-03.2.17 | T31, T40 | T49 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-03.2.18 | T31, T40 | T49 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-03.2.19 | T31, T40 | T49 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-03.2.20 | T31, T40, T53 | T49 | Task | T49 cần LOCKED/thu hồi lời mời T53 trước khi chạy AC này; không chỉ phụ thuộc T40. Hồi quy tại T51. |
| AC-03.2.21 | T31, T40, T56, T22 | T49 | Task | T49 cần một vị trí chơi T56 và vào phòng T22; nghiệm thu sau khi phụ thuộc đầy đủ. Hồi quy tại T51. |

## US-04.1 · Lõi luật cờ dùng chung

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-04.1.1 | T05, T07, T10 | T10 | Task | T10 xác minh nguồn perft trước khi dùng chuẩn; chạy perft trên lõi hoàn chỉnh. Hồi quy tại T51. |
| AC-04.1.2 | T05, T07 | T10 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-04.1.3 | T07 | T10 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-04.1.4 | T07 | T10 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-04.1.5 | T07 | T10 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-04.1.6 | T10 | T10 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-04.1.7 | T10 | T10 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-04.1.8 | T10 | T10 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-04.1.9 | T10 | T10 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-04.1.10 | T10 | T10 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-04.1.11 | T10 | T10 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |

## US-04.2 · Khởi tạo và hiển thị bàn cờ

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-04.2.1 | T11 | T16 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-04.2.2 | T11 | T16 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-04.2.3 | T11 | T16 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-04.2.4 | T11 | T16 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |

## US-04.3 · Đi cờ bằng click/kéo thả và âm thanh

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-04.3.1 | T19 | T27 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-04.3.2 | T19 | T27 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-04.3.3 | T19 | T27 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-04.3.4 | T19 | T27 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-04.3.5 | T19 | T27 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-04.3.6 | T19, T25, T22 | T27 | Task | T27 kiểm cả đối thủ/người xem và nước gần nhất ở nhiều client; cần phòng/ván/người xem thật T22/T25. Hồi quy tại T51. |
| AC-04.3.7 | T19, T25, T22 | T27 | Task | T27 kiểm cả đối thủ/người xem và nước gần nhất ở nhiều client; cần phòng/ván/người xem thật T22/T25. Hồi quy tại T51. |
| AC-04.3.8 | T19 | T27 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-04.3.9 | T19 | T27 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-04.3.10 | T19 | T27 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |

## US-05.1 · Ván online: đi cờ, đồng hồ và kết thúc ván

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-05.1.1 | T20, T25, T22, T66 | T66 | Tích hợp/đối soát | T30 kiểm nước đi đồng bộ chức năng; T66 đo p95 <100 ms theo NFR-01 với người chơi/người xem thật trên môi trường demo. Không kết luận đạt độ trễ chỉ từ E2E chức năng. Hồi quy chức năng tại T51. |
| AC-05.1.2 | T20 | T30 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-05.1.3 | T20 | T30 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-05.1.4 | T20 | T30 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-05.1.5 | T23, T25 | T30 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-05.1.6 | T23, T25 | T30 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-05.1.7 | T23, T25 | T30 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-05.1.8 | T23, T25 | T30 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-05.1.9 | T20 | T30 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-05.1.10 | T20, T25, T32, T52 | T51 | Tích hợp/đối soát | T30 kiểm các kết quả đã có trong lõi; toàn bộ lý do (đầu hàng/hoà/mất mạng/gián đoạn) cần T32/T52, T51 nghiệm thu đủ nhãn. |
| AC-05.1.11 | T25, T22 | T30 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-05.1.12 | T20 | T30 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-05.1.13 | T25, T22 | T30 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |

## US-05.2 · Đầu hàng và xin hoà

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-05.2.1 | T32, T36 | T39 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-05.2.2 | T32, T36 | T39 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-05.2.3 | T32, T18 | T39 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-05.2.4 | T32, T36 | T39 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-05.2.5 | T32, T36 | T39 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-05.2.6 | T32, T36 | T39 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-05.2.7 | T32, T36 | T39 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-05.2.8 | T32, T36 | T39 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-05.2.9 | T32, T20 | T39 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |

## US-05.3 · Mất kết nối và nối lại

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-05.3.1 | T52, T25 | T60 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-05.3.2 | T52, T25 | T60 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-05.3.3 | T52 | T60 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-05.3.4 | T52, T23 | T60 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-05.3.5 | T52 | T60 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-05.3.6 | T52 | T60 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |

## US-06.1 · Cài đặt phòng: PUBLIC / CODE_ONLY / LOCKED

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-06.1.1 | T53, T57 | T62 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.1.2 | T53, T57 | T62 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.1.3 | T53, T57, T31, T33 | T62 | Task | T62 cần thu hồi lời mời T31 và media T33 để chứng minh LOCKED không cắt hình/tiếng của người đang trong phòng. Hồi quy tại T51. |
| AC-06.1.4 | T53, T52, T55 | T62 | Task | T62 cần reconnect người chơi 60 giây và giữ chỗ xem 5 phút; phải có T52/T55 trước nghiệm thu. Hồi quy tại T51. |
| AC-06.1.5 | T53, T57 | T62 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.1.6 | T53, T57 | T62 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.1.7 | T53, T57 | T62 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |

## US-06.2 · Sảnh và danh sách phòng công khai

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-06.2.1 | T54, T61, T35 | T67 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.2.2 | T54, T61 | T67 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.2.3 | T54, T61 | T67 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.2.4 | T54, T61 | T67 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.2.5 | T54, T61 | T67 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.2.6 | T54, T61 | T67 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.2.7 | T54, T61 | T67 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.2.8 | T54, T61 | T67 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.2.9 | T54, T61 | T67 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.2.10 | T61, T18, T34, T38, T26 | T67 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.2.11 | T61 | T67 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.2.12 | T61, T40, T44, T65 | T67 | Task | T67 kiểm navbar bằng dữ liệu bạn bè, trạng thái Khách và menu hồ sơ thật; cần T40/T44/T65. Hồi quy tại T51. |
| AC-06.2.13 | T15, T61 | T67 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.2.14 | T35, T44, T22, T26, T54, T61, T34, T38 | T67 | Task | T67 kiểm đủ mọi lối vào của Khách với phòng/AI thật, gồm điều kiện sức chứa/quyền. Hồi quy tại T51. |
| AC-06.2.15 | T54, T61, T53, T57 | T67 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.2.16 | T54, T61, T53, T57 | T67 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |

## US-06.3 · Người xem và đuổi người xem

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-06.3.1 | T55, T58 | T64 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.3.2 | T55, T58 | T64 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.3.3 | T55, T58 | T64 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.3.4 | T55, T58 | T64 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.3.5 | T55, T58, T56 | T64 | Task | T64 cần một vị trí chơi T56 để kiểm lại quyền khi chấp nhận xuống ghế, ngoài nhánh ghế bị người khác lấy. Hồi quy tại T51. |
| AC-06.3.6 | T55, T58 | T64 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.3.7 | T55, T58 | T64 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.3.8 | T55, T58 | T64 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.3.9 | T55, T52 | T64 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.3.10 | T55, T58 | T64 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.3.11 | T55, T58 | T64 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-06.3.12 | T55, T58, T33 | T64 | Task | T64 đo thu hồi media khi kick, liên kết bằng chứng GATE-MEDIA; không tự thêm ngưỡng số khi BA không chốt. Hồi quy tại T51. |
| AC-06.3.13 | T55, T22, T31, T54, T53 | T64 | Task | T64 kiểm chặn bằng mã/link mới, lời mời và Sảnh; cần cả T31/T53/T54, không chỉ API kick. Hồi quy tại T51. |
| AC-06.3.14 | T55, T22, T31, T54, T53 | T64 | Task | T64 kiểm chặn bằng mã/link mới, lời mời và Sảnh; cần cả T31/T53/T54, không chỉ API kick. Hồi quy tại T51. |

## US-07.1 · Hai kênh chat và bộ lọc

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-07.1.1 | T37, T42 | T47 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-07.1.2 | T37, T42 | T47 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-07.1.3 | T37, T42 | T47 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-07.1.4 | T37, T42, T55, T58 | T51 | Tích hợp/đối soát | T47 kiểm phân quyền/mốc cặp ở mức module; đổi vai B xuống xem/C lên ghế thật cần T55/T58, toàn nhánh tại T51. |
| AC-07.1.5 | T37 | T47 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-07.1.6 | T37, T42, T41, T46 | T47 | Task | T47 cần đổi bên/ở lại/ván tiếp T41/T46 để kiểm chat cặp được giữ; không chỉ kiểm bằng fixture. Hồi quy tại T51. |
| AC-07.1.7 | T37 | T47 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-07.1.8 | T37, T42 | T47 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-07.1.9 | T37 | T47 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-07.1.10 | T37 | T47 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-07.1.11 | T37, T42 | T47 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-07.1.12 | T37, T42 | T47 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-07.1.13 | T37 | T47 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-07.1.14 | T37, T42, T18, T21, T20, T25 | T47 | Task | T47 kiểm chat trước và sau chuyển WAITING→PLAYING trên phòng thật. Hồi quy tại T51. |

## US-07.2 · Camera, mic và mức chia sẻ

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-07.2.1 | T33, T58 | T45 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-07.2.2 | T33, T58 | T45 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-07.2.3 | T33, T58 | T45 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-07.2.4 | T33, T12, T58 | T45 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-07.2.5 | T33 | T45 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-07.2.6 | T33, T55, T58, T18 | T51 | Tích hợp/đối soát | T45 kiểm rời phòng; thu hồi phát khi chuyển ghế→xem cần T55/T58, nghiệm thu toàn AC ở T51. |
| AC-07.2.7 | T33, T58 | T45 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-07.2.8 | T33, T58 | T45 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-07.2.9 | T33, T58 | T45 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-07.2.10 | T33, T58 | T45 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-07.2.11 | T33, T58 | T45 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-07.2.12 | T33, T18, T21, T20, T25, T58 | T45 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-07.2.13 | T33, T37, T42, T20, T23, T58 | T45 | Task | T45 chỉ PASS khi chat và ván/đồng hồ thật tiếp tục qua lỗi dịch vụ media; cần T37/T42. Hồi quy tại T51. |

## US-08.1 · Thiết lập và chơi ván với máy

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-08.1.1 | T34, T38 | T43 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-08.1.2 | T34, T38, T24, T11 | T43 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-08.1.3 | T34, T38, T24, T11 | T43 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-08.1.4 | T34 | T43 | Task | T43 kiểm phép bốc phe phía máy chủ; ghi rõ số lần thử/seed và dung sai trước khi đo, không tự đổi yêu cầu xấp xỉ 50/50. Hồi quy tại T51. |
| AC-08.1.5 | T34, T38 | T43 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-08.1.6 | T34, T38 | T43 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-08.1.7 | T34, T38 | T43 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |

## US-08.2 · Máy cờ ba cấp độ

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-08.2.1 | T24 | T24 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-08.2.2 | T24 | T24 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-08.2.3 | T24, T20, T23, T25 | T66 | Tích hợp/đối soát | T24 kiểm tiến trình tách riêng; T66 đo ảnh hưởng dưới tải online và AI đồng thời, đối chiếu NFR có sẵn, không tự thêm ngưỡng. Hồi quy tại T51. |

## US-08.3 · Ổn định ván với máy và hoàn thiện cấp Khó

| AC | Task triển khai/đầu vào | Nghiệm thu tại | Mức | Ghi chú |
|---|---|---|---|---|
| AC-08.3.1 | T63, T38, T65 | T68 | Task | T68 kiểm quay lại URL lẫn banner Sảnh; cần FE banner T65. Hồi quy tại T51. |
| AC-08.3.2 | T63 | T68 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-08.3.3 | T59, T63, T38 | T68 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-08.3.4 | T59, T63, T38 | T68 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-08.3.5 | T59, T63 | T68 | Task | Nghiệm thu cục bộ tại Task được chỉ định; hồi quy lại tại T51 sau khi toàn bộ tính năng hoàn tất. Không phải bằng chứng TC đã viết hoặc đã PASS. |
| AC-08.3.6 | T63, T34, T38, T56, T65 | T68 | Task | T68 kiểm rời ván/đăng xuất, huỷ worker và giải phóng vị trí; cần đăng xuất T56/T65. Hồi quy tại T51. |
| AC-08.3.7 | T59, T24 | T68 | Task | T68 xác minh báo cáo GATE-ENGINE, bộ thế có đáp án và đấu cặp cấp; T66 audit bằng chứng, không tự hạ ngưỡng BA. Hồi quy tại T51. |
| AC-08.3.8 | T59, T24, T02 | T68 | Task | T68 xác minh báo cáo GATE-ENGINE, bộ thế có đáp án và đấu cặp cấp; T66 audit bằng chứng, không tự hạ ngưỡng BA. Hồi quy tại T51. |
| AC-08.3.9 | T59, T24 | T68 | Task | T68 xác minh báo cáo GATE-ENGINE, bộ thế có đáp án và đấu cặp cấp; T66 audit bằng chứng, không tự hạ ngưỡng BA. Hồi quy tại T51. |
