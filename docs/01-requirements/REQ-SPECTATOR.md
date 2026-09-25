# REQ-SPECTATOR — NGƯỜI XEM

**ID yêu cầu:** `R04`, `R18` · **Trạng thái:** Ready · **Cập nhật:** 2026-09-21
**Căn cứ:** Câu 7, 8 phỏng vấn · `DEC-004` `DEC-005` `DEC-013` `DEC-014` `DEC-015`
**Phụ thuộc:** [REQ-ROOM](REQ-ROOM.md) · [REQ-INVITE](REQ-INVITE.md) · [REQ-CHAT](REQ-CHAT.md) · [REQ-MEDIA](REQ-MEDIA.md)

---

## 1. FEATURE NÀY ĐỂ LÀM GÌ

Cho phép **tối đa 5 người** vào xem hai người đang đánh cờ theo thời gian thực, có **kênh chat chung** để bàn luận, và nhận được camera/mic của người chơi **nếu người đó cho phép**.

Đồng thời bảo vệ người chơi: kiểm soát ai vào xem được, thu hồi quyền khi cần, và **đuổi được người xem quấy rối**.

---

## 2. ACTOR

| Actor | Vai trò |
|---|---|
| **Người dùng** | Người muốn vào xem |
| **Người xem** | Đã vào phòng với vai trò xem |
| **Người chơi** (cả hai) | Có quyền **đuổi** người xem (`DEC-014`) |
| **Chủ phòng** | Ngoài quyền người chơi, còn đổi được chế độ riêng tư và mã xem |
| **Hệ thống** | Đếm sức chứa, thu hồi quyền, giải phóng ghế khi mất kết nối |

---

## 3. PRECONDITIONS

| # | Điều kiện |
|---|---|
| 1 | Đã **đăng nhập** và hoàn tất onboarding (`DEC-006` — không hỗ trợ khách) |
| 2 | **Chưa** ở phòng nào khác |
| 3 | Phòng tồn tại, chưa đóng |
| 4 | Phòng còn **ghế xem trống** (< 5 người) |
| 5 | Có **quyền vào** theo chế độ riêng tư của phòng (§5) |
| 6 | **Không** nằm trong danh sách chặn của phòng đó (`DEC-015`) |

---

## 4. TRIGGER

Người dùng bấm vào phòng ở sảnh · nhập mã xem · mở link mời xem.

---

## 5. MAIN FLOW — VÀO XEM

| Bước | Ai | Hành động |
|---|---|---|
| 1 | Người dùng | Chọn phòng / nhập mã / mở link |
| 2 | Hệ thống | Kiểm tra **theo thứ tự**: đăng nhập → chưa ở phòng khác → phòng còn mở → không bị chặn → có quyền theo chế độ → còn ghế trống |
| 3 | Hệ thống | Nhận vào phòng với vai trò **người xem** |
| 4 | Hệ thống | Gửi trạng thái bàn cờ hiện tại + lịch sử **kênh chung** của ván đang diễn ra |
| 5 | Hệ thống | Cấp quyền nhận camera/mic **chỉ với** những người chơi đang chia sẻ cho người xem |
| 6 | Hệ thống | Báo cho cả phòng biết số người xem đã đổi |

### 5.1 Vào xem theo từng chế độ phòng

| Chế độ | Có hiện ở sảnh | Vào xem bằng cách nào |
|---|---|---|
| **Công khai** | ✅ Có | Bấm thẳng từ sảnh, khi còn chỗ |
| **Cần mã** | ❌ Không | Có lời mời trực tiếp WATCH đúng người nhận, mã xem hoặc link xem hợp lệ (BR-SPEC-19) |
| **Khoá** | ❌ Không | **Không ai vào xem được** |

**`BR-SPEC-01`** — Phòng **khoá** chỉ chặn **người xem**. Ghế **chơi** vẫn mời được nếu còn trống.

### 5.2 Người xem làm được gì

