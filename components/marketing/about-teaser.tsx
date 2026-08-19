import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

/** Short company intro + official-partner callout, directly below the Hero. */
export function AboutTeaser() {
  const t = useTranslations("home");

  return (
    <section className="border-b border-border/60">
      <div className="container-brand grid gap-8 py-14 sm:py-16 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">{t("aboutTeaserTitle")}</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">{t("aboutTeaserBody")}</p>
          <Button className="mt-6" variant="outline" render={<Link href="/about">{t("aboutTeaserCta")} <ArrowRight className="h-4 w-4" /></Link>} />
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-5">
          {/* Source logo has a solid white background — a plain white tile
              behind it (instead of dropping it straight on the dark card)
              keeps it legible instead of showing as a raw white square. */}
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-white p-1.5">
            <Image src="/fbm_international_co_logo.jpg" alt="FBM International Co." width={48} height={48} className="h-full w-full object-contain" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("aboutTeaserPartnerLabel")}
            </p>
            <p className="mt-1 text-sm text-foreground/90">{t("aboutTeaserPartnerBody")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
