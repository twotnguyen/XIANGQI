# REQ-MEDIA — CAMERA VÀ MICRO

**ID yêu cầu:** `R11` · **Trạng thái:** Đã chốt BA (chưa triển khai) · **Cập nhật:** 2026-09-22
**Căn cứ:** `DEC-033`, `DEC-034` · Câu 8, 9, 10, 21 phỏng vấn

---

## 1. FEATURE NÀY ĐỂ LÀM GÌ

Cho hai người chơi **nhìn mặt và nói chuyện** với nhau ngay trong lúc đánh cờ, và tuỳ chọn cho **người xem** thấy/nghe.

**Điểm cốt lõi:** mỗi người chơi có **hai lựa chọn độc lập** — một cho camera, một cho micro — và **tự quyết luồng của mình**. Không ai bật thay ai.

> **Chỉ trực tiếp.** Không ghi âm, không ghi hình, không lưu, không phát lại, không tải về.

---

## 2. ACTOR

| Actor | Vai trò |
|---|---|
| **Người chơi** | Bật/tắt camera và micro **của chính mình**, chọn mức chia sẻ |
| **Đối thủ** | Nhận luồng nếu được chia sẻ; tự tắt tiếng/ẩn ở máy mình |
| **Người xem** | **Chỉ nhận**, không bao giờ phát |
| **Hệ thống** | Cấp quyền, thu hồi, thực thi tại hạ tầng truyền |

## 3. PRECONDITIONS

Ván **đang chơi** · là thành viên phòng · đang ở **tab đang giữ thiết bị** · trình duyệt cho phép truy cập thiết bị.

## 4. TRIGGER

Người chơi đổi mức chia sẻ camera/micro · ván bắt đầu/kết thúc · thu hồi quyền · tải lại trang.

---

## 5. BA MỨC CHIA SẺ

Mỗi người chơi có **hai lựa chọn riêng biệt**, mỗi lựa chọn có 3 mức:

| Mức | Ai nhận được |
|---|---|
| **Tắt** | Không ai |
| **Chỉ đối thủ** | Người chơi còn lại |
| **Đối thủ và người xem** | Cả người xem |

**`BR-MED-01`** — Camera và micro **hoàn toàn độc lập**. Ví dụ hợp lệ: camera *Chỉ đối thủ* + micro *Đối thủ và người xem* ⇒ người xem **nghe được tiếng nhưng không thấy hình**.

**`BR-MED-02`** — **Mặc định cả hai là Tắt**, ở **mỗi ván**.

**`BR-MED-03`** — Quyền thuộc **người phát**. Người chơi A bật cho người xem **không** làm B bị bật theo. Chủ phòng **không** có quyền nâng mức của ai.

---

## 6. MAIN FLOW — BẬT CAMERA CHO ĐỐI THỦ

| Bước | Hành động |
|---|---|
| 1 | Người chơi chọn mức **Chỉ đối thủ** ở ô camera |
| 2 | Trình duyệt hỏi quyền truy cập camera (nếu chưa cấp) |
| 3 | Người dùng đồng ý; hệ thống bắt đầu thu hình |
| 4 | Máy chủ ghi nhận mức mới và cấp quyền nhận **chỉ cho đối thủ** |
| 5 | Đối thủ thấy hình; **người xem không thấy gì** |
| 6 | Người phát thấy khung xem trước của chính mình, **đã tắt tiếng** |

---

## 7. ALTERNATIVE FLOWS

- **ALT-1 — Thu hẹp quyền:** đổi từ *Đối thủ và người xem* xuống *Chỉ đối thủ* ⇒ người xem **ngừng nhận luồng mới**. Hệ thống phải **thực thi tại hạ tầng**, không chỉ ẩn khung hình.
- **ALT-2 — Tắt hẳn:** dừng thu và **giải phóng thiết bị** nếu không còn ai cần. Tắt camera **không** ảnh hưởng micro.
- **ALT-3 — Trình duyệt chặn tự phát tiếng:** người nhận có nút **bật tiếng** thủ công.
- **ALT-4 — Đổi thiết bị:** chọn camera/micro khác trong cài đặt trình duyệt hoặc ứng dụng.
- **ALT-5 — Người nhận tự xử lý:** đối thủ **tắt tiếng hoặc ẩn** luồng tại máy mình mà **không** ảnh hưởng người phát.

