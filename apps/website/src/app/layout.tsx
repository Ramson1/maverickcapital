import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Maverick Capital | Professional Investment & Trading Platform",
  description:
    "Maverick Capital offers professional investment services in Gold Trading, Cryptocurrency, Forex, and Indices. Grow your wealth with our expert-managed investment plans.",
  keywords: [
    "investment",
    "trading",
    "cryptocurrency",
    "forex",
    "gold trading",
    "indices",
    "Maverick Capital",
  ],
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
