# MA TRẬN QUYỀN

**ID:** `PERM` · **Trạng thái:** v1 · **Cập nhật:** 2026-09-21
**Liên quan:** [../00-overview/actors.md](../00-overview/actors.md) · [business-rules.md](business-rules.md)

> **Đây là nguồn chuẩn duy nhất cho câu hỏi "ai được làm gì".** Tài liệu khác liên kết tới đây, không chép lại.

---

> **DEC-031/032:** start cần hai PLAYER online và ready; FINISHED không nhận PLAYER mới, kể cả người đã rời quay lại bằng PLAY. Nối lại khi vẫn là thành viên không phải nhận ghế mới. Chi tiết REQ-ROOM BR-ROOM-19/20.

## 1. CÁC VAI TRÒ TRONG MA TRẬN

| Ký hiệu | Vai trò |
|---|---|
| **Khách** | Chưa đăng nhập |
| **User** | Đã đăng nhập, hoàn tất onboarding, **không** ở phòng nào |
| **Xem** | Người xem trong phòng (`SPECTATOR`) |
| **Chơi** | Người chơi trong phòng (`PLAYER`) |
| **Chủ** | Chủ phòng — **luôn đồng thời là người chơi** |

**Quy ước:** ✅ được · ❌ không được · ➖ không áp dụng · ⚠ có điều kiện (ghi chú bên dưới bảng)

> **Không có cột "tab".** Theo `DEC-020`, **mọi tab của cùng một tài khoản đều thao tác được như nhau** — quyền thuộc về **tài khoản và vai trò**, không thuộc về tab. Ngoại lệ duy nhất là **camera/micro chỉ một tab phát được** (`DEC-021`), ghi ở §8.

---

## 2. TÀI KHOẢN

| Hành động | Khách | User | Xem | Chơi | Chủ |
|---|:---:|:---:|:---:|:---:|:---:|
| Đăng ký | ✅ | ❌ | ❌ | ❌ | ❌ |
| Đăng nhập | ✅ | ❌ | ❌ | ❌ | ❌ |
| Quên mật khẩu | ✅ | ✅ | ✅ | ✅ | ✅ |
| Đăng xuất (thiết bị này) | ❌ | ✅ | ✅ | ✅ | ✅ |
| Đăng xuất (mọi thiết bị) | ❌ | ✅ | ✅ | ✅ | ✅ |
| Sửa tên hiển thị | ❌ | ✅ | ✅ | ✅ | ✅ |
| Đổi username | ❌ | ❌ | ❌ | ❌ | ❌ |
| Đổi email | ❌ | ❌ | ❌ | ❌ | ❌ |
| Xoá tài khoản | ❌ | ❌ | ❌ | ❌ | ❌ |
| Xem email của người khác | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 3. BẠN BÈ

| Hành động | Khách | User | Xem | Chơi | Chủ |
|---|:---:|:---:|:---:|:---:|:---:|
| Tìm người dùng (≥3 ký tự) | ❌ | ✅ | ✅ | ✅ | ✅ |
| Gửi lời mời kết bạn | ❌ | ✅ | ✅ | ✅ | ✅ |
| Chấp nhận / từ chối | ❌ | ⚠1 | ⚠1 | ⚠1 | ⚠1 |
| Huỷ lời mời đã gửi | ❌ | ⚠2 | ⚠2 | ⚠2 | ⚠2 |
| Huỷ kết bạn | ❌ | ⚠3 | ⚠3 | ⚠3 | ⚠3 |
| Xem trạng thái online của bạn | ❌ | ⚠3 | ⚠3 | ⚠3 | ⚠3 |
| Xem bạn **đang ở phòng nào** | ❌ | ❌ | ❌ | ❌ | ❌ |

⚠1 chỉ **người nhận** · ⚠2 chỉ **người gửi** · ⚠3 chỉ khi **đã là bạn bè**

---

## 4. SẢNH VÀ PHÒNG

