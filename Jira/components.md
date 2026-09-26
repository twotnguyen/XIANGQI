# Jira Components — Nhóm công việc dự án Cờ Tướng Online

**Cập nhật:** 2026-09-22  
**Danh mục đã thống nhất:** Frontend, Backend, AI, Design, Tester, DevOps.

Dự án sử dụng đúng **6 component**, phân chia theo mảng công việc và nhóm phụ trách. Một người có thể kiêm nhiều nhóm; không bắt buộc có 6 thành viên riêng biệt. Các chức năng như tài khoản, phòng, chat và media được thể hiện trong tên/nội dung đầu việc để kết hợp với cách phân nhóm này.

## 1. Name và Description để tạo trên Jira

Chép nguyên nội dung cột **Name** và **Description** khi tạo component. Cột vai trò chỉ giải thích trách nhiệm của nhóm.

| Name | Vai trò / mảng công việc | Description |
|---|---|---|
| Frontend | Frontend Development | Triển khai ứng dụng web theo thiết kế và đặc tả: màn hình tài khoản, sảnh/phòng, bàn cờ, chat, media, chơi với máy và lịch sử. Tích hợp API, realtime và media; xử lý trạng thái tải/lỗi, phiên ở trình duyệt, responsive và trợ năng. Viết test cho phần giao diện, bảo đảm dữ liệu và kết quả chính thức được nhận từ máy chủ. |
| Backend | Backend Development | Triển khai API, dịch vụ nghiệp vụ, xác thực/kiểm quyền, realtime và xử lý lệnh ván tại máy chủ. Phụ trách luật cờ dùng chung, contracts, schema PostgreSQL, migration SQL, RLS, transaction, thứ tự khóa, chống trùng lệnh, thời hạn, lưu trữ và tích hợp Auth/media/AI. Viết unit/integration test và bảo đảm client không thể tự quyết định quyền hoặc kết quả ván. |
| AI | AI Development | Phát triển đối thủ máy tự viết: lượng giá thế cờ, minimax/negamax, alpha-beta, sắp xếp nước, đào sâu dần và ba mức khó. Triển khai tiến trình tìm kiếm riêng, IPC, hủy công việc và hàng đợi; phối hợp Backend khi áp dụng kết quả vào ván. Xây dựng corpus/oracle và báo cáo chất lượng, độ sâu, thời gian tính theo ngưỡng đã chốt. |
| Design | UI/UX Design | Thiết kế trải nghiệm và giao diện web Cờ Tướng Online: cấu trúc màn hình, luồng tương tác, wireframe, thiết kế chi tiết, design tokens và trạng thái giao diện. Bao gồm bàn cờ, phòng chờ, chat, camera/micro, responsive, focus và trợ năng. Bàn giao thiết kế cùng quy tắc tương tác cho Frontend và kiểm tra mức độ khớp thiết kế của sản phẩm. |
| Tester | Testing and Quality Assurance | Phân tích khả năng kiểm thử, thiết kế test case và kiểm chứng sản phẩm theo yêu cầu, quyền và tiêu chí nghiệm thu. Phụ trách kiểm thử tích hợp, end-to-end, hồi quy, tranh chấp đồng thời, bảo mật, tải và media thật; ghi lỗi với bước tái hiện và kiểm lại bản sửa. Đối chiếu từng AC với bằng chứng, báo đúng PASS/FAIL/BLOCKED và giữ rõ phần chưa được kiểm chứng. |
| DevOps | Development Operations | Chuẩn hóa cách cài đặt và chạy dự án trên máy của từng thành viên: phiên bản công cụ, biến môi trường mẫu, dịch vụ local, build và CI. Phối hợp Backend cấu hình PostgreSQL/Supabase, Auth và LiveKit; quản lý bí mật, hỗ trợ xử lý lỗi môi trường. Phụ trách cấu hình triển khai Render/Vercel theo kế hoạch, health/readiness, khởi động lại, rollback và hướng dẫn vận hành, bàn giao. |

