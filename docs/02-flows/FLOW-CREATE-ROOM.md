# FLOW-CREATE-ROOM — TẠO PHÒNG VÀ BẮT ĐẦU VÁN

**Yêu cầu:** [REQ-ROOM](../01-requirements/REQ-ROOM.md) · [REQ-INVITE](../01-requirements/REQ-INVITE.md)

---

## 1. LUỒNG CHÍNH

```
SẢNH ──► [Tạo phòng]
           │
           ├─ đang ở phòng khác ──► "Bạn đang ở trong một phòng"
           │                          [Quay lại phòng đó] [Rời phòng]
           ├─ đang có ván với máy ──► "Kết thúc ván với máy trước"
           │
           ▼ (hợp lệ)
    ┌─────────────────────────────┐
    │ Tên phòng:  [___________]   │  1-60 ký tự
    │ Chế độ:     (•) Công khai   │
    │             ( ) Cần mã      │
    │             ( ) Khoá        │
    │ Thời gian:  [Không giới hạn]│  mặc định
    │              5 / 10 / 15 phút│
    │          [ Tạo phòng ]      │
    └─────────────────────────────┘
           │
           ▼
    PHÒNG CHỜ — bạn là CHỦ PHÒNG, cầm QUÂN ĐỎ
           │
           │  (phòng Công khai ⇒ xuất hiện ở sảnh người khác NGAY)
           │
           ▼
    ┌──────────────────────────────────────┐
    │ 🔴 Bạn (chủ phòng)      ⏳ Chưa sẵn sàng│
    │ ⚫ (đang chờ người chơi)               │
    │ Người xem: 0/5                        │
    │ [Mời bạn] [Sao chép link] [Mã: K7M2XQP4]│
    │ [ Sẵn sàng ]  ← dùng được khi một người│
    └──────────────────────────────────────┘
           │
           ▼  mời người thứ hai (xem FLOW-JOIN-ROOM)
           │
    ┌──────────────────────────────────────┐
    │ 🔴 Bạn (chủ phòng)      ✅ Sẵn sàng   │
    │ ⚫ Lan Trần              ⏳ Chưa       │
    │ [ Bỏ sẵn sàng ]                       │
    └──────────────────────────────────────┘
           │
           ▼  CẢ HAI ONLINE và bấm Sẵn sàng
           │
    ⚠ KHOÁ CỨNG cấu hình thời gian
    Tạo ván mới · bàn cờ thế ban đầu · ĐỎ đi trước
           │
           ▼
    PHÒNG ĐANG CHƠI ──► xem FLOW-MATCH
```

---

## 2. NHÁNH RẼ KHI ĐANG CHỜ

**Chat có ngay khi vào phòng chờ** (`DEC-028`), không cần bấm Sẵn sàng. A gửi “đợi mình một chút” thì B nhận theo quyền kênh trong [REQ-CHAT](../01-requirements/REQ-CHAT.md). Bắt đầu ván đầu **giữ tin phòng chờ theo quyền đọc**. C vào thay B **không đọc tin riêng A–B cũ**, kể cả sau khi bắt đầu ván (`DEC-029`, BR-CHT-25/26).

| Tình huống | Kết quả |
|---|---|
| Chỉ có một PLAYER bấm Sẵn sàng | Lưu sẵn sàng, hiện chờ đối thủ và cho Bỏ sẵn sàng; chưa tạo ván (BR-ROOM-21) |
| Một bên **bỏ sẵn sàng** trước khi bên kia bấm | Ván **không** bắt đầu |
| **Đề nghị đổi bên** | Hai PLAYER online trong WAITING; theo BR-ROOM-24 và flow §5, không tự đổi bên đối thủ |
| Chủ phòng **đổi thời gian** | Nếu được chấp nhận trong WAITING: xoá sẵn sàng cả hai, hiện thời gian mới + lý do và yêu cầu bấm lại (BR-ROOM-22) |
| Chủ phòng **đổi chế độ riêng tư** | Được — nếu kín hơn thì **đuổi toàn bộ người xem** |
| **Người chơi thứ hai rời** | Ghế trống lại, sẵn sàng bị xoá |
| **Chủ phòng rời** | **ĐÓNG PHÒNG**, thu hồi mọi lời mời, mọi người về sảnh |
| Người chơi **mất mạng** | Giữ ghế 60 giây; mất ready, nối lại phải ready lại; hết hạn Host đóng phòng, PLAYER còn lại mất ghế (DEC-031) |

---

## 3. NHÁNH LỖI

| Lỗi | Thông báo |
|---|---|
| Tên phòng rỗng / > 60 ký tự | Nêu rõ giới hạn |
| Hai người cùng xin ghế chơi cuối | **Đúng một** người được nhận; người kia: *"Phòng đã đủ người chơi"* |
| Cả hai bấm sẵn sàng **cùng lúc** | Tạo **đúng một** ván |
| Bấm sẵn sàng khi ván đã bắt đầu | Từ chối — phòng không còn ở trạng thái chờ |
| PLAYER bấm sẵn sàng từ tab khác | Cho phép theo DEC-020; cùng điều kiện BR-ROOM-04/21/22, không tạo hai ván |
| Đổi thời gian tranh chấp start | Start trước ⇒ từ chối đổi; đổi trước ⇒ reset ready, xác nhận lại cấu hình mới. Lệnh ready theo cấu hình cũ không được tự áp dụng (AC-ROOM-23) |

---

## 4. SAU KHI VÁN KẾT THÚC

FINISHED không nhận PLAYER mới hoặc người đã chủ động rời quay lại bằng PLAY. Chỉ hai người vẫn ở lại được tái đấu; muốn thay đối thủ phải rời/tạo phòng mới (`DEC-032`).

```
VÁN KẾT THÚC ──► PHÒNG "ĐÃ XONG" (đếm 10 phút)
       │
       ├─ cả hai bấm Tái đấu ──► VÁN MỚI, ĐỔI BÊN ──► đang chơi
       ├─ chủ phòng rời ───────► ĐÓNG PHÒNG
       └─ hết 10 phút ─────────► ĐÓNG PHÒNG
```

## 5. ĐỔI BÊN TRƯỚC VÁN

A bấm Đề nghị đổi bên → máy chủ xoá ready cả hai, hiện chờ 30 giây; B có Đồng ý/Từ chối, A có Huỷ. Trong lúc chờ, Sẵn sàng vô hiệu kèm lý do. B đồng ý trước hạn và hai người vẫn online/cùng cấu hình → đổi bên đồng thời → thông báo “Đã đổi bên, vui lòng sẵn sàng lại”. Đóng modal bằng X/Esc chỉ ẩn UI, không huỷ đề nghị; muốn huỷ dùng nút Huỷ. Hết hạn/từ chối/offline/rời/đổi thời gian → giữ bên cũ, kết thúc đề nghị, không phục hồi ready. Lỗi stale yêu cầu tải lại; không tự gửi lại ready/đồng ý với cấu hình mới. Chỉ một PLAYER thì Đổi bên vô hiệu “Cần hai người chơi online”. Xem BR-ROOM-23/24.
