# FLOW-JOIN-ROOM — VÀO PHÒNG

**Yêu cầu:** [REQ-INVITE](../01-requirements/REQ-INVITE.md) · [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) · [REQ-LOBBY](../01-requirements/REQ-LOBBY.md)

---

> **DEC-032 — nhận PLAYER:** chỉ cho join PLAY mới vào WAITING; từ chối PLAY vào PLAYING/FINISHED dù còn vé hợp lệ. WATCH và nối lại của thành viên hiện hữu kiểm theo quyền riêng; không nhầm reconnect với nhận ghế mới.

## 1. BỐN ĐƯỜNG VÀO

```
   ┌──────────────┬──────────────┬─────────────┬──────────────┐
   │  Từ SẢNH     │  LỜI MỜI     │   LINK      │     MÃ       │
   │ (chỉ xem)    │ (chỉ bạn bè) │             │  (8 ký tự)   │
   └──────┬───────┴──────┬───────┴──────┬──────┴──────┬───────┘
          └──────────────┴──────────────┴─────────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │  KIỂM TRA THEO      │
                   │  ĐÚNG THỨ TỰ NÀY    │
                   └─────────────────────┘
                              │
   ① Đã đăng nhập/onboarding? → chưa: đăng nhập, ghi nhớ đích
   ② Đang ở phòng khác/ván AI? → báo trạng thái của chính mình
   ③ Chứng minh quyền biết phòng hiện hành? → không: lỗi CHUNG
   ④ Còn mở / không bị chặn / đúng quyền privacy và intent?
   ⑤ Còn ghế và trạng thái cho nhận vai trò? → không: lỗi chi tiết
   ⑥ Nhận ghế + tiêu thụ vé + mở đúng nhóm chat trong cùng thao tác
                              │
                              ▼
                    VÀO PHÒNG, đúng vai trò
```

**`FLOW-JOIN-01`** — Thứ tự trên bắt buộc cho mọi đường vào. Bằng chứng quyền biết phòng: membership hiện hành; lời mời/mã/link chưa dùng, chưa hết hạn/thu hồi, đúng người nhận; hoặc PUBLIC đang WAITING/PLAYING cho WATCH. Đoán ID/ảnh sảnh cũ/lời mời cũ không đủ. Máy chủ đọc nội bộ để kiểm quyền nhưng không đưa thông tin phòng ra trước cổng ③. Quyền biết phòng chưa chắc đủ quyền vào: vẫn kiểm chặn/privacy/trạng thái/sức chứa. Payload chỉ chứa mục đích PLAY/WATCH, không tự khai role/side. Contract [ROOM-CHAT §2](../09-technical/room-chat-contract.md).

---

## 2. QUYỀN THEO CHẾ ĐỘ PHÒNG

| Chế độ | Vào **CHƠI** | Vào **XEM** |
|---|---|---|
| **Công khai** | Cần lời mời/mã/link **chơi** | Vào thẳng từ sảnh |
| **Cần mã** | Cần lời mời/mã/link **chơi** | Lời mời trực tiếp WATCH đúng người nhận hoặc mã/link **xem** hợp lệ |
| **Khoá** | Cần lời mời/mã/link **chơi** ✅ | **Không ai vào được** ❌ |

> **Điểm dễ nhầm:** phòng **Khoá** vẫn **mời chơi được**. Khoá chỉ chặn **người xem**.

---

## 3. VÀO XEM TỪ SẢNH

```
SẢNH ──► bấm vào một phòng công khai
           │
           ├─ phòng vừa ĐẦY ──────► "Phòng đã đủ người xem" + làm mới danh sách
           ├─ phòng vừa ĐÓNG ─────► lỗi chung §8 + làm mới
           ├─ phòng vừa chuyển KÍN ► lỗi chung §8 + làm mới
           │
           ▼ (hợp lệ)
    VÀO PHÒNG với vai trò NGƯỜI XEM
           │
           ├─ nhận thế cờ hiện tại NGAY (kể cả đang giữa ván)
           ├─ nhận lịch sử kênh chat CHUNG (ROOM) của ván hiện tại
           └─ nhận camera/mic của người chơi CHỌN chia sẻ cho người xem
```

**`FLOW-JOIN-02`** — Danh sách sảnh có thể cũ vài giây. **Luôn kiểm lại** khi thực sự vào (`BR-LOB-08`).

---

## 4. VÀO BẰNG LỜI MỜI TRỰC TIẾP