| ✅ Làm được | ❌ Không làm được |
|---|---|
| Xem bàn cờ theo thời gian thực | Đi cờ · sẵn sàng |
| Xem lượt, đồng hồ, trạng thái treo ván | Đầu hàng · xin hoà · xin đi lại |
| Chat trong **kênh chung** | **Đọc hoặc gửi** kênh riêng người chơi |
| Nhận camera/mic **được chia sẻ cho người xem** | Phát camera/mic của mình |
| Xem lại ván hiện tại | Đổi cài đặt phòng · đuổi ai |
| Rời phòng bất cứ lúc nào | Tự chuyển thành người chơi |

---

## 6. MAIN FLOW — ĐUỔI NGƯỜI XEM (`R18`)

| Bước | Ai | Hành động |
|---|---|---|
| 1 | **Người chơi** (bất kỳ bên nào) | Mở danh sách người xem, chọn một người, bấm **Đuổi** |
| 2 | Hệ thống | Kiểm tra người thao tác **là người chơi của phòng này** |
| 3 | Hệ thống | Xoá tư cách thành viên của người bị đuổi |
| 4 | Hệ thống | Ghi người đó vào **danh sách chặn của phòng** |
| 5 | Hệ thống | Ngắt người đó khỏi bàn cờ, kênh chung và camera/mic |
| 6 | Hệ thống | Người bị đuổi nhận thông báo và bị đưa về sảnh |
| 7 | Hệ thống | Báo cho cả phòng biết số người xem đã đổi |

**`BR-SPEC-10`** — Cả **hai** người chơi đều có quyền này, không riêng chủ phòng (`DEC-014`).
**`BR-SPEC-11`** — Người bị đuổi **không vào lại được phòng đó** bằng **bất kỳ đường nào**: mã xem, link, hay phòng chuyển sang công khai (`DEC-015`).
**`BR-SPEC-12`** — Chặn **chỉ trong phạm vi phòng đó**, không phải chặn toàn hệ thống. Người đó vào phòng khác bình thường. Danh sách chặn xoá khi phòng đóng.
**`BR-SPEC-13`** — **Không** đuổi được người chơi. Chỉ đuổi được người xem.

---

## 7. ALTERNATIVE FLOWS

### ALT-1 — Vào xem giữa lúc đang đánh
**Được phép** (`DEC-022`). Người xem nhận **ngay** thế cờ hiện tại và lịch sử kênh chung của ván đang diễn ra — không phải chờ ván mới.

### ALT-2 — Vào xem phòng đang chờ
Được phép. Thấy phòng chờ, thấy ai đã sẵn sàng. Khi ván bắt đầu thì tự động thấy bàn cờ.

### ALT-3 — Vào xem phòng vừa kết thúc ván
Được phép trong **10 phút** phòng còn mở, **bằng lời mời trực tiếp/mã/link WATCH hợp lệ** — phòng đã xong ván **không hiện ở sảnh** (`DEC-023`). Xem lại được ván vừa xong.

### ALT-4 — Người xem rời tự nguyện
Ghế được giải phóng **ngay**. Vào lại được nếu còn chỗ và chưa bị chặn.

### ALT-5 — Ván mới bắt đầu (tái đấu)
Người xem **được giữ lại** nếu vẫn đủ quyền. Kênh chat của ván mới là kênh **mới**; camera/mic **trở về tắt** hết.

---

## 8. EXCEPTION FLOWS

### EXC-1 — Đã đủ 5 người xem
Người thứ 6 **bị từ chối**, thông báo rõ *"Phòng đã đủ người xem"*. **`BR-SPEC-02`**

### EXC-2 — Hai người cùng xin ghế cuối
**Đúng một** người được nhận. Người kia bị từ chối vì hết chỗ. **Không bao giờ** vượt quá 5.

