# REQ-BOARD — BÀN CỜ VÀ THAO TÁC

**ID yêu cầu:** `R05` · **Trạng thái:** Ready · **Cập nhật:** 2026-09-21
**Căn cứ:** Câu 19 phỏng vấn (bàn gỗ, quân Hán) · `DEC-003` (toạ độ)
**Luật cờ:** [../04-business-rules/game-rules.md](../04-business-rules/game-rules.md)

---

## 1. FEATURE NÀY ĐỂ LÀM GÌ

Hiển thị bàn cờ tướng truyền thống và cho người chơi **chọn quân → chọn đích** để đi nước. Bàn cờ phải dùng được trên cả máy tính và điện thoại, bằng chuột, cảm ứng và bàn phím.

---

## 2. ACTOR

| Actor | Vai trò |
|---|---|
| **Người chơi** | Chọn quân, đi nước |
| **Người xem** | Chỉ nhìn, không thao tác |
| **Hệ thống** | Hiển thị trạng thái hiện tại, gợi ý nước hợp lệ |

## 3. PRECONDITIONS

Là thành viên phòng (hoặc đang trong ván với máy) và ván đã bắt đầu.
Đi được nước khi: là **người chơi** · **đến lượt mình** · ván **đang chơi** · đang ở **tab đang giữ thiết bị**.

## 4. TRIGGER

Ván bắt đầu · đến lượt · người chơi chạm/bấm vào quân.

---

## 5. MAIN FLOW — ĐI MỘT NƯỚC

| Bước | Hành động |
|---|---|
| 1 | Đến lượt người chơi; giao diện báo rõ **"Đến lượt bạn"** |
| 2 | Người chơi bấm/chạm vào **quân của mình** |
| 3 | Bàn cờ làm nổi bật quân đã chọn và **các đích hợp lệ** |
| 4 | Người chơi bấm vào một **đích hợp lệ** |
| 5 | Giao diện hiện trạng thái **đang gửi** |
| 6 | Máy chủ phân xử và chấp nhận |
| 7 | Bàn cờ cập nhật, lượt chuyển sang đối thủ, nước đi vào lịch sử |

**`BR-BRD-01`** — Thao tác chính là **chọn rồi chạm đích**. Kéo thả là **tuỳ chọn**, không bắt buộc.

---

## 6. ALTERNATIVE FLOWS

- **ALT-1 — Bỏ chọn:** bấm lại chính quân đó, bấm ra ngoài, hoặc nhấn `Esc`.
- **ALT-2 — Đổi quân:** đang chọn quân A mà bấm quân B của mình ⇒ chuyển sang chọn B.
- **ALT-3 — Lật bàn:** người cầm **quân đen** thấy bàn **xoay 180°** để quân mình ở phía dưới. **Toạ độ gửi lên máy chủ không đổi** (`GR-COORD-01`).
- **ALT-4 — Bàn phím:** mũi tên di chuyển ô đang trỏ · `Enter`/`Space` chọn và xác nhận · `Esc` bỏ chọn.
- **ALT-5 — Xem lại:** ở chế độ xem lại, bàn cờ **chỉ đọc**, có nút tới/lui từng nước.

---

## 7. EXCEPTION FLOWS

| Tình huống | Phản hồi |
|---|---|
| Bấm vào quân **đối thủ** | Không chọn được; không báo lỗi ồn ào |
| Bấm vào ô **trống** khi chưa chọn gì | Không làm gì |
| Bấm vào đích **không hợp lệ** | Không đi; giữ nguyên lựa chọn, báo nhẹ |
| Đi khi **chưa tới lượt** | Nút thao tác **vô hiệu**; nếu vẫn gửi thì máy chủ **từ chối** |
| **Người xem** cố đi nước | Máy chủ **từ chối** |
| Tab **chỉ đọc** cố đi nước | Máy chủ **từ chối** |
| Máy chủ từ chối nước đi | **Hoàn lại** bàn cờ về trạng thái máy chủ, báo lý do |
| Mất mạng khi đang gửi | Hiện đang thử lại; khi nối lại thì **đồng bộ theo máy chủ** |
| Ván đã kết thúc | Bàn cờ chuyển **chỉ đọc** |

---

## 8. POSTCONDITION

| Kết cục | Trạng thái |
|---|---|
| Nước đi được chấp nhận | Bàn cờ đổi, lượt chuyển, lịch sử +1, đồng hồ chuyển bên |
| Nước đi bị từ chối | Bàn cờ **y như trước**, không có gì thay đổi |
| Nước đi kết thúc ván | Bàn cờ chỉ đọc, hiện kết quả |

---

## 9. BUSINESS RULES

