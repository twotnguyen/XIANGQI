# ISSUE-115 — Thu hồi + xoay vòng thế hệ

**Nhóm:** E17 · **Phụ thuộc:** 114 · **Trạng thái:** TODO
**Môi trường:** LiveKit local thật kiểm quyền/generation; nếu kiểm riêng token revocation Cloud thì ghi cổng triển khai riêng. Xem [EXTERNAL-SETUP.md](EXTERNAL-SETUP.md) §3 và media-control-contract.

## 1. MỤC TIÊU
Thu hẹp quyền ⇒ người mất quyền **thật sự không nhận được luồng mới**.

## 2. ĐỌC TRƯỚC
[../09-technical/architecture.md](../09-technical/architecture.md) **§8 `ARCH-11..13`** · [../01-requirements/REQ-MEDIA.md](../01-requirements/REQ-MEDIA.md) §7, §11

## 3. PHẠM VI
**✅ LÀM** — quy trình thu hồi 5 bước · thế hệ phòng
**❌ KHÔNG LÀM** — giao diện (116)

## 4. FILE TẠO
`apps/server/src/modules/media/revocation.service.ts`

**Hợp đồng đã chốt:** [media-control-contract](../09-technical/media-control-contract.md), DEC-041; phạm vi toàn tài khoản, timeout 30 giây, bằng chứng SFU và giới hạn thiết bị vật lý.

## 5. CÁC BƯỚC
1. ⭐ **Quy trình 5 bước — THỨ TỰ BẮT BUỘC**:
   ```
   ① ghi mức MONG MUỐN mới, đánh dấu phòng liên quan ĐANG XOAY VÒNG
      → endpoint NGỪNG cấp token (cũ lẫn mới) trong lúc này
   ② yêu cầu hạ tầng NGỪNG phục vụ nhóm cũ, XOÁ phòng cũ
   ③ CHỜ XÁC NHẬN
   ④ tạo THẾ HỆ MỚI, TÊN MỚI, cấp token cho danh sách còn hợp lệ
   ⑤ CHỈ KHI ĐÓ mới đánh dấu ĐÃ ÁP DỤNG
   ```
2. ⭐ **`ARCH-11`** — mỗi thế hệ có **tên mới chứa nonce 128-bit**, **không tái dùng** tên cũ.
   ⛔ **Không** ghi đè tên thế hệ cũ **trước** khi thu hồi xong — crash giữa chừng sẽ **mất địa chỉ cần thu hồi**
3. ⭐ **`ARCH-12`** — chưa xác nhận ở bước ③ và chưa tới deadline ⇒ **ĐANG XỬ LÝ**; đúng deadline 30 giây ⇒ **FAILED** + Thử lại, giữ fence, ⛔ **không** báo đã bảo vệ xong
4. ⭐ **`ARCH-13`** — hạ tầng mất liên lạc ⇒ thử lại có giới hạn (1/2/5 giây, tối đa 3 lần), mức mong muốn **vẫn giữ**, ⛔ **không** quay lại mức rộng hơn
5. **Khi nào xoay vòng**:
   | Sự kiện | Xoay phòng nào |
   |---|---|
   | Thu hẹp nguồn riêng | phòng riêng của nguồn đó |
   | Thu hẹp nguồn chung | **cả hai** phòng chung (kể cả chỉ A đổi) |
   | Đuổi/thu hồi người xem | **cả hai** phòng chung |
   | Chuyển camera/micro sang tab khác | Chỉ phạm vi **nguồn được chuyển**; thu hồi quyền phát cũ của nguồn đó, không reset/thu hồi nguồn còn lại vì dùng chung tài khoản (DEC-033/034). Đối chiếu danh tính/token theo từng nguồn ở ISSUE-114 |
   | Ván kết thúc | **xoá cả 4**, không tạo mới |
