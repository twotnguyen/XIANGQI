# REQ-HISTORY-REMATCH — TÁI ĐẤU, LỊCH SỬ VÀ XEM LẠI

**ID yêu cầu:** `R14` · **Trạng thái:** Ready · **Cập nhật:** 2026-09-21
**Căn cứ:** `DEC-032` · Câu 17 phỏng vấn

---

## 1. FEATURE NÀY ĐỂ LÀM GÌ

Ba việc sau khi một ván kết thúc:

| Chức năng | Mô tả |
|---|---|
| **Tái đấu** | Hai người đồng ý chơi ván mới **đổi bên**, trong **cùng phòng** |
| **Lịch sử** | Xem lại danh sách các ván mình đã đánh |
| **Xem lại** | Đi lại từng nước của một ván đã kết thúc |

---

## 2. ACTOR

| Actor | Vai trò |
|---|---|
| **Người chơi của ván** | Đề nghị/đồng ý tái đấu · xem lịch sử ván của mình |
| **Người xem** | Xem lại **ván hiện tại** khi còn trong phòng |
| **Hệ thống** | Tạo ván mới, đổi bên, đóng phòng sau 10 phút |

## 3. PRECONDITIONS

| Hành động | Điều kiện |
|---|---|
| Tái đấu | Phòng ở trạng thái **đã xong** · **còn trong 10 phút** · đúng hai người của ván vừa kết thúc vẫn còn tư cách PLAYER trong phòng; không nhận người đã rời quay lại/thay người (`DEC-032`) |
| Xem lịch sử | Đã đăng nhập; **chỉ xem được ván mình đã chơi** |
| Xem lại trong phòng | Là thành viên phòng và còn quyền |

## 4. TRIGGER

Ván kết thúc · bấm **Tái đấu** · mở trang lịch sử · bấm vào một ván để xem lại.

---

## 5. MAIN FLOWS

### 5.1 Tái đấu

| Bước | Hành động |
|---|---|
| 1 | Ván kết thúc; cả hai thấy nút **Tái đấu** và bộ đếm **10 phút** |
| 2 | Người chơi A bấm **Tái đấu** ⇒ ghi nhận đồng ý của A |
| 3 | B thấy *"Đối thủ muốn tái đấu"* |
| 4 | B cũng bấm **Tái đấu** |
| 5 | Hệ thống tạo **ván mới**: **đổi bên** · **giữ** cấu hình thời gian · bàn cờ về thế ban đầu |
| 6 | **Giữ lại người xem** nếu họ vẫn còn quyền |
| 7 | Chat **kênh mới, trống**; camera/mic **về Tắt** |
| 8 | Bộ đếm đóng phòng **bị huỷ** |

**`BR-HIS-01`** — Tái đấu tạo **ván MỚI**, **không phải** ván cũ chơi tiếp. Ván cũ giữ nguyên trong lịch sử.

### 5.2 Xem lịch sử

Mở trang lịch sử ⇒ danh sách các ván đã chơi, mỗi trang tối đa **20**, mới nhất trước. Mỗi dòng: đối thủ · bên mình cầm · kết quả · nguyên nhân kết thúc · thời điểm.

### 5.3 Xem lại một ván

Chọn một ván ⇒ bàn cờ **chỉ đọc**, có nút **tới / lui / về đầu / về cuối** từng nước.

---

## 6. ALTERNATIVE FLOWS

- **ALT-1 — Một bên không muốn tái đấu:** bấm **Rời phòng**. Nếu là chủ phòng thì phòng **đóng**.
- **ALT-2 — Hết 10 phút:** phòng **tự đóng**; không tái đấu được nữa.
- **ALT-3 — Ván bị gián đoạn:** **không** chơi tiếp được, nhưng **tái đấu được** (tạo ván mới).
- **ALT-4 — Người xem xem lại:** xem lại được **ván hiện tại** khi còn trong phòng. **Không** xem được ván cũ hơn.
- **ALT-5 — Ván có đi lại:** xem lại mặc định theo **nhánh hiệu lực cuối cùng**; có nhãn ghi rõ **"ván này có đi lại"**.

---

## 7. EXCEPTION FLOWS

