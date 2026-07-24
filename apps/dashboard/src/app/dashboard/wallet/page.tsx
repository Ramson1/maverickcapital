"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import { Wallet, ArrowUpRight, ArrowDownRight, Copy, Plus, Trash2, ExternalLink } from "lucide-react";

const mockWallets = [
  { id: "1", label: "Main USDT (TRC20)", address: "TN3W4H8rK2p8B6wQ9mL5J7vR1sD9fG2hXk", currency: "USDT", network: "TRC20", isDefault: true },
  { id: "2", label: "BTC Wallet", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", currency: "BTC", network: "Bitcoin", isDefault: false },
];

export default function WalletPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(address);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Wallet</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Manage your wallet addresses and balances</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Wallet
        </Button>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-surface-500 dark:text-surface-400">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{formatCurrency(12500)}</p>
            <p className="mt-1 text-xs text-success-600 dark:text-success-500">+2.4% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-surface-500 dark:text-surface-400">Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{formatCurrency(25000)}</p>
            <p className="mt-1 text-xs text-surface-500">3 active investments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-surface-500 dark:text-surface-400">Available Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success-600 dark:text-success-500">{formatCurrency(3750)}</p>
            <p className="mt-1 text-xs text-surface-500">Ready to withdraw</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-surface-500 dark:text-surface-400">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-warning-600 dark:text-warning-500">{formatCurrency(1000)}</p>
            <p className="mt-1 text-xs text-surface-500">1 withdrawal pending</p>
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
          {mockWallets.map((wallet) => (
            <Card key={wallet.id}>
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-100 dark:bg-surface-800">
                    <Wallet className="h-5 w-5 text-surface-600 dark:text-surface-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-surface-900 dark:text-white">{wallet.label}</p>
                      {wallet.isDefault && <Badge variant="default">Default</Badge>}
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
                  <Button variant="ghost" size="sm" className="text-danger-600 hover:text-danger-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
