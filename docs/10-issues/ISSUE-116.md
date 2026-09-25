# ISSUE-116 — Giao diện media

**Nhóm:** E17 · **Phụ thuộc:** 115, 091 · **Trạng thái:** TODO
**Môi trường:** LiveKit local thật kiểm quyền/generation; nếu kiểm riêng token revocation Cloud thì ghi cổng triển khai riêng. Xem [EXTERNAL-SETUP.md](EXTERNAL-SETUP.md) §3 và media-control-contract.

## 1. MỤC TIÊU
Hai ô chọn độc lập cho camera và micro, có **cảnh báo bắt buộc** về micro.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-MEDIA.md](../01-requirements/REQ-MEDIA.md) **§13** · [../02-flows/FLOW-MEDIA.md](../02-flows/FLOW-MEDIA.md) §6

## 3. PHẠM VI
**✅ LÀM** — giao diện media · kết nối truyền · hiển thị luồng

## 4. FILE TẠO
`apps/web/src/features/media/{MediaPanel,SourceSelect,RemoteTile}.tsx` · `lib/sfu-client.ts`

**Hợp đồng đã chốt:** [media-control-contract](../09-technical/media-control-contract.md), DEC-041; phạm vi toàn tài khoản, timeout 30 giây, bằng chứng SFU và giới hạn thiết bị vật lý.

## 5. CÁC BƯỚC
1. **Hai ô chọn riêng biệt**, nhãn đầy đủ: **Tắt** / **Chỉ đối thủ** / **Đối thủ và người xem**
2. ⭐ **`BR-MED-17` — CẢNH BÁO BẮT BUỘC HIỂN THỊ**:
   ```
   ⚠ Micro có thể thu cả tiếng phát ra từ loa của bạn.
      Nên dùng tai nghe.
   ```
   Đây là **giới hạn vật lý**, không khắc phục được bằng phân quyền mạng
3. **`BR-MED-13`** — người phát thấy **khung xem trước đã TẮT TIẾNG** của chính mình (tránh vọng âm)
4. **`BR-MED-05`** — người xem **không có** nút phát; chỉ có **âm lượng** và **tắt tiếng cục bộ**
5. Trình duyệt chặn tự phát tiếng ⇒ hiện nút **Bật tiếng** thủ công
6. ⭐ **`BR-MED-15`** — từ chối quyền thiết bị ⇒ báo rõ nhưng **VẪN ĐÁNH CỜ BÌNH THƯỜNG**
7. Đang thu hồi ⇒ hiện *"Đang ngừng chia sẻ…"*, ⛔ **không** báo đã xong
8. ⭐ **`DT` §8 luật 1** — media **không bao giờ đè** bàn cờ. Điện thoại: **tab riêng**
9. **`SS-19`** — tải lại/nối lại/ván mới theo quy tắc reset hiện có; chuyển tab chỉ nguồn chuyển về Tắt, nguồn còn lại giữ nguyên.
10. **DEC-034:** chuyển nguồn có đang xử lý, lỗi + Thử lại; chặn bật mới trước xác nhận ngắt. Thành công vẫn Tắt, cần bật riêng.

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T116-01` | ⭐ **Hai ô chọn độc lập**, đặt khác nhau được |
| `T116-02` | ⭐ **Cảnh báo micro LUÔN hiển thị** |
| `T116-03` | Khung xem trước của mình **đã tắt tiếng** |
| `T116-04` | ⭐ **Người xem KHÔNG có nút phát** |
| `T116-05` | Người xem có âm lượng + tắt tiếng **cục bộ** |
| `T116-06` | Trình duyệt chặn tiếng → hiện nút **Bật tiếng** |
| `T116-07` | ⭐ **Từ chối quyền thiết bị → VẪN ĐÁNH CỜ ĐƯỢC** |
| `T116-08` | Không có thiết bị → ô chọn **vô hiệu**, có giải thích |
| `T116-09` | ⭐ **Đang thu hồi → hiện "Đang ngừng chia sẻ…"**, không báo đã xong |
| `T116-10` | ⭐ **Media KHÔNG đè bàn cờ** ở máy tính |
| `T116-11` | ⭐ **Mobile: media ở TAB RIÊNG** |
| `T116-12` | ⭐ **Tải lại → media VỀ TẮT** |
| `T116-13` | Ván kết thúc → mọi luồng **dừng**, thiết bị giải phóng |
| `T116-14` | A đặt *chỉ đối thủ*, B đặt *đối thủ và người xem* → người xem **chỉ thấy B** |
| `T116-15` | Chuyển nguồn: chưa xác nhận ngắt ⇒ đang xử lý/chặn bật; thất bại ⇒ lỗi + Thử lại; thành công ⇒ Tắt, không tự phát, nguồn còn lại giữ mức |
| `T116-16` | ERROR sau30 giây có Thử lại, trạng thái OFF không tự bật khi reply muộn; SFU confirmed nhưng thiếu ACK thiết bị có nội dung riêng đúng contract. |
| `T116-17` | Thiết bị/trình duyệt khác cũng hiện nguồn đang dùng nơi khác; không mở capture trước quyền owner mới được xác nhận. |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 17 test xanh ở cả 2 kích thước
- [ ] **`T116-02`** cảnh báo hiển thị
- [ ] **`T116-07`** không chặn đánh cờ
- [ ] **`T116-09`** không báo thành công giả
- [ ] **`T116-10`, `T116-11`** không đè bàn cờ

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-116.md` — ảnh chụp có cảnh báo micro.

