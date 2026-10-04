# Task của Epic "Khởi tạo bàn cờ" (6 task)

**Ngày:** 2026-10-04 · **Trạng thái:** đề xuất, chờ PO duyệt · Chưa tạo gì trên Jira · Viết theo `00-chuan-description.md` và mẫu `00b`.

Mã task `T-01` đến `T-62` đánh theo **thứ tự làm** (số nhỏ làm trước, mỗi task chỉ cần các task có số nhỏ hơn). Một số task gộp nhiều việc nhỏ cùng mục đích thành một task. Ngày Sprint: 1 = 04/10–07/10, 2 = 08/10–10/10, 3 = 11/10–14/10, 4 = 15/10–17/10.

---

### T-05 — Luật cờ: mô hình bàn cờ, thế khởi đầu, nước đi của từng loại quân
**Thuộc Epic:** Khởi tạo bàn cờ · **Thành phần:** Game Engine · **Sprint:** 1 (04/10–07/10)
**Phải xong trước:** *Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động (T-01)*: nhận được kho mã có gói TypeScript và công cụ kiểm thử chạy được.
**Loại:** Task triển khai · **Nhãn:** `P1`, `US-BOARD-01` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống · **Ước lượng (giờ):** nhóm điền khi họp Sprint · **Fix version:** v0.1-sprint-1

**Mục tiêu**
Tạo "bộ nhớ" của ván cờ: các loại quân, hai phe, toạ độ ô, và **thế cờ ban đầu** đúng như bàn cờ thật. Đây là nền cho mọi phần khác (sinh nước đi, bàn cờ trên màn hình, máy cờ). Gói này **thuần mã**, không phụ thuộc giao diện hay máy chủ.

Từ một thế cờ, liệt kê **mọi nước "thô"** mà mỗi quân có thể đi theo cách di chuyển riêng của nó (chưa xét việc để Tướng bị chiếu). Task sau sẽ lọc để chỉ còn nước hợp lệ.

**Việc cần làm (làm lần lượt)**
1. Định nghĩa 7 loại quân (Tướng, Sĩ, Tượng, Mã, Xe, Pháo, Tốt), 2 phe và toạ độ theo quy ước ở đầu file. Phe nhìn bàn theo hướng nào là việc của giao diện, **không** nằm trong dữ liệu thế cờ.
2. Viết hàm **tạo thế khởi đầu** theo bảng vị trí quân chuẩn; Đỏ đi trước.
3. Viết cách đọc, sao chép thế cờ để sửa bản sao không làm hỏng bản gốc.
4. Làm sẵn một thế khởi đầu chuẩn để các bài thử sau dùng chung.
5. Làm riêng từng loại quân: Tướng và Sĩ **trong cung**; Tượng đi chéo hai ô, **không qua sông**, **bị chặn "mắt tượng"**; Mã đi hình chữ nhật **bị chặn chân**; Xe đi thẳng, không nhảy quân; Pháo đi như Xe nhưng **ăn quân phải nhảy qua đúng một quân (ngòi)**; Tốt tiến một ô, **sau khi qua sông được đi ngang**, không bao giờ lùi.
6. Không đi vào ô có quân cùng phe; ăn quân đối phương ở ô đích.
7. Làm bài thử cho cả hai phe, kiểm thế đầu vào không bị sửa.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Tạo thế khởi đầu | Đúng 32 quân đúng ô, đúng phe, Đỏ đi trước |
| Đọc hay ghi ô ngoài bàn (x ngoài 0–8, y ngoài 0–9) | Không đọc/ghi được, không tạo quân sai |
| Đổi hướng nhìn của bàn (chỉ hiển thị) | Toạ độ trong dữ liệu không đổi |
| Sửa một bản sao thế cờ | Bản gốc và các bản khác không đổi |
| Mã bị chặn chân; Tượng bị chặn mắt hoặc muốn qua sông | Không có nước đó |
| Pháo không có ngòi / đúng một ngòi / nhiều ngòi | Không ăn / ăn được / không ăn; nước thường không nhảy quân |
| Tướng hoặc Sĩ đang đứng sát mép cung | Không đi ra ngoài cung |
| Tốt trước và sau khi qua sông; Xe bị quân chắn | Tốt không lùi, qua sông mới đi ngang; Xe không nhảy qua |

**Cách tự kiểm tra**
Chuẩn bị: bảng vị trí quân ban đầu (viết bằng chuỗi chuẩn của cờ tướng) làm đáp án.

| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | So từng ô của thế khởi đầu với đáp án | Đúng quân, ô, phe, lượt Đỏ |
| 2 | Đọc/ghi ô ngoài bàn | Bị từ chối |
| 3 | Đổi hướng nhìn rồi đọc dữ liệu | Toạ độ gốc giữ nguyên |
| 4 | Sửa một bản sao | Bản khác không đổi |
| 5 | Đặt quân chặn chân Mã, chặn mắt Tượng | Không có nước bị chặn |
| 6 | Pháo với 0, 1, nhiều ngòi | Chỉ ăn qua đúng một ngòi |
| 7 | Tướng và Sĩ sát mép cung | Không ra khỏi cung |
| 8 | Tốt hai phe trước/sau sông; Xe bị chắn | Đúng hướng; không nhảy quân |
| 9 | Chạy cả hai phe | Không đi vào ô quân mình; thế gốc không đổi |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý. Tập nước này **chưa** là "nước hợp lệ" vì chưa lọc việc để Tướng bị chiếu.
**Bàn giao cho task sau:** mô hình thế cờ, hàm tạo thế khởi đầu cho sinh nước đi, bàn cờ trên màn hình, bắt đầu ván; bộ sinh nước thô cho lọc hợp lệ, chiếu, máy cờ.
**Không thuộc task này:** luật kết thúc; giao diện; xuất ván cờ; tự chiếu, chiếu hết, lượt đi và mạng (làm ở task luật hợp lệ).
**Phục vụ (nguồn):** Story 13; tiêu chí AC-BOARD-01-01, AC-BOARD-01-02. Thuộc Epic: Khởi tạo bàn cờ.
**Kết quả (đầu ra):** Gói luật cờ: kiểu quân, toạ độ, thế khởi đầu, nước đi từng loại quân, độc lập với giao diện.
**Bằng chứng nộp:** Kết quả bộ thử từng quân; thế khởi đầu đối chiếu. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Không có.
**Liên kết Jira (khi được phép tạo):** bị chặn bởi (is blocked by) T-01; liên quan tới (relates to) Story 13; Epic: Khởi tạo bàn cờ.

---

### T-09 — Luật cờ: nước hợp lệ, chiếu, chiếu hết, hết nước, lặp thế, 120 nửa nước
**Thuộc Epic:** Khởi tạo bàn cờ · **Thành phần:** Game Engine · **Sprint:** 1 (04/10–07/10)
**Phải xong trước:** *Luật cờ: mô hình bàn cờ, thế khởi đầu, nước đi của từng loại quân (T-05)*: nhận được bộ sinh nước thô cho bảy loại quân, đúng chặn đường và ô đích.
**Loại:** Task triển khai · **Nhãn:** `P1`, `US-PLAY-01`, `US-PLAY-03`, `US-PLAY-08` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống · **Ước lượng (giờ):** nhóm điền khi họp Sprint · **Fix version:** v0.1-sprint-1

**Mục tiêu**
Lọc nước thô thành **nước hợp lệ**, nhận biết **chiếu**, **chiếu hết**, **hết nước đi**. Máy chủ và máy cờ dùng chung kết quả này, không mỗi nơi tự làm một kiểu.

Thêm các luật kết thúc ván khác ngoài chiếu hết: **lặp thế**, **chiếu liên tục**, **120 nửa nước không ăn quân**. Cho ra một hàm duy nhất, sau mỗi nước, báo ván tiếp tục hay kết thúc và vì lý do gì.

