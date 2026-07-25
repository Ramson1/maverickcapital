"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, cn } from "@/lib/utils";
import { Plus, Search, Download, Loader2, Lock, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useHardCap } from "@/hooks/useHardCap";

interface Deposit {
  id: string;
  amount: number;
  currency: string;
  network: string;
  tx_hash: string | null;
  status: string;
  proof_url: string | null;
  submitted_at: string;
}

const statusVariant: Record<string, "success" | "warning" | "destructive" | "default"> = {
  approved: "success",
  confirming: "default",
  pending: "warning",
  rejected: "destructive",
};

export default function DepositsPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const { isFull, hardCap, totalRaised } = useHardCap();

  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDeposits = async () => {
      const { data } = await supabase
        .from("mc_deposits")
        .select("*")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false });

      if (data) {
        setDeposits(
          data.map((d) => ({ ...d, amount: Number(d.amount) }))
        );
      }
      setLoading(false);
    };

    fetchDeposits();
  }, [user, supabase]);

  const filtered = deposits.filter((d) => {
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    if (search && !d.tx_hash?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Deposits</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">View and manage your deposit history</p>
        </div>
        <Button disabled={isFull}>
          {isFull ? (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Deposits Closed
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              New Deposit
            </>
          )}
        </Button>
      </div>

      {isFull && (
        <div className="flex items-center gap-3 rounded-xl border border-danger-200 bg-danger-50 p-4 dark:border-danger-800 dark:bg-danger-500/10">
          <AlertTriangle className="h-5 w-5 shrink-0 text-danger-600 dark:text-danger-400" />
          <div>
            <p className="text-sm font-semibold text-danger-800 dark:text-danger-300">Deposits Currently Disabled</p>
            <p className="mt-0.5 text-xs text-danger-600 dark:text-danger-400">
              The platform hard cap of {formatCurrency(hardCap)} has been reached. New deposits are no longer being accepted.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <Input placeholder="Search by tx hash..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2">
            {["all", "pending", "confirming", "approved", "rejected"].map((s) => (
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
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-surface-400">No deposits found</td>
                  </tr>
                ) : (
                  filtered.map((dep) => (
                    <tr key={dep.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                      <td className="px-6 py-4 font-medium text-surface-900 dark:text-white">{formatCurrency(dep.amount)}</td>
                      <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{dep.currency}</td>
                      <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{dep.network}</td>
                      <td className="px-6 py-4 font-mono text-sm text-surface-600 dark:text-surface-400">{dep.tx_hash || "-"}</td>
                      <td className="px-6 py-4">
                        <Badge variant={statusVariant[dep.status] || "default"}>{dep.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{new Date(dep.submitted_at).toLocaleDateString()}</td>
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
