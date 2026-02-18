import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  category: {
    name: string;
    slug: string;
    icon: string;
    description: string;
    promptCount: number;
  };
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex items-center gap-4 rounded-lg border border-stone-200 bg-white p-4 transition-all hover:border-stone-300 hover:shadow-sm"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-xl transition-colors group-hover:bg-stone-200">
        {category.icon}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-stone-900">
          {category.name}
        </h3>
        <p className="text-xs text-stone-400">
          {category.promptCount} prompts
        </p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-stone-300 transition-colors group-hover:text-stone-500" />
    </Link>
  );
}
