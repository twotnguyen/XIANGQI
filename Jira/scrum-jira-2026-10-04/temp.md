**Không nên bắt đầu bằng việc tạo hàng loạt ticket.** Trước hết phải có một kế hoạch trả lời được: **làm gì, vì sao, ai làm, theo thứ tự nào, mất bao nhiêu công sức, và dựa vào đâu để nghiệm thu**. Jira dùng để tổ chức và theo dõi kế hoạch đó.

Tôi dùng nguyên tắc của skill **writing-plans** để trình bày quy trình dưới đây; đây là **quy trình đề xuất**, không phải những yêu cầu hiện đã được Jira của bạn bắt buộc.

## 1. Những đầu vào cần có trước khi lập kế hoạch

| Đầu vào | Cần xác định |
|---|---|
| **Mục tiêu dự án** | Vấn đề cần giải quyết, người sử dụng, kết quả mong muốn |
| **Phạm vi** | Những gì phải làm; những gì không làm trong đợt này |
| **Yêu cầu chức năng** | Các hành vi, luồng sử dụng và quy tắc nghiệp vụ |
| **Yêu cầu phi chức năng** | Bảo mật, hiệu năng, khả dụng, khả năng truy cập, vận hành… với tiêu chí đo được |
| **Hiện trạng** | Đã có gì, còn thiếu gì, phần nào cần sửa hoặc tích hợp |
| **Ràng buộc** | Deadline, ngân sách, công nghệ, dịch vụ được phép dùng, giới hạn đề bài |
| **Nguồn lực** | Thành viên, vai trò, năng lực và thời gian thực sự có thể dành cho dự án |
| **Điều kiện nghiệm thu** | Ai chấp nhận kết quả; cần bản chạy, tài liệu, test hay bằng chứng nào |

**Thông tin chưa rõ phải được ghi thành giả định, câu hỏi hoặc rủi ro**, không âm thầm coi là đã xác nhận. Nếu chưa thể quyết định giải pháp, có thể lập một Task nghiên cứu với **câu hỏi cần trả lời và đầu ra cụ thể**.

## 2. Quy trình đưa kế hoạch triển khai lên Jira

### Bước 1 — Chốt tài liệu yêu cầu và phạm vi

Có một tài liệu gốc được quản lý phiên bản, chẳng hạn trong repository hoặc Confluence. Tài liệu này ghi:

- Mục tiêu và phạm vi.
- Yêu cầu đã được thống nhất.
- Ràng buộc và quyết định kỹ thuật quan trọng.
- Tiêu chí nghiệm thu.
- Các điểm còn chưa quyết định.

Gán mã yêu cầu như `R01`, `R02` để truy vết.

**Chọn rõ nguồn chuẩn:** tài liệu gốc hay Jira. Không duy trì hai bản khác nhau mà không có quy tắc đồng bộ.

### Bước 2 — Chia thành các Epic theo kết quả lớn

Mỗi Epic đại diện cho một **nhóm năng lực hoặc kết quả đáng nghiệm thu**, không chỉ là tên công nghệ.

Ví dụ:
- Quản lý tài khoản và quyền truy cập.
- Chơi cờ trực tuyến.
- Triển khai, vận hành và bàn giao.

Mỗi Epic cần có mục tiêu, phạm vi, phụ thuộc và tiêu chí hoàn thành. Tránh tạo một Epic “Toàn bộ dự án” chứa tất cả công việc.

### Bước 3 — Chia Epic thành Story và Task

| Loại | Dùng khi |
|---|---|
| **Story** | Có một nhu cầu hoặc hành vi mang lại giá trị cho người sử dụng |
| **Task** | Có một công việc kỹ thuật, nghiên cứu, vận hành hoặc tài liệu cần hoàn thành |
| **Sub-task** | Cần chia nhỏ công việc nằm trực tiếp dưới một Story hoặc Task |

**Theo phân cấp đã xác minh trên Jira của bạn:**

```text
Epic
├── Story
│   └── Sub-task
└── Task
    └── Sub-task
```

Nếu giữ cách tổ chức hiện có của `XW`:
- Story và Task có **Parent là Epic**.
- Task liên quan đến Story qua **Linked work items**, như `relates to`.
- Không coi Task là con trực tiếp của Story chỉ vì tên Task hoặc Description ghi “thuộc Story”.

### Bước 4 — Làm rõ từng đơn vị công việc

Một ticket phải đủ rõ để người nhận biết:

> **Đầu vào là gì → cần thực hiện gì → bàn giao gì → kiểm chứng bằng cách nào.**

| Loại | Nội dung tối thiểu để triển khai |
|---|---|
| **Epic** | Mục tiêu, phạm vi, công việc liên quan, người chịu trách nhiệm, tiêu chí nghiệm thu tổng thể |
| **Story** | Nhu cầu người dùng, quy tắc nghiệp vụ, Acceptance Criteria, trường hợp lỗi/biên, Epic cha |
| **Task** | Mục tiêu, điều kiện bắt đầu, phạm vi, đầu vào/đầu ra, bước kiểm chứng, bằng chứng bàn giao |

