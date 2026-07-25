"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, Lock, Star, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { SignalsSkeleton } from "@/components/ui/PageSkeletons";

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

const riskColors: Record<string, string> = {
  low: "text-success-600 bg-success-50 dark:text-success-500 dark:bg-success-500/10",
  medium: "text-warning-600 bg-warning-50 dark:text-warning-500 dark:bg-warning-500/10",
  high: "text-danger-600 bg-danger-50 dark:text-danger-500 dark:bg-danger-500/10",
};

export default function SignalsPage() {
  const { user } = useAuth();
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Trading Signals</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Professional trading signals from our analysts</p>
        </div>
        <Button>
          <Star className="mr-2 h-4 w-4" />
          Upgrade to Pro
        </Button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setCategoryFilter("all")}
          className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            categoryFilter === "all" ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" : "text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
          )}
        >
          All
        </button>
        {/* Dynamically show categories from fetched signals */}
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
                      <span className="text-sm font-medium text-accent-700 dark:text-accent-400">Upgrade to Pro for full access</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
