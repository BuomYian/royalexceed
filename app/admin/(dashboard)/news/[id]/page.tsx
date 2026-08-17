import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/auth";
import { ArticleForm } from "@/components/admin/article-form";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Edit article" };

export default async function EditArticlePage({ params }: PageProps<"/admin/news/[id]">) {
  await requirePageAccess("news", "read");
  const { id } = await params;

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Edit article</h1>
        {article.status === "PUBLISHED" && (
          <Button
            variant="outline"
            size="sm"
            render={
              <Link href={`/news/${article.slug}`} target="_blank">
                <ExternalLink className="h-4 w-4" /> View live
              </Link>
            }
          />
        )}
      </div>
      <ArticleForm
        defaultValues={{
          ...article,
          excerpt: article.excerpt ?? undefined,
          coverImageUrl: article.coverImageUrl,
          metaTitle: article.metaTitle ?? undefined,
          metaDescription: article.metaDescription ?? undefined,
          publishedAt: article.publishedAt?.toISOString().slice(0, 16),
        }}
      />
    </div>
  );
}
