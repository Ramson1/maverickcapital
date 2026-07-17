"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "How do I start investing with Maverick Capital?",
    answer:
      "Getting started is simple. Create a free account, complete the identity verification process, link your preferred funding method, and you can begin building your portfolio in minutes. Our onboarding wizard guides you through every step, and our support team is available 24/7 if you need help.",
  },
  {
    question: "What is the minimum investment amount?",
    answer:
      "Maverick Capital is designed to be accessible to all investors. You can start with as little as $100 for most of our managed portfolios. For premium and institutional-tier plans, minimums start at $10,000. There is no maximum limit, and you can add to your investment at any time.",
  },
  {
    question: "How does the withdrawal process work?",
    answer:
      "Withdrawals are processed within 1-3 business days for standard accounts. Simply navigate to your dashboard, select the amount you wish to withdraw, and choose your linked bank account. Premium members enjoy expedited processing with same-day settlement. There are no hidden fees for standard withdrawals.",
  },
  {
    question: "How secure is my investment and personal data?",
    answer:
      "Security is our top priority. Maverick Capital uses bank-grade 256-bit AES encryption, multi-factor authentication, and cold storage for digital assets. We are fully regulated and insured up to $500,000 per account through our partner custodians. Our infrastructure undergoes regular third-party security audits.",
  },
  {
    question: "Which markets and asset classes are supported?",
    answer:
      "Maverick Capital provides access to global equity markets (US, EU, Asia-Pacific), fixed income, ETFs, mutual funds, commodities, and select digital assets. Our multi-asset platform lets you build a truly diversified portfolio from a single dashboard with real-time market data across all supported instruments.",
  },
  {
    question: "What fees does Maverick Capital charge?",
    answer:
      "We believe in full transparency. Our standard management fee is 0.5% annually on assets under management, with no commission on trades. Premium plans start at 0.25% with additional benefits. There are no account opening fees, no inactivity fees, and no hidden charges. A full fee breakdown is available in your account dashboard.",
  },
  {
    question: "How can I reach customer support?",
    answer:
      "Our dedicated support team is available 24/7 via live chat, email, and phone. Premium members receive priority support with a dedicated account manager. Average response time is under 2 minutes for live chat. We also maintain a comprehensive knowledge base with tutorials, guides, and video walkthroughs.",
  },
  {
    question: "What is the account verification process?",
    answer:
      "To comply with regulatory requirements, we require identity verification during sign-up. You'll need to provide a government-issued photo ID and proof of address (utility bill or bank statement dated within 90 days). Verification is typically completed within 24 hours, and your data is encrypted and stored securely.",
  },
];

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

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative py-24 lg:py-32">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-brand-100/40 blur-3xl" />
        <div className="absolute bottom-20 left-0 h-60 w-60 rounded-full bg-accent-100/30 blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-brand-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700">
            FAQ
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-brand-950 sm:text-4xl lg:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Everything you need to know about investing with Maverick Capital.
            Can&apos;t find your answer? Reach out to our support team.
          </p>
        </motion.div>

        {/* Accordion */}
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
              isOpen={openIndex === index}
              onToggle={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