**Việc cần làm (làm lần lượt)**
1. Với mỗi nước thô, **thử đi trên bản sao** rồi kiểm tra: Tướng mình có bị ăn không? Hai Tướng có **đối mặt trực tiếp** (cùng cột, không quân chắn) không? Nếu có, loại nước đó.
2. Viết hàm **nhận biết chiếu** (Tướng đang bị tấn công, tính cả chặn chân, ngòi).
3. Viết hàm xác định bên sắp đi **còn nước hay không**: bị chiếu mà không còn nước = **chiếu hết**; không bị chiếu mà không còn nước = **hết nước**. Cả hai đều **thua**.
4. Làm bài thử các thế: tự chiếu, lộ mặt Tướng, thoát chiếu bằng cách chắn, ăn quân chiếu hoặc di chuyển Tướng.
5. Ghi **khoá thế cờ** = vị trí các quân + bên sắp đi (cùng vị trí nhưng khác bên sắp đi là hai thế khác nhau).
6. Đếm số lần mỗi thế xuất hiện; khi **lặp lần thứ ba**, xét xem từ lần đầu đến lần ba **bên nào chiếu** ở mọi nước của mình: một bên chiếu liên tục → bên đó **thua** (chiếu liên tục); cả hai bên hoặc không bên nào chiếu liên tục → **hoà** (lặp thế).
7. Đếm số nửa nước liên tiếp không ăn quân; đến **120** thì hoà; mỗi lần ăn quân đưa bộ đếm về 0.
8. Thứ tự xét: **chiếu hết/hết nước** trước, rồi chiếu liên tục, lặp thế hoà, cuối cùng 120 nửa nước.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Di chuyển quân đang chắn giữa hai Tướng | Nước bị loại; thế gốc không đổi |
| Đi nước để Tướng mình bị ăn | Không nằm trong tập hợp lệ |
| Bị chiếu và không còn nước; không bị chiếu mà hết nước | "Chiếu hết" và "hết nước", bên sắp đi **thua** cả hai |
| Thoát chiếu bằng chắn, ăn quân chiếu, hoặc di chuyển Tướng | Nhận đúng nước thoát; Mã hay Pháo bị chặn thì không báo chiếu giả |
| Thế cờ lặp lại thành vòng: chỉ một bên liên tục chiếu / cả hai bên cùng liên tục chiếu / không bên nào chiếu | Bên liên tục chiếu bị xử thua / hoà / hoà |
| 119 và 120 nửa nước không ăn; có ăn quân giữa chừng | 119: chưa hoà; 120: hoà (nếu chưa có kết quả ưu tiên hơn); ăn quân đưa về 0 |
| Nước chiếu hết trùng với điều kiện hoà | Tính là chiếu hết, không hoà |
| Hai thế có quân đứng giống hệt nhau nhưng lượt đi khác bên | Không tính là cùng một thế khi đếm lặp |

**Cách tự kiểm tra**
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Thử nước quân chắn giữa hai Tướng | Bị loại, thế gốc giữ nguyên |
| 2 | Thử nước để Tướng mình bị ăn | Không có trong tập hợp lệ |
| 3 | Thế chiếu hết; thế hết nước nhưng không chiếu | Hai kết quả, bên sắp đi thua |
| 4 | Các thế thoát chiếu | Đúng nước thoát; không báo chiếu giả |
| 5 | Chạy ba loại chu kỳ chiếu | Một bên liên tục: thua; hai bên hoặc không bên: hoà |
| 6 | Kiểm các mốc 119 và 120, và ăn quân giữa chừng | Đúng như bảng trên |
| 7 | Nước chiếu hết đồng thời chạm điều kiện hoà | Chiếu hết |
| 8 | Hai thế cùng vị trí khác bên sắp đi | Không gộp |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý. Độ đúng của toàn bộ bộ sinh nước được kiểm tiếp bằng nguồn độc lập ở thử nghiệm đếm nước (T-46).
**Bàn giao cho task sau:** hàm nước hợp lệ, chiếu, chiếu hết, hết nước cho lặp thế, ký hiệu nước, bàn cờ, máy cờ, xử lý nước đi ở máy chủ; hàm phân xử kết thúc ván cho máy chủ, máy cờ và bộ kiểm thử luật.
**Không thuộc task này:** đồng hồ; đầu hàng, xin hoà, đi lại; các luật "đuổi quân" riêng; kiểm tra mạng.
**Phục vụ (nguồn):** Story 14, 15, 17; tiêu chí AC-PLAY-01-02, AC-PLAY-03-01, AC-PLAY-08-01, AC-PLAY-08-02. Thuộc Epic: Khởi tạo bàn cờ.
**Kết quả (đầu ra):** Nước hợp lệ, chiếu, chiếu hết, hết nước, hai Tướng đối mặt, lặp thế, chiếu liên tục, 120 nửa nước.
**Bằng chứng nộp:** Kết quả bộ thế; bảng thứ tự ưu tiên. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Độ đúng toàn bộ kiểm tiếp ở bài đếm nước độc lập.
**Liên kết Jira (khi được phép tạo):** bị chặn bởi (is blocked by) T-05; liên quan tới (relates to) Story 14, Story 15, Story 17; Epic: Khởi tạo bàn cờ.

---

