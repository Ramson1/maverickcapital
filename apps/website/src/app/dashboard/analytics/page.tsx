"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, DollarSign, BarChart3, ArrowUpRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";

interface MonthlyData {
  month: string;
  profit: number;
  deposits: number;
  withdrawals: number;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [totalProfit, setTotalProfit] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [totalDeposited, setTotalDeposited] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch profile for summary stats
      const { data: profile } = await supabase
        .from("mc_profiles")
        .select("total_investment, total_profit, wallet_balance")
        .eq("id", user.id)
        .single();

      const invested = Number(profile?.total_investment || 0);
      const profit = Number(profile?.total_profit || 0);
      setTotalInvested(invested);
      setTotalProfit(profit);

      // Fetch investments for current value
      const { data: investments } = await supabase
        .from("mc_investments")
        .select("current_value")
        .eq("user_id", user.id)
        .eq("status", "active");

      const cv = (investments || []).reduce((s, i) => s + Number(i.current_value), 0);
      setCurrentValue(cv);

      // Fetch deposits
      const { data: deposits } = await supabase
        .from("mc_deposits")
        .select("amount, submitted_at")
        .eq("user_id", user.id)
        .eq("status", "approved");

      const totalDep = (deposits || []).reduce((s, d) => s + Number(d.amount), 0);
      setTotalDeposited(totalDep);

      // Fetch withdrawals
      const { data: withdrawals } = await supabase
        .from("mc_withdrawals")
        .select("amount, submitted_at")
        .eq("user_id", user.id)
        .in("status", ["completed", "sent"]);

      const totalWdr = (withdrawals || []).reduce((s, w) => s + Number(w.amount), 0);
      setTotalWithdrawn(totalWdr);

      // Build monthly data from deposits and withdrawals
      const months: Record<string, MonthlyData> = {};
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      // Initialize last 7 months
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        months[key] = { month: monthNames[d.getMonth()], profit: 0, deposits: 0, withdrawals: 0 };
      }

      (deposits || []).forEach((d) => {
        const date = new Date(d.submitted_at);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (months[key]) months[key].deposits += Number(d.amount);
      });

      (withdrawals || []).forEach((w) => {
        const date = new Date(w.submitted_at);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (months[key]) months[key].withdrawals += Number(w.amount);
      });

      // Distribute profit evenly across months with investments (simplified)
      const monthKeys = Object.keys(months);
      if (monthKeys.length > 0 && profit > 0) {
        const perMonth = profit / monthKeys.length;
        monthKeys.forEach((k) => { months[k].profit = perMonth; });
      }

      setMonthlyData(Object.values(months));
      setLoading(false);
    };

    fetchData();
  }, [user, supabase]);

  const roi = totalInvested > 0 ? ((totalProfit / totalInvested) * 100).toFixed(1) : "0.0";
  const maxProfit = Math.max(...monthlyData.map((d) => d.profit), 1);
  const maxFlow = Math.max(...monthlyData.map((d) => Math.max(d.deposits, d.withdrawals)), 1);

  // Find best month
  const bestMonth = monthlyData.reduce((best, d) => d.profit > best.profit ? d : best, { month: "-", profit: 0 });

  // Average monthly return
  const avgReturn = monthlyData.length > 0
    ? (monthlyData.reduce((s, d) => s + d.profit, 0) / monthlyData.length)
    : 0;
  const avgReturnPct = totalInvested > 0 ? ((avgReturn / (totalInvested / 12)) * 100).toFixed(1) : "0.0";

  const stats = [
    { name: "Total Profit", value: formatCurrency(totalProfit), change: totalInvested > 0 ? `+${((totalProfit / totalInvested) * 100).toFixed(1)}%` : "0%", icon: DollarSign },
    { name: "ROI", value: `${roi}%`, change: "All time", icon: TrendingUp },
    { name: "Best Month", value: formatCurrency(bestMonth.profit), change: bestMonth.month, icon: ArrowUpRight },
    { name: "Avg. Monthly", value: formatCurrency(avgReturn), change: `${avgReturnPct}%`, icon: BarChart3 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Analytics</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Track your investment performance</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
                    <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <span className="flex items-center gap-0.5 text-xs font-medium text-success-600 dark:text-success-500">
                    {stat.change}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-surface-500 dark:text-surface-400">{stat.name}</p>
                  <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-white">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Profit Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Profit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 h-64">
            {monthlyData.map((d) => (
              <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative w-full flex justify-center">
                  <div
                    className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 transition-all"
                    style={{ height: `${(d.profit / maxProfit) * 200}px` }}
                  />
                </div>
                <span className="text-xs text-surface-500 dark:text-surface-400">{d.month}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deposits vs Withdrawals */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Deposits vs Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((d) => (
                <div key={d.month} className="flex items-center gap-4">
                  <span className="w-8 text-sm text-surface-500">{d.month}</span>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-success-500" style={{ width: `${(d.deposits / maxFlow) * 100}%` }} />
                      <span className="text-xs text-surface-500">{formatCurrency(d.deposits)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-danger-500" style={{ width: `${(d.withdrawals / maxFlow) * 100}%` }} />
                      <span className="text-xs text-surface-500">{formatCurrency(d.withdrawals)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between"><span className="text-surface-500">Total Invested</span><span className="font-semibold">{formatCurrency(totalInvested)}</span></div>
            <div className="flex justify-between"><span className="text-surface-500">Current Value</span><span className="font-semibold text-brand-600">{formatCurrency(currentValue)}</span></div>
            <div className="flex justify-between"><span className="text-surface-500">Total Profit</span><span className="font-semibold text-success-600">{formatCurrency(totalProfit)}</span></div>
            <div className="flex justify-between"><span className="text-surface-500">Total Deposited</span><span className="font-semibold">{formatCurrency(totalDeposited)}</span></div>
            <div className="flex justify-between"><span className="text-surface-500">Total Withdrawn</span><span className="font-semibold">{formatCurrency(totalWithdrawn)}</span></div>
            <div className="border-t border-surface-200 pt-4 dark:border-surface-700">
              <div className="flex justify-between"><span className="font-medium">Net Worth</span><span className="text-xl font-bold text-success-600">{formatCurrency(currentValue)}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
