"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, cn } from "@/lib/utils";
import { Search, Download, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { TablePageSkeleton } from "@/components/ui/PageSkeletons";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  reference_id: string | null;
  status: string;
  description: string | null;
  created_at: string;
}

const typeColors: Record<string, string> = {
  deposit: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400",
  withdrawal: "bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-400",
  investment: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400",
  profit: "bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-400",
  bonus: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400",
  subscription: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400",
};

const statusVariant: Record<string, "success" | "warning" | "destructive" | "default"> = {
  completed: "success", active: "default", pending: "warning", failed: "destructive",
};

export default function TransactionsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      const { data } = await supabase
        .from("mc_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setTransactions(
          data.map((tx) => ({ ...tx, amount: Number(tx.amount) }))
        );
      }
      setLoading(false);
    };

    fetchTransactions();
  }, [user, supabase]);

  const filtered = transactions.filter((tx) => {
    if (typeFilter !== "all" && tx.type !== typeFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (
        !tx.description?.toLowerCase().includes(s) &&
        !tx.amount.toString().includes(s) &&
        !tx.reference_id?.toLowerCase().includes(s)
      ) return false;
    }
    return true;
  });

  if (loading) {
    return <TablePageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Transactions</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Complete transaction history</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <Input placeholder="Search by description or amount..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2">
            {["all", "deposit", "withdrawal", "investment", "profit"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  typeFilter === t ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" : "text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
                )}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Currency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-surface-400">No transactions found</td>
                  </tr>
                ) : (
                  filtered.map((tx) => (
                    <tr key={tx.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                      <td className="px-6 py-4">
                        <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", typeColors[tx.type] || typeColors.deposit)}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{tx.description || "-"}</td>
                      <td className="px-6 py-4 font-medium text-surface-900 dark:text-white">
                        {tx.type === "withdrawal" || tx.type === "investment" ? "-" : "+"}{formatCurrency(tx.amount)}
                      </td>
                      <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{tx.currency}</td>
                      <td className="px-6 py-4"><Badge variant={statusVariant[tx.status] || "default"}>{tx.status}</Badge></td>
                      <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{new Date(tx.created_at).toLocaleDateString()}</td>
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
