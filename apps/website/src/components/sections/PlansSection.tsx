"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanFeature {
  text: string;
}

interface Plan {
  name: string;
  minInvestment: string;
  maxInvestment: string;
  roi: string;
  duration: string;
  features: PlanFeature[];
  popular: boolean;
}

const plans: Plan[] = [
  {
    name: "Starter",
    minInvestment: "$100",
    maxInvestment: "$999",
    roi: "8 - 12%",
    duration: "3 Months",
    popular: false,
    features: [
      { text: "Diversified portfolio allocation" },
      { text: "Weekly performance reports" },
      { text: "Email support" },
      { text: "Basic risk management" },
      { text: "Monthly rebalancing" },
    ],
  },
  {
    name: "Growth",
    minInvestment: "$1,000",
    maxInvestment: "$9,999",
    roi: "12 - 18%",
    duration: "6 Months",
    popular: false,
    features: [
      { text: "Multi-asset strategy" },
      { text: "Bi-weekly performance reports" },
      { text: "Priority email & chat support" },
      { text: "Advanced risk management" },
      { text: "Bi-weekly rebalancing" },
      { text: "Market alerts & insights" },
    ],
  },
  {
    name: "Professional",
    minInvestment: "$10,000",
    maxInvestment: "$49,999",
    roi: "18 - 25%",
    duration: "12 Months",
    popular: true,
    features: [
      { text: "Algorithmic trading strategies" },
      { text: "Daily performance reports" },
      { text: "Dedicated account manager" },
      { text: "Institutional risk controls" },
      { text: "Daily rebalancing" },
      { text: "Exclusive market research" },
      { text: "Tax optimization guidance" },
    ],
  },
  {
    name: "Elite",
    minInvestment: "$50,000",
    maxInvestment: "Unlimited",
    roi: "25 - 35%",
    duration: "24 Months",
    popular: false,
    features: [
      { text: "Bespoke portfolio management" },
      { text: "Real-time performance dashboard" },
      { text: "24/7 VIP support line" },
      { text: "Hedge-fund grade risk models" },
      { text: "Continuous optimization" },
      { text: "Private market access" },
      { text: "Quarterly strategy sessions" },
      { text: "Priority withdrawal processing" },
    ],
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

export function PlansSection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-brand-50/30 to-white" />

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
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-950 tracking-tight">
            Investment Plans
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Choose a plan that aligns with your financial goals. Every plan
            includes expert portfolio management and transparent reporting.
          </p>
        </motion.div>

        {/* Plan cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              className={cn(
                "group relative flex flex-col rounded-2xl",
                "transition-all duration-300",
                "hover:-translate-y-1",
                plan.popular
                  ? [
                      "bg-brand-950 text-white",
                      "shadow-2xl shadow-brand-600/20",
                      "ring-2 ring-brand-500",
                      "lg:scale-[1.03]",
                    ]
                  : [
                      "bg-white",
                      "border border-slate-200/80",
                      "shadow-sm",
                      "hover:shadow-xl hover:shadow-brand-500/5 hover:border-brand-200",
                    ]
              )}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5",
                      "bg-gradient-to-r from-brand-500 to-brand-600",
                      "text-xs font-semibold text-white",
                      "shadow-lg shadow-brand-500/30"
                    )}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex flex-col flex-1 p-6 sm:p-7">
                {/* Plan name */}
                <h3
                  className={cn(
                    "text-lg font-semibold mb-1",
                    plan.popular ? "text-brand-300" : "text-brand-600"
                  )}
                >
                  {plan.name}
                </h3>

                {/* ROI */}
                <div className="mb-4">
                  <span
                    className={cn(
                      "text-3xl font-bold tracking-tight",
                      plan.popular ? "text-white" : "text-brand-950"
                    )}
                  >
                    {plan.roi}
                  </span>
                  <span
                    className={cn(
                      "ml-1.5 text-sm",
                      plan.popular ? "text-slate-400" : "text-slate-500"
                    )}
                  >
                    expected ROI
                  </span>
                </div>

                {/* Divider */}
                <div
                  className={cn(
                    "h-px w-full mb-4",
                    plan.popular ? "bg-white/10" : "bg-slate-100"
                  )}
                />

                {/* Investment details */}
                <div className="space-y-2.5 mb-5">
                  <div className="flex justify-between text-sm">
                    <span
                      className={
                        plan.popular ? "text-slate-400" : "text-slate-500"
                      }
                    >
                      Min. Investment
                    </span>
                    <span
                      className={cn(
                        "font-semibold",
                        plan.popular ? "text-white" : "text-brand-950"
                      )}
                    >
                      {plan.minInvestment}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span
                      className={
                        plan.popular ? "text-slate-400" : "text-slate-500"
                      }
                    >
                      Max. Investment
                    </span>
                    <span
                      className={cn(
                        "font-semibold",
                        plan.popular ? "text-white" : "text-brand-950"
                      )}
                    >
                      {plan.maxInvestment}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span
                      className={
                        plan.popular ? "text-slate-400" : "text-slate-500"
                      }
                    >
                      Duration
                    </span>
                    <span
                      className={cn(
                        "font-semibold",
                        plan.popular ? "text-white" : "text-brand-950"
                      )}
                    >
                      {plan.duration}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div
                  className={cn(
                    "h-px w-full mb-5",
                    plan.popular ? "bg-white/10" : "bg-slate-100"
                  )}
                />

                {/* Features */}
                <ul className="space-y-3 mb-7 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-2.5">
                      <div
                        className={cn(
                          "mt-0.5 h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0",
                          plan.popular
                            ? "bg-brand-500/20 text-brand-300"
                            : "bg-brand-50 text-brand-600"
                        )}
                      >
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </div>
                      <span
                        className={cn(
                          "text-sm leading-snug",
                          plan.popular ? "text-slate-300" : "text-slate-600"
                        )}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <a
                  href={`/plans/${plan.name.toLowerCase()}`}
                  className={cn(
                    "block w-full text-center rounded-xl px-5 py-3 text-sm font-semibold",
                    "transition-all duration-200",
                    plan.popular
                      ? [
                          "bg-white text-brand-950",
                          "hover:bg-brand-50",
                          "shadow-lg shadow-white/10",
                        ]
                      : [
                          "bg-brand-600 text-white",
                          "hover:bg-brand-700",
                          "shadow-sm",
                          "hover:shadow-md hover:shadow-brand-600/20",
                        ]
                  )}
                >
                  Get Started
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
