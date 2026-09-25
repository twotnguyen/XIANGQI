# TRUY VẾT YÊU CẦU HIỆN HÀNH — R01–R19

**Cập nhật:** 2026-09-22. Thay vai trò tra cứu của matrix lịch sử ở08. Bảng nối nguồn đặc tả, không khẳng định mọi test đã được viết/chạy. Mọi issue hiện TODO.

| ID | Hành vi và nguồn chuẩn | Flow | Màn hình | Luật / AC | Bằng chứng phải có ở issue |
|---|---|---|---|---|---|
| R01 | Tài khoản: [REQ-AUTH](../01-requirements/REQ-AUTH.md) | [FLOW-AUTH](../02-flows/FLOW-AUTH.md) | LOGIN, REGISTER, FORGOT-PASSWORD, RESET-PASSWORD, VERIFY-NOTICE, ONBOARDING, PROFILE-SETTINGS | BR-AUTH-* / AC-AUTH-* | 046–055; 084; 117; 137 |
| R02 | Hồ sơ, bạn bè: [REQ-PROFILE-FRIENDS](../01-requirements/REQ-PROFILE-FRIENDS.md) | [FLOW-FRIENDS](../02-flows/FLOW-FRIENDS.md) | FRIENDS, USER-SEARCH, PROFILE-SETTINGS, NAVBAR | BR-FRD-* / AC-FRD-* | 056–060 |
| R03 | Sảnh, phòng, mời: [REQ-LOBBY](../01-requirements/REQ-LOBBY.md), [REQ-ROOM](../01-requirements/REQ-ROOM.md), [REQ-INVITE](../01-requirements/REQ-INVITE.md) | [FLOW-CREATE-ROOM](../02-flows/FLOW-CREATE-ROOM.md), [FLOW-JOIN-ROOM](../02-flows/FLOW-JOIN-ROOM.md) | LOBBY, CREATE-ROOM, JOIN-BY-CODE, WAITING-ROOM, INVITE-MODAL | BR-LOB-* / AC-LOB-*, BR-ROOM-* / AC-ROOM-*, BR-INV-* / AC-INV-* | 061–072 |
| R04 | Riêng tư và người xem: [REQ-ROOM](../01-requirements/REQ-ROOM.md), [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) | [FLOW-JOIN-ROOM](../02-flows/FLOW-JOIN-ROOM.md), [FLOW-SPECTATOR](../02-flows/FLOW-SPECTATOR.md) | ROOM-SETTINGS, SPECTATOR-LIST, ACCESS-DENIED | BR-ROOM-* / AC-ROOM-*, BR-SPEC-* / AC-SPEC-* | 066; 073–077; 110; 117 |
| R05 | Bàn cờ: [REQ-BOARD](../01-requirements/REQ-BOARD.md) | [FLOW-MATCH](../02-flows/FLOW-MATCH.md) | GAME-ROOM, AI-GAME | BR-BRD-* / AC-BRD-* | 012–026; 078–083 |
| R06 | Đồng bộ ván: [REQ-MATCH](../01-requirements/REQ-MATCH.md) | [FLOW-MATCH](../02-flows/FLOW-MATCH.md), [FLOW-DISCONNECT](../02-flows/FLOW-DISCONNECT.md) | GAME-ROOM, RECONNECTING | BR-MAT-* / AC-MAT-* | 084–094; 098 |
| R07 | Kết thúc ván: [REQ-MATCH](../01-requirements/REQ-MATCH.md) | [FLOW-MATCH](../02-flows/FLOW-MATCH.md) | GAME-ROOM, MATCH-RESULT | BR-MAT-* / AC-MAT-* | 024–026; 088; 093 |
| R08 | Đồng hồ: [REQ-CLOCK](../01-requirements/REQ-CLOCK.md) | [FLOW-MATCH](../02-flows/FLOW-MATCH.md), [FLOW-DISCONNECT](../02-flows/FLOW-DISCONNECT.md) | CREATE-ROOM, GAME-ROOM, AI-GAME | BR-CLK-* / AC-CLK-* | 063–067; 085; 092–094; 121 |
| R09 | Mất kết nối, nhiều tab: [REQ-DISCONNECT](../01-requirements/REQ-DISCONNECT.md) | [FLOW-DISCONNECT](../02-flows/FLOW-DISCONNECT.md) | RECONNECTING, GAME-ROOM, MEDIA-TAB-SWITCH | BR-DIS-* / AC-DIS-*, AC-SS-* / SS-* | 095–099 |
| R10 | Chat: [REQ-CHAT](../01-requirements/REQ-CHAT.md) | [FLOW-CREATE-ROOM](../02-flows/FLOW-CREATE-ROOM.md), [FLOW-MATCH](../02-flows/FLOW-MATCH.md) | CHAT-PANEL, WAITING-ROOM | BR-CHT-* / AC-CHT-* | 040; 108–111 |
| R11 | Camera/micro: [REQ-MEDIA](../01-requirements/REQ-MEDIA.md) | [FLOW-MEDIA](../02-flows/FLOW-MEDIA.md), [FLOW-DISCONNECT](../02-flows/FLOW-DISCONNECT.md) | MEDIA-PANEL, MEDIA-TAB-SWITCH | BR-MED-* / AC-MED-* | 041–042; 099; 112–117; 137 |
| R12 | Chơi với máy: [REQ-AI](../01-requirements/REQ-AI.md) | [FLOW-AI](../02-flows/FLOW-AI.md) | AI-SETUP, AI-GAME, MATCH-RESULT | BR-AI-* / AC-AI-* | 027–033; 118–126 |
| R13 | Thao tác trong ván: [REQ-GAME-ACTIONS](../01-requirements/REQ-GAME-ACTIONS.md) | [FLOW-MATCH](../02-flows/FLOW-MATCH.md) | CONFIRM-RESIGN, PROPOSAL-PROMPT | BR-ACT-* / AC-ACT-* | 104–107 |
| R14 | Tái đấu, lịch sử: [REQ-HISTORY-REMATCH](../01-requirements/REQ-HISTORY-REMATCH.md) | [FLOW-MATCH](../02-flows/FLOW-MATCH.md) | MATCH-RESULT, HISTORY, REPLAY | BR-HIS-* / AC-HIS-* | 127–129 |
| R15 | Responsive/trợ năng: [design-tokens](../03-screens/design-tokens.md) | Luồng xuyên suốt, không thêm flow giả | Tất cả SCR trong inventory | DT-* + checklist issue | 083; 130–131 |
| R16 | Local/Internet/bàn giao: [deployment](../09-technical/deployment.md) / [execution-milestones](../10-issues/execution-milestones.md) | Quy trình build/local/Internet ở nguồn kỹ thuật | Không phải UI sản phẩm: runbook và bằng chứng triển khai | DEP-* + checklist issue | 001–005; 034; 053; 112; 132–138 |
| R17 | Chống treo ván: [REQ-INACTIVITY](../01-requirements/REQ-INACTIVITY.md) | [FLOW-INACTIVITY](../02-flows/FLOW-INACTIVITY.md) | INACTIVITY-PROMPT, GAME-ROOM | BR-INA-* / AC-INA-* | 100–103; 098 |
| R18 | Đuổi người xem: [REQ-SPECTATOR](../01-requirements/REQ-SPECTATOR.md) | [FLOW-SPECTATOR](../02-flows/FLOW-SPECTATOR.md) | SPECTATOR-LIST, CONFIRM-KICK | BR-SPEC-* / AC-SPEC-* | 074–077; 110; 117 |
| R19 | Hộp thư lời mời: [REQ-INVITE](../01-requirements/REQ-INVITE.md) | [FLOW-JOIN-ROOM](../02-flows/FLOW-JOIN-ROOM.md) | INVITATION-INBOX, JOIN-LINK, NAVBAR | BR-INV-* / AC-INV-* | 068–072 |

