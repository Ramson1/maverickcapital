"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, cn } from "@/lib/utils";
import { Search, TrendingUp, DollarSign, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TablePageSkeleton } from "@/components/ui/PageSkeletons";

interface UserProfit {
  user_id: string;
  full_name: string;
  email: string;
  total_deposited: number;
  total_profit: number;
  wallet_balance: number;
  total_investment: number;
  kyc_status: string;
  account_status: string;
  joined_at: string;
}

export default function AdminUserProfitsPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<UserProfit[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch all profiles with financial data
      const { data: profiles, error } = await supabase
        .from("mc_profiles")
        .select("id, full_name, email, wallet_balance, total_profit, total_investment, kyc_status, account_status, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Admin user profits fetch error:", error.message || error);
        setLoading(false);
        return;
      }
      if (!profiles) {
        setLoading(false);
        return;
      }

      // Fetch approved deposits per user to compute total deposited
      const { data: deposits } = await supabase
        .from("mc_deposits")
        .select("user_id, amount")
        .eq("status", "approved");

      const depositTotals: Record<string, number> = {};
      if (deposits) {
        deposits.forEach((d) => {
          depositTotals[d.user_id] = (depositTotals[d.user_id] || 0) + Number(d.amount);
        });
      }

      const rows: UserProfit[] = profiles.map((p) => {
        const profileDeposited = Number(p.total_investment || 0);
        const directDeposited = depositTotals[p.id] || 0;
        const totalDeposited = Math.max(profileDeposited, directDeposited);
        const totalProfit = Number(p.total_profit || 0);
        return {
          user_id: p.id,
          full_name: p.full_name || "Unnamed",
          email: p.email || "",
          total_deposited: totalDeposited,
          total_profit: totalProfit,
          wallet_balance: totalDeposited + totalProfit, // Wallet Balance = Total Deposit + Total Profit
          total_investment: Number(p.total_investment || 0),
          kyc_status: p.kyc_status || "not_submitted",
          account_status: p.account_status || "active",
          joined_at: p.created_at,
        };
      });

      setUsers(rows);
      setLoading(false);
    };

    fetchData();
  }, []);

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.user_id.toLowerCase().includes(q)
    );
  });

  // Summary stats
  const totalDeposited = users.reduce((sum, u) => sum + u.total_deposited, 0);
  const totalProfit = users.reduce((sum, u) => sum + u.total_profit, 0);
  const totalWallet = users.reduce((sum, u) => sum + u.wallet_balance, 0);

  const kycVariant: Record<string, "success" | "warning" | "secondary" | "destructive"> = {
    verified: "success",
    pending: "warning",
    not_submitted: "secondary",
    rejected: "destructive",
  };
  const statusVariant: Record<string, "success" | "warning" | "destructive" | "default"> = {
    active: "success",
    suspended: "destructive",
    blocked: "destructive",
    pending_verification: "warning",
  };

  if (loading) {
    return <TablePageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">User Profits</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          Overview of all user deposits, profits, and wallet balances
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
              <DollarSign className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <p className="text-xs text-surface-500 dark:text-surface-400">Total Deposited</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">{formatCurrency(totalDeposited)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50 dark:bg-success-500/10">
              <TrendingUp className="h-5 w-5 text-success-600 dark:text-success-500" />
            </div>
            <div>
              <p className="text-xs text-surface-500 dark:text-surface-400">Total Profits Credited</p>
              <p className="text-xl font-bold text-success-600 dark:text-success-400">{formatCurrency(totalProfit)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-50 dark:bg-warning-500/10">
              <Users className="h-5 w-5 text-warning-600 dark:text-warning-500" />
            </div>
            <div>
              <p className="text-xs text-surface-500 dark:text-surface-400">Total Wallet Balance</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">{formatCurrency(totalWallet)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <Input
              placeholder="Search by name, email, or user ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">KYC</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase text-surface-500">Deposited</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase text-surface-500">Profit</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase text-surface-500">Wallet Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-surface-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.user_id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-surface-900 dark:text-white">{u.full_name}</p>
                          <p className="text-xs text-surface-500">{u.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusVariant[u.account_status] || "default"}>
                          {u.account_status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={kycVariant[u.kyc_status] || "secondary"}>
                          {u.kyc_status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-surface-900 dark:text-white">
                        {formatCurrency(u.total_deposited)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={cn(
                          "inline-flex items-center gap-0.5 font-medium",
                          u.total_profit > 0
                            ? "text-success-600 dark:text-success-400"
                            : "text-surface-400"
                        )}>
                          {u.total_profit > 0 && <ArrowUpRight className="h-3.5 w-3.5" />}
                          {formatCurrency(u.total_profit)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-surface-900 dark:text-white">
                        {formatCurrency(u.wallet_balance)}
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">
                        {new Date(u.joined_at).toLocaleDateString()}
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
