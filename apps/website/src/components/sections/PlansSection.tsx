"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, TrendingUp, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface TierFeature {
  text: string;
  included: boolean;
}

interface Tier {
  name: string;
  minInvestment: string;
  lockPeriod: string;
  returnPct: string;
  icon: React.ElementType;
  description: string;
  features: TierFeature[];
  highlight?: boolean;
}

const tiers: Tier[] = [
  {
    name: "Standard",
    minInvestment: "$50",
    lockPeriod: "3 months",
    returnPct: "10%",
    icon: TrendingUp,
    description: "Solid returns with a short-term capital lock for flexible investing",
    features: [
      { text: "10% return on investment", included: true },
      { text: "3-month capital lock period", included: true },
      { text: "Withdraw profits anytime (min $10)", included: true },
      { text: "Automated portfolio management", included: true },
      { text: "Weekly performance reports", included: true },
      { text: "Email support", included: true },
      { text: "Dedicated account manager", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    name: "Premium",
    minInvestment: "$200",
    lockPeriod: "6 months",
    returnPct: "15%",
    icon: Shield,
    description: "Higher returns with a longer lock for committed investors",
    highlight: true,
    features: [
      { text: "15% return on investment", included: true },
      { text: "6-month capital lock period", included: true },
      { text: "Withdraw profits anytime (min $10)", included: true },
      { text: "Advanced portfolio strategy", included: true },
      { text: "Daily performance reports", included: true },
      { text: "24/7 priority support", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Exclusive market research", included: true },
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
          className="text-center mb-10"
        >
          <span className="inline-block mb-4 text-sm font-semibold tracking-wide uppercase text-brand-600">
            Investment Tiers
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-950 tracking-tight">
            Choose Your Lock Period
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Lock your capital for a fixed term and earn guaranteed returns.
            Longer lock periods unlock higher yields.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-50 px-6 py-3 text-base font-semibold text-brand-700">
            <Sparkles className="h-5 w-5" />
            <span>Up to 15% returns on locked capital</span>
          </div>
        </motion.div>

        {/* Tier cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto"
        >
          {tiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={cardVariants}
              className={cn(
                "group relative flex flex-col rounded-2xl",
                "transition-all duration-300",
                "hover:-translate-y-1",
                tier.highlight
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
              <div className="flex flex-col flex-1 p-6 sm:p-7">
                {/* Icon and name */}
                <div className="mb-4">
                  <div
                    className={cn(
                      "mb-3 h-12 w-12 rounded-xl flex items-center justify-center",
                      tier.highlight
                        ? "bg-brand-500/20"
                        : "bg-gradient-to-br from-brand-500 to-brand-600"
                    )}
                  >
                    <tier.icon
                      className={cn(
                        "h-6 w-6",
                        tier.highlight ? "text-brand-300" : "text-white"
                      )}
                    />
                  </div>
                  <h3
                    className={cn(
                      "text-xl font-bold mb-2",
                      tier.highlight ? "text-white" : "text-brand-950"
                    )}
                  >
                    {tier.name}
                  </h3>
                  <p
                    className={cn(
                      "text-sm leading-relaxed",
                      tier.highlight ? "text-slate-400" : "text-slate-600"
                    )}
                  >
                    {tier.description}
                  </p>
                </div>

                {/* Return & lock period */}
                <div
                  className={cn(
                    "mb-4 rounded-xl p-4 space-y-3",
                    tier.highlight ? "bg-white/5" : "bg-brand-50"
                  )}
                >
                  <div>
                    <div
                      className={cn(
                        "text-xs font-medium mb-1",
                        tier.highlight ? "text-slate-400" : "text-slate-600"
                      )}
                    >
                      Return on Investment
                    </div>
                    <div
                      className={cn(
                        "text-2xl font-bold",
                        tier.highlight ? "text-white" : "text-brand-950"
                      )}
                    >
                      {tier.returnPct}
                    </div>
                  </div>
                  <div>
                    <div
                      className={cn(
                        "text-xs font-medium mb-1",
                        tier.highlight ? "text-slate-400" : "text-slate-600"
                      )}
                    >
                      Capital Lock Period
                    </div>
                    <div
                      className={cn(
                        "text-lg font-bold",
                        tier.highlight ? "text-white" : "text-brand-950"
                      )}
                    >
                      {tier.lockPeriod}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "border-t pt-2 mt-1",
                      tier.highlight ? "border-white/10" : "border-slate-200"
                    )}
                  >
                    <div
                      className={cn(
                        "text-xs font-medium mb-0.5",
                        tier.highlight ? "text-slate-400" : "text-slate-600"
                      )}
                    >
                      Minimum Investment
                    </div>
                    <div
                      className={cn(
                        "text-base font-bold",
                        tier.highlight ? "text-white" : "text-brand-950"
                      )}
                    >
                      {tier.minInvestment}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6 flex-1">
                  {tier.features.map((feature) => (
                    <li
                      key={feature.text}
                      className="flex items-start gap-2.5"
                    >
                      {feature.included ? (
                        <div
                          className={cn(
                            "mt-0.5 h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0",
                            tier.highlight
                              ? "bg-brand-500/20 text-brand-300"
                              : "bg-brand-50 text-brand-600"
                          )}
                        >
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "mt-0.5 h-4 w-4 rounded-full flex-shrink-0",
                            tier.highlight ? "bg-white/5" : "bg-slate-100"
                          )}
                        />
                      )}
                      <span
                        className={cn(
                          "text-sm leading-snug",
                          !feature.included &&
                            (tier.highlight ? "text-slate-500" : "text-slate-400"),
                          feature.included &&
                            (tier.highlight ? "text-slate-300" : "text-slate-600")
                        )}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <a
                  href="/dashboard/investments/new"
                  className={cn(
                    "block w-full text-center rounded-xl px-5 py-3 text-sm font-semibold",
                    "transition-all duration-200",
                    tier.highlight
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
                  Start Investing
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Professional disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 rounded-2xl bg-slate-50 p-6 text-center"
        >
          <p className="text-xs text-slate-600 leading-relaxed max-w-4xl mx-auto">
            <strong>Important Disclosure:</strong> Investment involves risk. Returns are based on our expert management strategy and historical performance, but are not guaranteed.
            Capital is locked for the chosen term and early withdrawal may be subject to penalties. Please invest responsibly and only invest funds you can afford to have at risk.
            Our team employs sophisticated risk management techniques to protect your capital while seeking consistent returns.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
