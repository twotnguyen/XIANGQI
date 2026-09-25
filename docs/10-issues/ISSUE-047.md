# ISSUE-047 — Đăng ký username + email

**Nhóm:** E05 · **Phụ thuộc:** 046 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Đăng ký tài khoản bằng **username + email + mật khẩu**, có xác minh email.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-AUTH.md](../01-requirements/REQ-AUTH.md) §5.1, §9 · [../02-flows/FLOW-AUTH.md](../02-flows/FLOW-AUTH.md) §2

## 3. PHẠM VI
**✅ LÀM** — luồng đăng ký phía trình duyệt · tạo profile qua trigger
**❌ KHÔNG LÀM** — xác minh email (048) · đăng nhập (049)

## 4. FILE TẠO
`apps/web/src/features/auth/register.ts` · `apps/server/src/auth/username.service.ts`

**Hợp đồng đã chốt:** [auth-provider-config](../09-technical/auth-provider-config.md) §4–6, DEC-040; không coi SDK mặc định là bằng chứng vòng đời/thu hồi.

## 5. CÁC BƯỚC
1. **Đăng ký đi THẲNG từ trình duyệt tới Supabase Auth** — không qua máy chủ trung gian.
   Lý do: giữ mã xác thực PKCE **đúng trong trình duyệt đó**
2. Gọi `signUp` với metadata `signup_username` và `signup_display_name`, kèm địa chỉ quay về
3. **Chuẩn hoá username về chữ thường** trước khi gửi
4. Trigger ở issue 035 tạo `profiles`
5. Username trùng trả “Tên đăng nhập đã được sử dụng” theo REQ-AUTH; không trả email/thông tin hồ sơ
6. Kiểm tra phía trình duyệt: username `^[a-z0-9_]{3,24}$` · email hợp lệ · mật khẩu 10–128
   ⚠ Kiểm ở trình duyệt **chỉ để trải nghiệm** — ràng buộc thật ở tầng dữ liệu (issue 035)

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T047-01` | Đăng ký hợp lệ → tài khoản tạo được, `profiles` **tự có** |
| `T047-02` | ⭐ **Hai người cùng đăng ký `alice` và `Alice` → ĐÚNG MỘT thành công** |
| `T047-03` | Username sai định dạng → từ chối, nêu rõ quy tắc |
| `T047-04` | Mật khẩu 9 ký tự → từ chối; 10 ký tự → nhận |
| `T047-05` | Email sai định dạng → từ chối |
| `T047-06` | Username trùng → “Tên đăng nhập đã được sử dụng”, không kèm email/hồ sơ |
| `T047-07` | Đăng ký xong nhưng chưa xác minh → **không vào được** phòng |
| `T047-08` | `display_name` mặc định bằng username nếu không nhập |
| `T047-09` | Metadata **không** chứa vai trò hay quyền |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 9 test xanh trên Supabase Auth thật
- [ ] **`T047-02`** chạy với **rào đồng bộ**, chứng minh đúng một thành công
- [ ] `T047-07` chứng minh chưa xác minh bị chặn
- [ ] Đăng ký đi **thẳng** từ trình duyệt, **không** qua máy chủ trung gian
- [ ] Mật khẩu **không** xuất hiện trong log

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-047.md`

## 9. ⚠ CẠM BẪY
Xây một endpoint đăng ký ở máy chủ rồi đổi mã PKCE ở nơi khác sẽ làm **hỏng luồng xác minh** — mã xác thực phải nằm **đúng trình duyệt** đã khởi tạo. Đặc tả `REQ-AUTH` §5.1 yêu cầu đi thẳng.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** Browser gọi Supabase signUp trực tiếp với email, password, options.data={signup_username, signup_display_name}, callback allowlist; trigger 035 tạo profile trong transaction Auth. Username lowercase 3–24, mật khẩu 10–128. Không proxy signUp qua backend.

**Tiền điều kiện cụ thể:** Hai browser context độc lập có PKCE riêng, email local khác nhau, schema 035. Thu request body đã che mật khẩu trong báo cáo.

