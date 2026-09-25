# ISSUE-103 — Giao diện treo ván cho cả 3 phía

**Nhóm:** E14 · **Phụ thuộc:** 102, 091, 094, 104 · **Trạng thái:** TODO
**⭐ `R17`** — `DEC-013`

> **Cập nhật BA 2026-09-22 — DEC-026:** hỏi và đếm ngược bắt đầu đồng thời khi đủ 3 phút. DEC-027 đã chốt gia hạn đủ 3 phút từ xác nhận hợp lệ; DEC-030 chốt reconnect giữ hạn cũ, không cấp thêm 3 phút; không dùng mô tả reset cũ. Xem [question-backlog-2026-09-22.md](../08-ba-review/question-backlog-2026-09-22.md).

## 1. MỤC TIÊU
Hiển thị trạng thái treo ván cho **bên đến lượt**, **đối thủ**, **và người xem**.

## 2. VÌ SAO ĐỐI THỦ PHẢI THẤY

Nếu người **đang chờ** không thấy gì, họ **vẫn sẽ đầu hàng** vì tưởng mình bị kẹt vĩnh viễn — tức là luật mới **không cứu được** đúng người nó sinh ra để cứu.

## 3. ĐỌC TRƯỚC
[../01-requirements/REQ-INACTIVITY.md](../01-requirements/REQ-INACTIVITY.md) **§11, §12** · [../03-screens/screen-inventory.md](../03-screens/screen-inventory.md) §5

## 4. PHẠM VI
**✅ LÀM** — hộp thoại xác nhận · dòng trạng thái · đếm ngược cho cả 3 phía

## 5. FILE TẠO
`apps/web/src/features/match/InactivityPrompt.tsx` · `InactivityBanner.tsx`

## 6. CÁC BƯỚC
1. ⭐ **Hộp thoại — CHỈ bên đến lượt thấy** (`BR-INA-10`):
   ```
   ┌──────────────────────────────────────┐
   │  Bạn còn trong ván đấu không?        │
   │                                      │
   │  Bạn chưa đi nước trong 3 phút.      │
   │  Xác nhận để có thêm 3 phút.         │
   │                                      │
   │  Còn 2 lần gia hạn.                  │
   │  Thời gian xác nhận: 00:30           │
   │                                      │
   │        [ Tôi còn đây ]               │
   └──────────────────────────────────────┘
   ```
   - ⛔ **Không có nút đóng/huỷ** (`screen-inventory` §5)
   - Hiện **số lần gia hạn còn lại**
   - Lần cuối cảnh báo rõ: *"Đây là lần gia hạn cuối."*
2. ⭐ **Đối thủ và người xem** (`DEC-013`):
   ```
   ⏳ Đối thủ chưa đi nước — đang chờ xác nhận
   ```
   Ngay khi hộp thoại hiện, đồng thời bắt đầu 30 giây (`DEC-026`):
   ```
   ⏳ Đối thủ không phản hồi — kết thúc sau 00:27
   ```
3. ⭐ **Đếm ngược hiện cho CẢ BA phía**
4. **`BR-UI-INA-01`** — trạng thái **không chỉ dùng màu**, phải có chữ và biểu tượng
5. **`BR-INA-15`** — đếm ngược dựa **thời gian máy chủ**; client chỉ đếm tiếp cục bộ. ⛔ **Client không tự kết luận** ván kết thúc
6. Đối thủ **không có nút** ép kết thúc sớm (`BR-INA-13`)
7. Nối lại giữa lúc đang hỏi/đếm ⇒ nhận **ngay** trạng thái và thời gian còn lại

## 7. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T103-01` | ⭐ **Bên đến lượt THẤY hộp thoại** |
| `T103-02` | ⭐ **Đối thủ KHÔNG thấy hộp thoại**, chỉ thấy dòng trạng thái |
| `T103-03` | ⭐ **Người xem THẤY dòng trạng thái** (`DEC-013`) |
| `T103-04` | ⭐ **Đếm ngược 30 giây hiện cho CẢ BA phía ngay lúc hộp thoại xuất hiện**, không có khoảng hỏi riêng trước đó |
| `T103-05` | Hộp thoại hiện **số lần gia hạn còn lại** |
| `T103-06` | Lần gia hạn cuối → cảnh báo rõ |
| `T103-07` | ⭐ **Hộp thoại KHÔNG đóng được** bằng X, Esc, bấm ra ngoài |
| `T103-08` | Bấm xác nhận → hộp thoại đóng, thông báo ở 2 phía kia **biến mất** |
| `T103-09` | ⭐ **Đối thủ KHÔNG có nút ép kết thúc sớm** |
| `T103-10` | ⭐ **Trạng thái có CHỮ, không chỉ màu** |
| `T103-11` | ⭐ **Nối lại giữa lúc đếm → thấy ĐÚNG thời gian còn lại** |
| `T103-12` | Mobile 360px → hộp thoại hiện đúng, không tràn |
| `T103-13` | Hết lượt gia hạn → **không** hiện hộp thoại, vào thẳng đếm ngược |

