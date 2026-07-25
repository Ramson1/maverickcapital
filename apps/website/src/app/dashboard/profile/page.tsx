"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Shield, CheckCircle2, AlertCircle, Loader2, Wallet, TrendingUp, DollarSign, Copy, Check, Users } from "lucide-react";
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

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        if (!authLoading) setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("mc_profiles")
        .select("full_name, phone, kyc_status, account_status, membership_level, avatar_url, wallet_balance, total_investment, total_profit, referral_code, created_at")
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

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-12 w-12 text-surface-300 dark:text-surface-600" />
        <p className="mt-4 text-sm text-surface-500">Profile not found</p>
      </div>
    );
  }

  const kyc = kycLabels[profile.kyc_status] || kycLabels.not_submitted;
  const initials = (profile.full_name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleCopyReferralCode = async () => {
    if (!profile.referral_code) return;
    await navigator.clipboard.writeText(profile.referral_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
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
                <AvatarImage src={profile.avatar_url || ""} alt="Profile" />
                <AvatarFallback className="text-2xl bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400">{initials}</AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 rounded-full bg-brand-600 p-1.5 text-white shadow-sm hover:bg-brand-700">
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-surface-900 dark:text-white">{profile.full_name || "User"}</h2>
            <p className="text-sm text-surface-500">{profile.email}</p>
            <div className="mt-4 flex gap-2">
              <Badge variant="default" className="capitalize">{profile.membership_level}</Badge>
              <Badge variant={kyc.variant}>{kyc.label}</Badge>
            </div>
            <div className="mt-6 w-full space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-500">Account Status</span>
                <Badge variant={profile.account_status === "active" ? "success" : "destructive"} className="capitalize text-xs">
                  {profile.account_status}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-500">KYC Status</span>
                <span className={`flex items-center gap-1 ${profile.kyc_status === "verified" ? "text-success-600" : "text-surface-500"}`}>
                  {profile.kyc_status === "verified" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <span className="capitalize">{profile.kyc_status.replace("_", " ")}</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-500">2FA</span>
                <span className="flex items-center gap-1 text-surface-500"><Shield className="h-4 w-4" />Not configured</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-500">Member Since</span>
                <span className="text-surface-900 dark:text-white">{new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
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
                  <Input value={profile.email || ""} disabled />
                  <p className="text-xs text-surface-500">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Phone</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!editing} placeholder="+1 234 567 8900" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Membership Level</label>
                  <Input value={profile.membership_level} disabled className="capitalize" />
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
                  <p className="mt-2 text-xl font-bold text-surface-900 dark:text-white">{formatCurrency(profile.wallet_balance)}</p>
                </div>
                <div className="rounded-lg border border-surface-200 p-4 dark:border-surface-700">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-50 dark:bg-success-500/10">
                      <TrendingUp className="h-4 w-4 text-success-600 dark:text-success-400" />
                    </div>
                    <span className="text-sm text-surface-500">Total Investment</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-surface-900 dark:text-white">{formatCurrency(profile.total_investment)}</p>
                </div>
                <div className="rounded-lg border border-surface-200 p-4 dark:border-surface-700">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 dark:bg-accent-500/10">
                      <DollarSign className="h-4 w-4 text-accent-600 dark:text-accent-400" />
                    </div>
                    <span className="text-sm text-surface-500">Total Profit</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-success-600 dark:text-success-400">{formatCurrency(profile.total_profit)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral Code */}
          {profile.referral_code && (
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
                    {profile.referral_code}
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
