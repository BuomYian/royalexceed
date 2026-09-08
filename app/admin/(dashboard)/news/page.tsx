import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { NewsList } from "@/components/admin/news-list";

export const metadata = { title: "News & Offers" };

export default async function AdminNewsPage() {
  const user = await requirePageAccess("news", "read");
  const canCreate = can(user.role, "news", "create");

  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { fullName: true } } },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">News & Offers</h1>
          <p className="text-sm text-muted-foreground">{articles.length} article(s)</p>
        </div>
        {canCreate && (
          <Button render={<Link href="/admin/news/new"><Plus className="h-4 w-4" /> New article</Link>} />
        )}
      </div>

      <NewsList
        canDelete={can(user.role, "news", "delete")}
        articles={articles.map((a) => ({
          id: a.id,
          title: a.title,
          status: a.status,
          authorName: a.author.fullName,
        }))}
      />
    </div>
  );
}
