# KIẾN TRÚC HỆ THỐNG

**ID:** `ARCH` · **Trạng thái:** v1 · **Cập nhật:** 2026-09-21

---

## 1. CÁC THÀNH PHẦN

```
┌──────────────┐     đăng nhập      ┌──────────────────┐
│   TRÌNH      │───────────────────►│   XÁC THỰC       │
│   DUYỆT      │                    │   (Supabase Auth)│
│              │                    └──────────────────┘
│  - bàn cờ    │
│  - chat      │  lệnh + sự kiện    ┌──────────────────┐
│  - camera    │◄──────────────────►│  MÁY CHỦ         │
└──────┬───────┘   thời gian thực   │  TRÒ CHƠI        │
       │                            │                  │
       │                            │ - phân xử luật   │
       │ hình/tiếng                 │ - giữ trạng thái │
       │ (đường RIÊNG)              │ - kiểm quyền     │
       │                            └───┬──────────┬───┘
       ▼                                │          │
┌──────────────┐                        │          │
│  MÁY CHỦ     │                        ▼          ▼
│  CHUYỂN TIẾP │              ┌──────────────┐ ┌──────────┐
│  MEDIA (SFU) │◄─────────────┤ CƠ SỞ        │ │  MÁY     │
└──────────────┘  cấp/thu hồi │ DỮ LIỆU      │ │  (AI)    │
                  quyền       │ (PostgreSQL) │ │ tiến     │
                              └──────────────┘ │ trình    │
                                               │ riêng    │
                                               └──────────┘
```

---

## 2. TRÁCH NHIỆM TỪNG THÀNH PHẦN

| Thành phần | Chịu trách nhiệm | **Không** chịu trách nhiệm |
|---|---|---|
| **Trình duyệt** | Hiển thị · nhận thao tác · gợi ý nước hợp lệ | **Quyết định** nước đi hợp lệ hay không · quyết định kết quả ván |
| **Máy chủ trò chơi** | **Phân xử mọi thứ** · giữ trạng thái chính thức · kiểm quyền · đếm thời hạn | Tính nước cho máy · truyền hình/tiếng |
| **Cơ sở dữ liệu** | Lưu bền vững · bảo đảm ràng buộc | Logic nghiệp vụ |
| **Xác thực** | Danh tính · phiên đăng nhập | Quyền trong phòng/ván |
| **Máy chuyển tiếp media** | Truyền hình/tiếng theo quyền được cấp | Quyết định ai được nhận |
| **Máy (AI)** | Tìm nước trong ngân sách | Áp dụng nước — máy chủ vẫn kiểm lại |

**`ARCH-16`** — Tính tìm kiếm CPU trong event loop chính có thể chặn phục vụ ván khác. Một backend Node quản lý một tiến trình AI con cách ly qua IPC (`TECH-09`, DEC-046); child chứa supervisor và tối đa hai search worker. Cùng một dịch vụ triển khai nhưng **khác tiến trình hệ điều hành**, không phải hai dịch vụ mạng. Backend giữ khoá dữ liệu và xác thực; child không có quyền ghi DB. Child chết: huỷ/kết thúc job theo retry, tạo child mới; backend restart: `ARCH-10`. `/healthz` kiểm DB và IPC heartbeat, shutdown đóng child và worker trước thoát.

**`ARCH-01`** — Máy chủ trò chơi là **nguồn sự thật duy nhất**. Mọi thành phần khác là đầu vào hoặc đầu ra của nó.

---

## 3. ĐƯỜNG ĐI CỦA DỮ LIỆU

| Loại dữ liệu | Đường đi |
|---|---|
| Nước đi, chat, trạng thái phòng | Trình duyệt ⇄ **Máy chủ trò chơi** ⇄ Cơ sở dữ liệu |
| Danh tính, phiên | Trình duyệt ⇄ **Xác thực**; máy chủ **kiểm lại** mỗi thao tác |
| **Hình và tiếng** | Trình duyệt ⇄ **Máy chuyển tiếp media** (đường **riêng**) |
| Quyền nhận media | **Máy chủ trò chơi** → Máy chuyển tiếp media |
| Nước đi của máy | **Máy chủ trò chơi** ⇄ Tiến trình máy |

