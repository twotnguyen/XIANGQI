# FLOW-AI — CHƠI VỚI MÁY

**Yêu cầu:** [REQ-AI](../01-requirements/REQ-AI.md)

---

## 1. TẠO VÁN

```
SẢNH ──► [Chơi với máy]
           │
           ├─ đang ở phòng online ──► "Phải rời phòng trước"
           ├─ đã có ván với máy ────► "Kết thúc ván cũ trước"
           │
           ▼
    ┌────────────────────────────────┐
    │ Cấp độ                         │
    │  ( ) Dễ  ( ) Trung bình (•) Khó│
    │ Bạn cầm quân                   │
    │  (•) Đỏ (đi trước)   ( ) Đen   │
    │ Thời gian                      │
    │  [ Không giới hạn ▾ ]          │
    │         [ Bắt đầu ]            │
    └────────────────────────────────┘
           │
           ▼
    Tạo ván · bàn cờ thế ban đầu
           │
      ┌────┴────┐
   cầm ĐỎ    cầm ĐEN
      │         │
      ▼         ▼
 bạn đi     MÁY ĐI TRƯỚC
 trước
```

---

## 2. MỘT LƯỢT VỚI MÁY

```
Bạn đi một nước
    │
    ▼
Máy chủ phân xử (y như ván online)
    │
    ▼ chấp nhận
Giao việc cho máy
    │
    ▼
┌──────────────────────────┐
│ "Đang chờ đến lượt       │  ← ĐANG XẾP HÀNG
│  xử lý…"                 │
└──────────────────────────┘
    │
    ▼
┌──────────────────────────┐
│ "Máy đang suy nghĩ…"     │  ← ĐANG TÍNH (hiện KHÁC với xếp hàng)
└──────────────────────────┘
    │
    ├─ Dễ:         tối đa 300 ms
    ├─ Trung bình: tối đa 1000 ms
    └─ Khó:        tối đa 3000 ms
    │
    ├─ ⚠ ngân sách bị CẮT nếu đồng hồ máy còn ít hơn
    │
    ▼
Máy trả nước đi
    │
    ├─ phiên bản đã đổi (bạn vừa đi lại) ──► ❌ BỎ kết quả
    ├─ nước KHÔNG hợp lệ ───────────────────► ❌ coi là lỗi máy
    │
    ▼ hợp lệ
Bàn cập nhật ──► đến lượt bạn
```

---

## 3. ĐI LẠI VỚI MÁY

```
Bấm [Xin đi lại]
    │
    ├─ chưa đi nước nào ──► nút VÔ HIỆU
    │
    ▼
⚡ CÓ HIỆU LỰC NGAY — không cần máy đồng ý
    │
    ├─► HUỶ việc máy đang tính (nếu có)
    ├─► bàn lùi 1 hoặc 2 nửa nước
    ├─► ⚠ KHÔNG hoàn lại thời gian
    └─► kết quả máy tới muộn bị BỎ
```

**Khác ván online:** online phải chờ đối thủ đồng ý; với máy thì **không**.

---

## 4. NHỮNG THỨ VÁN VỚI MÁY KHÔNG CÓ

```
❌ Phòng          ❌ Người xem      ❌ Chat
❌ Camera/Micro   ❌ Nút xin hoà    ❌ Luật chống treo ván
```

**Máy hoà thế nào?** Chỉ theo **luật lặp 3 lần**, giống ván online. Không có nút xin hoà.

**Vì sao không có luật chống treo ván:** luật đó sinh ra để bảo vệ **người đang chờ**. Ván với máy **không có ai đang chờ** và không chiếm ghế của ai (`DEC-012`).

---

## 5. KẾT THÚC VÁN

```
                VÁN VỚI MÁY
                     │
    ┌────────────────┼────────────────┐
    ▼                ▼                ▼
 KẾT THÚC        KẾT THÚC         GIÁN ĐOẠN
 bạn thắng       bạn thua      (không ai thắng)
    │                │                │
 ├ chiếu hết      ├ chiếu hết      ├ máy lỗi (sau 1 lần thử lại)
 ├ hết nước       ├ hết nước       ├ ngoại tuyến đủ 60 giây (*)
 ├ máy hết giờ    ├ bạn hết giờ    └ máy chủ khởi động lại
 └ (hoà: lặp 3 lần) └ bạn đầu hàng
                     │
                     ▼
              ┌────────────────┐
              │  [ Chơi lại ]  │ ── giữ cấp độ + thời gian
              │  [ Về sảnh  ]  │    đổi bên theo lựa chọn
              └────────────────┘
```

(*) Đồng hồ bên đến lượt **không dừng khi offline**: còn 20 giây ⇒ `TIMEOUT` tại giây 20; còn đúng 60 giây ⇒ `TIMEOUT` thắng ưu tiên; còn hơn 60 giây/không giới hạn ⇒ gián đoạn ở giây 60 nếu chưa có kết quả. Quy tắc chuẩn: `BR-AI-11` / DEC-045.

**`FLOW-AI-01`** — **Không bao giờ** xử bạn thua vì lỗi máy hay lỗi hệ thống (`BR-AI-03`).

---

## 6. NHÁNH LỖI

| Tình huống | Xử lý |
|---|---|
| Máy hết ngân sách chưa xong | Dùng **nước hợp lệ dự phòng** |
| Máy trả nước không hợp lệ | Từ chối, coi là lỗi máy, **thử lại 1 lần** |
| Máy lỗi 2 lần liên tiếp | Ván **gián đoạn**, bạn **không thua** |
| Hệ thống quá tải | Từ chối ván **mới**; ván đang chạy **không bị ảnh hưởng** |
| Đồng hồ máy về 0 | Máy **thua do hết giờ** — ưu tiên hơn lỗi máy |
| Bạn tải lại trang | Ván **vẫn còn**, chơi tiếp |
| Bạn ngoại tuyến đủ 60 giây | Chưa có kết quả/deadline trước đó ⇒ **gián đoạn**; hết giờ trước hoặc đúng giây 60 vẫn `TIMEOUT` |
| Bạn treo máy không đi nước | Không có luật treo ván; nếu chọn thời gian thì đồng hồ vẫn chạy, offline vẫn xét grace60giây |

---

## 7. GIAO DIỆN KHÔNG ĐƯỢC LỘ GÌ

**`FLOW-AI-02`** — Trong lúc đang chơi, giao diện **không** hiện điểm đánh giá hay đường tính toán của máy. Đó là **mách nước** (`BR-AI-31`).
