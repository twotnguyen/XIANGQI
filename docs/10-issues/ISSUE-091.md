# ISSUE-091 — Giao diện ván online thời gian thực

**Nhóm:** E11 · **Phụ thuộc:** 090, 083 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Màn hình phòng chơi hoàn chỉnh, **đồng bộ thời gian thực** giữa 7 người.

## 2. ĐỌC TRƯỚC
[../03-screens/design-tokens.md](../03-screens/design-tokens.md) **§6, §7 (bố cục)** · [../02-flows/FLOW-MATCH.md](../02-flows/FLOW-MATCH.md)

## 3. PHẠM VI
**✅ LÀM** — bố cục phòng chơi · đồng bộ thời gian thực · trạng thái
**❌ KHÔNG LÀM** — chat (111) · media (116) · treo ván (103)

## 4. FILE TẠO
`apps/web/src/features/match/GameRoom.tsx` · `lib/realtime.ts` · `useMatchState.ts`

## 5. CÁC BƯỚC
1. **Bố cục máy tính** (`DT` §6): thanh điều hướng · hàng media riêng **không đè bàn cờ** · bàn cờ trung tâm · panel phải (lượt/đồng hồ · lịch sử nước · chat · người xem) · hàng nút dưới
2. **Bố cục điện thoại** (`DT` §7): thanh dính lượt/đồng hồ · bàn cờ **toàn chiều ngang** · **tab** Ván/Chat/Camera · hàng nút
3. Trạng thái ván dùng **Zustand**; đọc HTTP dùng **TanStack Query** (`DEC-025`)
4. Đồng bộ lại: khi kết nối · sau xung đột · **định kỳ 15 giây**
5. ⭐ **`BR-MAT-16`** — **không bao giờ** vẽ nước đi là "đã xong" trước khi máy chủ xác nhận. Trạng thái tạm phải **phân biệt rõ**
6. Máy chủ từ chối ⇒ **hoàn lại** bàn cờ theo trạng thái máy chủ + báo lý do
7. **Trạng thái bắt buộc**: đang tải · đang gửi · xung đột (tự đồng bộ, báo nhẹ) · mất kết nối · ván kết thúc
8. ⭐ **`SCR-RULE-05`** — thông báo tạm **không được che** nút Đầu hàng

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T091-01` | ⭐ **A đi nước → B thấy NGAY, không cần tải lại** |
| `T091-02` | ⭐ **5 người xem thấy nước đi CÙNG LÚC với người chơi** |
| `T091-03` | ⭐ **Máy chủ từ chối → bàn cờ HOÀN LẠI đúng trạng thái máy chủ** |
| `T091-04` | ⭐ **Đang gửi phân biệt rõ với đã xong** |
| `T091-05` | Mất mạng → hiện lớp phủ; nối lại → **tự đồng bộ** |
| `T091-06` | Ván kết thúc → màn kết quả, bàn cờ **chỉ đọc** |
| `T091-07` | ⭐ **Media KHÔNG đè bàn cờ** ở máy tính |
| `T091-08` | ⭐ **Mobile 360px: bàn cờ toàn chiều ngang, KHÔNG tràn ngang** |
| `T091-09` | ⭐ **Thông báo tạm KHÔNG che nút Đầu hàng** |
| `T091-10` | Đồng hồ và lượt **luôn nhìn thấy** ở điện thoại (thanh dính) |
| `T091-11` | Đồng bộ định kỳ 15 giây hoạt động |
| `T091-12` | ⭐ **Hai tab cùng người: đi ở tab 1 → tab 2 thấy ngay**, cả hai vẫn bấm được (`DEC-020`) |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 12 test xanh với **8 phiên** ở cả 2 kích thước
- [ ] **`T091-01`** và **`T091-02`** đồng bộ thời gian thực
- [ ] **`T091-03`** hoàn lại đúng
- [ ] **`T091-08`** không tràn ngang
- [ ] **`T091-12`** đúng mô hình nhiều tab mới

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-091.md` — ảnh chụp bố cục máy tính và điện thoại.

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| **Client phải hỏi liên tục mỗi 1,5 giây** thay vì nhận đẩy (`F-06`) | `T091-01` — phải thấy **ngay**, không chờ chu kỳ |
| Vẽ nước đi trước khi máy chủ xác nhận ⇒ hiển thị sai khi bị từ chối | `T091-03`, `T091-04` |

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** GameRoom/useMatchState dùng 090+board 083, Zustand cho matchstate/TanStackQuery HTTP; realtime 084 thaypolling nhanh. Chờ ACK server trước confirmed position; resyncconnect/conflict/gap/15 s. UIslots chat/media dành cho 111/116, không claim RTP.

