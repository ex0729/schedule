"use server";

import { redirect } from "next/navigation";
import { signInSchema, signUpSchema, type AuthActionState } from "@/domain/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const AUTH_NOT_CONFIGURED =
  "인증 서비스가 아직 연결되지 않았습니다. .env.local의 Supabase 설정을 확인해 주세요.";

function formValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function validationError(error: { flatten: () => { fieldErrors: Record<string, string[]> } }): AuthActionState {
  return {
    status: "error",
    message: "입력한 내용을 다시 확인해 주세요.",
    fieldErrors: error.flatten().fieldErrors,
  };
}

export async function signIn(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formValue(formData, "email"),
    password: formValue(formData, "password"),
  });
  if (!parsed.success) return validationError(parsed.error);

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: AUTH_NOT_CONFIGURED };

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return {
      status: "error",
      message: "로그인할 수 없습니다. 이메일과 비밀번호를 확인해 주세요.",
    };
  }
  redirect("/dashboard");
}

export async function signUp(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    fullName: formValue(formData, "fullName"),
    email: formValue(formData, "email"),
    password: formValue(formData, "password"),
    role: formValue(formData, "role"),
  });
  if (!parsed.success) return validationError(parsed.error);

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: AUTH_NOT_CONFIGURED };

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName, role: parsed.data.role },
    },
  });
  if (error) {
    return { status: "error", message: "계정을 만들 수 없습니다. 잠시 후 다시 시도해 주세요." };
  }

  if (!data.session) {
    return {
      status: "success",
      message: "확인 메일을 보냈습니다. 이메일 인증 후 로그인해 주세요.",
    };
  }
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}
