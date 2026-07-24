"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, cn } from "@/lib/utils";
import { Wallet, ArrowUpRight, ArrowDownRight, Copy, Plus, Trash2, ExternalLink, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";

interface WalletItem {
  id: string;
  label: string;
  address: string;
  currency: string;
  network: string;
  is_default: boolean;
}

interface ProfileData {
  wallet_balance: number;
  total_investment: number;
  total_profit: number;
}

export default function WalletPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [profile, setProfile] = useState<ProfileData>({ wallet_balance: 0, total_investment: 0, total_profit: 0 });
  const [activeInvestmentCount, setActiveInvestmentCount] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWallet, setNewWallet] = useState({ label: "", address: "", currency: "USDT", network: "TRC20" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch wallets
      const { data: walletsData } = await supabase
        .from("mc_wallets")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      if (walletsData) setWallets(walletsData);

      // Fetch profile balances
      const { data: profileData } = await supabase
        .from("mc_profiles")
        .select("wallet_balance, total_investment, total_profit")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile({
          wallet_balance: Number(profileData.wallet_balance || 0),
          total_investment: Number(profileData.total_investment || 0),
          total_profit: Number(profileData.total_profit || 0),
        });
      }

      // Count active investments
      const { count } = await supabase
        .from("mc_investments")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "active");

      setActiveInvestmentCount(count || 0);

      setLoading(false);
    };

    fetchData();
  }, [user, supabase]);

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(address);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleAddWallet = async () => {
    if (!user || !newWallet.label || !newWallet.address) return;
    setAdding(true);

    const { data, error } = await supabase
      .from("mc_wallets")
      .insert({
        user_id: user.id,
        label: newWallet.label,
        address: newWallet.address,
        currency: newWallet.currency,
        network: newWallet.network,
        is_default: wallets.length === 0,
      })
      .select()
      .single();

    if (!error && data) {
      setWallets((prev) => [...prev, data]);
      setNewWallet({ label: "", address: "", currency: "USDT", network: "TRC20" });
      setShowAddForm(false);
    }
    setAdding(false);
  };

  const handleDeleteWallet = async (id: string) => {
    await supabase.from("mc_wallets").delete().eq("id", id);
    setWallets((prev) => prev.filter((w) => w.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Wallet</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Manage your wallet addresses and balances</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Wallet
        </Button>
      </div>

      {/* Add Wallet Form */}
      {showAddForm && (
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-surface-900 dark:text-white">New Wallet Address</h3>
              <button onClick={() => setShowAddForm(false)}><X className="h-4 w-4 text-surface-500" /></button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Label</label>
                <Input placeholder="e.g. Main USDT Wallet" value={newWallet.label} onChange={(e) => setNewWallet({ ...newWallet, label: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Address</label>
                <Input placeholder="Wallet address" value={newWallet.address} onChange={(e) => setNewWallet({ ...newWallet, address: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Currency</label>
                <Input value={newWallet.currency} onChange={(e) => setNewWallet({ ...newWallet, currency: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Network</label>
                <Input placeholder="e.g. TRC20, ERC20" value={newWallet.network} onChange={(e) => setNewWallet({ ...newWallet, network: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleAddWallet} disabled={adding || !newWallet.label || !newWallet.address}>
                {adding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : "Add Wallet"}
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Balance Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-surface-500 dark:text-surface-400">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{formatCurrency(profile.wallet_balance)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-surface-500 dark:text-surface-400">Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{formatCurrency(profile.total_investment)}</p>
            <p className="mt-1 text-xs text-surface-500">{activeInvestmentCount} active investments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-surface-500 dark:text-surface-400">Available Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success-600 dark:text-success-500">{formatCurrency(profile.total_profit)}</p>
            <p className="mt-1 text-xs text-surface-500">Ready to withdraw</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-surface-500 dark:text-surface-400">Wallets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{wallets.length}</p>
            <p className="mt-1 text-xs text-surface-500">Saved addresses</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="cursor-pointer transition-colors hover:border-brand-200 dark:hover:border-brand-800">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-50 dark:bg-success-500/10">
              <ArrowDownRight className="h-5 w-5 text-success-600 dark:text-success-500" />
            </div>
            <div>
              <p className="font-semibold text-surface-900 dark:text-white">Deposit</p>
              <p className="text-sm text-surface-500 dark:text-surface-400">Fund your wallet</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer transition-colors hover:border-brand-200 dark:hover:border-brand-800">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger-50 dark:bg-danger-500/10">
              <ArrowUpRight className="h-5 w-5 text-danger-600 dark:text-danger-500" />
            </div>
            <div>
              <p className="font-semibold text-surface-900 dark:text-white">Withdraw</p>
              <p className="text-sm text-surface-500 dark:text-surface-400">Withdraw to your wallet</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer transition-colors hover:border-brand-200 dark:hover:border-brand-800">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
              <Wallet className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <p className="font-semibold text-surface-900 dark:text-white">Connect Web3</p>
              <p className="text-sm text-surface-500 dark:text-surface-400">MetaMask, WalletConnect</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saved Wallets */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-surface-900 dark:text-white">Saved Wallets</h2>
        <div className="space-y-3">
          {wallets.length === 0 ? (
            <div className="py-8 text-center">
              <Wallet className="mx-auto h-12 w-12 text-surface-300 dark:text-surface-600" />
              <p className="mt-4 text-sm text-surface-500">No wallets saved yet</p>
              <Button className="mt-4" onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />Add Your First Wallet
              </Button>
            </div>
          ) : (
            wallets.map((wallet) => (
              <Card key={wallet.id}>
                <CardContent className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-100 dark:bg-surface-800">
                      <Wallet className="h-5 w-5 text-surface-600 dark:text-surface-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-surface-900 dark:text-white">{wallet.label}</p>
                        {wallet.is_default && <Badge variant="default">Default</Badge>}
                      </div>
                      <p className="mt-0.5 font-mono text-sm text-surface-500 dark:text-surface-400">
                        {wallet.address.slice(0, 12)}...{wallet.address.slice(-8)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => copyAddress(wallet.address)}>
                      <Copy className="h-4 w-4" />
                      {copied === wallet.address ? "Copied!" : ""}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-danger-600 hover:text-danger-700" onClick={() => handleDeleteWallet(wallet.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
