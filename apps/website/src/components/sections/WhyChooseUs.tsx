"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  MonitorSmartphone,
  Receipt,
  HeadphonesIcon,
  ShieldCheck,
  Globe2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: BarChart3,
    title: "Expert Portfolio Management",
    description:
      "Our seasoned portfolio managers craft diversified strategies tailored to your risk profile and financial goals, leveraging deep market research.",
  },
  {
    icon: MonitorSmartphone,
    title: "Advanced Trading Technology",
    description:
      "Execute trades with our institutional-grade platform featuring real-time analytics, algorithmic strategies, and lightning-fast order routing.",
  },
  {
    icon: Receipt,
    title: "Transparent Fee Structure",
    description:
      "No hidden charges or surprises. Our competitive, clearly disclosed fee structure ensures you always know exactly what you're paying.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Customer Support",
    description:
      "Our dedicated support team is available around the clock to assist you with any questions, technical issues, or investment guidance.",
  },
  {
    icon: ShieldCheck,
    title: "Regulated & Secure",
    description:
      "Fully regulated by top-tier financial authorities with bank-grade security, segregated client funds, and comprehensive insurance coverage.",
  },
  {
    icon: Globe2,
    title: "Global Market Access",
    description:
      "Trade across 50+ global markets including equities, forex, commodities, and cryptocurrencies from a single unified account.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="relative bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section heading */}
        <motion.div
          className="mx-auto mb-16 max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-4 text-4xl font-bold text-brand-900 md:text-5xl">
            Why Choose Maverick Capital
          </h2>
          <p className="text-lg text-slate-600">
            We combine institutional expertise with cutting-edge technology to deliver an investment experience that's both powerful and accessible.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 transition-all duration-300",
                "hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/5 hover:-translate-y-1"
              )}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Icon */}
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 transition-colors group-hover:bg-brand-100">
                <feature.icon className="h-7 w-7 text-brand-600" />
              </div>

              {/* Content */}
              <h3 className="mb-3 text-xl font-semibold text-brand-900">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {feature.description}
              </p>

              {/* Decorative gradient on hover */}
              <div className="absolute -bottom-12 -right-12 h-24 w-24 rounded-full bg-brand-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
