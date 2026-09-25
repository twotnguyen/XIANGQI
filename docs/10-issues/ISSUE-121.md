# ISSUE-121 — Tích hợp ván với máy

**Nhóm:** E18 · **Phụ thuộc:** 120, 093, 097 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Tạo và chơi ván với máy — dùng **cùng** bộ luật và **cùng** đường xử lý lệnh với ván online.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-AI.md](../01-requirements/REQ-AI.md) §5, §10 `BR-AI-05..12`

## 3. PHẠM VI
**✅ LÀM** — tạo ván máy · kích hoạt lượt máy
**❌ KHÔNG LÀM** — đi lại với máy (122) · giao diện (123)

## 4. FILE TẠO
`apps/server/src/modules/ai/ai-match.service.ts`

## 5. CÁC BƯỚC
1. `POST /ai/matches` nhận `{ side, level, timeControl }`
2. **Kiểm trước khi tạo**: đã rời phòng online · **không** có ván máy nào đang chạy (`BR-AI-15`); giữ admission reservation theo120 rồi tạo Match bằng transaction. Thất bại phải trả reservation; terminal giải phóng đúng một lần.
3. ⭐ **`BR-AI-05`** — **ĐỎ luôn đi trước**. Người chơi chọn **đen** ⇒ **máy đi trước ngay**
4. ⭐ **`BR-AI-06`** — máy dùng **cùng bộ luật** `xiangqi-simple-v1`
5. ⭐ **`BR-AI-07`** — máy **phải xét lịch sử lặp** khi tìm nước
6. ⭐ **`BR-AI-08`** — nước của máy **vẫn bị máy chủ kiểm tra hợp lệ** như nước của người
7. ⭐ **`BR-AI-10`** — ván máy **không có**: phòng · người xem · chat · camera/mic
8. ⭐ **`BR-AI-12`** — **không** áp dụng luật chống treo ván
9. ⭐ **`BR-AI-11`** — người thật ngoại tuyến đủ **60 giây**, chưa có kết quả/deadline sớm hơn ⇒ **GIÁN ĐOẠN**; `TIMEOUT` đến trước hoặc bằng60 giây vẫn xử thua bên hết giờ
10. ⭐ **`BR-AI-13`** — máy **không** xin hoà, **không** đầu hàng. Hoà chỉ theo **luật lặp 3 lần**
11. Đồng hồ áp dụng cho **cả hai**; thời gian máy **chờ** cũng tính vào đồng hồ máy (`BR-CLK-12`)

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T121-01` | Tạo ván máy với **cả3cấp, cả2bên, cả4cấu hình thời gian**; create failure/terminal giải phóng reservation, create11 đồng thời không vượt10 ACTIVE |
| `T121-02` | ⭐ **Chọn ĐEN → máy ĐI TRƯỚC ngay** |
| `T121-03` | ⭐ **Nước của máy VẪN bị kiểm tra hợp lệ** |
| `T121-04` | ⭐ **Máy xét lịch sử lặp** — không chọn nước dẫn tới hoà khi có nước tốt hơn |
| `T121-05` | ⭐ **Ván máy KHÔNG có phòng, người xem, chat, media** |
| `T121-06` | ⭐ **Luật chống treo ván KHÔNG áp dụng** |
| `T121-07` | ⭐ **Ngoại tuyến: clock20s ⇒ TIMEOUT20s; clock60s ⇒ TIMEOUT60s; clock>60s/không giới hạn ⇒ INTERRUPTED60s nếu chưa terminal** |
| `T121-08` | ⭐ **Máy KHÔNG có nút xin hoà** |
| `T121-09` | Lặp 3 lần với máy → **HOÀ** |
| `T121-10` | Đang ở phòng online → **không** tạo được ván máy |
| `T121-11` | Đã có ván máy → **không** tạo ván máy thứ hai |
| `T121-12` | Đồng hồ áp dụng cho cả hai; thời gian chờ tính vào đồng hồ máy |
| `T121-13` | Tải lại trang → ván **vẫn còn**, chơi tiếp được |
| `T121-14` | Dùng `finalizeMatch` chung: worker lỗi hai lần → INTERRUPTED; TIMEOUT sớm hơn vẫn thắng; kiểm PostgreSQL thật, version/kết quả chỉ ghi một lần |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 14 test xanh trên PostgreSQL thật
- [ ] **`T121-02`** máy đi trước khi người chọn đen
- [ ] **`T121-03`** máy chủ vẫn phân xử
- [ ] **`T121-07`** deadline đúng; không biến TIMEOUT trước đó thành gián đoạn
- [ ] **`T121-06`** không áp luật treo ván

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-121.md`

