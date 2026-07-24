"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Target,
  Eye,
  Shield,
  Lightbulb,
  Award,
  Users,
  TrendingUp,
  Smile,
  Trophy,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Animated counter hook                                              */
/* ------------------------------------------------------------------ */

function AnimatedNumber({
  value,
  suffix,
  prefix,
  decimals = 0,
}: {
  value: number;
  suffix: string;
  prefix: string;
  decimals?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    let current = 0;
    const increment = value / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isInView, value]);

  const formattedValue =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : value >= 1000
        ? Math.floor(displayValue).toLocaleString()
        : Math.floor(displayValue).toString();

  return (
    <span ref={ref}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const coreValues = [
  {
    icon: Shield,
    title: "Integrity",
    description:
      "We operate with full transparency and honesty in every transaction. Our clients trust us because we always put their interests first and maintain the highest ethical standards.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We leverage cutting-edge technology and creative strategies to stay ahead of market trends. Our platform continuously evolves to deliver superior trading experiences.",
  },
  {
    icon: Award,
    title: "Excellence",
    description:
      "We pursue the highest standards in everything we do, from platform performance to customer service. Excellence is not a goal -- it is our standard operating procedure.",
  },
  {
    icon: Users,
    title: "Client-Centric",
    description:
      "Every decision we make starts with our clients. We build solutions tailored to individual financial goals, ensuring personalized support at every step of the investment journey.",
  },
];

const achievements = [
  {
    icon: TrendingUp,
    value: 12,
    suffix: "+",
    prefix: "",
    label: "Years of Experience",
  },
  {
    icon: BarChart3,
    value: 250,
    suffix: "M+",
    prefix: "$",
    label: "Total Returns Generated",
  },
  {
    icon: Smile,
    value: 98,
    suffix: "%",
    prefix: "",
    label: "Client Satisfaction Rate",
  },
  {
    icon: Trophy,
    value: 35,
    suffix: "+",
    prefix: "",
    label: "Awards Won",
  },
];

const teamMembers = [
  {
    name: "Adewale Johnson",
    initials: "AJ",
    title: "Chief Executive Officer",
    bio: "With over 15 years in global finance, Adewale founded Maverick Capital to democratize access to professional-grade investment tools. His vision drives the company's strategic direction.",
    color: "from-brand-500 to-brand-700",
  },
  {
    name: "Chioma Okafor",
    initials: "CO",
    title: "Chief Technology Officer",
    bio: "Chioma brings deep expertise in distributed systems and fintech architecture. She leads our engineering team in building a secure, scalable, and lightning-fast trading platform.",
    color: "from-brand-600 to-brand-800",
  },
  {
    name: "Ibrahim Musa",
    initials: "IM",
    title: "Head of Trading",
    bio: "A seasoned trader with a decade of experience across gold, crypto, and forex markets, Ibrahim oversees trading operations and develops strategies that consistently deliver results.",
    color: "from-accent-500 to-accent-700",
  },
  {
    name: "Fatima Bello",
    initials: "FB",
    title: "Head of Operations",
    bio: "Fatima ensures seamless day-to-day operations and exceptional client experiences. Her background in operations management keeps Maverick Capital running at peak efficiency.",
    color: "from-accent-400 to-accent-600",
  },
];

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
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

export default function AboutPage() {
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
            <span className="text-white">About</span>
          </motion.nav>

          <motion.h1
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            About{" "}
            <span className="text-gradient">Maverick Capital</span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-2xl text-lg text-brand-200/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Building trust through transparency, innovation, and a relentless
            commitment to our clients' financial success.
          </motion.p>
        </div>
      </section>

      {/* ===== Company Story ===== */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Text column */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              <motion.span
                variants={fadeUp}
                className="mb-4 inline-block rounded-full bg-brand-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700"
              >
                Our Story
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="mb-6 text-3xl font-bold tracking-tight text-brand-950 sm:text-4xl"
              >
                Pioneering Investment Solutions Since 2012
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mb-5 text-lg leading-relaxed text-slate-600"
              >
                Maverick Capital was founded with a clear mission: to bridge the
                gap between institutional-grade trading tools and individual
                investors. What began as a small team of passionate traders has
                grown into a full-service investment platform serving thousands
                of clients worldwide.
              </motion.p>
              <motion.p
                variants={fadeUp}
                className="mb-5 text-lg leading-relaxed text-slate-600"
              >
                Over the years, we have expanded our offerings from forex trading
                to encompass gold, cryptocurrency spot and futures, and global
                indices -- always maintaining the same commitment to security,
                transparency, and performance.
              </motion.p>
              <motion.p
                variants={fadeUp}
                className="text-lg leading-relaxed text-slate-600"
              >
                Today, Maverick Capital stands at the forefront of fintech
                innovation, combining advanced technology with deep market
                expertise to help our clients build, grow, and protect their
                wealth in an ever-changing financial landscape.
              </motion.p>
            </motion.div>

            {/* Decorative image placeholder */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="relative overflow-hidden rounded-3xl gradient-brand p-10 shadow-2xl shadow-brand-500/20 lg:p-14">
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
                  <BarChart3 className="mb-6 h-20 w-20 text-white/80" />
                  <p className="text-2xl font-bold text-white">
                    Growing Portfolios
                  </p>
                  <p className="mt-2 text-sm text-brand-200/80">
                    Since 2012
                  </p>
                  {/* Decorative stats */}
                  <div className="mt-8 grid w-full grid-cols-2 gap-4">
                    <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                      <p className="text-2xl font-bold text-white">$250M+</p>
                      <p className="text-xs text-brand-200/70">Returns</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                      <p className="text-2xl font-bold text-white">10K+</p>
                      <p className="text-xs text-brand-200/70">Clients</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Accent decoration */}
              <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-2xl bg-accent-400/20 blur-xl" />
              <div className="absolute -top-4 -left-4 h-20 w-20 rounded-full bg-brand-400/20 blur-xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== Mission & Vision ===== */}
      <section className="bg-slate-50 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            className="mb-14 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-4 inline-block rounded-full bg-brand-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700">
              What Drives Us
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-brand-950 sm:text-4xl">
              Our Mission & Vision
            </h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Mission Card */}
            <motion.div
              className="group relative overflow-hidden rounded-3xl border border-brand-100 bg-white p-10 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand shadow-lg shadow-brand-500/25 transition-transform group-hover:scale-110">
                <Target className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-brand-950">
                Our Mission
              </h3>
              <p className="text-lg leading-relaxed text-slate-600">
                To empower individuals and institutions with accessible,
                secure, and high-performance investment tools. We strive to
                democratize wealth creation by combining cutting-edge
                technology with expert market insights, ensuring every client
                has the opportunity to achieve their financial goals.
              </p>
              {/* Decorative corner */}
              <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-brand-100/50 transition-transform group-hover:scale-125" />
            </motion.div>

            {/* Vision Card */}
            <motion.div
              className="group relative overflow-hidden rounded-3xl border border-accent-200 bg-white p-10 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 shadow-lg shadow-accent-500/25 transition-transform group-hover:scale-110">
                <Eye className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-brand-950">
                Our Vision
              </h3>
              <p className="text-lg leading-relaxed text-slate-600">
                To become the world's most trusted and innovative investment
                platform -- a place where technology and expertise converge to
                create unparalleled value for our clients. We envision a future
                where smart investing is accessible to everyone, regardless of
                background or experience level.
              </p>
              {/* Decorative corner */}
              <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-accent-100/50 transition-transform group-hover:scale-125" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== Core Values ===== */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            className="mb-14 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-4 inline-block rounded-full bg-brand-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700">
              Our Principles
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-brand-950 sm:text-4xl">
              Core Values
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              The principles that guide every decision we make and every
              interaction we have with our clients.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {coreValues.map((value) => (
              <motion.div
                key={value.title}
                variants={fadeUp}
                className="group rounded-2xl border border-slate-100 bg-white p-8 shadow-md transition-all hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 transition-colors group-hover:gradient-brand group-hover:shadow-lg group-hover:shadow-brand-500/25">
                  <value.icon className="h-6 w-6 text-brand-600 transition-colors group-hover:text-white" />
                </div>
                <h3 className="mb-3 text-lg font-bold text-brand-950">
                  {value.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== Achievements ===== */}
      <section className="relative overflow-hidden gradient-hero py-20 lg:py-28">
        {/* Decorative blurs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-1/2 h-60 w-60 -translate-y-1/2 rounded-full bg-brand-600/30 blur-3xl" />
          <div className="absolute -right-20 top-1/3 h-48 w-48 rounded-full bg-accent-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <motion.div
            className="mb-14 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-4 inline-block rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-200 backdrop-blur-sm">
              Our Track Record
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Achievements That Speak
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {achievements.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="group rounded-2xl border border-white/20 bg-white/10 p-8 text-center shadow-lg backdrop-blur-md transition-all hover:-translate-y-2 hover:bg-white/15 hover:shadow-2xl"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm transition-transform group-hover:scale-110">
                  <stat.icon className="h-6 w-6 text-accent-400" />
                </div>
                <div className="mb-2 text-3xl font-bold text-white lg:text-4xl">
                  <AnimatedNumber
                    value={stat.value}
                    suffix={stat.suffix}
                    prefix={stat.prefix}
                  />
                </div>
                <div className="text-sm font-medium text-brand-200/80">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Team ===== */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            className="mb-14 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-4 inline-block rounded-full bg-brand-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700">
              Our People
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-brand-950 sm:text-4xl">
              Meet the Leadership Team
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Experienced professionals dedicated to delivering exceptional
              results for our clients.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {teamMembers.map((member) => (
              <motion.div
                key={member.name}
                variants={fadeUp}
                className="group rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-md transition-all hover:-translate-y-2 hover:shadow-xl"
              >
                {/* Avatar placeholder */}
                <div
                  className={cn(
                    "mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br text-2xl font-bold text-white shadow-lg transition-transform group-hover:scale-110",
                    member.color,
                  )}
                >
                  {member.initials}
                </div>
                <h3 className="mb-1 text-lg font-bold text-brand-950">
                  {member.name}
                </h3>
                <p className="mb-4 text-sm font-semibold text-brand-600">
                  {member.title}
                </p>
                <p className="text-sm leading-relaxed text-slate-600">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CTA ===== */}
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
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Ready to Invest{" "}
              <span className="text-gradient-gold">with Us?</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-brand-200/80">
              Join thousands of investors who trust Maverick Capital to grow
              and protect their wealth. Open your account today and access
              world-class investment tools.
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
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
