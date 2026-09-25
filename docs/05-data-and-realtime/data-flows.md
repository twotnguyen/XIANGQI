# LUỒNG DỮ LIỆU THỜI GIAN THỰC

**ID:** `DF` · **Trạng thái:** v1 · **Cập nhật:** 2026-09-21

> Với **mỗi sự kiện**, tài liệu này trả lời đủ 5 câu: **ai tạo ra** · **máy chủ kiểm gì** · **trạng thái nào đổi** · **client nào nhận** · **giao diện từng client đổi ra sao**.

**Năm nhân vật trong mọi sơ đồ:** Người chơi A · Người chơi B · Người xem 1–5 · Máy chủ · Máy (AI).

---

## 1. BA QUY TẮC CHUNG CHO MỌI LUỒNG

| # | Quy tắc |
|---|---|
| **1** | **Lưu xong rồi mới phát tin.** Phát tin lỗi **không** làm huỷ thay đổi đã lưu — client tự đồng bộ để bắt kịp |
| **2** | **Máy chủ chọn người nhận theo vai trò.** Client **không bao giờ** tự khai mình thuộc nhóm nào |
| **3** | **Không có quyền ⇒ không nhận dữ liệu.** Không phải nhận rồi giấu đi |

---

## 2. NƯỚC ĐI — LUỒNG QUAN TRỌNG NHẤT

```
Người chơi A          Máy chủ                      Người chơi B    Người xem 1-5
     │                   │                              │               │
     │──── ý định đi ───►│                              │               │
     │                   │ ① xác thực + quyền PLAYER│               │
     │                   │ ② KHOÁ ván                   │               │
     │                   │ ③ lệnh này xử lý chưa?       │               │
     │                   │ ④ phiên bản khớp?            │               │
     │                   │ ⑤ tính lại ĐỒNG HỒ           │               │
     │                   │    └ hết giờ ⇒ kết thúc ván, │               │
     │                   │      TỪ CHỐI nước đi         │               │
     │                   │ ⑥ đúng lượt? đúng LUẬT CỜ?   │               │
     │                   │ ⑦ áp dụng, PHIÊN BẢN +1      │               │
     │                   │ ⑧ kiểm kết thúc ván          │               │
     │                   │ ⑨ LƯU (tất cả hoặc không)    │               │
     │                   │ ⑩ mở khoá                    │               │
     │◄─── xác nhận ─────│                              │               │
     │                   │───── trạng thái mới ────────►│               │
     │                   │───── trạng thái mới ────────────────────────►│
     ▼                   ▼                              ▼               ▼
 bàn cập nhật      nguồn sự thật                  bàn cập nhật    bàn cập nhật
 đồng hồ dừng                                     đến lượt mình   chỉ xem
 đồng hồ B chạy                                   đồng hồ chạy
```

| Mục | Nội dung |
|---|---|
| **Ai tạo** | Người chơi A (hoặc **Máy** ở ván với máy) |
| **Máy chủ kiểm** | Danh tính · vai trò PLAYER · ván đang chơi · **phiên bản khớp** · **đồng hồ** · đúng lượt · **đúng luật cờ** · mã lệnh/hash và receipt (retry hợp lệ trả kết quả cũ, không áp dụng lần hai) |
| **Trạng thái đổi** | Thế cờ · bên đến lượt · **phiên bản +1** · nước đi mới vào cây · số dư đồng hồ · **mốc treo ván reset** · kết quả (nếu ván kết thúc) |
| **Ai nhận** | **Cả phòng**: A, B và toàn bộ người xem |
| **Ngoài phòng** | **Không nhận gì** |

### Giao diện từng client

| Client | Thay đổi |
|---|---|
| **A** (vừa đi) | Bàn cập nhật · đánh dấu nước vừa đi · đồng hồ mình **dừng** · chuyển *"Đang chờ đối thủ"* |
| **B** | Bàn cập nhật · đồng hồ mình **chạy** · chuyển *"Đến lượt bạn"* · thao tác được bật |
| **Người xem** | Bàn cập nhật **cùng lúc** · nhãn lượt đổi · thao tác **vẫn vô hiệu** |

