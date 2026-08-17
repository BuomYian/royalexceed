import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function LeadCaptureBand() {
  const t = useTranslations("home");

  return (
    <section className="bg-primary py-16 text-primary-foreground sm:py-20">
      <div className="container-brand flex flex-col items-center gap-6 text-center">
        <h2 className="font-heading text-3xl font-bold sm:text-4xl">{t("leadBandTitle")}</h2>
        <p className="max-w-xl text-primary-foreground/85">{t("leadBandSubtitle")}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" variant="secondary" render={<Link href="/test-drive">{t("heroCta1")}</Link>} />
          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            render={<Link href="/contact">{t("heroCta2")}</Link>}
          />
        </div>
      </div>
    </section>
  );
}
