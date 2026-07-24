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

          {/* Right column - Visual with Charts */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="space-y-4">
              {/* Main Performance Chart */}
              <div className="rounded-3xl bg-gradient-to-br from-brand-900 to-brand-800 p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-brand-200">Portfolio Performance</div>
                    <div className="text-3xl font-bold text-white">+24.8%</div>
                    <div className="text-xs text-brand-300">Year-to-date returns</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
                      ↗ +2.4%
                    </div>
                  </div>
                </div>
                
                {/* Line Chart */}
                <svg className="h-40 w-full" viewBox="0 0 400 160" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M 0 120 Q 50 100, 100 110 T 200 80 T 300 60 T 400 40 L 400 160 L 0 160 Z"
                    fill="url(#lineGradient)"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                  <motion.path
                    d="M 0 120 Q 50 100, 100 110 T 200 80 T 300 60 T 400 40"
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="3"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, delay: 0.5 }}
                  />
                  {/* Data points */}
                  {[{x: 0, y: 120}, {x: 100, y: 110}, {x: 200, y: 80}, {x: 300, y: 60}, {x: 400, y: 40}].map((point, i) => (
                    <motion.circle
                      key={i}
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill="#60a5fa"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                    />
                  ))}
                </svg>
              </div>

              {/* Portfolio Allocation */}
              <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-brand-100">
                <div className="mb-4 text-sm font-semibold text-brand-900">Portfolio Allocation</div>
                <div className="space-y-3">
                  {[
                    { label: "Cryptocurrency", value: 45, color: "bg-brand-600" },
                    { label: "Gold & Commodities", value: 25, color: "bg-accent-500" },
                    { label: "Forex Trading", value: 20, color: "bg-green-500" },
                    { label: "Indices", value: 10, color: "bg-purple-500" },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                    >
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">{item.label}</span>
                        <span className="font-semibold text-brand-900">{item.value}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          className={`h-full ${item.color}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.value}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 1 + index * 0.1 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-brand-100">
                  <div className="mb-1 text-2xl font-bold text-brand-900">150+</div>
                  <div className="text-xs text-slate-600">Active Strategies</div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                    <span>↗</span> +12 this month
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-brand-100">
                  <div className="mb-1 text-2xl font-bold text-brand-900">4.9/5</div>
                  <div className="text-xs text-slate-600">Client Rating</div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-accent-600">
                    ★★★★★
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
