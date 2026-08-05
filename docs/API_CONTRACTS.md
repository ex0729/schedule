# API CONTRACTS

- 최종 갱신: 2026-08-05
- 원칙: 서버 액션도 API 계약과 동일하게 인증·인가·검증·감사 규칙을 따른다.

## 구현된 계약

### `signUp(previousState, FormData)`

- 인증: 불필요. 입력: `fullName`, `email`, `password`, `role`.
- 검증: 이메일 RFC 실용 형식/254자, 이름 2~50자, 비밀번호 8~72자·영문/숫자, 허용 역할 enum.
- 결과: 세션이 있으면 `/dashboard` redirect, 이메일 확인이 필요하면 일반 성공 메시지.
- 오류: 필드 오류 또는 계정 생성 실패 일반 메시지. 계정 열거 정보를 노출하지 않는다.
- 부수효과: Auth 계정 및 DB trigger를 통한 `user_profiles` 생성.

### `signIn(previousState, FormData)` / `signOut()`

- 로그인 입력: email/password. 성공: HttpOnly cookie session 후 `/dashboard`.
- 로그아웃 인증: 현재 세션. 성공: 서버 세션 폐기 후 `/`.
- 재시도: 로그인은 멱등적 결과, 가입 중복은 일반 오류. 운영 rate limit 필요.

### `GET /auth/callback`

- 입력: `token_hash + type` 또는 PKCE `code`.
- 성공: 세션 교환 후 `/dashboard`; 실패: `/auth?error=confirmation`.
- 토큰/코드는 로그에 기록하지 않는다.

## 다음 계약 초안

| 액션/리소스 | 인증·권한 | 입력/출력 | 동시성·오류 |
|---|---|---|---|
| createCompany | company_member | 회사 필수정보 → company | idempotency key, validation |
| inviteInstructor | 활성 회사 멤버 | email/회사 → connection pending | 중복 초대 unique |
| acceptConnection | 초대 강사 | connection id → active | 만료/이미 처리 409 |
| createScheduleEvent | 일정 소유 강사 | 시간·종류·공개 → event+conflicts | version, overlap 409/경고 정책 |
| listCalendar | 일정 소유 강사 | range/cursor/filter → events | 최대 범위 제한 |
| setPermissionPolicy | 연결 강사 | company/level/기간 → policy | 연결 확인, version |
| searchAvailableInstructors | 활성 회사 멤버 | class 조건 → 계산 상태 목록 | 원본 일정 필드 반환 금지 |
| sendDispatchRequest | 활성 회사 멤버 | class/candidate ids/idempotency | 회사·연결 검증, 중복 방지 |
| respondToRequest | 수신 강사 | recipient/response/note/version | 마감/변경 정책 `[확인 필요]` |
| assignInstructors | 활성 회사 멤버 | class/instructor ids/version | transaction, 인원/충돌 409 |

## 공통 규칙

- 오류 형식: `{ code, message, fieldErrors?, recovery?, requestId }`. 사용자 메시지와 내부 원인을 분리한다.
- 페이지네이션: 목록은 cursor 기반, 기본 25/최대 100. 캘린더는 명시적 기간 기반.
- 멱등성: 요청 발송·배정은 `company_id + idempotency_key` unique.
- 동시성: 변경 가능한 aggregate는 `version` 또는 조건부 updated_at 비교. 배정은 DB transaction/lock.
- 테넌트 리소스 ID는 추측 불가능성과 무관하게 권한 검사를 거친다.
