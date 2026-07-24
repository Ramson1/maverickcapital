"use client";

import { motion } from "framer-motion";
import {
  Bitcoin,
  Globe,
  CircleDollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface MarketAsset {
  name: string;
  symbol: string;
  change: number;
}

interface MarketCategory {
  name: string;
  icon: React.ElementType;
  tradingViewSymbol: string;
  trend: "up" | "down";
  assets: MarketAsset[];
  accentColor: string;
}

const markets: MarketCategory[] = [
  {
    name: "Cryptocurrency",
    icon: Bitcoin,
    tradingViewSymbol: "BINANCE:BTCUSDT",
    trend: "up",
    assets: [
      { name: "Bitcoin", symbol: "BTC", change: 3.42 },
      { name: "Ethereum", symbol: "ETH", change: 2.18 },
      { name: "Solana", symbol: "SOL", change: -1.05 },
      { name: "BNB", symbol: "BNB", change: 0.87 },
    ],
    accentColor: "from-amber-400 to-orange-500",
  },
  {
    name: "Forex",
    icon: Globe,
    tradingViewSymbol: "FX:EURUSD",
    trend: "up",
    assets: [
      { name: "EUR/USD", symbol: "EURUSD", change: 0.12 },
      { name: "GBP/USD", symbol: "GBPUSD", change: -0.08 },
      { name: "USD/JPY", symbol: "USDJPY", change: 0.34 },
      { name: "AUD/USD", symbol: "AUDUSD", change: -0.21 },
    ],
    accentColor: "from-brand-400 to-brand-600",
  },
  {
    name: "Gold & Commodities",
    icon: CircleDollarSign,
    tradingViewSymbol: "TVC:GOLD",
    trend: "up",
    assets: [
      { name: "Gold", symbol: "XAU", change: 1.24 },
      { name: "Silver", symbol: "XAG", change: 0.87 },
      { name: "Crude Oil", symbol: "WTI", change: -2.15 },
      { name: "Platinum", symbol: "XPT", change: 0.45 },
    ],
    accentColor: "from-yellow-400 to-amber-500",
  },
  {
    name: "Stock Indices",
    icon: BarChart3,
    tradingViewSymbol: "FOREXCOM:SPXUSD",
    trend: "up",
    assets: [
      { name: "S&P 500", symbol: "SPX", change: 0.95 },
      { name: "NASDAQ", symbol: "NDX", change: 1.67 },
      { name: "FTSE 100", symbol: "FTSE", change: -0.32 },
      { name: "DAX", symbol: "DAX", change: 0.54 },
    ],
    accentColor: "from-emerald-400 to-teal-500",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
} as const;

function TradingViewChart({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      width: "100%",
      height: "100%",
      locale: "en",
      dateRange: "1D",
      colorTheme: "dark",
      isTransparent: true,
      autosize: true,
      largeChartUrl: "",
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [symbol]);

  return <div ref={containerRef} className="h-32 w-full" />;
}

export function MarketsSection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Dark background */}
      <div className="absolute inset-0 bg-brand-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block mb-4 text-sm font-semibold tracking-wide uppercase text-brand-400">
            Global Access
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Trade Global Markets
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Access the world's most liquid markets from a single platform.
            Real-time data, tight spreads, and institutional execution.
          </p>
        </motion.div>

        {/* Market cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {markets.map((market) => (
            <motion.div
              key={market.name}
              variants={cardVariants}
              className={cn(
                "group relative rounded-2xl p-6",
                "bg-slate-900/80 backdrop-blur-sm",
                "border border-white/[0.06]",
                "transition-all duration-300",
                "hover:border-white/10 hover:bg-slate-900",
                "hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-500/5"
              )}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center",
                    "bg-gradient-to-br",
                    market.accentColor,
                    "shadow-lg"
                  )}
                >
                  <market.icon className="h-5 w-5 text-white" strokeWidth={1.75} />
                </div>
                <h3 className="text-base font-semibold text-white">
                  {market.name}
                </h3>
              </div>

              {/* Real-time chart */}
              <div className="mb-5">
                <TradingViewChart symbol={market.tradingViewSymbol} />
              </div>

              {/* Assets list */}
              <div className="space-y-2.5 mb-6">
                {market.assets.map((asset) => (
                  <div
                    key={asset.symbol}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {asset.symbol}
                      </span>
                      <span className="text-xs text-slate-500 hidden sm:inline">
                        {asset.name}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-0.5 text-xs font-medium",
                        asset.change >= 0 ? "text-emerald-400" : "text-red-400"
                      )}
                    >
                      {asset.change >= 0 ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {Math.abs(asset.change).toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>

              {/* Link */}
              <a
                href="/market"
                className={cn(
                  "inline-flex items-center gap-1.5 text-sm font-medium",
                  "text-brand-400 transition-colors duration-200",
                  "hover:text-brand-300"
                )}
              >
                View Market
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
