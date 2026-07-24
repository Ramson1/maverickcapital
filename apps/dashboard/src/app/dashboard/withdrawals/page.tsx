"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, cn } from "@/lib/utils";
import { ArrowUpRight, Plus, Search, Download } from "lucide-react";

const mockWithdrawals = [
  { id: "1", amount: 1000, currency: "USDT", network: "TRC20", status: "completed", wallet: "TN3W...2hXk", txHash: "0xaaaa...bbbb", date: "2026-07-22" },
  { id: "2", amount: 500, currency: "USDT", network: "ERC20", status: "processing", wallet: "0x1234...5678", txHash: "-", date: "2026-07-24" },
  { id: "3", amount: 2000, currency: "USDT", network: "TRC20", status: "pending", wallet: "TN3W...2hXk", txHash: "-", date: "2026-07-25" },
  { id: "4", amount: 750, currency: "BTC", network: "Bitcoin", status: "completed", wallet: "bc1q...0wlh", txHash: "0xcccc...dddd", date: "2026-07-15" },
];

const statusVariant: Record<string, "success" | "warning" | "destructive" | "default"> = {
  completed: "success", pending: "warning", processing: "default", rejected: "destructive", sent: "default",
};

export default function WithdrawalsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const filtered = mockWithdrawals.filter((w) => statusFilter === "all" || w.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Withdrawals</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Manage your withdrawal requests</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Withdrawal
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="flex gap-2">
            {["all", "pending", "processing", "completed"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  statusFilter === s ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" : "text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
                )}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="ml-auto">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Wallet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Network</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Tx Hash</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {filtered.map((w) => (
                  <tr key={w.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                    <td className="px-6 py-4 font-medium text-surface-900 dark:text-white">{formatCurrency(w.amount)}</td>
                    <td className="px-6 py-4 font-mono text-sm text-surface-600 dark:text-surface-400">{w.wallet}</td>
                    <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{w.network}</td>
                    <td className="px-6 py-4 font-mono text-sm text-surface-600 dark:text-surface-400">{w.txHash}</td>
                    <td className="px-6 py-4"><Badge variant={statusVariant[w.status] || "default"}>{w.status}</Badge></td>
                    <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{new Date(w.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
