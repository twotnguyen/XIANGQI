# MÁY TRẠNG THÁI

**ID:** `SM` · **Trạng thái:** v1 · **Cập nhật:** 2026-09-21

Mọi trạng thái của hệ thống, kèm **chuyển hợp lệ** và **chuyển phải bị từ chối**.

---

## 1. PHÒNG

```
                  ┌─────────────┐
  (tạo phòng) ───►│  ĐANG CHỜ   │
                  └──────┬──────┘
                         │ cả hai người chơi online và sẵn sàng
                         ▼
                  ┌─────────────┐
                  │  ĐANG CHƠI  │
                  └──────┬──────┘
                         │ ván kết thúc hoặc gián đoạn
                         ▼
                  ┌─────────────┐
     tái đấu ◄────┤   ĐÃ XONG   │  (sống 10 phút)
   (VÁN MỚI)      └──────┬──────┘
                         │ hết 10 phút · chủ phòng rời
                         ▼
                  ┌─────────────┐
                  │   ĐÃ ĐÓNG   │  (vĩnh viễn)
                  └─────────────┘
```

| Từ | Sự kiện | Đến |
|---|---|---|
| Đang chờ | Đủ hai PLAYER online và sẵn sàng theo cấu hình hiện hành | Đang chơi |
| Đang chờ | Một PLAYER bấm Sẵn sàng khi ghế còn lại trống | Đang chờ, đã ghi ready; chưa có Match (BR-ROOM-21) |
| Đang chờ | Host đổi sang giá trị thời gian khác thành công | Đang chờ, ready cả hai bị xoá; phải xác nhận lại (BR-ROOM-22) |
| Đang chờ | Chủ phòng rời hoặc offline hết hạn 60 giây | Đã đóng |
| Đang chờ | PLAYER còn lại offline hết hạn 60 giây | Đang chờ, ghế trống, ready cả hai bị xoá |
| Đang chơi | Ván kết thúc / gián đoạn | Đã xong |
| Đã xong | **Cả hai** PLAYER gốc còn membership, đồng ý và now < finished_at + 10 phút sau khoá | Đang chơi (**ván mới**); đúng hạn thì đóng phòng |
| Đã xong | Hết 10 phút | Đã đóng |
| Đã xong | Chủ phòng rời | Đã đóng |

### Chuyển PHẢI BỊ TỪ CHỐI

| Chuyển | Vì sao |
|---|---|
| Đang chơi → Đang chờ | Ván đã bắt đầu, không quay lại |
| Đã đóng → bất kỳ | Đóng là **vĩnh viễn** |
| Đang chờ → Đã xong | Phải qua đang chơi |
| Đã xong → Đang chơi **không qua tái đấu** | Chỉ tái đấu mới mở lại được |
| **Nhận ghế PLAYER mới khi Đang chơi/Đã xong** | PLAYING khoá ghế; FINISHED chỉ tái đấu giữa hai người còn ở lại (DEC-032) |
| Đổi cấu hình thời gian khi **không** ở Đang chờ | Khoá cứng |

---

### Ready và đổi bên trong WAITING

