"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Shield, CheckCircle2, AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("John Doe");
  const [email] = useState("john@example.com");
  const [phone, setPhone] = useState("+1 234 567 8900");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Profile</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Manage your personal information</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center p-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src="" alt="Profile" />
                <AvatarFallback className="text-2xl bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400">JD</AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 rounded-full bg-brand-600 p-1.5 text-white shadow-sm hover:bg-brand-700">
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-surface-900 dark:text-white">{fullName}</h2>
            <p className="text-sm text-surface-500">{email}</p>
            <div className="mt-4 flex gap-2">
              <Badge variant="default">Pro Member</Badge>
              <Badge variant="success">Verified</Badge>
            </div>
            <div className="mt-6 w-full space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-500">KYC Status</span>
                <span className="flex items-center gap-1 text-success-600"><CheckCircle2 className="h-4 w-4" />Verified</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-500">2FA</span>
                <span className="flex items-center gap-1 text-success-600"><Shield className="h-4 w-4" />Enabled</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-500">Member Since</span>
                <span className="text-surface-900 dark:text-white">Jan 2026</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Personal Information</CardTitle>
              <Button variant={editing ? "default" : "outline"} size="sm" onClick={() => setEditing(!editing)}>
                {editing ? "Save Changes" : "Edit Profile"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Full Name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={!editing} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Email</label>
                <Input value={email} disabled />
                <p className="text-xs text-surface-500">Email cannot be changed</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!editing} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Membership Level</label>
                <Input value="Pro" disabled />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
