"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ArrowDown,
  Lightbulb,
  RotateCcw,
  Link2,
  PartyPopper,
} from "lucide-react";
import Link from "next/link";
import type { ChainWithSteps } from "@/lib/types";

interface ChainRunnerProps {
  chain: ChainWithSteps;
}

interface ChainProgress {
  currentStep: number;
  completedSteps: number[];
  startedAt: string;
}

function getStorageKey(chainId: string) {
  return `chain-progress-${chainId}`;
}

function loadProgress(chainId: string): ChainProgress {
  if (typeof window === "undefined") {
    return { currentStep: 0, completedSteps: [], startedAt: new Date().toISOString() };
  }
  try {
    const raw = localStorage.getItem(getStorageKey(chainId));
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { currentStep: 0, completedSteps: [], startedAt: new Date().toISOString() };
}

function saveProgress(chainId: string, progress: ChainProgress) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(chainId), JSON.stringify(progress));
  } catch {
    // ignore
  }
}

export default function ChainRunner({ chain }: ChainRunnerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    const progress = loadProgress(chain.id);
    setCurrentStep(progress.currentStep);
    setCompletedSteps(new Set(progress.completedSteps));
    if (progress.completedSteps.length === chain.steps.length) {
      setIsComplete(true);
    }
  }, [chain.id, chain.steps.length]);

  // Save progress whenever it changes
  const persistProgress = useCallback(
    (step: number, completed: Set<number>) => {
      saveProgress(chain.id, {
        currentStep: step,
        completedSteps: Array.from(completed),
        startedAt: loadProgress(chain.id).startedAt,
      });
    },
    [chain.id]
  );

  const step = chain.steps[currentStep];
  if (!step && !isComplete) return null;

  const totalSteps = chain.steps.length;
  const completedCount = completedSteps.size;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  const handleCopy = async () => {
    if (!step) return;
    try {
      await navigator.clipboard.writeText(step.prompt.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleMarkComplete = () => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(currentStep);
    setCompletedSteps(newCompleted);

    if (newCompleted.size === totalSteps) {
      setIsComplete(true);
      persistProgress(currentStep, newCompleted);
    } else if (currentStep < totalSteps - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      persistProgress(nextStep, newCompleted);
    } else {
      persistProgress(currentStep, newCompleted);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      persistProgress(prev, completedSteps);
    }
  };

  const handleGoToStep = (index: number) => {
    setCurrentStep(index);
    setIsComplete(false);
    persistProgress(index, completedSteps);
  };

  const handleReset = () => {
    if (!confirm("Reset all progress for this chain?")) return;
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setIsComplete(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem(getStorageKey(chain.id));
    }
  };

  // Completion screen
  if (isComplete) {
    return (
      <div className="mx-auto max-w-2xl">
        {/* Back link */}
        <div className="mb-6">
          <Link
            href={`/chains/${chain.slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Chain
          </Link>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-stone-700 dark:text-stone-300">
              All steps complete!
            </span>
            <span className="text-stone-500 dark:text-stone-400">100%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: "100%" }}
            />
          </div>
        </div>

        {/* Congrats */}
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-8 text-center dark:border-amber-600 dark:bg-amber-900/20">
          <PartyPopper className="mx-auto h-12 w-12 text-amber-500" />
          <h2 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-100">
            Chain Complete!
          </h2>
          <p className="mt-2 text-stone-600 dark:text-stone-400">
            You&apos;ve completed all {totalSteps} steps of &ldquo;{chain.title}&rdquo;.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href={`/chains/${chain.slug}`}
              className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              Back to Chain
            </Link>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
            >
              <RotateCcw className="h-4 w-4" />
              Run Again
            </button>
          </div>
        </div>

        {/* Step list */}
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-semibold text-stone-700 dark:text-stone-300">
            All Steps
          </h3>
          <div className="space-y-1">
            {chain.steps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => handleGoToStep(i)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-stone-700 dark:text-stone-300">
                  {s.title_override || s.prompt.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href={`/chains/${chain.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Chain
        </Link>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-stone-700 dark:text-stone-300">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-stone-500 dark:text-stone-400">{progressPercent}% complete</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
          <div
            className="h-full rounded-full bg-amber-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Step sidebar (desktop) */}
        <div className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-28">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Steps
              </h3>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>
            <div className="space-y-1">
              {chain.steps.map((s, i) => {
                const isCompleted = completedSteps.has(i);
                const isCurrent = i === currentStep;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleGoToStep(i)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      isCurrent
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                        : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
                    }`}
                  >
                    {isCompleted ? (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    ) : (
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                          isCurrent
                            ? "border-2 border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-900/30 dark:text-amber-400"
                            : "border border-stone-300 text-stone-400 dark:border-stone-600 dark:text-stone-500"
                        }`}
                      >
                        {i + 1}
                      </div>
                    )}
                    <span className="truncate text-xs">
                      {s.title_override || s.prompt.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main step content */}
        <div className="min-w-0 flex-1">
          {/* Step header */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-amber-400 bg-amber-50 text-sm font-bold text-amber-700 dark:border-amber-500 dark:bg-amber-900/30 dark:text-amber-400">
              {currentStep + 1}
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {step.title_override || step.prompt.title}
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {step.prompt.description}
              </p>
            </div>
          </div>

          {/* Context note */}
          {step.context_note && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-700 dark:bg-stone-800">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-stone-400 dark:text-stone-500" />
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {step.context_note}
              </p>
            </div>
          )}

          {/* Input instructions */}
          {step.input_instructions && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
              <ArrowDown className="mt-0.5 h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {step.input_instructions}
              </p>
            </div>
          )}

          {/* Prompt text */}
          <div className="relative rounded-lg border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
            <div className="flex items-center justify-between border-b border-stone-100 px-4 py-2 dark:border-stone-700">
              <span className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
                <Link2 className="h-3.5 w-3.5" />
                Prompt
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto p-4">
              <pre className="whitespace-pre-wrap break-words font-mono text-sm text-stone-800 dark:text-stone-200">
                {step.prompt.prompt}
              </pre>
            </div>
          </div>

          {/* Variables */}
          {step.prompt.variables && step.prompt.variables.length > 0 && (
            <div className="mt-4 rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Variables
              </h4>
              <div className="space-y-1.5">
                {step.prompt.variables.map((v) => (
                  <div key={v.name} className="text-sm">
                    <span className="font-mono text-amber-600 dark:text-amber-400">
                      {`{{${v.name}}}`}
                    </span>
                    {v.description && (
                      <span className="ml-2 text-stone-500 dark:text-stone-400">
                        — {v.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <button
              onClick={handleMarkComplete}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
            >
              {currentStep === totalSteps - 1 ? (
                <>
                  Complete Chain
                  <PartyPopper className="h-4 w-4" />
                </>
              ) : (
                <>
                  Mark Complete & Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Mobile step list */}
          <div className="mt-8 lg:hidden">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                All Steps
              </h3>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>
            <div className="space-y-1">
              {chain.steps.map((s, i) => {
                const isCompleted = completedSteps.has(i);
                const isCurrent = i === currentStep;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleGoToStep(i)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      isCurrent
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                        : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
                    }`}
                  >
                    {isCompleted ? (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    ) : (
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                          isCurrent
                            ? "border-2 border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-900/30 dark:text-amber-400"
                            : "border border-stone-300 text-stone-400 dark:border-stone-600 dark:text-stone-500"
                        }`}
                      >
                        {i + 1}
                      </div>
                    )}
                    <span className="truncate text-xs">
                      {s.title_override || s.prompt.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
