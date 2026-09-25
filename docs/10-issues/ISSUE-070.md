# ISSUE-070 — Lời mời trực tiếp cho bạn bè

**Nhóm:** E08 · **Phụ thuộc:** 069, 058 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Mời đích danh một người bạn vào phòng — hết hạn **10 phút**, chỉ người nhận dùng được.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-INVITE.md](../01-requirements/REQ-INVITE.md) §5.1, §9 `BR-INV-02/03/15/17`

## 3. PHẠM VI
**✅ LÀM** — `POST /rooms/:id/invitations` · phản hồi lời mời
**❌ KHÔNG LÀM** — hộp thư (071)

## 4. FILE TẠO
`apps/server/src/modules/invitations/direct.service.ts`

## 5. CÁC BƯỚC
1. `POST /api/v1/rooms/:id/invitations` nhận strict `{ recipientId, grantRole: 'PLAY' | 'WATCH' }`
2. **Kiểm tra**:
   ```
   ① người gọi là NGƯỜI CHƠI của phòng này
   ② người nhận ĐÃ LÀ BẠN BÈ (BR-INV-02)
   ③ chưa có lời mời đang chờ cho cặp (người mời, người nhận, phòng)  ← BR-INV-17
   ④ phòng chưa đóng
   ```
3. Hết hạn **10 phút**. **Chỉ người nhận** dùng được (`BR-INV-03`)
4. `POST /invitations/:id/respond` nhận `{ accept }` — **chỉ người nhận** gọi được
5. **`BR-INV-15`** — lời mời đã tiêu thụ **không sống lại**, kể cả khi người đó rời phòng rồi muốn vào lại
6. Sự kiện lời mời **chỉ** gửi cho **đúng người nhận** — **không** kèm mã bí mật

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T070-01` | Mời bạn → chấp nhận → vào phòng đúng vai trò |
| `T070-02` | Từ chối → lời mời huỷ, **không** vào phòng |
| `T070-03` | ⭐ **Mời người CHƯA LÀ BẠN → TỪ CHỐI** |
| `T070-04` | Người khác gọi respond lời mời → FORBIDDEN; join invitationId sai recipient → ROOM_ACCESS_UNAVAILABLE không metadata. |
| `T070-05` | ⭐ Hết **10 phút** → lời mời **hết hạn** (đồng hồ giả) |
| `T070-06` | ⭐ **Gửi trùng cho cùng người, cùng phòng → KHÔNG tạo bản thứ hai** |
| `T070-07` | ⭐ **Lời mời đã dùng → rời phòng → dùng lại → TỪ CHỐI** |
| `T070-08` | **Người xem** gửi lời mời → FORBIDDEN |
| `T070-09` | Mời khi phòng đã đủ người chơi → từ chối, nêu rõ |
| `T070-10` | ⭐ **Sự kiện lời mời chỉ đến đúng người nhận**, người khác không nhận |
| `T070-11` | Mời người đang ở phòng khác → **gửi được**; lúc chấp nhận mới báo phải rời phòng cũ |
| `T070-12` | Phòng đóng → lời mời chờ bị **thu hồi** |
| `T070-13` | Direct WATCH vào CODE_ONLY đúng người nhận thành công; LOCKED chặn; wrong recipient lỗi chung; thất bại đầy không consume |
| `T070-14` | Privacy kín hơn/rotate revoke direct WATCH và inbox; PLAY giữ nguyên; FINISHED nhận WATCH nhưng không nhận PLAY mới |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 14 test xanh
- [ ] **`T070-04`** và **`T070-10`** — lời mời riêng tư
- [ ] **`T070-07`** — không sống lại
- [ ] **`T070-03`** — chỉ bạn bè
- [ ] `T070-06` — không trùng

### Contract bổ sung bắt buộc

Direct invitation cũng ghi watch_epoch khi WATCH; consume trong transaction nhận ghế, không Prisma consume trước join. Truy cập vé đã dùng không cấp quyền biết phòng. Theo ROOM-CHAT §2–3.

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-070.md`

## 9. ⚠ CẠM BẪY
Phát sự kiện lời mời ra **luồng chung của phòng** thay vì gửi riêng cho người nhận sẽ làm **mọi thành viên** thấy lời mời và có thể dùng nó. `T070-10` kiểm trực tiếp ai nhận được gói tin.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** Direct invitations nhận recipientId và grantRole PLAY|WATCH; issuer là PLAYER và accepted friend. respond chỉ recipient; accept sử dụng join transaction 063 với intent tương ứng, recheck expiry/epoch/capacity trước consume. Từ chối không tạo membership.

