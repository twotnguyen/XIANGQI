# Task của Epic "Phòng công khai, khoá phòng và người xem" (5 task)

**Ngày:** 2026-10-04 · **Trạng thái:** đề xuất, chờ PO duyệt · Chưa tạo gì trên Jira · Viết theo `00-chuan-description.md` và mẫu `00b`.

Mã task `T-01` đến `T-62` đánh theo **thứ tự làm** (số nhỏ làm trước, mỗi task chỉ cần các task có số nhỏ hơn). Task gộp nhiều phần được ghi "Phần 1, Phần 2…". Ngày Sprint: 1 = 04/10–07/10, 2 = 08/10–10/10, 3 = 11/10–14/10, 4 = 15/10–17/10.

---

### T-32 — Giao diện: cài đặt phòng, đổi chỗ ghế/xem, danh sách người xem, xác nhận đuổi
**Thuộc Epic:** Phòng công khai, khoá phòng và người xem · **Thành phần:** Frontend · **Sprint:** 3 (11/10–14/10)
**Phải xong trước:** *Soạn "hợp đồng chung" giữa trình duyệt và máy chủ (T-02)*: nhận được yêu cầu đổi vai, khoá, đuổi cùng lỗi. *Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo) (T-08)*: nhận được hộp thoại, nút, thông báo, quản lý focus. *Giao diện: phòng chờ và màn từ chối vào phòng (T-15)*: nhận được màn phòng chờ, ghế và chỗ gắn thêm nút điều khiển.

**Mục tiêu**
Thêm vào phòng chờ các điều khiển nâng cao: **cài đặt phòng (khoá)**, **đổi chỗ giữa ghế và người xem**, **danh sách người xem**, **xác nhận đuổi**. Giao diện chỉ phản ánh quyền hiện tại do máy chủ báo, phát ý định để task tích hợp (T-40) nối thật.

**Việc cần làm (làm lần lượt)**
1. **Cài đặt phòng:** bật khoá — chỉ chủ phòng, chỉ khi đủ hai ghế; hộp xác nhận nói rõ "người đang trong phòng được giữ lại".
2. **Đổi chỗ:** nút xuống xem, nút mời xem lên ghế. Nút mờ có lý do khi hết chỗ xem, khi chủ phòng định tự xuống, hoặc người xem định tự ngồi; chỉ đổi được khi "Đang chờ" hoặc "Đã kết thúc".
3. **Danh sách người xem** với nút đuổi: chỉ hai người chơi thấy; **hộp xác nhận đuổi**, bấm "Huỷ" thì không gửi gì.
4. Chỉ cập nhật quyền **sau khi máy chủ xác nhận**; lỗi hay mất quyền chủ phòng khi hộp đang mở thì gỡ thao tác.
5. Đủ 5 trạng thái, bàn phím dùng được; không có chức năng chưa làm (xin đổi bên, tái đấu, QR).

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Hết chỗ xem, chủ phòng tự xuống, người xem tự ngồi | Nút mờ có lý do hoặc ẩn đúng luật, không gửi lệnh |
| Bật khoá khi thiếu ghế, rồi khi đủ ghế; bấm "Huỷ" | Chặn khi thiếu; xác nhận nói giữ người cũ; Huỷ không gửi |
| Người xem thử đuổi | Không có nút |
| Mất quyền chủ phòng khi hộp mở; máy chủ báo lỗi; danh sách rỗng | Gỡ thao tác; không báo thành công giả; đúng 5 trạng thái |

**Cách tự kiểm tra**
Chuẩn bị: dữ liệu giả có quyền đổi khi hộp đang mở.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Các ca hết chỗ xem / chủ phòng tự xuống / người xem tự ngồi | Nút mờ có lý do, không gửi |
| 2 | Khoá khi thiếu ghế rồi đủ ghế; bấm Huỷ | Đúng; Huỷ không gửi |
| 3 | Đuổi bởi người chơi; người xem thử đuổi | Người chơi có xác nhận; người xem không có quyền |
| 4 | Mất quyền khi hộp mở; lỗi; danh sách rỗng | Gỡ thao tác, không thành công giả, đủ trạng thái |

