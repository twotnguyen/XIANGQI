# ISSUE-065 — Rời phòng + đóng phòng

**Nhóm:** E07 · **Phụ thuộc:** 064, 089 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Xử lý rời phòng theo **từng trạng thái** — và rời khi **đang chơi là đầu hàng**.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-ROOM.md](../01-requirements/REQ-ROOM.md) §5.5, §9 `BR-ROOM-09/10/14`

## 3. PHẠM VI
**✅ LÀM** — `POST /rooms/:id/leave` · đóng phòng + thu hồi
**❌ KHÔNG LÀM** — bộ đếm 10 phút (128)

## 4. FILE TẠO
`apps/server/src/modules/rooms/leave.service.ts`

## 5. CÁC BƯỚC
1. `POST /api/v1/rooms/:id/leave` nhận `{ confirmResign?: boolean }`
2. **Bảng xử lý — theo đúng `BR-ROOM-09/10`**:
   | Ai rời | Trạng thái phòng | Hệ quả |
   |---|---|---|
   | **Chủ phòng** | Đang chờ | **ĐÓNG PHÒNG** |
   | Người chơi 2 | Đang chờ | Ghế trống lại, **xoá ready cả hai** |
   | **Bất kỳ người chơi** | **Đang chơi** | **ĐẦU HÀNG** — cần `confirmResign: true` |
   | Chủ phòng | Đã xong | **ĐÓNG PHÒNG** |
   | Người chơi 2 | Đã xong | Rời, **không** đổi ván đã ghi |
   | Người xem | Bất kỳ | Giải phóng ghế xem |
3. Rời khi đang chơi mà **không** có `confirmResign` ⇒ từ chối, yêu cầu xác nhận
4. **Đóng phòng — thu hồi ĐỒNG THỜI** (`BR-ROOM-14`):
   lời mời · tư cách thành viên · kênh chat · quyền camera/mic · `user_active_room` · `room_blocks`
5. **Không chuyển quyền chủ phòng** (`BR-ROOM-03`)

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T065-01` | ⭐ **Người chơi rời khi ĐANG CHƠI → ván kết thúc, nguyên nhân `RESIGN`**, đối thủ thắng |
| `T065-02` | Rời khi đang chơi **không** `confirmResign` → **từ chối** |
| `T065-03` | ⭐ **Chủ phòng rời khi ĐANG CHỜ → PHÒNG ĐÓNG**, mọi người bị đưa ra |
| `T065-04` | Người chơi 2 rời khi đang chờ → ghế trống, **ready cả hai bị xoá** |
| `T065-05` | Chủ phòng rời khi **đã xong ván** → phòng đóng |
| `T065-06` | Người xem rời → chỉ giải phóng ghế, phòng **không** đổi |
| `T065-07` | Đóng phòng revoke grant/membership/chat predicate, media fence/job, user_active_room nguyên tử; chat delivery/history thật T110-14, SFU/RTP thật TS-MED-06 ở117. |
| `T065-08` | Sau khi rời → tạo/vào phòng khác được ngay |
| `T065-09` | ⭐ **Không** có endpoint nào chuyển quyền chủ phòng |
| `T065-10` | Đóng phòng → `room_blocks` bị xoá (`BR-SPEC-12`) |
| `T065-11` | Người không phải thành viên gọi rời → **FORBIDDEN** |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 11 test xanh trên PostgreSQL thật
- [ ] **`T065-01`** ghi đúng nguyên nhân `RESIGN`
- [ ] **`T065-07`** kiểm từng grant/predicate/fence/job trên DB thật; không nhận media APPLIED trước117; bàn giao gate T110-14/TS-MED-06
- [ ] `T065-03` chứng minh chủ phòng rời thì đóng phòng
- [ ] `T065-09` chứng minh không chuyển quyền chủ

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-065.md`

