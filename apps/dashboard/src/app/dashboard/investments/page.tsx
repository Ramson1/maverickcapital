"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import { TrendingUp, Plus, Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

const mockInvestments = [
  { id: "1", plan: "Growth Plan", amount: 10000, currentValue: 11500, status: "active", startDate: "2026-07-01", endDate: "2026-10-01", profit: 1500 },
  { id: "2", plan: "Starter Plan", amount: 5000, currentValue: 5250, status: "active", startDate: "2026-07-15", endDate: "2026-08-15", profit: 250 },
  { id: "3", plan: "Professional", amount: 10000, currentValue: 12000, status: "active", startDate: "2026-06-01", endDate: "2026-12-01", profit: 2000 },
  { id: "4", plan: "Growth Plan", amount: 7500, currentValue: 8100, status: "completed", startDate: "2026-03-01", endDate: "2026-06-01", profit: 600 },
];

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "destructive" | "warning" }> = {
  active: { label: "Active", variant: "default" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  pending: { label: "Pending", variant: "warning" },
};

export default function InvestmentsPage() {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const filtered = filter === "all" ? mockInvestments : mockInvestments.filter((i) => i.status === filter);
  const totalInvested = mockInvestments.filter((i) => i.status === "active").reduce((s, i) => s + i.amount, 0);
  const totalValue = mockInvestments.filter((i) => i.status === "active").reduce((s, i) => s + i.currentValue, 0);
  const totalProfit = mockInvestments.reduce((s, i) => s + i.profit, 0);

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
        {filtered.map((inv) => {
          const status = statusConfig[inv.status] || statusConfig.pending;
          const profitPct = ((inv.currentValue - inv.amount) / inv.amount * 100).toFixed(1);
          return (
            <Link key={inv.id} href={`/dashboard/investments/${inv.id}`}>
              <Card className="transition-colors hover:border-brand-200 dark:hover:border-brand-800">
                <CardContent className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
                      <TrendingUp className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-surface-900 dark:text-white">{inv.plan}</p>
                      <p className="text-sm text-surface-500 dark:text-surface-400">
                        Started {new Date(inv.startDate).toLocaleDateString()} &middot; Ends {new Date(inv.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-semibold text-surface-900 dark:text-white">{formatCurrency(inv.amount)}</p>
                      <p className="text-sm text-surface-500 dark:text-surface-400">Invested</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-success-600 dark:text-success-500">{formatCurrency(inv.currentValue)}</p>
                      <p className="text-sm text-success-600 dark:text-success-500">+{profitPct}%</p>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <ArrowRight className="h-4 w-4 text-surface-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
