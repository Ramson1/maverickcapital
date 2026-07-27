"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { Shield, Bell, Palette, Fingerprint, Key, Trash2, Download, Monitor, Smartphone, Loader2, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const { error: showError, success: showSuccess } = useToast();

  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState({ email: true, deposits: true, withdrawals: true, signals: true, news: true });
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Change password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Biometric state
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if biometric is available and previously enabled
    const saved = localStorage.getItem("biometric_enabled");
    if (saved === "true") setBiometricEnabled(true);
  }, []);

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

    const fetchNotifications = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("mc_profiles")
        .select("notification_email, notification_deposits, notification_withdrawals, notification_signals, notification_news")
        .eq("id", user.id)
        .single();

      if (data) {
        setNotifications({
          email: data.notification_email ?? true,
          deposits: data.notification_deposits ?? true,
          withdrawals: data.notification_withdrawals ?? true,
          signals: data.notification_signals ?? true,
          news: data.notification_news ?? true,
        });
      }
    };

    fetchSessions();
    fetchNotifications();
  }, [user]);

  const revokeSession = async (sessionId: string) => {
    await supabase
      .from("mc_device_sessions")
      .update({ is_revoked: true })
      .eq("id", sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    showSuccess("Session Revoked", "The session has been revoked successfully.");
  };

  // Save notification preferences to database
  const updateNotification = async (key: string, value: boolean) => {
    const newNotifications = { ...notifications, [key]: value };
    setNotifications(newNotifications);

    if (!user) return;
    setSavingNotifications(true);

    const columnMap: Record<string, string> = {
      email: "notification_email",
      deposits: "notification_deposits",
      withdrawals: "notification_withdrawals",
      signals: "notification_signals",
      news: "notification_news",
    };

    const column = columnMap[key];
    if (column) {
      const { error } = await supabase
        .from("mc_profiles")
        .update({ [column]: value, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (error) {
        showError("Update Failed", "Failed to save notification preference.");
        setNotifications(notifications); // Revert on error
      }
    }
    setSavingNotifications(false);
  };

  // Export user data
  const handleExportData = async () => {
    if (!user) return;
    try {
      const [profile, deposits, withdrawals, subscriptions, referrals] = await Promise.all([
        supabase.from("mc_profiles").select("*").eq("id", user.id).single(),
        supabase.from("mc_deposits").select("*").eq("user_id", user.id),
        supabase.from("mc_withdrawals").select("*").eq("user_id", user.id),
        supabase.from("mc_subscriptions").select("*").eq("user_id", user.id),
        supabase.from("mc_referrals").select("*").eq("referrer_id", user.id),
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        profile: profile.data,
        deposits: deposits.data || [],
        withdrawals: withdrawals.data || [],
        subscriptions: subscriptions.data || [],
        referrals: referrals.data || [],
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `maverick-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showSuccess("Data Exported", "Your data has been downloaded successfully.");
    } catch (err) {
      console.error("Export failed:", err);
      showError("Export Failed", "Failed to export data. Please try again.");
    }
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

  // Change password handler
  const handleChangePassword = async () => {
    setPasswordError("");
    if (!newPassword || newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordError(error.message);
      } else {
        setShowPasswordModal(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        showSuccess("Password Changed", "Your password has been updated successfully.");
      }
    } catch (err) {
      setPasswordError("Failed to change password. Please try again.");
    } finally {
      setChangingPassword(false);
    }
  };

  // Biometric toggle
  const handleBiometricToggle = async () => {
    if (!biometricEnabled) {
      // Try to use WebAuthn if available
      if (window.PublicKeyCredential) {
        try {
          // Check if biometric auth is available on device
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          if (available) {
            setBiometricEnabled(true);
            localStorage.setItem("biometric_enabled", "true");
          } else {
            showError("Biometric Not Available", "Biometric authentication is not available on this device.");
          }
        } catch {
          // Fallback: just enable it locally
          setBiometricEnabled(true);
          localStorage.setItem("biometric_enabled", "true");
        }
      } else {
        setBiometricEnabled(true);
        localStorage.setItem("biometric_enabled", "true");
      }
    } else {
      setBiometricEnabled(false);
      localStorage.setItem("biometric_enabled", "false");
    }
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    if (!user) return;
    setDeletingAccount(true);
    try {
      // Delete user profile data
      await supabase.from("mc_profiles").delete().eq("id", user.id);
      await supabase.from("mc_deposits").delete().eq("user_id", user.id);
      await supabase.from("mc_withdrawals").delete().eq("user_id", user.id);
      await supabase.from("mc_device_sessions").delete().eq("user_id", user.id);
      await supabase.from("mc_kyc_submissions").delete().eq("user_id", user.id);

      // Sign out the user
      await supabase.auth.signOut();

      // Redirect to home
      router.push("/");
    } catch (err) {
      console.error("Failed to delete account:", err);
      showError("Account Deletion Failed", "Failed to delete account. Please contact support.");
    } finally {
      setDeletingAccount(false);
    }
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
                className={`rounded-lg border-2 px-6 py-3 text-sm font-medium transition-colors ${mounted && theme === t.value ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" : "border-surface-200 text-surface-600 hover:border-surface-300 dark:border-surface-700 dark:text-surface-400"}`}
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
                <p className="text-xs text-surface-500">Receive email notifications about {key.replace(/([A-Z])/g, " $1").toLowerCase()}</p>
              </div>
              <button
                onClick={() => updateNotification(key, !value)}
                disabled={savingNotifications}
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
          {/* Change Password */}
          <div className="flex items-center justify-between rounded-lg border border-surface-200 p-4 dark:border-surface-700">
            <div>
              <p className="font-medium text-surface-900 dark:text-white">Password</p>
              <p className="text-sm text-surface-500">Change your account password</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>Change Password</Button>
          </div>

          {/* Biometric Authentication */}
          <div className="flex items-center justify-between rounded-lg border border-surface-200 p-4 dark:border-surface-700">
            <div className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-surface-500" />
              <div>
                <p className="font-medium text-surface-900 dark:text-white">Biometric Authentication</p>
                <p className="text-sm text-surface-500">Use fingerprint or face recognition</p>
              </div>
            </div>
            <button
              onClick={handleBiometricToggle}
              className={`relative h-6 w-11 rounded-full transition-colors ${biometricEnabled ? "bg-brand-600" : "bg-surface-200 dark:bg-surface-700"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${biometricEnabled ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>

          {/* Active Sessions */}
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
            <Button variant="outline" size="sm" onClick={handleExportData}>Export</Button>
          </div>
          <div className="flex items-center justify-between border-t border-surface-200 pt-3 dark:border-surface-700">
            <div>
              <p className="font-medium text-danger-600">Delete Account</p>
              <p className="text-sm text-surface-500">Permanently delete your account and all data</p>
            </div>
            <Button variant="outline" size="sm" className="border-danger-200 text-danger-600 hover:bg-danger-50" onClick={() => setShowDeleteModal(true)}>Delete</Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-surface-800">
            <div className="flex items-center gap-3 mb-4">
              <Key className="h-5 w-5 text-brand-600" />
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Change Password</h2>
            </div>
            {passwordError && (
              <div className="mb-4 rounded-lg bg-danger-50 p-3 text-sm text-danger-600 dark:bg-danger-500/10">
                {passwordError}
              </div>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">New Password</label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 8 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Confirm New Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <Button variant="ghost" size="sm" onClick={() => { setShowPasswordModal(false); setPasswordError(""); setNewPassword(""); setConfirmPassword(""); }}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleChangePassword} disabled={changingPassword || !newPassword || !confirmPassword}>
                {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-surface-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger-50 dark:bg-danger-500/10">
                <AlertTriangle className="h-5 w-5 text-danger-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Delete Account</h2>
                <p className="text-sm text-surface-500">This action cannot be undone</p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-surface-600 dark:text-surface-400">
                This will permanently delete your account, profile, deposits, withdrawals, and all associated data. This cannot be recovered.
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                  Type <span className="font-bold text-danger-600">DELETE</span> to confirm
                </label>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <Button variant="ghost" size="sm" onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteAccount} disabled={deletingAccount || deleteConfirmText !== "DELETE"}>
                {deletingAccount && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Permanently Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
