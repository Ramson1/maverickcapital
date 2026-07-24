"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, cn } from "@/lib/utils";
import { Plus, TrendingUp, DollarSign, Users, BarChart3, Download, FileText, Clock, Search, Bell, Send, Edit, Trash2, Pin, Image, Eye, MessageSquare, AlertCircle, CheckCircle, Activity, Shield, Settings, Layout, Megaphone } from "lucide-react";

// Admin Signals Page
export function AdminSignalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Signals Management</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Create and manage trading signals</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" />Create Signal</Button>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <TrendingUp className="h-12 w-12 text-surface-300 dark:text-surface-600" />
          <p className="mt-4 text-sm text-surface-500">Signal management interface - Create, edit, and schedule trading signals</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Admin News Page
export function AdminNewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">News Management</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Create and manage news articles</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" />Create Article</Button>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-surface-300 dark:text-surface-600" />
          <p className="mt-4 text-sm text-surface-500">News management interface - Create articles with rich text editor, categories, and scheduling</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Admin Support Page
export function AdminSupportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Support Dashboard</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Manage support tickets</p>
        </div>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="h-12 w-12 text-surface-300 dark:text-surface-600" />
          <p className="mt-4 text-sm text-surface-500">Support dashboard - View all tickets, assign agents, reply in real-time</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Admin Analytics Page
export function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Platform-wide analytics and reports</p>
        </div>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export Report</Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[{ name: "Total Revenue", value: formatCurrency(42800), icon: DollarSign }, { name: "Active Users", value: "892", icon: Users }, { name: "Total Investments", value: formatCurrency(284500), icon: TrendingUp }, { name: "Growth Rate", value: "+15.3%", icon: BarChart3 }].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
                    <Icon className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-500">{stat.name}</p>
                    <p className="text-lg font-bold text-surface-900 dark:text-white">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Admin Audit Logs Page
export function AdminAuditLogsPage() {
  const logs = [
    { id: "1", admin: "admin@maverick.com", action: "Approved deposit", target: "John Doe - $5,000", time: "2026-07-25 10:30", ip: "192.168.1.1" },
    { id: "2", admin: "admin@maverick.com", action: "Applied profit", target: "Growth Plan investments", time: "2026-07-25 09:00", ip: "192.168.1.1" },
    { id: "3", admin: "moderator@maverick.com", action: "Posted signal", target: "BTC/USDT", time: "2026-07-24 14:30", ip: "192.168.1.2" },
    { id: "4", admin: "admin@maverick.com", action: "Suspended user", target: "emma@example.com", time: "2026-07-24 11:00", ip: "192.168.1.1" },
    { id: "5", admin: "admin@maverick.com", action: "Processed withdrawal", target: "Mike Johnson - $2,000", time: "2026-07-23 16:45", ip: "192.168.1.1" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Audit Logs</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Complete audit trail of admin actions</p>
        </div>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Admin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Target</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                    <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{log.admin}</td>
                    <td className="px-6 py-4 text-sm font-medium text-surface-900 dark:text-white">{log.action}</td>
                    <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{log.target}</td>
                    <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{log.time}</td>
                    <td className="px-6 py-4 font-mono text-xs text-surface-500">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Admin Notifications Page
export function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Notifications Management</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Send and manage notifications</p>
        </div>
        <Button><Send className="mr-2 h-4 w-4" />Send Notification</Button>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bell className="h-12 w-12 text-surface-300 dark:text-surface-600" />
          <p className="mt-4 text-sm text-surface-500">Broadcast notifications to all users or target specific groups</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Admin CMS Page
export function AdminCMSPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Content Management</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Manage website and app content</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[{ title: "Homepage Banners", desc: "Manage hero banners and promotions", icon: Layout }, { title: "FAQs", desc: "Frequently asked questions", icon: MessageSquare }, { title: "Terms & Privacy", desc: "Legal documents", icon: FileText }, { title: "About Page", desc: "Company information", icon: Users }, { title: "Contact Info", desc: "Contact details and form", icon: MessageSquare }, { title: "Announcements", desc: "System-wide announcements", icon: Megaphone }].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="cursor-pointer hover:border-brand-200 dark:hover:border-brand-800">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
                  <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="font-semibold text-surface-900 dark:text-white">{item.title}</p>
                  <p className="text-sm text-surface-500">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Admin Wallets Page
export function AdminWalletsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Wallet Management</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Monitor and verify user wallets</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="h-12 w-12 text-surface-300 dark:text-surface-600" />
          <p className="mt-4 text-sm text-surface-500">View all connected wallets, verify/blacklist, and monitor usage</p>
        </CardContent>
      </Card>
    </div>
  );
}