**Tiền điều kiện cụ thể:** A/B accepted; C stranger; S1 spectator; PLAY/WATCH direct grants 10 min; user B có/không active room khác.

**File kiểm thử:** `tests/integration/issue-070.test.ts`. Giữ tên `T070-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T070-01` | A mời B từng grantRole; B accept, role PLAYER/SPECTATOR đúng và 1 consumption. | Mời bạn → chấp nhận → vào phòng đúng vai trò |
| `T070-02` | B decline pending; status rejected, không membership. | Từ chối → lời mời huỷ, **không** vào phòng |
| `T070-03` | A mời C stranger hoặc pendingfriend; từ chối, không invitation. | ⭐ **Mời người CHƯA LÀ BẠN → TỪ CHỐI** |
| `T070-04` | C raw respond invitation của B; endpoint respond FORBIDDEN; locator join không proof 404 chung. | Người khác gọi respond lời mời → FORBIDDEN; join invitationId sai recipient → ROOM_ACCESS_UNAVAILABLE không metadata. |
| `T070-05` | Clock 10 min−1 ms/10 min/+1 ms; trước accept được, đúng/sau lỗi và không consume. | ⭐ Hết **10 phút** → lời mời **hết hạn** (đồng hồ giả) |
| `T070-06` | A gửi 2 invite cùng B/room/kind pending; count 1; 2 connection race unique không 500. | ⭐ **Gửi trùng cho cùng người, cùng phòng → KHÔNG tạo bản thứ hai** |
| `T070-07` | B accept rồi leave; reuse invitationId quajoin bị 404 chung, status không reset. | ⭐ **Lời mời đã dùng → rời phòng → dùng lại → TỪ CHỐI** |
| `T070-08` | S1 raw createinvite; FORBIDDEN, không row/event. | **Người xem** gửi lời mời → FORBIDDEN |
| `T070-09` | Room 2 PLAYER, tạo PLAY invite bị từ chối; WATCH vẫn theo capacity/privacy canonical. | Mời khi phòng đã đủ người chơi → từ chối, nêu rõ |
| `T070-10` | Sockets recipientB/issuerA/roomS1/strangerC; chỉ B nhận personal invite, không code/token. | ⭐ **Sự kiện lời mời chỉ đến đúng người nhận**, người khác không nhận |
| `T070-11` | BởR0, A mời B R1 vẫn tạo; B accept ALREADY_IN_ROOM, invitation vẫn pending. | Mời người đang ở phòng khác → **gửi được**; lúc chấp nhận mới báo phải rời phòng cũ |
| `T070-12` | Host close 065; pendinginvites revoked và B inbox mất. | Phòng đóng → lời mời chờ bị **thu hồi** |
| `T070-13` | CODE_ONLY direct WATCH Bvalid thành công; wrong recipient 404 chung khijoin; LOCKED denied; full không consume. | Direct WATCH vào CODE_ONLY đúng người nhận thành công; LOCKED chặn; wrong recipient lỗi chung; thất bại đầy không consume |
| `T070-14` | Privacy/rotate revoke direct WATCH+inbox, PLAY giữ; FINISHED nhận WATCH hợp lệ/không PLAY mới. | Privacy kín hơn/rotate revoke direct WATCH và inbox; PLAY giữ nguyên; FINISHED nhận WATCH nhưng không nhận PLAY mới |

Phân biệt T070-04: respond là thao tác trên lời mời riêng trả FORBIDDEN; join bằng invitationId sai recipient phải 404 ROOM_ACCESS_UNAVAILABLE theo ROOM-CHAT§2, không lộ phòng.

### 10.3 Điểm triển khai cần giữ đúng

```ts
export const directInviteInput = { recipientId: '30000000-0000-4000-8000-000000000001', grantRole: 'WATCH' as const };
// Actor lấy từ JWT; grantRole là lựa chọn xin cấp vé, server vẫn kiểm issuer/privacy.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **consume invitation trước join hoặc phát invitation cho whole room**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-070.md`.

```bash
pnpm test:integration -- tests/integration/issue-070.test.ts
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
| `AC-FRD-15` | [REQ-PROFILE-FRIENDS](../01-requirements/REQ-PROFILE-FRIENDS.md) | LOCAL |
| `AC-INV-01` | [REQ-INVITE](../01-requirements/REQ-INVITE.md) | LOCAL |
| `AC-INV-02` | [REQ-INVITE](../01-requirements/REQ-INVITE.md) | LOCAL |
| `AC-INV-03` | [REQ-INVITE](../01-requirements/REQ-INVITE.md) | LOCAL |
| `AC-INV-04` | [REQ-INVITE](../01-requirements/REQ-INVITE.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
