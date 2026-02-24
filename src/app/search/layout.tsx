import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search AI Prompts",
  description:
    "Search through 113+ expert-crafted AI prompts. Find the perfect prompt for ChatGPT, Claude, Gemini, and more by keyword, category, or tag.",
  alternates: { canonical: "https://aiopenlibrary.com/search" },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
