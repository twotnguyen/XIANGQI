# MỐC TRIỂN KHAI VÀ CỔNG CHẤT LƯỢNG

**Căn cứ:** DEC-047 · **Ngày:** 2026-09-22 · chỉ là thiết kế kế hoạch, không phải kết quả chạy.

## 1. Thứ tự khả thi

Chọn issue TODO nhỏ nhất mà **mọi phụ thuộc DONE và đã merge**. Số issue là định danh, không phải lệnh phải làm hết001..138 theo thứ tự số. Không bắt đầu issue phụ thuộc BLOCKED_EXTERNAL; chọn nhánh độc lập khác. Có138 issue và21 nhóm E00–E20, không thêm issue rỗng để sửa vòng phụ thuộc.

| Mốc | Công cụ/khả năng có thật khi kết thúc | Việc chờ đúng mốc |
|---|---|---|
| 001 | install/build/typecheck/health; lane chưa tạo phải fail rõ | lint002 và unit003 chưa có, không ghi PASS |
| 002 | lint thật + kiểm âm CLI | unit003 chưa có |
| 003 | bốn cổng thật; clock tiêm vào, forwarding sai path phải đỏ | không còn ngoại lệ bootstrap |
| 004/005 | e2e smoke thật desktop/mobile; CI chặn merge | DB/media chưa gọi lane chưa có |
| 034 | Supabase/Auth/Postgres local, runner DB tối thiểu fail khi thiếu DB | migrations035–043 dùng runner này, không đợi044 |
| 044 | mở rộng runner thành factory/runId/barrier/app fixture | protected API guard test ở046 |
| 051 | thu hồi session ở DB/provider + API guard thật | socket kiểm ở084; SFU thật kiểm TS-MED-14 ở117 |
| 054/055 | onboarding với user thật Auth local và UI email/phiên | Google thật ở053, không giả lập Google để đạt |
| 084→095→064 | gateway handshake/WAITING→presence→ready/start có online guard | grace deadline WAITING/PLAYING tích hợp096 |
| 066/075 | transaction quyền/epoch/guard/job thật | transport board/chat/history T110-14; SFU TS-MED-06 tại117; đối chiếu133/136 |
| 098 | multi-tab thực thi lệnh đã có ở101/106/110/127 | không test stub endpoint chưa có |
| 112 | spike LiveKit **local** có RTP/frame thật | không cần cloud/hai điện thoại để PASS local |
| 120→121 | queue/supervisor thật→áp result vào match/clock/DB thật | không gọi quyết định queue là match terminal đã commit |
| 130..135 | đủ feature trước rà UI/quyền; AI/media trước thử tải | không tạo màn hoặc quyền giả để đủ test |
| 136 | mọi AC local,0 skipped, bốn cổng và các lane thật | AC Google/SMTP/hai mạng giữ CHỜ external |
| 137 | có053 DONE; Internet/end-to-end/hardware thật | thiếu tài nguyên ⇒ BLOCKED_EXTERNAL |
| 138 | hồ sơ bàn giao local từ136, hạn chế/CHỜ rõ ràng | không tuyên bố toàn sản phẩm DONE khi053/137 chưa đạt |

## 2. Phạm vi PASS không đổi âm thầm

Issue051 không nhận công lao test media chưa chạy; bằng chứng ghi rõ integration gate ở084/117. ISSUE-136 phải có bảng AC local và AC Internet theo requirement ID/test ID, không ghi R01 toàn bộ PASS khi Google chưa chạy. Không dùng `.skip`, mock provider, hộp thư local hoặc hai tab cùng máy để thay bằng chứng Internet. Local SMTP là email do Auth thật gửi vào hộp thư local; đó là bằng chứng local hợp lệ và giới hạn được công bố.

Bốn cổng sau003 không được bỏ; test DB dùng PostgreSQL thật, thiếu DB phải đỏ; benchmark032 không hạ depth/p95; media112 không hạ RTP/frame. Khi thất bại ghi BLOCKED+ số thật, khi thiếu tài nguyên ngoài ghi BLOCKED_EXTERNAL. Tất cả runtime còn TODO trong kho đặc tả; sửa tài liệu không tạo bằng chứng PASS.

## 3. Đồng bộ metadata

Mỗi sửa dependency phải sửa cả header ISSUE và INDEX; kiểm đủ138 ID, không thiếu đích, không tự phụ thuộc, không chu trình. Sau đổi scope phải rà từng bước/test có gọi khả năng ở issue chưa phụ thuộc hay không. Kiểm DAG không thay thế rà nghiệp vụ này. Các bảng nhóm chỉ minh họa; header ISSUE và INDEX phải khớp nhau.
