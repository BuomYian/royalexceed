import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { getInventoryByStockNumber } from "@/lib/data/inventory";
import { getSiteSettings } from "@/lib/settings";
import { Gallery } from "@/components/vehicle/gallery";
import { PriceDisplay } from "@/components/vehicle/price-display";
import { VinMasked } from "@/components/vehicle/vin-masked";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { WhatsAppEnquireButton } from "@/components/shared/whatsapp-enquire-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({ params }: PageProps<"/[locale]/inventory/[stockNumber]">): Promise<Metadata> {
  const { stockNumber } = await params;
  const unit = await getInventoryByStockNumber(stockNumber);
  if (!unit) return {};
  return {
    title: `${unit.model.displayName} — ${unit.year} — Stock ${unit.stockNumber}`,
    alternates: { canonical: `/inventory/${unit.stockNumber}` },
  };
}

export default async function InventoryDetailPage({ params }: PageProps<"/[locale]/inventory/[stockNumber]">) {
  const { stockNumber } = await params;
  const t = await getTranslations("inventory");
  const tCommon = await getTranslations("common");

  const unit = await getInventoryByStockNumber(stockNumber);
  if (!unit) notFound();

  const settings = await getSiteSettings();

  return (
    <div className="container-brand py-8 sm:py-10">
      <Breadcrumbs
        items={[
          { name: "Home", url: "/" },
          { name: t("title"), url: "/inventory" },
          { name: `${unit.model.displayName} — ${unit.stockNumber}`, url: `/inventory/${unit.stockNumber}` },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {unit.images.length > 0 ? (
            <Gallery images={unit.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt ?? "", category: "exterior" }))} heroImageUrl={null} />
          ) : (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
              {unit.model.heroImageUrl && <Image src={unit.model.heroImageUrl} alt={unit.model.displayName} fill className="object-cover" />}
            </div>
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Badge>{t(`status.${unit.status}` as "status.AVAILABLE")}</Badge>
            {unit.condition === "CERTIFIED_PRE_OWNED" && <Badge variant="outline">{t("certifiedPreOwned")}</Badge>}
          </div>
          <div>
            <h1 className="font-heading text-3xl font-extrabold sm:text-4xl">{unit.model.displayName}</h1>
            <p className="mt-1 text-lg text-muted-foreground">
              {unit.year} · {unit.colorName} {unit.variant && `· ${unit.variant.name}`}
            </p>
          </div>

          <PriceDisplay usdAmount={unit.priceUsd} usdToSsp={settings.usdToSsp} size="lg" />

          <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border p-4 text-sm">
            <div>
              <dt className="text-muted-foreground">{t("stockNumber")}</dt>
              <dd className="font-medium">{unit.stockNumber}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("vin")}</dt>
              <dd className="font-medium"><VinMasked vin={unit.vin} /></dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("mileage")}</dt>
              <dd className="font-medium">{unit.mileageKm.toLocaleString()} km</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Condition</dt>
              <dd className="font-medium">{unit.condition.replace(/_/g, " ")}</dd>
            </div>
          </dl>

          <div className="flex flex-col gap-2">
            <Button size="lg" disabled={unit.status === "SOLD"} render={<Link href="/test-drive">{unit.status === "RESERVED" ? t("enquire") : t("reserveNow")}</Link>} />
            <WhatsAppEnquireButton modelDisplayName={`${unit.model.displayName} (Stock #${unit.stockNumber})`} whatsappNumber={settings.whatsappNumber} />
          </div>

          <Button variant="link" className="px-0" render={<Link href={`/models/${unit.model.slug}`}>{tCommon("viewDetails")} — {unit.model.displayName}</Link>} />
        </div>
      </div>
    </div>
  );
}
