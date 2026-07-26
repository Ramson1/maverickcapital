"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Search, Download, AlertTriangle, Plus, X, AlertCircle, Loader2,
  Copy, Check, Wallet, ArrowRight, Upload, FileImage, Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useHardCap } from "@/hooks/useHardCap";
import { TablePageSkeleton } from "@/components/ui/PageSkeletons";
import { useAccount, useSendTransaction, useBalance } from "wagmi";
import { parseEther } from "viem";
import { WalletButton } from "@/components/web3/WalletButton";

// ─── Admin wallet addresses (from env) ───────────────────────────────
const ADMIN_WALLETS: Record<string, { address: string; currency: string; networks: string[] }>[] = [
  { USDT: { address: process.env.NEXT_PUBLIC_ETHEREUM_WALLET || "", currency: "USDT", networks: ["ERC20 (Ethereum)"] } },
  { USDT_TRC20: { address: process.env.NEXT_PUBLIC_TRON_WALLET || "", currency: "USDT", networks: ["TRC20 (Tron)"] } },
  { USDT_POLYGON: { address: process.env.NEXT_PUBLIC_POLYGON_WALLET || "", currency: "USDT", networks: ["Polygon"] } },
  { USDT_BSC: { address: process.env.NEXT_PUBLIC_ETHEREUM_WALLET || "", currency: "USDT", networks: ["BSC (BEP20)"] } },
  { BTC: { address: process.env.NEXT_PUBLIC_BITCOIN_WALLET || "", currency: "BTC", networks: ["Bitcoin"] } },
  { ETH: { address: process.env.NEXT_PUBLIC_ETHEREUM_WALLET || "", currency: "ETH", networks: ["Ethereum"] } },
  { SOL: { address: process.env.NEXT_PUBLIC_SOLANA_WALLET || "", currency: "SOL", networks: ["Solana"] } },
  { XRP: { address: process.env.NEXT_PUBLIC_XRP_WALLET || "", currency: "XRP", networks: ["XRP Ledger"] } },
  { DOGE: { address: process.env.NEXT_PUBLIC_DOGECOIN_WALLET || "", currency: "DOGE", networks: ["Dogecoin"] } },
  { LTC: { address: process.env.NEXT_PUBLIC_LITECOIN_WALLET || "", currency: "LTC", networks: ["Litecoin"] } },
  { BCH: { address: process.env.NEXT_PUBLIC_BITCOIN_CASH_WALLET || "", currency: "BCH", networks: ["Bitcoin Cash"] } },
  { AVAX: { address: process.env.NEXT_PUBLIC_AVALANCHE_WALLET || "", currency: "AVAX", networks: ["Avalanche (C-Chain)"] } },
  { FTM: { address: process.env.NEXT_PUBLIC_FANTOM_WALLET || "", currency: "FTM", networks: ["Fantom"] } },
  { ARB: { address: process.env.NEXT_PUBLIC_ARBITRUM_WALLET || "", currency: "ARB", networks: ["Arbitrum"] } },
  { OP: { address: process.env.NEXT_PUBLIC_OPTIMISM_WALLET || "", currency: "OP", networks: ["Optimism"] } },
  { BASE: { address: process.env.NEXT_PUBLIC_BASE_WALLET || "", currency: "BASE", networks: ["Base"] } },
];

// Flatten into a selectable list
const DEPOSIT_OPTIONS = ADMIN_WALLETS.map((entry) => {
  const key = Object.keys(entry)[0];
  const val = entry[key];
  return { id: key, ...val };
});

// USDT-only options for manual deposit
const USDT_DEPOSIT_OPTIONS = DEPOSIT_OPTIONS.filter((opt) => opt.currency === "USDT");

// EVM-compatible chains for Web3 deposit
const EVM_CURRENCIES = ["ETH", "USDT", "AVAX", "FTM", "ARB", "OP", "BASE", "MATIC"];

// ─── Types ───────────────────────────────────────────────────────────
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

const depositStatusVariant: Record<string, "success" | "warning" | "destructive" | "default"> = {
  approved: "success",
  confirming: "default",
  pending: "warning",
  rejected: "destructive",
};

const withdrawalStatusVariant: Record<string, "success" | "warning" | "destructive" | "default"> = {
  completed: "success", sent: "success", approved: "default", pending: "warning", processing: "default", rejected: "destructive",
};

