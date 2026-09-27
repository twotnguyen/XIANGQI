# 07 — PHÂN CÔNG THÀNH VIÊN

**Dự án:** Cờ Tướng Online · **Jira:** `XW` (site `xiangqi-web.atlassian.net`) · **Tạo:** 2026-09-27

> ⏱ **Cách dùng:** bảng 1 ghép người thật với mã TV · bảng 2 vai trò · bảng 3 tải từng người theo tuần · bảng 4 **Người làm / Người kiểm / ngày** của từng Task — đã gán lên Jira (Assignee = Người làm; Người kiểm ghi đầu mô tả Task).
>
> **Đổi phân công:** sửa bảng 4, rồi sửa Assignee trên Jira và dòng "Người kiểm" trong mô tả Task. Người kiểm luôn khác người làm; mỗi người ≤ 37,5 giờ/tuần.

---

## 1. THÀNH VIÊN TRÊN JIRA (lấy từ Jira ngày 2026-09-27)

Jira có đúng **7 tài khoản người thật** (không tính tài khoản ứng dụng: Slack, Automation, Atlassian Assist…). Email của thành viên khác bị Atlassian ẩn nên không có ở đây.


| #   | Tên hiển thị trên Jira   | Account ID                                    | **Mã TV** (điền) | Ghi chú                                                            |
| --- | ------------------------ | --------------------------------------------- | ---------------- | ------------------------------------------------------------------ |
| 1   | TÌNH 4851\_NGUYỄN NGỌC   | `712020:f4042fc2-ba79-43ad-8ee0-293f56434c23` | **TV5**          | Trưởng nhóm / quản trị Jira                                        |
| 2   | Tưởng Lê khoa Cường-4572 | `712020:91fd9097-411b-4618-9585-29ad9712c346` | **TV3**          |                                                                    |
| 3   | 4841\_Lê Thị Xuân Nhạn   | `712020:f1637552-6150-4198-afed-c2af454dd6dc` | **TV4**          |                                                                    |
| 4   | Nguyễn Minh Thư          | `712020:5b8f2874-7938-4cff-bd77-9671381f301f` | **TV6**          |                                                                    |
| 5   | Võ Thành Đông            | `712020:38fd850f-76a4-493c-b474-da1d3ecbc6bc` | **TV1**          |                                                                    |
| 6   | Gia Kỳ                   | `712020:1451a1ca-6eca-44ce-b834-02eb38d1dd18` | **TV7**          |                                                                    |
| 7   | nguyenhoangtungtuyhoa    | `712020:301ba2fa-0327-4499-8a6e-5e49fdff7e34` | **TV2**          | Tên hiển thị chưa có họ tên đầy đủ — nên đổi trong hồ sơ Atlassian |


---

## 2. VAI TRÒ (TV1–TV7)

Component trên Jira vẫn giữ đúng nội dung việc; một người nhận Task của component khác khi rảnh, và kiểm ở Ready For Test chỉ khi **không phải người làm Task đó**.


| Mã TV   | Vai trò chính          | Phụ trách                                                                                                                              | Nhận thêm khi rảnh                      |
| ------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| **TV1** | Backend A              | Đường xử lý lệnh ván, realtime, đồng hồ, thao tác ván, media BE, tích hợp AI (EP10, EP11, EP12, EP14 BE, EP15 BE) + contracts (ST03.1) | Kiểm Ready For Test cho Task FE (S4)    |
| **TV2** | Backend B              | CSDL, tài khoản, bạn bè, phòng, lời mời, người xem, chat, bảo mật/healthz (EP05–EP09, EP13, EP16 BE)                                   | Kiểm Ready For Test cho Task FE/AI (S4) |
| **TV3** | Frontend A             | Khung web, tài khoản, bạn bè, sảnh/phòng, lời mời, người xem, chat, responsive (EP01.3, EP06–EP09, EP13 FE, TK16.2.1/16.2.3)           | Kiểm Ready For Test cho Task BE         |
| **TV4** | Frontend B + DevOps S1 | Bàn cờ, phòng chơi, đồng hồ, treo ván, lịch sử, media, chơi với máy, trợ năng (EP10–EP12, EP14, EP15 FE, TK16.2.2) + DevOps Sprint 1   | —                                       |
| **TV5** | AI + luật cờ           | Luật cờ (ST03.2, ST03.3), máy cờ (EP04, EP15 AI), ghi chú bảo vệ                                                                       | Tester thứ ba (S3–S4)                   |
| **TV6** | Design → Tester 2      | Thiết kế (EP02, TK16.2.4); từ Sprint 2 làm Tester thứ hai                                                                              | Kiểm Ready For Test                     |
| **TV7** | Tester chính + DevOps  | Kiểm mọi Task ở Ready For Test, 20 Task \[QA\] tích hợp; DevOps từ Sprint 2 (LiveKit, Google OAuth, triển khai, bàn giao)              | —                                       |


---

## 3. KHỐI LƯỢNG THEO LỊCH (giờ làm + giờ kiểm)

Lịch được xếp bằng máy theo quy tắc "Task chặn phải Done", giới hạn **37,5 giờ/người/tuần** và giả định tốc độ AI agent ([01-KE-HOACH §1](01-KE-HOACH-4-TUAN.md)). Giờ tính theo tuần bắt đầu việc.

| Mã TV | Tuần 1 làm | Tuần 1 kiểm | Tuần 2 làm | Tuần 2 kiểm | Tuần 3 làm | Tuần 3 kiểm | Tuần 4 làm | Tuần 4 kiểm | Tổng |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| TV1 | 12 | 5 | 6,5 | 6,5 | 30 | — | — | 5,5 | 65,5 |
| TV2 | 12,5 | 4,5 | 25,5 | 1,5 | 22,5 | 10,5 | — | 4,5 | 81,5 |
| TV3 | 3 | 1,5 | 4 | 4 | 29,5 | 8 | 6,5 | — | 56,5 |
| TV4 | 27 | — | 17,5 | — | 15 | 13 | 8 | — | 80,5 |
| TV5 | 14,5 | 4 | 22,5 | 4,5 | 22,5 | 11 | 21 | 0,5 | 100,5 |
| TV6 | 16 | 10,5 | 23,5 | 9,5 | 10 | 22 | 18,5 | 3,5 | 113,5 |
| TV7 | 5,5 | 19 | 2 | 25,5 | 5 | 26,5 | 18 | 1,5 | 103 |

Không ai vượt 37,5 giờ/tuần. **Người kiểm** do lịch chọn: người rảnh sớm nhất, ưu tiên TV7 → TV6 → TV5, luôn **khác người làm**. Task `[QA]` chia cho TV7/TV6/TV5 theo người rảnh.

---

## 4. BẢNG PHÂN CÔNG TỪNG TASK

Cột **Vai trò** = Component trên Jira. **Giờ** = giờ làm / giờ kiểm ở Ready For Test (Task `[QA]` không có giờ kiểm riêng). **Gợi ý** = phân công theo vai trò ban đầu; **Người làm** / **Người kiểm** = theo lịch đã xếp (đã gán trên Jira). Sprint theo Story.

### Sprint 1 — 23 Task