| ID | Luật |
|---|---|
| **BR-BRD-01** | Thao tác chính: **chọn quân → chạm đích**. Kéo thả tuỳ chọn |
| **BR-BRD-02** | Quân đặt **tại giao điểm**, không phải trong ô |
| **BR-BRD-03** | Bàn **9 cột × 10 hàng** = **90 giao điểm**, **32 quân** lúc đầu |
| **BR-BRD-04** | Quân hiển thị bằng **chữ Hán**. Đỏ: 帥仕相傌俥炮兵 · Đen: 將士象馬車砲卒 |
| **BR-BRD-05** | Sông ghi 楚河 / 漢界 |
| **BR-BRD-06** | Người cầm **đen** thấy bàn lật; **toạ độ gửi lên máy chủ không đổi** |
| **BR-BRD-07** | Gợi ý nước hợp lệ phía client **chỉ để hỗ trợ**. **Máy chủ luôn phân xử lại** |
| **BR-BRD-08** | Trạng thái (đến lượt, bị chiếu, đã chọn) **không được** chỉ thể hiện bằng **màu sắc** — phải có chữ hoặc biểu tượng. Chuẩn tương phản: **WCAG 2.1 AA** (`DEC-024`) |
| **BR-BRD-15** | Hai phe phải có **dấu hiệu phân biệt không phụ thuộc màu và không phụ thuộc chữ** — xem `DT-21`. Ba cặp chữ *Sĩ, Mã, Xe* gần giống nhau nên chữ một mình là **chưa đủ** |
| **BR-BRD-09** | Mỗi quân có **nhãn trợ năng tiếng Việt** đầy đủ, ví dụ *"Mã đỏ, cột 2 hàng 10"* |
| **BR-BRD-10** | Vùng chạm của các giao điểm **không chồng lấn nhau** |
| **BR-BRD-11** | Nút và thao tác bị **vô hiệu** theo vai trò/lượt/trạng thái, nhưng máy chủ **vẫn kiểm lại** |
| **BR-BRD-12** | Nước đi vừa đi phải được **đánh dấu rõ** (ô đi và ô đến) |
| **BR-BRD-13** | Khi bị **chiếu**, phải báo rõ bằng chữ |

---

## 10. PERMISSIONS

| Hành động | Người xem | Người chơi (chưa tới lượt) | Người chơi (tới lượt) | Tab khác |
|---|:---:|:---:|:---:|:---:|
| Nhìn bàn cờ | ✅ | ✅ | ✅ | ✅ |
| Chọn quân | ❌ | ❌ | ✅ | ❌ |
| Đi nước | ❌ | ❌ | ✅ | ❌ |
| Lật bàn xem | ✅ | ✅ | ✅ | ✅ |
| Xem lịch sử nước đi | ✅ | ✅ | ✅ | ✅ |

---

## 11. UI LIÊN QUAN

`SCR-GAME-ROOM` (bàn cờ là phần trung tâm) · `SCR-REPLAY`

### Bố cục

| Thiết bị | Bố cục |
|---|---|
| **Máy tính** | Bàn cờ ở giữa · panel thông tin/lịch sử/chat bên phải · camera/mic ở hàng riêng **không đè bàn cờ** |
| **Điện thoại** | Bàn cờ chiếm **toàn bộ** chiều ngang · chat và camera vào **tab riêng** · thanh lượt/đồng hồ **dính** ở trên |

### Trạng thái bắt buộc

| Trạng thái | Biểu hiện |
|---|---|
| Đang tải | Khung bàn cờ, chưa có quân |
| Đến lượt bạn | Chữ **"Đến lượt bạn"** + viền nổi bật |
| Chờ đối thủ | Chữ **"Đang chờ đối thủ"**, thao tác vô hiệu |
| Đã chọn quân | Quân nổi bật + chấm đích hợp lệ |
| Đang gửi | Chỉ báo nhẹ, chưa coi là đã đi |
| Bị chiếu | Chữ **"Đang bị chiếu"** + tướng nổi bật |
| Ván kết thúc | Bàn chỉ đọc + màn kết quả |
| Lỗi | Thông báo + tự đồng bộ lại |

**Thông báo tạm không được che nút Đầu hàng.**

---

## 12. STATES

```
CHỜ LƯỢT ──(đến lượt)──► SẴN SÀNG ĐI ──(chọn quân)──► ĐÃ CHỌN
    ▲                         ▲                           │
    │                         │      (bỏ chọn / Esc)      │
    │                         └───────────────────────────┤
    │                                                     │ (chọn đích)
    │                                                     ▼
    │                                                 ĐANG GỬI
    │                                                     │
    ├──────────(máy chủ chấp nhận)────────────────────────┤
    │                                                     │
    └──────────(máy chủ từ chối → hoàn lại)───────────────┘
```

---

## 13. REALTIME BEHAVIOR

