"use client";

import { useState } from "react";
import Image from "next/image";

export default function Logo({
  size = 36,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const [fallback, setFallback] = useState<"video" | "png" | "text">("video");

  if (fallback === "text") {
    return (
      <div
        className={
          className
            ? `flex items-center justify-center rounded-full bg-stone-800 ${className}`
            : "flex items-center justify-center rounded-full bg-stone-800"
        }
        style={className ? undefined : { width: size, height: size }}
      >
        <span className="font-semibold text-stone-200 text-[40%]">A</span>
      </div>
    );
  }

  if (fallback === "video") {
    return (
      <video
        autoPlay
        muted
        loop
        playsInline
        width={size}
        height={size}
        className={
          className ? `object-contain ${className}` : "object-contain"
        }
        style={className ? undefined : { width: size, height: size }}
        onError={() => setFallback("png")}
      >
        <source src="/logo.webm" type="video/webm" />
      </video>
    );
  }

  return (
    <Image
      src="/logo.png"
      alt="AIOpenLibrary"
      width={size}
      height={size}
      className={className ? `object-contain ${className}` : "object-contain"}
      style={className ? undefined : { width: size, height: size }}
      onError={() => setFallback("text")}
    />
  );
}