### Nếu bị từ chối

Từ chối **không đổi trạng thái**: chỉ A nhận lỗi, A đồng bộ lại bàn. Từ chối do phát hiện deadline hợp lệ đã tới: máy chủ vẫn lưu kết quả kết thúc đúng một lần, sau commit phát kết quả cho **A, B và SPECTATOR còn quyền**; A đồng thời nhận nước đi bị từ chối. Không được giấu kết quả TIMEOUT chỉ vì lệnh MOVE không được áp dụng.

---

## 3. CHAT — LUỒNG PHÂN TÁCH NGHIÊM NGẶT

### Kênh RIÊNG người chơi

```
Người chơi A ──► Máy chủ ──► Người chơi B          ✅ nhận
                    │
                    ╳────► Người xem 1-5           ❌ KHÔNG BAO GIỜ
```

### Kênh CHUNG (`DEC-018`)

```
Người xem 1 ──► Máy chủ ──┬──► Người xem 2,3,4,5   ✅ nhận
                          └──► Người chơi A, B     ✅ nhận

Người chơi A ──► Máy chủ ──┬──► Người xem 1-5      ✅ nhận (có nhãn "người chơi")
                           └──► Người chơi B       ✅ nhận
```

| Mục | Nội dung |
|---|---|
| **Máy chủ kiểm** | Là thành viên · **được phép gửi vào kênh đó** · phiên hợp lệ · nội dung 1–1000 ký tự · tần suất 5 tin/10 giây (**tính chung 2 kênh**) · tra receipt/hash: cùng mã/nội dung trả tin cũ sau kiểm quyền, khác nội dung từ chối; lệnh mới mới tính rate |
| **Trạng thái đổi** | Lệnh mới thêm một tin vào **đúng một kênh**; retry hợp lệ không ghi thêm |
| **Ai nhận** | Kênh riêng ⇒ PLAYER hiện hành có đúng participant user/membership của segment (kể cả Host solo). Kênh chung ⇒ mọi thành viên hiện hành, tối đa 7 |

**`DF-CHAT-01`** — **Máy chủ** xác định quyền đọc/gửi từ phiên, membership, context/segment/participant hiện hành; vai trò tự khai của client không cấp quyền. Đây là điểm bảo vệ then chốt của `BR-CHT-02`.

**Lịch sử và chuyển trạng thái (`DEC-029`):** WAITING → ván đầu giữ tin theo quyền. Khi C thay B, mọi phản hồi lịch sử/đồng bộ cho C loại tin riêng A–B; truy vấn trực tiếp bằng mã tin không vượt được kiểm quyền. Vai trò PLAYER hiện tại chưa đủ để đọc tin của cặp trước (BR-CHT-25/26).

**`DF-CHAT-02`** — Công tắc ẩn/hiện kênh chung của người chơi là **thuần giao diện**: máy chủ **vẫn gửi** tin, **không** phát sự kiện nào, **không ai** biết ai đang ẩn (`BR-CHT-19`).

---

## 4. ĐỔI MỨC CHIA SẺ MEDIA

```
Người chơi A đổi camera: "Đối thủ và người xem" ──► "Chỉ đối thủ"
     │
     ▼
Máy chủ: ① là chính chủ? ② tab đang giữ thiết bị? ③ phiên bản mức khớp?
     │
     ├─► ④ ghi mức mong muốn
     ├─► ⑤ THU HỒI quyền nhận của người xem TẠI HẠ TẦNG TRUYỀN
     │      (không chỉ ẩn khung hình)
     ├─► ⑥ chờ hạ tầng xác nhận
     └─► ⑦ cấp lại quyền cho danh sách hợp lệ còn lại
     │
     ▼
   phát trạng thái mức mới
     │
     ├──► A: ô chọn hiện "Chỉ đối thủ"
     ├──► B: vẫn nhận hình bình thường
     └──► Người xem: khung hình A biến mất VÀ luồng thật sự dừng
```

