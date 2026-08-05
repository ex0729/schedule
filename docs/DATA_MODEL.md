# DATA MODEL

- 최종 갱신: 2026-08-05
- 시간 저장: `timestamptz`(UTC 정규화), 표시: 사용자 IANA time zone
- 삭제 원칙: 운영 데이터는 기본 soft delete/상태 전이, 계정 삭제는 법률·보관 정책 확정 후 비식별화와 물리 삭제를 조합한다.

## 엔터티 초안

| 엔터티 | 핵심 필드 | 관계/제약 | 개인정보 |
|---|---|---|---|
| UserProfile | user_id, full_name, role | `auth.users` 1:1, 역할 직접 수정 불가 | 식별정보 |
| InstructorProfile | user_id, phone, regions, specialties, audiences, timezone | 사용자당 0..1 | 연락처/프로필 |
| Company | id, name, address, status | 회사 이름만으로 유일성 강제 안 함 | 회사정보 |
| CompanyMember | company_id, user_id, role, status | `(company_id,user_id)` unique | 소속정보 |
| InstructorCompanyConnection | instructor_id, company_id, status, invited_by | `(instructor_id,company_id)` unique | 관계정보 |
| AvailabilityRule | instructor_id, weekday, start_local, end_local, timezone, effective range | 시작 < 종료 | 일정 파생정보 |
| ScheduleEvent | owner_id, kind, status, starts_at, ends_at, timezone, all_day, visibility, title, location, memo | 시작 < 종료, cancelled 제외 충돌 | 제목/장소/메모 민감 |
| ClassSession | company_id, title, starts_at, ends_at, region, subject, audience, required_count, status | required_count > 0 | 기관 담당자 포함 가능 |
| DispatchRequest | company_id, class_session_id, status, deadline | 수업당 복수 가능 | 업무정보 |
| DispatchRequestRecipient | request_id, instructor_id, delivery_status | `(request_id,instructor_id)` unique | 관계정보 |
| InstructorResponse | recipient_id, response, note, version | recipient별 활성 응답 1개 | 강사 메모 |
| Assignment | class_session_id, instructor_id, status, assigned_at | 활성 중복 배정 방지 | 업무정보 |
| PermissionPolicy | connection_id, visibility, valid_from, valid_until | 회사별 정책 | 공개정책 |
| Notification | user_id, type, payload_ref, read_at | payload에 원문 최소화 | 행동정보 |
| AuditLog | actor_id, company_id, action, resource, before/after hash, created_at | append-only | 접근·변경 기록 |

## 상태값

- 역할: `instructor`, `company_member`. 동시 역할/전환은 `[확인 필요]`.
- 일정 종류: `personal`, `class`, `availability`, `unavailability`, `dispatch_hold`.
- 일정 상태: `tentative`, `confirmed`, `changed`, `cancelled`.
- 공개 수준: `details`, `classes_only`, `availability_only`, `private`.
- 계산 상태: `available`, `unavailable`, `needs_confirmation`, `unregistered`, `conflict`.
- 응답: `available`, `unavailable`, `adjustable`, `needs_details`.
- 배정: `unassigned`, `candidate`, `assigning`, `assigned`, `cancelled`.

상태값은 PostgreSQL enum 또는 check constraint와 TypeScript 단일 정의를 동기화한다. 외부 표시 문자열을 DB 값으로 사용하지 않는다.

## 관계와 격리

- User ↔ Company는 CompanyMember로 N:M, Instructor ↔ Company는 Connection으로 N:M을 수용한다.
- 한 ClassSession은 여러 Assignment를 가질 수 있으나 활성 배정 수는 필요한 인원을 넘지 않도록 트랜잭션에서 잠금/검증한다.
- 개인 ScheduleEvent 원문은 강사 본인만 기본 조회한다. 회사는 권한 계산 함수가 반환한 상태/허용 필드만 조회한다.
- 회사 테이블의 모든 RLS는 요청 사용자의 활성 멤버십을 확인한다.

## 일정 충돌

- 반열린 구간 `[starts_at, ends_at)`을 사용한다. `a.starts_at < b.ends_at AND b.starts_at < a.ends_at`이면 중복이다.
- `cancelled`는 제외한다. 종일 일정은 사용자 timezone의 날짜 경계를 UTC로 변환한다.
- 임시 일정은 현재 `needs_confirmation`으로 계산하는 안을 제시하되 정책은 `[확인 필요]`다.
- PostgreSQL range/GiST exclusion constraint는 확정 일정의 강제 충돌 방지가 승인되면 적용한다.

## 인덱스 초안

- `(company_id, status, starts_at)`, `(owner_id, starts_at, ends_at)`, `(instructor_id, status)`.
- 요청 수신자 `(instructor_id, created_at desc)`, 알림 `(user_id, read_at, created_at desc)`.
- 검색이 확정되면 지역/분야 배열 대신 정규화된 연결 테이블과 적절한 GIN/B-tree를 선택한다.

## 현재 마이그레이션

- `202608050001_auth_profiles.sql`: `user_role`, `user_profiles`, 가입 트리거, 본인 읽기 RLS.
- 마이그레이션은 추가 전용이며 적용된 파일을 수정하지 않는다.
