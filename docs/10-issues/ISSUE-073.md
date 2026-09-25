# ISSUE-073 — Vào xem + kiểm quyền theo chế độ

**Nhóm:** E09 Người xem · **Phụ thuộc:** 068, 069, 070 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Nhận người vào xem đúng quyền — và **kiểm quyền TRƯỚC khi tiết lộ phòng có tồn tại hay không**.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-SPECTATOR.md](../01-requirements/REQ-SPECTATOR.md) §5, §11 `BR-SPEC-01/03` · [../02-flows/FLOW-JOIN-ROOM.md](../02-flows/FLOW-JOIN-ROOM.md) §1, §2

## 3. PHẠM VI
**✅ LÀM** — luồng vào xem · kiểm quyền theo 3 chế độ
**❌ KHÔNG LÀM** — trần 5 (074) · đuổi (076)

## 4. FILE TẠO
`apps/server/src/modules/rooms/spectator.service.ts`

## 5. CÁC BƯỚC
1. **Thứ tự kiểm — BẮT BUỘC đúng** (`FLOW-JOIN-01`):
   ```
   ① đã đăng nhập + hoàn tất onboarding?
   ② đang ở phòng khác?
   ③ bằng chứng quyền biết phòng hiện hành? Không ⇒ lỗi chung
   ④ phòng còn mở và KHÔNG nằm trong room_blocks?            ← DEC-015
   ⑤ đủ quyền theo chế độ riêng tư?
   ⑥ còn ghế xem?                            ← issue 074
   ```
2. **Quyền theo chế độ**:
   | Chế độ | Vào xem |
   |---|---|
   | Công khai | vào thẳng từ sảnh |
   | Cần mã | lời mời trực tiếp đúng người nhận/mã/link `WATCH` hợp lệ |
   | **Khoá** | **không ai vào được** |
3. **`BR-SPEC-01`** — phòng **khoá** chỉ chặn **người xem**; mời **chơi** vẫn dùng được
4. **`BR-SPEC-03`** — thông báo từ chối **không tiết lộ** phòng có tồn tại, ai ở trong, ván nào đang diễn ra
5. Vào xong: gửi **ngay** thế cờ hiện tại + lịch sử **kênh chung** của ván đang diễn ra (`DEC-022`)
6. **`DEC-023`** — phòng **đã xong ván** vào được bằng **lời mời trực tiếp/mã/link WATCH hợp lệ**, nhưng **không** hiện ở sảnh

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T073-01` | Phòng **công khai** → vào xem được từ sảnh |
| `T073-02` | Phòng **cần mã**, không grant WATCH → lỗi chung; UI cho nhập mã |
| `T073-03` | Phòng **cần mã**, mã đúng → vào được |
| `T073-04` | ⭐ **Phòng KHOÁ → KHÔNG AI vào xem được** |
| `T073-05` | ⭐ **Phòng KHOÁ → mời CHƠI VẪN dùng được** |
| `T073-06` | Vào xem giữa ván: DB/projection quyền nhận thế cờ hiện tại đúng; HTTP/socket snapshot thật ngay sau join kiểm T090-09/11 (DEC-022). |
| `T073-07` | Predicate DB cho SPECTATOR đọc ROOM current context kể cả trước join, không PLAYERS; history API/socket thật kiểm T110-14. |
| `T073-08` | ⭐ Vào phòng **đã xong ván** bằng mã → **được**; từ sảnh → **không thấy** |
| `T073-09` | ⭐ **Người bị chặn có bằng chứng hiện hành → `BLOCKED_FROM_ROOM`**; không proof ⇒ lỗi chung |
| `T073-10` | ⭐ **Thông báo từ chối KHÔNG tiết lộ** phòng tồn tại hay không — so sánh phản hồi phòng có thật và phòng không có |
| `T073-11` | Đang ở phòng khác → `ALREADY_IN_ROOM` |
| `T073-12` | ⭐ **Vào bằng mã phòng KHÔNG bỏ qua kiểm chế độ riêng tư** |
| `T073-13` | Direct WATCH còn hạn vào CODE_ONLY thành công; sai recipient/old epoch từ chối chung; LOCKED từ chối mọi WATCH |
| `T073-14` | Proof matrix missing/private/full/closed/blocked/used/expired/revoked theo ROOM-CHAT §2 trên cả bốn locator |
| `T073-15` / `AC-AUTH-04` | Tài khoản đăng ký thật chưa xác minh email gọi join trực tiếp: PLAY/WATCH × roomId/code/token/invitationId × HTTP/socket đều bị chặn trước nhận ghế; không consume grant, không membership, không rò dữ liệu/sự kiện phòng. |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 15 test xanh; T073-15 chạy đủ 16 biến thể locator × intent × transport
- [ ] **`T073-12`** — kiểm quyền ở **mọi** đường vào
- [ ] **`T073-10`** — không rò thông tin
- [ ] `T073-06/07` — projection/predicate thật; giao gate snapshot T090-09/11 và history T110-14, không giả transport
- [ ] `T073-05` — khoá không chặn mời chơi
- [ ] `T073-15` / `AC-AUTH-04` dùng Auth local và endpoint/socket thật: chưa xác minh không nhận ghế, không tiêu thụ grant, không nhận dữ liệu phòng; không JWT giả hoặc mock guard

### Contract bổ sung bắt buộc

Thông báo chi tiết chỉ khi qua cổng bằng chứng hiện hành; PUBLIC proof chỉ khi WAITING/PLAYING hiện tại. Sảnh cũ không bypass quyền khi phòng chuyển kín.

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-073.md` — so sánh phản hồi cho phòng có thật và phòng không tồn tại.

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| **Vào phòng theo mã phòng BỎ QUA kiểm chế độ riêng tư** — lỗ hổng quyền (`F-03`) | `T073-12` |
| Thông báo khác nhau cho phòng tồn tại / không tồn tại ⇒ dò được phòng | `T073-10` |

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** SpectatorService dùng resolver 069/070/068 và admit 063; PUBLIC roomId chỉ WAITING/PLAYING, CODE_ONLY validWATCH, LOCKED denyWATCH. Snapshot board/currentcontext chỉ projection đã phân quyền; transport board 090/chat 110 chịu gate sau.