| Mục | Nội dung |
|---|---|
| **Ai tạo** | **Chỉ chính người phát** |
| **Máy chủ kiểm** | Là chính chủ · tab đang giữ thiết bị · phiên bản mức khớp |
| **Trạng thái đổi** | Mức mong muốn · phiên bản +1 · quyền nhận ở hạ tầng |
| **Ai nhận** | Cả phòng (chỉ **trạng thái mức**, **không bao giờ** kèm khoá truy cập) |

**`DF-MED-01`** — Trong lúc chưa thu hồi xong ở hạ tầng, trạng thái là **đang xử lý**. Giao diện **không** được báo đã bảo vệ thành công (`BR-MED-04`).

---

## 5. CHỐNG TREO VÁN ⭐

```
Đủ 3 phút không đi → A thấy hộp hỏi + đếm ngược 30 giây NGAY
                    B/người xem thấy dòng trạng thái + cùng đếm ngược
   ├─ xác nhận hợp lệ trước hạn → mốc tiếp = xác nhận + 180 giây; gia hạn +1
   ├─ đi nước hợp lệ trước hạn → tiếp tục ván; reset gia hạn
   └─ hết hạn không phản hồi → INACTIVITY, đối thủ thắng
```

Timeline theo [REQ-INACTIVITY](../01-requirements/REQ-INACTIVITY.md) §9/12, DEC-026/027. Hết hai lần gia hạn thì chỉ đếm 30 giây, không cho xác nhận gia hạn. Reconnect giữ nguyên mốc/hạn theo DEC-030, không cấp thêm 3 phút; hạn hợp lệ đến trước quyết định kết quả.

| Mục | Nội dung |
|---|---|
| **Ai tạo** | **Máy chủ** (không phải người dùng) |
| **Máy chủ kiểm** | Ván đang chơi · **không giới hạn thời gian** · đối kháng online · đúng người đến lượt và deadline hiện hành. Offline không xoá deadline; số lần gia hạn chỉ quyết định có cho xác nhận thêm hay chỉ countdown cuối |
| **Trạng thái đổi** | Giai đoạn treo ván · số lần gia hạn · hạn chót · (khi hết) kết quả ván |
| **Ai nhận** | **Cả phòng** — A, B **và người xem** (`DEC-013`) |

**`DF-INA-01`** — **Chỉ A** thấy hộp thoại và bấm xác nhận được. B và người xem **chỉ quan sát**, **không** có nút ép kết thúc sớm.

---

## 6. ĐUỔI NGƯỜI XEM ⭐

```
Người chơi A bấm "Đuổi" người xem 3
     │
     ▼
Máy chủ: ① A là NGƯỜI CHƠI của phòng? ② mục tiêu là NGƯỜI XEM?
     │
     ├─► ③ xoá tư cách thành viên
     ├─► ④ GHI VÀO DANH SÁCH CHẶN của phòng
     ├─► ⑤ ngắt khỏi bàn cờ + kênh chat chung
     └─► ⑥ thu hồi quyền nhận media
     │
     ├──► Người xem 3:     về sảnh + "Bạn đã bị đưa khỏi phòng"
     ├──► A, B:            danh sách người xem 3/5 → 2/5
     └──► Người xem 1,2,4,5: số người xem cập nhật
```

| Mục | Nội dung |
|---|---|
| **Ai tạo** | **Cả hai** người chơi (`DEC-014`) |
| **Máy chủ kiểm** | Người thao tác là người chơi của phòng · mục tiêu là người xem · **không** được đuổi người chơi |
| **Trạng thái đổi** | Bớt một thành viên · **thêm một dòng danh sách chặn** · thu hồi quyền media |
| **Ai nhận** | Cả phòng + người bị đuổi |

