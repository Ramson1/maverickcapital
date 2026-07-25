"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Wallet,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ArrowRight,
  Plus,
  Loader2,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useHardCap } from "@/hooks/useHardCap";

interface StatItem {
  name: string;
  value: number;
  change: number | null;
  icon: typeof DollarSign;
  color: string;
  bgColor: string;
  isCount?: boolean;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

export function DashboardContent() {
  const { user } = useAuth();
  const supabase = createClient();
  const { hardCap, totalRaised, percentage, isFull, loading: hardCapLoading } = useHardCap();

  const [stats, setStats] = useState<StatItem[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch profile for balances
        const { data: profile } = await supabase
          .from("mc_profiles")
          .select("wallet_balance, total_investment, total_profit")
          .eq("id", user.id)
          .single();

        // Fetch active investment count
        const { count: activeCount } = await supabase
          .from("mc_investments")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "active");

        // Fetch recent transactions
        const { data: transactions } = await supabase
          .from("mc_transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        const totalInvestment = Number(profile?.total_investment || 0);
        const totalProfit = Number(profile?.total_profit || 0);
        const walletBalance = Number(profile?.wallet_balance || 0);
        const activeCountNum = activeCount || 0;

        setStats([
          {
            name: "Total Investment",
            value: totalInvestment,
            change: null,
            icon: DollarSign,
            color: "text-brand-600 dark:text-brand-400",
            bgColor: "bg-brand-50 dark:bg-brand-500/10",
          },
          {
            name: "Total Profit",
            value: totalProfit,
            change: null,
            icon: TrendingUp,
            color: "text-success-600 dark:text-success-500",
            bgColor: "bg-success-50 dark:bg-success-500/10",
          },
          {
            name: "Wallet Balance",
            value: walletBalance,
            change: null,
            icon: Wallet,
            color: "text-accent-600 dark:text-accent-400",
            bgColor: "bg-accent-50 dark:bg-accent-500/10",
          },
          {
            name: "Active Investments",
            value: activeCountNum,
            change: 0,
            icon: Clock,
            color: "text-brand-600 dark:text-brand-400",
            bgColor: "bg-brand-50 dark:bg-brand-500/10",
            isCount: true,
          },
        ]);

        setRecentTransactions(
          (transactions || []).map((tx) => ({
            id: tx.id,
            type: tx.type,
            amount: Number(tx.amount),
            currency: tx.currency,
            status: tx.status,
            created_at: tx.created_at,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

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
          <Link href="/dashboard/deposits">
            <button disabled={isFull} className="flex items-center gap-2 rounded-lg border border-surface-200 bg-white px-4 py-2.5 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50 disabled:opacity-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700">
              {isFull ? <Lock className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {isFull ? "Deposits Closed" : "New Deposit"}
            </button>
          </Link>
          <Link href="/dashboard/investments/new">
            <button disabled={isFull} className="flex items-center gap-2 rounded-lg gradient-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50">
              <TrendingUp className="h-4 w-4" />
              {isFull ? "Cap Reached" : "New Investment"}
            </button>
          </Link>
        </div>
      </div>

      {/* Hard Cap Progress Bar */}
      <div className="rounded-xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
              <Lock className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Platform Hard Cap</h3>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                {isFull ? "Cap reached — deposits are disabled" : "Total capital raised across all investors"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-surface-900 dark:text-white">
              {hardCapLoading ? "..." : `${formatCurrency(totalRaised)}`}
            </p>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              of {formatCurrency(hardCap)}
            </p>
          </div>
        </div>
        <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              percentage >= 90
                ? "bg-danger-500"
                : percentage >= 70
                  ? "bg-warning-500"
                  : "bg-brand-500"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={cn(
            "font-medium",
            percentage >= 90 ? "text-danger-600 dark:text-danger-400" : "text-surface-500 dark:text-surface-400"
          )}>
            {percentage.toFixed(1)}% filled
          </span>
          <span className="text-surface-500 dark:text-surface-400">
            {hardCapLoading ? "" : `${formatCurrency(hardCap - totalRaised)} remaining`}
          </span>
        </div>
        {isFull && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-danger-50 px-3 py-2 text-xs font-medium text-danger-700 dark:bg-danger-500/10 dark:text-danger-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Hard cap has been reached. New deposits are currently disabled.
          </div>
        )}
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
            <Link href="/dashboard/transactions" className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="py-8 text-center text-sm text-surface-400">No transactions yet</p>
            ) : (
              recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-lg border border-surface-100 p-3 dark:border-surface-800"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold",
                        tx.type === "deposit" && "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500",
                        tx.type === "withdrawal" && "bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-500",
                        tx.type === "investment" && "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
                        tx.type === "profit" && "bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400"
                      )}
                    >
                      {tx.type[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize text-surface-900 dark:text-white">{tx.type}</p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-surface-900 dark:text-white">
                      {tx.type === "withdrawal" || tx.type === "investment" ? "-" : "+"}
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
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { title: "Start New Investment", desc: "Choose from our investment plans", icon: TrendingUp, href: "/dashboard/investments/new" },
          { title: "Make a Deposit", desc: "Fund your wallet with crypto", icon: Wallet, href: "/dashboard/deposits" },
          { title: "View Analytics", desc: "Track your performance", icon: ArrowRight, href: "/dashboard/analytics" },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.title} href={action.href}>
              <button
                className="group flex w-full items-center gap-4 rounded-xl border border-surface-200 bg-white p-5 text-left transition-all hover:border-brand-200 hover:shadow-sm dark:border-surface-800 dark:bg-surface-900 dark:hover:border-brand-800"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:group-hover:bg-brand-500/20">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-900 dark:text-white">{action.title}</p>
                  <p className="mt-0.5 text-xs text-surface-500 dark:text-surface-400">{action.desc}</p>
                </div>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