**Tiền điều kiện cụ thể:** 8 browser phiên: A1/A2, B, S1…S5; matchcreated 064, realmove 087/finalizer 089; 1366×768/360×800; networkbarrier làm pending/error deterministic.

**File kiểm thử:** `tests/e2e/issue-091.spec.ts`. Giữ tên `T091-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T091-01` | A1 đi thật; B nhận version mới và render trước 15 sresync, packet trace chứng minh push. | ⭐ **A đi nước → B thấy NGAY, không cần tải lại** |
| `T091-02` | 5 spectatorbrowsers nhận cùng version/position, không reload; ghi độ trễ từng client không hứa exact timestamp. | ⭐ **5 người xem thấy nước đi CÙNG LÚC với người chơi** |
| `T091-03` | Giữ move pending, rồi serverconflict/illegal; UI quay về snapshot server và lý do lỗi. | ⭐ **Máy chủ từ chối → bàn cờ HOÀN LẠI đúng trạng thái máy chủ** |
| `T091-04` | Pendingrequest ở barrier; sourcepiecevẫnconfirmedcũ hoặcghost phân biệt, không coi là đã xong. | ⭐ **Đang gửi phân biệt rõ với đã xong** |
| `T091-05` | DisconnectB, Ađi, reconnect B; lớp phủ đóng sauresync, state khớp server. | Mất mạng → hiện lớp phủ; nối lại → **tự đồng bộ** |
| `T091-06` | Finalizefixturequa 089; màn kết quả/read-only, tap/Enter không MOVE. | Ván kết thúc → màn kết quả, bàn cờ **chỉ đọc** |
| `T091-07` | Desktop: đoBBoxmediaslot và board intersection 0; actualmedia ở 116. | ⭐ **Media KHÔNG đè bàn cờ** ở máy tính |
| `T091-08` | 360 px: boardfullavailablewidth, scrollWidth<=innerWidth, tabpanels không ép ngang. | ⭐ **Mobile 360 px: bàn cờ toàn chiều ngang, KHÔNG tràn ngang** |
| `T091-09` | Hiện toast dài khiACTIVE; BBoxtoastkhôngche vùng nút Đầu hàng; handler đầy đủ 104 sau. | ⭐ **Thông báo tạm KHÔNG che nút Đầu hàng** |
| `T091-10` | Mobile cuộnpanels; stickyturn/clock vẫn trongviewport. | Đồng hồ và lượt **luôn nhìn thấy** ở điện thoại (thanh dính) |
| `T091-11` | Advanceclientclock 14.999/15 s; đúng resync request định kỳ, không 1.5 spoll; backgroundrequest không gia hạn app session. | Đồng bộ định kỳ 15 giây hoạt động |
| `T091-12` | A1 move→A2 render; A2 vẫn được gửi ýđịnh và server phân xử turn/version, không khóa tab điều khiển. | ⭐ **Hai tab cùng người: đi ở tab 1 → tab 2 thấy ngay**, cả hai vẫn bấm được (`DEC-020`) |



### 10.3 Điểm triển khai cần giữ đúng

```ts
export const RESYNC_INTERVAL_MS = 15_000;
// Timer là fallback đồng bộ. Handler socket áp snapshot ngay khi event đến.
// Bỏ timer trong test T091-01/02: real socket update vẫn phải làm UI đổi.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **vẽ confirmed move ngay lúc gửi hoặc dùng poll 1.5 s thaypush**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-091.md`.

```bash
pnpm test:e2e -- tests/e2e/issue-091.spec.ts
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
| `AC-BRD-03` | [REQ-BOARD](../01-requirements/REQ-BOARD.md) | LOCAL |
| `AC-BRD-04` | [REQ-BOARD](../01-requirements/REQ-BOARD.md) | LOCAL |
| `AC-BRD-06` | [REQ-BOARD](../01-requirements/REQ-BOARD.md) | LOCAL |
| `AC-BRD-08` | [REQ-BOARD](../01-requirements/REQ-BOARD.md) | LOCAL |
| `AC-BRD-09` | [REQ-BOARD](../01-requirements/REQ-BOARD.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
