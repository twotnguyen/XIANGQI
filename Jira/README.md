# KẾ HOẠCH JIRA — CỜ TƯỚNG ONLINE (bản làm lại v2)

**Dự án Jira:** `XW` · **Thời gian:** 4 tuần, 4 sprint (28/09 – 23/10/2026) · **Trạng thái:** bản nháp để duyệt, **chưa** tạo trên Jira.

## Mục lục

| File | Nội dung |
|---|---|
| [00-CAU-HINH-JIRA.md](00-CAU-HINH-JIRA.md) | Các trường Jira (đã kiểm bằng MCP), phân cấp Epic → Story → Sub-task, component, quy ước tên, nhãn, sprint, liên kết, story points, mẫu mô tả |
| [01-KE-HOACH-4-TUAN.md](01-KE-HOACH-4-TUAN.md) | Mục tiêu sprint, Story theo sprint, giờ theo vai trò, gợi ý phân công, đường găng, phụ thuộc đã điều chỉnh, rủi ro |
| [02-AUDIT-138-ISSUE.md](02-AUDIT-138-ISSUE.md) | Kiểm tra 138 issue trong `docs/10-issues/`: issue nào gộp nhiều vai trò và được tách thành Task nào |
| [03-TRUY-VET.md](03-TRUY-VET.md) | Bảng Epic → Story → Task ↔ issue đặc tả, có cột Key Jira để điền khi tạo |
| [04-HUONG-DAN-KIEM-THU.md](04-HUONG-DAN-KIEM-THU.md) | **Sổ tay Tester** (đọc 1 lần): dựng môi trường, bộ tài khoản test, mở nhiều người chơi, gửi lệnh giả mạo bằng `qa`/`qsock`, xem DB, chạy test, đồng hồ giả, ghi bằng chứng, tạo Bug |
| [05-TU-DIEN-KY-THUAT.md](05-TU-DIEN-KY-THUAT.md) | **Từ điển kỹ thuật cho sinh viên**: transaction, khoá dòng, race condition, idempotency, cursor, IDOR… — nghĩa, ví dụ trong dự án, làm sai thì sao |
| [tools/](tools/) | `qa.sh` (gửi lệnh HTTP bằng lệnh ngắn) và `sock.mjs` (gửi sự kiện Socket.IO) cho Tester |
| [epic/](epic/) | 16 file, mỗi file **một Epic**: trường Jira, mục tiêu, luật chung của Epic, danh sách Story (có link), tiêu chí hoàn thành |
| [story/](story/) | 55 file, mỗi file **một Story**: trường Jira, câu chuyện, tiêu chí chấp nhận, bảng thứ tự Task (có link) |
| [task/](task/) | 135 file, mỗi file **một Task (Sub-task)**: trường Jira, việc cần làm, bẫy, mục 🧪 kiểm thử khi Ready for Test |
| components.md | File cũ, giữ nguyên, không dùng cho bản này |

## Con số chính

- **16 Epic · 55 Story · 135 Task** (Task = Sub-task trên Jira, Parent là Story)
- Task theo vai trò: Backend 57 · Frontend 28 · AI 11 · Design 8 · DevOps 11 · Tester 20 (kiểm thử tích hợp nhiều Task / toàn hệ thống)
- Mọi Task phát triển/thiết kế có sẵn mục **🧪 Kiểm thử khi Ready for Test** để Tester kiểm khi Task được kéo sang `Ready For Test`
- Tổng ước lượng 871 giờ: Sprint 1 150.5h · Sprint 2 170h · Sprint 3 256h · Sprint 4 294.5h

## Cách đặt tên file

`<mã>-<tên-không-dấu>.md`, ví dụ `task/TK10.3.1-lenh-di-nuoc-version-su-kien-cay-nuoc-di-va-nhanh-hieu-luc.md`. Trong mỗi thư mục, sắp theo tên file là đúng thứ tự mã. Đầu mỗi file có dòng điều hướng tới Epic/Story cha và các con. Mã trong các trường Parent, Is blocked by, Blocks đều là link tới file tương ứng.