Với Task lập trình, làm rõ **module/file liên quan, giao diện API hoặc dữ liệu, điều kiện lỗi và test cần chạy** ở mức cần thiết. Không cần viết toàn bộ code vào kế hoạch.

**Chia việc theo đầu ra có thể kiểm tra độc lập**, không chia nhỏ chỉ để tăng số lượng ticket.

### Bước 5 — Xác định phụ thuộc và thứ tự thực hiện

Phân biệt:

- **Parent:** quan hệ phân cấp.
- **blocks / is blocked by:** phụ thuộc thực sự.
- **relates to:** liên quan nhưng không nhất thiết chặn nhau.

Ví dụ: triển khai API bị chặn bởi việc chốt hợp đồng API; kiểm thử tích hợp bị chặn bởi bản chạy có thể kiểm thử.

Kế hoạch phải chỉ ra:
- Việc nào làm song song được.
- Việc nào phải hoàn thành trước.
- Việc nào phụ thuộc tài khoản, hạ tầng hoặc bên ngoài.
- Chuỗi công việc có thể làm trễ mốc bàn giao.

Không lập lịch chỉ dựa trên thứ tự tên ticket.

### Bước 6 — Ước lượng, phân công và xếp lịch

Mỗi công việc cần:
- Một người chịu trách nhiệm chính.
- Người review hoặc nghiệm thu khi cần.
- Ước lượng công sức và mức độ bất định.
- Sprint hoặc mốc thực hiện phù hợp.
- Due date nếu có hạn thực sự.

**Không quy đổi Story Points thành giờ một cách máy móc.** Nếu nhóm dùng cả hai, phải có quy ước rõ.

Lịch phải tính cả:
- Phát triển.
- Review.
- Kiểm thử.
- Sửa lỗi và kiểm thử lại.
- Tích hợp, triển khai, tài liệu và bàn giao.

**Không xếp lịch vượt năng lực thực tế của thành viên**, hoặc bỏ qua các phụ thuộc chỉ để khớp deadline.

### Bước 7 — Kiểm tra kế hoạch trước khi tạo hàng loạt ticket

Lập bảng truy vết:

| Yêu cầu | Epic/Story | Task thực hiện | Cách kiểm thử | Bằng chứng |
|---|---|---|---|---|
| `Rxx` | Ticket đáp ứng yêu cầu | Công việc triển khai | Test/ca nghiệm thu | Báo cáo, log, bản chạy… |

Kiểm tra hai chiều:
- Có yêu cầu nào **chưa có công việc đáp ứng** không?
- Có công việc nào **không phục vụ yêu cầu hoặc mục tiêu nào** không?

Đồng thời rà soát việc trùng lặp, thiếu chủ sở hữu, phụ thuộc vòng và mâu thuẫn giữa các ticket.

### Bước 8 — Đưa lên Jira và kiểm tra lại

Thứ tự hợp lý:

1. Chuẩn bị Sprint, Components, Fix versions và quy ước Labels cần sử dụng.
2. Tạo Epic.
3. Tạo Story và Task, gán Parent.
4. Tạo Sub-task nếu cần.
5. Thêm liên kết phụ thuộc.
6. Gán người, ưu tiên, ước lượng và lịch.
7. Mở lại ticket để kiểm tra nội dung, quan hệ và cách hiển thị trên board.

Với Jira của bạn, **người review, người kiểm thử, Acceptance Criteria và yêu cầu bằng chứng có thể ghi trong Description**; không nên giả định chúng đã có trường riêng.

## 3. Các yêu cầu chất lượng của một kế hoạch tốt

Một kế hoạch triển khai cần đáp ứng các yêu cầu sau:

| Yêu cầu | Tiêu chuẩn |
|---|---|
| **Đầy đủ** | Bao phủ chức năng, phi chức năng, kiểm thử, triển khai và bàn giao |
| **Rõ ràng** | Người nhận không phải tự đoán mục tiêu, phạm vi hoặc đầu ra |
| **Kiểm chứng được** | Có tiêu chí đạt/không đạt và cách thu bằng chứng |
| **Nhất quán** | Tên, API, dữ liệu, quy tắc nghiệp vụ và lịch không mâu thuẫn |
| **Khả thi** | Phù hợp nhân lực, thời gian, công nghệ và ngân sách |
| **Có thứ tự** | Phụ thuộc, điều kiện bắt đầu và việc song song được xác định |
| **Có trách nhiệm** | Công việc có người làm và người chấp nhận kết quả |
| **Truy vết được** | Nối được yêu cầu → ticket → kiểm thử → kết quả |
| **Có quản lý rủi ro** | Nhận diện giả định, điểm bất định, phụ thuộc ngoài và phương án xử lý |
| **Cập nhật được** | Thay đổi phạm vi/lịch có lý do và được phản ánh vào kế hoạch |

