"use client";

import { useState, useMemo, useCallback } from "react";
import { Copy, Check, RotateCcw, Variable, Sparkles } from "lucide-react";

interface VariableDefinition {
  name: string;
  description: string;
}

interface PromptCustomizerProps {
  /** The raw prompt template containing {{variable}} placeholders. */
  promptText: string;
  /** The variable definitions from the database. */
  variables: VariableDefinition[];
}

/**
 * PromptCustomizer — interactive variable input + live prompt preview.
 *
 * Renders a list of editable variable fields extracted from the prompt
 * template, a live preview with substituted values highlighted, and a
 * copy button that copies the customized result.
 */
export default function PromptCustomizer({
  promptText,
  variables,
}: PromptCustomizerProps) {
  // Initialise all variable values to empty strings
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const v of variables) {
      initial[v.name] = "";
    }
    return initial;
  });

  const [copied, setCopied] = useState(false);

  /** True when at least one variable has a non-empty value. */
  const hasCustomisations = useMemo(
    () => Object.values(values).some((v) => v.trim() !== ""),
    [values]
  );

  /** The prompt text with filled variables substituted. */
  const customisedText = useMemo(() => {
    let text = promptText;
    for (const [name, value] of Object.entries(values)) {
      if (value.trim()) {
        // Replace all occurrences of {{name}} with the user's value
        text = text.replaceAll(`{{${name}}}`, value);
      }
    }
    return text;
  }, [promptText, values]);

  /** Number of filled vs total variables. */
  const filledCount = useMemo(
    () => Object.values(values).filter((v) => v.trim() !== "").length,
    [values]
  );

  const handleChange = useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleReset = useCallback(() => {
    const reset: Record<string, string> = {};
    for (const v of variables) {
      reset[v.name] = "";
    }
    setValues(reset);
  }, [variables]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(customisedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [customisedText]);

  /**
   * Renders the prompt text with unfilled {{variables}} highlighted
   * as interactive-looking badges so the user can see what's left.
   */
  const renderPreview = useMemo(() => {
    // Split the customised text on remaining {{...}} placeholders
    const parts = customisedText.split(/({{[^}]+}})/g);
    return parts.map((part, i) => {
      const match = part.match(/^{{(.+)}}$/);
      if (match) {
        // This is an unfilled placeholder
        return (
          <span
            key={i}
            className="inline-block rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs font-medium text-amber-700"
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }, [customisedText]);

  if (variables.length === 0) {
    // No variables — just show the prompt with a copy button
    return (
      <div className="rounded-lg border border-stone-200 bg-white p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-medium uppercase tracking-widest text-stone-400">
            Prompt
          </h2>
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              copied
                ? "bg-stone-600 text-white"
                : "bg-stone-900 text-white hover:bg-stone-800"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Prompt
              </>
            )}
          </button>
        </div>
        <pre className="whitespace-pre-wrap rounded-lg border border-stone-200 bg-stone-50 p-5 font-mono text-sm leading-relaxed text-stone-700">
          {promptText}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Variable Inputs */}
      <div className="rounded-lg border border-stone-200 bg-white p-6 sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Variable className="h-5 w-5 text-stone-500" />
            <h2 className="text-lg font-semibold text-stone-900">
              Customize Variables
            </h2>
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500">
              {filledCount}/{variables.length}
            </span>
          </div>
          {hasCustomisations && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-500 transition-colors hover:border-stone-300 hover:text-stone-700"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>

        <div className="space-y-4">
          {variables.map((v) => (
            <div key={v.name}>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-stone-700">
                <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs text-stone-600">
                  {`{{${v.name}}}`}
                </code>
                <span className="text-stone-400">—</span>
                <span className="font-normal text-stone-500">
                  {v.description}
                </span>
              </label>
              <input
                type="text"
                value={values[v.name] || ""}
                onChange={(e) => handleChange(v.name, e.target.value)}
                placeholder={v.description}
                className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-300 focus:border-stone-400 focus:ring-2 focus:ring-stone-100"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Prompt Preview */}
      <div className="rounded-lg border border-stone-200 bg-white p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-medium uppercase tracking-widest text-stone-400">
              {hasCustomisations ? "Customized Prompt" : "Prompt"}
            </h2>
            {hasCustomisations && (
              <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
                <Sparkles className="h-3 w-3" />
                {filledCount} variable{filledCount !== 1 ? "s" : ""} filled
              </span>
            )}
          </div>
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              copied
                ? "bg-stone-600 text-white"
                : "bg-stone-900 text-white hover:bg-stone-800"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                {hasCustomisations ? "Copy Customized" : "Copy Prompt"}
              </>
            )}
          </button>
        </div>
        <pre className="whitespace-pre-wrap rounded-lg border border-stone-200 bg-stone-50 p-5 font-mono text-sm leading-relaxed text-stone-700">
          {renderPreview}
        </pre>
      </div>
    </div>
  );
}
