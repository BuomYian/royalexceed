import { useTranslations } from "next-intl";
import { Star } from "lucide-react";

type Testimonial = { id: string; authorName: string; authorTitle: string | null; company: string | null; quote: string; rating: number };

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const t = useTranslations("home");
  if (testimonials.length === 0) return null;

  return (
    <section className="container-brand py-16 sm:py-24">
      <h2 className="mb-10 font-heading text-3xl font-bold sm:text-4xl">{t("testimonialsTitle")}</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {testimonials.map((t2) => (
          <figure key={t2.id} className="rounded-xl border border-border bg-card p-6">
            <div className="mb-3 flex gap-0.5">
              {Array.from({ length: t2.rating }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />
              ))}
            </div>
            <blockquote className="text-sm">&ldquo;{t2.quote}&rdquo;</blockquote>
            <figcaption className="mt-4 text-sm">
              <span className="font-medium">{t2.authorName}</span>
              {t2.company && <span className="text-muted-foreground"> · {t2.company}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
