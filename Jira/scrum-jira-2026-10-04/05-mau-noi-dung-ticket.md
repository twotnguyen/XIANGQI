# 05 — Mẫu nội dung có thể dùng cho nhóm

> Tất cả mẫu là [K] đề xuất, không phải field bắt buộc của Jira hoặc checklist Scrum nguyên văn. `<...>` là thông tin cần điền thật; không tự thay bằng người, points, hạn hoặc dữ kiện chưa xác nhận. Dùng theo mức độ chi tiết phù hợp.

Căn cứ: [S01 — goal/backlog/DoD](07-nguon-va-gioi-han.md#s01), [S03 — chia nhỏ](07-nguon-va-gioi-han.md#s03), [S06 — AC/DoD](07-nguon-va-gioi-han.md#s06), [S13 — hierarchy](07-nguon-va-gioi-han.md#s13), [S17 — links](07-nguon-va-gioi-han.md#s17). Hướng dẫn các trường thật xem [04](04-ap-dung-jira-va-quan-sat.md).

## 1. Product Goal và định hướng

```markdown
# Product Goal
- Người dùng / stakeholder: <ai>
- Vấn đề: <vấn đề cần giải quyết>
- Trạng thái tương lai mong muốn: <kết quả sản phẩm>
- Cách kiểm chứng đã đạt: <chỉ báo / thử nghiệm / kết quả đo>
- Phạm vi hiện tại: <ranh giới>
- Chưa làm: <ngoài phạm vi>
- Ràng buộc: <hạn thật / công nghệ / ngân sách>
- Giả định và câu hỏi: <chưa biết + cách xác minh>
- Nguồn yêu cầu / quyết định: <link + phiên bản/section>
```

Không biến goal thành danh sách công nghệ. Mốc và chỉ tiêu trong mẫu do nhóm/stakeholder xác nhận, không phải Scrum quy định.

## 2. Epic

```markdown
# Mục tiêu và giá trị
<capability / kết quả lớn, cho ai và vì sao>

## Bối cảnh và nguồn
<link tài liệu + phiên bản/section>

## Trong phạm vi
- <kết quả / luồng>

## Ngoài phạm vi
- <giới hạn rõ>

## Tiêu chí hoàn thành Epic
- <kết quả kiểm chứng bao phủ phạm vi>
- <đáp ứng chuẩn chất lượng phù hợp>

## Phân rã
| Story/Task | Kết quả | Lý do thứ tự | Phụ thuộc |
|---|---|---|---|
| <key khi đã tạo> | <đầu ra> | <vì sao> | <nếu có> |

## Rủi ro và câu hỏi
<điều chưa rõ, cách giảm rủi ro>

## Mốc / phát hành
<dự báo và giả định; để chưa xác định nếu chưa có>
```

Tiêu chí Epic phải bao phủ scope đã nhận, không chỉ “đóng tất cả ticket”. Danh sách Story trong Description là tài liệu tham chiếu; quan hệ Parent trên Jira mới biểu diễn hierarchy.

## 3. Story

```markdown
# Nhu cầu và giá trị
As a <người dùng>, I want <khả năng>, so that <lợi ích>.
<Có thể mô tả bằng cách khác nếu rõ hơn>

## Bối cảnh / nguồn yêu cầu
<link + section/phiên bản>

## Phạm vi
- Có: <hành vi/kết quả>
- Không: <giới hạn>

## Quy tắc nghiệp vụ
<quyền, giới hạn, trạng thái, điều kiện>

## Acceptance Criteria
| Mã | Điều kiện | Hành động | Kết quả quan sát được |
|---|---|---|---|
| AC-01 | <given> | <when> | <then> |
| AC-02 | <nhánh lỗi/biên> | <when> | <then> |

## Phụ thuộc / đầu vào
<artifact, contract, dữ liệu, quyết định; key/link nếu đã có>

## Tham chiếu UI/API
<link thiết kế / contract cần thiết>

## Thực hiện và kiểm tra
<Sub-task, hoặc Task cùng cấp có link; phân biệt đúng>

## Chất lượng và bằng chứng
- DoD chung: <link/phiên bản>
- Kiểm tra đặc thù: <bổ sung, không giảm DoD>
- Evidence: <PR / test run / môi trường / demo sau thực thi>

## Câu hỏi chưa giải quyết
<unknown, không giấu bằng diễn đạt mơ hồ>
```

### Ví dụ AC “Tham gia phòng”

[V] Giả định minh họa: phòng tối đa hai người chơi; yêu cầu thực tế phải xác nhận.

| AC | Given/When | Then |
|---|---|---|
| Tham gia thành công | Người có quyền gửi mã phòng tồn tại, còn chỗ | Thêm đúng người, trả trạng thái phòng mới và đồng bộ cho bên liên quan theo contract |
| Không tồn tại | Gửi mã không xác định được phòng | Không tạo tham gia; trả lỗi theo contract đã thống nhất |
| Phòng đầy | Người thứ ba gửi yêu cầu vào phòng đủ hai người | Không vượt giới hạn; trả lỗi đã thống nhất |
| Tranh chấp | Hai yêu cầu cùng tranh chỗ cuối | Chỉ một yêu cầu thành công, trạng thái giữ nhất quán |

Không ghi “thông báo phù hợp” nếu chưa định nghĩa kết quả cần kiểm tra. Không dùng Preconditions chung “phòng tồn tại” để loại bỏ nhánh lỗi không tồn tại. Những ví dụ trên không phải yêu cầu đã được chốt của site.

## 4. Task kỹ thuật / Sub-task thực hiện

```markdown
# Mục tiêu
<đầu ra kỹ thuật cụ thể; đóng góp cho kết quả nào>

## Đầu vào và điều kiện bắt đầu
<contract/schema/quyền truy cập/quyết định cần có>

## Phạm vi
- Có: <module, interface, hành vi cần thay>
- Không: <giới hạn>

## Cách thực hiện dự kiến
<các bước khi cần; để Developers điều chỉnh khi có thông tin mới>

## Điều kiện hoàn thành
- <đầu ra kiểm chứng được>
- <test/review/tích hợp áp dụng>
- <không coi mock là tích hợp thật>

## Bàn giao
<artifact, PR, migration, tài liệu hoặc cấu hình không chứa secrets>

## Kiểm tra và evidence
<lệnh/case dự kiến; kết quả thật, môi trường, phiên bản sau thực thi>

## Phụ thuộc / liên quan
<Parent đúng; blocks/is blocked by/relates to phù hợp>

## Blocker / unknown
<thiếu gì, ảnh hưởng, cách giải quyết>
```

Dùng Sub-task nếu là công việc trực tiếp dưới Story/Task. Dùng Task cùng cấp khi phù hợp và liên kết rõ; không viết tên Task để giả tạo hierarchy. Không bắt buộc mọi Task độc lập phải có Epic hay dependency.

## 5. QA Task / Sub-task

```markdown
# Mục tiêu kiểm chứng
<Story/luồng/yêu cầu cần kiểm tra>

## Điều kiện bắt đầu
<build, tích hợp, dữ liệu, môi trường, quyền đã sẵn sàng>

## Môi trường và phiên bản
<URL / build / commit / dữ liệu; không chứa credentials>

## Ca kiểm thử
| Case | AC/yêu cầu | Dữ liệu/thao tác | Expected |
|---|---|---|---|
| TC-01 | <AC-01> | <bước tái lập> | <kết quả> |

## Kết quả thực thi
| Case | Actual | PASS/FAIL/NOT RUN | Evidence |
|---|---|---|---|
| TC-01 | <sau khi chạy> | <trạng thái thật> | <link/log> |

## Khi FAIL
<bug/key khi đã tạo, mức ảnh hưởng, bước tái lập, retest>

## Điều kiện kết thúc
<case yêu cầu đạt; lỗi được xử lý theo chính sách đã thống nhất>
```

Có thiết kế test không đồng nghĩa đã chạy test. QA có thể tham gia từ refinement; không nhất thiết chờ tất cả code mới bắt đầu chuẩn bị kiểm tra.

## 6. Spike / Task nghiên cứu

```markdown
# Câu hỏi cần trả lời
<giả định hoặc lựa chọn cần xác minh>

## Vì sao làm sớm
<rủi ro / quyết định / phụ thuộc chịu ảnh hưởng>

## Timebox
<giới hạn do nhóm thống nhất>

## Phương pháp
<thử nghiệm, tài liệu, prototype hoặc benchmark thật>

## Đầu ra
- <bằng chứng / kết quả và giới hạn>
- <phương án / quyết định / lý do>
- <ảnh hưởng backlog, estimate, contract hoặc kiến trúc>

## Không thuộc phạm vi
<không coi prototype là production nếu chưa đạt chuẩn>
```

Spike không phải sự kiện hay work type bắt buộc của Scrum; không tự coi kết quả nghiên cứu là Increment dùng được.

## 7. Sprint Goal và Sprint Backlog

```markdown
# Sprint Goal
<kết quả có giá trị, không chỉ “xong N ticket”>

## Cách kiểm chứng goal
<demo / hành trình / chỉ báo>

## Công việc được chọn
| PBI | Đóng góp goal | Sizing nếu dùng | Phụ thuộc / rủi ro |
|---|---|---|---|
| <key> | <kết quả> | <nhóm ước lượng thật> | <điều kiện> |

## Capacity và giả định forecast
<lịch tham gia, nghỉ, gián đoạn, kỹ năng; không tự tạo số>

## Kế hoạch hành động
<điểm bắt đầu, việc song song, điểm tích hợp, review/test>

## DoD áp dụng
<link/phiên bản>
```

## 8. Bảng truy vết và quyết định

```markdown
| Yêu cầu | Nguồn/phiên bản | Ticket | AC | Test | Evidence |
|---|---|---|---|---|---|
| <mã nhóm chọn> | <link/section> | <key> | <AC> | <case> | <run/PR> |

| Ngày | Vấn đề | Quyết định | Lý do/bằng chứng | Ticket/tài liệu ảnh hưởng |
|---|---|---|---|---|
| <ngày thật> | <unknown> | <quyết định thật> | <căn cứ> | <link> |
```

## 9. Field Jira ngoài Description

Theo cấu hình thực tế, điền Summary, Parent, Assignee, Priority, Sprint, Fix versions, Labels, Links… vào field tương ứng. Không cần lặp toàn bộ giá trị này trong Description nếu gây lệch nguồn. Assignee/estimate/Sprint có thể chưa có lúc ghi nhận ý tưởng; bổ sung khi phù hợp.

Điều kiện nghiệm thu công việc là quy ước của nhóm; field nào thật sự required khi tạo phải kiểm tra metadata/UI của đúng project.