| Hành động | Khách | User | Xem | Chơi | Chủ |
|---|:---:|:---:|:---:|:---:|:---:|
| Xem sảnh | ❌ | ✅ | ✅ | ✅ | ✅ |
| Thấy phòng **công khai** ở sảnh | ❌ | ✅ | ✅ | ✅ | ✅ |
| Thấy phòng **cần mã / khoá** ở sảnh | ❌ | ❌ | ❌ | ❌ | ❌ |
| Tạo phòng | ❌ | ✅ | ❌ | ❌ | ❌ |
| Vào phòng | ❌ | ✅ | ❌ | ❌ | ❌ |
| Chơi với máy | ❌ | ✅ | ❌ | ❌ | ❌ |
| Bấm **sẵn sàng** | ❌ | ➖ | ❌ | ✅ | ✅ |
| Đổi **tên phòng** | ❌ | ➖ | ❌ | ❌ | ✅ |
| Đổi **chế độ riêng tư** | ❌ | ➖ | ❌ | ❌ | ✅ |
| Đổi **cấu hình thời gian** | ❌ | ➖ | ❌ | ❌ | ⚠4 |
| **Chuyển quyền chủ phòng** | ❌ | ❌ | ❌ | ❌ | ❌ |
| Rời phòng | ❌ | ➖ | ✅ | ⚠5 | ⚠5 |

⚠4 **chỉ khi phòng đang chờ** — khoá cứng khi ván bắt đầu · ⚠5 rời khi **đang chơi = đầu hàng**

---

**Đổi bên trước ván:** hai PLAYER online trong WAITING đề nghị/huỷ/trả lời theo BR-ROOM-24; chỉ đối thủ được đồng ý, Host không được tự đổi bên của hai người. Người xem chỉ nhận trạng thái bên đã cập nhật.

**Cổng tiết lộ khi join:** quyền xem lỗi đầy/chặn/trạng thái yêu cầu bằng chứng hiện hành tại [FLOW-JOIN-ROOM](../02-flows/FLOW-JOIN-ROOM.md) §1/8. WATCH trực tiếp được dùng ở CODE_ONLY; LOCKED chặn mọi WATCH. Mọi chuyển kín hơn/rotate xử lý theo BR-SPEC-20, không thu hồi PLAY.

## 5. MỜI VÀ NGƯỜI XEM

| Hành động | Khách | User | Xem | Chơi | Chủ |
|---|:---:|:---:|:---:|:---:|:---:|
| Mời trực tiếp bạn bè | ❌ | ➖ | ❌ | ⚠6 | ⚠6 |
| Lấy link/mã **chơi** | ❌ | ➖ | ❌ | ✅ | ✅ |
| Lấy link/mã **xem** | ❌ | ➖ | ❌ | ✅ | ✅ |
| **Tạo/đổi** mã xem | ❌ | ➖ | ❌ | ❌ | ✅ |
| Dùng lời mời/mã/link | ❌ | ✅ | ❌ | ❌ | ❌ |
| Xem hộp thư lời mời **của mình** | ❌ | ✅ | ✅ | ✅ | ✅ |
| Xem lời mời **của người khác** | ❌ | ❌ | ❌ | ❌ | ❌ |
| Thấy danh sách người xem | ❌ | ➖ | ✅ | ✅ | ✅ |
| **Đuổi một người xem** | ❌ | ➖ | ❌ | ✅ | ✅ |
| **Đuổi đối thủ** | ❌ | ❌ | ❌ | ❌ | ❌ |
| Tự chuyển từ xem sang chơi | ❌ | ➖ | ❌ | ➖ | ➖ |

⚠6 chỉ mời được **người đã là bạn bè**

---

## 6. VÁN CỜ