### EXC-3 — Không có quyền vào
| Tình huống | Phản hồi |
|---|---|
| Chưa chứng minh được quyền biết phòng (kể cả CODE_ONLY thiếu vé) | Lỗi chung FLOW-JOIN-ROOM §8, cho nhập mã |
| Mã sai / hết hạn / đã bị đổi | Cùng lỗi chung FLOW-JOIN-ROOM §8 |
| Có bằng chứng quyền biết phòng nhưng **LOCKED** | Lỗi không có quyền theo FLOW-JOIN-ROOM §8; không bằng chứng vẫn lỗi chung |
| Có bằng chứng quyền biết phòng và **bị chặn** | “Bạn không thể vào phòng này”; không bằng chứng vẫn lỗi chung |

**`BR-SPEC-03`** — Khi chưa chứng minh được quyền biết phòng, dùng cùng lỗi chung cho không tồn tại, riêng tư, vé sai/hết hạn/đã dùng/thu hồi. Chỉ sau bằng chứng hợp lệ hiện hành mới được báo đầy/bị chặn/không đúng trạng thái; ảnh sảnh hoặc lời mời cũ không đủ. Thứ tự và thông báo chuẩn tại [FLOW-JOIN-ROOM](../02-flows/FLOW-JOIN-ROOM.md) §1/8.

### EXC-4 — Đang ở phòng khác
Từ chối, báo rõ phải rời phòng hiện tại trước.

### EXC-5 — Bị thu hồi quyền khi đang xem
Xem §10.

### EXC-6 — Mất kết nối
Giữ ghế **15 giây**. Nối lại kịp thì vào tiếp (phải **kiểm tra lại quyền**). Đúng hạn hoặc sau hạn thì mất ghế, ghế nhường người khác. **`BR-SPEC-04`**

---

## 9. POSTCONDITION

| Kết cục | Trạng thái |
|---|---|
| Vào xem thành công | Là thành viên vai trò người xem; nhận realtime; số người xem +1 |
| Bị từ chối | Không phải thành viên; **không** nhận được thông tin gì về phòng |
| Rời / bị đuổi / hết hạn nối lại | Không còn là thành viên; mất mọi quyền nhận dữ liệu; số người xem −1 |
| Bị đuổi | Thêm: **nằm trong danh sách chặn** của phòng đó |

---

## 10. THU HỒI QUYỀN XEM

**`BR-SPEC-05`** — Bốn trường hợp mất quyền xem:

| # | Nguyên nhân | Ảnh hưởng ai | Vào lại được? |
|---|---|---|---|
| 1 | Chủ phòng đổi **công khai → cần mã, công khai → khoá, hoặc cần mã → khoá** | **Toàn bộ** người xem | Có, khi chế độ cho xem và có quyền mới |
| 2 | Chủ phòng **đổi mã xem** | **Toàn bộ** người xem | Có, khi chế độ cho xem và có quyền mới |
| 3 | **Bị người chơi đuổi** | **Một** người | ❌ **Không** — bị chặn |
| 4 | Mất kết nối tới hạn **15 giây** | Một người | Có, nếu còn chỗ |

**`BR-SPEC-06`** — Khi bị thu hồi, người xem **ngay lập tức**: rời khỏi luồng cập nhật bàn cờ · mất quyền đọc kênh chung (kể cả **lịch sử**) · bị ngắt camera/mic.

**`BR-SPEC-07`** — Đổi **ngược lại** thành công khai **không** tự động nhận lại người cũ. Họ phải vào lại như người mới.

---

## 11. BUSINESS RULES