## Ký hiệu trong Task

- ⏱ thời gian đọc lần đầu · ⭐ ca kiểm thử quan trọng (FAIL = Bug Highest) · 🟡 chi tiết **đề xuất** (đặc tả gốc không quy định cụ thể — Dev được đổi nhưng phải sửa lại Task và báo Tester).
- Mỗi Task phát triển có mục **"Kẹt thì làm gì"**: hỏi ai, xem Task nào, hỏi AI thế nào.

## Cách đọc một Task

Tên dạng `[BE] TK10.3.1 · …` — tiền tố là vai trò, mỗi Task chỉ **một** vai trò (một component). Trong Task có:
1. **Bảng trường Jira**: Issue Type, Parent, Component, Priority, Labels, Fix versions, Start/Due (Due = ngày dự kiến Done), Ready for Test (dự kiến), Original Estimate (giờ làm), Kiểm thử (giờ Tester), Is blocked by, Blocks.
2. **Việc cần làm**: file/module, hàm, quy tắc nghiệp vụ ghi thẳng trong Task.
3. **Bẫy**: lỗi dễ gặp ở đúng chỗ đó.
4. **🧪 Kiểm thử khi Ready for Test**: ca kiểm thử (bước, kết quả mong đợi), tiêu chí PASS, bằng chứng, xử lý khi FAIL. Task `[QA]` tích hợp thì toàn bộ nội dung là ca kiểm thử.

Trong "Is blocked by": mã có hậu tố **(Done)** là phải chờ Task đó Done. Mã không có hậu tố thì chỉ cần Task đó tới `Ready For Test`.

## Luồng trạng thái trên board

`To Do → Ready For Dev → In Progress → Ready For Test → Done`. Người làm kéo Task sang **Ready For Test** khi PR đã review, CI xanh và đã merge `main`. Tester kiểm, PASS thì kéo sang **Done**; FAIL thì tạo Bug và kéo Task về **In Progress**. Chi tiết ở [00-CAU-HINH-JIRA.md §10](00-CAU-HINH-JIRA.md).

## Các quy tắc đã đảm bảo (kiểm bằng script)

- Mỗi Task phát triển/thiết kế có mục 🧪 kiểm thử và giờ kiểm; mỗi Task đúng một component khớp tiền tố vai trò.
- Liên kết `Blocks` hai chiều khớp nhau. Task chỉ bắt đầu sau khi Task chặn tới `Ready For Test`, hoặc tới `Done` nếu có ghi `(Done)`.
- Mọi Task (kể cả thời gian kiểm thử) nằm trong cửa sổ sprint của Story; Done muộn nhất 23/10/2026.
- Story Points tính từ tổng giờ làm + giờ kiểm của các Task (thang Fibonacci, xem 00-CAU-HINH-JIRA.md).

## Thứ tự đưa lên Jira (sau khi duyệt)

1. Tạo Sprint 2, 3, 4 trên board (Sprint 1 đã có), đặt ngày theo 01-KE-HOACH §3. Tạo 4 Fix version `v0.1.0`, `v0.2.0`, `v0.3.0`, `v1.0.0` (sửa ngày `v1.0.0` đang có) theo [00-CAU-HINH-JIRA.md §6.1](00-CAU-HINH-JIRA.md).
2. Tạo 16 Epic → 55 Story → 135 Sub-task theo thứ tự trong 03-TRUY-VET.md, ghi Key vào bảng.
3. Tạo liên kết `Blocks` theo trường "Blocks" trong từng Task/Story.
4. Điền Story Points và Original Estimate (hai trường này không có trên màn tạo, phải sửa sau khi tạo). Ghi dòng `Chờ Done: XW-…` trong Description của các Task có phụ thuộc `(Done)`.
5. Gán Story vào sprint; gán người theo 01-KE-HOACH §5.
