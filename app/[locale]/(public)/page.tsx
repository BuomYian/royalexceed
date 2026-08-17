import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";
import { getFeaturedModels } from "@/lib/data/models";
import { getFeaturedInventory } from "@/lib/data/inventory";
import { getApprovedTestimonials } from "@/lib/data/testimonials";
import { getLatestArticles } from "@/lib/data/articles";
import { Hero } from "@/components/marketing/hero";
import { TrustBar } from "@/components/marketing/trust-bar";
import { ModelRangeGrid } from "@/components/marketing/model-range-grid";
import { FeaturedInventoryStrip } from "@/components/marketing/featured-inventory-strip";
import { WhyFbm } from "@/components/marketing/why-fbm";
import { ServicesOverview } from "@/components/marketing/services-overview";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { NewsPreview } from "@/components/marketing/news-preview";
import { LocationBlock } from "@/components/marketing/location-block";
import { LeadCaptureBand } from "@/components/marketing/lead-capture-band";
import { StructuredData } from "@/components/shared/structured-data";
import { autoDealerJsonLd } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.seoDefaults?.title,
    description: settings.seoDefaults?.description,
    alternates: { canonical: "/" },
    openGraph: { title: settings.seoDefaults?.title, description: settings.seoDefaults?.description, type: "website" },
  };
}

export default async function HomePage() {
  const [settings, models, inventory, testimonials, articles] = await Promise.all([
    getSiteSettings(),
    getFeaturedModels(),
    getFeaturedInventory(),
    getApprovedTestimonials(4),
    getLatestArticles(3),
  ]);

  const heroSlides = settings.heroSlides.length
    ? settings.heroSlides
    : models.slice(0, 3).map((m) => ({
        id: m.slug,
        imageUrl: m.thumbnailUrl ?? "",
        headline: m.displayName,
        subheadline: m.tagline ?? undefined,
      }));

  return (
    <>
      <StructuredData data={autoDealerJsonLd(settings)} />
      <Hero slides={heroSlides.filter((s) => s.imageUrl)} />
      <TrustBar />
      <ModelRangeGrid
        models={models.map((m) => ({ ...m, startingPriceUsd: m.startingPriceUsd ? Number(m.startingPriceUsd) : null }))}
        usdToSsp={settings.usdToSsp}
      />
      <FeaturedInventoryStrip
        units={inventory.map((u) => ({ ...u, priceUsd: u.priceUsd ? Number(u.priceUsd) : null }))}
        usdToSsp={settings.usdToSsp}
      />
      <WhyFbm />
      <ServicesOverview />
      <TestimonialsSection testimonials={testimonials} />
      <NewsPreview articles={articles} />
      <LocationBlock settings={settings} />
      <LeadCaptureBand />
    </>
  );
}
