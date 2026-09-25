# ISSUE-074 — Trần 5 người xem + tranh chấp ghế

**Nhóm:** E09 · **Phụ thuộc:** 073 · **Trạng thái:** TODO

## 1. MỤC TIÊU
**Không bao giờ** vượt quá 5 người xem — kể cả khi nhiều người xin cùng lúc.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-SPECTATOR.md](../01-requirements/REQ-SPECTATOR.md) §11 **`BR-SPEC-02`, `BR-SPEC-15`** · [../06-acceptance/test-scenarios.md](../06-acceptance/test-scenarios.md) §3

## 3. PHẠM VI
**✅ LÀM** — đếm sức chứa trong khoá · giữ ghế 15 giây
**❌ KHÔNG LÀM** — đuổi (076)

## 4. FILE SỬA
`apps/server/src/modules/rooms/spectator.service.ts`

## 5. CÁC BƯỚC
1. **`BR-SPEC-15`** — đếm và nhận vào **trong cùng một thao tác**, dưới khoá phòng:
   ```sql
   SELECT ... FROM rooms WHERE id = $1 FOR UPDATE;
   SELECT count(*) FROM room_members WHERE room_id=$1 AND role='SPECTATOR';
   -- count < 5 ⇒ INSERT
   ```
   ⛔ **Không** viết `CHECK` chứa truy vấn con — PostgreSQL không hỗ trợ đúng cách
2. Người thứ 6 ⇒ **`ROOM_FULL`** với thông báo *"Phòng đã đủ người xem"*
3. **Mất kết nối giữ ghế 15 giây** (`BR-SPEC-04`) — chưa xoá hàng thành viên ngay
4. Đúng hạn hoặc sau 15 giây ⇒ xoá tư cách thành viên, ghế nhường người khác
5. Nối lại trước hạn 15 giây ⇒ **phải kiểm tra lại quyền** — phòng có thể đã đổi chế độ hoặc người đó đã bị đuổi
6. Nối lại **không** cộng thêm hàng thành viên mới

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T074-01` | 5 người xem vào được, hiện **5/5** |
| `T074-02` | ⭐ **Người thứ 6 → `ROOM_FULL`** |
| `T074-03` | ⭐ **Hai người xin ghế thứ 5 ĐỒNG THỜI → ĐÚNG MỘT thành công** (rào đồng bộ) |
| `T074-04` | ⭐ **Sau tranh chấp: kiểm DỮ LIỆU — số người xem ≤ 5** |
| `T074-05` | ⭐ Chạy `T074-03` **20 lần**, **đảo thứ tự** → luôn đúng |
| `T074-06` | Một người rời → ghế trống ngay, người thứ 6 vào được |
| `T074-07` | ⭐ **Mất kết nối 14 giây → GIỮ ghế**, nối lại được |
| `T074-08` | ⭐ **Mất kết nối đúng 15 giây và 16 giây → MẤT ghế** (đồng hồ giả) |
| `T074-09` | ⭐ **Nối lại phải KIỂM TRA LẠI QUYỀN** — phòng đã chuyển khoá → **từ chối** |
| `T074-10` | Nối lại **không** tạo hàng thành viên thứ hai |
| `T074-11` | Người chơi **không** bị tính vào trần người xem |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 11 test xanh trên PostgreSQL thật
- [ ] **`T074-03`** và **`T074-05`** — 20 lần, đảo thứ tự, luôn đúng
- [ ] **`T074-04`** kiểm **dữ liệu sau commit**
- [ ] **`T074-09`** kiểm lại quyền khi nối lại
- [ ] Test thời gian dùng **đồng hồ giả**

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-074.md` — kết quả 20 lần chạy tranh chấp.

