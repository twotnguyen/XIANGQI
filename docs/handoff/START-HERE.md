# Bắt đầu thực thi với model 5.6 sol

Bộ issue đã chốt sản phẩm qua phỏng vấn. Task mới dùng cùng thư mục XIANGQI; không cần đọc lại cuộc trò chuyện. Công việc task hiện tại chỉ tạo tài liệu, ứng dụng chưa được triển khai.

## Thứ tự đọc

1. [README tài liệu](../README.md): phạm vi và nguồn nào có quyền quyết định.
2. [Product](../specs/01-PRODUCT.md), [Architecture](../specs/02-ARCHITECTURE.md).
3. [PROGRESS](PROGRESS.md): trạng thái issue và công việc đang dở.
4. [Mục lục issue](../issues/README.md): chọn issue tiếp theo mà mọi dependency đã qua gate cần thiết (DONE hoặc LOCAL_DONE cho phần local).
5. Đọc [Git/GitHub workflow](GIT-WORKFLOW.md) trước tạo nhánh/commit/PR; người dùng đã ủy quyền tự review và merge khi gate đạt.
6. Đọc [kế hoạch kiểm thử](../specs/08-TEST-EXECUTION.md), phần harness/gate và hàng của issue đang làm; dùng [mẫu evidence](EVIDENCE-TEMPLATE.md).
7. Chỉ đọc spec chuyên biệt được issue trỏ tới và evidence dependencies. Auth đọc 05, game đọc03/04, media đọc06, UI/benchmark đọc07.

Nếu là lần bắt đầu đầu tiên, làm ISSUE-001, sau đó ưu tiên ISSUE-002 và006 để thử media ISSUE-024 sớm. Có thể đi theo số thứ tự nếu chỉ thực thi tuần tự; không nhảy qua dependencies.

## Vòng thực thi từng issue

1. Đối chiếu code thực tế, instructions AGENTS và evidence; code có thể được viết ở task trước. Không ghi đè công việc chưa commit của người khác.
2. Đánh dấu IN_PROGRESS trong issue và PROGRESS; ghi mục tiêu ngắn. Chỉ một người sở hữu cùng issue/file tại một thời điểm.
3. Triển khai đúng đầu vào/đầu ra. Dùng unit/integration test trước sửa logic, E2E/visual cho UI. Test snippet issue mô tả assertion; định nghĩa helper thật, không để hàm minh họa không tồn tại.
4. Chạy đúng các case acceptance và lệnh, sửa failure. Không tự đổi yêu cầu hoặc hạ chỉ tiêu để test pass.
5. Ghi `docs/test-reports/ISSUE-NNN.md` gồm lệnh/exit/count/environment/paths/limitations. Cập nhật issue DONE chỉ sau bằng chứng đủ. PROGRESS luôn đồng bộ.
6. Tạo/cập nhật PR, review và squash merge theo GIT-WORKFLOW; ghi branch/PR trong PROGRESS.
7. Tiếp tục issue tiếp theo có dependency local đã qua và PR đã merge cho đến khi toàn bộ hoàn thành hoặc cần đầu vào bên ngoài. Đừng dừng sau skeleton/MVP và nói toàn bộ xong.

Trạng thái: TODO, IN_PROGRESS, LOCAL_DONE, DONE, BLOCKED_EXTERNAL. LOCAL_DONE nghĩa implementation và automated/local acceptance đã qua, chỉ còn kiểm tra provider/thiết bị được liệt kê riêng. Consumer local được bắt đầu khi dependency LOCAL_DONE nếu không cần chính gate external đang thiếu; gate online/final vẫn đợi DONE. Ghi rõ evidence local và external pending để không nhầm với hoàn thành toàn bộ. BLOCKED_EXTERNAL phải có nguyên nhân cụ thể, công việc local đã xong và đầu vào người dùng cần cấp. Có thể tiếp tục các issue độc lập khác. Không coi external mock pass là actual provider smoke.

## Quyền quyết định

Được tự quyết file organization bên trong module, helper nhỏ, exact dependency patch sau compatibility check, sửa lỗi và test. Chốt product/API/clock/media theo spec; thay đổi lớn cập nhật decision log và consumer tests, hỏi nếu đổi phạm vi, phát sinh chi phí hoặc thay quyền riêng tư. Không mua dịch vụ hoặc công bố secret. Không cần hỏi lại từng issue khi đã có yêu cầu triển khai toàn bộ.

