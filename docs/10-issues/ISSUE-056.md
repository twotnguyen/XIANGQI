# ISSUE-056 — Hồ sơ + sửa tên hiển thị

**Nhóm:** E06 Hồ sơ & bạn bè · **Phụ thuộc:** 055 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Xem và sửa hồ sơ của chính mình — username **bất biến**, tên hiển thị **sửa được**.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-PROFILE-FRIENDS.md](../01-requirements/REQ-PROFILE-FRIENDS.md) §5.1, §9 · [../04-business-rules/permissions.md](../04-business-rules/permissions.md) §2

## 3. PHẠM VI
**✅ LÀM** — `GET /me` · `PATCH /me` · màn cài đặt hồ sơ
**❌ KHÔNG LÀM** — tìm người dùng (057)

## 4. FILE TẠO
`apps/server/src/modules/profiles/` · `apps/web/src/features/profile/SettingsPage.tsx`

## 5. CÁC BƯỚC
1. `GET /api/v1/me` trả `{ id, username, displayName, onboardingRequired }`
   ⚠ **Không** trả email — kể cả email của chính mình cũng không cần cho chức năng nào
2. `PATCH /api/v1/me` nhận **chỉ** `{ displayName }`
   - Ràng buộc **1–40 ký tự**, cho phép tiếng Việt có dấu
   - Thừa trường khác ⇒ **từ chối** (schema `.strict()`)
3. **Không** có endpoint đổi username, đổi email, hay xoá tài khoản (`BR-AUTH-15`)
4. Màn cài đặt: username hiện **chỉ đọc** kèm giải thích *"Tên đăng nhập không thể thay đổi"*
5. Dùng Prisma cho các thao tác này (`TECH-07` — không phải đường lệnh ván)

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T056-01` | `GET /me` trả đúng hồ sơ của người đang đăng nhập |
| `T056-02` | ⭐ `GET /me` **không** chứa trường email |
| `T056-03` | Sửa tên hiển thị thành công, đọc lại thấy giá trị mới |
| `T056-04` | Tên 0 và 41 ký tự → **từ chối**; 1 và 40 → nhận |
| `T056-05` | Tên có dấu tiếng Việt → lưu và hiện **nguyên vẹn** |
| `T056-06` | ⭐ Gửi kèm `username` vào `PATCH /me` → **BỊ TỪ CHỐI** |
| `T056-07` | ⭐ Gửi kèm `email` → **BỊ TỪ CHỐI** |
| `T056-08` | **Không** có route nào đổi được username |
| `T056-09` | Chưa đăng nhập → `UNAUTHENTICATED` |
| `T056-10` | Tên chứa mã HTML → hiện **dạng chữ**, không thực thi |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 10 test xanh
- [ ] **`T056-06`** và **`T056-07`** chứng minh `.strict()` chặn
- [ ] **`T056-02`** không rò email
- [ ] `T056-08` chứng minh username bất biến ở tầng API
- [ ] `T056-10` chứng minh an toàn nội dung

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-056.md`

## 9. ⚠ CẠM BẪY
Nếu `PATCH /me` nhận cả `username`, người dùng đổi được username ⇒ phá `BR-AUTH-03` và làm hỏng mọi tham chiếu. Schema `.strict()` ở issue 011 là chốt chặn — `T056-06` kiểm nó **thật sự chạy**.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** GET /api/v 1/me → {id, username, displayName, onboardingRequired}; PATCH nhận duy nhất displayName 1–40 ký tự, strict. Prisma select tường minh, user_id từ actor; UI username readonly, render text an toàn.

**Tiền điều kiện cụ thể:** A/B verified, tên Việt Nguyễn Văn An và HTML canary; API thật + SettingsPage thực.

**File kiểm thử:** `tests/integration/issue-056.test.ts` · `tests/e2e/issue-056.spec.ts`. Giữ tên `T056-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T056-01` | A/B GET /me riêng; so id và tên đúng session, không nhận của nhau. | `GET /me` trả đúng hồ sơ của người đang đăng nhập |
| `T056-02` | Serialize toàn response /me của A; không email kể cả nested. | ⭐ `GET /me` **không** chứa trường email |
| `T056-03` | PATCH displayName=Nguyễn An rồi GET và reload settings; giá trị mới giữ. | Sửa tên hiển thị thành công, đọc lại thấy giá trị mới |
| `T056-04` | PATCH tên 0/1/40/41 ký tự; chỉ 1/40 thành công, invalid không ghi DB. | Tên 0 và 41 ký tự → **từ chối**; 1 và 40 → nhận |
| `T056-05` | PATCH Nguyễn Thị Ánh; query DB và DOM text nguyên vẹn. | Tên có dấu tiếng Việt → lưu và hiện **nguyên vẹn** |
| `T056-06` | PATCH {displayName, username:bob}; 400, username và tên cũ không đổi. | ⭐ Gửi kèm `username` vào `PATCH /me` → **BỊ TỪ CHỐI** |
| `T056-07` | PATCH {displayName, email}; 400, email Auth không đổi. | ⭐ Gửi kèm `email` → **BỊ TỪ CHỐI** |
| `T056-08` | Duyệt route registry + raw requests sửa username qua /me; không route cho phép. | **Không** có route nào đổi được username |
| `T056-09` | GET/PATCH không Authorization; 401 và DB không đổi. | Chưa đăng nhập → `UNAUTHENTICATED` |
| `T056-10` | Tên chứa <img src=x onerror=...>; DOM text có nguyên chuỗi, không img/script hoặc side effect. | Tên chứa mã HTML → hiện **dạng chữ**, không thực thi |



### 10.3 Điểm triển khai cần giữ đúng

```ts
import { z } from 'zod';
export const UpdateProfileInput = z.object({ displayName: z.string().min(1).max(40) }).strict();
// UpdateProfileInput.safeParse({displayName:'An',username:'bob'}).success === false
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **bỏ strict để PATCH username được chấp nhận**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-056.md`.

```bash
pnpm test:integration -- tests/integration/issue-056.test.ts
pnpm test:e2e -- tests/e2e/issue-056.spec.ts
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
| `AC-FRD-14` | [REQ-PROFILE-FRIENDS](../01-requirements/REQ-PROFILE-FRIENDS.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
