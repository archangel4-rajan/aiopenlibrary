import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — AIOpenLibrary",
  description:
    "Frequently asked questions about AIOpenLibrary. Learn about prompts, Zaps, submissions, and how to get the most from the platform.",
  alternates: { canonical: "https://aiopenlibrary.com/faq" },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
