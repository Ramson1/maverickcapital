"use client";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <Sidebar />
      <div className="pl-[260px] transition-all duration-300">
        <Topbar />
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
