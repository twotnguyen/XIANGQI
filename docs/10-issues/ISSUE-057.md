# ISSUE-057 — Tìm người dùng

**Nhóm:** E06 · **Phụ thuộc:** 056 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Tìm người dùng theo username để kết bạn — **không bao giờ lộ email**.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-PROFILE-FRIENDS.md](../01-requirements/REQ-PROFILE-FRIENDS.md) §5.2, §9 `BR-FRD-04/05`

## 3. PHẠM VI
**✅ LÀM** — `GET /users?prefix=` · **❌ KHÔNG LÀM** — kết bạn (058)

## 4. FILE TẠO
`apps/server/src/modules/profiles/search.service.ts`

## 5. CÁC BƯỚC
1. `GET /api/v1/users?prefix=<chuỗi>`
2. **Ràng buộc**:
   | Mục | Giá trị |
   |---|---|
   | Độ dài tối thiểu | **3 ký tự** — ngắn hơn ⇒ từ chối, nhắc nhập thêm |
   | Số kết quả tối đa | **20** |
   | Trường trả về | **chỉ** `{ id, username, displayName }` |
3. Tìm theo **tiền tố**, **không phân biệt hoa thường** (username đã lưu chữ thường nên chỉ cần chuẩn hoá đầu vào)
4. **Tuyệt đối không** trả email dưới bất kỳ hình thức nào
5. **Không** trả người dùng chưa hoàn tất onboarding (username NULL)
6. Dùng index tiền tố để truy vấn nhanh

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T057-01` | Tìm `min` → trả về các username bắt đầu bằng `min` |
| `T057-02` | ⭐ Tìm 2 ký tự → **TỪ CHỐI**, nhắc nhập thêm |
| `T057-03` | ⭐ **Kết quả KHÔNG chứa email** ở bất kỳ trường nào |
| `T057-04` | Có 50 người khớp → trả **đúng 20** |
| `T057-05` | Tìm `MIN` (chữ HOA) → trả **cùng kết quả** như `min` |
| `T057-06` | Người chưa có username → **không** xuất hiện |
| `T057-07` | Tiền tố không khớp ai → trả **mảng rỗng**, không lỗi |
| `T057-08` | Chưa đăng nhập → `UNAUTHENTICATED` |
| `T057-09` | Truy vấn dùng index — có `EXPLAIN` trong báo cáo |
| `T057-10` | Tiền tố chứa ký tự đặc biệt SQL → **không** gây lỗi, không tiêm được |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 10 test xanh
- [ ] **`T057-03`** kiểm **toàn bộ** phản hồi, không chỉ trường đầu
- [ ] `T057-02` chặn tìm kiếm quá rộng
- [ ] `T057-10` chứng minh an toàn truy vấn
- [ ] Báo cáo có `EXPLAIN`

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-057.md`

## 9. ⚠ CẠM BẪY
Cho tìm với 1 ký tự biến chức năng này thành **công cụ liệt kê toàn bộ người dùng**. Kết hợp với việc lộ email thì thành rò rỉ dữ liệu nghiêm trọng. Hai ràng buộc ở bước 2 phải có cả hai.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** GET /users?prefix= dùng lowercase tiền tố, min 3, max 20 kết quả; projection chỉ id, username, displayName. Prisma parameterized + index prefix; không NULL username/email.

**Tiền điều kiện cụ thể:** Seed 50 username min 000…min 049, amin, NULL onboarding và prefix zzz rỗng; ANALYZE để EXPLAIN có ý nghĩa.

**File kiểm thử:** `tests/integration/issue-057.test.ts` · `tests/unit/issue-057.test.ts`. Giữ tên `T057-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T057-01` | GET prefix=min; tất cả username startsWith(min), amin không xuất hiện. | Tìm `min` → trả về các username bắt đầu bằng `min` |
| `T057-02` | GET prefix=mi rồi min; mi bị validation, min hợp lệ. | ⭐ Tìm 2 ký tự → **TỪ CHỐI**, nhắc nhập thêm |
| `T057-03` | Duyệt toàn bộ response 50 fixture; whitelist keys đúng, không email. | ⭐ **Kết quả KHÔNG chứa email** ở bất kỳ trường nào |
| `T057-04` | GET min trên 50 users; length=20, không trả toàn 50. | Có 50 người khớp → trả **đúng 20** |
| `T057-05` | GET MIN và min; tập id bằng nhau. | Tìm `MIN` (chữ HOA) → trả **cùng kết quả** như `min` |
| `T057-06` | Seed user username=NULL, thử nhiều prefix; không bao giờ xuất hiện. | Người chưa có username → **không** xuất hiện |
| `T057-07` | GET zzz; mảng rỗng thành công. | Tiền tố không khớp ai → trả **mảng rỗng**, không lỗi |
| `T057-08` | GET min không JWT; 401, không dữ liệu. | Chưa đăng nhập → `UNAUTHENTICATED` |
| `T057-09` | EXPLAIN ANALYZE BUFFERS query thật trên data đủ lớn; lưu kế hoạch/index, không SET enable_seqscan=off giả minh chứng. | Truy vấn dùng index — có `EXPLAIN` trong báo cáo |
| `T057-10` | GET prefix có apostrophe, %, _, backslash; không SQL injection, không biến wildcard thành liệt kê rộng. | Tiền tố chứa ký tự đặc biệt SQL → **không** gây lỗi, không tiêm được |



### 10.3 Điểm triển khai cần giữ đúng

```ts
// Giá trị cho LIKE prefix được parameterize; escape wildcard trước nối %.
export const escapeLikePrefix = (value: string) => value.toLowerCase().replace(/[\%_]/g, '\$&') + '%';
// Không ghép giá trị này vào SQL string; truyền qua $1.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **đổi startsWith thành contains hoặc bỏ giới hạn 20**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-057.md`.

```bash
pnpm test:integration -- tests/integration/issue-057.test.ts
pnpm test:unit -- tests/unit/issue-057.test.ts
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

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-FRD-09` | [REQ-PROFILE-FRIENDS](../01-requirements/REQ-PROFILE-FRIENDS.md) | LOCAL |
| `AC-FRD-10` | [REQ-PROFILE-FRIENDS](../01-requirements/REQ-PROFILE-FRIENDS.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
