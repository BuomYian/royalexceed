import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Wrench, Droplet, CircleGauge, Snowflake, ShieldAlert, Hammer } from "lucide-react";
import { ServiceBookingForm } from "@/components/forms/service-booking-form";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("services");
  return { title: t("title"), description: t("subtitle"), alternates: { canonical: "/services" } };
}

const SERVICE_MENU = [
  { icon: Wrench, title: "Scheduled Maintenance", body: "Factory-specified service intervals for every Soueast model." },
  { icon: Droplet, title: "Oil & Filter Change", body: "Genuine oil and filters, done right the first time." },
  { icon: CircleGauge, title: "Brakes & Tyres", body: "Brake inspection, pad replacement, and tyre rotation/alignment." },
  { icon: Snowflake, title: "AC Service", body: "Full air-conditioning diagnostics and regassing." },
  { icon: ShieldAlert, title: "Diagnostics", body: "Warning light and electronic system diagnostics." },
  { icon: Hammer, title: "Bodywork & Accident Repair", body: "Genuine panels and factory-approved repair processes." },
];

const INTERVALS = [
  { interval: "10,000 km / 6 months", items: "Oil & filter change, multi-point inspection" },
  { interval: "20,000 km / 12 months", items: "Air filter, cabin filter, brake inspection" },
  { interval: "40,000 km / 24 months", items: "Spark plugs, brake fluid, coolant check" },
  { interval: "60,000 km / 36 months", items: "Timing components inspection, transmission fluid" },
];

export default async function ServicesPage() {
  const t = await getTranslations("services");

  return (
    <div className="container-brand py-10 sm:py-14">
      <Breadcrumbs items={[{ name: "Home", url: "/" }, { name: t("title"), url: "/services" }]} />
      <div className="mx-auto mb-10 mt-4 max-w-2xl text-center">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <section className="mb-16">
        <h2 className="mb-6 font-heading text-2xl font-bold">{t("menuTitle")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_MENU.map((item) => (
            <Card key={item.title}>
              <CardContent className="pt-6">
                <item.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 font-heading font-bold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-6 font-heading text-2xl font-bold">{t("intervalsTitle")}</h2>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <tbody>
              {INTERVALS.map((row, i) => (
                <tr key={row.interval} className={i % 2 === 1 ? "bg-muted/30" : ""}>
                  <td className="w-56 px-4 py-3 font-medium">{row.interval}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.items}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-center font-heading text-2xl font-bold">Book a service</h2>
        <ServiceBookingForm />
      </section>
    </div>
  );
}
