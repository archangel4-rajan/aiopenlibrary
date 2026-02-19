"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, X, Eye, Home, Shield } from "lucide-react";
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

type TabStatus = "pending" | "approved" | "rejected";

export default function AdminSubmissionsPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabStatus>("pending");

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
      <div className="flex min-h-[50vh] items-center justify-center bg-stone-50 dark:bg-stone-900">
        <div className="text-stone-400 dark:text-stone-500">Loading...</div>
      </div>
    );
  }

  const pending = submissions.filter((s) => s.status === "pending");
  const approved = submissions.filter((s) => s.status === "approved");
  const rejected = submissions.filter((s) => s.status === "rejected");

  const getFilteredSubmissions = () => {
    switch (activeTab) {
      case "pending":
        return pending;
      case "approved":
        return approved;
      case "rejected":
        return rejected;
      default:
        return pending;
    }
  };

  const filteredSubmissions = getFilteredSubmissions();

  const tabs: Array<{ id: TabStatus; label: string; count: number }> = [
    { id: "pending", label: "Pending", count: pending.length },
    { id: "approved", label: "Approved", count: approved.length },
    { id: "rejected", label: "Rejected", count: rejected.length },
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          <span className="text-stone-400 dark:text-stone-600">/</span>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
          >
            <Shield className="h-4 w-4" />
            Admin
          </Link>
          <span className="text-stone-400 dark:text-stone-600">/</span>
          <span className="text-stone-700 dark:text-stone-300">Submissions</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
                Community Submissions
              </h1>
              <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                Review and approve community-submitted prompts.
              </p>
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-stone-200 dark:border-stone-700">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-stone-900 dark:text-stone-100"
                    : "text-stone-600 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
                }`}
              >
                {tab.label}
                <span
                  className={`ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
                    activeTab === tab.id
                      ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                      : "bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300"
                  }`}
                >
                  {tab.count}
                </span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900 dark:bg-stone-100" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length > 0 && (
          <div className="space-y-3">
            {filteredSubmissions.map((sub) => {
              const borderColor =
                activeTab === "pending"
                  ? "border-amber-200 dark:border-amber-900"
                  : activeTab === "approved"
                    ? "border-green-200 dark:border-green-900"
                    : "border-red-200 dark:border-red-900";

              return (
                <div
                  key={sub.id}
                  className={`rounded-lg border ${borderColor} bg-white dark:bg-stone-800`}
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                        {sub.title}
                      </h3>
                      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                        {sub.category_name} &middot; {sub.recommended_model || "No model"} &middot;{" "}
                        {new Date(sub.created_at).toLocaleDateString()}
                      </p>
                      {sub.submitter_email && (
                        <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">
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
                        className="rounded-lg border border-stone-200 p-2 text-stone-500 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {activeTab === "pending" && (
                        <>
                          <button
                            onClick={() => handleAction(sub.id, "approved")}
                            disabled={actionLoading === sub.id}
                            className="rounded-lg bg-green-600 p-2 text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-600"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleAction(sub.id, "rejected")}
                            disabled={actionLoading === sub.id}
                            className="rounded-lg bg-stone-200 p-2 text-stone-600 hover:bg-stone-300 disabled:opacity-50 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {expandedId === sub.id && (
                    <div className="border-t border-stone-100 p-4 dark:border-stone-700">
                      <p className="mb-3 text-sm text-stone-600 dark:text-stone-300">
                        {sub.description}
                      </p>
                      <pre className="mb-3 max-h-64 overflow-auto rounded-lg border border-stone-200 bg-stone-50 p-3 font-mono text-xs text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300">
                        {sub.prompt}
                      </pre>
                      {sub.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {sub.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-500 dark:bg-stone-700 dark:text-stone-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {filteredSubmissions.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-stone-200 p-12 text-center dark:border-stone-700">
            <p className="text-stone-400 dark:text-stone-500">
              No {activeTab} submissions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
