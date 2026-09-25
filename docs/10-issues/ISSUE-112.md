# ⛔ ISSUE-112 — CỔNG MEDIA: LiveKit local + đo RTP thật

**Nhóm:** E17 Media · **Phụ thuộc:** 005 · **Trạng thái:** TODO
**LOẠI: CỔNG CHẶN — không đạt thì KHÔNG được làm tiếp 113–117**
**⚠ Chạy được bằng LiveKit bản local.** Xem [EXTERNAL-SETUP.md](EXTERNAL-SETUP.md) §3

---

## 1. MỤC TIÊU

Chứng minh hạ tầng truyền media **thật sự hoạt động** — nhận được **byte RTP thật**, trước khi xây bất cứ thứ gì lên trên.

## 2. VÌ SAO LÀ CỔNG CHẶN

Media là phần **rủi ro nhất** còn lại: **4/30 lỗi** lần trước nằm ở đây.

| Lỗi lần trước | Mã |
|---|---|
| Client WebRTC **chưa hề tồn tại**; backend lệch đặc tả | `F-09` |
| Harness media **không chạy được bằng lệnh nào** | `F-10` |
| Test media **chỉ kiểm object tự tạo**, không có luồng thật | `F-14` |
| Hạ tầng local thiếu cấu hình cổng RTC | `F-28` |

⇒ Xây 113–117 lên trên một nền chưa kiểm chứng là **lặp lại đúng sai lầm cũ**.

## 3. ĐỌC TRƯỚC
[../09-technical/deployment.md](../09-technical/deployment.md) §2 · [../06-acceptance/test-scenarios.md](../06-acceptance/test-scenarios.md) §7

## 4. PHẠM VI

**✅ LÀM** — dựng LiveKit local · bộ chạy test media · **đo byte RTP thật**
**❌ KHÔNG LÀM** — chính sách quyền (113) · giao diện (116)

## 5. FILE TẠO
`infra/compose.yaml` · `infra/livekit.yaml` · `tests/media/spike.test.ts` · `vitest.media.config.ts`

**Ranh giới:** spike local chỉ chứng minh luồng thật; không đòi app hoàn chỉnh/Cloud. Sau spike, các bảo đảm quyền theo [media-control-contract](../09-technical/media-control-contract.md) phải có test riêng.

## 6. CÁC BƯỚC

1. Dựng LiveKit **local bằng Docker**:
   - Ghim **phiên bản chính xác**, ⛔ **không** dùng thẻ `latest` (`F-28`)
   - **Mở đủ dải cổng RTC** — đây là lỗi `F-28` lần trước
   - Bật ứng viên loopback cho môi trường local
   - Khoá API **chỉ dùng cho test**, ⛔ **không** commit khoá thật
2. ⭐ **Bộ chạy test phải gọi được bằng LỆNH** (`F-10`):
   ```
   pnpm test:media
   ```
   Thêm `tests/media/**` vào một cấu hình Vitest, `passWithNoTests: false`
3. **Phép thử tối thiểu** — hai bên tham gia:
   ```
   ① Bên A vào phòng, phát luồng TỔNG HỢP (video + audio nhân tạo)
   ② Bên B vào phòng, đăng ký nhận
   ③ Chờ có điều kiện (KHÔNG dùng chờ cố định)
   ④ Đọc thống kê của B
   ⑤ KHẲNG ĐỊNH: byte nhận được > 0  VÀ  số khung hình > 0
   ```
4. ⛔ **`F-14`** — **KHÔNG** được assert object tự tạo. Phải đọc **thống kê thật** từ kết nối
5. Thêm lane media vào CI

## 7. ⛔ ĐIỀU KIỆN PASS

- [ ] ⭐ **`pnpm test:media` chạy được bằng MỘT lệnh**, exit 0
- [ ] ⭐ **Bên nhận có byte RTP > 0** — đọc từ thống kê kết nối thật
- [ ] ⭐ **Số khung hình video > 0**
- [ ] ⭐ **Audio có byte > 0**
- [ ] **0 test bị bỏ qua**
- [ ] Không có LiveKit chạy → test **ĐỎ**, **không** bỏ qua
- [ ] Phiên bản LiveKit được **ghim chính xác**
- [ ] Dải cổng RTC mở đúng, có ghi trong tài liệu
- [ ] Lane media chạy trong CI
- [ ] ⛔ **Không** khoá API thật nào bị commit

## 8. BẰNG CHỨNG

`docs/test-reports/ISSUE-112.md` — **bắt buộc** có:
- Output `pnpm test:media`
- **Số byte và số khung hình thực tế** đọc được
- Phiên bản LiveKit và cấu hình cổng
- Output khi **tắt** LiveKit (phải đỏ)