| Mã · Key | Việc | Vai trò | Giờ | Gợi ý | **Người làm** | **Người kiểm** | Bắt đầu | Done |
|---|---|---|---|---|---|---|---|---|
| [TK01.1.1](task/TK01.1.1-khoi-tao-monorepo-pnpm-typescript-nghiem-ngat.md) · [XW-72](https://xiangqi-web.atlassian.net/browse/XW-72) | Khởi tạo monorepo pnpm + TypeScript nghiêm ngặt | OPS | 5 / 1 | TV4 | TV4 | TV7 | 28/09 | 28/09 |
| [TK01.1.3](task/TK01.1.3-vitest-cho-unit-test-dong-ho-gia-tiem-vao.md) · [XW-74](https://xiangqi-web.atlassian.net/browse/XW-74) | Vitest cho unit test + đồng hồ giả tiêm vào | OPS | 3 / 1,5 | TV4 | TV4 | TV7 | 28/09 | 29/09 |
| [TK02.1.1](task/TK02.1.1-design-system-token-thanh-phan-bo-cuc-khung-trang.md) · [XW-82](https://xiangqi-web.atlassian.net/browse/XW-82) | Design system: token, thành phần, bố cục khung trang | DS | 7 / 1,5 | TV6 | TV6 | TV7 | 28/09 | 29/09 |
| [TK01.1.4](task/TK01.1.4-playwright-e2e-2-kich-thuoc-man-hinh-8-phien-doc-lap.md) · [XW-75](https://xiangqi-web.atlassian.net/browse/XW-75) | Playwright e2e: 2 kích thước màn hình + 8 phiên độc lập | OPS | 3 / 1,5 | TV4 | TV4 | TV1 | 29/09 | 30/09 |
| [TK01.2.2](task/TK01.2.2-supabase-local-bien-moi-truong-mau-va-runner-test-tich-hop.md) · [XW-78](https://xiangqi-web.atlassian.net/browse/XW-78) | Supabase local, biến môi trường mẫu và runner test tích hợp | OPS | 4 / 1,5 | TV4 | TV4 | TV7 | 29/09 | 30/09 |
| [TK02.1.2](task/TK02.1.2-thiet-ke-ban-co-quan-co-va-tuong-tac-tren-ban.md) · [XW-83](https://xiangqi-web.atlassian.net/browse/XW-83) | Thiết kế bàn cờ, quân cờ và tương tác trên bàn | DS | 5,5 / 1,5 | TV6 | TV6 | TV2 | 29/09 | 30/09 |
| [TK03.1.1](task/TK03.1.1-kieu-loi-ban-co-ham-toa-do.md) · [XW-89](https://xiangqi-web.atlassian.net/browse/XW-89) | Kiểu lõi bàn cờ + hàm toạ độ | BE | 2 / 1,5 | TV1 | TV1 | TV7 | 29/09 | 29/09 |
| [TK03.1.2](task/TK03.1.2-kieu-van-phong-chat-media-ai-schema-zod-ma-loi.md) · [XW-90](https://xiangqi-web.atlassian.net/browse/XW-90) | Kiểu ván/phòng/chat/media/AI + schema Zod + mã lỗi | BE | 3 / 2 | TV1 | TV1 | TV5 | 29/09 | 30/09 |
| [TK03.2.1](task/TK03.2.1-the-co-ban-dau-makeposition-khoa-the-co-hinh-hoc-tan-cong.md) · [XW-91](https://xiangqi-web.atlassian.net/browse/XW-91) | Thế cờ ban đầu, makePosition, khoá thế cờ, hình học tấn công | BE | 3 / 2 | TV5 | TV5 | TV6 | 29/09 | 30/09 |
| [TK01.2.1](task/TK01.2.1-ci-github-actions-4-cong-bao-ve-nhanh-main.md) · [XW-77](https://xiangqi-web.atlassian.net/browse/XW-77) | CI GitHub Actions 4 cổng + bảo vệ nhánh main | OPS | 3 / 2 | TV4 | TV4 | TV1 | 30/09 | 01/10 |
| [TK01.2.3](task/TK01.2.3-module-doc-va-kiem-tra-cau-hinh-server-env-ts.md) · [XW-79](https://xiangqi-web.atlassian.net/browse/XW-79) | Module đọc và kiểm tra cấu hình server (env.ts) | BE | 1 / 1 | TV1 | TV1 | TV6 | 30/09 | 30/09 |
| [TK01.3.1](task/TK01.3.1-router-tokens-css-bo-cuc-trang-client-api-supabase.md) · [XW-81](https://xiangqi-web.atlassian.net/browse/XW-81) | Router, tokens.css, bố cục trang, client API/Supabase | FE | 3 / 1,5 | TV3 | TV3 | TV2 | 30/09 | 01/10 |
| [TK03.2.2](task/TK03.2.2-sinh-nuoc-tuong-si-tuong-tot.md) · [XW-92](https://xiangqi-web.atlassian.net/browse/XW-92) | Sinh nước Tướng, Sĩ, Tượng, Tốt | BE | 2,5 / 1,5 | TV5 | TV5 | TV7 | 30/09 | 01/10 |
| [TK03.2.3](task/TK03.2.3-sinh-nuoc-ma-xe-phao.md) · [XW-93](https://xiangqi-web.atlassian.net/browse/XW-93) | Sinh nước Mã, Xe, Pháo | BE | 2,5 / 1,5 | TV5 | TV5 | TV6 | 30/09 | 01/10 |
| [TK05.1.1](task/TK05.1.1-migration-profiles-trigger-va-friendships.md) · [XW-103](https://xiangqi-web.atlassian.net/browse/XW-103) | Migration profiles (+ trigger) và friendships | BE | 2 / 1,5 | TV2 | TV2 | TV7 | 30/09 | 30/09 |
| [TK05.1.2](task/TK05.1.2-migration-rooms-room-members-room-blocks-user-active-room-in.md) · [XW-104](https://xiangqi-web.atlassian.net/browse/XW-104) | Migration rooms, room\_members, room\_blocks, user\_active\_room, invitations | BE | 2,5 / 2 | TV2 | TV2 | TV7 | 30/09 | 01/10 |
| [TK01.1.2](task/TK01.1.2-eslint-prettier-luat-ranh-gioi-kien-truc.md) · [XW-73](https://xiangqi-web.atlassian.net/browse/XW-73) | ESLint + Prettier + luật ranh giới kiến trúc | OPS | 2,5 / 1 | TV4 | TV4 | TV3 | 01/10 | 02/10 |
| [TK01.2.4](task/TK01.2.4-kiem-chung-supabase-local-cau-hinh-va-chong-ro-khoa-bi-mat.md) · [XW-80](https://xiangqi-web.atlassian.net/browse/XW-80) | Kiểm chứng Supabase local, cấu hình và chống rò khoá bí mật | QA | 1,5 | TV7 | TV6 | — | 01/10 | 01/10 |
| [TK03.3.1](task/TK03.3.1-tuong-doi-mat-isincheck-getlegalmoves.md) · [XW-94](https://xiangqi-web.atlassian.net/browse/XW-94) | Tướng đối mặt, isInCheck, getLegalMoves | BE | 2,5 / 2 | TV5 | TV5 | TV6 | 01/10 | 01/10 |
| [TK05.1.3](task/TK05.1.3-migration-matches-match-moves-cay-match-events-active-player.md) · [XW-105](https://xiangqi-web.atlassian.net/browse/XW-105) | Migration matches, match\_moves (cây), match\_events, active\_players, biên lai lệnh, đề nghị, phiếu tái đấu, đổi bên | BE | 3 / 2 | TV2 | TV2 | TV7 | 01/10 | 01/10 |
| [TK01.1.5](task/TK01.1.5-kiem-chung-monorepo-va-lint-tren-may-sach.md) · [XW-76](https://xiangqi-web.atlassian.net/browse/XW-76) | Kiểm chứng monorepo và lint trên máy sạch | QA | 2 | TV7 | TV6 | — | 02/10 | 02/10 |
| [TK03.3.2](task/TK03.3.2-validatemove-applymove.md) · [XW-95](https://xiangqi-web.atlassian.net/browse/XW-95) | validateMove + applyMove | BE | 1,5 / 1,5 | TV5 | TV5 | TV2 | 02/10 | 02/10 |
| [TK03.3.3](task/TK03.3.3-ket-thuc-van-chieu-het-het-nuoc-dem-lap-3-lan.md) · [XW-96](https://xiangqi-web.atlassian.net/browse/XW-96) | Kết thúc ván (chiếu hết/hết nước) + đếm lặp 3 lần | BE | 2,5 / 2 | TV5 | TV5 | TV6 | 02/10 | 02/10 |

### Sprint 2 — 21 Task

| Mã · Key | Việc | Vai trò | Giờ | Gợi ý | **Người làm** | **Người kiểm** | Bắt đầu | Done |
|---|---|---|---|---|---|---|---|---|
| [TK05.2.1](task/TK05.2.1-migration-chat-chat-contexts-chat-private-segments-chat-priv.md) · [XW-106](https://xiangqi-web.atlassian.net/browse/XW-106) | Migration chat: chat\_contexts, chat\_private\_segments, chat\_private\_participants, chat\_messages | BE | 2,5 / 2 | TV2 | TV2 | TV6 | 01/10 | 02/10 |
| [TK05.2.2](task/TK05.2.2-migration-media-ai-jobs-client-controls-app-sessions-auth-se.md) · [XW-107](https://xiangqi-web.atlassian.net/browse/XW-107) | Migration media, ai\_jobs, client\_controls, app\_sessions, auth\_security\_jobs | BE | 3 / 2 | TV1 | TV1 | TV7 | 01/10 | 02/10 |
| [TK10.1.1](task/TK10.1.1-ve-ban-co-svg-90-giao-diem-va-32-quan-chu-han-co-nhan-tro-na.md) · [XW-141](https://xiangqi-web.atlassian.net/browse/XW-141) | Vẽ bàn cờ SVG 90 giao điểm và 32 quân chữ Hán có nhãn trợ năng | FE | 3,5 / 1,5 | TV4 | TV4 | TV1 | 01/10 | 01/10 |
| [TK14.1.1](task/TK14.1.1-dung-livekit-local-bang-docker-ghim-phien-ban-mo-dai-cong-rt.md) · [XW-169](https://xiangqi-web.atlassian.net/browse/XW-169) | Dựng LiveKit local bằng Docker (ghim phiên bản, mở dải cổng RTC, loopback) | OPS | 3 / 0,5 | TV7 | TV7 | TV5 | 01/10 | 02/10 |
| [TK05.2.3](task/TK05.2.3-rls-toan-bo-bang-vai-tro-app-server-grants-ham-kiem-phien.md) · [XW-108](https://xiangqi-web.atlassian.net/browse/XW-108) | RLS toàn bộ bảng, vai trò app\_server, grants, hàm kiểm phiên | BE | 2,5 / 2 | TV2 | TV2 | TV7 | 02/10 | 05/10 |
| [TK10.1.2](task/TK10.1.2-chon-quan-hien-dich-hop-le-gui-y-dinh-di-nuoc-lat-ban-theo-p.md) · [XW-142](https://xiangqi-web.atlassian.net/browse/XW-142) | Chọn quân, hiện đích hợp lệ, gửi ý định đi nước, lật bàn theo phe | FE | 3 / 1,5 | TV4 | TV4 | TV5 | 02/10 | 02/10 |
| [TK14.1.2](task/TK14.1.2-lane-test-media-spike-phat-nguon-tong-hop-doc-byte-rtp-khung.md) · [XW-170](https://xiangqi-web.atlassian.net/browse/XW-170) | Lane test:media + spike: phát nguồn tổng hợp, đọc byte RTP/khung hình thật | BE | 3 / 1 | TV1 | TV1 | TV7 | 02/10 | 02/10 |
| [TK04.1.1](task/TK04.1.1-ham-luong-gia-vat-chat-bang-vi-tri-linh-hoat-an-toan-tuong.md) · [XW-97](https://xiangqi-web.atlassian.net/browse/XW-97) | Hàm lượng giá: vật chất, bảng vị trí, linh hoạt, an toàn tướng | AI | 3 / 1,5 | TV5 | TV5 | TV6 | 05/10 | 05/10 |
| [TK04.1.2](task/TK04.1.2-sap-xep-nuoc-di-pv-truoc-mvv-lva.md) · [XW-98](https://xiangqi-web.atlassian.net/browse/XW-98) | Sắp xếp nước đi (PV trước, MVV-LVA) | AI | 1 / 1 | TV5 | TV5 | TV7 | 05/10 | 05/10 |
| [TK04.2.1](task/TK04.2.1-negamax-co-so-alpha-beta-ham-so-sanh-so-node.md) · [XW-99](https://xiangqi-web.atlassian.net/browse/XW-99) | Negamax cơ sở + alpha-beta + hàm so sánh số node | AI | 3,5 / 2 | TV5 | TV5 | TV6 | 05/10 | 06/10 |
| [TK05.3.1](task/TK05.3.1-harness-test-tich-hop-factory-nguoi-dung-that-runid-rao-dong.md) · [XW-109](https://xiangqi-web.atlassian.net/browse/XW-109) | Harness test tích hợp: factory người dùng thật, runId, rào đồng bộ | BE | 2,5 / 2 | TV2 | TV2 | TV7 | 05/10 | 05/10 |
| [TK05.3.2](task/TK05.3.2-prisma-db-pull-pool-pg-withtransaction-chan-prisma-migrate.md) · [XW-110](https://xiangqi-web.atlassian.net/browse/XW-110) | Prisma db pull + pool pg + withTransaction + chặn prisma migrate | BE | 1,5 / 1 | TV2 | TV2 | TV6 | 05/10 | 05/10 |
| [TK10.1.3](task/TK10.1.3-ban-phim-chuyen-dong-nuoc-di-danh-dau-nuoc-vua-di-va-bi-chie.md) · [XW-143](https://xiangqi-web.atlassian.net/browse/XW-143) | Bàn phím, chuyển động nước đi, đánh dấu nước vừa đi và bị chiếu | FE | 3 / 1,5 | TV4 | TV4 | TV5 | 05/10 | 05/10 |
| [TK14.1.3](task/TK14.1.3-chay-lai-cong-media-doc-lap-byte-khung-hinh-that-tat-livekit.md) · [XW-171](https://xiangqi-web.atlassian.net/browse/XW-171) | Chạy lại cổng media độc lập: byte/khung hình thật, tắt LiveKit phải đỏ | QA | 2 | TV7 | TV6 | — | 05/10 | 05/10 |
| [TK04.2.2](task/TK04.2.2-dao-sau-dan-theo-ngan-sach-thoi-gian-huy-nuoc-du-phong.md) · [XW-100](https://xiangqi-web.atlassian.net/browse/XW-100) | Đào sâu dần theo ngân sách thời gian + huỷ + nước dự phòng | AI | 2,5 / 1,5 | TV5 | TV5 | TV7 | 06/10 | 07/10 |
| [TK08.1.1](task/TK08.1.1-api-tao-phong-sql-thuan-mot-tai-khoan-mot-phong-tao-ngu-canh.md) · [XW-126](https://xiangqi-web.atlassian.net/browse/XW-126) | API tạo phòng (SQL thuần, một tài khoản một phòng, tạo ngữ cảnh chat) | BE | 2 / 1,5 | TV2 | TV2 | TV7 | 06/10 | 06/10 |
| [TK08.1.2](task/TK08.1.2-dich-vu-nhan-nguoi-vao-phong-khoa-phong-dem-trong-khoa-thu-t.md) · [XW-127](https://xiangqi-web.atlassian.net/browse/XW-127) | Dịch vụ nhận người vào phòng (khoá phòng, đếm trong khoá, thứ tự lỗi không lộ phòng) | BE | 3 / 3 | TV2 | TV2 | TV7 | 06/10 | 07/10 |
| [TK02.2.2](task/TK02.2.2-thiet-ke-sanh-tao-phong-phong-cho-loi-moi-danh-sach-nguoi-xe.md) · [XW-85](https://xiangqi-web.atlassian.net/browse/XW-85) | Thiết kế sảnh, tạo phòng, phòng chờ, lời mời, danh sách người xem | DS | 5,5 / 1 | TV6 | TV6 | TV5 | 07/10 | 08/10 |
| [TK02.2.1](task/TK02.2.1-thiet-ke-6-man-tai-khoan-cai-dat-ho-so-va-trang-ban-be.md) · [XW-84](https://xiangqi-web.atlassian.net/browse/XW-84) | Thiết kế 6 màn tài khoản, cài đặt hồ sơ và trang bạn bè | DS | 5,5 / 1 | TV6 | TV6 | TV5 | 08/10 | 09/10 |
| [TK16.7.1](task/TK16.7.1-gioi-han-tan-suat-kich-thuoc-body-cors-allowlist-tieu-de-bao.md) · [XW-202](https://xiangqi-web.atlassian.net/browse/XW-202) | Giới hạn tần suất, kích thước body, CORS allowlist, tiêu đề bảo mật | BE | 2,5 / 2 | TV2 | TV2 | TV1 | 08/10 | 09/10 |
| [TK02.4.1](task/TK02.4.1-thiet-ke-chon-cap-do-may-van-voi-may-lich-su-xem-lai.md) · [XW-88](https://xiangqi-web.atlassian.net/browse/XW-88) | Thiết kế chọn cấp độ máy, ván với máy, lịch sử, xem lại | DS | 3,5 / 1 | TV6 | TV6 | TV5 | 09/10 | 09/10 |

### Sprint 3 — 51 Task

| Mã · Key | Việc | Vai trò | Giờ | Gợi ý | **Người làm** | **Người kiểm** | Bắt đầu | Done |
|---|---|---|---|---|---|---|---|---|
| [TK06.1.1](task/TK06.1.1-authguard-verify-jwt-bang-jwks-kiem-phien-moi-yeu-cau-onboar.md) · [XW-111](https://xiangqi-web.atlassian.net/browse/XW-111) | AuthGuard: verify JWT bằng JWKS, kiểm phiên mỗi yêu cầu, OnboardingGuard, /me | BE | 2,5 / 2 | TV2 | TV2 | TV7 | 05/10 | 06/10 |
| [TK02.3.1](task/TK02.3.1-thiet-ke-phong-choi-bo-cuc-dong-ho-thao-tac-de-nghi-chong-tr.md) · [XW-86](https://xiangqi-web.atlassian.net/browse/XW-86) | Thiết kế phòng chơi: bố cục, đồng hồ, thao tác, đề nghị, chống treo, mất kết nối, kết quả | DS | 7 / 1,5 | TV6 | TV6 | TV2 | 06/10 | 07/10 |
| [TK06.1.2](task/TK06.1.2-dich-vu-username-chuan-hoa-kiem-dinh-dang-anh-xa-loi-trung-c.md) · [XW-112](https://xiangqi-web.atlassian.net/browse/XW-112) | Dịch vụ username: chuẩn hoá, kiểm định dạng, ánh xạ lỗi trùng; chặn tài khoản chưa xác minh | BE | 1,5 / 1,5 | TV2 | TV2 | TV3 | 06/10 | 07/10 |
| [TK04.3.1](task/TK04.3.1-corpus-hieu-nang-20-the-benchmark-cong-depth-lane-test-ai.md) · [XW-101](https://xiangqi-web.atlassian.net/browse/XW-101) | Corpus hiệu năng 20 thế + benchmark cổng depth + lane test:ai | AI | 4 / 2 | TV5 | TV5 | TV7 | 07/10 | 07/10 |
| [TK06.2.1](task/TK06.2.1-api-dang-nhap-bang-username-dang-ky-app-session.md) · [XW-114](https://xiangqi-web.atlassian.net/browse/XW-114) | API đăng nhập bằng username + đăng ký app\_session | BE | 2 / 2 | TV2 | TV2 | TV3 | 07/10 | 07/10 |
| [TK10.2.1](task/TK10.2.1-socket-io-gateway-xac-thuc-handshake-kiem-phien-moi-su-kien.md) · [XW-144](https://xiangqi-web.atlassian.net/browse/XW-144) | Socket.IO gateway: xác thực handshake, kiểm phiên mỗi sự kiện, origin, nhóm phát | BE | 2,5 / 1 | TV1 | TV1 | TV7 | 07/10 | 08/10 |
| [TK15.1.1](task/TK15.1.1-tien-trinh-con-ai-giao-thuc-ipc-co-kieu-giam-sat-tu-sinh-lai.md) · [XW-179](https://xiangqi-web.atlassian.net/browse/XW-179) | Tiến trình con AI + giao thức IPC có kiểu + giám sát tự sinh lại | AI | 2,5 / 1 | TV5 | TV5 | TV7 | 07/10 | 08/10 |
| [TK07.2.1](task/TK07.2.1-presence-online-cho-ban-be-nhieu-tab-het-han-30-giay-khong-l.md) · [XW-124](https://xiangqi-web.atlassian.net/browse/XW-124) | Presence online cho bạn bè (nhiều tab, hết hạn 30 giây, không lộ phòng) | BE | 2 / 2 | TV2 | TV2 | TV1 | 08/10 | 08/10 |
| [TK08.2.1](task/TK08.2.1-api-sanh-phan-trang-loc-su-kien-realtime-cho-nguoi-o-sanh.md) · [XW-128](https://xiangqi-web.atlassian.net/browse/XW-128) | API sảnh (phân trang, lọc) + sự kiện realtime cho người ở sảnh | BE | 2 / 1,5 | TV2 | TV2 | TV6 | 08/10 | 08/10 |
| [TK08.2.2](task/TK08.2.2-san-sang-bat-dau-van-nguyen-tu-doi-ben-truoc-van.md) · [XW-129](https://xiangqi-web.atlassian.net/browse/XW-129) | Sẵn sàng/bắt đầu ván nguyên tử + đổi bên trước ván | BE | 3,5 / 3 | TV5 | TV5 | TV7 | 08/10 | 09/10 |
| [TK10.2.2](task/TK10.2.2-heartbeat-presence-trong-phong-van-it-nhat-1-tab-con-song-on.md) · [XW-145](https://xiangqi-web.atlassian.net/browse/XW-145) | Heartbeat + presence trong phòng/ván (ít nhất 1 tab còn sống = online, bền vững) | BE | 2 / 1,5 | TV1 | TV1 | TV7 | 08/10 | 08/10 |
| [TK10.2.3](task/TK10.2.3-khung-xu-ly-lenh-van-11-buoc-bien-lai-chong-gui-trung.md) · [XW-146](https://xiangqi-web.atlassian.net/browse/XW-146) | Khung xử lý lệnh ván 11 bước + biên lai chống gửi trùng | BE | 3,5 / 3 | TV4 | TV4 | TV7 | 08/10 | 08/10 |
| [TK08.2.3](task/TK08.2.3-giao-dien-sanh-hop-thoai-tao-phong-phong-cho-ready-doi-ben-r.md) · [XW-130](https://xiangqi-web.atlassian.net/browse/XW-130) | Giao diện sảnh, hộp thoại tạo phòng, phòng chờ (ready, đổi bên, realtime) | FE | 4 / 2,5 | TV3 | TV3 | TV5 | 09/10 | 12/10 |
| [TK08.3.2](task/TK08.3.2-doi-cai-dat-phong-primitive-thu-hoi-nguoi-xem.md) · [XW-132](https://xiangqi-web.atlassian.net/browse/XW-132) | Đổi cài đặt phòng + primitive thu hồi người xem | BE | 3 / 3 | TV2 | TV2 | TV6 | 09/10 | 12/10 |
| [TK10.3.1](task/TK10.3.1-lenh-di-nuoc-version-su-kien-cay-nuoc-di-va-nhanh-hieu-luc.md) · [XW-148](https://xiangqi-web.atlassian.net/browse/XW-148) | Lệnh đi nước + version + sự kiện; cây nước đi và nhánh hiệu lực | BE | 3,5 / 3 | TV4 | TV4 | TV7 | 09/10 | 09/10 |
| [TK10.3.2](task/TK10.3.2-ham-ket-thuc-van-duy-nhat-finalizematch-11-nguyen-nhan-1-lan.md) · [XW-149](https://xiangqi-web.atlassian.net/browse/XW-149) | Hàm kết thúc ván duy nhất finalizeMatch (11 nguyên nhân, 1 lần version++) | BE | 2 / 2 | TV1 | TV1 | TV7 | 09/10 | 12/10 |
| [TK14.2.1](task/TK14.2.1-chinh-sach-media-4-phong-truyen-cap-token-theo-quyen.md) · [XW-172](https://xiangqi-web.atlassian.net/browse/XW-172) | Chính sách media + 4 phòng truyền + cấp token theo quyền | BE | 4 / 3 | TV4 | TV4 | TV2 | 09/10 | 12/10 |
| [TK15.1.2](task/TK15.1.2-worker-thread-tim-kiem-toi-da-2-co-huy-sharedarraybuffer.md) · [XW-180](https://xiangqi-web.atlassian.net/browse/XW-180) | Worker thread tìm kiếm (tối đa 2) + cờ huỷ SharedArrayBuffer | AI | 2,5 / 0,5 | TV5 | TV5 | TV6 | 09/10 | 09/10 |
| [TK15.1.5](task/TK15.1.5-kiem-chung-tien-trinh-ai-rieng-va-worker-server-khong-nghen.md) · [XW-183](https://xiangqi-web.atlassian.net/browse/XW-183) | Kiểm chứng tiến trình AI riêng và worker: server không nghẽn, huỷ ≤ 100 ms | QA | 2 | TV7 | TV7 | — | 09/10 | 12/10 |
| [TK02.3.2](task/TK02.3.2-thiet-ke-khung-chat-2-kenh-va-khung-camera-mic.md) · [XW-87](https://xiangqi-web.atlassian.net/browse/XW-87) | Thiết kế khung chat 2 kênh và khung camera/mic | DS | 5,5 / 1 | TV6 | TV6 | TV5 | 12/10 | 13/10 |
| [TK06.1.3](task/TK06.1.3-man-dang-ky-man-nhac-xac-minh-trang-callback.md) · [XW-113](https://xiangqi-web.atlassian.net/browse/XW-113) | Màn đăng ký, màn nhắc xác minh, trang callback | FE | 3 / 2 | TV3 | TV3 | TV6 | 12/10 | 12/10 |
| [TK06.2.2](task/TK06.2.2-vong-doi-phien-endpoint-activity-dang-xuat-current-all.md) · [XW-115](https://xiangqi-web.atlassian.net/browse/XW-115) | Vòng đời phiên, endpoint activity, đăng xuất CURRENT/ALL | BE | 3 / 2,5 | TV5 | TV5 | TV4 | 12/10 | 13/10 |
| [TK07.2.2](task/TK07.2.2-trang-ban-be-friends-3-tab-tim-kiem-realtime-trang-thai-tron.md) · [XW-125](https://xiangqi-web.atlassian.net/browse/XW-125) | Trang bạn bè /friends: 3 tab, tìm kiếm, realtime, trạng thái trống | FE | 3 / 2 | TV3 | TV3 | TV7 | 12/10 | 13/10 |
| [TK08.3.1](task/TK08.3.1-roi-phong-theo-trang-thai-dong-phong-thu-hoi-dong-thoi.md) · [XW-131](https://xiangqi-web.atlassian.net/browse/XW-131) | Rời phòng theo trạng thái + đóng phòng thu hồi đồng thời | BE | 2 / 2 | TV2 | TV2 | TV6 | 12/10 | 12/10 |
| [TK08.3.3](task/TK08.3.3-hop-thoai-cai-dat-phong-xac-nhan-roi-phong-xu-ly-phong-bi-do.md) · [XW-133](https://xiangqi-web.atlassian.net/browse/XW-133) | Hộp thoại cài đặt phòng, xác nhận rời phòng, xử lý phòng bị đóng/bị đưa ra | FE | 2,5 / 2 | TV3 | TV3 | TV4 | 12/10 | 13/10 |
| [TK10.3.3](task/TK10.3.3-snapshot-van-loc-theo-vai-tro-lenh-dong-bo-lai.md) · [XW-150](https://xiangqi-web.atlassian.net/browse/XW-150) | Snapshot ván lọc theo vai trò + lệnh đồng bộ lại | BE | 2 / 1,5 | TV1 | TV1 | TV7 | 12/10 | 12/10 |
| [TK13.1.1](task/TK13.1.1-chat-service-gui-va-doc-lich-su-cho-kenh-players-va-room-pha.md) · [XW-166](https://xiangqi-web.atlassian.net/browse/XW-166) | Chat service: gửi và đọc lịch sử cho kênh PLAYERS và ROOM, phát theo quyền | BE | 4 / 4 | TV2 | TV2 | TV3 | 12/10 | 13/10 |
| [TK15.1.3](task/TK15.1.3-hang-doi-trong-supervisor-ai-2-chay-8-cho-ngan-sach-nuoc-du.md) · [XW-181](https://xiangqi-web.atlassian.net/browse/XW-181) | Hàng đợi trong supervisor AI (2 chạy/8 chờ), ngân sách, nước dự phòng | AI | 2 / 0,5 | TV5 | TV5 | TV7 | 12/10 | 12/10 |
| [TK04.3.2](task/TK04.3.2-corpus-chat-luong-20-the-voi-dap-an-va-lap-luan-viet-tay.md) · [XW-102](https://xiangqi-web.atlassian.net/browse/XW-102) | Corpus chất lượng 20 thế với đáp án và lập luận viết tay | AI | 3 / 3 | TV5 | TV5 | TV6 | 13/10 | 14/10 |
| [TK10.2.4](task/TK10.2.4-kiem-chung-gateway-xac-thuc-thu-hoi-giua-chung-origin-khong.md) · [XW-147](https://xiangqi-web.atlassian.net/browse/XW-147) | Kiểm chứng gateway: xác thực, thu hồi giữa chừng, origin, không tin tên phòng từ client | QA | 2 | TV7 | TV5 | — | 13/10 | 13/10 |
| [TK10.4.1](task/TK10.4.1-man-phong-choi-bo-cuc-trang-thai-van-zustand-dong-bo-realtim.md) · [XW-151](https://xiangqi-web.atlassian.net/browse/XW-151) | Màn phòng chơi: bố cục, trạng thái ván Zustand, đồng bộ realtime, hoàn lại khi bị từ chối | FE | 4 / 3 | TV3 | TV3 | TV4 | 13/10 | 14/10 |
| [TK11.1.1](task/TK11.1.1-tinh-dong-ho-tich-hop-duong-lenh-bo-dem-het-gio-chu-dong.md) · [XW-153](https://xiangqi-web.atlassian.net/browse/XW-153) | Tính đồng hồ + tích hợp đường lệnh + bộ đếm hết giờ chủ động | BE | 3,5 / 2 | TV1 | TV1 | TV7 | 13/10 | 13/10 |
| [TK12.2.1](task/TK12.2.1-api-lich-su-van-api-xem-lai-nhanh-hieu-luc.md) · [XW-162](https://xiangqi-web.atlassian.net/browse/XW-162) | API lịch sử ván + API xem lại nhánh hiệu lực | BE | 3 / 2 | TV1 | TV1 | TV7 | 13/10 | 14/10 |
| [TK06.2.3](task/TK06.2.3-man-dang-nhap-luu-phien-theo-che-do-lam-moi-token-het-phien.md) · [XW-116](https://xiangqi-web.atlassian.net/browse/XW-116) | Màn đăng nhập, lưu phiên theo chế độ, làm mới token, hết phiên, menu đăng xuất | FE | 3 / 2,5 | TV3 | TV3 | TV2 | 14/10 | 15/10 |
| [TK06.3.1](task/TK06.3.1-endpoint-dat-lai-mat-khau-recovery-fence-job-endpoint-hoan-t.md) · [XW-117](https://xiangqi-web.atlassian.net/browse/XW-117) | Endpoint đặt lại mật khẩu (recovery, fence, job) + endpoint hoàn tất hồ sơ | BE | 3 / 2 | TV2 | TV2 | TV3 | 14/10 | 14/10 |
| [TK09.2.1](task/TK09.2.1-duoi-nguoi-xem-danh-sach-chan-phong-noi-kiem-watch-epoch-vao.md) · [XW-139](https://xiangqi-web.atlassian.net/browse/XW-139) | Đuổi người xem + danh sách chặn phòng; nối kiểm watch\_epoch vào mọi đường đọc | BE | 3 / 3 | TV2 | TV2 | TV4 | 14/10 | 15/10 |
| [TK10.4.2](task/TK10.4.2-hien-thi-dong-ho-dong-ho-don-dieu-khong-tu-ket-thuc-van-canh.md) · [XW-152](https://xiangqi-web.atlassian.net/browse/XW-152) | Hiển thị đồng hồ (đồng hồ đơn điệu, không tự kết thúc ván, cảnh báo &lt; 1 phút) | FE | 1,5 / 1,5 | TV4 | TV4 | TV7 | 14/10 | 15/10 |
| [TK11.3.1](task/TK11.3.1-bo-dem-treo-van-3-phut-xac-nhan-toi-da-2-lan-dem-nguoc-30-gi.md) · [XW-156](https://xiangqi-web.atlassian.net/browse/XW-156) | Bộ đếm treo ván 3 phút, xác nhận (tối đa 2 lần), đếm ngược 30 giây → INACTIVITY | BE | 4 / 3 | TV5 | TV5 | TV7 | 14/10 | 15/10 |
| [TK12.2.2](task/TK12.2.2-trang-lich-su-history-va-trang-xem-lai.md) · [XW-163](https://xiangqi-web.atlassian.net/browse/XW-163) | Trang lịch sử /history và trang xem lại | FE | 2,5 / 2 | TV4 | TV4 | TV6 | 14/10 | 15/10 |
| [TK14.2.2](task/TK14.2.2-thu-hoi-5-buoc-xoay-the-he-phong-job-ben-vung.md) · [XW-173](https://xiangqi-web.atlassian.net/browse/XW-173) | Thu hồi 5 bước + xoay thế hệ phòng + job bền vững | BE | 3,5 / 3 | TV1 | TV1 | TV7 | 14/10 | 14/10 |
| [TK15.3.1](task/TK15.3.1-cong-cu-dau-60-van-so-sanh-thuat-toan-bao-cao-tai-lap-duoc.md) · [XW-187](https://xiangqi-web.atlassian.net/browse/XW-187) | Công cụ đấu 60 ván + so sánh thuật toán + báo cáo tái lập được | AI | 3 / 3 | TV5 | TV5 | TV2 | 14/10 | 16/10 |
| [TK06.3.2](task/TK06.3.2-man-quen-mat-khau-dat-mat-khau-moi-chon-username-lan-dau.md) · [XW-118](https://xiangqi-web.atlassian.net/browse/XW-118) | Màn quên mật khẩu, đặt mật khẩu mới, chọn username lần đầu | FE | 3 / 2 | TV3 | TV3 | TV2 | 15/10 | 16/10 |
| [TK06.4.1](task/TK06.4.1-tao-oauth-client-google-va-cau-hinh-provider-google-trong-su.md) · [XW-119](https://xiangqi-web.atlassian.net/browse/XW-119) | Tạo OAuth client Google và cấu hình provider Google trong Supabase | OPS | 2,5 / 0,5 | TV7 | TV7 | TV6 | 15/10 | 16/10 |
| [TK09.2.2](task/TK09.2.2-danh-sach-nguoi-xem-xac-nhan-duoi-man-khong-vao-duoc.md) · [XW-140](https://xiangqi-web.atlassian.net/browse/XW-140) | Danh sách người xem, xác nhận đuổi, màn "Không vào được" | FE | 2 / 1,5 | TV3 | TV3 | TV6 | 15/10 | 16/10 |
| [TK13.2.1](task/TK13.2.1-phan-trang-lich-su-con-tro-don-tin-30-ngay-kiem-lai-quyen-o.md) · [XW-167](https://xiangqi-web.atlassian.net/browse/XW-167) | Phân trang lịch sử con trỏ, dọn tin 30 ngày, kiểm lại quyền ở resync/đuổi/thu hồi | BE | 2 / 3 | TV2 | TV2 | TV5 | 15/10 | 16/10 |
| [TK13.2.2](task/TK13.2.2-khung-chat-2-khung-nguoi-choi-1-khung-nguoi-xem-cong-tac-an.md) · [XW-168](https://xiangqi-web.atlassian.net/browse/XW-168) | Khung chat: 2 khung người chơi, 1 khung người xem, công tắc ẩn/hiện theo tab | FE | 3,5 / 2 | TV3 | TV3 | TV5 | 15/10 | 15/10 |
| [TK15.1.4](task/TK15.1.4-admission-10-reservation-trang-thai-ai-jobs-cat-ngan-sach-th.md) · [XW-182](https://xiangqi-web.atlassian.net/browse/XW-182) | Admission 10 reservation, trạng thái ai\_jobs, cắt ngân sách theo đồng hồ, thử lại 1 lần | BE | 2,5 / 1 | TV1 | TV1 | TV6 | 15/10 | 15/10 |
| [TK15.1.6](task/TK15.1.6-kiem-chung-hang-doi-2-8-admission-ai-busy-thu-lai-ngan-sach.md) · [XW-184](https://xiangqi-web.atlassian.net/browse/XW-184) | Kiểm chứng hàng đợi 2/8, admission AI\_BUSY, thử lại, ngân sách theo đồng hồ | QA | 2 | TV7 | TV6 | — | 15/10 | 15/10 |
| [TK06.4.2](task/TK06.4.2-nut-dang-nhap-bang-google-xu-ly-callback-hien-thi-tai-khoan.md) · [XW-120](https://xiangqi-web.atlassian.net/browse/XW-120) | Nút "Đăng nhập bằng Google", xử lý callback, hiển thị tài khoản chỉ-Google | FE | 1,5 / 0,5 | TV3 | TV3 | TV5 | 16/10 | 16/10 |
| [TK06.4.3](task/TK06.4.3-kiem-thu-thu-cong-google-oauth-that-va-lien-ket-cung-tai-kho.md) · [XW-121](https://xiangqi-web.atlassian.net/browse/XW-121) | Kiểm thử thủ công Google OAuth thật và liên kết cùng tài khoản | QA | 2,5 | TV7 | TV7 | — | 16/10 | 16/10 |
| [TK11.3.2](task/TK11.3.2-giao-dien-treo-van-canh-bao-cho-ben-den-luot-trang-thai-cho.md) · [XW-157](https://xiangqi-web.atlassian.net/browse/XW-157) | Giao diện treo ván: cảnh báo cho bên đến lượt, trạng thái cho đối thủ và người xem | FE | 2,5 / 2 | TV4 | TV4 | TV5 | 16/10 | 16/10 |

### Sprint 4 — 40 Task

| Mã · Key | Việc | Vai trò | Giờ | Gợi ý | **Người làm** | **Người kiểm** | Bắt đầu | Done |
|---|---|---|---|---|---|---|---|---|
| [TK16.8.4](task/TK16.8.4-chuan-bi-moi-truong-thu-tai-may-chay-seed-du-lieu-thu-so-do.md) · [XW-206](https://xiangqi-web.atlassian.net/browse/XW-206) | Chuẩn bị môi trường thử tải: máy chạy, seed dữ liệu, thu số đo tài nguyên | OPS | 2,5 / 0,5 | TV7 | TV7 | TV3 | 30/09 | 30/09 |
| [TK07.1.1](task/TK07.1.1-api-ho-so-me-tim-nguoi-dung-5-endpoint-ket-ban.md) · [XW-122](https://xiangqi-web.atlassian.net/browse/XW-122) | API hồ sơ (/me), tìm người dùng, 5 endpoint kết bạn | BE | 3,5 / 2,5 | TV4 | TV4 | TV1 | 06/10 | 07/10 |
| [TK16.8.1](task/TK16.8.1-endpoint-healthz-va-readiness-bao-trang-thai-db-tien-trinh-a.md) · [XW-203](https://xiangqi-web.atlassian.net/browse/XW-203) | Endpoint /healthz và readiness báo trạng thái DB + tiến trình AI | BE | 1 / 0,5 | TV2 | TV2 | TV3 | 08/10 | 08/10 |
| [TK12.1.1](task/TK12.1.1-lenh-dau-hang-co-che-de-nghi-hoa-di-lai-tao-tra-loi-rut-het.md) · [XW-158](https://xiangqi-web.atlassian.net/browse/XW-158) | Lệnh đầu hàng + cơ chế đề nghị hoà/đi lại (tạo, trả lời, rút, hết hạn) | BE | 3,5 / 2 | TV1 | TV1 | TV7 | 12/10 | 13/10 |
| [TK08.4.1](task/TK08.4.1-ma-phong-8-ky-tu-hmac-link-moi-token-fragment-doi-ma-xem.md) · [XW-134](https://xiangqi-web.atlassian.net/browse/XW-134) | Mã phòng 8 ký tự (HMAC) + link mời token fragment + đổi mã xem | BE | 3 / 2,5 | TV2 | TV2 | TV4 | 13/10 | 13/10 |
| [TK09.1.1](task/TK09.1.1-luong-vao-xem-kiem-quyen-theo-che-do-snapshot-khi-vao-giu-gh.md) · [XW-137](https://xiangqi-web.atlassian.net/browse/XW-137) | Luồng vào xem: kiểm quyền theo chế độ, snapshot khi vào, giữ ghế 15 giây, nối lại kiểm lại quyền | BE | 3 / 1 | TV2 | TV2 | TV7 | 13/10 | 14/10 |
| [TK11.2.1](task/TK11.2.1-an-han-60-giay-va-cham-thoi-han-ca-hai-offline-khoi-dong-lai.md) · [XW-154](https://xiangqi-web.atlassian.net/browse/XW-154) | Ân hạn 60 giây, va chạm thời hạn, cả hai offline, khởi động lại máy chủ | BE | 4 / 3 | TV5 | TV5 | TV6 | 13/10 | 14/10 |
| [TK12.1.2](task/TK12.1.2-di-lai-lui-1-2-nua-nuoc-doi-head-dung-lai-the-co-va-dem-lap.md) · [XW-159](https://xiangqi-web.atlassian.net/browse/XW-159) | Đi lại: lùi 1/2 nửa nước, dời head, dựng lại thế cờ và đếm lặp, không hoàn thời gian | BE | 2,5 / 2 | TV1 | TV1 | TV6 | 14/10 | 15/10 |
| [TK12.1.4](task/TK12.1.4-kiem-chung-dau-hang-va-de-nghi-actor-tranh-chap-het-han-chu.md) · [XW-161](https://xiangqi-web.atlassian.net/browse/XW-161) | Kiểm chứng đầu hàng và đề nghị: quyền qua 2 cổng, tranh chấp, hết hạn chủ động | QA | 2,5 | TV7 | TV6 | — | 14/10 | 14/10 |
| [TK14.3.2](task/TK14.3.2-dich-vu-chu-so-huu-nguon-chuyen-nguon-co-xac-nhan-sfu.md) · [XW-175](https://xiangqi-web.atlassian.net/browse/XW-175) | Dịch vụ chủ sở hữu nguồn + chuyển nguồn có xác nhận SFU | BE | 2 / 1 | TV1 | TV1 | TV7 | 14/10 | 15/10 |
| [TK14.3.1](task/TK14.3.1-khung-media-2-o-chon-doc-lap-canh-bao-micro-nguoi-xem-chi-nh.md) · [XW-174](https://xiangqi-web.atlassian.net/browse/XW-174) | Khung media: 2 ô chọn độc lập, cảnh báo micro, người xem chỉ nhận, trạng thái áp dụng | FE | 4 / 2 | TV4 | TV4 | TV6 | 15/10 | 16/10 |
| [TK15.2.1](task/TK15.2.1-tao-van-voi-may-kich-hoat-luot-may-ap-nuoc-may-qua-duong-len.md) · [XW-185](https://xiangqi-web.atlassian.net/browse/XW-185) | Tạo ván với máy, kích hoạt lượt máy, áp nước máy qua đường lệnh, đi lại với máy | BE | 4 / 3 | TV1 | TV1 | TV7 | 15/10 | 16/10 |
| [TK08.4.2](task/TK08.4.2-moi-truc-tiep-ban-be-10-phut-hop-thu-loi-moi-su-kien-rieng-n.md) · [XW-135](https://xiangqi-web.atlassian.net/browse/XW-135) | Mời trực tiếp bạn bè (10 phút) + hộp thư lời mời + sự kiện riêng người nhận | BE | 2,5 / 2 | TV2 | TV2 | TV3 | 16/10 | 16/10 |
| [TK08.4.3](task/TK08.4.3-hop-thoai-moi-3-tab-nhap-ma-trang-join-hop-thu-loi-moi-chi-b.md) · [XW-136](https://xiangqi-web.atlassian.net/browse/XW-136) | Hộp thoại mời 3 tab, nhập mã, trang /join, hộp thư lời mời, chỉ báo | FE | 4 / 2,5 | TV3 | TV3 | TV2 | 16/10 | 19/10 |
| [TK12.3.1](task/TK12.3.1-tai-dau-phieu-doi-ben-van-moi-chat-moi-bo-dem-dong-phong-10.md) · [XW-164](https://xiangqi-web.atlassian.net/browse/XW-164) | Tái đấu (phiếu, đổi bên, ván mới, chat mới) + bộ đếm đóng phòng 10 phút | BE | 3,5 / 3 | TV1 | TV1 | TV6 | 16/10 | 16/10 |
| [TK14.3.3](task/TK14.3.3-dang-bat-o-tab-khac-nut-chuyen-sang-tab-nay-luong-chuyen.md) · [XW-176](https://xiangqi-web.atlassian.net/browse/XW-176) | "Đang bật ở tab khác" + nút "Chuyển sang tab này" + luồng chuyển | FE | 1,5 / 0,5 | TV4 | TV4 | TV5 | 16/10 | 19/10 |
| [TK15.2.2](task/TK15.2.2-man-chon-cap-do-ai-new-va-man-choi-voi-may-ai-id.md) · [XW-186](https://xiangqi-web.atlassian.net/browse/XW-186) | Màn chọn cấp độ /ai/new và màn chơi với máy /ai/:id | FE | 3 / 2 | TV4 | TV4 | TV7 | 16/10 | 19/10 |
| [TK16.6.3](task/TK16.6.3-ghi-chu-bao-ve-do-an-phan-ai-va-thuat-toan-defense-notes-md.md) · [XW-200](https://xiangqi-web.atlassian.net/browse/XW-200) | Ghi chú bảo vệ đồ án phần AI và thuật toán (defense-notes.md) | AI | 1,5 / 0,5 | TV5 | TV5 | TV1 | 16/10 | 19/10 |
| [TK07.1.2](task/TK07.1.2-man-cai-dat-ho-so-settings.md) · [XW-123](https://xiangqi-web.atlassian.net/browse/XW-123) | Màn cài đặt hồ sơ /settings | FE | 1,5 / 1 | TV3 | TV3 | TV2 | 19/10 | 19/10 |
| [TK11.2.2](task/TK11.2.2-hien-thi-mat-ket-noi-dem-nguoc-cho-doi-thu-nguoi-xem-han-may.md) · [XW-155](https://xiangqi-web.atlassian.net/browse/XW-155) | Hiển thị mất kết nối: đếm ngược cho đối thủ/người xem, hạn máy chủ trên lớp phủ | FE | 1 / 1 | TV4 | TV4 | TV2 | 19/10 | 20/10 |
| [TK12.1.3](task/TK12.1.3-thanh-thao-tac-xac-nhan-dau-hang-khung-de-nghi-co-dem-nguoc.md) · [XW-160](https://xiangqi-web.atlassian.net/browse/XW-160) | Thanh thao tác, xác nhận đầu hàng, khung đề nghị có đếm ngược | FE | 3 / 2 | TV4 | TV4 | TV1 | 19/10 | 20/10 |
| [TK12.3.2](task/TK12.3.2-man-ket-qua-van-4-ket-cuc-nguyen-nhan-bang-chu-dem-nguoc-tai.md) · [XW-165](https://xiangqi-web.atlassian.net/browse/XW-165) | Màn kết quả ván: 4 kết cục, nguyên nhân bằng chữ, đếm ngược, Tái đấu | FE | 2 / 2 | TV4 | TV4 | TV1 | 19/10 | 19/10 |
| [TK14.3.4](task/TK14.3.4-kiem-chung-mot-tab-mot-nguon-khong-tu-cuop-dung-truoc-phat-s.md) · [XW-177](https://xiangqi-web.atlassian.net/browse/XW-177) | Kiểm chứng một tab một nguồn: không tự cướp, dừng trước phát sau, 2 tab cùng chuyển | QA | 2,5 | TV7 | TV7 | — | 19/10 | 19/10 |
| [TK14.4.1](task/TK14.4.1-bo-test-ts-med-01-15-do-byte-rtp-khung-hinh-that-co-doi-chun.md) · [XW-178](https://xiangqi-web.atlassian.net/browse/XW-178) | Bộ test TS-MED-01..15 đo byte RTP/khung hình thật, có đối chứng dương, 7 người | QA | 7 | TV6 | TV5 | — | 19/10 | 20/10 |
| [TK16.1.1](task/TK16.1.1-ma-tran-nhieu-tab-moi-loai-lenh-gui-dong-thoi-tu-2-tab.md) · [XW-188](https://xiangqi-web.atlassian.net/browse/XW-188) | Ma trận nhiều tab: mọi loại lệnh gửi đồng thời từ 2 tab | QA | 2,5 | TV7 | TV6 | — | 19/10 | 19/10 |
| [TK16.2.1](task/TK16.2.1-ra-va-sua-responsive-toan-bo-man-hinh-o-4-kich-thuoc.md) · [XW-189](https://xiangqi-web.atlassian.net/browse/XW-189) | Rà và sửa responsive toàn bộ màn hình ở 4 kích thước | FE | 3 / 2 | TV3 | TV3 | TV6 | 19/10 | 20/10 |
| [TK16.4.1](task/TK16.4.1-kich-ban-tai-10-phong-70-socket-dong-thoi-2-van-ai-do-p50-p9.md) · [XW-195](https://xiangqi-web.atlassian.net/browse/XW-195) | Kịch bản tải 10 phòng/70 socket đồng thời + 2 ván AI + đo p50/p95/p99 | QA | 5,5 | TV6 | TV6 | — | 19/10 | 20/10 |
| [TK16.8.2](task/TK16.8.2-trien-khai-vercel-render-supabase-cloud-livekit-cloud-runboo.md) · [XW-204](https://xiangqi-web.atlassian.net/browse/XW-204) | Triển khai Vercel + Render + Supabase Cloud + LiveKit Cloud, runbook | OPS | 6,5 / 1 | TV7 | TV7 | TV6 | 19/10 | 20/10 |
| [TK09.1.2](task/TK09.1.2-kiem-chung-vao-xem-ma-tran-bang-chung-4-duong-vao-tran-5-don.md) · [XW-138](https://xiangqi-web.atlassian.net/browse/XW-138) | Kiểm chứng vào xem: ma trận bằng chứng × 4 đường vào, trần 5 đồng thời, giữ ghế 15 giây | QA | 3,5 | TV7 | TV6 | — | 20/10 | 21/10 |
| [TK16.2.2](task/TK16.2.2-tro-nang-wcag-aa-tren-toan-bo-ung-dung.md) · [XW-190](https://xiangqi-web.atlassian.net/browse/XW-190) | Trợ năng WCAG AA trên toàn bộ ứng dụng | FE | 2 / 1 | TV4 | TV4 | TV1 | 20/10 | 20/10 |
| [TK16.2.3](task/TK16.2.3-bo-sung-du-5-trang-thai-quy-tac-cua-so-va-6-xac-nhan-cho-36.md) · [XW-191](https://xiangqi-web.atlassian.net/browse/XW-191) | Bổ sung đủ 5 trạng thái, quy tắc cửa sổ và 6 xác nhận cho 36 màn hình/cửa sổ | FE | 2 / 1 | TV3 | TV3 | TV7 | 20/10 | 20/10 |
| [TK16.2.4](task/TK16.2.4-ra-khop-thiet-ke-tren-san-pham-that-do-tuong-phan-tren-ui-ch.md) · [XW-192](https://xiangqi-web.atlassian.net/browse/XW-192) | Rà khớp thiết kế trên sản phẩm thật + đo tương phản trên UI chạy thật | DS | 2,5 / 0,5 | TV6 | TV6 | TV7 | 20/10 | 20/10 |
| [TK16.3.1](task/TK16.3.1-bo-test-ma-tran-quyen-bang-du-lieu-gia-mao-ts-auth-01-17-10.md) · [XW-194](https://xiangqi-web.atlassian.net/browse/XW-194) | Bộ test ma trận quyền bằng dữ liệu giả mạo (TS-AUTH-01..17, 10 điều cấm) | QA | 7 | TV6 | TV5 | — | 20/10 | 21/10 |
| [TK16.6.2](task/TK16.6.2-ho-so-ban-giao-readme-goc-handover-md-known-limitations-md.md) · [XW-199](https://xiangqi-web.atlassian.net/browse/XW-199) | Hồ sơ bàn giao: README gốc, handover.md, known-limitations.md | OPS | 3 / 0,5 | TV7 | TV7 | TV6 | 20/10 | 21/10 |
| [TK16.2.5](task/TK16.2.5-kiem-thu-tro-nang-va-5-trang-thai-36-man.md) · [XW-193](https://xiangqi-web.atlassian.net/browse/XW-193) | Kiểm thử trợ năng và 5 trạng thái 36 màn | QA | 2,5 | TV7 | TV6 | — | 21/10 | 21/10 |
| [TK16.5.1](task/TK16.5.1-kich-ban-xuong-song-8-phien-e2e-toan-luong.md) · [XW-196](https://xiangqi-web.atlassian.net/browse/XW-196) | Kịch bản xương sống × 8 phiên (e2e toàn luồng) | QA | 4,5 | TV7 | TV7 | — | 21/10 | 21/10 |
| [TK16.5.2](task/TK16.5.2-doi-chieu-r01r19-6-kich-ban-hoi-quy-chay-toan-bo-lane-bao-ca.md) · [XW-197](https://xiangqi-web.atlassian.net/browse/XW-197) | Đối chiếu R01–R19, 6 kịch bản hồi quy, chạy toàn bộ lane, báo cáo nghiệm thu | QA | 3,5 | TV7 | TV5 | — | 21/10 | 21/10 |
| [TK16.6.1](task/TK16.6.1-kiem-tren-moi-truong-internet-that-11-ca-ts-man-01-03.md) · [XW-198](https://xiangqi-web.atlassian.net/browse/XW-198) | Kiểm trên môi trường Internet thật (12 ca, gồm TS-MAN-01..03) | QA | 3,5 | TV7 | TV5 | — | 21/10 | 21/10 |
| [TK16.6.4](task/TK16.6.4-nguoi-la-chay-theo-readme-15-phut-ra-ho-so-ban-giao-4-cong-l.md) · [XW-201](https://xiangqi-web.atlassian.net/browse/XW-201) | Người lạ chạy theo README &lt; 15 phút + rà hồ sơ bàn giao + 4 cổng lần cuối | QA | 2 | TV7 | TV6 | — | 21/10 | 21/10 |
| [TK16.8.3](task/TK16.8.3-kiem-nhanh-ban-trien-khai-dau-tien-healthz-tai-web-ket-noi-r.md) · [XW-205](https://xiangqi-web.atlassian.net/browse/XW-205) | Kiểm nhanh bản triển khai đầu tiên: /healthz, tải web, kết nối realtime, không rò khoá | QA | 1,5 | TV7 | TV7 | — | 21/10 | 22/10 |

---

## 5. QUY TẮC KHI PHÂN CÔNG

1. **Người kiểm ≠ người làm** — Tester (hoặc người hỗ trợ kiểm) không kiểm Task chính mình làm.
2. Giữ **cùng một người** cho chuỗi Task nối nhau của một mảng (ví dụ TK10.2.3 → TK10.3.1 → TK10.3.2) để không mất thời gian bàn giao.
3. Task trên **đường găng** (xem [kế hoạch §6](01-KE-HOACH-4-TUAN.md)) giao cho người chắc tay nhất và không để chờ.
4. Mỗi người không quá **37,5 giờ (làm + kiểm) / tuần**; phần dư chuyển sang người cùng vai trò hoặc người nhận thêm ở bảng 2.
5. Đổi phân công sau khi đã tạo issue ⇒ sửa Assignee trên Jira **và** cập nhật file này.

