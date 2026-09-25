# ISSUE-135 — Thử tải 10 phòng / 70 kết nối

**Nhóm:** E20 · **Phụ thuộc:** 134, 124, 117 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Chứng minh hệ thống đạt **p95 < 100 ms** dưới tải mục tiêu.

## 2. ĐỌC TRƯỚC
[../00-overview/scope.md](../00-overview/scope.md) §5 · [../05-data-and-realtime/data-flows.md](../05-data-and-realtime/data-flows.md) §13

## 3. PHẠM VI
**✅ LÀM** — thử tải thật · đo và báo cáo

## 4. FILE TẠO
`tests/load/socket-load.ts`

## 5. CÁC BƯỚC
1. **Tải mục tiêu**:
   | Mục | Giá trị |
   |---|---|
   | Phòng | **10** |
   | Kết nối đồng thời | **70** (10 × 7) |
   | Ván với máy song song | **2** |
   | Nước đi song song | **10** |
2. **Chỉ tiêu**:
   | Chỉ tiêu | Ngưỡng |
   |---|---|
   | Xử lý lệnh **p95** | **< 100 ms** |
   | Trọn vòng client→máy chủ→client | < 500 ms khi độ trễ mạng < 100 ms |
   | Đồng bộ lại sau mạng ổn định | **< 5 giây** |
3. ⭐ **Phải là tải THẬT** — 70 kết nối thời gian thực **đồng thời**, gửi nước đi **song song**.
   ⛔ **Không** phải chạy tuần tự rồi cộng lại
4. Đo thêm: bộ nhớ · độ trễ vòng lặp sự kiện · tỉ lệ lỗi
5. Ghi **cấu hình máy chạy** vào báo cáo
6. Lane tải có thể chạy **thủ công** trên máy đủ cấu hình, nhưng **phải có bằng chứng thật**
7. ⭐ **Media thử riêng**: 1 phòng, 2 phát + 5 xem. ⛔ **Không** hứa 10 phòng video đồng thời

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T135-01` | ⭐ **10 phòng, 70 kết nối ĐỒNG THỜI** thiết lập được |
| `T135-02` | ⭐ **p95 xử lý lệnh < 100 ms** |
| `T135-03` | Trọn vòng < 500 ms |
| `T135-04` | ⭐ **10 nước đi SONG SONG → không lỗi, không lẫn trạng thái** |
| `T135-05` | 2 ván với máy song song → không nghẽn |
| `T135-06` | ⭐ **Đồng bộ lại sau mạng ổn định < 5 giây** |
| `T135-07` | Sau10 vòng tạo/dùng/đóng, không còn tài nguyên runtime thuộc run đã cleanup; lưu heap/RSS và retained-object diff theo protocol bên dưới |
| `T135-08` | Đo event-loop thật; đối chứng chặn luồng chính làm T135-02 thất bại. Không có ngưỡng event-loop riêng ngoài ngân sách xử lý lệnh đã chốt |
| `T135-09` | Tỉ lệ lỗi **0%** |
| `T135-10` | ⭐ **Media: 1 phòng, 2 phát + 5 xem** đạt |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] **`T135-02`** p95 < 100 ms
- [ ] **`T135-01`** 70 kết nối **thật sự đồng thời**
- [ ] **`T135-06`** đồng bộ < 5 giây
- [ ] **`T135-09`** 0% lỗi
- [ ] Báo cáo có **p50/p95/p99 + cấu hình máy**
- [ ] `T135-07/08` có số đo tài nguyên, cleanup/retainer và hai đối chứng âm theo protocol; không chỉ chụp biểu đồ đẹp
- [ ] ⛔ **Không đạt thì ghi số thật + `BLOCKED`**, không hạ ngưỡng

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-135.md` — số đo đầy đủ + cấu hình máy.

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| **Báo cáo "thử tải 70 clients" thực ra KHÔNG phải thử tải** (`F-15`) | `T135-01`, `T135-04` — phải **đồng thời**, không tuần tự |

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-135

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** tests/load/socket-load.ts; tests/load/issue-135.test.ts; package.json; docs/test-reports/ISSUE-135.md.
- **File test:** `tests/load/socket-load.ts`, `tests/media/issue-135.test.ts`.
- **Nhận từ phụ thuộc:** 134 giới hạn và guard thật;124 AI;117 media; scope §5 và data-flows §13.
- **Bàn giao:** Lane test:load chạy thật10 phòng/70 socket đồng thời,10 nước song song và2 ván AI; xuất mẫu độ trễ thô cùng số đo tài nguyên.
- **Trình tự xử lý tối thiểu:** Runner phải lỗi khi không tìm thấy ca thử hoặc backend không truy cập được. Đo riêng server nhận→commit và client gửi→nhận ACK; percentile dùng nearest-rank. Xuất JSON/CSV, timeline đồng thời, CPU/RAM/Node/build; không tắt guard để làm số đẹp.

