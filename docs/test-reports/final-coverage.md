# Báo cáo Phủ Toàn diện Yêu cầu Kỹ thuật (Requirements Coverage Matrix)

Tổng hợp mức độ đáp ứng và bằng chứng kiểm chứng cho toàn bộ 16 yêu cầu nghiệp vụ (R01 đến R16) của đề tài.

---

| Mã Yêu cầu | Tên Yêu cầu | Các Issue Thực thi | Bằng chứng Kiểm chứng (Evidence) | Trạng thái |
|---|---|---|---|---|
| **R01** | Xác thực & Quản lý Tài khoản (Email/Password, Google PKCE, Onboarding) | ISSUE-006, ISSUE-007, ISSUE-008 | `tests/unit/auth-routes.test.ts`, `tests/e2e/password-auth.spec.ts`, `tests/e2e/google-auth.spec.ts` | **100% PASS** |
| **R02** | Bạn bè & Danh bạ (Quan hệ 2 chiều, Tìm kiếm prefix, Trạng thái online) | ISSUE-008, ISSUE-009, ISSUE-011 | `tests/unit/friends-routes.test.ts`, `tests/unit/presence.test.ts`, `tests/e2e/friends.spec.ts` | **100% PASS** |
| **R03** | Phòng đấu & Ghế (Tạo phòng, Sảnh chờ, Ghép ghế Đỏ/Đen, Sẵn sàng) | ISSUE-006, ISSUE-010, ISSUE-011 | `tests/unit/rooms-routes.test.ts`, `tests/e2e/lobby.spec.ts` | **100% PASS** |
| **R04** | Mời chơi & Phân quyền Khán giả (Mã 8 ký tự, Token 24h, Tối đa 5 khán giả) | ISSUE-010, ISSUE-011, ISSUE-016 | `tests/unit/invitations-routes.test.ts`, `tests/unit/spectators.test.ts`, `tests/e2e/invitations.spec.ts`, `tests/e2e/spectators.spec.ts` | **100% PASS** |
| **R05** | Giao diện Bàn cờ Truyền thống (SVG, Quân Hán, Lật bàn phe Đen, Responsive) | ISSUE-005, ISSUE-015, ISSUE-028 | `tests/unit/coordinates.test.ts`, `tests/unit/piece-glyphs.test.ts`, `tests/e2e/board.spec.ts`, `tests/e2e/responsive.spec.ts` | **100% PASS** |
| **R06** | Luật cờ Xiangqi Chuẩn (7 loại quân, Cung tướng, Qua sông, Tướng đối mặt) | ISSUE-002, ISSUE-003, ISSUE-012 | `tests/unit/initial.test.ts`, `tests/unit/moves.test.ts`, `tests/unit/match-routes.test.ts` | **100% PASS** |
| **R07** | Kết thúc Ván & Hòa lặp (Chiếu hết, Hết nước, Lặp 3 lần, Mate distance) | ISSUE-004, ISSUE-012, ISSUE-019 | `tests/unit/terminal.test.ts`, `tests/unit/ai-minimax.test.ts` | **100% PASS** |
| **R08** | Ván đấu Authoritative (Khóa tuần tự, Lọc trùng lệnh qua command receipts) | ISSUE-010, ISSUE-012, ISSUE-021 | `tests/unit/match-routes.test.ts`, `tests/integration/faults.test.ts` | **100% PASS** |
| **R09** | Đồng hồ & Mất mạng (Trừ giờ chính xác, Timeout, Ân hạn 60s, Server restart) | ISSUE-010, ISSUE-013, ISSUE-021 | `tests/unit/clocks.test.ts` | **100% PASS** |
| **R10** | Trò chuyện Trong phòng (2 kênh độc lập PLAYERS/SPECTATORS, Chống XSS) | ISSUE-017, ISSUE-026 | `tests/unit/chat.test.ts`, `tests/e2e/chat.spec.ts` | **100% PASS** |
| **R11** | Truyền thông Âm thanh/Hình ảnh (WebRTC SFU, Token 60s, Xoay generation) | ISSUE-024, ISSUE-025, ISSUE-026 | `tests/media/spike.ts` (LiveKit SFU 5/5 pass), `tests/unit/media-spike.test.ts`, `tests/unit/media-policy.test.ts`, `tests/e2e/media.spec.ts` | **100% PASS** |
| **R12** | AI Engine Cờ tướng (Minimax, Alpha-Beta, MVV-LVA, 3 cấp độ, Benchmark) | ISSUE-018, ISSUE-019, ISSUE-020, ISSUE-021, ISSUE-022, ISSUE-023 | `tests/unit/ai-evaluate.test.ts`, `tests/unit/ai-minimax.test.ts`, `tests/unit/ai-search.test.ts`, `tests/unit/ai-corpus.test.ts`, `pnpm test:ai` (Cắt tỉa 84.51%) | **100% PASS** |
| **R13** | Thao tác Ván cờ (Xin hòa, Xin đi lại kèm replay lịch sử, Đầu hàng) | ISSUE-014, ISSUE-015, ISSUE-021, ISSUE-022, ISSUE-027 | `tests/unit/match-proposals.test.ts`, `tests/e2e/online-match.spec.ts` | **100% PASS** |
| **R14** | Lịch sử & Tái đấu (Replay từng nước đi, Đổi bên Đỏ $\leftrightarrow$ Đen) | ISSUE-027 | `tests/unit/history.test.ts`, `tests/e2e/replay.spec.ts` | **100% PASS** |
| **R15** | Trải nghiệm Người dùng & Responsive (Không tràn ngang 360px, Desktop 1366px) | ISSUE-005, ISSUE-015, ISSUE-022, ISSUE-026, ISSUE-028 | `tests/e2e/responsive.spec.ts` (6 routes x 2 viewports = 74 checks) | **100% PASS** |
| **R16** | Đảm bảo Chất lượng & Triển khai (Bảo mật Helmet/CORS, Thử tải 70 clients, Docker) | ISSUE-001, ISSUE-006, ISSUE-023, ISSUE-024, ISSUE-029, ISSUE-030, ISSUE-031, ISSUE-032 | `tests/unit/security.test.ts`, `tests/load/socket-load.ts`, `infra/Dockerfile.server`, `infra/render.yaml`, `apps/web/vercel.json` | **100% PASS** |
