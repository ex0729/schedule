# ARCHITECTURE

- 최종 갱신: 2026-08-05
- 상태: 초기 아키텍처 / 인증 수직 단위 구현

## 시스템 구성

```text
Browser / PWA candidate
  → Next.js 16 App Router (RSC + Client Components + Server Actions/Route Handlers)
    → Supabase Auth (cookie session, email/password)
    → PostgreSQL (RLS, constraints, migrations)
    → Realtime / notification worker (후속 단계)
```

## 선택한 기술

- 프런트엔드: Next.js 16.3.0, React 19.2.8, TypeScript strict, Tailwind CSS 4.3.3.
- 백엔드: Next.js 서버 액션·Route Handler와 Supabase 관리형 PostgreSQL/Auth를 우선안으로 채택.
- 검증: Zod. 테스트: Vitest, 후속 E2E는 Playwright 예정.
- 아이콘: Lucide. 의미는 텍스트/배지와 함께 제공한다.

## 컴포넌트 경계

- `src/app`: 라우팅, 서버 컴포넌트, 서버 액션.
- `src/components`: 상호작용 UI. 클라이언트 컴포넌트는 필요한 곳에만 둔다.
- `src/domain`: 상태값, 스키마, 권한·일정 계산처럼 프레임워크와 무관한 로직.
- `src/lib/supabase`: 외부 서비스 어댑터. 환경 설정과 쿠키 세션 처리를 격리한다.
- `supabase/migrations`: 스키마, RLS, DB 함수의 유일한 변경 이력.

## 인증과 권한

- 브라우저 세션은 Supabase SSR의 HttpOnly 쿠키 흐름을 사용한다.
- `proxy.ts`는 토큰 갱신만 담당하며, 실제 보호 화면은 `auth.getUser()`로 서버 재검증한다.
- 회원가입 시 역할은 `user_profiles.role`에 기록되고 사용자가 직접 변경할 수 없다. 사용자 metadata는 인가 근거로 쓰지 않는다.
- 향후 권한은 회사 멤버십 + 리소스 소유권 + 연결 상태를 서버와 RLS 양쪽에서 검증한다.

## 데이터와 멀티테넌시

- 모든 회사 소유 테이블은 `company_id`를 보유한다.
- 회사 범위 쿼리는 현재 사용자의 활성 `company_members` 행을 기준으로 제한한다.
- 강사 일정 원문과 회사용 가능 상태 계산 결과의 API/뷰를 분리한다.
- 상태 변경과 최종 배정은 트랜잭션 및 조건부 갱신으로 동시성을 제어한다.

## 알림

- MVP 후보: DB 이벤트 → outbox → 비동기 worker → 앱 내 알림/이메일.
- 알림 전송 실패가 핵심 트랜잭션을 롤백하지 않도록 outbox 패턴을 사용한다.
- 카카오톡 자동 발송은 MVP 제외다.

## 환경과 배포

- local/staging/production Supabase 프로젝트와 비밀정보를 분리한다.
- `.env.local`은 커밋하지 않고 `.env.example`만 유지한다.
- CI 게이트: 설치 고정(lockfile), lint, typecheck, unit, build, 핵심 E2E, migration 검증.
- 운영 전 오류 추적, 감사 로그 보관, PITR/백업 복구 훈련, rate limit을 구성한다.

## 확장 전략과 제약

- PWA manifest/offline shell은 캘린더 읽기 모델이 안정된 뒤 추가한다.
- 모바일 앱은 동일 API/권한 모델을 재사용할 수 있도록 도메인 로직을 UI에서 분리한다.
- `@supabase/ssr` API 변경 가능성을 어댑터 내부로 제한한다.
- 공급자 이전 시 Auth 사용자와 RLS 정책 이관 비용이 있으나 표준 PostgreSQL 스키마로 데이터 종속을 줄인다.