6. Công việc thu hồi **bền vững** — sống qua khởi động lại; job kẹt phải xử lý được
7. Chuyển nguồn: chưa có xác nhận ngắt thì không cho nguồn mới thu/phát; hết quy trình thử lại có giới hạn mà vẫn thất bại thì UI có lỗi + Thử lại, trạng thái bảo vệ vẫn chưa được báo thành công (DEC-034). Không tự nâng mức hay phát ở tab mới.
8. ⛔ **Không giữ khoá cơ sở dữ liệu** khi gọi hạ tầng (`ARCH-07`)

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T115-01` | ⭐ **Thu hẹp quyền → người xem KHÔNG nhận byte mới** (đo luồng thật) |
| `T115-02` | ⭐ **ĐỐI CHỨNG DƯƠNG: cùng lúc đó, người CÒN quyền VẪN nhận được** |
| `T115-03` | ⭐ **Giữ token cũ, vào lại phòng cũ → KHÔNG nhận luồng ở thế hệ mới** |
| `T115-04` | ⭐ **Tên phòng mới KHÁC tên cũ**, không tái dùng |
| `T115-05` | ⭐ **Chưa xác nhận bước ③: trước deadline ĐANG XỬ LÝ, đúng/sau 30 giây FAILED + Thử lại**, không báo đã xong |
| `T115-06` | ⭐ **Hạ tầng lỗi → giữ fence/mức mong muốn; đang xử lý trước deadline, sau deadline FAILED + Thử lại, KHÔNG quay lại mức rộng hơn** |
| `T115-07` | Đang xoay vòng → **không** cấp token mới |
| `T115-08` | Chỉ A đổi mức chung → **cả hai** phòng chung xoay vòng, B tự vào lại |
| `T115-09` | Thu hẹp nguồn riêng → nguồn chung **không** bị ảnh hưởng |
| `T115-10` | Ván kết thúc → **cả 4** phòng bị xoá |
| `T115-11` | Đuổi người xem → cả hai phòng chung xoay vòng |
| `T115-12` | Công việc thu hồi **sống qua khởi động lại**; job kẹt xử lý được |
| `T115-13` | ⭐ **Không giữ khoá cơ sở dữ liệu** khi gọi hạ tầng |
| `T115-14` | Mất ACK/tab cũ im lặng: chỉ bằng chứng SFU đủ mới APPLIED; DeleteRoom/RemoveParticipant lỗi không báo thành công. |
| `T115-15` | 30 giây đúng hạn chưa confirmed ⇒ ERROR; retry 1/2/5 giây giới hạn và RPC 5 giây bằng clock giả; giữ mức mong muốn/fence. |
| `T115-16` | Restart sau SFU revoke trước commit, duplicate/late result chỉ đúng operation được reconcile; match kết thúc/logout giữa chuyển không cấp owner mới. |
| `T115-17` | Đo byte/frame mới sau thu hồi có dấu nguồn và đối chứng dương; không nhầm buffer cũ hay mạng chết với ngừng phát. |

> **`T115-02` bắt buộc.** Không có đối chứng dương thì *"không nhận byte"* có thể chỉ vì hạ tầng chết.

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 17 test xanh với LiveKit **thật**
- [ ] **`T115-01`** + **`T115-02`** — đo luồng thật, có đối chứng dương
- [ ] **`T115-03`** token cũ không vượt vào generation mới; phân biệt revocation Cloud với rotation local
- [ ] **`T115-05`, `T115-06`** — không báo thành công giả
- [ ] Thứ tự 5 bước đúng

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-115.md` — **số byte thực tế** trước/sau, cả nhóm mất quyền và nhóm còn quyền.

## 9. ⚠ CẠM BẪY
Ghi đè tên phòng cũ **trước** khi xoá nó: nếu máy chủ chết ở giữa, **địa chỉ phòng cũ mất luôn** ⇒ không bao giờ thu hồi được ⇒ người xem cũ **vẫn nhận media mãi mãi**.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-115

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/server/src/modules/media/revocation.service.ts.
- **File test:** `tests/integration/issue-115.test.ts`, `tests/media/issue-115.test.ts`.
- **Nhận từ phụ thuộc:** 114 transport/token; 041 durable jobs; media-control-contract§2–4.
- **Bàn giao:** 5-step fenced revoke; oldTransportRefs giữ qua restart; FAILED đúng 30 s; no lock across SFU RPC.
- **Trình tự xử lý tối thiểu:** Transaction fence và persist refs→commit→SFU revoke+query old track absent→transaction CAS operation/epoch→new generation→applied; mỗi async result kiểm scope vẫn hợp lệ.

### Chuẩn bị và oracle từng nhóm ca

**Given:** A/B/S1–S5 đang nhận nguồn có sequence marker; giữ stale token; record S1 và authorized B stats cùng cửa sổ.

| ID test (tiền tố T115 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–04,08–11,17` | Thu hẹp PRIVATE/PUBLIC, kick S1, end match; drain pipeline rồi 5 s observation | Người mất quyền không nhận mẫu phát sinh mới; người còn quyền bytes/frame tăng; public rotate cả hai; private không đụng public; end delete 4 không tạo mới; nonce mới. |
| `05–07,14–16` | RPC timeout 5 s; retries 1/2/5 s tối đa 3; tại 29999/30000/30001 chưa confirmed; late/false ACK | Before deadline processing, đúng hạn FAILED/fence; desired không rộng lại; client ACK riêng không APPLIED; token phát bị chặn; retry idempotent OFF. |
| `12–13,16` | Kill process sau SFU confirmed trước DB commit; second DB connection thử lock trong RPC; logout/end giữa operation | Restart reconcile đúng operation/epoch và old refs; lock acquire được trong RPC; revoked actor không new owner/token; duplicate result không version tăng thêm. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence115 = { unauthorizedNewSamples: number; tokenGrantedWhileFenced: number; oldRefsLostOnRestart: boolean; authorizedNewBytes: number };

export function assertIssue115KeyCase(actual: Evidence115): void {
  expect(actual).toMatchObject({unauthorizedNewSamples:0,tokenGrantedWhileFenced:0,oldRefsLostOnRestart:false}); expect(actual.authorizedNewBytes).toBeGreaterThan(0);
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Mark APPLIED trước SFU hoặc overwrite old name sớm; T115-05/12 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-115.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:integration -- tests/integration/issue-115.test.ts
pnpm test:media -- tests/media/issue-115.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
pnpm test:media
```

**Chặn riêng của issue:** LiveKit local/DB không đạt hoặc chưa xác định được pipeline drain/mẫu mới ⇒ BLOCKED, không dùng 0 byte đơn độc.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 099 transfer reuse control; 117 quyền đo; 137 Cloud behavior riêng.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
