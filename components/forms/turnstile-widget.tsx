"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Loader2, AlertTriangle } from "lucide-react";

/** Whether a form needs to wait for a Turnstile token before it can submit. `false` locally / in this sandbox, where no site key is configured. */
export const TURNSTILE_ENABLED = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

type WidgetStatus = "loading" | "verifying" | "verified" | "error";

/**
 * Cloudflare Turnstile widget. Renders nothing when
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY isn't set — lib/turnstile.ts accepts
 * submissions without a token in that case too.
 *
 * Two bugs used to make every form randomly fail to submit once real
 * Turnstile keys were configured:
 *
 * 1. The Cloudflare script loaded with `strategy="lazyOnload"`, which Next.js
 *    defers until the browser sits idle — often well after a quick user had
 *    already hit Submit. `turnstileToken` was still empty at that point, and
 *    the server guard (which requires a token whenever a secret key is
 *    configured, see lib/turnstile.ts) rejected the submission outright.
 * 2. `onToken` was passed inline from the parent form — a new function
 *    identity on every render — and it sat in this effect's dependency
 *    array. So *any* re-render of the form (typing, a Select value
 *    changing, RHF's own validation re-render) re-ran the effect and called
 *    `turnstile.render()` again on the same container, stacking duplicate
 *    widgets and restarting the challenge from scratch. That's the "loads
 *    slow" symptom — it wasn't slow, it was being restarted continuously
 *    and never got the chance to finish.
 *
 * Fixed by rendering the widget exactly once per mount (the latest
 * `onToken`/`onReady` are read from refs, not the dependency array) and by
 * reporting ready/verifying/error state via `onReady` so the parent form can
 * disable Submit until a token genuinely exists — instead of guessing with a
 * fixed timer, which would either reintroduce this same race (too short) or
 * make every submission wait needlessly (too long).
 */
export function TurnstileWidget({
  onToken,
  onReady,
}: {
  onToken: (token: string) => void;
  /** Fires with `true` once a usable token is held, and `false` again if it expires. */
  onReady?: (ready: boolean) => void;
}) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);
  const onTokenRef = useRef(onToken);
  const onReadyRef = useRef(onReady);
  const [status, setStatus] = useState<WidgetStatus>("loading");

  // Keep the latest callbacks available to Cloudflare's own callbacks
  // without putting them in the render effect's deps below (ref writes must
  // happen post-render, not during it, hence the effect rather than a plain
  // assignment in the component body).
  useEffect(() => {
    onTokenRef.current = onToken;
    onReadyRef.current = onReady;
  });

  function setStatusAndReady(next: WidgetStatus) {
    setStatus(next);
    onReadyRef.current?.(next === "verified");
  }

  function renderWidget() {
    if (renderedRef.current || !containerRef.current) return;
    const win = window as unknown as {
      turnstile?: {
        render: (
          el: HTMLElement,
          opts: {
            sitekey: string;
            callback: (t: string) => void;
            "expired-callback"?: () => void;
            "error-callback"?: () => void;
          },
        ) => void;
      };
    };
    if (!win.turnstile) return;
    renderedRef.current = true;
    win.turnstile.render(containerRef.current, {
      sitekey: siteKey!,
      callback: (t) => {
        onTokenRef.current(t);
        setStatusAndReady("verified");
      },
      "expired-callback": () => {
        onTokenRef.current("");
        setStatusAndReady("verifying");
      },
      "error-callback": () => setStatusAndReady("error"),
    });
    setStatus("verifying");
  }

  useEffect(() => {
    if (!siteKey) return;
    // Deferred a tick so this fires as a callback rather than synchronously
    // inside the effect body — covers the case where api.js is already
    // loaded (e.g. this widget remounted after a client-side nav), where
    // <Script onLoad> won't fire again to trigger the render for us.
    const id = window.setTimeout(renderWidget, 0);
    return () => window.clearTimeout(id);
    // renderWidget reads onToken/onReady via refs, so it never needs to be
    // in this array — only `siteKey` (effectively constant) should re-run it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  if (!siteKey) return null;

  return (
    <div className="space-y-1.5">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={renderWidget}
        onError={() => setStatusAndReady("error")}
      />
      <div ref={containerRef} />
      {status === "loading" && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading security check…
        </p>
      )}
      {status === "verifying" && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Verifying your submission…
        </p>
      )}
      {status === "error" && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertTriangle className="h-3 w-3" /> Security check failed to load — check your connection and reload the page.
        </p>
      )}
    </div>
  );
}
