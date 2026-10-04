Được. Nếu mục tiêu của team bạn là **đọc Jira ticket là biết phải làm gì, làm tới đâu là xong, tự test thế nào trước khi chuyển Tester**, thì Description của **Epic / Story / Task không nên viết giống nhau**.

Có thể hiểu ngắn gọn:

> **Epic = Chúng ta đang xây cái gì và để đạt mục tiêu gì?**  
> **Story = Người dùng cần gì và hệ thống phải đáp ứng thế nào?**  
> **Task = Người được giao phải làm chính xác những gì, kết quả cuối cùng phải ra sao, và tự kiểm tra bằng cách nào?**

Trong đó **Task cần chi tiết nhất về mặt thực thi**.

---

# 1. Epic Description cần có gì?

Epic mô tả một **nhóm chức năng/business capability lớn**.

Ví dụ:

> User Authentication  
> Room Management  
> Online Chess Match  
> Chat System  
> Spectator System

Epic không cần nói developer phải sửa file nào hoặc viết API gì.

Nó cần trả lời những câu hỏi như:

- Epic này giải quyết vấn đề gì?
- Ai sử dụng chức năng này?
- Business/User goal là gì?
- Epic bao gồm những chức năng lớn nào?
- Epic **không bao gồm** những gì?
- Khi nào Epic được xem là hoàn thành?
- Có dependency nào với Epic khác không?

## Template Epic

```text
## Overview
Mô tả ngắn Epic này là gì.

## Goal
Mục tiêu cần đạt được.

## Users / Actors
Những ai sẽ sử dụng hoặc bị ảnh hưởng.

## Scope
Bao gồm:
- ...
- ...
- ...

## Out of Scope
Không bao gồm:
- ...
- ...

## Main Business Rules
- ...
- ...
- ...

## Success Criteria
Epic được coi là hoàn thành khi:
- ...
- ...
- ...

## Dependencies
- Epic / system / service liên quan
```

---

# 2. Ví dụ Epic

Ví dụ project Chinese Chess:

### Epic: Online Game Room

```text
## Overview

Cho phép người chơi tạo và tham gia phòng cờ để có thể chơi Chinese Chess trực tuyến với nhau.

## Goal

Người dùng có thể tạo một game room và mời người chơi khác tham gia trước khi bắt đầu trận đấu.

## Users / Actors

- Room Owner
- Player
- Spectator

## Scope

- Create room
- Join room
- Leave room
- Room invitation code
- Player slots
- Spectator slots
- Room status
- Start game

## Out of Scope

- Chess gameplay logic
- In-game chat
- Video call
- Match history

## Main Business Rules

- Một room tối đa có 2 players.
- Một room có thể có tối đa 2 spectators.
- Chỉ room owner được phép start game.
- Game chỉ được start khi đủ 2 players.

## Success Criteria

Epic hoàn thành khi user có thể:

1. Create room.
2. Invite another player.
3. Another player can join.
4. Spectator can join.
5. Owner can start game when room conditions are satisfied.

## Dependencies

- Authentication Epic
- User Profile
- Realtime Communication
```

---

# 3. Story Description cần có gì?

Story nằm dưới Epic và nên mô tả **một khả năng có giá trị với user**.

Format phổ biến:

> **As a** [user]  
> **I want** [capability]  
> **So that** [benefit]

Nhưng chỉ ba dòng này **chưa đủ**.

Một Story tốt phải trả lời:

- Ai cần chức năng?
- Họ muốn làm gì?
- Tại sao cần?
- User flow như thế nào?
- Business rules là gì?
- Những trường hợp lỗi nào cần xử lý?
- Hệ thống phải hành xử như thế nào?
- Điều kiện nào để Story được chấp nhận?

---

# 4. Template Story

```text
## User Story

As a [user]
I want [feature]
So that [benefit]

## Description

Mô tả chi tiết chức năng.

## Preconditions

- User phải ...
- System phải ...
- ...

## Main Flow

1. User ...
2. System ...
3. User ...
4. System ...

## Business Rules

- BR-01: ...
- BR-02: ...
- BR-03: ...

## Validation / Error Cases

- Nếu ...
  → System ...

- Nếu ...
  → System ...

## Acceptance Criteria

AC-01:
Given ...
When ...
Then ...

AC-02:
Given ...
When ...
Then ...

## Out of Scope

- ...
- ...

## Dependencies

- ...
```

---

# 5. Ví dụ Story

### Story: Create Game Room

