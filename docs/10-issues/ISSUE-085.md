# ISSUE-085 — Đường xử lý lệnh + thứ tự khoá

**Nhóm:** E11 · **Phụ thuộc:** 084 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Khung xử lý **mọi** lệnh ván cờ — đúng thứ tự, đúng khoá, không bao giờ kẹt chéo.

## 2. ĐỌC TRƯỚC
[../09-technical/architecture.md](../09-technical/architecture.md) **§4 (thứ tự 11 bước), §5 (thứ tự khoá), §9 `ARCH-15`**

## 3. PHẠM VI
**✅ LÀM** — khung xử lý lệnh dùng chung cho mọi lệnh ván
**❌ KHÔNG LÀM** — lệnh cụ thể (087, 104, 105)

## 4. FILE TẠO
`apps/server/src/modules/matches/command-pipeline.ts`

## 5. CÁC BƯỚC
1. ⭐ **Thứ tự 11 bước — BẮT BUỘC đúng** (`ARCH-04`):
   ```
   ① xác thực danh tính
   ② đọc match.room_id (bất biến) để biết khoá phòng nào
   ③ BEGIN
   ④ ONLINE: SELECT room FOR UPDATE   →   rồi SELECT match FOR UPDATE
      AI:     chỉ SELECT match FOR UPDATE
   ⑤ tra biên lai lệnh → đã xử lý thì trả kết quả cũ, KHÔNG làm lại
   ⑥ kiểm ván ACTIVE + phiên bản khớp
   ⑦ TÍNH LẠI ĐỒNG HỒ → hết giờ ⇒ kết thúc ván, TỪ CHỐI lệnh
   ⑧ kiểm lượt · vai trò · luật cờ
   ⑨ áp dụng · version++ · ghi sự kiện
   ⑩ ghi biên lai
   ⑪ COMMIT → rồi MỚI phát tin
   ```
2. **Bước ⑦ TRƯỚC bước ⑧** — hết giờ thì ván kết thúc, **không** nhận nước đi muộn
3. **Thứ tự khoá**: `phòng → người dùng (theo thứ tự id) → ván`. ⛔ **Không bao giờ** khoá ngược
4. ⛔ **`ARCH-07`** — **không giữ khoá** khi gọi AI, gửi email, hay gọi dịch vụ media
5. **`ARCH-05`** — bước ⑨⑩ là **tất cả hoặc không có gì**
6. **`ARCH-06`** — bước ⑪ sau khi commit. Phát tin lỗi **không** huỷ dữ liệu đã lưu
7. **`ARCH-15`** — toàn bộ đường này dùng **SQL thuần**, **không** Prisma
8. Lệnh bị từ chối vì sai luật/sai lượt ⇒ **không** ghi biên lai (`BR-MAT-02`)

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T085-01` | Lệnh hợp lệ đi qua đủ 11 bước, dữ liệu đúng |
| `T085-02` | Foundation: clock phase phát hiện hết hạn trước rule/apply; rule không chạy. TIMEOUT/finalizer thật và late move kiểm tại093 T093-02, race RESIGN ở104. |
| `T085-03` | ⭐ **Phiên bản cũ → `VERSION_CONFLICT`**, không đổi gì |
| `T085-04` | Sai lượt → từ chối, **không đổi dữ liệu** |
| `T085-05` | ⭐ **Lệnh bị từ chối → KHÔNG ghi biên lai** |
| `T085-06` | ⭐ **Lỗi giữa chừng → rollback hoàn toàn**, không lưu nửa vời |
| `T085-07` | ⭐ **Phát tin lỗi sau commit → dữ liệu VẪN được lưu** |
| `T085-08` | ⭐ **Hai lệnh song song cùng ván → xử lý TUẦN TỰ**, không lẫn |
| `T085-09` | ⭐ **Thứ tự khoá đúng** — kiểm bằng thử tạo kẹt chéo có chủ ý |
| `T085-10` | Ván với máy chỉ khoá ván, **không** khoá phòng |
| `T085-11` | ⭐ **Không** gọi dịch vụ ngoài khi đang giữ khoá |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 11 test xanh trên PostgreSQL thật
- [ ] **`T085-02`** chứng minh thứ tự clock trước rules; cổng outcome TIMEOUT thật tại093 và race104 phải có test riêng, không giả finalizer
- [ ] **`T085-09`** không kẹt chéo
- [ ] **`T085-11`** không giữ khoá khi gọi ra ngoài
- [ ] Dùng **SQL thuần**

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-085.md`

