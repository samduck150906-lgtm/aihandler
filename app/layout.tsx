import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/lib/i18n/index";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";
import Script from "next/script";

export const metadata: Metadata = {
  title: "AI Handler - Global AI Prompt Hub & Optimization",
  description:
    "Generate optimized prompts for 22+ AI tools with one click. ChatGPT, Claude, Midjourney, Suno & more. Global payment, instant results.",
  metadataBase: new URL("https://aihandler.run"),
  alternates: {
    canonical: "/",
  },
  keywords: [
    "AI prompt",
    "prompt generator",
    "ChatGPT prompt",
    "Midjourney prompt",
    "AI tool hub",
    "prompt optimization",
    "AI Handler",
  ],
  openGraph: {
    title: "AI Handler - Global AI Prompt Hub",
    description: "Generate optimized prompts for any AI tool instantly. Simple. Powerful. Global.",
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
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Handler",
    description: "Your AI Prompt Hub. Generate better prompts faster.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-512.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AI Handler",
    startupImage: ["/og-image.png"],
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
  const paddleToken = process.env.NEXT_PUBLIC_PADDLE_TOKEN;
  const paddleClientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

  return (
    <html lang="en" suppressHydrationWarning>
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

        {/* Paddle Billing v2 Script */}
        {paddleClientToken && (
          <Script
            src="https://cdn.paddle.com/paddle/v2/paddle.js"
            strategy="afterInteractive"
            onLoad={() => {
              const paddle = (window as any).Paddle;
              if (paddle) {
                paddle.Setup({
                  token: paddleClientToken,
                  environment: "production",
                });
              }
            }}
          />
        )}
      </head>
      <body className="min-h-dvh flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <I18nProvider>
            {children}
            <Footer />
            <Toaster theme="system" position="bottom-right" richColors />
          </I18nProvider>
          <GoogleAnalytics gaId="G-X6X4VSV53F" />
        </ThemeProvider>
      </body>
    </html>
  );
}
