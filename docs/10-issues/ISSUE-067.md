# ISSUE-067 — Giao diện sảnh · tạo phòng · phòng chờ

**Nhóm:** E07 · **Phụ thuộc:** 066 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Ba màn hình phòng, cập nhật thời gian thực, có **đủ trạng thái**.

## 2. ĐỌC TRƯỚC
[../03-screens/screen-inventory.md](../03-screens/screen-inventory.md) §1–§3, §6 · [../02-flows/FLOW-CREATE-ROOM.md](../02-flows/FLOW-CREATE-ROOM.md)

## 3. PHẠM VI
**✅ LÀM** — `/lobby` · cửa sổ tạo phòng · phòng chờ
**❌ KHÔNG LÀM** — bàn cờ (078) · mời (072)

## 4. FILE TẠO
`apps/web/src/features/lobby/LobbyPage.tsx` · `CreateRoomModal.tsx` · `apps/web/src/features/room/WaitingRoom.tsx`

## 5. CÁC BƯỚC
1. **Sảnh** — mỗi phòng hiện đúng 5 thông tin: tên · chủ phòng · cấu hình thời gian · trạng thái · **số người xem / 5**
2. Ba nút chính: **Tạo phòng** · **Nhập mã** · **Chơi với máy**
3. **Trạng thái bắt buộc**:
   | Trạng thái | Nội dung |
   |---|---|
   | Đang tải | khung xương danh sách |
   | **Trống** | *"Chưa có phòng công khai nào"* + nút Tạo phòng + Chơi với máy |
   | Lỗi | thông báo + **Thử lại** |
   | **Vô hiệu** | nút mờ khi đang ở phòng khác, **kèm giải thích + nút quay lại phòng đó** |
4. **Phòng chờ** hiện: hai ghế với bên cầm quân · dấu sẵn sàng · số người xem · nút Sẵn sàng
   Nút Sẵn sàng dùng được khi một PLAYER; ghi nhận xong hiện chờ đối thủ + Bỏ sẵn sàng (BR-ROOM-21). Đổi thời gian thành công: cập nhật thời gian mới, xoá dấu ready cả hai, giải thích phải sẵn sàng lại (BR-ROOM-22).
5. **Xác nhận rời khi đang chơi** phải ghi rõ: *"Rời phòng lúc này được tính là **đầu hàng**. Bạn sẽ thua ván này."* (`screen-inventory` §6)
6. Cập nhật **thời gian thực**: phòng mới/đóng · số người xem · người vào/rời · ván bắt đầu

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T067-01` | Sảnh hiện đủ 5 thông tin mỗi phòng |
| `T067-02` | ⭐ **Trạng thái trống** có lời giải thích + 2 nút gợi ý |
| `T067-03` | ⭐ Đang ở phòng khác → nút tạo/vào **vô hiệu**, **có giải thích** + nút quay lại |
| `T067-04` | ⭐ Tạo phòng ở phiên A → **sảnh phiên B cập nhật ngay** |
| `T067-05` | Người thứ 2 vào → phòng chờ **cập nhật ngay** ở cả hai phiên |
| `T067-06` | Máy chủ xác nhận đủ hai PLAYER online/ready theo cấu hình hiện hành → **tự chuyển** sang màn bàn cờ |
| `T067-07` | Một PLAYER: nút Sẵn sàng dùng được, ghi thành công hiện đã sẵn sàng/chờ đối thủ và Bỏ sẵn sàng; vẫn ở phòng chờ, chưa hiện bàn cờ |
| `T067-08` | ⭐ **Xác nhận rời khi đang chơi ghi rõ "đầu hàng"** |
| `T067-09` | Mobile 360px → **không tràn ngang** |
| `T067-10` | Lỗi mạng → hiện lỗi + **Thử lại** |
| `T067-11` | Cửa sổ tạo phòng đóng được bằng **X**, **Esc**, bấm ra ngoài |
| `T067-12` | B đã ready ở 15 phút, Host đổi 5 phút: cả hai phiên thấy thời gian mới/chưa ready + lý do; phải bấm lại, không tự start bằng ready cũ |
| `T067-13` | UI đổi bên có request/pending/accept/decline/cancel/expiry và disabled khi thiếu hai online; không tự retry stale ready |
| `T067-14` | B ready cấu hình cũ, Host đổi: hiển thị cấu hình/reason reset; request cũ tới muộn không đổi UI thành ready |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 14 test xanh ở cả 2 kích thước
- [ ] **`T067-08`** cảnh báo đầu hàng đúng chữ
- [ ] **`T067-03`** trạng thái vô hiệu có giải thích
- [ ] `T067-04` và `T067-05` cập nhật thời gian thực
- [ ] `T067-11` tuân thủ `SCR-RULE-02`

### Contract bổ sung bắt buộc

UI gửi đủ membershipId/configRevision/readyRevision theo ROOM-CHAT §1, refresh snapshot khi conflict và yêu cầu người dùng bấm lại. Đóng modal swap bằng X/Esc chỉ ẩn, không tự gửi cancel.

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-067.md` — ảnh chụp sảnh (có dữ liệu + trống) và phòng chờ.

