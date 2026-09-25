# ISSUE-129 — Giao diện lịch sử · xem lại · kết quả

**Nhóm:** E19 · **Phụ thuộc:** 128 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Ba màn hình cuối ván, có **nguyên nhân kết thúc ghi rõ bằng chữ**.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-HISTORY-REMATCH.md](../01-requirements/REQ-HISTORY-REMATCH.md) §11 · [../02-flows/FLOW-MATCH.md](../02-flows/FLOW-MATCH.md) §5

## 3. PHẠM VI
**✅ LÀM** — màn kết quả · lịch sử · xem lại

## 4. FILE TẠO
`apps/web/src/features/history/{MatchResultModal,HistoryPage,ReplayPage}.tsx`

## 5. CÁC BƯỚC
1. **Màn kết quả**:
   ```
   🏆 Bạn thắng!
   Chiếu hết                    ← ghi RÕ nguyên nhân bằng CHỮ
   Phòng đóng sau 08:42         ← đếm ngược thật
   [Xem lại] [Tái đấu] [Rời phòng]
   ```
2. ⭐ **Bốn kết cục** hiện khác nhau: thắng · thua · hoà · **gián đoạn** (*"Ván bị gián đoạn — không có người thắng"*)
3. ⭐ **Nguyên nhân bằng CHỮ**, đủ 11 giá trị dịch sang tiếng Việt — **không** hiện mã kỹ thuật
4. **Lịch sử**: danh sách + trạng thái **trống** (*"Bạn chưa chơi ván nào"*)
5. **Xem lại**: bàn cờ **chỉ đọc** + nút tới/lui/về đầu/về cuối · nhãn *"ván này có đi lại"* · nút tới/lui **vô hiệu** ở đầu/cuối
6. Nút **Tái đấu** **vô hiệu** khi đối thủ đã rời, **kèm giải thích**
7. Đang chờ đối thủ ⇒ hiện *"Đang chờ đối thủ đồng ý…"*
8. Người xem **không** thấy nút Tái đấu

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T129-01` | ⭐ **Bốn kết cục hiện khác nhau** |
| `T129-02` | ⭐ **Nguyên nhân hiện bằng CHỮ tiếng Việt**, đủ 11 giá trị |
| `T129-03` | ⭐ **Ván gián đoạn ghi rõ "không có người thắng"** |
| `T129-04` | Bộ đếm 10 phút **đếm ngược thật** |
| `T129-05` | Đối thủ đã rời → nút Tái đấu **vô hiệu + giải thích** |
| `T129-06` | Đang chờ đối thủ → hiện thông báo |
| `T129-07` | ⭐ **Người xem KHÔNG thấy nút Tái đấu** |
| `T129-08` | ⭐ **Lịch sử: trạng thái trống có giải thích** |
| `T129-09` | ⭐ **Xem lại: bàn cờ CHỈ ĐỌC** |
| `T129-10` | Nút tới/lui **vô hiệu** ở đầu và cuối |
| `T129-11` | ⭐ **Ván có đi lại → có NHÃN** |
| `T129-12` | Mobile 360px → không tràn ngang |
| `T129-13` | Cửa sổ kết quả đóng được bằng X, Esc, bấm ra ngoài |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 13 test xanh ở cả 2 kích thước
- [ ] **`T129-02`** nguyên nhân bằng chữ, không mã
- [ ] **`T129-03`** gián đoạn rõ ràng
- [ ] **`T129-09`** bàn cờ chỉ đọc
- [ ] `T129-05` vô hiệu có giải thích

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-129.md` — ảnh chụp **bốn** kết cục.

## 9. ⚠ CẠM BẪY
Hiện mã kỹ thuật như `BOTH_OFFLINE` cho người dùng là lỗi trải nghiệm — họ không hiểu. Phải dịch sang chữ tiếng Việt dễ hiểu.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-129

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/web/src/features/history/MatchResultModal.tsx; apps/web/src/features/history/HistoryPage.tsx; apps/web/src/features/history/ReplayPage.tsx.
- **File test:** `tests/e2e/issue-129.spec.ts`.
- **Nhận từ phụ thuộc:** 125 history; 126 two replay contexts; 127 vote; 128 deadline; 00811 Outcome Reason.
- **Bàn giao:** Tiếng Việt cho 11 reason; 4 outcomes; readonly replay; room route tách personal history; revoke/rematch clear room cache.
- **Trình tự xử lý tối thiểu:** Use exhaustive Record<Outcome Reason,string> để type check bắt thiếu reason; route carries room context for SPECTATOR; cancellation+query key phân biệt current room/history, không cache private dưới chung matchid.

### Chuẩn bị và oracle từng nhóm ca

**Given:** Four outcomes × 11 reason valid combinations; A/S1 views; empty 41 match history; replay 20 plies and undo.

| ID test (tiền tố T129 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–08,12–13` | Open result/history, rematch one vote, opponent leave, close modal via X/Esc/backdrop; mobile | Text reason không code; interrupted no winner; server 10 minute countdown; disabled rematch có reason; S không rematch; empty explained; không tràn. |
| `09–11,AC-HIS-22` | Replay next/previous/start/end; click/keyboard move; S view rồi revoke/rematch/close | Read-only không command move; boundaries disabled; undo label; stop in flight fetch/subscription và clear room data, navigate đúng; player personal history retained. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from '@playwright/test';

type Evidence129 = { translatedReasons: number; outcomeVariants: number; replayMoveRequests: number; revokedRoomDataRetained: boolean };

export function assertIssue129KeyCase(actual: Evidence129): void {
  expect(actual).toMatchObject({translatedReasons:11,outcomeVariants:4,replayMoveRequests:0,revokedRoomDataRetained:false});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Route SPECTATOR qua personal history hoặc giữ replay sau revoke; AC-HIS-22/T129-09 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-129.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:e2e -- tests/e2e/issue-129.spec.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:e2e
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 130/131/132 audit all states; 136 actual history acceptance.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-SPEC-20` | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) | LOCAL |
| `AC-INA-14` | [REQ-INACTIVITY](../01-requirements/REQ-INACTIVITY.md) | LOCAL |
| `AC-HIS-14` | [REQ-HISTORY-REMATCH](../01-requirements/REQ-HISTORY-REMATCH.md) | LOCAL |
| `AC-HIS-15` | [REQ-HISTORY-REMATCH](../01-requirements/REQ-HISTORY-REMATCH.md) | LOCAL |
| `AC-HIS-16` | [REQ-HISTORY-REMATCH](../01-requirements/REQ-HISTORY-REMATCH.md) | LOCAL |
| `AC-HIS-22` | [REQ-HISTORY-REMATCH](../01-requirements/REQ-HISTORY-REMATCH.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
