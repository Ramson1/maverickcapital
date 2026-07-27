"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Search, Download, AlertTriangle, Plus, X, AlertCircle, Loader2,
  Copy, Check, FileImage, Trash2, ArrowRight, ArrowLeft, Clock,
  TrendingUp, Shield, Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useHardCap } from "@/hooks/useHardCap";
import { TablePageSkeleton } from "@/components/ui/PageSkeletons";
import Link from "next/link";

// ─── USDT TRC20 Only ─────────────────────────────────────────────────
const LS_KEY = (userId: string) => `mc_deposit_draft_${userId}`;

// ─── Investment Plans ─────────────────────────────────────────────────
const INVESTMENT_PLANS = {
  standard: {
    name: "Standard",
    minInvestment: 50,
    lockPeriodMonths: 1,
    roiPercent: 10,
    description: "1-month lock • 10% return",
    icon: TrendingUp,
  },
  premium: {
    name: "Premium",
    minInvestment: 50,
    lockPeriodMonths: 3,
    roiPercent: 12,
    description: "3-month lock • 12% return",
    icon: Shield,
  },
} as const;

type PlanKey = keyof typeof INVESTMENT_PLANS;

// ─── Types ───────────────────────────────────────────────────────────
interface Deposit {
  id: string;
  amount: number;
  currency: string;
  network: string;
  plan_name: string | null;
  lock_period_months: number | null;
  lock_end_date: string | null;
  tx_hash: string | null;
  status: string;
  proof_url: string | null;
  proof_data: string | null;
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

  // Wallet settings from admin
  const [depositWallet, setDepositWallet] = useState("");
  const [depositNetwork, setDepositNetwork] = useState("TRC20 (Tron)");
  const [depositCurrency, setDepositCurrency] = useState("USDT");
  const [minDeposit, setMinDeposit] = useState(50);
  const [minWithdrawal, setMinWithdrawal] = useState(10);

