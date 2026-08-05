"use client";

import { useActionState, useState } from "react";
import { Building2, GraduationCap, LoaderCircle } from "lucide-react";
import { INITIAL_AUTH_STATE, type UserRole } from "@/domain/auth";
import { signIn, signUp } from "@/app/auth/actions";

type Mode = "sign-in" | "sign-up";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="field-error">{errors[0]}</p>;
}

export function AuthForm({ initialMode = "sign-in" }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [signInState, signInAction, signInPending] = useActionState(signIn, INITIAL_AUTH_STATE);
  const [signUpState, signUpAction, signUpPending] = useActionState(signUp, INITIAL_AUTH_STATE);
  const state = mode === "sign-in" ? signInState : signUpState;
  const pending = mode === "sign-in" ? signInPending : signUpPending;
  const action = mode === "sign-in" ? signInAction : signUpAction;

  return (
    <div className="auth-card">
      <div className="auth-tabs" role="tablist" aria-label="인증 방식">
        <button type="button" role="tab" aria-selected={mode === "sign-in"} onClick={() => setMode("sign-in")}>로그인</button>
        <button type="button" role="tab" aria-selected={mode === "sign-up"} onClick={() => setMode("sign-up")}>회원가입</button>
      </div>

      <div className="auth-heading">
        <span className="eyebrow">CLASSLINK</span>
        <h1>{mode === "sign-in" ? "다시 만나 반가워요" : "일정 협업을 시작해요"}</h1>
        <p>{mode === "sign-in" ? "오늘의 수업과 요청을 확인하세요." : "역할에 맞는 작업 공간을 준비합니다."}</p>
      </div>

      <form action={action} className="auth-form">
        {mode === "sign-up" && (
          <>
            <fieldset className="role-fieldset">
              <legend>어떤 역할로 시작하시나요?</legend>
              <div className="role-grid">
                <RoleOption value="instructor" icon={<GraduationCap aria-hidden="true" />} title="강사" description="내 일정과 출강 요청 관리" />
                <RoleOption value="company_member" icon={<Building2 aria-hidden="true" />} title="교육회사" description="수업과 강사 배정 관리" />
              </div>
              <FieldError errors={state.fieldErrors?.role} />
            </fieldset>
            <label className="form-field">
              <span>이름</span>
              <input name="fullName" autoComplete="name" placeholder="이름을 입력하세요" aria-invalid={Boolean(state.fieldErrors?.fullName)} />
              <FieldError errors={state.fieldErrors?.fullName} />
            </label>
          </>
        )}

        <label className="form-field">
          <span>이메일</span>
          <input name="email" type="email" autoComplete="email" placeholder="name@example.com" aria-invalid={Boolean(state.fieldErrors?.email)} />
          <FieldError errors={state.fieldErrors?.email} />
        </label>
        <label className="form-field">
          <span>비밀번호</span>
          <input name="password" type="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} placeholder={mode === "sign-up" ? "영문과 숫자를 포함한 8자 이상" : "비밀번호를 입력하세요"} aria-invalid={Boolean(state.fieldErrors?.password)} />
          <FieldError errors={state.fieldErrors?.password} />
        </label>

        {state.message && <div className={`form-notice ${state.status}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</div>}

        <button className="primary-button" type="submit" disabled={pending}>
          {pending && <LoaderCircle className="spin" aria-hidden="true" />}
          {mode === "sign-in" ? "로그인" : "계정 만들기"}
        </button>
      </form>
      <p className="auth-footnote">계속하면 서비스 이용약관과 개인정보 처리방침에 동의하게 됩니다. <strong>[법률 검토 필요]</strong></p>
    </div>
  );
}

function RoleOption({ value, icon, title, description }: { value: UserRole; icon: React.ReactNode; title: string; description: string }) {
  return (
    <label className="role-option">
      <input type="radio" name="role" value={value} />
      <span className="role-option-body">{icon}<strong>{title}</strong><small>{description}</small></span>
    </label>
  );
}
