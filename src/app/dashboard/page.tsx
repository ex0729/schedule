import { redirect } from "next/navigation";
import { Building2, CalendarDays, GraduationCap, LogOut, ShieldCheck, Users } from "lucide-react";
import { ROLE_LABELS, roleFromMetadata } from "@/domain/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/auth");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("full_name, role")
    .eq("user_id", user.id)
    .maybeSingle();
  const role = roleFromMetadata(user.app_metadata.role ?? profile?.role);
  const fullName = typeof profile?.full_name === "string" ? profile.full_name : "사용자";
  const isInstructor = role === "instructor";
  const isAdmin = role === "service_admin";
  const RoleIcon = isAdmin ? ShieldCheck : isInstructor ? GraduationCap : Building2;
  const nextStep = isAdmin
    ? "회원·회사·강사 운영 현황 관리"
    : isInstructor
      ? "회사 연결과 강사 프로필 등록"
      : "회사 정보와 담당자 프로필 등록";

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <span className="brand"><span className="brand-mark">C</span><span>ClassLink</span></span>
        <form action={signOut}><button className="ghost-button" type="submit"><LogOut aria-hidden="true" /> 로그아웃</button></form>
      </header>
      <section className="welcome-panel">
        <div className={`role-icon${isAdmin ? " admin" : ""}`}><RoleIcon /></div>
        <span className="eyebrow">{isAdmin ? "관리자 인증 완료" : "계정 설정 완료"}</span>
        <h1>{fullName}님, 환영합니다.</h1>
        <p>{role ? `${ROLE_LABELS[role]} 작업 공간이 안전하게 준비되었습니다.` : "역할 정보 확인이 필요합니다."}</p>
        <div className="setup-status">
          <div><ShieldCheck /><span><strong>인증된 세션</strong>서버에서 사용자 신원을 확인했습니다.</span></div>
          <div>{isAdmin ? <Users /> : <CalendarDays />}<span><strong>다음 단계</strong>{nextStep}</span></div>
        </div>
        <p className="coming-next">{isAdmin ? "서비스 관리자 권한으로 로그인했습니다." : "다음 기능은 백로그의 회사·강사 연결 수직 단위에서 제공됩니다."}</p>
      </section>
    </main>
  );
}
