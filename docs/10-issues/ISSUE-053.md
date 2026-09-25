# ISSUE-053 — Google OAuth + callback

**Nhóm:** E05 · **Phụ thuộc:** 049, 052, 055 · **Trạng thái:** TODO
**⚠ Có thể `BLOCKED_EXTERNAL`** — cần Google OAuth client. Xem [EXTERNAL-SETUP.md](EXTERNAL-SETUP.md) §1

## 1. MỤC TIÊU
Đăng nhập bằng Google, và **liên kết đúng tài khoản** khi trùng email đã xác minh.

## 2. ĐỌC TRƯỚC
[../02-flows/FLOW-AUTH.md](../02-flows/FLOW-AUTH.md) §4 · [../01-requirements/REQ-AUTH.md](../01-requirements/REQ-AUTH.md) §5.3, §9 `BR-AUTH-16`

## 3. PHẠM VI
**✅ LÀM** — nút Google · trang quay về · liên kết danh tính
**❌ KHÔNG LÀM** — chọn username (054)

## 4. FILE SỬA
`apps/web/src/features/auth/login.tsx` · `auth-callback.tsx` · `supabase/config.toml`

**Hợp đồng đã chốt:** [auth-provider-config](../09-technical/auth-provider-config.md) §4–6, DEC-040; không coi SDK mặc định là bằng chứng vòng đời/thu hồi.

## 5. CÁC BƯỚC
1. Cấu hình nhà cung cấp Google trong Supabase; khai **chính xác** địa chỉ quay về cho cả local và môi trường thật
2. Nút **"Đăng nhập bằng Google"** gọi đăng nhập qua nhà cung cấp, quay về `/auth/callback`
3. Trang quay về xử lý **chung** cho cả xác minh email và Google:
   ```
   ① đổi mã lấy phiên ĐÚNG MỘT LẦN
   ② xoá mã khỏi thanh địa chỉ
   ③ chưa có username → màn chọn username
   ④ đủ điều kiện     → sảnh
   ⑤ có đích đã ghi nhớ (link phòng) → chuyển tới đó
   ```
4. **`BR-AUTH-16`** — Google và tài khoản thường **cùng email đã xác minh** ⇒ **cùng một tài khoản**. Dùng cơ chế liên kết danh tính sẵn có, **không** tự ghép theo email do trình duyệt gửi lên
5. Tài khoản **chỉ có Google** không bắt buộc có mật khẩu. Giao diện ghi rõ *"Đăng nhập bằng Google"* nếu chưa từng đặt mật khẩu
6. Người dùng huỷ ở màn Google → quay về màn đăng nhập, **không** lỗi nặng
7. Unit kiểm UI/điều hướng có thể dùng giả lập gắn nhãn; mọi khẳng định identity/linking/recovery phải Supabase + Google thật, thiếu OAuth ⇒ BLOCKED_EXTERNAL. Không gọi fixture là bằng chứng nhà cung cấp

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T053-01` | Google lần đầu → chuyển tới **màn chọn username** |
| `T053-02` | Google lần hai → **giữ nguyên hồ sơ**, vào thẳng sảnh |
| `T053-03` | ⭐ Google thật + Supabase thật với email **đã có tài khoản thường đã xác minh** → **CÙNG `user_id`** |
| `T053-04` | Huỷ ở màn Google → quay về đăng nhập, không lỗi |
| `T053-05` | ⭐ **Tải lại** trang quay về → **không** đổi mã lần hai |
| `T053-06` | Mã quay về đã dùng → báo rõ |
| `T053-07` | Có đích đã ghi nhớ → sau khi vào thì **tự chuyển tới phòng đó** |
| `T053-08` | Tài khoản chỉ-Google → giao diện ghi rõ, **không** ép đặt mật khẩu |
| `T053-09` | **M** Thử với Google **thật** — cổng thủ công riêng |
| `T053-10` | Google trùng email chưa xác minh: canonical user_id do Auth, credential/confirmation token cũ không chiếm account; profile chưa xác minh phải chọn username; bất kỳ sai lệch ⇒ chặn onboarding. |
| `T053-11` | Giữ nguyên profile đã xác minh; email client giả không merge; callback lặp không đặt lại profile_verified_at/username. |
| `T053-12` | Callback đích mời hết hạn/thu hồi/phòng đầy hoặc session cũ hết hạn: theo BR-AUTH-22; chỉ code exchange mới hợp lệ tạo session mới. |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Tất cả test bắt buộc xanh; unit UI gắn nhãn riêng, T053-03/09/10/11 cần nhà cung cấp thật
- [ ] **`T053-03`** chứng minh cùng `user_id`
- [ ] `T053-05` chứng minh tải lại an toàn
- [ ] `T053-09` **đạt** ⇒ `DONE` · **chưa có OAuth client** ⇒ `BLOCKED_EXTERNAL`
- [ ] Khoá bí mật Google **chỉ** nằm ở cấu hình Supabase, **không** trong mã nguồn

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-053.md` — ghi rõ test nào dùng giả lập, test nào dùng Google thật.