| Tình huống | Phản hồi |
|---|---|
| Bấm tái đấu khi phòng **đã đóng** | *"Phòng không còn tồn tại"* |
| Bấm tái đấu **đúng hoặc quá 10 phút** | Từ chối; phòng đã đóng |
| Bấm tái đấu khi đối thủ **đã rời** | Từ chối; không đủ hai người chơi |
| Bấm tái đấu cho **ván cũ** (đối thủ đã tạo ván mới) | Từ chối — vòng tái đấu đã qua |
| Gửi lệnh tái đấu **lặp lại** | Chỉ **một** ván mới được tạo |
| Xem lịch sử **ván của người khác** | **Từ chối** |
| Xem lại ván **không phải của mình** và **không** ở trong phòng | **Từ chối** |
| **Người xem** cố tái đấu | **Từ chối** |
| Hai tab cùng bấm tái đấu | Ghi **một** phiếu, tạo **một** ván mới |

---

## 8. POSTCONDITION

| Kết cục | Trạng thái |
|---|---|
| Cả hai đồng ý tái đấu | **Đúng một** ván mới · bên đã đổi · thời gian giữ nguyên · phòng về **đang chơi** · bộ đếm đóng phòng huỷ |
| Chỉ một bên đồng ý | Ghi nhận, chờ bên kia; phòng vẫn **đã xong** |
| Từ chối / hết giờ | Phòng **đóng** sau 10 phút |
| Xem lịch sử | Không đổi gì |

---

## 9. BUSINESS RULES

| ID | Luật |
|---|---|
| **BR-HIS-01** | Tái đấu tạo **ván mới**, không phải ván cũ tiếp tục |
| **BR-HIS-02** | Tái đấu **đổi bên**: ai cầm đỏ ván trước thì cầm đen ván sau |
| **BR-HIS-03** | Tái đấu **giữ nguyên** cấu hình thời gian |
| **BR-HIS-04** | Cần **cả hai** người chơi đồng ý |
| **BR-HIS-05** | Chỉ tái đấu khi máy chủ kiểm dưới khoá tại thời điểm **nhỏ hơn** hạn kết thúc ván + 10 phút. Đúng hạn hoặc sau hạn đóng phòng; gói gửi sớm nhưng tới lượt xử lý sau hạn cũng bị từ chối (`DEC-042`) |
| **BR-HIS-06** | Tái đấu **huỷ** bộ đếm đóng phòng |
| **BR-HIS-07** | **Giữ lại người xem** nếu họ vẫn đủ quyền |
| **BR-HIS-08** | Ván mới có **kênh chat mới, trống**; camera/mic **về Tắt** |
| **BR-HIS-09** | Hai người bấm **cùng lúc** ⇒ tạo **đúng một** ván mới |
| **BR-HIS-10** | Sau khi ván mới đã tạo, lệnh tái đấu cho **vòng cũ** bị **từ chối** |
| **BR-HIS-11** | Ván **gián đoạn** tái đấu được, nhưng **không chơi tiếp** được |
| **BR-HIS-12** | Lịch sử ván **chỉ người chơi của ván đó** xem được |
| **BR-HIS-13** | **Không** công khai lịch sử theo username. Không ai tra được ván của người khác |
| **BR-HIS-14** | Người xem chỉ xem lại được **ván hiện tại** khi còn trong phòng |
| **BR-HIS-15** | Xem lại theo **nhánh hiệu lực cuối cùng**; nhánh bị đi lại **không** hiện trong phần phát lại |
| **BR-HIS-16** | Ván có đi lại phải có **nhãn ghi rõ** |
| **BR-HIS-17** | Bàn cờ khi xem lại là **chỉ đọc** |
| **BR-HIS-18** | Lịch sử **không bị sửa** sau khi ván kết thúc |
| **BR-HIS-19** | Mỗi trang lịch sử tối đa **20** ván, mới nhất trước |
| **BR-HIS-20** | **Không** có trình biên tập cây biến thể |
| **BR-HIS-21** | Chỉ hai PLAYER của ván vừa kết thúc vẫn ở lại được tái đấu. FINISHED không nhận PLAY mới; người đã rời muốn chơi với đối thủ khác phải tạo phòng mới (`DEC-032`) |

> **`BR-HIS-15` là bài học từ lần trước:** phần phát lại từng hiện cả nhánh đã bị bỏ, gây hiểu sai diễn biến ván.

---

## 10. PERMISSIONS

| Hành động | Người ngoài | Người xem | Người chơi của ván | Tab khác của họ |
|---|:---:|:---:|:---:|:---:|
| Bấm tái đấu | ❌ | ❌ | ✅ | ✅ |
| Thấy trạng thái tái đấu | ❌ | ✅ | ✅ | ✅ |
| Xem lại **ván hiện tại** trong phòng | ❌ | ✅ | ✅ | ✅ |
| Xem **lịch sử ván của mình** | ❌ | ✅ (của họ) | ✅ | ✅ |
| Xem lịch sử **của người khác** | ❌ | ❌ | ❌ | ❌ |

