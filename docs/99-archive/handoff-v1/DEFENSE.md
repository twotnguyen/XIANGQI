# Kịch bản Bảo vệ Đồ án Kỹ thuật (Defense Guide)

Tài liệu chuẩn bị các luận điểm kỹ thuật, kiến trúc cốt lõi và số liệu đo lường phục vụ buổi bảo vệ đồ án.

---

## 1. Các Luận Điểm Kỹ Thuật Trọng Tâm

### 1.1. Máy chủ Authoritative chống Gian lận (Authoritative Pipeline)
- **Vấn đề:** Các trò chơi cờ trực tuyến dễ bị hack client gửi nước đi trái luật, gửi lệnh trùng lặp khi mạng chập chờn hoặc tua ngược trạng thái.
- **Giải pháp:**
  - Client chỉ gửi ý định nước đi (`MoveCommand`).
  - Server thực hiện khóa nguyên tử thứ tự: `Room FOR UPDATE` $\to$ `Match FOR UPDATE`.
  - Cơ chế **Command Receipts**: kiểm tra cặp `(match_id, command_id)` kèm hash SHA-256 nội dung; nếu mạng retry thì trả lại kết quả cũ (idempotent), nếu sửa payload cùng ID thì báo lỗi `409 Conflict`.
  - Phân xử luật cờ thuần túy trên máy chủ bằng `@xiangqi/game-rules` không phụ thuộc client.

### 1.2. Thuật toán AI Tự Phát Triển
- **Vấn đề:** Làm sao để AI chơi cờ thông minh trong thời gian thực mà không làm nghẽn Event Loop của máy chủ?
- **Giải pháp:**
  - Xây dựng cụm **Worker Threads Pool** (`apps/ai-worker`) độc lập với 2 luồng tính toán song song và hàng đợi 8 tác vụ.
  - Sử dụng `SharedArrayBuffer` và `Atomics` để gửi tín hiệu hủy (cancel signal) tức thì khi người chơi nhấn "Xin đi lại" (Undo), không lãng phí CPU.
  - Triển khai thuật toán **Alpha-Beta Pruning** kết hợp **Iterative Deepening** và **MVV-LVA Move Ordering**: giảm **78.86%** số node cần duyệt so với Minimax cổ điển (từ 4,669 nodes xuống 987 nodes ở cùng độ sâu 2, điểm số 20/20 thế cờ trùng khớp 100%).

### 1.3. An toàn Phân quyền WebRTC (Media Source Isolation)
- **Vấn đề:** Khán giả (Spectator) không được phép nghe lén cuộc gọi riêng tư của 2 người chơi hoặc phát mã độc âm thanh/hình ảnh.
- **Giải pháp:**
  - Chia tách thành 4 transports độc lập theo spec 06 (`PRIVATE_CAMERA`, `PRIVATE_MICROPHONE`, `WATCH_CAMERA`, `WATCH_MICROPHONE`) để camera và micro hoạt động độc lập theo 3 mức chia sẻ (TẮT / CHỈ ĐỐI THỦ / ĐỐI THỦ VÀ KHÁN GIẢ).
  - Khán giả chỉ nhận token với quyền `canPublish: false` và chỉ subscribe các track được người chơi cho phép.
  - Token có thời hạn ngắn **60 giây** (`TTL: 60s`), chính sách lưu bền vững trong CSDL (`media_policies`, `media_policy_jobs`).
  - Khi phòng khóa, người chơi rời phòng hoặc kết thúc ván, hệ thống kích hoạt **Room Generation Rotation** và gọi `deleteRoom` trên LiveKit SFU để vô hiệu hóa ngay lập tức toàn bộ token cũ; lỗi SFU giữ trạng thái APPLYING chứ không báo thành công giả.

---

## 2. Các Câu Hỏi Phản Biện Dự Kiến & Cách Trả Lời

### Q1: Kiến trúc giao tiếp thời gian thực của hệ thống hoạt động như thế nào?
> **Trả lời:** Hệ thống sử dụng Socket.IO 4 chạy trên cùng tiến trình Fastify HTTP server (namespace `/`, transport thuần WebSocket) kết hợp với hàng đợi sự kiện sau commit (`realtime/events.ts`). Handshake yêu cầu Bearer token xác thực và Origin allowlist. Lệnh đi cờ và chat thực hiện qua socket kèm cơ chế kiểm soát lease phiên (`X-Control-Id`/`X-Control-Epoch`) để chống thao tác từ tab cũ. Dưới tải 70 clients đồng thời (10 phòng, 20 kỳ thủ + 50 khán giả + 2 ván cờ AI), p95 latency đo được qua đo đạc roundtrip thực tế đạt **67.64ms**, hoàn toàn dưới ngưỡng 100ms quy định.

### Q2: Nếu người chơi mất kết nối giữa chừng thì sao?
> **Trả lời:** Hệ thống có cơ chế ân hạn rớt mạng 60 giây (`disconnect grace period`). Trong 60 giây đó, đồng hồ của người chơi vẫn tiếp tục chạy. Nếu họ kết nối lại trước thời hạn, trạng thái bàn cờ được đồng bộ nguyên vẹn từ snapshot mới nhất. Nếu hết 60 giây mà không kết nối lại, máy chủ xử thua do `DISCONNECT`. Nếu cả hai cùng mất kết nối, ván đấu kết thúc hòa do `BOTH_OFFLINE` mà không trừ điểm oan.

### Q3: Nếu Game Server bị restart đột ngột?
> **Trả lời:** Hàm `recoverActiveMatchesOnBoot()` trong `deadlines.ts` được kích hoạt ngay khi server khởi động: tìm tất cả ván cờ còn ở trạng thái `ACTIVE`, chuyển sang `INTERRUPTED` với lý do `SERVER_RESTART`, giải phóng danh sách người chơi trong bảng `active_players` để họ có thể tiếp tục tạo phòng mới.

---

## 3. Bảng Tóm tắt Số liệu Kỹ thuật

- **Số lượng Test Cases:** 301 unit tests + 90 integration tests + 8 media SFU tests + 92 Playwright E2E tests = **491 automated tests** (Tỷ lệ pass: 100%, 0 failed).
- **Hiệu quả cắt tỉa AI:** Giảm 78.86% số node duyệt (từ 4,669 xuống 987 nodes), 20/20 thế cờ chuẩn xác 100%.
- **Độ trễ máy chủ:** p95 latency 67.64ms dưới tải 70 kết nối Socket.IO đồng thời.
- **Bảo mật:** 0 credentials lộ trong bundle phân phối tĩnh frontend; bảo vệ 64KB DoS limit.
