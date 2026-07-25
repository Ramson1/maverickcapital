"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import { CheckCircle, XCircle, Eye, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TablePageSkeleton } from "@/components/ui/PageSkeletons";

interface Deposit {
  id: string;
  user_name: string;
  user_id: string;
  amount: number;
  currency: string;
  network: string;
  tx_hash: string | null;
  status: string;
  submitted_at: string;
}

const statusVariant: Record<string, "success" | "warning" | "destructive" | "default"> = { pending: "warning", confirming: "default", approved: "success", rejected: "destructive" };

export default function AdminDepositsPage() {
  const supabase = createClient();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchDeposits = async () => {
    const { data, error } = await supabase
      .from("mc_deposits")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error || !data) {
      setLoading(false);
      return;
    }

    // Fetch user profiles
    const userIds = [...new Set(data.map((d) => d.user_id))];
    const { data: profiles } = await supabase
      .from("mc_profiles")
      .select("id, full_name")
      .in("id", userIds);

    const nameMap: Record<string, string> = {};
    if (profiles) profiles.forEach((p) => { nameMap[p.id] = p.full_name || p.id.slice(0, 8); });

    const rows: Deposit[] = data.map((d) => ({
      id: d.id,
      user_name: nameMap[d.user_id] || d.user_id.slice(0, 8),
      user_id: d.user_id,
      amount: Number(d.amount),
      currency: d.currency,
      network: d.network,
      tx_hash: d.tx_hash,
      status: d.status,
      submitted_at: d.submitted_at,
    }));

    setDeposits(rows);
    setLoading(false);
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleAction = async (depositId: string, action: "approved" | "rejected") => {
    setProcessing(depositId);
    await supabase
      .from("mc_deposits")
      .update({ status: action, reviewed_at: new Date().toISOString() })
      .eq("id", depositId);

    setDeposits((prev) => prev.map((d) => d.id === depositId ? { ...d, status: action } : d));
    setProcessing(null);
  };

  const filtered = deposits.filter((d) => statusFilter === "all" || d.status === statusFilter);

  if (loading) {
    return <TablePageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Deposit Management</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Review and approve user deposits</p>
      </div>

      <div className="flex gap-2">
        {["pending", "confirming", "approved", "rejected", "all"].map((s) => (
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
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-surface-500">No deposits found</td></tr>
                ) : (
                  filtered.map((dep) => (
                    <tr key={dep.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                      <td className="px-6 py-4"><p className="font-medium text-surface-900 dark:text-white">{dep.user_name}</p></td>
                      <td className="px-6 py-4 font-medium text-surface-900 dark:text-white">{formatCurrency(dep.amount)} <span className="text-xs text-surface-500">{dep.currency}</span></td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{dep.network}</td>
                      <td className="px-6 py-4 font-mono text-sm text-surface-600 dark:text-surface-400">{dep.tx_hash || "-"}</td>
                      <td className="px-6 py-4"><Badge variant={statusVariant[dep.status] || "default"}>{dep.status}</Badge></td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{new Date(dep.submitted_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {(dep.status === "pending" || dep.status === "confirming") && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-success-600 hover:bg-success-50"
                                disabled={processing === dep.id}
                                onClick={() => handleAction(dep.id, "approved")}
                              >
                                {processing === dep.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-danger-600 hover:bg-danger-50"
                                disabled={processing === dep.id}
                                onClick={() => handleAction(dep.id, "rejected")}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
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
