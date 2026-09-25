# BACKLOG QUYẾT ĐỊNH — HIỆN HÀNH

**Cập nhật:** 2026-09-22. PO đã uỷ quyền BA tự chọn giải pháp hợp lý cho các điểm thiếu/mâu thuẫn, ghi tại DEC-039. Không còn câu hỏi sản phẩm phải chờ PO trong 31 finding của vòng này. Điều này không thay bằng chứng triển khai.

| Câu hỏi | Trạng thái đặc tả | Quyết định hiện hành |
|---|---|---|
| Q-AUD-01 /01a /01b | RESOLVED | DEC-026/027: hỏi và đếm ngay ở 3:00, hết 3:30 thua; xác nhận 3:29 → ngưỡng tiếp 6:29 |
| Q-AUD-02 | RESOLVED | DEC-030: reconnect giữ hạn chống treo, không cấp ngân sách mới |
| Q-AUD-03 | RESOLVED | DEC-031: WAITING giữ ghế offline60s; Host hết hạn đóng, PLAYER khác mất ghế; ready lại |
| Q-AUD-04 /04a /04b /04c | RESOLVED | DEC-028/029/044: chat từ khi vào; ván đầu giữ context; nhóm người đọc riêng bất biến; rematch context mới |
| Q-AUD-05 | RESOLVED | DEC-032/042: FINISHED không nhận PLAY mới; chỉ hai membership gốc tái đấu trước hạn |
| Q-AUD-06 | RESOLVED | DEC-033/041: chỉ nguồn media chuyển về OFF, nguồn còn lại giữ nguyên |
| Q-AUD-07 | RESOLVED | DEC-035/036/042: solo ready; config/ready revision chặn gói cũ; đổi bên cần đồng ý30s |
| Q-AUD-08 /08a /08b | RESOLVED | DEC-038/040: phiên ghi nhớ active-only; phiên tạm30min/12h; sửa giới hạn restore của037; nhánh Google/recovery/callback rõ |
| Q-AUD-09 | RESOLVED | DEC-034/041: bằng chứng SFU, hạn30s → ERROR/retry, không tự phát, không hứa tắt hardware từ xa |
| Q-AUD-10 | RESOLVED | DEC-045: phép đo AI/fixture/oracle/p95 định nghĩa rõ; không nới ngân sách |
| Q-AUD-11 | RESOLVED | DEC-046/047: demo cho phép ngủ; backend+AI child cùng service; local/Internet tách nghiệm thu |
| Q-AUD-12 | RESOLVED | DEC-045: AI offline vẫn TIMEOUT nếu clock hết trước/đúng60s; còn lại gián đoạn |
| Q-AUD-13 | RESOLVED | DEC-043: WATCH trực tiếp hợp lệ vào CODE_ONLY; LOCKED chặn WATCH |
| Q-AUD-14 | RESOLVED | DEC-043: ba chuyển kín hơn và rotate revoke mọi WATCH cũ; rotate không tự ẩn phòng PUBLIC |

## Còn phải xác minh khi triển khai

| Hạng mục | Trạng thái bằng chứng | Nơi nghiệm thu |
|---|---|---|
| Auth/email | CONFIG_VERIFICATION_PENDING: đọc cấu hình Supabase thật, SMTP/rate/expiry, Google collision/recovery, security hook | [auth-provider-config](../09-technical/auth-provider-config.md), ISSUE-034/042/043/048/050/052/053/137 |
| Browser/session | NOT_IMPLEMENTED: reload/restore/duplicate, hạn server, logout và thu hồi xuyên thiết bị | ISSUE-050/055/084/117 |
| Media | NOT_IMPLEMENTED: SFU/RTP/frame, timeout/retry, generation và khác biệt local/Cloud | ISSUE-099/112–117/137 |
| AI | NOT_IMPLEMENTED: corpus đóng băng, review oracle, benchmark phần cứng thật | ISSUE-032/033/124/137 |
| Quyền/race/deadline | NOT_IMPLEMENTED: PostgreSQL thật, clock tiêm, barrier và hai connection | Các issue tương ứng; tổng hợp ISSUE-133/136 |
| Internet | EXTERNAL_SETUP_PENDING: chưa cấu hình tài khoản dịch vụ hoặc triển khai | ISSUE-053/137; không mua dịch vụ trong đợt audit |

Dùng [final audit hiện hành](final-audit-2026-09-22.md) và [decision-log](../07-decisions/decision-log.md). Báo cáo initial/inventory/manifest cũ giữ snapshot nguyên trạng; không sửa lại lịch sử để làm đẹp kết quả.
