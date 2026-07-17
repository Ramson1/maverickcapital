"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { DollarSign, Users, Activity, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  {
    icon: DollarSign,
    value: 50,
    suffix: "M+",
    prefix: "$",
    label: "Assets Under Management",
  },
  {
    icon: Users,
    value: 10000,
    suffix: "+",
    prefix: "",
    label: "Active Investors",
  },
  {
    icon: Activity,
    value: 99.9,
    suffix: "%",
    prefix: "",
    label: "Platform Uptime",
  },
  {
    icon: Globe,
    value: 15,
    suffix: "+",
    prefix: "",
    label: "Countries Served",
  },
];

function AnimatedNumber({ value, suffix, prefix }: { value: number; suffix: string; prefix: string }) {
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

  const formattedValue = value >= 1000
    ? Math.floor(displayValue).toLocaleString()
    : value % 1 !== 0
    ? displayValue.toFixed(1)
    : Math.floor(displayValue).toString();

  return (
    <span ref={ref}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="relative -mt-20 z-20 px-6 pb-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="group rounded-2xl glass p-8 shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-brand shadow-lg shadow-brand-500/25 transition-transform group-hover:scale-110">
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="mb-2 text-4xl font-bold text-brand-900">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              </div>
              <div className="text-sm font-medium text-slate-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
