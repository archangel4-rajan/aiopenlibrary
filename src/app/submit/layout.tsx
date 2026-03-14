import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create New Prompt - AIOpenLibrary",
  description:
    "Contribute to AIOpenLibrary. Submit your best AI prompts and share them with the community.",
  alternates: { canonical: "https://aiopenlibrary.com/creator/prompts/new" },
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
