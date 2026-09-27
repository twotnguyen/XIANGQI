# EP01 · Nền tảng kho mã & môi trường phát triển

> **Loại:** Epic · **Story:** [ST01.1](../story/ST01.1-kho-ma-monorepo-lint-va-khung-kiem-thu.md), [ST01.2](../story/ST01.2-ci-4-cong-va-supabase-local.md), [ST01.3](../story/ST01.3-khung-ung-dung-web-router-token-bo-cuc.md)

| Trường Jira | Giá trị |
|---|---|
| Issue Type | Epic |
| Summary | `EP01 · Nền tảng kho mã & môi trường phát triển` |
| Components | DevOps, Backend, Frontend, Tester |
| Priority | Highest |
| Labels | `xq-v2`, `ep01`, `critical-path` |
| Fix versions | `v0.1.0` |
| Start date / Due date | 2026-09-28 / 2026-09-30 |
| Nguồn đặc tả | ISSUE-001, 002, 003, 004, 005, 034, một phần 055 (router, tokens) |

---

> ⏱ **Đọc lần đầu:** khoảng 10 phút. · Từ kỹ thuật lạ ⇒ [Từ điển kỹ thuật](../05-TU-DIEN-KY-THUAT.md) · Cách kiểm thử chung ⇒ [Sổ tay kiểm thử](../04-HUONG-DAN-KIEM-THU.md)

## 1. TÓM TẮT (đọc trong 1 phút)

Trước khi ai viết chức năng, cả nhóm cần **một kho mã chạy giống hệt nhau trên mọi máy**:

| Sau Epic này, ai cũng làm được | Bằng lệnh |
|---|---|
| Cài toàn bộ dự án | `pnpm install --frozen-lockfile` |
| Chạy web + server | `pnpm dev` |
| Kiểm chất lượng 4 cổng | `pnpm lint && pnpm typecheck && pnpm build && pnpm test:unit` |
| Test giao diện trên trình duyệt thật | `pnpm test:e2e` |
| Chạy DB + đăng nhập + hộp thư ở máy mình | `pnpm db:start` |
| Test máy chủ trên DB thật | `pnpm test:integration` |

Và **GitHub tự chặn** mọi PR đỏ không cho merge vào `main`.

## 2. BỐI CẢNH — VÌ SAO EPIC NÀY TỒN TẠI

- Lần xây trước **thất bại ở 30 chỗ**; nhiều chỗ bắt nguồn từ việc test "xanh giả" (test bị bỏ qua, test tự mock chính nó, lane chưa có mà vẫn báo xanh). Epic này dựng khung để điều đó **không thể** xảy ra ngay từ ngày đầu.
- Đây là **đường găng** của dự án: mọi Epic khác phụ thuộc vào đây. Trễ 1 ngày = cả nhóm trễ 1 ngày.

## 3. KHÁI NIỆM CẦN HIỂU (dành cho người mới)

