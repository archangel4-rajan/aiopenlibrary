"use client";

import { useState } from "react";
import Image from "next/image";

export default function Logo({ size = 36 }: { size?: number }) {
  const [fallback, setFallback] = useState<"gif" | "png" | "text">("gif");

  if (fallback === "text") {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-stone-800"
        style={{ width: size, height: size }}
      >
        <span
          className="font-semibold text-stone-200"
          style={{ fontSize: size * 0.4 }}
        >
          A
        </span>
      </div>
    );
  }

  if (fallback === "gif") {
    // Use a plain <img> tag for the animated GIF to bypass Next.js
    // image optimization, which can strip animation frames.
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src="/logo.gif"
        alt="AIOpenLibrary"
        width={size}
        height={size}
        className="object-contain"
        style={{ width: size, height: size }}
        onError={() => setFallback("png")}
      />
    );
  }

  return (
    <Image
      src="/logo.png"
      alt="AIOpenLibrary"
      width={size}
      height={size}
      className="object-contain"
      style={{ width: size, height: size }}
      onError={() => setFallback("text")}
    />
  );
}
