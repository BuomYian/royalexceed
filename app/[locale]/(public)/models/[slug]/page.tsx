import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getModelBySlug, getRelatedModels, incrementModelViewCount } from "@/lib/data/models";
import { getSiteSettings } from "@/lib/settings";
import { Gallery } from "@/components/vehicle/gallery";
import { ColorSwitcher } from "@/components/vehicle/color-switcher";
import { PriceDisplay } from "@/components/vehicle/price-display";
import { SpecTable } from "@/components/vehicle/spec-table";
import { VehicleCard } from "@/components/vehicle/vehicle-card";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { StructuredData } from "@/components/shared/structured-data";
import { StickyMobileCta } from "@/components/vehicle/sticky-mobile-cta";
import { WhatsAppEnquireButton } from "@/components/shared/whatsapp-enquire-button";
import { vehicleProductJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Image from "next/image";

export async function generateMetadata({ params }: PageProps<"/[locale]/models/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const model = await getModelBySlug(slug);
  if (!model) return {};

  return {
    title: model.metaTitle ?? model.displayName,
    description: model.metaDescription ?? model.tagline ?? model.description.slice(0, 160),
    alternates: { canonical: `/models/${model.slug}` },
    openGraph: {
      title: model.metaTitle ?? model.displayName,
      description: model.metaDescription ?? model.tagline ?? undefined,
      images: model.ogImageUrl ? [model.ogImageUrl] : model.heroImageUrl ? [model.heroImageUrl] : undefined,
    },
  };
}

export default async function ModelDetailPage({ params }: PageProps<"/[locale]/models/[slug]">) {
  const { slug } = await params;
  const t = await getTranslations("modelDetail");
  const tCommon = await getTranslations("common");

  const model = await getModelBySlug(slug);
  if (!model) notFound();

  void incrementModelViewCount(slug);

  const [settings, related] = await Promise.all([
    getSiteSettings(),
    getRelatedModels(slug, model.bodyType, 3),
  ]);

  const startingPrice = model.startingPriceUsd ? Number(model.startingPriceUsd) : null;

  return (
    <div className="pb-24 lg:pb-0">
      <StructuredData
        data={vehicleProductJsonLd({
          displayName: model.displayName,
          description: model.description,
          slug: model.slug,
          heroImageUrl: model.heroImageUrl,
          startingPriceUsd: startingPrice,
          bodyType: model.bodyType,
          seats: model.seats,
        })}
      />

      <div className="container-brand py-8 sm:py-10">
        <Breadcrumbs
          items={[
            { name: "Home", url: "/" },
            { name: "Models", url: "/models" },
            { name: model.displayName, url: `/models/${model.slug}` },
          ]}
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Gallery
              images={model.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt, category: i.category }))}
              heroImageUrl={model.heroImageUrl}
            />
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div>
              <h1 className="font-heading text-3xl font-extrabold sm:text-4xl">{model.displayName}</h1>
              {model.tagline && <p className="mt-1 text-lg text-muted-foreground">{model.tagline}</p>}
            </div>

            <PriceDisplay usdAmount={startingPrice} usdToSsp={settings.usdToSsp} priceOnRequest={model.priceOnRequest} size="lg" />

            <ColorSwitcher
              colors={model.colors.map((c) => ({ id: c.id, name: c.name, hexCode: c.hexCode, imageUrl: c.imageUrl }))}
              fallbackImageUrl={model.heroImageUrl}
              fallbackAlt={model.displayName}
            />

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button size="lg" render={<a href="/test-drive">{tCommon("bookTestDrive")}</a>} />
              <Button size="lg" variant="outline" render={<a href={`/models/${model.slug}#quote`}>{tCommon("requestQuote")}</a>} />
            </div>
            <WhatsAppEnquireButton modelDisplayName={model.displayName} whatsappNumber={settings.whatsappNumber} />

            {model.brochureUrl && (
              <Button
                variant="outline"
                className="w-full"
                render={
                  <a href={model.brochureUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" /> {t("downloadBrochure")}
                  </a>
                }
              />
            )}

            {model.variants.length > 0 && (
              <div className="rounded-lg border border-border p-4">
                <p className="mb-2 text-sm font-semibold">Variants</p>
                <ul className="space-y-1.5 text-sm">
                  {model.variants.map((v) => (
                    <li key={v.id} className="flex justify-between">
                      <span className="text-muted-foreground">{v.name}</span>
                      {v.priceUsd && <span className="font-medium">${Number(v.priceUsd).toLocaleString()}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {model.features.length > 0 && (
          <div className="mt-16 space-y-16">
            {model.features.map((feature) => (
              <div
                key={feature.id}
                className={`grid items-center gap-8 lg:grid-cols-2 ${feature.layout === "image-left" ? "lg:[&>*:first-child]:order-2" : ""}`}
              >
                {feature.imageUrl && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={feature.imageUrl}
                      alt={feature.title}
                      fill
                      loading="lazy"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h2 className="font-heading text-2xl font-bold">{feature.title}</h2>
                  <p className="mt-3 text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {model.specGroups.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 font-heading text-2xl font-bold">{t("specs")}</h2>
            <SpecTable groups={model.specGroups} />
          </div>
        )}

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 font-heading text-2xl font-bold">{t("relatedModels")}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((m) => (
                <VehicleCard
                  key={m.slug}
                  model={{ ...m, startingPriceUsd: m.startingPriceUsd ? Number(m.startingPriceUsd) : null }}
                  usdToSsp={settings.usdToSsp}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <StickyMobileCta
        modelSlug={model.slug}
        whatsappNumber={settings.whatsappNumber}
        modelDisplayName={model.displayName}
      />
    </div>
  );
}