**Tiền điều kiện cụ thể:** 3 visibility×WAITING/PLAYING/FINISHED/CLOSED, 5 spectator, blockedS1, valid/expired/revoked/used/wrong recipient grants; sockets 084 và DB040.

**File kiểm thử:** `tests/integration/issue-073.test.ts`. Giữ tên `T073-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T073-01` | PUBLIC WAITING roomId WATCH, S1 join; membership epoch hiện hành. | Phòng **công khai** → vào xem được từ sảnh |
| `T073-02` | CODE_ONLY không grant, roomId đoán; 404ROOM_ACCESS_UNAVAILABLE và không metadata. | Phòng **cần mã**, không grant WATCH → lỗi chung; UI cho nhập mã |
| `T073-03` | CODE_ONLY codeWATCH thật 068; S1 vào SPECTATOR. | Phòng **cần mã**, mã đúng → vào được |
| `T073-04` | LOCKED từng locator WATCH còn proof; ACCESS_DENIED hoặcgeneric khi proof đã revoke; không membership. | ⭐ **Phòng KHOÁ → KHÔNG AI vào xem được** |
| `T073-05` | LOCKEDWAITING còn PLAY grant; B join PLAYER được, không nới WATCH. | ⭐ **Phòng KHOÁ → mời CHƠI VẪN dùng được** |
| `T073-06` | PLAYING fixture có position/version; projection được phép đúng hiện trạng; endpoint/socketsnapshot thật 090T090-09/11. | Vào xem giữa ván: DB/projection quyền nhận thế cờ hiện tại đúng; HTTP/socket snapshot thật ngay sau join kiểm T090-09/11 (DEC-022). |
| `T073-07` | Currentcontext có ROOM trước join và PLAYERS private; authorized query chỉ ROOM; historytransport thật 110T110-14. | Predicate DB cho SPECTATOR đọc ROOM current context kể cả trước join, không PLAYERS; history API/socket thật kiểm T110-14. |
| `T073-08` | FINISHED validWATCHcode; join được; GETlobby 062 không room. | ⭐ Vào phòng **đã xong ván** bằng mã → **được**; từ sảnh → **không thấy** |
| `T073-09` | S1 block: valid proof 403BLOCKED_FROM_ROOM; proof cũ/sai 404 chung. | ⭐ **Người bị chặn có bằng chứng hiện hành → `BLOCKED_FROM_ROOM`**; không proof ⇒ lỗi chung |
| `T073-10` | Missingroom/privateexisting/expiredgrant; deepcomparestatus/code/shape, không id/name/count/match. | ⭐ **Thông báo từ chối KHÔNG tiết lộ** phòng tồn tại hay không — so sánh phản hồi phòng có thật và phòng không có |
| `T073-11` | S1 active ở R0, joinR1; ALREADY_IN_ROOM chỉ nói trạng thái actor. | Đang ở phòng khác → `ALREADY_IN_ROOM` |
| `T073-12` | Code hợp lệ nhưng privacy thayLOCKED trước lấy lock; transactionrecheck ngăn join. | ⭐ **Vào bằng mã phòng KHÔNG bỏ qua kiểm chế độ riêng tư** |
| `T073-13` | DirectWATCHBvalid CODE_ONLY; wrong recipient/oldepoch generic; LOCKED không WATCH. | Direct WATCH còn hạn vào CODE_ONLY thành công; sai recipient/old epoch từ chối chung; LOCKED từ chối mọi WATCH |
| `T073-14` | Table-driven 4 locators×missing/private/full/closed/blocked/used/expired/revoked; ghiexpected proof/error trước gọi, assertno mutation. | Proof matrix missing/private/full/closed/blocked/used/expired/revoked theo ROOM-CHAT §2 trên cả bốn locator |
| `T073-15` / `AC-AUTH-04` | Đăng ký U qua signUp047 trên Supabase Auth local với Confirm email bật; không bấm email. A là issuer đã xác minh. Chuẩn bị room WAITING còn ghế và grant PLAY/WATCH đúng recipient/epoch/hạn qua fixtures DB thật. Với mỗi locator roomId/code/token/invitationId và mỗi intent PLAY/WATCH: POST join trực tiếp, rồi thử socket handshake/join bằng đúng kết quả Auth thực của U. Chạy trên fixture riêng cho từng biến thể. | Auth từ chối sign-in chưa confirm thì không có JWT: HTTP trả UNAUTHENTICATED, socket handshake bị từ chối. Nếu provider thực cấp credential chưa đủ điều kiện thì guard046 trả EMAIL_UNVERIFIED; không dựng token giả để ép nhánh này. Sau mỗi lần: DB không có room_members/user_active_room của U, grant không consume, room_version không đổi, U không có subscription hoặc packet phòng. |