**`ARCH-02`** — Trình duyệt **không bao giờ** đọc thẳng cơ sở dữ liệu. Mọi dữ liệu ứng dụng đi qua máy chủ trò chơi.

**`ARCH-03`** — Quyền nhận media do **máy chủ trò chơi** cấp, **không** do trình duyệt tự khai.

---

## 4. XỬ LÝ MỘT LỆNH — THỨ TỰ BẮT BUỘC

```
① xác thực danh tính + quyền với lệnh; quyền phát thiết bị chỉ kiểm khi thao tác media
② KHOÁ ván (không cho hai lệnh chạy chồng)
③ lệnh này xử lý chưa?  ──► rồi ⇒ trả kết quả cũ, KHÔNG làm lại
④ ván đang chơi? phiên bản khớp?
⑤ TÍNH LẠI ĐỒNG HỒ ──► hết giờ ⇒ kết thúc ván, TỪ CHỐI lệnh
⑥ đúng lượt? đúng vai trò? ĐÚNG LUẬT CỜ?
⑦ áp dụng · tăng phiên bản · ghi lịch sử
⑧ kiểm kết thúc ván
⑨ LƯU (tất cả hoặc không có gì)
⑩ mở khoá
⑪ rồi MỚI phát tin cho cả phòng
```

| ID | Luật |
|---|---|
| **ARCH-04** | Bước ⑤ **trước** bước ⑥ — hết giờ thì ván kết thúc, không nhận nước đi muộn |
| **ARCH-05** | Bước ⑨ là **tất cả hoặc không có gì** — không bao giờ lưu nửa vời |
| **ARCH-06** | Bước ⑪ **sau** khi lưu xong. Phát tin lỗi **không** huỷ dữ liệu đã lưu |
| **ARCH-07** | **Không** giữ khoá khi đang gọi máy tính, gửi email, hay gọi dịch vụ media |

**`ARCH-07` quan trọng:** giữ khoá ván trong lúc chờ máy tính 3 giây sẽ làm **đứng toàn bộ** ván đó.

---

## 5. THỨ TỰ KHOÁ — TRÁNH KẸT CHÉO

Khi một thao tác động tới nhiều thứ, **luôn khoá theo thứ tự này**:

```
PHÒNG  →  NGƯỜI DÙNG (theo thứ tự cố định)  →  VÁN
```

**Không bao giờ** khoá ngược (ván → phòng). Ván AI không có phòng: khi tạo/kết thúc cần thay khoá tham gia của tài khoản thì khoá người dùng trước ván; thao tác chỉ sửa ván thì khoá ván.

**Vì sao:** hai thao tác khoá theo thứ tự ngược nhau sẽ **kẹt vĩnh viễn**.

---

## 6. BỘ ĐẾM THỜI HẠN

Hệ thống có **bảy** loại bộ đếm chủ động, **không** chờ người dùng gửi lệnh:

| Bộ đếm | Hạn | Khi hết |
|---|---|---|
| Đồng hồ ván | Theo cấu hình | Kết thúc ván, đối thủ thắng |
| Mất kết nối người chơi | 60 giây | Thua, hoặc gián đoạn nếu cả hai offline |
| Mất kết nối người xem | 15 giây | Mất ghế |
| Giữ ghế PLAYER trong WAITING | 60 giây | Host ⇒ đóng phòng; PLAYER còn lại ⇒ mất ghế/reset ready, không tạo kết quả Match (DEC-031) |
| **Treo ván** ⭐ | 3 phút + 30 giây | Kết thúc ván, đối thủ thắng |
| Đề nghị hoà/đi lại | 30 giây | Đề nghị hết hiệu lực |
| Đóng phòng sau ván | 10 phút | Đóng phòng |

**`ARCH-08`** — Mọi bộ đếm phải dùng **cùng** đường xử lý lệnh ở §4 (có khoá, có ghi bền vững), **không** đi đường tắt.

**`ARCH-09`** — Khi nhiều thời hạn tới gần nhau, quyết định theo **thời điểm sự kiện**, không theo thứ tự đoạn mã nào chạy trước.

