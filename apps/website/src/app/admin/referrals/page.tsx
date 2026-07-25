"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { TablePageSkeleton } from "@/components/ui/PageSkeletons";
import {
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Loader2,
  Eye,
  Search,
} from "lucide-react";

interface ReferralStats {
  totalReferrals: number;
  totalCommissionPaid: number;
  pendingReferrals: number;
  activeReferrers: number;
}

interface ReferralRecord {
  id: string;
  referrer_id: string;
  referrer_name: string;
  referrer_email: string;
  referred_name: string;
  referred_email: string;
  commission_earned: number;
  first_deposit_amount: number | null;
  first_deposit_at: string | null;
  status: string;
  created_at: string;
}

export default function AdminReferralsPage() {
  const supabase = createClient();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      // Fetch all referrals with user info
      const { data: referralData } = await supabase
        .from("mc_referrals")
        .select(`
          id,
          referrer_id,
          referred_user_id,
          commission_earned,
          first_deposit_amount,
          first_deposit_at,
          status,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (!referralData) {
        setLoading(false);
        return;
      }

      // Fetch user details
      const records: ReferralRecord[] = [];
      for (const ref of referralData) {
        const { data: referrer } = await supabase
          .from("mc_profiles")
          .select("full_name, email")
          .eq("id", ref.referrer_id)
          .single();

        const { data: referred } = await supabase
          .from("mc_profiles")
          .select("full_name, email")
          .eq("id", ref.referred_user_id)
          .single();

        records.push({
          id: ref.id,
          referrer_id: ref.referrer_id,
          referrer_name: referrer?.full_name || "Unknown",
          referrer_email: referrer?.email || "",
          referred_name: referred?.full_name || "Unknown",
          referred_email: referred?.email || "",
          commission_earned: Number(ref.commission_earned || 0),
          first_deposit_amount: ref.first_deposit_amount ? Number(ref.first_deposit_amount) : null,
          first_deposit_at: ref.first_deposit_at,
          status: ref.status,
          created_at: ref.created_at,
        });
      }

      setReferrals(records);

      // Calculate stats
      const totalCommission = records.reduce((sum, r) => sum + r.commission_earned, 0);
      const pending = records.filter((r) => r.status === "pending").length;
      const uniqueReferrers = new Set(records.map((r) => r.referrer_id)).size;

      setStats({
        totalReferrals: records.length,
        totalCommissionPaid: totalCommission,
        pendingReferrals: pending,
        activeReferrers: uniqueReferrers,
      });

      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  const filtered = referrals.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        r.referrer_name.toLowerCase().includes(s) ||
        r.referred_name.toLowerCase().includes(s) ||
        r.referrer_email.toLowerCase().includes(s) ||
        r.referred_email.toLowerCase().includes(s)
      );
    }
    return true;
  });

  if (loading) {
    return <TablePageSkeleton />;
  }

  const statCards = stats
    ? [
        { name: "Total Referrals", value: stats.totalReferrals.toString(), icon: Users, color: "text-brand-600", bg: "bg-brand-50 dark:bg-brand-500/10" },
        { name: "Commission Paid", value: formatCurrency(stats.totalCommissionPaid), icon: DollarSign, color: "text-success-600", bg: "bg-success-50 dark:bg-success-500/10" },
        { name: "Pending Referrals", value: stats.pendingReferrals.toString(), icon: Clock, color: "text-warning-600", bg: "bg-warning-50 dark:bg-warning-500/10" },
        { name: "Active Referrers", value: stats.activeReferrers.toString(), icon: TrendingUp, color: "text-accent-600", bg: "bg-accent-50 dark:bg-accent-500/10" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Referral Management</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          Monitor and manage the affiliate referral system
        </p>
      </div>

      {/* Stats */}
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

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-surface-200 bg-white py-2 pl-9 pr-4 text-sm text-surface-900 outline-none focus:border-brand-500 dark:border-surface-700 dark:bg-surface-800 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            {["all", "pending", "completed"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  statusFilter === s
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                    : "text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
                )}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Referrals Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Referral Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Referrer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Referred User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">First Deposit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Commission (5%)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-surface-400">
                      No referrals found
                    </td>
                  </tr>
                ) : (
                  filtered.map((ref) => (
                    <tr key={ref.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-surface-900 dark:text-white">{ref.referrer_name}</p>
                          <p className="text-xs text-surface-500 dark:text-surface-400">{ref.referrer_email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-surface-900 dark:text-white">{ref.referred_name}</p>
                          <p className="text-xs text-surface-500 dark:text-surface-400">{ref.referred_email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">
                        {ref.first_deposit_amount ? formatCurrency(ref.first_deposit_amount) : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-success-600 dark:text-success-400">
                        {formatCurrency(ref.commission_earned)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={ref.status === "completed" ? "success" : ref.status === "pending" ? "warning" : "default"}>
                          {ref.status === "completed" && <CheckCircle className="mr-1 h-3 w-3" />}
                          {ref.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">
                        {new Date(ref.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
