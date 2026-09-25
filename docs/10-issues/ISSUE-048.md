# ISSUE-048 — Xác minh email

**Nhóm:** E05 · **Phụ thuộc:** 047 · **Trạng thái:** TODO
**⚠ Có thể `BLOCKED_EXTERNAL`** — cần SMTP riêng (hộp thư local vẫn test được). Xem [EXTERNAL-SETUP.md](EXTERNAL-SETUP.md) §2

## 1. MỤC TIÊU
Người dùng bấm link trong email để kích hoạt tài khoản.

## 2. ĐỌC TRƯỚC
[../02-flows/FLOW-AUTH.md](../02-flows/FLOW-AUTH.md) §2 · [../01-requirements/REQ-AUTH.md](../01-requirements/REQ-AUTH.md) §6, §7

## 3. PHẠM VI
**✅ LÀM** — màn nhắc xác minh · gửi lại email · trang quay về
**❌ KHÔNG LÀM** — quên mật khẩu (052)

## 4. FILE TẠO
`apps/web/src/features/auth/verify-notice.tsx` · `auth-callback.tsx`

**Hợp đồng đã chốt:** [auth-provider-config](../09-technical/auth-provider-config.md) §4–6, DEC-040; không coi SDK mặc định là bằng chứng vòng đời/thu hồi.

## 5. CÁC BƯỚC
1. **Màn nhắc xác minh** là trạng thái **chặn** — chỉ có 3 việc: xem thông báo · gửi lại email · đăng xuất
2. Trang quay về `/auth/callback`:
   - Đổi mã lấy phiên **đúng một lần**
   - Sau đó **xoá mã khỏi thanh địa chỉ**
   - Chưa có username → chuyển tới màn chọn username
   - Đủ điều kiện → vào sảnh
3. **Tải lại trang callback** sau khi đã dùng ⇒ **không** đổi mã lần hai
4. Link hết hạn hoặc đã dùng ⇒ báo rõ + cho **gửi lại**
5. Mở link ở **trình duyệt khác** (thiếu mã xác thực) ⇒ báo rõ, hướng dẫn gửi lại từ trình duyệt hiện tại
6. Nút gửi lại tôn trọng **giới hạn tần suất** của Supabase — hiện thông báo chờ khi bị chặn. Dùng cơ chế Auth có sẵn; không thêm luật 5 email/giờ chưa được chốt. Ghi cấu hình hiệu lực và phạm vi quota theo [auth-provider-config](../09-technical/auth-provider-config.md), không đồng nhất mặc định tài liệu với giá trị dự án.
7. Test đọc email từ **hộp thư local** của Supabase (cổng 54324)

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T048-01` | Đăng ký → **email thật xuất hiện** trong hộp thư local |
| `T048-02` | Bấm link → tài khoản kích hoạt, vào được sảnh |
| `T048-03` | ⭐ **Tải lại trang callback** sau khi đã dùng → **không** lỗi, **không** đổi mã lần hai |
| `T048-04` | Dùng lại link đã dùng → báo rõ + cho gửi lại |
| `T048-05` | Link hết hạn theo cấu hình Auth đã ghi nhận → bị từ chối, báo rõ + cho yêu cầu gửi lại; không chỉ tự giả trạng thái lỗi ở UI |
| `T048-06` | Chưa xác minh → **chỉ** thấy màn nhắc, **không** vào được sảnh/phòng |
| `T048-07` | Gửi lại quá nhanh theo giới hạn Auth thực tế → bị chặn, UI báo chờ; ghi quota/phạm vi đã kiểm, không tự gán 5 email/giờ |
| `T048-08` | Sau khi đổi mã, **mã biến khỏi thanh địa chỉ** |
| `T048-09` | Callback mất PKCE verifier/sai state/đã dùng không tạo session; mã xoá URL, return URL ngoài bị từ chối. |
| `T048-10` | Verify xong với đích đã hết hạn/thu hồi hoặc thiếu quyền: không tự join, về sảnh với thông báo; không tiêu thụ lời mời. |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 10 test xanh với hộp thư local **thật**
- [ ] **`T048-03`** chứng minh tải lại không gây lỗi
- [ ] `T048-06` chứng minh trạng thái chặn có hiệu lực
- [ ] `T048-08` chứng minh mã không lưu lại trong lịch sử trình duyệt
- [ ] **Không** dùng tự động xác nhận thay cho email thật

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-048.md` — kèm ảnh chụp email trong hộp thư local và snapshot cấu hình không chứa bí mật theo [auth-provider-config](../09-technical/auth-provider-config.md) §3.

