import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { PartsEnquiryForm } from "@/components/forms/parts-enquiry-form";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("parts");
  return { title: t("title"), description: t("subtitle"), alternates: { canonical: "/parts" } };
}

const REASONS = [
  { icon: PackageCheck, title: "Genuine, Always", body: "Every part is factory-sourced from Soueast — never a grey-market substitute." },
  { icon: ShieldCheck, title: "Warranty Protected", body: "Genuine parts keep your factory warranty fully intact." },
  { icon: Truck, title: "Stocked in Juba", body: "Common parts are held locally to minimize downtime." },
];

export default async function PartsPage() {
  const t = await getTranslations("parts");

  return (
    <div className="container-brand py-10 sm:py-14">
      <Breadcrumbs items={[{ name: "Home", url: "/" }, { name: t("title"), url: "/parts" }]} />
      <div className="mx-auto mb-10 mt-4 max-w-2xl text-center">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="mb-16 grid gap-4 sm:grid-cols-3">
        {REASONS.map((r) => (
          <div key={r.title} className="rounded-xl border border-border p-6">
            <r.icon className="h-7 w-7 text-primary" />
            <h3 className="mt-3 font-heading font-bold">{r.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
          </div>
        ))}
      </div>

      <PartsEnquiryForm />
    </div>
  );
}
