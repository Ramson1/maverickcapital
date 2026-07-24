"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import { Users, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, AlertCircle, CheckCircle2, Eye, Shield, Activity } from "lucide-react";

const stats = [
  { name: "Total Users", value: "1,247", change: "+12%", icon: Users, color: "text-brand-600", bg: "bg-brand-50 dark:bg-brand-500/10" },
  { name: "Total Investments", value: formatCurrency(284500), change: "+8.5%", icon: TrendingUp, color: "text-success-600", bg: "bg-success-50 dark:bg-success-500/10" },
  { name: "Total Deposits", value: formatCurrency(456000), change: "+15%", icon: DollarSign, color: "text-brand-600", bg: "bg-brand-50 dark:bg-brand-500/10" },
  { name: "Total Withdrawals", value: formatCurrency(128000), change: "+5%", icon: ArrowUpRight, color: "text-danger-600", bg: "bg-danger-50 dark:bg-danger-500/10" },
  { name: "Pending Deposits", value: "8", change: "", icon: Clock, color: "text-warning-600", bg: "bg-warning-50 dark:bg-warning-500/10" },
  { name: "Pending Withdrawals", value: "3", change: "", icon: Clock, color: "text-warning-600", bg: "bg-warning-50 dark:bg-warning-500/10" },
  { name: "Pending Tickets", value: "5", change: "", icon: AlertCircle, color: "text-accent-600", bg: "bg-accent-50 dark:bg-accent-500/10" },
  { name: "Revenue", value: formatCurrency(42800), change: "+22%", icon: DollarSign, color: "text-success-600", bg: "bg-success-50 dark:bg-success-500/10" },
];

const recentActivities = [
  { id: 1, action: "New user registered", user: "sarah@example.com", time: "2 min ago", type: "user" },
  { id: 2, action: "Deposit approved", user: "john@example.com", time: "15 min ago", type: "deposit" },
  { id: 3, action: "Withdrawal processed", user: "mike@example.com", time: "30 min ago", type: "withdrawal" },
  { id: 4, action: "Investment started", user: "emma@example.com", time: "1 hour ago", type: "investment" },
  { id: 5, action: "Support ticket opened", user: "alex@example.com", time: "2 hours ago", type: "support" },
  { id: 6, action: "Profit applied", user: "System", time: "3 hours ago", type: "profit" },
];

const pendingItems = [
  { id: 1, type: "Deposit", user: "john@example.com", amount: "$5,000", time: "15 min ago", urgent: false },
  { id: 2, type: "Withdrawal", user: "mike@example.com", amount: "$2,500", time: "30 min ago", urgent: false },
  { id: 3, type: "Deposit", user: "sarah@example.com", amount: "$10,000", time: "1 hour ago", urgent: true },
  { id: 4, type: "KYC", user: "alex@example.com", amount: "-", time: "2 hours ago", urgent: false },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Platform overview and quick actions</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive"><Shield className="mr-1 h-3 w-3" />Admin</Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", stat.bg)}>
                    <Icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                  {stat.change && (
                    <span className="text-xs font-medium text-success-600 dark:text-success-500">{stat.change}</span>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-xs text-surface-500 dark:text-surface-400">{stat.name}</p>
                  <p className="mt-0.5 text-lg font-bold text-surface-900 dark:text-white">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Recent Activity</CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs",
                    activity.type === "user" && "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
                    activity.type === "deposit" && "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500",
                    activity.type === "withdrawal" && "bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-500",
                    activity.type === "investment" && "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
                    activity.type === "support" && "bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400",
                    activity.type === "profit" && "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500"
                  )}>
                    {activity.type[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{activity.action}</p>
                    <p className="text-xs text-surface-500 truncate">{activity.user}</p>
                  </div>
                  <span className="text-xs text-surface-400 shrink-0">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Items */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-surface-100 p-3 dark:border-surface-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.type === "Deposit" ? "success" : item.type === "Withdrawal" ? "destructive" : "warning"}>{item.type}</Badge>
                      {item.urgent && <span className="h-2 w-2 rounded-full bg-danger-500" />}
                    </div>
                    <p className="mt-1 text-sm text-surface-600 dark:text-surface-400">{item.user}</p>
                    <p className="text-xs text-surface-400">{item.amount} &middot; {item.time}</p>
                  </div>
                  <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
