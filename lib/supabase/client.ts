"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Browser client for the admin login form only — anon key, RLS-respecting. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
