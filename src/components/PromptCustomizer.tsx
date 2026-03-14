"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Variable, Lightbulb, X, ChevronDown, ChevronUp } from "lucide-react";
import CopyButton from "./CopyButton";
import RunPrompt from "./RunPrompt";
import UnlockButton from "./UnlockButton";
import type { PromptVariable } from "@/lib/types";

const COLLAPSE_LINE_THRESHOLD = 150;

// ---------------------------------------------------------------------------
// Smart defaults for common variable names → dropdown options
// ---------------------------------------------------------------------------
const VARIABLE_OPTIONS: Record<string, { type: "select" | "textarea"; options?: string[]; placeholder?: string }> = {
  // Skill / difficulty / level
  SKILL_LEVEL:        { type: "select", options: ["Beginner", "Intermediate", "Advanced"] },
  LEVEL:              { type: "select", options: ["Beginner", "Intermediate", "Advanced"] },
  DIFFICULTY:         { type: "select", options: ["Easy", "Medium", "Hard"] },
  PROFICIENCY_LEVEL:  { type: "select", options: ["A1 — Beginner", "A2 — Elementary", "B1 — Intermediate", "B2 — Upper Intermediate", "C1 — Advanced", "C2 — Proficient"] },
  EXPERIENCE:         { type: "select", options: ["Beginner", "Intermediate", "Advanced", "Expert"] },
  CURRENT_LEVEL:      { type: "select", options: ["Beginner", "Intermediate", "Advanced"] },

  // Tone & style
  TONE:               { type: "select", options: ["Formal", "Professional", "Friendly", "Casual", "Humorous", "Persuasive", "Empathetic", "Urgent", "Inspirational"] },
  DESIRED_TONE:       { type: "select", options: ["Formal", "Professional", "Friendly", "Casual", "Humorous", "Persuasive", "Empathetic"] },
  FORMALITY:          { type: "select", options: ["Formal", "Semi-formal", "Informal", "Casual"] },
  BRAND_VOICE:        { type: "select", options: ["Professional", "Friendly", "Bold", "Minimalist", "Playful", "Authoritative", "Warm"] },
  VIBE:               { type: "select", options: ["Funny", "Deep / Philosophical", "Work-appropriate", "Family-friendly", "Spicy"] },

  // Style (art/design/writing)
  ART_STYLE:          { type: "select", options: ["Photorealistic", "Oil Painting", "Watercolor", "Digital Art", "Anime", "Pixel Art", "Minimalist", "Comic Book", "Impressionist", "3D Render"] },
  DESIGN_STYLE:       { type: "select", options: ["Minimalist", "Mid-century Modern", "Scandinavian", "Industrial", "Japandi", "Art Deco", "Bohemian", "Contemporary", "Rustic"] },
  STYLE_PREFERENCE:   { type: "select", options: ["Photorealistic", "Artistic", "Minimalist", "Dramatic", "Vintage", "Modern"] },
  DESIRED_STYLE:      { type: "select", options: ["Photorealistic", "Artistic", "Minimalist", "Abstract", "Vintage", "Futuristic"] },

  // Format
  FORMAT:             { type: "select", options: ["Blog post", "Email", "Social media post", "Report", "Presentation", "Video script", "Whitepaper", "Newsletter"] },
  CONTENT_TYPE:       { type: "select", options: ["Blog post", "Social media post", "Email", "Ad copy", "Landing page", "Newsletter", "Case study", "White paper", "Documentation"] },

  // Industry
  INDUSTRY:           { type: "select", options: ["Technology", "Healthcare", "Finance", "Education", "E-commerce", "SaaS", "Real Estate", "Manufacturing", "Media", "Consulting", "Legal", "Nonprofit", "Other"] },

  // Business
  BUSINESS_MODEL:     { type: "select", options: ["SaaS", "Marketplace", "E-commerce", "Subscription", "Freemium", "Agency/Services", "Hardware", "Platform"] },
  BUSINESS_STRUCTURE: { type: "select", options: ["Sole Proprietorship", "LLC", "S-Corp", "C-Corp", "Partnership"] },
  COMPANY_SIZE:       { type: "select", options: ["1-10", "11-50", "51-200", "201-1000", "1000+"] },
  COMPANY_STAGE:      { type: "select", options: ["Pre-revenue", "Early Revenue", "Growth Stage", "Mature", "Enterprise"] },
  STAGE:              { type: "select", options: ["Pre-seed", "Seed", "Series A", "Series B+", "Growth", "Late Stage"] },

  // Budget
  BUDGET_LEVEL:       { type: "select", options: ["Budget", "Mid-range", "Luxury"] },
  BUDGET:             { type: "select", options: ["Under $100", "$100-500", "$500-2,000", "$2,000-10,000", "$10,000+", "Flexible"] },

  // Technical
  CLOUD_PROVIDER:     { type: "select", options: ["AWS", "Google Cloud (GCP)", "Microsoft Azure", "Multi-cloud"] },
  LANGUAGE_FRAMEWORK: { type: "select", options: ["JavaScript/Node.js", "Python", "TypeScript", "Java", "Go", "Rust", "Ruby", "C#/.NET", "PHP", "Swift", "Kotlin"] },
  TECH_STACK:         { type: "select", options: ["React + Node.js", "Next.js + Vercel", "Python + Django", "Ruby on Rails", "Java Spring Boot", "Go", ".NET", "Vue.js + Express", "Other"] },
  PLATFORM:           { type: "select", options: ["Web", "iOS", "Android", "Cross-platform", "Desktop"] },
  AI_TOOL:            { type: "select", options: ["DALL-E 3", "Midjourney", "Stable Diffusion", "Leonardo AI", "Firefly", "Any"] },
  EXCEL_OR_SHEETS:    { type: "select", options: ["Microsoft Excel", "Google Sheets"] },
  MODEL_NAME:         { type: "select", options: ["Stable Diffusion XL", "SD 1.5", "Stable Diffusion 3", "Custom/Fine-tuned"] },

  // Languages
  TARGET_LANGUAGE:    { type: "select", options: ["Spanish", "French", "German", "Italian", "Portuguese", "Chinese (Mandarin)", "Japanese", "Korean", "Arabic", "Hindi", "Russian", "Dutch", "Swedish", "Turkish", "Other"] },
  SOURCE_LANGUAGE:    { type: "select", options: ["English", "Spanish", "French", "German", "Chinese (Mandarin)", "Japanese", "Korean", "Arabic", "Portuguese", "Russian", "Other"] },

  // Finance
  RISK_TOLERANCE:     { type: "select", options: ["Conservative", "Moderate", "Aggressive"] },
  FILING_STATUS:      { type: "select", options: ["Single", "Married Filing Jointly", "Married Filing Separately", "Head of Household", "Qualifying Surviving Spouse"] },
  INCOME_RANGE:       { type: "select", options: ["Under $50K", "$50K-100K", "$100K-200K", "$200K-500K", "$500K+"] },

  // Legal
  NDA_TYPE:           { type: "select", options: ["Mutual (two-way)", "One-way (unilateral)"] },
  JURISDICTION:       { type: "select", options: ["United States", "United Kingdom", "European Union", "Canada", "Australia", "Other"] },

  // Sales
  DEAL_SIZE:          { type: "select", options: ["Under $10K", "$10K-50K", "$50K-250K", "$250K-1M", "$1M+"] },

  // Compliance
  COMPLIANCE_FRAMEWORKS: { type: "select", options: ["SOC 2", "ISO 27001", "GDPR", "HIPAA", "NIST", "PCI DSS", "Multiple"] },
  WCAG_LEVEL:         { type: "select", options: ["Level A", "Level AA (recommended)", "Level AAA"] },

  // Cooking
  CUISINE:            { type: "select", options: ["Italian", "Mexican", "Chinese", "Japanese", "Indian", "Thai", "French", "Mediterranean", "Korean", "American", "Middle Eastern", "No preference"] },
  DIETARY_RESTRICTIONS: { type: "select", options: ["None", "Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Keto", "Paleo", "Nut-free", "Halal", "Kosher", "Low-sodium", "Multiple"] },
  PREFERENCE:         { type: "select", options: ["Alcoholic", "Non-alcoholic (Mocktail)", "Either"] },
  FLAVOR_PROFILE:     { type: "select", options: ["Sweet", "Sour", "Bitter", "Herbal", "Fruity", "Smoky", "Spicy", "Refreshing"] },

  // Travel
  STYLE:              { type: "select", options: ["Adventure", "Relaxation", "Cultural", "Foodie", "Family", "Budget Backpacking", "Luxury"] },

  // Interview
  TYPE:               { type: "select", options: ["System Design", "Coding / Algorithms", "Behavioral", "Mixed / Full Loop"] },
  TEST_TYPE:          { type: "select", options: ["Black Box", "Gray Box", "White Box"] },

  // Severity / Priority / Urgency
  URGENCY:            { type: "select", options: ["FYI / No rush", "Response needed", "Urgent", "Blocker"] },
  RISK_LEVEL:         { type: "select", options: ["Low", "Medium", "High", "Critical"] },

  // Time
  TIME_HORIZON:       { type: "select", options: ["Short-term (< 1 year)", "Medium-term (1-5 years)", "Long-term (5+ years)"] },
  DURATION:           { type: "select", options: ["30 minutes", "1 hour", "2 hours", "Half day", "Full day", "2-3 days", "1 week", "2 weeks", "1 month+"] },
  TIME_AVAILABLE:     { type: "select", options: ["15 minutes", "30 minutes", "1 hour", "2+ hours"] },
  SPRINT_LENGTH:      { type: "select", options: ["7 days (1 week)", "10 days", "14 days (2 weeks)", "21 days (3 weeks)"] },

  // Aspect ratio
  ASPECT_RATIO:       { type: "select", options: ["1:1 (Square)", "16:9 (Widescreen)", "9:16 (Portrait/Story)", "4:3 (Standard)", "3:2 (Photo)", "2:3 (Tall)", "21:9 (Ultrawide)"] },

  // Work model
  WORK_MODEL:         { type: "select", options: ["Remote", "Hybrid", "On-site"] },
  LOCATION:           { type: "select", options: ["Remote", "Hybrid", "On-site — specify city"] },

  // Content / writing
  GENRE:              { type: "select", options: ["Fantasy", "Science Fiction", "Mystery", "Romance", "Thriller", "Literary Fiction", "Horror", "Historical Fiction", "Non-fiction", "Other"] },
  SUBGENRE:           { type: "select", options: ["Epic Fantasy", "Urban Fantasy", "Dark Fantasy", "Grimdark", "Cozy Fantasy", "Progression Fantasy", "Science Fantasy"] },
  PARENTING_STYLE:    { type: "select", options: ["Authoritative", "Permissive", "Gentle / Attachment", "Montessori-inspired", "Not sure"] },
  RELATIONSHIP:       { type: "select", options: ["Manager → Direct Report", "Peer / Colleague", "Skip-level", "Cross-functional", "External / Client"] },

  // Textareas for long-form input
  SITUATION:          { type: "textarea", placeholder: "Describe the situation in detail..." },
  PROCESS_DESCRIPTION: { type: "textarea", placeholder: "Describe the process step by step..." },
  RAW_NOTES:          { type: "textarea", placeholder: "Paste your raw notes here..." },
  MEETING_NOTES:      { type: "textarea", placeholder: "Paste the meeting notes or transcript..." },
  EMAIL_CONTENT:      { type: "textarea", placeholder: "Paste the email content here..." },
  EMAIL_LIST:         { type: "textarea", placeholder: "Paste your unread emails here..." },
  CODE:               { type: "textarea", placeholder: "Paste your code here..." },
  CURRENT_CODE:       { type: "textarea", placeholder: "Paste your current code..." },
  DOCKERFILE:         { type: "textarea", placeholder: "Paste your Dockerfile..." },
  CURRENT_PROMPT:     { type: "textarea", placeholder: "Paste your current prompt here..." },
  SYSTEM_PROMPT:      { type: "textarea", placeholder: "Paste the system prompt to review..." },
  DIALOGUE:           { type: "textarea", placeholder: "Paste the dialogue to improve..." },
  TEXT:               { type: "textarea", placeholder: "Paste the text to review..." },
  ORIGINAL_TEXT:      { type: "textarea", placeholder: "Paste the original text..." },
  TRANSLATED_TEXT:    { type: "textarea", placeholder: "Paste the translated text..." },
  PORTFOLIO_DETAILS:  { type: "textarea", placeholder: "List your holdings (ticker, amount, cost basis)..." },
  FINANCIAL_DATA:     { type: "textarea", placeholder: "Paste financial statement data..." },
  RAW_FINDINGS:       { type: "textarea", placeholder: "Paste your raw findings..." },
  DATA_FINDINGS:      { type: "textarea", placeholder: "Describe your data and key findings..." },
  ARCHITECTURE:       { type: "textarea", placeholder: "Describe the system architecture..." },
  SYSTEM_DESCRIPTION: { type: "textarea", placeholder: "Describe the system in detail..." },
  REVIEWER_COMMENTS:  { type: "textarea", placeholder: "Paste the reviewer comments..." },
  GIT_LOG:            { type: "textarea", placeholder: "Paste git log or recent changes..." },
  WORD_LIST:          { type: "textarea", placeholder: "List the words to learn, separated by commas..." },
  DRAFT_MESSAGE:      { type: "textarea", placeholder: "Paste your draft message..." },
  AVAILABLE_INGREDIENTS: { type: "textarea", placeholder: "List what you have in the fridge/pantry..." },
  CONTENT_BRIEF:      { type: "textarea", placeholder: "Describe the content brief..." },
  HOMEWORK_QUESTION:  { type: "textarea", placeholder: "Type or paste the homework question..." },
  STUDENT_ATTEMPT:    { type: "textarea", placeholder: "What has the student tried so far..." },
};

