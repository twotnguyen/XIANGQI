# ISSUE-059 — Presence online

**Nhóm:** E06 · **Phụ thuộc:** 058, 084 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Bạn bè thấy nhau **online / ngoại tuyến** — và **không** thấy đang ở phòng nào.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-PROFILE-FRIENDS.md](../01-requirements/REQ-PROFILE-FRIENDS.md) §9 **`BR-FRD-07`, `BR-FRD-08`, `BR-FRD-09`**

## 3. PHẠM VI
**✅ LÀM** — theo dõi online · phát cho bạn bè
**❌ KHÔNG LÀM** — presence trong ván (095)

## 4. FILE TẠO
`apps/server/src/realtime/presence.service.ts`

## 5. CÁC BƯỚC
1. Người dùng **online** khi có **ít nhất một** kết nối đã xác thực
2. Tín hiệu duy trì **10 giây**; hết hạn **30 giây** không nhận được ⇒ chuyển ngoại tuyến
3. **`BR-FRD-09`** — mở **nhiều tab** vẫn tính là **một** người online. Đóng 1 trong 3 tab **không** làm ngoại tuyến
4. **`BR-FRD-07` — LUẬT RIÊNG TƯ**: bạn bè **chỉ** biết online/ngoại tuyến.
   ⛔ **Tuyệt đối không** phát `roomId`, tên phòng, hay đang chơi với ai
5. Sự kiện đổi trạng thái **chỉ** gửi cho **bạn bè đã chấp nhận** — không phát rộng

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T059-01` | Kết nối → bạn bè thấy **online** |
| `T059-02` | Ngắt kết nối → bạn bè thấy **ngoại tuyến** sau khi hết hạn |
| `T059-03` | ⭐ **Mở 3 tab, đóng 1 → VẪN online** |
| `T059-04` | Đóng **cả 3** tab → ngoại tuyến |
| `T059-05` | ⭐ **Người LẠ không nhận** sự kiện trạng thái |
| `T059-06` | ⭐ Quan hệ **đang chờ** (chưa chấp nhận) → **không** nhận sự kiện |
| `T059-07` | ⛔ **Dữ liệu presence KHÔNG chứa `roomId` hay tên phòng** |
| `T059-08` | Bạn đang ở **phòng khoá** → bạn bè vẫn **chỉ** thấy online |
| `T059-09` | Đồng hồ giả: tín hiệu đúng hạn → giữ online; quá 30 giây → ngoại tuyến |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 9 test xanh
- [ ] **`T059-07`** kiểm **toàn bộ** nội dung sự kiện
- [ ] **`T059-03`** nhiều tab tính một người
- [ ] `T059-05` và `T059-06` chỉ bạn bè nhận
- [ ] Test thời gian dùng **đồng hồ giả**

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-059.md`

## 9. ⚠ CẠM BẪY
Gửi kèm `roomId` vào dữ liệu presence để *"tiện hiển thị"* là **vi phạm riêng tư** — bạn bè sẽ biết bạn đang ở phòng riêng tư nào. `BR-FRD-07` cấm điều này, `T059-07` kiểm trực tiếp nội dung gói tin.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** PresenceService nhận authenticated connection/session từ 084; online nếu≥1 kết nối còn heartbeat, heartbeat 10 s, expiry 30 s; payload chỉ userId+online, audience accepted friends đọc tại dispatch. Không roomId/status ván.

**Tiền điều kiện cụ thể:** A–B accepted, A–C pending, S1 stranger; A ba socket thật; clock tiêm, flush scheduler không sleep.

**File kiểm thử:** `tests/integration/issue-059.test.ts`. Giữ tên `T059-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T059-01` | Kết nối socket A, B đã subscribe cá nhân; B nhận online A. | Kết nối → bạn bè thấy **online** |
| `T059-02` | Ngắt A và clock tới expiry; B nhận offline, không cần refresh. | Ngắt kết nối → bạn bè thấy **ngoại tuyến** sau khi hết hạn |
| `T059-03` | Ba socket A, đóng 1, heartbeat 2 còn lại; B vẫn online, không offline event. | ⭐ **Mở 3 tab, đóng 1 → VẪN online** |
| `T059-04` | Đóng cả 3, tick hết hạn; đúng 1 transition offline. | Đóng **cả 3** tab → ngoại tuyến |
| `T059-05` | S1 lắng nghe mọi event đã công bố; A online/offline; không event presence A tớiS1. | ⭐ **Người LẠ không nhận** sự kiện trạng thái |
| `T059-06` | C chỉ pending với A; A online; C không event. | ⭐ Quan hệ **đang chờ** (chưa chấp nhận) → **không** nhận sự kiện |
| `T059-07` | Thu raw packets B khi A online/offline; keys whitelist, không roomId/name/opponent. | ⛔ **Dữ liệu presence KHÔNG chứa `roomId` hay tên phòng** |
| `T059-08` | Seed membership A phòng LOCKED, lặp presence; payload y như ngoài phòng. | Bạn đang ở **phòng khoá** → bạn bè vẫn **chỉ** thấy online |
| `T059-09` | Heartbeat t0, t 10, t 20; tại 49.999 s còn online, 50 s hết hạn; timer cũ không xoá heartbeat mới. | Đồng hồ giả: tín hiệu đúng hạn → giữ online; quá 30 giây → ngoại tuyến |



### 10.3 Điểm triển khai cần giữ đúng

```ts
export function userOnline(lastSeen: readonly number[], now: number): boolean {
  return lastSeen.some(t => now < t + 30_000);
}
// lastSeen lấy từ các connection đã xác thực; không lấy timestamp client.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **đánh offline ngay khi 1 tabdisconnect hoặc phát roomId**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-059.md`.

```bash
pnpm test:integration -- tests/integration/issue-059.test.ts
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
| `AC-FRD-11` | [REQ-PROFILE-FRIENDS](../01-requirements/REQ-PROFILE-FRIENDS.md) | LOCAL |
| `AC-FRD-12` | [REQ-PROFILE-FRIENDS](../01-requirements/REQ-PROFILE-FRIENDS.md) | LOCAL |
| `AC-FRD-13` | [REQ-PROFILE-FRIENDS](../01-requirements/REQ-PROFILE-FRIENDS.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
