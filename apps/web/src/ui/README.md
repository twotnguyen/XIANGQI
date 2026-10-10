# Khung giao diện — XIAN-39 / T03

Biến giao diện Kỳ Đài Cổ Phong ở `../styles/tokens.css`. Phông được self-host
với giấy phép tại `public/fonts/UI-FONTS.md`; giao diện không tải phông từ CDN.
`primitives.tsx` cung cấp nút, trường nhập, dialog, tooltip, toast, tab, badge,
trạng thái chờ, trống và lỗi. `AppShell` dùng cùng thành phần cho điều hướng
máy tính/điện thoại; liên kết giữ được thao tác Back/Forward và mở tab mới.

Chạy `pnpm --filter @xiangqi/web dev`, mở `/dev/ui` để kiểm thành phần và
`/dev/lobby` để xem vị trí tích hợp Sảnh. Danh sách phòng trong preview có
nhãn dữ liệu minh họa; preview không cấp quyền vào phòng hoặc chơi cờ.

Ưu tiên desktop/laptop: 1280×720, 1366×768, 1440×900, 1536×864,
1920×1080; sau đó mobile 360×800 và 390×844. Các kiểm trình duyệt đã kiểm
tràn ngang, vùng thao tác tối thiểu 44px, dialog bằng bàn phím và font local.
Dialog giữ focus, Escape/backdrop đóng và trả focus; tooltip giữ hiển thị khi
focus hoặc hover, có cầu hover và Escape để bỏ qua.

Các route/guard thuần ở `../routing` phân biệt phiên đang kiểm, ẩn danh,
thành viên, Khách và onboarding; không thay thế xác thực/quyền vào phòng tại
máy chủ. Luồng đăng nhập, danh sách phòng và ván thật được nối trong Task
của từng tính năng. Không coi preview hoặc guard phía client là nghiệm thu
phân quyền. Phóng to 200%, screen reader và đánh giá không phân biệt màu
vẫn cần được kiểm xuyên suốt trước bàn giao đầy đủ.