**Khi nào chuyển cho người kiểm thử:** cả 4 dòng đạt, kèm ảnh/video.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Dữ liệu giả **không** chứng minh việc đuổi hay thu quyền chạy thật (T-40).
**Bàn giao cho task sau:** các điều khiển cho task tích hợp phòng nâng cao.
**Không thuộc task này:** xử lý ở máy chủ, thu camera/mic, danh sách phòng công khai (đã ở Sảnh), xin đổi bên, tái đấu.

---

### T-36 — Máy chủ: kiểu phòng (công khai, chỉ mã, khoá) và danh sách phòng ở Sảnh
**Thuộc Epic:** Phòng công khai, khoá phòng và người xem · **Thành phần:** Room & Social · **Sprint:** 3 (11/10–14/10)
**Phải xong trước:** *Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh (T-21)*: nhận được cách xếp người vào phòng, mã và đường dẫn hiện hành.

**Mục tiêu**
Thực hiện việc **khoá phòng** và hiển thị **danh sách phòng công khai**. Khoá chỉ chặn **người mới**, **không đuổi** người đang có mặt hợp lệ.

**Việc cần làm (làm lần lượt)**
1. **Bật khoá:** chỉ chủ phòng, và chỉ khi **đủ hai người ngồi ghế**. Khoá thì phòng **biến khỏi Sảnh**, chặn người mới, giữ nguyên người đang có.
2. Khoá làm **đường dẫn và mã chưa dùng mất hiệu lực**; mở khoá thì tạo **mã và đường dẫn mới**, mã cũ không sống lại.
3. Nếu sau đó một ghế trống, phòng **vẫn giữ khoá** (không tự mở).
4. **Giữ chỗ khi mất kết nối:** người chơi vắng trong **60 giây**, người xem trong **5 phút** thì vẫn coi là người cũ; quá hạn coi như người mới (bị chặn nếu phòng đang khoá). Task này chỉ làm **quy tắc**; chạy thật khi mất mạng làm ở task kết nối lại.
5. **Danh sách Sảnh:** chỉ phòng công khai đang chờ hoặc đang chơi, **mới nhất trước, tối đa 50 phòng**. Phòng chỉ mã, đã khoá hoặc đã đóng thì không hiện.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Người không phải chủ, hoặc chưa đủ ghế, bật khoá | Bị chặn |
| Chủ phòng đủ hai ghế khoá | Biến khỏi Sảnh, người đang trong phòng không bị loại |
| Mở khoá rồi dùng mã cũ | Mã cũ vô hiệu; mã mới dùng được |
| Một ghế trống sau khi khoá | Vẫn khoá |
| Người vắng 59 giây / 61 giây (người xem 4:59 / 5:01) | Còn tư cách / coi như người mới |
| Có hơn 50 phòng, lẫn phòng chỉ mã, khoá, đóng | Chỉ phòng công khai đang chờ hoặc chơi, tối đa 50 mới nhất |

**Cách tự kiểm tra**
Chuẩn bị: dữ liệu mẫu nhiều phòng, đồng hồ giả.
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Người không phải chủ và phòng thiếu ghế thử khoá; chủ phòng đủ ghế khoá | Hai ca đầu bị chặn; ca cuối khoá thành công, không loại ai |
| 2 | Mở khoá rồi dùng mã cũ và mã mới | Mã cũ vô hiệu, mã mới dùng được |
| 3 | Làm một ghế trống khi đang khoá | Vẫn khoá |
| 4 | Thử các mốc 59/61 giây (chơi), 4:59/5:01 (xem) | Trong hạn: như người cũ; quá hạn: người mới |
| 5 | Lấy danh sách với dữ liệu hơn 50 phòng, có đủ các loại | Chỉ phòng công khai đang chờ hoặc chơi, tối đa 50 |

