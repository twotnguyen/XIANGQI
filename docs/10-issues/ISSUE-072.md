# ISSUE-072 — Giao diện mời · nhập mã · hộp thư

**Nhóm:** E08 · **Phụ thuộc:** 071 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Ba giao diện mời, với **chỉ báo lời mời** trên thanh điều hướng.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-INVITE.md](../01-requirements/REQ-INVITE.md) §11 · [../03-screens/screen-inventory.md](../03-screens/screen-inventory.md) §2, §6

## 3. PHẠM VI
**✅ LÀM** — cửa sổ mời 3 tab · nhập mã · hộp thư · chỉ báo
**❌ KHÔNG LÀM** — người xem (077)

## 4. FILE TẠO
`apps/web/src/features/invite/{InviteModal,JoinByCodeModal,InvitationInbox}.tsx` · `apps/web/src/components/Navbar.tsx`

## 5. CÁC BƯỚC
1. **Cửa sổ mời — 3 tab**:
   | Tab | Nội dung |
   |---|---|
   | Mời bạn | danh sách bạn bè + nút Mời · **vô hiệu** với người đã ở trong phòng |
   | Link | chọn **chơi** / **xem** + nút sao chép |
   | Mã | hiện mã + nút sao chép · chủ phòng có thêm **Đổi mã xem** |
2. ⭐ **Đổi mã xem phải có xác nhận** ghi rõ: *"Toàn bộ người xem hiện tại sẽ bị đưa ra khỏi phòng."* (`screen-inventory` §6)
3. **Nhập mã** — ô 8 ký tự, tự chuyển chữ HOA, bỏ khoảng trắng
4. **Hộp thư lời mời** — mỗi dòng: người mời · tên phòng · **thời gian còn lại** · nút Chấp nhận / Từ chối
5. **Chỉ báo trên thanh điều hướng** — hiện ở **mọi màn** sau đăng nhập, bấm vào mở hộp thư
6. Trạng thái trống: *"Chưa có lời mời nào"* · *"Chưa có bạn bè nào để mời"*

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T072-01` | Ba tab của cửa sổ mời hoạt động |
| `T072-02` | ⭐ **Đổi mã xem → hiện xác nhận ghi rõ hậu quả** |
| `T072-03` | Sao chép link và mã hoạt động |
| `T072-04` | Nhập mã chữ thường → **tự chuyển HOA**, vào được |
| `T072-05` | Mã sai → thông báo rõ, **không** tiết lộ phòng có tồn tại không |
| `T072-06` | ⭐ **Chỉ báo hiện đúng số** và cập nhật thời gian thực |
| `T072-07` | ⭐ Chấp nhận từ hộp thư → **vào đúng phòng** |
| `T072-08` | Hộp thư hiện **thời gian còn lại**, đếm ngược |
| `T072-09` | ⭐ Hai trạng thái **trống** có lời giải thích |
| `T072-10` | Bạn đã ở trong phòng → nút Mời **vô hiệu**, có giải thích |
| `T072-11` | Mobile 360px → **không tràn ngang** |
| `T072-12` | Mọi cửa sổ đóng được bằng **X**, **Esc**, bấm ra ngoài |
| `T072-13` | WATCH trực tiếp đủ vào CODE_ONLY, LOCKED vô hiệu cấp WATCH; lỗi chung có nhập lại/Thử lại/Về sảnh mà không lộ trạng thái |
| `T072-14` | Rotate ở PUBLIC hiển thị mất hiệu lực mọi lời mời/mã/link WATCH và đưa người xem ra; không nói phòng sẽ ẩn sảnh |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 14 test xanh ở cả 2 kích thước
- [ ] **`T072-02`** xác nhận đổi mã đúng chữ
- [ ] **`T072-06`** và **`T072-07`** hộp thư hoạt động
- [ ] `T072-09` đủ trạng thái trống
- [ ] `T072-12` tuân thủ `SCR-RULE-02`

### Contract bổ sung bắt buộc

Copy UI theo FLOW-JOIN-ROOM §8 và REQ-SPECTATOR BR-SPEC-20; không dùng lỗi đầy/đóng trước xác minh.

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-072.md` — ảnh chụp 3 tab, hộp thư, chỉ báo.

## 9. ⚠ CẠM BẪY
Đổi mã xem **không cảnh báo** khiến chủ phòng vô tình **đuổi cả 5 người xem** mà không biết. Đây là hành động có hậu quả lớn, bắt buộc phải xác nhận rõ ràng.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** Invite UI ba tab dùng 068–071; clipboard chỉ issuer, code 8 uppercase/trim; inbox toàn app sau login, countdown dựa expiresAtMs/serverNow. Rotate confirmation mô tả revoke mọi WATCH và đuổi viewers, không nói PUBLIC sẽ ẩn.

