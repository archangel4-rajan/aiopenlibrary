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

  return (
    <Image
      src={fallback === "gif" ? "/logo.gif" : "/logo.png"}
      alt="AIOpenLibrary"
      width={size}
      height={size}
      className="object-contain"
      unoptimized={fallback === "gif"}
      style={{ width: size, height: size }}
      onError={() =>
        setFallback((prev) => (prev === "gif" ? "png" : "text"))
      }
    />
  );
}