**`DF-SPEC-01`** — Sau đó người bị đuổi dùng mã cũ, link cũ, hay chờ phòng chuyển công khai **đều bị từ chối** (`BR-SPEC-11`).

---

## 7. THU HỒI QUYỀN HÀNG LOẠT

```
Chủ phòng đổi: Công khai ──► Khoá
     │
     ▼
Máy chủ: ① là chủ phòng?
     │
     ├─► ② đổi chế độ riêng tư
     ├─► ③ XOÁ TOÀN BỘ tư cách người xem (cả 5)
     ├─► ④ thu hồi mọi grant WATCH cũ (mời/mã/link), tăng watch_epoch
     └─► ⑤ thu hồi quyền media của người xem
     │
     ├──► 5 người xem:  về sảnh + thông báo
     ├──► A, B:         "Người xem: 0/5" · phòng nay là Khoá
     └──► Mọi người ở SẢNH:  phòng BIẾN MẤT khỏi danh sách
```

**`DF-ROOM-01`** — Đây là **tất-cả-hoặc-không** — khác với đuổi một người ở §6. Người bị thu hồi theo cách này **không** vào danh sách chặn; chỉ được vào lại khi chế độ hiện tại cho phép và có quyền WATCH mới hợp lệ; LOCKED vẫn từ chối.

---

## 8. MẤT KẾT NỐI VÀ NỐI LẠI

Theo [REQ-DISCONNECT](../01-requirements/REQ-DISCONNECT.md) BR-DIS-01/05/07/08: lần đầu offline ghi hạn 60 giây và phát presence; đồng hồ vẫn chạy. Người thứ hai offline ⇒ xử INTERRUPTED ngay khi phát hiện, sau khi phân xử deadline đã tới. Nối lại kiểm quyền, trả snapshot hiện hành, không gia hạn inactivity. Timer DISCONNECT chỉ xử thua khi đối thủ vẫn online và chưa có kết quả trước đó.

**`DF-DIS-01`** — Nối lại **luôn kiểm tra lại quyền**. Phòng có thể đã chuyển riêng tư hoặc người đó đã bị đuổi trong lúc mất mạng.

---

## 9. NHIỀU TAB

```
Người dùng A mở tab thứ hai
     │
     ▼
✅ CẢ HAI TAB đồng bộ VÀ thao tác được   (DEC-020)
     │
     ├─ A đi cờ ở tab 1 ──► tab 2 thấy ngay, vẫn bấm tiếp được
     │
     └─ A bấm đi cờ ở CẢ HAI tab cùng lúc
              │
              ▼
        Máy chủ: kiểm lượt + phiên bản + mã lệnh
              │
              ├──► tab 1: ✅ nước được ghi
              └──► tab 2: ❌ xung đột phiên bản / chưa tới lượt
```

### Ngoại lệ: camera và micro (`DEC-021`)

```
Tab 1: 📹 đang phát        Tab 2: "Camera đang bật ở tab khác"
                                  [ Chuyển sang tab này ]
                                            │
                                            ▼
                            ① tab 1 DỪNG thiết bị
                            ② xác nhận thu hồi nguồn cũ
                            ③ nguồn tab 2 TẮT; bật riêng mới phát
```

**`DF-TAB-01`** — Không cần khoá tab cho phần chơi cờ và chat: **kiểm lượt + phiên bản + mã lệnh** đã chống hai nước.

**`DF-TAB-02`** — Riêng media, chuyển nguồn theo REQ-MEDIA/DEC-033/034/041: chưa xác nhận thu hồi thì chưa cấp phát; thành công nguồn mới Tắt, lỗi có Thử lại. Nguồn còn lại giữ nguyên.

**`DF-TAB-03`** — Camera và micro **tách riêng** — camera ở tab 1, micro ở tab 2 là hợp lệ.

---

## 10. TÁI ĐẤU