**Khi nào chuyển cho người kiểm thử:** cả 5 dòng đạt.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Việc mất mạng thật nghiệm thu ở task kết nối lại.
**Bàn giao cho task sau:** khoá, mã mới và danh sách Sảnh cho đuổi/Host, giao diện và mời bạn bè.
**Không thuộc task này:** đánh hạng, ghép ngẫu nhiên, hộp xác nhận khoá (ở giao diện).

---

### T-38 — Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng
**Thuộc Epic:** Phòng công khai, khoá phòng và người xem · **Thành phần:** Room & Social · **Sprint:** 3 (11/10–14/10)
**Phải xong trước:** *Máy chủ: chọn ghế, Sẵn sàng, đếm 3 giây, bắt đầu ván (T-25)*: nhận được ghế, Sẵn sàng và việc huỷ đếm khi đổi người. *Máy chủ: kiểu phòng (công khai, chỉ mã, khoá) và danh sách phòng ở Sảnh (T-36)*: nhận được kiểu phòng, mã, đường dẫn và quy tắc giữ chỗ.

**Mục tiêu**
Task này gồm **2 phần** làm liền nhau vì cùng một mục đích và nên do cùng một người hoặc một cặp làm.

*Phần 1 — Máy chủ: đổi chỗ giữa ghế và người xem, mời xuống ghế:*
Cho người chơi và người xem **đổi chỗ** theo luật và theo sức chứa. Mỗi lần đổi **xoá trạng thái "Sẵn sàng"** và báo cho các phần khác biết người đó đổi quyền (để chat và camera/mic đổi theo).

*Phần 2 — Máy chủ: đuổi người xem, chủ phòng rời, chuyển quyền chủ, đóng phòng:*
Xử lý trọn vòng đời phòng: **đuổi người xem**, **người rời đi**, **chuyển quyền chủ phòng**, **đóng phòng**, và trở về phòng chờ sau ván. Người bị đuổi phải **mất mọi quyền ngay** và không vào lại được.

**Việc cần làm (làm lần lượt)**
*Phần 1 — Máy chủ: đổi chỗ giữa ghế và người xem, mời xuống ghế:*
1. Chỉ cho đổi khi phòng ở **Đang chờ** hoặc **Đã kết thúc** (không đổi giữa ván).
2. **Người chơi tự xuống xem:** chỉ khi còn chỗ cho người xem.
3. **Chủ phòng chuyển đối thủ xuống xem**, hoặc **mời một người xem lên ghế trống**.
4. Người xem **không tự ngồi** vào ghế; chủ phòng **không tự xuống** làm người xem.
5. Mỗi lần đổi cập nhật sổ chỗ, thời điểm ngồi ghế và xoá "Sẵn sàng" của cả hai; phát thông báo quyền mới **sau khi** ghi xong.
6. Sau khi ván kết thúc, đổi thành phần ghế thì phòng về "Đang chờ".

*Phần 2 — Máy chủ: đuổi người xem, chủ phòng rời, chuyển quyền chủ, đóng phòng:*
1. **Đuổi người xem:** do một trong hai người chơi thực hiện, có xác nhận. Người bị đuổi bị ngắt khỏi phòng, **bị chặn** vào lại, mã hay đường dẫn cũ cũng vô hiệu với họ. Người xem **không** có quyền đuổi.
2. **Chủ phòng rời:** nếu còn người ngồi ghế thì **quyền chủ phòng chuyển** cho người đó; nếu không còn ai ngồi ghế thì **đóng phòng** dù còn người xem.
3. **Rời giữa ván:** chỉ hoàn tất việc rời khi phần ván đã **xác nhận xử thua**; task này không tự tính kết quả ván.
4. **Sau khi ván kết thúc:** phòng ở "Đã kết thúc" nếu không ai làm gì thì **đóng sau 10 phút**; ai đổi thành phần ghế thì về "Đang chờ" (và huỷ đồng hồ 10 phút cũ). Người chơi giữ ghế **60 giây** khi mất mạng.
5. Mỗi khi đuổi hay đóng, **phát thông báo** để chat và camera/mic thu quyền (phần thu thật làm ở Epic khác).

