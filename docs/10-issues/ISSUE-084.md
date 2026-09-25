# ISSUE-084 — Socket.IO gateway + handshake

**Nhóm:** E11 Ván online · **Phụ thuộc:** 046, 063, 051, 052 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Kết nối thời gian thực có **xác thực ở handshake** và **kiểm quyền ở mỗi sự kiện**.

## 2. ĐỌC TRƯỚC
[../05-data-and-realtime/data-flows.md](../05-data-and-realtime/data-flows.md) §1 · [../09-technical/architecture.md](../09-technical/architecture.md) §9 `ARCH-14`

## 3. PHẠM VI
**✅ LÀM** — gateway · xác thực · đăng ký phòng WAITING · envelope phản hồi. Đăng ký ván bổ sung cùng 087; không cần 064 để dựng presence.
**❌ KHÔNG LÀM** — logic đi nước (087)

## 4. FILE TẠO
`apps/server/src/realtime/game.gateway.ts` · `ws-auth.guard.ts` · `broadcast.service.ts`

## 5. CÁC BƯỚC
1. **Một namespace**, truyền tải WebSocket. Handshake nhận `{ accessToken, tabId }`
2. **Xác thực ở handshake**: verify JWT + **kiểm phiên còn hiệu lực**. Sai ⇒ từ chối kết nối
3. ⭐ **Kiểm danh sách nguồn gốc được phép** — chặn kết nối từ trang khác
4. **`ARCH-14`** — sự kiện thời gian thực và HTTP gọi **CÙNG MỘT** dịch vụ nghiệp vụ. **Không** viết hai bản logic
5. Envelope phản hồi thống nhất: `ApiResult<T>` (issue 011)
6. **Kiểm quyền ở MỖI sự kiện**, không chỉ ở handshake — phiên có thể bị thu hồi giữa chừng
7. Nhóm phát tin **do máy chủ tạo**. ⛔ **Không bao giờ** nhận tên phòng do client gửi làm bằng chứng quyền
8. Token hết hạn ⇒ ngắt kết nối; client nối lại bằng token mới

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T084-01` | Token hợp lệ → kết nối thành công |
| `T084-02` | Không token / token sai → **từ chối kết nối** |
| `T084-03` | ⭐ **Phiên đã thu hồi → từ chối kết nối** |
| `T084-04` | ⭐ **Phiên bị thu hồi GIỮA CHỪNG → sự kiện tiếp theo bị từ chối** |
| `T084-05` | ⭐ **Nguồn gốc không được phép → từ chối** |
| `T084-06` | ⭐ **Client gửi tên phòng tuỳ ý → KHÔNG nhận được dữ liệu phòng đó** |
| `T084-07` | Đăng ký phòng → nhận được dữ liệu phòng |
| `T084-08` | Người không phải thành viên đăng ký phòng → **FORBIDDEN** |
| `T084-09` | Envelope phản hồi đúng định dạng `ApiResult` |
| `T084-10` | ⭐ **Cùng lệnh vào phòng WAITING qua HTTP và qua thời gian thực → cùng kết quả** (`ARCH-14`) |
| `T084-12` | Socket thật: JWT còn hạn nhưng app session hết hạn/thu hồi thì sự kiện bị chặn; CURRENT chỉ ngắt phiên đó, ALL/password reset ngắt mọi phiên; không mock broadcaster để báo PASS |
| `T084-11` | Token hết hạn → ngắt kết nối; nối lại bằng token mới thành công |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 12 test xanh
- [ ] **`T084-04`** kiểm quyền ở **mỗi** sự kiện
- [ ] **`T084-06`** không tin client khai tên phòng
- [ ] **`T084-10`** một dịch vụ, hai cổng vào
- [ ] `T084-05` chặn nguồn gốc lạ

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-084.md`

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| **Không có máy chủ thời gian thực; client phải hỏi liên tục** (`F-06`) | Issue này dựng gateway thật |
| Chỉ kiểm quyền ở handshake ⇒ phiên bị thu hồi vẫn dùng tiếp được | `T084-04` |

## 10. HƯỚNG DẪN THỰC THI CHO AGENT MỚI

> Thực thi tuần tự; nếu môi trường có skill thì dùng `superpowers:executing-plans`; các bước dưới đây là công việc triển khai, **chưa được chạy/PASS**. Đọc [AGENT-START-HERE](AGENT-START-HERE.md) và [TEST-CONVENTIONS](TEST-CONVENTIONS.md); giữ nguyên mọi điều kiện PASS ở trên.

### 10.1 Hợp đồng giao nhận và dữ liệu kiểm thử

**Giao diện phải bàn giao:** Socket.IO namespace chung, handshake {accessToken, tabId}, WebSocket transport; Origin allowlist và JWT/app_session check ở handshake/mỗi event. Subscribe nhận roomId ý định, server xác minh membership rồi tự tính channel. HTTP/socket gọi chung service 063, envelope ApiResult 011.

**Tiền điều kiện cụ thể:** Auth thật 046/050/051/052, rooms WAITING061/063; socket clients thật A1/A2/B/S1, packet capture và clock tiêm. Không cần start 064 cho test gateway.

**File kiểm thử:** `tests/integration/issue-084.test.ts`. Giữ tên `T084-NN` trong tên test; chạy từng test theo ID để chứng minh lỗi mục tiêu. Factory/clock/barrier của ISSUE-044 dùng DB thật; tên/signature lấy từ [ISSUE-044](ISSUE-044.md), không tự tạo mock DB hoặc endpoint test trong production. Test UI dùng component fixture cho hành vi thuần hiển thị; chứng nhận dữ liệu/quyền phải qua server thật. Một test chứa nhiều biến thể phải parameterize hết các biến thể ghi dưới đây.