## 4. Khi nào một ticket được phép bắt đầu và kết thúc?

Nên thống nhất hai cổng kiểm tra:

### Definition of Ready — sẵn sàng để bắt đầu
- Mục tiêu và phạm vi rõ.
- Có tiêu chí hoàn thành.
- Đầu vào và điều kiện bắt đầu đã đủ.
- Có người phụ trách và ước lượng.
- Không còn câu hỏi quan trọng buộc người thực hiện phải đoán.

### Definition of Done — thực sự hoàn thành
- Đạt tiêu chí chấp nhận.
- Đã review và kiểm thử phù hợp.
- Có bằng chứng kết quả.
- Đã tích hợp, cập nhật tài liệu hoặc triển khai theo phạm vi ticket.
- Được người có trách nhiệm chấp nhận.

**Blocked không phải Done.** Thiếu tài nguyên ngoài phải ghi rõ đang bị chặn; không thay bằng kết quả giả lập rồi báo hoàn thành.

Tóm lại, **Jira tạo được ticket chỉ với tiêu đề không có nghĩa kế hoạch đã đủ chất lượng**. Kế hoạch chỉ sẵn sàng triển khai khi mỗi công việc có **đầu ra rõ, điều kiện bắt đầu, người chịu trách nhiệm và cách nghiệm thu**, đồng thời toàn bộ công việc khớp với phạm vi và nguồn lực dự án.

Tôi sẽ đối chiếu bình luận với cấu hình Jira đã kiểm tra, tập trung vào các chỗ dễ gây nhầm: phân cấp ticket, trường bắt buộc, cách chia Story, ước lượng và lập Sprint.**Bình luận này đúng về tư duy tổ chức công việc, nhưng chưa đủ chính xác để dùng nguyên văn làm tiêu chuẩn lập kế hoạch cho nhóm bạn.** Nó trộn lẫn **khái niệm quản lý dự án, quy ước của nhóm và các trường thực tế trong Jira**, đồng thời có một số ví dụ tự mâu thuẫn.

