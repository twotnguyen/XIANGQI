# ISSUE-133 — Bảo mật: kiểm ma trận quyền

**Nhóm:** E20 · **Phụ thuộc:** 132 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Chứng minh **mọi ô ❌** trong ma trận quyền **thật sự bị chặn ở máy chủ** — kể cả khi giả mạo dữ liệu.

## 2. ĐỌC TRƯỚC
[../04-business-rules/permissions.md](../04-business-rules/permissions.md) **§12** · [../06-acceptance/test-scenarios.md](../06-acceptance/test-scenarios.md) §4

## 3. PHẠM VI
**✅ LÀM** — kiểm toàn bộ ma trận quyền bằng **dữ liệu giả mạo**

## 4. FILE TẠO
`tests/integration/authz-matrix.test.ts`

## 5. CÁC BƯỚC
1. ⭐ **Mọi test GỬI THẲNG dữ liệu giả mạo**, ⛔ **không** qua giao diện.
   Kiểm nút bị vô hiệu là **CHƯA ĐỦ** (`permissions` §12)
2. Chạy đủ **17 kịch bản `TS-AUTH-01..17`**
3. **Nhóm bắt buộc**:
   | Nhóm | Nội dung |
   |---|---|
   | Người ngoài phòng | đi cờ · đọc chat · nhận media |
   | Người xem giả làm người chơi | đi cờ · sẵn sàng · đầu hàng · đuổi |
   | Người xem đọc kênh riêng | tin mới **và** lịch sử |
   | Người chơi đuổi đối thủ | phải bị chặn |
   | Phiên đã thu hồi | mọi thao tác |
   | Người bị đuổi vào lại | mã · link · phòng chuyển công khai |
   | Đổi media thay người khác | |
   | Xem lịch sử người khác | đoán mã ván |
   | Không phải chủ phòng đổi cài đặt | |
4. ⭐ **10 điều không ai được làm** (`permissions` §10) — kiểm **từng cái**
5. Thử **tiêm dữ liệu thừa**: gửi trường ngoài schema như `winner`, `role`, `side` vào lệnh đi cờ ⇒ từ chối. Join nhận **`intent: PLAY | WATCH`** là ý định, không nhận trường `role` gán quyền; máy chủ kiểm vé và vai trò cho phép (DEC-043; room-chat-contract §2).

## 6. TEST BẮT BUỘC
| ID | Kịch bản |
|---|---|
| `TS-AUTH-01`…`17` | **Đủ 17 kịch bản** trong `test-scenarios` §4 |
| `T133-18` | ⭐ **10 điều không ai được làm** — kiểm từng cái |
| `T133-19` | ⭐ **Gửi kèm `winner` vào lệnh đi cờ → TỪ CHỐI** |
| `T133-20` | ⭐ **Join với `role` gán quyền → TỪ CHỐI; `intent` hợp lệ + vé đúng → ĐƯỢC; WATCH grant + intent PLAY → TỪ CHỐI** |
| `T133-21` | ⭐ **Mọi ô ❌ trong ma trận có ÍT NHẤT MỘT test**; thu hồi066/075 phải dẫn T110-14 (board/chat/history) và TS-MED-06/117 (transport thật), không dùng scope DB sớm thay bằng chứng cuối |
| `T133-22` | Thử truy cập tài nguyên bằng cách đoán mã (IDOR) → từ chối |
| `T133-23` | ⭐ **Khoá bí mật KHÔNG xuất hiện** trong gói giao diện hay log |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] **Đủ 17 kịch bản** `TS-AUTH-*` xanh
- [ ] ⭐ **`T133-21`** — **mọi** ô ❌ trong ma trận có test
- [ ] **`T133-18`** đủ 10 điều cấm
- [ ] **`T133-19`, `T133-20`** — `.strict()` có hiệu lực
- [ ] **`T133-23`** không rò khoá
- [ ] ⛔ **Mọi test gửi dữ liệu GIẢ MẠO**, không qua giao diện

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-133.md` — **bảng đối chiếu từng ô ❌ với test tương ứng**.

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| **Vào phòng theo mã bỏ qua kiểm chế độ riêng tư** (`F-03`) | `TS-AUTH-15` |
| **Thu hồi quyền người xem là code chết** (`F-07`) | `TS-AUTH-14` |
| **Thu hồi phiên không hoạt động; danh sách nguồn gốc mở toàn bộ** (`F-05`) | `TS-AUTH-12` |

Kiểm bằng cách **bấm nút ở giao diện** là vô nghĩa — kẻ tấn công không dùng giao diện của bạn.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-133

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** tests/integration/authz-matrix.test.ts; docs/test-reports/ISSUE-133.md.
- **File test:** `tests/integration/authz-matrix.test.ts`, `tests/media/issue-133.test.ts`.
- **Nhận từ phụ thuộc:** 132 full features; permissions§10/12; 17 TS-AUTH; 110 T14+117 TS-MED-06 actual revocation.
- **Bàn giao:** One named test per denied matrix cell +positive control; forged HTTP/socket +raw JWT evidence; no UI as permission oracle.
- **Trình tự xử lý tối thiểu:** Expand canonical matrix into executable data table role×action×transport×expected code; require each row unique ID and current AC mapping; positive controls detect broken routes/all-deny implementation.

### Chuẩn bị và oracle từng nhóm ca

**Given:** Actors outsider/SPECTATOR/PLAYER/Host/revoked Session/stale epoch; same body different auth; resource IDs known vs unknown control led.

| ID test (tiền tố T133 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `TS-AUTH-01..17,T133-18,21–22` | Forge direct commands/read/history/token for every deny cell and 10 absolute prohibitions | Denied response no metadata/secret; DB 0 mutation; actual socket 0 new payload; valid actor succeeds same operation. Multi-tab remains permitted except conflicts/media owner. |
| `19–20` | Inject winner/role/side/user Id; join WATCH grant+PLAY intent; valid intent+proper grant | Strict schema rejects extra authority; WATCH cannot PLAY; valid grant+intent succeeds; unknown room proof uses generic ROOM_ACCESS_UNAVAILABLE envelope. |
| `23` | Canary server secret in runtime env; scan built frontend/logs/events; stale/revoked token | No secret/token leaks; source-only grep insufficient. References 110/117 must share tested commit orre-run relevant tests; early DB-only revoke not accepted. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence133 = { uncoveredDenyCells: number; unauthorizedWrites: number; unauthorizedPayloads: number; canarySecretLeaks: number; positiveControlsFailed: number };

export function assertIssue133KeyCase(actual: Evidence133): void {
  expect(actual).toMatchObject({uncoveredDenyCells:0,unauthorizedWrites:0,unauthorizedPayloads:0,canarySecretLeaks:0,positiveControlsFailed:0});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Disable one guard/strict schema or publish private payload to global room; corresponding negative cell must fail. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-133.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:integration -- tests/integration/authz-matrix.test.ts
pnpm test:media -- tests/media/issue-133.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
pnpm test:media
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 134 abuse controls; 136 all AC traceability; 137 deployed security.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-AUTH-09` | [REQ-AUTH](../01-requirements/REQ-AUTH.md) | LOCAL |
| `AC-AUTH-14` | [REQ-AUTH](../01-requirements/REQ-AUTH.md) | LOCAL |
| `AC-ROOM-11` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |
| `AC-INV-14` | [REQ-INVITE](../01-requirements/REQ-INVITE.md) | LOCAL |
| `AC-DIS-16` | [REQ-DISCONNECT](../01-requirements/REQ-DISCONNECT.md) | LOCAL |
| `AC-SS-13` | [session-state](../05-data-and-realtime/session-state.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
