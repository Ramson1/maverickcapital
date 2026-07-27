"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import {
  TrendingUp, Lock, Star, Loader2, Check, Copy, Check as CheckIcon,
  AlertCircle, X, FileImage, Trash2, ArrowRight, CreditCard,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { SignalsSkeleton } from "@/components/ui/PageSkeletons";

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
  const { user } = useAuth();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"signals" | "subscription">("signals");
  const [currentSub, setCurrentSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

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
      if (data && data.length > 0) setCurrentSub(data[0]);
      setLoading(false);
    };
    fetchSub();
  }, [user, supabase]);

  const isSubscribed = currentSub?.status === "active";
  const isPending = currentSub?.status === "pending_confirmation";
  const hasAccess = isSubscribed || isPending;

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>;
  }

  // Not subscribed — only show subscription card
  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <SubscriptionSection currentSub={currentSub} onSubscribed={setCurrentSub} />
      </div>
    );
  }

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

      {activeTab === "signals" ? (
        <SignalsList />
      ) : (
        <SubscriptionSection currentSub={currentSub} onSubscribed={setCurrentSub} />
      )}
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
function SubscriptionSection({
  currentSub,
  onSubscribed,
}: {
  currentSub: Subscription | null;
  onSubscribed: (sub: Subscription) => void;
}) {
  const { user } = useAuth();
  const supabase = createClient();

  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"manual" | null>(null);

  const isActive = currentSub?.status === "active";
  const isPending = currentSub?.status === "pending_confirmation";

  // Calculate remaining time for active subscription
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null);
  useEffect(() => {
    if (!isActive || !currentSub?.end_date) return;
    const calc = () => {
      const now = new Date().getTime();
      const end = new Date(currentSub.end_date).getTime();
      const diff = end - now;
      if (diff <= 0) { setTimeLeft(null); return; }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      });
    };
    calc();
    const interval = setInterval(calc, 60_000);
    return () => clearInterval(interval);
  }, [isActive, currentSub?.end_date]);

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
                <div className="mt-6 space-y-3">
                  {/* Remaining time countdown */}
                  {timeLeft && (
                    <div className="rounded-lg border border-success-200 bg-success-50 p-4 dark:border-success-800 dark:bg-success-500/10">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-success-600 dark:text-success-400">Subscription expires in</p>
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center rounded-lg bg-white px-4 py-2 shadow-sm dark:bg-surface-800">
                          <span className="text-2xl font-bold text-success-700 dark:text-success-400">{timeLeft.days}</span>
                          <span className="text-[10px] uppercase text-success-500">days</span>
                        </div>
                        <div className="flex flex-col items-center rounded-lg bg-white px-4 py-2 shadow-sm dark:bg-surface-800">
                          <span className="text-2xl font-bold text-success-700 dark:text-success-400">{timeLeft.hours}</span>
                          <span className="text-[10px] uppercase text-success-500">hrs</span>
                        </div>
                        <div className="flex flex-col items-center rounded-lg bg-white px-4 py-2 shadow-sm dark:bg-surface-800">
                          <span className="text-2xl font-bold text-success-700 dark:text-success-400">{timeLeft.minutes}</span>
                          <span className="text-[10px] uppercase text-success-500">min</span>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-success-600 dark:text-success-400">
                        Until {new Date(currentSub.end_date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    </div>
                  )}
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
                            if (data && data.length > 0) onSubscribed(data[0]);
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
  paymentMethod: "manual" | null;
  setPaymentMethod: (m: "manual" | null) => void;
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
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>&larr; Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => setPaymentMethod(null)}>&larr; Back</Button>
      <ManualPaymentForm supabase={supabase} userId={userId} onDone={onSubmitted} />
    </div>
  );
}

