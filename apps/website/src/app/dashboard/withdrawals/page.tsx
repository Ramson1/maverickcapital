"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import { Plus, Download, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";

interface Withdrawal {
  id: string;
  amount: number;
  currency: string;
  network: string;
  destination_address: string;
  tx_hash: string | null;
  status: string;
  submitted_at: string;
}

const statusVariant: Record<string, "success" | "warning" | "destructive" | "default"> = {
  completed: "success", sent: "success", approved: "default", pending: "warning", processing: "default", rejected: "destructive",
};

export default function WithdrawalsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchWithdrawals = async () => {
      const { data } = await supabase
        .from("mc_withdrawals")
        .select("*")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false });

      if (data) {
        setWithdrawals(
          data.map((w) => ({ ...w, amount: Number(w.amount) }))
        );
      }
      setLoading(false);
    };

    fetchWithdrawals();
  }, [user, supabase]);

  const filtered = withdrawals.filter((w) => statusFilter === "all" || w.status === statusFilter);

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
            {["all", "pending", "processing", "sent", "completed", "rejected"].map((s) => (
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
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Destination</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Network</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Tx Hash</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-surface-400">No withdrawals found</td>
                  </tr>
                ) : (
                  filtered.map((w) => (
                    <tr key={w.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                      <td className="px-6 py-4 font-medium text-surface-900 dark:text-white">{formatCurrency(w.amount)}</td>
                      <td className="px-6 py-4 font-mono text-sm text-surface-600 dark:text-surface-400">
                        {w.destination_address.length > 20
                          ? `${w.destination_address.slice(0, 12)}...${w.destination_address.slice(-8)}`
                          : w.destination_address}
                      </td>
                      <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{w.network}</td>
                      <td className="px-6 py-4 font-mono text-sm text-surface-600 dark:text-surface-400">{w.tx_hash || "-"}</td>
                      <td className="px-6 py-4"><Badge variant={statusVariant[w.status] || "default"}>{w.status}</Badge></td>
                      <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{new Date(w.submitted_at).toLocaleDateString()}</td>
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
