"use client";

import { useState, useCallback } from "react";
import { Play, Loader2, AlertCircle, Sparkles, Download, RotateCcw } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface RunPromptProps {
  promptId: string;
  customizedPrompt: string;
  promptType?: "text" | "image" | "video" | "unspecified";
}

interface RunResult {
  type: "text" | "image";
  model: string;
  text?: string;
  image?: string;
  error?: string;
  loading?: boolean;
}

export default function RunPrompt({
  promptId,
  customizedPrompt,
  promptType = "text",
}: RunPromptProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleRun = useCallback(async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/prompts/${promptId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customizedPrompt }),
      });

      const data = await response.json();

      if (response.status === 401) {
        setError("Please sign in to run prompts.");
        setIsRunning(false);
        return;
      }

      if (!response.ok) {
        if (data.loading) {
          setError(data.error);
          // Auto-retry after 30 seconds for model loading
          if (retryCount < 2) {
            setTimeout(() => {
              setRetryCount((c) => c + 1);
              handleRun();
            }, 30000);
            setError(
              `${data.error} Auto-retrying in 30 seconds... (attempt ${retryCount + 1}/3)`
            );
          }
        } else {
          setError(data.error || "Something went wrong");
        }
        setIsRunning(false);
        return;
      }

      setResult(data);
      setRetryCount(0);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsRunning(false);
    }
  }, [user, router, promptId, customizedPrompt, retryCount]);

  const handleDownload = useCallback(() => {
    if (!result?.image) return;
    const link = document.createElement("a");
    link.href = result.image;
    link.download = `aiopenlibrary-generated-${Date.now()}.png`;
    link.click();
  }, [result]);

  // Unspecified type — show disabled grayed-out box
  if (promptType === "unspecified") {
    return (
      <div className="mt-6">
        <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-stone-200 bg-stone-100 px-6 py-3 text-sm font-medium text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-500">
          <Play className="h-4 w-4" />
          Run This Prompt
        </div>
        <p className="mt-2 text-center text-xs text-stone-400 dark:text-stone-500">
          Prompt type not specified — run feature unavailable
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Run Button */}
      <button
        onClick={handleRun}
        disabled={isRunning}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-purple-700 hover:to-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 dark:from-purple-500 dark:to-blue-500 dark:hover:from-purple-600 dark:hover:to-blue-600"
      >
        {isRunning ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Running prompt...
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            {user
              ? promptType === "image"
                ? "Generate Image"
                : promptType === "video"
                  ? "Generate Video Script"
                  : "Run This Prompt"
              : "Sign in to Run"}
          </>
        )}
      </button>

      {/* Powered by badge */}
      <p className="mt-2 text-center text-xs text-stone-400 dark:text-stone-500">
        <Sparkles className="mr-1 inline h-3 w-3" />
        Powered by Hugging Face Inference API
      </p>

      {/* Error State */}
      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            {!error.includes("Auto-retrying") && (
              <button
                onClick={handleRun}
                className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <RotateCcw className="h-3 w-3" />
                Try again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="mt-4 overflow-hidden rounded-lg border border-stone-200 dark:border-stone-700">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-200 bg-stone-100 px-4 py-2 dark:border-stone-700 dark:bg-stone-800">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                Generated Output
              </span>
            </div>
            <span className="text-xs text-stone-400 dark:text-stone-500">
              {result.model}
            </span>
          </div>

          {/* Content */}
          {result.type === "text" && (
            <div className="max-h-96 overflow-y-auto p-4">
              <div className="prose prose-sm prose-stone max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap break-words rounded-lg bg-stone-50 p-4 text-sm text-stone-800 dark:bg-stone-900 dark:text-stone-200">
                  {result.text}
                </pre>
              </div>
            </div>
          )}

          {result.type === "image" && result.image && (
            <div className="p-4">
              <div className="relative overflow-hidden rounded-lg">
                <Image
                  src={result.image}
                  alt="AI Generated Image"
                  width={1024}
                  height={1024}
                  className="h-auto w-full"
                  unoptimized
                />
              </div>
              <button
                onClick={handleDownload}
                className="mt-3 flex items-center gap-2 rounded-lg border border-stone-200 px-4 py-2 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
              >
                <Download className="h-3 w-3" />
                Download Image
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
