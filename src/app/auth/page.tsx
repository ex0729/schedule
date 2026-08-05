import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ mode?: string; error?: string }> }) {
  const params = await searchParams;
  const initialMode = params.mode === "sign-up" ? "sign-up" : "sign-in";
  return (
    <main className="auth-shell">
      <section className="auth-aside">
        <Link href="/" className="back-link"><ArrowLeft aria-hidden="true" /> 홈으로</Link>
        <div className="auth-promise">
          <span className="brand-mark large">C</span>
          <h2>일정의 내용은 숨기고,<br />가능성만 연결합니다.</h2>
          <p>강사의 사생활과 교육회사의 운영 효율, 둘 다 포기하지 않는 일정 협업을 시작하세요.</p>
          <div className="privacy-note"><ShieldCheck aria-hidden="true" /><div><strong>Privacy by default</strong><span>개인 일정은 회사에 자동 공개되지 않습니다.</span></div></div>
        </div>
      </section>
      <section className="auth-main">
        {params.error === "confirmation" && <div className="page-alert" role="alert">이메일 확인 링크가 만료되었거나 올바르지 않습니다. 다시 로그인해 주세요.</div>}
        <AuthForm initialMode={initialMode} />
      </section>
    </main>
  );
}
