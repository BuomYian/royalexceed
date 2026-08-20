import { useTranslations } from "next-intl";
import { InventoryCard } from "@/components/vehicle/inventory-card";
import { Reveal } from "@/components/shared/reveal";

type Unit = {
  stockNumber: string;
  vin: string | null;
  year: number;
  colorName: string;
  mileageKm: number;
  status: string;
  condition: string;
  priceUsd: number | null;
  model: { slug: string; displayName: string };
  images: { url: string; alt: string | null }[];
};

export function FeaturedInventoryStrip({ units }: { units: Unit[] }) {
  const t = useTranslations("home");
  if (units.length === 0) return null;

  return (
    <section className="bg-muted/30 py-16 sm:py-24">
      <div className="container-brand">
        <h2 className="mb-10 font-heading text-3xl font-bold sm:text-4xl">{t("arrivingTitle")}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {units.map((unit, i) => (
            <Reveal key={unit.stockNumber} delay={(i % 4) * 100}>
              <InventoryCard unit={unit} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