Tôi đã đối chiếu với giao diện Jira đã kiểm tra, đọc [Scrum Guide](https://scrumguides.org/scrum-guide.html), và kiểm tra thêm các loại liên kết đang có trên site của bạn.

## 1. Những điểm đúng và đáng giữ

- **Không biến Jira thành danh sách tính năng:** công việc phải giao được, ước lượng được và nghiệm thu được.
- Epic có **mục tiêu, phạm vi và tiêu chí hoàn thành**.
- Story cần làm rõ **nhu cầu và giá trị**, thay vì chỉ ghi tên chức năng.
- Acceptance Criteria phải **cụ thể, kiểm thử được**.
- Xác định phụ thuộc trước khi lập lịch.
- Story Points **không phải số giờ**.
- Có DoR và DoD để tránh “chưa rõ đã làm” hoặc “code xong đã báo Done”.
- INVEST là bộ câu hỏi hữu ích khi rà soát Story.

Đây là nền tảng tốt. Vấn đề chủ yếu nằm ở cách diễn đạt thành “quy trình chuẩn” và cách áp dụng ví dụ.

## 2. Những chỗ cần sửa trước khi áp dụng

### A. Phân cấp Story → Task bị diễn đạt sai

Mở đầu ghi đúng:

```text
Project → Epic → Story / Task → Sub-task
```

Nhưng mục 5 dùng `TASK/STD-211` dưới Story, và mục 13 lại ghi:

```text
Epic → Story → Task
```

Cách viết này khiến người đọc tưởng **Task thông thường nằm dưới Story**.

**Với Jira của bạn, cần viết rõ:**

```text
Epic
├── Story
│   └── Sub-task
└── Task
    └── Sub-task
```

Nếu các công việc FE, BE, QA nằm trực tiếp dưới Story, chúng phải là **Sub-task**. Nếu giữ chúng là **Task**, hãy gán Epic cha và liên kết với Story — như cách `XW` hiện đang sử dụng.

Tên hay tiền tố ticket không quyết định loại và phân cấp.

### B. “Field” đang bị dùng để chỉ cả trường Jira lẫn mục trong Description

Các mục như:

- Business Goal
- In Scope / Out of Scope
- User Story
- Preconditions
- Acceptance Criteria
- Business Rules

là **thành phần nội dung nên có**, không mặc nhiên là trường riêng trên Jira.

Trên form `XIAN` đã kiểm tra:
- Có **Summary, Description, Parent, Priority…**
- Không thấy trường riêng **Business Goal, Acceptance Criteria, Epic Name**.
- Liên kết Epic trên UI hiện dùng **Parent**, không phải nhãn **Epic Link**.
- **Story Points** có ở trang chi tiết `XW`, nhưng không nằm trong form tạo `XIAN` đã kiểm tra.

**Nên sửa tiêu đề “Field” thành “Thông tin cần ghi”**, rồi chỉ rõ thông tin nào đi vào trường Jira, thông tin nào nằm trong Description.

### C. Danh sách “bắt buộc” chưa phân biệt giai đoạn của ticket

Mục 6 bắt mọi Story/Task phải có Assignee, Estimate, Dependencies, Epic ngay từ đầu. Đây có thể là **quy ước nhóm**, nhưng không phải yêu cầu chung của Jira, và không phù hợp mọi giai đoạn.

Ví dụ:
- Ticket mới trong backlog có thể chưa có người thực hiện.
- Công việc độc lập có thể không có dependency.
- Một Task bảo trì không nhất thiết phải thuộc Epic.
- Task không nhất thiết phải dùng Story Points.

Nên phân thành:

| Giai đoạn | Yêu cầu |
|---|---|
| **Ghi nhận vào backlog** | Mục tiêu, mô tả ban đầu, nguồn yêu cầu, mức ưu tiên sơ bộ |
| **Sẵn sàng đưa vào triển khai** | Phạm vi rõ, tiêu chí nghiệm thu, phụ thuộc, ước lượng, trách nhiệm thực hiện |
| **Đóng ticket** | Đạt AC và DoD, có kết quả kiểm thử/bằng chứng, bàn giao đầy đủ |

Không nên đồng nhất **“đủ để tạo ticket”** với **“đủ để bắt đầu làm”**.

### D. Các ví dụ Acceptance Criteria chưa nhất quán

Có các vấn đề cụ thể:

- **Story Create Room** lại chứa AC về người thứ ba **Join Room**. Điều này làm ranh giới giữa hai Story mờ đi.
- AC về sinh room code lặp một phần với AC tạo phòng thành công.
- “**Hiển thị message phù hợp**” vẫn mơ hồ — cần xác định nội dung hoặc ý nghĩa bắt buộc của thông báo.
- Mẫu Join Room ghi tiền điều kiện **Room exists**, nhưng lại có ca **Room not found**. Nếu tiền điều kiện áp dụng cho toàn Story thì mâu thuẫn; nên ghi điều kiện riêng cho từng kịch bản.
- Epic có **Invite player, Leave room, Room status** trong phạm vi, nhưng tiêu chí Done chỉ kiểm tra tạo phòng, tham gia và số chỗ.

**Nguyên tắc cần bổ sung:** tiêu chí nghiệm thu phải bao phủ phạm vi đã cam kết, không chỉ một số luồng tiêu biểu.

### E. Chia nhỏ chức năng chưa chắc tạo ra Story tốt

Danh sách:

```text
Initialize chess board
Validate legal move
Switch player turn
Detect check
```

có thể chỉ là các bước kỹ thuật của một hành vi lớn, chưa chắc từng mục có giá trị độc lập cho người sử dụng.

Một cách chia có thể tốt hơn:

> **Người chơi thực hiện một nước đi hợp lệ và đối thủ nhìn thấy trạng thái bàn cờ được cập nhật.**

Story này đi xuyên qua UI, API, luật cờ và realtime; bên trong mới chia công việc kỹ thuật.

**Không phải cứ một hàm hoặc một bước xử lý là một Story.** Tuy nhiên cũng không cần ép mọi Story hoàn toàn độc lập — điều quan trọng là giảm và làm rõ phụ thuộc.

### F. Story Points và Sprint đang được trình bày quá giống công thức chung

- Fibonacci là một cách ước lượng phổ biến, **không phải yêu cầu bắt buộc của Scrum**.
- Bảng “Login = 3, Video Call = 13” chỉ có thể là ví dụ; không thể dùng làm định mức cho nhóm bạn.
- Mốc “20–30 points thì phải chia” không có ý nghĩa chung giữa các nhóm.
- Tiêu chí thực tế hơn là: công việc có đủ rõ và có thể hoàn thành, kiểm thử, đạt DoD trong một Sprint hay không.

Ví dụ Sprint Foundation → Room → Gameplay → Communication **không tự động sai**, nhưng đang thiếu:
- **Sprint Goal**.
- Năng lực thực tế của nhóm.
- Kết quả chạy được và kiểm chứng được cuối Sprint.
- Kiểm thử, tích hợp và điều chỉnh kế hoạch trong từng Sprint.

Theo Scrum Guide, Sprint Planning phải trả lời **vì sao Sprint có giá trị, làm được gì và làm bằng cách nào**, chứ không chỉ phân các module vào lịch.

### G. Một số lựa chọn bị trình bày như mặc định dù phụ thuộc bối cảnh

- **“Setup Docker không được là Story”** quá tuyệt đối. Với dự án này dùng Task là hợp lý; với sản phẩm phục vụ developer, môi trường phát triển có thể mang giá trị người dùng trực tiếp.
- Epic không chỉ dành cho chức năng nghiệp vụ; có thể phục vụ một kết quả về hạ tầng, độ tin cậy hoặc bàn giao.
- MoSCoW thể hiện mức cần thiết trong **phạm vi một đợt bàn giao**, không hoàn toàn tương đương Priority.
- Video/voice chỉ là **Could Have nếu yêu cầu dự án cho phép**, không thể tự xếp như vậy nếu đề bài bắt buộc.
- Tôi vừa xác minh: Jira của bạn có `blocks`, `is blocked by`, `relates to`, nhưng **không có loại liên kết tên `depends on`**.
- “Merged into main/develop” cần chốt rõ nhánh đích; “Deployed to staging” có bắt buộc hay không phải do DoD của nhóm quy định.

## 3. Những phần còn thiếu để trở thành kế hoạch triển khai thực sự

Bình luận hướng dẫn viết backlog khá tốt, nhưng còn thiếu:

| Phần thiếu | Tác dụng |
|---|---|
| **Truy vết yêu cầu → ticket → test → bằng chứng** | Phát hiện yêu cầu bị bỏ sót |
| **Yêu cầu phi chức năng có ngưỡng đo** | Không bỏ quên bảo mật, hiệu năng, vận hành |
| **Hợp đồng giữa các phần việc** | FE/BE/QA biết chính xác đầu vào, đầu ra và giao diện |
| **Capacity và lịch thực tế** | Không phân công vượt khả năng của thành viên |
| **Rủi ro, giả định, phụ thuộc ngoài** | Nhìn thấy các điều kiện có thể làm trễ kế hoạch |
| **Người review/nghiệm thu** | Phân biệt người làm với người chấp nhận kết quả |
| **Nguồn tài liệu chuẩn và quản lý thay đổi** | Tránh Jira khác tài liệu gốc |
| **Bằng chứng hoàn thành** | Không báo Done chỉ dựa trên lời xác nhận |

## Kết luận

**Có thể dùng bình luận này làm tài liệu nhập môn, nhưng chưa nên dùng làm checklist bắt buộc hoặc đặc tả để tự động tạo Jira.**

Trước khi áp dụng cho nhóm bạn, ưu tiên sửa:
1. **Phân cấp Task/Sub-task.**
2. **Trường Jira so với mục trong Description.**
3. **Yêu cầu theo từng giai đoạn của ticket.**
4. **AC và phạm vi cho nhất quán.**
5. **Ước lượng/lập Sprint theo capacity và kết quả kiểm chứng, không theo bảng mẫu.**

Câu kết về năm câu hỏi là đúng hướng, nhưng để triển khai thực sự còn phải trả lời thêm: **bàn giao chính xác cái gì, kiểm chứng bằng cách nào và bằng chứng nằm ở đâu**.

Kết quả nghiên cứu bổ sung làm rõ **ba điểm dễ nhầm khi áp dụng Scrum trên Jira**. Tôi đã đọc lại các trang Atlassian để xác nhận:

### 1. Jira cho phép bỏ trống Sprint Goal, nhưng Scrum yêu cầu có mục tiêu

Tài liệu [Start a sprint](https://support.atlassian.com/jira-software-cloud/docs/plan-a-sprint/) ghi “Add a Sprint goal **if desired**”.

Đây là tính tùy chọn của **giao diện Jira**, không phải quy tắc Scrum. Theo Scrum Guide, cả nhóm phải xác lập Sprint Goal trước khi kết thúc Sprint Planning.

**Áp dụng:** quy trình của nhóm cần yêu cầu Sprint Goal, kể cả khi Jira không bắt buộc nhập.

### 2. “Complete” trên board không tự chứng minh đạt Definition of Done

Theo [Configure columns](https://support.atlassian.com/jira-software-cloud/docs/configure-columns/), với board company-managed, Jira chỉ xem work item ở **cột ngoài cùng bên phải** là hoàn thành trong ngữ cảnh board.

Vì vậy:
- Phải kiểm tra **workflow status → board column**, không chỉ nhìn tên trạng thái.
- Không đưa `Blocked` vào cột hoàn thành nếu công việc vẫn chưa xong.
- Công việc bị hủy có thể đã kết thúc về mặt quản lý, nhưng **không phải giá trị sản phẩm đã hoàn thành**.
- Chuyển thẻ sang Done vẫn phải dựa trên AC và DoD đã thống nhất.

Đây là cơ chế chung trong tài liệu; **chưa phải kết luận về mapping board hiện tại của bạn**.

### 3. Sprint và bản phát hành là hai khái niệm khác nhau

Theo [Configure versions](https://support.atlassian.com/jira-software-cloud/docs/configure-versions-in-a-scrum-project/), một version có thể trải qua nhiều Sprint.

| Thông tin | Trả lời câu hỏi |
|---|---|
| **Parent** | Công việc này thuộc cấu trúc nào? |
| **Sprint** | Công việc được chọn cho vòng làm việc nào? |
| **Fix versions** | Công việc thuộc bản phát hành nào? |
| **Linked work items** | Công việc liên quan hoặc phụ thuộc việc nào? |

**Hệ quả:** có thể lập mốc phát hành cho cả dự án, nhưng vẫn lựa chọn và điều chỉnh công việc từng Sprint. Không cần đồng nhất “kết thúc Sprint” với “phát hành một version”.

Những điểm này nên được bổ sung vào quy chuẩn Jira của nhóm để tránh tình trạng **công cụ cho phép thao tác, nhưng thao tác đó lại không phản ánh đúng cách làm Scrum**.

Tôi dùng **agent-reach** để đối chiếu cách sắp thứ tự backlog theo giá trị, rủi ro và phụ thuộc, rồi áp dụng vào việc chọn công việc cho Sprint.**Thứ tự triển khai nên được quyết định bởi mục tiêu sản phẩm, giá trị cần giao, phụ thuộc và rủi ro — không phải thứ tự viết tài liệu, số thứ tự Epic hay “backend trước, frontend sau”.**

Trong Scrum, cần phân biệt **ba loại thứ tự**:

| Loại thứ tự | Câu hỏi cần trả lời | Ai quyết định? |
|---|---|---|
| **Thứ tự Product Backlog** | Kết quả nào nên được tạo ra trước? | Product Owner chịu trách nhiệm, tham khảo nhóm và stakeholder |
| **Lựa chọn công việc cho Sprint** | Sprint này nên đạt gì và có thể hoàn thành những gì? | Cả nhóm xây Sprint Goal; Developers chọn việc qua trao đổi với PO |
| **Thứ tự thực hiện trong Sprint** | Việc nào bắt đầu trước, việc nào làm song song? | Developers lập và cập nhật kế hoạch |

Cách làm cụ thể như sau.

## 1. Chốt “kết quả đầu tiên cần có”, rồi mới sắp chức năng

Trước khi hỏi “Epic nào làm trước”, hãy hỏi:

> **Phần sản phẩm nhỏ nhất nào giúp người dùng thực hiện được một việc có ý nghĩa, và giúp nhóm kiểm chứng hướng triển khai?**

Ví dụ với sản phẩm cờ tướng:

- “Hoàn thành database” là kết quả kỹ thuật.
- “Hai người có thể vào cùng phòng và thực hiện lượt đi hợp lệ được đồng bộ” là kết quả sản phẩm.

Từ kết quả đó mới xác định phần cần thiết của tài khoản, phòng chơi, luật cờ, giao diện và kết nối realtime.

**Không nhất thiết hoàn thành toàn bộ Epic tài khoản rồi mới bắt đầu Epic phòng chơi.** Có thể lấy phần tối thiểu từ nhiều Epic để tạo một luồng sử dụng xuyên suốt.

## 2. Sắp thứ tự bằng các tiêu chí rõ ràng

Đối với từng Story/Task, đánh giá:

| Tiêu chí | Câu hỏi |
|---|---|
| **Đóng góp cho mục tiêu** | Không làm việc này thì mục tiêu gần nhất có đạt được không? |
| **Giá trị** | Hoàn thành việc này giúp người dùng hoặc stakeholder làm được gì? |
| **Phụ thuộc và khả năng mở đường** | Việc này cần gì trước nó, hoặc giúp những việc quan trọng nào được bắt đầu? |
| **Rủi ro và học hỏi** | Có giả định nào nếu sai sẽ khiến nhóm phải đổi kiến trúc, phạm vi hoặc kế hoạch? |
| **Thời hạn thực sự** | Có hạn pháp lý, tích hợp đối tác, lịch demo hoặc ràng buộc bên ngoài không? |
| **Kích thước và khả năng hoàn thành** | Có thể chia nhỏ để giao giá trị sớm hơn không? |

Không cần lập công thức chấm điểm phức tạp ngay. Trước hết, mỗi vị trí trong backlog nên có một lý do:

- **A trước B vì B cần đầu ra của A.**
- **C trước D vì cần kiểm chứng một rủi ro có thể làm thay đổi D.**
- **E trước F vì E đủ cho mục tiêu hiện tại, F chỉ là mở rộng.**

**“Tất cả đều High” chưa phải là thứ tự triển khai.** Bạn vẫn phải quyết định việc nào đứng trước việc nào.

## 3. Vẽ phụ thuộc, nhưng đừng biến mọi công việc thành chuỗi nối tiếp

Cần phân biệt ba dạng:

### Phụ thuộc bắt buộc

B thực sự không thể hoàn tất nếu thiếu A.

Ví dụ:

> Kiểm thử tích hợp thao tác tham gia phòng cần một cách tạo phòng hoặc chuẩn bị dữ liệu phòng hợp lệ.

Ghi rõ **đầu ra cần từ A**, không chỉ ghi “B phụ thuộc A”.

### Phụ thuộc có thể giảm hoặc tháo gỡ

Ví dụ frontend không nhất thiết phải chờ backend hoàn thành toàn bộ:

- Thống nhất API contract.
- Frontend phát triển bằng mock theo contract.
- Backend triển khai cùng contract.
- Sau đó tích hợp và kiểm thử với hệ thống thật.

**Mock giúp làm song song, nhưng không thay thế bằng chứng tích hợp thật khi nghiệm thu.**

### Thứ tự do thói quen, không phải phụ thuộc

Ví dụ:

> “Phải làm xong tất cả database, rồi tất cả API, rồi tất cả UI.”

Đây thường là cách tổ chức theo tầng, không phải điều kiện kỹ thuật bắt buộc cho toàn bộ dự án.

Nguyên tắc là **chỉ nối những việc thực sự cần nối; những việc độc lập có thể thực hiện song song**, trong giới hạn nhân lực và khả năng phối hợp.

## 4. Đưa rủi ro quan trọng lên sớm, không chỉ đưa việc dễ lên trước

Một sai lầm phổ biến là làm trước những màn hình dễ để thấy tiến độ, rồi để phần khó nhất gần hạn cuối.

Nếu thành công của sản phẩm phụ thuộc vào realtime, xử lý đồng thời hoặc luật cờ phía server, nên kiểm chứng chúng sớm.

Ví dụ:

> **Task nghiên cứu:** Xác minh cơ chế xử lý hai người gửi thao tác đồng thời có giữ trạng thái phòng và lượt chơi nhất quán không.

Task này cần có:

- Câu hỏi cần trả lời.
- Giới hạn thời gian.
- Thử nghiệm hoặc bằng chứng.
- Kết luận và ảnh hưởng tới kế hoạch.

Nhưng **nghiên cứu không nên kéo dài vô hạn**, và kết quả nghiên cứu riêng lẻ không tự động là Increment sản phẩm dùng được. Nên kết hợp việc giảm rủi ro với một lát chức năng nhỏ có thể vận hành.

## 5. Chọn việc cho Sprint theo một mục tiêu thống nhất

Không nên chọn theo kiểu:

> Mỗi người lấy vài ticket đang High cho đủ việc.

Nên làm theo thứ tự:

1. Xác định **Sprint Goal**.
2. Xem các mục đứng cao trong backlog có thể đóng góp cho mục tiêu đó.
3. Kiểm tra phụ thuộc, mức độ rõ và khả năng hoàn thành.
4. Đối chiếu capacity thực tế, bao gồm review, tích hợp và kiểm thử.
5. Developers lập kế hoạch thực hiện và xác định phần có thể làm song song.

Một Story chỉ “code xong” nhưng chưa thể tích hợp và kiểm thử trong Sprint thì chưa phải lựa chọn tốt nếu mục tiêu là tạo phần sản phẩm Done.

**Đừng lấy công việc vào Sprint chỉ để lấp đầy lịch của từng người, trong khi các việc đó không tạo được kết quả chung.**

## 6. Ví dụ thứ tự triển khai cho dự án cờ tướng

Đây là **thứ tự minh họa**, chưa phải lịch Sprint đã xác nhận cho dự án của bạn:

| Thứ tự định hướng | Kết quả cần đạt | Lý do |
|---|---|---|
| **Nền tảng tối thiểu và kiểm chứng rủi ro** | Có môi trường chạy, cách nhận diện người chơi và bằng chứng khả thi cho realtime/luật cờ trọng yếu | Tránh phát hiện vấn đề nền tảng quá muộn |
| **Luồng vào phòng** | Người chơi tạo phòng, người khác tham gia, hai bên thấy trạng thái đúng | Có luồng sử dụng xuyên suốt đầu tiên |
| **Luồng chơi cơ bản** | Thực hiện nước đi hợp lệ, đồng bộ bàn cờ và lượt chơi | Kiểm chứng giá trị cốt lõi |
| **Luồng kết thúc ván** | Xác định và hiển thị kết quả theo phạm vi thống nhất | Hoàn chỉnh trải nghiệm cốt lõi |
| **Khả năng phục hồi và an toàn cần thiết** | Xử lý mất kết nối, quyền thao tác, lỗi đồng thời… | Đạt mức chất lượng phù hợp trước khi mở rộng sử dụng |
| **Tính năng mở rộng** | Khán giả, chat, AI, thông báo… tùy mục tiêu | Bổ sung sau khi luồng cốt lõi được kiểm chứng |

**Lưu ý:** bảo mật và độ tin cậy bắt buộc phải được thực hiện ngay trong từng lát chức năng; không chờ đến dòng “khả năng phục hồi” mới bắt đầu. Tương tự, kiểm thử diễn ra xuyên suốt, không có một đợt “QA toàn bộ” mới được coi là xong.

Nếu sản phẩm bắt buộc đăng nhập, nhận diện tối thiểu phải đáp ứng yêu cầu đó. Nếu cho phép khách, không nên tự biến hệ thống tài khoản đầy đủ thành điều kiện chặn mọi chức năng.

## 7. Thể hiện thứ tự trên Jira như thế nào?

- **Sắp thứ tự/rank trên Backlog:** thể hiện việc nào nên được xem xét trước.
- **Priority:** thể hiện mức độ quan trọng hoặc khẩn cấp; không thay thế thứ tự backlog.
- **Parent:** thể hiện cấu trúc Epic → Story/Task → Sub-task.
- **`blocks` / `is blocked by`:** thể hiện phụ thuộc thực sự; ghi thêm đầu ra hoặc điều kiện để hết bị chặn.
- **Sprint:** chỉ gán vào Sprint được lựa chọn hoặc dự kiến phù hợp; không khóa toàn bộ dự án từ đầu.
- **Description:** ghi ngắn lý do cần làm sớm đối với những mục dễ gây tranh luận.

Trong Sprint, không cần ép mọi Sub-task chạy tuần tự. Ví dụ:

```text
Thống nhất contract và quy tắc nghiệp vụ
              ├─ Frontend triển khai theo contract
              └─ Backend triển khai theo contract
                           ↓
               Tích hợp và kiểm thử thực tế
                           ↓
                    Đạt AC và DoD
```

Sau Sprint Review hoặc khi có thông tin quan trọng mới, **xem lại thứ tự backlog**. Trong Sprint đang chạy, điều chỉnh kế hoạch cùng PO mà không làm tổn hại Sprint Goal.

### Quy tắc ngắn gọn để dùng cho nhóm

> **Làm trước phần cần cho mục tiêu gần nhất; xử lý sớm rủi ro có thể làm sai hướng; hoàn thành các tiền đề thực sự; chia nhỏ để giao giá trị sớm; làm song song những phần độc lập; rồi cập nhật thứ tự theo bằng chứng.**

Căn cứ: [Scrum Guide](https://scrumguides.org/scrum-guide.html), [Ordered Not Prioritized](https://www.scrum.org/resources/ordered-not-prioritized) và [Dependencies Impacting Product Backlog Order](https://www.scrum.org/resources/blog/how-can-dependencies-impact-order-product-backlog).

Tôi dùng **document-to-action-items** để tách kết luận có nguồn khỏi khuyến nghị và ví dụ, rồi đóng gói thành bộ Markdown: nền tảng Scrum, kế hoạch và thứ tự triển khai, áp dụng Jira, mẫu ticket, vận hành Sprint và danh mục nguồn. Các quan sát Jira sẽ ghi rõ là kết quả kiểm tra trước đó, không phải cấu hình vừa xác minh lại.Đã tạo **8 tài liệu Markdown**, kèm **17 mục nguồn tham khảo** và hai bản ghi kiểm tra Jira trước đó.

**Tải trọn bộ `.md` trong file ZIP:**

[File: scrum-jira-2026-10-04.zip](#media:%2FUsers%2Ftwot%2F.hermes%2Fartifacts%2Fscrum-jira-2026-10-04.zip)

### Nội dung bộ tài liệu

| File | Nội dung |
|---|---|
| `README.md` | Mục lục, thứ tự đọc và quy ước bằng chứng |
| `01-nen-tang-scrum.md` | Quy tắc Scrum; Product Goal, Sprint Goal, Increment; AC/DoD/DoR |
| `02-lap-ke-hoach-du-an.md` | Chuyển yêu cầu thành backlog, phân rã và truy vết |
| `03-thu-tu-trien-khai.md` | Sắp thứ tự theo giá trị, phụ thuộc, rủi ro; thực hiện song song |
| `04-ap-dung-jira-va-quan-sat.md` | Hierarchy, trường Jira, Sprint/Version/Links và quan sát XIAN/XW |
| `05-mau-noi-dung-ticket.md` | Mẫu Epic, Story, Task, QA, Spike và Sprint Backlog |
| `06-van-hanh-sprint-va-checklist.md` | Planning, Daily, Review, Retro và checklist kiểm tra |
| `07-nguon-va-gioi-han.md` | URL nguồn, phần được sử dụng và giới hạn của từng nguồn |

Các tài liệu **phân biệt rõ quy tắc Scrum, hướng dẫn thực hành, khuyến nghị của nhóm và ví dụ minh họa**. Nguồn được dẫn tại các phần liên quan, không chỉ gom ở cuối.

**Đã kiểm tra:** 74 liên kết nội bộ không bị hỏng; file ZIP mở hợp lệ và chứa đúng nội dung đã tạo.

**Lưu ý:** phần audit Jira là kết quả kiểm tra trước đó, không phải xác minh live mới. Bộ tài liệu có tên project và key ticket riêng; nên xem lại trước khi chia sẻ công khai.

Mở nhanh mục lục:

[File: README.md](#media:%2FUsers%2Ftwot%2F.hermes%2Fartifacts%2Fscrum-jira-2026-10-04%2FREADME.md)