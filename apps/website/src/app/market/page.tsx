"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Home,
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Bitcoin,
  Globe,
  CircleDollarSign,
  BarChart3,
  Activity,
  DollarSign,
  PieChart,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  TradingView Widget Components                                      */
/* ------------------------------------------------------------------ */

function TradingViewTickerTape() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "BINANCE:BTCUSDT", title: "Bitcoin" },
        { proName: "BINANCE:ETHUSDT", title: "Ethereum" },
        { proName: "BINANCE:SOLUSDT", title: "Solana" },
        { proName: "FX_IDC:EURUSD", title: "EUR/USD" },
        { proName: "FX_IDC:GBPUSD", title: "GBP/USD" },
        { proName: "TVC:GOLD", title: "Gold" },
        { proName: "FOREXCOM:NSXUSD", title: "US 100" },
        { proName: "FX_IDC:USDJPY", title: "USD/JPY" },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "en",
    });

    widgetDiv.appendChild(script);
    containerRef.current.appendChild(widgetDiv);
  }, []);

  return (
    <div className="tradingview-widget-container" ref={containerRef} />
  );
}

function TradingViewAdvancedChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartId = useRef(`tradingview_chart_${Date.now()}`);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: "BINANCE:BTCUSDT",
      interval: "D",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
      container_id: chartId.current,
    });

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div
      className="tradingview-widget-container"
      ref={containerRef}
      id={chartId.current}
      style={{ height: "500px", width: "100%" }}
    />
  );
}

