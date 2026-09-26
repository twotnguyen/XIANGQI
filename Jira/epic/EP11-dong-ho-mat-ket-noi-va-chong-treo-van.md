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
| Start date / Due date | 2026-10-15 / 2026-10-21 |
| Nguồn đặc tả | ISSUE-092 … ISSUE-097, ISSUE-100 … ISSUE-103 (R08, R09, R17) |

**Mục tiêu:** Máy chủ là nguồn thời gian duy nhất: đồng hồ ván (Không giới hạn / 5 / 10 / 15 phút mỗi bên), **bộ đếm chủ động** kết thúc ván khi hết giờ, mất kết nối quá **60 giây** thì thua (nếu đối thủ còn online), cả hai offline / máy chủ khởi động lại ⇒ **gián đoạn, không ai thua**, và **chống treo ván** cho ván không giới hạn.

**Quy tắc thời gian (ghi thẳng để mọi Task dùng chung):**
| Mục | Quy tắc |
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

**Danh sách Story:**
| Story | Tên | Sprint | SP |
|---|---|---|---|
| [ST11.1](../story/ST11.1-dong-ho-van-va-bo-dem-het-gio-may-chu.md) | Đồng hồ ván và bộ đếm hết giờ (máy chủ) | 3 | 3 |
| [ST11.2](../story/ST11.2-an-han-mat-ket-noi-60-giay-ca-hai-offline-khoi-dong-lai-may.md) | Ân hạn mất kết nối 60 giây, cả hai offline, khởi động lại máy chủ | 4 | 5 |
| [ST11.3](../story/ST11.3-chong-treo-van-r17-va-giao-dien-cho-ca-3-phia.md) | Chống treo ván (R17) và giao diện cho cả 3 phía | 4 | 5 |