### T-11 — Giao diện: bàn cờ SVG, quân chữ Hán, lật bàn cho phe Đen
**Thuộc Epic:** Khởi tạo bàn cờ · **Thành phần:** Frontend · **Sprint:** 1 (04/10–07/10)
**Phải xong trước:** *Luật cờ: mô hình bàn cờ, thế khởi đầu, nước đi của từng loại quân (T-05)*: nhận được thế khởi đầu, toạ độ và quân. *Dựng khung ứng dụng web và các khối giao diện nền (nút, hộp thoại, thông báo) (T-08)*: nhận được trang chạy được, nối được gói dùng chung; nhận được màu và kiểu theme "Kỳ Đài Cổ Phong" và các khối giao diện có đủ 5 trạng thái.
**Loại:** Task triển khai · **Nhãn:** `P1`, `US-BOARD-01` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống · **Ước lượng (giờ):** nhóm điền khi họp Sprint · **Fix version:** v0.1-sprint-1

**Mục tiêu**
Vẽ **bàn cờ 9 cột × 10 hàng bằng SVG** cùng các quân chữ Hán, **đúng cho cả người cầm Đỏ và Đen**. Thành phần này chỉ **nhận thế cờ để hiển thị**, không tự quyết nước đi hay kết quả.

**Việc cần làm (làm lần lượt)**
1. Vẽ lưới, cung, sông; quân đặt **trên giao điểm** của các đường (không đặt giữa ô); co giãn theo màn hình.
2. Quân dùng **chữ Hán** truyền thống, phe phân biệt không chỉ bằng màu (ví dụ thêm hình viền hoặc chữ khác).
3. **Lật bàn** cho người cầm Đen, nhưng chữ trên quân vẫn thẳng; dữ liệu gốc không đổi.
4. Mỗi quân có **nhãn cho trình đọc màn hình**: tên quân, phe, cột và hàng theo toạ độ gốc.
5. Có đủ 5 trạng thái: đang tải, lỗi, chưa có nước, chỉ đọc, bị khoá (có lý do). Phông chữ Hán tự đặt trong ứng dụng, kiểm quyền sử dụng.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Mở thế khởi đầu | Đúng quân chữ Hán, đúng giao điểm |
| Chuyển Đỏ/Đen | Bàn lật, dữ liệu gốc giữ nguyên |
| Đọc nhãn quân khi bàn lật | Tên quân, phe, cột, hàng gốc đúng |
| Năm trạng thái | Không trắng khi chưa có nước; lỗi và bị khoá có lý do |

**Cách tự kiểm tra**
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Mở thế khởi đầu, đối chiếu từng quân | Đúng quân, chữ Hán, vị trí |
| 2 | Chuyển giữa Đỏ và Đen | Bàn lật, dữ liệu gốc không đổi |
| 3 | Dùng trình đọc màn hình ở bàn lật | Nhãn theo toạ độ gốc |
| 4 | Kích hoạt từng trạng thái | Đủ 5, có lý do khi lỗi hoặc khoá |
| 5 | Thử các độ rộng 360, 390, 1366, 1920 px | Không méo, không cuộn ngang |

**Khi nào chuyển cho người kiểm thử:** cả 5 dòng đạt, kèm ảnh.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý.
**Bàn giao cho task sau:** bàn cờ hiển thị được cho chọn quân, kéo thả, ván online, ván với máy.
**Không thuộc task này:** bấm hay kéo quân, nối mạng, giao diện sáng, chữ Latin hoặc chữ Việt trên quân.
**Phục vụ (nguồn):** Story 13; tiêu chí AC-BOARD-01-01, AC-BOARD-01-02, AC-BOARD-01-03. Thuộc Epic: Khởi tạo bàn cờ.
**Kết quả (đầu ra):** Bàn cờ SVG: lưới, cung, sông, quân chữ Hán, lật bàn cho Đen, nhãn trình đọc màn hình, 5 trạng thái.
**Bằng chứng nộp:** Ảnh chụp bốn cỡ; kiểm nhãn. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Phông chữ Hán.
**Liên kết Jira (khi được phép tạo):** bị chặn bởi (is blocked by) T-05, T-08; liên quan tới (relates to) Story 13; Epic: Khởi tạo bàn cờ.

---