Ứng dụng dùng AI tự viết; không thay bằng engine cờ có sẵn để tiết kiệm thời gian. Camera/mic live không có recording. 5 viewers, không phải2. Không dựng một auth password store riêng cạnh Supabase Auth. Không dựa ẩn UI để phân quyền.

## Tiếp tục khi hết context/đổi task

Trước khi dừng ghi vào PROGRESS: issue đang làm, files changed, lệnh cuối/kết quả, blocker, bước tiếp theo có đường dẫn và lệnh. Task mới đọc PROGRESS và evidence, kiểm tra code rồi tiếp tục; không chạy lại interview hoặc tạo plan mới trùng.

Không cần đổi model tự động; người dùng tự chọn 5.6 sol. Nếu có parallel workers, chia ownership rõ trong cùng nhánh issue; chỉ coordinator sửa PROGRESS và thao tác Git/PR. Tích hợp các issue tuần tự để tránh nhiều nhánh cùng sửa registry; concurrency không thay dependency. Tránh delegate issue UI và service cùng sửa contract chưa chốt.

## Git và hoàn tất

Repository đã có tại `twotnguyen/XIANGQI`, nhánh main. Người dùng đã ủy quyền **tự tạo nhánh → commit → push → tạo PR → review → squash merge khi kiểm tra đạt**. Quy tắc đầy đủ, đặt tên và gate nằm trong [GIT-WORKFLOW](GIT-WORKFLOW.md). Không cần hỏi lại mỗi PR; conflict vẫn phải dừng xin quyết định. Trạng thái DONE là kỹ thuật; phải kiểm PR đã MERGED trước dùng làm dependency.

Phân biệt các nhãn: **PLAN_READY** chỉ bộ tài liệu; **LOCAL_COMPLETE** sản phẩm đã qua local acceptance; **PROJECT_COMPLETE** đủ cả required local/provider/online evidence. Chưa có credentials cloud không ngăn plan-ready nhưng không được ghi project-complete.

## Prompt để dán vào task mới

```text
Hãy triển khai toàn bộ dự án cờ tướng trong thư mục XIANGQI theo docs/README.md và docs/handoff/START-HERE.md.

Đọc docs/handoff/PROGRESS.md, chọn issue đủ dependency từ docs/issues/README.md, thực hiện lần lượt đến khi hoàn thành. Dùng docs/specs làm nguồn yêu cầu chính thức, không dùng các giả định cũ trong DU_AN_CO_TUONG_ONLINE.md.

Áp dụng docs/specs/08-TEST-EXECUTION.md: mỗi case TNNN-xx và acceptance riêng phải có test/evidence theo docs/handoff/EVIDENCE-TEMPLATE.md. Không coi test discovery rỗng, skipped required test hoặc mock provider là pass.

Mỗi issue phải có implementation thật, các test/tiêu chí nghiệm thu tương ứng và bằng chứng trong docs/test-reports/ISSUE-NNN.md. Cập nhật trạng thái issue và PROGRESS để task sau tiếp tục được. Nếu thiếu credential/provider, hoàn thành phần local và các issue độc lập, ghi rõ phần BLOCKED_EXTERNAL và chỉ hỏi đúng đầu vào còn thiếu. Không đánh dấu hoàn thành bằng mock hoặc tự cắt phạm vi. Không mua dịch vụ trả phí.

Tuân thủ docs/handoff/GIT-WORKFLOW.md: mỗi issue một PR triển khai chính (có PR verify/fix bổ sung khi cần), tự commit, push, review và squash merge khi kiểm tra đạt; sau merge đồng bộ main rồi tiếp tục. Luôn fetch trước push, không tự giải quyết conflict và không thêm co-author AI. Ghi branch/PR vào PROGRESS; chỉ dùng dependency đã merge.

Bắt đầu từ issue tiếp theo chưa hoàn thành; nếu chưa có code, bắt đầu ISSUE-001. Không phỏng vấn lại những quyết định đã chốt.
```
