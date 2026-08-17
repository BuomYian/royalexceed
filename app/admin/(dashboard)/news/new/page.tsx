import { requirePageAccess } from "@/lib/auth";
import { ArticleForm } from "@/components/admin/article-form";

export const metadata = { title: "New article" };

export default async function NewArticlePage() {
  await requirePageAccess("news", "create");
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">New article</h1>
      <ArticleForm />
    </div>
  );
}
