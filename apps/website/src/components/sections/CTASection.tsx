"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const floatingElements = [
  {
    className:
      "absolute top-12 left-[10%] h-16 w-16 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10",
    delay: 0,
    duration: 6,
  },
  {
    className:
      "absolute bottom-16 right-[12%] h-12 w-12 rounded-full bg-accent-400/10 backdrop-blur-sm border border-accent-400/20",
    delay: 1,
    duration: 7,
  },
  {
    className:
      "absolute top-1/3 right-[8%] h-8 w-8 rounded-lg bg-brand-400/10 backdrop-blur-sm border border-brand-400/15",
    delay: 2,
    duration: 5,
  },
  {
    className:
      "absolute bottom-1/4 left-[15%] h-10 w-10 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10",
    delay: 0.5,
    duration: 8,
  },
  {
    className:
      "absolute top-20 right-[30%] h-6 w-6 rounded-full bg-accent-300/10 border border-accent-300/15",
    delay: 1.5,
    duration: 6.5,
  },
];

export function CTASection() {
  return (
    <section className="relative overflow-hidden gradient-hero py-24 lg:py-32">
      {/* Decorative floating elements */}
      {floatingElements.map((el, i) => (
        <motion.div
          key={i}
          className={cn(el.className, "animate-float")}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: el.delay, duration: 0.6 }}
          style={{
            animationDelay: `${el.delay}s`,
            animationDuration: `${el.duration}s`,
          }}
        />
      ))}

      {/* Gradient orbs */}
      <div className="pointer-events-none absolute inset-0 -z-0">
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
          {/* Badge */}
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-6 inline-block rounded-full border border-white/15 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-brand-200 backdrop-blur-sm"
          >
            Join 50,000+ Investors
          </motion.span>

          {/* Heading */}
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ready to Start Your{" "}
            <span className="text-gradient-gold">Investment Journey</span>?
          </h2>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-brand-200/80">
            Join thousands of investors who trust Maverick Capital to build,
            grow, and protect their wealth. Open your free account in minutes
            and access world-class investment tools.
          </p>

          {/* CTA Buttons */}
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
              Contact Us
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
  );
}