### 10.2 Ma trận setup → hành động → bằng chứng

| Test | Given / thao tác cụ thể | Then — assert bắt buộc |
|---|---|---|
| `T084-01` | A token còn hạn, Origin được phép, tabId UUID; connect nhận ACK, server gắn đúng user/session/tab. | Token hợp lệ → kết nối thành công |
| `T084-02` | Không token, token lỗi chữ ký, thiếu tabId: handshake từ chối, không socket trong room audience. | Không token / token sai → **từ chối kết nối** |
| `T084-03` | Revoke app_session/Auth thật rồi connect bằng JWT cũ còn exp; từ chối. | ⭐ **Phiên đã thu hồi → từ chối kết nối** |
| `T084-04` | Connect thành công, logout commit rồi gửi event tiếp; bị từ chối và không nghiệp vụ mutation. | ⭐ **Phiên bị thu hồi GIỮA CHỪNG → sự kiện tiếp theo bị từ chối** |
| `T084-05` | Origin evil.example hoặc thiếu Origin theo policy; không mở socket dù JWT đúng. | ⭐ **Nguồn gốc không được phép → từ chối** |
| `T084-06` | Outsider gửi tên channel phòng riêng và roomId đoán; không vào adapter room, không packet dữ liệu. | ⭐ **Client gửi tên phòng tuỳ ý → KHÔNG nhận được dữ liệu phòng đó** |
| `T084-07` | Member hợp lệ subscribe WAITING room; nhận projection đúng phiên bản và whitelist fields. | Đăng ký phòng → nhận được dữ liệu phòng |
| `T084-08` | Outsider subscribe bằng roomId; FORBIDDEN theo contract subscribe, không projection. | Người không phải thành viên đăng ký phòng → **FORBIDDEN** |
| `T084-09` | Kiểm success/error ACK bằng schema ApiResult; không stack trace hoặc raw SQL. | Envelope phản hồi đúng định dạng `ApiResult` |
| `T084-10` | Hai fixtures giống nhau: join WATCH PUBLIC qua HTTP/socket; so role, membership, roomVersion và error contract, cùng business service. | ⭐ **Cùng lệnh vào phòng WAITING qua HTTP và qua thời gian thực → cùng kết quả** (`ARCH-14`) |
| `T084-12` | JWT còn exp: hết idle hoặc CURRENT/ALL/reset thật; từng socket session scope bị ngắt/command bị chặn, session độc lập đúng phạm vi vẫn hoạt động. | Socket thật: JWT còn hạn nhưng app session hết hạn/thu hồi thì sự kiện bị chặn; CURRENT chỉ ngắt phiên đó, ALL/password reset ngắt mọi phiên; không mock broadcaster để báo PASS |
| `T084-11` | JWT exp tới hạn: disconnect; sign-in/refresh hợp lệ rồi reconnect bằng token mới; app_session expired không được hồi sinh. | Token hết hạn → ngắt kết nối; nối lại bằng token mới thành công |



### 10.3 Điểm triển khai cần giữ đúng

```ts
import { io } from 'socket.io-client';
export function connectAuthenticated(baseUrl: string, accessToken: string, tabId: string) {
  return io(baseUrl, { transports: ['websocket'], auth: { accessToken, tabId }, autoConnect: false });
}
// Test gọi connect(), chờ connect/connect_error/ACK thật; không mock broadcaster.
```

Ví dụ trên chỉ minh hoạ đoạn then chốt trong các file ở mục FILE; tích hợp vào service/component thật, không tạo một bản riêng trong test rồi tự kiểm nó. Dùng schema/type đã có từ ISSUE-006…011 và các contract kỹ thuật được dẫn ở phần ĐỌC TRƯỚC.

### 10.4 Chu trình thực thi và lệnh kiểm chứng

- [ ] Đọc các commit dependency đã merge, mở đúng các file nguồn ở mục FILE; ghi interface hiện có và schema thực tế vào báo cáo. Nếu contract khác đặc tả, dừng và báo chênh lệch.
- [ ] Tạo file test ở 10.1 với fixture nêu trên, viết từng hàng của 10.2 thành test có assertion trên response **và** dữ liệu/DOM được chỉ rõ.
- [ ] Chạy lệnh focused bên dưới trước triển khai; lưu test RED do thiếu hành vi, phân biệt với lỗi môi trường/không tìm thấy file.
- [ ] Triển khai theo thứ tự các bước ở mục CÁC BƯỚC, chỉ thêm các artifact được nêu trong issue; chạy focused cho tới GREEN.
- [ ] Fault injection tạm thời: **chỉ xác thực handshake và tin tên channel từ client**. Test mục tiêu phải RED vì assertion hành vi; lưu tên test và lỗi, hoàn nguyên mutation rồi chạy GREEN lại. Không commit mã cố tình sai.
- [ ] Chạy đủ các lệnh dưới đây, ghi exit/pass/fail/skip và fixture IDs đã che bí mật vào `docs/test-reports/ISSUE-084.md`.

```bash
pnpm test:integration -- tests/integration/issue-084.test.ts
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
| `AC-AUTH-19` | [REQ-AUTH](../01-requirements/REQ-AUTH.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
