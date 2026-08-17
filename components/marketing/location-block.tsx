import { useTranslations } from "next-intl";
import { MapPin, Clock, Navigation } from "lucide-react";
import type { ResolvedSiteSettings } from "@/lib/settings";
import { Button } from "@/components/ui/button";

export function LocationBlock({ settings }: { settings: ResolvedSiteSettings }) {
  const t = useTranslations("home");
  const mapSrc = `https://www.google.com/maps?q=${settings.address.lat},${settings.address.lng}&z=15&output=embed`;

  return (
    <section className="container-brand py-16 sm:py-24">
      <h2 className="mb-10 font-heading text-3xl font-bold sm:text-4xl">{t("locationTitle")}</h2>
      <div className="grid gap-6 overflow-hidden rounded-xl border border-border lg:grid-cols-2">
        <iframe
          title="FBM International showroom location"
          src={mapSrc}
          className="h-72 w-full border-0 lg:h-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="space-y-4 p-6">
          <div className="flex gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium">{settings.address.line}</p>
              <p className="text-sm text-muted-foreground">{settings.address.city}, {settings.address.country}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="text-sm">
              <p>Mon–Fri: {settings.hours.monFri}</p>
              <p>Saturday: {settings.hours.saturday}</p>
              <p>Sunday: {settings.hours.sunday}</p>
            </div>
          </div>
          <Button
            variant="outline"
            render={
              <a href={settings.address.mapUrl} target="_blank" rel="noopener noreferrer">
                <Navigation className="h-4 w-4" /> Get directions
              </a>
            }
          />
        </div>
      </div>
    </section>
  );
}
