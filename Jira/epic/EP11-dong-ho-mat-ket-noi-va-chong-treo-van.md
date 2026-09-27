# EP11 · Đồng hồ, mất kết nối và chống treo ván

> **Loại:** Epic · **Story:** [ST11.1](../story/ST11.1-dong-ho-van-va-bo-dem-het-gio-may-chu.md), [ST11.2](../story/ST11.2-an-han-mat-ket-noi-60-giay-ca-hai-offline-khoi-dong-lai-may.md), [ST11.3](../story/ST11.3-chong-treo-van-r17-va-giao-dien-cho-ca-3-phia.md)

| Trường Jira | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | `EP11 · Đồng hồ, mất kết nối và chống treo ván` |
| Components | Backend, Frontend, Tester |
| Priority | High |
| Labels | `xq-v2`, `ep11`, `race` |
| Fix versions | `v1.0.0` |
| Start date / Due date | 2026-10-13 / 2026-10-20 |
| Nguồn đặc tả | ISSUE-092 … ISSUE-097, ISSUE-100 … ISSUE-103 (R08, R09, R17) |

---

> ⏱ **Đọc lần đầu:** khoảng 10 phút. · Từ kỹ thuật lạ ⇒ [Từ điển kỹ thuật](../05-TU-DIEN-KY-THUAT.md) · Cách kiểm ⇒ [Sổ tay kiểm thử](../04-HUONG-DAN-KIEM-THU.md)

## 1. TÓM TẮT (đọc trong 1 phút)

**Thời gian trong ván** — máy chủ quyết định:
- **Đồng hồ** + hết giờ tự kết thúc ván.
- **Mất kết nối**: 60 giây ân hạn; cả hai rớt ⇒ gián đoạn; máy chủ khởi động lại ⇒ gián đoạn.
- **Chống treo ván** (ván không giới hạn): 3 phút ⇒ hỏi + đếm 30 giây, tối đa 2 lần gia hạn.

## 2. BỐI CẢNH — VÌ SAO EPIC NÀY TỒN TẠI

- Lỗi lần trước `F-04`: không có bộ đếm, ván hết giờ vẫn chạy mãi.
- Đây là Epic **nhiều mốc thời gian nhất** ⇒ mọi test dùng **đồng hồ giả tiêm vào** (Luật tuyệt đối 5); Tester kiểm tay các mốc ngắn (60 giây, 3 phút) và dùng Cách T cho mốc dài / biên mili-giây.

## 3. KHÁI NIỆM CẦN HIỂU

| Khái niệm | Giải thích |
|---|---|
| **Đồng hồ tiêm vào** | `Clock` provider; test tua bằng `advance()` — không `sleep` |
| **Bộ đếm chủ động** | Hẹn giờ trong máy chủ tự kết thúc ván đúng hạn, không chờ ai gửi lệnh |
| **Va chạm hạn** | Hạn tới trước thắng; bằng nhau `TIMEOUT` > `DISCONNECT` > `INACTIVITY` |
| **INTERRUPTED** | Ván gián đoạn không do ai — không ai thắng/thua |
| **`bootId`** | Mã mỗi lần máy chủ khởi động; ván của lần chạy cũ ⇒ `SERVER_RESTART` |