**Cách thực hiện T073-15:** ghi cấu hình Confirm email và kết quả provider thật vào report đã che bí mật; kiểm `email_confirmed_at` của U vẫn NULL bằng kết nối fixture đặc quyền. Không dùng `authAs` nếu helper này tự xác minh U. Đọc DB trước/sau bằng connection khác sau request hoàn tất. Socket không handshake được thì assert không có subscription phía server và không có packet dữ liệu; không giả một socket đã authenticated. Với trường hợp không thể có token chưa xác minh trên cấu hình đang chạy, ghi chính xác “provider không cấp credential”; không tạo test `.skip` cho nhánh không phát sinh và không lấy nhánh đó làm bằng chứng EMAIL_UNVERIFIED. Đối chứng dương dùng V đã xác minh và grant riêng: WATCH roomId PUBLIC, WATCH code/link/direct và PLAY code/link/direct nhận ghế đúng quyền; PLAY chỉ có roomId vẫn bị từ chối vì không có grant, kể cả V đã xác minh. Như vậy kiểm được chốt xác thực trước admission mà không lẫn với quyền của locator.

Không đánh snapshot/history transport PASS tại 073 bằng fixture object. T073-06/07 chứng minh projection/predicate DB; board thật 090T090-09/11, chat ROOM trước join và private không lộ tại 110T110-14.

### 10.3 Điểm triển khai cần giữ đúng

```ts
export const noProofPublicError = {
  code: 'ROOM_ACCESS_UNAVAILABLE',
  message: 'Không thể vào phòng. Kiểm tra mã hoặc lời mời.',
};
// Dùng cùng code/message/envelope011 cho missing/private/expired/used/revoked.
// Không spread room hoặc lỗi provider vào error.details.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **code route bỏ kiểm visibility hoặc trả ROOM_FULL trước proof**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-073.md`.

```bash
pnpm test:integration -- tests/integration/issue-073.test.ts
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
| `AC-AUTH-04` | [REQ-AUTH](../01-requirements/REQ-AUTH.md) | LOCAL |
| `AC-LOB-05` | [REQ-LOBBY](../01-requirements/REQ-LOBBY.md) | LOCAL |
| `AC-INV-07` | [REQ-INVITE](../01-requirements/REQ-INVITE.md) | LOCAL |
| `AC-INV-09` | [REQ-INVITE](../01-requirements/REQ-INVITE.md) | LOCAL |
| `AC-INV-15` | [REQ-INVITE](../01-requirements/REQ-INVITE.md) | LOCAL |
| `AC-INV-19` | [REQ-INVITE](../01-requirements/REQ-INVITE.md) | LOCAL |
| `AC-INV-21` | [REQ-INVITE](../01-requirements/REQ-INVITE.md) | LOCAL |
| `AC-SPEC-01` | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) | LOCAL |
| `AC-SPEC-02` | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) | LOCAL |
| `AC-SPEC-03` | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) | LOCAL |
| `AC-SPEC-04` | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) | LOCAL |
| `AC-SPEC-19` | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) | LOCAL |
| `AC-SPEC-21` | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