---

## 8. EXCEPTION FLOWS

| Tình huống | Xử lý |
|---|---|
| Người dùng **từ chối** cấp quyền thiết bị | Báo rõ, giữ mức **Tắt**. **Vẫn đánh cờ bình thường** |
| Không có camera/micro | Báo rõ, vô hiệu lựa chọn tương ứng. Bàn cờ **không bị chặn** |
| Thiết bị bị ứng dụng khác chiếm | Báo rõ, cho thử lại |
| Hạ tầng truyền media **không liên lạc được** | Báo **"Đang ngừng chia sẻ…"**; mức mong muốn **vẫn giữ**, **không** tự quay lại mức rộng hơn |
| **Người xem** cố phát luồng | **Từ chối** |
| Đổi mức cho **người khác** | **Từ chối** |
| Tab không giữ nguồn cố phát/đổi mức mà chưa chuyển hợp lệ | **Từ chối**; có thể yêu cầu chuyển nguồn theo BR-MED-20…23 |
| Chuyển nguồn: không nhận được xác nhận ngắt tab cũ | Chưa cho nguồn mới thu/phát; đang chờ thì báo đang xử lý, thao tác thất bại thì báo lỗi + Thử lại (`DEC-034`) |
| Hai lựa chọn đổi **cùng lúc** | Chỉ **một** được ghi; client đọc lại trạng thái mới rồi thử lại cái kia |

**`BR-MED-04`** — Khi chưa thu hồi xong ở hạ tầng, hệ thống **không được báo là đã bảo vệ thành công**. Giao diện phải nói rõ **đang xử lý**.

---

## 9. POSTCONDITION

| Kết cục | Trạng thái |
|---|---|
| Bật thành công | Luồng chảy tới **đúng** nhóm người nhận |
| Thu hẹp / tắt | Người mất quyền **không nhận được luồng mới** |
| Ván kết thúc | **Mọi** luồng dừng; thiết bị được giải phóng |
| Tải lại / quay lại | **Cả hai mức trở về Tắt**, phải bật lại thủ công |
| Chuyển camera hoặc micro sang tab khác | **Chỉ nguồn được chuyển về Tắt** ở tab mới; nguồn còn lại giữ nguyên. Chưa xác nhận dừng nguồn cũ thì chưa cho bật nguồn mới (`DEC-033/034`) |

---

## 10. BUSINESS RULES