## 2. Công việc và đầu ra của từng nhóm

| Nhóm | Công việc cụ thể trong dự án | Đầu ra cần bàn giao |
|---|---|---|
| Frontend | Xây dựng các màn hình tài khoản, sảnh, phòng chờ, ván online, chơi với máy, chat/media và lịch sử; tích hợp API/socket; xử lý responsive, bàn phím và các trạng thái giao diện. | Mã giao diện hoạt động với dịch vụ thật, test liên quan, bằng chứng đối chiếu màn hình/trạng thái và ghi chú tích hợp. |
| Backend | Xây dựng API, nghiệp vụ, luật cờ dùng chung, contracts, dữ liệu và quyền; xử lý lệnh đồng thời, đồng hồ, reconnect, thu hồi quyền, chat và tích hợp kết quả AI. | API/contract, migration, service, unit/integration test trên PostgreSQL thật và bằng chứng đúng quyền/trạng thái. |
| AI | Xây dựng lượng giá, thuật toán tìm nước, các mức khó, tiến trình tìm kiếm riêng, hàng đợi và hủy công việc; kiểm chất lượng, độ sâu và thời gian tính. | Mã máy cờ, giao diện IPC, corpus có đáp án được kiểm tra, số đo benchmark và báo cáo đấu thử. |
| Design | Chuẩn bị và rà thiết kế màn hình, wireframe, bố cục, màu/chữ/quân cờ, tokens, tương tác, responsive, focus và trạng thái tải/rỗng/lỗi/mất kết nối/hết quyền theo đặc tả. | Thiết kế và hướng dẫn tương tác đủ để Frontend triển khai; đối chiếu giao diện thực tế, ghi rõ chỗ cần sửa. |
| Tester | Chuẩn bị test case, dữ liệu và môi trường kiểm thử cùng các nhóm; kiểm chức năng, quyền, race, hồi quy, tải, media và nghiệm thu từng AC. | Test tự động hoặc bằng chứng kiểm thủ công đúng phạm vi, báo lỗi có bước tái hiện, kết quả kiểm lại và báo cáo PASS/FAIL/BLOCKED. |
| DevOps | Chuẩn hóa setup trên máy thành viên, cấu hình dịch vụ local và CI; hỗ trợ lỗi môi trường; chuẩn bị triển khai Internet theo mốc, vận hành và đóng gói bàn giao kỹ thuật. | Hướng dẫn setup tái lập được, file cấu hình và biến môi trường mẫu, pipeline chạy thật, tài liệu triển khai/rollback và bộ hồ sơ bàn giao có đóng góp của các nhóm. |

### Ranh giới cần giữ rõ

- **Design và Frontend:** Design xác định giao diện và hành vi tương tác; Frontend hiện thực bằng mã và tích hợp dữ liệu thật. Thiết kế phải theo luật nghiệp vụ đã chốt.
- **Backend và AI:** Backend giữ trạng thái ván, kiểm luật/quyền và quyết định có áp dụng nước hay không. AI tìm nước theo thế cờ và ngân sách; không tự ghi kết quả vào cơ sở dữ liệu. Luật cờ thuần do Backend chủ trì và được AI dùng chung.
- **Backend và DevOps:** Backend thiết kế schema, migration, RLS và logic truy cập; DevOps chuẩn bị dịch vụ, cấu hình và quy trình chạy migration đúng môi trường. Thiết lập môi trường không thay việc kiểm tính đúng của dữ liệu.
- **Developer và Tester:** Frontend, Backend và AI vẫn viết/chạy test cho mã mình sửa. Tester kiểm chứng độc lập, hồi quy và nghiệm thu; không nhận thay toàn bộ trách nhiệm viết test của developer.
- **AI và Tester:** AI cung cấp thuật toán, corpus và công cụ đo; Tester phối hợp kiểm oracle, cách đo và bằng chứng. Kết quả tự sinh từ thuật toán đang test không được dùng làm đáp án duy nhất.
- **DevOps và Tester:** DevOps bảo đảm hạ tầng phục vụ kiểm thử; Tester kiểm hành vi và lưu bằng chứng. Dịch vụ khởi động được chưa có nghĩa là chức năng đã PASS.

