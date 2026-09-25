# ISSUE-077 — Giao diện danh sách người xem

**Nhóm:** E09 · **Phụ thuộc:** 076 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Panel danh sách người xem với **nút Đuổi chỉ người chơi thấy**, có xác nhận rõ hậu quả.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-SPECTATOR.md](../01-requirements/REQ-SPECTATOR.md) §13 · [../03-screens/screen-inventory.md](../03-screens/screen-inventory.md) §2, §6

## 3. PHẠM VI
**✅ LÀM** — panel người xem · cửa sổ xác nhận đuổi · màn không vào được
**❌ KHÔNG LÀM** — chat (111) · media (116)

## 4. FILE TẠO
`apps/web/src/features/room/SpectatorList.tsx` · `ConfirmKickModal.tsx` · `AccessDeniedPage.tsx`

## 5. CÁC BƯỚC
1. **Panel** hiện `Người xem (n/5)` + danh sách tên hiển thị
2. **Nút Đuổi chỉ hiện với NGƯỜI CHƠI** — người xem **không thấy** nút này
3. ⭐ **Xác nhận bắt buộc** ghi rõ (`screen-inventory` §6):
   ```
   Đuổi <tên> khỏi phòng?
   Người này sẽ KHÔNG vào lại được phòng này.
   [Huỷ]  [Đuổi]
   ```
4. Người bị đuổi → chuyển sang màn **không vào được** với thông báo *"Bạn đã bị đưa khỏi phòng"* + nút về sảnh
5. Danh sách cập nhật **thời gian thực** khi có người vào/rời/bị đuổi
6. Trạng thái **trống**: *"Chưa có người xem nào"*

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T077-01` | Panel hiện đúng `n/5` và danh sách tên |
| `T077-02` | ⭐ **Người chơi THẤY nút Đuổi** |
| `T077-03` | ⭐ **Người xem KHÔNG thấy nút Đuổi** |
| `T077-04` | ⭐ **Xác nhận ghi rõ "sẽ KHÔNG vào lại được"** |
| `T077-05` | Bấm Huỷ → không đuổi |
| `T077-06` | Bấm Đuổi → người đó về sảnh + thông báo |
| `T077-07` | ⭐ Đuổi xong → **cả phòng thấy số người xem giảm ngay** |
| `T077-08` | Người vào/rời → danh sách cập nhật **thời gian thực** |
| `T077-09` | ⭐ **Trạng thái trống** có lời giải thích |
| `T077-10` | Mobile 360px → không tràn ngang |
| `T077-11` | Cửa sổ xác nhận đóng được bằng **X**, **Esc**, bấm ra ngoài |
| `T077-12` | Dùng được bằng **bàn phím** |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 12 test xanh ở cả 2 kích thước
- [ ] **`T077-03`** — người xem không thấy nút
- [ ] **`T077-04`** — xác nhận đúng chữ
- [ ] `T077-07` — cập nhật thời gian thực
- [ ] `T077-11` tuân thủ `SCR-RULE-02`

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-077.md` — ảnh chụp panel ở góc nhìn người chơi và người xem.

## 9. ⚠ CẠM BẪY
Ẩn nút Đuổi ở giao diện là **chưa đủ** — máy chủ đã kiểm quyền ở issue 076. Nhưng nếu **hiện nút cho người xem** rồi bấm mới báo lỗi thì trải nghiệm tệ. `T077-03` kiểm giao diện đúng vai trò.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** SpectatorList nhận servermembers, actor role; PLAYER thấy Kick, SPECTATOR không. ConfirmKickModal dùng 076; thông báo bị đuổi + Về sảnh. List n/5 tính user/membership không tab.

**Tiền điều kiện cụ thể:** A/BPLAYER, S1…S5 và 8 browser contexts cho 2 tabA; viewport 1366/360, routeaccessdenied thật.

**File kiểm thử:** `tests/e2e/issue-077.spec.ts`. Giữ tên `T077-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T077-01` | Room 3 SPECTATOR; panel 3/5 với 3 tên, thêm tabS1 không thành 4. | Panel hiện đúng `n/5` và danh sách tên |
| `T077-02` | A vàB xem panel; cả 2 có Kick vớiS1. | ⭐ **Người chơi THẤY nút Đuổi** |
| `T077-03` | S1 xem panel; không Kick trongDOM/taborder; rawAPIpermission đã 076. | ⭐ **Người xem KHÔNG thấy nút Đuổi** |
| `T077-04` | A kick S1 mở dialog; copy đúng hậu quả không vào lại phòng này. | ⭐ **Xác nhận ghi rõ "sẽ KHÔNG vào lại được"** |
| `T077-05` | Bấm Huỷ/X/Esc; không kick request, S1 vẫn member. | Bấm Huỷ → không đuổi |
| `T077-06` | ConfirmKick; ACKxongS1 accessdenied có thông báo+Về sảnh, A thấy list mới. | Bấm Đuổi → người đó về sảnh + thông báo |
| `T077-07` | 2 PLAYER/4 SPECTATOR còn lại nhận count giảm không reload. | ⭐ Đuổi xong → **cả phòng thấy số người xem giảm ngay** |
| `T077-08` | S6 join/leave thật; panel mọi người tăng/giảm, không trùng. | Người vào/rời → danh sách cập nhật **thời gian thực** |
| `T077-09` | Room không SPECTATOR; emptycopy đúng. | ⭐ **Trạng thái trống** có lời giải thích |
| `T077-10` | 360 px tên 40 ký tự/dialog; không overflow. | Mobile 360 px → không tràn ngang |
| `T077-11` | X/Esc/backdrop riêng từng lần; focus về Kick opener, không gửi lệnh. | Cửa sổ xác nhận đóng được bằng **X**, **Esc**, bấm ra ngoài |
| `T077-12` | Chỉ Tab/Enter/Space: mở dialog, Huỷ, confirm; focusring và name đủ. | Dùng được bằng **bàn phím** |



### 10.3 Điểm triển khai cần giữ đúng

```ts
export const canShowKick = (actorRole: 'PLAYER' | 'SPECTATOR') => actorRole === 'PLAYER';
// Server076 vẫn kiểm actor/target; predicate UI không phải bằng chứng quyền.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **ẩn sai nút kick cho B hoặc bấm hủy vẫn send**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-077.md`.

```bash
pnpm test:e2e -- tests/e2e/issue-077.spec.ts
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

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
