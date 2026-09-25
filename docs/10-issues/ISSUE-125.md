# ISSUE-125 — Lịch sử ván + phân trang + quyền

**Nhóm:** E19 Lịch sử · **Phụ thuộc:** 121 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Xem lại danh sách ván đã chơi — **chỉ người chơi của ván đó** xem được.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-HISTORY-REMATCH.md](../01-requirements/REQ-HISTORY-REMATCH.md) §5.2, §10 `BR-HIS-12/13/19`

## 3. PHẠM VI
**✅ LÀM** — `GET /history` · kiểm quyền
**❌ KHÔNG LÀM** — xem lại từng nước (126)

## 4. FILE TẠO
`apps/server/src/modules/history/history.service.ts`

## 5. CÁC BƯỚC
1. `GET /api/v1/history?cursor=` — phân trang **20**, mới nhất trước
2. Mỗi dòng: đối thủ (tên hiển thị) · bên mình cầm · kết quả · **nguyên nhân** · thời điểm · có đi lại hay không
3. ⭐ **`BR-HIS-12`** — **chỉ người chơi của ván đó** xem được
4. ⭐ **`BR-HIS-13`** — ⛔ **không** công khai lịch sử theo username. Không ai tra được ván của người khác
5. **`BR-HIS-18`** — lịch sử **không bị sửa** sau khi ván kết thúc
6. Ván với máy cũng vào lịch sử
7. Dùng **Prisma** (`TECH-07`)

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T125-01` | Lịch sử hiện đúng ván của mình, mới nhất trước |
| `T125-02` | ⭐ **KHÔNG hiện ván của người khác** |
| `T125-03` | ⭐ **Đoán mã ván của người khác → FORBIDDEN** |
| `T125-04` | ⭐ **Không** có endpoint nào tra lịch sử theo username |
| `T125-05` | Phân trang **20**, con trỏ đúng |
| `T125-06` | Mỗi dòng có **nguyên nhân kết thúc** |
| `T125-07` | Ván có đi lại → có **nhãn ghi rõ** |
| `T125-08` | Ván với máy cũng hiện |
| `T125-09` | Ván **gián đoạn** hiện đúng *"không có người thắng"* |
| `T125-10` | Chưa chơi ván nào → **mảng rỗng**, không lỗi |
| `T125-11` | Truy vấn dùng index — có `EXPLAIN` |
| `T125-12` | Chưa đăng nhập → `UNAUTHENTICATED` |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 12 test xanh
- [ ] **`T125-02`, `T125-03`, `T125-04`** — ba hướng bảo vệ riêng tư
- [ ] `T125-06` có nguyên nhân
- [ ] Báo cáo có `EXPLAIN`

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-125.md`

## 9. ⚠ CẠM BẪY
Cho tra lịch sử theo username biến chức năng này thành **công cụ theo dõi** — ai cũng xem được người khác chơi với ai, thắng thua ra sao. `BR-HIS-13` cấm.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-125

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/server/src/modules/history/history.service.ts.
- **File test:** `tests/integration/issue-125.test.ts`.
- **Nhận từ phụ thuộc:** 121 AI/online Match; 089 outcome; 046 phiên; history index es từ 039.
- **Bàn giao:** GET /api/v 1/history?cursor= trả tối đa 20 ván của actor, sort ổn định mới nhất trước; không có username lookup.
- **Trình tự xử lý tối thiểu:** Prisma WHERE participant actor trước LIMIT; cursor opaque mã hoá sort tuple, validate strict; mapping DTO không lộ chat/room/private profile; không tin user Id từ query.

### Chuẩn bị và oracle từng nhóm ca

**Given:** A có 41 ván FINISHED/INTERRUPTED, gồm AI và UNDO; B có ván riêng không liên quan; thời điểm kết thúc trùng nhau để kiểm cursor.

| ID test (tiền tố T125 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–10,12` | A/B/S1/không JWT đọc trang đầu/tiếp và đoán match Id; tài khoản chưa chơi đọc | A chỉ ván mình, mỗi trang 20/20/1 không trùng/sót; tên đối thủ/side/reason/undo đúng; INTERRUPTED không thắng; outsider/un auth không dữ liệu. |
| `11, bổ sung bất biến` | EXPLAIN ANALYZE truy vấn với dữ liệu đủ lớn; đọc lặp và so Match trước/sau | Index được dùng phù hợp; không mutation clock/version/outcome khi đọc; cursor ổn định theo finished At+id, không OFFSET. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence125 = { pageSizes: number[]; foreignMatches: number; duplicateIds: number; mutatedRows: number };

export function assertIssue125KeyCase(actual: Evidence125): void {
  expect(actual).toMatchObject({pageSizes:[20,20,1],foreignMatches:0,duplicateIds:0,mutatedRows:0});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Bỏ participant WHERE hoặc chỉ kiểm ở UI; T125-02/03 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-125.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:integration -- tests/integration/issue-125.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 126 replay cần guard riêng; 129 empty/history UI; 136 AC-HIS proof.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-HIS-11` | [REQ-HISTORY-REMATCH](../01-requirements/REQ-HISTORY-REMATCH.md) | LOCAL |
| `AC-HIS-12` | [REQ-HISTORY-REMATCH](../01-requirements/REQ-HISTORY-REMATCH.md) | LOCAL |
| `AC-HIS-18` | [REQ-HISTORY-REMATCH](../01-requirements/REQ-HISTORY-REMATCH.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
