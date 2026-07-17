"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Check,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Home,
  ArrowRight,
  TrendingUp,
  Clock,
  DollarSign,
  Shield,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

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
    roi: "8-12%",
    duration: "3 Months",
    popular: false,
    features: [
      { text: "Basic portfolio management" },
      { text: "Email support" },
      { text: "Weekly reports" },
      { text: "Access to crypto spot trading" },
      { text: "Mobile app access" },
    ],
  },
  {
    name: "Growth",
    minInvestment: "$1,000",
    maxInvestment: "$9,999",
    roi: "12-18%",
    duration: "6 Months",
    popular: true,
    features: [
      { text: "Everything in Starter" },
      { text: "Dedicated account manager" },
      { text: "Daily reports" },
      { text: "Access to all trading markets" },
      { text: "Priority support" },
      { text: "Trading signals (basic)" },
    ],
  },
  {
    name: "Professional",
    minInvestment: "$10,000",
    maxInvestment: "$49,999",
    roi: "18-25%",
    duration: "12 Months",
    popular: false,
    features: [
      { text: "Everything in Growth" },
      { text: "Advanced trading signals" },
      { text: "Forex & indices access" },
      { text: "Monthly strategy calls" },
      { text: "Custom portfolio allocation" },
      { text: "VIP support" },
    ],
  },
  {
    name: "Elite",
    minInvestment: "$50,000",
    maxInvestment: "Unlimited",
    roi: "25-35%",
    duration: "24 Months",
    popular: false,
    features: [
      { text: "Everything in Professional" },
      { text: "Personal fund manager" },
      { text: "Custom investment strategy" },
      { text: "Exclusive market insights" },
      { text: "Quarterly in-person reviews" },
      { text: "White-glove concierge service" },
    ],
  },
];

/* Comparison table data */
const comparisonFeatures = [
  { label: "Min. Investment", values: ["$100", "$1,000", "$10,000", "$50,000"] },
  { label: "Max. Investment", values: ["$999", "$9,999", "$49,999", "Unlimited"] },
  { label: "Expected ROI / month", values: ["8-12%", "12-18%", "18-25%", "25-35%"] },
  { label: "Duration", values: ["3 Months", "6 Months", "12 Months", "24 Months"] },
  { label: "Portfolio Management", values: ["Basic", "Dedicated Manager", "Custom Allocation", "Personal Fund Manager"] },
  { label: "Support Level", values: ["Email", "Priority", "VIP", "White-glove"] },
  { label: "Reports", values: ["Weekly", "Daily", "Daily + Calls", "Real-time Dashboard"] },
  { label: "Crypto Spot Trading", values: [true, true, true, true] },
  { label: "All Trading Markets", values: [false, true, true, true] },
  { label: "Trading Signals", values: [false, "Basic", "Advanced", "Advanced + Exclusive"] },
  { label: "Forex & Indices", values: [false, false, true, true] },
  { label: "Strategy Calls", values: [false, false, "Monthly", "Quarterly In-person"] },
  { label: "Mobile App Access", values: [true, true, true, true] },
  { label: "Custom Investment Strategy", values: [false, false, false, true] },
  { label: "Concierge Service", values: [false, false, false, true] },
];

