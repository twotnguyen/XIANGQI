# ISSUE-062 — Sảnh + phân trang + lọc trạng thái

**Nhóm:** E07 · **Phụ thuộc:** 061, 084 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Danh sách phòng công khai — **chỉ đang chờ và đang chơi**, không hiện phòng đã xong ván.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-LOBBY.md](../01-requirements/REQ-LOBBY.md) §9 **`BR-LOB-09`** · [../07-decisions/decision-log.md](../07-decisions/decision-log.md) **`DEC-023`**

## 3. PHẠM VI
**✅ LÀM** — `GET /rooms` · cập nhật thời gian thực
**❌ KHÔNG LÀM** — giao diện (067)

## 4. FILE TẠO
`apps/server/src/modules/rooms/lobby.service.ts`

## 5. CÁC BƯỚC
1. `GET /api/v1/rooms?cursor=` — phân trang **20 mỗi trang**, mới nhất trước
2. **Điều kiện lọc — `DEC-023`**:
   ```sql
   WHERE visibility = 'PUBLIC'
     AND status IN ('WAITING', 'PLAYING')
   ```
   ⛔ **KHÔNG** gồm `FINISHED` — phòng đã xong ván **không hiện ở sảnh**, nhưng **WATCH vào được bằng mã/link nếu đủ quyền**; FINISHED không nhận PLAY mới (DEC-032)
3. Mỗi phòng trả: `id` · `name` · tên hiển thị chủ phòng · `timeControl` · `status` · `spectatorCount` · `playerCount`
   ⛔ **Không** trả nội dung ván (thế cờ, nước đi) — muốn xem phải vào phòng (`BR-LOB-05`)
4. Phát sự kiện thời gian thực cho người đang ở sảnh khi: phòng mới · phòng đóng · đổi chế độ · đổi số người xem · ván bắt đầu/kết thúc
5. **Ván kết thúc ⇒ phòng biến mất khỏi sảnh. Tái đấu ⇒ xuất hiện lại** (`BR-LOB-10`)

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T062-01` | Chỉ phòng **công khai** hiện ở sảnh |
| `T062-02` | ⭐ Phòng **cần mã** và **khoá** → **không** hiện |
| `T062-03` | ⭐ **Phòng ĐÃ XONG VÁN → KHÔNG hiện ở sảnh** (`DEC-023`) |
| `T062-04` | ⭐ **Tái đấu → phòng XUẤT HIỆN LẠI** |
| `T062-05` | Phòng **đã đóng** → không hiện |
| `T062-06` | Phân trang đúng **20** mỗi trang, thứ tự mới nhất trước |
| `T062-07` | ⭐ Phản hồi **không** chứa thế cờ hay nước đi |
| `T062-08` | Tạo phòng công khai → người ở sảnh nhận **sự kiện thời gian thực** |
| `T062-09` | Đổi công khai → khoá → phòng **biến mất** khỏi sảnh người khác |
| `T062-10` | Số người xem đổi → sảnh cập nhật |
| `T062-11` | Truy vấn dùng index — có `EXPLAIN` |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 11 test xanh
- [ ] **`T062-03`** và **`T062-04`** đúng `DEC-023`
- [ ] **`T062-07`** không rò nội dung ván
- [ ] `T062-02` không lộ phòng riêng tư
- [ ] Báo cáo có `EXPLAIN`

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-062.md`

## 9. ⚠ CẠM BẪY
Truy vấn `status <> 'CLOSED'` sẽ **vô tình gồm cả `FINISHED`** — người lạ lạc vào phòng đang chờ tái đấu. `DEC-023` yêu cầu liệt kê **tường minh** `IN ('WAITING','PLAYING')`.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** GET /rooms cursor stable (created_at, id), limit 20; chỉ PUBLIC WAITING/PLAYING; projection whitelist§5. Realtime 084 phát added/updated/removed sau commit, audience lobby không được position/moves.

**Tiền điều kiện cụ thể:** Seed 45 phòng cùng timestamp và khác id, đủ 3 visibility×4 status; lobby sockets A/B, EXPLAIN data đủ lớn.

**File kiểm thử:** `tests/integration/issue-062.test.ts`. Giữ tên `T062-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T062-01` | GET lobby với đủ 9/12 tổ hợp; chỉ PUBLIC WAITING/PLAYING. | Chỉ phòng **công khai** hiện ở sảnh |
| `T062-02` | Socket lobby + GET trước/sau tạo CODE_ONLY/LOCKED; không metadata phòng kín. | ⭐ Phòng **cần mã** và **khoá** → **không** hiện |
| `T062-03` | Seed PUBLIC FINISHED; GET không có, projection remove nếu từng PLAYING. | ⭐ **Phòng ĐÃ XONG VÁN → KHÔNG hiện ở sảnh** (`DEC-023`) |
| `T062-04` | Chuyển fixture FINISHED→PLAYING trong transaction; projection add; rematch thật nghiệm thu 127. | ⭐ **Tái đấu → phòng XUẤT HIỆN LẠI** |
| `T062-05` | Seed CLOSED; GET/events không add room. | Phòng **đã đóng** → không hiện |
| `T062-06` | 45 rooms, paginate 20/20/5 với cursor (timestamp, id); không trùng/bỏ sót khi timestamp bằng nhau. | Phân trang đúng **20** mỗi trang, thứ tự mới nhất trước |
| `T062-07` | Seed position, moves, email, code canary; whitelist GET và raw packets không canary. | ⭐ Phản hồi **không** chứa thế cờ hay nước đi |
| `T062-08` | Create PUBLIC qua 061 khiB ở lobby; B nhận event trước bất kỳ polling nào. | Tạo phòng công khai → người ở sảnh nhận **sự kiện thời gian thực** |
| `T062-09` | Settings visibility qua 066 chưa có: kiểm committed projection PUBLIC→LOCKED ở 062; request thật T066-09. | Đổi công khai → khoá → phòng **biến mất** khỏi sảnh người khác |
| `T062-10` | Membership fixture thay đổi commit; projection spectatorCount chính xác; join thật 073/074 regression. | Số người xem đổi → sảnh cập nhật |
| `T062-11` | EXPLAIN ANALYZE BUFFERS exact query, lưu index plan; không tắt seqscan ép index. | Truy vấn dùng index — có `EXPLAIN` |



### 10.3 Điểm triển khai cần giữ đúng

```sql
SELECT id, name, status, time_control, created_at
FROM rooms
WHERE visibility='PUBLIC' AND status IN ('WAITING','PLAYING')
  AND (created_at,id) < ($1::timestamptz,$2::uuid)
ORDER BY created_at DESC,id DESC LIMIT 20;
-- Trang đầu bỏ predicate cursor; output DTO không gồm created_at nếu contract không công khai.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **lọc status<>CLOSED làm FINISHED lộ ởsảnh**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-062.md`.

```bash
pnpm test:integration -- tests/integration/issue-062.test.ts
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
| `AC-LOB-01` | [REQ-LOBBY](../01-requirements/REQ-LOBBY.md) | LOCAL |
| `AC-LOB-02` | [REQ-LOBBY](../01-requirements/REQ-LOBBY.md) | LOCAL |
| `AC-LOB-08` | [REQ-LOBBY](../01-requirements/REQ-LOBBY.md) | LOCAL |
| `AC-LOB-11` | [REQ-LOBBY](../01-requirements/REQ-LOBBY.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