---

## 11. UI LIÊN QUAN

`SCR-MATCH-RESULT` · `SCR-HISTORY` · `SCR-REPLAY`

```
┌────────────────────────────────────┐
│        🏆 Bạn thắng!               │
│        Chiếu hết                   │
│                                    │
│  Phòng đóng sau 08:42              │
│                                    │
│  [ Xem lại ]  [ Tái đấu ]          │
│  [ Rời phòng ]                     │
│                                    │
│  ⏳ Đang chờ đối thủ đồng ý…       │
└────────────────────────────────────┘
```

**Trạng thái bắt buộc:**

| Màn hình | Trạng thái |
|---|---|
| Kết quả | Thắng / thua / hoà / **gián đoạn** — ghi rõ **nguyên nhân** bằng chữ |
| Kết quả | Bộ đếm 10 phút · đang chờ đối thủ · đối thủ đã rời (nút tái đấu **vô hiệu**) |
| Lịch sử | Đang tải · **trống** (*"Bạn chưa chơi ván nào"*) · lỗi + thử lại |
| Xem lại | Đang tải · nút tới/lui **vô hiệu** ở đầu/cuối · nhãn *"ván này có đi lại"* |

---

## 12. STATES

```
VÁN KẾT THÚC ──► PHÒNG "ĐÃ XONG" (đếm 10 phút)
                        │
        ┌───────────────┼──────────────────┐
        ▼               ▼                  ▼
   A đồng ý       cả hai đồng ý       hết 10 phút /
   (chờ B)              │              chủ phòng rời
        │               ▼                  │
        └────────► VÁN MỚI                 ▼
                   (đổi bên)          PHÒNG ĐÓNG
```

---

## 13. REALTIME BEHAVIOR

| Sự kiện | Ai tạo | Máy chủ kiểm gì | Ai nhận | UI đổi gì |
|---|---|---|---|---|
| Ván kết thúc | Hệ thống | — | Cả phòng | Màn kết quả + bộ đếm 10 phút |
| Một bên đồng ý tái đấu | Người chơi | Là người chơi · phòng đã xong · còn trong 10 phút · **đúng vòng** | Cả phòng | Bên kia thấy *"Đối thủ muốn tái đấu"* |
| **Cả hai** đồng ý | Hệ thống | Cả hai vẫn là người chơi | Cả phòng | Bàn cờ mới, **bên đã đổi**; chat trống; media về Tắt |
| Một bên rời | Người chơi | — | Cả phòng | Nút tái đấu **vô hiệu**; nếu là chủ phòng thì phòng đóng |
| Hết 10 phút | Hệ thống | Phòng **chưa** tái đấu | Cả phòng | Phòng đóng, mọi người về sảnh |

---

## 14. EDGE CASES

| # | Tình huống | Xử lý |
|---|---|---|
| 1 | Hai người bấm tái đấu **cùng lúc** | Tạo **đúng một** ván mới (`BR-HIS-09`) |
| 2 | Bấm tái đấu **hai lần** | Chỉ ghi nhận một lần; không tạo hai ván |
| 3 | Bấm tái đấu đúng lúc hết 10 phút | Theo BR-HIS-05: máy chủ kiểm dưới khoá **trước** hạn; đúng hạn hoặc sau hạn đóng phòng |
| 4 | Bộ đếm hết đúng lúc ván mới vừa tạo | Bộ đếm **không** đóng phòng đã tái đấu (`BR-HIS-06`) |
| 5 | A đồng ý, B rời, B quay lại | B đã chấm dứt membership nên không được nhận lại bằng PLAY ở FINISHED; tái đấu bị từ chối. Nối lại mạng khi vẫn là thành viên không phải trường hợp này (`DEC-032`) |
| 6 | Gửi lệnh tái đấu cho ván **cũ** sau khi ván mới đã tạo | **Từ chối** (`BR-HIS-10`) |
| 7 | Người xem còn trong phòng khi tái đấu | **Được giữ lại** nếu còn quyền (`BR-HIS-07`) |
| 8 | Người xem bị đuổi rồi tái đấu | **Không** quay lại được |
| 9 | Tái đấu nhiều lần liên tiếp | Mỗi lần đổi bên lại; mỗi ván có ID riêng |
| 10 | Ván **gián đoạn** rồi tái đấu | Cho phép; ván mới bình thường |
| 11 | Ván có **đi lại** rồi xem lại | Chỉ hiện **nhánh hiệu lực**, có nhãn (`BR-HIS-15`) |
| 12 | Xem lịch sử ván của người khác bằng cách đoán mã | **Từ chối** (`BR-HIS-12`) |
| 13 | Người xem muốn xem lại ván **cũ hơn** trong phòng | **Không được** — chỉ ván hiện tại (`BR-HIS-14`) |
| 14 | Tài khoản chưa chơi ván nào | Lịch sử hiện trạng thái **trống** |
| 15 | Ván mới bắt đầu nhưng camera cũ vẫn bật | **Về Tắt** (`BR-HIS-08`) |

