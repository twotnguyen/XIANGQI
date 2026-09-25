# ISSUE-060 — Giao diện bạn bè

**Nhóm:** E06 · **Phụ thuộc:** 059 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Màn hình bạn bè với 3 tab, có **đủ trạng thái trống** và cập nhật thời gian thực.

## 2. ĐỌC TRƯỚC
[../03-screens/screen-inventory.md](../03-screens/screen-inventory.md) §1, §3 · [../01-requirements/REQ-PROFILE-FRIENDS.md](../01-requirements/REQ-PROFILE-FRIENDS.md) §11

## 3. PHẠM VI
**✅ LÀM** — `/friends` với 3 tab + tìm kiếm · **❌ KHÔNG LÀM** — mời vào phòng (072)

## 4. FILE TẠO
`apps/web/src/features/friends/FriendsPage.tsx` · `UserSearch.tsx`

## 5. CÁC BƯỚC
1. Ba tab: **Bạn bè** · **Lời mời nhận** · **Lời mời đã gửi**
2. Ô tìm kiếm — chỉ gọi API khi đủ **3 ký tự**, có trì hoãn gõ
3. **Trạng thái trống bắt buộc** cho từng tab:
   | Tab | Thông báo |
   |---|---|
   | Bạn bè | *"Chưa có bạn nào — tìm theo tên đăng nhập để kết bạn"* |
   | Lời mời nhận | *"Không có lời mời nào"* |
   | Lời mời đã gửi | *"Bạn chưa gửi lời mời nào"* |
4. Chấm trạng thái online **kèm chữ** — `DT-01` cấm truyền đạt chỉ bằng màu
5. Cập nhật **thời gian thực** khi bạn online/ngoại tuyến, khi có lời mời mới
6. Nút hành động **vô hiệu khi đang gửi**

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T060-01` | Ba tab hiện đúng dữ liệu tương ứng |
| `T060-02` | ⭐ Cả ba tab có **trạng thái trống** với lời giải thích |
| `T060-03` | Gõ 2 ký tự → **không** gọi API; 3 ký tự → có gọi |
| `T060-04` | Gửi lời mời → tab *"đã gửi"* cập nhật **ngay** |
| `T060-05` | ⭐ Bạn online → chấm đổi **thời gian thực**, không cần tải lại |
| `T060-06` | ⭐ Trạng thái online có **chữ** đi kèm, không chỉ màu |
| `T060-07` | Mobile 360px → **không tràn ngang** |
| `T060-08` | Đang gửi → nút **vô hiệu** |
| `T060-09` | Lỗi mạng → hiện lỗi + nút **Thử lại** |
| `T060-10` | Dùng được bằng **bàn phím** |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 10 test xanh ở cả 2 kích thước
- [ ] **`T060-02`** đủ 3 trạng thái trống
- [ ] **`T060-06`** không chỉ dùng màu
- [ ] `T060-05` cập nhật thời gian thực
- [ ] `T060-07` không tràn ngang

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-060.md` — ảnh chụp 3 tab, cả trạng thái có dữ liệu và trạng thái trống.

## 9. ⚠ CẠM BẪY
Chấm xanh/xám **không kèm chữ** khiến người mù màu không phân biệt được ai đang online. `DT-01` là luật xuyên suốt — mọi trạng thái phải có chữ hoặc biểu tượng.

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** FriendsPage ba tab accepted/incoming/outgoing, UserSearch không request khi<3 ký tự; updates từ 058/059 qua 084, response stale search không đè query mới. Online có chữ; pending/error/empty rõ.

**Tiền điều kiện cụ thể:** A cóB accepted, C incoming, S1 outgoing; browser A/B thật, 1366 và 360; clock cho debounce.

**File kiểm thử:** `tests/e2e/issue-060.spec.ts`. Giữ tên `T060-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T060-01` | Mở 3 tab với fixture; mỗi tab đúng người, không trộn accepted/pending. | Ba tab hiện đúng dữ liệu tương ứng |
| `T060-02` | Xoá data từng tab ở fixture riêng; hiển thị đúng thông báo trống và hành động gợiý. | ⭐ Cả ba tab có **trạng thái trống** với lời giải thích |
| `T060-03` | Gõ mi rồi min, advance debounce; đếm 0 rồi 1 request; response query cũ không đè query mới. | Gõ 2 ký tự → **không** gọi API; 3 ký tự → có gọi |
| `T060-04` | A gửi user mới quaUI; tab đã gửi có pending sau ACK thật. | Gửi lời mời → tab *"đã gửi"* cập nhật **ngay** |
| `T060-05` | B connect/disconnect thật; A thấy đổi chữ online không reload. | ⭐ Bạn online → chấm đổi **thời gian thực**, không cần tải lại |
| `T060-06` | Đọc accessible text chấm trạng thái; có online/ngoại tuyến trong cả 2 trạng thái. | ⭐ Trạng thái online có **chữ** đi kèm, không chỉ màu |
| `T060-07` | 360 px, tên 40 ký tự và lỗi dài; scrollWidth không vượt viewport. | Mobile 360 px → **không tràn ngang** |
| `T060-08` | Giữ response gửi ở barrier; nút disabled, Enter/click không gửi thêm. | Đang gửi → nút **vô hiệu** |
| `T060-09` | Abort GET, hiện Thử lại; network restored thì data thật hiện. | Lỗi mạng → hiện lỗi + nút **Thử lại** |
| `T060-10` | Tab/Enter/Space thao tác 3 tab/tìm/gửi/chấp nhận; focus nhìn thấy. | Dùng được bằng **bàn phím** |



### 10.3 Điểm triển khai cần giữ đúng

```ts
export function shouldSearchUsername(prefix: string): boolean {
  return prefix.length >= 3;
}
// Server057 vẫn kiểm lại min3; client guard chỉ giảm request vô ích.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **chỉ render màu presence hoặc không invalidate tab lời mời**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-060.md`.

```bash
pnpm test:e2e -- tests/e2e/issue-060.spec.ts
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