**File kiểm thử:** `tests/integration/issue-047.test.ts` · `tests/e2e/issue-047.spec.ts`. Giữ tên `T047-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T047-01` | signUp alice + mailbox local; query Auth user và profile theo cùng user_id, không gọi tạo profile thủ công. | Đăng ký hợp lệ → tài khoản tạo được, `profiles` **tự có** |
| `T047-02` | Hai email khác, username alice/Alice, barrier trước hai signUp; query đúng 1 profile username=alice và không orphan account sai trigger. | ⭐ **Hai người cùng đăng ký `alice` và `Alice` → ĐÚNG MỘT thành công** |
| `T047-03` | Dữ liệu ab, 25 ký tự, dấu cách, dấu gạch ngang; bypass UI gọi signUp trực tiếp, ghi lỗi DB/Auth và không profile. | Username sai định dạng → từ chối, nêu rõ quy tắc |
| `T047-04` | Mật khẩu 9/10/128/129 ký tự; kiểm cả UI và request trực tiếp Auth theo policy đã cấu hình. | Mật khẩu 9 ký tự → từ chối; 10 ký tự → nhận |
| `T047-05` | Email thiếu@ và domain sai cú pháp; submit rồi kiểm UI chặn và Auth từ chối nếu bypass. | Email sai định dạng → từ chối |
| `T047-06` | Seed alice đã có; đăng ký email khác alice; so sánh response không chứa email/profile của alice. | Username trùng → “Tên đăng nhập đã được sử dụng”, không kèm email/hồ sơ |
| `T047-07` | Sau signUp chưa bấm email: cố mở route protected; bị chặn mà không cần room service 061. | Đăng ký xong nhưng chưa xác minh → **không vào được** phòng |
| `T047-08` | Không nhập displayName; query profile.display_name=alice sau trigger. | `display_name` mặc định bằng username nếu không nhập |
| `T047-09` | Chụp signup metadata; chỉ các trường signup cho phép; chèn role/permissions không được tạo quyền. | Metadata **không** chứa vai trò hay quyền |



### 10.3 Điểm triển khai cần giữ đúng

```ts
export const signupMetadata = (username: string, displayName?: string) => ({
  signup_username: username.toLowerCase(),
  signup_display_name: displayName ?? username.toLowerCase(),
});
// Ví dụ đầu vào: signupMetadata('Alice')
// Kết quả: { signup_username: 'alice', signup_display_name: 'alice' }
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **bỏ lowercase/unique username để race tạo hai profile**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-047.md`.

```bash
pnpm test:integration -- tests/integration/issue-047.test.ts
pnpm test:e2e -- tests/e2e/issue-047.spec.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
pnpm test:e2e
```

**Đóng issue:** mọi test trong ma trận và mọi ô PASS phía trên đạt; không `.only`/`.skip`, không thiếu lane. Các gate tích hợp tương lai được nêu đích danh trong issue phải có chủ sở hữu/bằng chứng riêng, không ghi chúng PASS bằng spy/fixture. Chỉ đổi `TODO` sang `DONE` sau PR đã merge theo WORKFLOW.

**BLOCKED và bàn giao:** thiếu capability dependency hoặc invariant trong 10.1 chưa kiểm được ⇒ `BLOCKED`, ghi đúng test/đầu vào/response sai và commit liên quan. PostgreSQL/socket/browser cần cho ma trận không chạy được ⇒ test phải đỏ; không bỏ qua hoặc thay bằng dữ liệu tự dựng để báo đạt. Bàn giao đường dẫn file thực đã sửa, exported interface/DTO, migrations nếu có, các test ID đạt/chưa đạt, bằng chứng fault injection, và tên issue kế tiếp sử dụng hợp đồng ở 10.1; không bàn giao chỉ một câu “đã xong”.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-AUTH-03` | [REQ-AUTH](../01-requirements/REQ-AUTH.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
