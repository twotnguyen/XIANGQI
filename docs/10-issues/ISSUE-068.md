# ISSUE-068 — Mã phòng 8 ký tự + HMAC

**Nhóm:** E08 Mời · **Phụ thuộc:** 063, 066 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Sinh mã phòng dễ đọc, lưu an toàn, và **không bao giờ lộ ra dữ liệu gửi cho thành viên khác**.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-INVITE.md](../01-requirements/REQ-INVITE.md) §9 `BR-INV-05/06/07/08/12`

## 3. PHẠM VI
**✅ LÀM** — sinh mã · lưu băm · đổi mã · dùng mã
**❌ KHÔNG LÀM** — link (069) · mời trực tiếp (070)

## 4. FILE TẠO
`apps/server/src/modules/invitations/code.service.ts` · dùng storage `invitations` từ ISSUE-037; migration bổ sung chỉ khi schema canonical yêu cầu

## 5. CÁC BƯỚC
1. **Bảng chữ 32 ký tự — bỏ ký tự dễ nhầm**:
   ```
   ABCDEFGHJKLMNPQRSTUVWXYZ23456789
   ```
   ⚠ **Không có** `I` `O` `0` `1` — tránh đọc nhầm khi nói miệng
2. Mã **8 ký tự**, sinh bằng bộ sinh ngẫu nhiên an toàn
3. **Lưu dạng băm HMAC-SHA256** bằng khoá bí mật của máy chủ — **không** lưu mã gốc
4. Hai loại quyền: **`PLAY`** (dùng **một lần**) và **`WATCH`** (dùng **nhiều lần** tới khi đủ 5)
5. Hết hạn **24 giờ**
6. ⛔ **`BR-INV-12`** — mã gốc **chỉ** trả cho người tạo, **không bao giờ**:
   - nằm trong dữ liệu phòng gửi cho thành viên khác
   - xuất hiện trong log
   - nằm trong sự kiện phát chung
7. `POST /rooms/:id/watch-code` với `{ rotate: true }` — **chỉ chủ phòng** — đổi mã và **thu hồi toàn bộ người xem** (gọi lại logic issue 066)

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T068-01` | Mã sinh ra đúng **8 ký tự** từ bảng chữ quy định |
| `T068-02` | ⭐ Mã **không chứa** `I` `O` `0` `1` — thử sinh 10.000 mã |
| `T068-03` | ⭐ **Cơ sở dữ liệu lưu BĂM, không lưu mã gốc** |
| `T068-04` | Mã đúng → vào phòng được |
| `T068-05` | Mã sai / hết hạn / đã thu hồi → **CÙNG MỘT** thông báo |
| `T068-06` | ⭐ Mã `PLAY` dùng lần hai → **từ chối** |
| `T068-07` | Mã `WATCH` dùng nhiều lần → được, tới khi đủ 5 |
| `T068-08` | ⭐ **Hai người dùng mã `PLAY` cho ghế cuối ĐỒNG THỜI → ĐÚNG MỘT thành công** |
| `T068-09` | ⭐ Đổi mã xem → mã cũ **vô hiệu** + **toàn bộ người xem bị thu hồi** |
| `T068-10` | Không phải chủ phòng đổi mã xem → **FORBIDDEN** |
| `T068-11` | ⭐ **Dữ liệu phòng gửi cho thành viên KHÔNG chứa mã** |
| `T068-12` | ⭐ **Log không chứa mã** |
| `T068-13` | Mã hết hạn sau **24 giờ** — đồng hồ giả |
| `T068-14` | Rotate WATCH ở PUBLIC không ẩn sảnh; invalidate code/link/direct WATCH và tất cả SPECTATOR, không revoke PLAY |
| `T068-15` | LOCKED không cấp/rotate WATCH; giảm kín không hồi sinh vé cũ |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 15 test xanh trên PostgreSQL thật
- [ ] **`T068-03`** chứng minh lưu băm
- [ ] **`T068-11`** và **`T068-12`** chứng minh không rò mã
- [ ] **`T068-08`** với rào đồng bộ
- [ ] `T068-05` không tiết lộ phòng có tồn tại hay không

### Contract bổ sung bắt buộc

Dùng watch_epoch cho mọi WATCH, bao gồm direct invitation. Tham chiếu ROOM-CHAT §2–3; sai/hết hạn/đã dùng/thu hồi không có metadata và dùng ROOM_ACCESS_UNAVAILABLE.

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-068.md`

## 9. ⚠ CẠM BẪY
Đưa mã vào dữ liệu phòng để *"tiện hiển thị cho chủ phòng"* khiến **mọi thành viên, kể cả người xem**, đọc được mã chơi ⇒ ai cũng vào được ghế chơi. `T068-11` kiểm trực tiếp nội dung gói tin gửi cho **người xem**.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** CodeService dùng alphabet chính xác§5, CSPRNG và HMAC-SHA256 secret server; raw chỉ trả issuer. PLAY single-use, WATCH reusable 24 h; join 063 consume nguyên tử. Rotate Host gọi revoke 066 cùng transaction, epoch++ và cấp WATCH mới nếu không LOCKED.

