Dưới đây là bản **tổng hợp hoàn chỉnh về Jira Components**, sắp xếp theo hướng từ khái niệm → cách thiết kế → cách gán → quy tắc cho Epic/Story/Task/Bug. Bạn có thể dùng phần này làm **quy chuẩn Jira cho cả team**.

# Jira Components – Quy tắc thiết kế và sử dụng

## 1. Component trong Jira là gì?

**Component** dùng để chia một Jira Project thành các **khu vực, module hoặc phần chịu trách nhiệm của hệ thống**.

Ví dụ một dự án phần mềm có:

```text
Frontend
Backend
Database
Authentication
Game Engine
Realtime
AI
DevOps
```

Khi tạo Epic, Story, Task hoặc Bug, ta có thể gắn Component để biết issue đó **thuộc phần nào của hệ thống**.

Ví dụ:

```text
Task:
Implement chess move validation

Component:
Game Engine
```

Hoặc:

```text
Task:
Create POST /rooms API

Components:
Backend
Room Management
```

### Component không phải Epic

Đây là điểm rất quan trọng:

```text
Epic       = Chúng ta đang xây chức năng lớn nào?
Story      = Người dùng cần có khả năng gì?
Task       = Developer cần thực hiện công việc gì?
Component  = Công việc/chức năng đó thuộc khu vực nào của hệ thống?
```

Ví dụ:

```text
Epic:
Online Match

Story:
Player can see opponent moves in real time

Task:
Implement WebSocket move event

Component:
Realtime
```

---

# 2. Component nên đại diện cho cái gì?

Component nên đại diện cho những phần **ổn định và tồn tại lâu dài** trong kiến trúc/project.

Ví dụ tốt:

```text
Frontend
Backend
Database
Authentication
Game Engine
Realtime
AI
DevOps
```

Không nên tạo Component theo từng công việc nhỏ:

```text
Login Page
Register Button
Fix Login Bug
Sprint 1
High Priority
Week 3
```

Những thông tin trên nên được thể hiện bằng:

```text
Epic
Story
Task
Bug
Sprint
Priority
Label
Fix Version
```

chứ không phải Component.

---

# 3. Các Component phổ biến trong một dự án phần mềm

Không phải project nào cũng cần tất cả, nhưng những Component phổ biến gồm:

| Component | Dùng cho |
|---|---|
| `Frontend` | UI, màn hình, client-side logic |
| `Backend` | Server, API, business logic |
| `Database` | Schema, query, migration, storage |
| `Authentication` | Login, register, JWT, OAuth |
| `API` | REST/GraphQL/API integration |
| `Realtime` | WebSocket, Socket.IO, realtime events |
| `UI/UX` | Design system, UX flow |
| `Security` | Authorization, validation, security |
| `Testing / QA` | Unit, integration, E2E testing |
| `DevOps` | CI/CD, deployment, Docker |
| `Infrastructure` | Server, cloud, network, storage |
| `Monitoring / Logging` | Logs, metrics, error tracking |
| `Performance` | Optimization, caching |
| `Documentation` | Technical/API documentation |
| `Third-party Integration` | External APIs/services |

---

# 4. Component cho project Chinese Chess Online

Với project cờ tướng online của team bạn, có thể dùng:

```text
Frontend
Backend
Database
Authentication
Game Engine
Room Management
Realtime
Chat
Voice / Video
Spectator
AI / Bot
Notification
Security
Testing / QA
DevOps
Documentation
```

Tuy nhiên, không nên tạo quá nhiều ngay từ đầu.

Một phiên bản gọn hơn:

```text
Frontend
Backend
Database
Authentication
Game Engine
Realtime
Communication
AI
QA
DevOps
```

Trong đó:

```text
Communication
├── Chat
├── Voice
└── Video
```

Team khoảng 4–8 người thì khoảng **8–15 Component chính** thường đã đủ dễ quản lý.

---

# 5. Quy tắc quan trọng nhất khi gán Component

Khi chọn Component, hãy hỏi:

> **Issue này chủ yếu thuộc module/khu vực nào của hệ thống?**

Ví dụ:

