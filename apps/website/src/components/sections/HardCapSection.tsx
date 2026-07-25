"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, TrendingUp, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function HardCapSection() {
  const supabase = createClient();
  const [hardCap, setHardCap] = useState(500000);
  const [totalRaised, setTotalRaised] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: config } = await supabase
          .from("mc_system_config")
          .select("value")
          .eq("key", "hard_cap")
          .single();
        setHardCap(config?.value?.amount ?? 500000);

        const { data: deposits } = await supabase
          .from("mc_deposits")
          .select("amount")
          .eq("status", "approved");
        const total = deposits?.reduce((s, d) => s + Number(d.amount), 0) || 0;

        if (total === 0) {
          const { data: profiles } = await supabase.from("mc_profiles").select("total_investment");
          const profileTotal = profiles?.reduce((s, p) => s + Number(p.total_investment || 0), 0) || 0;
          setTotalRaised(profileTotal);
        } else {
          setTotalRaised(total);
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [supabase]);

  const percentage = hardCap > 0 ? Math.min((totalRaised / hardCap) * 100, 100) : 0;

  const formatCompact = (n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
    return `$${n.toFixed(0)}`;
  };

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-950 via-brand-900 to-brand-950" />
      {/* Decorative orbs */}
      <motion.div
        className="absolute top-10 left-[15%] h-64 w-64 rounded-full bg-brand-500/10 blur-3xl"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-10 right-[15%] h-48 w-48 rounded-full bg-accent-500/10 blur-3xl"
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-200 backdrop-blur-sm">
            <Lock className="h-3.5 w-3.5" />
            Limited Capital
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            ${hardCap.toLocaleString()} Hard Cap
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-brand-200/70">
            Maverick Capital maintains a strict hard cap of <strong className="text-white">${hardCap.toLocaleString()}</strong>.
            Unlike open-ended funds, we limit total capital raised. The investment window closes the moment the hard cap is reached.
            Our structure prioritizes simplicity, focus, and clear accountability.
          </p>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:p-8"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-brand-200">Capital Raised</span>
            <span className="font-semibold text-white">
              {loading ? "..." : `${formatCompact(totalRaised)} / ${formatCompact(hardCap)}`}
            </span>
          </div>

          {/* Bar */}
          <div className="mt-4 h-5 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${percentage}%`,
                background:
                  percentage >= 90
                    ? "linear-gradient(90deg, #ef4444, #dc2626)"
                    : percentage >= 70
                      ? "linear-gradient(90deg, #f59e0b, #d97706)"
                      : "linear-gradient(90deg, #3b82f6, #60a5fa)",
              }}
              initial={{ width: 0 }}
              whileInView={{ width: `${percentage}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-brand-300/60">{percentage.toFixed(1)}% filled</span>
            <span className="text-brand-300/60">
              {loading ? "" : `$${(hardCap - totalRaised).toLocaleString()} remaining`}
            </span>
          </div>

          {/* Info pills */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-brand-200">
              <Shield className="h-3.5 w-3.5 text-brand-300" />
              SEC Regulated Structure
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-brand-200">
              <Lock className="h-3.5 w-3.5 text-brand-300" />
              Window Closes at Cap
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-brand-200">
              <TrendingUp className="h-3.5 w-3.5 text-brand-300" />
              Up to 12% Returns
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
