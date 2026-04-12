import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "AI 핸들러 - 전 세계 AI 툴 통합 허브 & 맞춤형 프롬프트",
  description:
    "AI 툴별 최적화된 프롬프트 자동 생성 및 주요 AI 툴 가입/구독 한방 링크 통합 솔루션",
  metadataBase: new URL("https://aihandler.run"),
  alternates: {
    canonical: "/",
  },
  keywords: [
    "AI 프롬프트",
    "프롬프트 지니어",
    "ChatGPT 프롬프트",
    "미드저니 프롬프트",
    "AI 툴 허브",
    "프롬프트 자동생성",
    "AI Handler",
  ],
  openGraph: {
    title: "AI 핸들러 (AI Handler) - 전 세계 AI를 지휘하는 프롬프트 허브",
    description: "AI 툴별 최적화된 프롬프트 자동 생성 및 글로벌 AI 마켓 직통 링크 통합 솔루션",
    url: "https://aihandler.run",
    siteName: "AI Handler",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Handler - Premium Prompt Engine",
      },
    ],
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI 핸들러 (AI Handler)",
    description: "전 세계 모든 AI를 지휘하는 당신만의 프롬프트 통합 허브",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AI Handler",
  },
  verification: {
    google: "M6tMtEGAXW6LN0_yZixeMGdZL5QrztsT8lkU0FQUZfw",
    other: {
      "naver-site-verification": ["13cb4a89ae63a1da5caf0e91c635dff47f6a39bb"],
    },
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
          <Footer />
          <Toaster theme="system" position="bottom-right" richColors />
          <GoogleAnalytics gaId="G-X6X4VSV53F" />
        </ThemeProvider>
      </body>
    </html>
  );
}
