# ISSUE-108 — Kênh riêng người chơi

**Nhóm:** E16 Chat · **Phụ thuộc:** 084, 040, 066 · **Trạng thái:** TODO

> DEC-028/029/044: contract hoàn chỉnh tại [ROOM-CHAT §4–5](../09-technical/room-chat-contract.md); không tạo Match sớm để chat.

## 1. MỤC TIÊU
Kênh chat **chỉ 2 người chơi** — người xem **không bao giờ** đọc hay gửi được.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-CHAT.md](../01-requirements/REQ-CHAT.md) §1, §11 **`BR-CHT-02`** · [../05-data-and-realtime/data-flows.md](../05-data-and-realtime/data-flows.md) §3

## 3. PHẠM VI
**✅ LÀM** — kênh `PLAYERS` · **❌ LÀM SAU** — kênh chung (109)

## 4. FILE TẠO
`apps/server/src/modules/chat/chat.service.ts`

## 5. CÁC BƯỚC
1. `POST /rooms/:id/chat` và sự kiện thời gian thực — **cùng** dịch vụ (`ARCH-14`)
2. ⭐ **`BR-CHT-01` — MÁY CHỦ quyết định quyền theo VAI TRÒ**. Client chọn channel như ý định, không tự khai quyền/người gửi; server kiểm role + participant
3. Kênh `PLAYERS`: chỉ **người chơi** đọc và gửi
4. ⭐ **`BR-CHT-16`** — máy chủ **TUYỆT ĐỐI KHÔNG** phát tin kênh `PLAYERS` ra nhóm có người xem
5. Ràng buộc: 1–1000 ký tự · **5 tin/10 giây** (tính chung cả hai kênh) · mã tin chống trùng
6. ⭐ **`BR-CHT-13`** — nội dung hiển thị **dạng chữ thuần**, **không** thực thi mã
7. Phân trang **50 tin**, mới nhất trước; lọc phạm vi người đọc từng tin theo BR-CHT-25, không chỉ kiểm vai trò PLAYER hiện tại
8. Read có thể dùng **Prisma** với predicate đủ; send dùng **SQL thuần** vì kiểm membership rồi ghi phải serialize với revoke theo TECH-07, ROOM-CHAT §5

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T108-01` | Người chơi gửi → **người chơi kia nhận** |
| `T108-02` | ⭐ **Người xem KHÔNG nhận** tin kênh `PLAYERS` |
| `T108-03` | ⭐ **Người xem xin LỊCH SỬ kênh `PLAYERS` → TỪ CHỐI** |
| `T108-04` | ⭐ **Người xem gửi vào kênh `PLAYERS` (giả mạo) → TỪ CHỐI** |
| `T108-05` | ⭐ **Client chọn channel được phép ⇒ gửi đúng channel; chọn channel không có quyền ⇒ từ chối**, không tự định tuyến sang kênh khác |
| `T108-06` | Tin 0 và 1001 ký tự → từ chối; 1 và 1000 → nhận |
| `T108-07` | Quá 5 tin/10 giây → chặn |
| `T108-08` | Cùng mã tin gửi 3 lần → lưu **một** tin |
| `T108-09` | ⭐ **Nội dung có mã HTML → hiện DẠNG CHỮ**, không thực thi |
| `T108-10` | Tiếng Việt có dấu và emoji → lưu và đọc **nguyên vẹn** |
| `T108-11` | Phân trang 50 tin, thứ tự đúng |
| `T108-12` | Gửi qua HTTP và thời gian thực → **cùng kết quả** |
| `T108-13` | WAITING, chưa có Match, chưa ready: A gửi tin riêng → B nhận, người xem không nhận (`AC-CHT-21`) |
| `T108-14` | A–B có tin riêng; C thay B: gọi lịch sử/tải thêm/đồng bộ và giả mạo mã tin cũ trực tiếp lên server đều không lấy được tin A–B (`AC-CHT-22`) |
| `T108-15` | Bắt đầu ván đầu giữ tin riêng hợp lệ lúc chờ, không mất/nhân đôi (`AC-CHT-23`) |
| `T108-16` | C thay B, chat A–C, bắt đầu ván đầu, tải lại/gọi API: C chỉ nhận tin riêng được phép, không nhận A–B (`AC-CHT-24`) |
| `T108-17` | Retry cùng mã WAITING→start chỉ một tin; khác content/segment MESSAGE_ID_REUSED. Context đã seal từ chối bằng fixture DB thật; endpoint tái đấu và stale context thực kiểm tại T127-18; khác channel qua service thật kiểm T109-11 |
| `T108-18` | Host solo→A–B→A solo→A–C: quyền lịch sử đúng snapshot user+membership, B rejoin không phục hồi cặp cũ |
| `T108-19` | Send/revoke/leave tranh chấp hai connection: kiểm dữ liệu và delivery; raw JWT deny-all cả 4 bảng; API vẫn đọc đúng quyền |
| `T108-20` | Bộ giới hạn dùng chung sender, không đưa channel/tab/context vào khóa; retry receipt không tính thêm; clock tiêm kiểm biên.108 kiểm primitive quota và gửi PLAYERS thật; gửi phối hợp ROOM/PLAYERS thật thuộc T109-11 |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Đủ 20 test xanh
- [ ] **`T108-02`, `T108-03`, `T108-04`** — ba hướng chặn người xem
- [ ] **`T108-05`** máy chủ quyết định theo vai trò
- [ ] **`T108-09`** an toàn nội dung
- [ ] Tần suất tính **chung** cả hai kênh

### Contract bổ sung bắt buộc

Hợp đồng schema/service/API/RLS đầy đủ tại ROOM-CHAT §4–5, không tiếp tục dùng match_id cho unique/cursor. Gửi dùng SQL thuần (kiểm-quyền-rồi-ghi phải khoá), đọc Prisma có predicate đầy đủ. Chọn channel là ý định hợp lệ, giả quyền/không được channel phải từ chối; không tự đổi channel.

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-108.md`

