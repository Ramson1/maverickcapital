"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import { CheckCircle, XCircle, Eye, Send, Loader2, Trash2, DollarSign, Clock, AlertTriangle } from "lucide-react";
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

const statusVariant: Record<string, "success" | "warning" | "destructive" | "default"> = {
  pending: "warning", approved: "default", processing: "default", sent: "success", completed: "success", rejected: "destructive"
};

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

    if (error || !data) { setLoading(false); return; }

    const userIds = [...new Set(data.map((w) => w.user_id))];
    const { data: profiles } = await supabase
      .from("mc_profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    const profileMap: Record<string, { name: string; email: string }> = {};
    if (profiles) profiles.forEach((p) => { profileMap[p.id] = { name: p.full_name || p.id.slice(0, 8), email: p.email || "" }; });

    const rows: Withdrawal[] = data.map((w) => ({
      id: w.id,
      user_name: profileMap[w.user_id]?.name || w.user_id.slice(0, 8),
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

  useEffect(() => { fetchWithdrawals(); }, []);

  const handleAction = async (withdrawalId: string, action: "approved" | "processing" | "sent" | "rejected") => {
    setProcessing(withdrawalId);
    const updateData: Record<string, any> = { status: action };
    if (action === "sent" || action === "rejected") {
      updateData.processed_at = new Date().toISOString();
    }

    // If rejected, refund the user's wallet balance
    if (action === "rejected") {
      const withdrawal = withdrawals.find((w) => w.id === withdrawalId);
      if (withdrawal) {
        const { data: profile } = await supabase
          .from("mc_profiles")
          .select("wallet_balance")
          .eq("id", withdrawal.user_id)
          .single();
        if (profile) {
          await supabase
            .from("mc_profiles")
            .update({ wallet_balance: Number(profile.wallet_balance || 0) + withdrawal.amount })
            .eq("id", withdrawal.user_id);
        }
      }
    }

    await supabase.from("mc_withdrawals").update(updateData).eq("id", withdrawalId);
    setWithdrawals((prev) => prev.map((w) => w.id === withdrawalId ? { ...w, status: action } : w));
    setProcessing(null);
  };

  const handleDelete = async (w: Withdrawal) => {
    if (!confirm(`Delete withdrawal of ${formatCurrency(w.amount)} from ${w.user_name}?`)) return;
    setProcessing(w.id);
    const { error } = await supabase.from("mc_withdrawals").delete().eq("id", w.id);
    if (error) {
      console.error("Delete error:", error);
      alert("Failed to delete: " + error.message);
    } else {
      setWithdrawals((prev) => prev.filter((x) => x.id !== w.id));
    }
    setProcessing(null);
  };

  const filtered = withdrawals.filter((w) => statusFilter === "all" || w.status === statusFilter);

  // Totals
  const totalAll = withdrawals.reduce((sum, w) => sum + w.amount, 0);
  const totalPending = withdrawals.filter((w) => w.status === "pending").reduce((sum, w) => sum + w.amount, 0);
  const totalSent = withdrawals.filter((w) => w.status === "sent" || w.status === "completed").reduce((sum, w) => sum + w.amount, 0);

  if (loading) { return <TablePageSkeleton />; }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Withdrawal Management</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Process and manage withdrawal requests</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
              <DollarSign className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <p className="text-xs text-surface-500 dark:text-surface-400">Total Withdrawals</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">{formatCurrency(totalAll)}</p>
              <p className="text-xs text-surface-400">{withdrawals.length} requests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-50 dark:bg-warning-500/10">
              <Clock className="h-5 w-5 text-warning-600 dark:text-warning-500" />
            </div>
            <div>
              <p className="text-xs text-surface-500 dark:text-surface-400">Pending</p>
              <p className="text-xl font-bold text-warning-600 dark:text-warning-400">{formatCurrency(totalPending)}</p>
              <p className="text-xs text-surface-400">{withdrawals.filter((w) => w.status === "pending").length} requests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50 dark:bg-success-500/10">
              <Send className="h-5 w-5 text-success-600 dark:text-success-500" />
            </div>
            <div>
              <p className="text-xs text-surface-500 dark:text-surface-400">Completed</p>
              <p className="text-xl font-bold text-success-600 dark:text-success-400">{formatCurrency(totalSent)}</p>
              <p className="text-xs text-surface-400">{withdrawals.filter((w) => w.status === "sent" || w.status === "completed").length} requests</p>
            </div>
          </CardContent>
        </Card>
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
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-surface-900 dark:text-white">{w.user_name}</p>
                          <p className="font-mono text-[10px] text-surface-400" title={w.user_id}>{w.user_id.slice(0, 12)}...</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-surface-900 dark:text-white">{formatCurrency(w.amount)} <span className="text-xs text-surface-500">{w.currency}</span></td>
                      <td className="px-6 py-4 font-mono text-sm text-surface-600 dark:text-surface-400">{w.destination_address.slice(0, 10)}...{w.destination_address.slice(-6)}</td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{w.network}</td>
                      <td className="px-6 py-4"><Badge variant={statusVariant[w.status] || "default"}>{w.status}</Badge></td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{new Date(w.submitted_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {w.status === "pending" && (
                            <>
                              <Button variant="ghost" size="sm" className="text-success-600" disabled={processing === w.id} onClick={() => handleAction(w.id, "approved")}>
                                {processing === w.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                              </Button>
                              <Button variant="ghost" size="sm" className="text-danger-600" disabled={processing === w.id} onClick={() => handleAction(w.id, "rejected")}>
                                {processing === w.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                              </Button>
                            </>
                          )}
                          {w.status === "approved" && (
                            <Button variant="ghost" size="sm" className="text-brand-600" disabled={processing === w.id} onClick={() => handleAction(w.id, "processing")}>
                              {processing === w.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                          )}
                          {w.status === "processing" && (
                            <Button variant="ghost" size="sm" className="text-success-600" disabled={processing === w.id} onClick={() => handleAction(w.id, "sent")}>
                              {processing === w.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-danger-600 hover:bg-danger-50" disabled={processing === w.id} onClick={() => handleDelete(w)} title="Delete">
                            {processing === w.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
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