| ID | Luật |
|---|---|
| **BR-MED-01** | Camera và micro có mức chia sẻ **độc lập** |
| **BR-MED-02** | Mặc định **Tắt** ở mỗi ván |
| **BR-MED-03** | Quyền thuộc **người phát**; không ai đổi thay người khác |
| **BR-MED-04** | Chưa thu hồi xong ⇒ **không** báo đã bảo vệ thành công |
| **BR-MED-05** | **Người xem chỉ nhận**, không bao giờ phát camera/micro/chat vào kênh riêng người chơi |
| **BR-MED-06** | Thay đổi quyền phải **thực thi tại hạ tầng truyền**, **không** chỉ ẩn giao diện |
| **BR-MED-07** | **Không ghi, không lưu, không phát lại** bất kỳ luồng nào |
| **BR-MED-08** | Bật media là **thao tác chủ động** của người phát, sau một hành động người dùng |
| **BR-MED-09** | Tắt camera **không** làm dừng micro và ngược lại |
| **BR-MED-10** | Tải lại/quay lại ⇒ về Tắt theo phạm vi hiện có. Chuyển tab ⇒ **chỉ nguồn được chuyển về Tắt**, cần bật lại thủ công; nguồn còn lại giữ nguyên (`DEC-033`) |
| **BR-MED-11** | Ván kết thúc ⇒ dừng **toàn bộ** luồng |
| **BR-MED-12** | Người xem bị thu hồi: chặn cấp quyền mới ngay tại server, luồng cũ được thu hồi có xác nhận theo BR-MED-24/25; không hứa dừng gói tin tức thời bất kể mạng |
| **BR-MED-13** | Người phát thấy **khung xem trước đã tắt tiếng** của chính mình, tránh vọng âm |
| **BR-MED-14** | Người nhận có thể **tắt tiếng/ẩn tại máy mình** mà không ảnh hưởng người phát |
| **BR-MED-15** | Từ chối quyền thiết bị **không bao giờ** chặn việc đánh cờ |
| **BR-MED-16** | Ván với **máy không có media** |
| **BR-MED-17** | Hệ thống phải **nói rõ giới hạn**: micro có thể thu lại cả tiếng phát ra từ loa của đối thủ. Đây là giới hạn vật lý của thiết bị, **không** khắc phục được bằng phân quyền mạng. Khuyến nghị dùng tai nghe |
| **BR-MED-18** | Mỗi tài khoản chỉ một nguồn camera, một nguồn micro trên **mọi tab, trình duyệt và thiết bị**; camera và micro có thể ở hai nơi khác nhau (DEC-041) |
| **BR-MED-19** | Tab nào **bật trước** thì giữ. Tab khác hiện *"Camera đang bật ở tab khác"* + nút **Chuyển sang tab này** |
| **BR-MED-20** | Chuyển nguồn sang tab khác ⇒ xác nhận nguồn cũ đã dừng/thu hồi **trước**; nguồn tab mới về **Tắt**, chỉ phát sau thao tác bật riêng. Tab mới không tự cướp (`DEC-033/034`) |
| **BR-MED-21** | Chuyển camera không đổi tab phát/mức chia sẻ của micro; chuyển micro không ảnh hưởng camera |
| **BR-MED-22** | Chưa xác nhận ngắt nguồn cũ ⇒ đang xử lý, chặn thu/phát nguồn mới. Thất bại ⇒ báo lỗi và cho thử lại, không báo đã chuyển/ngắt thành công |
| **BR-MED-23** | Thử lại kiểm quyền/trạng thái mới và vẫn chờ xác nhận ngắt. Thành công về Tắt; xác nhận muộn không tự bật nguồn mới; lỗi chuyển không chặn cờ/chat hoặc nguồn còn lại |
| **BR-MED-24** | Chuyển/thu hồi bắt đầu khi server chấp nhận thao tác; ngay đó chặn cấp quyền cũ/mới trong phạm vi bị thu hồi. Chờ tối đa **30 giây mỗi lượt thao tác**, chưa chứng minh thu hồi thì báo lỗi + Thử lại, giữ nguồn mới Tắt; không tự phục hồi mức rộng hơn. Thử lại cùng yêu cầu không tạo hai người giữ nguồn |
| **BR-MED-25** | Thành công chỉ sau bằng chứng hạ tầng đã chặn nguồn/quyền cũ, bảo vệ thế hệ mới và ghi kết quả server. ACK tab cũ hoặc socket disconnect riêng lẻ không đủ. Trình duyệt hợp tác dừng/giải phóng thiết bị; server không thể bảo đảm tắt camera vật lý trên trình duyệt bị ngắt mạng hoặc cố ý sửa mã. Khi chưa biết thiết bị đã dừng, UI nói rõ trạng thái này, không báo “thiết bị cũ đã tắt” |

> **`BR-MED-17` phải hiển thị cho người dùng**, không chỉ nằm trong tài liệu. Người chơi cần biết trước khi bật micro.

---

## 11. GIỚI HẠN CỐ Ý KHÔNG HỨA

