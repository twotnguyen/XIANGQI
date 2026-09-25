# ISSUE-058 — Kết bạn: gửi · chấp nhận · từ chối · huỷ

**Nhóm:** E06 · **Phụ thuộc:** 057 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Vòng đời quan hệ bạn bè — **một cặp người dùng chỉ có đúng một quan hệ**.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-PROFILE-FRIENDS.md](../01-requirements/REQ-PROFILE-FRIENDS.md) §5.3–5.6, §9 · [../05-data-and-realtime/state-machines.md](../05-data-and-realtime/state-machines.md) §10

## 3. PHẠM VI
**✅ LÀM** — 5 endpoint + luật chống trùng · **❌ KHÔNG LÀM** — trạng thái online (059)

## 4. FILE TẠO
`apps/server/src/modules/friends/`

## 5. CÁC BƯỚC
1. Năm endpoint:
   | Endpoint | Ai gọi được |
   |---|---|
   | `GET /friends` | chính mình |
   | `POST /friends/requests` | bất kỳ |
   | `POST /friends/requests/:id/respond` | **chỉ người nhận** |
   | `DELETE /friends/requests/:id` | **chỉ người gửi** |
   | `DELETE /friends/:userId` | **chỉ người trong cặp** |
2. **Luôn sắp xếp hai id** trước khi ghi — `user_a < user_b` (ràng buộc ở issue 036)
3. **Gửi chéo (`BR-FRD-02`)**: A đã gửi cho B, giờ B bấm kết bạn với A ⇒ **không tạo hàng thứ hai**. Trả về quan hệ sẵn có để B **chấp nhận**. **Không** tự động thành bạn
4. Không tự kết bạn với chính mình
5. Huỷ kết bạn có hiệu lực **hai chiều** ngay
6. Dùng Prisma (`TECH-07`)

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T058-01` | Gửi → chấp nhận → **cả hai** thấy nhau trong danh sách bạn |
| `T058-02` | Gửi → từ chối → **không** thành bạn, lời mời biến mất |
| `T058-03` | ⭐ **Gửi chéo → ĐÚNG MỘT quan hệ, KHÔNG tự thành bạn** |
| `T058-04` | ⭐ **A và B gửi ĐỒNG THỜI → ĐÚNG MỘT quan hệ** (rào đồng bộ) |
| `T058-05` | Tự kết bạn với chính mình → **từ chối** |
| `T058-06` | ⭐ **Người thứ ba** gọi chấp nhận → **FORBIDDEN** |
| `T058-07` | ⭐ **Người nhận** gọi huỷ lời mời đã gửi → **FORBIDDEN** |
| `T058-08` | Huỷ kết bạn → **cả hai** mất khỏi danh sách |
| `T058-09` | Gửi trùng khi đang chờ → **không** tạo hàng thứ hai |
| `T058-10` | Kết bạn lại sau khi huỷ → **được phép** |
| `T058-11` | `GET /friends` chỉ trả bạn của **chính mình** |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 11 test xanh trên PostgreSQL thật
- [ ] **`T058-04`** chạy với **rào đồng bộ**
- [ ] **`T058-06`** và **`T058-07`** chứng minh kiểm đúng actor
- [ ] `T058-03` chứng minh gửi chéo không tự thành bạn

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-058.md`

## 9. ⚠ CẠM BẪY
Gửi chéo mà **tự động thành bạn** là lỗi nghiệp vụ: B chưa hề đồng ý. `BR-FRD-02` yêu cầu vẫn phải có người bấm chấp nhận. `T058-03` kiểm đúng điểm này.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** Friend service năm endpoint ở§5; cặp chuẩn user_a<user_b, requester lưu riêng; respond chỉ recipient, cancel chỉ sender. Prisma transaction+unique 036 giải quyết race; gửi chéo trả pending hiện có, không auto accept.

**Tiền điều kiện cụ thể:** A/B/C verified; DB friendship 036 sạch; 2 connection/barrier cho cross-send.

