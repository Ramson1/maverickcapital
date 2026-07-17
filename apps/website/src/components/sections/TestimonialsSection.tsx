"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
  accentColor: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Maverick Capital completely transformed how I approach investing. Their expert guidance and intuitive platform helped me grow my portfolio by 34% in just one year. The transparency and real-time insights are unmatched.",
    name: "Sarah Mitchell",
    role: "Private Investor, San Francisco",
    initials: "SM",
    accentColor: "bg-brand-600",
  },
  {
    quote:
      "As a first-time investor, I was nervous about entering the market. Maverick Capital's team walked me through every step, from account setup to my first diversified portfolio. I now invest with confidence and clarity.",
    name: "David Chen",
    role: "Software Engineer, Austin",
    initials: "DC",
    accentColor: "bg-accent-500",
  },
  {
    quote:
      "The analytics dashboard and market insights on Maverick Capital are world-class. I've tried several platforms, but none offer this level of depth combined with such a clean, intuitive experience. Truly a game-changer.",
    name: "Amara Johnson",
    role: "Financial Analyst, New York",
    initials: "AJ",
    accentColor: "bg-brand-800",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
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

function StarRating() {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className="fill-accent-400 text-accent-400"
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      {/* Subtle background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-100/50 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-60 w-60 rounded-full bg-accent-100/40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-brand-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700">
            Testimonials
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-brand-950 sm:text-4xl lg:text-5xl">
            What Our Investors Say
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Hear from thousands of investors who trust Maverick Capital to grow
            and protect their wealth with confidence.
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={cardVariants}
              className={cn(
                "group relative flex flex-col rounded-2xl p-8",
                "glass shadow-glass",
                "transition-shadow duration-300 hover:shadow-xl"
              )}
            >
              {/* Quote Icon */}
              <div className="mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
                  <Quote size={20} />
                </div>
              </div>

              {/* Quote Text */}
              <p className="mb-6 flex-1 text-[15px] leading-relaxed text-slate-600">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Star Rating */}
              <div className="mb-5">
                <StarRating />
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white",
                    t.accentColor
                  )}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-950">
                    {t.name}
                  </p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
