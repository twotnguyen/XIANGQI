# ISSUE-138 — Bàn giao + hồ sơ bảo vệ

**Nhóm:** E20 · **Phụ thuộc:** 136 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Đóng gói bản local đã nghiệm thu để người khác tiếp nhận; kèm trạng thái Internet hiện có. ISSUE-138 có thể DONE cho hồ sơ bàn giao local khi053/137 còn BLOCKED_EXTERNAL; điều đó **không** làm053/137 DONE hoặc cho phép tuyên bố toàn bộ sản phẩm hoàn tất (DEC-047).

## 2. ĐỌC TRƯỚC
[../README.md](../README.md) · [README.md](README.md) · [../06-acceptance/traceability-matrix.md](../06-acceptance/traceability-matrix.md)

## 3. PHẠM VI
**✅ LÀM** — tài liệu bàn giao · hồ sơ bảo vệ · danh sách hạn chế đã biết

## 4. FILE TẠO
`README.md` (gốc dự án) · `docs/handover.md` · `docs/known-limitations.md` · `docs/defense-notes.md`

## 5. CÁC BƯỚC
1. **`README.md` gốc dự án** — người lạ chạy được trong **dưới 15 phút**:
   ```
   ① yêu cầu môi trường (phiên bản chính xác)
   ② cài đặt        ③ biến môi trường cần điền
   ④ chạy local     ⑤ chạy test
   ⑥ địa chỉ môi trường thật
   ```
2. **`docs/handover.md`**:
   | Mục | Nội dung |
   |---|---|
   | Bản đồ mã nguồn | thư mục nào làm gì |
   | 10 điểm dễ sai nhất | kèm chỗ đã phòng |
   | Cách thêm một luật cờ mới | từng bước |
   | Cách thêm một màn hình mới | từng bước |
   | Cách thêm một lệnh thời gian thực mới | từng bước |
   | Nơi nào **tuyệt đối không** sửa nếu chưa đọc tài liệu | |
3. ⭐ **`docs/known-limitations.md`** — ghi **trung thực**:
   - Máy cờ mạnh tới đâu (số đo thật từ `ISSUE-032`)
   - Tải đã thử tới đâu (số đo thật từ `ISSUE-135`) — ⛔ **không** ngoại suy
   - Media: 1 phòng đã thử, ⛔ **không** hứa 10 phòng
   - Các hạng mục **cố ý không làm** (`scope` §4)
   - Hạng mục còn `BLOCKED_EXTERNAL`, nếu có
4. **`docs/defense-notes.md`** — trả lời trước **10 câu hỏi phản biện**:
   | # | Câu hỏi |
   |---|---|
   | 1 | Vì sao **hết nước đi = THUA**, không phải hoà như cờ vua? |
   | 2 | Vì sao đếm lặp **chỉ trên nhánh có hiệu lực**? |
   | 3 | Vì sao **SQL thuần** cho đường xử lý lệnh ván? |
   | 4 | Vì sao máy cờ chạy **tiến trình riêng**? |
   | 5 | Thứ tự khoá **phòng → người → ván** — vì sao? |
   | 6 | Vì sao **bỏ cơ chế giành quyền giữa các tab**? (`DEC-020`) |
   | 7 | Vì sao quy tắc **không hoạt động chỉ áp dụng cho ván không giới hạn giờ**? |
   | 8 | Làm sao chứng minh **không có kẽ hở quyền**? |
   | 9 | Vì sao **hai màu quân cần dấu hiệu ngoài màu sắc**? (`DT-21`) |
   | 10 | Nếu phải làm lại, **thay đổi gì**? |
5. ⭐ **Đối chiếu lần cuối**: mọi quyết định Accepted trong decision-log hiện hành đã **thể hiện trong mã/tài liệu/test** tương ứng scope; quyết định external chưa thực thi liên kết issue CHỜ
6. Dọn: xoá mã chết · xoá `console.log` thừa · ⛔ **không** xoá `99-archive/`

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T138-01` | ⭐ **Người chưa từng đọc dự án làm theo `README.md` → chạy được, < 15 phút** |
| `T138-02` | ⭐ **Mọi DEC Accepted hiện hành được truy vết tới mã/test hoặc tài liệu phù hợp; scope external chưa thực thi ghi CHỜ** |
| `T138-03` | `known-limitations.md` ghi **số đo thật**, không ngoại suy |
| `T138-04` | `defense-notes.md` đủ 10 câu |
| `T138-05` | ⭐ **`99-archive/` khớp danh mục và SHA-256 baseline trước triển khai; không hardcode số cũ101** |
| `T138-06` | ⭐ **Liên kết trong toàn bộ `docs/` không hỏng** |
| `T138-07` | Không còn `console.log` gỡ lỗi trong mã sản phẩm |
| `T138-08` | ⭐ **Bốn cổng bắt buộc exit 0** lần cuối |
| `T138-09` | Danh sách 138 issue: **mọi issue `DONE` hoặc ghi rõ lý do không làm** |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 9 test xanh
- [ ] ⭐ **`T138-01`** — người ngoài chạy được
- [ ] ⭐ **`T138-02`** — mọi quyết định Accepted hiện hành có bằng chứng hoặc CHỜ đúng scope
- [ ] **`T138-05`** lưu trữ nguyên vẹn
- [ ] **`T138-09`** không issue nào bỏ lửng không giải thích
- [ ] ⛔ **`known-limitations.md` ghi đúng sự thật** — đây là mục **quan trọng nhất** của issue này

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-138.md` + **bảng đối chiếu toàn bộ DEC Accepted × bằng chứng / giới hạn; manifest archive trước/sau**.

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| **Tuyên bố hoàn thành khi chưa hoàn thành** | `T138-09` + `known-limitations.md` |
| **Bằng chứng không khớp mã nguồn** (`F-16`) | `T138-02` |
| **Số đo ngoại suy thay vì đo thật** (`F-15`) | `T138-03` |

