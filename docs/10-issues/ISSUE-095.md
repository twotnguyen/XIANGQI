# ISSUE-095 — Heartbeat + presence trong ván

**Nhóm:** E13 Mất kết nối · **Phụ thuộc:** 084 · **Trạng thái:** TODO

> **DEC-031:** presence phải hỗ trợ cả thành viên phòng WAITING khi chưa có Match, làm căn cứ giữ ghế 60 giây và start guard. Một tab còn online không bị xoá ready. Điều chỉnh kế hoạch integration với ISSUE-064 theo F17, không để giả định “chỉ có presence sau khi Match tồn tại”.

## 1. MỤC TIÊU
Biết ai đang online **trong ván** — và **ít nhất một tab** còn kết nối thì vẫn tính là online.

## 2. ĐỌC TRƯỚC
[../05-data-and-realtime/session-state.md](../05-data-and-realtime/session-state.md) **§5 `SS-18`** · [../01-requirements/REQ-DISCONNECT.md](../01-requirements/REQ-DISCONNECT.md) §9

## 3. PHẠM VI
**✅ LÀM** — tín hiệu duy trì · theo dõi online trong ván
**❌ KHÔNG LÀM** — ân hạn 60 giây (096)

## 4. FILE TẠO
`apps/server/src/realtime/match-presence.service.ts`

## 5. CÁC BƯỚC
1. Client gửi tín hiệu **mỗi 10 giây** kèm `tabId`
2. Máy chủ coi là mất kết nối sau **30 giây** không nhận tín hiệu
3. **Ngắt kết nối rõ ràng** ⇒ đánh dấu **ngay**, không chờ hết hạn
4. ⭐ **`SS-18`** — người dùng **online** nếu **ít nhất một tab** còn kết nối.
   Đóng 1 trong 3 tab **KHÔNG** làm họ ngoại tuyến
5. Lưu trạng thái vào `client_controls` hoặc bảng presence — **bền vững**, để bộ đếm ở issue 096 dùng được
6. Phát `presence` trong snapshot: `{ userId, online, disconnectDeadlineMs }`
   ⛔ **Không** lộ `tabId` hay thông tin nội bộ
7. Áp dụng cho **cả** người chơi online **và** người thật trong ván với máy
8. Heartbeat chỉ cập nhật presence, **không gia hạn phiên đăng nhập** (DEC-038); online không đồng nghĩa đang chủ động sử dụng. Phối hợp kiểm hạn phiên của ISSUE-050.

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T095-01` | Kết nối → presence báo **online** |
| `T095-02` | Ngắt rõ ràng → đánh dấu **ngay** |
| `T095-03` | ⭐ **Đồng hồ giả: không tín hiệu 30 giây → ngoại tuyến** |
| `T095-04` | Tín hiệu đúng hạn → **giữ online** |
| `T095-05` | ⭐ **Mở 3 tab, đóng 1 → VẪN online** |
| `T095-06` | ⭐ **Đóng cả 3 tab → ngoại tuyến** |
| `T095-07` | ⭐ **Presence KHÔNG chứa `tabId`** hay dữ liệu nội bộ |
| `T095-08` | Presence có `disconnectDeadlineMs` khi ngoại tuyến |
| `T095-09` | Cả phòng nhận cập nhật presence |
| `T095-10` | Ván với máy: người thật cũng có presence |
| `T095-11` | Trạng thái lưu **bền vững**, sống qua việc xử lý ở tiến trình khác |
| `T095-12` | Heartbeat đều đặn giữ presence nhưng không dời deadline phiên; tới hạn phiên vẫn bị chặn theo T050-11/12, không được refresh tự động để tiếp tục |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 12 test xanh
- [ ] **`T095-05`** nhiều tab tính một người
- [ ] **`T095-07`** không rò dữ liệu nội bộ
- [ ] Test thời gian dùng **đồng hồ giả**
- [ ] Trạng thái bền vững

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-095.md`

## 9. ⚠ CẠM BẪY
Tính ngoại tuyến ngay khi **một** tab đóng sẽ khiến người mở nhiều tab **bị xử thua oan** — họ vẫn đang chơi ở tab khác. `SS-18` và `T095-05` chặn điều này.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-095

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/server/src/realtime/match-presence.service.ts.
- **File test:** `tests/integration/issue-095.test.ts`.
- **Nhận từ phụ thuộc:** 084 socket authenticated +050 expiry; 042 durable client presence; 064 WAITING ready guard.
- **Bàn giao:** Presence public {user Id,online,disconnect Deadline Ms}; aggregate ít nhất 1 client còn sống; không công khai client/tab identity.
- **Trình tự xử lý tối thiểu:** Ghi last Seen theo client đã xác thực; aggregate user dưới khoá, chỉ phát transition online↔offline; last-tab offline WAITING vô hiệu ready và ready_revision, không cần Match.

### Chuẩn bị và oracle từng nhóm ca

**Given:** A có 3 socket ở 2 instance authenticated, B 1 socket; lặp fixture WAITING không Match và ACTIVE online/AI.

| ID test (tiền tố T095 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–06,08–10` | Heartbeat mỗi 10 s; ngắt 1 rồi hết 3; advance last Seen+29999/30000/30001 | 1 tab còn sống ⇒ online; ngắt cuối tức thì offline; hết 30 s offline một lần, deadline 60 s từ phát hiện, cả room nhận. |
| `07,11–12` | Đọc DB từ connection khác và mọi snapshot; heartbeat tới session expiry−1/0/+1 | State durable; không tab Id/secret; heartbeat không sửa session expiry/idle deadline; đúng hạn session bị chặn. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence095 = { onlineAfterOneClose: boolean; onlineAfterAllClose: boolean; leakedTabIds: number; sessionDeadlineChanged: boolean };

export function assertIssue095KeyCase(actual: Evidence095): void {
  expect(actual).toMatchObject({onlineAfterOneClose:true,onlineAfterAllClose:false,leakedTabIds:0,sessionDeadlineChanged:false});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Tính online bằng socket vừa đóng thay vì aggregate; T095-05 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-095.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:integration -- tests/integration/issue-095.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 096 tiêu thụ disconnected At; 098 nhiều tab; 064 start không nhận PLAYER offline.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
