export default function ModelBadge({
  model,
  icon,
}: {
  model: string;
  icon: string;
}) {
  const logoText =
    icon === "anthropic"
      ? "✦"
      : icon === "openai"
      ? "◆"
      : icon === "google"
      ? "●"
      : "◇";

  return (
    <span className="inline-flex items-center gap-1.5 self-start rounded-md border border-stone-200 bg-stone-50 px-2 py-0.5 text-[11px] font-medium text-stone-600">
      <span className="text-xs">{logoText}</span>
      {model}
    </span>
  );
}