## 9. NẾU KHÔNG ĐẠT

⛔ **DỪNG. Không làm tiếp 113–117.**

| Vấn đề | Xử lý |
|---|---|
| Không kết nối được | Kiểm dải cổng RTC, ứng viên loopback |
| Byte = 0 | Kiểm nguồn tổng hợp có thật sự phát không |
| Test bỏ qua | Sửa cấu hình — `passWithNoTests: false` |
| Không chạy được bằng lệnh | Sửa cấu hình Vitest — đây **chính là `F-10`** |

## 10. ⚠ CẠM BẪY

Lần trước test media **tồn tại** nhưng **không nằm trong cấu hình nào** ⇒ không ai chạy được ⇒ mọi thứ phía trên xây trên nền **chưa hề kiểm chứng**. Issue này tồn tại **chỉ để** ngăn điều đó lặp lại.

## KẾ HOẠCH THỰC THI CHI TIẾT — ISSUE-112

> Dùng [TEST-CONVENTIONS.md](TEST-CONVENTIONS.md) và [WORKFLOW.md](WORKFLOW.md). Các đường dẫn dưới đây là file sẽ tạo/sửa khi triển khai; tài liệu này không phải bằng chứng test đã chạy. Giữ từng ID test bắt buộc phía trên trong tên test; bảng dưới nhóm các ca dùng chung thiết lập, không gộp chúng thành một test duy nhất.

### Ranh giới mã và hợp đồng bàn giao

- **File sản phẩm/harness:** infra/compose.yaml; infra/livekit.yaml; tests/media/spike.test.ts; tests/media/helpers/stats.ts; vitest.media.config.ts; package.json.
- **File test:** `tests/media/spike.test.ts`.
- **Nhận từ phụ thuộc:** 005 CI/Node/Vitest; LiveKit local pinned version; no app feature/DB/token service dependency.
- **Bàn giao:** pnpm test:media executes real browser/SFU synthetic video+audio spike; stats collector inbound-rtp audio/video and decoded frames.
- **Trình tự xử lý tối thiểu:** Stand alone test fixture serves HTML,creates Room client/canvas/audio nodes; read RTCPeer Connection get Stats via SDK exposed transport. Poll predicate bounded,not fixed sleep. Business clock fake only for later control tests; RTP observation real.

### Chuẩn bị và oracle từng nhóm ca

**Given:** Two independent browser contexts stand alone fixture page; test server mints room tokens using local test key; synthetic canvas frames+oscillator audio.

| ID test (tiền tố T112 nếu chỉ ghi số) | When — tác động thật | Then — đầu ra, dữ liệu bền vững và điều bị cấm |
|---|---|---|
| `Cổngpositive` | Connect A/B,attach Remote Track; poll condition bounded until actual inbound stats grow | Bvideo.bytes Received>0,frames Decoded>0,audio.bytes Received>0; record publisher/source/room IDs,not object you constructed. |
| `Cổngnegative` | Stop LiveKit then run the same command; wrong test path; no RTCports separately | Nonzero exit 0 skips; diagnostic has connection/RTCfailure,never pass With No Tests; restore local service andre re unpositive. |
| `CI` | Run fresh job using pinned Docker ports and headless real browser | One command finds at least 1 test; artifacts actual stats samples,no private camera recording. |

**Mã assertion trọng tâm:** đặt ngay trong file test nêu trên; `actual` phải được thu từ hàm sản phẩm/API/SQL/DOM/thống kê thật sau bước When, theo trường được định nghĩa dưới đây. Không tạo object có sẵn các giá trị mong đợi rồi gọi assertion. Đây là oracle dùng trong test, không phải harness giả thay ứng dụng.

```ts
import { expect } from 'vitest';

type Evidence112 = { videoBytes: number; videoFrames: number; audioBytes: number };

export function assertIssue112KeyCase(actual: Evidence112): void {
  expect(actual.videoBytes).toBeGreaterThan(0); expect(actual.videoFrames).toBeGreaterThan(0); expect(actual.audioBytes).toBeGreaterThan(0);
}
```

