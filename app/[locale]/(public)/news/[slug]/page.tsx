import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import { getTranslations } from "next-intl/server";
import { getArticleBySlug } from "@/lib/data/articles";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { StructuredData } from "@/components/shared/structured-data";
import { Badge } from "@/components/ui/badge";
import { newsArticleJsonLd } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/news/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.excerpt ?? undefined,
    alternates: { canonical: `/news/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      images: article.coverImageUrl ? [article.coverImageUrl] : undefined,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
    },
  };
}

export default async function NewsArticlePage({ params }: PageProps<"/[locale]/news/[slug]">) {
  const { slug } = await params;
  const t = await getTranslations("news");
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  // Sanitized again on render (defense in depth alongside the sanitize-on-save in lib/actions/news.ts, spec §10).
  const safeBody = DOMPurify.sanitize(article.body);

  return (
    <article className="container-brand py-10 sm:py-14">
      <StructuredData
        data={newsArticleJsonLd({
          title: article.title,
          excerpt: article.excerpt,
          coverImageUrl: article.coverImageUrl,
          slug: article.slug,
          publishedAt: article.publishedAt,
          updatedAt: article.updatedAt,
          authorName: article.author.fullName,
        })}
      />
      <Breadcrumbs
        items={[
          { name: "Home", url: "/" },
          { name: t("title"), url: "/news" },
          { name: article.title, url: `/news/${article.slug}` },
        ]}
      />

      <div className="mx-auto mt-6 max-w-3xl">
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
        </div>
        <h1 className="mt-3 font-heading text-3xl font-extrabold sm:text-4xl">{article.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("by")} {article.author.fullName}
          {article.publishedAt && ` · ${t("publishedOn")} ${new Date(article.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
        </p>

        {article.coverImageUrl && (
          <div className="relative mt-6 aspect-video overflow-hidden rounded-xl bg-muted">
            <Image src={article.coverImageUrl} alt={article.title} fill sizes="(max-width: 1024px) 100vw, 800px" className="object-cover" priority />
          </div>
        )}

        <div
          className="prose prose-neutral dark:prose-invert mt-8 max-w-none"
          // eslint-disable-next-line react/no-danger -- sanitized via DOMPurify above
          dangerouslySetInnerHTML={{ __html: safeBody }}
        />
      </div>
    </article>
  );
}
