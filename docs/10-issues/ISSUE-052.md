# ISSUE-052 — Quên mật khẩu + đặt lại

**Nhóm:** E05 · **Phụ thuộc:** 051 · **Trạng thái:** TODO
**⚠ Có thể `BLOCKED_EXTERNAL`** — cần SMTP riêng. Xem [EXTERNAL-SETUP.md](EXTERNAL-SETUP.md) §2

## 1. MỤC TIÊU
Khôi phục mật khẩu qua email, và **thu hồi toàn bộ phiên** sau khi đổi.

## 2. ĐỌC TRƯỚC
[../02-flows/FLOW-AUTH.md](../02-flows/FLOW-AUTH.md) §5 · [../01-requirements/REQ-AUTH.md](../01-requirements/REQ-AUTH.md) §9 `BR-AUTH-12`, `BR-AUTH-17`

## 3. PHẠM VI
**✅ LÀM** — quên mật khẩu · đặt lại · thu hồi phiên
**❌ KHÔNG LÀM** — Google (053)

## 4. FILE TẠO
`apps/web/src/features/auth/forgot-password.tsx` · `reset-password.tsx`

**Hợp đồng đã chốt:** [auth-provider-config](../09-technical/auth-provider-config.md) §4–6, DEC-040; không coi SDK mặc định là bằng chứng vòng đời/thu hồi.

## 5. CÁC BƯỚC
1. Nhập email → gọi **thẳng** thư viện Supabase từ trình duyệt (giữ mã xác thực đúng chỗ)
2. **`BR-AUTH-17` — thông báo CHUNG**: *"Nếu email tồn tại, chúng tôi đã gửi hướng dẫn"* — **dù email có tồn tại hay không**
3. Callback recovery `/auth/callback` đổi mã lấy recovery context hợp lệ rồi tới `/reset-password`; gửi mật khẩu mới tới server endpoint bảo vệ bởi recovery context dùng một lần
4. Server đặt fence chặn phiên cũ + job bền vững **trước** gọi Auth cập nhật mật khẩu; theo auth-provider-config §6. Không dựa callback client gọi logout sau update. Chưa xác nhận hoàn tất ⇒ chưa báo thành công, retry có idempotency; không lưu/log mật khẩu. Recovery chỉ được dùng cho thao tác này, không cấp quyền sản phẩm.
5. Mở link ở trình duyệt khác (thiếu mã xác thực) ⇒ báo rõ, hướng dẫn gửi lại
6. Dùng khôi phục/link có hạn và giới hạn tần suất của Supabase Auth; không xây bộ token email hoặc thêm luật 5 email/giờ chưa chốt. Ghi cấu hình hiệu lực theo [auth-provider-config](../09-technical/auth-provider-config.md), UI xử lý kết quả hết hạn/giới hạn từ dịch vụ.

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T052-01` | Quên mật khẩu → **email thật** vào hộp thư local |
| `T052-02` | ⭐ Email **tồn tại** và **không tồn tại** → **CÙNG một thông báo** |
| `T052-03` | Bấm link → đặt mật khẩu mới thành công |
| `T052-04` | ⭐ **Sau khi đổi mật khẩu → MỌI phiên cũ bị thu hồi** |
| `T052-05` | Mật khẩu mới đăng nhập được; mật khẩu cũ **không** |
| `T052-06` | Dùng lại link đã dùng → **bị từ chối** |
| `T052-07` | Link hết hạn theo cấu hình Auth đã ghi nhận → **bị từ chối**, không chỉ tự giả trạng thái UI |
| `T052-08` | Thu hồi phiên lỗi → **không** báo hoàn thành, có nút thử lại |
| `T052-09` | Gửi lại vượt giới hạn Auth thực tế → bị chặn và báo chờ; bằng chứng ghi quota/phạm vi áp dụng |
| `T052-10` | Recovery service không yêu cầu password identity có sẵn, không xoá provider identity; test user Auth không password bằng factory thật. Google-only email + hai cách login thật kiểm tại053 AC-AUTH-21, không giả Google PASS ở052. |
| `T052-11` | Client đóng/mất mạng hoặc gọi trực tiếp Auth updateUser bỏ qua endpoint ứng dụng: trigger DB vẫn fence phiên cũ + job bền vững; retry không tạo tài khoản mới. |
| `T052-12` | Recovery token/context dùng lại, hết hạn hoặc login session thông thường giả recovery ⇒ bị từ chối; recovery không vào phòng trước hoàn tất. |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 12 test xanh với hộp thư local thật
- [ ] **`T052-02`** — không tiết lộ email có tồn tại hay không
- [ ] **`T052-04`** — thu hồi toàn bộ phiên
- [ ] `T052-06` và `T052-07` — link dùng một lần, có hạn
- [ ] `T052-08` — không báo thành công giả

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-052.md` — kèm snapshot cấu hình không chứa bí mật theo [auth-provider-config](../09-technical/auth-provider-config.md) §3.

## 9. ⚠ CẠM BẪY
Thông báo khác nhau cho *"email tồn tại"* và *"email không tồn tại"* biến trang quên mật khẩu thành **công cụ dò email** — kẻ tấn công thử hàng loạt để biết ai có tài khoản. `T052-02` chặn việc này.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** Supabase resetPasswordForEmail → PKCE callback/recovery session → server password reset có fence trước Auth update. Trigger 043 trên encrypted_password chặn đường Auth trực tiếp; PASSWORD_CHANGED scope ALL. Recovery không quyền sản phẩm và luôn về login; Google-only giữ identity khi thêm password.

