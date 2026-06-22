# API 명세서 (개요) — 수강신청 미니 프로젝트

## Auth

| 권한   | Method | Endpoint            | 설명                                    |
| ------ | ------ | ------------------- | --------------------------------------- |
| Public | POST   | `/auth/login`       | 학번/직번 + 비밀번호 로그인 (학생/교수) |
| Public | POST   | `/auth/login/admin` | 이메일 + 비밀번호 로그인 (관리자)       |

## User

| 권한   | Method | Endpoint             | 설명                                                |
| ------ | ------ | -------------------- | --------------------------------------------------- |
| 관리자 | POST   | `/users`             | 회원 등록 (idNumber, 초기비번 0000 자동 생성)       |
| 관리자 | GET    | `/users`             | 회원 목록 조회 (쿼리: `role` 필터)                  |
| 회원   | GET    | `/users/me`          | 내 정보 조회                                        |
| 회원   | PATCH  | `/users/me`          | 내 정보 수정 (name, phone, email)                   |
| 회원   | PATCH  | `/users/me/password` | 비밀번호 변경 (최초 변경 시 activated: true로 전환) |
| 관리자 | GET    | `/users/:id`         | 특정 회원 조회                                      |
| 관리자 | PATCH  | `/users/:id`         | 특정 회원 정보 수정                                 |
| 관리자 | DELETE | `/users/:id`         | 특정 회원 강제 탈퇴 (soft delete)                   |

> 본인 셀프 탈퇴(`DELETE /users/me`)는 정책상 제외 — 가입처럼 탈퇴도 관리자 통제

## Course

| 권한                 | Method | Endpoint       | 설명                                                                                                                               |
| -------------------- | ------ | -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 교수                 | POST   | `/courses`     | 강의 개설. 연도/학기는 서버가 현재 시점 기준 자동 계산. TimeTable 동시 생성(nested write). 본인 다른 강의와 요일/교시 겹치면 안 됨 |
| 회원                 | GET    | `/courses`     | 강의 목록. 쿼리: title(부분검색), professorId, courseType, year, semesterType                                                      |
| 회원                 | GET    | `/courses/:id` | 강의 단건 조회                                                                                                                     |
| 교수(본인)           | PATCH  | `/courses/:id` | 강의 수정. year/semesterType 변경 불가. **수강생 0명일 때만 가능**. 시간표 변경 시 본인 다른 강의와 충돌 검사                      |
| 교수(본인) \| 관리자 | DELETE | `/courses/:id` | 강의 삭제. **수강생 0명일 때만 가능**                                                                                              |

## Enrollment

| 권한            | Method | Endpoint                        | 설명                                                                                          |
| --------------- | ------ | ------------------------------- | --------------------------------------------------------------------------------------------- |
| 학생            | POST   | `/enrollments`                  | 수강 신청. 본인 다른 과목과 요일/교시 겹치면 안 됨. 정원 초과 시 불가 (count+create 트랜잭션) |
| 학생            | GET    | `/enrollments/me`               | 내 수강 신청 목록                                                                             |
| 교수(본인 강의) | GET    | `/enrollments/course/:courseId` | 특정 강의 수강생 목록                                                                         |
| 학생 \| 관리자  | DELETE | `/enrollments/:id`              | 수강 신청 취소. 본인 것이거나 관리자, 시점 제한 없음                                          |
