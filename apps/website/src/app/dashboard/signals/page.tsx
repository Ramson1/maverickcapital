"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import {
  TrendingUp, Lock, Star, Loader2, Check, Copy, Check as CheckIcon,
  AlertCircle, X, FileImage, Trash2, Wallet, ArrowRight, CreditCard,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { SignalsSkeleton } from "@/components/ui/PageSkeletons";
import { useAccount, useSendTransaction } from "wagmi";
import { parseEther } from "viem";
import { WalletButton } from "@/components/web3/WalletButton";

// ─── Constants ───────────────────────────────────────────────────────
const SIGNAL_SUBSCRIPTION_PRICE = 50; // USDT/month

const USDT_WALLETS = [
  { id: "ERC20", label: "ERC20 (Ethereum)", address: process.env.NEXT_PUBLIC_ETHEREUM_WALLET || "" },
  { id: "TRC20", label: "TRC20 (Tron)", address: process.env.NEXT_PUBLIC_TRON_WALLET || "" },
  { id: "BEP20", label: "BSC (BEP20)", address: process.env.NEXT_PUBLIC_ETHEREUM_WALLET || "" },
  { id: "POLYGON", label: "Polygon", address: process.env.NEXT_PUBLIC_POLYGON_WALLET || "" },
];

// ─── Types ───────────────────────────────────────────────────────────
interface Signal {
  id: string;
  pair: string;
  entry_price: number;
  stop_loss: number | null;
  take_profit: number[] | null;
  risk_level: string;
  analysis: string | null;
  target_audience: string;
  status: string;
  created_at: string;
  mc_signal_categories: { name: string; slug: string } | null;
}

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  start_date: string;
  end_date: string;
}

const riskColors: Record<string, string> = {
  low: "text-success-600 bg-success-50 dark:text-success-500 dark:bg-success-500/10",
  medium: "text-warning-600 bg-warning-50 dark:text-warning-500 dark:bg-warning-500/10",
  high: "text-danger-600 bg-danger-50 dark:text-danger-500 dark:bg-danger-500/10",
};

// ─── Main Page ───────────────────────────────────────────────────────
export default function SignalsPage() {
  const [activeTab, setActiveTab] = useState<"signals" | "subscription">("signals");

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-surface-100 p-1 dark:bg-surface-800">
        <button
          onClick={() => setActiveTab("signals")}
          className={cn(
            "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "signals"
              ? "bg-white text-surface-900 shadow-sm dark:bg-surface-700 dark:text-white"
              : "text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
          )}
        >
          Trading Signals
        </button>
        <button
          onClick={() => setActiveTab("subscription")}
          className={cn(
            "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "subscription"
              ? "bg-white text-surface-900 shadow-sm dark:bg-surface-700 dark:text-white"
              : "text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
          )}
        >
          Subscription
        </button>
      </div>

      {activeTab === "signals" ? <SignalsList /> : <SubscriptionSection />}
    </div>
  );
}