| Hành động | Khách | User | Xem | Chơi (sai lượt) | Chơi (đúng lượt) |
|---|:---:|:---:|:---:|:---:|:---:|
| Xem bàn cờ | ❌ | ➖ | ✅ | ✅ | ✅ |
| Xem đồng hồ / lượt | ❌ | ➖ | ✅ | ✅ | ✅ |
| Xin đồng bộ lại | ❌ | ➖ | ✅ | ✅ | ✅ |
| **Đi cờ** | ❌ | ➖ | ❌ | ❌ | ✅ |
| **Đầu hàng** | ❌ | ➖ | ❌ | ✅ | ✅ |
| **Xin hoà** (online) | ❌ | ➖ | ❌ | ✅ | ✅ |
| **Xin hoà** (với máy) | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Xin đi lại** | ❌ | ➖ | ❌ | ⚠7 | ⚠7 |
| Thấy đề nghị hoà/đi lại và kết quả | ❌ | ➖ | ✅ | ✅ | ✅ |
| Trả lời đề nghị | ❌ | ➖ | ❌ | ⚠8 | ⚠8 |
| **Xác nhận "Tôi còn đây"** | ❌ | ➖ | ❌ | ❌ | ⚠9 |
| Tạm dừng / sửa đồng hồ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Ép kết thúc ván sớm | ❌ | ❌ | ❌ | ❌ | ❌ |
| Bấm **tái đấu** | ❌ | ➖ | ❌ | ✅ | ✅ |

⚠7 phải **đã đi ít nhất một nước** trên nhánh hiện tại · ⚠8 chỉ **đối thủ** của người đề nghị, **không tự chấp nhận** · ⚠9 chỉ **bên đến lượt**, và chỉ ở ván **không giới hạn thời gian**

---

## 7. CHAT

| Hành động | Khách | User | Xem | Chơi | Chủ |
|---|:---:|:---:|:---:|:---:|:---:|
| Đọc **kênh riêng người chơi** | ❌ | ➖ | ❌ | ✅ | ✅ |
| Gửi **kênh riêng người chơi** | ❌ | ➖ | ❌ | ✅ | ✅ |
| Đọc **kênh chung** | ❌ | ➖ | ✅ | ✅ | ✅ |
| Gửi **kênh chung** | ❌ | ➖ | ✅ | ✅ | ✅ |
| **Ẩn/hiện kênh chung** | ❌ | ➖ | ❌ | ✅ | ✅ |
| Đọc **lịch sử** kênh mình được phép | ❌ | ➖ | ✅ | ✅ theo BR-CHT-25 | ✅ theo BR-CHT-25 |
| Sửa / xoá tin đã gửi | ❌ | ❌ | ❌ | ❌ | ❌ |

**Giới hạn lịch sử khi thay người:** C nhận ghế của B không có quyền đọc tin riêng A–B đã gửi trước đó; áp dụng cả khi chuyển từ WAITING sang ván đầu. Máy chủ kiểm trên mọi đường đọc theo [REQ-CHAT](../01-requirements/REQ-CHAT.md) BR-CHT-25/26 (`DEC-029`).

> ⚠ **Ô quan trọng nhất trong toàn bộ tài liệu này:**
> **Người xem KHÔNG đọc được kênh riêng của hai người chơi.** Không có ngoại lệ.
>
> Chiều ngược lại **đã mở** theo `DEC-018`: cả hai người chơi **đọc và gửi được kênh chung**, và mỗi người có **công tắc ẩn/hiện riêng, độc lập** — công tắc là **tuỳ chọn giao diện**, không phải phân quyền.

---

## 8. CAMERA VÀ MICRO

| Hành động | Khách | User | Xem | Chơi | Chủ |
|---|:---:|:---:|:---:|:---:|:---:|
| Phát camera / micro | ❌ | ➖ | ❌ | ✅ | ✅ |
| Đổi mức chia sẻ **của mình** | ❌ | ➖ | ❌ | ✅ | ✅ |
| Đổi mức chia sẻ **của người khác** | ❌ | ❌ | ❌ | ❌ | ❌ |
| Nhận luồng chia sẻ *Chỉ đối thủ* | ❌ | ➖ | ❌ | ✅ | ✅ |
| Nhận luồng chia sẻ *Đối thủ và người xem* | ❌ | ➖ | ✅ | ✅ | ✅ |
| Tắt tiếng / ẩn **tại máy mình** | ❌ | ➖ | ✅ | ✅ | ✅ |

