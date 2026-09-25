# ISSUE-071 — Hộp thư lời mời (R19)

**Nhóm:** E08 · **Phụ thuộc:** 070 · **Trạng thái:** TODO
**⭐ Yêu cầu MỚI từ audit BA** — `DEC-008`

## 1. MỤC TIÊU
Người được mời **không bỏ lỡ lời mời** dù lúc đó đang ngoại tuyến.

## 2. VÌ SAO CÓ YÊU CẦU NÀY

Thiết kế cũ chỉ đẩy lời mời **tức thời** và hết hạn sau 10 phút:

> Bạn mời **Nam**. Nam **chưa mở website**. 10 phút sau lời mời hết hạn.
> Tối đó Nam mở web → **không thấy gì cả**, không biết từng được mời.

⇒ Kết bạn + mời chỉ dùng được khi **hai người cùng online cùng lúc**.

## 3. ĐỌC TRƯỚC
[../01-requirements/REQ-INVITE.md](../01-requirements/REQ-INVITE.md) **§5.4, §9 `BR-INV-16`** · [../07-decisions/decision-log.md](../07-decisions/decision-log.md) `DEC-008`

## 4. PHẠM VI
**✅ LÀM** — `GET /invitations` · chỉ báo số lượng · nạp lại khi đăng nhập
**❌ KHÔNG LÀM** — giao diện chi tiết (072)

## 5. CÁC BƯỚC
1. `GET /api/v1/invitations` trả lời mời **còn hiệu lực** của người đang đăng nhập:
   ```
   { id, roomId, roomName, inviterDisplayName, grantRole, expiresAtMs }
   ```
   ⛔ **Không** trả mã bí mật hay token
2. **`BR-INV-16`** — nạp lại **khi đăng nhập**, **không phụ thuộc** lúc được mời người đó có online hay không
3. **Giữ nguyên hạn 10 phút** — `DEC-008` không đổi luật hết hạn, chỉ thêm đường hiển thị
4. Chỉ báo số lượng: đếm lời mời **đang chờ và còn hạn**
5. Lời mời hết hạn ⇒ **tự biến mất** khỏi danh sách, chỉ báo giảm
6. Phân trang tối đa **20**

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T071-01` | ⭐ **Được mời lúc NGOẠI TUYẾN → đăng nhập → VẪN THẤY lời mời** (còn hạn) |
| `T071-02` | ⭐ Được mời lúc ngoại tuyến, **quá 10 phút** → đăng nhập → **không** thấy |
| `T071-03` | Chỉ báo đếm đúng số lời mời đang chờ |
| `T071-04` | Lời mời hết hạn → chỉ báo **tự giảm** (đồng hồ giả) |
| `T071-05` | ⭐ **Chỉ thấy lời mời CỦA MÌNH**, không thấy của người khác |
| `T071-06` | ⭐ **Phản hồi không chứa** mã, token, hay khoá bí mật |
| `T071-07` | Chấp nhận từ hộp thư → vào phòng, lời mời biến mất |
| `T071-08` | Từ chối từ hộp thư → lời mời biến mất |
| `T071-09` | Phòng bị đóng → lời mời **biến khỏi** hộp thư |
| `T071-10` | Phân trang **20** |
| `T071-11` | Chưa đăng nhập → `UNAUTHENTICATED` |
| `T071-12` | Thu hồi WATCH vì privacy/rotate ⇒ lời mời biến mất ngay và không trở lại khi mở PUBLIC; lời mời PLAY không bị ảnh hưởng |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 12 test xanh
- [ ] **`T071-01`** — luồng cốt lõi của `R19`
- [ ] **`T071-05`** và **`T071-06`** — riêng tư
- [ ] `T071-02` — vẫn tôn trọng hạn 10 phút
- [ ] Chỉ báo cập nhật đúng

### Contract bổ sung bắt buộc

Inbox query lọc status/expiry/watch_epoch; realtime sự kiện revoke không chứa secret. Invite hiện trong inbox trước đó không đủ để bypass kiểm quyền hiện hành khi accept.

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-071.md`

