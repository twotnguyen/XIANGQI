# ISSUE-109 — Kênh chung: người chơi đọc và gửi

**Nhóm:** E16 · **Phụ thuộc:** 108, 073 · **Trạng thái:** TODO
**⭐ Mô hình MỚI** — `DEC-018`

> DEC-028/029/044: contract hoàn chỉnh tại [ROOM-CHAT §4–5](../09-technical/room-chat-contract.md); không tạo Match sớm để chat.

## 1. MỤC TIÊU
Kênh chung cho **5 người xem + CẢ 2 người chơi** — tất cả đọc và gửi được.

## 2. VÌ SAO ĐỔI MÔ HÌNH

Thiết kế cũ tách **tuyệt đối** hai kênh. `DEC-018` mở một chiều: người chơi **đọc và gửi được** kênh chung, và mỗi người có **công tắc ẩn/hiện riêng**.

⚠ Kênh này tên là **`ROOM`**, **không** phải `SPECTATORS` — vì người chơi cũng tham gia.

## 3. ĐỌC TRƯỚC
[../01-requirements/REQ-CHAT.md](../01-requirements/REQ-CHAT.md) **toàn bộ** · [../07-decisions/decision-log.md](../07-decisions/decision-log.md) `DEC-018`

## 4. PHẠM VI
**✅ LÀM** — kênh `ROOM` · nhãn phân biệt · dòng thông báo
**❌ LÀM SAU** — công tắc ẩn/hiện (110)

## 5. CÁC BƯỚC
1. Kênh `ROOM`: **5 người xem + 2 người chơi** đều **đọc và gửi** được
2. ⭐ **`BR-CHT-02` — luật còn lại tuyệt đối**: người xem **KHÔNG BAO GIỜ** đọc hay gửi kênh `PLAYERS`.
   Chiều ngược lại **đã mở**
3. ⭐ **`BR-CHT-23`** — tin do **người chơi** gửi vào kênh chung phải có **nhãn phân biệt**, để người xem biết ai đang đánh
4. ⭐ **`BR-CHT-22`** — kênh chung **LUÔN hiển thị** dòng:
   ```
   ℹ️ Người chơi cũng đọc và gửi được ở kênh này
   ```
   Người xem cần **biết trước khi nói** — đây là biện pháp minh bạch thay cho cấm đoán kỹ thuật
5. **`BR-CHT-15/26`** — bắt đầu **ván đầu** giữ tin phòng chờ theo quyền. **Tái đấu** ⇒ cả hai kênh mới, trống (`DEC-029`)
6. Người chơi nhận lịch sử **được phép** của cả hai kênh, không được đọc tin riêng cặp trước khi vào thay (BR-CHT-25); người xem chỉ kênh chung

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T109-01` | ⭐ **Người xem gửi kênh chung → người xem khác VÀ CẢ 2 NGƯỜI CHƠI đều nhận** |
| `T109-02` | ⭐ **Người chơi gửi kênh chung → người xem NHẬN ĐƯỢC** |
| `T109-03` | ⭐ **Tin của người chơi có NHÃN PHÂN BIỆT** |
| `T109-04` | ⭐ **Người chơi đọc được LỊCH SỬ kênh chung** |
| `T109-05` | ⭐ **Người xem VẪN KHÔNG đọc được kênh `PLAYERS`** |
| `T109-06` | ⭐ **Người xem VẪN KHÔNG gửi được kênh `PLAYERS`** |
| `T109-07` | ⭐ **Dòng "Người chơi cũng đọc và gửi được" LUÔN có** trong dữ liệu kênh chung |
| `T109-08` | Người xem mới vào → nhận **lịch sử kênh chung** của ván hiện tại |
| `T109-09` | Context mới đã chuyển theo contract040 → CẢ HAI kênh TRỐNG; endpoint tái đấu thật và stale history là T127-18 |
| `T109-10` | Người bị đuổi → **không** nhận tin mới, **không** đọc lịch sử |
| `T109-11` | Tần suất **5 tin/10 giây** qua HTTP/socket thật tính **chung cả hai kênh/tab/context**; retry receipt không tính thêm; cùng ID khác channel trả MESSAGE_ID_REUSED |
| `T109-12` | ⭐ **Tên kênh là `ROOM`**, không phải `SPECTATORS` |
| `T109-13` | Kênh chung có tin phòng chờ; bắt đầu ván đầu giữ tin theo quyền, không mất/nhân đôi; tái đấu vẫn trống theo T109-09 |
| `T109-14` | ROOM history chứa tin hiện tại trước lúc vào; không có context cũ sau rematch; PLAYER được chọn ROOM/PLAYERS đúng quyền |
| `T109-15` | Thu hồi membership chặn REST history/socket resync/queued delivery, không chỉ UI; mọi tab cùng quyền |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 15 test xanh với **7 phiên** (2 chơi + 5 xem)
- [ ] **`T109-01`, `T109-02`** — hai chiều của kênh chung
- [ ] **`T109-05`, `T109-06`** — luật còn lại tuyệt đối
- [ ] **`T109-03`** nhãn phân biệt
- [ ] **`T109-07`** dòng minh bạch

### Contract bổ sung bắt buộc

ROOM không có private_segment_id; sender_is_player là snapshot từ server. Context bắt đầu ngay WAITING, ván đầu reuse, rematch fresh. Theo ROOM-CHAT §4–5.

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-109.md` — bảng ai nhận được gì cho cả hai kênh.

