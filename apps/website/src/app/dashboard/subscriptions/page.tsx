"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, cn } from "@/lib/utils";
import { Check, Star, Zap, Crown, Loader2, Copy, X, FileImage, Trash2, ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { TablePageSkeleton } from "@/components/ui/PageSkeletons";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price_usdt: number;
  duration_days: number;
  features: string[];
  signal_access: string;
}

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  start_date: string;
  end_date: string;
  tx_hash?: string;
  proof_data?: string;
  amount?: number;
}

const iconMap: Record<string, typeof Star> = {
  basic: Star,
  pro: Zap,
  vip: Crown,
};

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSub, setCurrentSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  // Wallet settings from admin
  const [subWallet, setSubWallet] = useState("");
  const [subNetwork, setSubNetwork] = useState("TRC20 (Tron)");
  const [subCurrency, setSubCurrency] = useState("USDT");

  // Payment flow state
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [payStep, setPayStep] = useState<1 | 2>(1);
  const [txHash, setTxHash] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [paySubmitting, setPaySubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data: plansData } = await supabase
        .from("mc_subscription_plans")
        .select("*")
        .order("price_usdt", { ascending: true });

      if (plansData) {
        setPlans(
          plansData.map((p) => ({
            ...p,
            price_usdt: Number(p.price_usdt),
            features: Array.isArray(p.features) ? p.features : [],
          }))
        );
      }

      const { data: subsData } = await supabase
        .from("mc_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["active", "pending_confirmation"])
        .order("created_at", { ascending: false })
        .limit(1);

      if (subsData && subsData.length > 0) {
        setCurrentSub(subsData[0]);
      }

      // Fetch platform settings
      const { data: settingsData } = await supabase.from("mc_settings").select("key, value");
      if (settingsData) {
        const map: Record<string, string> = {};
        settingsData.forEach((r) => { map[r.key] = r.value; });
        if (map.subscription_wallet_address) setSubWallet(map.subscription_wallet_address);
        if (map.subscription_network) setSubNetwork(map.subscription_network);
        if (map.subscription_currency) setSubCurrency(map.subscription_currency);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const startPayment = (plan: SubscriptionPlan) => {
    if (plan.price_usdt === 0) {
      handleFreeSubscribe(plan.id);
      return;
    }
    setSelectedPlan(plan);
    setPayStep(1);
    setTxHash("");
    setProofFile(null);
    setProofPreview(null);
    setPayError(null);
  };

  const cancelPayment = () => {
    setSelectedPlan(null);
    setPayStep(1);
    setTxHash("");
    setProofFile(null);
    setProofPreview(null);
    setPayError(null);
  };

  const copySubAddress = () => {
    navigator.clipboard.writeText(subWallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProofSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) { setPayError("Please upload a PNG, JPG, WEBP, or PDF file"); return; }
    if (file.size > 5 * 1024 * 1024) { setPayError("File must be smaller than 5MB"); return; }
    setPayError(null);
    setProofFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setProofPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setProofPreview(null);
    }
  };

  const handleFreeSubscribe = async (planId: string) => {
    if (!user) return;
    setSubscribing(planId);
    try {
      const plan = plans.find((p) => p.id === planId);
      if (!plan) return;
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.duration_days);
      if (currentSub) {
        await supabase.from("mc_subscriptions").update({ status: "cancelled" }).eq("id", currentSub.id);
      }
      await supabase.from("mc_subscriptions").insert({
        user_id: user.id, plan_id: planId, status: "active",
        start_date: new Date().toISOString(), end_date: endDate.toISOString(),
      });
      setCurrentSub({ id: "new", plan_id: planId, status: "active", start_date: new Date().toISOString(), end_date: endDate.toISOString() });
    } catch (err) { console.error("Failed to subscribe:", err);
    } finally { setSubscribing(null); }
  };

  const submitPayment = async () => {
    if (!user || !selectedPlan) return;
    if (!txHash.trim()) { setPayError("Please enter the transaction hash"); return; }
    if (!proofFile) { setPayError("Please upload proof of payment"); return; }
    setPaySubmitting(true);
    setPayError(null);

    const proofData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(proofFile);
    });

    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + selectedPlan.duration_days);

      if (currentSub) {
        await supabase.from("mc_subscriptions").update({ status: "cancelled" }).eq("id", currentSub.id);
      }

      const { data, error } = await supabase.from("mc_subscriptions").insert({
        user_id: user.id,
        plan_id: selectedPlan.id,
        amount: selectedPlan.price_usdt,
        tx_hash: txHash.trim(),
        proof_data: proofData,
        status: "pending_confirmation",
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
      }).select().single();

      if (error) { setPayError("Failed to submit payment proof. Please try again."); return; }
      if (data) setCurrentSub(data);
      cancelPayment();
    } catch (err) {
      setPayError("An unexpected error occurred");
    } finally {
      setPaySubmitting(false);
    }
  };

  if (loading) {
    return <TablePageSkeleton />;
  }

  // Payment flow overlay
  if (selectedPlan) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Subscribe to {selectedPlan.name}</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Complete your payment to activate your subscription</p>
        </div>

        {payStep === 1 ? (
          <div className="space-y-4">
            {/* Plan summary */}
            <div className="flex items-center justify-between rounded-lg border border-brand-200 bg-brand-50/50 p-4 dark:border-brand-800 dark:bg-brand-500/5">
              <div>
                <p className="text-sm font-semibold text-surface-900 dark:text-white">{selectedPlan.name} Plan</p>
                <p className="text-xs text-surface-500">{selectedPlan.duration_days === 30 ? "Monthly" : selectedPlan.duration_days === 365 ? "Yearly" : `${selectedPlan.duration_days} days`}</p>
              </div>
              <p className="text-xl font-bold text-brand-600">{formatCurrency(selectedPlan.price_usdt)} {subCurrency}</p>
            </div>

            {/* Payment details */}
            <div className="space-y-3 rounded-xl border border-brand-200 bg-brand-50/50 p-4 dark:border-brand-800 dark:bg-brand-500/5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-500/20">
                  <Copy className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-900 dark:text-white">Send {subCurrency} to this address</p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">{subNetwork} network only</p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-brand-200 bg-white p-3 dark:border-brand-800 dark:bg-surface-900">
                <p className="flex-1 break-all font-mono text-sm text-surface-900 dark:text-white">
                  {subWallet || "Wallet address not configured"}
                </p>
                <button onClick={copySubAddress} className="shrink-0 rounded-md p-2 transition-colors hover:bg-brand-100 dark:hover:bg-brand-500/20">
                  {copied ? <Check className="h-4 w-4 text-success-600" /> : <Copy className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
                </button>
              </div>

              <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-500/10">
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  <strong>Important:</strong> Only send <strong>{subCurrency}</strong> on the <strong>{subNetwork}</strong> network.
                  Sending other tokens or using a different network will result in permanent loss.
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-800">
              <p className="text-sm font-medium text-surface-900 dark:text-white mb-2">Instructions:</p>
              <ol className="space-y-1.5 text-xs text-surface-600 dark:text-surface-400">
                <li className="flex gap-2"><span className="font-bold text-brand-600">1.</span> Copy the wallet address above</li>
                <li className="flex gap-2"><span className="font-bold text-brand-600">2.</span> Send exactly <strong>{formatCurrency(selectedPlan.price_usdt)} {subCurrency}</strong> via <strong>{subNetwork}</strong> network</li>
                <li className="flex gap-2"><span className="font-bold text-brand-600">3.</span> After payment, click &quot;I&apos;ve Made the Payment&quot; below</li>
                <li className="flex gap-2"><span className="font-bold text-brand-600">4.</span> Upload your proof of payment and transaction hash</li>
              </ol>
            </div>

            {payError && (
              <div className="flex items-center gap-2 rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700 dark:border-danger-800 dark:bg-danger-500/10 dark:text-danger-400">
                <AlertCircle className="h-4 w-4 shrink-0" />{payError}
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={() => { setPayStep(2); setPayError(null); }} disabled={!subWallet}>
                I&apos;ve Made the Payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={cancelPayment}>Cancel</Button>
            </div>
          </div>
        ) : (
          /* Step 2: tx hash + proof */
          <div className="space-y-4">
            <div className="space-y-2 rounded-lg border border-success-200 bg-success-50 p-3 dark:border-success-800 dark:bg-success-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-success-600 dark:text-success-400">Payment Amount</p>
                  <p className="text-lg font-bold text-success-800 dark:text-success-300">{formatCurrency(selectedPlan.price_usdt)} {subCurrency}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-success-600 dark:text-success-400">Plan</p>
                  <p className="text-sm font-semibold text-success-800 dark:text-success-300">{selectedPlan.name}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Transaction Hash</label>
              <Input placeholder="Enter the transaction hash from your payment" value={txHash} onChange={(e) => setTxHash(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Proof of Payment</label>
              {!proofFile ? (
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-surface-300 p-6 transition-colors hover:border-brand-400 hover:bg-brand-50/50 dark:border-surface-600 dark:hover:border-brand-500 dark:hover:bg-brand-500/5">
                  <FileImage className="h-8 w-8 text-surface-400 dark:text-surface-500" />
                  <p className="text-sm font-medium text-surface-600 dark:text-surface-400">Click to upload payment receipt</p>
                  <p className="text-xs text-surface-400 dark:text-surface-500">PNG, JPG, WEBP, or PDF (max 5MB)</p>
                  <input type="file" accept=".png,.jpg,.jpeg,.webp,.pdf" className="hidden" onChange={handleProofSelect} />
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
                  <button onClick={() => setProofFile(null)} className="shrink-0 rounded-md p-1.5 text-surface-400 hover:bg-surface-200 hover:text-danger-600 dark:hover:bg-surface-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {payError && (
              <div className="flex items-center gap-2 rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700 dark:border-danger-800 dark:bg-danger-500/10 dark:text-danger-400">
                <AlertCircle className="h-4 w-4 shrink-0" />{payError}
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={submitPayment} disabled={paySubmitting || !txHash || !proofFile}>
                {paySubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : "Submit Payment"}
              </Button>
              <Button variant="outline" onClick={() => { setPayStep(1); setPayError(null); }}>
                <ArrowLeft className="mr-2 h-4 w-4" />Back
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Subscriptions</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Manage your subscription and access premium features</p>
      </div>

      {/* Current subscription status */}
      {currentSub && currentSub.status === "pending_confirmation" && (
        <div className="flex items-center gap-2 rounded-lg border border-warning-200 bg-warning-50 p-4 text-sm text-warning-700 dark:border-warning-800 dark:bg-warning-500/10 dark:text-warning-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Your subscription is pending confirmation. Our team will review your payment shortly.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans.length === 0 ? (
          <p className="col-span-3 py-8 text-center text-sm text-surface-500">No subscription plans available at the moment.</p>
        ) : (
          plans.map((plan) => {
            const isCurrent = currentSub?.plan_id === plan.id && currentSub?.status === "active";
            const Icon = iconMap[plan.name.toLowerCase()] || Star;
            const popular = plan.price_usdt > 0 && plan.price_usdt <= 100;

            return (
              <Card key={plan.id} className={cn("relative", popular && "border-brand-500 ring-2 ring-brand-500/20")}>
                {popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge>Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", isCurrent ? "bg-brand-50 dark:bg-brand-500/10" : "bg-surface-100 dark:bg-surface-800")}>
                      <Icon className={cn("h-5 w-5", isCurrent ? "text-brand-600 dark:text-brand-400" : "text-surface-500")} />
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-surface-900 dark:text-white">{formatCurrency(plan.price_usdt)}</span>
                    <span className="text-surface-500">/{plan.duration_days === 30 ? "month" : plan.duration_days === 365 ? "year" : `${plan.duration_days} days`}</span>
                  </div>
                  <CardDescription>
                    {isCurrent ? "Your current plan" : plan.price_usdt === 0 ? "Get started for free" : "Upgrade for more features"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-success-500" />
                        <span className="text-surface-600 dark:text-surface-400">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={isCurrent ? "outline" : "default"}
                    disabled={isCurrent || subscribing === plan.id}
                    onClick={() => startPayment(plan)}
                  >
                    {subscribing === plan.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isCurrent ? "Current Plan" : plan.price_usdt === 0 ? "Get Started" : "Subscribe Now"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
