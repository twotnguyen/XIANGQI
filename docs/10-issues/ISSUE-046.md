# ISSUE-046 — Xác thực JWT + guard

**Nhóm:** E05 Tài khoản · **Phụ thuộc:** 044, 011 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Xác minh token của mọi yêu cầu, và **kiểm phiên còn hiệu lực ở từng thao tác**.

## 2. ĐỌC TRƯỚC
[../05-data-and-realtime/session-state.md](../05-data-and-realtime/session-state.md) §2 · [../01-requirements/REQ-AUTH.md](../01-requirements/REQ-AUTH.md) §9 `BR-AUTH-14`

## 3. PHẠM VI
**✅ LÀM** — xác minh JWT bằng JWKS · guard NestJS · kiểm phiên · kiểm onboarding
**❌ KHÔNG LÀM** — đăng ký/đăng nhập (047, 049)

## 4. FILE TẠO
`apps/server/src/auth/jwt.service.ts` · `auth.guard.ts` · `onboarding.guard.ts` · `current-user.decorator.ts`

**Hợp đồng đã chốt:** [auth-provider-config](../09-technical/auth-provider-config.md) §4–6, DEC-040; không coi SDK mặc định là bằng chứng vòng đời/thu hồi.

## 5. CÁC BƯỚC
1. **Xác minh JWT đầy đủ** bằng JWKS công khai của Supabase — kiểm `issuer` · `audience` · `exp` · `sub`
   ⚠ **Tuyệt đối không** chỉ decode mà không verify chữ ký
2. `AuthGuard` — đọc token từ header `Authorization: Bearer`, gắn `req.user = { id, email, sessionId }`
3. **Kiểm phiên còn hiệu lực ở MỌI thao tác** — gọi `private.is_auth_session_active(sessionId, userId)` và kiểm `app_sessions` theo AUTH-TIME-01 (thiếu record, revoke hoặc đúng hạn đều từ chối)
   Phiên đã thu hồi ⇒ **từ chối ngay**, dù JWT còn hạn (`BR-AUTH-14`)
4. `OnboardingGuard` — chặn nếu `profiles.username IS NULL` ⇒ trả `ONBOARDING_REQUIRED`
5. Guard email chưa xác minh ⇒ trả `EMAIL_UNVERIFIED`
6. **Dịch vụ xác thực lỗi ⇒ trả 503, từ chối an toàn** — **không** cho qua (`BR-AUTH-*`)
7. Route công khai: chỉ `/health` và các route auth

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T046-01` | Token hợp lệ → qua guard, `req.user` đúng |
| `T046-02` | **Không** token → `UNAUTHENTICATED` |
| `T046-03` | Token **sai chữ ký** → từ chối |
| `T046-04` | Token **hết hạn** → từ chối |
| `T046-05` | Token sai `issuer` hoặc `audience` → từ chối |
| `T046-06` | ⭐ **Phiên đã thu hồi nhưng JWT còn hạn → TỪ CHỐI** |
| `T046-07` | Chưa có username → `ONBOARDING_REQUIRED` |
| `T046-08` | Email chưa xác minh → `EMAIL_UNVERIFIED` |
| `T046-09` | Dịch vụ xác thực lỗi → **503**, không cho qua |
| `T046-10` | `/health` vào được **không cần** token |
| `T046-11` | Phiên app hết hạn/thiếu record nhưng JWT hợp lệ ⇒ chặn; không tạo record từ request/refresh. |
| `T046-12` | Guard đang chạy đồng thời logout: thao tác đến sau commit revoke bị chặn; AUTH service lỗi không cho gia hạn. |

> `T046-06` là test bảo mật quan trọng nhất của issue này.

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 12 test xanh trên Supabase Auth thật
- [ ] **`T046-06`** chứng minh kiểm phiên chạy ở **mỗi** thao tác
- [ ] `T046-03` chứng minh **verify chữ ký**, không chỉ decode
- [ ] `T046-09` chứng minh **từ chối an toàn** khi dịch vụ lỗi
- [ ] Token **không** bị ghi vào log

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-046.md`

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| Hàm kiểm phiên **tồn tại nhưng không ai gọi** — code chết (`F-22`) | `T046-06` chứng minh nó **thật sự chạy** |
| Chỉ decode JWT không verify ⇒ ai cũng giả được token | `T046-03` |

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** Nhận Bearer JWT; JwtService.verify(accessToken) trả identity đã verify {id, email, sessionId}. AuthGuard kiểm phiên Auth qua helper 043 và app_sessions; OnboardingGuard chỉ cho ngoại lệ auth tối thiểu và /me khi username=NULL. Trả ApiResult lỗi 011, 401 UNAUTHENTICATED, ONBOARDING_REQUIRED, EMAIL_UNVERIFIED; hạ tầng Auth lỗi trả 503. Không tạo app_session từ guard.

