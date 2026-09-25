# ISSUE-055 — Giao diện tài khoản

**Nhóm:** E05 · **Phụ thuộc:** 050, 052, 054 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Sáu màn hình tài khoản, có **đủ 5 trạng thái** và thông báo lỗi tiếng Việt rõ ràng.

## 2. ĐỌC TRƯỚC
[../03-screens/screen-inventory.md](../03-screens/screen-inventory.md) §1, §3 · [../03-screens/design-tokens.md](../03-screens/design-tokens.md) §2, §4

## 3. PHẠM VI
**✅ LÀM** — 6 màn hình + định tuyến + trạng thái
**❌ KHÔNG LÀM** — sảnh (067) · hồ sơ (056)

## 4. FILE TẠO
```
apps/web/src/features/auth/{LoginPage,RegisterPage,ForgotPasswordPage,
  ResetPasswordPage,VerifyNoticePage,OnboardingPage}.tsx
apps/web/src/app/router.tsx
apps/web/src/styles/tokens.css
```

**Hợp đồng đã chốt:** [auth-provider-config](../09-technical/auth-provider-config.md) §4–6, DEC-040; không coi SDK mặc định là bằng chứng vòng đời/thu hồi.

## 5. CÁC BƯỚC
1. Sáu màn theo `screen-inventory` §1: `/login` `/register` `/forgot-password` `/reset-password` `/verify` `/onboarding`
2. **Mọi màn phải có đủ 5 trạng thái** (`SCR-RULE-01`):
   | Trạng thái | Yêu cầu |
   |---|---|
   | Đang tải | khung xương, **không** để trắng |
   | Trống | không áp dụng cho màn auth |
   | Lỗi | nói rõ lỗi + nút **Thử lại** |
   | **Vô hiệu** | **bắt buộc giải thích vì sao** |
   | Thành công | chuyển trang |
3. `tokens.css` — chép **đúng** 7 màu và thang khoảng cách từ `design-tokens.md` §2, §5
4. Nút gửi **vô hiệu khi đang xử lý** (`SCR-RULE-04`)
5. Thông báo lỗi **tiếng Việt**, nói rõ **cách sửa** (`DT-10`)
6. Khách mở link phòng ⇒ ghi nhớ đích, đăng nhập xong **tự chuyển tới**
7. SCR-LOGIN giải thích Ghi nhớ theo DEC-038/040 và screen-inventory; hết phiên có thông báo rõ + đăng nhập lại.
8. Hai màn **chặn** (`/verify`, `/onboarding`) **không có** đường thoát ngoài hoàn tất hoặc đăng xuất

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T055-01` | Sáu màn render được ở **cả** desktop 1366 và mobile 360 |
| `T055-02` | ⭐ Mobile 360px → **không tràn ngang** ở cả 6 màn |
| `T055-03` | Đang gửi → nút **vô hiệu**, bấm 2 lần chỉ gửi **1** yêu cầu |
| `T055-04` | Lỗi mạng → hiện lỗi + nút **Thử lại** hoạt động |
| `T055-05` | Mọi thông báo lỗi bằng **tiếng Việt** và nêu cách sửa |
| `T055-06` | ⭐ Khách mở `/rooms/abc` → về đăng nhập → đăng nhập xong **tự vào `/rooms/abc`** |
| `T055-07` | `/verify` và `/onboarding` **không** có link ra sảnh |
| `T055-08` | Màu dùng **đúng** giá trị trong `tokens.css` |
| `T055-09` | Dùng được **hoàn toàn bằng bàn phím** — Tab, Enter |
| `T055-10` | Checkbox mặc định tick, giải thích đóng tab/reload và gia hạn theo hoạt động; khi phiên hết hạn hiển thị lý do + đăng nhập lại |
| `T055-11` | UI temporary nói rõ 30 phút/12 giờ, browser restore có thể giữ phiên và logout là bảo đảm; không hứa đóng tab luôn logout. |
| `T055-12` | Callback hết hạn/mất verifier/đích không còn hợp lệ có lối ra; Google-only không bị ép mật khẩu, màn recovery không tiết lộ loại tài khoản. |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 12 test xanh ở **cả 2** kích thước
- [ ] **`T055-02`** không tràn ngang
- [ ] **`T055-06`** ghi nhớ đích hoạt động
- [ ] Mọi nút vô hiệu **có giải thích**
- [ ] Màu **khớp** `design-tokens.md`

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-055.md` — ảnh chụp 6 màn ở cả 2 kích thước.

## 9. ⚠ CẠM BẪY
Nút vô hiệu **không giải thích vì sao** là lỗi sản phẩm — người dùng không biết phải làm gì. `SCR-RULE-01` yêu cầu mọi trạng thái vô hiệu đều có lời giải thích.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** Sáu màn tài khoản dùng service 047–054 và tokens; returnPath nội bộ theo tab, /verify và /onboarding là trạng thái chặn. Form pending chặn double-submit; error Việt có hành động sửa; temporary copy đúng DEC040.

**Tiền điều kiện cụ thể:** Playwright thật tại 1366×768 và 360×800; data fixtures tạo trạng thái login/register/verify/forgot/reset/onboarding; network lỗi dùng abort transport, không giả thành công Auth.