**⚠ Ngoại lệ về tab (`DEC-021`, `DEC-033/034`):** chỉ một tab phát camera và một tab phát micro (có thể là hai tab khác nhau). Chuyển từng nguồn theo [BR-MED-20…23](../01-requirements/REQ-MEDIA.md): xác nhận ngắt nguồn cũ, nguồn mới về Tắt và cần bật thủ công; nguồn còn lại giữ nguyên. Chưa xác nhận/thao tác lỗi thì không cho nguồn mới phát, hiển thị trạng thái và Thử lại theo DEC-034.

---

## 9. LỊCH SỬ VÀ XEM LẠI

| Hành động | Khách | User | Xem | Chơi | Chủ |
|---|:---:|:---:|:---:|:---:|:---:|
| Xem **lịch sử ván của mình** | ❌ | ✅ | ✅ | ✅ | ✅ |
| Xem lịch sử **của người khác** | ❌ | ❌ | ❌ | ❌ | ❌ |
| Xem lại **ván hiện tại** trong phòng | ❌ | ➖ | ✅ | ✅ | ✅ |
| Xem lại **ván cũ hơn** trong phòng | ❌ | ➖ | ❌ | ⚠12 | ⚠12 |

⚠12 người chơi xem qua **lịch sử ván của mình**, không qua phòng

---

## 10. MƯỜI ĐIỀU KHÔNG AI ĐƯỢC LÀM

Kể cả chủ phòng, kể cả người chơi:

| # | Không ai được |
|---|---|
| 1 | Đọc **kênh riêng của hai người chơi** khi mình là người xem |
| 2 | Bật hoặc đổi mức camera/micro **của người khác** |
| 3 | **Đuổi đối thủ** khỏi phòng |
| 4 | **Chuyển quyền chủ phòng** |
| 5 | **Tạm dừng hoặc sửa** đồng hồ |
| 6 | **Ép kết thúc ván** sớm (kể cả khi đối thủ mất mạng hoặc treo ván) |
| 7 | Xem **lịch sử ván của người khác** |
| 8 | Xem **email** của người khác |
| 9 | Biết bạn bè **đang ở phòng nào** |
| 10 | **Đổi username**, đổi email, hoặc xoá tài khoản |

---

## 11. BA LUẬT NỀN CỦA MỌI Ô TRONG MA TRẬN

| # | Luật | Nghĩa là |
|---|---|---|
| **1** | **Máy chủ kiểm lại ở mọi thao tác** | Nút bị vô hiệu ở giao diện **chỉ để hỗ trợ**. Giả mạo dữ liệu gửi lên **vẫn bị từ chối** |
| **2** | **Không có quyền ⇒ không nhận dữ liệu** | Không phải nhận rồi giấu đi. Áp dụng cho chat, camera/mic và bàn cờ |
| **3** | **Mọi tab đều thao tác được** (`DEC-020`) | Máy chủ chống xung đột bằng **kiểm lượt + phiên bản + mã lệnh**. Ngoại lệ duy nhất: **camera/mic chỉ một tab phát** (`DEC-021`) |

---

## 12. KIỂM THỬ MA TRẬN NÀY

Mỗi ô ❌ trong các bảng trên **phải có ít nhất một kiểm thử** chứng minh việc **giả mạo dữ liệu gửi lên vẫn bị từ chối** — không chỉ kiểm nút có bị vô hiệu hay không.

Các nhóm kiểm thử bắt buộc: người ngoài phòng · người xem giả làm người chơi · người chơi đọc kênh chung · **chủ phòng đọc kênh chung** · tab khác gửi lệnh · người đã bị thu hồi quyền · người bị đuổi vào lại · đổi mức media thay người khác · xem lịch sử người khác bằng cách đoán mã.

Chi tiết: [../06-acceptance/test-scenarios.md](../06-acceptance/test-scenarios.md)
