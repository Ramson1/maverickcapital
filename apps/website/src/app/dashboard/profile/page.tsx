"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Shield, CheckCircle2, AlertCircle, Loader2, Wallet, TrendingUp, DollarSign, Copy, Check, Users, ChevronDown, Upload, X, User, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
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
  withdrawal_address: string | null;
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
  const { error: showError, success: showSuccess } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [withdrawalAddress, setWithdrawalAddress] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);

  // Expandable sections
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // KYC state
  const [kycIdFile, setKycIdFile] = useState<File | null>(null);
  const [kycAddressFile, setKycAddressFile] = useState<File | null>(null);
  const [kycSelfieFile, setKycSelfieFile] = useState<File | null>(null);
  const [kycSubmitting, setKycSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        if (!authLoading) setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("mc_profiles")
        .select("full_name, phone, kyc_status, account_status, membership_level, avatar_url, wallet_balance, total_investment, total_profit, referral_code, withdrawal_address, created_at")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        // Also compute total deposit from actual approved deposits (fallback if profile is out of sync)
        const { data: approvedDeposits } = await supabase
          .from("mc_deposits")
          .select("amount")
          .eq("user_id", user.id)
          .eq("status", "approved");
        const depositsTotal = (approvedDeposits || []).reduce((sum, d) => sum + Number(d.amount), 0);
        const profileTotalInvestment = Number(data.total_investment) || 0;
        const actualTotalDeposit = Math.max(profileTotalInvestment, depositsTotal);

        setProfile({
          ...data,
          email: user.email || null,
          wallet_balance: Number(data.wallet_balance) || 0,
          total_investment: actualTotalDeposit,
          total_profit: Number(data.total_profit) || 0,
        });
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setWithdrawalAddress(data.withdrawal_address || "");
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
    withdrawal_address: null,
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

  // KYC submission - stores documents as compressed base64 in database
  const handleKycSubmit = async () => {
    if (!user || !kycIdFile || !kycAddressFile || !kycSelfieFile) return;
    setKycSubmitting(true);
    try {
      // Compress image to base64 with size limit
      const compressImage = (file: File, maxWidth = 1200, quality = 0.7): Promise<string> =>
        new Promise((resolve, reject) => {
          // For PDFs, just convert to base64 directly (no compression)
          if (file.type === "application/pdf") {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsDataURL(file);
            return;
          }

          const img = new Image();
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          img.onload = () => {
            // Calculate new dimensions
            let width = img.width;
            let height = img.height;
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
            canvas.width = width;
            canvas.height = height;

            ctx?.drawImage(img, 0, 0, width, height);
            // Convert to compressed JPEG base64
            const compressed = canvas.toDataURL("image/jpeg", quality);
            resolve(compressed);
          };
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = URL.createObjectURL(file);
        });

      const [idData, addressData, selfieData] = await Promise.all([
        compressImage(kycIdFile),
        compressImage(kycAddressFile),
        compressImage(kycSelfieFile),
      ]);

      // Delete any existing pending submission for this user
      await supabase.from("mc_kyc_submissions").delete().eq("user_id", user.id).eq("status", "pending");

      // Insert new submission with compressed base64 data
      const { error: insertError } = await supabase.from("mc_kyc_submissions").insert({
        user_id: user.id,
        id_document_data: idData,
        address_document_data: addressData,
        selfie_document_data: selfieData,
        id_document_name: kycIdFile.name,
        address_document_name: kycAddressFile.name,
        selfie_document_name: kycSelfieFile.name,
        status: "pending",
      });

      if (insertError) throw insertError;

      await supabase.from("mc_profiles").update({ kyc_status: "pending" }).eq("id", user.id);
      setProfile((prev) => prev ? { ...prev, kyc_status: "pending" } : prev);
      setKycIdFile(null);
      setKycAddressFile(null);
      setKycSelfieFile(null);
      setExpandedSection(null);
      showSuccess("KYC Submitted", "Your documents have been submitted for verification.");
    } catch (err) {
      console.error("KYC submission failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to submit KYC documents. Please try again.";
      showError("KYC Submission Failed", errorMessage);
    } finally {
      setKycSubmitting(false);
    }
  };

  // Withdrawal address
  const handleSaveWithdrawalAddress = async () => {
    if (!user) return;
    setSavingAddress(true);
    try {
      await supabase
        .from("mc_profiles")
        .update({ withdrawal_address: withdrawalAddress.trim() || null, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      setProfile((prev) => prev ? { ...prev, withdrawal_address: withdrawalAddress.trim() || null } : prev);
      setExpandedSection(null);
    } catch (err) {
      console.error("Failed to save withdrawal address:", err);
    } finally {
      setSavingAddress(false);
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

              {/* Withdrawal Settings */}
              <div>
                <button onClick={() => toggleSection("withdrawal")} className="flex w-full items-center justify-between py-3 text-sm transition-colors hover:text-surface-900 dark:hover:text-white">
                  <span className="text-surface-500">Withdrawal Address</span>
                  <div className="flex items-center gap-2">
                    {p.withdrawal_address ? (
                      <span className="flex items-center gap-1 text-xs text-success-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Set
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-warning-600">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Not set
                      </span>
                    )}
                    <ChevronDown className={cn("h-3.5 w-3.5 text-surface-400 transition-transform", expandedSection === "withdrawal" && "rotate-180")} />
                  </div>
                </button>
                {expandedSection === "withdrawal" && (
                  <div className="pb-3">
                    <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-surface-700 dark:bg-surface-800">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-surface-700 dark:text-surface-300">USDT TRC20 Withdrawal Address</p>
                            <p className="mt-1 text-xs text-surface-500">This address will be used for all withdrawal requests. Make sure it supports USDT on the TRC20 (Tron) network.</p>
                          </div>
                        </div>
                        <Input
                          placeholder="Enter your USDT TRC20 wallet address"
                          value={withdrawalAddress}
                          onChange={(e) => setWithdrawalAddress(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveWithdrawalAddress} disabled={savingAddress || !withdrawalAddress.trim()}>
                            {savingAddress ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Saving...</> : <><Save className="mr-2 h-3.5 w-3.5" />Save Address</>}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setWithdrawalAddress(p.withdrawal_address || ""); setExpandedSection(null); }}>
                            Cancel
                          </Button>
                        </div>
                      </div>
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
                  <p className="mt-2 text-xl font-bold text-surface-900 dark:text-white">{formatCurrency(p.total_investment + p.total_profit)}</p>
                </div>
                <div className="rounded-lg border border-surface-200 p-4 dark:border-surface-700">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-50 dark:bg-success-500/10">
                      <TrendingUp className="h-4 w-4 text-success-600 dark:text-success-400" />
                    </div>
                    <span className="text-sm text-surface-500">Total Deposit</span>
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
        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 overflow-hidden rounded-lg border border-surface-200 bg-white px-3 py-2 text-xs text-surface-500 transition-colors hover:border-brand-300 hover:bg-brand-50/30 dark:border-surface-600 dark:bg-surface-700 dark:hover:border-brand-600 dark:hover:bg-brand-500/5">
          <Upload className="h-3.5 w-3.5 shrink-0" />
          {file ? (
            <span className="min-w-0 flex-1 truncate text-surface-700 dark:text-surface-300" title={file.name}>
              {file.name}
            </span>
          ) : (
            <span>Choose file...</span>
          )}
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
