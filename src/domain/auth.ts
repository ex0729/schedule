import { z } from "zod";

export const SIGN_UP_ROLES = ["instructor", "company_member"] as const;
export const USER_ROLES = [...SIGN_UP_ROLES, "service_admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  instructor: "강사",
  company_member: "교육회사 담당자",
  service_admin: "서비스 관리자",
};

const emailSchema = z
  .string()
  .trim()
  .min(1, "이메일을 입력해 주세요.")
  .email("올바른 이메일 형식을 입력해 주세요.")
  .max(254, "이메일이 너무 깁니다.");

const passwordSchema = z
  .string()
  .min(8, "비밀번호는 8자 이상이어야 합니다.")
  .max(72, "비밀번호는 72자 이하여야 합니다.")
  .regex(/[A-Za-z]/, "비밀번호에 영문을 포함해 주세요.")
  .regex(/[0-9]/, "비밀번호에 숫자를 포함해 주세요.");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
});

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "이름을 2자 이상 입력해 주세요.").max(50),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(SIGN_UP_ROLES, { error: "역할을 선택해 주세요." }),
});

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const INITIAL_AUTH_STATE: AuthActionState = { status: "idle" };

export function roleFromMetadata(value: unknown): UserRole | null {
  return USER_ROLES.includes(value as UserRole) ? (value as UserRole) : null;
}