## 3. Điều phối và làm rõ yêu cầu trong team

Không tạo component PM, BA hoặc DA trong danh mục hiện tại. Việc điều phối và làm rõ yêu cầu vẫn được thực hiện như sau:

- Người dùng/chủ dự án hoặc trưởng nhóm theo dõi phân công, tiến độ, phụ thuộc và vướng mắc của các nhóm.
- Thành viên nhận issue đọc yêu cầu, flow và AC trước khi triển khai; gặp điểm chưa rõ thì nêu nguồn tài liệu, tình huống và tác động để chủ dự án quyết định.
- Khi có quyết định thay đổi được chấp nhận, người thực hiện cập nhật tài liệu liên quan để các nhóm dùng cùng một căn cứ. Không tự sửa yêu cầu hoặc hạ tiêu chí để test đạt.
- Tester đối chiếu kết quả với AC; Design kiểm thiết kế; nhóm phát triển và DevOps cung cấp bằng chứng trong phạm vi mình. Điều kiện DONE vẫn theo [WORKFLOW](../docs/10-issues/WORKFLOW.md).

## 4. Quy tắc gán component

1. Chọn theo **nội dung công việc**, không theo chức danh của người nhận. Người Backend sửa UI thì phần việc đó thuộc Frontend.
2. **Mỗi Jira Task chỉ có một vai trò duy nhất** trong sáu component. Story là cổng nghiệm thu kết quả của ISSUE-NNN, có thể cần nhiều Task thuộc các vai trò khác nhau; Epic gom các Story theo nhóm E00–E20.
3. Một chức năng có nhiều phần việc phải tách thành Task Design, Frontend, Backend, AI, Tester hoặc DevOps theo đầu ra thực tế. Không dùng một Task để giao cả mã `apps/web` và `apps/server`, hoặc cả triển khai và nghiệm thu độc lập.
4. Giữ nguyên ID, dependency và checklist PASS của 138 file nguồn. Trong Jira, Story `ISSUE-NNN` chỉ hoàn thành sau khi các Task của nó và test gốc hoàn thành; Story phụ thuộc trước phải DONE/merge rồi mới bắt đầu Task kế tiếp. Mỗi Task mã có nhánh/PR riêng nếu được triển khai độc lập; bằng chứng vẫn truy về ISSUE-NNN.
5. Không gán tất cả component chỉ vì các nhóm có tham gia review. Ghi nhóm phối hợp khi có nhiệm vụ hoặc đầu ra cụ thể cần bàn giao.

## 5. Ánh xạ chủ trì cho 138 issue hiện có

Bảng dưới đây là **ánh xạ chủ trì cũ**, chỉ giữ để truy vết bản nháp ngày 2026-09-22. Nó không dùng để phân công Jira Task vì một số ISSUE gộp nhiều vai trò và 048, 052, 098 bị gán Backend dù phần mã sản phẩm thuộc Frontend. Ánh xạ mới cho đủ 138 ISSUE nằm trong [AUDIT-138](AUDIT-138.md) và [plan.json](plan.json); mọi ISSUE có nhiều vai trò được tách thành Task riêng.

