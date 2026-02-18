"use client";

import { useState } from "react";
import Image from "next/image";

export default function Logo({ size = 36 }: { size?: number }) {
  const [imgError, setImgError] = useState(false);
  const [useSvg, setUseSvg] = useState(false);

  if (imgError && useSvg) {
    // Final fallback: text logo
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

  if (imgError && !useSvg) {
    return (
      <Image
        src="/logo.svg"
        alt="AIOpenLibrary"
        width={size}
        height={size}
        className="object-contain"
        style={{ width: size, height: size }}
        onError={() => setUseSvg(true)}
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
      onError={() => setImgError(true)}
    />
  );
}