## 9. ⚠ CẠM BẪY
Phát tin kênh `PLAYERS` ra **luồng chung của phòng** rồi để client tự lọc là lỗ hổng nghiêm trọng — người xem sửa client là đọc được hết. Phải **chọn nhóm nhận ở máy chủ** trước khi gửi.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-108

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** apps/server/src/modules/chat/chat.service.ts.
- **File test:** `tests/integration/issue-108.test.ts`.
- **Nhận từ phụ thuộc:** 040 schema,043 deny-all RLS,084 socket auth,ROOM-CHAT§4–5.
- **Bàn giao:** POST /rooms/:id/chat strict {contextId,channel,privateSegmentId?,clientMessageId,content}; message receipt+sequence; history predicate current membership/segment.
- **Trình tự xử lý tối thiểu:** Lock room→profile→context; validate current membership/epoch/segment; lookup receipt then rate; sequence++insert; commit; delivery rechecks audience. Read filter participant BEFORE LIMIT 50.

### Chuẩn bị và oracle từng nhóm ca

**Given:** WAITING Host Asolo→A/B→Asolo→A/C; S1 subscriber; real JWTs; messages per segment,100 Unicode code points fixtures.

| ID test (tiền tố T108 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `01–05,12–19` | Send PLAYERS via HTTP/socket; S1 forgery/history; start first game; Bleave/Cjoin; reuse id changed payload | Only correct participants receive; start keeps IDs/context; C no A–B metadata/content; Bnewmembership no old receipt; changed hash MESSAGE_ID_REUSED; sealed context deny; rematch endpoint thật do T127-18 kiểm. |
| `06–11,20` | 0/1/1000/1001 code points after NFCtrim; HTML literal; 51 messages paginate; 5 messages across channels/tabs then 6 th; retry same id | Reject empty/oversize no insert; Unicode intact; sequence no holes/duplicate pages; 108 kiểm primitive quota và PLAYERS thật;109/T109-11 kiểm hai kênh thật; retry no extra quota; boundary(now−10 s,now]. |
| `19` | Barrier 2 connections send vs revoke both orders; hold queued delivery until after revoke; raw JWT four chat tables | Only send-before-revoke may persist; neither queued private nor history leaks after revoke; raw SELECT/INSERT/UPDATE/DELETE deny, API permitted positive control. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence108 = { storedCopies: number; replacementPrivateMessages: number; spectatorPrivateEvents: number; rawJwtVisibleRows: number; firstStartChangedContext: boolean };

export function assertIssue108KeyCase(actual: Evidence108): void {
  expect(actual).toMatchObject({storedCopies:1,replacementPrivateMessages:0,spectatorPrivateEvents:0,rawJwtVisibleRows:0,firstStartChangedContext:false});
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Replace participant predicate by current role or send PLAYERS to room group; T108-02/14/16/19 đỏ. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-108.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:integration -- tests/integration/issue-108.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:integration
```

**Chặn riêng của issue:** Postgre SQL local hoặc dependency chưa hoạt động ⇒ BLOCKED; không mock dữ liệu để đóng issue.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 109 ROOM channels; 110 privacy/retention; 127 sealed contexts.


### Ví dụ test HTTP + Postgre SQL thật cho mã tin chống trùng

Chạy trong `tests/integration/issue-108.test.ts`. Đây là biến thể Host nhắn riêng khi chưa có Match, dùng chính API tạo phòng 061; không seed một tin giả để rồi assert chính nó. `seedUsers` của 044 phải tạo tài khoản verified và hồ sơ đủ điều kiện sử dụng ứng dụng. Phần còn lại của T108-08 tiếp tục kiểm A–B; T108-14/19 kiểm mất quyền, không suy từ ca solo này.

```ts
import { randomUUID } from 'node:crypto';
import { expect, test } from 'vitest';
import { createTestApp, seedUsers, authAs, resetTestData } from '../fixtures/integration';

test('T108-08/13 — retry tin WAITING giữ một hàng thật', async () => {
  const runId = randomUUID();
  const h = await createTestApp();
  try {
    const { A } = await seedUsers(runId);
    const { token } = await authAs(A);
    const post = (path: string, body: unknown) => fetch(`${h.baseUrl}/api/v1${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const created = await post('/rooms', { name: 'Phòng kiểm thử', visibility: 'PUBLIC', timeControl: 0 });
    expect(created.ok).toBe(true);
    const context = await h.db.query<{
      room_id: string; context_id: string; segment_id: string;
    }>(`
      SELECT r.id AS room_id, c.id AS context_id, s.id AS segment_id
      FROM rooms r
      JOIN room_members m ON m.room_id = r.id AND m.user_id = $1
      JOIN chat_contexts c ON c.id = r.current_chat_context_id
      JOIN chat_private_segments s ON s.context_id = c.id AND s.closed_at IS NULL
      WHERE r.status = 'WAITING'
    `, [A.id]);
    expect(context.rows).toHaveLength(1);
    const row = context.rows[0]!;
    const body = {
      contextId: row.context_id, privateSegmentId: row.segment_id,
      channel: 'PLAYERS', clientMessageId: randomUUID(), content: 'Xin chào 👋',
    };
    for (let attempt = 0; attempt < 3; attempt++) {
      expect((await post(`/rooms/${row.room_id}/chat`, body)).ok).toBe(true);
    }
    const stored = await h.db.query<{ content: string; sequence: string }>(`
      SELECT content, sequence FROM chat_messages
      WHERE context_id = $1 AND sender_id = $2 AND client_message_id = $3
    `, [row.context_id, A.id, body.clientMessageId]);
    expect(stored.rows).toHaveLength(1);
    expect(stored.rows[0]!.content).toBe('Xin chào 👋');
    const changed = await post(`/rooms/${row.room_id}/chat`, { ...body, content: 'Nội dung khác' });
    expect(changed.ok).toBe(false);
    expect(await changed.text()).toContain('MESSAGE_ID_REUSED');
  } finally {
    try { await resetTestData(runId); } finally { await h.dispose(); }
  }
});
```


### Phạm vi được đóng ở108 và gate giao109/127

T108-17 chứng minh receipt xuyên WAITING→start qua064 thật, thay người qua065 thật và context sealed qua fixture dữ liệu thật. Chưa có endpoint127 thì không tuyên bố tái đấu end-to-end đạt; T127-18 phải gửi tin, tái đấu thật, rồi thử stale send/history. Khác channel cùng ID và quota5/10 giây trên cả hai kênh gửi thật được chạy tại T109-11;108 chỉ chứng minh key của limiter không chứa channel và các đường PLAYERS đang tồn tại. Báo cáo108 ghi rõ ranh giới, không tạo `.skip` cho chức năng109/127.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Gắn từng AC dưới đây vào tên test T/TS thực sự chứng minh nó, bổ sung assertion/biến thể còn thiếu từ tiêu chí nguồn. Một AC nhiều nhánh phải có đủ bằng chứng mọi nhánh. Báo cáo phải ghi AC → đường dẫn/tên test → commit → kết quả/artifact; không nhận PASS chỉ vì ID có trong file.

| AC phải chứng minh | Nguồn đọc đầy đủ tiêu chí | Môi trường |
|---|---|---|
| `AC-CHT-06` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |
| `AC-CHT-12` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |
| `AC-CHT-13` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |
| `AC-CHT-14` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |
| `AC-CHT-26` | [REQ-CHAT](../01-requirements/REQ-CHAT.md) | LOCAL |

LOCAL+INTERNET: issue này chứng minh phần local,137 kiểm tiếp Internet. EXTERNAL chỉ đạt khi provider/thiết bị/mạng thật đã chạy. Ghi riêng phần chưa nghiệm thu; không tạo test bỏ qua để làm báo cáo xanh.
