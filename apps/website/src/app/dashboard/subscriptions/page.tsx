"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import { Check, Star, Zap, Crown, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";

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
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1);

      if (subsData && subsData.length > 0) {
        setCurrentSub(subsData[0]);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleSubscribe = async (planId: string) => {
    if (!user) return;
    setSubscribing(planId);

    try {
      const plan = plans.find((p) => p.id === planId);
      if (!plan) return;

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.duration_days);

      // Cancel current subscription if any
      if (currentSub) {
        await supabase
          .from("mc_subscriptions")
          .update({ status: "cancelled" })
          .eq("id", currentSub.id);
      }

      await supabase.from("mc_subscriptions").insert({
        user_id: user.id,
        plan_id: planId,
        status: "active",
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
      });

      setCurrentSub({
        id: "new",
        plan_id: planId,
        status: "active",
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
      });
    } catch (err) {
      console.error("Failed to subscribe:", err);
    } finally {
      setSubscribing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Subscriptions</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Manage your subscription and access premium features</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans.length === 0 ? (
          <p className="col-span-3 py-8 text-center text-sm text-surface-500">No subscription plans available at the moment.</p>
        ) : (
          plans.map((plan) => {
            const isCurrent = currentSub?.plan_id === plan.id;
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
                    onClick={() => handleSubscribe(plan.id)}
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
