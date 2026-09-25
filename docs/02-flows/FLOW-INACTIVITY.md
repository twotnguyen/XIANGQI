# FLOW-INACTIVITY — CHỐNG TREO VÁN ⭐

**Yêu cầu:** [REQ-INACTIVITY](../01-requirements/REQ-INACTIVITY.md)
**Quyết định:** `DEC-030` `DEC-027` `DEC-026` `DEC-002` `DEC-010` `DEC-011` `DEC-012` `DEC-013` `DEC-016`

---

## 1. KHI NÀO LUỒNG NÀY CHẠY

```
        Ván đang chơi
              │
    ┌─────────┴─────────┐
    │  Ván ONLINE?      │──KHÔNG──► ❌ KHÔNG áp dụng (ván với máy)
    └─────────┬─────────┘
              │ CÓ
    ┌─────────┴─────────┐
    │ KHÔNG GIỚI HẠN    │──KHÔNG──► ❌ KHÔNG áp dụng (đã có luật hết giờ)
    │ thời gian?        │
    └─────────┬─────────┘
              │ CÓ
    ┌─────────┴─────────┐
    │ Người đến lượt    │──KHÔNG──► ❌ dùng luật MẤT KẾT NỐI (60 giây)
    │ còn ONLINE?       │
    └─────────┬─────────┘
              │ CÓ
              ▼
        ✅ LUỒNG NÀY CHẠY
```

---

## 2. LUỒNG ĐẦY ĐỦ

Theo [REQ-INACTIVITY §12](../01-requirements/REQ-INACTIVITY.md#12-states), hộp thoại và đồng hồ 30 giây bắt đầu đồng thời (`DEC-026`).

```
A đến lượt (0:00)
  ├─ đi nước hợp lệ trước 3:00 → ván tiếp tục; reset gia hạn
  └─ tới 3:00 vẫn không đi
       ├─ còn gia hạn → hỏi “Bạn còn trong ván đấu không?” + đếm 30 giây NGAY
       │    ├─ xác nhận trước hạn → gia hạn (mốc tiếp theo = xác nhận hợp lệ + 180 giây)
       │    ├─ đi nước hợp lệ trước hạn → tiếp tục, reset gia hạn
       │    └─ hết hạn không phản hồi → 3:30 A THUA
       └─ hết gia hạn → chỉ đếm 30 giây, không cho xác nhận gia hạn
            ├─ đi nước hợp lệ trước hạn → tiếp tục, reset gia hạn
            └─ hết hạn không đi → A THUA
```

B và người xem thấy dòng trạng thái kèm đếm ngược từ cùng thời điểm A được hỏi. Nhánh mất mạng/kết thúc vì lý do khác vẫn xử riêng; reconnect giữ hạn cũ theo DEC-030, không cấp thêm thời gian.

---

## 3. VÌ SAO GIỚI HẠN 2 LẦN

Nếu **không giới hạn**, người chơi bấm xác nhận mỗi 3 phút là ván treo **vô hạn** — luật sẽ **không giải quyết được vấn đề nó sinh ra để giải quyết**.

**Thời gian khi không đi nước và không có reconnect/undo:**

Mốc cảnh báo đầu = lúc đến lượt + 180 giây. Sau mỗi xác nhận hợp lệ, mốc cảnh báo tiếp theo = lúc máy chủ ghi nhận xác nhận + 180 giây (`DEC-027`). Hết hai lần gia hạn: tới mốc tiếp theo thì đếm cuối 30 giây, không cho gia hạn nữa.

```
0:00 đến lượt → 3:00 hỏi + đếm 30 giây
3:29 xác nhận lần 1 → 6:29 hỏi + đếm 30 giây
6:58 xác nhận lần 2 → 9:58 đếm cuối → 10:28 THUA
```

Với hai lần xác nhận trễ `d1`, `d2` giây, mỗi giá trị từ 0 đến dưới 30: tổng = **570 + d1 + d2 giây** (từ **9:30 đến dưới 10:30**). **9:30 chỉ là trường hợp xác nhận ngay cả hai lần**, không phải trần cố định. Xác nhận đúng hoặc sau hạn bị từ chối. Reconnect không làm tăng mốc theo DEC-030; nếu DISCONNECT hoặc một kết quả khác đến trước thì ván kết thúc sớm hơn. Undo vẫn theo quy tắc riêng.

**Bộ đếm reset khi A thực sự đi một nước** ⇒ người chơi chậm trong ván dài **không bị phạt oan**:

```
A treo 2 lần, rồi ĐI ĐƯỢC MỘT NƯỚC ──► lại có đủ 2 lần gia hạn cho lượt sau
```

---

## 4. VA CHẠM VỚI MẤT KẾT NỐI

Theo [REQ-INACTIVITY §7](../01-requirements/REQ-INACTIVITY.md#7-exception-flows-luồng-lỗi), `DEC-030`:

```
A mất mạng → giữ mốc hỏi/hạn trả lời cũ + số gia hạn
          → theo dõi hạn mất mạng = phát hiện offline + 60 giây
   ├─ nối lại trước khi có kết quả → đồng bộ thời gian còn lại theo hạn cũ
   ├─ INACTIVITY đến trước → thua INACTIVITY
   ├─ DISCONNECT đến trước hoặc cùng lúc → thua DISCONNECT (nếu đối thủ online)
   └─ cả hai offline / server restart → theo luật gián đoạn hiện có
```

Không reset 3 phút hoặc cộng thêm 60 giây vào hạn cũ. Ví dụ: mất mạng 2:50, quay lại 3:10 ⇒ còn 20 giây tới 3:30. Kết quả đã tới hạn hợp lệ không bị huỷ bởi nối lại/sự kiện phát hiện sau.

---

## 5. AI THẤY GÌ

| | A (đến lượt) | B (đang chờ) | Người xem |
|---|---|---|---|
| Bình thường | Bàn cờ | Bàn cờ | Bàn cờ |
| Đang hỏi | **HỘP THOẠI + ĐẾM NGƯỢC NGAY** | Dòng + đếm ngược | Dòng + đếm ngược |
| Đếm ngược | Hộp thoại + đếm | Dòng + **đếm ngược** | Dòng + **đếm ngược** |
| Kết thúc | Màn kết quả | Màn kết quả | Màn kết quả |

**`FLOW-INA-01`** — B và người xem **chỉ quan sát**. **Không có nút ép kết thúc sớm** — chỉ hệ thống quyết định theo thời gian.

**Vì sao B phải thấy:** nếu không thấy gì, B vẫn sẽ **đầu hàng** vì tưởng mình bị kẹt vĩnh viễn — tức là luật mới **không cứu được** đúng người nó sinh ra để cứu.

---

## 6. NHÁNH LỖI

| Tình huống | Xử lý |
|---|---|
| A xác nhận **sau** hạn 30 giây | **Từ chối** — ván đã kết thúc |
| A bấm xác nhận **2 lần** | Chỉ cộng **3 phút một lần** |
| Tab **chỉ đọc** bấm xác nhận | **Từ chối** |
| Chuyển thiết bị sang tab khác khi đang bị hỏi | Tab mới **thừa hưởng** trạng thái, xác nhận được |
| Máy chủ khởi động lại khi đang đếm | Ván **gián đoạn**, **không ai thắng** |
| A hết nước đi hợp lệ | Ván đã kết thúc theo **luật cờ** trước khi treo ván kích hoạt |
| Đi lại được chấp nhận khi đang bị hỏi | Đồng hồ treo ván **bắt đầu lại**; gia hạn **giữ nguyên** |
