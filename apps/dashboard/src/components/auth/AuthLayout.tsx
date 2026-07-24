"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen gradient-hero">
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
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
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
      <Link href="/" className="mb-6 flex items-center justify-center">
        <Image src="/logo.png" alt="Maverick Capital" width={48} height={48} className="rounded-xl" />
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
