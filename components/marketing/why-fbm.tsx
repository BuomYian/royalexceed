import { useTranslations } from "next-intl";
import { PackageCheck, ShieldCheck, Wrench, MapPin } from "lucide-react";

export function WhyFbm() {
  const t = useTranslations("home");

  const items = [
    { icon: PackageCheck, title: t("whyGenuineParts"), body: t("whyGenuinePartsBody") },
    { icon: ShieldCheck, title: t("whyWarranty"), body: t("whyWarrantyBody") },
    { icon: Wrench, title: t("whyTechnicians"), body: t("whyTechniciansBody") },
    { icon: MapPin, title: t("whyService"), body: t("whyServiceBody") },
  ];

  return (
    <section className="container-brand py-16 sm:py-24">
      <div className="mb-10 max-w-xl">
        <h2 className="font-heading text-3xl font-bold sm:text-4xl">{t("whyTitle")}</h2>
        <p className="mt-2 text-muted-foreground">{t("whySubtitle")}</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="rounded-xl border border-border p-6">
            <item.icon className="h-8 w-8 text-primary" />
            <h3 className="mt-4 font-heading font-bold">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