| Không hứa | Lý do |
|---|---|
| Thu hồi **tức thời** bất kể mạng | Hệ phân tán không bảo đảm được. Hệ thống chặn **cấp quyền và luồng mới**, có gián đoạn ngắn có chủ đích |
| Thu hồi dữ liệu **đã tới máy người nhận** | Đã nhận rồi thì không lấy lại được |
| Ngăn người nhận **quay màn hình** | Người đã thấy/nghe có thể ghi bằng công cụ khác. Không đặt mục tiêu chống |

---

## 12. PERMISSIONS

| Hành động | Người ngoài | Người xem | Người chơi | Chủ phòng |
|---|:---:|:---:|:---:|:---:|
| Phát camera / micro | ❌ | ❌ | ✅ | ✅ |
| Đổi mức của **chính mình** | ❌ | ❌ | ✅ | ✅ |
| Đổi mức của **người khác** | ❌ | ❌ | ❌ | ❌ |
| Nhận luồng được chia sẻ cho đối thủ | ❌ | ❌ | ✅ | ✅ |
| Nhận luồng được chia sẻ cho người xem | ❌ | ✅ | ✅ | ✅ |
| Tắt tiếng / ẩn tại máy mình | ❌ | ✅ | ✅ | ✅ |

---

## 13. UI LIÊN QUAN

`SCR-GAME-ROOM` — khung media · trên điện thoại nằm trong **tab riêng**

```
┌────────────────────────────────────┐
│ Chia sẻ của bạn                    │
│ 📹 Camera:  [ Tắt ▾ ]              │
│ 🎤 Micro:   [ Chỉ đối thủ ▾ ]      │
│                                    │
│ ⚠ Micro có thể thu cả tiếng phát   │
│   từ loa của bạn. Nên dùng tai nghe│
└────────────────────────────────────┘
```

**Quy tắc giao diện:**
- **Hai ô chọn riêng biệt**, nhãn đầy đủ: *Tắt* / *Chỉ đối thủ* / *Đối thủ và người xem*.
- Người xem **không có** nút phát — chỉ có âm lượng và tắt tiếng cục bộ.
- Media **không được che bàn cờ**; trên điện thoại vào tab riêng.
- Từ chối quyền thiết bị ⇒ thông báo rõ nhưng **bàn cờ vẫn dùng được**.
- Đang thu hồi ⇒ hiện **"Đang ngừng chia sẻ…"**, không báo đã xong.

**Chuyển nguồn:** đang chuyển/chờ xác nhận → thành công ở mức **Tắt**; thất bại → lỗi + **Thử lại**. Nút bật nguồn mới chưa dùng được khi chưa xác nhận ngắt nguồn cũ; giải thích lý do.

**Trạng thái bắt buộc:** đang kết nối · đang phát · lỗi thiết bị · bị trình duyệt chặn tiếng (có nút bật tiếng) · đang thu hồi · không có thiết bị (vô hiệu + giải thích).

---

## 14. STATES

```
TẮT ──(chọn mức)──► ĐANG XIN QUYỀN ──(đồng ý)──► ĐANG KẾT NỐI ──► ĐANG PHÁT
 ▲                        │                                           │
 │                        └──(từ chối)──► TẮT + thông báo             │
 │                                                                    │
 ├──(chọn Tắt)────────────────────────────────────────────────────────┤
 ├──(ván kết thúc)────────────────────────────────────────────────────┤
 └──(tải lại / quay lại / chuyển thiết bị sang tab khác)──────────────────────────────┘
```

---

## 15. REALTIME BEHAVIOR

| Sự kiện | Ai tạo | Máy chủ kiểm gì | Ai nhận | UI đổi gì |
|---|---|---|---|---|
| Đổi mức chia sẻ | Người chơi | Là người phát · tab đang giữ thiết bị · phiên bản mức khớp | Cả phòng | Ai mất quyền thì **ngừng nhận luồng**; ai được thì bắt đầu nhận |
| Bắt đầu phát | Người chơi | Mức cho phép | Nhóm được phép | Khung hình/tiếng xuất hiện |
| Thu hẹp quyền | Người chơi | Như trên | Cả phòng | Người mất quyền: khung biến mất **và luồng thật sự dừng** |
| Người xem bị đuổi/thu hồi | Hệ thống | — | Người đó | **Ngắt** khỏi mọi luồng |
| Ván kết thúc | Hệ thống | — | Cả phòng | **Mọi** luồng dừng |

