"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { DashboardLayout } from "./DashboardLayout";

// Routes that use the dashboard layout (sidebar + topbar)
const dashboardPrefixes = ["/dashboard", "/admin"];

// Routes that are full-page auth screens (no navbar/footer)
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/two-factor"];

export function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isDashboard = dashboardPrefixes.some((prefix) => pathname.startsWith(prefix));
  const isAuth = authRoutes.some((route) => pathname.startsWith(route));

  if (isDashboard) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  if (isAuth) {
    return <>{children}</>;
  }

  // Marketing pages
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
