"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Eye, EyeOff, Check, X, Users } from "lucide-react";
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { error: showError, success: showSuccess } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [referralValid, setReferralValid] = useState<boolean | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check for referral code in URL on mount
  useEffect(() => {
    const refFromUrl = searchParams.get("ref");
    if (refFromUrl) {
      setReferralCode(refFromUrl.toUpperCase());
      // Store in localStorage as backup
      localStorage.setItem("referral_code", refFromUrl.toUpperCase());
    } else {
      // Check localStorage for previously stored referral code
      const stored = localStorage.getItem("referral_code");
      if (stored) setReferralCode(stored);
    }
  }, [searchParams]);

  // Validate referral code when it changes
  useEffect(() => {
    if (!referralCode || referralCode.length < 6) {
      setReferralValid(null);
      return;
    }
    const validate = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("mc_profiles")
        .select("id")
        .eq("referral_code", referralCode)
        .single();
      setReferralValid(!!data);
    };
    validate();
  }, [referralCode]);

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const passwordStrongEnough = password.length >= 8 && passwordStrength.score >= 3;
  const isFormValid = fullName.trim().length > 0 && email.trim().length > 0 && passwordStrongEnough && passwordsMatch && acceptTerms;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);

    try {
      const supabase = createClient();

      // Store referral code in metadata for profile creation
      const userMetadata: Record<string, string> = { full_name: fullName };
      if (referralCode && referralValid) {
        userMetadata.referral_code = referralCode;
        localStorage.setItem("referral_code", referralCode);
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: userMetadata },
      });

      if (error) throw error;

      showSuccess("Account created!", "Please check your email to verify your account.");
      router.push("/verify-email?email=" + encodeURIComponent(email));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create account. Please try again.";
      showError("Registration failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeader title="Create Account" subtitle="Get started with Maverick Capital" />

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-slate-700">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={loading}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
            Password
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
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 pr-11 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="mt-1 text-xs text-danger-500">Passwords do not match</p>
          )}
          {confirmPassword && password === confirmPassword && (
            <p className="mt-1 text-xs text-success-500">Passwords match</p>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2">
          <input
            id="terms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            disabled={loading}
          />
          <label htmlFor="terms" className="text-sm text-slate-600">
            I agree to the{" "}
            <Link href="/terms" className="font-medium text-brand-600 hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="font-medium text-brand-600 hover:underline">Privacy Policy</Link>
          </label>
        </div>

        {/* Referral Code */}
        <div>
          <label htmlFor="referralCode" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <Users className="h-3.5 w-3.5" />
            Referral Code <span className="text-slate-400">(optional)</span>
          </label>
          <input
            id="referralCode"
            type="text"
            placeholder="e.g. MC1A2B3C4D"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            disabled={loading}
            className={cn(
              "w-full rounded-lg border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 disabled:opacity-50",
              referralValid === true
                ? "border-success-500 focus:border-success-500 focus:ring-success-500/20"
                : referralValid === false
                  ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20"
                  : "border-slate-200 focus:border-brand-500 focus:ring-brand-500/20"
            )}
          />
          {referralValid === true && (
            <p className="mt-1 flex items-center gap-1 text-xs text-success-500">
              <Check className="h-3 w-3" /> Valid referral code — you'll be linked to the referrer
            </p>
          )}
          {referralValid === false && referralCode.length >= 6 && (
            <p className="mt-1 flex items-center gap-1 text-xs text-danger-500">
              <X className="h-3 w-3" /> Invalid referral code
            </p>
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
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      {/* Sign In Link */}
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-600 transition-colors hover:text-brand-700">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}