### Ví dụ luồng dữ liệu

> A đặt camera = *Chỉ đối thủ*, micro = *Đối thủ và người xem*.
> B đặt camera = *Đối thủ và người xem*, micro = *Tắt*.

| Người | Thấy hình A | Nghe tiếng A | Thấy hình B | Nghe tiếng B |
|---|:---:|:---:|:---:|:---:|
| **A** | (xem trước, tắt tiếng) | — | ✅ | ❌ (B tắt micro) |
| **B** | ✅ | ✅ | (xem trước) | — |
| **Người xem** | ❌ | ✅ | ✅ | ❌ |

---

## 16. EDGE CASES

| # | Tình huống | Xử lý |
|---|---|---|
| 1 | A bật cho người xem, B chỉ cho đối thủ | Người xem **chỉ** nhận của A (`BR-MED-03`) |
| 2 | A đổi camera và micro **cùng lúc** | Chỉ một được ghi; client đọc lại rồi thử lại cái kia |
| 3 | A thu hẹp quyền khi người xem đang nhận | Luồng **thật sự dừng** ở hạ tầng, không chỉ ẩn khung (`BR-MED-06`) |
| 4 | Người xem giữ lại quyền cũ và thử nhận tiếp | **Không nhận được luồng mới** |
| 5 | Hạ tầng media mất liên lạc khi đang thu hồi | Báo **đang xử lý**, thử lại có giới hạn; **không** báo đã bảo vệ xong (`BR-MED-04`) |
| 6 | Tắt camera nhưng giữ micro | Micro **vẫn chạy** (`BR-MED-09`) |
| 7 | Tải lại trang khi đang bật cả hai | **Cả hai về Tắt**, phải bật lại |
| 8 | Chuyển camera sang tab mới | Xác nhận camera cũ ngắt trước; camera mới **Tắt**, micro giữ nguyên. Chuyển micro áp dụng đối xứng (DEC-033) |
| 9 | Trình duyệt chặn tự phát tiếng | Người nhận có nút **bật tiếng** |
| 10 | Micro thu lại tiếng loa của đối thủ | Giao diện **cảnh báo trước**; khuyến nghị tai nghe (`BR-MED-17`) |
| 11 | Người chơi từ chối quyền camera | Vẫn **đánh cờ bình thường** (`BR-MED-15`) |
| 12 | Phòng chuyển sang khoá khi người xem đang nhận | Người xem bị **ngắt** khỏi luồng |
| 13 | Tái đấu | Media **về Tắt** cho ván mới |
| 14 | Ván với máy | **Không có** khung media (`BR-MED-16`) |
| 15 | 5 người xem cùng nhận của cả 2 người chơi | Hỗ trợ được; là mốc nghiệm thu bắt buộc |

---

## 17. ACCEPTANCE CRITERIA

