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

  // Prefer live model data for the hero banner: `SiteSetting.heroSlides` has
  // no admin UI to manage it (nothing writes to it after the initial seed),
  // so treating it as the primary source lets it silently go stale — a
  // model's hero image gets updated in the CMS but the homepage banner never
  // reflects it. Featured models' own `heroImageUrl` is what admins actually
  // maintain, so build slides from that; `heroSlides` remains available as a
  // manual override for whenever curated (non-model) banner copy is needed.
  const modelHeroSlides = models
    .filter((m) => m.heroImageUrl)
    .slice(0, 3)
    .map((m) => ({
      id: m.slug,
      imageUrl: m.heroImageUrl!,
      headline: m.displayName,
      subheadline: m.tagline ?? undefined,
    }));
  const heroSlides = modelHeroSlides.length ? modelHeroSlides : settings.heroSlides;

  return (
    <>
      <StructuredData data={autoDealerJsonLd(settings)} />
      <Hero slides={heroSlides.filter((s) => s.imageUrl)} />
      <TrustBar />
      <ModelRangeGrid
        models={models.map((m) => ({ ...m, startingPriceUsd: m.startingPriceUsd ? Number(m.startingPriceUsd) : null }))}
      />
      <FeaturedInventoryStrip
        units={inventory.map((u) => ({ ...u, priceUsd: u.priceUsd ? Number(u.priceUsd) : null }))}
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
