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

---

> ⏱ **Đọc lần đầu:** khoảng 10 phút. · Từ kỹ thuật lạ ⇒ [Từ điển kỹ thuật](../05-TU-DIEN-KY-THUAT.md) · Cách kiểm ⇒ [Sổ tay kiểm thử](../04-HUONG-DAN-KIEM-THU.md)

## 1. TÓM TẮT (đọc trong 1 phút)

**Camera & micro trong ván** (qua LiveKit):
- ⛔ **Cổng chặn**: chứng minh gói tin thật (byte RTP > 0) trước mọi thứ.
- Người chơi chọn ai thấy/nghe mình: **Tắt / Chỉ đối thủ / Đối thủ và người xem** — riêng camera, riêng micro.
- Thu hẹp quyền ⇒ **xoay thế hệ phòng**, chờ SFU xác nhận.
- **Một tab một nguồn**; mọi kiểm thử đo **byte thật** + **đối chứng dương**.

## 2. BỐI CẢNH — VÌ SAO EPIC NÀY TỒN TẠI

- Lỗi lần trước `F-14` (camera "kết nối" nhưng 0 gói tin), `F-28` (thiếu cổng RTC).
- Media là phần **dễ "xanh giả"** nhất: nhìn giao diện thấy "đã tắt" nhưng luồng vẫn chạy. Vì vậy mọi ca quan trọng đo `bytesReceived`.

## 3. KHÁI NIỆM CẦN HIỂU

| Khái niệm | Giải thích |
|---|---|
| **SFU (LiveKit)** | Máy chủ chuyển tiếp luồng camera/mic; máy chủ Node chỉ cấp quyền |
| **4 phòng truyền** | Camera riêng · Micro riêng · Camera chung · Micro chung |
| **Token** | 1 phòng · 1 nguồn · TTL 60 s · identity do máy chủ tạo |
| **Xoay thế hệ** | Xoá phòng cũ, chờ SFU xác nhận, tạo phòng tên mới — token cũ vô dụng |
| **Đối chứng dương** | Người còn quyền vẫn nhận (bytes tăng) cùng lúc người mất quyền không nhận |
| **⛔ Cổng ISSUE-112** | Byte RTP > 0 và khung hình > 0 thật trước khi làm ST14.2+ |

Tra thêm: [Token](../05-TU-DIEN-KY-THUAT.md#jwt) · [Test lanes (media)](../05-TU-DIEN-KY-THUAT.md#test-lanes) · [Race](../05-TU-DIEN-KY-THUAT.md#race) · [Idempotency](../05-TU-DIEN-KY-THUAT.md#idempotency)

## 4. PHẠM VI

**✅ LÀM:** LiveKit local + lane media; chính sách + token 4 phòng; thu hồi 5 bước; giao diện media; một tab một nguồn; ma trận TS-MED-01..15.

**❌ KHÔNG LÀM**
| Việc | Ở đâu |
|---|---|
| Ghi âm, ghi hình | **Không có** trong sản phẩm |
| LiveKit trên môi trường Internet thật, TS-MAN-03 | EP16 (TK16.8.x) |
| Thu hồi người xem / đuổi (logic phòng) | EP08, EP09 — ghi `media_jobs` cho EP14 thực thi |

## 5. LUẬT BẮT BUỘC CHO MỌI TASK

| Luật | Nghĩa |
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

## 6. ĐẦU VÀO

EP05 (bảng media), EP06 (phiên — logout thu hồi media), EP08/EP09 (thu hồi người xem, đuổi), EP10 (gateway, màn phòng chơi), EP02 (thiết kế khung media).

## 7. DANH SÁCH STORY

| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST14.1](../story/ST14.1-cong-media-livekit-local-do-byte-rtp-that.md) | ⛔ Cổng media: LiveKit local + đo byte RTP thật | 2 | 5 |
| [ST14.2](../story/ST14.2-chinh-sach-camera-micro-cap-token-4-phong-thu-hoi-xoay-the-h.md) | Chính sách camera/micro, cấp token 4 phòng, thu hồi xoay thế hệ | 3 | 8 |
| [ST14.3](../story/ST14.3-giao-dien-media-va-mot-tab-mot-nguon.md) | Giao diện media và một tab một nguồn | 4 | 8 |
| [ST14.4](../story/ST14.4-kiem-thu-ma-tran-quyen-media-bang-luong-that-ts-med-01-15.md) | Kiểm thử ma trận quyền media bằng luồng thật (TS-MED-01..15) | 4 | 2 |

```
TK14.1.1 ─► TK14.1.2 ─► TK14.1.3 (QA ⛔ CỔNG) ═► TK14.2.1 ─► TK14.2.2 ─┬─► TK14.3.1 ─┐
                                                                    └─► TK14.3.2 ─┴─► TK14.3.3 ─┬─► TK14.3.4 (QA)
                                                                                                └─► TK14.4.1 (QA, + TK09.2.1)
```

## 8. TIÊU CHÍ HOÀN THÀNH EPIC

- [ ] ⛔ Cổng ISSUE-112 PASS với số thật (hoặc BLOCKED ghi rõ — khi đó ST14.2+ không làm).
- [ ] 4 Story Done; TS-MED-01..15 xanh, 0 skip, mọi khẳng định âm có đối chứng dương.
- [ ] Không token nào xuất hiện trong log / sự kiện chung.

## 9. KỊCH BẢN DEMO (~10 phút)

1. `pnpm test:media` in số byte video/audio thật > 0.
2. A bật camera "Chỉ đối thủ" + micro "Đối thủ và người xem": B thấy + nghe, người xem chỉ nghe.
3. A hạ micro về "Chỉ đối thủ": `webrtc-internals` của người xem ngừng tăng byte, của B vẫn tăng.
4. A mở tab 2 ⇒ "Camera đang bật ở tab khác" ⇒ Chuyển sang tab này.
