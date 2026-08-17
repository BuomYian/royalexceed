"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

/**
 * Cloudflare Turnstile widget. Renders nothing when
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY isn't set (local dev / this sandbox has no
 * live domain to register a site key against — see lib/turnstile.ts, which
 * accepts submissions without a token in that case too).
 */
export function TurnstileWidget({ onToken }: { onToken: (token: string) => void }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!siteKey) return;
    const win = window as unknown as {
      turnstile?: { render: (el: HTMLElement, opts: { sitekey: string; callback: (t: string) => void }) => void };
    };
    if (win.turnstile && containerRef.current) {
      win.turnstile.render(containerRef.current, { sitekey: siteKey, callback: onToken });
    }
  }, [siteKey, onToken]);

  if (!siteKey) return null;

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
      <div ref={containerRef} />
    </>
  );
}
