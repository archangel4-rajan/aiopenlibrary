function inferIcon(icon: string, model: string): string {
  if (icon === "anthropic") return "anthropic";
  if (icon === "openai") return "openai";
  if (icon === "google") return "google";
  if (icon === "xai") return "xai";
  if (icon === "meta") return "meta";
  if (icon) return icon;
  // Infer from model name when icon is missing
  const m = model.toLowerCase();
  if (m.includes("claude")) return "anthropic";
  if (m.includes("gpt") || m.includes("o3") || m.includes("o4")) return "openai";
  if (m.includes("gemini")) return "google";
  if (m.includes("grok")) return "xai";
  if (m.includes("llama")) return "meta";
  return "";
}

const ICON_MAP: Record<string, string> = {
  anthropic: "✦",
  openai: "◆",
  google: "●",
  xai: "✕",
  meta: "◈",
};

export default function ModelBadge({
  model,
  icon,
}: {
  model: string;
  icon: string;
}) {
  const resolved = inferIcon(icon, model);
  const logoText = ICON_MAP[resolved] || "◇";

  return (
    <span className="inline-flex items-center gap-1.5 self-start rounded-md border border-stone-200 bg-stone-50 px-2 py-0.5 text-[11px] font-medium text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300">
      <span className="text-xs">{logoText}</span>
      {model}
    </span>
  );
}