## 9. ⚠ CẠM BẪY
Bật tự động xác nhận để test cho nhanh sẽ làm **toàn bộ luồng email không được kiểm chứng** — và khi lên môi trường thật mới phát hiện hỏng. Đặc tả bắt buộc dùng hộp thư local thật (`DEP-02`).

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** /auth/callback là route PKCE dùng chung, exchange đúng 1 lần, replace-history xoá code; flow verify đi onboarding hoặc đích nội bộ hợp lệ. /verify chỉ resend/logout. Quota/hạn đọc cấu hình Auth thật; không định nghĩa token email riêng.

**Tiền điều kiện cụ thể:** Đăng ký 047 trong browser context A; đọc email qua mailbox local 54324, giữ link thật trong memory test; config snapshot không secret.

**File kiểm thử:** `tests/integration/issue-048.test.ts` · `tests/e2e/issue-048.spec.ts`. Giữ tên `T048-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T048-01` | signUp rồi đọc mailbox thật theo recipient duy nhất; kiểm email confirmation chứa callback allowlist. | Đăng ký → **email thật xuất hiện** trong hộp thư local |
| `T048-02` | Trong chính context A bấm link; kiểm Auth email_confirmed_at và guard cho qua. | Bấm link → tài khoản kích hoạt, vào được sảnh |
| `T048-03` | Bấm link thành công rồi reload 2 lần; đếm network exchange tổng 1, không UI lỗi. | ⭐ **Tải lại trang callback** sau khi đã dùng → **không** lỗi, **không** đổi mã lần hai |
| `T048-04` | Mở lại URL gốc đã dùng trong context không phiên; kiểm lỗi và resend khả dụng. | Dùng lại link đã dùng → báo rõ + cho gửi lại |
| `T048-05` | Dùng link thật có timestamp phát hành vượt otp_expiry qua fixture Auth được hỗ trợ; gọi Auth thật, không sleep hoặc mock response expired. | Link hết hạn theo cấu hình Auth đã ghi nhận → bị từ chối, báo rõ + cho yêu cầu gửi lại; không chỉ tự giả trạng thái lỗi ở UI |
| `T048-06` | Context chưa verify: deep-link sảnh/phòng và back/forward; vẫn verify notice và request protected bị chặn. | Chưa xác minh → **chỉ** thấy màn nhắc, **không** vào được sảnh/phòng |
| `T048-07` | Resend trước max_frequency theo config; đọc phản hồi Auth thật và UI chờ, không bịa thời gian nếu provider không trả. | Gửi lại quá nhanh theo giới hạn Auth thực tế → bị chặn, UI báo chờ; ghi quota/phạm vi đã kiểm, không tự gán 5 email/giờ |
| `T048-08` | Sau callback kiểm location/history hiện tại không code; back không tái exchange. | Sau khi đổi mã, **mã biến khỏi thanh địa chỉ** |
| `T048-09` | Context B không verifier; sai state; returnUrl=https://evil.example và //evil.example: không phiên mới, không chuyển ngoài origin. | Callback mất PKCE verifier/sai state/đã dùng không tạo session; mã xoá URL, return URL ngoài bị từ chối. |
| `T048-10` | Giữ đích nội bộ, hoàn tất verify; ở mốc 048 kiểm giữ/allowlist đích; chạy join thực và không consume vé tại 069/070 sau khi endpoint tồn tại. | Verify xong với đích đã hết hạn/thu hồi hoặc thiếu quyền: không tự join, về sảnh với thông báo; không tiêu thụ lời mời. |

T048-10 tách 048 kiểm callback/allowlist và ISSUE-069 T069-02/12 + ISSUE-070 T070-13 kiểm join/consume thật. Không ghi join đã PASS trong báo cáo 048.

### 10.3 Điểm triển khai cần giữ đúng

```ts
export function isAllowedReturnPath(value: string): boolean {
  return /^\/rooms\/[0-9a-f-]{36}$/i.test(value) || value === '/join';
}
// Token mời nằm storage theo tab, không nằm trong returnPath.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **bỏ cờ callback đã xử lý làm reload exchange lại code**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-048.md`.

```bash
pnpm test:integration -- tests/integration/issue-048.test.ts
pnpm test:e2e -- tests/e2e/issue-048.spec.ts
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

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