// ─── Manual Payment Form (2-step flow like deposits) ─────────────────
function ManualPaymentForm({
  supabase,
  userId,
  onDone,
}: {
  supabase: ReturnType<typeof createClient>;
  userId: string;
  onDone: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedWallet, setSelectedWallet] = useState(USDT_WALLETS[1]); // Default to TRC20
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

  const goToStep2 = () => {
    setStep(2);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!txHash.trim()) { setError("Please enter the transaction hash"); return; }
    if (!proofFile) { setError("Please upload proof of payment"); return; }

    setSubmitting(true);
    setError(null);

    // Convert proof to base64 for direct database storage
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

    // Insert subscription as pending
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const { error: insertError } = await supabase.from("mc_subscriptions").insert({
      user_id: userId,
      plan_id: "signal-premium",
      status: "pending_confirmation",
      start_date: new Date().toISOString(),
      end_date: endDate.toISOString(),
      proof_data: proofData,
      tx_hash: txHash.trim(),
      amount: SIGNAL_SUBSCRIPTION_PRICE,
      payment_method: "manual",
      network: selectedWallet.id,
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

      {/* Step indicator */}
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
          step === 1
            ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
            : "bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400"
        )}>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current/10 text-[10px] font-bold">1</span>
          Payment Details
        </div>
        <div className="h-px flex-1 bg-surface-200 dark:bg-surface-700" />
        <div className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
          step === 2
            ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
            : "bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400"
        )}>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current/10 text-[10px] font-bold">2</span>
          Upload Proof
        </div>
      </div>

      {step === 1 ? (
        /* ═══ STEP 1: Select network & see payment details ═══ */
        <div className="space-y-4">
          {/* Select network */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Select Network</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {USDT_WALLETS.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setSelectedWallet(w)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                    selectedWallet.id === w.id
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                      : "border-surface-200 text-surface-600 hover:border-brand-300 dark:border-surface-700 dark:text-surface-400 dark:hover:border-brand-600"
                  )}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment details card */}
          <div className="space-y-3 rounded-xl border border-brand-200 bg-brand-50/50 p-4 dark:border-brand-800 dark:bg-brand-500/5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-500/20">
                <Copy className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-900 dark:text-white">Send {formatCurrency(SIGNAL_SUBSCRIPTION_PRICE)} USDT to this address</p>
                <p className="text-xs text-surface-500 dark:text-surface-400">{selectedWallet.label} network only</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-brand-200 bg-white p-3 dark:border-brand-800 dark:bg-surface-900">
              <p className="flex-1 break-all font-mono text-sm text-surface-900 dark:text-white">
                {selectedWallet.address || "Wallet address not configured"}
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
                <strong>Important:</strong> Only send <strong>USDT</strong> on the <strong>{selectedWallet.label}</strong> network.
                Sending other tokens or using a different network may result in loss.
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-800">
            <p className="text-sm font-medium text-surface-900 dark:text-white mb-2">Instructions:</p>
            <ol className="space-y-1.5 text-xs text-surface-600 dark:text-surface-400">
              <li className="flex gap-2"><span className="font-bold text-brand-600">1.</span> Copy the wallet address above</li>
              <li className="flex gap-2"><span className="font-bold text-brand-600">2.</span> Open your wallet or exchange (Binance, Trust Wallet, etc.)</li>
              <li className="flex gap-2"><span className="font-bold text-brand-600">3.</span> Send exactly <strong>{formatCurrency(SIGNAL_SUBSCRIPTION_PRICE)} USDT</strong> via <strong>{selectedWallet.label}</strong> network</li>
              <li className="flex gap-2"><span className="font-bold text-brand-600">4.</span> After payment is complete, click "I've Made the Payment" below</li>
              <li className="flex gap-2"><span className="font-bold text-brand-600">5.</span> Upload your proof of payment and transaction hash</li>
            </ol>
          </div>

          <div className="flex gap-3">
            <Button onClick={goToStep2} disabled={!selectedWallet.address}>
              I've Made the Payment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={onDone}>Cancel</Button>
          </div>
        </div>
      ) : (
        /* ═══ STEP 2: Enter tx hash & upload proof ═══ */
        <div className="space-y-4">
          {/* Summary of payment */}
          <div className="space-y-2 rounded-lg border border-success-200 bg-success-50 p-3 dark:border-success-800 dark:bg-success-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-success-600 dark:text-success-400">Subscription Amount</p>
                <p className="text-lg font-bold text-success-800 dark:text-success-300">{formatCurrency(SIGNAL_SUBSCRIPTION_PRICE)} USDT</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-success-600 dark:text-success-400">Plan</p>
                <p className="text-sm font-semibold text-success-800 dark:text-success-300">Premium Signals</p>
              </div>
            </div>
            <div className="flex items-center gap-4 border-t border-success-200 pt-2 dark:border-success-800">
              <div className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-success-600 dark:text-success-400" />
                <span className="text-xs text-success-700 dark:text-success-400">1-month access</span>
              </div>
              <div className="ml-auto">
                <span className="text-xs font-semibold text-success-800 dark:text-success-300">
                  {formatCurrency(SIGNAL_SUBSCRIPTION_PRICE)}/month
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Hash */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Transaction Hash</label>
            <Input
              placeholder="Enter the transaction hash from your payment"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
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
                  <p className="truncate text-sm font-medium text-surface-900 dark:text-white" title={proofFile.name}>{proofFile.name}</p>
                  <p className="text-xs text-surface-500">{(proofFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={() => { setProofFile(null); setProofPreview(null); }} className="shrink-0 rounded-md p-1.5 text-surface-400 hover:text-danger-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSubmit} disabled={submitting || !txHash.trim() || !proofFile}>
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : "Submit Payment"}
            </Button>
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button variant="outline" onClick={onDone}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