Tra thêm: [Đồng hồ tiêm vào](../05-TU-DIEN-KY-THUAT.md#clock) · [Bộ hẹn giờ](../05-TU-DIEN-KY-THUAT.md#scheduler) · [Pipeline](../05-TU-DIEN-KY-THUAT.md#pipeline) · [Race](../05-TU-DIEN-KY-THUAT.md#race)

## 4. PHẠM VI

**✅ LÀM:** đồng hồ máy chủ + hết giờ; ân hạn 60 giây + va chạm hạn + cả hai offline + khởi động lại; chống treo ván; giao diện mất kết nối và treo ván.

**❌ KHÔNG LÀM**
| Việc | Ở đâu |
|---|---|
| Hiển thị đồng hồ | EP10 (TK10.4.2) |
| Đi lại không hoàn thời gian — lệnh đi lại | EP12 |
| Luật thời gian ván với máy | EP15 (dùng lại đồng hồ EP11) |

## 5. LUẬT BẮT BUỘC CHO MỌI TASK

| Luật | Nghĩa |
|---|---|
| Đồng hồ | `elapsed = max(0, now − runningSince)` trừ vào bên **đến lượt**, kẹp ≥ 0. Sau nước đi: chuyển bên, `runningSince = now`. `timeControl = 0` ⇒ `clock = null`, không bao giờ hết giờ |
| Không tạm dừng | đề nghị hoà/đi lại đang chờ và mất kết nối **không** dừng đồng hồ; đi lại **không hoàn** thời gian |
| Đúng bằng hạn | là **hết hạn** (`now >= deadline`) |
| Bộ đếm | chủ động (không chờ ai gửi lệnh), chạy qua **cùng đường xử lý lệnh** (khoá + transaction) và gọi `finalizeMatch`; quyết định theo **thời điểm sự kiện**, không theo đoạn mã nào chạy trước |
| Mất kết nối | phát hiện offline ⇒ hạn `+60 s`; tới hạn: đối thủ online ⇒ người mất kết nối thua `DISCONNECT`; đối thủ cũng offline ⇒ `BOTH_OFFLINE` (gián đoạn) **ngay khi** phát hiện người thứ hai offline |
| Va chạm hạn | hạn nào tới **trước** thắng. Bằng nhau: `TIMEOUT` thắng `DISCONNECT`; `DISCONNECT` thắng `INACTIVITY`. Kết quả đã tới hạn hợp lệ **không bị xoá** bởi sự kiện phát hiện sau |
| Khởi động lại | trước khi nhận lệnh: mọi ván `ACTIVE` của lần chạy cũ (theo `bootId`) ⇒ `INTERRUPTED/SERVER_RESTART`, không ai thắng, giữ lịch sử. Không đặt lại hẹn giờ cho ván cũ |
| Chống treo ván | chỉ ván **ONLINE**, **không giới hạn** (`timeControl = 0`), đang chơi. Đủ **3 phút** kể từ lúc đến lượt (máy chủ ghi) ⇒ **đồng thời** hỏi "Bạn còn trong ván đấu không?" **và** bắt đầu đếm ngược **30 giây**. Xác nhận hợp lệ ⇒ mốc hỏi tiếp = lúc xác nhận + 3 phút; tối đa **2 lần liên tiếp**; đi một nước ⇒ reset mốc + `extensionsUsed = 0`; hết gia hạn ⇒ lần treo sau vào thẳng đếm ngược (không cho xác nhận). Hết 30 giây ⇒ `INACTIVITY`, đối thủ thắng. Mất/nối mạng **giữ** mốc cũ, không cấp thêm |
| Ví dụ mốc (không reconnect/undo) | hỏi 3:00 → xác nhận 3:29 → hỏi 6:29 → xác nhận 6:58 → đếm cuối 9:58 → thua 10:28. Xác nhận ngay cả hai lần ⇒ thua 9:30 |

## 6. ĐẦU VÀO

EP10 (pipeline, finalizer, presence/heartbeat, màn phòng chơi), EP08 (phòng chờ, đóng phòng).

## 7. DANH SÁCH STORY

| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST11.1](../story/ST11.1-dong-ho-van-va-bo-dem-het-gio-may-chu.md) | Đồng hồ ván và bộ đếm hết giờ (máy chủ) | 3 | 2 |
| [ST11.2](../story/ST11.2-an-han-mat-ket-noi-60-giay-ca-hai-offline-khoi-dong-lai-may.md) | Ân hạn mất kết nối 60 giây, cả hai offline, khởi động lại máy chủ | 4 | 3 |
| [ST11.3](../story/ST11.3-chong-treo-van-r17-va-giao-dien-cho-ca-3-phia.md) | Chống treo ván (R17) và giao diện cho cả 3 phía | 3 | 3 |

```
TK10.3.2 ═(Done)═► TK11.1.1 ─► TK11.2.1 (+TK10.2.2) ─┬─► TK11.2.2
                                                      └─► TK11.3.1 ─► TK11.3.2
```

## 8. TIÊU CHÍ HOÀN THÀNH EPIC

- [ ] 3 Story Done, mọi Task có báo cáo.
- [ ] Hết giờ / mất kết nối / treo ván đều tự kết thúc ván không cần ai gửi lệnh.
- [ ] Khởi động lại máy chủ thật: ván cũ INTERRUPTED trước khi nhận lệnh (có log).
- [ ] Không test nào dùng `sleep` thật; không ngưỡng nào bị rút ngắn trong code sản phẩm.

## 9. KỊCH BẢN DEMO (~10 phút)

1. Ván 5 phút: để ĐỎ hết giờ ⇒ ván tự kết thúc TIMEOUT.
2. A tắt mạng ⇒ B thấy đếm ngược 60 giây ⇒ A thua DISCONNECT.
3. A rớt, 20 giây sau B rớt ⇒ ván gián đoạn, không ai thua.
4. Ván không giới hạn: A ngồi im 3 phút ⇒ cảnh báo + đếm 30 giây ⇒ bấm Tôi còn đây.
5. Tắt/bật lại máy chủ ⇒ ván cũ SERVER_RESTART.
