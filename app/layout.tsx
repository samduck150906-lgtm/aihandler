import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "AI 핸들러 - 전 세계 AI 툴 통합 허브 & 맞춤형 프롬프트",
  description:
    "AI 툴별 최적화된 프롬프트 자동 생성 및 주요 AI 툴 가입/구독 한방 링크 통합 솔루션",
  metadataBase: new URL("https://aihandler.run"),
  openGraph: {
    title: "AI 핸들러 (AI Handler)",
    description: "전 세계 모든 AI를 지휘하는 당신만의 프롬프트 통합 허브",
    url: "https://aihandler.run",
    siteName: "AI Handler",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    description: "AI 툴별 최적화된 프롬프트 자동 생성",
  },
  icons: {
    icon: "/favicon.ico",
  },
  verification: {
    google: "M6tMtEGAXW6LN0_yZixeMGdZL5QrztsT8lkU0FQUZfw",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FAFAF8",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="/globals.css" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap"
        />
      </head>
      <body className="min-h-dvh flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <GoogleAnalytics gaId="G-X6X4VSV53F" />
        </ThemeProvider>
      </body>
    </html>
  );
}