// ─── Main Page ───────────────────────────────────────────────────────
export default function DepositsPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const { isFull, hardCap } = useHardCap();

  const [activeTab, setActiveTab] = useState<"deposits" | "withdrawals">("deposits");
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Deposit form state
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [depositMethod, setDepositMethod] = useState<"manual" | "web3" | null>(null);

  // Withdrawal form state
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: "",
    currency: "USDT",
    network: "TRC20",
    destination_address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data: depositsData } = await supabase
        .from("mc_deposits")
        .select("*")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false });

      if (depositsData) {
        setDeposits(depositsData.map((d) => ({ ...d, amount: Number(d.amount) })));
      }

      const { data: withdrawalsData } = await supabase
        .from("mc_withdrawals")
        .select("*")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false });

      if (withdrawalsData) {
        setWithdrawals(withdrawalsData.map((w) => ({ ...w, amount: Number(w.amount) })));
      }

      setLoading(false);
    };

    fetchData();
  }, [user, supabase]);

  // ─── Withdrawal submit ─────────────────────────────────────────────
  const handleSubmitWithdrawal = async () => {
    if (!user) return;
    const amount = parseFloat(withdrawalForm.amount);
    if (!amount || amount <= 0) { setWithdrawalError("Please enter a valid amount"); return; }
    if (!withdrawalForm.destination_address.trim()) { setWithdrawalError("Please enter a wallet address"); return; }
    if (!withdrawalForm.currency.trim()) { setWithdrawalError("Please enter a currency"); return; }
    if (!withdrawalForm.network.trim()) { setWithdrawalError("Please enter a network"); return; }

    setSubmitting(true);
    setWithdrawalError(null);

    const { data, error: insertError } = await supabase
      .from("mc_withdrawals")
      .insert({
        user_id: user.id,
        amount,
        currency: withdrawalForm.currency,
        network: withdrawalForm.network,
        destination_address: withdrawalForm.destination_address.trim(),
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      setWithdrawalError(insertError.message || "Failed to submit withdrawal request");
      setSubmitting(false);
      return;
    }

    if (data) {
      setWithdrawals((prev) => [{ ...data, amount: Number(data.amount) }, ...prev]);
      setWithdrawalForm({ amount: "", currency: "USDT", network: "TRC20", destination_address: "" });
      setShowWithdrawalForm(false);
    }
    setSubmitting(false);
  };

  const filteredDeposits = deposits.filter((d) => {
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    if (search && !d.tx_hash?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (statusFilter !== "all" && w.status !== statusFilter) return false;
    return true;
  });

  if (loading) {
    return <TablePageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Deposits & Withdrawals</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Manage your deposits and withdrawal requests</p>
      </div>

      {/* Hard Cap Warning */}
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

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-surface-100 p-1 dark:bg-surface-800">
        <button
          onClick={() => { setActiveTab("deposits"); setStatusFilter("all"); setSearch(""); }}
          className={cn(
            "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "deposits"
              ? "bg-white text-surface-900 shadow-sm dark:bg-surface-700 dark:text-white"
              : "text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
          )}
        >
          Deposits
        </button>
        <button
          onClick={() => { setActiveTab("withdrawals"); setStatusFilter("all"); }}
          className={cn(
            "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "withdrawals"
              ? "bg-white text-surface-900 shadow-sm dark:bg-surface-700 dark:text-white"
              : "text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
          )}
        >
          Withdrawals
        </button>
      </div>

      {/* ═══════════════════ DEPOSITS TAB ═══════════════════ */}
      {activeTab === "deposits" && (
        <>
          {/* New Deposit Button */}
          {!isFull && (
            <div className="flex justify-end">
              <Button onClick={() => setShowDepositForm(!showDepositForm)}>
                <Plus className="mr-2 h-4 w-4" />
                New Deposit
              </Button>
            </div>
          )}

          {/* Deposit Form */}
          {showDepositForm && !isFull && (
            <DepositForm
              supabase={supabase}
              userId={user?.id || ""}
              onDepositSubmitted={() => {
                setShowDepositForm(false);
                // Refresh deposits
                supabase
                  .from("mc_deposits")
                  .select("*")
                  .eq("user_id", user?.id)
                  .order("submitted_at", { ascending: false })
                  .then(({ data }) => {
                    if (data) setDeposits(data.map((d) => ({ ...d, amount: Number(d.amount) })));
                  });
              }}
              onClose={() => { setShowDepositForm(false); setDepositMethod(null); }}
            />
          )}

          {/* Filters */}
          <Card>
            <CardContent className="flex flex-wrap items-center gap-4 p-4">
              <div className="relative flex-1 min-w-[200px]">
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
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Proof</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                    {filteredDeposits.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-surface-400">No deposits found</td>
                      </tr>
                    ) : (
                      filteredDeposits.map((dep) => (
                        <tr key={dep.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                          <td className="px-6 py-4 font-medium text-surface-900 dark:text-white">{formatCurrency(dep.amount)}</td>
                          <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{dep.currency}</td>
                          <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{dep.network}</td>
                          <td className="px-6 py-4 font-mono text-sm text-surface-600 dark:text-surface-400">{dep.tx_hash || "-"}</td>
                          <td className="px-6 py-4">
                            {dep.proof_url ? (
                              <a href={dep.proof_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
                                <FileImage className="h-3.5 w-3.5" />
                                View
                              </a>
                            ) : (
                              <span className="text-xs text-surface-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={depositStatusVariant[dep.status] || "default"}>{dep.status}</Badge>
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
        </>
      )}

      {/* ═══════════════════ WITHDRAWALS TAB ═══════════════════ */}
      {activeTab === "withdrawals" && (
        <>
          <div className="flex justify-end">
            <Button onClick={() => setShowWithdrawalForm(!showWithdrawalForm)}>
              <Plus className="mr-2 h-4 w-4" />
              New Withdrawal
            </Button>
          </div>

          {showWithdrawalForm && (
            <Card>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-surface-900 dark:text-white">Request Withdrawal</h3>
                  <button onClick={() => { setShowWithdrawalForm(false); setWithdrawalError(null); }}>
                    <X className="h-4 w-4 text-surface-500" />
                  </button>
                </div>
                {withdrawalError && (
                  <div className="flex items-center gap-2 rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700 dark:border-danger-800 dark:bg-danger-500/10 dark:text-danger-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {withdrawalError}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Amount (USD)</label>
                    <Input type="number" placeholder="0.00" value={withdrawalForm.amount} onChange={(e) => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })} min="0" step="0.01" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Wallet Address</label>
                    <Input placeholder="Enter your wallet address" value={withdrawalForm.destination_address} onChange={(e) => setWithdrawalForm({ ...withdrawalForm, destination_address: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Currency</label>
                    <Input placeholder="e.g. USDT, BTC" value={withdrawalForm.currency} onChange={(e) => setWithdrawalForm({ ...withdrawalForm, currency: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Network</label>
                    <Input placeholder="e.g. TRC20, ERC20" value={withdrawalForm.network} onChange={(e) => setWithdrawalForm({ ...withdrawalForm, network: e.target.value })} />
                  </div>
                </div>
                <p className="text-xs text-surface-500 dark:text-surface-400">
                  Your withdrawal request will be reviewed and processed by the admin team.
                </p>
                <div className="flex gap-3">
                  <Button onClick={handleSubmitWithdrawal} disabled={submitting || !withdrawalForm.amount || !withdrawalForm.destination_address}>
                    {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : "Submit Request"}
                  </Button>
                  <Button variant="outline" onClick={() => { setShowWithdrawalForm(false); setWithdrawalError(null); }}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

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
                    {filteredWithdrawals.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-surface-400">No withdrawals found</td>
                      </tr>
                    ) : (
                      filteredWithdrawals.map((w) => (
                        <tr key={w.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                          <td className="px-6 py-4 font-medium text-surface-900 dark:text-white">{formatCurrency(w.amount)}</td>
                          <td className="px-6 py-4 font-mono text-sm text-surface-600 dark:text-surface-400">
                            {w.destination_address.length > 20
                              ? `${w.destination_address.slice(0, 12)}...${w.destination_address.slice(-8)}`
                              : w.destination_address}
                          </td>
                          <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{w.network}</td>
                          <td className="px-6 py-4 font-mono text-sm text-surface-600 dark:text-surface-400">{w.tx_hash || "-"}</td>
                          <td className="px-6 py-4"><Badge variant={withdrawalStatusVariant[w.status] || "default"}>{w.status}</Badge></td>
                          <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{new Date(w.submitted_at).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Deposit Form Component (Manual + Web3)
// ═══════════════════════════════════════════════════════════════════════
function DepositForm({
  supabase,
  userId,
  onDepositSubmitted,
  onClose,
}: {
  supabase: ReturnType<typeof createClient>;
  userId: string;
  onDepositSubmitted: () => void;
  onClose: () => void;
}) {
  const [method, setMethod] = useState<"manual" | "web3" | null>(null);

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-surface-900 dark:text-white">New Deposit</h3>
          <button onClick={onClose}><X className="h-4 w-4 text-surface-500" /></button>
        </div>

        {!method ? (
          /* ── Method Selection ── */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              onClick={() => setMethod("manual")}
              className="flex flex-col items-center gap-3 rounded-xl border border-surface-200 p-6 transition-all hover:border-brand-300 hover:bg-brand-50 dark:border-surface-700 dark:hover:border-brand-600 dark:hover:bg-brand-500/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
                <Upload className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-surface-900 dark:text-white">Manual Deposit</p>
                <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                  Send funds to our wallet address and submit the transaction receipt for confirmation
                </p>
              </div>
            </button>
            <button
              onClick={() => setMethod("web3")}
              className="flex flex-col items-center gap-3 rounded-xl border border-surface-200 p-6 transition-all hover:border-brand-300 hover:bg-brand-50 dark:border-surface-700 dark:hover:border-brand-600 dark:hover:bg-brand-500/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-50 dark:bg-success-500/10">
                <Wallet className="h-6 w-6 text-success-600 dark:text-success-500" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-surface-900 dark:text-white">Web3 Deposit</p>
                <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                  Connect your wallet and send funds directly on-chain
                </p>
              </div>
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setMethod(null)}
              className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              &larr; Back to method selection
            </button>
            {method === "manual" ? (
              <ManualDepositForm supabase={supabase} userId={userId} onDone={onDepositSubmitted} />
            ) : (
              <Web3DepositForm supabase={supabase} userId={userId} onDone={onDepositSubmitted} />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Manual Deposit Form
// ═══════════════════════════════════════════════════════════════════════
function ManualDepositForm({
  supabase,
  userId,
  onDone,
}: {
  supabase: ReturnType<typeof createClient>;
  userId: string;
  onDone: () => void;
}) {
  const [selectedOption, setSelectedOption] = useState(USDT_DEPOSIT_OPTIONS[0]);
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copyAddress = () => {
    navigator.clipboard.writeText(selectedOption.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProofSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a PNG, JPG, WEBP, or PDF file");
      return;
    }
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be smaller than 5MB");
      return;
    }
    setError(null);
    setProofFile(file);
    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setProofPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setProofPreview(null);
    }
  };

  const handleRemoveProof = () => {
    setProofFile(null);
    setProofPreview(null);
  };

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) { setError("Please enter a valid amount"); return; }
    if (!txHash.trim()) { setError("Please enter the transaction hash"); return; }
    if (!proofFile) { setError("Please upload proof of payment"); return; }

    setSubmitting(true);
    setError(null);

    // Upload proof of payment to Supabase Storage
    const fileExt = proofFile.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("deposit-proofs")
      .upload(fileName, proofFile);

    if (uploadError) {
      console.error("Proof upload error:", uploadError);
      setError("Failed to upload proof. Please try again.");
      setSubmitting(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("deposit-proofs")
      .getPublicUrl(fileName);

    const proofUrl = urlData?.publicUrl || "";

    const { error: insertError } = await supabase
      .from("mc_deposits")
      .insert({
        user_id: userId,
        amount: parsedAmount,
        currency: selectedOption.currency,
        network: selectedOption.networks[0],
        tx_hash: txHash.trim(),
        proof_url: proofUrl,
        status: "pending",
      });

    if (insertError) {
      setError(insertError.message || "Failed to submit deposit");
      setSubmitting(false);
      return;
    }

    onDone();
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700 dark:border-danger-800 dark:bg-danger-500/10 dark:text-danger-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Step 1: Select currency */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-surface-700 dark:text-surface-300">1. Select Network</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {USDT_DEPOSIT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedOption(opt)}
              className={cn(
                "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                selectedOption.id === opt.id
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                  : "border-surface-200 text-surface-600 hover:border-brand-300 dark:border-surface-700 dark:text-surface-400 dark:hover:border-brand-600"
              )}
            >
              {opt.currency}
              <span className="mt-0.5 block text-[10px] opacity-70">{opt.networks[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Send to this address */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-surface-700 dark:text-surface-300">2. Send USDT to this address</label>
        <div className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 p-3 dark:border-brand-800 dark:bg-brand-500/10">
          <p className="flex-1 break-all font-mono text-sm text-surface-900 dark:text-white">
            {selectedOption.address}
          </p>
          <button
            onClick={copyAddress}
            className="shrink-0 rounded-md p-2 transition-colors hover:bg-brand-100 dark:hover:bg-brand-500/20"
          >
            {copied ? <Check className="h-4 w-4 text-success-600" /> : <Copy className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
          </button>
        </div>
        <p className="text-xs text-surface-500 dark:text-surface-400">
          Only send <strong>USDT</strong> on the <strong>{selectedOption.networks[0]}</strong> network to this address.
        </p>
      </div>

      {/* Step 3: Enter details */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-surface-700 dark:text-surface-300">3. Enter deposit details</label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs text-surface-500">Amount (USD)</label>
            <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" step="0.01" />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-surface-500">Transaction Hash</label>
            <Input placeholder="Enter tx hash from your transaction" value={txHash} onChange={(e) => setTxHash(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Step 4: Upload proof of payment */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-surface-700 dark:text-surface-300">4. Upload Proof of Payment</label>
        {!proofFile ? (
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-surface-300 p-6 transition-colors hover:border-brand-400 hover:bg-brand-50/50 dark:border-surface-600 dark:hover:border-brand-500 dark:hover:bg-brand-500/5">
            <FileImage className="h-8 w-8 text-surface-400 dark:text-surface-500" />
            <p className="text-sm font-medium text-surface-600 dark:text-surface-400">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-surface-400 dark:text-surface-500">
              PNG, JPG, WEBP, or PDF (max 5MB)
            </p>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.pdf"
              className="hidden"
              onChange={handleProofSelect}
            />
          </label>
        ) : (
          <div className="flex items-start gap-3 rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-surface-700 dark:bg-surface-800">
            {proofPreview ? (
              <img src={proofPreview} alt="Proof preview" className="h-16 w-16 rounded-md object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-surface-200 dark:bg-surface-700">
                <FileImage className="h-6 w-6 text-surface-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-surface-900 dark:text-white">{proofFile.name}</p>
              <p className="text-xs text-surface-500">{(proofFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={handleRemoveProof} className="shrink-0 rounded-md p-1.5 text-surface-400 hover:bg-surface-200 hover:text-danger-600 dark:hover:bg-surface-700">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSubmit} disabled={submitting || !amount || !txHash || !proofFile}>
          {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : "Submit Deposit"}
        </Button>
        <Button variant="outline" onClick={onDone}>Cancel</Button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Web3 Deposit Form
// ═══════════════════════════════════════════════════════════════════════
function Web3DepositForm({
  supabase,
  userId,
  onDone,
}: {
  supabase: ReturnType<typeof createClient>;
  userId: string;
  onDone: () => void;
}) {
  const { isConnected, address } = useAccount();
  const { sendTransactionAsync, isPending: isSending } = useSendTransaction();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const adminAddress = process.env.NEXT_PUBLIC_ETHEREUM_WALLET || "0xe857421898d5b6d0c68ecb374349d18db9b59502";

  const handleSend = async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) { setError("Please enter a valid amount"); return; }

    setError(null);
    try {
      const hash = await sendTransactionAsync({
        to: adminAddress as `0x${string}`,
        value: parseEther(amount),
      });

      // Record deposit in database
      await supabase.from("mc_deposits").insert({
        user_id: userId,
        amount: parsedAmount,
        currency: "ETH",
        network: "Ethereum",
        tx_hash: hash,
        status: "confirming",
      });

      setSuccess(true);
      setTimeout(onDone, 2000);
    } catch (err: any) {
      console.error("Web3 deposit failed:", err);
      if (err?.code === 4001) {
        setError("Transaction rejected. Please approve in your wallet.");
      } else {
        setError(err?.shortMessage || err?.message || "Transaction failed");
      }
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-50 dark:bg-success-500/10">
          <Check className="h-6 w-6 text-success-600 dark:text-success-500" />
        </div>
        <p className="font-semibold text-surface-900 dark:text-white">Deposit Submitted!</p>
        <p className="text-sm text-surface-500">Your transaction is being confirmed on-chain.</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <p className="text-sm text-surface-500 dark:text-surface-400">Connect your wallet to make a Web3 deposit</p>
        <WalletButton />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700 dark:border-danger-800 dark:bg-danger-500/10 dark:text-danger-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Connected wallet info */}
      <div className="flex items-center gap-2 rounded-lg border border-success-200 bg-success-50 p-3 dark:border-success-800 dark:bg-success-500/10">
        <div className="h-2 w-2 rounded-full bg-success-500" />
        <span className="text-sm font-medium text-success-700 dark:text-success-400">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
      </div>

      {/* Recipient */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Sending to</label>
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-surface-700 dark:bg-surface-800">
          <p className="font-mono text-sm text-surface-900 dark:text-white">{adminAddress}</p>
          <p className="mt-1 text-xs text-surface-500">Platform deposit address (Ethereum)</p>
        </div>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Amount (ETH)</label>
        <Input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          step="0.0001"
        />
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSend} disabled={isSending || !amount}>
          {isSending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : (
            <>
              <ArrowRight className="mr-2 h-4 w-4" />
              Send Deposit
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onDone}>Cancel</Button>
      </div>
    </div>
  );
}
