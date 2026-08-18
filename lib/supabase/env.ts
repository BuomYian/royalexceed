/**
 * The public/anon-role Supabase key, under whichever name it's provided as.
 *
 * `npx supabase status` (local stack) still prints this as the legacy
 * `anon key`, so local dev's .env sets `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Newer
 * hosted projects' dashboards (Project Settings → API Keys) instead issue a
 * `sb_publishable_...` key under "Publishable key", which is functionally
 * the same role — so we accept either env var name rather than forcing a
 * rename every time a project is on a different Supabase key generation.
 */
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
