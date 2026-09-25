# ISSUE-054 — Onboarding chọn username

**Nhóm:** E05 · **Phụ thuộc:** 049 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Người đăng nhập Google lần đầu **bắt buộc** chọn username trước khi làm bất cứ việc gì.

## 2. ĐỌC TRƯỚC
[../00-overview/actors.md](../00-overview/actors.md) §ACT-02 · [../01-requirements/REQ-AUTH.md](../01-requirements/REQ-AUTH.md) §6 ALT-2

## 3. PHẠM VI
**✅ LÀM** — màn chọn username · endpoint hoàn tất hồ sơ
**❌ KHÔNG LÀM** — sửa tên hiển thị sau này (056)

## 4. FILE TẠO
`apps/web/src/features/auth/onboarding.tsx` · `apps/server/src/auth/complete-profile.controller.ts`

**Hợp đồng đã chốt:** [auth-provider-config](../09-technical/auth-provider-config.md) §4–6, DEC-040; không coi SDK mặc định là bằng chứng vòng đời/thu hồi.

## 5. CÁC BƯỚC
1. `POST /api/v1/auth/complete-profile` nhận `{ username, displayName }`
2. **Khoá hàng hồ sơ** rồi mới ghi — chỉ đặt username **một lần**:
   ```sql
   SELECT ... FROM profiles WHERE user_id = $1 FOR UPDATE;
   -- username đã có ⇒ từ chối
   ```
3. **Trạng thái chặn**: chưa có username ⇒ **mọi** route khác trả `ONBOARDING_REQUIRED` (guard ở issue 046); ngoại lệ tối thiểu /me, complete-profile, logout và auth recovery/session cần thiết, không cho route sản phẩm
4. Màn chọn username **không có** đường thoát nào ngoài chọn xong hoặc đăng xuất
5. Username trùng ⇒ báo rõ, cho chọn lại
6. Chuẩn hoá về chữ thường trước khi ghi
7. Xong ⇒ vào sảnh, hoặc tới **đích đã ghi nhớ** nếu có

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T054-01` | Chưa có username → mọi route sản phẩm bị chặn; /me, complete-profile, logout và auth tối thiểu vẫn dùng được |
| `T054-02` | Chọn username hợp lệ → hồ sơ cập nhật, vào được sảnh |
| `T054-03` | ⭐ **Gọi hoàn tất hồ sơ LẦN HAI → BỊ TỪ CHỐI** (username bất biến) |
| `T054-04` | Username trùng → báo rõ, cho chọn lại |
| `T054-05` | ⭐ **Hai người cùng chọn `alice` đồng thời → ĐÚNG MỘT thành công** |
| `T054-06` | Username sai định dạng → từ chối |
| `T054-07` | `ALICE` được chuẩn hoá thành `alice` |
| `T054-08` | Có đích đã ghi nhớ → sau onboarding **tự chuyển tới phòng** |
| `T054-09` | Màn onboarding **không** có đường vào sảnh/phòng |
| `T054-10` | Onboarding xong kiểm lại đích theo BR-AUTH-22; lời mời hết hạn không tiêu thụ, về sảnh với thông báo. |
| `T054-11` | profile_verified_at chỉ server ghi sau bằng chứng Auth; Google collision với hồ sơ chưa xác minh không tin username/metadata cũ. |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 11 test xanh
- [ ] **`T054-03`** chứng minh username bất biến
- [ ] **`T054-05`** chạy với **rào đồng bộ**
- [ ] `T054-01` chứng minh trạng thái chặn có hiệu lực toàn hệ thống

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-054.md`

## 9. ⚠ CẠM BẪY
Không khoá hàng khi đặt username ⇒ hai yêu cầu song song của **cùng một người** có thể ghi hai lần, hoặc hai người khác nhau giành cùng một username. `T054-05` dùng rào đồng bộ để bắt lỗi này.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** POST /auth/complete-profile strict {username, displayName}; lock profile, username chỉ đặt khi NULL; lowercase/unique do 035. profile_verified_at chỉ server đặt sau bằng chứng Auth. /me và auth tối thiểu dùng được trước onboarding.

**Tiền điều kiện cụ thể:** Hai Auth users verified chưa username bằng factory 044; request thật bypass UI; callback Google collision kiểm bằng 053, không giả provider.

**File kiểm thử:** `tests/integration/issue-054.test.ts` · `tests/e2e/issue-054.spec.ts`. Giữ tên `T054-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T054-01` | Profile NULL username: gọi mọi route sản phẩm đã tồn tại và allowlist /me/complete/logout; ghi route registry dùng test. | Chưa có username → mọi route sản phẩm bị chặn; /me, complete-profile, logout và auth tối thiểu vẫn dùng được |
| `T054-02` | POST alice/displayName hợp lệ; GET /me và protected route thành công. | Chọn username hợp lệ → hồ sơ cập nhật, vào được sảnh |
| `T054-03` | POST alice rồi bob cùng account; lần 2 bị từ chối, DB vẫn alice. | ⭐ **Gọi hoàn tất hồ sơ LẦN HAI → BỊ TỪ CHỐI** (username bất biến) |
| `T054-04` | Seed alice; account khác chọn alice rồi bob; lỗi trùng không làm hỏng profile, bob thành công. | Username trùng → báo rõ, cho chọn lại |
| `T054-05` | Hai users cùng alice/Alice qua 2 connection/barrier; đúng 1 success, 1 unique violation mapped, không 500. | ⭐ **Hai người cùng chọn `alice` đồng thời → ĐÚNG MỘT thành công** |
| `T054-06` | Username 2/3/24/25 ký tự, dấu cách, dấu gạch ngang; kiểm schema và DB. | Username sai định dạng → từ chối |
| `T054-07` | POST ALICE; query username=alice. | `ALICE` được chuẩn hoá thành `alice` |
| `T054-08` | ReturnPath phòng nội bộ giữ qua onboarding; điều hướng đúng; join thực 069 là gate sau. | Có đích đã ghi nhớ → sau onboarding **tự chuyển tới phòng** |
| `T054-09` | Dùng Tab/back/deep link trên onboarding; không route sản phẩm bypass guard. | Màn onboarding **không** có đường vào sảnh/phòng |
| `T054-10` | Đích invite expire trong khi onboarding; giữ thông báo auth thành công nhưng join lỗi; accept thực 069/070 không consume. | Onboarding xong kiểm lại đích theo BR-AUTH-22; lời mời hết hạn không tiêu thụ, về sảnh với thông báo. |
| `T054-11` | Gửi profile_verified_at/user_metadata từ client; strict từ chối; trường timestamp chỉ ghi sau server verified evidence. | profile_verified_at chỉ server ghi sau bằng chứng Auth; Google collision với hồ sơ chưa xác minh không tin username/metadata cũ. |



### 10.3 Điểm triển khai cần giữ đúng

```sql
-- Trong transaction, $1 = actor từ JWT; $2/$3 là username/displayName đã validate.
SELECT user_id, username FROM profiles WHERE user_id = $1 FOR UPDATE;
UPDATE profiles SET username = lower($2), display_name = $3
WHERE user_id = $1 AND username IS NULL
RETURNING user_id, username, display_name;
-- rowCount=0: từ chối hoàn tất lần hai; không upsert đè username.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **bỏ WHERE username IS NULL hoặc lock làm lần 2 thay username**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-054.md`.

```bash
pnpm test:integration -- tests/integration/issue-054.test.ts
pnpm test:e2e -- tests/e2e/issue-054.spec.ts
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

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
