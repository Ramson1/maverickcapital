import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { LoadingProvider } from "@/providers/LoadingProvider";
import { Web3Providers } from "@/providers/Web3Providers";
import { Toaster } from "@/components/ui/toaster";
import { DashboardLayoutWrapper } from "@/components/layout/DashboardLayoutWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://maverickcapital.io"),
  title: {
    default: "Maverick Capital | Professional Investment & Trading Platform",
    template: "%s | Maverick Capital",
  },
  description:
    "Maverick Capital offers professional investment services in Gold Trading, Cryptocurrency, Forex, and Indices. Expert-managed portfolios with 10% monthly returns.",
  keywords: [
    "investment", "trading", "cryptocurrency", "forex", "gold trading",
    "indices", "Maverick Capital", "investment platform", "crypto trading",
    "forex trading", "gold investment", "trading platform",
  ],
  authors: [{ name: "Maverick Capital" }],
  creator: "Maverick Capital",
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://maverickcapital.io",
    siteName: "Maverick Capital",
    title: "Maverick Capital | Professional Investment & Trading Platform",
    description: "Professional investment services in Gold, Cryptocurrency, Forex, and Indices.",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Maverick Capital" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maverick Capital | Professional Investment & Trading Platform",
    description: "Professional investment services in Gold, Cryptocurrency, Forex, and Indices.",
    images: ["/logo.png"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://maverickcapital.io" },
  category: "financial services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <ToastProvider>
            <Web3Providers>
              <AuthProvider>
                <LoadingProvider>
                  <DashboardLayoutWrapper>
                    {children}
                  </DashboardLayoutWrapper>
                  <Toaster />
                </LoadingProvider>
              </AuthProvider>
            </Web3Providers>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
