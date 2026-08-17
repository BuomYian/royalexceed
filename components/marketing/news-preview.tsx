import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

type Article = { slug: string; title: string; excerpt: string | null; coverImageUrl: string | null; publishedAt: Date | null };

export function NewsPreview({ articles }: { articles: Article[] }) {
  const t = useTranslations("home");
  const tNews = useTranslations("news");
  if (articles.length === 0) return null;

  return (
    <section className="bg-muted/30 py-16 sm:py-24">
      <div className="container-brand">
        <h2 className="mb-10 font-heading text-3xl font-bold sm:text-4xl">{t("newsTitle")}</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {articles.map((a) => (
            <Link key={a.slug} href={`/news/${a.slug}`} className="group block">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                {a.coverImageUrl && (
                  <Image src={a.coverImageUrl} alt={a.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                )}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {a.publishedAt && new Date(a.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
              <h3 className="mt-1 font-heading font-bold group-hover:underline">{a.title}</h3>
              {a.excerpt && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.excerpt}</p>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
