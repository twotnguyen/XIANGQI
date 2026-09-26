# EP14 · Camera & micro (LiveKit)

> **Loại:** Epic · **Story:** [ST14.1](../story/ST14.1-cong-media-livekit-local-do-byte-rtp-that.md), [ST14.2](../story/ST14.2-chinh-sach-camera-micro-cap-token-4-phong-thu-hoi-xoay-the-h.md), [ST14.3](../story/ST14.3-giao-dien-media-va-mot-tab-mot-nguon.md), [ST14.4](../story/ST14.4-kiem-thu-ma-tran-quyen-media-bang-luong-that-ts-med-01-15.md)

| Trường Jira | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | `EP14 · Camera & micro (LiveKit)` |
| Components | DevOps, Backend, Frontend, Tester |
| Priority | High |
| Labels | `xq-v2`, `ep14`, `gate`, `security` |
| Fix versions | `v1.0.0` |
| Start date / Due date | 2026-10-05 / 2026-10-22 |
| Nguồn đặc tả | ISSUE-112 … ISSUE-117, ISSUE-099 (R11) |

**Mục tiêu:** Mỗi người chơi tự chọn **riêng cho camera** và **riêng cho micro** một trong 3 mức: **Tắt** · **Chỉ đối thủ** · **Đối thủ và người xem**. Mặc định **Tắt hết**, mỗi ván. Không ai bật thay người khác (kể cả chủ phòng). Người xem chỉ nhận, không phát. **Chỉ trực tiếp** — không ghi âm, ghi hình, lưu, phát lại. Quyền phải có hiệu lực **ở tầng truyền dữ liệu** (không chỉ ẩn giao diện), đo bằng **byte RTP thật**.

**⛔ Cổng chặn (ISSUE-112):** LiveKit local phải cho **byte RTP > 0 và số khung hình > 0 thật** trước khi làm ST14.2–ST14.4. Không đạt ⇒ dừng nhánh media, ghi số thật, báo trưởng nhóm; **không** thay bằng giả lập.

**Kiến trúc quyền (ghi thẳng):**
| Mục | Quy tắc |
|---|---|
| 4 phòng truyền mỗi ván | Camera riêng (2 người chơi) · Micro riêng (2 người chơi) · Camera chung (2 người chơi chỉ phát + ≤ 5 người xem chỉ nhận) · Micro chung (như trên) |
| Token | theo **từng phòng**, **một nguồn** (camera **hoặc** micro), danh tính do **máy chủ** suy ra (user + nguồn + client + epoch + thế hệ phòng), **TTL 60 giây**; không lưu lâu dài ở trình duyệt, không log, không phát trong sự kiện chung |
| Mức → token | OFF: không token phát nguồn đó · Chỉ đối thủ: token phòng **riêng** · Đối thủ và người xem: token phòng riêng **và** phòng chung (phòng chung **chỉ phát**) · Người xem: chỉ token **nhận** phòng chung, **không** token phòng riêng |
| Phiên bản chính sách | 1 `policyVersion` cho cặp camera+micro **của từng người**; `PATCH` kèm version mong đợi, lệch ⇒ `CONFLICT` |
| Thu hồi (5 bước, thứ tự bắt buộc) | ① ghi mức mong muốn mới + đánh dấu phòng liên quan ĐANG XOAY VÒNG (ngừng cấp token) ② yêu cầu SFU ngừng phục vụ nhóm cũ / xoá phòng cũ ③ **chờ xác nhận từ SFU** ④ tạo **thế hệ mới, tên mới** (nonce 128-bit), cấp token cho người còn hợp lệ ⑤ **chỉ khi đó** đánh dấu ĐÃ ÁP DỤNG |
| Thời hạn thu hồi | tối đa 30 giây từ lúc bắt đầu; RPC tối đa 5 giây; thử lại sau 1/2/5 giây (tối đa 3 lần); đúng hạn chưa xác nhận ⇒ FAILED + Thử lại, **giữ fence**, không quay về mức rộng hơn. Không giữ khoá DB khi gọi SFU |
| Khi nào xoay phòng | thu hẹp nguồn riêng ⇒ phòng riêng nguồn đó · thu hẹp nguồn chung ⇒ **cả hai** phòng chung · đuổi/thu hồi người xem ⇒ **cả hai** phòng chung · chuyển nguồn sang tab khác ⇒ chỉ nguồn được chuyển · ván kết thúc ⇒ xoá cả 4 |
| Một tab một nguồn | chỉ **một** client giữ camera, **một** client giữ micro trên toàn tài khoản (có thể khác tab); chuyển: dừng + thu hồi nguồn cũ → chờ xác nhận SFU → nguồn ở tab mới **Tắt** → người dùng bật lại. Ngoại lệ này **chỉ** cho media — đi cờ/chat mọi tab vẫn thao tác được |
| Reset | tải lại trang / nối lại / ván mới / tái đấu ⇒ media về **Tắt** |

**Danh sách Story:**
| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST14.1](../story/ST14.1-cong-media-livekit-local-do-byte-rtp-that.md) | ⛔ Cổng media: LiveKit local + đo byte RTP thật | 2 | 5 |
| [ST14.2](../story/ST14.2-chinh-sach-camera-micro-cap-token-4-phong-thu-hoi-xoay-the-h.md) | Chính sách camera/micro, cấp token 4 phòng, thu hồi xoay thế hệ | 3 | 8 |
| [ST14.3](../story/ST14.3-giao-dien-media-va-mot-tab-mot-nguon.md) | Giao diện media và một tab một nguồn | 4 | 8 |
| [ST14.4](../story/ST14.4-kiem-thu-ma-tran-quyen-media-bang-luong-that-ts-med-01-15.md) | Kiểm thử ma trận quyền media bằng luồng thật (TS-MED-01..15) | 4 | 2 |
