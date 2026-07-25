"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface HardCapData {
  hardCap: number;
  totalRaised: number;
  percentage: number;
  isFull: boolean;
  depositsEnabled: boolean;
  loading: boolean;
  refetch: () => Promise<void>;
}

export function useHardCap(): HardCapData {
  const supabase = createClient();
  const [hardCap, setHardCap] = useState(500000);
  const [totalRaised, setTotalRaised] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch hard cap config
      const { data: config } = await supabase
        .from("mc_system_config")
        .select("value")
        .eq("key", "hard_cap")
        .single();

      const capAmount = config?.value?.amount ?? 500000;
      const enabled = config?.value?.enabled ?? true;
      setHardCap(capAmount);

      // Fetch total capital raised (approved deposits)
      const { data: deposits } = await supabase
        .from("mc_deposits")
        .select("amount")
        .eq("status", "approved");

      const total = deposits?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      setTotalRaised(total);

      // If no deposits yet, also check total_investment from profiles as fallback
      if (total === 0) {
        const { data: profiles } = await supabase
          .from("mc_profiles")
          .select("total_investment");
        const profileTotal = profiles?.reduce((sum, p) => sum + Number(p.total_investment || 0), 0) || 0;
        setTotalRaised(profileTotal);
      }
    } catch (err) {
      console.error("Failed to fetch hard cap data:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const percentage = hardCap > 0 ? Math.min((totalRaised / hardCap) * 100, 100) : 0;
  const isFull = totalRaised >= hardCap;

  return {
    hardCap,
    totalRaised,
    percentage,
    isFull,
    depositsEnabled: !isFull,
    loading,
    refetch: fetchData,
  };
}