## 9. ⚠ CẠM BẪY
Đừng đổi hạn 10 phút thành dài hơn để *"tiện"* — `DEC-008` **giữ nguyên** luật hết hạn. Chỉ thêm **đường hiển thị**, không đổi luật nghiệp vụ.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** GET /invitations dùng actorJWT, pending+now<expires+currentwatch_epoch, projection {id, roomId, roomName, inviterDisplayName, grantRole, expiresAtMs}, limit 20. Badge dùng tổng pending còn hạn, không chỉ số dòng trang; login phải query lại DB.

**Tiền điều kiện cụ thể:** B offline, 25 invites ở các room; thêm expired/used/revoked và inviteC; clocks và realtime 084 thật.

**File kiểm thử:** `tests/integration/issue-071.test.ts`. Giữ tên `T071-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T071-01` | B offline lúc A gửi; login trước 10 min, GET có invite và badge tăng. | ⭐ **Được mời lúc NGOẠI TUYẾN → đăng nhập → VẪN THẤY lời mời** (còn hạn) |
| `T071-02` | B offline hơn 10 min; login, invite không có và không badge. | ⭐ Được mời lúc ngoại tuyến, **quá 10 phút** → đăng nhập → **không** thấy |
| `T071-03` | Seed 3 pendingvalid+2 expired+1 used; badge 3, không 6. | Chỉ báo đếm đúng số lời mời đang chờ |
| `T071-04` | Advance tới hạn 1 invite và chạy expiry scheduler; list/badge giảm đúng 1. | Lời mời hết hạn → chỉ báo **tự giảm** (đồng hồ giả) |
| `T071-05` | TokenB gửi recipientId=C hoặc cursorC; chỉ B data, không inviter/room của C. | ⭐ **Chỉ thấy lời mời CỦA MÌNH**, không thấy của người khác |
| `T071-06` | Whitelist tất cả rows/envelope; không raw code/token/HMAC/email. | ⭐ **Phản hồi không chứa** mã, token, hay khoá bí mật |
| `T071-07` | B accept từ inbox; membership đúng, pendinglist và badge giảm 1. | Chấp nhận từ hộp thư → vào phòng, lời mời biến mất |
| `T071-08` | B decline; không membership, list/badge giảm 1. | Từ chối từ hộp thư → lời mời biến mất |
| `T071-09` | Host close; B socket nhận revoke rồi refetch không invite. | Phòng bị đóng → lời mời **biến khỏi** hộp thư |
| `T071-10` | 25 valid; trang 20/5, cursor không trùng, badge tổng 25. | Phân trang **20** |
| `T071-11` | GET không JWT; UNAUTHENTICATED. | Chưa đăng nhập → `UNAUTHENTICATED` |
| `T071-12` | Rotate/privacy tăng epoch; WATCHpending mất, PLAY giữ; reopenPUBLIC không tái hiện. | Thu hồi WATCH vì privacy/rotate ⇒ lời mời biến mất ngay và không trở lại khi mở PUBLIC; lời mời PLAY không bị ảnh hưởng |



### 10.3 Điểm triển khai cần giữ đúng

```sql
-- Predicate quyền inbox (tên enum status theo schema037).
-- $1 = actorId; $2 = serverNow; không lấy recipientId từ query client.
SELECT i.id FROM invitations i JOIN rooms r ON r.id=i.room_id
WHERE i.recipient_id=$1 AND i.status='PENDING' AND i.expires_at>$2
AND (i.grant_role='PLAY' OR i.watch_epoch=r.watch_epoch);
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **badge đếm mọi row kể cả expired hoặc lấy dữ liệu chỉ từ socket**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-071.md`.

```bash
pnpm test:integration -- tests/integration/issue-071.test.ts
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
| `AC-AUTH-13` | [REQ-AUTH](../01-requirements/REQ-AUTH.md) | LOCAL |
| `AC-AUTH-22` | [REQ-AUTH](../01-requirements/REQ-AUTH.md) | LOCAL |
| `AC-INV-13` | [REQ-INVITE](../01-requirements/REQ-INVITE.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