| ID | Tiêu chí |
|---|---|
| **AC-MED-01** | **Cả 9 tổ hợp** camera × micro của mỗi người chơi hoạt động đúng |
| **AC-MED-02** | A và B đặt mức **khác nhau** ⇒ người xem nhận **đúng** phần được chia sẻ |
| **AC-MED-03** | Mặc định **Tắt** ở mỗi ván |
| **AC-MED-04** | Camera và micro **độc lập** — tắt cái này không dừng cái kia |
| **AC-MED-05** | Đổi mức **thay người khác** ⇒ **từ chối** |
| **AC-MED-06** | **Người xem không phát được** kể cả khi giả mạo dữ liệu |
| **AC-MED-07** | Thu hẹp quyền ⇒ đo **luồng dữ liệu thật**, xác nhận người mất quyền **không nhận byte mới** — không chỉ kiểm giao diện |
| **AC-MED-08** | Người giữ quyền cũ **không** nhận được luồng ở thế hệ mới |
| **AC-MED-09** | Hạ tầng lỗi ⇒ trước deadline giữ đang xử lý; đúng 30 giây chưa chứng minh thu hồi thì FAILED/ERROR + Thử lại, không báo đã xong (DEC-041) |
| **AC-MED-10** | Tải lại/quay lại ⇒ về Tắt theo quy tắc hiện có; chuyển tab chỉ nguồn được chuyển về Tắt, không tự phát và không reset nguồn còn lại |
| **AC-MED-11** | Ván kết thúc ⇒ **mọi** luồng dừng, thiết bị được giải phóng |
| **AC-MED-12** | Từ chối quyền thiết bị ⇒ **vẫn đánh cờ được** |
| **AC-MED-13** | Người xem bị đuổi ⇒ chặn token mới ngay; chỉ báo hoàn tất khi có bằng chứng thu hồi và không nhận luồng mới; timeout theo BR-MED-24/25 |
| **AC-MED-14** | **2 người phát + 5 người xem** trong một phòng hoạt động được |
| **AC-MED-15** | Cảnh báo về micro thu tiếng loa **hiển thị cho người dùng** |
| **AC-MED-16** | Ván với máy **không có** khung media |
| **AC-MED-17** | Cuộc gọi thật giữa **hai thiết bị ở hai mạng khác nhau** — nghiệm thu riêng, cần thiết bị thật |
| **AC-MED-18** | Camera và micro đều đang phát: chuyển camera ⇒ camera mới Tắt/chưa phát, micro vẫn truyền tới đúng nhóm; làm đối xứng khi chuyển micro. Bật riêng sau chuyển mới có luồng nguồn mới |
| **AC-MED-19** | Làm mất xác nhận dừng nguồn cũ: tab mới không thu/phát, không báo thành công; khi thao tác lỗi có Thử lại. Kiểm trực tiếp yêu cầu phát lên máy chủ, không chỉ nút UI |
| **AC-MED-20** | Thử lại thành công ⇒ nguồn mới vẫn Tắt; xác nhận muộn/nhấn lặp không tự phát. Cờ/chat và nguồn còn lại tiếp tục; từ chối quyền thiết bị lúc bật mới không tự khôi phục phát tab cũ |
| **AC-MED-21** | Đồng hồ giả: ngay trước 30 giây còn chờ, đúng 30 giây không có bằng chứng ⇒ lỗi + Thử lại; ACK muộn không bật nguồn. Restart/retry tiếp tục đúng operation và thế hệ |
| **AC-MED-22** | Hai thiết bị khác mạng tranh nguồn: chỉ một thắng; camera và micro độc lập. ACK giả, token cũ và yêu cầu trực tiếp không vượt quyền; đo byte thật kèm đối chứng dương |
| **AC-MED-23** | Tab cũ không phản hồi nhưng hạ tầng chứng minh thu hồi ⇒ chuyển quyền về Tắt được; UI phân biệt luồng bị chặn với thiết bị vật lý chưa xác nhận dừng |

---

## 18. DEPENDENCY

[REQ-ROOM](REQ-ROOM.md) · [REQ-SPECTATOR](REQ-SPECTATOR.md) · [REQ-MATCH](REQ-MATCH.md) · [REQ-DISCONNECT](REQ-DISCONNECT.md) · [REQ-HISTORY-REMATCH](REQ-HISTORY-REMATCH.md)

## 19. OPEN QUESTIONS

F08/F26 và Q-AUD-06/09 đã chốt bằng DEC-033/034/041. Chi tiết thao tác, bằng chứng hạ tầng và giới hạn nền tảng ở [media-control-contract](../09-technical/media-control-contract.md). Không còn câu hỏi PO; chưa chạy nghiệm thu media thật.
