import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getModelsForCompare, listModelOptions } from "@/lib/data/models";
import { CompareTable } from "@/components/vehicle/compare-table";
import { CompareModelPicker } from "@/components/vehicle/compare-model-picker";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("compare");
  return { title: t("title"), description: t("subtitle"), alternates: { canonical: "/compare" } };
}

export default async function ComparePage({ searchParams }: PageProps<"/[locale]/compare">) {
  const t = await getTranslations("compare");
  const sp = await searchParams;
  const slugsParam = typeof sp.slugs === "string" ? sp.slugs : "";
  const slugs = slugsParam.split(",").filter(Boolean).slice(0, 3);

  const [allModels, models] = await Promise.all([
    listModelOptions(),
    slugs.length ? getModelsForCompare(slugs) : Promise.resolve([]),
  ]);

  return (
    <div className="container-brand py-10 sm:py-14">
      <Breadcrumbs items={[{ name: "Home", url: "/" }, { name: t("title"), url: "/compare" }]} />
      <div className="mb-8 mt-4">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <CompareModelPicker allModels={allModels} selectedSlugs={slugs} />

      {models.length > 0 ? (
        <div className="mt-8">
          <CompareTable
            models={models
              .sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug))
              .map((m) => ({
                ...m,
                startingPriceUsd: m.startingPriceUsd ? Number(m.startingPriceUsd) : null,
              }))}
          />
        </div>
      ) : (
        <p className="mt-16 text-center text-muted-foreground">{t("empty")}</p>
      )}
    </div>
  );
}