/* FAQ data */
interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "How do I choose the right investment plan?",
    answer:
      "Consider your investment goals, risk tolerance, and the amount you're comfortable investing. Our Starter plan is perfect for beginners exploring managed investing, while the Growth plan suits those ready for broader market access. Professional and Elite plans are designed for serious investors seeking maximum returns and personalised service. You can always upgrade your plan as your portfolio grows.",
  },
  {
    question: "Can I switch plans after signing up?",
    answer:
      "Yes, you can upgrade your plan at any time. When you upgrade, your existing investment is carried over and the new plan terms apply from the upgrade date. Downgrades are subject to the current plan's minimum duration requirements. Contact your account manager or our support team to arrange a plan change.",
  },
  {
    question: "Are the ROI percentages guaranteed?",
    answer:
      "The ROI ranges shown are historical performance targets based on market conditions and our fund management track record. While we strive to achieve these returns, all investments carry risk and past performance is not indicative of future results. Our risk management frameworks are designed to protect capital while pursuing growth, but returns cannot be guaranteed.",
  },
  {
    question: "What happens at the end of my plan duration?",
    answer:
      "At the end of your plan duration, you can choose to withdraw your investment and returns, renew for the same plan term, or upgrade to a higher tier. We'll notify you 30 days before your plan expires so you have ample time to decide. There are no penalties for renewal or upgrade.",
  },
  {
    question: "How quickly can I withdraw my funds?",
    answer:
      "Withdrawal requests are processed within 1-3 business days for standard plans. Professional and Elite members enjoy expedited same-day processing. You can initiate a withdrawal from your dashboard at any time. Early withdrawals before the minimum plan duration may be subject to a small exit fee, detailed in your plan agreement.",
  },
  {
    question: "Is my investment protected?",
    answer:
      "Maverick Capital employs institutional-grade security measures including 256-bit AES encryption, cold storage for digital assets, and multi-factor authentication. We are fully regulated and maintain insurance coverage through our partner custodians. Your investments are further protected by our diversified risk management approach and regular third-party audits.",
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

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
} as const;

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-300",
        isOpen
          ? "border-brand-200 bg-brand-50/50 shadow-sm"
          : "border-slate-200/70 bg-white hover:border-slate-300"
      )}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={isOpen}
      >
        <span
          className={cn(
            "text-[15px] font-semibold transition-colors sm:text-base",
            isOpen ? "text-brand-800" : "text-slate-800"
          )}
        >
          {item.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors",
            isOpen ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"
          )}
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5">
              <div
                className={cn(
                  "mb-3 h-px w-full",
                  isOpen ? "bg-brand-200" : "bg-transparent"
                )}
              />
              <p className="text-[15px] leading-relaxed text-slate-600">
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="mx-auto h-4 w-4 text-success-500" strokeWidth={3} />
    ) : (
      <span className="text-slate-300">&mdash;</span>
    );
  }
  return <span className="text-sm font-medium text-slate-700">{value}</span>;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PlansPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <div className="pt-24">
      {/* ---- Hero Banner ---- */}
      <section className="relative overflow-hidden gradient-hero py-20 sm:py-28">
        {/* Decorative orbs */}
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
            <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-white">
              <Home className="h-3.5 w-3.5" />
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white">Investment Plans</span>
          </motion.nav>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Investment Plans
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-brand-200/80 leading-relaxed">
              Choose the plan that aligns with your financial goals. From
              beginner-friendly options to elite-tier wealth management, every
              plan includes expert oversight and transparent reporting.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ---- Plan Cards ---- */}
      <section className="relative py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-brand-50/30 to-white" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wide text-brand-600">
              Pricing
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-brand-950 sm:text-4xl">
              Find Your Perfect Plan
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 leading-relaxed">
              Every plan includes expert portfolio management, transparent
              reporting, and access to our secure trading platform.
            </p>
          </motion.div>

          {/* Cards grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-5"
          >
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={cardVariants}
                className={cn(
                  "group relative flex flex-col rounded-2xl transition-all duration-300 hover:-translate-y-1",
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
                  {/* Plan name badge */}
                  <h3
                    className={cn(
                      "text-lg font-semibold mb-1",
                      plan.popular ? "text-brand-300" : "text-brand-600"
                    )}
                  >
                    {plan.name} Plan
                  </h3>

                  {/* ROI highlight */}
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
                      per month
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
                    <div className="flex items-center justify-between text-sm">
                      <span className={cn("flex items-center gap-1.5", plan.popular ? "text-slate-400" : "text-slate-500")}>
                        <DollarSign className="h-3.5 w-3.5" />
                        Min. Investment
                      </span>
                      <span className={cn("font-semibold", plan.popular ? "text-white" : "text-brand-950")}>
                        {plan.minInvestment}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={cn("flex items-center gap-1.5", plan.popular ? "text-slate-400" : "text-slate-500")}>
                        <TrendingUp className="h-3.5 w-3.5" />
                        Max. Investment
                      </span>
                      <span className={cn("font-semibold", plan.popular ? "text-white" : "text-brand-950")}>
                        {plan.maxInvestment}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={cn("flex items-center gap-1.5", plan.popular ? "text-slate-400" : "text-slate-500")}>
                        <Clock className="h-3.5 w-3.5" />
                        Duration
                      </span>
                      <span className={cn("font-semibold", plan.popular ? "text-white" : "text-brand-950")}>
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
                  <ul className="mb-7 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-2.5">
                        <div
                          className={cn(
                            "mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full",
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
                  <Link
                    href="/register"
                    className={cn(
                      "block w-full rounded-xl px-5 py-3 text-center text-sm font-semibold transition-all duration-200",
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
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---- Comparison Table ---- */}
      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-14 text-center"
          >
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wide text-brand-600">
              Compare
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-brand-950 sm:text-4xl">
              Plan Comparison
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 leading-relaxed">
              See exactly what each plan includes so you can make the best
              decision for your investment journey.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          >
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-brand-50/50">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Feature
                  </th>
                  {plans.map((plan) => (
                    <th key={plan.name} className="px-6 py-4 text-center">
                      <span
                        className={cn(
                          "text-sm font-bold",
                          plan.popular ? "text-brand-600" : "text-brand-950"
                        )}
                      >
                        {plan.name}
                      </span>
                      {plan.popular && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                          Popular
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, idx) => (
                  <tr
                    key={feature.label}
                    className={cn(
                      "border-b border-slate-50 transition-colors hover:bg-brand-50/30",
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                    )}
                  >
                    <td className="px-6 py-3.5 text-sm font-medium text-slate-700">
                      {feature.label}
                    </td>
                    {feature.values.map((val, i) => (
                      <td key={i} className="px-6 py-3.5 text-center">
                        <CellValue value={val} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ---- FAQ Section ---- */}
      <section className="relative py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-brand-100/40 blur-3xl" />
          <div className="absolute bottom-20 left-0 h-60 w-60 rounded-full bg-accent-100/30 blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="mb-14 text-center"
          >
            <span className="mb-4 inline-block rounded-full bg-brand-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700">
              FAQ
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-brand-950 sm:text-4xl">
              Plans FAQ
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Everything you need to know about our investment plans.
              Can&apos;t find your answer?{" "}
              <Link href="/contact" className="font-medium text-brand-600 hover:text-brand-700 underline underline-offset-2">
                Reach out to us
              </Link>
              .
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-3"
          >
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                item={item}
                isOpen={openFaqIndex === index}
                onToggle={() =>
                  setOpenFaqIndex(openFaqIndex === index ? null : index)
                }
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---- CTA Section ---- */}
      <section className="relative overflow-hidden gradient-hero py-24 lg:py-32">
        {/* Decorative orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-brand-600/30 blur-3xl" />
          <div className="absolute -right-20 top-1/3 h-60 w-60 rounded-full bg-accent-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="mb-6 inline-block rounded-full border border-white/15 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-brand-200 backdrop-blur-sm">
              Start Today
            </span>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Ready to Grow Your{" "}
              <span className="text-gradient-gold">Wealth</span>?
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-brand-200/80">
              Join thousands of investors who trust Maverick Capital. Open your
              free account in minutes and start building your portfolio with
              expert-managed investment plans.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className={cn(
                  "group inline-flex items-center gap-2.5 rounded-xl bg-white px-8 py-4 text-sm font-semibold text-brand-800",
                  "shadow-lg shadow-black/10 transition-all duration-300",
                  "hover:bg-brand-50 hover:shadow-xl hover:shadow-black/15"
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
                  "hover:border-white/50 hover:bg-white/10"
                )}
              >
                <MessageCircle size={18} />
                Talk to an Advisor
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-brand-300/70">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
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
