"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Award, TrendingUp } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const trustBadges = [
  // { icon: Shield, label: "SEC Regulated" },
  { icon: Lock, label: "256-bit SSL" },
  { icon: Award, label: "Award Winning" },
  { icon: TrendingUp, label: "Proven Track Record" },
];

export function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/e01f66f39ef9797442ee445fa74d24f1_540w.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-950/95 via-brand-900/92 to-brand-950/98" />

      {/* Decorative elements */}
      <motion.div
        className="absolute top-20 left-10 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl"
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl"
        animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pt-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Headline */}
          <motion.h1
            className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Grow Your Wealth with
            <br />
            <span
              className="text-5xl font-extrabold md:text-8xl"
              style={{
                background: 'linear-gradient(135deg, #60a5fa, #fb8824ff, #60a5fa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 40px rgba(96, 165, 250, 0.5)',
                WebkitTextStroke: '2px rgba(255, 255, 255, 0.4)',
              }}
            >
              Maverick Capital
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mx-auto mb-10 max-w-2xl text-lg text-brand-100/80 md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Professional investment management powered by advanced technology and decades of market expertise. Build your portfolio with confidence.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col gap-4 sm:flex-row sm:justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link
              href="/register"
              className="rounded-full bg-white px-8 py-4 text-base font-semibold text-brand-700 shadow-xl shadow-brand-500/20 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-brand-500/30"
            >
              Start Investing
            </Link>
            <Link
              href="/about"
              className="rounded-full border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/50 hover:bg-white/20"
            >
              Learn More
            </Link>
          </motion.div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          className="mt-16 flex w-full max-w-3xl flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {trustBadges.map((badge, index) => (
            <motion.div
              key={badge.label}
              className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
            >
              <badge.icon className="h-4 w-4 text-accent-400" />
              <span className="text-xs font-medium text-white">{badge.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
