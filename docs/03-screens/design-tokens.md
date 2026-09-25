# THIẾT KẾ GIAO DIỆN — MÀU, CHỮ, BỐ CỤC

**ID:** `DT` · **Trạng thái:** v1 · **Cập nhật:** 2026-09-21
**Căn cứ:** Câu 19 phỏng vấn (bàn gỗ, quân chữ Hán) · Câu 20 (máy tính + điện thoại)

---

## 1. ĐỊNH HƯỚNG THỊ GIÁC

**Cờ tướng truyền thống** — bàn gỗ, quân chữ Hán. **Không** lấy giao diện bảng điều khiển hiện đại làm hình mẫu.

---

## 2. MÀU

| Vai trò | Mã màu | Dùng ở |
|---|---|---|
| Nền giấy | `#F5E8CC` | Nền trang |
| Gỗ sáng | `#D8AE72` | Mặt bàn cờ |
| Gỗ viền | `#704525` | Viền bàn, đường kẻ |
| Mực | `#28221C` | Chữ chính |
| Đỏ quân | `#A51F25` | Quân đỏ |
| Đen quân | `#24201C` | Quân đen |
| Tiêu điểm | `#155E75` | Viền khi chọn bằng bàn phím |

### Chuẩn tương phản — **WCAG 2.1 mức AA** (`DEC-024`)

| Loại | Tỉ lệ tối thiểu |
|---|---|
| Chữ thường | **4,5:1** |
| Chữ lớn (≥24px, hoặc ≥18,66px in đậm) | **3:1** |
| Đối tượng đồ hoạ và thành phần giao diện | **3:1** |

**Bảng màu trên đã được ĐO và ĐẠT toàn bộ:**

| Cặp màu | Đo được | Cần | |
|---|---:|---:|:---:|
| Chữ mực trên nền giấy | **12,95:1** | 4,5 | ✅ |
| Chữ mực trên gỗ sáng | **7,65:1** | 4,5 | ✅ |
| Quân **đỏ** trên gỗ | **3,62:1** | 3,0 | ✅ |
| Quân **đen** trên gỗ | **7,87:1** | 3,0 | ✅ |
| Đường kẻ bàn cờ trên gỗ | **3,98:1** | 3,0 | ✅ |
| Viền tiêu điểm trên nền giấy | **5,99:1** | 3,0 | ✅ |
| Viền tiêu điểm trên gỗ | **3,54:1** | 3,0 | ✅ |
| Chữ gỗ viền trên nền giấy | **6,74:1** | 4,5 | ✅ |

> **Không được đổi bất kỳ mã màu nào** ở bảng trên mà không đo lại. Quân đỏ trên gỗ đang là **3,62:1** — chỉ cách ngưỡng 3:1 một khoảng hẹp.

---

**`DT-01`** — **Không bao giờ** truyền đạt thông tin **chỉ bằng màu**. Mọi trạng thái phải có **chữ hoặc biểu tượng** đi kèm.

| Trạng thái | ❌ Sai | ✅ Đúng |
|---|---|---|
| Đến lượt | Chỉ viền sáng | Viền + chữ *"Đến lượt bạn"* |
| Bị chiếu | Chỉ tướng đỏ lên | Chữ *"Đang bị chiếu"* + biểu tượng |
| Đang online | Chỉ chấm xanh | Chấm + chữ *"Đang online"* |
| Đồng hồ sắp hết | Chỉ số đỏ | Số + biểu tượng cảnh báo |

---

## 3. CHỮ

| Dùng cho | Font |
|---|---|
| Giao diện | Font hệ thống hỗ trợ **tiếng Việt có dấu** |
| Quân cờ | Font chữ Hán **tự host** (đã kiểm giấy phép), dự phòng serif |

**`DT-02`** — **Không** tải font từ dịch vụ ngoài — bản chạy ở máy cá nhân phải hoạt động **không cần mạng**.

### Quân cờ

| Bên | Chữ |
|---|---|
| **Đỏ** | 帥 仕 相 傌 俥 炮 兵 |
| **Đen** | 將 士 象 馬 車 砲 卒 |

Sông ghi: **楚河** / **漢界**

**`DT-03`** — **Không** có tuỳ chọn đổi quân sang chữ Việt. Chỉ chữ Hán (Câu 19).

### `DT-21` — Hai phe phải phân biệt được KHÔNG CẦN MÀU và KHÔNG CẦN ĐỌC CHỮ

Quân đỏ so với quân đen chỉ đạt **2,17:1**. Đây **không vi phạm** WCAG (mỗi quân nằm trên nền gỗ và đều đạt 3:1 so với gỗ), nhưng có rủi ro thực tế.

**Chữ Hán một mình là chưa đủ** — đã rà cả 7 cặp:

| Rõ ràng (4/7) | **Gần giống (3/7)** |
|---|---|
| 帥/將 · 相/象 · 炮/砲 · 兵/卒 | **仕/士 · 傌/馬 · 俥/車** |

Ba cặp *Sĩ, Mã, Xe* chỉ khác ở **bộ thủ đứng nhân**. Người **mù màu đỏ–lục** (~8% nam giới) mà **không đọc được chữ Hán** sẽ rất khó phân biệt.

**Bắt buộc:** thêm **một dấu hiệu phân biệt hình dạng** cho hai phe — ví dụ viền quân **nét liền** so với **nét đôi**, hoặc nền quân khác sắc độ rõ rệt. Cách thể hiện do thiết kế chọn, nhưng **phải có** và **phải kiểm thử được ở chế độ giả lập mù màu** (`TS-UI-13`).

**Không đổi mã màu đỏ để giải quyết việc này** — làm đỏ sáng hơn sẽ **giảm** tương phản với nền gỗ, vốn đã sát ngưỡng.

