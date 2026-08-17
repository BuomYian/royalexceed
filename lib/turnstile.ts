const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verifies a Cloudflare Turnstile token. Degrades to a logged dev pass-through
 * when TURNSTILE_SECRET_KEY is unset, so local dev / Playwright E2E aren't
 * blocked by a live site key that only a deployed domain can obtain (see
 * README "Not verifiable in this sandbox").
 */
export async function verifyTurnstile(token: string | undefined | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    console.warn(
      "[turnstile] TURNSTILE_SECRET_KEY not set — skipping verification (dev only). Set it before production deploy.",
    );
    return true;
  }

  if (!token) return false;

  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token }),
    });
    const data = (await response.json()) as { success: boolean };
    return data.success;
  } catch (error) {
    console.error("[turnstile] verification request failed", error);
    return false;
  }
}
