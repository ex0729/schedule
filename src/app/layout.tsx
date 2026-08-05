import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "ClassLink", template: "%s · ClassLink" },
  description: "강사 일정과 교육회사 출강 배정을 연결하는 협업 서비스",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