---

## 4. TRỢ NĂNG

| ID | Yêu cầu |
|---|---|
| **DT-04** | Mỗi quân có **nhãn tiếng Việt đầy đủ**: *"Mã đỏ, cột 2 hàng 10"* |
| **DT-05** | Chú giải hiện **tên tiếng Việt** của quân |
| **DT-06** | Bàn cờ dùng được **hoàn toàn bằng bàn phím**: mũi tên di chuyển · `Enter`/`Space` chọn và xác nhận · `Esc` bỏ chọn |
| **DT-07** | Vùng chạm ≥ **44 px** cho nút; các giao điểm bàn cờ **không chồng lấn** |
| **DT-08** | Ở màn hình **360 px**, giao điểm nhỏ hơn 44 px nhưng **phải có dấu nổi bật rõ** và **không phụ thuộc kéo thả** |
| **DT-09** | Chọn bằng bàn phím có viền tiêu điểm **luôn nhìn thấy được** |
| **DT-10** | Thông báo lỗi bằng **tiếng Việt**, nói rõ **cách sửa** |

---

## 5. KHOẢNG CÁCH

Dùng bội số: **4 · 8 · 12 · 16 · 24 · 32 px**

---

## 6. BỐ CỤC MÁY TÍNH

```
┌────────────────────────────────────────────────────────┐
│  THANH ĐIỀU HƯỚNG        🔔2   [Hồ sơ ▾]              │
├────────────────────────────────────────────────────────┤
│  📹 Camera A    📹 Camera B    ← hàng riêng, KHÔNG đè bàn│
├──────────────────────────────┬─────────────────────────┤
│                              │  Lượt · Đồng hồ         │
│                              ├─────────────────────────┤
│        BÀN CỜ                │  Lịch sử nước đi        │
│      (trung tâm)             ├─────────────────────────┤
│                              │  💬 Trò chuyện          │
│                              │  (ghi RÕ kênh nào)      │
│                              ├─────────────────────────┤
│                              │  👥 Người xem 3/5       │
├──────────────────────────────┴─────────────────────────┤
│  [Đầu hàng] [Xin hoà] [Xin đi lại]                     │
└────────────────────────────────────────────────────────┘
```

**Kích thước nghiệm thu:** 1366×768 và 1920×1080

---

## 7. BỐ CỤC ĐIỆN THOẠI

```
┌──────────────────────┐
│ ☰  Cờ chiều thứ 7 🔔2│
├──────────────────────┤
│ ⚫ Lan Trần    07:42 │ ← thanh DÍNH, luôn thấy
│ 🔴 Bạn      ▶ 06:15 │
├──────────────────────┤
│                      │
│      BÀN CỜ          │ ← chiếm TOÀN BỘ chiều ngang
│   (full width)       │
│                      │
├──────────────────────┤
│ [Ván] [Chat] [Camera]│ ← TAB, không hiện cùng lúc
├──────────────────────┤
│ [Đầu hàng][Hoà][Lại] │
└──────────────────────┘
```

**Kích thước nghiệm thu:** 390×844 và 360×800

| ID | Luật |
|---|---|
| **DT-11** | Bàn cờ chiếm **toàn bộ chiều ngang** |
| **DT-12** | Chat và camera vào **tab riêng** — không che bàn cờ |
| **DT-13** | Lượt và đồng hồ ở thanh **dính**, luôn nhìn thấy |
| **DT-14** | Bàn phím ảo mở ra **không** ép bàn cờ gây **cuộn ngang** |
| **DT-15** | **Không tràn ngang** ở mọi kích thước, kể cả 360 px |

---

## 8. NĂM QUY TẮC BỐ CỤC KHÔNG ĐƯỢC PHÁ

| # | Luật |
|---|---|
| **1** | Camera/mic **không bao giờ đè** lên bàn cờ |
| **2** | Thông báo tạm **không che** nút Đầu hàng |
| **3** | Nhãn khung chat **ghi rõ** đang ở kênh nào (*riêng người chơi* / *chung*) |
| **4** | Đồng hồ **luôn nhìn thấy** khi ván đang diễn ra |
| **5** | Ở 360 px **không có cuộn ngang** |

---

## 9. THAO TÁC BÀN CỜ

| ID | Luật |
|---|---|
| **DT-16** | Thao tác chính là **chạm quân → chạm đích**. Kéo thả **tuỳ chọn**, không bắt buộc |
| **DT-17** | Quân đặt **tại giao điểm**, không phải trong ô |
| **DT-18** | Người cầm **đen** thấy bàn **lật**; toạ độ gửi lên máy chủ **không đổi** |
| **DT-19** | Nước vừa đi được **đánh dấu rõ** (ô đi và ô đến) |
| **DT-20** | Quân đã chọn và các đích hợp lệ được **làm nổi bật** |

---

## 10. TRÌNH DUYỆT NGHIỆM THU

| Thiết bị | Trình duyệt |
|---|---|
| Máy tính | Chrome · Edge (bản hiện hành) |
| Android | Chrome |
| iPhone | Safari |

**Ghi rõ phiên bản thực tế** khi kiểm thử. Kiểm thử camera/mic cần **thiết bị thật**.

---

## 11. NGÔN NGỮ

Giao diện **tiếng Việt** toàn bộ, gồm cả thông báo lỗi và nhãn trợ năng.

---

## 12. LIÊN QUAN

[screen-inventory.md](screen-inventory.md) · [../01-requirements/REQ-BOARD.md](../01-requirements/REQ-BOARD.md) · [../04-business-rules/game-rules.md](../04-business-rules/game-rules.md)
