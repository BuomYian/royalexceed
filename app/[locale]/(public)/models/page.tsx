import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSiteSettings } from "@/lib/settings";
import { getPublishedModels } from "@/lib/data/models";
import { modelFilterSchema } from "@/lib/validations/model";
import { VehicleCard } from "@/components/vehicle/vehicle-card";
import { ModelsFilterBar } from "@/components/vehicle/models-filter-bar";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("models");
  return { title: t("title"), description: t("subtitle"), alternates: { canonical: "/models" } };
}

export default async function ModelsPage({ searchParams }: PageProps<"/[locale]/models">) {
  const t = await getTranslations("models");
  const tCommon = await getTranslations("common");
  const sp = await searchParams;
  const filters = modelFilterSchema.parse({
    bodyType: sp.bodyType,
    fuelType: sp.fuelType,
    minPrice: sp.minPrice,
    maxPrice: sp.maxPrice,
    seats: sp.seats,
    transmission: sp.transmission,
    sort: sp.sort,
  });

  const [settings, models] = await Promise.all([getSiteSettings(), getPublishedModels(filters)]);

  return (
    <div className="container-brand py-10 sm:py-14">
      <Breadcrumbs items={[{ name: "Home", url: "/" }, { name: t("title"), url: "/models" }]} />
      <div className="mb-8 mt-4">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <ModelsFilterBar />

      {models.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">{tCommon("noResults")}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((m) => (
            <VehicleCard
              key={m.slug}
              model={{ ...m, startingPriceUsd: m.startingPriceUsd ? Number(m.startingPriceUsd) : null }}
              usdToSsp={settings.usdToSsp}
            />
          ))}
        </div>
      )}
    </div>
  );
}
