# MÔ HÌNH DỮ LIỆU NGHIỆP VỤ

**ID:** `DM` · **Trạng thái:** v1 · **Cập nhật:** 2026-09-21

> Tài liệu này mô tả **thực thể nghiệp vụ và quan hệ**, **không** mô tả bảng, cột hay kiểu dữ liệu. Thiết kế kỹ thuật nằm ở [../09-technical/](../09-technical/).

---

## 1. SƠ ĐỒ TỔNG THỂ

```
                         ┌──────────────┐
                         │  NGƯỜI DÙNG  │
                         └──┬────────┬──┘
              ┌─────────────┘        └──────────────┐
              ▼                                     ▼
      ┌───────────────┐                    ┌────────────────┐
      │  QUAN HỆ BẠN  │                    │  PHIÊN ĐĂNG    │
      │   (1 cặp = 1) │                    │     NHẬP       │
      └───────────────┘                    └────────────────┘
              │
              ▼
      ┌───────────────┐   1        n   ┌──────────────────┐
      │    PHÒNG      ├────────────────┤  THÀNH VIÊN      │
      │               │                │  (vai trò+bên)   │
      └───┬───────┬───┘                └──────────────────┘
          │       │
          │       ├──────────► LỜI MỜI / MÃ / LINK
          │       ├──────────► DANH SÁCH CHẶN  ⭐
          │       ├──────────► VÒNG CHAT → NHÓM NGƯỜI ĐỌC → TIN
          │       └──────────► PHIẾU TÁI ĐẤU
          │
          │ 1        n
          ▼
      ┌───────────────┐
      │     VÁN       │  (phòng có NHIỀU ván nối tiếp qua tái đấu)
      └───┬───┬───┬───┘
          │   │   │
          │   │   └──────────► MỨC CHIA SẺ MEDIA (mỗi người chơi)
          │   │
          │   │                (ván liên kết vòng chat đã có của phòng)
          │   │
          │   ├──────────────► ĐỀ NGHỊ (hoà / đi lại — tối đa 1 đang chờ)
          │   │
          │   ├──────────────► BIÊN LAI LỆNH (chống gửi trùng)
          │   │
          │   └──────────────► TRẠNG THÁI TREO VÁN ⭐
          │
          ▼
      ┌───────────────┐
      │   NƯỚC ĐI     │  (cây: mỗi nước có nước cha)
      └───────────────┘
```

⭐ = thực thể **mới** từ đợt audit BA.

---

## 2. CÁC THỰC THỂ

### 2.1 Người dùng

| Thuộc tính | Ghi chú |
|---|---|
| Username | **Duy nhất**, chữ thường, **bất biến** |
| Email | **Không lộ** cho người khác |
| Đã xác minh email | Chưa xác minh thì không vào được phòng |
| Hồ sơ đã xác minh | Mốc server xác nhận tên/metadata sau chứng minh sở hữu email hoặc onboarding Google; không tin dữ liệu người dùng tự khai trước xác minh (DEC-040) |
| Tên hiển thị | Sửa được, cho phép tiếng Việt |
| Trạng thái online | Chỉ **bạn bè** thấy |

### 2.2 Quan hệ bạn bè

**Một cặp người dùng = đúng một quan hệ**, không phân biệt ai gửi trước.
Trạng thái: *đang chờ* → *bạn bè*, hoặc bị huỷ.

### 2.3 Phòng

| Thuộc tính | Ghi chú |
|---|---|
| Tên | 1–60 ký tự |
| Chủ phòng | **Bất biến** — không chuyển quyền |
| Chế độ riêng tư | Công khai / Cần mã / Khoá |
| Cấu hình thời gian | **Khoá cứng** khi ván bắt đầu |
| Trạng thái | Chờ → Đang chơi → Đã xong → Đã đóng |
| Ván hiện tại | Trỏ tới ván đang/vừa diễn ra |
| Phiên bản cấu hình | Tăng khi đổi thời gian/bên; ready xác nhận đúng phiên bản |
| Vòng chat hiện tại | Được tạo ngay khi tạo phòng, trước Match |

> **Phòng sống lâu hơn ván.** Một phòng chứa **nhiều ván** nối tiếp qua tái đấu.

### 2.4 Thành viên phòng

| Thuộc tính | Ghi chú |
|---|---|
| Vai trò | Người chơi / Người xem |
| Bên cầm | Đỏ / Đen — **chỉ** người chơi có |
| Lần nhận ghế | Định danh mới khi leave/rejoin, không tái sử dụng |
| Đã sẵn sàng | **Chỉ** khi phòng đang chờ; gắn cấu hình xác nhận và phiên bản ready để chống lệnh cũ |
| Đang online | Có bộ đếm hạn riêng |