## 9. ⚠ CẠM BẪY
Không cảnh báo rõ *"rời = đầu hàng"* sẽ khiến người chơi **thua oan** vì tưởng chỉ là thoát ra. Đây là yêu cầu bắt buộc trong `screen-inventory` §6.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** LobbyPage/CreateRoomModal/WaitingRoom dùng 061–066 và 084; ready gửi membershipId/configRevision/readyRevision, không tự retry stale. Side-swap có lifecycle request/respond/cancel. Match route chuyển sau server ACK; bàn SVG tích hợp 091.

**Tiền điều kiện cụ thể:** Hai browser A/B + spectator; 1366×768/360×800; time 900, đủ fixture empty/error/active-other-room/solo/two online.

**File kiểm thử:** `tests/e2e/issue-067.spec.ts`. Giữ tên `T067-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T067-01` | Sảnh có phòng fixture; đọc name/Host/time/status/spectator n/5. | Sảnh hiện đủ 5 thông tin mỗi phòng |
| `T067-02` | DB không PUBLIC room; thông báo trống và 2 nút gợi ý có accessible name. | ⭐ **Trạng thái trống** có lời giải thích + 2 nút gợi ý |
| `T067-03` | A ở R0, mở sảnh; create/join disabled có lý do và nút quay R0. | ⭐ Đang ở phòng khác → nút tạo/vào **vô hiệu**, **có giải thích** + nút quay lại |
| `T067-04` | A create thật 061; B nhận room mới qua socket, không reload/polling. | ⭐ Tạo phòng ở phiên A → **sảnh phiên B cập nhật ngay** |
| `T067-05` | B join primitive endpoint đã có; A/B đều thấy ghế và side mới. | Người thứ 2 vào → phòng chờ **cập nhật ngay** ở cả hai phiên |
| `T067-06` | Cả hai ready; chỉ sau START ACK chuyển match route; SVG091 kiểm sau, không dựng bàn giả. | Máy chủ xác nhận đủ hai PLAYER online/ready theo cấu hình hiện hành → **tự chuyển** sang màn bàn cờ |
| `T067-07` | Solo Host ready rồi unready; nút hoạt động, text chờ đối thủ, zero Match. | Một PLAYER: nút Sẵn sàng dùng được, ghi thành công hiện đã sẵn sàng/chờ đối thủ và Bỏ sẵn sàng; vẫn ở phòng chờ, chưa hiện bàn cờ |
| `T067-08` | Mở confirm leave ACTIVE; chữ đầu hàng và thua ván; Huỷ không request. | ⭐ **Xác nhận rời khi đang chơi ghi rõ "đầu hàng"** |
| `T067-09` | 360 px với tên 60 ký tự/error dài; không overflow ngang. | Mobile 360 px → **không tràn ngang** |
| `T067-10` | Abort list/create request; UI error/Thử lại, khôi phục thì thành công thật. | Lỗi mạng → hiện lỗi + **Thử lại** |
| `T067-11` | Modal create: X/Esc/backdrop riêng từng lần; không submit, focus về opener. | Cửa sổ tạo phòng đóng được bằng **X**, **Esc**, bấm ra ngoài |
| `T067-12` | B ready 900, Host đổi 300; cả hai UI mất ready và yêu cầu xác nhận lại, không auto start. | B đã ready ở 15 phút, Host đổi 5 phút: cả hai phiên thấy thời gian mới/chưa ready + lý do; phải bấm lại, không tự start bằng ready cũ |
| `T067-13` | Swap request/pending/accept/decline/cancel/30 s expiry; thiếu 2 online disabled; đóng modal chỉ ẩn, không cancel. | UI đổi bên có request/pending/accept/decline/cancel/expiry và disabled khi thiếu hai online; không tự retry stale ready |
| `T067-14` | Giữ request ready cũ ở barrier, PATCH time rồi trả request; UI giữ cấu hình mới/chưa ready, không tự gửi lại. | B ready cấu hình cũ, Host đổi: hiển thị cấu hình/reason reset; request cũ tới muộn không đổi UI thành ready |



### 10.3 Điểm triển khai cần giữ đúng

```ts
// Request được chụp tại thời điểm bấm; không sửa revisions khi retry tự động.
export function captureReady(membershipId: string, config: number, revision: number, commandId: string) {
  return { membershipId, expectedConfigRevision: config, expectedReadyRevision: revision, commandId, ready: true };
}
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **UI tự retry ready stale sau thay time hoặc chỉ disable solo ready**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-067.md`.

```bash
pnpm test:e2e -- tests/e2e/issue-067.spec.ts
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
| `AC-LOB-09` | [REQ-LOBBY](../01-requirements/REQ-LOBBY.md) | LOCAL |
| `AC-ROOM-22` | [REQ-ROOM](../01-requirements/REQ-ROOM.md) | LOCAL |
| `AC-CLK-01` | [REQ-CLOCK](../01-requirements/REQ-CLOCK.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