```text
Design chess board UI
→ Frontend

Validate chess move
→ Game Engine

Store match history
→ Database

Synchronize opponent moves
→ Realtime

Configure deployment
→ DevOps
```

---

# 6. Ưu tiên một Component chính

Một issue bình thường nên có:

```text
1 Component
```

Ví dụ:

```text
Task:
Implement chess move validation

Component:
Game Engine
```

Nếu issue thực sự liên quan nhiều module thì có thể:

```text
2 Components
```

Ví dụ:

```text
Task:
Implement real-time chess move synchronization

Components:
Realtime
Game Engine
```

---

# 7. Không nên gán quá nhiều Component

Không nên làm:

```text
Task:
Create game room

Components:
Frontend
Backend
Database
Realtime
Authentication
Security
Testing
```

Component lúc đó gần như mất ý nghĩa.

Một rule rất hữu ích:

```text
1 Component
→ Bình thường

2 Components
→ Cross-module

3+ Components
→ Xem xét tách issue
```

---

# 8. Nếu một Task liên quan quá nhiều Component thì nên tách Task

Ví dụ Task:

```text
Implement Create Room feature
```

có:

```text
Frontend
Backend
Database
Room Management
```

Thay vì để một Task rất lớn, nên tách thành:

```text
Task 1:
Build Create Room UI
Component: Frontend

Task 2:
Create room API
Component: Backend

Task 3:
Implement room creation logic
Component: Room Management

Task 4:
Store room information
Component: Database
```

Cách này giúp:

- dễ assign;
- dễ estimate;
- dễ review;
- dễ theo dõi tiến độ;
- dễ filter;
- ít dependency mơ hồ hơn.

---

# 9. Không dùng Component để thể hiện người làm

Không nên:

```text
Component:
Minh

Component:
Team A

Component:
Backend Developer
```

Người chịu trách nhiệm nên dùng:

```text
Assignee
```

Ví dụ:

```text
Task:
Implement Login API

Component:
Backend

Assignee:
Minh
```

---

# 10. Không dùng Component để thể hiện Priority hoặc Sprint

Không nên:

```text
Component:
High Priority
Sprint 1
Urgent
Week 2
Must Have
```

Hãy dùng đúng Jira field:

```text
Priority
Sprint
Labels
Fix Version
```

---

# 11. Không bắt buộc Component của Epic → Story → Task phải giống nhau

Đây là một nguyên tắc rất quan trọng.

Ví dụ:

```text
Epic:
Game Room

Component:
Room Management
```

Story:

```text
Story:
Player can create a room

Component:
Room Management
```

Nhưng Task bên dưới có thể là:

```text
Task:
Build Create Room UI

Component:
Frontend
```

Task khác:

```text
Task:
Implement POST /rooms

Component:
Backend
```

Task khác:

```text
Task:
Store room state

Component:
Database
```

Hoàn toàn hợp lý.

---

# 12. Quy tắc Component cho Epic

Epic thường là một **business feature lớn** và thường trải qua nhiều technical layer.

Ví dụ:

```text
Epic:
Online Multiplayer
```

có thể chứa:

```text
Frontend
Backend
Database
Realtime
Game Engine
```

Không nên vì thế mà gắn tất cả:

```text
❌ Frontend
❌ Backend
❌ Database
❌ Realtime
❌ Game Engine
```

vào Epic.

### Quy tắc đề xuất cho Epic

```text
Component: Optional

Recommended:
0–1 Component

Maximum:
2 Components
```

Chỉ gán nếu Epic có một domain/module rõ ràng.

Ví dụ:

```text
Epic:
AI Opponent

Component:
AI
```

hoặc:

```text
Epic:
Authentication

Component:
Authentication
```

Nhưng với:

```text
Epic:
Online Multiplayer Experience
```

nếu nó trải rộng toàn hệ thống thì:

```text
Component:
[để trống]
```

là hoàn toàn hợp lý.

---

# 13. Quy tắc Component cho Story

Story cụ thể hơn Epic nên **nên có Component**.

Ví dụ:

```text
Story:
As a player,
I can create a game room.

Component:
Room Management
```

