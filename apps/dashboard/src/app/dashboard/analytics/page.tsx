"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, DollarSign, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";

const stats = [
  { name: "Total Profit", value: "$3,750", change: "+12.5%", positive: true, icon: DollarSign },
  { name: "ROI", value: "15.0%", change: "+2.3%", positive: true, icon: TrendingUp },
  { name: "Best Month", value: "$1,250", change: "June 2026", positive: true, icon: ArrowUpRight },
  { name: "Avg. Return", value: "5.2%", change: "Monthly", positive: true, icon: BarChart3 },
];

const monthlyData = [
  { month: "Jan", profit: 450, deposits: 2000, withdrawals: 500 },
  { month: "Feb", profit: 620, deposits: 1500, withdrawals: 800 },
  { month: "Mar", profit: 380, deposits: 3000, withdrawals: 1000 },
  { month: "Apr", profit: 890, deposits: 5000, withdrawals: 2000 },
  { month: "May", profit: 750, deposits: 2500, withdrawals: 1500 },
  { month: "Jun", profit: 1250, deposits: 7500, withdrawals: 3000 },
  { month: "Jul", profit: 950, deposits: 4000, withdrawals: 1000 },
];

export default function AnalyticsPage() {
  const maxProfit = Math.max(...monthlyData.map((d) => d.profit));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Analytics</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Track your investment performance</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
                    <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <span className="flex items-center gap-0.5 text-xs font-medium text-success-600 dark:text-success-500">
                    {stat.change}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-surface-500 dark:text-surface-400">{stat.name}</p>
                  <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-white">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Profit Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Profit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 h-64">
            {monthlyData.map((d) => (
              <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative w-full flex justify-center">
                  <div
                    className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 transition-all"
                    style={{ height: `${(d.profit / maxProfit) * 200}px` }}
                  />
                </div>
                <span className="text-xs text-surface-500 dark:text-surface-400">{d.month}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deposits vs Withdrawals */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Deposits vs Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((d) => (
                <div key={d.month} className="flex items-center gap-4">
                  <span className="w-8 text-sm text-surface-500">{d.month}</span>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-success-500" style={{ width: `${(d.deposits / 7500) * 100}%` }} />
                      <span className="text-xs text-surface-500">{formatCurrency(d.deposits)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-danger-500" style={{ width: `${(d.withdrawals / 3000) * 100}%` }} />
                      <span className="text-xs text-surface-500">{formatCurrency(d.withdrawals)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between"><span className="text-surface-500">Total Invested</span><span className="font-semibold">{formatCurrency(25000)}</span></div>
            <div className="flex justify-between"><span className="text-surface-500">Current Value</span><span className="font-semibold text-brand-600">{formatCurrency(28750)}</span></div>
            <div className="flex justify-between"><span className="text-surface-500">Total Profit</span><span className="font-semibold text-success-600">{formatCurrency(3750)}</span></div>
            <div className="flex justify-between"><span className="text-surface-500">Total Deposited</span><span className="font-semibold">{formatCurrency(26000)}</span></div>
            <div className="flex justify-between"><span className="text-surface-500">Total Withdrawn</span><span className="font-semibold">{formatCurrency(9800)}</span></div>
            <div className="border-t border-surface-200 pt-4 dark:border-surface-700">
              <div className="flex justify-between"><span className="font-medium">Net Worth</span><span className="text-xl font-bold text-success-600">{formatCurrency(28750)}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