**Các trường hợp lỗi và kết quả mong đợi**
*Phần 1 — Máy chủ: đổi chỗ giữa ghế và người xem, mời xuống ghế:*
| Tình huống | Kết quả mong đợi |
|---|---|
| Người chơi xuống xem khi số người xem là 0 hoặc đầy / còn chỗ | Từ chối / nhận |
| Chủ phòng mời người xem lên ghế trống / ghế đã kín | Đúng quyền / từ chối, không chiếm ghế người khác |
| Chủ phòng tự xuống hoặc người xem tự ngồi | Từ chối ở máy chủ |
| Đổi trong ván | Từ chối |
| Đổi lúc "Đã kết thúc", gửi lặp hoặc cùng lúc | Về "Đang chờ", xoá sẵn sàng hai bên, không vượt sức chứa |

*Phần 2 — Máy chủ: đuổi người xem, chủ phòng rời, chuyển quyền chủ, đóng phòng:*
| Tình huống | Kết quả mong đợi |
|---|---|
| Người chơi đuổi người xem; người bị đuổi vào lại | Bị ngắt và chặn; người xem tự đuổi thì từ chối |
| Chủ phòng rời khi còn / không còn ai ngồi ghế | Chuyển quyền / đóng phòng |
| Rời giữa ván khi phần ván báo thành công / lỗi / không rõ | Chỉ khi xác nhận mới rời; không xử thua hai lần, không báo thành công khi chưa rõ |
| Phòng kết thúc, đổi ghế trước 10 phút / không ai làm gì | Đồng hồ cũ vô hiệu / phòng đóng |

**Cách tự kiểm tra**
*Phần 1 — Máy chủ: đổi chỗ giữa ghế và người xem, mời xuống ghế:*
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Người chơi xuống xem khi 0 / đầy / còn chỗ | Chỉ trường hợp còn chỗ được nhận |
| 2 | Chủ phòng mời người xem lên ghế trống rồi thử ghế kín | Đúng; không chiếm ghế người khác |
| 3 | Chủ phòng tự xuống; người xem tự ngồi | Từ chối |
| 4 | Thử đổi giữa ván | Từ chối |
| 5 | Đổi lúc phòng đã kết thúc, gửi hai yêu cầu cùng lúc | Về "Đang chờ", sẵn sàng xoá, không vượt trần |

*Phần 2 — Máy chủ: đuổi người xem, chủ phòng rời, chuyển quyền chủ, đóng phòng:*
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Người chơi đuổi người xem; người này thử vào lại; người xem tự đuổi | Bị chặn; người xem không có quyền |
| 2 | Chủ phòng rời khi còn ghế khác và khi không | Chuyển chủ / đóng, dù còn người xem |
| 3 | Rời giữa ván với "kết quả giả" thành công, lỗi, mất phản hồi | Chỉ rời khi xác nhận; không báo giả |
| 4 | Phòng kết thúc rồi đổi ghế trước 10 phút; để quá 10 phút | Đồng hồ cũ không đóng phòng; quá hạn đóng |

**Khi nào chuyển cho người kiểm thử:** (Phần 1) cả 5 dòng đạt. (Phần 2) cả 4 dòng đạt.
**Khi nào task xong:** (Phần 1) người kiểm thử và người xem lại đồng ý. Việc đổi quyền camera/mic thật làm ở Epic Chat, camera và micro; ở đây chỉ chứng minh đã phát thông báo. (Phần 2) người kiểm thử và người xem lại đồng ý. Việc thu camera/mic, dọn chat thật và xử thua thật do các task khác kiểm khi tích hợp.
**Bàn giao cho task sau:** (Phần 1) chức năng đổi chỗ và thông báo quyền mới cho riêng tư, đuổi, chat, camera/mic. (Phần 2) đuổi, chủ phòng, đóng phòng và thông báo quyền, cho giao diện, chat, camera/mic, ván.
**Không thuộc task này:** (Phần 1) xin đổi bên, hoán đổi trực tiếp hai người, giao diện. (Phần 2) tái đấu, tự ghi kết quả ván, giao diện.