```
Ván kết thúc ──► phòng "Đã xong" ──► đếm 10 phút
     │
     ├─ A bấm Tái đấu ──► ghi phiếu của A
     │                     └──► B thấy "Đối thủ muốn tái đấu"
     │
     └─ B cũng bấm ─────► máy chủ kiểm: CẢ HAI vẫn là người chơi?
                          │
                          ├─► tạo VÁN MỚI · ĐỔI BÊN · giữ thời gian
                          ├─► giữ lại người xem còn quyền
                          ├─► kênh chat MỚI, TRỐNG
                          ├─► media VỀ TẮT
                          └─► HUỶ bộ đếm đóng phòng
                          │
                          ├──► A: nay cầm ĐEN (trước cầm đỏ)
                          ├──► B: nay cầm ĐỎ · đi trước
                          └──► Người xem: bàn cờ mới, chat trống
```

**`DF-HIS-01`** — Hai người bấm **cùng lúc** ⇒ tạo **đúng một** ván. Lệnh tái đấu cho **vòng cũ** gửi sau khi ván mới đã tạo ⇒ **từ chối**.

---

## 11. BẢNG TỔNG HỢP: AI NHẬN GÌ

| Sự kiện | A | B | Người xem | Người ở sảnh | Ngoài |
|---|:---:|:---:|:---:|:---:|:---:|
| Nước đi | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ván kết thúc | ✅ | ✅ | ✅ | ⚠ trạng thái phòng | ❌ |
| Chat **kênh riêng người chơi** | ✅ | ✅ | **❌** | ❌ | ❌ |
| Chat **kênh chung** | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ẩn/hiện kênh chung | ⚠ thuần giao diện | ⚠ | ❌ | ❌ | ❌ |
| Đổi mức media | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Luồng** camera/mic | ⚠ theo mức | ⚠ theo mức | ⚠ theo mức | ❌ | ❌ |
| Trạng thái treo ván | ✅ | ✅ | ✅ | ❌ | ❌ |
| Đuổi người xem | ✅ | ✅ | ✅ | ❌ | ❌ |
| Đổi chế độ riêng tư | ✅ | ✅ | ✅ | ✅ | ❌ |
| Người vào / rời | ✅ | ✅ | ✅ | ⚠ số người xem | ❌ |
| Đề nghị hoà / đi lại | ✅ | ✅ | ✅ | ❌ | ❌ |
| Phiếu tái đấu | ✅ | ✅ | ✅ | ❌ | ❌ |
| Lời mời trực tiếp | — | — | — | — | ⚠ **chỉ người nhận** |
| Bạn online/offline | — | — | — | — | ⚠ **chỉ bạn bè** |

⚠ = có điều kiện

---

## 12. NĂM ĐIỀU KHÔNG BAO GIỜ ĐI QUA ĐƯỜNG TRUYỀN

| # | Không bao giờ gửi |
|---|---|
| 1 | **Mã bí mật** của lời mời/link cho tài khoản khác |
| 2 | **Email** của người khác |
| 3 | **Khoá truy cập phiên** hay khoá media trong tin phát chung |
| 4 | Tin **kênh riêng người chơi** ra nhóm có người xem |
| 5 | **Điểm đánh giá / đường tính** của máy khi ván đang diễn ra (mách nước) |

---

## 13. MỤC TIÊU ĐO ĐƯỢC

| Chỉ tiêu | Giá trị |
|---|---|
| Xử lý lệnh (p95) | **< 100 ms** |
| Trọn vòng client → máy chủ → client | **< 500 ms** khi độ trễ mạng < 100 ms |
| Đồng bộ lại sau khi mạng ổn định | **< 5 giây** |
| Tải thử | 10 phòng × 7 thành viên = **70 kết nối** + 2 ván với máy |

---

## 14. LIÊN QUAN

[data-model.md](data-model.md) · [state-machines.md](state-machines.md) · [session-state.md](session-state.md) · [../01-requirements/](../01-requirements/) · [../04-business-rules/permissions.md](../04-business-rules/permissions.md)
