"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, cn } from "@/lib/utils";
import { Search, TrendingUp, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";

const mockInvestments = [
  { id: "1", user: "John Doe", email: "john@example.com", plan: "Growth Plan", amount: 10000, currentValue: 11500, status: "active", startDate: "2026-07-01" },
  { id: "2", user: "Sarah Smith", email: "sarah@example.com", plan: "Starter Plan", amount: 5000, currentValue: 5250, status: "active", startDate: "2026-07-15" },
  { id: "3", user: "Mike Johnson", email: "mike@example.com", plan: "Professional", amount: 25000, currentValue: 28750, status: "active", startDate: "2026-06-01" },
  { id: "4", user: "John Doe", email: "john@example.com", plan: "Growth Plan", amount: 7500, currentValue: 8100, status: "completed", startDate: "2026-03-01" },
  { id: "5", user: "Alex Brown", email: "alex@example.com", plan: "Starter Plan", amount: 1000, currentValue: 1000, status: "pending", startDate: "2026-07-25" },
];

const statusVariant: Record<string, "success" | "warning" | "destructive" | "default"> = { active: "default", completed: "success", pending: "warning", cancelled: "destructive" };

export default function AdminInvestmentsPage() {
  const [search, setSearch] = useState("");
  const filtered = mockInvestments.filter((i) => !search || i.user.toLowerCase().includes(search.toLowerCase()) || i.plan.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Investment Management</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Manage all user investments and apply profits</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><DollarSign className="mr-2 h-4 w-4" />Apply Profit</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <Input placeholder="Search by user or plan..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Current Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Profit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                    <td className="px-6 py-4"><div><p className="font-medium text-surface-900 dark:text-white">{inv.user}</p><p className="text-xs text-surface-500">{inv.email}</p></div></td>
                    <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{inv.plan}</td>
                    <td className="px-6 py-4 font-medium text-surface-900 dark:text-white">{formatCurrency(inv.amount)}</td>
                    <td className="px-6 py-4 font-medium text-success-600">{formatCurrency(inv.currentValue)}</td>
                    <td className="px-6 py-4 text-sm text-success-600">+{formatCurrency(inv.currentValue - inv.amount)}</td>
                    <td className="px-6 py-4"><Badge variant={statusVariant[inv.status]}>{inv.status}</Badge></td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm"><DollarSign className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm"><TrendingUp className="h-4 w-4" /></Button>
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
