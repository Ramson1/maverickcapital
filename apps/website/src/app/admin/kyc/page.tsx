"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Search,
  Check,
  X,
  Eye,
  Loader2,
  FileText,
  User,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TablePageSkeleton } from "@/components/ui/PageSkeletons";
import { useToast } from "@/providers/ToastProvider";

interface KycSubmission {
  id: string;
  user_id: string;
  id_document_data: string | null;
  address_document_data: string | null;
  selfie_document_data: string | null;
  id_document_name: string | null;
  address_document_name: string | null;
  selfie_document_name: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
  // Joined from profile
  full_name: string | null;
  email: string | null;
  kyc_status: string | null;
}

const statusVariant: Record<string, "success" | "warning" | "destructive" | "default"> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
};

type DocType = "id" | "address" | "selfie";

export default function AdminKycPage() {
  const supabase = createClient();
  const { success: showSuccess, error: showError } = useToast();
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ submission: KycSubmission; type: DocType } | null>(null);
  const [rejectModal, setRejectModal] = useState<{ submission: KycSubmission } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      // Fetch all KYC submissions
      const { data: subs, error } = await supabase
        .from("mc_kyc_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("KYC fetch error:", error.message || error);
        setLoading(false);
        return;
      }

      if (!subs) {
        setLoading(false);
        return;
      }

      // Fetch user profiles for names/emails
      const userIds = subs.map((s) => s.user_id);
      const { data: profiles } = await supabase
        .from("mc_profiles")
        .select("id, full_name, email, kyc_status")
        .in("id", userIds);

      const profileMap: Record<string, { full_name: string | null; email: string | null; kyc_status: string | null }> = {};
      if (profiles) {
        profiles.forEach((p) => {
          profileMap[p.id] = { full_name: p.full_name, email: p.email, kyc_status: p.kyc_status };
        });
      }

      const rows: KycSubmission[] = subs.map((s) => ({
        ...s,
        full_name: profileMap[s.user_id]?.full_name || "Unknown",
        email: profileMap[s.user_id]?.email || "",
        kyc_status: profileMap[s.user_id]?.kyc_status || null,
      }));

      setSubmissions(rows);
    } catch (err) {
      console.error("KYC fetch failed:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleApprove = async (submission: KycSubmission) => {
    setProcessing(submission.id);
    try {
      const { error } = await supabase
        .from("mc_kyc_submissions")
        .update({
          status: "approved",
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", submission.id);

      if (error) throw error;

      // Update profile KYC status
      await supabase
        .from("mc_profiles")
        .update({ kyc_status: "verified" })
        .eq("id", submission.user_id);

      setSubmissions((prev) =>
        prev.map((s) => (s.id === submission.id ? { ...s, status: "approved" } : s))
      );
      showSuccess("KYC Approved", `${submission.full_name}'s KYC has been approved.`);
    } catch (err) {
      showError("Approval Failed", "Failed to approve KYC submission.");
    }
    setProcessing(null);
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    const submission = rejectModal.submission;
    setProcessing(submission.id);
    setRejectModal(null);

    try {
      const { error } = await supabase
        .from("mc_kyc_submissions")
        .update({
          status: "rejected",
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectReason || null,
        })
        .eq("id", submission.id);

      if (error) throw error;

      // Update profile KYC status
      await supabase
        .from("mc_profiles")
        .update({ kyc_status: "rejected" })
        .eq("id", submission.user_id);

      setSubmissions((prev) =>
        prev.map((s) => (s.id === submission.id ? { ...s, status: "rejected" } : s))
      );
      showSuccess("KYC Rejected", `${submission.full_name}'s KYC has been rejected.`);
      setRejectReason("");
    } catch (err) {
      showError("Rejection Failed", "Failed to reject KYC submission.");
    }
    setProcessing(null);
  };

  const filtered = submissions.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.full_name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.user_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  const getDocData = (submission: KycSubmission, type: DocType) => {
    switch (type) {
      case "id":
        return submission.id_document_data;
      case "address":
        return submission.address_document_data;
      case "selfie":
        return submission.selfie_document_data;
    }
  };

  const getDocName = (submission: KycSubmission, type: DocType) => {
    switch (type) {
      case "id":
        return submission.id_document_name || "ID Document";
      case "address":
        return submission.address_document_name || "Address Proof";
      case "selfie":
        return submission.selfie_document_name || "Selfie";
    }
  };

  if (loading) {
    return <TablePageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">KYC Verification</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            {pendingCount} pending submission{pendingCount !== 1 ? "s" : ""} awaiting review
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <Input
              placeholder="Search by name, email, or user ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {["all", "pending", "approved", "rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  statusFilter === s
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                    : "text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
                )}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submissions Grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="mb-4 h-12 w-12 text-surface-300 dark:text-surface-600" />
            <p className="text-sm text-surface-500 dark:text-surface-400">No KYC submissions found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((sub) => {
            const isProcessing = processing === sub.id;
            return (
              <Card key={sub.id} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    {/* User Info */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-400">
                        {(sub.full_name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-surface-900 dark:text-white">{sub.full_name}</p>
                        <p className="text-xs text-surface-500 dark:text-surface-400">{sub.email}</p>
                        <p className="mt-0.5 font-mono text-[10px] text-surface-400 dark:text-surface-500">{sub.user_id}</p>
                        <p className="mt-1 text-xs text-surface-400 dark:text-surface-500">
                          Submitted {new Date(sub.created_at).toLocaleDateString()} at {new Date(sub.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3">
                      <Badge variant={statusVariant[sub.status] || "default"}>{sub.status}</Badge>

                      {sub.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-success-200 text-success-700 hover:bg-success-50 dark:border-success-500/20 dark:text-success-400 dark:hover:bg-success-500/10"
                            onClick={() => handleApprove(sub)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1 h-3.5 w-3.5" />}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-danger-200 text-danger-700 hover:bg-danger-50 dark:border-danger-500/20 dark:text-danger-400 dark:hover:bg-danger-500/10"
                            onClick={() => { setRejectModal({ submission: sub }); setRejectReason(""); }}
                            disabled={isProcessing}
                          >
                            <X className="mr-1 h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </div>
                      )}

                      {sub.status === "rejected" && sub.rejection_reason && (
                        <p className="text-xs text-danger-500">Reason: {sub.rejection_reason}</p>
                      )}
                    </div>
                  </div>

                  {/* Document Thumbnails */}
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {(["id", "address", "selfie"] as DocType[]).map((type) => {
                      const docData = getDocData(sub, type);
                      const docName = getDocName(sub, type);
                      return (
                        <button
                          key={type}
                          onClick={() => docData && setPreviewDoc({ submission: sub, type })}
                          disabled={!docData}
                          className={cn(
                            "group relative flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors",
                            docData
                              ? "border-surface-200 hover:border-brand-300 hover:bg-brand-50/50 dark:border-surface-700 dark:hover:border-brand-500/30 dark:hover:bg-brand-500/5"
                              : "border-surface-100 opacity-50 dark:border-surface-800"
                          )}
                        >
                          {docData ? (
                            <img
                              src={docData}
                              alt={docName}
                              className="h-20 w-full rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-20 w-full items-center justify-center rounded bg-surface-50 dark:bg-surface-800">
                              <FileText className="h-6 w-6 text-surface-300 dark:text-surface-600" />
                            </div>
                          )}
                          <span className="text-[11px] font-medium capitalize text-surface-600 dark:text-surface-400">
                            {type === "id" ? "ID Document" : type === "address" ? "Address Proof" : "Selfie"}
                          </span>
                          {docData && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 opacity-0 transition-all group-hover:bg-black/5 group-hover:opacity-100">
                              <Eye className="h-5 w-5 text-brand-600" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-xl bg-white dark:bg-surface-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-surface-200 p-4 dark:border-surface-700">
              <div>
                <p className="font-medium text-surface-900 dark:text-white">
                  {getDocName(previewDoc.submission, previewDoc.type)}
                </p>
                <p className="text-xs text-surface-500 dark:text-surface-400">
                  {previewDoc.submission.full_name} — {previewDoc.type === "id" ? "ID Document" : previewDoc.type === "address" ? "Address Proof" : "Selfie"}
                </p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-auto p-4" style={{ maxHeight: "calc(90vh - 80px)" }}>
              <img
                src={getDocData(previewDoc.submission, previewDoc.type) || ""}
                alt={getDocName(previewDoc.submission, previewDoc.type)}
                className="mx-auto max-w-full rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setRejectModal(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-surface-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger-50 dark:bg-danger-500/10">
                <AlertTriangle className="h-5 w-5 text-danger-600 dark:text-danger-400" />
              </div>
              <div>
                <h3 className="font-semibold text-surface-900 dark:text-white">Reject KYC</h3>
                <p className="text-xs text-surface-500 dark:text-surface-400">
                  {rejectModal.submission.full_name}&apos;s submission will be rejected
                </p>
              </div>
            </div>
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
                Reason (optional)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Document is blurry, name doesn't match, etc."
                className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-surface-700 dark:bg-surface-800 dark:text-white"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectModal(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={processing === rejectModal.submission.id}
              >
                {processing === rejectModal.submission.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <X className="mr-2 h-4 w-4" />
                )}
                Reject KYC
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
