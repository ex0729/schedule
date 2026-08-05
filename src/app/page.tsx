import Link from "next/link";
import { ArrowRight, CalendarDays, Check, LockKeyhole } from "lucide-react";

export default function HomePage() {
  return (
    <main className="landing-shell">
      <nav className="top-nav" aria-label="주요 탐색">
        <Link href="/" className="brand"><span className="brand-mark">C</span><span>ClassLink</span></Link>
        <Link href="/auth" className="nav-action">로그인 <ArrowRight aria-hidden="true" /></Link>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <span className="hero-kicker"><span /> 강사와 교육회사를 잇는 일정 협업</span>
          <h1>물어보는 시간은 줄이고,<br /><em>가르치는 일에 집중하세요.</em></h1>
          <p>개인 일정은 안전하게 지키고, 출강 가능 여부와 배정 현황은 필요한 사람에게 정확히 전달합니다.</p>
          <div className="hero-actions">
            <Link href="/auth?mode=sign-up" className="primary-link">무료로 시작하기 <ArrowRight aria-hidden="true" /></Link>
            <span>설치 없이 웹에서 바로</span>
          </div>
          <ul className="trust-list" aria-label="핵심 원칙">
            <li><Check aria-hidden="true" /> 개인정보 기본 비공개</li>
            <li><Check aria-hidden="true" /> 회사별 공개 범위</li>
            <li><Check aria-hidden="true" /> 모바일·데스크톱 대응</li>
          </ul>
        </div>

        <div className="hero-visual" aria-label="일정 대시보드 미리보기">
          <div className="orb orb-one" /><div className="orb orb-two" />
          <div className="preview-card">
            <div className="preview-header"><div><span className="muted">8월 5일 수요일</span><strong>좋은 아침이에요, 김강사님</strong></div><span className="avatar">김</span></div>
            <div className="summary-row">
              <div className="summary-box"><CalendarDays /><span>오늘 일정</span><strong>3</strong></div>
              <div className="summary-box accent"><LockKeyhole /><span>공개 상태</span><strong>안전</strong></div>
            </div>
            <div className="timeline">
              <div className="timeline-title"><strong>오늘 일정</strong><span>전체 보기</span></div>
              <ScheduleRow time="10:00" title="AI 기초 수업" meta="서울 미래중학교 · 확정" tone="mint" />
              <ScheduleRow time="14:00" title="개인 일정" meta="회사에는 ‘출강 불가’로 표시" tone="violet" />
              <ScheduleRow time="17:30" title="출강 요청 확인" meta="메이커스 교육 · 응답 필요" tone="amber" />
            </div>
          </div>
          <div className="privacy-float"><LockKeyhole aria-hidden="true" /><div><strong>내 일정은 내가 통제해요</strong><span>상세 내용은 기본 비공개</span></div></div>
        </div>
      </section>
    </main>
  );
}

function ScheduleRow({ time, title, meta, tone }: { time: string; title: string; meta: string; tone: string }) {
  return <div className="schedule-row"><span className="schedule-time">{time}</span><i className={tone} /><div><strong>{title}</strong><span>{meta}</span></div></div>;
}
