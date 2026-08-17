import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { VehicleCard } from "@/components/vehicle/vehicle-card";
import { Button } from "@/components/ui/button";

type ModelSummary = {
  slug: string;
  displayName: string;
  tagline: string | null;
  bodyType: string;
  seats: number;
  startingPriceUsd: number | null;
  priceOnRequest: boolean;
  thumbnailUrl: string | null;
};

export function ModelRangeGrid({ models, usdToSsp }: { models: ModelSummary[]; usdToSsp: number }) {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");

  return (
    <section className="container-brand py-16 sm:py-24">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">{t("rangeTitle")}</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">{t("rangeSubtitle")}</p>
        </div>
        <Button variant="outline" render={<Link href="/models">{tCommon("viewDetails")}</Link>} />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {models.map((model) => (
          <VehicleCard key={model.slug} model={model} usdToSsp={usdToSsp} />
        ))}
      </div>
    </section>
  );
}
