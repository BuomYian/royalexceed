import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";
import { ContactForm } from "@/components/forms/contact-form";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact");
  return { title: t("title"), description: t("subtitle"), alternates: { canonical: "/contact" } };
}

export default async function ContactPage() {
  const t = await getTranslations("contact");
  const settings = await getSiteSettings();
  const mapSrc = `https://www.google.com/maps?q=${settings.address.lat},${settings.address.lng}&z=15&output=embed`;

  const departments = settings.departments
    ? [
        { key: "sales", label: t("salesDept"), info: settings.departments.sales },
        { key: "service", label: t("serviceDept"), info: settings.departments.service },
        { key: "parts", label: t("partsDept"), info: settings.departments.parts },
        { key: "fleet", label: t("fleetDept"), info: settings.departments.fleet },
      ]
    : [];

  return (
    <div className="container-brand py-10 sm:py-14">
      <Breadcrumbs items={[{ name: "Home", url: "/" }, { name: t("title"), url: "/contact" }]} />
      <div className="mb-10 mt-4 max-w-2xl">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          {departments.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {departments.map((d) => (
                <Card key={d.key}>
                  <CardContent className="pt-6">
                    <p className="font-heading font-bold">{d.label}</p>
                    <a href={`tel:${d.info.phone.replace(/\s+/g, "")}`} className="mt-2 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                      <Phone className="h-3.5 w-3.5" /> {d.info.phone}
                    </a>
                    <a href={`mailto:${d.info.email}`} className="mt-1 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                      <Mail className="h-3.5 w-3.5" /> {d.info.email}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="space-y-3 rounded-lg border border-border p-5 text-sm">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {settings.address.line}, {settings.address.city}, {settings.address.country}
            </p>
            <p className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Mon–Fri {settings.hours.monFri} · Sat {settings.hours.saturday} · Sun {settings.hours.sunday}
            </p>
          </div>

          <iframe
            title="Royal Exceed Co. Ltd location"
            src={mapSrc}
            className="h-64 w-full rounded-lg border border-border"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
