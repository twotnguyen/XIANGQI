# RÀ SOÁT KẾ HOẠCH TRIỂN KHAI — 2026-09-22

**Phạm vi:** cụ thể hoá bộ138 issue hiện có để giao cho agent triển khai toàn bộ sản phẩm đã thống nhất. Đây là kiểm tra tài liệu và kế hoạch test, **không phải nghiệm thu ứng dụng**. Mọi issue vẫn TODO.

## Kết quả bàn giao

- 138 file ISSUE giữ ID/phạm vi, bổ sung hợp đồng giao nhận, đường dẫn file/test, fixture và hành động/assertion, đoạn mã trọng tâm, lệnh chạy, RED→GREEN→thử phá invariant, điều kiện dừng và nội dung bàn giao.
- 333 AC chức năng/phiên được phân công owner tại [AC-COVERAGE](AC-COVERAGE.md), có liên kết ngược từ issue. Test T/TS, GR, R15/R16 và các cổng quyền/hiệu năng vẫn bắt buộc ngoài333 AC.
- [AGENT-START-HERE](AGENT-START-HERE.md) là điểm vào và chứa prompt giao việc. [EXECUTION-ORDER](EXECUTION-ORDER.md) cho thứ tự hợp lệ theo dependency; [INDEX](INDEX.md) là nơi theo dõi tiến độ.
- [TEST-CONVENTIONS](TEST-CONVENTIONS.md) thống nhất runner, clock, fixture DB/Auth, race, SFU và báo cáo. [TEST-REPORT-TEMPLATE](TEST-REPORT-TEMPLATE.md) yêu cầu số đo thật, không điền sẵn PASS.

## Những điểm đã sửa khi lập kế hoạch

| Phát hiện | Cách xử lý |
|---|---|
| Issue sớm yêu cầu capability chưa được xây, có nguy cơ dùng mock để báo đạt | Nối dependency khi không gây vòng; nếu là nền tảng, chỉ kiểm invariant trong scope và chỉ rõ issue tích hợp bắt buộc ở EXECUTION-ORDER |
| Create/ready cần chat context trước nhóm chat; consume/revoke lời mời cần schema trước API lời mời | Tạo storage/context trong nhóm schema và transaction tạo phòng, để API/transport ở nhóm chức năng tương ứng |
| Test chính xác nhưng thiếu fixture/clock/barrier dùng chung | ISSUE003 quy định clock;034 runner DB tối thiểu;044 harness Auth/PostgreSQL thật, cleanup theo run và barrier trước điểm tranh khoá |
| Alpha-beta có ghi chú cũ cho phép số node tăng từng thế | Đồng bộ với BR-AI-26/ai-validation: từng thế không tăng, tổng giảm; vẫn báo mọi số đo và ngoại lệ thất bại |
| Một số yêu cầu còn chặn thao tác ván theo tab giữ media | Đồng bộ REQ-GAME-ACTIONS/REQ-MATCH với DEC-020/041: mọi tab PLAYER có phiên hợp lệ được thao tác; media owner là phạm vi riêng |
| Media xử lý vô hạn hoặc cam kết dừng phần cứng dù client không ACK | Đồng bộ REQ-MEDIA/REQ-DISCONNECT với contract đã chốt:30 giây lỗi/retry; chứng minh SFU revoke, không cam kết tắt hardware khi không có ACK |
| Test tải ghi “bộ nhớ ổn định/event-loop trong ngưỡng” nhưng không có ngưỡng riêng | ISSUE135 quy định lượt đo, mẫu thô, cleanup/retainer và đối chứng âm; giữ nguyên ngân sách lệnh, không tự thêm hoặc hạ ngưỡng MB/event-loop |
| Chỉ đối chiếu19 nhóm có thể bỏ sót AC nhỏ | Phân công từng333 AC;136 thu bằng chứng local,053/137 thu external;138 bàn giao local sớm không làm toàn dự án hoàn thành |

Các điều chỉnh trên làm rõ phân công kỹ thuật hoặc đồng bộ quyết định đã có; không thêm feature, không hạ ngưỡng. Báo cáo BA trong08 và tài liệu99-archive được giữ nguyên như snapshot lịch sử. Không dùng kết quả runtime của phiên bản cũ làm bằng chứng cho ứng dụng chưa xây.

## Kiểm chứng bộ tài liệu

Lệnh kiểm tra cấu trúc kế hoạch có thể chạy lại từ root:

```bash
node site/check-issues.mjs
node --check site/build.mjs
node --check site/assets/app.js
node site/build.mjs
```

[plan-verification.json](plan-verification.json) ghi kết quả của lần kiểm cuối: số issue/dependency, đối chiếu INDEX, phân công AC, liên kết, trạng thái TODO, bản web và bảo toàn lịch sử. Kiểm tự động chỉ chứng minh các thuộc tính đã liệt kê, không chứng minh mọi snippet sẽ biên dịch hay ứng dụng đã đúng.

## Giới hạn và bước tiếp theo

Chưa có mã ứng dụng nên chưa chạy unit/integration/e2e/media/load hoặc benchmark của sản phẩm. Các file test/lệnh/snippet trong issue là công việc agent cần tạo, đối chiếu API dependency thực rồi chạy. Ngưỡng hiệu năng, chất lượng AI, RLS, chống race và media đều cần bằng chứng thật khi thực thi.

Hiện không cần hỏi lại lựa chọn sản phẩm đã chốt. Người triển khai cần xác định Git remote/quyền PR trước thao tác Git; chuẩn bị dịch vụ/thiết bị theo [EXTERNAL-SETUP](EXTERNAL-SETUP.md) ở mốc cần dùng. Thiếu external không biến thành PASS và không ngăn làm issue local đủ dependency.
