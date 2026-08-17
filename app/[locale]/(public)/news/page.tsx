import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getAllArticles } from "@/lib/data/articles";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("news");
  return { title: t("title"), description: t("subtitle"), alternates: { canonical: "/news" } };
}

export default async function NewsPage() {
  const t = await getTranslations("news");
  const articles = await getAllArticles();

  return (
    <div className="container-brand py-10 sm:py-14">
      <Breadcrumbs items={[{ name: "Home", url: "/" }, { name: t("title"), url: "/news" }]} />
      <div className="mb-10 mt-4">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <Link key={a.slug} href={`/news/${a.slug}`} className="group block">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
              {a.coverImageUrl && (
                <Image src={a.coverImageUrl} alt={a.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {t("by")} {a.author.fullName}
              {a.publishedAt && ` · ${new Date(a.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
            </p>
            <h2 className="mt-1 font-heading text-lg font-bold group-hover:underline">{a.title}</h2>
            {a.excerpt && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.excerpt}</p>}
          </Link>
        ))}
        {articles.length === 0 && <p className="text-muted-foreground">No articles published yet.</p>}
      </div>
    </div>
  );
}
