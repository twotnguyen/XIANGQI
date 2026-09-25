# PHIÊN VÀ NHIỀU TAB

**ID:** `SS` · **Trạng thái:** v2 · **Cập nhật:** 2026-09-22
**Căn cứ:** `DEC-007`, `DEC-038/040` (chính sách phiên) · **`DEC-020`** (bỏ khoá tab) · **`DEC-021`** (camera/mic một tab)

---

## 1. HAI LỚP TRẠNG THÁI

| Lớp | Là gì | Sống bao lâu | Phạm vi |
|---|---|---|---|
| **Phiên đăng nhập** | Một phiên xác thực của người dùng | Ghi nhớ: 30 ngày trượt theo hoạt động; không ghi nhớ: giới hạn BR-AUTH-18/19 | Một phiên cụ thể; phiên tạm riêng từng tab, không phải mọi phiên của tài khoản |
| **Kết nối** | Một đường truyền đang mở | Tới khi mạng rớt | Một tab |

> **Đã bỏ lớp thứ ba.** Thiết kế cũ có *"quyền phát thiết bị"* — chỉ một tab được thao tác. `DEC-020` đã **bỏ hẳn** khái niệm này cho phần chơi cờ và chat. Chỉ còn **một ngoại lệ duy nhất** cho camera/micro (§4).

---

## 2. PHIÊN ĐĂNG NHẬP

### 2.1 Chính sách

| Mục | Giá trị |
|---|---|
| Checkbox **"Ghi nhớ đăng nhập"** | Có, **mặc định được tick** |
| Tick | Phiên **30 ngày trượt** theo hoạt động chủ động; không gia hạn bởi tín hiệu nền (BR-AUTH-19) |
| Bỏ tick | Phiên tạm theo BR-AUTH-18/DEC-040: reload giữ; 30 phút nhàn rỗi, tối đa 12 giờ; restore có thể giữ phiên còn hạn |
| Phiên ghi nhớ hết hạn 30 ngày không có hoạt động chủ động | Phải đăng nhập lại; tự làm mới token không hồi sinh phiên |

**`SS-01`** — Đây là ứng dụng **có camera và micro**. Phiên bị người khác dùng trên máy chung nghiêm trọng hơn ứng dụng thường, vì họ có thể bật camera/mic **dưới danh nghĩa chủ tài khoản**. Đó là lý do **phải có** checkbox.

**Vòng đời theo [BR-AUTH-18/19](../01-requirements/REQ-AUTH.md):** mở tab mới không nhận phiên tạm; các tab có thể đăng nhập độc lập. Gia hạn chỉ phiên đang dùng, không kéo dài mọi phiên tài khoản. Heartbeat, refresh token, tự nối lại và nhận dữ liệu nền không gia hạn. Reload chính tab giữ phiên còn hợp lệ; restore/duplicate có thể giữ phiên trong giới hạn BR-AUTH-18 (DEC-040).

### 2.2 Phiên bị thu hồi khi

| Nguyên nhân | Phạm vi |
|---|---|
| Đăng xuất (thiết bị này) | Phiên hiện tại |
| Đăng xuất (mọi thiết bị) | **Toàn bộ** phiên |
| Đổi mật khẩu | **Toàn bộ** phiên |
| Hết hạn 30 ngày không có hoạt động gia hạn | Phiên ghi nhớ đó |

**`SS-02`** — Thu hồi chặn thao tác mới ngay tại commit server. Đóng kết nối/thu hồi camera/mic có xác nhận theo BR-MED-24/25; chưa xác nhận thì chưa báo hoàn tất. Áp dụng các phiên trong phạm vi thu hồi. Không nhầm một phiên với toàn bộ phiên của tài khoản.

**`SS-03`** — Quyền được kiểm ở **mỗi thao tác**, không chỉ lúc đăng nhập.

---

## 3. NHIỀU TAB — MỌI TAB ĐỀU DÙNG ĐƯỢC

### 3.1 Quy tắc

| ID | Luật |
|---|---|
| **SS-06** | Mở **bao nhiêu tab cũng được**. **Mọi tab đều tự đồng bộ** theo thời gian thực |
| **SS-07** | **Mọi tab đều thao tác được**: đi cờ · chat cả hai kênh · đầu hàng · xin hoà · xin đi lại · sẵn sàng · xác nhận treo ván · tái đấu · đuổi người xem |
| **SS-08** | Mở nhiều tab **không** tạo thêm ghế trong phòng |
| **SS-09** | **Camera/micro là ngoại lệ duy nhất** — chỉ một tab phát được (§4) |

