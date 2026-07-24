"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import { CheckCircle, XCircle, Eye, Send } from "lucide-react";

const mockWithdrawals = [
  { id: "1", user: "John Doe", email: "john@example.com", amount: 1000, currency: "USDT", network: "TRC20", wallet: "TN3W...2hXk", status: "pending", date: "2026-07-25" },
  { id: "2", user: "Sarah Smith", email: "sarah@example.com", amount: 500, currency: "USDT", network: "ERC20", wallet: "0x1234...5678", status: "pending", date: "2026-07-24" },
  { id: "3", user: "Mike Johnson", email: "mike@example.com", amount: 2000, currency: "USDT", network: "TRC20", wallet: "TN3W...2hXk", status: "processing", date: "2026-07-23" },
  { id: "4", user: "John Doe", email: "john@example.com", amount: 750, currency: "BTC", network: "Bitcoin", wallet: "bc1q...0wlh", status: "sent", date: "2026-07-22" },
  { id: "5", user: "Alex Brown", email: "alex@example.com", amount: 300, currency: "USDT", network: "BEP20", wallet: "0xabcd...ef01", status: "rejected", date: "2026-07-21" },
];

const statusVariant: Record<string, "success" | "warning" | "destructive" | "default"> = { pending: "warning", processing: "default", sent: "success", completed: "success", rejected: "destructive" };

export default function AdminWithdrawalsPage() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const filtered = mockWithdrawals.filter((w) => statusFilter === "all" || w.status === statusFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Withdrawal Management</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Process and manage withdrawal requests</p>
      </div>

      <div className="flex gap-2">
        {["pending", "processing", "sent", "rejected", "all"].map((s) => (
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
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Wallet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Network</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {filtered.map((w) => (
                  <tr key={w.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                    <td className="px-6 py-4"><div><p className="font-medium text-surface-900 dark:text-white">{w.user}</p><p className="text-xs text-surface-500">{w.email}</p></div></td>
                    <td className="px-6 py-4 font-medium text-surface-900 dark:text-white">{formatCurrency(w.amount)} <span className="text-xs text-surface-500">{w.currency}</span></td>
                    <td className="px-6 py-4 font-mono text-sm text-surface-600 dark:text-surface-400">{w.wallet}</td>
                    <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{w.network}</td>
                    <td className="px-6 py-4"><Badge variant={statusVariant[w.status]}>{w.status}</Badge></td>
                    <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{new Date(w.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {w.status === "pending" && (<><Button variant="ghost" size="sm" className="text-success-600"><CheckCircle className="h-4 w-4" /></Button><Button variant="ghost" size="sm" className="text-danger-600"><XCircle className="h-4 w-4" /></Button></>)}
                        {w.status === "processing" && <Button variant="ghost" size="sm" className="text-brand-600"><Send className="h-4 w-4" /></Button>}
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
