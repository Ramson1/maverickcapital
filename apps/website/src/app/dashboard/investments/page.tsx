"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import { TrendingUp, Plus, Clock, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";

interface Investment {
  id: string;
  plan_id: string;
  amount: number;
  current_value: number;
  status: string;
  start_date: string;
  end_date: string | null;
  mc_investment_plans: { name: string } | null;
}

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "destructive" | "warning" }> = {
  active: { label: "Active", variant: "default" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  pending: { label: "Pending", variant: "warning" },
  paused: { label: "Paused", variant: "warning" },
};

export default function InvestmentsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchInvestments = async () => {
      const { data, error } = await supabase
        .from("mc_investments")
        .select("*, mc_investment_plans(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setInvestments(
          data.map((inv) => ({
            ...inv,
            amount: Number(inv.amount),
            current_value: Number(inv.current_value),
          }))
        );
      }
      setLoading(false);
    };

    fetchInvestments();
  }, [user, supabase]);

  const filtered = filter === "all" ? investments : investments.filter((i) => i.status === filter);
  const totalInvested = investments.filter((i) => i.status === "active").reduce((s, i) => s + i.amount, 0);
  const totalValue = investments.filter((i) => i.status === "active").reduce((s, i) => s + i.current_value, 0);
  const totalProfit = investments.reduce((s, i) => s + (i.current_value - i.amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Investments</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Manage your investment portfolio</p>
        </div>
        <Link href="/dashboard/investments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Investment
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-surface-500 dark:text-surface-400">Total Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{formatCurrency(totalInvested)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-surface-500 dark:text-surface-400">Current Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{formatCurrency(totalValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-surface-500 dark:text-surface-400">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success-600 dark:text-success-500">{formatCurrency(totalProfit)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "active", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              filter === f
                ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                : "text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
            )}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Investment List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-surface-300 dark:text-surface-600" />
            <p className="mt-4 text-sm text-surface-500">No investments found</p>
            <Link href="/dashboard/investments/new">
              <Button className="mt-4">Start Your First Investment</Button>
            </Link>
          </div>
        ) : (
          filtered.map((inv) => {
            const status = statusConfig[inv.status] || statusConfig.pending;
            const profitPct = inv.amount > 0 ? ((inv.current_value - inv.amount) / inv.amount * 100).toFixed(1) : "0.0";
            return (
              <Link key={inv.id} href={`/dashboard/investments/${inv.id}`}>
                <Card className="transition-colors hover:border-brand-200 dark:hover:border-brand-800">
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
                        <TrendingUp className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-surface-900 dark:text-white">
                          {inv.mc_investment_plans?.name || "Investment"}
                        </p>
                        <p className="text-sm text-surface-500 dark:text-surface-400">
                          Started {new Date(inv.start_date).toLocaleDateString()}
                          {inv.end_date && ` · Ends ${new Date(inv.end_date).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold text-surface-900 dark:text-white">{formatCurrency(inv.amount)}</p>
                        <p className="text-sm text-surface-500 dark:text-surface-400">Invested</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-success-600 dark:text-success-500">{formatCurrency(inv.current_value)}</p>
                        <p className="text-sm text-success-600 dark:text-success-500">+{profitPct}%</p>
                      </div>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