## Truy vết tới từng ID và giới hạn

[Registry](requirement-register.md) liệt kê từng BR/GR/AC với nguồn định nghĩa, tránh dải số sai hoặc gán R02 cho FLOW-AUTH. GR ở [game-rules](../04-business-rules/game-rules.md) áp dụng R05/R07/R12. Screen ID/route và năm trạng thái được đối chiếu ở [inventory](../03-screens/screen-inventory.md) / [states](../03-screens/screen-states.md).

Mỗi issue có test và checklist; khi triển khai, [ISSUE-136](../10-issues/ISSUE-136.md) phải nộp bảng **từng AC → test thực tế → kết quả → bằng chứng**, bao gồm ca quyền, race và deadline. Registry này chưa là bằng chứng coverage runtime. AC phụ thuộc Google/SMTP cloud/media hai mạng ghi CHỜ đến [ISSUE-137](../10-issues/ISSUE-137.md), không đánh dấu PASS local thay thế.

## Các mối nối mới cần bảo vệ

- Ready/config/side-swap: DEC-042 → REQ-ROOM → FLOW-CREATE-ROOM → SCR-SIDE-SWAP-PROMPT → room-chat-contract §1 → ISSUE-037/039/064/066/067.
- Chat WAITING và người thay ghế: DEC-044 → REQ-CHAT → chat context/segment → ISSUE-040/108–110; raw browser đọc DB vẫn bị chặn bởi043.
- Phiên tạm/callback/reset: DEC-040 → REQ-AUTH + session-state → auth-provider-config → ISSUE-042/043/050/052/055/084/117.
- Media thất bại: DEC-041 → REQ-MEDIA → FLOW-MEDIA → SCR-MEDIA-PANEL/TAB-SWITCH → media-control-contract → ISSUE-099/115/117.
- Privacy cần hai tầng bằng chứng: ISSUE-066/075 (DB/quyền/job) → T110-14 (board/socket/chat/history) + TS-MED-06 tại117 (RTP thật) →133/136 tổng hợp.
- AI: DEC-045 → REQ-AI/CLOCK/DISCONNECT → ai-validation → ISSUE-032/033/121/124; không nới p95 bằng “biên độ nhỏ”.
