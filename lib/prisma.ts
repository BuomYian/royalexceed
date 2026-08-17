import { PrismaClient } from "@prisma/client";

// Prisma singleton pattern — avoids exhausting the Supabase pooler's connection
// limit from hot-reloading in dev (spec §9).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
