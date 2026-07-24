"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { Shield, Bell, Globe, Palette, Wallet, Key, Trash2, Download, Monitor, Smartphone, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";

interface Session {
  id: string;
  device_info: Record<string, string> | null;
  ip_address: string | null;
  last_active: string;
  is_revoked: boolean;
  created_at: string;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const supabase = createClient();

  const [notifications, setNotifications] = useState({ email: true, push: true, deposits: true, withdrawals: true, investments: true, signals: true, news: true });
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("mc_device_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_revoked", false)
        .order("last_active", { ascending: false });

      if (!error && data) setSessions(data);
      setLoadingSessions(false);
    };

    fetchSessions();
  }, [user]);

  const revokeSession = async (sessionId: string) => {
    await supabase
      .from("mc_device_sessions")
      .update({ is_revoked: true })
      .eq("id", sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const getDeviceLabel = (session: Session) => {
    if (session.device_info) {
      const browser = session.device_info.browser || session.device_info.userAgent || "Unknown";
      const os = session.device_info.os || "";
      return `${browser}${os ? ` on ${os}` : ""}`;
    }
    return "Unknown device";
  };

  const getDeviceIcon = (session: Session) => {
    const info = session.device_info?.deviceType || session.device_info?.userAgent || "";
    if (info.toLowerCase().includes("mobile") || info.toLowerCase().includes("iphone") || info.toLowerCase().includes("android")) {
      return Smartphone;
    }
    return Monitor;
  };

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
              <p className="text-sm text-surface-500">Change your account password</p>
            </div>
            <Button variant="outline" size="sm">Change Password</Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-surface-200 p-4 dark:border-surface-700">
            <div className="flex items-center gap-2">
              <p className="font-medium text-surface-900 dark:text-white">Two-Factor Authentication</p>
              <Badge variant="secondary">Not configured</Badge>
            </div>
            <Button variant="outline" size="sm">Manage</Button>
          </div>
          <div className="rounded-lg border border-surface-200 p-4 dark:border-surface-700">
            <p className="font-medium text-surface-900 dark:text-white mb-3">Active Sessions</p>
            {loadingSessions ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-surface-400" />
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-surface-500 py-2">No active sessions found</p>
            ) : (
              <div className="space-y-3">
                {sessions.map((session, idx) => {
                  const Icon = getDeviceIcon(session);
                  return (
                    <div key={session.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-surface-500" />
                        <div>
                          <p className="text-sm font-medium text-surface-900 dark:text-white">{getDeviceLabel(session)}</p>
                          <p className="text-xs text-surface-500">
                            {idx === 0 ? "Current session" : `Last active ${new Date(session.last_active).toLocaleString()}`}
                            {session.ip_address && ` · ${session.ip_address}`}
                          </p>
                        </div>
                      </div>
                      {idx === 0 ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-danger-600" onClick={() => revokeSession(session.id)}>
                          Revoke
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
          <Button variant="outline" onClick={() => window.location.href = "/dashboard/wallet"}>Manage Wallets</Button>
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