// ─── Signals List ────────────────────────────────────────────────────
function SignalsList() {
  const supabase = createClient();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSignals = async () => {
      const { data } = await supabase
        .from("mc_signals")
        .select("*, mc_signal_categories(name, slug)")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (data) {
        setSignals(
          data.map((s) => ({
            ...s,
            entry_price: Number(s.entry_price),
            stop_loss: s.stop_loss ? Number(s.stop_loss) : null,
            take_profit: Array.isArray(s.take_profit) ? s.take_profit.map(Number) : null,
          }))
        );
      }
      setLoading(false);
    };

    fetchSignals();
  }, [supabase]);

  const filtered = signals.filter((s) => {
    if (categoryFilter === "all") return true;
    return s.mc_signal_categories?.slug === categoryFilter;
  });

  if (loading) {
    return <SignalsSkeleton />;
  }

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => setCategoryFilter("all")}
          className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            categoryFilter === "all" ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" : "text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
          )}
        >
          All
        </button>
        {Array.from(new Set(signals.map((s) => s.mc_signal_categories?.slug).filter(Boolean))).map((slug) => {
          const cat = signals.find((s) => s.mc_signal_categories?.slug === slug)?.mc_signal_categories;
          return (
            <button
              key={slug}
              onClick={() => setCategoryFilter(slug!)}
              className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                categoryFilter === slug ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" : "text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
              )}
            >
              {cat?.name || slug}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="col-span-2 py-12 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-surface-300 dark:text-surface-600" />
            <p className="mt-4 text-sm text-surface-500">No signals available</p>
          </div>
        ) : (
          filtered.map((signal) => {
            const isPremium = signal.target_audience === "premium";
            const tp1 = signal.take_profit?.[0];
            const tp2 = signal.take_profit?.[1];
            return (
              <Card key={signal.id} className={cn("relative", isPremium && "border-accent-200 dark:border-accent-800")}>
                {isPremium && (
                  <div className="absolute right-4 top-4">
                    <Badge variant="warning"><Lock className="mr-1 h-3 w-3" />Premium</Badge>
                  </div>
                )}
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
                        <TrendingUp className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                      </div>
                      <div>
                        <p className="font-bold text-surface-900 dark:text-white">{signal.pair}</p>
                        <p className="text-xs text-surface-500">
                          {signal.mc_signal_categories?.name || "Signal"} &middot; {new Date(signal.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", riskColors[signal.risk_level])}>
                      {signal.risk_level} risk
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="rounded-lg bg-surface-50 p-2 dark:bg-surface-800">
                      <p className="text-xs text-surface-500">Entry</p>
                      <p className="font-semibold text-surface-900 dark:text-white">{signal.entry_price}</p>
                    </div>
                    <div className="rounded-lg bg-danger-50 p-2 dark:bg-danger-500/10">
                      <p className="text-xs text-danger-600">SL</p>
                      <p className="font-semibold text-danger-700 dark:text-danger-400">{signal.stop_loss ?? "-"}</p>
                    </div>
                    <div className="rounded-lg bg-success-50 p-2 dark:bg-success-500/10">
                      <p className="text-xs text-success-600">TP1</p>
                      <p className="font-semibold text-success-700 dark:text-success-400">{tp1 ?? "-"}</p>
                    </div>
                    <div className="rounded-lg bg-success-50 p-2 dark:bg-success-500/10">
                      <p className="text-xs text-success-600">TP2</p>
                      <p className="font-semibold text-success-700 dark:text-success-400">{tp2 ?? "-"}</p>
                    </div>
                  </div>

                  {signal.analysis && (
                    <p className="mt-3 text-sm text-surface-600 dark:text-surface-400">{signal.analysis}</p>
                  )}

                  {isPremium && (
                    <div className="mt-4 flex items-center justify-center rounded-lg border border-dashed border-accent-300 bg-accent-50/50 p-3 dark:border-accent-700 dark:bg-accent-500/5">
                      <Lock className="mr-2 h-4 w-4 text-accent-600" />
                      <span className="text-sm font-medium text-accent-700 dark:text-accent-400">Subscribe for full access</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </>
  );
}

// ─── Subscription Section ────────────────────────────────────────────
function SubscriptionSection() {
  const { user } = useAuth();
  const supabase = createClient();

  const [currentSub, setCurrentSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"manual" | "web3" | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchSub = async () => {
      const { data } = await supabase
        .from("mc_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["active", "pending_confirmation"])
        .order("created_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setCurrentSub(data[0]);
      }
      setLoading(false);
    };

    fetchSub();
  }, [user, supabase]);

  const isActive = currentSub?.status === "active";
  const isPending = currentSub?.status === "pending_confirmation";

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>;
  }

  return (
    <>
      {/* Plan Card */}
      <Card className={cn("relative overflow-hidden", isActive && "border-success-200 dark:border-success-800")}>
        {isActive && (
          <div className="absolute right-4 top-4">
            <Badge variant="success">Active</Badge>
          </div>
        )}
        {isPending && (
          <div className="absolute right-4 top-4">
            <Badge variant="warning">Pending Confirmation</Badge>
          </div>
        )}
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-500/10">
              <Star className="h-8 w-8 text-brand-600 dark:text-brand-400" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white">Premium Signals</h2>
              <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
                Full access to all premium trading signals from our analysts
              </p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-surface-900 dark:text-white">{formatCurrency(SIGNAL_SUBSCRIPTION_PRICE)}</span>
                <span className="text-surface-500">/month</span>
              </div>
              <ul className="mt-4 space-y-2">
                {[
                  "All premium trading signals",
                  "Real-time entry, SL & TP levels",
                  "Detailed market analysis",
                  "Priority support",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success-500" />
                    <span className="text-surface-600 dark:text-surface-400">{f}</span>
                  </li>
                ))}
              </ul>

              {isActive ? (
                <div className="mt-6 rounded-lg border border-success-200 bg-success-50 p-3 dark:border-success-800 dark:bg-success-500/10">
                  <p className="text-sm font-medium text-success-700 dark:text-success-400">
                    Your subscription is active until {new Date(currentSub.end_date).toLocaleDateString()}
                  </p>
                </div>
              ) : isPending ? (
                <div className="mt-6 rounded-lg border border-warning-200 bg-warning-50 p-3 dark:border-warning-800 dark:bg-warning-500/10">
                  <p className="text-sm font-medium text-warning-700 dark:text-warning-400">
                    Your payment is being verified. You will have access once confirmed.
                  </p>
                </div>
              ) : (
                <div className="mt-6">
                  {!showPayment ? (
                    <Button onClick={() => setShowPayment(true)} className="w-full sm:w-auto">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Subscribe Now
                    </Button>
                  ) : (
                    <PaymentFlow
                      supabase={supabase}
                      userId={user?.id || ""}
                      onBack={() => { setShowPayment(false); setPaymentMethod(null); }}
                      onSubmitted={() => {
                        // Refresh subscription status
                        setShowPayment(false);
                        setPaymentMethod(null);
                        supabase
                          .from("mc_subscriptions")
                          .select("*")
                          .eq("user_id", user?.id)
                          .in("status", ["active", "pending_confirmation"])
                          .order("created_at", { ascending: false })
                          .limit(1)
                          .then(({ data }) => {
                            if (data && data.length > 0) setCurrentSub(data[0]);
                          });
                      }}
                      paymentMethod={paymentMethod}
                      setPaymentMethod={setPaymentMethod}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// ─── Payment Flow ────────────────────────────────────────────────────
function PaymentFlow({
  supabase,
  userId,
  onBack,
  onSubmitted,
  paymentMethod,
  setPaymentMethod,
}: {
  supabase: ReturnType<typeof createClient>;
  userId: string;
  onBack: () => void;
  onSubmitted: () => void;
  paymentMethod: "manual" | "web3" | null;
  setPaymentMethod: (m: "manual" | "web3" | null) => void;
}) {
  if (!paymentMethod) {
    return (
      <div className="space-y-4">
        <p className="text-sm font-medium text-surface-700 dark:text-surface-300">Choose payment method</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() => setPaymentMethod("manual")}
            className="flex items-center gap-3 rounded-xl border border-surface-200 p-4 transition-all hover:border-brand-300 hover:bg-brand-50 dark:border-surface-700 dark:hover:border-brand-600 dark:hover:bg-brand-500/10"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
              <FileImage className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-surface-900 dark:text-white">Manual Payment</p>
              <p className="text-xs text-surface-500">Send USDT & upload receipt</p>
            </div>
          </button>
          <button
            onClick={() => setPaymentMethod("web3")}
            className="flex items-center gap-3 rounded-xl border border-surface-200 p-4 transition-all hover:border-brand-300 hover:bg-brand-50 dark:border-surface-700 dark:hover:border-brand-600 dark:hover:bg-brand-500/10"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50 dark:bg-success-500/10">
              <Wallet className="h-5 w-5 text-success-600 dark:text-success-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-surface-900 dark:text-white">Web3 Payment</p>
              <p className="text-xs text-surface-500">Connect wallet & pay directly</p>
            </div>
          </button>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>&larr; Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => setPaymentMethod(null)}>&larr; Back to methods</Button>
      {paymentMethod === "manual" ? (
        <ManualPaymentForm supabase={supabase} userId={userId} onDone={onSubmitted} />
      ) : (
        <Web3PaymentForm supabase={supabase} userId={userId} onDone={onSubmitted} />
      )}
    </div>
  );
}

// ─── Manual Payment Form ─────────────────────────────────────────────
function ManualPaymentForm({
  supabase,
  userId,
  onDone,
}: {
  supabase: ReturnType<typeof createClient>;
  userId: string;
  onDone: () => void;
}) {
  const [selectedWallet, setSelectedWallet] = useState(USDT_WALLETS[0]);
  const [txHash, setTxHash] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copyAddress = () => {
    navigator.clipboard.writeText(selectedWallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProofSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) { setError("Please upload a PNG, JPG, WEBP, or PDF file"); return; }
    if (file.size > 5 * 1024 * 1024) { setError("File must be smaller than 5MB"); return; }
    setError(null);
    setProofFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setProofPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setProofPreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!txHash.trim()) { setError("Please enter the transaction hash"); return; }
    if (!proofFile) { setError("Please upload proof of payment"); return; }

    setSubmitting(true);
    setError(null);

    // Upload proof
    const fileExt = proofFile.name.split(".").pop();
    const fileName = `${userId}/signal-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from("deposit-proofs").upload(fileName, proofFile);
    if (uploadError) { setError("Failed to upload proof. Please try again."); setSubmitting(false); return; }

    const { data: urlData } = supabase.storage.from("deposit-proofs").getPublicUrl(fileName);
    const proofUrl = urlData?.publicUrl || "";

    // Insert subscription as pending
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const { error: insertError } = await supabase.from("mc_subscriptions").insert({
      user_id: userId,
      plan_id: "signal-premium",
      status: "pending_confirmation",
      start_date: new Date().toISOString(),
      end_date: endDate.toISOString(),
      proof_url: proofUrl,
      tx_hash: txHash.trim(),
      amount: SIGNAL_SUBSCRIPTION_PRICE,
    });

    if (insertError) { setError(insertError.message || "Failed to submit"); setSubmitting(false); return; }
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

      {/* Select network */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-surface-700 dark:text-surface-300">1. Select Network</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {USDT_WALLETS.map((w) => (
            <button
              key={w.id}
              onClick={() => setSelectedWallet(w)}
              className={cn(
                "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                selectedWallet.id === w.id
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                  : "border-surface-200 text-surface-600 hover:border-brand-300 dark:border-surface-700 dark:text-surface-400 dark:hover:border-brand-600"
              )}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Send to address */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-surface-700 dark:text-surface-300">2. Send {formatCurrency(SIGNAL_SUBSCRIPTION_PRICE)} USDT to this address</label>
        <div className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 p-3 dark:border-brand-800 dark:bg-brand-500/10">
          <p className="flex-1 break-all font-mono text-sm text-surface-900 dark:text-white">{selectedWallet.address}</p>
          <button onClick={copyAddress} className="shrink-0 rounded-md p-2 transition-colors hover:bg-brand-100 dark:hover:bg-brand-500/20">
            {copied ? <Check className="h-4 w-4 text-success-600" /> : <Copy className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
          </button>
        </div>
      </div>

      {/* Tx hash */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-surface-700 dark:text-surface-300">3. Transaction Hash</label>
        <Input placeholder="Enter tx hash from your payment" value={txHash} onChange={(e) => setTxHash(e.target.value)} />
      </div>

      {/* Proof upload */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-surface-700 dark:text-surface-300">4. Upload Proof of Payment</label>
        {!proofFile ? (
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-surface-300 p-6 transition-colors hover:border-brand-400 hover:bg-brand-50/50 dark:border-surface-600 dark:hover:border-brand-500 dark:hover:bg-brand-500/5">
            <FileImage className="h-8 w-8 text-surface-400" />
            <p className="text-sm font-medium text-surface-600 dark:text-surface-400">Click to upload</p>
            <p className="text-xs text-surface-400">PNG, JPG, WEBP, or PDF (max 5MB)</p>
            <input type="file" accept=".png,.jpg,.jpeg,.webp,.pdf" className="hidden" onChange={handleProofSelect} />
          </label>
        ) : (
          <div className="flex items-start gap-3 rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-surface-700 dark:bg-surface-800">
            {proofPreview ? (
              <img src={proofPreview} alt="Proof" className="h-16 w-16 rounded-md object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-surface-200 dark:bg-surface-700">
                <FileImage className="h-6 w-6 text-surface-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-surface-900 dark:text-white">{proofFile.name}</p>
              <p className="text-xs text-surface-500">{(proofFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={() => { setProofFile(null); setProofPreview(null); }} className="shrink-0 rounded-md p-1.5 text-surface-400 hover:text-danger-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSubmit} disabled={submitting || !txHash || !proofFile}>
          {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : "Submit Payment"}
        </Button>
        <Button variant="outline" onClick={onDone}>Cancel</Button>
      </div>
    </div>
  );
}

// ─── Web3 Payment Form ───────────────────────────────────────────────
function Web3PaymentForm({
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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const adminAddress = process.env.NEXT_PUBLIC_ETHEREUM_WALLET || "0xe857421898d5b6d0c68ecb374349d18db9b59502";

  // Convert $50 USDT to ETH equivalent (approximate - in production use oracle)
  // For now we send a fixed ETH amount; user can also just send equivalent
  const handleSend = async () => {
    setError(null);
    try {
      // Send $50 worth of ETH (this is approximate; real implementation would use USDT contract)
      // Using a placeholder ETH value - in production, query current ETH/USDT price
      const ethAmount = "0.015"; // approximate $50 worth - adjust as needed

      const hash = await sendTransactionAsync({
        to: adminAddress as `0x${string}`,
        value: parseEther(ethAmount),
      });

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      await supabase.from("mc_subscriptions").insert({
        user_id: userId,
        plan_id: "signal-premium",
        status: "pending_confirmation",
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
        tx_hash: hash,
        amount: SIGNAL_SUBSCRIPTION_PRICE,
      });

      setSuccess(true);
      setTimeout(onDone, 2000);
    } catch (err: any) {
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
        <p className="font-semibold text-surface-900 dark:text-white">Payment Submitted!</p>
        <p className="text-sm text-surface-500">Your subscription will be activated once confirmed.</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <p className="text-sm text-surface-500">Connect your wallet to pay with Web3</p>
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

      <div className="flex items-center gap-2 rounded-lg border border-success-200 bg-success-50 p-3 dark:border-success-800 dark:bg-success-500/10">
        <div className="h-2 w-2 rounded-full bg-success-500" />
        <span className="text-sm font-medium text-success-700 dark:text-success-400">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Sending to</label>
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-surface-700 dark:bg-surface-800">
          <p className="font-mono text-sm text-surface-900 dark:text-white">{adminAddress}</p>
          <p className="mt-1 text-xs text-surface-500">Platform payment address</p>
        </div>
      </div>

      <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-500/10">
        <p className="text-sm font-medium text-brand-700 dark:text-brand-400">Amount: {formatCurrency(SIGNAL_SUBSCRIPTION_PRICE)} USDT (paid in ETH equivalent)</p>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSend} disabled={isSending}>
          {isSending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : (
            <><ArrowRight className="mr-2 h-4 w-4" />Pay & Subscribe</>
          )}
        </Button>
        <Button variant="outline" onClick={onDone}>Cancel</Button>
      </div>
    </div>
  );
}