**Tiền điều kiện cụ thể:** AHost/BPLAYER/S1 SPECTATOR, acceptedfriends/pending/empty và expired grants; viewport 1366/360, clipboard context quyền test.

**File kiểm thử:** `tests/e2e/issue-072.spec.ts`. Giữ tên `T072-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T072-01` | Mở tabs Bạn bè/Link/Mã; mỗi tab gọi đúng service và đúng grantRole. | Ba tab của cửa sổ mời hoạt động |
| `T072-02` | ClickRotate; trước confirm không request; dialog ghi rõ toàn bộ người xem bị đưa ra. | ⭐ **Đổi mã xem → hiện xác nhận ghi rõ hậu quả** |
| `T072-03` | Copylink/code doA tạo; đọc clipboard đúng giá trị, không copy Auth token. | Sao chép link và mã hoạt động |
| `T072-04` | Nhập code lowercase cóspaces; chuẩn hoá rồi join thật, membership đúng. | Nhập mã chữ thường → **tự chuyển HOA**, vào được |
| `T072-05` | Nhập mã sai; generic copy không khẳng định room tồn tại/đầy/đóng. | Mã sai → thông báo rõ, **không** tiết lộ phòng có tồn tại không |
| `T072-06` | B ởmọimàn sau login; gửi invite thật; badge tăng/revoke giảm không reload. | ⭐ **Chỉ báo hiện đúng số** và cập nhật thời gian thực |
| `T072-07` | Acceptinbox; vào đúng room/role, invitation mất sau commit. | ⭐ Chấp nhận từ hộp thư → **vào đúng phòng** |
| `T072-08` | Clock fake client/server đồng bộ, hiển thị remaining; đúng hạn disableaccept và refreshlist. | Hộp thư hiện **thời gian còn lại**, đếm ngược |
| `T072-09` | Khôngfriend và không invite; cả 2 empty states có copy/hành động. | ⭐ Hai trạng thái **trống** có lời giải thích |
| `T072-10` | Friendđã trongroom; nút Mời disabled có giải thích. | Bạn đã ở trong phòng → nút Mời **vô hiệu**, có giải thích |
| `T072-11` | 360 px tên room 60/name 40/error dài; không overflow. | Mobile 360 px → **không tràn ngang** |
| `T072-12` | Mỗi modal X/Esc/backdrop đóng, focus về opener; khôngsideeffect. | Mọi cửa sổ đóng được bằng **X**, **Esc**, bấm ra ngoài |
| `T072-13` | CODE_ONLY direct WATCHaccept được; LOCKED cấp WATCH disabled; lỗi chung cho nhập lại/Thử lại/Về sảnh. | WATCH trực tiếp đủ vào CODE_ONLY, LOCKED vô hiệu cấp WATCH; lỗi chung có nhập lại/Thử lại/Về sảnh mà không lộ trạng thái |
| `T072-14` | Rotate PUBLICconfirmation nói revoke direct/code/linkWATCH+đuổiviewers, không ẩn PUBLIC lobby. | Rotate ở PUBLIC hiển thị mất hiệu lực mọi lời mời/mã/link WATCH và đưa người xem ra; không nói phòng sẽ ẩn sảnh |



### 10.3 Điểm triển khai cần giữ đúng

```ts
export const normalizeRoomCode = (input: string): string => input.replace(/\s/g, '').toUpperCase();
// Normalize trước validation8ký tự; server vẫn validate alphabet và quyền.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **rotate gửi request trước confirmation hoặc hiển thị lỗi full khi không proof**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-072.md`.

```bash
pnpm test:e2e -- tests/e2e/issue-072.spec.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:e2e
```

**Đóng issue:** mọi test trong ma trận và mọi ô PASS phía trên đạt; không `.only`/`.skip`, không thiếu lane. Các gate tích hợp tương lai được nêu đích danh trong issue phải có chủ sở hữu/bằng chứng riêng, không ghi chúng PASS bằng spy/fixture. Chỉ đổi `TODO` sang `DONE` sau PR đã merge theo WORKFLOW.

**BLOCKED và bàn giao:** thiếu capability dependency hoặc invariant trong 10.1 chưa kiểm được ⇒ `BLOCKED`, ghi đúng test/đầu vào/response sai và commit liên quan. PostgreSQL/socket/browser cần cho ma trận không chạy được ⇒ test phải đỏ; không bỏ qua hoặc thay bằng dữ liệu tự dựng để báo đạt. Bàn giao đường dẫn file thực đã sửa, exported interface/DTO, migrations nếu có, các test ID đạt/chưa đạt, bằng chứng fault injection, và tên issue kế tiếp sử dụng hợp đồng ở 10.1; không bàn giao chỉ một câu “đã xong”.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-INV-16` | [REQ-INVITE](../01-requirements/REQ-INVITE.md) | LOCAL |
| `AC-INV-17` | [REQ-INVITE](../01-requirements/REQ-INVITE.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
