// Next.js requires global-error.js to define its own <html>/<body> — it
// replaces the root layout entirely when an error escapes every nested
// error.tsx boundary. Kept minimal and dependency-free for the same reasons
// as app/global-not-found.tsx.
"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
            500
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
            Something went wrong
          </h1>
          <p style={{ color: "#9CA3AF", marginBottom: 24, lineHeight: 1.6 }}>
            We hit an unexpected error. Please try again, or contact us on
            WhatsApp if the problem continues.
          </p>
          <button
            onClick={() => reset()}
            style={{
              display: "inline-block",
              background: "#8f2438",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