Với lane integration, dùng `createTestApp`, `seedUsers`, `authAs`, `withBarrier` từ `tests/fixtures/integration.ts` (ISSUE-044; chữ ký trong ISSUE-044). Mỗi ca nhận DB thật và tự đóng tài nguyên trong `finally`; so cả response và truy vấn DB từ kết nối khác sau commit. Ca race lấy hai `db.connect()` riêng, xác nhận hai PID khác nhau và đặt barrier trước điểm tranh khoá; chạy cả hai thứ tự giải phóng. Fixture không được tự ghi kết quả nghiệp vụ mà test đang chứng minh. Với lane UI/media, chuẩn bị trạng thái bằng API thật; chỉ lỗi/độ trễ transport được điều khiển để tạo trạng thái kiểm thử.

### Các bước nhỏ: đỏ → mã tối thiểu → xanh → thử phá

- [ ] **Đỏ:** tạo từng test ID với fixture/oracle ở trên; chạy lệnh tập trung bên dưới. Lỗi phải chỉ đúng hành vi chưa có; thiếu DB/SFU cũng là lỗi, không bỏ qua test.
- [ ] **Mã tối thiểu:** thực hiện đúng trình tự xử lý và file đã nêu; tái sử dụng hợp đồng phụ thuộc, không thêm công nghệ ngoài TECH. Đọc lại assertion trước khi sửa mã.
- [ ] **Xanh:** chạy lại từng ca vừa thêm, đủ mọi hàng của bảng test bắt buộc, rồi lane đầy đủ. Kiểm dữ liệu bị cấm không chỉ status HTTP hay nút UI.
- [ ] **Thử phá có kiểm soát:** Return fake RTP stats or remove media from Vitest include; negative LiveKit/path test must fail. Khôi phục mã ngay sau khi lưu log đỏ, chạy xanh lại; không commit lỗi cố ý.
- [ ] **Bằng chứng:** ghi `docs/test-reports/ISSUE-112.md`: commit, môi trường, từng ID, lệnh/exit/pass/fail/skip=0, số đo thô, negative control và giới hạn chưa đo. Không dùng file kế hoạch này làm report.
- [ ] **Đóng issue:** đủ checklist PASS gốc và các ca ở đây, bốn cổng/lane liên quan đạt, PR merge rồi mới đổi trạng thái theo WORKFLOW.

```bash
pnpm test:media -- tests/media/spike.test.ts
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:media
```

**Chặn riêng của issue:** Không Docker/RTC/browser media ⇒ BLOCKED local; Cloud không cần cho scope 112. Không thiếu token 114/UI 116 để chặn spike.

**Issue kế tiếp nhận gì / nghiệm thu còn ở đâu:** 113–117 only after actual spike PASS; 114 takes ownership of product token service.


### Bộ thu thống kê phải đọc kết nối thật

Đặt hàm dưới tại `tests/media/helpers/stats.ts`. Tham số `peer` phải lấy từ kết nối Web RTC nhận thực của browser/SFU trong spike, không tạo RTCPeer Connection rỗng hay truyền object mock. SDK adapter lấy transport thực thuộc fixture 112; nếu SDK không cung cấp đường đọc an toàn, dùng browser instrumentation ngay khi tạo peer và giữ đúng peer của bên nhận. Không dùng API nội bộ chưa xác minh rồi báo PASS.

```ts
export async function readInbound(peer: RTCPeerConnection) {
  const values = { videoBytes: 0, videoFrames: 0, audioBytes: 0 };
  const report = await peer.getStats();
  report.forEach((stat) => {
    if (stat.type !== 'inbound-rtp' || stat.isRemote) return;
    const kind = stat.kind ?? stat.mediaType;
    if (kind === 'video') {
      values.videoBytes += stat.bytesReceived ?? 0;
      values.videoFrames += stat.framesDecoded ?? 0;
    }
    if (kind === 'audio') values.audioBytes += stat.bytesReceived ?? 0;
  });
  return values;
}
```

Sau khi nguồn A phát và B đăng ký, runner dùng polling có deadline đọc `readInbound(peer)` cho đến khi cả ba trường dương. Dừng SFU rồi chạy lại cùng ca phải đỏ. ISSUE-115/117 bổ sung nguồn có sequence và cửa sổ sau drain; hàm cộng byte này một mình không chứng minh quyền thu hồi.

## TRÁCH NHIỆM NGHIỆM THU AC

Đối chiếu [AC-COVERAGE](AC-COVERAGE.md). Phần này phân công bằng chứng; yêu cầu được định nghĩa tại nguồn liên kết, không thay đổi checklist PASS và các test T/TS ở trên.

Issue này cung cấp nền tảng hoặc một phần triển khai cho owner nghiệm thu phía sau; vẫn phải hoàn thành mọi test T/TS/GR và ô PASS của chính issue. Ghi contract bàn giao và issue tiêu thụ trong báo cáo; không tự nhận AC của issue khác đã đạt.