## 9. ⚠ CẠM BẪY
Giữ tên `SPECTATORS` sẽ khiến lập trình viên **chặn nhầm người chơi** khỏi kênh chung. Và **bỏ dòng minh bạch** làm người xem nói chuyện mà không biết người chơi đang đọc — đúng điều `DEC-018` muốn tránh.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-109

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/server/src/modules/chat/chat.service.ts; apps/server/src/modules/chat/chat.controller.ts.
- **File test:** `tests/integration/issue-109.test.ts`.
- **Nhận từ phụ thuộc:** 108 SQL send/read predicate; 073 memberships; ROOM-CHAT source-of-truth.
- **Bàn giao:** ROOM cho 7 members hiện hành; sender Is Player server snapshot; current context history; ROOM cấm privateSegmentId.
- **Trình tự xử lý tối thiểu:** Reuse 108 service channel authorization,không tạo second chat store; ROOM privateSegmentId null; role label from membership captured lúc gửi; runtime quyền luôn current.

### Chuẩn bị và oracle từng nhóm ca

**Given:** 2 PLAYER+5 SPECTATOR real sockets; ROOM tin trước S5 join; PLAYERS secret control.

| ID test (tiền tố T109 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–08,12,14` | A vàS 1 gửi ROOM; S5 join/read 50; S1 forged PLAYERS; change client sender Is Player | 7 authorized recipients; S5 thấy ROOM trước khi vào; nhãn server correct; no PLAYERS leak; channel always ROOM,notice semantic metadata. |
| `09–11,13,15` | First start thật→context mới từ transaction fixture040; rematch endpoint ở127; revoke S1 before delivery/history; send 6 across channels | First start keep sids; fresh rematch no history; old context deny; revoked all tab deny; remaining recipients positive; 6 th rate-limited. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence109 = { roomRecipients: number; playerLabelFromServer: boolean; spectatorPrivateMessages: number; revokedQueuedEvents: number };

export function assertIssue109KeyCase(actual: Evidence109): void {
  expect(actual).toMatchObject({roomRecipients:7,playerLabelFromServer:true,spectatorPrivateMessages:0,revokedQueuedEvents:0});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Broadcast ROOM chỉ SPECTATOR hoặc dùng client role label; T109-01/02/03 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-109.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:integration -- tests/integration/issue-109.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 110 visibility purely local; 111 two frames; 127 real rematch context test.

### Gate endpoint tương lai

T109-09 dùng transaction tạo/seal context thật theo schema040 để kiểm projection và quyền đọc của chat service109; không ghi endpoint tái đấu chưa tồn tại là PASS. T127-09/18 sở hữu chuỗi gửi chat→tái đấu thật→hai kênh trống→stale context bị từ chối. T109-11 là gate thực cho quota hai kênh và xung đột payload khác channel được bàn giao từ T108-17/20; không chỉ gọi limiter primitive.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-CHT-02` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |
| `AC-CHT-05` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |
| `AC-CHT-16` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |
| `AC-CHT-22` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |
| `AC-CHT-25` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