**Ràng buộc:** tối đa **2** người chơi và **5** người xem mỗi phòng · **một** người chơi mỗi bên · **một** người dùng chỉ là thành viên của **một** phòng.

### 2.5 Danh sách chặn của phòng ⭐

Ghi những người **bị đuổi** khỏi phòng. Người trong danh sách **không vào lại được phòng đó** bằng bất kỳ đường nào. **Xoá khi phòng đóng.** Phạm vi **chỉ trong một phòng** — không phải chặn toàn hệ thống. (`DEC-015`)

### 2.6 Lời mời / mã / link

| Thuộc tính | Ghi chú |
|---|---|
| Loại | Mời trực tiếp / mã / link |
| Quyền | Chơi (`PLAY`) hoặc Xem (`WATCH`) |
| Người nhận | **Chỉ** lời mời trực tiếp mới có |
| Hạn | 10 phút (trực tiếp) · 24 giờ (mã/link) |
| Trạng thái | Còn hiệu lực / đã dùng / hết hạn / đã thu hồi |

**Mã bí mật không bao giờ** nằm trong dữ liệu phòng gửi cho thành viên khác.

### 2.7 Ván

| Thuộc tính | Ghi chú |
|---|---|
| Thuộc phòng | **Rỗng** nếu là ván với máy |
| Loại | Online / Với máy |
| Người chơi đỏ, đen | Với máy thì một bên là máy |
| Cấp độ máy | Chỉ ván với máy |
| Trạng thái | Đang chơi → Kết thúc / Gián đoạn |
| Kết quả | Người thắng (có thể **không ai**) + **nguyên nhân** |
| **Phiên bản** | **Chỉ tăng**, không bao giờ giảm |
| Thế cờ hiện tại | Bàn cờ + bên đến lượt |
| Số dư đồng hồ | Rỗng nếu không giới hạn |
| Nhánh hiệu lực | Danh sách nước đi **đang có hiệu lực** |

### 2.8 Nước đi

**Cấu trúc cây** — mỗi nước trỏ tới **nước cha**.

| Thuộc tính | Ghi chú |
|---|---|
| Nước cha | Rỗng nếu là nước đầu |
| Bên đi, ô đi, ô đến | |
| Thuộc nhánh hiệu lực | Nước bị đi lại **vẫn còn**, chỉ **không** nằm trên nhánh hiệu lực |

> **Vì sao là cây, không phải danh sách:** sau khi đi lại, người chơi đi một nước **khác** từ cùng một điểm. Mô hình danh sách phẳng sẽ gây xung đột — đây chính là lỗi đã xảy ra lần trước.

### 2.9 Đề nghị

Tối đa **một** đề nghị đang chờ mỗi ván. Loại: hoà / đi lại. Hạn **30 giây**. Bị vô hiệu khi có nước đi mới.

### 2.10 Biên lai lệnh

Ghi mọi lệnh **đã xử lý**: mã lệnh · loại · **dấu vân tay nội dung** · phiên bản đã áp dụng · kết quả.

| Trường hợp | Xử lý |
|---|---|
| Cùng mã, **cùng** nội dung | Trả **kết quả cũ**, không làm lại |
| Cùng mã, **khác** nội dung | **Từ chối** |

### 2.11 Trạng thái treo ván ⭐

| Thuộc tính | Ghi chú |
|---|---|
| Đến lượt từ lúc nào | Mốc đếm 3 phút |
| **Số lần gia hạn liên tiếp** | **Reset về 0** khi đi được một nước |
| Giai đoạn | Bình thường / đang hỏi / đang đếm ngược |
| Hạn chót | Thời điểm kết thúc ván nếu không xác nhận |

Chỉ tồn tại ở ván **online** và **không giới hạn thời gian** (`DEC-010`, `DEC-011`).

### 2.12 Tin nhắn

