import { useTranslations } from "next-intl";
import { Car, Wrench, Package, Building2 } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function ServicesOverview() {
  const t = useTranslations("home");
  const tNav = useTranslations("nav");

  const items = [
    { icon: Car, title: tNav("models"), href: "/models" },
    { icon: Wrench, title: tNav("services"), href: "/services" },
    { icon: Package, title: tNav("parts"), href: "/parts" },
    { icon: Building2, title: tNav("finance"), href: "/finance" },
  ];

  return (
    <section className="bg-muted/30 py-16 sm:py-24">
      <div className="container-brand">
        <h2 className="mb-10 font-heading text-3xl font-bold sm:text-4xl">{t("servicesTitle")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary"
            >
              <item.icon className="h-7 w-7 text-primary" />
              <span className="font-heading font-bold group-hover:underline">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
