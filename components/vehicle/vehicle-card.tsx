import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { PriceDisplay } from "@/components/vehicle/price-display";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function VehicleCard({
  model,
}: {
  model: {
    slug: string;
    displayName: string;
    tagline: string | null;
    bodyType: string;
    seats: number;
    startingPriceUsd: number | null;
    priceOnRequest: boolean;
    thumbnailUrl: string | null;
  };
}) {
  const t = useTranslations("common");

  return (
    <Link href={`/models/${model.slug}`} className="group block">
      <Card className="overflow-hidden py-0 transition-shadow hover:shadow-lg">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {model.thumbnailUrl && (
            <Image
              src={model.thumbnailUrl}
              alt={model.displayName}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          )}
          <Badge className="absolute start-3 top-3 bg-background/90 text-foreground backdrop-blur">
            {model.bodyType}
          </Badge>
        </div>
        <CardContent className="space-y-2 pb-5">
          <div>
            <h3 className="font-heading text-lg font-bold">{model.displayName}</h3>
            {model.tagline && <p className="text-sm text-muted-foreground">{model.tagline}</p>}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{t("startingFrom")}</p>
              <PriceDisplay usdAmount={model.startingPriceUsd} priceOnRequest={model.priceOnRequest} size="sm" />
            </div>
            <p className="text-sm text-muted-foreground">{model.seats} {t("seats")}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