// Get the resolved type and options for a variable
function resolveVariable(v: PromptVariable): {
  type: "text" | "select" | "textarea";
  options?: string[];
  label: string;
  placeholder: string;
} {
  // Use explicit type/options if provided by the variable itself
  if (v.type && v.type !== "text") {
    return {
      type: v.type,
      options: v.options,
      label: v.label || v.description || formatLabel(v.name),
      placeholder: v.placeholder || v.description || `Enter ${formatLabel(v.name).toLowerCase()}...`,
    };
  }

  // Try smart defaults from the mapping
  const upperName = v.name.toUpperCase();
  const defaults = VARIABLE_OPTIONS[upperName];
  if (defaults) {
    return {
      type: defaults.type,
      options: defaults.options,
      label: v.label || v.description || formatLabel(v.name),
      placeholder: defaults.placeholder || v.placeholder || v.description || `Enter ${formatLabel(v.name).toLowerCase()}...`,
    };
  }

  return {
    type: "text",
    label: v.label || v.description || formatLabel(v.name),
    placeholder: v.placeholder || v.description || `Enter ${formatLabel(v.name).toLowerCase()}...`,
  };
}

function formatLabel(name: string): string {
  return name
    .replace(/_/g, " ")
    .replace(/\//g, " / ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
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

  // Build the augmented prompt — supports both {{var}} and [VAR] formats
  const augmentedPrompt = useMemo(() => {
    let result = promptText;
    for (const v of variables) {
      const userValue = values[v.name]?.trim();
      if (userValue) {
        // Replace {{var_name}} format (original prompts)
        result = result.replaceAll(`{{${v.name}}}`, userValue);
        // Replace [VAR_NAME] format (new prompts)
        result = result.replaceAll(`[${v.name}]`, userValue);
      }
    }
    return result;
  }, [promptText, variables, values]);

  // Notify parent of prompt changes
  useEffect(() => {
    onPromptChange?.(augmentedPrompt);
  }, [augmentedPrompt, onPromptChange]);

  const showFullContent = !isPremium || isPurchased;
  const displayPromptText = useMemo(() => {
    if (showFullContent) return promptText;
    const maxLen = premiumPreviewLength ?? 200;
    if (promptText.length <= maxLen) return promptText;
    return promptText.slice(0, maxLen);
  }, [promptText, showFullContent, premiumPreviewLength]);

  // Render the prompt with visual highlighting for variables (both formats)
  const renderPromptSegments = useMemo(() => {
    if (variables.length === 0) {
      return [{ text: promptText, type: "text" as const }];
    }

    const segments: { text: string; type: "text" | "filled" | "unfilled" }[] = [];
    const varNames = variables.map((v) => v.name);

    // Build regex matching both {{var}} and [VAR] formats
    const escapedNames = varNames.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const curlyPattern = escapedNames.map((n) => `\\{\\{${n}\\}\\}`).join("|");
    const bracketPattern = escapedNames.map((n) => `\\[${n}\\]`).join("|");
    const pattern = new RegExp(`(${curlyPattern}|${bracketPattern})`, "g");

    let match;
    let lastIndex = 0;
    const remaining = displayPromptText;
    pattern.lastIndex = 0;

    while ((match = pattern.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ text: remaining.slice(lastIndex, match.index), type: "text" });
      }

      // Extract variable name from {{name}} or [NAME]
      let varName = match[1];
      if (varName.startsWith("{{")) {
        varName = varName.slice(2, -2);
      } else if (varName.startsWith("[")) {
        varName = varName.slice(1, -1);
      }

      const userValue = values[varName]?.trim();
      if (userValue) {
        segments.push({ text: userValue, type: "filled" });
      } else {
        segments.push({ text: match[1], type: "unfilled" });
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < remaining.length) {
      segments.push({ text: remaining.slice(lastIndex), type: "text" });
    }

    return segments;
  }, [displayPromptText, promptText, variables, values]);

  // Resolve all variables with smart types
  const resolvedVars = useMemo(() => variables.map((v) => ({ ...v, ...resolveVariable(v) })), [variables]);

  return (
    <>
      {/* Variables to Customize */}
      {variables.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-900 dark:text-stone-100">
              <Variable className="h-5 w-5 text-stone-500 dark:text-stone-400" />
              Customize Your Prompt
            </h2>
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600 dark:bg-stone-700 dark:text-stone-300">
              {filledCount}/{variables.length} filled
            </span>
          </div>
          <div className="space-y-3">
            {resolvedVars.map((v) => (
              <div
                key={v.name}
                className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800"
              >
                <div className="mb-2 flex items-start justify-between gap-2 sm:items-center">
                  <label
                    htmlFor={`var-${v.name}`}
                    className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2"
                  >
                    <span className="text-sm font-medium text-stone-800 dark:text-stone-200">
                      {v.label}
                    </span>
                    <code className="shrink-0 rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] text-stone-400 dark:bg-stone-700 dark:text-stone-500">
                      {v.name}
                    </code>
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

                {/* Select / Dropdown */}
                {v.type === "select" && v.options ? (
                  <div className="relative">
                    <select
                      id={`var-${v.name}`}
                      value={values[v.name] || ""}
                      onChange={(e) => handleChange(v.name, e.target.value)}
                      className="w-full appearance-none rounded-md border border-stone-200 bg-stone-50 px-3 py-2.5 pr-10 text-sm text-stone-900 outline-none transition-colors focus:border-stone-400 focus:ring-1 focus:ring-stone-200 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 dark:focus:border-stone-500 dark:focus:ring-stone-600"
                    >
                      <option value="">{v.placeholder || `Select ${v.label}...`}</option>
                      {v.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
                  </div>
                ) : v.type === "textarea" ? (
                  /* Textarea for long-form input */
                  <textarea
                    id={`var-${v.name}`}
                    value={values[v.name] || ""}
                    onChange={(e) => handleChange(v.name, e.target.value)}
                    placeholder={v.placeholder}
                    rows={3}
                    className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none transition-colors focus:border-stone-400 focus:ring-1 focus:ring-stone-200 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-stone-500 dark:focus:ring-stone-600"
                  />
                ) : (
                  /* Standard text input */
                  <input
                    id={`var-${v.name}`}
                    type="text"
                    value={values[v.name] || ""}
                    onChange={(e) => handleChange(v.name, e.target.value)}
                    placeholder={v.placeholder}
                    className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none transition-colors focus:border-stone-400 focus:ring-1 focus:ring-stone-200 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-stone-500 dark:focus:ring-stone-600"
                  />
                )}
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
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-stone-400 dark:text-stone-500 sm:text-xs">
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

          {isLongPrompt && isExpanded && (
            <div className="mt-3 flex justify-center">
              <button
                onClick={() => {
                  setIsExpanded(false);
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

        {promptId && showFullContent && (
          <RunPrompt promptId={promptId} customizedPrompt={augmentedPrompt} promptType={promptType} />
        )}
      </div>
    </>
  );
}