## 8. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 13 test xanh với **3 phiên** (2 chơi + 1 xem), cả 2 kích thước
- [ ] **`T103-02`, `T103-03`, `T103-04`** — đúng ai thấy gì
- [ ] **`T103-07`** cảnh báo không đóng tuỳ ý, không chặn bàn cờ/đầu hàng
- [ ] **`T103-09`** không ép kết thúc sớm
- [ ] `T103-11` nối lại đúng trạng thái

## 9. BẰNG CHỨNG
`docs/test-reports/ISSUE-103.md` — ảnh chụp **ba góc nhìn** cùng thời điểm.

## 10. ⚠ CẠM BẪY
Cho hộp thoại **đóng được** sẽ khiến người chơi bấm X rồi tưởng đã xong — nhưng đồng hồ vẫn chạy và họ **thua mà không hiểu vì sao**. `screen-inventory` §5 liệt kê đây là một trong **4 trạng thái không đóng tuỳ ý** có chủ ý; cảnh báo chống treo không phải modal chặn thao tác bàn cờ/đầu hàng.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-103

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/web/src/features/match/InactivityPrompt.tsx; apps/web/src/features/match/InactivityBanner.tsx.
- **File test:** `tests/e2e/issue-103.spec.ts`.
- **Nhận từ phụ thuộc:** 102 server phase/deadline; 091 live room; 094 monotonic projection.
- **Bàn giao:** Cảnh báo không dismiss tuỳ ý, không modal chặn bàn cờ/đầu hàng; chỉ current PLAYER có confirm; mọi phía có countdown.
- **Trình tự xử lý tối thiểu:** Render theo snapshot, không timer tự tạo outcome; nút confirm gửi cùng command service; disabled pending có lý do; non-modal dùng region/live status, không focus trap toàn bàn.

### Chuẩn bị và oracle từng nhóm ca

**Given:** A tới lượt,B chờ,S1; 3 browser context; desktop/mobile 360; clock server t 180000.

| ID test (tiền tố T103 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–06,09–10,13` | Mở NORMAL/PROMPTING/COUNTDOWN với extensions 0/1/2 | A thấy confirm khi còn lượt; B/S chỉ status; cả 3 cùng 30 s ngay; lượt cuối có cảnh báo; hết 2 không confirm; text/icon rõ. |
| `07–08,11–12` | X/Esc/backdrop; keyboard đi nước/đầu hàng; confirm; fixture riêng chưa confirm reconnect 190000 | Không dismiss cảnh báo; vẫn thao tác board hợp lệ; confirm commit mới đóng 3 phía; reconnect hiển thị 20 s; mobile không tràn. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from '@playwright/test';

type Evidence103 = { confirmButtonsA: number; confirmButtonsB: number; confirmButtonsS: number; secondsA: number; secondsB: number; secondsS: number; boardKeyboardUsable: boolean };

export function assertIssue103KeyCase(actual: Evidence103): void {
  expect(actual).toMatchObject({confirmButtonsA:1,confirmButtonsB:0,confirmButtonsS:0,secondsA:30,secondsB:30,secondsS:30,boardKeyboardUsable:true});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Hiện countdown muộn 30 s hoặc role SPECTATOR có confirm; T103-04/02/03 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-103.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:e2e -- tests/e2e/issue-103.spec.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:e2e
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 130 responsive; 132 exception non-dismissable không đồng nghĩa khoá bàn.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-SPEC-18` | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) | LOCAL |
| `AC-INA-01` | [REQ-INACTIVITY](../01-requirements/REQ-INACTIVITY.md) | LOCAL |
| `AC-INA-09` | [REQ-INACTIVITY](../01-requirements/REQ-INACTIVITY.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
