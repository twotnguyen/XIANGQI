# YÊU CẦU CHỨC NĂNG — MỤC LỤC

**Cập nhật:** 2026-09-21

Mỗi file mô tả **một nhóm chức năng**, trả lời đủ **15 mục** theo `DEC-009`:

> mục đích · actor · precondition · trigger · luồng chính · luồng thay thế · luồng lỗi · postcondition · business rules · quyền · UI liên quan · trạng thái · hành vi realtime · edge case · tiêu chí nghiệm thu · phụ thuộc · câu hỏi còn mở

**Quy tắc:** tài liệu ở đây nói **CÁI GÌ**, không nói **BẰNG CÔNG NGHỆ GÌ**. Công nghệ nằm ở [../09-technical/](../09-technical/).

---

## DANH SÁCH

| File | Yêu cầu | Nội dung | Trạng thái |
|---|---|---|---|
| [REQ-AUTH](REQ-AUTH.md) | R01 | Đăng ký · xác minh email · đăng nhập · Google · quên mật khẩu · phiên · đăng xuất · **không hỗ trợ khách** | 🟢 |
| [REQ-PROFILE-FRIENDS](REQ-PROFILE-FRIENDS.md) | R02 | Hồ sơ · tên hiển thị · tìm bạn · kết bạn · trạng thái online | 🟢 |
| [REQ-LOBBY](REQ-LOBBY.md) | R03 | Sảnh · danh sách phòng công khai | 🟢 |
| [REQ-ROOM](REQ-ROOM.md) | R03 R04 | Tạo phòng · hai ghế · sẵn sàng · chế độ riêng tư · rời phòng · đóng phòng | 🟢 |
| [REQ-INVITE](REQ-INVITE.md) | R03 R19 | Mời trực tiếp · link · mã phòng · **hộp thư lời mời** | 🟢 |
| [REQ-SPECTATOR](REQ-SPECTATOR.md) | R04 R18 | Vào xem · trần 5 người · thu hồi quyền · **đuổi người xem** | 🟢 |
| [REQ-BOARD](REQ-BOARD.md) | R05 | Hiển thị bàn cờ · chọn quân · đi nước · lật bàn · bàn phím | 🟢 |
| [REQ-MATCH](REQ-MATCH.md) | R06 R07 | Vòng đời ván · lượt đi · đồng bộ · chống trùng lệnh · kết thúc | 🟢 |
| [REQ-CLOCK](REQ-CLOCK.md) | R08 | Cấu hình thời gian · đếm ngược · hết giờ | 🟢 |
| [REQ-INACTIVITY](REQ-INACTIVITY.md) | **R17** | **Chống treo ván** — 3 phút → hỏi và đếm ngay 30 giây | 🟢 |
| [REQ-DISCONNECT](REQ-DISCONNECT.md) | R09 | Mất mạng · ân hạn 60 giây · nối lại · nhiều tab · khởi động lại | 🟢 |
| [REQ-GAME-ACTIONS](REQ-GAME-ACTIONS.md) | R13 | Đầu hàng · xin hoà · xin đi lại | 🟢 |
| [REQ-CHAT](REQ-CHAT.md) | R10 | Hai kênh chat tách biệt | 🟢 |
| [REQ-MEDIA](REQ-MEDIA.md) | R11 | Camera · mic · ba mức chia sẻ độc lập | 🟢 |
| [REQ-AI](REQ-AI.md) | R12 | Chơi với máy · ba cấp độ · đi lại với máy | 🟢 |
| [REQ-HISTORY-REMATCH](REQ-HISTORY-REMATCH.md) | R14 | Tái đấu đổi bên · lịch sử · xem lại từng nước | 🟢 |

**16 module yêu cầu đã được rà soát ở mức đặc tả, chưa nghiệm thu ứng dụng.** R15 (responsive/trợ năng) ở screens/design-tokens; R16 (local/Internet) ở09 và10. Xem [truy vết đủ R01–R19](../06-acceptance/traceability-matrix.md).

---

## CÁC YÊU CẦU MỚI TỪ ĐỢT AUDIT BA

Ba yêu cầu **không có** trong bộ tài liệu cũ, phát sinh từ audit 2026-09-21:

| ID | Tên | Vì sao phát sinh | Quyết định |
|---|---|---|---|
| **R17** | Chống treo ván | Ván **mặc định không giới hạn thời gian** ⇒ người vẫn online nhưng không đi nước làm ván treo vô hạn; đối thủ chỉ có thể đầu hàng hoặc chờ mãi, và bị khoá không tạo được phòng khác | `DEC-002` `DEC-010`…`DEC-013` |
| **R18** | Đuổi người xem | Tài liệu media cũ nhắc "kick viewer" **hai lần** nhưng **không có** yêu cầu hay chức năng nào; cách duy nhất là đuổi **toàn bộ 5 người** | `DEC-004` `DEC-014` `DEC-015` |
| **R19** | Hộp thư lời mời | Lời mời chỉ đẩy tức thời và hết hạn 10 phút ⇒ bạn không online lúc đó thì **không bao giờ biết mình từng được mời** | `DEC-008` |

---

## YÊU CẦU LIÊN QUAN NHAU NHƯ THẾ NÀO

```
                    REQ-AUTH  (cổng vào mọi thứ)
                        │
              ┌─────────┼─────────┐
              ▼         ▼         ▼
    REQ-PROFILE-   REQ-LOBBY   REQ-AI
      FRIENDS          │      (không cần phòng)
              │        ▼
              └──► REQ-ROOM ◄── REQ-INVITE
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   REQ-SPECTATOR   REQ-MATCH    REQ-CHAT
                       │         REQ-MEDIA
          ┌────────────┼────────────┐
          ▼            ▼            ▼
    REQ-BOARD     REQ-CLOCK   REQ-GAME-ACTIONS
                       │
              ┌────────┴────────┐
              ▼                 ▼
      REQ-INACTIVITY     REQ-DISCONNECT
                       │
                       ▼
             REQ-HISTORY-REMATCH
```

**Đọc theo thứ tự này** nếu muốn hiểu dần từ gốc.

---

## BA LUẬT XUYÊN SUỐT MỌI CHỨC NĂNG

Ba điều này đúng ở **mọi** yêu cầu, không lặp lại trong từng file:

| # | Luật | Nghĩa là |
|---|---|---|
| **1** | **Máy chủ quyết định** | Client chỉ gửi ý định. Mọi nước đi, kết quả, thời gian, quyền hạn đều do máy chủ phân xử. Sửa client không gian lận được |
| **2** | **Quyền thật, không phải ẩn giao diện** | Không có quyền ⇒ **không nhận được dữ liệu**, chứ không phải nhận rồi giấu đi. Áp dụng cho cả chat, camera/mic và bàn cờ |
| **3** | **Một tài khoản, một phòng, một tab thao tác** | Không ngồi hai phòng cùng lúc. Mở nhiều tab không tạo thêm ghế — chỉ **một tab** thao tác được, các tab khác chỉ đọc |

---

## LIÊN QUAN

| Nội dung | Tài liệu |
|---|---|
| Thuật ngữ | [../00-overview/glossary.md](../00-overview/glossary.md) |
| Vai trò và quyền tổng quan | [../00-overview/actors.md](../00-overview/actors.md) |
| Luật cờ và hệ toạ độ | [../04-business-rules/game-rules.md](../04-business-rules/game-rules.md) |
| Ma trận quyền đầy đủ | [../04-business-rules/permissions.md](../04-business-rules/permissions.md) |
| Vì sao quyết như vậy | [../07-decisions/decision-log.md](../07-decisions/decision-log.md) |
