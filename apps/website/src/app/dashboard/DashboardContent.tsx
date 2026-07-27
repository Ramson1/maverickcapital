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
  BarChart3,
  Activity,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useHardCap } from "@/hooks/useHardCap";
import { DashboardSkeleton } from "@/components/ui/PageSkeletons";

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
  
  // Portfolio chart period state
  const [chartPeriod, setChartPeriod] = useState<"7D" | "30D" | "90D" | "1Y">("30D");

  const [stats, setStats] = useState<StatItem[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<{ label: string; value: number }[]>([]);
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

        // Fetch approved deposits directly to compute totals (fallback if profile is out of sync)
        const { data: approvedDeposits } = await supabase
          .from("mc_deposits")
          .select("amount")
          .eq("user_id", user.id)
          .eq("status", "approved");

        const depositsTotal = (approvedDeposits || []).reduce((sum, d) => sum + Number(d.amount), 0);

        // Fetch active investment count
        const { count: activeCount } = await supabase
          .from("mc_investments")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "active");

        // Fetch recent transactions from ALL sources (deposits, withdrawals, investments)
        const [depositsRes, withdrawalsRes, investmentsRes] = await Promise.all([
          supabase.from("mc_deposits").select("id, amount, currency, status, submitted_at").eq("user_id", user.id).order("submitted_at", { ascending: false }).limit(5),
          supabase.from("mc_withdrawals").select("id, amount, currency, status, submitted_at").eq("user_id", user.id).order("submitted_at", { ascending: false }).limit(5),
          supabase.from("mc_investments").select("id, amount, currency, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
        ]);

        if (depositsRes.error) console.error("Dashboard deposits fetch error:", depositsRes.error);
        if (withdrawalsRes.error) console.error("Dashboard withdrawals fetch error:", withdrawalsRes.error);
        if (investmentsRes.error) console.error("Dashboard investments fetch error:", investmentsRes.error);

        // Merge all transactions into a unified list
        const allTx: Transaction[] = [
          ...(depositsRes.data || []).map((d) => ({ id: `dep-${d.id}`, type: "deposit", amount: Number(d.amount), currency: d.currency, status: d.status, created_at: d.submitted_at })),
          ...(withdrawalsRes.data || []).map((w) => ({ id: `wd-${w.id}`, type: "withdrawal", amount: Number(w.amount), currency: w.currency, status: w.status, created_at: w.submitted_at })),
          ...(investmentsRes.data || []).map((i) => ({ id: `inv-${i.id}`, type: "investment", amount: Number(i.amount), currency: i.currency, status: i.status, created_at: i.created_at })),
        ];
        allTx.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        // Use the larger of profile total_investment or actual approved deposits sum
        const profileTotalDeposit = Number(profile?.total_investment || 0);
        const totalDeposit = Math.max(profileTotalDeposit, depositsTotal);
        const totalProfit = Number(profile?.total_profit || 0);
        const walletBalance = totalDeposit + totalProfit;

        setStats([
          {
            name: "Total Deposit",
            value: totalDeposit,
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
        ]);

        setRecentTransactions(allTx.slice(0, 5));

        // Build portfolio growth chart data
        await buildChartData(user.id, chartPeriod);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, supabase]);

  // Rebuild chart when period changes
  useEffect(() => {
    if (!user) return;
    buildChartData(user.id, chartPeriod);
  }, [chartPeriod]);

  const buildChartData = async (userId: string, period: "7D" | "30D" | "90D" | "1Y") => {
    const now = new Date();
    let daysBack: number;
    let bucketFn: (d: Date) => string;

    switch (period) {
      case "7D":
        daysBack = 7;
        bucketFn = (d) => d.toLocaleDateString("en-US", { weekday: "short" });
        break;
      case "30D":
        daysBack = 30;
        bucketFn = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        break;
      case "90D":
        daysBack = 90;
        bucketFn = (d) => {
          const week = Math.ceil((d.getDate()) / 7);
          return `${d.toLocaleDateString("en-US", { month: "short" })} W${week}`;
        };
        break;
      case "1Y":
        daysBack = 365;
        bucketFn = (d) => d.toLocaleDateString("en-US", { month: "short" });
        break;
    }

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysBack);

    // Fetch deposits and investments in the period
    const [deps, invs] = await Promise.all([
      supabase.from("mc_deposits").select("amount, submitted_at").eq("user_id", userId).eq("status", "approved").gte("submitted_at", startDate.toISOString()),
      supabase.from("mc_investments").select("amount, current_value, created_at").eq("user_id", userId).eq("status", "active").gte("created_at", startDate.toISOString()),
    ]);

    // Build cumulative value buckets
    const buckets: Record<string, number> = {};
    const bucketKeys: string[] = [];

    for (let i = 0; i < daysBack; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - (daysBack - 1 - i));
      const key = bucketFn(d);
      if (!buckets[key]) {
        buckets[key] = 0;
        bucketKeys.push(key);
      }
    }

    // Add deposit amounts to their bucket
    (deps.data || []).forEach((dep) => {
      const key = bucketFn(new Date(dep.submitted_at));
      if (buckets[key] !== undefined) buckets[key] += Number(dep.amount);
    });

    // Add investment current_value to the latest bucket (as portfolio value)
    const totalCurrentValue = (invs.data || []).reduce((s, inv) => s + Number(inv.current_value || inv.amount), 0);

    // Build cumulative growth curve
    let cumulative = 0;
    const data = bucketKeys.map((key) => {
      cumulative += buckets[key];
      return { label: key, value: cumulative };
    });

    // If we have active investments, scale the last point to include current value
    if (totalCurrentValue > 0 && data.length > 0) {
      data[data.length - 1].value = totalCurrentValue;
    }

    setChartData(data);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          Welcome back! Here&apos;s your investment overview.
        </p>
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
              <p className="text-sm text-surface-500 dark:text-surface-400">
                {chartPeriod === "7D" && "Last 7 days performance"}
                {chartPeriod === "30D" && "Last 30 days performance"}
                {chartPeriod === "90D" && "Last 90 days performance"}
                {chartPeriod === "1Y" && "Last year performance"}
              </p>
            </div>
            <div className="flex gap-2">
              {(["7D", "30D", "90D", "1Y"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    period === chartPeriod
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                      : "text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
                  )}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          {/* Portfolio Growth Chart */}
          {chartData.length === 0 || chartData.every((d) => d.value === 0) ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-surface-200 dark:border-surface-700">
              <BarChart3 className="h-8 w-8 text-surface-300 dark:text-surface-600" />
              <p className="mt-2 text-sm text-surface-400 dark:text-surface-500">No portfolio data yet</p>
              <p className="text-xs text-surface-400">Make a deposit to see your growth</p>
            </div>
          ) : (
            <div className="h-64">
              <div className="flex h-full items-end gap-1.5">
                {chartData.map((point, i) => {
                  const maxVal = Math.max(...chartData.map((d) => d.value), 1);
                  const height = (point.value / maxVal) * 220;
                  return (
                    <div key={i} className="group relative flex flex-1 flex-col items-center">
                      {/* Tooltip */}
                      <div className="pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 rounded-md bg-surface-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-surface-100 dark:text-surface-900">
                        {formatCurrency(point.value)}
                      </div>
                      <div
                        className="w-full min-w-[4px] max-w-[24px] rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400 transition-all duration-300 hover:from-brand-500 hover:to-brand-300"
                        style={{ height: `${Math.max(height, 2)}px` }}
                      />
                      {/* X-axis label (show fewer labels for readability) */}
                      {(chartData.length <= 12 || i % Math.ceil(chartData.length / 10) === 0) && (
                        <span className="mt-1.5 text-[9px] text-surface-400 dark:text-surface-500">{point.label}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-800 dark:bg-surface-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-surface-900 dark:text-white">Recent Transactions</h2>
            <Link href="/dashboard/deposits" className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { title: "Deposits & Withdrawals", desc: "Manage deposits and withdrawals", icon: ArrowRight, href: "/dashboard/deposits" },
          { title: "Referral Program", desc: "Earn 5% by referring friends", icon: TrendingUp, href: "/dashboard/referrals" },
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