## 9. ⚠ CẠM BẪY
**Không** tự ghép tài khoản theo email do trình duyệt gửi lên — kẻ tấn công khai email của người khác là chiếm được tài khoản. Phải dùng cơ chế liên kết danh tính của nhà cung cấp, chỉ với email **đã xác minh**.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** OAuth do Supabase quản lý automatic linking; callback 048 dùng PKCE/state/allowlist. Dùng canonical user_id, profile_verified_at server-only. Profile đã verify giữ; profile chưa verify reset metadata không tin cậy và onboarding 054. Không tự merge email.

**Tiền điều kiện cụ thể:** Google test client/redirect URI thật theo EXTERNAL-SETUP, tài khoản Google thật và email thường verified/unverified; ghi provider/version mà không token.

**File kiểm thử:** `tests/integration/issue-053.test.ts` · `tests/e2e/issue-053.spec.ts`. Giữ tên `T053-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T053-01` | Google lần đầu, Auth callback tạo canonical account; UI bắt chọn username. | Google lần đầu → chuyển tới **màn chọn username** |
| `T053-02` | Cùng Google lần 2; id/username/display_name/profile_verified_at giữ nguyên. | Google lần hai → **giữ nguyên hồ sơ**, vào thẳng sảnh |
| `T053-03` | Email thường đã verify trùng Google; login Google, query đúng 1 canonical user_id và không profile thứ 2. | ⭐ Google thật + Supabase thật với email **đã có tài khoản thường đã xác minh** → **CÙNG `user_id`** |
| `T053-04` | Bấm huỷ consent Google; callback error về login, không tạo app_session. | Huỷ ở màn Google → quay về đăng nhập, không lỗi |
| `T053-05` | Reload callback thành công; network exchange đúng 1 lần. | ⭐ **Tải lại** trang quay về → **không** đổi mã lần hai |
| `T053-06` | Mở code đã dùng trong context sạch; báo link không dùng được, không session mới. | Mã quay về đã dùng → báo rõ |
| `T053-07` | Giữ returnPath theo tab; sau auth/onboarding điều hướng nội bộ, join thực 069/070. | Có đích đã ghi nhớ → sau khi vào thì **tự chuyển tới phòng đó** |
| `T053-08` | Google-only mở cài đặt/login; không ép đặt password, recovery tự nguyện vẫn có. | Tài khoản chỉ-Google → giao diện ghi rõ, **không** ép đặt mật khẩu |
| `T053-09` | Chạy consent thật thủ công, lưu bước và ảnh đã che dữ liệu; thiếu credentials thì BLOCKED_EXTERNAL. | **M** Thử với Google **thật** — cổng thủ công riêng |
| `T053-10` | Email chưa verify có password/token confirmation cũ; Google link; thử cả 2 credential cũ, bất kỳ còn dùng được thì chặn onboarding và báo integration failure. | Google trùng email chưa xác minh: canonical user_id do Auth, credential/confirmation token cũ không chiếm account; profile chưa xác minh phải chọn username; bất kỳ sai lệch ⇒ chặn onboarding. |
| `T053-11` | Giả email/user_metadata từ browser, callback replay; không merge hoặc thay profile đã verify. | Giữ nguyên profile đã xác minh; email client giả không merge; callback lặp không đặt lại profile_verified_at/username. |
| `T053-12` | Đích expired/revoked/full và session cũ hết hạn: auth mới chỉ từ code exchange thật; join lỗi tách biệt, không consume vé. | Callback đích mời hết hạn/thu hồi/phòng đầy hoặc session cũ hết hạn: theo BR-AUTH-22; chỉ code exchange mới hợp lệ tạo session mới. |



### 10.3 Điểm triển khai cần giữ đúng

```ts
// Không lấy danh tính từ user_metadata/email client.
export function canonicalIdentity(user: { id: string; email_confirmed_at?: string }) {
  return { userId: user.id, emailConfirmed: Boolean(user.email_confirmed_at) };
}
// user phải là kết quả Auth đã xác minh ở server, không phải request body.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **tự link theo email client hoặc giữ username chưa xác minh khi collision**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-053.md`.

```bash
pnpm test:integration -- tests/integration/issue-053.test.ts
pnpm test:e2e -- tests/e2e/issue-053.spec.ts
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
| `AC-AUTH-05` | [REQ-AUTH](../01-requirements/REQ-AUTH.md) | EXTERNAL |
| `AC-AUTH-06` | [REQ-AUTH](../01-requirements/REQ-AUTH.md) | EXTERNAL |
| `AC-AUTH-20` | [REQ-AUTH](../01-requirements/REQ-AUTH.md) | EXTERNAL |
| `AC-AUTH-21` | [REQ-AUTH](../01-requirements/REQ-AUTH.md) | EXTERNAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
