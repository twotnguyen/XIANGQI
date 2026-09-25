# ISSUE-010 — Kiểu chat · media · AI

**Nhóm:** E01 · **Phụ thuộc:** 006 · **Trạng thái:** TODO

## 1. MỤC TIÊU
Kiểu cho hai kênh chat, chính sách camera/mic, và trạng thái việc tính của máy.

## 2. ĐỌC TRƯỚC
[../01-requirements/REQ-CHAT.md](../01-requirements/REQ-CHAT.md) §1, §11 · [../01-requirements/REQ-MEDIA.md](../01-requirements/REQ-MEDIA.md) §5 · [../01-requirements/REQ-AI.md](../01-requirements/REQ-AI.md) §5

## 3. PHẠM VI
**✅ LÀM** — kiểu · **❌ KHÔNG LÀM** — logic (E16, E17, E18)

## 4. FILE TẠO
`packages/contracts/src/chat.ts` · `media.ts` · `ai.ts`

## 5. CÁC BƯỚC
1. **Chat — hai kênh (`DEC-018`)**:
   ```ts
   export type ChatChannel = 'PLAYERS' | 'ROOM';
   // PLAYERS = kênh RIÊNG, chỉ 2 người chơi
   // ROOM    = kênh CHUNG, 5 người xem + CẢ 2 người chơi đọc và gửi
   export type ChatMessage = {
     id: string; contextId: string; channel: ChatChannel;
     privateSegmentId: string | null; sequence: number;
     sender: { id: string; displayName: string };
     senderIsPlayer: boolean;        // để gắn nhãn "người chơi" ở kênh chung
     content: string;                // 1..1000 ký tự
     createdAtMs: number; clientMessageId: string;
   };
   export const CHAT_MAX_LENGTH = 1000;
   export const CHAT_RATE_LIMIT = { messages: 5, perMs: 10_000 };
   export const CHAT_PAGE_SIZE = 50;
   ```
2. **Media**:
   ```ts
   export type MediaKind = 'CAMERA' | 'MICROPHONE';
   export type Audience  = 'OFF' | 'OPPONENT_ONLY' | 'OPPONENT_AND_SPECTATORS';
   export type SourcePolicy = { camera: Audience; microphone: Audience };
   export type PolicyState = {
     userId: string; policyVersion: number; appliedVersion: number;
     desired: SourcePolicy; applied: SourcePolicy;
     status: 'APPLYING' | 'APPLIED' | 'FAILED';
   };
   ```
3. **AI**:
   ```ts
   export type AiJobState = 'IDLE' | 'QUEUED' | 'THINKING' | 'FAILED';
   export type AiState = { jobId: string | null; jobVersion: number; state: AiJobState } | null;
   export const AI_LEVELS = {
     EASY:   { depthCap: 2, budgetMs: 300 },
     MEDIUM: { depthCap: 4, budgetMs: 1000 },
     HARD:   { depthCap: 6, budgetMs: 3000 },
   } as const;
   export const AI_MAX_RUNNING = 2;
   export const AI_MAX_QUEUED = 8;
   ```
4. Kiểu kết quả tìm kiếm:
   ```ts
   export type SearchResult = {
     move: Move | null; score: number; nodes: number;
     completedDepth: number; elapsedMs: number; pv: Move[]; aborted: boolean;
   };
   ```

## 6. TEST BẮT BUỘC
| Tên | Kiểm gì |
|---|---|
| `T010-01` | `ChatChannel` có đúng 2 giá trị: `PLAYERS`, `ROOM` |
| `T010-02` | `ChatMessage` có `senderIsPlayer` (cần cho nhãn ở kênh chung) |
| `T010-03` | `Audience` có đúng 3 mức |
| `T010-04` | `SourcePolicy` có camera và microphone **độc lập** — đặt khác nhau vẫn biên dịch |
| `T010-05` | `AI_LEVELS.HARD` = depth 6, 3000 ms |
| `T010-06` | `SearchResult` có đủ 7 trường (`BR-AI-20`) |
| `T010-07` | **Không** kiểu media nào chứa trường `token` |

## 7. ⛔ ĐIỀU KIỆN PASS
- [ ] Kênh chat tên là `PLAYERS`/`ROOM`, **không** phải `SPECTATORS`
- [ ] Có `senderIsPlayer`
- [ ] Ba cấp AI đúng 300/1000/3000 ms và depth 2/4/6
- [ ] `SearchResult` đủ 7 trường
- [ ] `T010-07` chứng minh không rò token

## 8. BẰNG CHỨNG
`docs/test-reports/ISSUE-010.md`