**Tiền điều kiện cụ thể:** Host A, B/C PLAY candidates, S1–S6; clock t0; grant schema 037, rotate primitive 066; capture packets/logs với raw code canary trong memory.

**File kiểm thử:** `tests/integration/issue-068.test.ts` · `tests/unit/issue-068.test.ts`. Giữ tên `T068-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T068-01` | Sinh mã; length 8 và từng ký tự thuộc alphabet, không thêm ký tự tự chọn. | Mã sinh ra đúng **8 ký tự** từ bảng chữ quy định |
| `T068-02` | Sinh 10000 mã; tất cả không I/O/0/1; không dùng test này thay chứng minh CSPRNG. | ⭐ Mã **không chứa** `I` `O` `0` `1` — thử sinh 10.000 mã |
| `T068-03` | Tạo mã rồi query row; lưu HMAC hex, không raw trong cột/JSON/log. | ⭐ **Cơ sở dữ liệu lưu BĂM, không lưu mã gốc** |
| `T068-04` | B dùng code PLAY qua join 063; PLAYER đúng side, consume trong cùng commit. | Mã đúng → vào phòng được |
| `T068-05` | Mã sai/expired/revoked; so 404/code/message/shape, không room metadata. | Mã sai / hết hạn / đã thu hồi → **CÙNG MỘT** thông báo |
| `T068-06` | B consume PLAY rồi rời fixture; C dùng lại; lỗi chung, không membership. | ⭐ Mã `PLAY` dùng lần hai → **từ chối** |
| `T068-07` | WATCH cho S1…S5 thành công; S6 valid proof ROOM_FULL. | Mã `WATCH` dùng nhiều lần → được, tới khi đủ 5 |
| `T068-08` | B/C cùng PLAY code, 2 connection/barrier 20 lần; 1 success, 1 consume, không orphan. | ⭐ **Hai người dùng mã `PLAY` cho ghế cuối ĐỒNG THỜI → ĐÚNG MỘT thành công** |
| `T068-09` | Rotate với 5 spectator; mã cũ vô hiệu, 5 membership mất, epoch tăng và mã mới khác. | ⭐ Đổi mã xem → mã cũ **vô hiệu** + **toàn bộ người xem bị thu hồi** |
| `T068-10` | B không Host raw rotate; FORBIDDEN, epoch/grants giữ. | Không phải chủ phòng đổi mã xem → **FORBIDDEN** |
| `T068-11` | A/B/S1 subscribe room; raw response cho người không phát hành không chứa code/hash/secret. | ⭐ **Dữ liệu phòng gửi cho thành viên KHÔNG chứa mã** |
| `T068-12` | Bắt log create/use/failure/rotate; không raw code canary. | ⭐ **Log không chứa mã** |
| `T068-13` | Clock expires−1 ms/at/+1 ms với code thực; trước vào được, đúng/sau lỗi chung. | Mã hết hạn sau **24 giờ** — đồng hồ giả |
| `T068-14` | Rotate PUBLIC; vẫn ở lobby, direct/code/link WATCH cũ revoked; PLAY giữ. | Rotate WATCH ở PUBLIC không ẩn sảnh; invalidate code/link/direct WATCH và tất cả SPECTATOR, không revoke PLAY |
| `T068-15` | LOCKED create/rotateWATCH bị từ chối; reopen không revive old WATCH. | LOCKED không cấp/rotate WATCH; giảm kín không hồi sinh vé cũ |



### 10.3 Điểm triển khai cần giữ đúng

```ts
import { createHmac, randomInt } from 'node:crypto';
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function newRoomCode(secret: string) {
  const raw = Array.from({ length: 8 }, () => alphabet[randomInt(alphabet.length)]).join('');
  return { raw, hash: createHmac('sha256', secret).update(raw).digest('hex') };
}
// Chỉ hash được lưu. Không suy kích thước bảng chữ từ mô tả “32”; dùng chuỗi chuẩn.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **lưu plaintext hoặc consume PLAY trước nhận ghế**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-068.md`.

```bash
pnpm test:integration -- tests/integration/issue-068.test.ts
pnpm test:unit -- tests/unit/issue-068.test.ts
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
| `AC-INV-06` | [REQ-INVITE](../01-requirements/REQ-INVITE.md) | LOCAL |
| `AC-INV-08` | [REQ-INVITE](../01-requirements/REQ-INVITE.md) | LOCAL |
| `AC-INV-11` | [REQ-INVITE](../01-requirements/REQ-INVITE.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