### Chuẩn bị và oracle từng nhóm ca

**Given:** Giữ70 kết nối Socket.IO thật bằng barrier,10 phòng×7 thành viên;10 thế có nước hợp lệ độc lập;2 lần tìm AI trùng thời gian tải; media chạy kịch bản riêng7 người.

| ID test | When — tác động thật | Then — kết quả bắt buộc |
|---|---|---|
| `01–05,09` | Chờ đủ70 kết nối sẵn sàng rồi giải phóng10 lệnh move cùng lúc; ghi timeline gửi/nhận/commit | Không lẫn phòng, lỗi0%; p95 xử lý lệnh<100ms; trọn vòng<500ms khi mạng<100ms.70 là số đang kết nối đồng thời, không cộng số kết nối từng thời điểm. |
| `06–08` | Ngắt/nối lại client, xác định mạng đã ổn định rồi đo đến khi các version đồng bộ; lấy chuỗi số đo heap và event-loop | Đồng bộ lại<5000ms. Kiểm cleanup và retained objects theo protocol dưới đây; báo heap/RSS/event-loop thô. Không loại outlier hoặc tự thêm một ngưỡng MB để báo đạt. |
| `10` | Chạy riêng1 phòng với2 người phát và5 người xem, đo RTP/frame thật | Mỗi người nhận đúng nguồn được chia sẻ; có byte/frame mới và đối chứng dương. Không ngoại suy thành10 phòng media. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence135 = { simultaneousConnections: number; simultaneousRooms: number; parallelMoves: number; errorRate: number; serverP95Ms: number; resyncMs: number };