**File kiểm thử:** `tests/e2e/issue-055.spec.ts`. Giữ tên `T055-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T055-01` | Mở lần lượt 6 route với trạng thái Auth phù hợp; kiểm heading/form và ảnh mỗi viewport. | Sáu màn render được ở **cả** desktop 1366 và mobile 360 |
| `T055-02` | Đo document.scrollWidth<=innerWidth trên 6 màn, kể cả lỗi dài và tên dài. | ⭐ Mobile 360 px → **không tràn ngang** ở cả 6 màn |
| `T055-03` | Giữ request ở transport barrier, double click Submit; đếm 1 request và disabled có giải thích. | Đang gửi → nút **vô hiệu**, bấm 2 lần chỉ gửi **1** yêu cầu |
| `T055-04` | Abort request lần 1, khôi phục transport và Thử lại; nhận response thật lần 2. | Lỗi mạng → hiện lỗi + nút **Thử lại** hoạt động |
| `T055-05` | Kích hoạt validation/network/expired/provider error; đối chiếu copy Việt và hành động khắc phục. | Mọi thông báo lỗi bằng **tiếng Việt** và nêu cách sửa |
| `T055-06` | Mở returnPath nội bộ khi guest, login thật; giữ đích; join thật sau 061/069, không khẳng định room đã dựng tại 055. | ⭐ Khách mở `/rooms/abc` → về đăng nhập → đăng nhập xong **tự vào `/rooms/abc`** |
| `T055-07` | Ở verify/onboarding, kiểm links và deep-link/back; server vẫn chặn. | `/verify` và `/onboarding` **không** có link ra sảnh |
| `T055-08` | Đọc computed styles và tokens CSS; không màu hardcode khác. | Màu dùng **đúng** giá trị trong `tokens.css` |
| `T055-09` | Không dùng mouse: Tab/ShiftTab/Enter qua cả 6 form, focus không mất. | Dùng được **hoàn toàn bằng bàn phím** — Tab, Enter |
| `T055-10` | Checkbox tick mặc định, activity copy đúng; server expiry đưa về login có lý do. | Checkbox mặc định tick, giải thích đóng tab/reload và gia hạn theo hoạt động; khi phiên hết hạn hiển thị lý do + đăng nhập lại |
| `T055-11` | Chọn temporary, đọc đủ 30 phút/12 giờ/restore/logout; không câu đóng tab luôn logout. | UI temporary nói rõ 30 phút/12 giờ, browser restore có thể giữ phiên và logout là bảo đảm; không hứa đóng tab luôn logout. |
| `T055-12` | Callback expired/missing verifier có retry/login; Google-only không forced password; recovery không tiết lộ account type. | Callback hết hạn/mất verifier/đích không còn hợp lệ có lối ra; Google-only không bị ép mật khẩu, màn recovery không tiết lộ loại tài khoản. |



### 10.3 Điểm triển khai cần giữ đúng

```ts
import { expect, test } from '@playwright/test';
test('T055-02 login không tràn ngang', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/login');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **bỏ pending guard để double click phát 2 request**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-055.md`.

```bash
pnpm test:e2e -- tests/e2e/issue-055.spec.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:e2e
```

**Đóng issue:** mọi test trong ma trận và mọi ô PASS phía trên đạt; không `.only`/`.skip`, không thiếu lane. Các gate tích hợp tương lai được nêu đích danh trong issue phải có chủ sở hữu/bằng chứng riêng, không ghi chúng PASS bằng spy/fixture. Chỉ đổi `TODO` sang `DONE` sau PR đã merge theo WORKFLOW.

**BLOCKED và bàn giao:** thiếu capability dependency hoặc invariant trong 10.1 chưa kiểm được ⇒ `BLOCKED`, ghi đúng test/đầu vào/response sai và commit liên quan. PostgreSQL/socket/browser cần cho ma trận không chạy được ⇒ test phải đỏ; không bỏ qua hoặc thay bằng dữ liệu tự dựng để báo đạt. Bàn giao đường dẫn file thực đã sửa, exported interface/DTO, migrations nếu có, các test ID đạt/chưa đạt, bằng chứng fault injection, và tên issue kế tiếp sử dụng hợp đồng ở 10.1; không bàn giao chỉ một câu “đã xong”.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-AUTH-01` | [REQ-AUTH](../01-requirements/REQ-AUTH.md) | LOCAL+INTERNET |
| `AC-AUTH-10` | [REQ-AUTH](../01-requirements/REQ-AUTH.md) | LOCAL |
| `AC-AUTH-11` | [REQ-AUTH](../01-requirements/REQ-AUTH.md) | LOCAL |
| `AC-AUTH-15` | [REQ-AUTH](../01-requirements/REQ-AUTH.md) | LOCAL |
| `AC-AUTH-16` | [REQ-AUTH](../01-requirements/REQ-AUTH.md) | LOCAL |
| `AC-SS-14` | [session-state](../05-data-and-realtime/session-state.md) | LOCAL |
| `AC-SS-15` | [session-state](../05-data-and-realtime/session-state.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
