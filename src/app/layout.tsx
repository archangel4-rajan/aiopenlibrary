import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/Toast";
import { getUser, getProfile } from "@/lib/auth";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aiopenlibrary.com"),
  title: {
    default: "AIOpenLibrary - The Wikipedia for AI Prompts",
    template: "%s | AIOpenLibrary",
  },
  description:
    "The Wikipedia for prompts. Browse 113+ expert-crafted, ready-to-use AI prompts across 20 categories. Discover, customize, and master prompt engineering for ChatGPT, Claude, Gemini, and more.",
  keywords: [
    "AI prompts",
    "prompt engineering",
    "prompt library",
    "ChatGPT prompts",
    "Claude prompts",
    "Gemini prompts",
    "AI tools",
    "best AI prompts",
    "free AI prompts",
    "prompt templates",
    "AI prompt examples",
    "writing prompts AI",
    "coding prompts AI",
  ],
  authors: [{ name: "AIOpenLibrary" }],
  creator: "AIOpenLibrary",
  publisher: "AIOpenLibrary",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "AIOpenLibrary",
    title: "AIOpenLibrary - The Wikipedia for AI Prompts",
    description:
      "Browse 113+ expert-crafted AI prompts across 20 categories. Free, open-source prompt library for ChatGPT, Claude, Gemini, and more.",
    url: "https://aiopenlibrary.com",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "AIOpenLibrary - The Wikipedia for AI Prompts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AIOpenLibrary - The Wikipedia for AI Prompts",
    description:
      "Browse 113+ expert-crafted AI prompts across 20 categories. Free and open-source.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "https://aiopenlibrary.com",
  },
  verification: {},
};

// Site-wide JSON-LD structured data
function SiteJsonLd() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AIOpenLibrary",
    url: "https://aiopenlibrary.com",
    logo: "https://aiopenlibrary.com/logo.png",
    description:
      "The Wikipedia for AI prompts. A free, open-source library of expert-crafted prompts.",
    sameAs: [],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AIOpenLibrary",
    url: "https://aiopenlibrary.com",
    description:
      "Browse 113+ expert-crafted AI prompts across 20 categories.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://aiopenlibrary.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
    </>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  const profile = user ? await getProfile() : null;

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <SiteJsonLd />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var isDark = theme === 'dark' || ((theme === 'system' || !theme) && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider
          initialUser={user}
          initialProfile={profile}
        >
          <ToastProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
