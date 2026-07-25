"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import { CheckCircle, XCircle, Eye, Send, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TablePageSkeleton } from "@/components/ui/PageSkeletons";

interface Withdrawal {
  id: string;
  user_name: string;
  user_id: string;
  amount: number;
  currency: string;
  network: string;
  destination_address: string;
  status: string;
  submitted_at: string;
}

const statusVariant: Record<string, "success" | "warning" | "destructive" | "default"> = { pending: "warning", approved: "default", processing: "default", sent: "success", completed: "success", rejected: "destructive" };

export default function AdminWithdrawalsPage() {
  const supabase = createClient();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchWithdrawals = async () => {
    const { data, error } = await supabase
      .from("mc_withdrawals")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error || !data) {
      setLoading(false);
      return;
    }

    const userIds = [...new Set(data.map((w) => w.user_id))];
    const { data: profiles } = await supabase
      .from("mc_profiles")
      .select("id, full_name")
      .in("id", userIds);

    const nameMap: Record<string, string> = {};
    if (profiles) profiles.forEach((p) => { nameMap[p.id] = p.full_name || p.id.slice(0, 8); });

    const rows: Withdrawal[] = data.map((w) => ({
      id: w.id,
      user_name: nameMap[w.user_id] || w.user_id.slice(0, 8),
      user_id: w.user_id,
      amount: Number(w.amount),
      currency: w.currency,
      network: w.network,
      destination_address: w.destination_address,
      status: w.status,
      submitted_at: w.submitted_at,
    }));

    setWithdrawals(rows);
    setLoading(false);
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleAction = async (withdrawalId: string, action: "approved" | "processing" | "sent" | "rejected") => {
    setProcessing(withdrawalId);
    const updateData: Record<string, any> = { status: action };
    if (action === "sent" || action === "rejected") {
      updateData.processed_at = new Date().toISOString();
    }
    await supabase.from("mc_withdrawals").update(updateData).eq("id", withdrawalId);
    setWithdrawals((prev) => prev.map((w) => w.id === withdrawalId ? { ...w, status: action } : w));
    setProcessing(null);
  };

  const filtered = withdrawals.filter((w) => statusFilter === "all" || w.status === statusFilter);

  if (loading) {
    return <TablePageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Withdrawal Management</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Process and manage withdrawal requests</p>
      </div>

      <div className="flex gap-2">
        {["pending", "approved", "processing", "sent", "rejected", "all"].map((s) => (
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
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Destination</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Network</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-surface-500">No withdrawals found</td></tr>
                ) : (
                  filtered.map((w) => (
                    <tr key={w.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                      <td className="px-6 py-4"><p className="font-medium text-surface-900 dark:text-white">{w.user_name}</p></td>
                      <td className="px-6 py-4 font-medium text-surface-900 dark:text-white">{formatCurrency(w.amount)} <span className="text-xs text-surface-500">{w.currency}</span></td>
                      <td className="px-6 py-4 font-mono text-sm text-surface-600 dark:text-surface-400">{w.destination_address.slice(0, 10)}...{w.destination_address.slice(-6)}</td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{w.network}</td>
                      <td className="px-6 py-4"><Badge variant={statusVariant[w.status] || "default"}>{w.status}</Badge></td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{new Date(w.submitted_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {w.status === "pending" && (
                            <>
                              <Button
                                variant="ghost" size="sm" className="text-success-600"
                                disabled={processing === w.id}
                                onClick={() => handleAction(w.id, "approved")}
                              >
                                {processing === w.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost" size="sm" className="text-danger-600"
                                disabled={processing === w.id}
                                onClick={() => handleAction(w.id, "rejected")}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {w.status === "approved" && (
                            <Button
                              variant="ghost" size="sm" className="text-brand-600"
                              disabled={processing === w.id}
                              onClick={() => handleAction(w.id, "processing")}
                            >
                              {processing === w.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                          )}
                          {w.status === "processing" && (
                            <Button
                              variant="ghost" size="sm" className="text-success-600"
                              disabled={processing === w.id}
                              onClick={() => handleAction(w.id, "sent")}
                            >
                              {processing === w.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
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