| Sự kiện | Ai tạo | Máy chủ kiểm gì | Ai nhận | UI đổi gì |
|---|---|---|---|---|
| Đi nước | Người chơi | Là người chơi · đúng lượt · tab đang giữ thiết bị · **đúng luật cờ** · ván đang chơi | **Cả phòng** | Bàn cờ cập nhật ở **mọi** client cùng lúc; đổi lượt; đồng hồ chuyển bên |
| Nước đi kết thúc ván | Người chơi | Như trên + phát hiện kết thúc | Cả phòng | Bàn chỉ đọc + màn kết quả |
| Đồng bộ lại sau mất mạng | Client | Quyền thành viên | Client đó | Bàn cờ nhảy về **đúng trạng thái máy chủ** |

**`BR-BRD-14`** — Người xem thấy nước đi **cùng lúc** với người chơi, không chậm hơn theo thiết kế.

---

## 14. EDGE CASES

| # | Tình huống | Xử lý |
|---|---|---|
| 1 | Bấm hai lần rất nhanh vào cùng đích | Chỉ **một** nước được ghi |
| 2 | Chọn quân xong thì đối thủ ăn mất quân đó | Bỏ chọn, cập nhật bàn, báo nhẹ |
| 3 | Chọn quân rồi bàn cờ đổi do **đi lại** được chấp nhận | Bỏ chọn, vẽ lại theo trạng thái mới |
| 4 | Đi nước đúng lúc **hết giờ** | Máy chủ so mốc thời gian; đến sau hạn thì **từ chối** |
| 5 | Đi nước đúng lúc **đối thủ đầu hàng** | Ván đã kết thúc ⇒ từ chối |
| 6 | Gửi nước đi giả mạo toạ độ ngoài bàn | Máy chủ từ chối (`BR-BRD-07`) |
| 7 | **Người xem** gửi nước đi giả mạo | Máy chủ từ chối |
| 8 | Màn hình **360px** | Bàn vẫn dùng được, **không** tràn ngang; chọn quân có dấu nổi bật rõ, không phụ thuộc kéo thả |
| 9 | Bàn phím ảo che bàn cờ | Bàn cờ **không** bị ép gây cuộn ngang |
| 10 | Lật bàn giữa ván | Chỉ đổi hiển thị; toạ độ gửi lên **không đổi** |
| 11 | Mất mạng sau khi gửi nhưng trước khi nhận kết quả | Nối lại, đồng bộ; nước đi **không** bị ghi hai lần |
| 12 | Quân bị chiếu, chọn nước không gỡ được chiếu | Đích đó **không** nằm trong danh sách hợp lệ |

---

## 15. ACCEPTANCE CRITERIA

| ID | Tiêu chí |
|---|---|
| **AC-BRD-01** | Vẽ đúng **32 quân** tại đúng **giao điểm** với đúng chữ Hán |
| **AC-BRD-02** | Chọn quân ⇒ hiện **đúng tập đích hợp lệ** theo luật cờ |
| **AC-BRD-03** | Chạm đích hợp lệ ⇒ đi được nước; đích không hợp lệ ⇒ không đi |
| **AC-BRD-04** | Lật bàn ⇒ **toạ độ gửi lên máy chủ không đổi** |
| **AC-BRD-05** | `Esc` bỏ chọn; mũi tên + `Enter` đi được nước bằng bàn phím |
| **AC-BRD-06** | Chưa tới lượt ⇒ thao tác **vô hiệu**, và lệnh giả mạo bị **máy chủ từ chối** |
| **AC-BRD-07** | **Người xem** không đi được nước kể cả khi giả mạo dữ liệu |
| **AC-BRD-08** | Máy chủ từ chối ⇒ bàn cờ **hoàn về đúng trạng thái máy chủ** |
| **AC-BRD-09** | Bấm hai lần nhanh ⇒ ghi **một** nước |
| **AC-BRD-10** | Nước vừa đi được **đánh dấu rõ** |
| **AC-BRD-11** | Bị chiếu ⇒ có **chữ** báo, không chỉ đổi màu |
| **AC-BRD-12** | Ở **360px** và **390px** bàn cờ **không tràn ngang** và dùng được |
| **AC-BRD-13** | Mọi quân có **nhãn trợ năng tiếng Việt** đúng vị trí |
| **AC-BRD-15** | Bật **giả lập mù màu đỏ–lục** ⇒ vẫn phân biệt được hai phe, kể cả quân **Sĩ, Mã, Xe** |
| **AC-BRD-14** | Người xem thấy nước đi **cùng lúc** với người chơi |

---

## 16. DEPENDENCY

[../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) — luật và hệ toạ độ · [REQ-MATCH](REQ-MATCH.md) · [REQ-CLOCK](REQ-CLOCK.md) · [REQ-HISTORY-REMATCH](REQ-HISTORY-REMATCH.md)

## 17. OPEN QUESTIONS

**Không còn.** `BA-A-05` đã chốt ở `DEC-024`: **WCAG 2.1 AA**, bảng màu đã đo và **đạt**; thêm `DT-21` bắt buộc có dấu hiệu phân biệt hai phe không phụ thuộc màu và chữ.
