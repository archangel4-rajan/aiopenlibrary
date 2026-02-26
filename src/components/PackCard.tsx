import Link from "next/link";

interface PackCardProps {
  pack: {
    id: string;
    name: string;
    description: string;
    slug: string;
    cover_image_url: string | null;
    zap_price: number;
    creator?: {
      display_name: string | null;
      username: string | null;
    } | null;
    prompt_count?: number;
  };
}

export default function PackCard({ pack }: PackCardProps) {
  const creatorName = pack.creator?.display_name || pack.creator?.username || "Creator";

  return (
    <Link
      href={`/packs/${pack.slug}`}
      className="group rounded-xl border border-stone-200 bg-stone-50 p-5 transition-all hover:border-stone-300 hover:shadow-sm dark:border-stone-700 dark:bg-stone-900 dark:hover:border-stone-600"
    >
      {pack.cover_image_url && (
        <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pack.cover_image_url}
            alt={pack.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <h3 className="mb-1.5 text-base font-semibold text-stone-900 transition-colors group-hover:text-stone-600 dark:text-stone-100 dark:group-hover:text-stone-300">
        {pack.name}
      </h3>

      <p className="mb-3 line-clamp-2 text-sm text-stone-500 dark:text-stone-400">
        {pack.description}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-stone-400 dark:text-stone-500">
          by {creatorName} · {pack.prompt_count ?? 0} prompts
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          ⚡ {pack.zap_price}
        </span>
      </div>
    </Link>
  );
}