---

## 15. ACCEPTANCE CRITERIA

| ID | Tiêu chí |
|---|---|
| **AC-HIS-01** | Cả hai đồng ý ⇒ tạo **đúng một** ván mới |
| **AC-HIS-02** | Ván mới **đổi bên** so với ván trước |
| **AC-HIS-03** | Ván mới **giữ** cấu hình thời gian |
| **AC-HIS-04** | Bàn cờ ván mới ở **thế ban đầu** |
| **AC-HIS-05** | Hai người bấm cùng lúc ⇒ **một** ván mới |
| **AC-HIS-06** | Lệnh tái đấu **vòng cũ** sau khi có ván mới ⇒ **từ chối** |
| **AC-HIS-07** | Tái đấu **huỷ** bộ đếm; phòng **không** bị đóng nhầm |
| **AC-HIS-08** | Phòng **tự đóng** sau đúng 10 phút nếu không tái đấu |
| **AC-HIS-09** | Người xem **được giữ lại** qua tái đấu nếu còn quyền |
| **AC-HIS-10** | Ván mới ⇒ chat **trống**, camera/mic **Tắt** |
| **AC-HIS-11** | Lịch sử **chỉ** hiện ván của chính mình |
| **AC-HIS-12** | Xem ván của người khác ⇒ **từ chối**, kể cả khi biết mã ván |
| **AC-HIS-13** | Xem lại chỉ hiện **nhánh hiệu lực** sau khi có đi lại |
| **AC-HIS-14** | Ván có đi lại có **nhãn ghi rõ** |
| **AC-HIS-15** | Bàn cờ khi xem lại là **chỉ đọc** |
| **AC-HIS-16** | Người xem xem lại được **ván hiện tại**, **không** xem được ván cũ |
| **AC-HIS-17** | **Người xem không tái đấu được** kể cả khi giả mạo dữ liệu |
| **AC-HIS-18** | Phân trang lịch sử **20 ván**, mới nhất trước |
| **AC-HIS-19** | Ván **gián đoạn** tái đấu được nhưng **không chơi tiếp** được |
| **AC-HIS-20** | B chủ động rời FINISHED; B hoặc C có vé PLAY hợp lệ vẫn không nhận ghế/tái đấu được. Thành viên cũ chỉ mất mạng/tải lại vẫn đồng bộ được nếu còn quyền; không được chặn nhầm như join mới |

---

### Xem lại trong phòng và biên thời gian

**BR-HIS-22** — Người xem bấm Xem lại từ kết quả mở chế độ xem lại ngay trong ngữ cảnh phòng hiện tại; không đi qua danh sách lịch sử cá nhân. Chỉ phòng FINISHED và ván hiện tại được xem lại theo quyền phòng. Khi tái đấu, quay về ván mới; khi rời/thu hồi/phòng đóng, dừng xem lại và về sảnh. Mỗi tải dữ liệu đều kiểm lại quyền. PLAYER vẫn mở được ván của mình từ Lịch sử.

| ID | Tiêu chí |
|---|---|
| **AC-HIS-21** | Kiểm tái đấu ở hạn −1ms, đúng hạn, +1ms và lệnh gửi sớm nhưng chờ khoá quá hạn: chỉ lần kiểm trước hạn còn đủ điều kiện thành công; timer cũ không đóng ván mới |
| **AC-HIS-22** | SPECTATOR từ kết quả mở xem lại ván hiện tại; tái đấu/rời/thu hồi/đóng phòng dừng quyền truy cập theo BR-HIS-22; giả mạo ván cũ bị từ chối |

## 16. DEPENDENCY

[REQ-ROOM](REQ-ROOM.md) · [REQ-MATCH](REQ-MATCH.md) · [REQ-SPECTATOR](REQ-SPECTATOR.md) · [REQ-CHAT](REQ-CHAT.md) · [REQ-MEDIA](REQ-MEDIA.md) · [REQ-GAME-ACTIONS](REQ-GAME-ACTIONS.md) · [REQ-CLOCK](REQ-CLOCK.md)

## 17. OPEN QUESTIONS

**Không còn.**
