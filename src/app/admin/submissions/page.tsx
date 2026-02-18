"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, X, Clock, Eye } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface Submission {
  id: string;
  title: string;
  description: string;
  category_name: string;
  prompt: string;
  tags: string[];
  recommended_model: string;
  submitter_email: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export default function AdminSubmissionsPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/");
      return;
    }
    if (isAdmin) {
      fetchSubmissions();
    }
  }, [isAdmin, authLoading, router]);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/admin/submissions");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status } : s))
        );
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-stone-400">Loading...</div>
      </div>
    );
  }

  const pending = submissions.filter((s) => s.status === "pending");
  const reviewed = submissions.filter((s) => s.status !== "pending");

  return (
    <div className="bg-stone-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-8">
          <Link
            href="/admin"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-stone-900">
            Community Submissions
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            Review and approve community-submitted prompts.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <div className="text-2xl font-bold text-stone-900">
              {pending.length}
            </div>
            <div className="text-sm text-stone-500">Pending</div>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <div className="text-2xl font-bold text-green-600">
              {submissions.filter((s) => s.status === "approved").length}
            </div>
            <div className="text-sm text-stone-500">Approved</div>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <div className="text-2xl font-bold text-stone-400">
              {submissions.filter((s) => s.status === "rejected").length}
            </div>
            <div className="text-sm text-stone-500">Rejected</div>
          </div>
        </div>

        {/* Pending Submissions */}
        {pending.length > 0 && (
          <div className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-900">
              <Clock className="h-5 w-5 text-amber-500" />
              Pending Review ({pending.length})
            </h2>
            <div className="space-y-3">
              {pending.map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-lg border border-amber-200 bg-white"
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-stone-900">
                        {sub.title}
                      </h3>
                      <p className="mt-1 text-sm text-stone-500">
                        {sub.category_name} &middot; {sub.recommended_model || "No model"} &middot;{" "}
                        {new Date(sub.created_at).toLocaleDateString()}
                      </p>
                      {sub.submitter_email && (
                        <p className="mt-0.5 text-xs text-stone-400">
                          by {sub.submitter_email}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setExpandedId(
                            expandedId === sub.id ? null : sub.id
                          )
                        }
                        className="rounded-lg border border-stone-200 p-2 text-stone-500 hover:bg-stone-50"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAction(sub.id, "approved")}
                        disabled={actionLoading === sub.id}
                        className="rounded-lg bg-green-600 p-2 text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAction(sub.id, "rejected")}
                        disabled={actionLoading === sub.id}
                        className="rounded-lg bg-stone-200 p-2 text-stone-600 hover:bg-stone-300 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {expandedId === sub.id && (
                    <div className="border-t border-stone-100 p-4">
                      <p className="mb-3 text-sm text-stone-600">
                        {sub.description}
                      </p>
                      <pre className="mb-3 max-h-64 overflow-auto rounded-lg border border-stone-200 bg-stone-50 p-3 font-mono text-xs text-stone-700">
                        {sub.prompt}
                      </pre>
                      {sub.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {sub.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-500"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviewed Submissions */}
        {reviewed.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-stone-900">
              Previously Reviewed ({reviewed.length})
            </h2>
            <div className="space-y-2">
              {reviewed.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between rounded-lg border border-stone-200 bg-white p-4"
                >
                  <div>
                    <h3 className="font-medium text-stone-900">{sub.title}</h3>
                    <p className="text-sm text-stone-500">
                      {sub.category_name} &middot;{" "}
                      {new Date(sub.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      sub.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {submissions.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-stone-200 p-12 text-center">
            <p className="text-stone-400">No submissions yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