export function assertIssue135KeyCase(actual: Evidence135): void {
  expect(actual).toMatchObject({simultaneousConnections:70,simultaneousRooms:10,parallelMoves:10,errorRate:0}); expect(actual.serverP95Ms).toBeLessThan(100); expect(actual.resyncMs).toBeLessThan(5000);
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Protocol đo để tránh tiêu chí mơ hồ

Đây là cách kiểm kỹ thuật cho issue này. Ngưỡng sản phẩm vẫn là p95 lệnh<100ms, trọn vòng<500ms khi mạng<100ms, đồng bộ lại<5giây và0% lỗi ngoài dự kiến. Scope/acceptance không đặt ngưỡng heap MB hoặc event-loop riêng; câu cũ “trong ngưỡng” không được hiểu là một con số tuỳ người thực thi.

1. **Tải duy trì:** warm-up60giây không tính vào mẫu, sau đó đo10phút với70 socket được giữ kết nối. Mỗi giây gửi một đợt10 lệnh move hợp lệ ở10 phòng bằng barrier; mỗi phòng chỉ có một lệnh đang chờ. Chuẩn bị trace nước hợp lệ và tái đấu qua API khi ván kết thúc; không ghi thẳng DB để duy trì tải. Nếu không giữ được tải mục tiêu, báo thiếu tải và BLOCKED, không lấy kết quả tải nhẹ hơn. Duy trì2 ván AI có khoảng tính trùng các đợt move và ghi timeline chứng minh; dùng2 tài khoản riêng ngoài70 thành viên online để không vi phạm một tài khoản/một phòng. Báo riêng70 socket của10 phòng online và các socket AI bổ sung (72 nếu mỗi phiên AI có1 socket); không gọi tổng tích luỹ là số đồng thời. Media đo riêng theo T135-10.
2. **Mẫu:** lưu từng commandId/roomId, thời điểm server nhận→commit, client gửi→ACK, thành công/lỗi và tổng socket hoạt động. p95 nearest-rank trên toàn mẫu measured, không lấy trung bình percentile từng phòng. Timeout/lỗi không bị bỏ khỏi mẫu; ghi riêng và làm T135-09 thất bại. Ca negative có lỗi mong đợi chạy riêng, không trộn vào workload hợp lệ. Timestamp phía server dùng monotonic cùng tiến trình, không trừ hai đồng hồ máy khác nhau.
3. **Bộ nhớ T135-07:** sau warm-up, chạy thêm10 vòng tạo/dùng/rời/đóng tài nguyên của run qua API thật, mỗi vòng có70 socket. Sau mỗi vòng đóng browser/socket, huỷ job/listener/timer theo lifecycle và đợi công việc cleanup hoàn tất. Assert registry ứng dụng không còn room membership/socket subscription/job/timer riêng của run; các timer nền chung phải bằng baseline đã ghi. Dùng heap snapshot trước/sau và số đếm constructor/retainer để điều tra đối tượng room/socket/worker còn bị giữ; mọi retained object thuộc run phải có lý do vòng đời hữu hạn được truy vết. Đối tượng đã hết vòng đời mà còn đường giữ từ registry/listener là FAIL. Không dùng “heap chưa giảm” đơn lẻ để kết luận leak vì GC/cache; không dùng RSS cao đơn lẻ để tự hạ ngưỡng.
4. **Dữ liệu tài nguyên:** ghi heapUsed/RSS mỗi giây, heap snapshot và active-resource counters ở từng mốc cleanup. Có thể bật explicit GC chỉ trong lượt chẩn đoán riêng đã ghi cấu hình; không dùng số latency của lượt đó thay lượt production-mode. Không đưa token/email/password vào snapshot chia sẻ; artifact nội bộ phải được rà bí mật trước đính kèm.
5. **Event-loop T135-08:** đo từ tiến trình server bằng công cụ chuẩn của Node, xuất p50/p95/p99/max cùng đơn vịms; thiếu mẫu/sai đơn vị là FAIL. Mức này dùng giải thích T135-02, không tự tạo thêm ngưỡng kinh doanh. Đối chứng âm tạm chặn luồng chính200ms ở ít nhất10% lệnh đo: bộ đo phải nhận ra và T135-02 phải đỏ. Khôi phục, chạy lại lượt tải hợp lệ; báo cả hai, không trộn mẫu đối chứng vào báo cáo đạt.
6. **Rò tài nguyên đối chứng:** tạm giữ socket/subscription của một run sau cleanup; T135-07 phải bắt được bằng registry/retainer. Xoá mutation, chạy lại đủ10 vòng. Đây là chứng minh test bắt lỗi, không phải cam kết tuyệt đối rằng chạy hữu hạn có thể chứng minh mọi kiểu memory leak không tồn tại.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Execute commands sequentially or count cumulative connections; concurrency assertion T135-01/04 must fail. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-135.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:load -- tests/load/socket-load.ts
pnpm test:media -- tests/media/issue-135.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:load
pnpm test:media
```

**Chặn riêng của issue:** Không đạt latency/concurrency hoặc thiếu máy/hạ tầng local ⇒ BLOCKED+số thật. Rò tài nguyên có bằng chứng hoặc thiếu đo/đối chứng T135-07/08 ⇒ BLOCKED. Không dùng mức RSS tự chọn làm ngưỡng thay ngân sách lệnh đã chốt.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 136 local acceptance; 138 limits state exact tested load; 137 hardware AI retest separate.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-MAT-17` | [REQ-MATCH](../01-requirements/REQ-MATCH.md) | LOCAL+INTERNET |
| `AC-AI-13` | [REQ-AI](../01-requirements/REQ-AI.md) | LOCAL+INTERNET |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
