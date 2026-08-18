"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_PUBLISHABLE_KEY } from "@/lib/supabase/env";

/** Browser client for the admin login form only — anon key, RLS-respecting. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_PUBLISHABLE_KEY,
  );
}
