import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card, CardContent } from "@/components/ui/card";

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

      <div className="space-y-2">
        {articles.map((a) => (
          <Link key={a.id} href={`/admin/news/${a.id}`}>
            <Card className="transition-colors hover:bg-accent/50">
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-sm text-muted-foreground">By {a.author.fullName}</p>
                </div>
                <StatusBadge status={a.status} />
              </CardContent>
            </Card>
          </Link>
        ))}
        {articles.length === 0 && <p className="text-sm text-muted-foreground">No articles yet.</p>}
      </div>
    </div>
  );
}
