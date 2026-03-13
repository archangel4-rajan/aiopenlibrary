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
  const [fallback, setFallback] = useState(false);

  if (fallback) {
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

  return (
    <Image
      src="/logo.gif"
      alt="AIOpenLibrary"
      width={size}
      height={size}
      className={className ? `object-contain ${className}` : "object-contain"}
      style={className ? undefined : { width: size, height: size }}
      onError={() => setFallback(true)}
      unoptimized
    />
  );
}