---

### T-40 — Nối web với máy chủ: đổi chỗ, khoá phòng, danh sách công khai, đuổi, chủ phòng rời
**Thuộc Epic:** Phòng công khai, khoá phòng và người xem · **Thành phần:** Frontend, Room & Social · **Sprint:** 3 (11/10–14/10)
**Phải xong trước:** *Nối web với máy chủ: tạo phòng, vào phòng, ghế, Sẵn sàng, bắt đầu ván (T-29)*: nhận được luồng tạo, vào, ghế đã chạy thật. *Giao diện: cài đặt phòng, đổi chỗ ghế/xem, danh sách người xem, xác nhận đuổi (T-32)*: nhận được các nút và hộp xác nhận đã dựng. *Máy chủ: kiểu phòng (công khai, chỉ mã, khoá) và danh sách phòng ở Sảnh (T-36)*: nhận được kết quả đã hoàn thành của task này. *Máy chủ: đổi chỗ ghế/xem, đuổi người xem, chủ phòng rời, đóng phòng (T-38)*: nhận được các chức năng thật ở máy chủ.

**Mục tiêu**
Nối các điều khiển nâng cao với máy chủ thật và kiểm đúng cho **người chơi, người xem và người vừa mất quyền**: đổi chỗ, khoá, đuổi, chủ phòng rời. Quan trọng nhất: người bị đuổi **mất quyền thật** ở máy chủ, không chỉ bị ẩn nút.

**Việc cần làm (làm lần lượt)**
1. Nối các nút ở T-32 với chức năng ở T-38, T-36, T-38 và danh sách Sảnh.
2. Chạy kịch bản nhiều người: đổi chỗ khi còn/hết chỗ, khoá phòng, đuổi người xem, chủ phòng rời, phòng kết thúc.
3. Với người bị đuổi: thử vào lại bằng mã cũ và thử gửi lệnh bằng kết nối cũ.
4. Kiểm đồng hồ 10 phút của phòng kết thúc khi phòng quay về "Đang chờ".
5. Với việc thu camera/mic, dọn chat: chỉ kiểm **thông báo đã phát**; thu thật kiểm ở Epic Chat, camera và micro.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Xuống xem khi còn chỗ / hết chỗ / chủ phòng tự xuống | Đúng quyền và sức chứa; Sẵn sàng xoá |
| Khoá phòng; một ghế trống rồi người xem cũ lên ghế | Vẫn khoá; người cũ đổi vai hợp lệ, người mới bị chặn |
| Đuổi người xem rồi dùng mã cũ và kết nối cũ | Ra Sảnh, không nhận dữ liệu phòng, không vào lại được |
| Phòng kết thúc rồi quay về "Đang chờ" trước hạn | Đồng hồ cũ không đóng phòng mới |

**Cách tự kiểm tra**
Chuẩn bị: nhiều trình duyệt (chủ phòng, đối thủ, hai người xem).
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Đổi chỗ trong các ca còn chỗ / hết chỗ / chủ phòng tự xuống | Đúng quyền; Sẵn sàng xoá |
| 2 | Khoá phòng, rồi đổi vai người cũ và thử người mới | Người cũ hợp lệ; người mới bị chặn |
| 3 | Đuổi người xem; người này thử mã cũ và kết nối cũ | Mất quyền thật |
| 4 | Phòng kết thúc, quay về "Đang chờ" trước 10 phút | Phòng mới không bị đóng nhầm |