| Component | Issue chủ trì |
|---|---|
| Frontend | [055](../docs/10-issues/ISSUE-055.md); [060](../docs/10-issues/ISSUE-060.md); [067](../docs/10-issues/ISSUE-067.md); [072](../docs/10-issues/ISSUE-072.md); [077](../docs/10-issues/ISSUE-077.md)–[083](../docs/10-issues/ISSUE-083.md); [091](../docs/10-issues/ISSUE-091.md); [094](../docs/10-issues/ISSUE-094.md); [103](../docs/10-issues/ISSUE-103.md); [107](../docs/10-issues/ISSUE-107.md); [111](../docs/10-issues/ISSUE-111.md); [116](../docs/10-issues/ISSUE-116.md); [123](../docs/10-issues/ISSUE-123.md); [129](../docs/10-issues/ISSUE-129.md)–[132](../docs/10-issues/ISSUE-132.md) |
| Backend | [006](../docs/10-issues/ISSUE-006.md)–[025](../docs/10-issues/ISSUE-025.md); [035](../docs/10-issues/ISSUE-035.md)–[043](../docs/10-issues/ISSUE-043.md); [045](../docs/10-issues/ISSUE-045.md)–[054](../docs/10-issues/ISSUE-054.md); [056](../docs/10-issues/ISSUE-056.md)–[059](../docs/10-issues/ISSUE-059.md); [061](../docs/10-issues/ISSUE-061.md)–[066](../docs/10-issues/ISSUE-066.md); [068](../docs/10-issues/ISSUE-068.md)–[071](../docs/10-issues/ISSUE-071.md); [073](../docs/10-issues/ISSUE-073.md)–[076](../docs/10-issues/ISSUE-076.md); [084](../docs/10-issues/ISSUE-084.md)–[090](../docs/10-issues/ISSUE-090.md); [092](../docs/10-issues/ISSUE-092.md)–[093](../docs/10-issues/ISSUE-093.md); [095](../docs/10-issues/ISSUE-095.md)–[102](../docs/10-issues/ISSUE-102.md); [104](../docs/10-issues/ISSUE-104.md)–[106](../docs/10-issues/ISSUE-106.md); [108](../docs/10-issues/ISSUE-108.md)–[110](../docs/10-issues/ISSUE-110.md); [113](../docs/10-issues/ISSUE-113.md)–[115](../docs/10-issues/ISSUE-115.md); [121](../docs/10-issues/ISSUE-121.md)–[122](../docs/10-issues/ISSUE-122.md); [125](../docs/10-issues/ISSUE-125.md)–[128](../docs/10-issues/ISSUE-128.md); [134](../docs/10-issues/ISSUE-134.md) |
| AI | [026](../docs/10-issues/ISSUE-026.md)–[033](../docs/10-issues/ISSUE-033.md); [118](../docs/10-issues/ISSUE-118.md)–[120](../docs/10-issues/ISSUE-120.md); [124](../docs/10-issues/ISSUE-124.md) |
| Design | Bộ 138 issue chưa tách công việc thiết kế thành issue riêng. Phụ trách thiết kế và review các màn hình theo mục 2; khi giao việc chi tiết, liên kết phần thiết kế với issue giao diện tương ứng. |
| Tester | [003](../docs/10-issues/ISSUE-003.md)–[004](../docs/10-issues/ISSUE-004.md); [044](../docs/10-issues/ISSUE-044.md); [117](../docs/10-issues/ISSUE-117.md); [133](../docs/10-issues/ISSUE-133.md); [135](../docs/10-issues/ISSUE-135.md)–[136](../docs/10-issues/ISSUE-136.md) |
| DevOps | [001](../docs/10-issues/ISSUE-001.md)–[002](../docs/10-issues/ISSUE-002.md); [005](../docs/10-issues/ISSUE-005.md); [034](../docs/10-issues/ISSUE-034.md); [112](../docs/10-issues/ISSUE-112.md); [137](../docs/10-issues/ISSUE-137.md); [138](../docs/10-issues/ISSUE-138.md) |

**Phần việc Design:** đọc [danh mục màn hình](../docs/03-screens/screen-inventory.md), [trạng thái màn hình](../docs/03-screens/screen-states.md) và [design tokens](../docs/03-screens/design-tokens.md); tạo Task Design riêng, bàn giao trước Task Frontend liên quan và review sau khi hiện thực. Không đổi 138 ISSUE nguồn thành issue thiết kế chỉ để có số lượng phân công.

**Các điểm phối hợp quan trọng:**

