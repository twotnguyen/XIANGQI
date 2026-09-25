# ISSUE-114 — Cấp token + 4 phòng truyền

**Nhóm:** E17 · **Phụ thuộc:** 113, 084, 073 · **Trạng thái:** TODO
**Môi trường:** LiveKit local thật kiểm quyền/generation; nếu kiểm riêng token revocation Cloud thì ghi cổng triển khai riêng. Xem [EXTERNAL-SETUP.md](EXTERNAL-SETUP.md) §3 và media-control-contract.

## 1. MỤC TIÊU
Cấp quyền truyền media **đúng nguồn, đúng người nhận** — bằng **4 phòng tách biệt**.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-MEDIA.md](../01-requirements/REQ-MEDIA.md) §12 · [../09-technical/architecture.md](../09-technical/architecture.md) §8

## 3. PHẠM VI
**✅ LÀM** — 4 phòng truyền · cấp token theo quyền
**❌ KHÔNG LÀM** — thu hồi (115)

## 4. FILE TẠO
`apps/server/src/modules/media/transport.service.ts` · `token.service.ts`

**Hợp đồng đã chốt:** [media-control-contract](../09-technical/media-control-contract.md), DEC-041; phạm vi toàn tài khoản, timeout 30 giây, bằng chứng SFU và giới hạn thiết bị vật lý.

## 5. CÁC BƯỚC
1. ⭐ **Mỗi ván có 4 phòng truyền ĐỘC LẬP**:
   | Phòng | Nội dung | Ai vào |
   |---|---|---|
   | Camera riêng | camera giữa 2 người chơi | chỉ người chơi |
   | Micro riêng | micro giữa 2 người chơi | chỉ người chơi |
   | Camera chung | camera cho người xem | 2 người chơi (chỉ phát) + 5 người xem (chỉ nhận) |
   | Micro chung | micro cho người xem | như trên |
2. **Bảng quyền token**:
   | Vai trò | Phòng riêng | Phòng chung |
   |---|---|---|
   | Người chơi | nhận + phát đúng nguồn nếu mức khác `OFF` | **chỉ phát** đúng nguồn khi mức là *đối thủ và người xem* |
   | Người xem | ⛔ **không cấp token** | **chỉ nhận** |
   | Người ngoài / bị thu hồi | ⛔ không | ⛔ không |
3. **Token**: theo **từng phòng** · danh tính do **máy chủ** suy ra · **TTL 60 giây** · **chỉ đúng một nguồn** (camera **hoặc** micro)
4. ⛔ **Máy chủ suy ra mọi thứ.** Yêu cầu từ client **không** chứa vai trò, danh tính hay quyền tuỳ ý
5. **Người phát** một nguồn: **nhân bản** luồng của chính mình để phát vào cả phòng riêng và phòng chung — **không** mở thiết bị hai lần
6. ⛔ **Token không** lưu vào bộ nhớ trình duyệt lâu dài · **không** ghi log · **không** phát trong sự kiện chung

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T114-01` | Mỗi ván có **đúng 4** phòng truyền |
| `T114-02` | ⭐ **Người xem KHÔNG được cấp token phòng riêng** |
| `T114-03` | ⭐ **Token camera KHÔNG phát được micro** |
| `T114-04` | ⭐ **Token người xem KHÔNG phát được gì** |
| `T114-05` | ⭐ **Người chơi ở phòng chung: chỉ PHÁT, không NHẬN** |
| `T114-06` | Mức `OFF` → **không** cấp token phát cho nguồn đó |
| `T114-07` | Mức *chỉ đối thủ* → chỉ có token phòng **riêng** |
| `T114-08` | Mức *đối thủ và người xem* → có token **cả hai** phòng |
| `T114-09` | ⭐ **TTL token đúng 60 giây** |
| `T114-10` | ⭐ **Client khai vai trò tuỳ ý → máy chủ BỎ QUA**, tự suy ra |
| `T114-11` | ⭐ **Token không xuất hiện trong log** |
| `T114-12` | ⭐ **Token không nằm trong sự kiện phát chung** |
| `T114-13` | Người phát nhân bản luồng — **không** mở thiết bị hai lần |
| `T114-14` | Token ràng buộc user/source/client/epoch/generation từ server; stale owner, body giả client_id/epoch, phiên hết hạn không nhận được token. |
| `T114-15` | Local token cũ có thể tái tạo room cũ nhưng không vào generation mới; không báo token bị vô hiệu tuyệt đối bằng rotate. |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 15 test xanh với LiveKit **thật**
- [ ] **`T114-02`…`T114-05`** — bảng quyền đúng
- [ ] **`T114-10`** không tin client
- [ ] **`T114-11`, `T114-12`** không rò token
- [ ] `T114-03` token chỉ một nguồn

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-114.md`

## 9. ⚠ CẠM BẪY
Dùng **một phòng chung** cho tất cả rồi ẩn luồng ở giao diện là **lỗ hổng nghiêm trọng** — người xem sửa client là nghe được cuộc nói chuyện riêng của hai người chơi. Bốn phòng tách biệt là **cách duy nhất** bảo đảm quyền thật.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-114

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/server/src/modules/media/transport.service.ts; apps/server/src/modules/media/token.service.ts.
- **File test:** `tests/integration/issue-114.test.ts`, `tests/media/issue-114.test.ts`.
- **Nhận từ phụ thuộc:** 113 policy; 084 actor/session; 073 membership; media-control-contract source/client/epoch/generation.
- **Bàn giao:** 4 transport cho CAMERA/MICROPHONE × PRIVATE/PUBLIC; token TTL 60 s đúng source,server identity; generation nonce không reused.
- **Trình tự xử lý tối thiểu:** Token endpoint derive room and grants từ locked/current policy; fence STOPPING/ERROR chặn cấp. Token chỉ trả actor đúng quyền qua response riêng; TTL không thay active SFU revoke.

### Chuẩn bị và oracle từng nhóm ca

**Given:** A/B publisher vàS 1 receiver thật; OFF/OPPONENT/ALL matrix; giữ token cũ để thử source/room sai.

| ID test (tiền tố T114 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–10,13` | Cấp và thực sự sử dụng token từng vai trò/source/level; body thừa role/identity | 4 transport; spectator private denied/public subscribe-only; PLAYER public publish-only; camera token không phát mic; OFF không publish; capture mở 1 lần rồi clone. |
| `09,11–12,14–15` | Đọc grants TTL; stale session/epoch/client; grep log/event artifacts bằng canary token; old generation reconnect | exp−iat 60; server suy identity; no token log/broadcast; stale owner không token; local token cũ có thể vào old room nhưng không current generation và không nguồn mới. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence114 = { transportCount: number; ttlSeconds: number; spectatorPublishedTracks: number; cameraTokenMicTracks: number; tokenLeaks: number };

export function assertIssue114KeyCase(actual: Evidence114): void {
  expect(actual).toMatchObject({transportCount:4,ttlSeconds:60,spectatorPublishedTracks:0,cameraTokenMicTracks:0,tokenLeaks:0});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Grant can Publish mọi source hoặc SPECTATOR subscribe private; T114-02/03/04 đo thật đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-114.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:integration -- tests/integration/issue-114.test.ts
pnpm test:media -- tests/media/issue-114.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
pnpm test:media
```

**Chặn riêng của issue:** DB/LiveKit local thiếu ⇒ BLOCKED; Cloud revocation riêng chỉ được PASS khi đo ở 137.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 115 generation revoke; 116 clone streams; 099 account owner integration.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-MED-05` | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) | LOCAL |
| `AC-MED-06` | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
