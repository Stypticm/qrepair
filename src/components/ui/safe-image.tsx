"use client";

import Image, { ImageProps } from "next/image";
import { useMemo } from "react";

type Props = Omit<ImageProps, "loader"> & {
  fallbackAlt?: string;
};

export default function SafeImage({ fallbackAlt, alt, ...rest }: Props) {
  const isTelegramWebApp = useMemo(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyWin = window as any;
      return Boolean(anyWin?.Telegram?.WebApp);
    } catch {
      return false;
    }
  }, []);

  if (isTelegramWebApp) {
    // Use plain <img> in Telegram WebApp to avoid optimizer/CSP quirks
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={(rest as any).src as string}
        alt={alt || fallbackAlt || "image"}
        width={(rest as any).width}
        height={(rest as any).height}
        style={{ maxWidth: "100%", height: "auto" }}
        loading="lazy"
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
      />
    );
  }

  return <Image {...(rest as ImageProps)} alt={alt || fallbackAlt || "image"} />;
}