| ID | Luật |
|---|---|
| **BR-SPEC-01** | Phòng khoá chặn người xem, **không** chặn mời chơi |
| **BR-SPEC-02** | Tối đa **5** người xem. Người thứ 6 bị từ chối |
| **BR-SPEC-03** | Kiểm quyền **trước** khi tiết lộ phòng tồn tại hay không |
| **BR-SPEC-04** | Mất kết nối giữ ghế **15 giây**; nối lại phải kiểm tra lại quyền |
| **BR-SPEC-05** | Bốn nguyên nhân thu hồi quyền xem (§10) |
| **BR-SPEC-06** | Thu hồi cắt **đồng thời** bàn cờ, chat (cả lịch sử) và media |
| **BR-SPEC-07** | Mở lại công khai không tự nhận lại người xem cũ |
| **BR-SPEC-08** | Người xem **không bao giờ** đọc hay gửi được **kênh riêng người chơi**. Kênh **chung** thì cả người chơi lẫn người xem đều đọc/gửi được (`DEC-018`) |
| **BR-SPEC-09** | Người xem chỉ nhận camera/mic của người chơi **chủ động chọn** chia sẻ cho người xem |
| **BR-SPEC-10** | **Cả hai** người chơi được đuổi người xem |
| **BR-SPEC-11** | Người bị đuổi **không vào lại** phòng đó bằng bất kỳ đường nào |
| **BR-SPEC-12** | Chặn chỉ trong phạm vi **một phòng**, xoá khi phòng đóng |
| **BR-SPEC-13** | **Không** đuổi được người chơi |
| **BR-SPEC-14** | Người xem **không** tự chuyển thành người chơi. Phải rời phòng và dùng lời mời chơi |
| **BR-SPEC-17** | Người xem vào được **bất cứ lúc nào**: phòng đang chờ, đang chơi, hay vừa xong ván (`DEC-022`) |
| **BR-SPEC-18** | Phòng **đã xong ván** vào bằng **lời mời trực tiếp/mã/link WATCH hợp lệ**, **không** hiện ở sảnh (`DEC-023`) |
| **BR-SPEC-15** | Đếm sức chứa phải làm **cùng lúc** với việc nhận người vào, để hai người cùng xin không vượt trần |

---

### Bằng chứng WATCH và chuyển riêng tư (`DEC-043`)

**BR-SPEC-19** — Lời mời trực tiếp WATCH còn hạn, đúng người nhận, chưa dùng/thu hồi cấp quyền vào CODE_ONLY giống mã/link WATCH hợp lệ. PUBLIC cho vào từ sảnh khi WAITING/PLAYING; FINISHED không hiện sảnh nhưng vẫn nhận WATCH bằng lời mời/mã/link. LOCKED chặn mọi WATCH và không phát hành WATCH mới; PLAY chỉ theo điều kiện ghế chơi, không bị thu hồi vì privacy.

**BR-SPEC-20** — Ma trận chuẩn cho thay đổi chế độ và đổi mã:

| Từ → tới | Tư cách người xem và mọi vé WATCH cũ | Sảnh |
|---|---|---|
| PUBLIC → CODE_ONLY | Thu hồi tất cả | Ẩn |
| PUBLIC → LOCKED | Thu hồi tất cả | Ẩn |
| CODE_ONLY → LOCKED | Thu hồi tất cả | Vẫn ẩn |
| CODE_ONLY → PUBLIC | Giữ quyền còn hợp lệ, không hồi sinh quyền đã thu hồi | Hiện nếu WAITING/PLAYING |
| LOCKED → CODE_ONLY | Không hồi sinh; muốn vào cần lời mời/mã/link mới | Ẩn |
| LOCKED → PUBLIC | Không tự nhận người cũ; vào lại như mới | Hiện nếu WAITING/PLAYING |
| Giữ nguyên chế độ (3 trường hợp) | Không thay đổi | Theo chế độ/trạng thái |
| Đổi mã xem | Thu hồi toàn bộ người xem và mọi lời mời/mã/link WATCH cũ, tạo mã mới; không thực hiện ở LOCKED | **Không đổi** chế độ hay quy tắc hiện sảnh |

Thu hồi hàng loạt không thêm danh sách chặn. Mọi vé PLAY giữ nguyên. Mở lại không hồi sinh lời mời đã bị thu hồi; hộp thư phải bỏ lời mời WATCH cũ. Đóng phòng mới thu hồi cả PLAY.