## 9. ⚠ CẠM BẪY
Nối lại mà **không kiểm lại quyền** là lỗ hổng: trong 15 giây mất mạng, chủ phòng có thể đã chuyển sang khoá hoặc đuổi người đó — nhưng họ vẫn vào lại được. `T074-09` bắt đúng lỗi này.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** Sức chứa SPECTATOR tính membership dưới lockroom, gồm offline còn grace 15 s. Heartbeat/connection adapter 084; expire now>=deadline xoá member/active pointer; reconnect recheck session/epoch/block/privacy, giữ membership_id trước hạn.

**Tiền điều kiện cụ thể:** Room 2 PLAYER+4/5 SPECTATOR; hai connection riêng, barrier; clockt 0 disconnect S1, scheduler explicit tick.

**File kiểm thử:** `tests/integration/issue-074.test.ts`. Giữ tên `T074-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T074-01` | S1…S5 WATCH join; count 5, projection 5/5. | 5 người xem vào được, hiện **5/5** |
| `T074-02` | S6 proofvalid khi 5 member; ROOM_FULL, count 5 và grant không consume. | ⭐ **Người thứ 6 → `ROOM_FULL`** |
| `T074-03` | 4 SPECTATOR, S5/S6 barrierjoin; 1 success/1 full. | ⭐ **Hai người xin ghế thứ 5 ĐỒNG THỜI → ĐÚNG MỘT thành công** (rào đồng bộ) |
| `T074-04` | Sau commit query DB count và unique user/member; count 5, khôngactive pointerloser. | ⭐ **Sau tranh chấp: kiểm DỮ LIỆU — số người xem ≤ 5** |
| `T074-05` | Chạy race 20 lần đảo ai giữ lock trước; cả 20 count 5, lưu bảng kết quả. | ⭐ Chạy `T074-03` **20 lần**, **đảo thứ tự** → luôn đúng |
| `T074-06` | S1 leave có ACK; S6 join ngay, không chờ timer. | Một người rời → ghế trống ngay, người thứ 6 vào được |
| `T074-07` | Disconnect S1, t 14 s; slot vẫn giữ, reconnect cùng membershipid. | ⭐ **Mất kết nối 14 giây → GIỮ ghế**, nối lại được |
| `T074-08` | Disconnect S1, t 15 s/t 16 s fixture độc lập; slot mất, reconnect là join mới phải quyền mới. | ⭐ **Mất kết nối đúng 15 giây và 16 giây → MẤT ghế** (đồng hồ giả) |
| `T074-09` | Disconnect S1, rồi privacy LOCKED hoặc kickblock; reconnect trước 15 s vẫn bị từ chối. | ⭐ **Nối lại phải KIỂM TRA LẠI QUYỀN** — phòng đã chuyển khoá → **từ chối** |
| `T074-10` | Hai reconnecttabS1 cùng lúc trước hạn; 1 membership, không count 6. | Nối lại **không** tạo hàng thành viên thứ hai |
| `T074-11` | Room 2 PLAYER+5 SPECTATOR; countqueries chỉ SPECTATOR, PLAYER khôngngốntừ 5. | Người chơi **không** bị tính vào trần người xem |



### 10.3 Điểm triển khai cần giữ đúng

```sql
BEGIN;
SELECT id FROM rooms WHERE id=$1 FOR UPDATE;
SELECT count(*) FROM room_members WHERE room_id=$1 AND role='SPECTATOR';
-- Nếu count<5 và mọi predicate quyền đạt, INSERT member ngay trong transaction này.
-- Không COMMIT giữa COUNT và INSERT. $1 là room đã resolve từ grant.
COMMIT;
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **đếm ngoài lock hoặc reconnect không kiểm quyền**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-074.md`.

```bash
pnpm test:integration -- tests/integration/issue-074.test.ts
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
| `AC-LOB-04` | [REQ-LOBBY](../01-requirements/REQ-LOBBY.md) | LOCAL |
| `AC-SPEC-15` | [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) | LOCAL |
| `AC-DIS-12` | [REQ-DISCONNECT](../01-requirements/REQ-DISCONNECT.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
