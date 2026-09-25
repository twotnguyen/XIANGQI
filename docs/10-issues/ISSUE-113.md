# ISSUE-113 — Chính sách media + phiên bản

**Nhóm:** E17 · **Phụ thuộc:** 112, 041, 046 · **Trạng thái:** TODO
**Môi trường:** LiveKit local thật kiểm quyền/generation; nếu kiểm riêng token revocation Cloud thì ghi cổng triển khai riêng. Xem [EXTERNAL-SETUP.md](EXTERNAL-SETUP.md) §3 và media-control-contract.

## 1. MỤC TIÊU
Mỗi người chơi có **hai mức chia sẻ độc lập** — camera và micro.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-MEDIA.md](../01-requirements/REQ-MEDIA.md) §5, §10 `BR-MED-01/02/03`

## 3. PHẠM VI
**✅ LÀM** — đọc/ghi chính sách · phiên bản chống ghi đè
**❌ KHÔNG LÀM** — cấp token (114) · thu hồi (115)

## 4. FILE TẠO
`apps/server/src/modules/media/policy.service.ts`

**Hợp đồng đã chốt:** [media-control-contract](../09-technical/media-control-contract.md), DEC-041; phạm vi toàn tài khoản, timeout 30 giây, bằng chứng SFU và giới hạn thiết bị vật lý.

## 5. CÁC BƯỚC
1. Hai endpoint: `GET /media/policy?matchId=` (chỉ đọc, **không** cần quyền thiết bị) và `PATCH /media/policy`
2. ⭐ **`BR-MED-01`** — camera và micro **hoàn toàn độc lập**. Ví dụ hợp lệ: camera *Chỉ đối thủ* + micro *Đối thủ và người xem*
3. ⭐ **`BR-MED-02`** — mặc định **cả hai `OFF`**, ở **mỗi ván**
4. ⭐ **`BR-MED-03`** — quyền thuộc **người phát**. Đổi mức **thay người khác** ⇒ **FORBIDDEN**
5. **Phiên bản chống ghi đè**: `PATCH` nhận `policyVersion` mong đợi; lệch ⇒ `CONFLICT`
   - **Một** `policyVersion` chung cho **cặp** camera+micro của mỗi người
   - Đổi một mục ⇒ tăng version **một lần**
   - ⭐ Hai cập nhật cùng base version ⇒ **chỉ một** được ghi; client đọc lại rồi thử lại cái kia
6. `policyVersion` của A và B **độc lập** nhau
7. Trả `PolicyState` gồm `desired` và `applied`. ⛔ **Không bao giờ** trả token

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T113-01` | ⭐ **Cả 9 tổ hợp camera × micro** đặt được |
| `T113-02` | ⭐ **Mặc định cả hai `OFF`** ở ván mới |
| `T113-03` | ⭐ **Đổi mức của NGƯỜI KHÁC → FORBIDDEN** |
| `T113-04` | ⭐ **Người xem đổi mức → FORBIDDEN** |
| `T113-05` | ⭐ **Hai cập nhật cùng base version → CHỈ MỘT được ghi** |
| `T113-06` | Phiên bản lệch → `CONFLICT` |
| `T113-07` | Đổi camera → version tăng **một lần** |
| `T113-08` | ⭐ **Version của A và B độc lập** |
| `T113-09` | ⭐ **Phản hồi KHÔNG chứa token** |
| `T113-10` | `GET /media/policy` không cần quyền thiết bị, chỉ cần là thành viên |
| `T113-11` | Người ngoài phòng đọc chính sách → **FORBIDDEN** |
| `T113-12` | Ván mới (tái đấu) → chính sách **reset về `OFF`** |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 12 test xanh
- [ ] **`T113-01`** đủ 9 tổ hợp
- [ ] **`T113-03`, `T113-04`** — quyền thuộc người phát
- [ ] **`T113-05`** với rào đồng bộ
- [ ] **`T113-09`** không rò token

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-113.md`

## 9. ⚠ CẠM BẪY
Dùng **một** `policyVersion` cho **cả hai người chơi** sẽ khiến A và B **chặn nhau** khi cùng đổi mức. `BR-MED` yêu cầu version **theo từng người** — `T113-08` kiểm.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-113

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/server/src/modules/media/policy.service.ts.
- **File test:** `tests/integration/issue-113.test.ts`.
- **Nhận từ phụ thuộc:** 041 policy schema; 046 actor guard; 112 real SFU; media-control-contract.
- **Bàn giao:** GET /media/policy?match Id= và PATCH /media/policy {policyVersion,...source patch}; desired/applied riêng, version theo người.
- **Trình tự xử lý tối thiểu:** Guard membership trước receipt; UPDATE theo user+match+version; ghi desired, applied chỉ phản ánh phần đã có bằng chứng SFU. Policy thu hẹp tạo job 115, không báo applied đồng bộ với desired.

### Chuẩn bị và oracle từng nhóm ca

**Given:** Hai PLAYER A/B, S1 và outsider; hai nguồn có 3 mức nên 9 tổ hợp; 2 connection cho CAS.

| ID test (tiền tố T113 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–04,08–12` | Đọc/ghi 9 tổ hợp; A sửa B; S1 sửa; outsider GET; new match state | Mỗi người version riêng; mặc định OFF/OFF; chỉ chủ nguồn sửa; member đọc không cần owner thiết bị; response không token. |
| `05–07` | Camera và micro PATCH cùng base version với barrier; retry cái thua sau GET | Chỉ 1 CAS ghi và version+1; cái thua CONFLICT không ghi đè; lần retry chủ động mới ghi được nguồn thứ 2. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence113 = { successfulConcurrentWrites: number; versionDelta: number; otherPlayerVersionDelta: number; responseTokenCount: number };

export function assertIssue113KeyCase(actual: Evidence113): void {
  expect(actual).toMatchObject({successfulConcurrentWrites:1,versionDelta:1,otherPlayerVersionDelta:0,responseTokenCount:0});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Dùng version chung 2 PLAYER hoặc gán applied=desired ngay; T113-08 và 115-05 phải đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-113.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:integration -- tests/integration/issue-113.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 114 cấp token theo applied/owner; 115 hoàn tất revocation; 127 reset OFF.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
