"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  ArrowLeftRight,
  BarChart3,
  Signal,
  Newspaper,
  HeadphonesIcon,
  Settings,
  User,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Investments", href: "/dashboard/investments", icon: TrendingUp },
  { name: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  { name: "Transactions", href: "/dashboard/transactions", icon: ArrowLeftRight },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Signals", href: "/dashboard/signals", icon: Signal },
  { name: "Subscriptions", href: "/dashboard/subscriptions", icon: CreditCard },
  { name: "News", href: "/dashboard/news", icon: Newspaper },
  { name: "Support", href: "/dashboard/support", icon: HeadphonesIcon },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const adminNavigation = [
  { name: "Admin Dashboard", href: "/admin", icon: Shield },
  { name: "Users", href: "/admin/users", icon: User },
  { name: "Investments", href: "/admin/investments", icon: TrendingUp },
  { name: "Deposits", href: "/admin/deposits", icon: Wallet },
  { name: "Withdrawals", href: "/admin/withdrawals", icon: ArrowLeftRight },
  { name: "Signals", href: "/admin/signals", icon: Signal },
  { name: "News", href: "/admin/news", icon: Newspaper },
  { name: "Support", href: "/admin/support", icon: HeadphonesIcon },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: ArrowLeftRight },
  { name: "CMS", href: "/admin/cms", icon: Newspaper },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isAdmin = pathname.startsWith("/admin");
  const navItems = isAdmin ? adminNavigation : navigation;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-surface-200 bg-white transition-all duration-300 dark:border-surface-800 dark:bg-surface-900",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-surface-200 px-4 dark:border-surface-800">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-brand">
          <span className="text-sm font-bold text-white">MC</span>
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-surface-900 dark:text-white">
              Maverick Capital
            </span>
            <span className="text-[11px] text-surface-500 dark:text-surface-400">
              {isAdmin ? "Admin Panel" : "Investment Dashboard"}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                  : "text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-white"
              )}
            >
              <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-brand-600 dark:text-brand-400")} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-surface-200 bg-white text-surface-400 shadow-sm transition-colors hover:text-surface-600 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-400 dark:hover:text-white"
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Bottom section */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-surface-200 p-3 dark:border-surface-800">
        {!collapsed && (
          <div className="mb-3 rounded-lg bg-surface-50 p-3 dark:bg-surface-800/50">
            <p className="text-xs font-medium text-surface-900 dark:text-white">Need help?</p>
            <p className="mt-0.5 text-[11px] text-surface-500 dark:text-surface-400">
              Contact our support team
            </p>
          </div>
        )}
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-white">
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
