# API 명세서 — 수강신청 미니 프로젝트

## Auth

| 권한   | Method | Endpoint            | 설명             | Request                                  | Response           |
| ------ | ------ | ------------------- | ---------------- | ---------------------------------------- | ------------------ |
| Public | POST   | `/auth/login`       | 학번/직번 로그인 | `idNumber` (string), `password` (string) | `{ access_token }` |
| Public | POST   | `/auth/login/admin` | 관리자 로그인    | `email` (string), `password` (string)    | `{ access_token }` |

## User

| 권한   | Method | Endpoint     | 설명           | Request                                                                                         | Response                                                      |
| ------ | ------ | ------------ | -------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 관리자 | POST   | `/users`     | 회원 등록      | Body: `name`(string), `email`(string), `phone`(string), `role`(enum: ADMIN\|PROFESSOR\|STUDENT) | User 객체 (password 제외) + professor/student (idNumber 포함) |
| 관리자 | GET    | `/users`     | 회원 목록      | Query: `role`(enum, optional)                                                                   | User[]                                                        |
| 회원   | GET    | `/users/me`  | 내 정보        | -                                                                                               | User 객체                                                     |
| 회원   | PATCH  | `/users/me`  | 내 정보 수정   | Body: `name?`, `email?`, `phone?` (모두 optional)                                               | 수정된 User 객체                                              |
| 관리자 | GET    | `/users/:id` | 특정 회원 조회 | Path: `id`(number)                                                                              | User 객체                                                     |
| 관리자 | PATCH  | `/users/:id` | 특정 회원 수정 | Path: `id`(number), Body: `name?`, `email?`, `phone?`                                           | 수정된 User 객체                                              |
| 관리자 | DELETE | `/users/:id` | 강제 탈퇴      | Path: `id`(number)                                                                              | soft-deleted User 객체                                        |

> 본인 셀프 탈퇴(`DELETE /users/me`)는 정책상 제외 — 가입처럼 탈퇴도 관리자 통제

## Course

| 권한               | Method | Endpoint       | 설명      | Request                                                                                                                                             | Response                          |
| ------------------ | ------ | -------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| 교수               | POST   | `/courses`     | 강의 개설 | Body: `title`(string), `courseType`(enum), `credits`(int 1~4), `capacity`(int ≥3), `timeTables`(array, 최소1개, `{dayOfWeek: enum, hour: int 1~9}`) | Course 객체 + timeTables[]        |
| 회원               | GET    | `/courses`     | 강의 목록 | Query: `title?`(부분검색), `professorId?`, `courseType?`, `year?`, `semesterType?` (모두 optional)                                                  | Course[] + timeTables[]           |
| 회원               | GET    | `/courses/:id` | 강의 단건 | Path: `id`(number)                                                                                                                                  | Course 객체 + timeTables[]        |
| 교수(본인)         | PATCH  | `/courses/:id` | 강의 수정 | Path: `id`(number), Body: `title?`, `courseType?`, `credits?`, `capacity?`, `timeTables?` (year/semesterType 변경 불가)                             | 수정된 Course 객체 + timeTables[] |
| 교수(본인)\|관리자 | DELETE | `/courses/:id` | 강의 삭제 | Path: `id`(number)                                                                                                                                  | 삭제된 Course 객체 + timeTables[] |

> - 강의의 `year`/`semesterType`은 서버가 현재 시점 기준으로 자동 계산하여 생성 시점에 고정. 클라이언트가 지정 불가, 수정 불가.
> - 강의 수정(PATCH)/삭제(DELETE)는 **수강생이 0명일 때만** 가능.
> - 시간표 변경 시 본인이 개설한 같은 학기의 다른 강의와 요일/교시 충돌 검사.

## Enrollment

| 권한            | Method | Endpoint                        | 설명               | Request                  | Response                                                                    |
| --------------- | ------ | ------------------------------- | ------------------ | ------------------------ | --------------------------------------------------------------------------- |
| 학생            | POST   | `/enrollments`                  | 수강 신청          | Body: `courseId`(number) | Enrollment 객체 + course.title                                              |
| 학생            | GET    | `/enrollments/me`               | 내 신청 목록       | -                        | Enrollment[] + course(title, professorId, courseType, capacity, timeTables) |
| 교수(본인 강의) | GET    | `/enrollments/course/:courseId` | 강의별 수강생 목록 | Path: `courseId`(number) | Enrollment[] + student(idNumber, user.name)                                 |
| 학생\|관리자    | DELETE | `/enrollments/:id`              | 신청 취소          | Path: `id`(number)       | 삭제된 Enrollment 객체 + course + student 상세                              |

> - 수강 신청 시 본인이 신청한 다른 과목과 요일/교시 충돌 검사.
> - 정원 초과 시 신청 불가 (count + create를 트랜잭션으로 묶어 동시성 제어).
> - 신청 취소는 시점 제한 없음. 취소 시 정원은 count 재계산 방식이라 별도 로직 없이 자동으로 빈 자리 발생.
