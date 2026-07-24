"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
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
  X,
} from "lucide-react";

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

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: (v: boolean) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const isAdmin = pathname.startsWith("/admin");
  const navItems = isAdmin ? adminNavigation : navigation;

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile close button */}
      {mobileOpen && (
        <button
          onClick={onCloseMobile}
          className="fixed right-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-surface-800/80 text-white backdrop-blur-sm transition-colors hover:bg-surface-900 lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-surface-200 bg-white transition-all duration-300 dark:border-surface-800 dark:bg-surface-900",
          // Desktop: always visible, respects collapsed state
          "lg:translate-x-0",
          collapsed ? "lg:w-[68px]" : "lg:w-[260px]",
          // Mobile: hidden by default, slides in when open
          "w-[260px] translate-x-0",
          !mobileOpen && "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-surface-200 px-4 dark:border-surface-800">
          <Image
            src="/logo.png"
            alt="Maverick Capital"
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-lg object-cover"
          />
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-semibold text-surface-900 dark:text-white">
                Maverick Capital
              </span>
              <span className="truncate text-[11px] text-surface-500 dark:text-surface-400">
                {isAdmin ? "Admin Panel" : "Investment Dashboard"}
              </span>
            </div>
          )}
        </div>

        {/* Navigation - scrollable */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin p-3">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                      : "text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-white"
                  )}
                >
                  <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-brand-600 dark:text-brand-400")} />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Collapse toggle - desktop only */}
        <button
          onClick={() => onToggleCollapse(!collapsed)}
          className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-surface-200 bg-white text-surface-400 shadow-sm transition-colors hover:text-surface-600 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-400 dark:hover:text-white lg:flex"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>

        {/* Bottom section */}
        <div className="shrink-0 border-t border-surface-200 p-3 dark:border-surface-800">
          {!collapsed && (
            <Link
              href="/dashboard/support"
              onClick={onCloseMobile}
              className="mb-2 flex items-center gap-2.5 rounded-lg bg-surface-50 px-3 py-2.5 transition-colors hover:bg-surface-100 dark:bg-surface-800/50 dark:hover:bg-surface-800"
            >
              <HeadphonesIcon className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
              <div>
                <p className="text-xs font-medium text-surface-900 dark:text-white">Need help?</p>
                <p className="text-[11px] text-surface-500 dark:text-surface-400">
                  Contact support
                </p>
              </div>
            </Link>
          )}
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg border border-danger-500/10 bg-danger-50 px-3 py-2.5 text-sm font-medium text-danger-600 transition-all hover:border-danger-500/20 hover:bg-danger-100 dark:border-danger-500/20 dark:bg-danger-500/5 dark:text-danger-500 dark:hover:border-danger-500/30 dark:hover:bg-danger-500/10"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