## 9. ⚠ CẠM BẪY
Đóng phòng mà **quên thu hồi một loại** tài nguyên — ví dụ quên `user_active_room` — sẽ khiến người dùng **bị kẹt vĩnh viễn**, không tạo được phòng mới. `T065-07` kiểm từng loại một.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** Leave nhận confirmResign theo§5, actor từ session. WAITING/FINISHED: SQL room→users thu hồi grant/member/active pointer, seal context/segment; Host không chuyển quyền. ACTIVE dùng finalizer 089 với outcome RESIGN; endpoint 104 tái sử dụng cùng primitive. Media ghi fence/job, không chứng nhận RTP trước 117.

**Tiền điều kiện cụ thể:** Room A Host/B PLAYER/S1–S5; fixtures riêng WAITING/PLAYING/FINISHED; code/link/direct grants và context 040; snapshot toàn bộ bảng liên quan trước hành động.

**File kiểm thử:** `tests/integration/issue-065.test.ts`. Giữ tên `T065-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T065-01` | ACTIVE B leave confirmResign=true; dùng finalizer thật 089, outcome RESIGN/winner RED, match terminal một lần; endpoint 104 kiểm hồi quy. | ⭐ **Người chơi rời khi ĐANG CHƠI → ván kết thúc, nguyên nhân `RESIGN`**, đối thủ thắng |
| `T065-02` | ACTIVE B leave không confirm hoặc false; từ chối, match/membership không đổi. | Rời khi đang chơi **không** `confirmResign` → **từ chối** |
| `T065-03` | WAITING Host leave; CLOSED, membership/active pointers rỗng; sockets hiện có nhận close. | ⭐ **Chủ phòng rời khi ĐANG CHỜ → PHÒNG ĐÓNG**, mọi người bị đưa ra |
| `T065-04` | WAITING B leave; ghế B trống, ready A reset/revision tăng; đóng segment A–B, mở segment solo A. | Người chơi 2 rời khi đang chờ → ghế trống, **ready cả hai bị xoá** |
| `T065-05` | FINISHED Host leave; CLOSED và seal context, không đổi kết quả match đã lưu. | Chủ phòng rời khi **đã xong ván** → phòng đóng |
| `T065-06` | S1 leave; chỉ membership/active pointer S1 mất, PLAYER/match không đổi. | Người xem rời → chỉ giải phóng ghế, phòng **không** đổi |
| `T065-07` | Host close; kiểm từng grant/member/chat predicate/media fence/job/active pointer; chưa APPLIED SFU, transport cuối ở 110/117. | Đóng phòng revoke grant/membership/chat predicate, media fence/job, user_active_room nguyên tử; chat delivery/history thật T110-14, SFU/RTP thật TS-MED-06 ở 117. |
| `T065-08` | B leave rồi create 061 ngay; thành công, không active pointer cũ. | Sau khi rời → tạo/vào phòng khác được ngay |
| `T065-09` | Duyệt routes và thử payload hostId khác trên leave/settings; không chuyển Host. | ⭐ **Không** có endpoint nào chuyển quyền chủ phòng |
| `T065-10` | Seed room_blocks S1 rồi Host close; các row room_blocks phòng đó bị xoá, phòng khác giữ. | Đóng phòng → `room_blocks` bị xoá (`BR-SPEC-12`) |
| `T065-11` | Outsider C raw leave; FORBIDDEN, toàn bộ dữ liệu giữ nguyên. | Người không phải thành viên gọi rời → **FORBIDDEN** |

Để tránh phụ thuộc ngược 104, 065 cần primitive finalizer 089 đã merge; 104 giữ giao diện lệnh RESIGN và kiểm leave gọi đúng primitive. Không viết finalizer riêng trong leave.

### 10.3 Điểm triển khai cần giữ đúng

```sql
-- $1 là phòng CLOSED, audit sau commit.
SELECT (SELECT count(*) FROM room_members WHERE room_id=$1) AS members,
       (SELECT count(*) FROM user_active_room WHERE room_id=$1) AS active_refs,
       (SELECT count(*) FROM room_blocks WHERE room_id=$1) AS blocks;
-- Cả ba phải bằng0; kiểm riêng invitations/context/media job trong cùng test.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **đóng room nhưng bỏ user_active_room hoặc không seal context**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-065.md`.

```bash
pnpm test:integration -- tests/integration/issue-065.test.ts
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
| `AC-ROOM-08` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
