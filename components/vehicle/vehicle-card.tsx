import { useTranslations } from "next-intl";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
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
      <Card className="overflow-hidden py-0 transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-xl group-hover:shadow-primary/5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
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
            <h3 className="flex items-center gap-1.5 font-heading text-lg font-bold">
              {model.displayName}
              {/* Slides in on hover as a "this is a link" affordance — the card
                  otherwise gives no hint that the whole thing is clickable. */}
              <ArrowRight
                className="h-4 w-4 -translate-x-1 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 rtl:rotate-180 rtl:translate-x-1 rtl:group-hover:translate-x-0 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </h3>
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
