"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, Lock, Star, Filter } from "lucide-react";

const mockSignals = [
  { id: "1", pair: "BTC/USDT", category: "Crypto", entry: 67500, sl: 65000, tp1: 70000, tp2: 72000, risk: "medium", analysis: "Strong bullish momentum with breakout above resistance. Volume increasing.", status: "active", isPremium: false, date: "2026-07-25" },
  { id: "2", pair: "ETH/USDT", category: "Crypto", entry: 3450, sl: 3300, tp1: 3600, tp2: 3800, risk: "low", analysis: "Consolidation phase, expecting breakout. RSI showing bullish divergence.", status: "active", isPremium: false, date: "2026-07-25" },
  { id: "3", pair: "EUR/USD", category: "Forex", entry: 1.0920, sl: 1.0880, tp1: 1.0980, tp2: 1.1020, risk: "low", analysis: "Dollar weakness supporting euro. Key support holding at 1.0900.", status: "active", isPremium: true, date: "2026-07-24" },
  { id: "4", pair: "SOL/USDT", category: "Crypto", entry: 178, sl: 168, tp1: 190, tp2: 200, risk: "high", analysis: "DeFi sector heating up. SOL showing relative strength.", status: "completed", isPremium: true, date: "2026-07-23" },
  { id: "5", pair: "GBP/JPY", category: "Forex", entry: 192.50, sl: 191.80, tp1: 193.50, tp2: 194.20, risk: "medium", analysis: "Yen weakness continues. BoJ policy divergence supporting pair.", status: "active", isPremium: true, date: "2026-07-24" },
];

const riskColors: Record<string, string> = { low: "text-success-600 bg-success-50 dark:text-success-500 dark:bg-success-500/10", medium: "text-warning-600 bg-warning-50 dark:text-warning-500 dark:bg-warning-500/10", high: "text-danger-600 bg-danger-50 dark:text-danger-500 dark:bg-danger-500/10" };

export default function SignalsPage() {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const filtered = mockSignals.filter((s) => categoryFilter === "all" || s.category.toLowerCase() === categoryFilter);

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
        {["all", "crypto", "forex"].map((c) => (
          <button key={c} onClick={() => setCategoryFilter(c)} className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-colors", categoryFilter === c ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" : "text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800")}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((signal) => (
          <Card key={signal.id} className={cn("relative", signal.isPremium && "border-accent-200 dark:border-accent-800")}>
            {signal.isPremium && (
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
                    <p className="text-xs text-surface-500">{signal.category} &middot; {signal.date}</p>
                  </div>
                </div>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", riskColors[signal.risk])}>
                  {signal.risk} risk
                </span>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="rounded-lg bg-surface-50 p-2 dark:bg-surface-800">
                  <p className="text-xs text-surface-500">Entry</p>
                  <p className="font-semibold text-surface-900 dark:text-white">{signal.entry}</p>
                </div>
                <div className="rounded-lg bg-danger-50 p-2 dark:bg-danger-500/10">
                  <p className="text-xs text-danger-600">SL</p>
                  <p className="font-semibold text-danger-700 dark:text-danger-400">{signal.sl}</p>
                </div>
                <div className="rounded-lg bg-success-50 p-2 dark:bg-success-500/10">
                  <p className="text-xs text-success-600">TP1</p>
                  <p className="font-semibold text-success-700 dark:text-success-400">{signal.tp1}</p>
                </div>
                <div className="rounded-lg bg-success-50 p-2 dark:bg-success-500/10">
                  <p className="text-xs text-success-600">TP2</p>
                  <p className="font-semibold text-success-700 dark:text-success-400">{signal.tp2}</p>
                </div>
              </div>

              <p className="mt-3 text-sm text-surface-600 dark:text-surface-400">{signal.analysis}</p>

              {signal.isPremium && (
                <div className="mt-4 flex items-center justify-center rounded-lg border border-dashed border-accent-300 bg-accent-50/50 p-3 dark:border-accent-700 dark:bg-accent-500/5">
                  <Lock className="mr-2 h-4 w-4 text-accent-600" />
                  <span className="text-sm font-medium text-accent-700 dark:text-accent-400">Upgrade to Pro for full access</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
