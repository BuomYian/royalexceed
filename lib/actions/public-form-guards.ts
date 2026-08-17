import { checkRateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

/**
 * Shared spam/abuse guard for every public form endpoint (spec §9/§10):
 * honeypot → rate limit (IP + phone) → Turnstile. Silently "succeeds" on
 * honeypot trips (so bots don't learn they were caught) but returns a real
 * error for rate limiting / Turnstile failures.
 */
export async function runPublicFormGuards(params: {
  routeKey: string;
  honeypot?: string;
  phone: string;
  turnstileToken?: string;
}): Promise<{ ok: true } | { ok: false; error: string; silent?: boolean }> {
  if (params.honeypot) {
    return { ok: false, error: "Submission rejected", silent: true };
  }

  const rateLimit = await checkRateLimit(params.routeKey, params.phone);
  if (!rateLimit.allowed) {
    return { ok: false, error: "Too many submissions. Please try again later." };
  }

  const turnstileOk = await verifyTurnstile(params.turnstileToken);
  if (!turnstileOk) {
    return { ok: false, error: "We couldn't verify your submission. Please try again." };
  }

  return { ok: true };
}