> Hồ sơ bàn giao local hoàn tất không đồng nghĩa nghiệm thu Internet. Chỉ tuyên bố toàn bộ sản phẩm đạt khi tất cả AC local và Internet có bằng chứng, không còn issue chờ.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-138

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** README.md; docs/handover.md; docs/known-limitations.md; docs/defense-notes.md; scripts/verify-handover.mjs; tests/unit/issue-138.test.ts.
- **File test:** `tests/unit/issue-138.test.ts`.
- **Nhận từ phụ thuộc:** 136 report local; INDEX/DEC Accepted hiện hành; số đo032/124/135; trạng thái053/137; baseline SHA-256 của archive trước triển khai.
- **Bàn giao:** README tái lập local,10 câu phản biện, ma trận DEC→mã/test, kiểm link/archive và danh sách giới hạn thật. Hoàn tất toàn dự án chỉ khi138/138 issue DONE và mọi AC đạt.
- **Trình tự xử lý tối thiểu:** Script verify-handover đọc link Markdown nội bộ, đường dẫn/anchor và manifest archive rồi trả exit khác0 khi sai. Đối chiếu điều kiện toàn dự án bằng trạng thái mọi138 issue và bằng chứng333 AC; ghi hạn chế không tạo miễn trừ cho điều kiện PASS.

### Chuẩn bị và oracle từng nhóm ca

**Given:** Clone sạch và người chưa đọc dự án, môi trường mới; đo thời gian thao tác README bằng đồng hồ thật; lưu phiên bản OS/công cụ và log; đối chiếu archive với baseline.

| ID test | When — tác động thật | Then — kết quả bắt buộc |
|---|---|---|
| `01–04` | Người độc lập làm theo README; đối chiếu10 câu hỏi, các DEC Accepted và giới hạn với số đo thô | Chạy local dưới15 phút theo bước đã ghi; mọi lỗi và cách xử lý được lưu; đủ DEC truy vết; không suy Elo/tải/media ngoài mức đã thử; external CHỜ ghi đích danh. |
| `05–09` | Chạy verify-handover kiểm link/hash/INDEX, quét log debug sản phẩm và chạy bốn cổng cuối | Không archive bị thay/xoá, không link hỏng, không debug log thừa; đủ138 issue có trạng thái/lý do. Handover local có thể DONE khi053/137 CHỜ nhưng toàn dự án chưa DONE. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence138 = { archiveMismatches: number; brokenLinks: number; unaccountedIssues: number; defenseAnswers: number; setupMinutes: number };

export function assertIssue138KeyCase(actual: Evidence138): void {
  expect(actual).toMatchObject({archiveMismatches:0,brokenLinks:0,unaccountedIssues:0,defenseAnswers:10}); expect(actual.setupMinutes).toBeLessThan(15);
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Change one archive byte in temporary copy or break one Markdown link; script must nonzero; restore copy,never mutate canonical archive. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-138.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:unit -- tests/unit/issue-138.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit

```

**Chặn riêng của issue:** Chưa có người độc lập chạy README/không có archive baseline ⇒ BLOCKED, không gán bằng chứng giả.053/137 CHỜ được liệt kê trong hand over local nhưng chặn full project DONE.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** Fresh agent starts README/AGENT-START-HERE and sees remaining external work; only all 138 DONE+all AC gives full completion.


### Lệnh bàn giao và thử âm cho script kiểm chứng

```bash
node scripts/verify-handover.mjs
pnpm test:unit -- tests/unit/issue-138.test.ts
```

`scripts/verify-handover.mjs` nhận tuỳ chọn `--root <directory>` để test chạy trên bản sao fixture riêng; root mặc định là repo. Nó phải trả nonzero khi thiếu file/anchor nội bộ hoặc check sum archive khác baseline, và ghi đường dẫn lỗi. T138-05/06 tạo thư mục tạm, copy fixture nhỏ và manifest, sửa một byte hoặc một link ở bản sao, gọi script bằng `node:child_process.spawnSync`, assert `status !== 0`; ca nguyên vẹn `status === 0`. Không sửa archive thật để thử âm.

Bằng chứng T138-01 nằm ở `artifacts/issue-138/fresh-clone-setup.md`: người thực hiện, máy sạch, mốc bắt đầu/kết thúc, mọi lệnh, lỗi gặp và cách xử lý. Không dùng đồng hồ giả cho thời gian thao tác người thật; luật clock tiêm áp dụng kiểm thử thời hạn nghiệp vụ. Bảng cuối `docs/handover.md` phải phân biệt “bàn giao local” với “toàn dự án”: điều kiện sau là **138/138 issue DONE**, bao gồm 053/137, cùng mọi AC có bằng chứng.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
