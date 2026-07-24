"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Loader2 } from "lucide-react";

export default function TwoFactorPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Placeholder QR code data - in production this would come from Supabase
  const qrCodeUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IndoaXRlIi8+PHRleHQgeD0iMTAwIiB5PSIxMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2Ij4yRkEgUVIgQ29kZSBQbGFjZWhvbGRlcjwvdGV4dD48L3N2Zz4=";

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // TODO: Implement actual TOTP verification with Supabase
    // For now, just simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      setLoading(false);
      return;
    }

    // In production, verify the code against the user's TOTP secret
    router.push("/dashboard/settings?two-factor=enabled");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-accent-50 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-brand-50 p-3 dark:bg-brand-500/10">
              <Shield className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Set up two-factor authentication</CardTitle>
          <CardDescription className="text-center">
            Scan the QR code with your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-danger-50 border border-danger-200 text-danger-700 text-sm dark:bg-danger-500/10 dark:border-danger-500/20 dark:text-danger-400">
              {error}
            </div>
          )}

          <div className="flex justify-center">
            <div className="rounded-lg border-2 border-surface-200 p-4 dark:border-surface-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
            </div>
          </div>

          <div className="rounded-lg bg-surface-50 border border-surface-200 p-4 dark:bg-surface-800 dark:border-surface-700">
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-2">
              Can&apos;t scan the QR code? Enter this secret key manually:
            </p>
            <code className="text-xs font-mono bg-surface-100 px-2 py-1 rounded dark:bg-surface-900 dark:text-surface-300">
              JBSWY3DPEHPK3PXP
            </code>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium text-surface-700 dark:text-surface-300">
                Enter the 6-digit code from your authenticator app
              </label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                required
                disabled={loading}
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify and enable 2FA"
              )}
            </Button>
          </form>

          <p className="text-xs text-center text-surface-500 dark:text-surface-400">
            Make sure you have access to your authenticator app. You&apos;ll need it to sign in to your account.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.push("/dashboard/settings")}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
