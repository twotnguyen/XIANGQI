# 06 — HỢP ĐỒNG API & SỰ KIỆN REALTIME

**Dự án:** Cờ Tướng Online · **Cập nhật:** 2026-09-27

> ⏱ **Đọc lần đầu:** khoảng 10 phút. · Đây là **một chỗ duy nhất** liệt kê mọi đường dẫn HTTP và mọi tên sự kiện Socket.IO mà các Task trong `Jira/` dùng. Dev, Tester và công cụ `qa` / `qsock` đều theo bảng này.

---

## 1. VÌ SAO CÓ FILE NÀY

- Đặc tả (`docs/`) quy định **nội dung** và **quyền** của từng thao tác, nhưng **chỉ đặt tên cho một phần** đường dẫn HTTP và **không đặt tên sự kiện socket nào**.
- Nếu mỗi Task tự đặt tên thì BE và FE lệch nhau ⇒ tích hợp hỏng. File này **chốt tên** để mọi người dùng giống nhau.
- **Thứ tự ưu tiên:** đặc tả `docs/` > file này > nội dung trong từng Task. Thấy mâu thuẫn với `docs/` ⇒ `docs/` đúng, báo trưởng nhóm để sửa file này.

### Cột "Nguồn"
| Giá trị | Nghĩa |
|---|---|
| **Đặc tả** + mã issue | Tên lấy nguyên từ `docs/10-issues` hoặc `docs/09-technical` — **không** được đổi |
| **Chốt** | Đặc tả không đặt tên; nhóm chốt tên này. Muốn đổi ⇒ theo quy trình mục 5 |

### Quy ước chung
- Mọi đường dẫn HTTP có tiền tố `/api/v1` (trừ `/health`, `/healthz`).
- Mọi phản hồi HTTP và **ack** socket đều là vỏ `ApiResult` `{ ok, data | error: { code, message }, requestId }` (TK03.1.2).
- Sự kiện socket: **client → server** là **lệnh** (luôn có ack); **server → client** là **thông báo** (không ack).
- Tên sự kiện: `<nhóm>.<hànhĐộng>` kiểu camelCase, ví dụ `match.respondProposal`.
- Hằng số tên sự kiện nằm trong `packages/contracts/src/events.ts` (TK03.1.2) — code **không** được viết chuỗi tên sự kiện trực tiếp.

---

## 2. HTTP API

### 2.1 Tài khoản & phiên
| Phương thức · đường dẫn | Ai gọi | Task | Nguồn |
|---|---|---|---|
| `POST /auth/login` | công khai | TK06.2.1 | Đặc tả ISSUE-049 |
| `POST /auth/session/bootstrap` | có JWT, chưa có phiên app | TK06.2.1 | Chốt |
| `POST /auth/activity` | đã đăng nhập | TK06.2.2 | Chốt |
| `POST /auth/logout` | đã đăng nhập | TK06.2.2 | Đặc tả ISSUE-051 |
| `POST /auth/reset-password` | phiên recovery | TK06.3.1 | Chốt (đặc tả ISSUE-052 chỉ nói "endpoint bảo vệ bởi recovery context") |
| `POST /auth/complete-profile` | chưa có username | TK06.3.1 | Đặc tả ISSUE-054 |
| `GET /me` · `PATCH /me` | đã đăng nhập | TK06.1.1, TK07.1.1 | Đặc tả ISSUE-056 |

### 2.2 Người dùng & bạn bè
| Phương thức · đường dẫn | Task | Nguồn |
|---|---|---|
| `GET /users?prefix=` | TK07.1.1 | Đặc tả ISSUE-057 |
| `GET /friends` | TK07.1.1 | Đặc tả ISSUE-058 |
| `POST /friends/requests` | TK07.1.1 | Đặc tả ISSUE-058 |
| `POST /friends/requests/:id/respond` | TK07.1.1 | Đặc tả ISSUE-058 |
| `DELETE /friends/requests/:id` | TK07.1.1 | Đặc tả ISSUE-058 |
| `DELETE /friends/:userId` | TK07.1.1 | Đặc tả ISSUE-058 |