---

## 7. KHỞI ĐỘNG LẠI MÁY CHỦ

```
Máy chủ khởi động lại
    │
    ▼ TRƯỚC khi nhận lệnh mới
Đánh dấu mọi ván đang chơi của lần chạy cũ ──► GIÁN ĐOẠN
    │
    ├─ KHÔNG ai thắng
    ├─ KHÔNG dùng thời gian nghỉ để xử thua ai
    └─ lịch sử ván ĐƯỢC GIỮ
```

**`ARCH-10`** — Bản này chỉ hỗ trợ **một** máy chủ trò chơi. Chạy nhiều máy chủ song song **ngoài phạm vi**.

---

## 8. THU HỒI QUYỀN MEDIA

Quyền đã cấp cho máy chuyển tiếp media **không tự mất** khi máy chủ trò chơi đổi ý. Phải chủ động thu hồi:

```
① ghi mức quyền mong muốn mới
② yêu cầu máy chuyển tiếp NGỪNG phục vụ nhóm cũ
③ CHỜ bằng chứng SFU đã thu hồi, ACK client không đủ
④ tạo thế hệ mới cho transport của nguồn bị tác động, giữ nguồn khác
⑤ xác thực lại operation/epoch; mới ĐÃ ÁP DỤNG; chuyển owner về OFF
```

| ID | Luật |
|---|---|
| **ARCH-11** | Mỗi thế hệ có **định danh mới**, **không tái dùng** định danh cũ |
| **ARCH-12** | Chưa có xác nhận SFU ở bước③ ⇒ chưa APPLIED; deadline30giây ⇒ ERROR/FAILED, giữ fence, không phát mới; ACK tab không thay bằng chứng SFU |
| **ARCH-13** | Nếu SFU mất liên lạc: retry/deadline theo [media-control-contract](media-control-contract.md), mức mong muốn vẫn giữ, không quay lại mức rộng hơn; retry không tự capture/publish |

---

Camera/micro độc lập: chỉ xoay hai transport liên quan nguồn bị thu hồi, nguồn còn lại giữ mức/capture. Local/self-host: token cũ có thể tạo lại room cũ tới hết hạn; không cấp publisher hợp lệ vào room đó, token cũ không vào generation mới. Không coi DeleteRoom là vô hiệu token tuyệt đối. Cloud revocation/cutoff kiểm riêng theo API và bằng chứng deployment; không áp giả định Cloud cho local. Chi tiết timeout, race, mẫu RTP mới/buffer và giới hạn không thể tắt webcam vật lý từ xa xem [media-control-contract](media-control-contract.md) (DEC-041).

## 9. RANH GIỚI MÔ-ĐUN

| Mô-đun | Biết gì | **Không** biết gì |
|---|---|---|
| **Luật cờ** | Thế cờ, nước đi | Mạng · cơ sở dữ liệu · người dùng |
| **Máy (AI)** | Thế cờ, ngân sách thời gian | Mạng · cơ sở dữ liệu · phòng |
| **Dịch vụ nghiệp vụ** | Luật nghiệp vụ, cơ sở dữ liệu | Giao thức truyền cụ thể |
| **Lớp giao tiếp** | Giao thức | Luật nghiệp vụ |

**`ARCH-14`** — Lệnh gửi qua đường thường và qua đường thời gian thực phải gọi **cùng một** dịch vụ nghiệp vụ. Không viết hai bản logic. NestJS tách sẵn *service* khỏi *controller/gateway* nên việc này là tự nhiên.

**`ARCH-15`** — **Ranh giới Prisma / SQL thuần** (`TECH-07`): thao tác nào cần **khoá dòng**, **thứ tự khoá**, hoặc **đếm rồi ghi trong cùng transaction** ⇒ **SQL thuần**. Còn lại dùng Prisma. Viết nhầm bên là **mất khoá**.

---

## 10. LIÊN QUAN

[tech-stack.md](tech-stack.md) · [deployment.md](deployment.md) · [../05-data-and-realtime/](../05-data-and-realtime/)
