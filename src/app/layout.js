import StyledComponentsRegistry from "@/lib/registry";
import GlobalStyles from "@/styles/GlobalStyles";
import Header from "@/components/Header";
import "./globals.css";

export const metadata = {
  title: "UnJ - 일정 조율",
  description: "간단하게 일정을 조율하세요",
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
