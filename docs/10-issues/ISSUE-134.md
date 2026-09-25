# ISSUE-134 — Giới hạn tần suất + kích thước

**Nhóm:** E20 · **Phụ thuộc:** 133 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Chặn lạm dụng bằng giới hạn tần suất và kích thước dữ liệu.

## 2. ĐỌC TRƯỚC
[../04-business-rules/business-rules.md](../04-business-rules/business-rules.md) §3 (bảng giới hạn) · §4.3

## 3. PHẠM VI
**✅ LÀM** — giới hạn tần suất · giới hạn kích thước · tiêu đề bảo mật

## 4. CÁC BƯỚC
1. **Bảng giới hạn tần suất** — lấy từ `business-rules` §3:
   | Hành động | Giới hạn |
   |---|---|
   | Đăng nhập | **5 lần/phút** theo IP + username |
   | Chat | **5 tin/10 giây**, tính **chung cả hai kênh** |
   | Đề nghị hoà/đi lại | **1 / 10 giây / người** |
   | Nhập mã phòng | có giới hạn, chống dò mã |
   | Đăng ký, khôi phục | theo giới hạn của dịch vụ xác thực |
2. **Giới hạn kích thước**: thân yêu cầu tối đa **64 KB** — chống làm nghẽn
3. **Danh sách nguồn gốc được phép** — chỉ đúng địa chỉ ứng dụng, ⛔ **không** mở toàn bộ
4. Tiêu đề bảo mật: chính sách nội dung nghiêm ngặt · chống nhúng khung · chống đoán kiểu tệp
5. ⛔ Xác thực dùng **khoá gửi kèm mỗi yêu cầu**, **không** dùng cookie liên miền
6. Vượt giới hạn ⇒ **`RATE_LIMITED`** với thông báo rõ, ⛔ **không** lỗi nặng
7. Bộ nhớ giới hạn tần suất **có dọn dẹp** — không phình vô hạn

## 5. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T134-01` | ⭐ **Đăng nhập sai 6 lần/phút → lần 6 BỊ CHẶN** |
| `T134-02` | ⭐ **Gửi 6 tin/10 giây → tin thứ 6 BỊ CHẶN** |
| `T134-03` | ⭐ **Tần suất chat tính CHUNG cả hai kênh** |
| `T134-04` | Đề nghị 2 lần/10 giây → lần 2 bị chặn |
| `T134-05` | ⭐ **Thân yêu cầu 65 KB → TỪ CHỐI** |
| `T134-06` | ⭐ **Nguồn gốc không được phép → TỪ CHỐI** cả HTTP lẫn thời gian thực |
| `T134-07` | Tiêu đề bảo mật có đủ |
| `T134-08` | ⭐ **Không dùng cookie liên miền** cho xác thực |
| `T134-09` | Vượt giới hạn → `RATE_LIMITED`, thông báo rõ |
| `T134-10` | ⭐ **Bộ nhớ giới hạn tần suất được DỌN DẸP**, không phình vô hạn |
| `T134-11` | Dò mã phòng liên tục → bị chặn |

## 6. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 11 test xanh
- [ ] **`T134-01`, `T134-02`** — giới hạn có hiệu lực
- [ ] **`T134-06`** danh sách nguồn gốc chặt
- [ ] **`T134-10`** không rò bộ nhớ
- [ ] Mọi con số khớp `business-rules` §3

## 7. BẰNG CHỨNG
`docs/test-reports/ISSUE-134.md`

## 8. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| **Danh sách nguồn gốc mở toàn bộ** (`F-05`) | `T134-06` |
| **Bộ nhớ giới hạn tần suất không có dọn dẹp** (`F-27`) | `T134-10` |

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-134

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/server/src/auth/rate-limit.service.ts; apps/server/src/main.ts; apps/server/src/realtime/gateway.ts.
- **File test:** `tests/integration/issue-134.test.ts`.
- **Nhận từ phụ thuộc:** 133 ma trận quyền; business-rules §3 và §4.3; quota chat chung108; quota đề nghị105.
- **Bàn giao:** Giới hạn đăng nhập5 lần/phút theo IP+username; chat5 tin/10 giây toàn tài khoản; đề nghị1 lần/10 giây; thân yêu cầu tối đa64KB, CORS allowlist chính xác, tiêu đề bảo mật.
- **Trình tự xử lý tối thiểu:** Dùng lại bộ giới hạn của từng hành động, không tạo hai bộ đếm khác nhau. Dọn bucket hết hạn bằng clock tiêm và giới hạn thời gian lưu. Mức chống dò mã phải lấy từ canonical; chưa có con số thì báo chặn thay vì tự đặt.

### Chuẩn bị và oracle từng nhóm ca

**Given:** Clock tiêm;6 yêu cầu cùng bucket và các actor đối chứng; payload Unicode đo byte UTF-8; origin hợp lệ, origin giả và origin chứa chuỗi con giống origin hợp lệ trên HTTP/Socket.IO.

| ID test | When — tác động thật | Then — kết quả bắt buộc |
|---|---|---|
| `01–04,09–11` | Gửi5 lần đăng nhập rồi lần6; gửi3 tin PLAYERS+2 tin ROOM từ nhiều tab rồi tin6; gửi2 đề nghị; dò mã liên tục; tiến clock qua biên cửa sổ | Vượt mức nhận RATE_LIMITED, không ghi dữ liệu. Retry receipt không tính thêm quota. Quota chung tài khoản; kiểm trước/đúng/sau hạn; bucket cũ được dọn. |
| `05–08` | Gửi payload64KB/64KB+1byte/65KB sau JSON+UTF-8; thử origin lạ ở HTTP, OPTIONS và socket upgrade; đọc response headers | Đếm byte, không đếm độ dài chuỗi JavaScript. Yêu cầu quá lớn bị chặn trước xử lý nghiệp vụ; allowlist áp dụng cả hai đường; CSP/chống nhúng/nosniff đủ; không dùng cookie liên miền. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence134 = { sixthLogin: string; sixthChat: string; evilHttpAccepted: boolean; evilSocketAccepted: boolean; oversizedWrites: number };

export function assertIssue134KeyCase(actual: Evidence134): void {
  expect(actual).toMatchObject({sixthLogin:'RATE_LIMITED',sixthChat:'RATE_LIMITED',evilHttpAccepted:false,evilSocketAccepted:false,oversizedWrites:0});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Allow origin wild card or count chat per channel; T134-06/03 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-134.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:integration -- tests/integration/issue-134.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 135 load measured with real guards enabled; 137 exact deployed origin.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-MAT-16` | [REQ-MATCH](../01-requirements/REQ-MATCH.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
