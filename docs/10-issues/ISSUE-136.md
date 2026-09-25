# ISSUE-136 — Nghiệm thu R01–R19

**Nhóm:** E20 · **Phụ thuộc:** 135, 124, 117, 098, 045 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Nghiệm thu **phạm vi local của R01–R19** bằng bằng chứng thật; Google OAuth thật và SMTP/cloud/hai mạng là nghiệm thu Internet ở053/137, vẫn ghi CHỜ nếu chưa chạy. Không gọi local hoàn thành là toàn sản phẩm hoàn thành.

## 2. ĐỌC TRƯỚC
[../06-acceptance/acceptance-criteria.md](../06-acceptance/acceptance-criteria.md) **§5, §6** · [../06-acceptance/traceability-matrix.md](../06-acceptance/traceability-matrix.md)

## 3. PHẠM VI
**✅ LÀM** — chạy kịch bản xương sống · đối chiếu 19 yêu cầu · tổng hợp bằng chứng

## 4. CÁC BƯỚC
1. ⭐ **Chạy kịch bản xương sống 16 bước** (`test-scenarios` §2) với **8 phiên độc lập**:
   2 người chơi + 5 người xem + người thứ 6 bị từ chối
2. **Đối chiếu từng yêu cầu R01–R19 và từng AC trong registry** với: tài liệu · issue · test thực tế · kết quả · bằng chứng. Không chỉ gán một test chung cho cả module.
3. **Chạy toàn bộ**: `TS-RACE-01..10` · `TS-AUTH-01..17` · `TS-TIME-01..16` · `TS-RULE-01..21` · `TS-MED-01..15` · `TS-AI-01..10` · `TS-UI-01..14` · `TS-REG-01..06`
4. Với thu hồi066/075: bắt buộc bằng chứng T110-14 và TS-MED-06/117, T133-21 đối chiếu; không tính hai issue DB sớm là đã nghiệm thu chat/media.
5. ⭐ **6 kịch bản hồi quy `TS-REG-*`** — tái hiện **đúng** 6 lỗi lần trước
6. Tổng hợp: tổng số test · pass/fail/**bỏ qua** · lệnh chạy · môi trường
7. ⭐ **Sáu quy tắc báo cáo trung thực** (`AC-RULE-01..06`) — tuân thủ tuyệt đối

## 5. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T136-01` | ⭐ **Kịch bản xương sống 16 bước với 8 phiên → ĐẠT** |
| `T136-02` | ⭐ **Mọi yêu cầu R01–R19 có bằng chứng cho AC local; liệt kê AC Internet và issue053/137 còn CHỜ riêng** |
| `T136-03` | ⭐ **6 kịch bản hồi quy `TS-REG-*` ĐẠT** |
| `T136-04` | Toàn bộ nhóm kịch bản chạy xong |
| `T136-05` | ⭐ **0 test bị bỏ qua** trên mọi lane |
| `T136-06` | ⭐ **Không `.only` sót lại** |
| `T136-07` | Bốn cổng bắt buộc exit 0 |
| `T136-08` | ⭐ **Ma trận truy vết đầy đủ**: yêu cầu → luồng → màn hình → luật → nghiệm thu |
| `T136-09` | Hạng mục chờ tài nguyên ngoài ghi **CHỜ**, **không** đánh dấu đạt |

## 6. ⛔ ĐIỀU KIỆN PASS
- [ ] **`T136-01`** kịch bản xương sống đạt
- [ ] **`T136-02`** 19/19 yêu cầu được truy vết, mọi AC local có bằng chứng thật; AC external CHỜ không được tính PASS
- [ ] **`T136-03`** 6/6 hồi quy đạt
- [ ] **`T136-05`** 0 test bỏ qua
- [ ] **`T136-09`** hạng mục chờ ghi đúng
- [ ] ⛔ **Không** dùng phần trăm dòng mã thay cho nghiệm thu hành vi (`AC-RULE-05`)

## 7. BẰNG CHỨNG
`docs/test-reports/ISSUE-136.md` — bảng **R01–R19 và từng AC × test × kết quả × bằng chứng** + tổng hợp toàn bộ test.

## 8. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| Tuyên bố **hoàn thành** rồi vẫn phải merge 3 lần sửa lỗi runtime | `T136-01` — chạy kịch bản **thật** với 8 phiên trước khi tuyên bố |
| **Bằng chứng không khớp mã nguồn** (`F-16`) | `T136-02` — đối chiếu từng yêu cầu |

⛔ **Còn hạng mục chờ tài nguyên ngoài thì KHÔNG tuyên bố hoàn tất toàn bộ dự án.**

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-136

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** tests/e2e/issue-136.spec.ts; docs/test-reports/ISSUE-136.md.
- **File test:** `tests/integration/issue-136.test.ts`, `tests/e2e/issue-136.spec.ts`, `tests/media/issue-136.test.ts`, `tests/load/issue-136.test.ts`.
- **Nhận từ phụ thuộc:** 045 fixture local, 135 thử tải, 124 AI, 117 media, 098 nhiều tab; 333 AC trong AC-COVERAGE và ma trận truy vết hiện hành.
- **Bàn giao:** Báo cáo nghiệm thu local nối từng AC với test, lệnh chạy, artifact và commit; AC Internet chưa chạy ghi CHỜ tại053/137; đủ19 yêu cầu được truy vết.
- **Trình tự xử lý tối thiểu:** Chạy các lane mô-đun rồi kịch bản xương sống trên cùng bản build. Tổng hợp kết quả theo ID duy nhất; lỗi được sửa tại issue sở hữu, không nới AC. Mỗi report ghi hash và commit để không dùng kết quả cũ làm bằng chứng cho mã mới.

### Chuẩn bị và oracle từng nhóm ca

**Given:** 8 browser context độc lập A, B, S1–S6; Supabase Auth và hộp thư local thật; tạo quan hệ bạn bè, nhận ghế qua API/UI thực; khởi động đủ dịch vụ local.

| ID test (tiền tố T136 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01,03–04` | Chạy16 bước xương sống, gồm10b/10c; chạy đủ các nhóm TS-RACE, AUTH, TIME, RULE, MED, AI, UI, REG | 7 phiên nhận đúng bàn cờ/chat/media theo quyền; S6 bị từ chối; S3 bị đuổi không dùng được quyền cũ; đầu hàng rồi tái đấu đổi bên, chat trống, media OFF; đủ6 ca hồi quy đạt. |
| `02,05–09` | Đối chiếu từng hàng AC với issue sở hữu, test, kết quả và artifact tại commit hiện hành; kiểm report của runner và mã kiểm thử | Không thiếu AC local; không có test bị bỏ qua hoặc .only; 19/19 yêu cầu được truy vết; AC external chưa chạy không tính PASS. Test schema/state không thay bằng chứng truyền dữ liệu, media hay worker thật. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence136 = { independentSessions: number; requirementsTraced: number; missingLocalAc: number; skippedTests: number; passedRegressions: number; externalPendingCountedAsPass: number };

export function assertIssue136KeyCase(actual: Evidence136): void {
  expect(actual).toMatchObject({independentSessions:8,requirementsTraced:19,missingLocalAc:0,skippedTests:0,passedRegressions:6,externalPendingCountedAsPass:0});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Bỏ một kết quả AC khỏi report hoặc cố ý phát chat riêng ra cả phòng; kiểm ma trận/kịch bản tương ứng phải đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-136.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:integration -- tests/integration/issue-136.test.ts
pnpm test:e2e -- tests/e2e/issue-136.spec.ts
pnpm test:media -- tests/media/issue-136.test.ts
pnpm test:load -- tests/load/issue-136.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm test:media
pnpm test:load
```

**Chặn riêng của issue:** AC local chưa đạt ⇒ BLOCKED. Thiếu tài nguyên ngoài ở053/137 ghi CHỜ riêng, không tạo .skip trong lane local và không tuyên bố toàn sản phẩm hoàn tất.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 137 nghiệm thu Internet sau053; 138 có thể bàn giao local. Hoàn tất toàn dự án đòi đủ138 issue DONE và mọi AC có bằng chứng đạt.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-CLK-15` | [REQ-CLOCK](../01-requirements/REQ-CLOCK.md) | LOCAL |
| `AC-INA-16` | [REQ-INACTIVITY](../01-requirements/REQ-INACTIVITY.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