**Tiền điều kiện cụ thể:** Auth local thật + profiles/app_sessions từ 044; A đã xác minh, B chưa onboarding; bắt log stdout/stderr. JWT sai chữ ký là sửa một byte của token thật; không tự dựng credential hợp lệ.

**File kiểm thử:** `tests/integration/issue-046.test.ts`. Giữ tên `T046-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T046-01` | A còn hạn: GET route được bảo vệ; đối chiếu identity với Auth user/session. | Token hợp lệ → qua guard, `req.user` đúng |
| `T046-02` | Không Authorization: gọi cùng route; đếm handler nghiệp vụ chạy bằng 0. | **Không** token → `UNAUTHENTICATED` |
| `T046-03` | Sửa signature JWT A, giữ nguyên payload; gọi route và kiểm handler không chạy. | Token **sai chữ ký** → từ chối |
| `T046-04` | JWT A có exp đã qua theo clock verifier; gọi route tại exp−1 ms/exp/exp+1 ms. | Token **hết hạn** → từ chối |
| `T046-05` | Token do issuer/audience khác ký bằng fixture key; gọi verifier, kiểm cả hai lỗi độc lập. | Token sai `issuer` hoặc `audience` → từ chối |
| `T046-06` | Dùng JWT A lần 1 thành công, revoke Auth session thật, dùng lại cùng token lần 2; handler lần 2 không chạy. | ⭐ **Phiên đã thu hồi nhưng JWT còn hạn → TỪ CHỐI** |
| `T046-07` | Profile B username=NULL: gọi route sản phẩm và /me; chỉ route sản phẩm bị chặn. | Chưa có username → `ONBOARDING_REQUIRED` |
| `T046-08` | Tài khoản chưa confirm: kiểm kết quả Auth không cấp phiên; nếu credential chưa đủ điều kiện có thật thì gửi trực tiếp tới guard, không dựng token giả. | Email chưa xác minh → `EMAIL_UNVERIFIED` |
| `T046-09` | Chặn kết nối helper/Auth có kiểm soát; GET protected trả 503, không tăng idle_expires_at. | Dịch vụ xác thực lỗi → **503**, không cho qua |
| `T046-10` | GET /health không header; service vẫn healthy, không gọi Auth. | `/health` vào được **không cần** token |
| `T046-11` | Xoá app_session rồi thử token; lặp với idle_expires_at=now; kiểm không INSERT app_session. | Phiên app hết hạn/thiếu record nhưng JWT hợp lệ ⇒ chặn; không tạo record từ request/refresh. |
| `T046-12` | Hai connection, barrier trước commit revoke: giải phóng revoke trước lệnh, kiểm lệnh sau commit bị từ chối; đảo thứ tự và ghi điểm tuyến tính. | Guard đang chạy đồng thời logout: thao tác đến sau commit revoke bị chặn; AUTH service lỗi không cho gia hạn. |



### 10.3 Điểm triển khai cần giữ đúng

```ts
// Input cho ca sửa chữ ký; bearer là token thật lấy từ sign-in fixture044.
export function corruptSignature(bearer: string): string {
  const [header, payload, signature] = bearer.split('.');
  if (!header || !payload || !signature) throw new Error('JWT fixture required');
  return `${header}.${payload}.${signature[0] === 'A' ? 'B' : 'A'}${signature.slice(1)}`;
}
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **bỏ truy vấn is_auth_session_active để token đã revoke đi qua**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-046.md`.

```bash
pnpm test:integration -- tests/integration/issue-046.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

**Đóng issue:** mọi test trong ma trận và mọi ô PASS phía trên đạt; không `.only`/`.skip`, không thiếu lane. Các gate tích hợp tương lai được nêu đích danh trong issue phải có chủ sở hữu/bằng chứng riêng, không ghi chúng PASS bằng spy/fixture. Chỉ đổi `TODO` sang `DONE` sau PR đã merge theo WORKFLOW.

**BLOCKED và bàn giao:** thiếu capability dependency hoặc invariant trong 10.1 chưa kiểm được ⇒ `BLOCKED`, ghi đúng test/đầu vào/response sai và commit liên quan. PostgreSQL/socket/browser cần cho ma trận không chạy được ⇒ test phải đỏ; không bỏ qua hoặc thay bằng dữ liệu tự dựng để báo đạt. Bàn giao đường dẫn file thực đã sửa, exported interface/DTO, migrations nếu có, các test ID đạt/chưa đạt, bằng chứng fault injection, và tên issue kế tiếp sử dụng hợp đồng ở 10.1; không bàn giao chỉ một câu “đã xong”.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