### T-18 — Giao diện: bấm chọn quân và chấm gợi ý ô đi
**Thuộc Epic:** Khởi tạo bàn cờ · **Thành phần:** Frontend · **Sprint:** 2 (08/10–10/10)
**Phải xong trước:** *Luật cờ: nước hợp lệ, chiếu, chiếu hết, hết nước, lặp thế, 120 nửa nước (T-09)*: nhận được hàm liệt kê nước hợp lệ. *Giao diện: bàn cờ SVG, quân chữ Hán, lật bàn cho phe Đen (T-11)*: nhận được bàn vẽ được, ánh xạ giữa toạ độ gốc và hướng nhìn.
**Loại:** Task triển khai · **Nhãn:** `P1`, `US-BOARD-01`, `US-BOARD-02` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống · **Ước lượng (giờ):** nhóm điền khi họp Sprint · **Fix version:** v0.2-sprint-2

**Mục tiêu**
Người có quyền đi **bấm hoặc chạm vào quân của mình** thì thấy **các ô có thể đi**, bấm ô đích để đi. Thành phần chỉ **gửi ý định** đi nước; **không coi là xong** cho tới khi máy chủ xác nhận.

**Việc cần làm (làm lần lượt)**
1. Bấm quân mình đang được đi → quân được khoanh; các ô đi hợp lệ hiện **chấm**; ô có quân đối phương ăn được hiện **vòng**.
2. Bấm ô đích → phát ý định đi theo **toạ độ gốc** (kể cả khi bàn đang lật).
3. Bấm lại quân, bấm ô sai hoặc nhấn **Esc** → huỷ chọn.
4. **Không cho chọn** quân đối phương, khi chưa đến lượt, khi là người xem, hoặc khi ván đã kết thúc; chỉ đọc có giải thích.
5. Khi nhận thế cờ mới thì bỏ lựa chọn cũ. Dùng được bằng chuột, chạm và bàn phím.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Chọn quân bị chặn, bị "ghim" (đi sẽ lộ Tướng) | Chỉ hiện ô hợp lệ; vòng ăn cố định |
| Bấm đích, sau đó bấm lại / Esc / ô sai | Gửi đúng ý định hoặc huỷ, không nước ngoài tập hợp lệ |
| Quân đối phương, ngoài lượt, người xem, ván đã kết thúc | Không chọn, không gửi, có lý do |
| Đang cầm Đen và nhận thế mới | Toạ độ gốc đúng; không giữ lựa chọn sai quyền |

**Cách tự kiểm tra**
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Chọn quân bị chặn hoặc bị ghim | Chỉ ô hợp lệ, vòng ăn cố định |
| 2 | Bấm đích; thử bấm lại, Esc, ô sai | Gửi đúng hoặc huỷ |
| 3 | Thử quân đối phương, ngoài lượt, người xem, ván kết thúc | Không chọn; có lý do |
| 4 | Cầm Đen, nhận thế mới | Toạ độ gốc đúng, bỏ chọn cũ |

**Khi nào chuyển cho người kiểm thử:** cả 4 dòng đạt.
**Khi nào task xong:** người kiểm thử và người xem lại đồng ý. Chưa nối máy chủ nên chưa là nước đi thật.
**Bàn giao cho task sau:** chọn quân và ý định đi nước cho kéo thả, hiệu ứng và ván online.
**Không thuộc task này:** kéo thả, gợi ý nước hay, nối mạng.
**Phục vụ (nguồn):** Story 13, 14; tiêu chí AC-BOARD-01-02, AC-BOARD-02-01, AC-BOARD-02-02, AC-BOARD-02-03. Thuộc Epic: Khởi tạo bàn cờ.
**Kết quả (đầu ra):** Chọn quân và chấm gợi ý bằng bấm; huỷ chọn; quyền theo lượt.
**Bằng chứng nộp:** Kết quả thử bàn phím và chạm. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Chưa gửi nước thật.
**Liên kết Jira (khi được phép tạo):** bị chặn bởi (is blocked by) T-09, T-11; liên quan tới (relates to) Story 13, Story 14; Epic: Khởi tạo bàn cờ.

---

### T-22 — Giao diện: kéo thả quân, đánh dấu nước vừa đi, cảnh báo chiếu, âm thanh
**Thuộc Epic:** Khởi tạo bàn cờ · **Thành phần:** Frontend · **Sprint:** 2 (08/10–10/10)
**Phải xong trước:** *Giao diện: bấm chọn quân và chấm gợi ý ô đi (T-18)*: nhận được bàn cờ có trạng thái chọn và nhận được dữ liệu thế cờ và lượt.
**Loại:** Task triển khai · **Nhãn:** `P1`, `US-BOARD-03`, `US-BOARD-04`, `US-BOARD-05` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống · **Ước lượng (giờ):** nhóm điền khi họp Sprint · **Fix version:** v0.2-sprint-2

