"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight } from "lucide-react";
import { Suspense } from "react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-accent-50 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-brand-50 p-3 dark:bg-brand-500/10">
              <Mail className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Verify your email</CardTitle>
          <CardDescription className="text-center">
            {email ? (
              <>
                We&apos;ve sent a verification link to <strong>{email}</strong>
              </>
            ) : (
              "Check your inbox for a verification link"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-surface-50 border border-surface-200 p-4 dark:bg-surface-800 dark:border-surface-700">
            <h3 className="text-sm font-medium text-surface-900 dark:text-white mb-2">What&apos;s next?</h3>
            <ol className="text-sm text-surface-600 dark:text-surface-400 space-y-2">
              <li>1. Check your email inbox</li>
              <li>2. Click the verification link in the email</li>
              <li>3. You&apos;ll be redirected to your dashboard</li>
            </ol>
          </div>
          <p className="text-sm text-center text-surface-600 dark:text-surface-400">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <button className="text-brand-600 hover:underline dark:text-brand-400">
              resend verification email
            </button>
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">
              Go to login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
