"use client";

import { motion } from "framer-motion";
import { Users, Cpu, Globe, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const highlights = [
  { icon: Users, title: "Expert Team", description: "Seasoned financial professionals" },
  { icon: Cpu, title: "Advanced Technology", description: "AI-powered trading systems" },
  { icon: Globe, title: "Global Markets", description: "Access to 50+ markets worldwide" },
  { icon: Shield, title: "Regulated & Secure", description: "Full compliance & protection" },
];

export function IntroSection() {
  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20">
          {/* Left column - Text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="mb-6 text-4xl font-bold text-brand-900 md:text-5xl">
              About Maverick Capital
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-slate-600">
              At Maverick Capital, we believe everyone deserves access to professional investment management. Our mission is to democratize wealth building through cutting-edge technology, transparent practices, and personalized strategies.
            </p>
            <p className="mb-10 text-lg leading-relaxed text-slate-600">
              With over a decade of experience in financial markets, our team combines traditional expertise with innovative approaches to deliver consistent, risk-adjusted returns. We're committed to your financial success.
            </p>

            {/* Highlight cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {highlights.map((item, index) => (
                <motion.div
                  key={item.title}
                  className="group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-brand-300 hover:shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 transition-colors group-hover:bg-brand-100">
                    <item.icon className="h-5 w-5 text-brand-600" />
                  </div>
                  <h3 className="mb-1 text-base font-semibold text-brand-900">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right column - Visual */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="relative h-full min-h-[500px] overflow-hidden rounded-3xl gradient-brand p-1">
              <div className="relative h-full w-full overflow-hidden rounded-[22px] bg-brand-900">
                {/* Abstract chart visualization */}
                <svg
                  className="absolute inset-0 h-full w-full opacity-20"
                  viewBox="0 0 400 400"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M 0 300 Q 100 200, 200 250 T 400 150 L 400 400 L 0 400 Z"
                    fill="url(#chartGradient)"
                    className="text-brand-400"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, delay: 0.5 }}
                  />
                </svg>

                {/* Stats overlay */}
                <div className="relative z-10 flex h-full flex-col justify-between p-10">
                  <div>
                    <motion.div
                      className="mb-2 text-sm font-medium text-brand-200"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8 }}
                    >
                      Portfolio Performance
                    </motion.div>
                    <motion.div
                      className="mb-1 text-5xl font-bold text-white"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1 }}
                    >
                      +24.8%
                    </motion.div>
                    <motion.div
                      className="text-brand-300"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1.2 }}
                    >
                      Year-to-date returns
                    </motion.div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-xl glass-dark p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-brand-200">Risk Level</span>
                        <span className="text-sm font-semibold text-white">Moderate</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-brand-800">
                        <motion.div
                          className="h-full bg-accent-400"
                          initial={{ width: 0 }}
                          whileInView={{ width: "60%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5, delay: 1.4 }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl glass-dark p-4">
                        <div className="mb-1 text-2xl font-bold text-white">150+</div>
                        <div className="text-xs text-brand-200">Active Strategies</div>
                      </div>
                      <div className="rounded-xl glass-dark p-4">
                        <div className="mb-1 text-2xl font-bold text-white">4.9/5</div>
                        <div className="text-xs text-brand-200">Client Rating</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
