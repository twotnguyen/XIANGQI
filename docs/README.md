# Bộ tài liệu triển khai cờ tướng

**Bắt đầu tại [START-HERE](handoff/START-HERE.md).** Bộ này dành cho task mới/model5.6 sol triển khai toàn bộ mà không cần lịch sử trò chuyện.

## Nội dung và quyền ưu tiên

1. [Product đã chốt](specs/01-PRODUCT.md): yêu cầu người dùng và chi tiết agent đã được phép quyết định.
2. [Architecture](specs/02-ARCHITECTURE.md): stack/cấu trúc/runtime/deploy.
3. [State machines](specs/03-STATE-MACHINES.md): game/clock/undo/restart.
4. [Contracts](specs/04-CONTRACTS.md): types/schema/API/events/DB.
5. [Auth](specs/05-AUTH.md), [Media](specs/06-MEDIA.md), [UI và tests](specs/07-UI-AND-TESTS.md): hợp đồng chuyên biệt.
6. [Kế hoạch kiểm thử](specs/08-TEST-EXECUTION.md) và [mẫu evidence](handoff/EVIDENCE-TEMPLATE.md): harness, case theo từng issue, gate đóng việc.
7. [32 issue](issues/README.md): các bước thực thi theo dependency.
8. [PROGRESS](handoff/PROGRESS.md), [truy vết yêu cầu](TRACEABILITY.md), [readiness](READINESS.md): theo dõi và kiểm tra.
9. [Git/GitHub workflow](handoff/GIT-WORKFLOW.md): tự tạo nhánh, commit, PR, review và squash merge theo ủy quyền.
10. [Đầu vào external](handoff/EXTERNAL-INPUTS.md): credentials/thiết bị cần ở mốc tương ứng.

Khi nội dung chuyên biệt và tóm tắt có khác nhau, hợp đồng chuyên biệt ưu tiên cho phần đó; sửa đồng thời bản tóm tắt trước coding tiếp. Yêu cầu mới trực tiếp từ người dùng luôn ưu tiên, ghi lại quyết định và cập nhật issue liên quan.

[Nhật ký](planning/PHONG_VAN_YEU_CAU.md) và các RESEARCH là lịch sử/nguồn, không phải bổ sung tính năng. [Bản phân tích ban đầu](../DU_AN_CO_TUONG_ONLINE.md) đã bị thay thế ở các điểm như AI engine,2viewers,media chỉ hai người và auth tự viết.

## Phạm vi đã chốt

Website tiếng Việt cho desktop/điện thoại, bàn gỗ/quân Hán; Supabase Auth+PostgreSQL; username/password+email verified/recovery+Google; bạn bè/mời/link/mã;2players+5viewers;3 chế độ phòng;2 chat riêng; camera/mic độc lập3 mức chia sẻ; AI tự viết3 cấp; luật giản lược; đồng hồ; reconnect; undo/draw/resign; replay/rematch.

Không recording, Elo, giải đấu, thanh toán hoặc app native. Hoàn thành local trước, sau đó deploy/test Internet bằng tài nguyên được cấp. AI là nội dung học thuật phải có số đo, không thay bằng engine sẵn.

## Trạng thái

Bộ tài liệu sẵn sàng để bắt đầu sau kiểm tra trong READINESS. Chưa có mã ứng dụng, chưa chạy unit/integration/E2E sản phẩm. Mọi issue TODO là việc cần thực hiện, không phải hạng mục đã hoàn thành. Online/provider smoke có thể cần cấu hình tài khoản ngoài; không ngăn bắt đầu local.
