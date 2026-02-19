import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import { getUser, getProfile } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIOpenLibrary - Explore the Best Prompts in the World",
  description:
    "The open-source prompt library for practitioners. Browse expert-crafted prompts, customize variables in real time, and copy results ready for Claude, ChatGPT, Gemini, and more.",
  keywords: [
    "AI prompts",
    "prompt engineering",
    "ChatGPT prompts",
    "Claude prompts",
    "AI tools",
    "prompt library",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  const profile = user ? await getProfile() : null;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider
          initialUser={user}
          initialProfile={profile}
        >
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