| ID | Tiêu chí bổ sung |
|---|---|
| **AC-SPEC-21** | WATCH trực tiếp vào CODE_ONLY đúng người nhận thành công, sai người từ chối; LOCKED từ chối cả ba đường WATCH, PLAY hợp lệ vẫn dùng trong WAITING |
| **AC-SPEC-22** | Kiểm cả 9 chuyển chế độ và rotate theo BR-SPEC-20; mọi WATCH cũ (cả lời mời trực tiếp) không hồi sinh khi mở lại, PLAY không bị revoke |
| **AC-SPEC-23** | Rotate ở PUBLIC: người xem cũ mất quyền, phòng vẫn ở sảnh nếu WAITING/PLAYING; người mới vào theo quyền PUBLIC vẫn được |
| **AC-SPEC-24** | SPECTATOR thấy đề nghị hoà/đi lại và kết quả nhưng gọi trực tiếp trả lời vẫn bị từ chối (BR-ACT-18) |

## 12. PERMISSIONS

| Hành động | Người dùng ngoài | Người xem | Người chơi | Chủ phòng |
|---|:---:|:---:|:---:|:---:|
| Thấy phòng công khai ở sảnh | ✅ | ✅ | ✅ | ✅ |
| Thấy phòng cần mã / khoá ở sảnh | ❌ | ❌ | ❌ | ❌ |
| Vào xem (đủ điều kiện) | ✅ | — | — | — |
| Xem bàn cờ | ❌ | ✅ | ✅ | ✅ |
| Chat **kênh chung** | ❌ | ✅ | ✅ | ✅ |
| Chat **kênh riêng người chơi** | ❌ | ❌ | ✅ | ✅ |
| Nhận camera/mic được chia sẻ cho người xem | ❌ | ✅ | ✅ | ✅ |
| Phát camera/mic | ❌ | ❌ | ✅ | ✅ |
| Thấy danh sách người xem | ❌ | ✅ | ✅ | ✅ |
| **Đuổi người xem** | ❌ | ❌ | ✅ | ✅ |
| Đổi chế độ riêng tư / mã xem | ❌ | ❌ | ❌ | ✅ |

---

## 13. UI LIÊN QUAN

| Màn hình | Nội dung |
|---|---|
| `SCR-LOBBY` | Danh sách phòng công khai, hiện **số người xem / 5** |
| `SCR-JOIN-BY-CODE` | Ô nhập mã xem |
| `SCR-GAME-ROOM` | Bàn cờ (chỉ xem) · panel người xem · kênh chung · khung camera/mic |
| `SCR-SPECTATOR-LIST` | Danh sách người xem + nút **Đuổi** (chỉ người chơi thấy) |
| `SCR-ACCESS-DENIED` | Màn báo không vào được, có nút về sảnh |

### Panel danh sách người xem

```
┌─────────────────────────────┐
│ Người xem (3/5)             │
├─────────────────────────────┤
│ • minh_nguyen      [Đuổi]   │  ← nút chỉ người chơi thấy
│ • lan_tran         [Đuổi]   │
│ • hoang99          [Đuổi]   │
└─────────────────────────────┘
```

**Xác nhận trước khi đuổi** — nêu rõ người đó **không vào lại được phòng này**.

### Trạng thái màn hình bắt buộc

| Trạng thái | Khi nào |
|---|---|
| Đang tải | Đang vào phòng |
| Trống | Chưa có người xem nào |
| Lỗi | Không vào được — nêu lý do theo `EXC-3` |
| Vô hiệu | Nút Đuổi mờ khi người thao tác không phải người chơi |
| Thành công | Vào xem được, thấy bàn cờ |

---

## 14. STATES

```
NGOÀI PHÒNG ──(vào xem)──► ĐANG XEM ──(rời)──────────► NGOÀI PHÒNG
                              │
                              ├──(mất mạng)──► TẠM MẤT (15 giây)
                              │                   │
                              │      (nối lại) ◄──┤
                              │                   │ (quá hạn)
                              │                   ▼
                              │              NGOÀI PHÒNG
                              │
                              ├──(đổi chế độ kín hơn / đổi mã)──► NGOÀI PHÒNG
                              │
                              └──(bị đuổi)──► BỊ CHẶN KHỎI PHÒNG
                                                  │
                                       (phòng đóng) ▼
                                             NGOÀI PHÒNG
```

---

## 15. REALTIME BEHAVIOR

