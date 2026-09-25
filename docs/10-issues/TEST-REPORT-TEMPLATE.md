# MẪU BÁO CÁO MỘT ISSUE

Đây là biểu mẫu để sao chép vào `docs/test-reports/ISSUE-NNN.md` lúc thực thi. Các ô CHƯA_CHẠY là chỗ nhập bằng chứng thật, không được giữ nguyên khi đề nghị PASS. Không phải báo cáo test đã chạy của kho đặc tả.

## Định danh

| Trường | Giá trị cần ghi |
|---|---|
| Issue / nhánh / PR |ID được giao, nhánh thực tế, URL PR |
| Commit kiểm thử |SHA đúng bản code tạo artifact |
| Trạng thái |IN_PROGRESS / BLOCKED / BLOCKED_EXTERNAL / DONE sau merge |
| Môi trường |OS/CPU/RAM, Node/pnpm/DB/browser/SFU versions thực, profile local/Internet |
| Dependency |ID, PR merge và commit được sử dụng |
| Phạm vi |Hành vi đã test; deferred gate nào chưa thuộc scope |

## Lệnh và kết quả

| Lệnh thực tế | Exit | Pass | Fail | Skip | Log / artifact |
|---|---|---|---|---|---|
| CHƯA_CHẠY |CHƯA_CHẠY|CHƯA_CHẠY|CHƯA_CHẠY|CHƯA_CHẠY|CHƯA_CHẠY|

Ghi đầy đủ cổng bootstrap/bốn cổng và lane có hiệu lực. Đường dẫn/URL artifact phải mở được và không chứa token/password/connection string. Không chỉ dán screenshot chữ xanh.

## Đối chiếu PASS và AC

| Ô checklist / AC | Test ID và file | Môi trường | Assert / số đo | Kết quả | Bằng chứng |
|---|---|---|---|---|---|
| CHƯA_CHẠY |CHƯA_CHẠY|CHƯA_CHẠY|CHƯA_CHẠY|CHƯA_CHẠY|CHƯA_CHẠY|

Sao chép từng ô PASS từ issue, các AC được phân công ở AC-COVERAGE. Một AC nhiều phần cần đủ mọi phần. Thiếu external giữ CHỜ, không tự tách thành PASS toàn bộ.

## Test âm và mutation

Ghi mutation cụ thể, test nào đỏ, assert nào bắt lỗi, log lần đỏ và lần xanh sau khôi phục. Với thiếu dịch vụ/sai đường dẫn, ghi EXPECTED_FAILURE và exit thực; không dùng lỗi setup để nhận đã chứng minh luật nghiệp vụ.

## Bằng chứng chuyên biệt

- DB/race: runId, hai backendPID, barrier point, row/event/receipt trước–sau, cleanup đúng run.
- UI: route, vai trò, kích thước/browser, state, trace/ảnh liên quan.
- Media: operation/epoch/generation, mốc revoke, samples/RTP/frame và đối chứng dương; không log token.
- AI/load: fixture hash/seed, tất cả mẫu, công thức percentile và hardware, lỗi/timeouts không bị loại.

Chỉ điền loại liên quan; loại không liên quan ghi N/A kèm lý do, không tạo bằng chứng giả.

## Bàn giao

Contract/path được cung cấp hoặc thay đổi; cách khởi động/cấu hình; migration đã chạy; issue tiếp theo được mở khoá; deferred gate và giới hạn còn lại. Chỉ cập nhật DONE khi checklist đạt,0skip,PR đã merge và INDEX khớp. Người review ghi điều kiện chưa đạt trước khi merge, không tick thay người thực thi.
