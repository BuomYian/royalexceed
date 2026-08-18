import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY } from "@/lib/supabase/env";

/** Server Component / Server Action client — reads the user's session from cookies, respects RLS as `anon`/`authenticated`. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component render (not an Action/Route Handler) — the
            // proxy already refreshes the session cookie, so this can be safely ignored.
          }
        },
      },
    },
  );
}

/**
 * Service-role client — bypasses RLS entirely. Server-only: never import this from
 * a Client Component or expose SUPABASE_SERVICE_ROLE_KEY to the browser (spec §10).
 */
export function createServiceRoleClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