| Sự kiện | Ai tạo | Máy chủ kiểm gì | Ai nhận | UI đổi gì |
|---|---|---|---|---|
| Người xem vào | Người dùng | Đăng nhập · chưa ở phòng khác · không bị chặn · đủ quyền · **còn ghế (kiểm trong cùng thao tác)** | Cả phòng | Số người xem +1, danh sách cập nhật |
| Người xem rời | Người xem | Là thành viên | Cả phòng | Số người xem −1 |
| **Bị đuổi** | Người chơi | Người thao tác là người chơi · mục tiêu là người xem của phòng này | Cả phòng + người bị đuổi | Người bị đuổi: về sảnh + thông báo. Người khác: danh sách cập nhật |
| Đổi chế độ kín hơn / đổi mã | Chủ phòng | Là chủ phòng | Cả phòng | **Toàn bộ** người xem bị đưa ra; người chơi thấy số người xem về 0 |
| Người xem mất mạng | Hệ thống | Hết hạn 15 giây | Cả phòng | Số người xem −1 |
| Nước đi mới | Người chơi | Luật cờ | Cả phòng | Bàn cờ người xem cập nhật cùng lúc với người chơi |
| Trạng thái treo ván | Hệ thống | — | Cả phòng | Người xem **cũng thấy** đếm ngược (`DEC-013`) |

**`BR-SPEC-16`** — Máy chủ **không bao giờ** gửi tin của **kênh riêng người chơi** ra nhóm có người xem. Chọn nhóm nhận theo vai trò **trước** khi gửi.

---

## 16. EDGE CASES

| # | Tình huống | Xử lý |
|---|---|---|
| 1 | Hai người cùng xin ghế thứ 5 | Đúng một người được nhận (`BR-SPEC-15`) |
| 2 | Đang vào thì phòng chuyển sang khoá | Bị từ chối; nếu đã vào rồi thì bị thu hồi ngay |
| 3 | Người xem mở 2 tab | Chỉ chiếm **1 ghế**. Mọi tab đều đọc/gửi theo cùng quyền (`DEC-020`) |
| 4 | Bị đuổi rồi phòng chuyển công khai | **Vẫn bị chặn** (`BR-SPEC-11`) |
| 5 | Bị đuổi đúng lúc đang gửi tin chat | Tin bị từ chối; tin cũ đã gửi vẫn còn trong lịch sử của người khác |
| 6 | Người chơi đuổi **chính mình** | Từ chối — chỉ đuổi được người xem (`BR-SPEC-13`) |
| 7 | Người chơi đuổi **đối thủ** | Từ chối (`BR-SPEC-13`) |
| 8 | Hai người chơi cùng đuổi một người | Thực hiện **một lần**, lần hai báo người đó không còn trong phòng |
| 9 | Người xem đang nhận camera thì bị đuổi | Luồng camera bị cắt tại hạ tầng, **không** chỉ ẩn khung hình |
| 10 | Người bị đuổi vào **phòng khác** | Bình thường (`BR-SPEC-12`) |
| 11 | Vào xem đúng lúc ván vừa kết thúc | Được vào, thấy kết quả và xem lại được |
| 12 | Phòng đóng khi đang xem | Bị đưa về sảnh kèm thông báo |
| 13 | Người xem muốn thành người chơi khi có ghế trống | Phải **rời phòng** rồi vào lại bằng lời mời/mã chơi (`BR-SPEC-14`) |
| 14 | Mất mạng 14 giây rồi nối lại | Giữ ghế, nhưng **phải kiểm tra lại quyền** — có thể chế độ đã đổi trong lúc đó |

---

## 17. ACCEPTANCE CRITERIA

