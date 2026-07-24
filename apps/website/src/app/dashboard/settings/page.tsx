"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { Shield, Bell, Globe, Palette, Wallet, Key, Trash2, Download, Monitor, Smartphone } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({ email: true, push: true, deposits: true, withdrawals: true, investments: true, signals: true, news: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Manage your account preferences</p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-surface-500" />
            <div>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the dashboard looks</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "system", label: "System" }].map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`rounded-lg border-2 px-6 py-3 text-sm font-medium transition-colors ${theme === t.value ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" : "border-surface-200 text-surface-600 hover:border-surface-300 dark:border-surface-700 dark:text-surface-400"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-surface-500" />
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose what notifications you receive</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-900 dark:text-white capitalize">{key.replace(/([A-Z])/g, " $1")} notifications</p>
                <p className="text-xs text-surface-500">Receive notifications about {key.replace(/([A-Z])/g, " $1").toLowerCase()}</p>
              </div>
              <button
                onClick={() => setNotifications((prev) => ({ ...prev, [key]: !value }))}
                className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-brand-600" : "bg-surface-200 dark:bg-surface-700"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${value ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-surface-500" />
            <div>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-surface-200 p-4 dark:border-surface-700">
            <div>
              <p className="font-medium text-surface-900 dark:text-white">Password</p>
              <p className="text-sm text-surface-500">Last changed 30 days ago</p>
            </div>
            <Button variant="outline" size="sm">Change Password</Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-surface-200 p-4 dark:border-surface-700">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-surface-900 dark:text-white">Two-Factor Authentication</p>
                <Badge variant="success">Enabled</Badge>
              </div>
              <p className="text-sm text-surface-500">Authenticator app configured</p>
            </div>
            <Button variant="outline" size="sm">Manage</Button>
          </div>
          <div className="rounded-lg border border-surface-200 p-4 dark:border-surface-700">
            <p className="font-medium text-surface-900 dark:text-white mb-3">Active Sessions</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Monitor className="h-4 w-4 text-surface-500" />
                  <div>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">Chrome on Windows</p>
                    <p className="text-xs text-surface-500">Current session</p>
                  </div>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4 w-4 text-surface-500" />
                  <div>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">Safari on iPhone</p>
                    <p className="text-xs text-surface-500">Last active 2 hours ago</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-danger-600">Revoke</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-surface-500" />
            <div>
              <CardTitle>Wallet Management</CardTitle>
              <CardDescription>Manage your connected wallets</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button variant="outline">Manage Wallets</Button>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Download className="h-5 w-5 text-surface-500" />
            <div>
              <CardTitle>Data & Privacy</CardTitle>
              <CardDescription>Manage your data and privacy settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-surface-900 dark:text-white">Export Data</p>
              <p className="text-sm text-surface-500">Download a copy of your data</p>
            </div>
            <Button variant="outline" size="sm">Export</Button>
          </div>
          <div className="flex items-center justify-between border-t border-surface-200 pt-3 dark:border-surface-700">
            <div>
              <p className="font-medium text-danger-600">Delete Account</p>
              <p className="text-sm text-surface-500">Permanently delete your account and all data</p>
            </div>
            <Button variant="outline" size="sm" className="border-danger-200 text-danger-600 hover:bg-danger-50">Delete</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