**File kiểm thử:** `tests/integration/issue-058.test.ts`. Giữ tên `T058-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T058-01` | A gửi B; B accept; GET friends của A/B đều có nhau, C không có. | Gửi → chấp nhận → **cả hai** thấy nhau trong danh sách bạn |
| `T058-02` | A gửi B; B decline; GET pending rỗng, không accepted row. | Gửi → từ chối → **không** thành bạn, lời mời biến mất |
| `T058-03` | A gửi B rồi B gửi A; đúng 1 pending giữ requester A; B phải accept riêng. | ⭐ **Gửi chéo → ĐÚNG MỘT quan hệ, KHÔNG tự thành bạn** |
| `T058-04` | A/B cross-send cùng barrier, 20 lần đảo thứ tự; query count pair=1, status pending. | ⭐ **A và B gửi ĐỒNG THỜI → ĐÚNG MỘT quan hệ** (rào đồng bộ) |
| `T058-05` | A gửi A; validation từ chối, không row self. | Tự kết bạn với chính mình → **từ chối** |
| `T058-06` | A gửi B, C raw POST respond accept; 403, row vẫn pending. | ⭐ **Người thứ ba** gọi chấp nhận → **FORBIDDEN** |
| `T058-07` | B raw DELETE request doA gửi; 403; A cancel được. | ⭐ **Người nhận** gọi huỷ lời mời đã gửi → **FORBIDDEN** |
| `T058-08` | Accepted A–B, A DELETE friends/B; cả hai GET mất nhau. | Huỷ kết bạn → **cả hai** mất khỏi danh sách |
| `T058-09` | A gửi B hai lần; một row, response chỉ quan hệ hiện có. | Gửi trùng khi đang chờ → **không** tạo hàng thứ hai |
| `T058-10` | Huỷ bạn rồi A gửi B; tạo pending hợp lệ không tự accepted. | Kết bạn lại sau khi huỷ → **được phép** |
| `T058-11` | A GET friends cố gửi userId=B; actor luôn A, không đọc danh sách B. | `GET /friends` chỉ trả bạn của **chính mình** |



### 10.3 Điểm triển khai cần giữ đúng

```ts
export function orderedPair(a: string, b: string): readonly [string, string] {
  if (a === b) throw new Error('SELF_FRIEND_REQUEST');
  return a < b ? [a, b] : [b, a];
}
// requesterId vẫn là actor, không suy requester từ thứ tự user_a/user_b.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **auto accept lời mời chéo hoặc bỏ recipient predicate**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-058.md`.

```bash
pnpm test:integration -- tests/integration/issue-058.test.ts
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
| `AC-FRD-01` | [REQ-PROFILE-FRIENDS](../01-requirements/REQ-PROFILE-FRIENDS.md) | LOCAL |
| `AC-FRD-02` | [REQ-PROFILE-FRIENDS](../01-requirements/REQ-PROFILE-FRIENDS.md) | LOCAL |
| `AC-FRD-03` | [REQ-PROFILE-FRIENDS](../01-requirements/REQ-PROFILE-FRIENDS.md) | LOCAL |
| `AC-FRD-04` | [REQ-PROFILE-FRIENDS](../01-requirements/REQ-PROFILE-FRIENDS.md) | LOCAL |
| `AC-FRD-05` | [REQ-PROFILE-FRIENDS](../01-requirements/REQ-PROFILE-FRIENDS.md) | LOCAL |
| `AC-FRD-06` | [REQ-PROFILE-FRIENDS](../01-requirements/REQ-PROFILE-FRIENDS.md) | LOCAL |
| `AC-FRD-07` | [REQ-PROFILE-FRIENDS](../01-requirements/REQ-PROFILE-FRIENDS.md) | LOCAL |
| `AC-FRD-08` | [REQ-PROFILE-FRIENDS](../01-requirements/REQ-PROFILE-FRIENDS.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
