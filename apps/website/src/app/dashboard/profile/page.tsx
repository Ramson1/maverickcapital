"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Shield, CheckCircle2, AlertCircle, Loader2, Wallet, TrendingUp, DollarSign, Copy, Check, Users, ChevronDown, Upload, X, Eye, EyeOff, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { ProfileSkeleton } from "@/components/ui/PageSkeletons";

interface Profile {
  full_name: string;
  phone: string | null;
  email: string | null;
  kyc_status: string;
  account_status: string;
  membership_level: string;
  avatar_url: string | null;
  wallet_balance: number;
  total_investment: number;
  total_profit: number;
  referral_code: string | null;
  two_factor_enabled: boolean;
  created_at: string;
}

const kycLabels: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "default" }> = {
  verified: { label: "Verified", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  rejected: { label: "Rejected", variant: "destructive" },
  not_submitted: { label: "Not Submitted", variant: "default" },
};

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Expandable sections
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // KYC state
  const [kycIdFile, setKycIdFile] = useState<File | null>(null);
  const [kycAddressFile, setKycAddressFile] = useState<File | null>(null);
  const [kycSelfieFile, setKycSelfieFile] = useState<File | null>(null);
  const [kycSubmitting, setKycSubmitting] = useState(false);

  // 2FA state
  const [twoFASetupPhase, setTwoFASetupPhase] = useState<"idle" | "setup" | "verify">("idle");
  const [twoFASecret, setTwoFASecret] = useState("");
  const [twoFACode, setTwoFACode] = useState("");
  const [twoFAShowSecret, setTwoFAShowSecret] = useState(false);
  const [twoFASubmitting, setTwoFASubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        if (!authLoading) setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("mc_profiles")
        .select("full_name, phone, kyc_status, account_status, membership_level, avatar_url, wallet_balance, total_investment, total_profit, referral_code, two_factor_enabled, created_at")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setProfile({
          ...data,
          email: user.email || null,
          wallet_balance: Number(data.wallet_balance) || 0,
          total_investment: Number(data.total_investment) || 0,
          total_profit: Number(data.total_profit) || 0,
        });
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, authLoading]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase
      .from("mc_profiles")
      .update({ full_name: fullName, phone, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    setEditing(false);
    setSaving(false);
  };

  if (authLoading || loading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-12 w-12 text-surface-300 dark:text-surface-600" />
        <p className="mt-4 text-sm text-surface-500">Please sign in to view your profile</p>
      </div>
    );
  }

  const defaultProfile: Profile = {
    full_name: "",
    phone: null,
    email: user?.email || null,
    kyc_status: "not_submitted",
    account_status: "inactive",
    membership_level: "basic",
    avatar_url: null,
    wallet_balance: 0,
    total_investment: 0,
    total_profit: 0,
    referral_code: null,
    two_factor_enabled: false,
    created_at: new Date().toISOString(),
  };

  const p = profile || defaultProfile;
  const kyc = kycLabels[p.kyc_status] || kycLabels.not_submitted;
  const initials = (p.full_name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleCopyReferralCode = async () => {
    if (!p.referral_code) return;
    await navigator.clipboard.writeText(p.referral_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // KYC submission
  const handleKycSubmit = async () => {
    if (!user || !kycIdFile || !kycAddressFile || !kycSelfieFile) return;
    setKycSubmitting(true);
    try {
      const bucket = "kyc-documents";
      const uploadFile = async (file: File, prefix: string) => {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${prefix}_${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from(bucket).upload(path, file);
        if (error) throw error;
        return path;
      };

      const [idPath, addressPath, selfiePath] = await Promise.all([
        uploadFile(kycIdFile, "id"),
        uploadFile(kycAddressFile, "address"),
        uploadFile(kycSelfieFile, "selfie"),
      ]);

      await supabase.from("mc_kyc_submissions").insert({
        user_id: user.id,
        id_document_path: idPath,
        address_document_path: addressPath,
        selfie_document_path: selfiePath,
        status: "pending",
      });

      await supabase.from("mc_profiles").update({ kyc_status: "pending" }).eq("id", user.id);
      setProfile((prev) => prev ? { ...prev, kyc_status: "pending" } : prev);
      setKycIdFile(null);
      setKycAddressFile(null);
      setKycSelfieFile(null);
      setExpandedSection(null);
    } catch (err) {
      console.error("KYC submission failed:", err);
    } finally {
      setKycSubmitting(false);
    }
  };

  // 2FA setup
  const generateSecret = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let secret = "";
    for (let i = 0; i < 32; i++) secret += chars[Math.floor(Math.random() * chars.length)];
    return secret;
  };

  const handleEnable2FA = () => {
    setTwoFASecret(generateSecret());
    setTwoFASetupPhase("setup");
  };

  const handleVerify2FA = async () => {
    if (!user || twoFACode.length !== 6) return;
    setTwoFASubmitting(true);
    try {
      await supabase.from("mc_profiles").update({ two_factor_enabled: true }).eq("id", user.id);
      setProfile((prev) => prev ? { ...prev, two_factor_enabled: true } : prev);
      setTwoFASetupPhase("idle");
      setTwoFACode("");
      setTwoFASecret("");
      setExpandedSection(null);
    } catch (err) {
      console.error("2FA enable failed:", err);
    } finally {
      setTwoFASubmitting(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!user) return;
    setTwoFASubmitting(true);
    try {
      await supabase.from("mc_profiles").update({ two_factor_enabled: false }).eq("id", user.id);
      setProfile((prev) => prev ? { ...prev, two_factor_enabled: false } : prev);
      setTwoFASetupPhase("idle");
      setExpandedSection(null);
    } catch (err) {
      console.error("2FA disable failed:", err);
    } finally {
      setTwoFASubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Profile</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Manage your personal information</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center p-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                {p.avatar_url && <AvatarImage src={p.avatar_url} alt="Profile" />}
                <AvatarFallback className="text-2xl bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400">
                  {p.avatar_url ? initials : <User className="h-10 w-10" />}
                </AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 rounded-full bg-brand-600 p-1.5 text-white shadow-sm hover:bg-brand-700">
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-surface-900 dark:text-white">{p.full_name || "User"}</h2>
            <p className="text-sm text-surface-500">{p.email}</p>
            <div className="mt-4 flex gap-2">
              <Badge variant="default" className="capitalize">{p.membership_level}</Badge>
              <Badge variant={kyc.variant}>{kyc.label}</Badge>
            </div>
            <div className="mt-6 w-full space-y-0 divide-y divide-surface-100 dark:divide-surface-800">
              {/* Account Status */}
              <div>
                <button onClick={() => toggleSection("account")} className="flex w-full items-center justify-between py-3 text-sm transition-colors hover:text-surface-900 dark:hover:text-white">
                  <span className="text-surface-500">Account Status</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={p.account_status === "active" ? "success" : "destructive"} className="capitalize text-xs">{p.account_status}</Badge>
                    <ChevronDown className={cn("h-3.5 w-3.5 text-surface-400 transition-transform", expandedSection === "account" && "rotate-180")} />
                  </div>
                </button>
                {expandedSection === "account" && (
                  <div className="pb-3">
                    <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-surface-700 dark:bg-surface-800">
                      {p.account_status === "active" ? (
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
                          <div>
                            <p className="text-sm font-medium text-success-600">Account in good standing</p>
                            <p className="mt-1 text-xs text-surface-500">Your account is fully active and operational. You can make deposits, withdrawals, and trade without restrictions.</p>
                          </div>
                        </div>
                      ) : p.account_status === "suspended" ? (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning-600" />
                          <div>
                            <p className="text-sm font-medium text-warning-600">Account suspended</p>
                            <p className="mt-1 text-xs text-surface-500">Your account has been temporarily suspended. Please contact support to resolve this issue.</p>
                            <Link href="/dashboard/support">
                              <Button size="sm" variant="outline" className="mt-2 text-xs">Contact Support</Button>
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-surface-400" />
                          <div>
                            <p className="text-sm font-medium text-surface-700 dark:text-surface-300">Account not yet active</p>
                            <p className="mt-1 text-xs text-surface-500">Your account is pending activation. Complete KYC verification or contact support for assistance.</p>
                            <Link href="/dashboard/support">
                              <Button size="sm" variant="outline" className="mt-2 text-xs">Contact Support</Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* KYC Status */}
              <div>
                <button onClick={() => toggleSection("kyc")} className="flex w-full items-center justify-between py-3 text-sm transition-colors hover:text-surface-900 dark:hover:text-white">
                  <span className="text-surface-500">KYC Status</span>
                  <div className="flex items-center gap-2">
                    <span className={cn("flex items-center gap-1 text-xs", p.kyc_status === "verified" ? "text-success-600" : "text-surface-500")}>
                      {p.kyc_status === "verified" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                      <span className="capitalize">{p.kyc_status.replace(/_/g, " ")}</span>
                    </span>
                    <ChevronDown className={cn("h-3.5 w-3.5 text-surface-400 transition-transform", expandedSection === "kyc" && "rotate-180")} />
                  </div>
                </button>
                {expandedSection === "kyc" && (
                  <div className="pb-3">
                    <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-surface-700 dark:bg-surface-800">
                      {p.kyc_status === "verified" ? (
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
                          <div>
                            <p className="text-sm font-medium text-success-600">Identity verified</p>
                            <p className="mt-1 text-xs text-surface-500">Your identity has been successfully verified. You have full access to all platform features.</p>
                          </div>
                        </div>
                      ) : p.kyc_status === "pending" ? (
                        <div className="flex items-start gap-2">
                          <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-warning-600" />
                          <div>
                            <p className="text-sm font-medium text-warning-600">Under review</p>
                            <p className="mt-1 text-xs text-surface-500">Your documents are being reviewed. This usually takes 1-2 business days. We'll notify you once the review is complete.</p>
                          </div>
                        </div>
                      ) : p.kyc_status === "rejected" ? (
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger-600" />
                            <div>
                              <p className="text-sm font-medium text-danger-600">Submission rejected</p>
                              <p className="mt-1 text-xs text-surface-500">Your previous submission was rejected. Please resubmit with clearer, valid documents.</p>
                            </div>
                          </div>
                          <KycUploadForm
                            kycIdFile={kycIdFile} setKycIdFile={setKycIdFile}
                            kycAddressFile={kycAddressFile} setKycAddressFile={setKycAddressFile}
                            kycSelfieFile={kycSelfieFile} setKycSelfieFile={setKycSelfieFile}
                            kycSubmitting={kycSubmitting}
                            onSubmit={handleKycSubmit}
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-surface-400" />
                            <div>
                              <p className="text-sm font-medium text-surface-700 dark:text-surface-300">Verify your identity</p>
                              <p className="mt-1 text-xs text-surface-500">Submit your government-issued ID, proof of address, and a selfie to unlock full platform access.</p>
                            </div>
                          </div>
                          <KycUploadForm
                            kycIdFile={kycIdFile} setKycIdFile={setKycIdFile}
                            kycAddressFile={kycAddressFile} setKycAddressFile={setKycAddressFile}
                            kycSelfieFile={kycSelfieFile} setKycSelfieFile={setKycSelfieFile}
                            kycSubmitting={kycSubmitting}
                            onSubmit={handleKycSubmit}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 2FA */}
              <div>
                <button onClick={() => toggleSection("2fa")} className="flex w-full items-center justify-between py-3 text-sm transition-colors hover:text-surface-900 dark:hover:text-white">
                  <span className="text-surface-500">2FA</span>
                  <div className="flex items-center gap-2">
                    {p.two_factor_enabled ? (
                      <span className="flex items-center gap-1 text-xs text-success-600"><Shield className="h-3.5 w-3.5" />Enabled</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-surface-500"><Shield className="h-3.5 w-3.5" />Disabled</span>
                    )}
                    <ChevronDown className={cn("h-3.5 w-3.5 text-surface-400 transition-transform", expandedSection === "2fa" && "rotate-180")} />
                  </div>
                </button>
                {expandedSection === "2fa" && (
                  <div className="pb-3">
                    <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-surface-700 dark:bg-surface-800">
                      {p.two_factor_enabled ? (
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
                            <div>
                              <p className="text-sm font-medium text-success-600">Two-factor authentication is enabled</p>
                              <p className="mt-1 text-xs text-surface-500">Your account is protected with an extra layer of security. You'll need your authenticator app when signing in.</p>
                            </div>
                          </div>
                          <Button size="sm" variant="destructive" onClick={handleDisable2FA} disabled={twoFASubmitting}>
                            {twoFASubmitting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                            Disable 2FA
                          </Button>
                        </div>
                      ) : twoFASetupPhase === "idle" ? (
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-surface-400" />
                            <div>
                              <p className="text-sm font-medium text-surface-700 dark:text-surface-300">Protect your account</p>
                              <p className="mt-1 text-xs text-surface-500">Two-factor authentication adds an extra layer of security. You'll need an authenticator app like Google Authenticator or Authy.</p>
                            </div>
                          </div>
                          <Button size="sm" onClick={handleEnable2FA}>Enable 2FA</Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-medium text-surface-700 dark:text-surface-300">1. Add this secret to your authenticator app:</p>
                            <div className="mt-1 flex items-center gap-2">
                              <code className="flex-1 rounded bg-surface-200 px-3 py-2 font-mono text-xs text-surface-900 dark:bg-surface-700 dark:text-white">
                                {twoFAShowSecret ? twoFASecret : "••••••••••••••••"}
                              </code>
                              <button onClick={() => setTwoFAShowSecret(!twoFAShowSecret)} className="rounded p-1.5 text-surface-500 hover:bg-surface-200 dark:hover:bg-surface-600">
                                {twoFAShowSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                              <button onClick={() => navigator.clipboard.writeText(twoFASecret)} className="rounded p-1.5 text-surface-500 hover:bg-surface-200 dark:hover:bg-surface-600">
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-surface-700 dark:text-surface-300">2. Enter the 6-digit code from your app:</p>
                            <div className="mt-1 flex items-center gap-2">
                              <Input
                                value={twoFACode}
                                onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                placeholder="000000"
                                maxLength={6}
                                className="w-32 font-mono tracking-widest text-center"
                              />
                              <Button size="sm" onClick={handleVerify2FA} disabled={twoFACode.length !== 6 || twoFASubmitting}>
                                {twoFASubmitting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                                Verify & Enable
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => { setTwoFASetupPhase("idle"); setTwoFACode(""); setTwoFASecret(""); }}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Member Since */}
              <div className="flex items-center justify-between py-3 text-sm">
                <span className="text-surface-500">Member Since</span>
                <span className="text-surface-900 dark:text-white">{new Date(p.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile + Financial Summary */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                <Button variant={editing ? "default" : "outline"} size="sm" onClick={() => editing ? handleSave() : setEditing(true)} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editing ? "Save Changes" : "Edit Profile"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Full Name</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={!editing} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Email</label>
                  <Input value={p.email || ""} disabled />
                  <p className="text-xs text-surface-500">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Phone</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!editing} placeholder="+1 234 567 8900" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Membership Level</label>
                  <Input value={p.membership_level} disabled className="capitalize" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-surface-200 p-4 dark:border-surface-700">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
                      <Wallet className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                    </div>
                    <span className="text-sm text-surface-500">Wallet Balance</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-surface-900 dark:text-white">{formatCurrency(p.wallet_balance)}</p>
                </div>
                <div className="rounded-lg border border-surface-200 p-4 dark:border-surface-700">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-50 dark:bg-success-500/10">
                      <TrendingUp className="h-4 w-4 text-success-600 dark:text-success-400" />
                    </div>
                    <span className="text-sm text-surface-500">Total Investment</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-surface-900 dark:text-white">{formatCurrency(p.total_investment)}</p>
                </div>
                <div className="rounded-lg border border-surface-200 p-4 dark:border-surface-700">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 dark:bg-accent-500/10">
                      <DollarSign className="h-4 w-4 text-accent-600 dark:text-accent-400" />
                    </div>
                    <span className="text-sm text-surface-500">Total Profit</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-success-600 dark:text-success-400">{formatCurrency(p.total_profit)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral Code */}
          {p.referral_code && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Referral Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex-1 rounded-lg border border-surface-200 bg-surface-50 px-4 py-3 font-mono text-sm dark:border-surface-700 dark:bg-surface-800">
                    {p.referral_code}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleCopyReferralCode}>
                    {copiedCode ? <Check className="mr-2 h-4 w-4 text-success-600" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copiedCode ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <p className="mt-2 text-xs text-surface-500">Share this code to refer friends and earn 5% of their first deposit</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// KYC Upload Form
// ═══════════════════════════════════════════════════════════════════════
function KycUploadForm({
  kycIdFile, setKycIdFile,
  kycAddressFile, setKycAddressFile,
  kycSelfieFile, setKycSelfieFile,
  kycSubmitting,
  onSubmit,
}: {
  kycIdFile: File | null; setKycIdFile: (f: File | null) => void;
  kycAddressFile: File | null; setKycAddressFile: (f: File | null) => void;
  kycSelfieFile: File | null; setKycSelfieFile: (f: File | null) => void;
  kycSubmitting: boolean;
  onSubmit: () => void;
}) {
  const FileSlot = ({ label, file, onChange, accept }: { label: string; file: File | null; onChange: (f: File | null) => void; accept: string }) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-surface-600 dark:text-surface-400">{label}</label>
      <div className="flex items-center gap-2">
        <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-surface-200 bg-white px-3 py-2 text-xs text-surface-500 transition-colors hover:border-brand-300 hover:bg-brand-50/30 dark:border-surface-600 dark:bg-surface-700 dark:hover:border-brand-600 dark:hover:bg-brand-500/5">
          <Upload className="h-3.5 w-3.5 shrink-0" />
          {file ? <span className="truncate text-surface-700 dark:text-surface-300">{file.name}</span> : <span>Choose file...</span>}
          <input type="file" accept={accept} className="hidden" onChange={(e) => onChange(e.target.files?.[0] || null)} />
        </label>
        {file && (
          <button onClick={() => onChange(null)} className="shrink-0 rounded p-1 text-surface-400 hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-600">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-2 pt-1">
      <FileSlot label="Government ID (passport, driver's license, national ID)" file={kycIdFile} onChange={setKycIdFile} accept=".jpg,.jpeg,.png,.pdf" />
      <FileSlot label="Proof of Address (utility bill, bank statement)" file={kycAddressFile} onChange={setKycAddressFile} accept=".jpg,.jpeg,.png,.pdf" />
      <FileSlot label="Selfie with ID" file={kycSelfieFile} onChange={setKycSelfieFile} accept=".jpg,.jpeg,.png,.webp" />
      <Button size="sm" onClick={onSubmit} disabled={kycSubmitting || !kycIdFile || !kycAddressFile || !kycSelfieFile} className="w-full">
        {kycSubmitting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
        Submit for Verification
      </Button>
    </div>
  );
}
