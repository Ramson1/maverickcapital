"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, cn } from "@/lib/utils";
import { Search, CheckCircle, XCircle, Eye } from "lucide-react";

const mockDeposits = [
  { id: "1", user: "John Doe", email: "john@example.com", amount: 5000, currency: "USDT", network: "TRC20", status: "pending", txHash: "0x1234...5678", date: "2026-07-25" },
  { id: "2", user: "Sarah Smith", email: "sarah@example.com", amount: 10000, currency: "USDT", network: "ERC20", status: "pending", txHash: "0x9abc...def0", date: "2026-07-25" },
  { id: "3", user: "Mike Johnson", email: "mike@example.com", amount: 2000, currency: "BTC", network: "Bitcoin", status: "pending", txHash: "0x5678...1234", date: "2026-07-24" },
  { id: "4", user: "John Doe", email: "john@example.com", amount: 7500, currency: "USDT", network: "TRC20", status: "approved", txHash: "0xabcd...ef01", date: "2026-07-23" },
  { id: "5", user: "Alex Brown", email: "alex@example.com", amount: 3000, currency: "USDT", network: "BEP20", status: "rejected", txHash: "0xdef0...2345", date: "2026-07-22" },
];

const statusVariant: Record<string, "success" | "warning" | "destructive" | "default"> = { pending: "warning", approved: "success", rejected: "destructive", processing: "default" };

export default function AdminDepositsPage() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const filtered = mockDeposits.filter((d) => statusFilter === "all" || d.status === statusFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Deposit Management</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Review and approve user deposits</p>
      </div>

      <div className="flex gap-2">
        {["pending", "approved", "rejected", "all"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-colors", statusFilter === s ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" : "text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800")}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Network</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Tx Hash</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {filtered.map((dep) => (
                  <tr key={dep.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                    <td className="px-6 py-4"><div><p className="font-medium text-surface-900 dark:text-white">{dep.user}</p><p className="text-xs text-surface-500">{dep.email}</p></div></td>
                    <td className="px-6 py-4 font-medium text-surface-900 dark:text-white">{formatCurrency(dep.amount)} <span className="text-xs text-surface-500">{dep.currency}</span></td>
                    <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{dep.network}</td>
                    <td className="px-6 py-4 font-mono text-sm text-surface-600 dark:text-surface-400">{dep.txHash}</td>
                    <td className="px-6 py-4"><Badge variant={statusVariant[dep.status]}>{dep.status}</Badge></td>
                    <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{new Date(dep.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {dep.status === "pending" && (
                          <>
                            <Button variant="ghost" size="sm" className="text-success-600 hover:bg-success-50"><CheckCircle className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-danger-600 hover:bg-danger-50"><XCircle className="h-4 w-4" /></Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                      </div>
                    </td>
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