## 9. ⚠ CẠM BẪY
Giữ khoá ván trong lúc **chờ máy tính 3 giây** sẽ làm **đứng toàn bộ ván đó**. `ARCH-07` cấm điều này — giao việc cho máy **sau khi** commit và mở khoá.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** CommandPipeline nhận verified actor, MatchCommand 011 và clock; room_id đọc bất biến trước BEGIN; lock room→sorted users→match, receipt/current authority→ACTIVE/version→clock→rules→apply+event+receipt→COMMIT→broadcast. Foundation dùng callback có kiểu để kiểm transaction; không triển khai các lệnh 087/104 trước scope.

**Tiền điều kiện cụ thể:** PostgreSQL thật với room/match/events/receipts 038/039, hai connection; controlled callbacks chỉ kiểm orchestration/rollback. Timeout finalization thật ở 089/093, không dùng fake callback để chứng nhận kết quả ván.

**File kiểm thử:** `tests/integration/issue-085.test.ts`. Giữ tên `T085-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T085-01` | Dùng transaction callback ghi marker nghiệp vụ vào dữ liệu match fixture; trace các phase, đọc từ connection khác chỉ thấy sau COMMIT. | Lệnh hợp lệ đi qua đủ 11 bước, dữ liệu đúng |
| `T085-02` | Clock phase trả tín hiệu expired trước rule callback; rule callback không chạy; full TIMEOUT finalizer và outcome thuộc 093 T093-02, không báo terminal DB đã đúng ở 085. | Foundation: clock phase phát hiện hết hạn trước rule/apply; rule không chạy. TIMEOUT/finalizer thật và late move kiểm tại 093 T093-02, race RESIGN ở 104. |
| `T085-03` | expectedVersion thấp hơn DB; VERSION_CONFLICT, không marker/event/receipt mới. | ⭐ **Phiên bản cũ → `VERSION_CONFLICT`**, không đổi gì |
| `T085-04` | Actor sai lượt; permission/rule callback từ chối; snapshot DB trước/sau bằng nhau. | Sai lượt → từ chối, **không đổi dữ liệu** |
| `T085-05` | Lệnh validation/turn/rule bị từ chối; query command_receipts count 0 cho commandId. | ⭐ **Lệnh bị từ chối → KHÔNG ghi biên lai** |
| `T085-06` | Throw có kiểm soát sau apply trước receipt; connection mới thấy match/events/receipt đều rollback. | ⭐ **Lỗi giữa chừng → rollback hoàn toàn**, không lưu nửa vời |
| `T085-07` | Sau COMMIT adapter publish thất bại; query connection khác thấy mutation/receipt vẫn tồn tại, retry idempotent ở 086. | ⭐ **Phát tin lỗi sau commit → dữ liệu VẪN được lưu** |
| `T085-08` | Hai command cùng expectedVersion qua barrier; lock serializes, chỉ một mutation được nhận. | ⭐ **Hai lệnh song song cùng ván → xử lý TUẦN TỰ**, không lẫn |
| `T085-09` | Ghi lock trace với pg_backend_pid; 2 transactions khác paths nhưng cùng room→users→match không deadlock; mutation đảo thứ tự phải bị test phát hiện. | ⭐ **Thứ tự khoá đúng** — kiểm bằng thử tạo kẹt chéo có chủ ý |
| `T085-10` | AI match room_id=NULL; query trace không lock room, lock match đúng. | Ván với máy chỉ khoá ván, **không** khoá phòng |
| `T085-11` | Giữ callback ngoại vi ngoài transaction tại barrier; connection khác lấy lock được trước khi callback được giải phóng; không sleep. | ⭐ **Không** gọi dịch vụ ngoài khi đang giữ khoá |

T085-02 chỉ chứng minh clock-before-rules trong foundation. Kết thúc TIMEOUT thật, precedence, receipt và late move phải kiểm ở ISSUE-093; ISSUE-104 kiểm race TIMEOUT/RESIGN với finalizer 089. Các case đó không được `.skip` tại 085, mà có file test thực ở issue sở hữu.

### 10.3 Điểm triển khai cần giữ đúng

```ts
// Signature nội bộ cần xuất từ command-pipeline.ts; T là snapshot/result contract011.
import type { PoolClient } from 'pg';
export type TransactionStep<T> = (tx: PoolClient) => Promise<T>;
export type AfterCommit<T> = (result: T) => Promise<void>;
// Không cho callback AfterCommit nhận PoolClient để vô tình gọi mạng trong transaction.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **phát event trước COMMIT hoặc đảo lock match trước room**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-085.md`.

```bash
pnpm test:integration -- tests/integration/issue-085.test.ts
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

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
