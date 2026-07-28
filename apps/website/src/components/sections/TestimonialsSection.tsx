"use client";

import { motion } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
  accentColor: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Maverick Capital completely transformed how I approach investing. Their expert guidance helped me grow my portfolio significantly. The transparency and real-time insights are unmatched.",
    name: "Sarah Mitchell",
    role: "Private Investor, San Francisco",
    initials: "SM",
    accentColor: "bg-brand-600",
    rating: 5,
  },
  {
    quote:
      "As a first-time investor, I was nervous about entering the market. The team walked me through every step. I now invest with confidence and clarity. Very satisfied overall.",
    name: "David Chen",
    role: "Software Engineer, Austin",
    initials: "DC",
    accentColor: "bg-accent-500",
    rating: 5,
  },
  {
    quote:
      "The analytics dashboard and market insights are world-class. I've tried several platforms, but none offer this level of depth. A solid choice for serious investors.",
    name: "Amara Johnson",
    role: "Financial Analyst, New York",
    initials: "AJ",
    accentColor: "bg-brand-800",
    rating: 4,
  },
  {
    quote:
      "Good platform with consistent returns. The 10% monthly target is ambitious but they've delivered so far. Customer support could be faster during peak times.",
    name: "Andreas Georgiou",
    role: "Business Owner, Nicosia",
    initials: "AG",
    accentColor: "bg-emerald-600",
    rating: 4,
  },
  {
    quote:
      "I've been investing for 6 months now and the results have been positive. The interface is clean and easy to use. Withdrawals are processed quickly which I appreciate.",
    name: "Elena Christou",
    role: "Teacher, Limassol",
    initials: "EC",
    accentColor: "bg-purple-600",
    rating: 5,
  },
  {
    quote:
      "Decent platform but I wish there were more educational resources for beginners. The returns are good but the learning curve was steep. Still, I'm happy with my decision.",
    name: "Hans Mueller",
    role: "Retired Engineer, Berlin",
    initials: "HM",
    accentColor: "bg-blue-700",
    rating: 3,
  },
  {
    quote:
      "Excellent service and professional management. My account manager is very responsive and knowledgeable. The daily reports keep me informed about my investments.",
    name: "Maria Ioannou",
    role: "Doctor, Kyrenia",
    initials: "MI",
    accentColor: "bg-rose-600",
    rating: 5,
  },
  {
    quote:
      "Solid returns and reliable platform. I've recommended Maverick Capital to several friends. The only improvement I'd suggest is adding more withdrawal options.",
    name: "Pierre Dubois",
    role: "Marketing Director, Paris",
    initials: "PD",
    accentColor: "bg-indigo-600",
    rating: 4,
  },
  {
    quote:
      "I was skeptical at first but after 3 months of consistent returns, I'm convinced. The team is professional and the platform is secure. Worth every penny.",
    name: "Mehmet Yılmaz",
    role: "Accountant, Famagusta",
    initials: "MY",
    accentColor: "bg-teal-600",
    rating: 5,
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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={cn(
            i < rating
              ? "fill-accent-400 text-accent-400"
              : "fill-slate-200 text-slate-200"
          )}
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -380,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 380,
        behavior: "smooth",
      });
    }
  };
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

        {/* Testimonial Cards - Infinite Horizontal Scroll */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition-all hover:scale-110 hover:shadow-xl"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-6 w-6 text-brand-600" />
          </button>
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition-all hover:scale-110 hover:shadow-xl"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-6 w-6 text-brand-600" />
          </button>

          {/* Gradient fade edges */}
          <div className="pointer-events-none absolute left-12 top-0 z-10 h-full w-16 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute right-12 top-0 z-10 h-full w-16 bg-gradient-to-l from-white to-transparent" />
          
          {/* Scrolling container */}
          <div
            ref={scrollContainerRef}
            className={cn(
              "flex gap-6 overflow-x-hidden",
              !isPaused && "animate-scroll-horizontal"
            )}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* First set */}
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={cardVariants}
                className="group relative flex w-[350px] flex-shrink-0 flex-col rounded-2xl p-8 glass shadow-glass transition-shadow duration-300 hover:shadow-xl"
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
                  <StarRating rating={t.rating} />
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
            
            {/* Duplicate set for seamless loop */}
            {testimonials.map((t) => (
              <motion.div
                key={`${t.name}-duplicate`}
                variants={cardVariants}
                className="group relative flex w-[350px] flex-shrink-0 flex-col rounded-2xl p-8 glass shadow-glass transition-shadow duration-300 hover:shadow-xl"
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
                  <StarRating rating={t.rating} />
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
          </div>
        </div>
      </div>
    </section>
  );
}
