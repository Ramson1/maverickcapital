"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  min_amount: number;
  max_amount: number | null;
  expected_return_pct: number;
  duration_days: number;
}

export default function NewInvestmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingPlans, setFetchingPlans] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await supabase
        .from("mc_investment_plans")
        .select("*")
        .eq("status", "active")
        .order("min_amount", { ascending: true });

      if (!error && data) {
        setPlans(
          data.map((p) => ({
            ...p,
            min_amount: Number(p.min_amount),
            max_amount: p.max_amount ? Number(p.max_amount) : null,
            expected_return_pct: Number(p.expected_return_pct),
          }))
        );
      }
      setFetchingPlans(false);
    };

    fetchPlans();
  }, [supabase]);

  const plan = plans.find((p) => p.id === selectedPlan);
  const numAmount = parseFloat(amount) || 0;

  const handleCreate = async () => {
    if (!plan || !user) return;
    setLoading(true);

    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.duration_days);

      // Create the investment
      const { data: investment, error: invError } = await supabase
        .from("mc_investments")
        .insert({
          user_id: user.id,
          plan_id: plan.id,
          amount: numAmount,
          current_value: numAmount,
          status: "pending",
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
        })
        .select()
        .single();

      if (invError) throw invError;

      // Create corresponding transaction
      await supabase.from("mc_transactions").insert({
        user_id: user.id,
        type: "investment",
        amount: numAmount,
        currency: "USDT",
        reference_id: investment.id,
        status: "completed",
        description: `Investment in ${plan.name}`,
      });

      router.push("/dashboard/investments");
    } catch (err) {
      console.error("Failed to create investment:", err);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingPlans) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="rounded-lg p-2 hover:bg-surface-100 dark:hover:bg-surface-800">
          <ArrowLeft className="h-5 w-5 text-surface-600 dark:text-surface-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">New Investment</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Choose a plan and start investing</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
              step >= s ? "bg-brand-600 text-white" : "bg-surface-200 text-surface-500 dark:bg-surface-700 dark:text-surface-400"
            )}>
              {step > s ? <Check className="h-4 w-4" /> : s}
            </div>
            <span className={cn("text-sm", step >= s ? "text-surface-900 dark:text-white" : "text-surface-500")}>
              {s === 1 ? "Select Plan" : s === 2 ? "Enter Amount" : "Confirm"}
            </span>
            {s < 3 && <div className="h-px w-8 bg-surface-200 dark:bg-surface-700" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {plans.length === 0 ? (
            <p className="col-span-2 py-8 text-center text-sm text-surface-500">No investment plans available at the moment.</p>
          ) : (
            plans.map((p) => (
              <Card
                key={p.id}
                className={cn(
                  "cursor-pointer transition-all hover:border-brand-300 dark:hover:border-brand-700",
                  selectedPlan === p.id && "border-brand-500 ring-2 ring-brand-500/20"
                )}
                onClick={() => { setSelectedPlan(p.id); setStep(2); }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{p.name}</CardTitle>
                    <Badge>{p.expected_return_pct}% Return</Badge>
                  </div>
                  <CardDescription>{p.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-surface-500 dark:text-surface-400">Min</p>
                      <p className="font-semibold text-surface-900 dark:text-white">{formatCurrency(p.min_amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-surface-500 dark:text-surface-400">Max</p>
                      <p className="font-semibold text-surface-900 dark:text-white">
                        {p.max_amount ? formatCurrency(p.max_amount) : "No limit"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-surface-500 dark:text-surface-400">Duration</p>
                      <p className="font-semibold text-surface-900 dark:text-white">{p.duration_days} days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {step === 2 && plan && (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Enter Investment Amount</CardTitle>
            <CardDescription>
              Min: {formatCurrency(plan.min_amount)}
              {plan.max_amount ? ` - Max: ${formatCurrency(plan.max_amount)}` : " (no maximum)"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Amount (USDT)</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={plan.min_amount}
                max={plan.max_amount || undefined}
              />
              {numAmount > 0 && numAmount < plan.min_amount && (
                <p className="text-xs text-danger-600">Minimum amount is {formatCurrency(plan.min_amount)}</p>
              )}
              {plan.max_amount && numAmount > plan.max_amount && (
                <p className="text-xs text-danger-600">Maximum amount is {formatCurrency(plan.max_amount)}</p>
              )}
            </div>
            <div className="rounded-lg bg-surface-50 p-4 dark:bg-surface-800">
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Expected Return</span>
                <span className="font-semibold text-success-600">{plan.expected_return_pct}%</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-surface-500">Estimated Profit</span>
                <span className="font-semibold text-success-600">
                  {formatCurrency(numAmount * plan.expected_return_pct / 100)}
                </span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-surface-500">Duration</span>
                <span className="font-semibold">{plan.duration_days} days</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button
                onClick={() => setStep(3)}
                disabled={numAmount < plan.min_amount || (plan.max_amount ? numAmount > plan.max_amount : false)}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && plan && (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Confirm Investment</CardTitle>
            <CardDescription>Review your investment details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-surface-200 p-4 dark:border-surface-700">
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-surface-500">Plan</span><span className="font-medium">{plan.name}</span></div>
                <div className="flex justify-between"><span className="text-surface-500">Amount</span><span className="font-medium">{formatCurrency(numAmount)}</span></div>
                <div className="flex justify-between"><span className="text-surface-500">Expected Return</span><span className="font-medium text-success-600">{plan.expected_return_pct}%</span></div>
                <div className="flex justify-between"><span className="text-surface-500">Duration</span><span className="font-medium">{plan.duration_days} days</span></div>
                <div className="border-t border-surface-200 pt-3 dark:border-surface-700">
                  <div className="flex justify-between"><span className="font-medium">Estimated Profit</span><span className="font-bold text-success-600">{formatCurrency(numAmount * plan.expected_return_pct / 100)}</span></div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleCreate} disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Confirm Investment"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
