import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="mb-6 flex items-center gap-1.5 overflow-x-auto text-xs text-stone-400 dark:text-stone-500 sm:gap-2 sm:text-sm">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5 sm:gap-2">
          {i > 0 && <span className="shrink-0">/</span>}
          {item.href ? (
            <Link href={item.href} className="shrink-0 hover:text-stone-600 dark:hover:text-stone-300">
              {item.label}
            </Link>
          ) : (
            <span className="truncate text-stone-600 dark:text-stone-300">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