## 9. ⚠ CẠM BẪY
Kênh cũ tên `SPECTATORS`. Theo `DEC-018` người chơi **cũng đọc và gửi được** nên đổi tên thành `ROOM`. Giữ tên cũ sẽ khiến lập trình viên hiểu sai phạm vi và chặn nhầm người chơi.

## GÓI THỰC THI CHO AGENT

### Giao diện và khả năng phải có trước khi bắt đầu

`ChatMessage` dùng contextId, privateSegmentId và sequence, không bắt buộc Match vì phòng WAITING đã chat được. `PolicyState.status` có APPLYING/APPLIED/FAILED; desired và applied tách biệt. AiState, SearchResult và AI_LEVELS theo §5, export qua index. Không import MatchSnapshot trong ai.ts để tránh vòng 008↔010.

Các giao diện này phải được tạo khi thực thi; chưa có mã runtime hay bằng chứng PASS. Đọc AGENT-START-HERE và TEST-CONVENTIONS; mọi phụ thuộc phải đã merge.

### Fixture và ca kiểm có thể chạy

**File kiểm thử chính:** `tests/unit/issue-010.test.ts`. Đặt ID TNNN-xx trong tên test để đối chiếu từng dòng bảng bắt buộc; không gộp nhiều test ID thành một kết luận không có assertion riêng.

Compile tin Host trong context chưa có Match; camera OPPONENT_ONLY trong khi microphone OFF; AiState null/job QUEUED; SearchResult fallback move hợp lệ completedDepth 0 aborted true.

- T010-01/02: Record<ChatChannel,...> đủ PLAYERS/ROOM; ChatMessage giữ senderIsPlayer và context/sequence.
- T010-03/04: Record 3 audience, camera/mic khác nhau compile; FAILED không bị gộp APPLIED.
- T010-05: assert cả EASY2/300 MEDIUM4/1000 HARD6/3000 và running 2/queued 8.
- T010-06: SearchResult có 7 field, pv có Move[], move nullable ở terminal.
- T010-07: kiểm keyof các DTO không token; policy thất bại vẫn giữ desired/applied.

**Ca trọng yếu — nội dung để triển khai:**

```ts
import { expect, test } from 'vitest';
import { AI_LEVELS, AI_MAX_RUNNING, AI_MAX_QUEUED } from '@xiangqi/contracts';
test('T010-05 cấu hình ba cấp', () => {
  expect(AI_LEVELS).toEqual({EASY:{depthCap:2,budgetMs:300},
    MEDIUM:{depthCap:4,budgetMs:1000},HARD:{depthCap:6,budgetMs:3000}});
  expect([AI_MAX_RUNNING,AI_MAX_QUEUED]).toEqual([2,8]);
});
```

### Checklist triển khai và xác minh

- [ ] Tạo file test đã nêu, fixture và các ca của bảng TEST BẮT BUỘC; chạy lệnh tập trung bên dưới và lưu lần **đỏ** đúng lỗi mục tiêu. Với CLI âm, assert exit khác 0 trong driver; lỗi import/setup chưa đủ làm bằng chứng bắt lỗi nghiệp vụ.
- [ ] Thực hiện các bước §CÁC BƯỚC theo giao diện trên; chỉ sửa file trong phạm vi issue và public exports cần thiết.
- [ ] Chạy lại test tập trung; tất cả T-ID có assertion, input bị từ chối không gây thay đổi trạng thái ngoài dự kiến.
- [ ] **Chứng minh test bắt lỗi:** Đổi HARD depth xuống 4 hoặc bỏ FAILED/contextId; test/config/type fixtures phải đỏ.
- [ ] Phục hồi mutation, chạy lại test tập trung rồi các cổng dưới; ghi stdout/stderr, exit, pass/fail/skip=0 và SHA vào báo cáo của issue.

```sh
pnpm test:unit -- tests/unit/issue-010.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
```

Không gọi một lane tương lai để giả chứng minh ở mốc này. Chạy thêm mọi lane đã có mà thay đổi thực sự tác động theo WORKFLOW. Nếu script lọc sai path mà vẫn xanh, hoặc không có test thực chạy, issue **BLOCKED**.

### Bàn giao và điều kiện dừng

Bàn giao contract sửa theo canonical ROOM-CHAT/media; UI không hiển thị score/pv khi đang chơi.

Báo cáo phải gắn từng T-ID với file/test và output; giữ toàn bộ checklist PASS gốc ở trên. Có test đỏ hoặc thiếu bằng chứng nội bộ ⇒ `BLOCKED`; thiếu tài nguyên ngoài thực sự ⇒ `BLOCKED_EXTERNAL`, ghi đúng tài nguyên và ca chưa chạy. Chỉ cập nhật DONE sau PR merge và cập nhật INDEX; việc viết kế hoạch này giữ trạng thái `TODO`.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
