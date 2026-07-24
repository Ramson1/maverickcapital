"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthLayout, AuthHeader } from "@/components/auth/AuthLayout";
import { useToast } from "@/providers/ToastProvider";

export default function ForgotPasswordPage() {
  const { error: showError, success: showSuccess } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isFormValid = email.trim().length > 0;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      showSuccess("Email sent!", "Check your inbox for the password reset link.");
      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send reset email";
      showError("Reset failed", message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-500/10">
            <CheckCircle2 className="h-8 w-8 text-success-500" />
          </div>

          <h1 className="mb-2 text-2xl font-bold text-brand-900">Check Your Email</h1>
          <p className="mb-2 text-sm text-slate-500">We&apos;ve sent a password reset link to</p>
          <p className="mb-6 text-sm font-semibold text-brand-700">{email}</p>
          <p className="mb-8 text-xs text-slate-400">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <button
              onClick={() => { setSuccess(false); setEmail(""); }}
              className="font-medium text-brand-600 hover:text-brand-700 cursor-pointer"
            >
              try another address
            </button>
          </p>

          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-lg gradient-brand px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl hover:shadow-brand-500/30"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthHeader
        icon={<Mail className="h-6 w-6" />}
        title="Forgot Password?"
        subtitle="Enter your email to receive a reset link"
      />

      <form onSubmit={handleResetPassword} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !isFormValid}
          className={cn(
            "flex w-full items-center justify-center rounded-lg gradient-brand px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl hover:shadow-brand-500/30 hover:scale-[1.02] cursor-pointer",
            (loading || !isFormValid) && "cursor-not-allowed opacity-40 hover:scale-100 hover:shadow-lg"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Link...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
