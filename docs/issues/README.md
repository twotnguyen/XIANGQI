# Mục lục 32 issue triển khai

Đọc [START-HERE](../handoff/START-HERE.md). Trạng thái dự án: **PROJECT_COMPLETE** — Toàn bộ 32/32 issue đã hoàn thành (**DONE**) và được kiểm chứng đầy đủ. Các số dependency dưới đây là bắt buộc, và PR dependency đã merge vào main. Mốc online/final đáp ứng tất cả gate bắt buộc. Mỗi issue có đường dẫn file/module, hợp đồng, bước làm, test cụ thể và evidence report tương ứng.

## Thứ tự đề xuất

- Nền tảng: 001 → 002 → 006; sau đó chạy spike media024 sớm.
- Luật và board: 003 → 004 → 005. Có thể làm độc lập auth sau002/006.
- Tài khoản/phòng/online: 007 → 008/009 → 010 → 011 → 012 → 013 → 014 → 015 → 016 → 017.
- AI: 018 → 019 → 020, rồi021 khi013 xong; 022 khi015 xong; 023 thí nghiệm.
- Media:024 → 025 khi008/016 xong → 026 khi015/017 xong.
- Hoàn thiện:027 → 028/029 → 030 → 031 → 032.

Với một model thực thi, đi theo số tăng dần cũng hợp lệ. Dependency quyết định khả năng bắt đầu, không phải group ở trên. Phần review một issue có thể từ chối độc lập mà không cần làm xong cả nhóm.

## Danh sách

| Issue | Mục tiêu | Phụ thuộc | Yêu cầu |
|---|---|---|---|
| [ISSUE-001](ISSUE-001-foundation.md) | Workspace, toolchain và ứng dụng khởi động được | — | R16 |
| [ISSUE-002](ISSUE-002-contracts-position.md) | Contracts, tọa độ và vị trí khởi đầu | 001 | R05, R06 |
| [ISSUE-003](ISSUE-003-legal-moves.md) | Luật di chuyển và an toàn tướng | 002 | R05 |
| [ISSUE-004](ISSUE-004-terminal-repetition.md) | Kết thúc ván và luật lặp ba lần | 003 | R07 |
| [ISSUE-005](ISSUE-005-board-ui.md) | Bàn gỗ và quân Hán thao tác được | 003 | R05, R15 |
| [ISSUE-006](ISSUE-006-database-test-harness.md) | Supabase migrations và test integration thật | 002 | R01, R03, R06, R16 |
| [ISSUE-007](ISSUE-007-password-auth.md) | Username/password, xác minh và khôi phục email | 006 | R01 |
| [ISSUE-008](ISSUE-008-google-profile.md) | Google PKCE và onboarding username | 007 | R01, R02 |
| [ISSUE-009](ISSUE-009-friends-presence.md) | Bạn bè và trạng thái online | 007 | R02 |
| [ISSUE-010](ISSUE-010-rooms-lobby.md) | Phòng chờ, ghế và sẵn sàng | 006, 007, 009 | R03, R04, R08 |
| [ISSUE-011](ISSUE-011-invitations.md) | Mời trong game, link và mã theo vai trò | 010 | R02, R03, R04 |
| [ISSUE-012](ISSUE-012-authoritative-match.md) | Ván online, transaction nước đi và resync | 004, 010, 011 | R06, R07 |
| [ISSUE-013](ISSUE-013-clocks-reconnect.md) | Đồng hồ, mất mạng và restart | 012 | R08, R09 |
| [ISSUE-014](ISSUE-014-draw-undo-resign.md) | Đầu hàng, xin hòa và đi lại online | 013 | R13 |
| [ISSUE-015](ISSUE-015-online-ui.md) | Màn chơi online và trạng thái kết nối | 005, 014 | R05, R06, R08, R09, R13, R15 |
| [ISSUE-016](ISSUE-016-spectators.md) | Năm người xem, mã phòng và thu hồi quyền | 011, 012, 015 | R04, R15 |
| [ISSUE-017](ISSUE-017-private-chat.md) | Hai kênh chat và lịch sử có phân quyền | 016 | R10 |
| [ISSUE-018](ISSUE-018-ai-evaluation.md) | AI: hàm đánh giá và thứ tự nước | 004 | R12 |
| [ISSUE-019](ISSUE-019-ai-minimax.md) | AI: minimax baseline đúng luật và lặp | 018 | R12, R07 |
| [ISSUE-020](ISSUE-020-ai-alpha-beta.md) | AI: alpha-beta, iterative deepening và cấp độ | 019 | R12 |
| [ISSUE-021](ISSUE-021-ai-worker-server.md) | AI worker và ván người–máy authoritative | 013, 014, 020 | R12, R08, R09, R13 |
| [ISSUE-022](ISSUE-022-ai-ui.md) | Màn chọn cấp độ và chơi với AI | 015, 021 | R12, R13, R15 |
| [ISSUE-023](ISSUE-023-ai-experiments.md) | Thí nghiệm AI và số liệu bảo vệ | 020, 021, 022 | R12, R16 |
| [ISSUE-024](ISSUE-024-media-spike.md) | LiveKit local: kiểm chứng quyền và room generations | 001, 006 | R11, R16 |
| [ISSUE-025](ISSUE-025-media-authority.md) | Backend media policy, token và thu hồi | 008, 016, 024 | R11, R04, R09 |
| [ISSUE-026](ISSUE-026-media-ui.md) | Camera/mic trực tiếp và xem media được cho phép | 015, 017, 025 | R11, R15 |
| [ISSUE-027](ISSUE-027-history-rematch.md) | Lịch sử, replay và tái đấu đổi bên | 014, 017, 021, 022, 026 | R14, R13 |
| [ISSUE-028](ISSUE-028-responsive-polish.md) | Hoàn thiện giao diện truyền thống trên hai thiết bị | 008, 009, 015, 017, 022, 026, 027 | R15, R05 |
| [ISSUE-029](ISSUE-029-security-hardening.md) | Kiểm thử phân quyền và bảo mật trước bàn giao | 008, 016, 017, 025, 027 | R01, R04, R06, R10, R11, R16 |
| [ISSUE-030](ISSUE-030-acceptance-load.md) | Nghiệm thu xuyên suốt, lỗi mạng và thử tải | 023, 028, 029 | R01, R02, R03, R04, R05, R06, R07, R08, R09, R10, R11, R12, R13, R14, R15, R16 |
| [ISSUE-031](ISSUE-031-deploy-runbook.md) | Triển khai Vercel/Render/Supabase và media online | 030 | R16 |
| [ISSUE-032](ISSUE-032-final-handoff.md) | Báo cáo đồ án, demo và bàn giao hoàn chỉnh | 030, 031 | R16, R12 |