**Mục tiêu**
Thêm cách đi bằng **kéo thả** song song với bấm. Kéo thả cho **cùng kết quả** như bấm; thả sai thì quân **trượt về chỗ cũ**, không đổi thế cờ.

Cho người chơi **thấy** nước vừa đi, **biết** khi bị chiếu và **nghe** âm thanh đúng sự kiện. Các dấu hiệu này chỉ để dễ đọc ván, **không** quyết định kết quả và không che nút bấm.

**Việc cần làm (làm lần lượt)**
1. Dùng chung kiểm tra quyền và danh sách ô đích với cách bấm.
2. Đổi điểm thả trên màn hình thành toạ độ bàn cờ **có tính hướng nhìn và kích thước bàn**.
3. Thả vào ô hợp lệ → phát ý định; thả sai, ngoài bàn, hoặc mất con trỏ → quân trượt về chỗ cũ.
4. Nếu giữa lúc kéo mà mất lượt hoặc mất quyền → **huỷ kéo**, không gửi gì.
5. Tôn trọng cài đặt "giảm chuyển động": quân về ngay, không hiệu ứng.
6. **Đánh dấu nước vừa đi:** bốn góc ở cả ô đi và ô đến, theo nước đã được máy chủ xác nhận.
7. **Cảnh báo chiếu:** viền, chữ hoặc biểu tượng nổi bật, **không nhấp nháy, không rung**, và **không chỉ dùng màu**.
8. **Âm thanh:** bốn âm (đi, ăn, chiếu, kết thúc) tạo bằng Web Audio, không tải tệp âm thanh ngoài.
9. **Nút tắt tiếng**: có nhãn, **nhớ trạng thái trong phiên**; nếu trình duyệt chưa cho phát âm thì xử lý êm, không lỗi.
10. Nhận cùng một thế cờ hai lần thì **không phát lại âm** và không chồng hiệu ứng cũ.
11. Tôn trọng "giảm chuyển động".

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Kéo vào ô hợp lệ / ô sai / ngoài bàn | Phát ý định / về chỗ cũ / về chỗ cũ, không tác động |
| Đi cùng một nước bằng bấm và bằng kéo, ở hai hướng bàn | Cùng toạ độ gốc, cùng kết quả |
| Đang kéo thì mất lượt hoặc quyền | Huỷ kéo, không gửi nước trái quyền |
| Bật "giảm chuyển động" rồi thả sai | Quân về ngay, không hiệu ứng lặp |
| Nhận nước vừa đi mới, rồi nhận lại cùng thế | Đánh dấu đúng ô đi và đến; không chồng hiệu ứng |
| Vào và ra thế chiếu, bật giảm chuyển động | Cảnh báo rõ, không nhấp nháy hay rung |
| Có sự kiện đi, ăn, chiếu, kết thúc | Đúng bốn âm, không có yêu cầu tải tệp |
| Tắt tiếng; đổi trạng thái trong phiên; trình duyệt khoá phát tự động | Tắt tiếng giữ nguyên; ván không lỗi nếu không phát được |

**Cách tự kiểm tra**
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Kéo vào ô hợp lệ, ô sai, ngoài bàn | Phát / về chỗ cũ |
| 2 | Đi cùng nước bằng bấm và bằng kéo, ở bàn Đỏ và bàn lật | Cùng kết quả |
| 3 | Bắt đầu kéo rồi giả lập mất lượt | Huỷ, không gửi |
| 4 | Bật giảm chuyển động, thả sai | Về ngay |
| 5 | Thử bằng chuột và bằng cảm ứng trên điện thoại | Đạt cả hai |
| 6 | Nhận nước mới rồi nhận lại cùng thế | Đánh dấu đúng; không chồng |
| 7 | Vào/ra thế chiếu; bật giảm chuyển động | Cảnh báo rõ, không nhấp nháy |
| 8 | Phát bốn sự kiện | Đúng bốn âm; không tải tệp âm thanh |
| 9 | Tắt tiếng rồi đổi trạng thái; chặn phát tự động | Tắt tiếng giữ; không lỗi |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt; kèm nghe thử thủ công.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý.
**Bàn giao cho task sau:** kéo thả cho giao diện ván và giao diện ván với máy; hiệu ứng và âm thanh cho giao diện ván và ván với máy.
**Không thuộc task này:** bỏ cách bấm; nối mạng; nhạc nền; tệp âm thanh tải ngoài; gợi ý nước hay.
**Phục vụ (nguồn):** Story 14; tiêu chí AC-BOARD-03-01, AC-BOARD-03-02, AC-BOARD-04-01, AC-BOARD-04-02, AC-BOARD-04-03, AC-BOARD-05-01, AC-BOARD-05-02. Thuộc Epic: Khởi tạo bàn cờ.
**Kết quả (đầu ra):** Kéo thả, dấu nước vừa đi, cảnh báo chiếu, 4 âm Web Audio, nút tắt tiếng.
**Bằng chứng nộp:** Kết quả thử; nghe thử thủ công; giảm chuyển động. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Trình duyệt có thể chặn phát âm tự động.
**Liên kết Jira (khi được phép tạo):** bị chặn bởi (is blocked by) T-18; liên quan tới (relates to) Story 14; Epic: Khởi tạo bàn cờ.

