"use client";

import {
  TrendingUp,
  Wallet,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ArrowRight,
  Plus,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

const stats = [
  {
    name: "Total Investment",
    value: 25000,
    change: 12.5,
    icon: DollarSign,
    color: "text-brand-600 dark:text-brand-400",
    bgColor: "bg-brand-50 dark:bg-brand-500/10",
  },
  {
    name: "Total Profit",
    value: 3750,
    change: 8.2,
    icon: TrendingUp,
    color: "text-success-600 dark:text-success-500",
    bgColor: "bg-success-50 dark:bg-success-500/10",
  },
  {
    name: "Wallet Balance",
    value: 1250,
    change: -2.4,
    icon: Wallet,
    color: "text-accent-600 dark:text-accent-400",
    bgColor: "bg-accent-50 dark:bg-accent-500/10",
  },
  {
    name: "Active Investments",
    value: 3,
    change: 0,
    icon: Clock,
    color: "text-brand-600 dark:text-brand-400",
    bgColor: "bg-brand-50 dark:bg-brand-500/10",
    isCount: true,
  },
];

const recentTransactions = [
  { id: 1, type: "Deposit", amount: 5000, currency: "USDT", status: "completed", date: "Jul 23, 2026" },
  { id: 2, type: "Investment", amount: 10000, currency: "USDT", status: "active", date: "Jul 22, 2026" },
  { id: 3, type: "Profit", amount: 250, currency: "USDT", status: "completed", date: "Jul 21, 2026" },
  { id: 4, type: "Withdrawal", amount: 1000, currency: "USDT", status: "pending", date: "Jul 20, 2026" },
  { id: 5, type: "Deposit", amount: 7500, currency: "USDT", status: "completed", date: "Jul 19, 2026" },
];

export function DashboardContent() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            Welcome back! Here&apos;s your investment overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-surface-200 bg-white px-4 py-2.5 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700">
            <Plus className="h-4 w-4" />
            New Deposit
          </button>
          <button className="flex items-center gap-2 rounded-lg gradient-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90">
            <TrendingUp className="h-4 w-4" />
            New Investment
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="rounded-xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900"
            >
              <div className="flex items-center justify-between">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", stat.bgColor)}>
                  <Icon className={cn("h-5 w-5", stat.color)} />
                </div>
                {stat.change !== 0 && (
                  <span
                    className={cn(
                      "flex items-center gap-0.5 text-xs font-medium",
                      stat.change > 0
                        ? "text-success-600 dark:text-success-500"
                        : "text-danger-600 dark:text-danger-500"
                    )}
                  >
                    {stat.change > 0 ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    {Math.abs(stat.change)}%
                  </span>
                )}
              </div>
              <div className="mt-4">
                <p className="text-sm text-surface-500 dark:text-surface-400">{stat.name}</p>
                <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-white">
                  {stat.isCount ? stat.value : formatCurrency(stat.value)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Transactions Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Portfolio Chart Placeholder */}
        <div className="col-span-2 rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-800 dark:bg-surface-900">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-surface-900 dark:text-white">Portfolio Growth</h2>
              <p className="text-sm text-surface-500 dark:text-surface-400">Last 30 days performance</p>
            </div>
            <div className="flex gap-2">
              {["7D", "30D", "90D", "1Y"].map((period) => (
                <button
                  key={period}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    period === "30D"
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                      : "text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
                  )}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          {/* Chart placeholder */}
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-surface-200 dark:border-surface-700">
            <p className="text-sm text-surface-400 dark:text-surface-500">Chart will be rendered here</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-800 dark:bg-surface-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-surface-900 dark:text-white">Recent Transactions</h2>
            <button className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-lg border border-surface-100 p-3 dark:border-surface-800"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold",
                      tx.type === "Deposit" && "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500",
                      tx.type === "Withdrawal" && "bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-500",
                      tx.type === "Investment" && "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
                      tx.type === "Profit" && "bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400"
                    )}
                  >
                    {tx.type[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{tx.type}</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-surface-900 dark:text-white">
                    {tx.type === "Withdrawal" ? "-" : "+"}
                    {formatCurrency(tx.amount)}
                  </p>
                  <p
                    className={cn(
                      "text-xs font-medium capitalize",
                      tx.status === "completed" && "text-success-600 dark:text-success-500",
                      tx.status === "active" && "text-brand-600 dark:text-brand-400",
                      tx.status === "pending" && "text-warning-600 dark:text-warning-500"
                    )}
                  >
                    {tx.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { title: "Start New Investment", desc: "Choose from our investment plans", icon: TrendingUp, href: "/dashboard/investments" },
          { title: "Make a Deposit", desc: "Fund your wallet with crypto", icon: Wallet, href: "/dashboard/wallet" },
          { title: "View Analytics", desc: "Track your performance", icon: ArrowRight, href: "/dashboard/analytics" },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.title}
              className="group flex items-center gap-4 rounded-xl border border-surface-200 bg-white p-5 text-left transition-all hover:border-brand-200 hover:shadow-sm dark:border-surface-800 dark:bg-surface-900 dark:hover:border-brand-800"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:group-hover:bg-brand-500/20">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-900 dark:text-white">{action.title}</p>
                <p className="mt-0.5 text-xs text-surface-500 dark:text-surface-400">{action.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
