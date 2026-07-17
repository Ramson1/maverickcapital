"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ChevronRight,
  Check,
  ArrowRight,
  Coins,
  Bitcoin,
  TrendingUp,
  Banknote,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  accent: string; // gradient classes for the icon bg
  iconBg: string; // light bg for icon in feature list
}

const services: Service[] = [
  {
    icon: Coins,
    title: "Gold Trading",
    description:
      "Trade physical and digital gold with real-time pricing on our secure platform. Whether you are hedging against inflation or diversifying your portfolio, Maverick Capital gives you direct access to one of the world's most trusted asset classes with institutional-grade execution.",
    features: [
      "Real-time gold pricing",
      "Physical & digital gold options",
      "Secure vault storage partnerships",
      "Low spreads",
      "Expert gold market analysis",
    ],
    accent: "from-accent-400 to-accent-600",
    iconBg: "bg-accent-50",
  },
  {
    icon: Bitcoin,
    title: "Cryptocurrency Spot Trading",
    description:
      "Buy and sell major cryptocurrencies instantly with deep liquidity and tight spreads. Our platform supports a wide range of digital assets, from blue-chip tokens to emerging altcoins, giving you the flexibility to build a diversified crypto portfolio with confidence.",
    features: [
      "50+ trading pairs",
      "Instant execution",
      "Cold storage security",
      "Advanced charting tools",
      "24/7 market access",
    ],
    accent: "from-brand-500 to-brand-700",
    iconBg: "bg-brand-50",
  },
  {
    icon: TrendingUp,
    title: "Cryptocurrency Futures Trading",
    description:
      "Leverage your crypto positions with our professional futures contracts. Access multiple expiry dates, flexible leverage options, and sophisticated risk management tools designed for experienced traders who want to maximize their market exposure with precision.",
    features: [
      "Up to 100x leverage",
      "Advanced order types",
      "Risk management tools",
      "Real-time liquidation alerts",
      "Professional trading interface",
    ],
    accent: "from-brand-600 to-brand-800",
    iconBg: "bg-brand-50",
  },
  {
    icon: Banknote,
    title: "Forex Trading",
    description:
      "Trade major and minor currency pairs with some of the tightest spreads in the industry. Our forex platform combines lightning-fast execution with powerful analytical tools, helping you capitalize on global currency movements whether you are a seasoned trader or just getting started.",
    features: [
      "40+ currency pairs",
      "Tight spreads from 0.1 pips",
      "Multiple leverage options",
      "Economic calendar integration",
      "Expert forex analysis",
    ],
    accent: "from-emerald-500 to-emerald-700",
    iconBg: "bg-emerald-50",
  },
  {
    icon: BarChart3,
    title: "Indices Trading",
    description:
      "Invest in global stock indices and gain diversified exposure to the world's leading economies. From the S&P 500 to the FTSE 100, our indices trading platform lets you participate in broad market movements with professional risk management and in-depth research.",
    features: [
      "S&P 500, NASDAQ, FTSE & more",
      "Diversified exposure",
      "Low minimum investment",
      "Professional risk management",
      "Market research reports",
    ],
    accent: "from-violet-500 to-violet-700",
    iconBg: "bg-violet-50",
  },
];

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
} as const;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ServicesPage() {
  return (
    <div className="pt-24">
      {/* ===== Hero Banner ===== */}
      <section className="relative overflow-hidden gradient-hero py-24 lg:py-32">
        {/* Decorative blurs */}
        <motion.div
          className="absolute top-10 left-[10%] h-72 w-72 rounded-full bg-brand-500/10 blur-3xl"
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 right-[10%] h-80 w-80 rounded-full bg-accent-500/10 blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
          {/* Breadcrumb */}
          <motion.nav
            className="mb-8 flex items-center justify-center gap-2 text-sm text-brand-300/70"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">Services</span>
          </motion.nav>

          <motion.h1
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            Our Investment{" "}
            <span className="text-gradient">Services</span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-2xl text-lg text-brand-200/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Comprehensive trading solutions across gold, cryptocurrency, forex,
            and global indices -- all on one powerful platform.
          </motion.p>
        </div>
      </section>

      {/* ===== Intro ===== */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.p
            className="text-lg leading-relaxed text-slate-600 lg:text-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
          >
            At Maverick Capital, we offer a comprehensive suite of trading
            services designed to meet the needs of every investor -- from
            beginners taking their first steps in the markets to seasoned
            professionals executing complex strategies. Our platform combines
            institutional-grade technology with intuitive design, so you can
            focus on what matters: growing your wealth.
          </motion.p>
        </div>
      </section>

      {/* ===== Service Sections ===== */}
      {services.map((service, serviceIndex) => {
        const isEven = serviceIndex % 2 === 0;

        return (
          <section
            key={service.title}
            className={cn(
              "py-16 lg:py-24",
              serviceIndex % 2 !== 0 && "bg-slate-50",
            )}
          >
            <div className="mx-auto max-w-7xl px-6">
              <div
                className={cn(
                  "grid items-center gap-12 lg:grid-cols-2 lg:gap-20",
                  !isEven && "lg:[direction:rtl]",
                )}
              >
                {/* Text side */}
                <motion.div
                  className={cn(!isEven && "lg:[direction:ltr]")}
                  initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Icon + Title */}
                  <div className="mb-6 flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg transition-transform hover:scale-110",
                        service.accent,
                      )}
                    >
                      <service.icon className="h-7 w-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-brand-950 sm:text-3xl">
                      {service.title}
                    </h2>
                  </div>

                  {/* Description */}
                  <p className="mb-8 text-lg leading-relaxed text-slate-600">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="mb-8 space-y-3">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                            service.iconBg,
                          )}
                        >
                          <Check
                            className="h-3.5 w-3.5 text-brand-600"
                            strokeWidth={3}
                          />
                        </span>
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href="/register"
                    className={cn(
                      "group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-br px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:brightness-110",
                      service.accent,
                    )}
                  >
                    Get Started
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </Link>
                </motion.div>

                {/* Visual side -- decorative card */}
                <motion.div
                  className={cn(!isEven && "lg:[direction:ltr]")}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, delay: 0.15 }}
                >
                  <div
                    className={cn(
                      "relative overflow-hidden rounded-3xl bg-gradient-to-br p-10 shadow-2xl lg:p-14",
                      service.accent,
                    )}
                  >
                    {/* Grid pattern overlay */}
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage:
                          "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                      }}
                    />
                    <div className="relative flex flex-col items-center justify-center text-center">
                      <service.icon className="mb-6 h-20 w-20 text-white/80" />
                      <p className="text-2xl font-bold text-white">
                        {service.title}
                      </p>
                      <p className="mt-2 text-sm text-white/70">
                        Professional-Grade Trading
                      </p>

                      {/* Feature count badge */}
                      <div className="mt-8 rounded-xl bg-white/10 px-6 py-4 backdrop-blur-sm">
                        <p className="text-3xl font-bold text-white">
                          {service.features.length}+
                        </p>
                        <p className="text-xs text-white/70">Key Features</p>
                      </div>
                    </div>
                  </div>
                  {/* Accent decoration */}
                  <div
                    className={cn(
                      "absolute -bottom-4 -right-4 h-24 w-24 rounded-2xl blur-xl opacity-20",
                      service.accent,
                    )}
                  />
                </motion.div>
              </div>
            </div>
          </section>
        );
      })}

      {/* ===== Bottom CTA ===== */}
      <section className="relative overflow-hidden gradient-hero py-20 lg:py-28">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-brand-600/30 blur-3xl" />
          <div className="absolute -right-20 top-1/3 h-60 w-60 rounded-full bg-accent-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="mb-6 inline-block rounded-full border border-white/15 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-brand-200 backdrop-blur-sm">
              Start Today
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Ready to Start{" "}
              <span className="text-gradient-gold">Trading?</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-brand-200/80">
              Open your Maverick Capital account in minutes and get instant
              access to all our trading services. No hidden fees, no
              complications -- just powerful tools to help you grow.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className={cn(
                  "group inline-flex items-center gap-2.5 rounded-xl bg-white px-8 py-4 text-sm font-semibold text-brand-800",
                  "shadow-lg shadow-black/10 transition-all duration-300",
                  "hover:bg-brand-50 hover:shadow-xl hover:shadow-black/15",
                )}
              >
                Create Free Account
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </Link>
              <Link
                href="/contact"
                className={cn(
                  "inline-flex items-center gap-2.5 rounded-xl border-2 border-white/30 px-8 py-4 text-sm font-semibold text-white",
                  "backdrop-blur-sm transition-all duration-300",
                  "hover:border-white/50 hover:bg-white/10",
                )}
              >
                Talk to an Expert
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-brand-300/70">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-success-500" />
                Bank-grade Security
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-success-500" />
                No Hidden Fees
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-success-500" />
                24/7 Support
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-success-500" />
                Fully Regulated
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