---

### T-46 — Kiểm thử luật cờ: đếm nước đi độc lập và bộ kiểm thử chạy tự động
**Thuộc Epic:** Khởi tạo bàn cờ · **Thành phần:** Game Engine, QA & DevOps · **Sprint:** 3 (11/10–14/10)
**Phải xong trước:** *Dựng kho mã chung, các lệnh cài đặt, kiểm tra và kiểm tra tự động (T-01)*: nhận được hệ thống chạy kiểm thử và báo đỏ khi sai. *Luật cờ: nước hợp lệ, chiếu, chiếu hết, hết nước, lặp thế, 120 nửa nước (T-09)*: nhận được hàm liệt kê nước hợp lệ cho thế cờ chuẩn; nhận được bộ luật P1 đầy đủ. *Bảng nước đi: ký hiệu tiếng Việt và hiển thị (T-42)*: nhận được hàm ký hiệu.
**Loại:** Task QA · **Nhãn:** `P1`, `QA`, `gate`, `US-PLAY-03`, `US-PLAY-08` · **Trạng thái ban đầu:** To Do · **Người nhận:** để trống · **Ước lượng (giờ):** nhóm điền khi họp Sprint · **Fix version:** v0.3-sprint-3

**Mục tiêu**
Phát hiện sớm nếu bộ luật cờ **đếm sai số nước đi**. Cách làm: đếm số nước đi có thể xảy ra từ thế khởi đầu ở các độ sâu 1, 2, 3, 4 (gọi là "perft"), rồi so với kết quả của **một công cụ độc lập**, không phải chính mã của chúng ta. Nếu tự lấy kết quả từ mã đang kiểm thì lỗi sẽ tự "xác nhận" chính nó.

Gom toàn bộ kiểm thử luật cờ thành một bộ chạy **tự động mỗi khi mã thay đổi**, để nếu ai sửa luật sai thì biết ngay. Kết quả kiểm luật phải **tách bạch** với chuyện máy cờ mạnh hay mạng chạy tốt.

**Việc cần làm (làm lần lượt)**
1. Chọn **một nguồn tham chiếu độc lập** (một bộ sinh nước đi do bên ngoài viết), ghi tên, phiên bản và quyền sử dụng.
2. Đặt cùng thế khởi đầu và cùng quy ước đếm cho cả hai bên.
3. Đếm ở độ sâu 1 đến 4. Số tham chiếu cần đối chiếu: **44, 1.920, 79.666, 3.290.240**; ghi số thật của hai bên.
4. Nếu có chênh lệch: tìm **nước đầu tiên** làm hai bên khác nhau; kết luận lỗi nằm ở nguồn tham chiếu, ở mã của chúng ta hay chưa rõ.
5. Viết báo cáo, ghi rõ nếu chưa có nguồn độc lập đáng tin thì kết luận là **chưa kết luận**.
6. Gom các thế mẫu và ca biên đã viết ở các task luật, ghi rõ lấy đáp án từ đâu.
7. Nối nguồn đối chiếu độc lập (thử nghiệm đếm nước đi nói ở trên) vào bài **đếm nước đi**: từ thế khởi đầu, số nước ở độ sâu 1, 2, 3, 4 phải là **44, 1.920, 79.666, 3.290.240**.
8. Thêm bài thử ký hiệu ở cả hai phe (kiểm tính duy nhất).
9. Chạy **1.000 ván ngẫu nhiên** (hạt giống cố định) kiểm không có nước nào vi phạm luật, lưu số liệu thật.
10. Đưa toàn bộ vào kiểm tra tự động (T-01); **cố tình làm sai một đáp án** để chắc hệ thống báo đỏ.