| ID | Tiêu chí | Cách kiểm |
|---|---|---|
| **AC-SPEC-01** | 5 người xem vào được, người thứ **6 bị từ chối** | 6 phiên đồng thời |
| **AC-SPEC-02** | Hai người cùng xin ghế cuối ⇒ **đúng một** được nhận, không vượt 5 | Test tranh chấp có rào đồng bộ |
| **AC-SPEC-03** | Phòng **khoá** ⇒ không ai vào xem được, nhưng **mời chơi vẫn dùng được** | 2 phiên |
| **AC-SPEC-04** | Phòng **cần mã** ⇒ không bằng chứng WATCH bị từ chối; lời mời trực tiếp đúng người nhận/mã/link WATCH hợp lệ đều vào được | 2 phiên |
| **AC-SPEC-05** | Người xem **không đọc được** **kênh riêng người chơi** — cả tin mới lẫn **lịch sử** | Kiểm cả hai đường |
| **AC-SPEC-06** | Người chơi **đọc và gửi được kênh chung**; người xem nhận được tin của họ kèm **nhãn phân biệt** | 3 phiên |
| **AC-SPEC-07** | Người xem **không đi cờ được** kể cả khi giả mạo dữ liệu gửi lên | Gửi lệnh giả mạo |
| **AC-SPEC-08** | Đổi sang khoá ⇒ **toàn bộ** người xem bị thu hồi bàn cờ + chat + media | 5 người xem |
| **AC-SPEC-09** | Đổi mã xem ⇒ mã cũ **không dùng được nữa** | 2 phiên |
| **AC-SPEC-10** | **Người chơi đuổi được** người xem; người đó bị ngắt khỏi tất cả | 3 phiên |
| **AC-SPEC-11** | Người bị đuổi **không vào lại được** bằng mã, link, hay khi phòng chuyển công khai | 3 đường vào |
| **AC-SPEC-12** | Người bị đuổi **vào được phòng khác** bình thường | 2 phòng |
| **AC-SPEC-13** | **Cả hai** người chơi đuổi được, không chỉ chủ phòng | 2 phiên người chơi |
| **AC-SPEC-14** | Người xem **không đuổi được** ai; người chơi **không đuổi được** đối thủ | Gửi lệnh giả mạo |
| **AC-SPEC-15** | Mất mạng < 15 giây giữ ghế; ≥ 15 giây mất ghế | Ngắt kết nối thật |
| **AC-SPEC-16** | Người xem chỉ nhận camera/mic của người **chọn chia sẻ cho người xem**; đo **luồng dữ liệu thật**, không chỉ nhìn giao diện | Kiểm thống kê luồng media |
| **AC-SPEC-17** | Vào xem **giữa ván** thấy ngay thế cờ hiện tại | 3 phiên |
| **AC-SPEC-20** | Phòng **đã xong ván** **không** hiện ở sảnh, nhưng **vào được bằng mã** | 2 phiên |
| **AC-SPEC-18** | Người xem thấy trạng thái **treo ván** và đếm ngược (`DEC-013`) | 3 phiên |
| **AC-SPEC-19** | Chưa có bằng chứng quyền biết phòng: từ chối vào **không tiết lộ** tồn tại; người có bằng chứng nhận lỗi chi tiết đúng §8 FLOW-JOIN-ROOM | So sánh phản hồi |

---

## 18. DEPENDENCY

| Phụ thuộc | Quan hệ |
|---|---|
| [REQ-ROOM](REQ-ROOM.md) | Chế độ riêng tư, sức chứa, vòng đời phòng |
| [REQ-INVITE](REQ-INVITE.md) | Mã xem và link xem |
| [REQ-CHAT](REQ-CHAT.md) | Kênh chat người xem tách biệt |
| [REQ-MEDIA](REQ-MEDIA.md) | Mức chia sẻ "đối thủ và người xem" |
| [REQ-MATCH](REQ-MATCH.md) | Nhận cập nhật bàn cờ |
| [REQ-INACTIVITY](REQ-INACTIVITY.md) | Người xem thấy trạng thái treo ván |
| [REQ-DISCONNECT](REQ-DISCONNECT.md) | Giữ ghế 15 giây |

---

## 19. OPEN QUESTIONS

**Đã chốt** tại DEC-022/023/043; BR-SPEC-19 mở rõ đường WATCH trực tiếp và BR-SPEC-20 xác định mọi chuyển privacy.
