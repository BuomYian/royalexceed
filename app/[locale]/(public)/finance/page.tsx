import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Building2, FileText } from "lucide-react";
import { FinanceEnquiryForm } from "@/components/forms/finance-enquiry-form";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("finance");
  return { title: t("title"), alternates: { canonical: "/finance" } };
}

const DOCUMENTS = [
  "Valid national ID or passport",
  "Proof of income / bank statements (last 6 months)",
  "Proof of residence in South Sudan",
  "Company registration documents (for corporate/fleet purchases)",
];

export default async function FinancePage() {
  const t = await getTranslations("finance");

  return (
    <div className="container-brand py-10 sm:py-14">
      <Breadcrumbs items={[{ name: "Home", url: "/" }, { name: t("title"), url: "/finance" }]} />
      <div className="mx-auto mb-10 mt-4 max-w-2xl text-center">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">{t("title")}</h1>
      </div>

      {/* No financing partners confirmed yet — "coming soon" enquiry variant per spec §6 fallback. */}
      <Card className="mx-auto mb-16 max-w-2xl border-primary/30 bg-primary/5">
        <CardContent className="pt-6 text-center">
          <h2 className="font-heading text-xl font-bold">{t("comingSoonTitle")}</h2>
          <p className="mt-2 text-muted-foreground">{t("comingSoonBody")}</p>
        </CardContent>
      </Card>

      <div className="mx-auto mb-16 max-w-2xl">
        <div className="flex items-start gap-3">
          <Building2 className="mt-1 h-6 w-6 shrink-0 text-primary" />
          <div>
            <h2 className="font-heading text-xl font-bold">{t("fleetTitle")}</h2>
            <p className="mt-1 text-muted-foreground">{t("fleetBody")}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto mb-16 max-w-2xl">
        <div className="flex items-start gap-3">
          <FileText className="mt-1 h-6 w-6 shrink-0 text-primary" />
          <div>
            <h2 className="font-heading text-xl font-bold">{t("documentsTitle")}</h2>
            <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-muted-foreground">
              {DOCUMENTS.map((d) => <li key={d}>{d}</li>)}
            </ul>
          </div>
        </div>
      </div>

      <FinanceEnquiryForm />
    </div>
  );
}
