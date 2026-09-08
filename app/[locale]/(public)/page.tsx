import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";
import { getFeaturedModels, getModelsForHero } from "@/lib/data/models";
import { getFeaturedInventory } from "@/lib/data/inventory";
import { getApprovedTestimonials } from "@/lib/data/testimonials";
import { getLatestArticles } from "@/lib/data/articles";
import { getSiteStats } from "@/lib/data/stats";
import { Hero } from "@/components/marketing/hero";
import { AboutTeaser } from "@/components/marketing/about-teaser";
import { TrustBar } from "@/components/marketing/trust-bar";
import { StatsBand } from "@/components/marketing/stats-band";
import { ModelRangeGrid } from "@/components/marketing/model-range-grid";
import { FeaturedInventoryStrip } from "@/components/marketing/featured-inventory-strip";
import { WhyFbm } from "@/components/marketing/why-fbm";
import { ServicesOverview } from "@/components/marketing/services-overview";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { NewsPreview } from "@/components/marketing/news-preview";
import { LocationBlock } from "@/components/marketing/location-block";
import { LeadCaptureBand } from "@/components/marketing/lead-capture-band";
import { StructuredData } from "@/components/shared/structured-data";
import { Reveal } from "@/components/shared/reveal";
import { autoDealerJsonLd } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    // `absolute` opts out of the root layout's "%s | 211Motors" template —
    // the configured SEO title already leads with the company name, so
    // without this the home page title renders the brand twice.
    title: { absolute: settings.seoDefaults?.title ?? "" },
    description: settings.seoDefaults?.description,
    alternates: { canonical: "/" },
    openGraph: { title: settings.seoDefaults?.title, description: settings.seoDefaults?.description, type: "website" },
  };
}

export default async function HomePage() {
  const [settings, models, heroModels, inventory, testimonials, articles, stats] = await Promise.all([
    getSiteSettings(),
    getFeaturedModels(),
    getModelsForHero(),
    getFeaturedInventory(),
    // The testimonials block is a carousel now, so pull enough to be worth
    // rotating through rather than the four that filled the old static grid.
    getApprovedTestimonials(8),
    getLatestArticles(3),
    getSiteStats(),
  ]);

  // Prefer live model data for the hero banner: `SiteSetting.heroSlides` has
  // no admin UI to manage it (nothing writes to it after the initial seed),
  // so treating it as the primary source lets it silently go stale — a
  // model's hero image gets updated in the CMS but the homepage banner never
  // reflects it. Every published model with a hero image rotates through
  // (not just featured, not capped) — `heroSlides` remains available as a
  // manual override for whenever curated (non-model) banner copy is needed.
  const modelHeroSlides = heroModels.map((m) => ({
    id: m.slug,
    imageUrl: m.heroImageUrl!,
    headline: m.displayName,
    subheadline: m.tagline ?? undefined,
  }));
  const heroSlides = modelHeroSlides.length ? modelHeroSlides : settings.heroSlides;

  return (
    <>
      <StructuredData data={autoDealerJsonLd(settings)} />
      {/* Hero animates itself (slide crossfade) — reveal starts from the section after it. */}
      <Hero slides={heroSlides.filter((s) => s.imageUrl)} />
      <Reveal><AboutTeaser /></Reveal>
      <TrustBar />
      {/* Counts up from zero on scroll-in — StatsBand runs its own
          IntersectionObserver, so it isn't wrapped in <Reveal>. */}
      <StatsBand modelCount={stats.modelCount} unitsInStock={stats.unitsInStock} />
      {/* These two grids stagger-reveal each card individually (inside the
          component itself) rather than fading in as one block. */}
      <ModelRangeGrid
        models={models.map((m) => ({ ...m, startingPriceUsd: m.startingPriceUsd ? Number(m.startingPriceUsd) : null }))}
      />
      <FeaturedInventoryStrip
        units={inventory.map((u) => ({ ...u, priceUsd: u.priceUsd ? Number(u.priceUsd) : null }))}
      />
      <Reveal><WhyFbm /></Reveal>
      <Reveal><ServicesOverview /></Reveal>
      <Reveal><TestimonialsSection testimonials={testimonials} /></Reveal>
      <Reveal><NewsPreview articles={articles} /></Reveal>
      <Reveal><LocationBlock settings={settings} /></Reveal>
      <Reveal><LeadCaptureBand /></Reveal>
    </>
  );
}