| Thuộc tính | Ghi chú |
|---|---|
| Ngữ cảnh tin | Vòng chat thuộc phòng, tạo trước Match; ván đầu dùng lại vòng, tái đấu tạo vòng mới (DEC-044) |
| **Kênh** | PLAYERS riêng / ROOM chung; client chọn kênh, server kiểm quyền theo vai trò và nhóm người đọc |
| Nhóm người đọc riêng | Snapshot bất biến user + lần nhận ghế lúc gửi; thay người mở nhóm mới, không cấp quyền ngược thời gian |
| Phạm vi người đọc tin riêng | Phải phân biệt tin A–B với tin A–C khi C thay B; vai trò PLAYER hiện tại không tự cấp quyền đọc tin của cặp trước (`BR-CHT-25`) |
| Chuyển sang ván đầu | Giữ tin phòng chờ theo quyền đọc; không mất tin/nhân đôi hoặc mở quyền cặp cũ (`BR-CHT-26`) |
| Mã tin của client | Duy nhất trong (vòng chat, người gửi); cùng mã khác nội dung/kênh bị từ chối |
| Thứ tự | Số thứ tự tăng trong vòng chat do server cấp |

Lưu **30 ngày**. **Không** sửa, **không** xoá.

Chi tiết bảng, ràng buộc, participant bất biến, chống trùng, phân trang và RLS ở [room-chat-contract](../09-technical/room-chat-contract.md) §4–5. Không đổi tin sang Match mới; chuyển ván đầu chỉ liên kết vòng chat, còn tái đấu tạo vòng mới trống. Thu hồi thành viên cắt đọc/gửi nhưng không xoá tin đã gửi của người khác.

### 2.13 Mức chia sẻ media

Mỗi **người chơi** trong mỗi **ván** có: mức camera · mức micro · phiên bản (chống ghi đè khi đổi cùng lúc).

**Mặc định cả hai là Tắt.** Reset ở **mỗi ván**. Mỗi nguồn có mức mong muốn, mức đã được hạ tầng xác nhận và phiên bản; APPLYING/APPLIED/FAILED không đồng nghĩa nhau. Transport giữ một bản mỗi thế hệ, không ghi đè địa chỉ cũ trước thu hồi. Job media giữ operation, transport cũ, hạn, lease và kết quả xác nhận bền vững; khởi động lại tiếp tục việc chưa hoàn tất. FAILED giữ chặn cấp quyền mới, không tự báo đã áp dụng. Schema ở ISSUE-041 và [media-control-contract](../09-technical/media-control-contract.md).

### 2.14 Phiếu tái đấu

Ghi ai đã đồng ý tái đấu cho **vòng hiện tại**. Cả hai đồng ý ⇒ tạo **đúng một** ván mới. Xoá khi ván mới được tạo hoặc phòng đóng.

### 2.15 Quyền phát thiết bị tab

Mọi tab được thao tác ván/chat theo DEC-020. Chỉ quyền phát **từng nguồn camera/micro** độc quyền một tab; hai nguồn có thể ở hai tab khác nhau. Thế hệ nguồn tăng khi chuyển, nguồn cũ mất quyền; quy trình theo REQ-MEDIA/SS, không dùng nó làm guard đi cờ/chat.


Mỗi nguồn giữ tab phát hiện hành, phiên ứng dụng, thế hệ sở hữu và thao tác đang chuyển. Trạng thái IDLE/STOPPING/APPLIED/ERROR/CANCELLED; STOPPING cần đích chuyển và deadline, ERROR giữ chặn để nguồn mới không phát trước xác nhận dừng nguồn cũ. APPLIED sau chứng cứ hạ tầng, nguồn mới vẫn OFF. Hai nguồn độc lập. Contract trường chính xác ở ISSUE-042 (`client_controls`) và media-control-contract.

### 2.16 Phiên ứng dụng

Mỗi phiên Auth đã xác minh ánh xạ đúng một phiên ứng dụng, không lấy định danh phiên từ client. Có chế độ Ghi nhớ/Tạm, thời điểm đăng nhập, hoạt động cuối, hạn không hoạt động, hạn tuyệt đối (nếu có) và mốc thu hồi. Thời điểm tạo và hoạt động đầu lấy đúng thời điểm sign-in đáng tin từ Auth qua helper server giới hạn quyền; hạn đầu tính từ sign-in, không từ lúc bootstrap đến muộn. Bootstrap phiên đã quá hạn bị từ chối, không gia hạn lại. Ghi nhớ: hạn không hoạt động 30 ngày; Tạm: 30 phút không hoạt động và tối đa 12 giờ. Đúng hạn hết hiệu lực; kiểm trước gia hạn và mọi lệnh. Refresh/heartbeat/nhận sự kiện/reconnect nền không là hoạt động gia hạn. Logout CURRENT thu hồi phiên hiện tại trên mọi tab dùng cùng credential, ALL thu hồi mọi phiên tài khoản. Tombstone ngăn refresh/đăng ký lại hồi sinh phiên đã thu hồi; thời gian giữ theo khả năng refresh và hạn JWT thực, không mặc định 24 giờ. Chi tiết nguồn chuẩn [auth-provider-config §4/6](../09-technical/auth-provider-config.md).

