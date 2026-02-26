"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Variable, Lightbulb, X, ChevronDown, ChevronUp } from "lucide-react";
import CopyButton from "./CopyButton";
import RunPrompt from "./RunPrompt";
import UnlockButton from "./UnlockButton";

const COLLAPSE_LINE_THRESHOLD = 150;

interface PromptVariable {
  name: string;
  description: string;
}

interface PromptCustomizerProps {
  promptText: string;
  variables: PromptVariable[];
  useCases: string[];
  promptId?: string;
  promptType?: "text" | "image" | "video" | "unspecified";
  isPremium?: boolean;
  premiumPreviewLength?: number;
  zapPrice?: number;
  creatorId?: string;
  isPurchased?: boolean;
  onPromptChange?: (augmented: string) => void;
}

export default function PromptCustomizer({
  promptText,
  variables,
  useCases,
  promptId,
  promptType,
  isPremium,
  premiumPreviewLength,
  zapPrice,
  creatorId,
  isPurchased,
  onPromptChange,
}: PromptCustomizerProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const lineCount = useMemo(() => promptText.split("\n").length, [promptText]);
  const isLongPrompt = lineCount > COLLAPSE_LINE_THRESHOLD;

  const handleChange = useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleClear = useCallback((name: string) => {
    setValues((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const filledCount = useMemo(
    () => Object.values(values).filter((v) => v.trim()).length,
    [values]
  );

  // Build the augmented prompt with variable substitutions
  const augmentedPrompt = useMemo(() => {
    let result = promptText;
    for (const v of variables) {
      const userValue = values[v.name]?.trim();
      if (userValue) {
        result = result.replaceAll(`{{${v.name}}}`, userValue);
      }
    }
    return result;
  }, [promptText, variables, values]);

  // Notify parent of prompt changes
  useEffect(() => {
    onPromptChange?.(augmentedPrompt);
  }, [augmentedPrompt, onPromptChange]);

  // For premium prompts, truncate the source text (unless purchased)
  const showFullContent = !isPremium || isPurchased;
  const displayPromptText = useMemo(() => {
    if (showFullContent) return promptText;
    const maxLen = premiumPreviewLength ?? 200;
    if (promptText.length <= maxLen) return promptText;
    return promptText.slice(0, maxLen);
  }, [promptText, showFullContent, premiumPreviewLength]);

  // Render the prompt with visual highlighting for variables
  const renderPromptSegments = useMemo(() => {
    const segments: { text: string; type: "text" | "filled" | "unfilled" }[] =
      [];
    const remaining = displayPromptText;

    // Build a regex matching all variable placeholders
    if (variables.length === 0) {
      return [{ text: promptText, type: "text" as const }];
    }

    const varNames = variables.map((v) => v.name);
    const pattern = new RegExp(
      `(\\{\\{(?:${varNames.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\}\\})`,
      "g"
    );

    let match;
    let lastIndex = 0;
    // Reset the regex
    pattern.lastIndex = 0;

    while ((match = pattern.exec(remaining)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        segments.push({
          text: remaining.slice(lastIndex, match.index),
          type: "text",
        });
      }

      // Extract variable name from {{name}}
      const varName = match[1].slice(2, -2);
      const userValue = values[varName]?.trim();

      if (userValue) {
        segments.push({ text: userValue, type: "filled" });
      } else {
        segments.push({ text: match[1], type: "unfilled" });
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < remaining.length) {
      segments.push({ text: remaining.slice(lastIndex), type: "text" });
    }

    return segments;
  }, [displayPromptText, variables, values]);

  return (
    <>
      {/* Variables to Customize */}
      {variables.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-900 dark:text-stone-100">
              <Variable className="h-5 w-5 text-stone-500 dark:text-stone-400" />
              Variables to Customize
            </h2>
            {variables.length > 0 && (
              <span className="text-xs text-stone-400 dark:text-stone-500">
                {filledCount}/{variables.length} filled
              </span>
            )}
          </div>
          <div className="space-y-3">
            {variables.map((v) => (
              <div
                key={v.name}
                className="rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800"
              >
                <div className="mb-2 flex items-start justify-between gap-2 sm:items-center">
                  <label
                    htmlFor={`var-${v.name}`}
                    className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2"
                  >
                    <code className="shrink-0 rounded bg-stone-100 px-2 py-0.5 font-mono text-[11px] text-stone-700 dark:bg-stone-700 dark:text-stone-200 sm:text-xs">
                      {`{{${v.name}}}`}
                    </code>
                    <span className="text-[11px] leading-tight text-stone-400 dark:text-stone-500 sm:text-xs">
                      {v.description}
                    </span>
                  </label>
                  {values[v.name]?.trim() && (
                    <button
                      onClick={() => handleClear(v.name)}
                      className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:text-stone-500 dark:hover:bg-stone-700 dark:hover:text-stone-300"
                      aria-label={`Clear ${v.name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <input
                  id={`var-${v.name}`}
                  type="text"
                  value={values[v.name] || ""}
                  onChange={(e) => handleChange(v.name, e.target.value)}
                  placeholder={v.description}
                  className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 outline-none transition-colors focus:border-stone-400 focus:bg-stone-50 focus:ring-1 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-700 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-stone-600 dark:focus:bg-stone-600 dark:focus:ring-stone-700"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Use Cases */}
      {useCases.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-900 dark:text-stone-100">
            <Lightbulb className="h-5 w-5 text-stone-500 dark:text-stone-400" />
            Use Cases
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {useCases.map((useCase) => (
              <div
                key={useCase}
                className="flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs text-stone-600 dark:bg-stone-700 dark:text-stone-300">
                  &#10003;
                </div>
                <span className="text-sm text-stone-600 dark:text-stone-300">{useCase}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prompt Content with live preview */}
      <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800 sm:p-8">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-[10px] font-medium uppercase tracking-widest text-stone-400 dark:text-stone-500 sm:text-xs">
            Prompt
            {filledCount > 0 && (
              <span className="ml-2 normal-case tracking-normal text-stone-500 dark:text-stone-400">
                — customized with your values
              </span>
            )}
            {isLongPrompt && (
              <span className="ml-2 normal-case tracking-normal text-stone-400 dark:text-stone-500">
                · {lineCount} lines
              </span>
            )}
          </h2>
          {showFullContent && (
            <CopyButton
              text={augmentedPrompt}
              className="px-4 py-2 text-sm font-medium"
            />
          )}
        </div>

        <div className="relative">
          <div
            style={{
              maxHeight: isLongPrompt && !isExpanded ? "400px" : "none",
              overflow: "hidden",
              transition: "max-height 0.4s ease-in-out",
            }}
          >
            <pre
              ref={preRef}
              className="whitespace-pre-wrap rounded-lg border border-stone-200 bg-stone-50 p-3 font-mono text-xs leading-relaxed text-stone-700 dark:border-stone-700 dark:bg-stone-700 dark:text-stone-200 sm:p-5 sm:text-sm"
            >
              {renderPromptSegments.map((seg, i) => {
                if (seg.type === "filled") {
                  return (
                    <span
                      key={i}
                      className="rounded bg-emerald-100 px-0.5 font-semibold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                    >
                      {seg.text}
                    </span>
                  );
                }
                if (seg.type === "unfilled") {
                  return (
                    <span
                      key={i}
                      className="rounded bg-amber-100 px-0.5 text-amber-700 dark:bg-amber-900 dark:text-amber-200"
                    >
                      {seg.text}
                    </span>
                  );
                }
                return <span key={i}>{seg.text}</span>;
              })}
            </pre>
          </div>

          {/* Fade overlay + expand button for long prompts */}
          {isLongPrompt && !isExpanded && (
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
              <div className="h-24 w-full rounded-b-lg bg-gradient-to-t from-stone-50 via-stone-50/90 to-transparent dark:from-stone-800 dark:via-stone-800/90" />
              <button
                onClick={() => setIsExpanded(true)}
                className="-mt-5 z-10 inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-600 shadow-sm transition-all hover:border-stone-400 hover:bg-stone-50 hover:shadow-md dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:border-stone-500 dark:hover:bg-stone-700"
              >
                <ChevronDown className="h-3.5 w-3.5" />
                Show full prompt ({lineCount} lines)
              </button>
            </div>
          )}

          {/* Collapse button when expanded */}
          {isLongPrompt && isExpanded && (
            <div className="mt-3 flex justify-center">
              <button
                onClick={() => {
                  setIsExpanded(false);
                  // Scroll back to the prompt section
                  preRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-600 shadow-sm transition-all hover:border-stone-400 hover:bg-stone-50 hover:shadow-md dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:border-stone-500 dark:hover:bg-stone-700"
              >
                <ChevronUp className="h-3.5 w-3.5" />
                Collapse prompt
              </button>
            </div>
          )}
        </div>

        {/* Premium overlay */}
        {isPremium && !isPurchased && promptText.length > (premiumPreviewLength ?? 200) && (
          <>
            <div className="relative -mt-12 h-24 bg-gradient-to-t from-stone-50 via-stone-50/90 to-transparent dark:from-stone-800 dark:via-stone-800/90" />
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-5 text-center dark:border-amber-800 dark:bg-amber-900/20">
              {promptId && zapPrice && zapPrice > 0 && creatorId ? (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    &#10022; Premium Prompt
                  </p>
                  <UnlockButton
                    promptId={promptId}
                    zapPrice={zapPrice}
                    creatorId={creatorId}
                    isPurchased={false}
                  />
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    &#10022; Premium Prompt
                  </p>
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-500">
                    This is a premium prompt. Unlock it with Zaps to see the full content.
                  </p>
                </>
              )}
            </div>
          </>
        )}

        {/* Run Prompt */}
        {promptId && showFullContent && (
          <RunPrompt promptId={promptId} customizedPrompt={augmentedPrompt} promptType={promptType} />
        )}
      </div>
    </>
  );
}
