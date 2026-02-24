import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit a Prompt",
  description:
    "Contribute to AIOpenLibrary. Submit your best AI prompts and share them with the community.",
  alternates: { canonical: "https://aiopenlibrary.com/submit" },
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
