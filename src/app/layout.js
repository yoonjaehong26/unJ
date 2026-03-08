import StyledComponentsRegistry from "@/lib/registry";
import GlobalStyles from "@/styles/GlobalStyles";
import Header from "@/components/Header";
import "./globals.css";

export const metadata = {
  title: "UnJ - 일정 조율 | 무료 모임 시간 맞추기",
  description: "팀원, 친구, 동료와 가능한 시간을 쉽게 찾아보세요. 로그인 없이 무료로 일정을 조율하세요.",
  keywords: ["일정 조율", "모임 시간 맞추기", "스케줄 조율", "미팅 시간", "무료 일정"],
  metadataBase: new URL("https://www.unj.kr"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "UnJ - 일정 조율",
    description: "팀원, 친구, 동료와 가능한 시간을 쉽게 찾아보세요. 로그인 없이 무료.",
    url: "https://www.unj.kr",
    siteName: "UnJ",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "UnJ - 일정 조율",
    description: "팀원, 친구, 동료와 가능한 시간을 쉽게 찾아보세요. 로그인 없이 무료.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <StyledComponentsRegistry>
          <GlobalStyles />
          <Header />
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
