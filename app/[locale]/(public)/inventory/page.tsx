import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getInventory } from "@/lib/data/inventory";
import { inventoryFilterSchema } from "@/lib/validations/inventory";
import { InventoryCard } from "@/components/vehicle/inventory-card";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { InventoryStatusFilter } from "@/components/vehicle/inventory-status-filter";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("inventory");
  return { title: t("title"), description: t("subtitle"), alternates: { canonical: "/inventory" } };
}

export default async function InventoryPage({ searchParams }: PageProps<"/[locale]/inventory">) {
  const t = await getTranslations("inventory");
  const tCommon = await getTranslations("common");
  const sp = await searchParams;
  const filters = inventoryFilterSchema.parse({ status: sp.status });

  const units = await getInventory(filters);

  return (
    <div className="container-brand py-10 sm:py-14">
      <Breadcrumbs items={[{ name: "Home", url: "/" }, { name: t("title"), url: "/inventory" }]} />
      <div className="mb-8 mt-4">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <InventoryStatusFilter />

      {units.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">{tCommon("noResults")}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {units.map((unit) => (
            <InventoryCard
              key={unit.stockNumber}
              unit={{ ...unit, priceUsd: unit.priceUsd ? Number(unit.priceUsd) : null }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