```text
## User Story

As an authenticated player
I want to create a game room
So that I can invite another player to play Chinese Chess.

## Preconditions

- User must be logged in.

## Main Flow

1. User opens the game lobby.
2. User clicks "Create Room".
3. System creates a new room.
4. System generates a unique room code.
5. User becomes the room owner.
6. User enters the waiting room.

## Business Rules

BR-01:
Each room must have a unique room code.

BR-02:
The room creator becomes the room owner.

BR-03:
Maximum number of players is 2.

BR-04:
Maximum number of spectators is 2.

## Error Cases

If room creation fails:
- System must not navigate user to waiting room.
- Error message must be displayed.

## Acceptance Criteria

AC-01

Given the user is authenticated
When the user clicks "Create Room"
Then a new room must be created.

AC-02

Given a room is successfully created
Then the system must generate a unique room code.

AC-03

Given the room is successfully created
Then the creator must become the room owner.
```

Story dừng ở mức **hành vi của hệ thống**, chưa cần nói:

> tạo POST `/api/rooms`

vì đó bắt đầu đi vào **Task**.

---

# 6. Task quan trọng nhất

Đây là phần bạn đang quan tâm nhất.

Task phải viết sao cho Developer đọc xong có thể trả lời ngay:

> Tôi phải làm gì?

> Tôi phải sửa hoặc tạo phần nào?

> Input là gì?

> Output mong muốn là gì?

> Logic nào phải implement?

> Những trường hợp nào phải xử lý?

> Cái gì không thuộc task này?

> Làm sao biết tôi làm đúng?

> Tôi phải tự test những gì trước khi chuyển QA?

Nếu developer vẫn phải hỏi:

> "Task này muốn em làm gì vậy?"

thì Task Description đang thiếu thông tin.

---

# 7. Cấu trúc Task mình khuyên team bạn sử dụng

Một Task tốt nên có ít nhất:

```text
1. Objective
2. Context
3. Scope
4. Requirements
5. Technical Requirements
6. Business Rules
7. Expected Result
8. Error / Edge Cases
9. Acceptance Criteria
10. Developer Self-Test
11. Definition of Done
12. Out of Scope
13. Dependencies
14. References
```

Không phải task nào cũng cần tất cả, nhưng **Objective + Requirements + Acceptance Criteria + Self-Test + DoD** gần như nên bắt buộc.

---

# 8. Objective

Trả lời:

> Task này cần đạt kết quả gì?

Không viết:

❌

```text
Implement create room.
```

Tốt hơn:

```text
Implement the backend API that allows an authenticated user
to create a new game room.

After successful creation, the system must return the newly
created room including its unique room code and owner information.
```

Developer đọc vào sẽ biết ngay **deliverable cuối cùng là gì**.

---

# 9. Context

Giải thích Task xuất phát từ Story nào và tại sao cần.

Ví dụ:

```text
## Context

This task implements the backend portion of Story CHESS-32
"Create Game Room".

The frontend needs an API that creates a room before redirecting
the user to the waiting room.
```

Phần này giúp developer hiểu:

> Mình đang xây một miếng nào trong hệ thống?

---

# 10. Scope

Đây là một trong những phần quan trọng nhất.

Phải nói rõ:

### In Scope

```text
- Create room API
- Generate room code
- Save room to database
- Assign creator as room owner
- Return created room
```

### Out of Scope

```text
- Join room
- Start game
- Spectator logic
- Room chat
- Frontend UI
```

Điều này ngăn developer "làm luôn tiện thể".

---

# 11. Requirements

Đây là danh sách **chính xác developer phải implement**.

Ví dụ:

```text
## Requirements

REQ-01
Create API:

POST /api/rooms

REQ-02
Only authenticated users can create a room.

REQ-03
System must generate a unique 6-character room code.

REQ-04
Room creator must automatically become the room owner.

REQ-05
Initial room status must be WAITING.

REQ-06
Room must be persisted in database.

REQ-07
API must return the created room information.
```

Có ID như `REQ-01`, `REQ-02` rất hữu ích.

Tester cũng có thể map:

```text
TC-01 → REQ-01
TC-02 → REQ-02
```

---

# 12. Input / Output

Đối với Backend Task nên ghi cực kỳ rõ.

Ví dụ:

```text
## API

POST /api/rooms
```

Input:

```json
{}
```

Authentication:

```text
Bearer Token required
```

Expected response:

```json
{
  "id": "uuid",
  "roomCode": "A8K2PX",
  "ownerId": "user-id",
  "status": "WAITING",
  "createdAt": "timestamp"
}
```

HTTP:

```text
201 Created
```

Errors:

```text
401 Unauthorized
500 Internal Server Error
```

Developer lúc này gần như không cần đoán.

---

# 13. Business Rules

Ví dụ:

```text
## Business Rules

BR-01
Room code must be unique.

BR-02
Room code must contain exactly 6 uppercase alphanumeric characters.

BR-03
Room creator becomes OWNER.

BR-04
New room status must always be WAITING.

BR-05
New room initially contains only one player: the creator.
```

Business Rules nên đến từ Story/BA requirements.

---

# 14. Edge Cases

Task tốt **không chỉ mô tả Happy Path**.

Phải nghĩ tới:

```text
## Edge Cases

1. User is not authenticated
   → Return 401.

2. Generated room code already exists
   → Generate another code.

3. Database insert fails
   → Return error and do not return partial room data.

4. User account no longer exists
   → Return appropriate error.
```

Đây cũng chính là những case developer phải tự test.

---

# 15. Acceptance Criteria

Task vẫn nên có Acceptance Criteria.

Ví dụ:

```text
## Acceptance Criteria

AC-01

Given an authenticated user
When POST /api/rooms is called
Then a new room must be created.

AC-02

Given a new room is created
Then the creator must be assigned as room owner.

AC-03

Given a new room is created
Then its initial status must be WAITING.

AC-04

Given two rooms are created
Then their room codes must not be identical.

AC-05

Given an unauthenticated request
When POST /api/rooms is called
Then the API must return 401.
```

---

# 16. Phần rất quan trọng: Developer Self-Test

Đây chính là thứ team bạn nên **bắt buộc có trong mọi Task có code**.

Không nên chỉ ghi:

```text
Developer must test before moving to QA.
```

Câu đó gần như vô dụng.

Hãy cho developer một checklist cụ thể.

Ví dụ:

```text
## Developer Self-Test

Before moving this task to Ready for QA, developer must verify:

Functional

[ ] Authenticated user can create a room.

[ ] Room is saved correctly in database.

[ ] Room ownerId equals current user ID.

[ ] Room status is WAITING.

[ ] Room code contains exactly 6 characters.

[ ] Creating multiple rooms does not produce duplicate room codes.

Error Handling

[ ] Unauthenticated request returns 401.

[ ] Invalid authentication token is rejected.

[ ] Database error does not create incomplete data.

API

[ ] API returns HTTP 201 on success.

[ ] Response body matches API contract.

[ ] No sensitive user information is returned.

Regression

[ ] Existing room APIs still work.

Automated Tests

[ ] Unit tests pass.

[ ] Integration tests pass.

[ ] Existing test suite passes.
```

Đây là cách biến:

> "Developer tự test đi"

thành một **quy trình có thể kiểm soát**.

---

# 17. Developer cần ghi lại kết quả Self-Test

Mình còn khuyên team bạn yêu cầu developer **không chỉ tick checkbox**.

Sau khi làm xong họ comment vào ticket:

```text
Developer Self-Test Result

Environment:
Local

Branch:
feature/CHESS-42-create-room

Tested:

PASS - Create room with valid authenticated user
PASS - Room stored in database
PASS - Owner assigned correctly
PASS - WAITING status assigned
PASS - Unique room code generated
PASS - Unauthorized request returns 401
PASS - Unit tests
PASS - Integration tests

Evidence:

POST /api/rooms

Response:
201 Created

{
  "id": "...",
  "roomCode": "A8K2PX",
  "status": "WAITING"
}
```

Lúc này Tester vào ticket sẽ thấy:

> Developer đã test cái gì?

Tester **không cần test lại một cách mù quáng**.

Tester tập trung vào independent verification + edge cases + regression.

---

# 18. Definition of Done của Task

Self-Test và Definition of Done khác nhau.

### Self-Test

> Tôi đã kiểm tra chức năng hoạt động đúng chưa?

### Definition of Done

> Task đã đủ điều kiện để chuyển khỏi Development chưa?

Ví dụ:

```text
## Definition of Done

[ ] All requirements implemented.

[ ] All acceptance criteria satisfied.

[ ] Code follows project coding standards.

[ ] No debug code / console logs remain.

[ ] Unit tests added or updated where applicable.

[ ] All tests pass.

[ ] Developer self-test completed.

[ ] Pull Request created.

[ ] Code review completed.

[ ] No unresolved critical review comments.

[ ] Documentation updated if required.

[ ] Ready for QA.
```

---

# 19. Flow mình khuyên team bạn dùng trên Jira