Hoặc:

```text
Story:
As a player,
I can see my opponent's move in real time.

Components:
Realtime
Game Engine
```

### Quy tắc đề xuất

```text
Recommended:
1 Component

Maximum:
2 Components
```

Nếu một Story cần:

```text
Frontend
Backend
Database
Realtime
Game Engine
```

thì có khả năng Story đang quá lớn và nên xem xét split.

---

# 14. Story không cần liệt kê tất cả technical implementation

Ví dụ:

```text
Story:
User can register an account
```

Không cần gắn:

```text
Frontend
Backend
Database
Authentication
```

chỉ vì implementation cần tất cả những thứ đó.

Story có thể đơn giản là:

```text
Component:
Authentication
```

Sau đó Task mới thể hiện implementation:

```text
Task:
Build Register UI
→ Frontend

Task:
Create register API
→ Backend

Task:
Hash password
→ Authentication

Task:
Update users schema
→ Database
```

Đây là cách quản lý sạch hơn.

---

# 15. Quy tắc Component cho Task

Task là nơi Component có giá trị cao nhất vì Task thường là một công việc kỹ thuật cụ thể.

### Khuyến nghị

```text
Component:
Recommended / Required

Normal:
1 Component

Cross-module:
2 Components

3+ Components:
Consider splitting
```

Ví dụ:

```text
Task:
Build login page
Component: Frontend
```

```text
Task:
Create POST /login
Component: Backend
```

```text
Task:
Validate JWT
Component: Authentication
```

```text
Task:
Create users table
Component: Database
```

---

# 16. Quy tắc Component cho Bug

Bug thường nên **bắt buộc có Component**, vì Component giúp xác định bug thuộc subsystem nào.

Ví dụ:

```text
Bug:
Opponent move doesn't appear after reconnecting

Component:
Realtime
```

hoặc:

```text
Bug:
Illegal knight movement is accepted

Component:
Game Engine
```

Điều này rất hữu ích khi muốn filter:

```text
Component = Game Engine
AND issuetype = Bug
```

để xem module nào đang có nhiều bug.

---

# 17. Quy tắc tổng quát theo Issue Type

Mình khuyên team bạn dùng convention này:

| Issue Type | Component | Recommended |
|---|---|---:|
| **Epic** | Optional | 0–1 |
| **Story** | Recommended | 1 |
| **Task** | Recommended/Required | 1 |
| **Bug** | Required | 1 |
| Cross-module issue | Allowed | 2 |
| 3+ Components | Nên xem xét split | — |

Có thể đặt rule nội bộ:

```text
EPIC
Recommended Components: 0–1
Maximum: 2

STORY
Recommended Components: 1
Maximum: 2

TASK
Recommended Components: 1
Maximum: 2

BUG
Recommended Components: 1
Maximum: 2
```

---

# 18. Cách hiểu Component ở từng level

Đây là cách mình khuyên team bạn áp dụng:

| Level | Component thể hiện |
|---|---|
| **Epic** | Domain/module lớn nếu rõ ràng |
| **Story** | Functional module |
| **Task** | Technical area |
| **Bug** | Module xảy ra lỗi |

Ví dụ:

```text
Epic:
Online Match

Component:
Multiplayer
```

↓


```text
Story:
Players can exchange moves in real time

Component:
Realtime
```

↓

```text
Task:
Implement Socket.IO move event

Component:
Backend
```

```text
Task:
Update board after opponent move

Component:
Frontend
```

```text
Task:
Validate received move

Component:
Game Engine
```

Đây là một cấu trúc rất hợp lý.

---

# 19. Component dựa trên nơi thay đổi chính

Đối với Task đặc biệt, có thể sử dụng thêm nguyên tắc:

> **Component = nơi chịu thay đổi code/trách nhiệm chính của Task.**

Ví dụ:

```text
Task:
Add Create Room button
```

Mặc dù button gọi API Backend, thay đổi chính nằm ở UI:

```text
Component:
Frontend
```

Không nhất thiết phải:

```text
Frontend + Backend
```