**Tiền điều kiện cụ thể:** Hộp thư local thật, Auth users có 3 session; recovery email lấy từ provider; Google-only cần credential Google thật 053, không giả identity thành PASS.

**File kiểm thử:** `tests/integration/issue-052.test.ts` · `tests/e2e/issue-052.spec.ts`. Giữ tên `T052-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T052-01` | Gọi recovery email đã có, đọc mailbox recipient duy nhất và link thật. | Quên mật khẩu → **email thật** vào hộp thư local |
| `T052-02` | Gửi email tồn tại/không tồn tại/Google-only; so sánh response công khai cùng message/shape. | ⭐ Email **tồn tại** và **không tồn tại** → **CÙNG một thông báo** |
| `T052-03` | Dùng link đúng browser, gửi password 10–128 hợp lệ; Auth login bằng password mới. | Bấm link → đặt mật khẩu mới thành công |
| `T052-04` | Ba JWT cũ dùng sau reset commit; tất cả bị chặn; job ALL đúng target snapshot. | ⭐ **Sau khi đổi mật khẩu → MỌI phiên cũ bị thu hồi** |
| `T052-05` | Thử old/new password qua 049; old thất bại new thành công sau barrier hoàn tất. | Mật khẩu mới đăng nhập được; mật khẩu cũ **không** |
| `T052-06` | Dùng lại recovery link đã consume trong context sạch; không đổi mật khẩu lần 2. | Dùng lại link đã dùng → **bị từ chối** |
| `T052-07` | Link thật quá hạn cấu hình qua fixture timestamp Auth; Auth từ chối, UI cho recovery mới. | Link hết hạn theo cấu hình Auth đã ghi nhận → **bị từ chối**, không chỉ tự giả trạng thái UI |
| `T052-08` | Làm revoke provider lỗi sau fence; phiên cũ vẫn bị chặn, retry operation không báo success sớm. | Thu hồi phiên lỗi → **không** báo hoàn thành, có nút thử lại |
| `T052-09` | Resend trước quota/max_frequency thực; Auth trả rate error, UI không bịa countdown. | Gửi lại vượt giới hạn Auth thực tế → bị chặn và báo chờ; bằng chứng ghi quota/phạm vi áp dụng |
| `T052-10` | Auth user thật không password qua factory; recovery email local và update password, kiểm không tự xoá identities. Google thật do053 kiểm tiếp. | User_id giữ nguyên, thêm password thành công và revoke phiên cũ; toàn luồng Google-only thuộc053 AC-AUTH-21. |
| `T052-11` | Gọi supabase.auth.updateUser trực tiếp bằng recovery rồi cắt client; query trigger đã revoke+enqueue; không hash/password trong job. | Client đóng/mất mạng hoặc gọi trực tiếp Auth updateUser bỏ qua endpoint ứng dụng: trigger DB vẫn fence phiên cũ + job bền vững; retry không tạo tài khoản mới. |
| `T052-12` | Dùng recovery hết hạn/replay và normal login session gửi endpoint reset; bị từ chối, không được room access. | Recovery token/context dùng lại, hết hạn hoặc login session thông thường giả recovery ⇒ bị từ chối; recovery không vào phòng trước hoàn tất. |

T052-10 kiểm nhánh recovery Auth không password trên Auth thật, không giả Google identity. Cổng Google-only email/hai phương thức login giữ tại ISSUE-053 AC-AUTH-21 sau052/055; thiếu Google thì053 BLOCKED_EXTERNAL, không tạo phụ thuộc ngược052→053.

### 10.3 Điểm triển khai cần giữ đúng

```sql
-- Kiểm trigger thực sự tồn tại trên Auth của version đã pin (không sửa Auth bằng Prisma).
SELECT tgname, pg_get_triggerdef(oid)
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass AND NOT tgisinternal;
-- Test tiếp theo PHẢI gọi Auth updateUser thật và đọc app_sessions/jobs.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **bỏ trigger password-change để gọi Auth trực tiếp giữ được session cũ**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-052.md`.

```bash
pnpm test:integration -- tests/integration/issue-052.test.ts
pnpm test:e2e -- tests/e2e/issue-052.spec.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
pnpm test:e2e
```

**Đóng issue:** mọi test trong ma trận và mọi ô PASS phía trên đạt; không `.only`/`.skip`, không thiếu lane. Các gate tích hợp tương lai được nêu đích danh trong issue phải có chủ sở hữu/bằng chứng riêng, không ghi chúng PASS bằng spy/fixture. Chỉ đổi `TODO` sang `DONE` sau PR đã merge theo WORKFLOW.

**BLOCKED và bàn giao:** thiếu capability dependency hoặc invariant trong 10.1 chưa kiểm được ⇒ `BLOCKED`, ghi đúng test/đầu vào/response sai và commit liên quan. Thiếu Google/SMTP thực tế cho nhánh có yêu cầu provider thật ⇒ `BLOCKED_EXTERNAL`, ghi nhánh nào đã chứng minh local và nhánh nào còn thiếu. Bàn giao đường dẫn file thực đã sửa, exported interface/DTO, migrations nếu có, các test ID đạt/chưa đạt, bằng chứng fault injection, và tên issue kế tiếp sử dụng hợp đồng ở 10.1; không bàn giao chỉ một câu “đã xong”.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-AUTH-07` | [REQ-AUTH](../01-requirements/REQ-AUTH.md) | LOCAL+INTERNET |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