## 9. ⚠ CẠM BẪY
Chặn bàn cờ khi người dùng từ chối quyền camera là lỗi nghiêm trọng — họ **chỉ muốn chơi cờ**, không muốn bật camera. `BR-MED-15` bắt buộc tách hai việc.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-116

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/web/src/features/media/MediaPanel.tsx; apps/web/src/features/media/SourceSelect.tsx; apps/web/src/features/media/RemoteTile.tsx; apps/web/src/lib/sfu-client.ts.
- **File test:** `tests/e2e/issue-116.spec.ts`, `tests/media/issue-116.test.ts`.
- **Nhận từ phụ thuộc:** 115 desired/applied/fence; 091 board; 114 transport grant; DTO ownership từ contract.
- **Bàn giao:** Hai selector,muted preview,manual audio play; capture chỉ sau owner+policy quyền; adapter UI transfer state để 099 nối real command.
- **Trình tự xử lý tối thiểu:** Capture,clone,publish là effect riêng có cleanup; không xin get User Media khi render/select chưa được owner; revoked generation disconnect old trước new connect; show physical-stop-unknown copy đúng contract.

### Chuẩn bị và oracle từng nhóm ca

**Given:** A/B/S trên browser thật với nguồn tổng hợp; desktop/mobile; deny permission/auto play; policy ảnh riêng + tiếng chung.

| ID test (tiền tố T116 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–08,14` | Cả 9 combination; deny device; auto play blocked; S view | Independent selectors; micro warning luôn có; self preview muted; S không publish control; local volume không policy change; deny device vẫn move thành công; S chỉ nguồn được share. |
| `09–13` | STOPPING→FAILED/OFF; reload; terminal; resize | Processing không claim đã dừng; reload OFF; terminal tracks stopped; media không overlap board; mobile tab riêng. |
| `15–17` | Render DTO STOPPING/ERROR/APPLIED from real 115 operation; chuyển account owner ở 099 | 116 kiểm UI với adapter state và real policy/SFU.099 là gate transfer command xuyên thiết bị; chưa có 099 không tuyên bố end-to-end transfer PASS; late ACK không auto capture. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence116 = { selfPreviewMuted: boolean; deviceDeniedMoveAccepted: boolean; captureOnReload: number; boardMediaOverlap: boolean; claimsPhysicalStopWithoutAck: boolean };

export function assertIssue116KeyCase(actual: Evidence116): void {
  expect(actual).toMatchObject({selfPreviewMuted:true,deviceDeniedMoveAccepted:true,captureOnReload:0,boardMediaOverlap:false,claimsPhysicalStopWithoutAck:false});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Auto capture khi mount hoặc un mute self preview; T116-03/12/17 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-116.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:e2e -- tests/e2e/issue-116.spec.ts
pnpm test:media -- tests/media/issue-116.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:e2e
pnpm test:media
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 099 tích hợp transfer real; 117 nhận kết quả luồng; 130 layout.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-MED-03` | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) | LOCAL |
| `AC-MED-12` | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) | LOCAL |
| `AC-MED-15` | [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