### 3.2 Vì sao không cần khoá tab

Máy chủ **đã** chống xung đột bằng **ba cơ chế có sẵn**:

```
Tab 1 đi nước ──► máy chủ: phiên bản N → N+1, lượt chuyển sang đối thủ
                            │
Tab 2 đi nước (phiên bản N) ─┘
                            ▼
              ❌ XUNG ĐỘT PHIÊN BẢN  hoặc  ❌ CHƯA TỚI LƯỢT
```

| Cơ chế | Chặn được gì |
|---|---|
| **Kiểm lượt** | Hai nước trong cùng một lượt |
| **Kiểm phiên bản** | Thao tác dựa trên trạng thái cũ |
| **Mã lệnh duy nhất** | Cùng một lệnh gửi nhiều lần |

**`SS-10`** — Đây là lý do `DEC-020` bỏ được khoá tab: nó là lớp bảo vệ **trùng lặp** với ba cơ chế trên.

### 3.3 Kiểm chứng từng loại lệnh

| Lệnh | Hai tab gửi cùng lúc thì sao |
|---|---|
| Đi cờ | Cái đầu áp dụng · cái sau **xung đột phiên bản** hoặc **chưa tới lượt** |
| Đầu hàng | Cái đầu kết thúc ván · cái sau **ván đã kết thúc** |
| Xin hoà / đi lại | Cái đầu tạo đề nghị · cái sau **đã có đề nghị đang chờ** |
| Trả lời đề nghị | Cái đầu áp dụng · cái sau **đề nghị không còn** |
| Sẵn sàng | Cùng kết quả, không tạo hai ván |
| Xác nhận treo ván | Cái đầu gia hạn · cái sau không cộng thêm |
| Tái đấu | Cái đầu ghi phiếu · tạo **đúng một** ván mới |
| Chat | **Cả hai đều gửi được** — đó là hai tin người dùng thật sự gõ |
| Đuổi người xem | Cái đầu thực hiện · cái sau **người đó không còn trong phòng** |

**Không có lệnh nào cần khoá tab.**

---

## 4. NGOẠI LỆ DUY NHẤT — CAMERA VÀ MICRO

### 4.1 Vì sao

**Chính sách một nguồn phát cho mỗi tài khoản, áp dụng mọi tab/trình duyệt/thiết bị:**
- Khả năng chia camera tùy hệ điều hành/trình duyệt, không coi việc phần cứng có chia được là cơ chế phân quyền.
- Hai tab cùng mở micro gây **vọng âm**.
- Phát hai luồng của cùng một người gây **nhầm lẫn** cho người nhận.

### 4.2 Quy tắc — phương án A (`DEC-021`)

| ID | Luật |
|---|---|
| **SS-11** | Tab nào **bật trước** thì **giữ quyền phát** |
| **SS-12** | Tab khác hiện *"Camera đang bật ở tab khác"* + nút **"Chuyển sang tab này"** |
| **SS-13** | Bấm chuyển một nguồn ⇒ xác nhận nguồn cũ dừng/thu hồi trước; nguồn ở tab mới **Tắt**, cần bật thủ công. Chưa xác nhận thì chặn phát; lỗi thì báo rõ + Thử lại (`DEC-033/034`) |
| **SS-14** | Áp dụng **riêng** cho camera và **riêng** cho micro — camera ở tab 1, micro ở tab 2 là hợp lệ |
| **SS-15** | Tab mới **không tự cướp** — phải có thao tác của người dùng |

```
Tab 1 đang phát camera → người dùng bấm Chuyển camera ở tab 2
  → chờ ngắt camera cũ (micro giữ nguyên)
      ├─ xác nhận thành công → camera tab 2 TẮT
      │                       → người dùng chủ động bật → mới phát
      └─ thao tác thất bại → lỗi + Thử lại; tab 2 chưa được phát
```

**`SS-16`** — Chứng cứ, thời hạn, retry và trường hợp tab cũ không phản hồi theo [media-control-contract](../09-technical/media-control-contract.md). Chưa xác nhận nguồn cũ ngắt tại hạ tầng thì không cho nguồn mới thu/phát. Thành công chuyển quyền không đồng nghĩa bật nguồn. Xác nhận muộn không tự bật; thử lại vẫn kiểm lại quyền/trạng thái (`DEC-034`).

---

## 5. KHI NỐI LẠI — THỨ TỰ BẮT BUỘC