- 006–011: Backend chủ trì contracts; Frontend và AI kiểm phần mình sử dụng.
- 012–025: Backend chủ trì luật cờ; AI dùng cùng bộ luật, Tester kiểm các thế và trường hợp biên.
- 047–054, 056, 069, 099: Backend chủ trì hành vi/contract; Frontend thực hiện phần trình duyệt có trong issue.
- 112: DevOps chủ trì môi trường SFU local; Backend/Frontend dựng kết nối, Tester hỗ trợ đo RTP/frame thật.
- 118–120: AI chủ trì tiến trình tìm kiếm và hàng đợi; Backend/DevOps phối hợp IPC và vận hành. 121–122 do Backend chủ trì việc tích hợp kết quả/đi lại vào trạng thái ván.
- 130–132: Frontend hiện thực; Design kiểm thiết kế và Tester kiểm trạng thái/trợ năng.
- 137: DevOps triển khai; Backend, Frontend và Tester kiểm các luồng trên Internet theo điều kiện của issue.
- 138: DevOps chủ trì đóng gói hướng dẫn chạy, triển khai và hồ sơ bàn giao kỹ thuật; Frontend, Backend, AI, Design và Tester cung cấp tài liệu/bằng chứng của mình. Chủ dự án hoặc trưởng nhóm kiểm tính đầy đủ của bộ hồ sơ.

## 6. Ví dụ phối hợp cho chức năng chơi với máy

| Nhóm | Phần việc |
|---|---|
| Frontend | Hiện thực chọn mức khó, bàn cờ, trạng thái máy đang tính, đi lại và kết quả ván theo thiết kế. |
| Backend | Tạo ván AI, kiểm một tài khoản/một phòng, quản lý lượt/đồng hồ, gửi job và áp dụng kết quả còn hiệu lực. |
| AI | Tìm nước theo mức khó, xử lý ngân sách/hủy và trả kết quả đúng contract. |
| Design | Thiết kế màn chọn mức khó và các trạng thái chơi, chờ máy, lỗi, kết thúc. |
| Tester | Kiểm nước hợp lệ, đi lại khi máy đang tính, kết quả muộn, mức khó và bằng chứng benchmark. |
| DevOps | Chuẩn bị môi trường chạy tiến trình AI, cấu hình khởi động, build và kiểm readiness theo đặc tả. |

## 7. Tài liệu dùng chung

- [Kế hoạch Jira 4 tuần](PLAN-4-WEEKS.md), [rà soát 138 ISSUE](AUDIT-138.md), [truy vết nguồn ↔ Jira](TRACEABILITY.md) và [đối chiếu Jira](REMOTE-VERIFICATION.md): backlog đã tạo, vai trò, Blocks và giới hạn khả thi.
- [INDEX — 138 issue](../docs/10-issues/INDEX.md) và [thứ tự thực thi](../docs/10-issues/EXECUTION-ORDER.md): chọn việc đủ phụ thuộc.
- [Yêu cầu](../docs/01-requirements/README.md), [flows](../docs/02-flows/README.md), [quyền](../docs/04-business-rules/permissions.md) và [decision log](../docs/07-decisions/decision-log.md): làm rõ hành vi.
- [Kiến trúc](../docs/09-technical/architecture.md), [công nghệ](../docs/09-technical/tech-stack.md) và [hướng dẫn bắt đầu](../docs/10-issues/AGENT-START-HERE.md): triển khai đúng ranh giới.
- [AC-COVERAGE](../docs/10-issues/AC-COVERAGE.md), [test scenarios](../docs/06-acceptance/test-scenarios.md), [quy ước test](../docs/10-issues/TEST-CONVENTIONS.md), [mẫu evidence](../docs/10-issues/TEST-REPORT-TEMPLATE.md): kiểm chứng và bàn giao.
- [Triển khai](../docs/09-technical/deployment.md) và [tài nguyên ngoài](../docs/10-issues/EXTERNAL-SETUP.md): chuẩn bị môi trường theo từng mốc.
