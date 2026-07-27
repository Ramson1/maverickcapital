"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import { CheckCircle, XCircle, Eye, Loader2, Copy, Check, X, FileImage, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TablePageSkeleton } from "@/components/ui/PageSkeletons";

const supabase = createClient();

interface Deposit {
  id: string;
  user_name: string;
  user_email: string;
  user_id: string;
  amount: number;
  currency: string;
  network: string;
  plan_name: string | null;
  tx_hash: string | null;
  status: string;
  proof_url: string | null;
  proof_data: string | null;
  submitted_at: string;
}

const statusVariant: Record<string, "success" | "warning" | "destructive" | "default"> = {
  pending: "warning",
  confirming: "default",
  approved: "success",
  rejected: "destructive",
};

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [viewingProof, setViewingProof] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchDeposits = async () => {
    const { data, error } = await supabase
      .from("mc_deposits")
      .select("id, user_id, amount, currency, network, plan_name, tx_hash, status, proof_url, proof_data, submitted_at")
      .order("submitted_at", { ascending: false });

    if (error || !data) {
      console.error("Fetch deposits error:", error);
      setLoading(false);
      return;
    }

    // Fetch user profiles
    const userIds = [...new Set(data.map((d) => d.user_id))];
    const { data: profiles } = await supabase
      .from("mc_profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    const profileMap = new Map(
      (profiles || []).map((p) => [p.id, { name: p.full_name, email: p.email }])
    );

    const rows: Deposit[] = data.map((d) => {
      const profile = profileMap.get(d.user_id);
      return {
        id: d.id,
        user_name: profile?.name || d.user_id.slice(0, 8),
        user_email: profile?.email || d.user_id.slice(0, 8),
        user_id: d.user_id,
        amount: Number(d.amount),
        currency: d.currency,
        network: d.network,
        plan_name: d.plan_name,
        tx_hash: d.tx_hash,
        status: d.status,
        proof_url: d.proof_url,
        proof_data: d.proof_data,
        submitted_at: d.submitted_at,
      };
    });

    setDeposits(rows);
    setLoading(false);
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleAction = async (deposit: Deposit, action: "approved" | "rejected") => {
    setProcessing(deposit.id);

    const { error } = await supabase
      .from("mc_deposits")
      .update({ status: action })
      .eq("id", deposit.id);

    if (error) {
      console.error("Action error:", error);
      alert("Failed to update deposit: " + error.message);
      setProcessing(null);
      return;
    }

    // If approved, update user's wallet balance
    if (action === "approved") {
      const { data: profile, error: profileError } = await supabase
        .from("mc_profiles")
        .select("wallet_balance, total_investment")
        .eq("id", deposit.user_id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
      }

      if (profile) {
        const newBalance = Number(profile.wallet_balance || 0) + deposit.amount;
        const newInvestment = Number(profile.total_investment || 0) + deposit.amount;

        const { error: updateError } = await supabase
          .from("mc_profiles")
          .update({
            wallet_balance: newBalance,
            total_investment: newInvestment,
            updated_at: new Date().toISOString(),
          })
          .eq("id", deposit.user_id);

        if (updateError) {
          console.error("Profile update error:", updateError);
        }
      }
    }

    setDeposits((prev) => prev.map((d) => d.id === deposit.id ? { ...d, status: action } : d));
    setProcessing(null);
  };

  const filtered = deposits.filter((d) => {
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    const matchesSearch =
      !search ||
      d.user_name.toLowerCase().includes(search.toLowerCase()) ||
      d.user_email.toLowerCase().includes(search.toLowerCase()) ||
      (d.tx_hash && d.tx_hash.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const counts = {
    pending: deposits.filter((d) => d.status === "pending").length,
    approved: deposits.filter((d) => d.status === "approved").length,
    rejected: deposits.filter((d) => d.status === "rejected").length,
  };

  if (loading) {
    return <TablePageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Deposit Management</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Review and approve user deposits</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(["pending", "approved", "rejected", "all"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === s
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                  : "text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
              )}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {s !== "all" && counts[s] > 0 && (
                <span className="ml-1.5 rounded-full bg-surface-200 px-1.5 py-0.5 text-[10px] dark:bg-surface-700">
                  {counts[s]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search user or tx hash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-surface-200 bg-white py-1.5 pl-9 pr-3 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Tx Hash</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Proof</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-8 text-center text-sm text-surface-500">No deposits found</td></tr>
                ) : (
                  filtered.map((dep) => (
                    <tr key={dep.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-surface-900 dark:text-white">{dep.user_name}</p>
                          <p className="text-xs text-surface-500">{dep.user_email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-surface-900 dark:text-white">
                        {formatCurrency(dep.amount)} <span className="text-xs text-surface-500">{dep.currency}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">
                        {dep.plan_name ? (
                          <Badge variant="default">{dep.plan_name}</Badge>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {dep.tx_hash ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-sm text-surface-600 dark:text-surface-400">
                              {dep.tx_hash.slice(0, 10)}...{dep.tx_hash.slice(-6)}
                            </span>
                            <button
                              onClick={() => {
                                const hash = dep.tx_hash ?? "";
                                navigator.clipboard.writeText(hash);
                                setCopiedHash(dep.id);
                                setTimeout(() => setCopiedHash(null), 2000);
                              }}
                              className="rounded p-1 transition-colors hover:bg-surface-100 dark:hover:bg-surface-700"
                              title="Copy full transaction hash"
                            >
                              {copiedHash === dep.id ? (
                                <Check className="h-3.5 w-3.5 text-success-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5 text-surface-400" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-surface-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {(dep.proof_data || dep.proof_url) ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={dep.proof_data || dep.proof_url || ""}
                              alt="Proof thumbnail"
                              className="h-10 w-10 cursor-pointer rounded-lg border border-surface-200 object-cover transition-transform hover:scale-150 dark:border-surface-700"
                              onClick={() => setViewingProof(dep.id)}
                            />
                            <button
                              onClick={() => setViewingProof(dep.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-surface-400">No proof</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusVariant[dep.status] || "default"}>{dep.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">
                        {new Date(dep.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {(dep.status === "pending" || dep.status === "confirming") && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-success-600 hover:bg-success-50"
                                disabled={processing === dep.id}
                                onClick={() => handleAction(dep, "approved")}
                              >
                                {processing === dep.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-danger-600 hover:bg-danger-50"
                                disabled={processing === dep.id}
                                onClick={() => handleAction(dep, "rejected")}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
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

      {/* Proof of Payment Modal */}
      {viewingProof && (() => {
        const dep = deposits.find((d) => d.id === viewingProof);
        if (!dep || !(dep.proof_data || dep.proof_url)) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white shadow-2xl dark:bg-surface-900">
              {/* Modal header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-surface-200 bg-white px-6 py-4 dark:border-surface-700 dark:bg-surface-900">
                <div>
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Proof of Payment</h3>
                  <p className="text-sm text-surface-500">
                    {dep.user_name} &middot; {formatCurrency(dep.amount)} {dep.currency}
                  </p>
                </div>
                <button
                  onClick={() => setViewingProof(null)}
                  className="rounded-lg p-2 transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
                >
                  <X className="h-5 w-5 text-surface-500" />
                </button>
              </div>

              {/* Proof image */}
              <div className="p-6">
                <img
                  src={dep.proof_data || dep.proof_url || ""}
                  alt="Proof of payment"
                  className="w-full rounded-lg border border-surface-200 dark:border-surface-700"
                />

                {/* Tx hash below image */}
                {dep.tx_hash && (
                  <div className="mt-4 rounded-lg bg-surface-50 p-3 dark:bg-surface-800">
                    <p className="mb-1 text-xs font-medium text-surface-500">Transaction Hash</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 break-all text-sm text-surface-900 dark:text-white">{dep.tx_hash}</code>
                      <button
                        onClick={() => {
                          const hash = dep.tx_hash ?? "";
                          navigator.clipboard.writeText(hash);
                          setCopiedHash(dep.id);
                          setTimeout(() => setCopiedHash(null), 2000);
                        }}
                        className="shrink-0 rounded-md p-1.5 transition-colors hover:bg-surface-200 dark:hover:bg-surface-700"
                        title="Copy transaction hash"
                      >
                        {copiedHash === dep.id ? (
                          <Check className="h-4 w-4 text-success-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-surface-400" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