| Khái niệm | Giải thích |
|---|---|
| **Monorepo pnpm** | Một kho chứa 6 package; web và server dùng **chung** gói luật cờ |
| **4 cổng** | lint (soát lỗi code) → typecheck (kiểm kiểu) → build (biên dịch) → test:unit. Bắt buộc exit 0 trước khi mở PR (`AGENTS.md` §5) |
| **Lane test** | Nhóm test theo loại: unit, integration (DB thật), e2e (trình duyệt thật), media, ai, load — xem [Từ điển](../05-TU-DIEN-KY-THUAT.md#test-lanes) |
| **Xanh giả** | Test báo đạt mà thực ra không chạy gì. Dự án cấm: lane chưa có phải **báo lỗi**, thiếu DB phải **đỏ**, cấm `.skip`/`.only` |
| **Đồng hồ giả** | Công cụ tua thời gian trong test — xem [Từ điển](../05-TU-DIEN-KY-THUAT.md#clock) |
| **Biến `VITE_*`** | Công khai trong trình duyệt ⇒ không bao giờ chứa khoá bí mật |

## 4. PHẠM VI

**✅ LÀM**
- Monorepo pnpm 6 package, TypeScript strict, khoá chính xác phiên bản, `pnpm dev`.
- ESLint + Prettier + luật ranh giới kiến trúc (có đầu dò chứng minh).
- Vitest + đồng hồ giả; Playwright 2 kích thước (1366×768, 360×800) + 8 phiên độc lập.
- CI GitHub Actions (quality, e2e, integration) + chặn `.skip`/`.only` + bảo vệ nhánh `main`.
- Supabase local (bật xác minh email), `.env.example`, lane integration tối thiểu, module kiểm cấu hình server.
- Khung web: 18 route, `tokens.css`, bố cục, component dùng chung, `apiFetch`, client Supabase.

**❌ KHÔNG LÀM**
| Việc | Ở đâu |
|---|---|
| Bảng dữ liệu, RLS, harness tích hợp đầy đủ | EP05 |
| Đăng nhập thật | EP06 |
| LiveKit | EP14 |
| Triển khai lên Internet | EP16 |
| Mọi logic nghiệp vụ | Các Epic sau |

## 5. QUY TẮC DÙNG CHUNG

| Quy tắc | Nghĩa |
|---|---|
| Khoá chính xác phiên bản (`TECH-04`) | Không `^`, `~`, `latest`; `.npmrc save-exact=true` |
| Ghi phiên bản đã cài thật (`TECH-05`) | `docs/test-reports/toolchain.md` |
| Không công nghệ ngoài bảng chốt | Không Redis, Tailwind, thư viện UI dựng sẵn… (`AGENTS.md` §14) |
| Không commit bí mật | `.env` trong `.gitignore`; không khoá thật trong `.env.example` |
| Mọi lane chưa có phải báo lỗi | `NOT_IMPLEMENTED — xem <Task>` và exit 1 |
| Git | Nhánh `feature/XW-<số>-ten-ngan`; một Task một PR; commit `<loại>(<phạm vi>): <mô tả> [XW-<số>]` — xem [AGENTS.md §8.5](../../AGENTS.md) |

## 6. ĐẦU VÀO

Không phụ thuộc Epic nào. Chỉ cần: quyền ghi repo GitHub của nhóm, quyền Admin (bật bảo vệ nhánh), mỗi máy có Node 24, pnpm, Docker Desktop, Supabase CLI. ST01.3 cần thêm thiết kế design system (TK02.1.1).

## 7. DANH SÁCH STORY

| Story | Tên | Sprint | SP | Vai trò |
|---|---|---|---|---|
| [ST01.1](../story/ST01.1-kho-ma-monorepo-lint-va-khung-kiem-thu.md) | Kho mã monorepo, lint và khung kiểm thử | 1 | 8 | OPS, QA |
| [ST01.2](../story/ST01.2-ci-4-cong-va-supabase-local.md) | CI 4 cổng và Supabase local | 1 | 5 | OPS, BE, QA |
| [ST01.3](../story/ST01.3-khung-ung-dung-web-router-token-bo-cuc.md) | Khung ứng dụng web (router, token, bố cục) | 1 | 2 | FE |

ST01.1 phải xong trước; ST01.2 và ST01.3 chạy **song song** sau đó.

## 8. TIÊU CHÍ HOÀN THÀNH EPIC

- [ ] 3 Story Done, mọi Task có báo cáo `docs/test-reports/TK01.*.md`.
- [ ] Một thành viên **mới** clone kho, chỉ đọc README, chạy được mọi lệnh ở bảng mục 1 (TK01.1.5 xác nhận).
- [ ] PR có lỗi bất kỳ ⇒ CI đỏ đúng bước và **không** merge được (TK01.2.1 xác nhận bằng PR thật).
- [ ] Không có khoá bí mật trong Git, log hay gói JavaScript web (TK01.2.4 xác nhận).
- [ ] **Demo cuối Epic** (mục 9) chạy trước nhóm.

## 9. KỊCH BẢN DEMO CUỐI EPIC (~10 phút)

1. Trên máy một bạn **không** tham gia làm Epic: clone → `pnpm install --frozen-lockfile` → `pnpm dev` → mở web thấy "Cờ Tướng Online", `/health` trả `{"ok":true}`.
2. `pnpm db:start` → mở Studio (54323) và hộp thư (54324).
3. `pnpm test:unit`, `pnpm test:integration`, `pnpm test:e2e` đều xanh.
4. Mở một PR có `it.only` → CI đỏ ở bước "Chặn .only", nút Merge khoá.

## 10. RỦI RO VÀ CÁCH GIẢM

| Rủi ro | Khả năng | Ảnh hưởng | Cách giảm |
|---|---|---|---|
| Trễ ⇒ cả nhóm trễ | Trung bình | Rất cao | Ưu tiên tuyệt đối 28–30/09; người làm DevOps không nhận việc khác trong 2 ngày này |
| Máy thành viên khác nhau (Windows/macOS) chạy lệnh khác nhau | Cao | Trung bình | TK01.1.5 kiểm trên máy khác; README ghi riêng lệnh Windows nếu cần |
| Docker/Supabase không chạy trên máy yếu | Trung bình | Cao | Phát hiện sớm ở TK01.2.4. Máy không chạy được Docker ⇒ báo trưởng nhóm để mượn/xoay máy; **không** bỏ qua test tích hợp |
| Chưa có quyền Admin GitHub để bật bảo vệ nhánh | Trung bình | Cao | Trưởng nhóm cấp quyền ngày 28/09 |
