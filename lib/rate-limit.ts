import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_HITS = 5;

/**
 * Prisma-backed rate limit (IP + phone), documented default in place of a
 * Redis dependency the spec doesn't assume (spec §9 "rate-limited (IP + phone
 * based)"). Recommend Upstash Redis for production scale in the README.
 */
export async function checkRateLimit(routeKey: string, phone?: string) {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    "unknown";

  const keys = [`ip:${ip}:${routeKey}`];
  if (phone) keys.push(`phone:${phone.replace(/\D/g, "")}:${routeKey}`);

  const since = new Date(Date.now() - WINDOW_MS);

  for (const key of keys) {
    const count = await prisma.rateLimitHit.count({
      where: { key, createdAt: { gte: since } },
    });
    if (count >= MAX_HITS) {
      return { allowed: false as const };
    }
  }

  await prisma.rateLimitHit.createMany({
    data: keys.map((key) => ({ key })),
  });

  return { allowed: true as const };
}
