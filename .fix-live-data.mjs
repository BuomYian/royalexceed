/**
 * One-off: brings the live database in line with the 211Motors rename.
 *  1. Article slug  "exceed-limited-now-open-in-juba-town" -> "211motors-now-open-in-juba-town"
 *     (next.config.ts has 308s covering the old URL)
 *  2. InventoryUnit stock numbers  EXL-* -> 211M-*
 * Both are idempotent and abort rather than overwrite if a target already exists.
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// --- 1. article slug ---------------------------------------------------------
const OLD_SLUG = "exceed-limited-now-open-in-juba-town";
const NEW_SLUG = "211motors-now-open-in-juba-town";

if (await prisma.article.findUnique({ where: { slug: NEW_SLUG } })) {
  console.log("slug: already renamed, skipping");
} else if (!(await prisma.article.findUnique({ where: { slug: OLD_SLUG } }))) {
  console.log("slug: no article at the old slug, skipping");
} else {
  const a = await prisma.article.update({
    where: { slug: OLD_SLUG },
    data: { slug: NEW_SLUG },
    select: { slug: true, title: true, status: true },
  });
  console.log("slug:", OLD_SLUG, "->", a.slug, `(${a.status}: ${a.title})`);
}

// --- 2. stock numbers --------------------------------------------------------
const units = await prisma.inventoryUnit.findMany({
  where: { stockNumber: { startsWith: "EXL-" } },
  select: { id: true, stockNumber: true },
  orderBy: { stockNumber: "asc" },
});
console.log(`\nstock numbers: ${units.length} unit(s) on the EXL- prefix`);

// stockNumber is @unique, so check the whole target set before writing anything.
const targets = units.map((u) => ({ ...u, next: u.stockNumber.replace(/^EXL-/, "211M-") }));
const taken = await prisma.inventoryUnit.findMany({
  where: { stockNumber: { in: targets.map((t) => t.next) } },
  select: { stockNumber: true },
});
if (taken.length) {
  console.log("ABORT: these target stock numbers are already in use:", taken.map((t) => t.stockNumber));
} else if (targets.length) {
  await prisma.$transaction(
    targets.map((t) =>
      prisma.inventoryUnit.update({ where: { id: t.id }, data: { stockNumber: t.next } }),
    ),
  );
  for (const t of targets) console.log("  ", t.stockNumber, "->", t.next);
}

const remaining = await prisma.inventoryUnit.count({ where: { stockNumber: { startsWith: "EXL-" } } });
console.log("\nremaining EXL-* units:", remaining);
await prisma.$disconnect();
