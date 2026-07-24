"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import { Users, DollarSign, TrendingUp, ArrowUpRight, Clock, AlertCircle, Eye, Shield, Activity, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Stats {
  totalUsers: number;
  totalInvestments: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  pendingTickets: number;
}

interface RecentActivity {
  id: string;
  action: string;
  detail: string;
  time: string;
  type: string;
}

interface PendingItem {
  id: string;
  type: string;
  user_email: string;
  amount: number;
  currency: string;
  time: string;
}

export default function AdminDashboardPage() {
  const supabase = createClient();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // Total users
      const { count: userCount } = await supabase
        .from("mc_profiles")
        .select("*", { count: "exact", head: true });

      // Total investments sum
      const { data: investments } = await supabase
        .from("mc_investments")
        .select("amount");
      const totalInv = investments?.reduce((sum, i) => sum + Number(i.amount), 0) || 0;

      // Total deposits sum (approved)
      const { data: deposits } = await supabase
        .from("mc_deposits")
        .select("amount")
        .eq("status", "approved");
      const totalDep = deposits?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;

      // Total withdrawals sum (completed/sent)
      const { data: withdrawals } = await supabase
        .from("mc_withdrawals")
        .select("amount")
        .in("status", ["completed", "sent"]);
      const totalWd = withdrawals?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;

      // Pending counts
      const { count: pendingDepCount } = await supabase
        .from("mc_deposits")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: pendingWdCount } = await supabase
        .from("mc_withdrawals")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: pendingTicketCount } = await supabase
        .from("mc_support_tickets")
        .select("*", { count: "exact", head: true })
        .in("status", ["open", "in_progress"]);

      setStats({
        totalUsers: userCount || 0,
        totalInvestments: totalInv,
        totalDeposits: totalDep,
        totalWithdrawals: totalWd,
        pendingDeposits: pendingDepCount || 0,
        pendingWithdrawals: pendingWdCount || 0,
        pendingTickets: pendingTicketCount || 0,
      });

      // Recent activity - fetch recent deposits and investments
      const { data: recentDeposits } = await supabase
        .from("mc_deposits")
        .select("amount, status, submitted_at, user_id")
        .order("submitted_at", { ascending: false })
        .limit(3);

      const { data: recentInvestments } = await supabase
        .from("mc_investments")
        .select("amount, status, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(3);

      const activities: RecentActivity[] = [];
      if (recentDeposits) {
        for (const d of recentDeposits) {
          let email = "Unknown user";
          const { data: profile } = await supabase
            .from("mc_profiles")
            .select("full_name")
            .eq("id", d.user_id)
            .single();
          if (profile) email = profile.full_name || d.user_id.slice(0, 8);

          activities.push({
            id: `dep-${d.submitted_at}`,
            action: `Deposit ${d.status}`,
            detail: email,
            time: new Date(d.submitted_at).toLocaleString(),
            type: "deposit",
          });
        }
      }
      if (recentInvestments) {
        for (const inv of recentInvestments) {
          let email = "Unknown user";
          const { data: profile } = await supabase
            .from("mc_profiles")
            .select("full_name")
            .eq("id", inv.user_id)
            .single();
          if (profile) email = profile.full_name || inv.user_id.slice(0, 8);

          activities.push({
            id: `inv-${inv.created_at}`,
            action: "Investment created",
            detail: email,
            time: new Date(inv.created_at).toLocaleString(),
            type: "investment",
          });
        }
      }
      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setRecentActivity(activities.slice(0, 6));

      // Pending items
      const { data: pendingDeps } = await supabase
        .from("mc_deposits")
        .select("id, amount, currency, submitted_at, user_id")
        .eq("status", "pending")
        .order("submitted_at", { ascending: false })
        .limit(3);

      const { data: pendingWds } = await supabase
        .from("mc_withdrawals")
        .select("id, amount, currency, submitted_at, user_id")
        .eq("status", "pending")
        .order("submitted_at", { ascending: false })
        .limit(3);

      const pending: PendingItem[] = [];
      if (pendingDeps) {
        for (const d of pendingDeps) {
          const { data: profile } = await supabase.from("mc_profiles").select("full_name").eq("id", d.user_id).single();
          pending.push({
            id: d.id,
            type: "Deposit",
            user_email: profile?.full_name || d.user_id.slice(0, 8),
            amount: Number(d.amount),
            currency: d.currency,
            time: new Date(d.submitted_at).toLocaleString(),
          });
        }
      }
      if (pendingWds) {
        for (const w of pendingWds) {
          const { data: profile } = await supabase.from("mc_profiles").select("full_name").eq("id", w.user_id).single();
          pending.push({
            id: w.id,
            type: "Withdrawal",
            user_email: profile?.full_name || w.user_id.slice(0, 8),
            amount: Number(w.amount),
            currency: w.currency,
            time: new Date(w.submitted_at).toLocaleString(),
          });
        }
      }
      setPendingItems(pending);
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { name: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users, color: "text-brand-600", bg: "bg-brand-50 dark:bg-brand-500/10" },
    { name: "Total Investments", value: formatCurrency(stats.totalInvestments), icon: TrendingUp, color: "text-success-600", bg: "bg-success-50 dark:bg-success-500/10" },
    { name: "Total Deposits", value: formatCurrency(stats.totalDeposits), icon: DollarSign, color: "text-brand-600", bg: "bg-brand-50 dark:bg-brand-500/10" },
    { name: "Total Withdrawals", value: formatCurrency(stats.totalWithdrawals), icon: ArrowUpRight, color: "text-danger-600", bg: "bg-danger-50 dark:bg-danger-500/10" },
    { name: "Pending Deposits", value: stats.pendingDeposits.toString(), icon: Clock, color: "text-warning-600", bg: "bg-warning-50 dark:bg-warning-500/10" },
    { name: "Pending Withdrawals", value: stats.pendingWithdrawals.toString(), icon: Clock, color: "text-warning-600", bg: "bg-warning-50 dark:bg-warning-500/10" },
    { name: "Pending Tickets", value: stats.pendingTickets.toString(), icon: AlertCircle, color: "text-accent-600", bg: "bg-accent-50 dark:bg-accent-500/10" },
    { name: "Revenue", value: formatCurrency(stats.totalDeposits - stats.totalWithdrawals), icon: DollarSign, color: "text-success-600", bg: "bg-success-50 dark:bg-success-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Platform overview and quick actions</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive"><Shield className="mr-1 h-3 w-3" />Admin</Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", stat.bg)}>
                    <Icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-surface-500 dark:text-surface-400">{stat.name}</p>
                  <p className="mt-0.5 text-lg font-bold text-surface-900 dark:text-white">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="py-4 text-center text-sm text-surface-500">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs",
                      activity.type === "deposit" && "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500",
                      activity.type === "withdrawal" && "bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-500",
                      activity.type === "investment" && "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
                    )}>
                      {activity.type[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-900 dark:text-white">{activity.action}</p>
                      <p className="text-xs text-surface-500 truncate">{activity.detail}</p>
                    </div>
                    <span className="text-xs text-surface-400 shrink-0">{activity.time}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Items */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingItems.length === 0 ? (
              <p className="py-4 text-center text-sm text-surface-500">No pending items</p>
            ) : (
              <div className="space-y-3">
                {pendingItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-surface-100 p-3 dark:border-surface-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.type === "Deposit" ? "success" : "destructive"}>{item.type}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-surface-600 dark:text-surface-400">{item.user_email}</p>
                      <p className="text-xs text-surface-400">{formatCurrency(item.amount)} {item.currency} &middot; {item.time}</p>
                    </div>
                    <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
