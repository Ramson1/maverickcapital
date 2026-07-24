import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://maverickcapital.io"),
  title: {
    default: "Maverick Capital | Professional Investment & Trading Platform",
    template: "%s | Maverick Capital",
  },
  description:
    "Maverick Capital offers professional investment services in Gold Trading, Cryptocurrency, Forex, and Indices. Grow your wealth with our expert-managed investment plans targeting 10% monthly returns.",
  keywords: [
    "investment",
    "trading",
    "cryptocurrency",
    "forex",
    "gold trading",
    "indices",
    "Maverick Capital",
    "investment platform",
    "crypto trading",
    "forex trading",
    "gold investment",
    "trading platform",
    "investment plans",
    "monthly returns",
    "portfolio management",
    "trading signals",
    "market analysis",
    "financial services",
    "investment opportunities",
    "trading strategies",
  ],
  authors: [{ name: "Maverick Capital" }],
  creator: "Maverick Capital",
  publisher: "Maverick Capital",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/android-chrome-192x192.png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/android-chrome-512x512.png',
      },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://maverickcapital.io",
    siteName: "Maverick Capital",
    title: "Maverick Capital | Professional Investment & Trading Platform",
    description:
      "Professional investment services in Gold, Cryptocurrency, Forex, and Indices. Expert-managed portfolios with 10% monthly returns.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Maverick Capital - Professional Investment Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maverick Capital | Professional Investment & Trading Platform",
    description:
      "Professional investment services in Gold, Cryptocurrency, Forex, and Indices. Expert-managed portfolios with 10% monthly returns.",
    images: ["/logo.png"],
    creator: "@maverickcapital",
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
  alternates: {
    canonical: "https://maverickcapital.io",
  },
  category: "financial services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
