"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, cn } from "@/lib/utils";
import { ArrowDownRight, Plus, Search, Filter, Download } from "lucide-react";

const mockDeposits = [
  { id: "1", amount: 5000, currency: "USDT", network: "TRC20", status: "completed", txHash: "0x1234...5678", date: "2026-07-23" },
  { id: "2", amount: 7500, currency: "USDT", network: "ERC20", status: "completed", txHash: "0x9abc...def0", date: "2026-07-19" },
  { id: "3", amount: 2000, currency: "BTC", network: "Bitcoin", status: "pending", txHash: "0x5678...1234", date: "2026-07-25" },
  { id: "4", amount: 10000, currency: "USDT", network: "TRC20", status: "completed", txHash: "0xabcd...ef01", date: "2026-07-10" },
  { id: "5", amount: 3000, currency: "USDT", network: "BEP20", status: "rejected", txHash: "-", date: "2026-07-05" },
];

const statusVariant: Record<string, "success" | "warning" | "destructive" | "default"> = {
  completed: "success",
  pending: "warning",
  rejected: "destructive",
  processing: "default",
};

export default function DepositsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockDeposits.filter((d) => {
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    if (search && !d.txHash.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Deposits</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">View and manage your deposit history</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Deposit
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <Input placeholder="Search by tx hash..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2">
            {["all", "completed", "pending", "rejected"].map((s) => (
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
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </CardContent>
      </Card>

      {/* Deposits Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Currency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Network</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Tx Hash</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {filtered.map((dep) => (
                  <tr key={dep.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                    <td className="px-6 py-4 font-medium text-surface-900 dark:text-white">{formatCurrency(dep.amount)}</td>
                    <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{dep.currency}</td>
                    <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{dep.network}</td>
                    <td className="px-6 py-4 font-mono text-sm text-surface-600 dark:text-surface-400">{dep.txHash}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant[dep.status] || "default"}>{dep.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{new Date(dep.date).toLocaleDateString()}</td>
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