function TradingViewMarketOverview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef(`tradingview_overview_${Date.now()}`);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: "dark",
      dateRange: "12M",
      showChart: true,
      locale: "en",
      largeChartUrl: "",
      isTransparent: true,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      width: "100%",
      height: "660",
      plotLineColorGrowing: "rgba(59, 130, 246, 1)",
      plotLineColorFalling: "rgba(239, 68, 68, 1)",
      gridLineColor: "rgba(255, 255, 255, 0.06)",
      scaleFontColor: "rgba(219, 219, 219, 1)",
      belowLineFillColorGrowing: "rgba(59, 130, 246, 0.12)",
      belowLineFillColorFalling: "rgba(239, 68, 68, 0.12)",
      belowLineFillColorGrowingBottom: "rgba(59, 130, 246, 0)",
      belowLineFillColorFallingBottom: "rgba(239, 68, 68, 0)",
      symbolActiveColor: "rgba(59, 130, 246, 0.12)",
      tabs: [
        {
          title: "Crypto",
          symbols: [
            { s: "BINANCE:BTCUSDT", d: "Bitcoin" },
            { s: "BINANCE:ETHUSDT", d: "Ethereum" },
            { s: "BINANCE:SOLUSDT", d: "Solana" },
            { s: "BINANCE:BNBUSDT", d: "BNB" },
            { s: "BINANCE:XRPUSDT", d: "XRP" },
          ],
          originalTitle: "Cryptocurrencies",
        },
        {
          title: "Forex",
          symbols: [
            { s: "FX_IDC:EURUSD", d: "EUR/USD" },
            { s: "FX_IDC:GBPUSD", d: "GBP/USD" },
            { s: "FX_IDC:USDJPY", d: "USD/JPY" },
            { s: "FX_IDC:AUDUSD", d: "AUD/USD" },
            { s: "FX_IDC:USDCAD", d: "USD/CAD" },
          ],
          originalTitle: "Forex",
        },
        {
          title: "Indices",
          symbols: [
            { s: "FOREXCOM:SPXUSD", d: "S&P 500" },
            { s: "FOREXCOM:NSXUSD", d: "US 100" },
            { s: "FOREXCOM:DJI", d: "Dow 30" },
            { s: "INDEX:DAX", d: "DAX" },
            { s: "INDEX:FTSE", d: "FTSE 100" },
          ],
          originalTitle: "Indices",
        },
      ],
      container_id: widgetId.current,
    });

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div
      className="tradingview-widget-container"
      ref={containerRef}
      id={widgetId.current}
      style={{ height: "660px", width: "100%" }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const marketStats = [
  {
    icon: DollarSign,
    label: "Total Market Cap",
    value: "$2.54T",
    change: "+2.4%",
    positive: true,
  },
  {
    icon: Activity,
    label: "24h Volume",
    value: "$89.7B",
    change: "+12.1%",
    positive: true,
  },
  {
    icon: PieChart,
    label: "BTC Dominance",
    value: "52.3%",
    change: "-0.8%",
    positive: false,
  },
  {
    icon: Layers,
    label: "Active Markets",
    value: "1,247",
    change: "+34",
    positive: true,
  },
];

interface MarketAsset {
  name: string;
  symbol: string;
  price: string;
  change: number;
}

interface MarketCategory {
  name: string;
  icon: React.ElementType;
  chartBars: number[];
  trend: "up" | "down";
  assets: MarketAsset[];
  accentColor: string;
}

const marketCategories: MarketCategory[] = [
  {
    name: "Crypto",
    icon: Bitcoin,
    chartBars: [40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88],
    trend: "up",
    assets: [
      { name: "Bitcoin", symbol: "BTC", price: "$67,432.18", change: 3.42 },
      { name: "Ethereum", symbol: "ETH", price: "$3,521.07", change: 2.18 },
      { name: "Solana", symbol: "SOL", price: "$172.45", change: -1.05 },
      { name: "BNB", symbol: "BNB", price: "$612.30", change: 0.87 },
    ],
    accentColor: "from-amber-400 to-orange-500",
  },
  {
    name: "Forex",
    icon: Globe,
    chartBars: [60, 55, 70, 50, 65, 45, 75, 60, 80, 55, 70, 65],
    trend: "up",
    assets: [
      { name: "EUR/USD", symbol: "EURUSD", price: "1.0842", change: 0.12 },
      { name: "GBP/USD", symbol: "GBPUSD", price: "1.2634", change: -0.08 },
      { name: "USD/JPY", symbol: "USDJPY", price: "154.28", change: 0.34 },
      { name: "AUD/USD", symbol: "AUDUSD", price: "0.6512", change: -0.21 },
    ],
    accentColor: "from-brand-400 to-brand-600",
  },
  {
    name: "Commodities",
    icon: CircleDollarSign,
    chartBars: [50, 55, 58, 52, 60, 65, 62, 70, 68, 75, 72, 80],
    trend: "up",
    assets: [
      { name: "Gold", symbol: "XAU", price: "$2,341.50", change: 1.24 },
      { name: "Silver", symbol: "XAG", price: "$27.82", change: 0.87 },
      { name: "Crude Oil", symbol: "WTI", price: "$78.45", change: -2.15 },
      { name: "Platinum", symbol: "XPT", price: "$982.30", change: 0.45 },
    ],
    accentColor: "from-yellow-400 to-amber-500",
  },
  {
    name: "Indices",
    icon: BarChart3,
    chartBars: [45, 60, 50, 70, 55, 65, 75, 60, 80, 70, 85, 78],
    trend: "up",
    assets: [
      { name: "S&P 500", symbol: "SPX", price: "5,234.18", change: 0.95 },
      { name: "NASDAQ", symbol: "NDX", price: "18,432.75", change: 1.67 },
      { name: "FTSE 100", symbol: "FTSE", price: "8,147.03", change: -0.32 },
      { name: "DAX", symbol: "DAX", price: "18,604.52", change: 0.54 },
    ],
    accentColor: "from-emerald-400 to-teal-500",
  },
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function MiniChart({
  bars,
  trend,
}: {
  bars: number[];
  trend: "up" | "down";
}) {
  const maxBar = Math.max(...bars);
  return (
    <div className="flex h-16 w-full items-end gap-[3px]">
      {bars.map((value, i) => {
        const height = (value / maxBar) * 100;
        const isLast = i === bars.length - 1;
        return (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-sm transition-all duration-300",
              isLast
                ? trend === "up"
                  ? "bg-emerald-400"
                  : "bg-red-400"
                : "bg-white/15"
            )}
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function MarketPage() {
  return (
    <div className="pt-24">
      {/* ---- Hero Banner ---- */}
      <section className="relative overflow-hidden gradient-hero py-20 sm:py-28">
        <motion.div
          className="absolute top-10 left-[10%] h-72 w-72 rounded-full bg-brand-500/10 blur-3xl"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 right-[10%] h-64 w-64 rounded-full bg-accent-500/10 blur-3xl"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 flex items-center gap-2 text-sm text-brand-300/70"
          >
            <Link
              href="/"
              className="flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <Home className="h-3.5 w-3.5" />
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white">Live Market Data</span>
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Live Market Data
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-brand-200/80 leading-relaxed">
              Stay ahead of the markets with real-time charts, live prices, and
              professional-grade data powered by TradingView.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ---- Ticker Tape ---- */}
      <section className="bg-brand-950 border-b border-white/5">
        <div className="mx-auto max-w-7xl">
          <TradingViewTickerTape />
        </div>
      </section>

      {/* ---- Market Overview Stats ---- */}
      <section className="relative py-16 sm:py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950/5 via-white to-white" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {marketStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className={cn(
                  "group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm",
                  "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-500/5"
                )}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand shadow-lg shadow-brand-500/25 transition-transform group-hover:scale-110">
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </span>
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-2xl font-bold text-brand-950 sm:text-3xl">
                    {stat.value}
                  </span>
                  <span
                    className={cn(
                      "mb-1 flex items-center gap-0.5 text-sm font-semibold",
                      stat.positive ? "text-success-500" : "text-danger-500"
                    )}
                  >
                    {stat.positive ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    {stat.change}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---- Advanced Real-Time Chart ---- */}
      <section className="relative py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-brand-950 sm:text-3xl">
                Real-Time Chart
              </h2>
              <p className="mt-2 text-slate-600">
                Interactive chart powered by TradingView. Select any symbol to
                explore price action, indicators, and more.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-brand-950 shadow-2xl shadow-brand-950/30">
              <TradingViewAdvancedChart />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---- Market Overview Widget ---- */}
      <section className="relative py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-brand-950 sm:text-3xl">
                Market Overview
              </h2>
              <p className="mt-2 text-slate-600">
                Comprehensive market data across crypto, forex, and indices with
                performance charts and key metrics.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-brand-950 shadow-2xl shadow-brand-950/30">
              <TradingViewMarketOverview />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---- Market Categories ---- */}
      <section className="relative py-20 sm:py-28">
        <div className="absolute inset-0 bg-brand-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_60%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wide text-brand-400">
              Explore
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Market Categories
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400 leading-relaxed">
              Browse top assets across major market categories. Access real-time
              data and trade with confidence.
            </p>
          </motion.div>

          {/* Category cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {marketCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
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
                <div className="mb-5 flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      "bg-gradient-to-br",
                      category.accentColor,
                      "shadow-lg"
                    )}
                  >
                    <category.icon
                      className="h-5 w-5 text-white"
                      strokeWidth={1.75}
                    />
                  </div>
                  <h3 className="text-base font-semibold text-white">
                    {category.name}
                  </h3>
                </div>

                {/* Mini chart */}
                <div className="mb-5">
                  <MiniChart
                    bars={category.chartBars}
                    trend={category.trend}
                  />
                </div>

                {/* Assets list */}
                <div className="space-y-2.5 mb-6">
                  {category.assets.map((asset) => (
                    <div
                      key={asset.symbol}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          {asset.symbol}
                        </span>
                        <span className="hidden text-xs text-slate-500 sm:inline">
                          {asset.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-300">
                          {asset.price}
                        </span>
                        <div
                          className={cn(
                            "flex items-center gap-0.5 text-xs font-medium",
                            asset.change >= 0
                              ? "text-emerald-400"
                              : "text-red-400"
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
                    </div>
                  ))}
                </div>

                {/* Link */}
                <a
                  href="/register"
                  className={cn(
                    "inline-flex items-center gap-1.5 text-sm font-medium",
                    "text-brand-400 transition-colors duration-200",
                    "hover:text-brand-300"
                  )}
                >
                  Start Trading
                  <TrendingUp className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Attribution ---- */}
      <section className="border-t border-slate-200/70 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-slate-500">
              Market data and charts provided by{" "}
              <a
                href="https://www.tradingview.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand-600 transition-colors hover:text-brand-700 underline underline-offset-2"
              >
                TradingView
              </a>
            </p>
            <p className="text-xs text-slate-400">
              TradingView widgets display real-time market data. Prices shown
              are for informational purposes and may differ from execution
              prices.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
