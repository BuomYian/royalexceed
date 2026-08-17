import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/vehicle/price-display";
import { VinMasked } from "@/components/vehicle/vin-masked";

const STATUS_VARIANT: Record<string, string> = {
  AVAILABLE: "bg-success/15 text-success border-success/30",
  RESERVED: "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400",
  SOLD: "bg-muted text-muted-foreground",
  IN_TRANSIT: "bg-warning/15 text-warning border-warning/30",
};

export function InventoryCard({
  unit,
  usdToSsp,
}: {
  unit: {
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
  usdToSsp: number;
}) {
  const t = useTranslations("inventory");
  const image = unit.images[0];

  return (
    <Link href={`/inventory/${unit.stockNumber}`} className="group block">
      <Card className="overflow-hidden py-0 transition-shadow hover:shadow-lg">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {image && (
            <Image src={image.url} alt={image.alt ?? unit.model.displayName} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
          )}
          <Badge variant="outline" className={`absolute start-3 top-3 ${STATUS_VARIANT[unit.status]}`}>
            {t(`status.${unit.status}` as "status.AVAILABLE")}
          </Badge>
          {unit.condition === "CERTIFIED_PRE_OWNED" && (
            <Badge className="absolute end-3 top-3 bg-background/90 text-foreground">{t("certifiedPreOwned")}</Badge>
          )}
        </div>
        <CardContent className="space-y-2 pb-5">
          <h3 className="font-heading text-lg font-bold">{unit.model.displayName}</h3>
          <p className="text-sm text-muted-foreground">
            {unit.year} · {unit.colorName} · {unit.mileageKm.toLocaleString()} km
          </p>
          <p className="text-xs text-muted-foreground">
            {t("stockNumber")}: {unit.stockNumber} · {t("vin")}: <VinMasked vin={unit.vin} />
          </p>
          <PriceDisplay usdAmount={unit.priceUsd} usdToSsp={usdToSsp} size="sm" />
        </CardContent>
      </Card>
    </Link>
  );
}
