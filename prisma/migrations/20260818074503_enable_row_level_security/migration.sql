-- Defense in depth (spec §10): enable Row Level Security on every
-- app-managed table with NO policies attached.
--
-- This app never queries Postgres through Supabase's PostgREST/data API —
-- Prisma connects directly to Postgres (see lib/prisma.ts) using the
-- `postgres` role, which bypasses RLS as the table owner. RLS here exists
-- purely as a safety net: if the Supabase REST endpoint (`/rest/v1/...`) is
-- ever reachable with the anon/authenticated key, "enable RLS with zero
-- policies" makes every table deny-by-default to those roles, so accidental
-- exposure of the Data API can't leak or mutate rows.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Model" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Variant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ModelColor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ModelImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SpecGroup" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SpecItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FeatureBlock" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InventoryUnit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InventoryImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeadNote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TestDriveBooking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ServiceBooking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Article" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Testimonial" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SiteSetting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Sequence" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RateLimitHit" ENABLE ROW LEVEL SECURITY;
