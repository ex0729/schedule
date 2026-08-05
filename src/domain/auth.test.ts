import { describe, expect, it } from "vitest";
import { roleFromMetadata, signInSchema, signUpSchema } from "./auth";

describe("authentication input", () => {
  it("accepts a valid instructor sign-up", () => {
    const result = signUpSchema.safeParse({
      fullName: "김강사",
      email: "teacher@example.com",
      password: "secure1234",
      role: "instructor",
    });
    expect(result.success).toBe(true);
  });

  it("rejects weak passwords and unknown roles", () => {
    const result = signUpSchema.safeParse({
      fullName: "김강사",
      email: "teacher@example.com",
      password: "1234",
      role: "admin",
    });
    expect(result.success).toBe(false);
  });

  it("normalizes email during sign in", () => {
    const result = signInSchema.parse({
      email: " teacher@example.com ",
      password: "password",
    });
    expect(result.email).toBe("teacher@example.com");
  });
});

describe("role metadata", () => {
  it("recognizes product and service-admin roles", () => {
    expect(roleFromMetadata("company_member")).toBe("company_member");
    expect(roleFromMetadata("service_admin")).toBe("service_admin");
    expect(roleFromMetadata(undefined)).toBeNull();
  });

  it("does not allow service-admin self sign-up", () => {
    const result = signUpSchema.safeParse({
      fullName: "관리자",
      email: "admin@example.com",
      password: "secure1234",
      role: "service_admin",
    });
    expect(result.success).toBe(false);
  });
});
