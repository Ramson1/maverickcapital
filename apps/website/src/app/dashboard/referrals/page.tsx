"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import { useReferral } from "@/hooks/useReferral";
import { useAuth } from "@/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  DollarSign,
  Clock,
  Copy,
  Check,
  Share2,
  Link2,
  Loader2,
  Gift,
  TrendingUp,
  Lock,
} from "lucide-react";
import { ReferralSkeleton } from "@/components/ui/PageSkeletons";
import Link from "next/link";

export default function ReferralPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const { referralCode, totalReferrals, totalCommission, pendingCommission, referrals, loading, refetch } = useReferral();
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [hasDeposited, setHasDeposited] = useState<boolean | null>(null);
  const [checkingDeposit, setCheckingDeposit] = useState(true);

  // Check if user has made any deposits
  useEffect(() => {
    const checkDeposits = async () => {
      if (!user) {
        setCheckingDeposit(false);
        return;
      }
      const { data, error } = await supabase
        .from("mc_deposits")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "approved")
        .limit(1);
      
      setHasDeposited(!!(data && data.length > 0));
      setCheckingDeposit(false);
    };
    checkDeposits();
  }, [user, supabase]);

  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/register?ref=${referralCode || ""}`
    : "";

  const handleCopyCode = async () => {
    if (!referralCode) return;
    await navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShare = async () => {
    if (!referralLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Maverick Capital",
          text: `Use my referral code ${referralCode} to sign up and start investing!`,
          url: referralLink,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  if (loading || checkingDeposit) {
    return <ReferralSkeleton />;
  }

  // Gate: User must have made at least one deposit to access referral program
  if (!hasDeposited) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Affiliate Program</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            Refer friends and earn <span className="font-semibold text-brand-600 dark:text-brand-400">5%</span> of their first deposit
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-100 dark:bg-surface-800">
              <Lock className="h-8 w-8 text-surface-400 dark:text-surface-500" />
            </div>
            <h2 className="mt-6 text-lg font-semibold text-surface-900 dark:text-white">Deposit Required</h2>
            <p className="mt-2 max-w-sm text-sm text-surface-500 dark:text-surface-400">
              You need to make at least one deposit to unlock the affiliate program and start earning referral commissions.
            </p>
            <Link href="/dashboard/deposits">
              <Button className="mt-6">
                <DollarSign className="mr-2 h-4 w-4" />
                Make a Deposit
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Affiliate Program</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          Refer friends and earn <span className="font-semibold text-brand-600 dark:text-brand-400">5%</span> of their first deposit
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
                <Users className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <p className="text-xs text-surface-500 dark:text-surface-400">Total Referrals</p>
                <p className="text-xl font-bold text-surface-900 dark:text-white">{totalReferrals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50 dark:bg-success-500/10">
                <DollarSign className="h-5 w-5 text-success-600 dark:text-success-500" />
              </div>
              <div>
                <p className="text-xs text-surface-500 dark:text-surface-400">Total Earned</p>
                <p className="text-xl font-bold text-surface-900 dark:text-white">{formatCurrency(totalCommission)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-50 dark:bg-warning-500/10">
                <Clock className="h-5 w-5 text-warning-600 dark:text-warning-500" />
              </div>
              <div>
                <p className="text-xs text-surface-500 dark:text-surface-400">Pending Commission</p>
                <p className="text-xl font-bold text-surface-900 dark:text-white">{formatCurrency(pendingCommission)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Your Referral Code & Link */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Gift className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <h2 className="text-base font-semibold text-surface-900 dark:text-white">Your Referral Code</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-lg border border-surface-200 bg-surface-50 px-4 py-3 font-mono text-lg font-bold tracking-wider text-surface-900 dark:border-surface-700 dark:bg-surface-800 dark:text-white">
                {referralCode || "N/A"}
              </div>
              <button
                onClick={handleCopyCode}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-lg border transition-colors",
                  copied
                    ? "border-success-500 bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
                    : "border-surface-200 bg-white text-surface-600 hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700"
                )}
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
            {copied && (
              <p className="mt-2 text-xs text-success-600 dark:text-success-400">Code copied!</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Link2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <h2 className="text-base font-semibold text-surface-900 dark:text-white">Your Referral Link</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 truncate rounded-lg border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-600 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-400">
                {referralLink}
              </div>
              <button
                onClick={handleCopyLink}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-lg border transition-colors",
                  copiedLink
                    ? "border-success-500 bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
                    : "border-surface-200 bg-white text-surface-600 hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700"
                )}
              >
                {copiedLink ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
            {copiedLink && (
              <p className="mt-2 text-xs text-success-600 dark:text-success-400">Link copied!</p>
            )}
            <button
              onClick={handleShare}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg gradient-brand px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <Share2 className="h-4 w-4" />
              Share Referral Link
            </button>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <h2 className="text-base font-semibold text-surface-900 dark:text-white">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col items-center rounded-lg border border-surface-100 p-4 text-center dark:border-surface-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-lg font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">1</div>
              <p className="mt-3 text-sm font-medium text-surface-900 dark:text-white">Share Your Link</p>
              <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">Send your unique referral link to friends and family</p>
            </div>
            <div className="flex flex-col items-center rounded-lg border border-surface-100 p-4 text-center dark:border-surface-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-lg font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">2</div>
              <p className="mt-3 text-sm font-medium text-surface-900 dark:text-white">Friend Signs Up</p>
              <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">They register using your link and make their first deposit</p>
            </div>
            <div className="flex flex-col items-center rounded-lg border border-surface-100 p-4 text-center dark:border-surface-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-lg font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">3</div>
              <p className="mt-3 text-sm font-medium text-surface-900 dark:text-white">Earn 5% Commission</p>
              <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">Get 5% of their first deposit added to your wallet instantly</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral History */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-surface-200 p-6 dark:border-surface-700">
            <h2 className="text-base font-semibold text-surface-900 dark:text-white">Referral History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">First Deposit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Commission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500 dark:text-surface-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {referrals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-surface-400">
                      No referrals yet. Share your link to get started!
                    </td>
                  </tr>
                ) : (
                  referrals.map((ref) => (
                    <tr key={ref.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-surface-900 dark:text-white">{ref.user_name}</p>
                          <p className="text-xs text-surface-500 dark:text-surface-400">{ref.user_email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">
                        {ref.first_deposit_amount ? formatCurrency(ref.first_deposit_amount) : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-success-600 dark:text-success-400">
                        {formatCurrency(ref.commission_earned)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={ref.status === "completed" ? "success" : ref.status === "pending" ? "warning" : "default"}>
                          {ref.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">
                        {new Date(ref.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
