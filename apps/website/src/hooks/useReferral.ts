"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";

interface ReferralData {
  referralCode: string | null;
  totalReferrals: number;
  totalCommission: number;
  pendingCommission: number;
  referrals: Referral[];
  loading: boolean;
  refetch: () => Promise<void>;
}

interface Referral {
  id: string;
  referred_user_id: string;
  user_name: string;
  user_email: string;
  commission_earned: number;
  first_deposit_amount: number | null;
  first_deposit_at: string | null;
  status: string;
  created_at: string;
}

export function useReferral(): ReferralData {
  const { user } = useAuth();
  const supabase = createClient();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [pendingCommission, setPendingCommission] = useState(0);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Get user's referral code
      const { data: profile } = await supabase
        .from("mc_profiles")
        .select("referral_code")
        .eq("id", user.id)
        .single();

      setReferralCode(profile?.referral_code || null);

      // Get referrals made by this user
      const { data: referralList } = await supabase
        .from("mc_referrals")
        .select(`
          id,
          referred_user_id,
          commission_earned,
          first_deposit_amount,
          first_deposit_at,
          status,
          created_at,
          mc_profiles!referrals_referred_user_id_fkey(full_name, email)
        `)
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      const mappedReferrals: Referral[] = (referralList || []).map((r: any) => ({
        id: r.id,
        referred_user_id: r.referred_user_id,
        user_name: r.mc_profiles?.full_name || "Unknown",
        user_email: r.mc_profiles?.email || "",
        commission_earned: Number(r.commission_earned || 0),
        first_deposit_amount: r.first_deposit_amount ? Number(r.first_deposit_amount) : null,
        first_deposit_at: r.first_deposit_at,
        status: r.status,
        created_at: r.created_at,
      }));

      setReferrals(mappedReferrals);
      setTotalReferrals(mappedReferrals.length);

      const total = mappedReferrals.reduce((sum, r) => sum + r.commission_earned, 0);
      const pending = mappedReferrals
        .filter((r) => r.status === "pending")
        .reduce((sum, r) => sum + (r.first_deposit_amount || 0) * 0.05, 0);

      setTotalCommission(total);
      setPendingCommission(pending);
    } catch (err) {
      console.error("Failed to fetch referral data:", err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    referralCode,
    totalReferrals,
    totalCommission,
    pendingCommission,
    referrals,
    loading,
    refetch: fetchData,
  };
}
