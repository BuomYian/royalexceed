/**
 * One-off: replaces the live news section with the rewritten articles in
 * prisma/content/news-articles.ts.
 *
 *   npx tsx --env-file=.env .replace-news.ts          # dry run — writes nothing
 *   npx tsx --env-file=.env .replace-news.ts --apply  # actually does it
 *
 * Deletes every existing Article and recreates the four new ones as PUBLISHED,
 * authored by the current SUPER_ADMIN. Nothing in the schema references
 * Article, so the delete has no fallout beyond the articles themselves.
 *
 * Wrapped in main() rather than using top-level await: the package is CJS, so
 * tsx cannot compile top-level await here.
 *
 * Delete this file once it has been run.
 */
import { PrismaClient } from "@prisma/client";
import { newsArticles } from "./prisma/content/news-articles";

const prisma = new PrismaClient();

async function main() {
  const apply = process.argv.includes("--apply");

  const author =
    (await prisma.user.findFirst({ where: { role: "SUPER_ADMIN", isActive: true } })) ??
    (await prisma.user.findFirst({ where: { isActive: true } }));

  if (!author) {
    console.error("ABORT: no active user to author the articles.");
    process.exitCode = 1;
    return;
  }

  const existing = await prisma.article.findMany({
    select: { slug: true, status: true },
    orderBy: { publishedAt: "asc" },
  });

  console.log(`author: ${author.fullName} <${author.email}>\n`);
  console.log(`will DELETE ${existing.length} existing article(s):`);
  for (const a of existing) console.log(`  - [${a.status}] ${a.slug}`);
  console.log(`\nwill CREATE ${newsArticles.length} article(s):`);
  for (const a of newsArticles) console.log(`  + [${a.status}] ${a.slug} — ${a.title}`);

  if (!apply) {
    console.log("\nDry run. Re-run with --apply to make these changes.");
    return;
  }

  // One transaction: the site is never left with an empty news section.
  await prisma.$transaction([
    prisma.article.deleteMany({}),
    ...newsArticles.map((a) => prisma.article.create({ data: { ...a, authorId: author.id } })),
  ]);

  const after = await prisma.article.findMany({
    select: { slug: true, status: true },
    orderBy: { publishedAt: "asc" },
  });
  console.log(`\napplied. ${after.length} article(s) now live:`);
  for (const a of after) console.log(`  - [${a.status}] ${a.slug}`);
  console.log(
    "\nNote: the deployed /news pages are cached, so save settings in the live" +
      "\nadmin (or purge the Vercel Data Cache) for these to show up.",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
