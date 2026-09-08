import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const OLD = "exceed-limited-now-open-in-juba-town";
const NEW = "211motors-now-open-in-juba-town";

const clash = await prisma.article.findUnique({ where: { slug: NEW } });
if (clash) {
  console.log("ABORT: an article already uses the new slug:", clash.title);
} else {
  const before = await prisma.article.findUnique({
    where: { slug: OLD },
    select: { id: true, slug: true, title: true, status: true },
  });
  if (!before) {
    console.log("nothing to do — no article at the old slug");
  } else {
    console.log("before:", JSON.stringify(before));
    const after = await prisma.article.update({
      where: { slug: OLD },
      data: { slug: NEW },
      select: { id: true, slug: true, title: true, status: true },
    });
    console.log("after: ", JSON.stringify(after));
  }
}
await prisma.$disconnect();