```
Được mời (chỉ BẠN BÈ mời được)
    │
    ├─ đang ONLINE ──► thấy ngay
    └─ đang OFFLINE ─► thấy trong HỘP THƯ LỜI MỜI khi đăng nhập ⭐
                        (nếu vẫn còn trong 10 phút)
    │
    ▼
┌──────────────────────────────────────────┐
│ Minh Nguyễn mời bạn vào "Cờ chiều thứ 7" │
│ Còn 6 phút        [Từ chối] [Chấp nhận]  │
└──────────────────────────────────────────┘
    │
    ├─ [Từ chối] ──► lời mời huỷ
    ├─ hết 10 phút ─► lời mời TỰ BIẾN MẤT
    │
    ▼ [Chấp nhận]
    ├─ đang ở phòng khác ──► "Phải rời phòng hiện tại trước"
    ├─ phòng đã đủ người ──► "Phòng đã đủ người chơi"
    ├─ phòng đã đóng ──────► lỗi chung §8
    │
    ▼ (hợp lệ)
VÀO PHÒNG · lời mời ĐÃ TIÊU THỤ (không dùng lại, kể cả khi rời rồi vào lại)
```

---

## 5. VÀO BẰNG LINK

```
Nhận link qua Zalo/Messenger/bất kỳ đâu
    │
    ▼
Mở link
    │
    ├─ CHƯA đăng nhập ──► màn Đăng nhập
    │                      └─► đăng nhập xong ──► TỰ VÀO ĐÚNG PHÒNG
    │
    ▼ đã đăng nhập
Kiểm tra theo thứ tự §1
    ├─ link hết hạn (>24 giờ) ──► lỗi chung §8
    ├─ link đã thu hồi ─────────► cùng thông báo
    ├─ link CHƠI đã dùng ───────► lỗi chung §8
    │
    ▼ (hợp lệ)
VÀO PHÒNG đúng vai trò của link (chơi hoặc xem)
```

---

## 6. VÀO BẰNG MÃ

```
SẢNH ──► [Nhập mã]
           │
           ▼
    ┌──────────────────────┐
    │ Mã phòng:            │
    │ [ K 7 M 2 X Q P 4 ]  │  8 ký tự, không có I O 0 1
    │      [ Vào phòng ]   │
    └──────────────────────┘
           │
           ├─ mã sai / hết hạn / đã thu hồi
           │   └──► lỗi chung §8
           │        (CÙNG một thông báo — không tiết lộ phòng có tồn tại không)
           │
           ▼ (hợp lệ)
    Hệ thống tự xác định mã là CHƠI hay XEM
           │
           ▼
    VÀO PHÒNG đúng vai trò
```

---

## 7. NGƯỜI XEM MUỐN THÀNH NGƯỜI CHƠI

```
Đang là NGƯỜI XEM, thấy ghế chơi trống
    │
    ▼
❌ KHÔNG có nút "Vào chơi"
    │
    ▼
Phải: [Rời phòng] ──► rồi dùng LỜI MỜI hoặc MÃ CHƠI để vào lại
```

**`FLOW-JOIN-03`** — Không có đường chuyển vai trò tại chỗ (`BR-SPEC-14`).

---

## 8. BẢNG THÔNG BÁO LỖI

| Điều kiện | Thông báo |
|---|---|
| Chưa có bằng chứng: không tồn tại/private/mã sai/hết hạn/thu hồi/đã dùng/sai người nhận | “Không thể vào phòng. Kiểm tra mã hoặc lời mời.”; cùng phản hồi, không tên/id/trạng thái/sức chứa/người trong phòng |
| Có bằng chứng, bị chặn | “Bạn không thể vào phòng này” |
| Có bằng chứng, WATCH bị LOCKED hoặc sai mục đích | “Bạn không có quyền vào theo cách này” |
| Có bằng chứng, đầy ghế | “Phòng đã đủ người chơi/người xem” |
| Có bằng chứng, PLAYING/FINISHED xin PLAY | “Không nhận thêm người chơi; hãy tạo phòng mới” |
| Đang ở phòng khác | “Phải rời phòng hiện tại trước” — chỉ thông tin của chính mình |
| Đóng phòng gửi cho thành viên đang ở phòng | “Phòng đã đóng” + về sảnh; join mới sau thu hồi toàn bộ dùng lỗi chung |

UI có nhập lại mã, Thử lại hoặc Về sảnh; làm mới danh sách khi lỗi. Các nhánh ở §3–6 đều qua cổng §1 trước khi chọn thông báo này, không dùng thông báo riêng cho token hết hạn/đã dùng. Đóng phòng thu hồi mọi vé nên không dùng vé cũ để dò trạng thái CLOSED.
