# ISSUE-049 — Đăng nhập bằng username

**Nhóm:** E05 · **Phụ thuộc:** 048 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Đăng nhập bằng **username + mật khẩu** — trong khi Supabase Auth **chỉ nhận email**.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-AUTH.md](../01-requirements/REQ-AUTH.md) §5.2, §7, §9 `BR-AUTH-08` · [../09-technical/tech-stack.md](../09-technical/tech-stack.md) §2.3

## 3. PHẠM VI
**✅ LÀM** — endpoint đổi username sang email rồi đăng nhập
**❌ KHÔNG LÀM** — Google (053) · ghi nhớ đăng nhập (050)

## 4. FILE TẠO
`apps/server/src/auth/login.controller.ts` · `login.service.ts` · `apps/web/src/features/auth/login.tsx`

**Hợp đồng đã chốt:** [auth-provider-config](../09-technical/auth-provider-config.md) §4–6, DEC-040; không coi SDK mặc định là bằng chứng vòng đời/thu hồi.

## 5. CÁC BƯỚC
1. `POST /api/v1/auth/login` nhận `{ username, password, rememberMe }` (rememberMe quyết định mode; server quyết định hạn)
2. **Luồng ở máy chủ**:
   ```
   ① chuẩn hoá username về chữ thường
   ② tra profiles → user_id
   ③ gọi Auth admin lấy email nội bộ theo user_id
   ④ tạo MỘT client Auth MỚI cho MỖI yêu cầu
       (persistSession: false, autoRefreshToken: false)
   ⑤ đăng nhập bằng email + mật khẩu
   ⑥ đăng ký app_session theo AUTH-TIME-01 rồi trả access_token, refresh_token, expires_in
   ```
   ⚠ Bước ④ **bắt buộc** — dùng client dùng chung sẽ khiến **trạng thái đăng nhập lẫn giữa các yêu cầu**
3. **`BR-AUTH-08` — thông báo lỗi**: sai username **và** sai mật khẩu trả **CÙNG MỘT** thông báo `UNAUTHENTICATED` + *"Thông tin đăng nhập không đúng"*
4. **Không bao giờ** trả email trong phản hồi lỗi. **Không** tạo endpoint tra username→email công khai
5. **Không ghi log** nội dung yêu cầu (chứa mật khẩu)
6. Giới hạn tần suất: **5 lần/phút** theo `IP + username đã chuẩn hoá`
7. Trình duyệt nhận token rồi gọi `setSession`, sau đó gọi `/me`

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T049-01` | Đăng nhập đúng → nhận token, gọi `/me` thành công |
| `T049-02` | ⭐ **Sai username và sai mật khẩu trả CÙNG thông báo, CÙNG mã lỗi** |
| `T049-03` | ⭐ Phản hồi lỗi **không chứa** email dưới mọi hình thức |
| `T049-04` | Đăng nhập bằng `ALICE` (chữ HOA) → **thành công** (chuẩn hoá) |
| `T049-05` | Sai 6 lần trong 1 phút → lần 6 bị **chặn theo tần suất** |
| `T049-06` | Confirm email bật: Auth trả email_not_confirmed, không cấp session; UI nhắc xác minh/gửi lại, không dựng token giả |
| `T049-07` | **Log không chứa** mật khẩu — kiểm bằng cách bắt output |
| `T049-08` | ⭐ **10 yêu cầu đăng nhập song song, 10 tài khoản khác nhau → KHÔNG lẫn phiên** |
| `T049-09` | Không có endpoint công khai nào tra được username → email |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 9 test xanh trên Supabase Auth thật
- [ ] **`T049-02`** và **`T049-03`** — không rò thông tin
- [ ] **`T049-08`** chứng minh client Auth tạo mới mỗi yêu cầu
- [ ] `T049-07` chứng minh không log mật khẩu
- [ ] Giới hạn tần suất hoạt động

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-049.md`

## 9. ⚠ CẠM BẪY
Dùng **một client Auth dùng chung** cho mọi yêu cầu là lỗi nghiêm trọng: yêu cầu của người B có thể nhận phiên của người A. `T049-08` chạy 10 đăng nhập song song để bắt đúng lỗi này.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** POST /api/v 1/auth/login nhận strict {username, password, rememberMe}; username→user_id→email chỉ server. Một Auth client mới/request, persistSession=false, autoRefreshToken=false; trả token để setSession, không trả email. Rate 5/phút theo IP+lowercase username. Bootstrap app_session tối thiểu AUTH-TIME-01 phải có ở đây; 050 hoàn thiện lifecycle/storage. GET /me identity tối thiểu do 046 cung cấp, 056 mở rộng sửa profile.

**Tiền điều kiện cụ thể:** 10 Auth users đã verify bằng flow local; unique username, IP fixture được server trust đúng cấu hình; clock server tiêm.

**File kiểm thử:** `tests/integration/issue-049.test.ts` · `tests/e2e/issue-049.spec.ts`. Giữ tên `T049-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T049-01` | POST alice/password đúng; dùng access token gọi /me, đối chiếu Auth user_id. | Đăng nhập đúng → nhận token, gọi `/me` thành công |
| `T049-02` | POST username không có và alice/sai password; deep-equal code/message/status. | ⭐ **Sai username và sai mật khẩu trả CÙNG thông báo, CÙNG mã lỗi** |
| `T049-03` | Thử sai password, username không có, provider error; duyệt toàn body + log, không email hoặc mã hoá email. | ⭐ Phản hồi lỗi **không chứa** email dưới mọi hình thức |
| `T049-04` | POST ALICE/password đúng; /me cùng id như alice. | Đăng nhập bằng `ALICE` (chữ HOA) → **thành công** (chuẩn hoá) |
| `T049-05` | Cùng IP+alice, gửi 6 lần sai ở t0; lần 6 bị giới hạn; ALICE cùng bucket; trước/đúng/sau biên 1 phút ghi kết quả theo limiter. | Sai 6 lần trong 1 phút → lần 6 bị **chặn theo tần suất** |
| `T049-06` | Auth Confirm email bật, user chưa verify; login không token, UI chỉ hướng dẫn verify/resend. | Confirm email bật: Auth trả email_not_confirmed, không cấp session; UI nhắc xác minh/gửi lại, không dựng token giả |
| `T049-07` | Password canary riêng; bắt stdout/stderr/access log khi success/failure; không chứa canary. | **Log không chứa** mật khẩu — kiểm bằng cách bắt output |
| `T049-08` | Barrier 10 requests khác tài khoản; mỗi token gọi /me phải khớp đúng user, không chỉ token khác nhau. | ⭐ **10 yêu cầu đăng nhập song song, 10 tài khoản khác nhau → KHÔNG lẫn phiên** |
| `T049-09` | Duyệt route registry và gọi các đường lookup nghi ngờ; không route công khai trả email từ username. | Không có endpoint công khai nào tra được username → email |



### 10.3 Điểm triển khai cần giữ đúng

```ts
// Khởi tạo bên trong từng request của LoginService, không module singleton.
import { createClient } from '@supabase/supabase-js';
export function loginClient(url: string, publishableKey: string) {
  return createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **dùng chung mutable Auth client giữa 10 login**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-049.md`.

```bash
pnpm test:integration -- tests/integration/issue-049.test.ts
pnpm test:e2e -- tests/e2e/issue-049.spec.ts
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
| `AC-AUTH-02` | [REQ-AUTH](../01-requirements/REQ-AUTH.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
