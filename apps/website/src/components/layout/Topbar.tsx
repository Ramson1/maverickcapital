"use client";

import { Bell, Moon, Sun, Search, Menu, Shield } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";

interface TopbarProps {
  onMenuClick: () => void;
}

// Dashboard routes for search
const searchRoutes = [
  { path: "/dashboard", label: "Dashboard", description: "Overview & stats" },
  { path: "/dashboard/investments", label: "Investments", description: "View your investments" },
  { path: "/dashboard/investments/new", label: "New Investment", description: "Create new investment" },
  { path: "/dashboard/wallet", label: "Wallet", description: "Manage your wallets" },
  { path: "/dashboard/deposits", label: "Deposits", description: "View deposits" },
  { path: "/dashboard/withdrawals", label: "Withdrawals", description: "View withdrawals" },
  { path: "/dashboard/transactions", label: "Transactions", description: "Transaction history" },
  { path: "/dashboard/signals", label: "Signals", description: "Trading signals" },
  { path: "/dashboard/news", label: "News", description: "Latest news" },
  { path: "/dashboard/notifications", label: "Notifications", description: "Your notifications" },
  { path: "/dashboard/profile", label: "Profile", description: "Your profile" },
  { path: "/dashboard/support", label: "Support", description: "Help & support" },
  { path: "/dashboard/subscriptions", label: "Subscriptions", description: "Manage subscriptions" },
  { path: "/dashboard/settings", label: "Settings", description: "Account settings" },
  { path: "/dashboard/analytics", label: "Analytics", description: "Performance analytics" },
];

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [initials, setInitials] = useState("U");
  const [displayName, setDisplayName] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter search results
  const searchResults = searchQuery.trim()
    ? searchRoutes.filter(
        (r) =>
          r.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch user profile and roles
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    const fetchProfile = async () => {
      const supabase = createClient();

      // Get display name
      const { data: profile } = await supabase
        .from("mc_profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profile?.full_name) {
        setDisplayName(profile.full_name);
        const parts = profile.full_name.split(" ");
        setInitials(
          parts.length > 1
            ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
            : parts[0].slice(0, 2).toUpperCase()
        );
      } else {
        setDisplayName(user.email || "");
        setInitials((user.email || "U").slice(0, 2).toUpperCase());
      }

      // Check admin role
      const { data: roleData } = await supabase
        .from("mc_user_roles")
        .select("mc_roles(name)")
        .eq("user_id", user.id);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const roles = (roleData || []).flatMap((r: any) =>
        Array.isArray(r.mc_roles) ? r.mc_roles : [r.mc_roles]
      ).filter(Boolean);

      setIsAdmin(
        roles.some((r: { name: string }) =>
          ["super_admin", "admin", "moderator"].includes(r.name)
        )
      );
    };

    fetchProfile();
  }, [user]);

  const isOnAdmin = pathname.startsWith("/admin");

  const handleSwitchView = () => {
    router.push(isOnAdmin ? "/dashboard" : "/admin");
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-surface-200 bg-white/80 px-4 backdrop-blur-xl dark:border-surface-800 dark:bg-surface-900/80 sm:px-6">
      {/* Left section */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-white lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div ref={searchRef} className="relative">
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 transition-all",
              searchFocused
                ? "w-64 border-brand-300 bg-white shadow-sm ring-2 ring-brand-500/20 sm:w-80 dark:border-brand-700 dark:bg-surface-800"
                : "w-40 border-surface-200 bg-surface-50 sm:w-64 dark:border-surface-700 dark:bg-surface-800"
            )}
          >
            <Search className="h-4 w-4 shrink-0 text-surface-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-surface-900 outline-none placeholder:text-surface-400 dark:text-white"
              onFocus={() => setSearchFocused(true)}
            />
            <kbd className="hidden rounded border border-surface-200 bg-surface-100 px-1.5 py-0.5 text-[10px] font-medium text-surface-400 md:inline dark:border-surface-700 dark:bg-surface-700">
              ⌘K
            </kbd>
          </div>

          {/* Search results dropdown */}
          {searchFocused && searchQuery.trim() && (
            <div className="absolute left-0 top-full mt-2 w-72 overflow-hidden rounded-xl border border-surface-200 bg-white shadow-xl dark:border-surface-700 dark:bg-surface-800 sm:w-80">
              {searchResults.length > 0 ? (
                <ul className="max-h-64 overflow-y-auto p-1.5">
                  {searchResults.map((result) => (
                    <li key={result.path}>
                      <button
                        onClick={() => {
                          router.push(result.path);
                          setSearchQuery("");
                          setSearchFocused(false);
                        }}
                        className="flex w-full flex-col rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface-100 dark:hover:bg-surface-700"
                      >
                        <span className="text-sm font-medium text-surface-900 dark:text-white">
                          {result.label}
                        </span>
                        <span className="text-xs text-surface-500 dark:text-surface-400">
                          {result.description}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-surface-500 dark:text-surface-400">
                  No results found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Admin toggle */}
        <button
          onClick={handleSwitchView}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all sm:text-sm",
            isOnAdmin
              ? "bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
              : "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
          )}
        >
          <Shield className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">
            {isOnAdmin ? "User View" : "Admin View"}
          </span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-white"
          aria-label="Toggle theme"
        >
          <Sun className="h-[18px] w-[18px] dark:hidden" />
          <Moon className="hidden h-[18px] w-[18px] dark:block" />
        </button>

        {/* News */}
        <Link
          href="/dashboard/news"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-white"
          aria-label="News"
        >
          <Bell className="h-[18px] w-[18px]" />
        </Link>

        {/* Divider */}
        <div className="mx-1 h-6 w-px bg-surface-200 sm:mx-2 dark:bg-surface-700" />

        {/* User menu */}
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-surface-100 sm:gap-3 sm:px-2 dark:hover:bg-surface-800"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-400">
            {initials}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-surface-900 dark:text-white">
              {displayName || "User"}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
