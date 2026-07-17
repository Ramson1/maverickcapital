"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TickerItem {
  symbol: string;
  name: string;
  price: string;
  change: number;
}

const tickerData: TickerItem[] = [
  { symbol: "BTC", name: "Bitcoin", price: "104,287.50", change: 2.34 },
  { symbol: "ETH", name: "Ethereum", price: "3,892.15", change: 1.87 },
  { symbol: "BNB", name: "BNB", price: "714.30", change: -0.54 },
  { symbol: "SOL", name: "Solana", price: "178.62", change: 4.12 },
  { symbol: "XRP", name: "Ripple", price: "2.48", change: -1.23 },
  { symbol: "ADA", name: "Cardano", price: "0.892", change: 3.05 },
  { symbol: "DOGE", name: "Dogecoin", price: "0.4127", change: -0.78 },
  { symbol: "AVAX", name: "Avalanche", price: "42.18", change: 5.67 },
];

function TickerItemComponent({ item }: { item: TickerItem }) {
  const isPositive = item.change >= 0;

  return (
    <div className="flex items-center gap-3 px-5 whitespace-nowrap">
      {/* Symbol & name */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-white">{item.symbol}</span>
        <span className="text-xs text-slate-500 hidden sm:inline">
          {item.name}
        </span>
      </div>

      {/* Price */}
      <span className="text-sm font-medium text-slate-300">
        ${item.price}
      </span>

      {/* Change */}
      <div
        className={cn(
          "flex items-center gap-0.5 text-xs font-semibold",
          isPositive ? "text-emerald-400" : "text-red-400"
        )}
      >
        {isPositive ? (
          <ArrowUpRight className="h-3 w-3" />
        ) : (
          <ArrowDownRight className="h-3 w-3" />
        )}
        {Math.abs(item.change).toFixed(2)}%
      </div>

      {/* Separator */}
      <div className="h-4 w-px bg-white/10" />
    </div>
  );
}

export function TickerSection() {
  // Duplicate the data for seamless infinite scroll
  const duplicatedData = [...tickerData, ...tickerData];

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden py-3.5",
        "bg-brand-950 border-y border-white/[0.06]"
      )}
    >
      {/* Subtle gradient overlay on edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-brand-950 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-brand-950 to-transparent pointer-events-none" />

      {/* Scrolling container */}
      <div className="animate-ticker flex">
        {duplicatedData.map((item, index) => (
          <TickerItemComponent key={`${item.symbol}-${index}`} item={item} />
        ))}
      </div>
    </div>
  );
}
