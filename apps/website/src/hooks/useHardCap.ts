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
      // Fetch hard cap from mc_settings
      const { data: settings } = await supabase
        .from("mc_settings")
        .select("key, value")
        .in("key", ["platform_hard_cap"]);

      const settingsMap: Record<string, string> = {};
      settings?.forEach((s) => { settingsMap[s.key] = s.value; });
      const capAmount = Number(settingsMap["platform_hard_cap"] || 500000);
      setHardCap(capAmount);

      // Use RPC to get total raised (bypasses RLS)
      const { data: totalRaisedData } = await supabase.rpc("get_total_capital_raised");
      const total = Number(totalRaisedData || 0);
      setTotalRaised(total);
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
