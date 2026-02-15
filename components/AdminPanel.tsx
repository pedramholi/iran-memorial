"use client";

import { useState } from "react";

type Submission = {
  id: string;
  victimData: any;
  submitterEmail: string | null;
  submitterName: string | null;
  status: string;
  reviewerNotes: string | null;
  createdAt: string;
};

export function AdminPanel({
  submissions: initialSubmissions,
  counts,
}: {
  submissions: Submission[];
  counts: { pending: number; approved: number; rejected: number };
}) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [loading, setLoading] = useState<string | null>(null);

  async function loadTab(status: string) {
    setActiveTab(status as any);
    try {
      const res = await fetch(`/api/admin/submissions?status=${status}`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions);
      }
    } catch {
      // silently fail
    }
  }

  async function reviewSubmission(id: string, status: "approved" | "rejected", notes?: string) {
    setLoading(id);
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, reviewerNotes: notes }),
      });
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
      }
    } catch {
      // silently fail
    }
    setLoading(null);
  }

  const tabCls = (tab: string) =>
    `px-4 py-2 text-sm rounded-t border-b-2 transition-colors cursor-pointer ${
      activeTab === tab
        ? "border-gold-400 text-gold-400"
        : "border-transparent text-memorial-400 hover:text-memorial-200"
    }`;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-memorial-100 mb-2">Admin Panel</h1>
      <p className="text-memorial-400 mb-8">Review community submissions</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-lg border border-memorial-800/60 bg-memorial-900/30 p-4 text-center">
          <div className="text-2xl font-bold text-gold-400">{counts.pending}</div>
          <div className="text-xs text-memorial-500">Pending</div>
        </div>
        <div className="rounded-lg border border-memorial-800/60 bg-memorial-900/30 p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{counts.approved}</div>
          <div className="text-xs text-memorial-500">Approved</div>
        </div>
        <div className="rounded-lg border border-memorial-800/60 bg-memorial-900/30 p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{counts.rejected}</div>
          <div className="text-xs text-memorial-500">Rejected</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-memorial-800 mb-6">
        <button onClick={() => loadTab("pending")} className={tabCls("pending")}>
          Pending ({counts.pending})
        </button>
        <button onClick={() => loadTab("approved")} className={tabCls("approved")}>
          Approved
        </button>
        <button onClick={() => loadTab("rejected")} className={tabCls("rejected")}>
          Rejected
        </button>
      </div>

      {/* Submissions */}
      {submissions.length === 0 ? (
        <p className="text-memorial-500 text-center py-12">
          No {activeTab} submissions.
        </p>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <SubmissionCard
              key={sub.id}
              submission={sub}
              isActive={activeTab === "pending"}
              loading={loading === sub.id}
              onApprove={() => reviewSubmission(sub.id, "approved")}
              onReject={() => reviewSubmission(sub.id, "rejected")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SubmissionCard({
  submission,
  isActive,
  loading,
  onApprove,
  onReject,
}: {
  submission: Submission;
  isActive: boolean;
  loading: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const data = submission.victimData as any;

  return (
    <div className="rounded-lg border border-memorial-800/60 bg-memorial-900/30 p-5">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-memorial-100">
            {data.name_latin || data.nameLatin || "Unknown"}
          </h3>
          {(data.name_farsi || data.nameFarsi) && (
            <p className="text-sm text-memorial-400" dir="rtl">
              {data.name_farsi || data.nameFarsi}
            </p>
          )}
        </div>
        <time className="text-xs text-memorial-500">
          {new Date(submission.createdAt).toLocaleDateString()}
        </time>
      </div>

      {data.details && (
        <div className="mb-3">
          <h4 className="text-xs font-medium text-memorial-500 mb-1">Details</h4>
          <p className="text-sm text-memorial-300 whitespace-pre-wrap">
            {data.details}
          </p>
        </div>
      )}

      {data.sources && (
        <div className="mb-3">
          <h4 className="text-xs font-medium text-memorial-500 mb-1">Sources</h4>
          <p className="text-sm text-memorial-400 break-all">{data.sources}</p>
        </div>
      )}

      {(submission.submitterName || submission.submitterEmail) && (
        <div className="mb-3 text-xs text-memorial-500">
          Submitted by: {submission.submitterName || "Anonymous"}
          {submission.submitterEmail && ` (${submission.submitterEmail})`}
        </div>
      )}

      {submission.reviewerNotes && (
        <div className="mb-3 text-xs text-memorial-500 italic">
          Notes: {submission.reviewerNotes}
        </div>
      )}

      {isActive && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-memorial-800">
          <button
            onClick={onApprove}
            disabled={loading}
            className="px-4 py-2 rounded text-sm font-medium bg-green-900/50 text-green-400 border border-green-800/50 hover:bg-green-900 transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "Approve"}
          </button>
          <button
            onClick={onReject}
            disabled={loading}
            className="px-4 py-2 rounded text-sm font-medium bg-red-900/50 text-red-400 border border-red-800/50 hover:bg-red-900 transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "Reject"}
          </button>
        </div>
      )}
    </div>
  );
}