### 2.3 Phòng, sảnh, lời mời
| Phương thức · đường dẫn | Task | Nguồn |
|---|---|---|
| `POST /rooms` | TK08.1.1 | Đặc tả ISSUE-061 |
| `GET /rooms?cursor=` (sảnh) | TK08.2.1 | Đặc tả ISSUE-062 |
| `GET /rooms/:id` (RoomView cho thành viên) | TK08.1.1 | Chốt |
| `POST /rooms/join` | TK08.1.2 | Đặc tả ISSUE-063, room-chat-contract §2 |
| `POST /rooms/:id/ready` | TK08.2.2 | Đặc tả ISSUE-064, room-chat-contract §1 |
| `POST /rooms/:id/side-swap` · `…/side-swap/:proposalId/respond` · `…/side-swap/:proposalId/cancel` | TK08.2.2 | Đặc tả room-chat-contract §1 (tên `respond`/`cancel` là Chốt) |
| `POST /rooms/:id/leave` | TK08.3.1 | Đặc tả ISSUE-065 |
| `PATCH /rooms/:id` | TK08.3.2 | Đặc tả ISSUE-066 |
| `POST /rooms/:id/codes` · `POST /rooms/:id/links` | TK08.4.1 | Chốt |
| `POST /rooms/:id/watch-code` | TK08.4.1 | Đặc tả ISSUE-068 |
| `POST /rooms/:id/invitations` | TK08.4.2 | Đặc tả ISSUE-070 |
| `POST /invitations/:id/respond` | TK08.4.2 | Đặc tả ISSUE-070 |
| `GET /invitations?cursor=` | TK08.4.2 | Đặc tả ISSUE-071 |
| `GET /invitations/count` | TK08.4.2 | Chốt |
| `POST /rooms/:id/members/:userId/kick` | TK09.2.1 | Đặc tả ISSUE-076 |
| `POST /rooms/:id/rematch` | TK12.3.1 | Đặc tả ISSUE-127 |
| `POST /rooms/:id/chat` · `GET /rooms/:id/chat?channel=&cursor=` | TK13.1.1 | Chốt (đặc tả ISSUE-108 mô tả nội dung) |

### 2.4 Ván
| Phương thức · đường dẫn | Task | Nguồn |
|---|---|---|
| `GET /matches/:id/snapshot` | TK10.3.3 | Chốt (đặc tả ISSUE-090 mô tả nội dung) |
| `POST /matches/:id/commands/move` | TK10.3.1 | Chốt |
| `POST /matches/:id/commands/resign` | TK12.1.1 | Đặc tả ISSUE-104 |
| `POST /matches/:id/commands/propose` · `…/respond` · `…/withdraw` | TK12.1.1 | Chốt |
| `POST /matches/:id/commands/confirm-alive` | TK11.3.1 | Đặc tả ISSUE-101 |
| `POST /matches/:id/commands/undo-ai` | TK15.2.1 | Đặc tả ISSUE-122 |
| `GET /history?cursor=` | TK12.2.1 | Đặc tả ISSUE-125 |
| `GET /matches/:id/replay` | TK12.2.1 | Đặc tả ISSUE-126 — **một** API cho cả 2 route giao diện `/history/:matchId` và `/rooms/:roomId/replay/:matchId` |
| `POST /ai/matches` | TK15.2.1 | Đặc tả ISSUE-121 |

### 2.5 Camera / micro
| Phương thức · đường dẫn | Task | Nguồn |
|---|---|---|
| `GET /media/policy?matchId=` · `PATCH /media/policy` | TK14.2.1 | Đặc tả ISSUE-113 |
| `POST /media/token` | TK14.2.1 | Chốt (đặc tả ISSUE-114 mô tả token) |
| `POST /media/revocations/:operationId/retry` | TK14.2.2 | Chốt |
| `POST /media/devices/claim` · `POST /media/devices/transfer` | TK14.3.2 | Chốt |

### 2.6 Vận hành
| Phương thức · đường dẫn | Task | Nguồn |
|---|---|---|
| `GET /health` (liveness) | TK01.x | Đặc tả ISSUE-001 |
| `GET /healthz` (readiness) | TK16.8.1 | Đặc tả architecture.md, ISSUE-137 |

---

## 3. SỰ KIỆN SOCKET.IO (namespace `/ws`)

Đặc tả **không** đặt tên sự kiện nào ⇒ toàn bộ bảng dưới là **Chốt**.

### 3.1 Client → server (lệnh, có ack)
| Sự kiện | Payload | Ai gửi | Task |
|---|---|---|---|
| `heartbeat` | `{ tabId }` | mọi kết nối, mỗi 10 giây | TK10.2.2 |
| `lobby.subscribe` | `{}` | người ở sảnh | TK08.2.1 |
| `room.subscribe` | `{ roomId }` | thành viên phòng | TK10.2.1 |
| `room.join` | như `POST /rooms/join` | người muốn vào phòng | TK10.2.1, TK09.1.1 |
| `room.rematch` | `{ roomId, commandId, expectedMatchId, accept }` | người chơi | TK12.3.1 |
| `match.resync` | `{ matchId }` | thành viên / người chơi ván AI | TK10.3.3 |
| `match.move` | `{ matchId, commandId, expectedVersion, from, to }` | người chơi | TK10.3.1 |
| `match.resign` | `{ matchId, commandId, expectedVersion }` | người chơi | TK12.1.1 |
| `match.propose` | `{ …, kind: 'DRAW' \| 'UNDO' }` | người chơi | TK12.1.1 |
| `match.respondProposal` | `{ …, proposalId, accept }` | đối thủ | TK12.1.1 |
| `match.withdrawProposal` | `{ matchId, commandId, proposalId }` | người đề nghị | TK12.1.1 |
| `match.confirmAlive` | `{ matchId, commandId, expectedVersion }` | bên đến lượt | TK11.3.1 |
| `chat.send` | như `POST /rooms/:id/chat` | thành viên | TK13.1.1 |