  // Withdrawal form state
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);

  // Profile data for withdrawal
  const [withdrawalAddress, setWithdrawalAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [unlockedInvestments, setUnlockedInvestments] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data: depositsData, error: depositsError } = await supabase
        .from("mc_deposits")
        .select("*")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false });

      if (depositsError) {
        console.error("Deposits fetch error:", depositsError);
      }
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

      // Fetch profile for withdrawal address and balances
      const { data: profileData } = await supabase
        .from("mc_profiles")
        .select("withdrawal_address, wallet_balance, total_investment, total_profit")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setWithdrawalAddress(profileData.withdrawal_address || null);
        setWalletBalance(Number(profileData.wallet_balance) || 0);
        setTotalInvestment(Number(profileData.total_investment) || 0);
        setTotalProfit(Number(profileData.total_profit) || 0);
      }

      // Calculate unlocked investment value
      const now = new Date().toISOString();
      const { data: investmentsData } = await supabase
        .from("mc_deposits")
        .select("amount, lock_end_date, status")
        .eq("user_id", user.id)
        .eq("status", "approved")
        .not("lock_end_date", "is", null);

      if (investmentsData) {
        const unlocked = investmentsData
          .filter((inv) => new Date(inv.lock_end_date) <= new Date())
          .reduce((sum, inv) => sum + Number(inv.amount), 0);
        setUnlockedInvestments(unlocked);
      }

      // Fetch platform settings
      const { data: settingsData } = await supabase.from("mc_settings").select("key, value");
      if (settingsData) {
        const map: Record<string, string> = {};
        settingsData.forEach((r) => { map[r.key] = r.value; });
        if (map.deposit_wallet_address) setDepositWallet(map.deposit_wallet_address);
        if (map.deposit_network) setDepositNetwork(map.deposit_network);
        if (map.deposit_currency) setDepositCurrency(map.deposit_currency);
        if (map.min_deposit) setMinDeposit(Number(map.min_deposit));
        if (map.min_withdrawal) setMinWithdrawal(Number(map.min_withdrawal));
      }

      setLoading(false);
    };

    fetchData();
  }, [user, supabase]);

  // Available balance for withdrawal = wallet_balance (profits) + unlocked investments
  const availableBalance = walletBalance + unlockedInvestments;

  // ─── Withdrawal submit ─────────────────────────────────────────────
  const handleSubmitWithdrawal = async () => {
    if (!user) return;
    const amount = parseFloat(withdrawalAmount);
    if (!amount || amount <= 0) { setWithdrawalError("Please enter a valid amount"); return; }
    if (amount < minWithdrawal) { setWithdrawalError(`Minimum withdrawal amount is $${minWithdrawal}`); return; }
    if (!withdrawalAddress) { setWithdrawalError("Please set your withdrawal address in your Profile first"); return; }
    if (amount > availableBalance) { setWithdrawalError(`Insufficient balance. Available: ${formatCurrency(availableBalance)}`); return; }

    setSubmitting(true);
    setWithdrawalError(null);

    const { data, error: insertError } = await supabase
      .from("mc_withdrawals")
      .insert({
        user_id: user.id,
        amount,
        currency: depositCurrency,
        network: depositNetwork,
        destination_address: withdrawalAddress,
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
      setWithdrawalAmount("");
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
              walletAddress={depositWallet}
              network={depositNetwork}
              currency={depositCurrency}
              minDeposit={minDeposit}
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
              onClose={() => setShowDepositForm(false)}
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
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Network</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Tx Hash</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Proof</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Lock Until</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                    {filteredDeposits.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-sm text-surface-400">No deposits found</td>
                      </tr>
                    ) : (
                      filteredDeposits.map((dep) => (
                        <tr key={dep.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                          <td className="px-6 py-4 font-medium text-surface-900 dark:text-white">{formatCurrency(dep.amount)}</td>
                          <td className="px-6 py-4">
                            {dep.plan_name ? (
                              <Badge variant="default" className="capitalize text-xs">{dep.plan_name}</Badge>
                            ) : (
                              <span className="text-xs text-surface-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{dep.network}</td>
                          <td className="px-6 py-4 font-mono text-sm text-surface-600 dark:text-surface-400">{dep.tx_hash || "-"}</td>
                          <td className="px-6 py-4">
                            {(dep.proof_data || dep.proof_url) ? (
                              <a href={(dep.proof_data || dep.proof_url) ?? "#"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
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
                          <td className="px-6 py-4 text-surface-600 dark:text-surface-400">
                            {dep.lock_end_date ? (
                              <span className={cn(
                                "text-xs",
                                new Date(dep.lock_end_date) > new Date() ? "text-warning-600 dark:text-warning-400" : "text-success-600 dark:text-success-400"
                              )}>
                                {new Date(dep.lock_end_date).toLocaleDateString()}
                              </span>
                            ) : "-"}
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

                {/* No withdrawal address warning */}
                {!withdrawalAddress ? (
                  <div className="flex items-start gap-3 rounded-lg border border-warning-200 bg-warning-50 p-4 dark:border-warning-800 dark:bg-warning-500/10">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning-600 dark:text-warning-400" />
                    <div>
                      <p className="text-sm font-medium text-warning-800 dark:text-warning-300">No withdrawal address set</p>
                      <p className="mt-1 text-xs text-warning-600 dark:text-warning-400">
                        Please set your USDT TRC20 wallet address in your <Link href="/dashboard/profile" className="font-semibold underline">Profile settings</Link> before requesting a withdrawal.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Available balance */}
                    <div className="rounded-lg border border-success-200 bg-success-50 p-3 dark:border-success-800 dark:bg-success-500/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-success-600 dark:text-success-400">Available for Withdrawal</p>
                          <p className="text-lg font-bold text-success-800 dark:text-success-300">{formatCurrency(availableBalance)}</p>
                        </div>
                        <div className="text-right text-xs text-success-600 dark:text-success-400">
                          <p>Profits: {formatCurrency(walletBalance)}</p>
                          <p>Unlocked: {formatCurrency(unlockedInvestments)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Destination address (from profile) */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Withdrawal Address</label>
                      <div className="flex items-center gap-2 rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-surface-700 dark:bg-surface-800">
                        <span className="flex-1 break-all font-mono text-sm text-surface-900 dark:text-white">{withdrawalAddress}</span>
                        <Link href="/dashboard/profile" className="shrink-0 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                          Edit
                        </Link>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Amount (USDT)</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                        min="0"
                        step="0.01"
                        max={availableBalance}
                      />
                      {withdrawalAmount && parseFloat(withdrawalAmount) > availableBalance && (
                        <p className="text-xs text-danger-600 dark:text-danger-400">Amount exceeds available balance</p>
                      )}
                      {withdrawalAmount && parseFloat(withdrawalAmount) > 0 && parseFloat(withdrawalAmount) < minWithdrawal && (
                        <p className="text-xs text-warning-600 dark:text-warning-400">Minimum withdrawal amount is ${minWithdrawal}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-surface-700 dark:bg-surface-800">
                      <span className="text-xs font-medium text-surface-500 dark:text-surface-400">Currency:</span>
                      <span className="text-xs font-semibold text-surface-900 dark:text-white">USDT</span>
                      <span className="text-xs text-surface-400">|</span>
                      <span className="text-xs font-medium text-surface-500 dark:text-surface-400">Network:</span>
                      <span className="text-xs font-semibold text-surface-900 dark:text-white">TRC20 (Tron)</span>
                    </div>

                    <p className="text-xs text-surface-500 dark:text-surface-400">
                      Your withdrawal request will be reviewed and processed by the admin team.
                    </p>

                    <div className="flex gap-3">
                      <Button onClick={handleSubmitWithdrawal} disabled={submitting || !withdrawalAmount || parseFloat(withdrawalAmount) < minWithdrawal || parseFloat(withdrawalAmount) > availableBalance}>
                        {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : "Submit Request"}
                      </Button>
                      <Button variant="outline" onClick={() => { setShowWithdrawalForm(false); setWithdrawalError(null); }}>Cancel</Button>
                    </div>
                  </>
                )}
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
// Deposit Form Component (USDT TRC20 only — 2-step flow)
// ═══════════════════════════════════════════════════════════════════════
function DepositForm({
  supabase,
  userId,
  walletAddress,
  network,
  currency,
  minDeposit,
  onDepositSubmitted,
  onClose,
}: {
  supabase: ReturnType<typeof createClient>;
  userId: string;
  walletAddress: string;
  network: string;
  currency: string;
  minDeposit: number;
  onDepositSubmitted: () => void;
  onClose: () => void;
}) {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-surface-900 dark:text-white">New Deposit</h3>
          <button onClick={onClose}><X className="h-4 w-4 text-surface-500" /></button>
        </div>
        <ManualDepositForm
          supabase={supabase}
          userId={userId}
          walletAddress={walletAddress}
          network={network}
          currency={currency}
          minDeposit={minDeposit}
          onDone={onDepositSubmitted}
          onCancel={onClose}
        />
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Manual Deposit Form — 2-step flow with localStorage persistence
// Step 1: Enter amount → see payment details → "I've Made the Payment"
// Step 2: Enter tx hash + upload proof → Submit
// ═══════════════════════════════════════════════════════════════════════
type DepositDraft = {
  step: 1 | 2;
  amount: string;
  plan: PlanKey;
  txHash: string;
  proofFileName: string | null;
  proofFileSize: number | null;
};

function ManualDepositForm({
  supabase,
  userId,
  walletAddress,
  network,
  currency,
  minDeposit,
  onDone,
  onCancel,
}: {
  supabase: ReturnType<typeof createClient>;
  userId: string;
  walletAddress: string;
  network: string;
  currency: string;
  minDeposit: number;
  onDone: () => void;
  onCancel: () => void;
}) {
  // Load draft from localStorage
  const loadDraft = (): DepositDraft => {
    if (typeof window === "undefined") return { step: 1, amount: "", plan: "standard", txHash: "", proofFileName: null, proofFileSize: null };
    try {
      const saved = localStorage.getItem(LS_KEY(userId));
      if (saved) return JSON.parse(saved);
    } catch {}
    return { step: 1, amount: "", plan: "standard", txHash: "", proofFileName: null, proofFileSize: null };
  };

  const [draft, setDraftState] = useState<DepositDraft>(loadDraft);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persist draft to localStorage whenever it changes
  const saveDraft = (next: DepositDraft) => {
    setDraftState(next);
    try { localStorage.setItem(LS_KEY(userId), JSON.stringify(next)); } catch {}
  };

  const clearDraft = () => {
    setDraftState({ step: 1, amount: "", plan: "standard", txHash: "", proofFileName: null, proofFileSize: null });
    try { localStorage.removeItem(LS_KEY(userId)); } catch {}
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProofSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a PNG, JPG, WEBP, or PDF file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be smaller than 5MB");
      return;
    }
    setError(null);
    setProofFile(file);
    const next = { ...draft, proofFileName: file.name, proofFileSize: file.size };
    saveDraft(next);
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
    const next = { ...draft, proofFileName: null, proofFileSize: null };
    saveDraft(next);
  };

  // Step 1 → Step 2
  const goToStep2 = () => {
    const parsedAmount = parseFloat(draft.amount);
    const plan = INVESTMENT_PLANS[draft.plan];
    if (!parsedAmount || parsedAmount <= 0) { setError("Please enter a valid amount"); return; }
    if (parsedAmount < minDeposit) { setError(`Minimum deposit amount is $${minDeposit}`); return; }
    if (parsedAmount < plan.minInvestment) { setError(`Minimum investment for ${plan.name} plan is $${plan.minInvestment}`); return; }
    setError(null);
    const next = { ...draft, step: 2 as const };
    saveDraft(next);
  };

  // Step 2 → Step 1
  const goToStep1 = () => {
    setError(null);
    const next = { ...draft, step: 1 as const };
    saveDraft(next);
  };

  // Final submit
  const handleSubmit = async () => {
    const parsedAmount = parseFloat(draft.amount);
    if (!parsedAmount || parsedAmount <= 0) { setError("Please enter a valid amount"); return; }
    if (parsedAmount < minDeposit) { setError(`Minimum deposit amount is $${minDeposit}`); return; }
    if (!draft.txHash.trim()) { setError("Please enter the transaction hash"); return; }
    if (!proofFile) { setError("Please upload proof of payment"); return; }

    setSubmitting(true);
    setError(null);

    // Convert proof file to base64 for direct database storage
    const proofData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(proofFile);
    }).catch((err) => {
      setError(err.message || "Failed to read proof file");
      setSubmitting(false);
      return null;
    });
    if (!proofData) return;

    // Calculate lock end date
    const plan = INVESTMENT_PLANS[draft.plan];
    const lockEndDate = new Date();
    lockEndDate.setMonth(lockEndDate.getMonth() + plan.lockPeriodMonths);

    const { error: insertError } = await supabase
      .from("mc_deposits")
      .insert({
        user_id: userId,
        amount: parsedAmount,
        currency: currency,
        network: network,
        plan_name: draft.plan,
        lock_period_months: plan.lockPeriodMonths,
        lock_end_date: lockEndDate.toISOString(),
        tx_hash: draft.txHash.trim(),
        proof_data: proofData,
        status: "pending",
      });

    if (insertError) {
      setError(insertError.message || "Failed to submit deposit");
      setSubmitting(false);
      return;
    }

    // Clear draft and finish
    clearDraft();
    onDone();
  };

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700 dark:border-danger-800 dark:bg-danger-500/10 dark:text-danger-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
          draft.step === 1
            ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
            : "bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400"
        )}>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current/10 text-[10px] font-bold">1</span>
          Payment Details
        </div>
        <div className="h-px flex-1 bg-surface-200 dark:bg-surface-700" />
        <div className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
          draft.step === 2
            ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
            : "bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400"
        )}>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current/10 text-[10px] font-bold">2</span>
          Upload Proof
        </div>
      </div>

      {draft.step === 1 ? (
        /* ═══ STEP 1: Select plan, enter amount & see payment details ═══ */
        <div className="space-y-4">
          {/* Plan Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Select Investment Plan</label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(Object.entries(INVESTMENT_PLANS) as [PlanKey, typeof INVESTMENT_PLANS[PlanKey]][]).map(([key, plan]) => {
                const PlanIcon = plan.icon;
                const isSelected = draft.plan === key;
                return (
                  <button
                    key={key}
                    onClick={() => saveDraft({ ...draft, plan: key })}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                      isSelected
                        ? "border-brand-500 bg-brand-50 dark:border-brand-600 dark:bg-brand-500/10"
                        : "border-surface-200 hover:border-brand-300 dark:border-surface-700 dark:hover:border-brand-600"
                    )}
                  >
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      isSelected ? "bg-brand-100 dark:bg-brand-500/20" : "bg-surface-100 dark:bg-surface-800"
                    )}>
                      <PlanIcon className={cn("h-5 w-5", isSelected ? "text-brand-600 dark:text-brand-400" : "text-surface-500")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn("font-semibold", isSelected ? "text-brand-700 dark:text-brand-400" : "text-surface-900 dark:text-white")}>
                          {plan.name}
                        </p>
                        {key === "premium" && (
                          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-400">POPULAR</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-surface-500 dark:text-surface-400">{plan.description}</p>
                      <p className="mt-1 text-[11px] text-surface-400 dark:text-surface-500">Min: ${plan.minInvestment}</p>
                    </div>
                    {isSelected && (
                      <Check className="h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Deposit Amount (USDT)</label>
            <Input
              type="number"
              placeholder="Enter amount in USDT"
              value={draft.amount}
              onChange={(e) => saveDraft({ ...draft, amount: e.target.value })}
              min="0"
              step="0.01"
            />
            {draft.amount && parseFloat(draft.amount) > 0 && (
              <p className="text-xs text-surface-500 dark:text-surface-400">
                Expected return: <strong className="text-success-600">{formatCurrency(parseFloat(draft.amount) * (INVESTMENT_PLANS[draft.plan].roiPercent / 100))}</strong> after {INVESTMENT_PLANS[draft.plan].lockPeriodMonths}-month lock
              </p>
            )}
          </div>

          {/* Payment details card */}
          <div className="space-y-3 rounded-xl border border-brand-200 bg-brand-50/50 p-4 dark:border-brand-800 dark:bg-brand-500/5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-500/20">
                <Copy className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-900 dark:text-white">Send {currency} to this address</p>
                <p className="text-xs text-surface-500 dark:text-surface-400">{network} network only</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-brand-200 bg-white p-3 dark:border-brand-800 dark:bg-surface-900">
              <p className="flex-1 break-all font-mono text-sm text-surface-900 dark:text-white">
                {walletAddress || "Wallet address not configured"}
              </p>
              <button
                onClick={copyAddress}
                className="shrink-0 rounded-md p-2 transition-colors hover:bg-brand-100 dark:hover:bg-brand-500/20"
              >
                {copied ? <Check className="h-4 w-4 text-success-600" /> : <Copy className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
              </button>
            </div>

            <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-500/10">
              <p className="text-xs text-amber-800 dark:text-amber-300">
                <strong>Important:</strong> Only send <strong>{currency}</strong> on the <strong>{network}</strong> network.
                Sending other tokens or using a different network will result in permanent loss.
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-800">
            <p className="text-sm font-medium text-surface-900 dark:text-white mb-2">Instructions:</p>
            <ol className="space-y-1.5 text-xs text-surface-600 dark:text-surface-400">
              <li className="flex gap-2"><span className="font-bold text-brand-600">1.</span> Copy the wallet address above</li>
              <li className="flex gap-2"><span className="font-bold text-brand-600">2.</span> Open your wallet or exchange (Binance, Trust Wallet, etc.)</li>
              <li className="flex gap-2"><span className="font-bold text-brand-600">3.</span> Send the exact amount of USDT via <strong>TRC20</strong> network</li>
              <li className="flex gap-2"><span className="font-bold text-brand-600">4.</span> After payment is complete, click "I've Made the Payment" below</li>
              <li className="flex gap-2"><span className="font-bold text-brand-600">5.</span> Upload your proof of payment and transaction hash</li>
            </ol>
          </div>

          {/* Your draft is saved automatically */}
          {draft.amount && (
            <p className="flex items-center gap-1.5 text-xs text-surface-400 dark:text-surface-500">
              <Clock className="h-3 w-3" />
              Your progress is saved automatically
            </p>
          )}

          {/* Minimum deposit warning */}
          {draft.amount && parseFloat(draft.amount) > 0 && parseFloat(draft.amount) < minDeposit && (
            <div className="flex items-center gap-2 rounded-lg border border-warning-200 bg-warning-50 p-3 text-sm text-warning-700 dark:border-warning-800 dark:bg-warning-500/10 dark:text-warning-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Minimum deposit amount is ${minDeposit}
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={goToStep2} disabled={!draft.amount || parseFloat(draft.amount) <= 0}>
              I've Made the Payment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => { clearDraft(); onCancel(); }}>Cancel</Button>
          </div>
        </div>
      ) : (
        /* ═══ STEP 2: Enter tx hash & upload proof ═══ */
        <div className="space-y-4">
          {/* Summary of payment */}
          <div className="space-y-2 rounded-lg border border-success-200 bg-success-50 p-3 dark:border-success-800 dark:bg-success-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-success-600 dark:text-success-400">Payment Amount</p>
                <p className="text-lg font-bold text-success-800 dark:text-success-300">{formatCurrency(parseFloat(draft.amount) || 0)} USDT</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-success-600 dark:text-success-400">Plan</p>
                <p className="text-sm font-semibold text-success-800 dark:text-success-300">{INVESTMENT_PLANS[draft.plan].name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 border-t border-success-200 pt-2 dark:border-success-800">
              <div className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-success-600 dark:text-success-400" />
                <span className="text-xs text-success-700 dark:text-success-400">{INVESTMENT_PLANS[draft.plan].lockPeriodMonths}-month lock</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-success-600 dark:text-success-400" />
                <span className="text-xs text-success-700 dark:text-success-400">{INVESTMENT_PLANS[draft.plan].roiPercent}% ROI</span>
              </div>
              <div className="ml-auto">
                <span className="text-xs font-semibold text-success-800 dark:text-success-300">
                  Return: {formatCurrency(parseFloat(draft.amount) * (INVESTMENT_PLANS[draft.plan].roiPercent / 100))}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Hash */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Transaction Hash</label>
            <Input
              placeholder="Enter the transaction hash from your payment"
              value={draft.txHash}
              onChange={(e) => saveDraft({ ...draft, txHash: e.target.value })}
            />
            <p className="text-xs text-surface-500 dark:text-surface-400">
              You can find the transaction hash in your wallet or exchange after sending the payment.
            </p>
          </div>

          {/* Upload Proof of Payment */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Proof of Payment</label>
            {!proofFile ? (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-surface-300 p-6 transition-colors hover:border-brand-400 hover:bg-brand-50/50 dark:border-surface-600 dark:hover:border-brand-500 dark:hover:bg-brand-500/5">
                <FileImage className="h-8 w-8 text-surface-400 dark:text-surface-500" />
                <p className="text-sm font-medium text-surface-600 dark:text-surface-400">
                  Click to upload payment receipt
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
            <Button onClick={handleSubmit} disabled={submitting || !draft.txHash || !proofFile}>
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : "Submit Deposit"}
            </Button>
            <Button variant="outline" onClick={goToStep1}>
              <ArrowLeft className="mr-2 h-4 w-4" />Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