| Bước | Hành động |
|---|---|
| 1 | Kiểm **phiên** còn hợp lệ không |
| 2 | Kiểm **vẫn là thành viên** phòng không |
| 3 | Kiểm **vẫn đủ quyền** không (phòng có đổi chế độ? có bị đuổi?) |
| 4 | Trả **toàn bộ trạng thái hiện tại** |
| 5 | Nếu quyền còn hợp lệ và chưa có hạn/kết quả khác đến trước: đánh dấu trực tuyến, huỷ bộ đếm mất kết nối; **giữ hạn chống treo**, WAITING phải ready lại (DEC-030/031) |

**Sau reconnect:** không cấp lại 3 phút, không xoá hạn chống treo đã có (`DEC-030`). Trong WAITING, giữ ghế tối đa 60 giây, offline mất ready, quay lại phải ready lại (`DEC-031`).

**`SS-17`** — Bước 3 **không được bỏ qua**. Trong lúc mất mạng, phòng có thể đã chuyển sang khoá hoặc người đó đã bị đuổi.

### Tín hiệu duy trì

| Mục | Giá trị |
|---|---|
| Client gửi tín hiệu | mỗi **10 giây** |
| Máy chủ coi là mất kết nối | sau **30 giây** không có tín hiệu |
| Ngắt rõ ràng | đánh dấu **ngay** |

**`SS-18`** — Người dùng được coi là **trực tuyến** nếu **ít nhất một tab** còn kết nối. Đóng một tab trong ba tab **không** làm họ ngoại tuyến.

---

## 6. PHẠM VI MEDIA VỀ TẮT

**`SS-19`** — Phạm vi về Tắt sau sự kiện:

| Sự kiện | Phạm vi |
|---|---|
| Tải lại trang | Cả camera và micro |
| Nối lại sau khi mất mạng | Cả camera và micro |
| Chuyển camera hoặc micro sang tab khác | **Chỉ nguồn chuyển** về Tắt, nguồn còn lại giữ tab phát/mức cũ (`DEC-033`) |
| Ván mới bắt đầu (kể cả tái đấu) | Cả camera và micro |
| Đăng xuất rồi đăng nhập lại | Cả camera và micro |

**Vì sao:** media là quyền riêng tư nhạy cảm. Tự bật lại có thể phát hình/tiếng **khi người dùng không ngờ tới**.

---

## 7. MỘT TÀI KHOẢN, MỘT PHÒNG

**`SS-20`** — Một tài khoản chỉ thuộc **một phòng** tại một thời điểm, và **không** vừa ở phòng online vừa có ván với máy.

| Đang có | Muốn làm | Kết quả |
|---|---|---|
| Ở một phòng | Tạo / vào phòng khác | **Từ chối** — phải rời trước |
| Ở một phòng | Chơi với máy | **Từ chối** |
| Có ván với máy | Tạo / vào phòng online | **Từ chối** |
| Có ván với máy | Tạo ván với máy khác | **Từ chối** |

**`SS-21`** — Giao diện phải **hiện rõ** người dùng đang ở phòng nào, kèm nút **quay lại phòng đó**.

> Lưu ý: ràng buộc này theo **tài khoản**, không theo tab. Mở 3 tab **cùng một phòng** là bình thường.

---

## 8. CÁC TÌNH HUỐNG GIAO NHAU

| # | Tình huống | Xử lý |
|---|---|---|
| 1 | Mở 3 tab, đi cờ ở tab 2 | Tab 1 và 3 **thấy ngay**; đều bấm tiếp được |
| 2 | Hai tab bấm đi cờ **cùng lúc** | Một thành công, một **xung đột phiên bản** |
| 3 | Hai tab cùng bấm **đầu hàng** | Ván kết thúc **một lần** |
| 4 | Tab 1 mất mạng, tab 2 còn | Người dùng **vẫn trực tuyến** (`SS-18`) |
| 5 | Đóng tab đang phát camera | Đánh dấu nguồn mất kết nối; tab khác chỉ bật sau xác nhận thu hồi theo SS-16 |
| 6 | Hai tab cùng bấm **"Chuyển sang tab này"** | Đúng một tab thắng; tab kia thấy trạng thái mới |
| 7 | Camera ở tab 1, micro ở tab 2 | **Hợp lệ** (`SS-14`) |
| 8 | Đăng xuất "mọi thiết bị" khi đang chơi | Mọi tab về màn đăng nhập; ván xử theo luật mất kết nối |
| 9 | Phiên hết hạn đúng lúc đang đi nước | Nước đi **từ chối**, báo phiên hết hạn |
| 10 | Nối lại sau khi bị đuổi | **Từ chối**, về sảnh (`SS-17`) |
| 11 | Bỏ tick Ghi nhớ, đóng/khôi phục tab | Tab trống phải login; browser restore có thể giữ session còn hạn. Đăng xuất là bảo đảm chấm dứt; phiên độc lập khác không mất |
| 12 | Bỏ tick, reload chính tab | Giữ phiên nếu còn hợp lệ; media reset theo SS-19 |
| 13 | Chỉ heartbeat/refresh/token reconnect trong 30 ngày | Không dời hạn phiên ứng dụng; hết hạn phải đăng nhập lại (DEC-038) |