### 3.2 Server → client (thông báo)
| Sự kiện | Payload chính | Gửi tới | Task |
|---|---|---|---|
| `lobby.roomUpserted` · `lobby.roomRemoved` | `{ room }` · `{ roomId }` | `lobby` | TK08.2.1 |
| `room.updated` | RoomView rút gọn | `room:<id>` | TK08.2.2 |
| `room.memberJoined` · `room.memberLeft` | `{ userId, role }` | `room:<id>` | TK08.1.2, TK09.1.1 |
| `room.closed` | `{ roomId }` | thành viên cũ | TK08.3.1 |
| `room.accessRevoked` | `{ roomId, reason }` | đúng người bị thu hồi | TK08.3.2 |
| `room.kicked` | `{ roomId }` | đúng người bị đuổi | TK09.2.1 |
| `room.rematchVote` · `room.rematchDeclined` | `{ side, accept }` | `room:<id>` | TK12.3.1 |
| `presence.changed` | `{ userId, online, disconnectDeadlineMs }` | `room:<id>` (người trong phòng / ván) | TK10.2.2 |
| `friends.presenceChanged` | `{ userId, online }` — **không** phòng, đối thủ | `user:<bạn>` | TK07.2.1 |
| `friends.changed` | `{}` (client tải lại `/friends`) | 2 người liên quan | TK07.2.1 |
| `invitation.received` · `invitation.removed` | tóm tắt lời mời (không mã/token) · `{ id }` | `user:<người nhận>` | TK08.4.2 |
| `match.started` | `{ matchId }` | `room:<id>` | TK08.2.2 |
| `match.updated` | snapshot rút gọn | `room:<id>` / người chơi ván AI | TK10.3.1 |
| `match.proposalResolved` | `{ proposalId, status }` | `room:<id>` | TK12.1.1 |
| `match.finished` | `{ matchId, outcome }` | `room:<id>` | TK10.3.2 |
| `chat.message` | tin đã lọc theo quyền | PLAYERS: `user:<participant>`; ROOM: thành viên | TK13.1.1 |
| `media.policyApplied` | `{ matchId, userId, generation }` | `room:<id>` | TK14.2.2 |
| `media.stopRequested` | `{ kind, operationId }` | `user:<id>` (tab đang giữ nguồn) | TK14.3.2 |
| `ai.state` | `{ matchId, state: 'QUEUED' \| 'THINKING' }` | người chơi ván AI | TK15.1.4 |

---

## 4. QUYẾT ĐỊNH BỔ SUNG (chỗ đặc tả để ngỏ)

| Vấn đề | Đặc tả nói | Chốt | Task |
|---|---|---|---|
| Lưu presence bền vững | ISSUE-095: "`client_controls` hoặc bảng presence" | Bảng mới `member_presence` (`client_controls` khoá `(user_id, kind)` chỉ cho camera/micro — `DEC-020`) | TK10.2.2 |
| Sự kiện online bạn bè vs online trong phòng | — | Tách 2 tên: `friends.presenceChanged` và `presence.changed` (payload và người nhận khác nhau) | TK07.2.1, TK10.2.2 |
| API xem lại | ISSUE-126: `GET /api/v1/matches/:id/replay`; room-chat-contract §6: 2 **route giao diện** | Một API, máy chủ tự quyết theo 2 luật quyền (người chơi / thành viên phòng khi ván hiện tại đã xong) | TK12.2.1, TK12.2.2 |

---

## 5. MUỐN ĐỔI TÊN THÌ LÀM GÌ

1. Chỉ đổi được tên có Nguồn = **Chốt**. Tên có Nguồn = **Đặc tả** ⇒ ⛔ không đổi (muốn đổi phải sửa `docs/` trước, theo AGENTS.md).
2. Sửa **cùng một PR**: file này · `packages/contracts/src/events.ts` · mọi Task nhắc tới tên cũ (`grep -rn "<tên cũ>" Jira/`) · `Jira/tools/qa.sh` / `sock.mjs` nếu công cụ dùng.
3. Ghi trong comment PR để Tester biết.