Một workflow khá sạch:

```text
TO DO
 ↓
IN PROGRESS
 ↓
CODE REVIEW
 ↓
DEV TESTING
 ↓
READY FOR QA
 ↓
QA TESTING
 ↓
DONE
```

Ở bước:

### DEV TESTING

Developer phải chạy **Developer Self-Test Checklist**.

Chỉ khi tất cả case cần thiết PASS mới chuyển:

```text
DEV TESTING
      ↓
READY FOR QA
```

---

# 20. Task hoàn chỉnh trông như thế nào?

Ví dụ toàn bộ:

## Task

**[Backend] Implement Create Room API**

```text
## Objective

Implement an API that allows an authenticated player to create
a new Chinese Chess game room.

After successful creation, the room must be stored in database
and returned to the client.

---

## Context

Parent Story:
CHESS-32 Create Game Room

The frontend requires this API before redirecting the room owner
to the waiting room.

---

## Scope

In Scope:

- Create room endpoint
- Generate room code
- Create room database record
- Assign room owner
- Set initial room status
- Return room information

Out of Scope:

- Join room
- Start game
- Spectator
- Chat
- Frontend UI

---

## API

POST /api/rooms

Authentication:
Bearer Token required

Success:

201 Created

Response:

{
  "id": "uuid",
  "roomCode": "A8K2PX",
  "ownerId": "uuid",
  "status": "WAITING",
  "createdAt": "timestamp"
}

---

## Requirements

REQ-01
Only authenticated users can create rooms.

REQ-02
Generate a unique 6-character room code.

REQ-03
Creator becomes room owner.

REQ-04
Room status must initially be WAITING.

REQ-05
Room must be persisted in database.

REQ-06
API must return created room information.

---

## Business Rules

BR-01
Room code must be unique.

BR-02
Room code contains uppercase letters and numbers.

BR-03
A newly created room contains only the owner.

---

## Error Handling

Unauthenticated request
→ 401 Unauthorized

Invalid token
→ 401 Unauthorized

Database error
→ 500 Internal Server Error

Room-code collision
→ Generate a new room code.

---

## Acceptance Criteria

AC-01

Given an authenticated user
When POST /api/rooms is called
Then a new room must be created.

AC-02

Given a room is created
Then creator becomes room owner.

AC-03

Given a room is created
Then its status must be WAITING.

AC-04

Given the user is unauthenticated
When the API is called
Then system returns 401.

---

## Developer Self-Test

[ ] Valid authenticated user can create room

[ ] Room record exists in DB

[ ] Correct ownerId stored

[ ] Status = WAITING

[ ] Room code length = 6

[ ] Room code is unique

[ ] Unauthorized request returns 401

[ ] Correct 201 response

[ ] Response matches contract

[ ] Unit tests pass

[ ] Integration tests pass

[ ] Existing tests still pass

---

## Definition of Done

[ ] Requirements implemented

[ ] Acceptance Criteria satisfied

[ ] Self-Test completed

[ ] Automated tests pass

[ ] Code follows coding standards

[ ] PR created

[ ] Code reviewed

[ ] No critical review comments

[ ] Ready for QA
```

---

# 21. Với Frontend Task thì Self-Test khác Backend

Ví dụ:

**[Frontend] Implement Create Room Button**

Developer Self-Test nên là:

```text
## Developer Self-Test

UI

[ ] Create Room button is displayed correctly.

[ ] Button matches Figma/design.

[ ] Loading state is displayed.

[ ] Button cannot be double-clicked while request is processing.

Functional

[ ] Clicking Create Room calls POST /api/rooms.

[ ] Successful response redirects user to waiting room.

[ ] Correct room information is displayed.

Error

[ ] API failure displays error message.

[ ] User remains on current page when request fails.

Responsive

[ ] Desktop layout works.

[ ] Tablet layout works.

[ ] Mobile layout works.

Regression

[ ] Existing lobby functions still work.

Code Quality

[ ] No console errors.

[ ] No console.log/debug code.

[ ] Frontend tests pass.
```

---

# 22. Với Database Task

Ví dụ:

```text
## Developer Self-Test

[ ] Migration executes successfully.

[ ] Migration rollback works.

[ ] Correct columns created.

[ ] Correct data types used.

[ ] Primary Key works.

[ ] Foreign Keys work.

[ ] UNIQUE constraints work.

[ ] NOT NULL constraints work.

[ ] Existing records are not corrupted.

[ ] Application starts correctly after migration.
```

---

# 23. Với DevOps Task

Ví dụ:

```text
## Developer Self-Test

[ ] Deployment succeeds.

[ ] Environment variables are available.

[ ] Service starts successfully.

[ ] Health check returns success.

[ ] Application can connect to database.

[ ] Logs contain no startup errors.

[ ] Restart does not break service.

[ ] Previous functionality remains available.
```

---

# 24. Quy tắc viết Task rất quan trọng

Mình khuyên team bạn áp dụng nguyên tắc:

## Một Task phải trả lời được 7 câu hỏi

**1. WHY**

> Tại sao phải làm task này?

→ Context / Objective

**2. WHAT**

> Phải làm cái gì?

→ Requirements

**3. WHERE**

> Làm ở phần nào của hệ thống?

→ Component / Scope / Technical Area

**4. HOW SHOULD IT BEHAVE**

> Sau khi làm xong hệ thống phải hoạt động thế nào?

→ Business Rules + Expected Behavior

**5. WHAT CAN GO WRONG**

> Các trường hợp lỗi là gì?

→ Error Handling / Edge Cases

**6. HOW DO I VERIFY IT**

> Developer tự biết mình làm đúng bằng cách nào?

→ Developer Self-Test

**7. WHEN IS IT DONE**

> Khi nào task được coi là hoàn thành?

→ Acceptance Criteria + Definition of Done

Nếu một Task trả lời được **7 câu này**, thường developer có thể tự làm mà không phải hỏi BA/Leader quá nhiều.

---

# 25. Phân biệt Acceptance Criteria và Self-Test

Đây là chỗ team rất hay nhầm.

### Acceptance Criteria

Mô tả:

> **Hệ thống phải đạt điều gì?**

Ví dụ:

```text
Given authenticated user
When user creates a room
Then room must be created successfully.
```

### Developer Self-Test

Mô tả:

> **Developer phải kiểm tra những gì để chứng minh AC đã đạt?**

Ví dụ:

```text
[ ] Call POST /api/rooms with valid token
[ ] Confirm HTTP 201
[ ] Confirm room exists in DB
[ ] Confirm ownerId
[ ] Confirm status = WAITING
```

### Tester Test Case

Đi sâu hơn nữa:

```text
TC-ROOM-001
Create room with valid user.

TC-ROOM-002
Create room without token.

TC-ROOM-003
Create room with expired token.

TC-ROOM-004
Generate duplicate room code.

TC-ROOM-005
Database unavailable.
```

Nói cách khác:

```text
Acceptance Criteria
        ↓
Developer Self-Test
        ↓
QA Test Cases
```

Ba thứ liên quan nhưng **không phải một thứ**.

---

# 26. Epic → Story → Task nên liên kết như thế nào?

Ví dụ:

```text
EPIC
Online Room Management
│
├── STORY
│   Create Game Room
│
│   ├── TASK
│   │   [BE] Create Room API
│   │
│   ├── TASK
│   │   [DB] Create Room schema
│   │
│   └── TASK
│       [FE] Create Room UI
│
├── STORY
│   Join Game Room
│
│   ├── TASK
│   │   [BE] Join Room API
│   │
│   └── TASK
│       [FE] Join Room UI
│
└── STORY
    Leave Game Room
```

Như vậy:

**Epic** quản lý business capability.

**Story** quản lý user behavior.

**Task** quản lý công việc thực thi.

---

# 27. Mình khuyên team bạn chuẩn hóa Jira Description như sau

### EPIC

```text
Overview
Goal
Users
Scope
Out of Scope
Business Rules
Success Criteria
Dependencies
```

### STORY

```text
User Story
Description
Preconditions
Main Flow
Business Rules
Error / Alternative Flows
Acceptance Criteria
Out of Scope
Dependencies
```

### TASK

```text
Objective
Context
Scope
Requirements
Technical Requirements
Expected Result
Business Rules
Error / Edge Cases
Acceptance Criteria
Developer Self-Test
Definition of Done
Dependencies
References
```

Và nếu chỉ chọn **5 mục bắt buộc nhất cho Task**, mình sẽ bắt buộc:

```text
Objective
Requirements
Acceptance Criteria
Developer Self-Test
Definition of Done
```

Đặc biệt, với team software của bạn, mình sẽ coi **`Developer Self-Test` là mandatory field trước khi chuyển ticket sang Ready for QA**. Điều này giải quyết đúng vấn đề bạn nói: người được giao không chỉ biết chính xác cần code gì mà còn biết **phải tự chứng minh phần mình làm hoạt động đúng trước khi Tester kiểm duyệt lại**.