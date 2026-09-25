# FLOW-FRIENDS — HỒ SƠ, TÌM KIẾM VÀ BẠN BÈ

**Yêu cầu:** [REQ-PROFILE-FRIENDS](../01-requirements/REQ-PROFILE-FRIENDS.md) (R02). Luồng này diễn giải BR-FRD, không thêm chức năng nhắn riêng ngoài phòng.

## 1. Tìm và kết bạn

Đăng nhập/hoàn tất onboarding → SCR-FRIENDS → SCR-USER-SEARCH. Dưới 3 ký tự chỉ hướng dẫn; đủ 3 ký tự tìm prefix username không phân biệt hoa thường, tối đa 20 kết quả, không email. Không khớp thì gõ lại; lỗi mạng thì thử lại.

Chọn người chưa có quan hệ → gửi lời mời → tab Đã gửi của A và Lời mời nhận của B. B chấp nhận → cả hai thấy quan hệ bạn bè; B từ chối hoặc A huỷ → không còn lời mời. Nếu đã có lời mời ngược, hiện lời mời để chấp nhận rõ ràng, không tự kết bạn. Hai yêu cầu đồng thời chỉ tạo một quan hệ.

## 2. Quan hệ và lời mời phòng

Danh sách bạn bè chỉ hiện online/offline, không hiện đang ở phòng nào. Một tab còn kết nối hợp lệ thì tài khoản vẫn online. Huỷ kết bạn cập nhật hai chiều; đang cùng phòng vẫn giữ membership phòng. Muốn kết bạn lại phải gửi lời mời mới.

Nút mời chơi mở [FLOW-JOIN-ROOM](FLOW-JOIN-ROOM.md) và hộp mời theo [REQ-INVITE](../01-requirements/REQ-INVITE.md). Chỉ quan hệ bạn bè được mời trực tiếp; link/mã có cơ chế quyền riêng. Không tự đưa bạn vào phòng.

## 3. Hồ sơ và nhánh lỗi

SCR-PROFILE-SETTINGS → sửa tên hiển thị 1–40 ký tự, có dấu → lưu → cập nhật tên. Username bất biến. Tên rỗng/quá dài báo tại trường. Tự kết bạn hoặc phản hồi lời mời của người khác bị từ chối ở server. Lời mời đã bị huỷ được báo hết hiệu lực và tải lại; retry không tạo quan hệ thứ hai.

## 4. Nghiệm thu

[AC-FRD-01…15](../01-requirements/REQ-PROFILE-FRIENDS.md#15-acceptance-criteria), [screen-states](../03-screens/screen-states.md), [ISSUE-060](../10-issues/ISSUE-060.md).