Nếu Backend API cũng cần implement, tạo Task Backend riêng sẽ tốt hơn.

---

# 20. Component nên ổn định

Component không nên thay đổi liên tục theo sprint.

Một Component tốt thường tồn tại nhiều tháng hoặc toàn bộ vòng đời project.

Ví dụ:

```text
Frontend
Backend
Game Engine
Realtime
Authentication
```

ổn định.

Trong khi:

```text
Sprint 3 Feature
October Feature
Login Fix
Urgent Work
```

không ổn định và không nên là Component.

---

# 21. Component và Labels khác nhau như thế nào?

Có thể hiểu:

### Component

Dùng cho **classification ổn định**:

```text
Frontend
Backend
Game Engine
Realtime
```

### Label

Dùng cho classification linh hoạt/tạm thời:

```text
performance
tech-debt
mvp
refactor
research
hotfix
```

Ví dụ:

```text
Task:
Optimize WebSocket reconnect

Component:
Realtime

Labels:
performance
tech-debt
```

---

# 22. Ví dụ hoàn chỉnh

Giả sử:

```text
EPIC
Online Match
```

Component:

```text
Multiplayer
```

Story:

```text
STORY
As a player,
I can play against another player in real time.

Component:
Realtime
```

Các Task:

```text
TASK
Create online chess board UI

Component:
Frontend
```

```text
TASK
Create match API

Component:
Backend
```

```text
TASK
Implement WebSocket connection

Component:
Realtime
```

```text
TASK
Validate player moves

Component:
Game Engine
```

```text
TASK
Save game result

Component:
Database
```

Bug:

```text
BUG
Player receives opponent move twice

Component:
Realtime
```

Cấu trúc:

```text
EPIC
Online Match
│
├── STORY
│   Play against another player
│   Component: Realtime
│
├── TASK
│   Chess board UI
│   Component: Frontend
│
├── TASK
│   Match API
│   Component: Backend
│
├── TASK
│   WebSocket connection
│   Component: Realtime
│
├── TASK
│   Move validation
│   Component: Game Engine
│
└── TASK
    Save match result
    Component: Database
```

---

# 23. Bộ quy tắc chính thức mình đề xuất cho team

Team bạn có thể đưa nguyên phần này vào tài liệu Jira Convention:

```text
COMPONENT ASSIGNMENT RULES

1. Components represent stable system modules or technical areas.

2. Components must not represent:
   - developers
   - priorities
   - sprints
   - temporary features
   - individual tasks

3. Epic Components are optional.
   Use them only when the Epic clearly belongs
   to a specific domain/module.

4. Stories should normally have one Component
   representing their primary functional module.

5. Tasks should normally have one Component
   representing the primary technical area affected.

6. Bugs must have a Component identifying
   the affected system module.

7. One issue should normally have one Component.

8. Maximum recommended Components per issue: 2.

9. If an issue requires 3 or more Components,
   consider splitting it into smaller issues.

10. Child issues do not need to use the same
    Component as their parent Epic or Story.

11. Assign the Component based on primary
    responsibility, not every module touched.

12. Use Labels for temporary or cross-cutting
    classifications instead of creating new Components.

13. Components should remain stable throughout
    the project lifecycle.

14. Avoid creating overly specific Components.
```

## Công thức ngắn nhất để team nhớ

> **Epic = Chúng ta đang xây tính năng lớn nào?**  
> **Story = Người dùng có thể làm được gì?**  
> **Task = Developer phải làm gì?**  
> **Component = Issue đó thuộc phần nào của hệ thống?**  
> **Label = Issue này còn có đặc điểm/phân loại gì?**

Và về số lượng:

```text
Epic   → 0–1 Component
Story  → 1 Component
Task   → 1 Component
Bug    → 1 Component

Cross-module → tối đa khoảng 2

3+ Components → xem xét split issue
```

Đây là convention mình khuyên dùng cho project của team bạn vì nó giữ **Epic/Story theo business/functional scope**, còn **Task/Bug đi sâu vào technical ownership**, tránh tình trạng tất cả issue đều bị gắn `Frontend + Backend + Database + ...` và làm Component mất giá trị.