# CURRENT STATUS

- 최종 갱신: 2026-08-05
- 기준: `prd.md` v0.1. 제품 요구사항 변경 없음.

## 완료

- 빈 저장소 분석 및 12개 프로젝트 문서 체계 구축.
- Next.js 16/React 19/TypeScript strict/Tailwind 4 기반 생성.
- 인증·역할 선택 수직 단위: 가입, 이메일 확인 callback, 로그인, 세션 갱신, 보호 화면, 로그아웃.
- 가입 입력·역할 검증 단위 테스트와 Supabase 프로필/RLS migration.

## 작업 중

- 없음.

## 다음 우선순위

1. BL-002 회사 생성·담당자 프로필·강사 초대/연결과 회사 범위 RLS.
2. BL-003 강사 프로필 및 기본 가능 시간.
3. BL-004 일정 CRUD·충돌 판정.

## 알려진 문제/차단 요소

- 실제 인증 E2E는 Supabase 프로젝트 URL/키와 migration 적용이 필요하다.
- 이메일 템플릿/redirect URL, rate limit, 운영 도메인은 미구성.
- 동시 역할/조직 전환, 응답 변경, 임시 일정 정책은 `[확인 필요]`.

## 테스트 상태

- 단위 테스트 4개 통과, TypeScript 통과, ESLint 오류·경고 없음, Next.js production build 통과.
- 로컬 브라우저에서 랜딩/회원가입 DOM·데스크톱 렌더링과 모바일 1열/가로 overflow 부재 확인.
- 외부 인증 E2E는 Supabase 환경 미구성으로 미실행.

## 최근 변경

- `src/app`, `src/components`, `src/domain`, `src/lib/supabase`, `src/proxy.ts`
- `supabase/migrations/202608050001_auth_profiles.sql`
- 루트 설정 파일과 `docs/*`

## 다음 AI가 먼저 읽을 내용

- `prd.md` → `docs/PROJECT_CONTEXT.md` → 이 문서 → `docs/DECISIONS.md`.
- user metadata를 권한 근거로 사용하지 말고 DB 프로필·멤버십과 RLS를 사용한다.