### 2.17 Công việc thu hồi phiên

Một operation bảo mật ghi lý do PASSWORD_CHANGED/LOGOUT, phạm vi CURRENT/ALL, snapshot bất biến các phiên Auth đích, mốc thu hồi tại commit, trạng thái PENDING/RUNNING/DONE/FAILED, lần thử, lease và lỗi không chứa secret. CURRENT có đúng một phiên đích; ALL có thể không có phiên tại snapshot; PASSWORD_CHANGED luôn dùng ALL. Người dùng/lý do/phạm vi/snapshot/mốc thu hồi không đổi sau khi tạo: cùng mã operation và cùng nội dung trả job cũ, khác nội dung bị CONFLICT; retry chỉ đổi trạng thái, lease và lần thử. ALL chặn bootstrap khi barrier chưa hoàn tất. Socket/media dùng đúng snapshot để không thu hồi nhầm phạm vi; nhà cung cấp Auth được thu hồi theo scope. Fence phiên được ghi bền vững trước khi gọi dịch vụ ngoài; callback/job lặp không phục hồi quyền. Đổi password kể cả gọi Auth trực tiếp phải đồng thời fence app session và ghi công việc thu hồi. Không lưu mật khẩu, hash mật khẩu hay token trong job. Schema và bằng chứng trigger thực ở ISSUE-042; quy trình retry/restart và chặn login mới khi barrier chưa xong theo auth-provider-config §6.

---

## 3. BẢY RÀNG BUỘC KHÔNG BAO GIỜ ĐƯỢC PHÁ

| # | Ràng buộc | Vì sao |
|---|---|---|
| 1 | Một người dùng ⇒ **một phòng** | `BR-ROOM-07` |
| 2 | Một phòng ⇒ tối đa **2 người chơi**, **5 người xem** | `BR-ROOM-01` |
| 3 | Một bên (đỏ/đen) ⇒ **một** người chơi | `BR-ROOM-01` |
| 4 | Phiên bản ván **chỉ tăng** | `BR-MAT-05` |
| 5 | Một ván ⇒ tối đa **một** đề nghị đang chờ | `BR-ACT-04` |
| 6 | (ván, người gửi, mã lệnh) ⇒ **duy nhất** | `BR-MAT-06` |
| 7 | Một ván ⇒ **một** kết quả, ghi **một lần** | `BR-MAT-11` |

**Ràng buộc 2 và 3 phải được kiểm trong cùng thao tác nhận người vào**, không phải kiểm trước rồi mới nhận — nếu không, hai người xin cùng lúc sẽ vượt trần.

---

## 4. DỮ LIỆU GIỮ BAO LÂU

| Dữ liệu | Giữ |
|---|---|
| Người dùng, hồ sơ, quan hệ bạn bè | **Vô thời hạn** |
| Ván và nước đi | **Vô thời hạn** (phục vụ xem lại) |
| Tin nhắn | **30 ngày** |
| Lời mời trực tiếp | Xoá khi hết hạn / đã dùng / phòng đóng |
| Mã và link | 24 giờ hoặc tới khi thu hồi |
| Danh sách chặn của phòng | Tới khi **phòng đóng** |
| Phiếu tái đấu | Tới khi tạo ván mới hoặc phòng đóng |
| Biên lai lệnh | Theo vòng đời ván; biên lai lệnh phòng tới CLOSED |
| Phiên ứng dụng / tombstone | Giữ đến khi phiên Auth không thể refresh và mọi JWT cũ đã hết hạn; không xoá sớm khi job chưa hoàn tất |
| Job bảo mật / media | Giữ ít nhất đến hoàn tất thu hồi và không còn transport/credential cũ có hiệu lực; không xoá dữ liệu cần retry |
| Phòng | Chuyển **đã đóng**, giữ để tra lịch sử |

**Chưa có chức năng xoá tài khoản.** Nếu mở công khai, phải quyết định riêng: xoá thì lịch sử ván của **đối thủ** xử lý ra sao?

---

## 5. LIÊN QUAN

[data-flows.md](data-flows.md) · [state-machines.md](state-machines.md) · [session-state.md](session-state.md) · [../01-requirements/](../01-requirements/) · [../09-technical/](../09-technical/)
