"use client";

import { Bell, Moon, Sun, Search, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);

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
            className="w-full bg-transparent text-sm text-surface-900 outline-none placeholder:text-surface-400 dark:text-white"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="hidden rounded border border-surface-200 bg-surface-100 px-1.5 py-0.5 text-[10px] font-medium text-surface-400 md:inline dark:border-surface-700 dark:bg-surface-700">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-white"
          aria-label="Toggle theme"
        >
          <Sun className="h-[18px] w-[18px] dark:hidden" />
          <Moon className="hidden h-[18px] w-[18px] dark:block" />
        </button>

        {/* Notifications */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger-500" />
        </button>

        {/* Divider */}
        <div className="mx-1 h-6 w-px bg-surface-200 sm:mx-2 dark:bg-surface-700" />

        {/* User menu */}
        <button className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-surface-100 sm:gap-3 sm:px-2 dark:hover:bg-surface-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-400">
            JD
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-surface-900 dark:text-white">John Doe</p>
            <p className="text-[11px] text-surface-500 dark:text-surface-400">john@example.com</p>
          </div>
        </button>
      </div>
    </header>
  );
}
