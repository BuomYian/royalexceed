import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { listModelOptions } from "@/lib/data/models";
import { getSiteSettings } from "@/lib/settings";
import { TestDriveForm } from "@/components/forms/test-drive-form";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("testDrive");
  return { title: t("title"), description: t("subtitle"), alternates: { canonical: "/test-drive" } };
}

export default async function TestDrivePage() {
  const t = await getTranslations("testDrive");
  const [models, settings] = await Promise.all([listModelOptions(), getSiteSettings()]);

  return (
    <div className="container-brand py-10 sm:py-14">
      <Breadcrumbs items={[{ name: "Home", url: "/" }, { name: t("title"), url: "/test-drive" }]} />
      <div className="mx-auto mb-10 mt-4 max-w-lg text-center">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <TestDriveForm
        models={models.map((m) => ({ id: m.id, displayName: m.displayName }))}
        whatsappNumber={settings.whatsappNumber}
      />
    </div>
  );
}
