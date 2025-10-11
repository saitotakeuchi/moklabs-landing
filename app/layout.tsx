import type { Metadata } from "next";
import { Fira_Code } from "next/font/google";
import "./globals.css";
import { Header, Footer } from "@/components/sections";
import { CookieConsent, DeferredCSS, GoogleAnalytics, VercelAnalytics } from "@/components/common";
import { SpeedInsights } from "@vercel/speed-insights/next";

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fira-code",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Mok Labs - PNLD Digital",
  description: "Transformamos seus materiais em versões digitais acessíveis e em conformidade com os editais do PNLD. Soluções digitais sob medida, sem retrabalho, sem stress.",
  keywords: "PNLD digital, livros digitais acessíveis, conversão PDF, ePUB, materiais educacionais, editais PNLD",
  authors: [{ name: "Mok Labs" }],
  creator: "Mok Labs",
  publisher: "Mok Labs",
  metadataBase: new URL("https://moklabs.com.br"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/android-chrome-512x512.png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://moklabs.com.br",
    siteName: "MokLabs",
    title: "Mok Labs - PNLD Digital Sem Complicação",
    description: "Transformamos seus materiais em versões digitais acessíveis e em conformidade com os editais do PNLD.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Mok Labs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mok Labs - PNLD Digital Sem Complicação",
    description: "Transformamos seus materiais em versões digitais acessíveis e em conformidade com os editais do PNLD.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="theme-color" content="#0013FF" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${firaCode.variable} antialiased`}>
        <DeferredCSS />
        <GoogleAnalytics />
        <div className="min-h-screen bg-white">
          <div className="pt-[60px] sm:pt-[84px] md:pt-[98px]">
            <Header />
            {children}
            <Footer />
          </div>
          <CookieConsent />
        </div>
        <VercelAnalytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