**Khi nào chuyển cho người kiểm thử:** cả 4 dòng đạt trên môi trường thử, kèm video.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Kết quả liên miền (thu camera/mic thật, dọn chat, xử thua khi rời giữa ván, kết nối lại) do các task của Epic khác kiểm.
**Bàn giao cho task sau:** phòng nâng cao chạy thật cho chat, camera/mic, ván nâng cao và bạn bè.
**Không thuộc task này:** viết thêm giao diện còn thiếu (đã ở T-32), tái đấu, mã QR, sửa kết quả ván.

---

### T-44 — Máy chủ: người xem theo dõi trực tiếp, lọc dữ liệu theo vai trò
**Thuộc Epic:** Phòng công khai, khoá phòng và người xem · **Thành phần:** Game Server · **Sprint:** 3 (11/10–14/10)
**Phải xong trước:** *Máy chủ: vào phòng bằng mã, đường dẫn hoặc từ Sảnh (T-21)*: nhận được tư cách người xem đã kiểm sức chứa. *Máy chủ: bộ xử lý lệnh của ván và xử lý nước đi (T-28)*: nhận được trạng thái ván đã lưu và luồng phát. *Máy chủ: đồng hồ ván, kết thúc ván, đầu hàng, xin hoà (T-39)*: nhận được giờ còn lại và mốc lượt do máy chủ tính.

**Mục tiêu**
Cho **người xem hợp lệ** nhận luồng trạng thái ván **chỉ đọc** (bàn cờ, giờ, nước đi, kết quả, số người xem X/N). Dữ liệu được **lọc ở máy chủ trước khi gửi**, không gửi hết rồi ẩn ở giao diện.

**Việc cần làm (làm lần lượt)**
1. Chỉ người đã được xác nhận là người xem hợp lệ của phòng mới nhận được luồng.
2. Gửi cho người xem: thế cờ, lượt, **giờ còn lại và mốc lượt do máy chủ tính**, nước vừa đi, kết quả, số người xem hiện tại / tối đa. **Không gửi** kênh chat riêng của hai người chơi, email hay bất cứ thông tin riêng.
3. Người xem gửi lệnh đi nước, đầu hàng… đều **bị từ chối**.
4. Khi người xem bị đuổi hoặc hết thời gian giữ chỗ → **ngừng gửi** dữ liệu; nối lại hợp lệ thì **đồng bộ lại** trạng thái đầy đủ.
5. Không cố ý làm chậm người xem.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Người xem hợp lệ | Nhận nước và kết quả trực tiếp |
| Người xem gửi nước đi hay đầu hàng | Bị từ chối |
| So dữ liệu người xem và người ngoài phòng | Không có chat riêng, email; người ngoài không nhận gì |
| Bị đuổi hoặc hết hạn giữ chỗ rồi xin đồng bộ | Không nhận dữ liệu mới |
| Người xem vào giữa lượt, đồng bộ lại sau nước đi | Giờ và lượt khớp trạng thái máy chủ; chỉ để hiển thị |

**Cách tự kiểm tra**
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Người xem hợp lệ xem một ván có nước đi và kết quả | Nhận trực tiếp |
| 2 | Người xem gửi nước, đầu hàng | Từ chối |
| 3 | So dữ liệu thô của người xem và người ngoài | Không lộ chat riêng, email; người ngoài không nhận |
| 4 | Đuổi người xem rồi xin đồng bộ | Không nhận thêm |
| 5 | Cho người xem vào giữa lượt | Giờ và lượt khớp |

**Khi nào chuyển cho người kiểm thử:** cả 5 dòng đạt, đã đối chiếu dữ liệu thô gửi đi.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Độ trễ người xem đo ở bài tải (T-61).
**Bàn giao cho task sau:** luồng người xem cho tích hợp ván nâng cao, chat và bài tải.
**Không thuộc task này:** phát camera hay micro cho người xem, xem lại ván, giao diện.