## 9. ⚠ CẠM BẪY
| Lỗi lần trước | Phòng |
|---|---|
| **Lượt của máy không được kích hoạt** — phải sửa sau khi đã tuyên bố hoàn thành (PR #47) | `T121-02` kiểm máy đi trước **ngay** khi tạo ván |

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-121

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/server/src/modules/ai/ai-match.service.ts.
- **File test:** `tests/integration/issue-121.test.ts`.
- **Nhận từ phụ thuộc:** 120 reservation/queue; 093 clock; 097 recovery; 087 move validator; 089 finalizer.
- **Bàn giao:** POST /ai/matches {side,level,timeControl}; server creates AI Match room Id null; trusted worker result still validates turn/version/legal move.
- **Trình tự xử lý tối thiểu:** Reserve→SQL create/active_players claim→commit→dispatch RED when needed; failure finally release reservation; worker result common command pipeline with counts rebuilt from active branch.

### Chuẩn bị và oracle từng nhóm ca

**Given:** 24 configuration cases=3 levels× 2 sides× 4 times; no online membership; real PG and child; 11 concurrent creates.

| ID test (tiền tố T121 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–06,08–11,13` | Create all configs,BLACK human; bad worker move; reviewed repetition history; reload; over lapping online/AI | RED machine immediately moves for human BLACK; invalid never persist; no room/chat/media; no inactivity; loop 3 draw; reload continues; admission≤10. |
| `07,12,14` | Offline at 0 clock 20 s/60 s/>60 s/null; queue consumes clock; worker error 2; late RESULT after terminal | 20 s TIMEOUT,60 s TIMEOUT,otherwise 60 s INTERRUPTED; one outcome/version; queue counts; late result 0 moves; reservations release exact once. |
| `01rollback` | Fail PGcreate after reserve; retry create; race same user 2 requests | No leaving slot/no orphan Match; one ACTIVE peruser; second request cannot spend 2 reservations. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence121 = { humanBlackMachineFirst: boolean; roomRows: number; activeMatchesAfter11Creates: number; lateMovesAfterTerminal: number; reservationLeak: number };

export function assertIssue121KeyCase(actual: Evidence121): void {
  expect(actual).toMatchObject({humanBlackMachineFirst:true,roomRows:0,activeMatchesAfter11Creates:10,lateMovesAfterTerminal:0,reservationLeak:0});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Apply worker move directly or start only after human move; T121-02/03 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-121.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:integration -- tests/integration/issue-121.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 122 undo; 125 history AI; 136 full system AI scope.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-CLK-12` | [REQ-CLOCK](../01-requirements/REQ-CLOCK.md) | LOCAL |
| `AC-DIS-15` | [REQ-DISCONNECT](../01-requirements/REQ-DISCONNECT.md) | LOCAL |
| `AC-AI-05` | [REQ-AI](../01-requirements/REQ-AI.md) | LOCAL |
| `AC-AI-07` | [REQ-AI](../01-requirements/REQ-AI.md) | LOCAL |
| `AC-AI-08` | [REQ-AI](../01-requirements/REQ-AI.md) | LOCAL |
| `AC-SS-18` | [session-state](../05-data-and-realtime/session-state.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
