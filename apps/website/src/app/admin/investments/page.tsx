"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, cn } from "@/lib/utils";
import { Search, TrendingUp, DollarSign, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TablePageSkeleton } from "@/components/ui/PageSkeletons";

interface Investment {
  id: string;
  user_name: string;
  user_id: string;
  plan_name: string;
  amount: number;
  current_value: number;
  status: string;
  start_date: string;
}

const statusVariant: Record<string, "success" | "warning" | "destructive" | "default"> = { active: "default", completed: "success", pending: "warning", cancelled: "destructive", paused: "warning" };

export default function AdminInvestmentsPage() {
  const supabase = createClient();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestments = async () => {
      const { data, error } = await supabase
        .from("mc_investments")
        .select("*, mc_investment_plans(name)")
        .order("created_at", { ascending: false });

      if (error || !data) {
        setLoading(false);
        return;
      }

      // Fetch user profiles for all unique user_ids
      const userIds = [...new Set(data.map((inv) => inv.user_id))];
      const { data: profiles } = await supabase
        .from("mc_profiles")
        .select("id, full_name")
        .in("id", userIds);

      const nameMap: Record<string, string> = {};
      if (profiles) {
        profiles.forEach((p) => { nameMap[p.id] = p.full_name || p.id.slice(0, 8); });
      }

      const rows: Investment[] = data.map((inv) => ({
        id: inv.id,
        user_name: nameMap[inv.user_id] || inv.user_id.slice(0, 8),
        user_id: inv.user_id,
        plan_name: inv.mc_investment_plans?.name || "Unknown Plan",
        amount: Number(inv.amount),
        current_value: Number(inv.current_value),
        status: inv.status,
        start_date: inv.start_date,
      }));

      setInvestments(rows);
      setLoading(false);
    };

    fetchInvestments();
  }, []);

  const filtered = investments.filter((i) => !search || i.user_name.toLowerCase().includes(search.toLowerCase()) || i.plan_name.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return <TablePageSkeleton />;
  }

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
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-surface-500">No investments found</td></tr>
                ) : (
                  filtered.map((inv) => (
                    <tr key={inv.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                      <td className="px-6 py-4"><p className="font-medium text-surface-900 dark:text-white">{inv.user_name}</p></td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{inv.plan_name}</td>
                      <td className="px-6 py-4 font-medium text-surface-900 dark:text-white">{formatCurrency(inv.amount)}</td>
                      <td className="px-6 py-4 font-medium text-success-600">{formatCurrency(inv.current_value)}</td>
                      <td className="px-6 py-4 text-sm text-success-600">+{formatCurrency(inv.current_value - inv.amount)}</td>
                      <td className="px-6 py-4"><Badge variant={statusVariant[inv.status] || "default"}>{inv.status}</Badge></td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm"><DollarSign className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm"><TrendingUp className="h-4 w-4" /></Button>
                        </div>
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
