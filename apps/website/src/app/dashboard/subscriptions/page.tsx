"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import { Check, Star, Zap, Crown } from "lucide-react";

const plans = [
  { id: "basic", name: "Basic", price: 0, duration: "Forever", features: ["Free trading signals (limited)", "Basic analytics", "Email support", "Community access"], icon: Star, current: false },
  { id: "pro", name: "Pro", price: 49, duration: "Monthly", features: ["All trading signals", "Advanced analytics", "Priority support", "Web3 wallet integration", "Export reports", "Custom alerts"], icon: Zap, current: true, popular: true },
  { id: "vip", name: "VIP", price: 149, duration: "Monthly", features: ["Everything in Pro", "1-on-1 analyst access", "Custom signal requests", "API access", "Dedicated account manager", "Early access to features", "VIP Telegram group"], icon: Crown, current: false },
];

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Subscriptions</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Manage your subscription and access premium features</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card key={plan.id} className={cn("relative", plan.popular && "border-brand-500 ring-2 ring-brand-500/20")}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", plan.current ? "bg-brand-50 dark:bg-brand-500/10" : "bg-surface-100 dark:bg-surface-800")}>
                    <Icon className={cn("h-5 w-5", plan.current ? "text-brand-600 dark:text-brand-400" : "text-surface-500")} />
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-surface-900 dark:text-white">{formatCurrency(plan.price)}</span>
                  <span className="text-surface-500">/{plan.duration.toLowerCase()}</span>
                </div>
                <CardDescription>
                  {plan.current ? "Your current plan" : plan.price === 0 ? "Get started for free" : "Upgrade for more features"}
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
                <Button className="w-full" variant={plan.current ? "outline" : "default"} disabled={plan.current}>
                  {plan.current ? "Current Plan" : plan.price === 0 ? "Get Started" : "Upgrade Now"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