**Các trường hợp lỗi và kết quả mong đợi**
| Tình huống | Kết quả mong đợi |
|---|---|
| Dùng thế khác hoặc bên đi khác | Nhận ra là đầu vào khác, **không** so sánh như cùng nguồn |
| Cố ý làm một lỗi cản chân trong bản thử | Phát hiện ra chênh lệch; **không** sửa số mong đợi cho khớp |
| Nguồn tham chiếu chưa kiểm chứng được | Ghi "chưa kết luận" |
| Đếm nước độ sâu 1 đến 4 | Khớp nguồn đối chiếu; không sửa đáp án chỉ để cho đạt |
| Bên đến lượt bị chiếu hết, hoặc hết nước đi hợp lệ | Cả hai trường hợp bên đó đều thua |
| Lặp thế, mốc 119/120, ăn quân | Đúng như quy tắc |
| 1.000 ván ngẫu nhiên | Không nước vi phạm; số liệu thật được lưu |
| Ký hiệu cả hai phe; cố tình làm sai | Ký hiệu khớp; làm sai thì kiểm tra tự động **đỏ** |

**Cách tự kiểm tra**
| # | Việc làm | Phải thấy |
|---|---|---|
| 1 | Chạy độ sâu 1 đến 4 trên cả hai bên | Có 4 cặp số, đối chiếu với 44, 1.920, 79.666, 3.290.240 |
| 2 | Dùng thế hoặc bên đi khác | Báo "khác đầu vào" |
| 3 | Cho lỗi cản chân vào bản thử | Báo chênh lệch tại nước cụ thể |
| 4 | Xem báo cáo | Có tên, phiên bản nguồn tham chiếu và cách chạy lại |
| 5 | Chạy đếm nước độ sâu 1–4 | 44, 1.920, 79.666, 3.290.240, khớp nguồn đối chiếu |
| 6 | Chạy thế chiếu hết, hết nước, lặp, biên 119/120 | Đúng quy tắc |
| 7 | Chạy 1.000 ván ngẫu nhiên | Không vi phạm; có số liệu |
| 8 | Chạy ký hiệu trong kiểm tra tự động; cố làm sai một đáp án | Đạt; rồi đỏ khi sai |

**Khi nào chuyển cho người kiểm thử:** tất cả các dòng ở bảng tự kiểm tra đều đạt; báo cáo đủ, chạy lại được.
**Khi nào task xong:** người kiểm thử và người xem lại mã đồng ý. Báo cáo hoàn tất. "Cổng kiểm chứng luật cờ đạt" chỉ khi nguồn độc lập đã xác minh **và** số liệu đối chiếu đạt. Nếu nguồn đối chiếu chưa được xác minh thì **không** được ghi đạt. Ghi "chưa chạy".
**Bàn giao cho task sau:** bộ số đã xác minh để đưa vào bộ kiểm tra luật cờ; bộ kiểm thử luật cho đo máy cờ đầy đủ và nghiệm thu cuối.
**Không thuộc task này:** đo sức mạnh máy cờ; biến công cụ ngoài thành máy cờ của sản phẩm; kiểm thử giao diện; đi lại; các luật giai đoạn sau.
**Phục vụ (nguồn):** Story 13, 17; tiêu chí AC-PLAY-03-01, AC-PLAY-08-01, AC-PLAY-08-02; GATE-PERFT. Thuộc Epic: Khởi tạo bàn cờ.
**Kết quả (đầu ra):** Bộ kiểm thử luật chạy tự động: đếm nước đi độc lập (44, 1.920, 79.666, 3.290.240), thế mẫu, 1.000 ván ngẫu nhiên, ký hiệu; báo cáo GATE-PERFT.
**Bằng chứng nộp:** Báo cáo so với nguồn đối chiếu; số liệu 1.000 ván; lần chạy tự động. Trạng thái ban đầu NOT_RUN; khi chạy ghi bản dựng và môi trường, che bí mật (mật khẩu, mã OTP, chìa khoá).
**Rủi ro / chưa rõ:** Nếu nguồn đối chiếu chưa xác minh thì không ghi đạt.
**Liên kết Jira (khi được phép tạo):** bị chặn bởi (is blocked by) T-01, T-09, T-42; liên quan tới (relates to) Story 13, Story 17; Epic: Khởi tạo bàn cờ.