---

## 9. TIÊU CHÍ NGHIỆM THU

| ID | Tiêu chí |
|---|---|
| **AC-SS-01** | Mở 3 tab ⇒ **cả ba đồng bộ**; đi cờ ở tab bất kỳ, hai tab kia thấy ngay |
| **AC-SS-02** | **Mọi tab đều** đi cờ / chat / đầu hàng / xác nhận treo ván được |
| **AC-SS-03** | Hai tab đi cờ cùng lúc ⇒ **đúng một** nước được ghi |
| **AC-SS-04** | Hai tab đầu hàng cùng lúc ⇒ **đúng một** kết quả |
| **AC-SS-05** | **Camera chỉ một tab phát được**; tab kia hiện nút chuyển |
| **AC-SS-06** | Bấm chuyển ⇒ xác nhận nguồn cũ dừng trước, nguồn tab mới Tắt; chỉ phát sau thao tác bật riêng; lỗi/chưa xác nhận thì không phát (`DEC-033/034`) |
| **AC-SS-07** | Camera ở tab 1 + micro ở tab 2 ⇒ **hợp lệ** |
| **AC-SS-08** | Hai tab cùng bấm chuyển ⇒ **đúng một** thắng |
| **AC-SS-09** | Mở nhiều tab **không** tạo thêm ghế |
| **AC-SS-10** | Đóng 1 trong 3 tab ⇒ vẫn **trực tuyến** |
| **AC-SS-11** | Đăng xuất "mọi thiết bị" ⇒ mọi kết nối đóng, **camera/mic dừng** |
| **AC-SS-12** | Đổi mật khẩu ⇒ **toàn bộ** phiên bị thu hồi |
| **AC-SS-13** | Phiên đã thu hồi **không dùng được** cho bất kỳ thao tác nào |
| **AC-SS-14** | Không ghi nhớ: reload giữ phiên còn hợp lệ; browser restore/duplicate ghi kết quả thực theo DEC-040; đúng hạn nhàn rỗi/tuyệt đối hoặc sau logout đều chặn; phiên độc lập khác không mất |
| **AC-SS-15** | Ghi nhớ: đóng/mở browser giữ phiên còn hợp lệ; chỉ hoạt động chủ động gia hạn phiên đó, tác vụ nền không gia hạn và không hồi sinh phiên hết hạn (AC-AUTH-11/17…19) |
| **AC-SS-16** | Media về Tắt theo phạm vi SS-19; chuyển camera không reset micro và ngược lại |
| **AC-SS-17** | Nối lại **luôn kiểm tra lại quyền** |
| **AC-SS-18** | Ràng buộc **một tài khoản một phòng** áp dụng cả phòng online lẫn ván với máy |

---

## 10. LIÊN QUAN

[state-machines.md](state-machines.md) · [data-flows.md](data-flows.md) · [../01-requirements/REQ-AUTH.md](../01-requirements/REQ-AUTH.md) · [../01-requirements/REQ-DISCONNECT.md](../01-requirements/REQ-DISCONNECT.md) · [../01-requirements/REQ-MEDIA.md](../01-requirements/REQ-MEDIA.md)

## 11. HỢP ĐỒNG THỜI GIAN VÀ DANH TÍNH

Nguồn chuẩn cho hạn phiên và đăng ký/gia hạn/thu hồi là [auth-provider-config §4/6](../09-technical/auth-provider-config.md). `now == expires_at` từ chối trước gia hạn; heartbeat không gia hạn. Phiên tạm copy bởi browser vẫn là **cùng phiên**, không phải phiên độc lập. CURRENT thu hồi tất cả kết nối mang cùng auth_session_id; ALL mọi phiên tài khoản. Khái niệm “Thiết bị này” trên UI phải giải thích phạm vi phiên, không suy từ fingerprint phần cứng. Media giữ nguồn theo `(user_id, kind)` trên mọi thiết bị; chính sách một phòng không đổi. Mọi mất kết nối tiếp tục theo luật ván, không tự coi hết phiên là đầu hàng.
