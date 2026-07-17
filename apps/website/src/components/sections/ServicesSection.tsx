"use client";

import { motion } from "framer-motion";
import {
  CircleDollarSign,
  Bitcoin,
  TrendingUp,
  Globe,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const services = [
  {
    icon: CircleDollarSign,
    title: "Gold Trading",
    description:
      "Access the world's most trusted precious metal with competitive spreads and real-time execution. Build wealth through gold spot and derivative markets.",
  },
  {
    icon: Bitcoin,
    title: "Cryptocurrency Spot Trading",
    description:
      "Buy and sell 100+ digital assets instantly with deep liquidity and institutional-grade security. Trade BTC, ETH, and emerging altcoins at the best prices.",
  },
  {
    icon: TrendingUp,
    title: "Cryptocurrency Futures Trading",
    description:
      "Amplify your positions with leveraged crypto futures. Access perpetual contracts with up to 100x leverage and advanced risk management tools.",
  },
  {
    icon: Globe,
    title: "Forex Trading",
    description:
      "Trade 50+ currency pairs across major, minor, and exotic markets. Enjoy tight spreads, fast execution, and 24/5 market access.",
  },
  {
    icon: BarChart3,
    title: "Indices Trading",
    description:
      "Gain exposure to global stock indices including S&P 500, NASDAQ, and FTSE 100. Diversify your portfolio with fractional index trading.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
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

export function ServicesSection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-brand-50/40 to-white" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block mb-4 text-sm font-semibold tracking-wide uppercase text-brand-600">
            What We Offer
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-950 tracking-tight">
            Our Investment Services
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Diversify your portfolio across asset classes with institutional-grade
            tools and expert-managed strategies designed for every risk profile.
          </p>
        </motion.div>

        {/* Service cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              variants={cardVariants}
              className={cn(
                "group relative rounded-2xl p-[1px]",
                "bg-gradient-to-b from-brand-200/60 to-transparent",
                "transition-shadow duration-300",
                "hover:shadow-xl hover:shadow-brand-500/10"
              )}
            >
              <div
                className={cn(
                  "relative h-full rounded-2xl p-6 sm:p-8",
                  "bg-white/80 backdrop-blur-sm",
                  "border border-white/60",
                  "transition-all duration-300",
                  "group-hover:-translate-y-1"
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl",
                    "bg-brand-50 text-brand-600",
                    "transition-all duration-300",
                    "group-hover:bg-brand-600 group-hover:text-white",
                    "group-hover:shadow-lg group-hover:shadow-brand-600/25"
                  )}
                >
                  <service.icon className="h-6 w-6" strokeWidth={1.75} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-brand-950 mb-3">
                  {service.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm mb-5">
                  {service.description}
                </p>

                {/* Learn more link */}
                <a
                  href="/services"
                  className={cn(
                    "inline-flex items-center gap-1.5 text-sm font-medium",
                    "text-brand-600 transition-colors duration-200",
                    "hover:text-brand-700"
                  )}
                >
                  Learn More
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
