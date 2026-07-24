"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthLayout, AuthHeader } from "@/components/auth/AuthLayout";
import { useToast } from "@/providers/ToastProvider";

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-danger-500" };
  if (score <= 2) return { score: 2, label: "Fair", color: "bg-accent-500" };
  if (score <= 3) return { score: 3, label: "Good", color: "bg-accent-400" };
  if (score <= 4) return { score: 4, label: "Strong", color: "bg-success-500" };
  return { score: 5, label: "Very Strong", color: "bg-success-600" };
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const { error: showError, success: showSuccess } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const passwordStrongEnough = password.length >= 8 && passwordStrength.score >= 3;
  const isFormValid = passwordStrongEnough && passwordsMatch;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      showSuccess("Password reset!", "You can now sign in with your new password.");
      router.push("/login?message=password-updated");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reset password";
      showError("Reset failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeader title="Set New Password" subtitle="Enter your new password below" />

      <form onSubmit={handleResetPassword} className="space-y-5">
        {/* New Password */}
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
            New Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 pr-11 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      level <= passwordStrength.score ? passwordStrength.color : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500">
                Password strength: <span className="font-medium">{passwordStrength.label}</span>
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-slate-700">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="mt-1 text-xs text-danger-500">Passwords do not match</p>
          )}
          {confirmPassword && password === confirmPassword && (
            <p className="mt-1 text-xs text-success-500">Passwords match</p>
          )}
        </div>

        {/* Submit */}
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
              Resetting Password...
            </>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700">
          Back to Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
