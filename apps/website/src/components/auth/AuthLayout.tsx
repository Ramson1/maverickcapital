"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen gradient-hero pt-24">
      {/* Decorative blobs */}
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

      {/* Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-6rem)] items-center justify-center px-4 py-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="rounded-2xl border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

interface AuthHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthHeader({ icon, title, subtitle }: AuthHeaderProps) {
  return (
    <div className="mb-8 text-center">
      {/* Logo */}
      <Link href="/" className="mb-6 flex items-center justify-center gap-2.5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-brand shadow-lg shadow-brand-500/25">
          <span className="text-xl font-bold text-white">M</span>
        </div>
      </Link>

      {icon && (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          {icon}
        </div>
      )}

      <h1 className="text-2xl font-bold text-brand-900">{title}</h1>
      {subtitle && (
        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthProps) {
  const getStrength = (pwd: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (pwd.length >= 12) score++;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-danger-500" };
    if (score <= 2) return { score: 2, label: "Fair", color: "bg-accent-500" };
    if (score <= 3) return { score: 3, label: "Good", color: "bg-accent-400" };
    if (score <= 4) return { score: 4, label: "Strong", color: "bg-success-500" };
    return { score: 5, label: "Very Strong", color: "bg-success-600" };
  };

  const strength = getStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              level <= strength.score ? strength.color : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500">
        Password strength: <span className="font-medium">{strength.label}</span>
      </p>
    </div>
  );
}
