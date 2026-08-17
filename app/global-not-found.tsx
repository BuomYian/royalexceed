// Required because this app has multiple root layouts (app/[locale] and
// app/admin, with no shared app/layout.tsx) — see next.config.ts
// `experimental.globalNotFound` and version-16 upgrade guide "global-not-found.js".
// This file bypasses all normal layouts, so it must be fully self-contained
// (own <html>/<body>, no next-intl, no design-token CSS import).
import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <html lang="en" className="dark">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B0D0F",
          color: "#F4F5F6",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <p style={{ fontSize: 14, letterSpacing: 2, color: "#9CA3AF", marginBottom: 8 }}>
            404
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
            Page not found
          </h1>
          <p style={{ color: "#9CA3AF", marginBottom: 24, lineHeight: 1.6 }}>
            The page you&apos;re looking for doesn&apos;t exist or may have
            moved.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              background: "#8f2438",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Back to homepage
          </Link>
        </div>
      </body>
    </html>
  );
}