Cấu hình/ready gắn revision và membership_id. Một người có thể ready; start đòi hai membership online đúng config revision. Offline vô hiệu ready người đó; đổi thời gian/đổi bên thành công xoá ready cả hai. Đề nghị đổi bên PENDING tối đa 30 giây → ACCEPTED / REJECTED / CANCELLED / EXPIRED; chỉ đối thủ đồng ý, pending chặn ready=true. Không khôi phục ready sau từ chối/hết hạn. Nguồn [room-chat-contract §1](../09-technical/room-chat-contract.md#1-phiên-bản-cấu-hình-ready-và-đổi-bên).

## 2. VÁN

```
   (hai người sẵn sàng / tạo ván với máy)
                    │
                    ▼
             ┌─────────────┐
             │  ĐANG CHƠI  │
             └──────┬──────┘
         ┌──────────┴──────────┐
         ▼                     ▼
  ┌─────────────┐      ┌──────────────┐
  │  KẾT THÚC   │      │  GIÁN ĐOẠN   │
  │ (có kết quả)│      │(không ai thắng)│
  └─────────────┘      └──────────────┘
          (không bao giờ quay lại Đang chơi)
```

### Vào KẾT THÚC

| Nguyên nhân | Ai thắng |
|---|---|
| Chiếu hết | Bên chiếu |
| Hết nước đi | Bên **còn** nước |
| Lặp 3 lần | **Hoà** |
| Đồng ý hoà | **Hoà** |
| Đầu hàng | Đối thủ |
| Hết giờ | Đối thủ |
| **Treo ván** ⭐ | Đối thủ |
| Mất mạng quá hạn | Đối thủ |

### Vào GIÁN ĐOẠN (không ai thắng)

Cả hai mất mạng · máy chủ khởi động lại · máy lỗi

### Chuyển PHẢI BỊ TỪ CHỐI

Kết thúc → Đang chơi · Gián đoạn → Đang chơi · kết thúc **hai lần** · đi nước sau khi kết thúc · đi lại sau khi kết thúc

**`SM-MAT-01`** — Đúng một kết quả. Xét deadline hợp lệ đến trước trước khi áp dụng lệnh/sự kiện; bằng hạn TIMEOUT ưu tiên DISCONNECT, DISCONNECT ưu tiên INACTIVITY. Lệnh mới không xoá deadline đã tới. Chi tiết nguồn tại REQ-DISCONNECT BR-DIS-07/08 và REQ-INACTIVITY BR-INA-06.

---

## 3. ĐỀ NGHỊ (hoà / đi lại)

```
KHÔNG CÓ ──(tạo đề nghị)──► ĐANG CHỜ ──(đồng ý)──► ÁP DỤNG
    ▲                           │
    │◄──(từ chối)───────────────┤
    │◄──(hết hạn 30 giây)───────┤
    │◄──(có NƯỚC ĐI mới)────────┤
    │◄──(người xin rút lại)─────┘
```

**Tối đa một** đề nghị đang chờ mỗi ván. Bị từ chối: tạo đề nghị thứ hai · **tự chấp nhận** đề nghị của chính mình · trả lời đề nghị đã hết hạn · tạo đề nghị khi ván đã kết thúc.

---

## 4. TREO VÁN ⭐

Theo [REQ-INACTIVITY §12](../01-requirements/REQ-INACTIVITY.md#12-states) và `DEC-026`:

```
BÌNH THƯỜNG ──(3 phút không đi, còn gia hạn)──► ĐANG HỎI (đếm 30 giây NGAY)
  ▲                                                  ├─ xác nhận → gia hạn (*)
  └──────────── (đi nước hợp lệ, reset gia hạn) ────────┤
                                                     └─ hết hạn → VÁN KẾT THÚC

Hết gia hạn: BÌNH THƯỜNG ──(3 phút)──► ĐANG ĐẾM NGƯỢC (30 giây, không cho gia hạn)
```

Không có cạnh “ĐANG HỎI → chờ 30 giây → bắt đầu thêm 30 giây”. (*) Mốc sau xác nhận = thời điểm máy chủ ghi nhận xác nhận hợp lệ + 180 giây (`DEC-027`). Hết gia hạn mà đi nước hợp lệ trước hạn thì tiếp tục và reset theo BR-INA-04.

**Phạm vi:** ván đối kháng online, không giới hạn thời gian. Khi mất kết nối, các mốc chống treo đã có vẫn được giữ và phân xử theo DEC-030.

**Chuyển bị từ chối:** xác nhận khi **không** đến lượt · xác nhận **sau** hạn chót · gia hạn **lần thứ 3 liên tiếp**.

**`SM-INA-01`** — Mất/nối mạng giữ mốc chống treo đã có; không reset/cộng thời gian. Phân xử với hạn mất mạng theo BR-INA-06/DEC-030; nối lại nhận thời gian còn lại hoặc kết quả đã có.

---

## 5. KẾT NỐI CỦA NGƯỜI CHƠI

```
A ONLINE → phát hiện A offline → ghi deadline mất mạng = detectedAt + 60 giây
  ├─ có deadline kết thúc đã tới trước → giữ kết quả đó
  ├─ phát hiện B cũng offline → INTERRUPTED ngay tại thời điểm phát hiện B
  ├─ A nối lại hợp lệ trước mọi deadline → tiếp tục, giữ mốc inactivity cũ
  └─ tới deadline, B vẫn online → A thua DISCONNECT
```

Trước mỗi chuyển trạng thái, phân xử deadline đã tới theo BR-DIS-07/08. Không chờ hết 60 giây mới xử lý khi người thứ hai offline. Với AI, xem BR-DIS-15; WAITING dùng BR-DIS-19; SPECTATOR giữ ghế 15 giây, không tạo kết quả ván.


Người xem dùng timer giữ ghế riêng **15 giây**; không có cạnh xử thua/gián đoạn ván do SPECTATOR offline.

---

## 6. CAMERA / MICRO KHI MỞ NHIỀU TAB

> Theo `DEC-020`, **mọi tab đều thao tác được** cho phần chơi cờ và chat — không có máy trạng thái nào. Chỉ **camera/micro** có trạng thái riêng.

```
NGUỒN ĐANG PHÁT Ở TAB CŨ
   → bấm Chuyển nguồn → ĐANG CHỜ NGẮT
       ├─ xác nhận ngắt → NGUỒN TAB MỚI TẮT → bật chủ động → ĐANG PHÁT
       └─ thất bại → LỖI + THỬ LẠI (nguồn mới chưa phát)
```

**`SM-TAB-01`** — Không phát trước xác nhận ngắt nguồn cũ; sau chuyển nguồn mới vẫn Tắt. Thử lại/ACK muộn không tự bật; nguồn còn lại giữ nguyên (`DEC-033/034`).

**`SM-TAB-02`** — **Camera và micro có máy trạng thái riêng biệt** — camera ở tab 1, micro ở tab 2 là hợp lệ.

**`SM-TAB-03`** — Tab mới **không tự cướp**; phải có thao tác của người dùng (`DEC-021`).

---

## 7. MỨC CHIA SẺ MEDIA (mỗi nguồn, mỗi người chơi)

```
TẮT ──(chọn mức)──► ĐANG XIN QUYỀN ──(đồng ý)──► ĐANG KẾT NỐI ──► ĐANG PHÁT
 ▲                       │                                            │
 │                       └──(từ chối)──► TẮT + thông báo              │
 │                                                                    │
 ├──(chọn Tắt)───────────────────────────────────────────────────────┤
 ├──(ván kết thúc)───────────────────────────────────────────────────┤
 └──(tải lại / quay lại / chuyển thiết bị sang tab khác)─────────────────────────────┘
```

Song song: policy APPLYING → APPLIED hoặc FAILED; transfer STOPPING → APPLIED (nguồn OFF), ERROR hoặc CANCELLED. Tới 30 giây chưa có bằng chứng ⇒ ERROR/FAILED, giữ fence; thử lại không tự bật. ACK client đơn lẻ không đủ; server xác nhận SFU theo [media-control-contract](../09-technical/media-control-contract.md). Không có ACK hardware thì UI chỉ nói luồng cũ đã bị chặn, chưa xác nhận thiết bị tắt.

---

## 8. VIỆC TÍNH CỦA MÁY

```
RỖI ──► ĐANG XẾP HÀNG ──► ĐANG TÍNH ──► XONG ──► (kiểm phiên bản)
  ▲            │               │                      │
  │            │               │                      ├─ khớp   ⇒ áp dụng nước
  │            │               │                      └─ lệch   ⇒ BỎ kết quả
  │            └───────────────┴──(huỷ: đi lại · ván kết thúc · lỗi)
  └────────────────────────────────────────────────────────────────┘
```

**`SM-AI-01`** — Trạng thái *Đang xếp hàng* và *Đang tính* phải hiện **khác nhau** cho người dùng (`BR-AI-17`).

---

## 9. LỜI MỜI

```
Lời mời trực tiếp:
  ĐANG CHỜ ──(chấp nhận)──► ĐÃ TIÊU THỤ   (không dùng lại, kể cả khi rời phòng)
      ├──(từ chối)────────► ĐÃ HUỶ
      ├──(10 phút)────────► HẾT HẠN
      ├──(WATCH: privacy kín hơn/rotate)──► ĐÃ THU HỒI
      └──(phòng đóng)─────► ĐÃ THU HỒI

Mã / link:
  CÒN HIỆU LỰC ──(24 giờ)────────────► HẾT HẠN
       ├──(WATCH: đổi mã/kín hơn)────► ĐÃ THU HỒI
       ├──(phòng đóng)───────────────► ĐÃ THU HỒI
       └──(mã CHƠI được dùng)────────► ĐÃ TIÊU THỤ
                                        (mã XEM dùng nhiều lần)
```

---

## 10. QUAN HỆ BẠN BÈ

```
KHÔNG QUAN HỆ ──(A gửi)──► ĐANG CHỜ ──(B chấp nhận)──► BẠN BÈ
      ▲                        │                          │
      │◄──(B từ chối)──────────┤                          │
      │◄──(A huỷ lời mời)──────┘                          │
      │◄──────────(một bên huỷ kết bạn)───────────────────┘
```

**Đúng một** quan hệ mỗi cặp. Gửi chéo **không** tạo quan hệ thứ hai và **không** tự thành bạn.

---

## 11. THÀNH VIÊN PHÒNG

```
NGOÀI PHÒNG ──(vào)──► TRONG PHÒNG ──(rời)──► NGOÀI PHÒNG
                            │
                            ├─(mất mạng)──► TẠM MẤT ──(quá hạn)──► NGOÀI PHÒNG
                            │                   │
                            │      (quay lại) ◄─┘
                            │
                            ├─(đổi chế độ / đổi mã: chỉ người xem)──► NGOÀI PHÒNG
                            │
                            └─(BỊ ĐUỔI: chỉ người xem)──► BỊ CHẶN KHỎI PHÒNG ⭐
                                                               │
                                                  (phòng đóng) ▼
                                                          NGOÀI PHÒNG
```

**`SM-SPEC-01`** — **Bị chặn** là trạng thái riêng, khác *Ngoài phòng*. Người bị chặn **không** vào lại được phòng đó bằng bất kỳ đường nào (`BR-SPEC-11`).

---

## 12. TÀI KHOẢN

```
KHÁCH ──(đăng ký)──────► CHƯA XÁC MINH ──(bấm link)──► NGƯỜI DÙNG
  │                                                          ▲
  ├──(Google lần đầu)──► CHƯA CÓ USERNAME ──(chọn)───────────┤
  │                                                          │
  └──(đăng nhập)────────────────────────────────────────────┘

NGƯỜI DÙNG ──(đăng xuất · hết hạn · đổi mật khẩu)──► KHÁCH
```

**Chưa xác minh** và **chưa có username** là trạng thái **chặn**: chỉ làm được đúng việc để thoát khỏi trạng thái đó.

---

Phiên có mode REMEMBERED/TEMPORARY độc lập với tài khoản. TEMPORARY: min(lastActiveAt + 30 phút, createdAt + 12 giờ); REMEMBERED: lastActiveAt + 30 ngày. `now >= deadline` hoặc revoked ⇒ chặn trước gia hạn. Restore có thể giữ phiên tạm còn hạn; đăng xuất chấm dứt chắc chắn. Nguồn [session-state](session-state.md)/DEC-040.

## 13. MA TRẬN GIAO NHAU — BA TRẠNG THÁI CÙNG LÚC

Bảng này trả lời các tình huống hay gây lỗi nhất:

| Phòng | Ván | Kết nối | Điều gì xảy ra |
|---|---|---|---|
| Đang chơi | Đang chơi | Cả hai trực tuyến | Bình thường |
| Đang chơi | Đang chơi | A ngoại tuyến | Đếm 60 giây; đồng hồ **vẫn chạy** |
| Đang chơi | Đang chơi | **Cả hai** ngoại tuyến | → Ván **gián đoạn**, phòng **đã xong** |
| Đang chơi | Đang chơi | A treo ván (**còn online**) | Luật treo ván — **chỉ** nếu không giới hạn thời gian |
| Đang chơi | Kết thúc | — | Phòng → **đã xong**, đếm 10 phút |
| Đã xong | Kết thúc | Cả hai trực tuyến | Tái đấu được |
| Đã xong | Kết thúc | A rời | Tái đấu **vô hiệu**; chủ phòng rời ⇒ đóng phòng |
| Đã xong | Kết thúc | Hết 10 phút | Phòng → **đã đóng** |
| Đã đóng | bất kỳ | — | Mọi thao tác bị **từ chối** |

---

## 14. LIÊN QUAN

[data-model.md](data-model.md) · [data-flows.md](data-flows.md) · [session-state.md](session-state.md) · [../04-business-rules/](../04-business-rules/)
