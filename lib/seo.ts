import type { ResolvedSiteSettings } from "@/lib/settings";

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export function autoDealerJsonLd(settings: ResolvedSiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: settings.companyName,
    description: settings.seoDefaults?.description,
    url: siteUrl(),
    telephone: settings.phone,
    email: settings.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address.line,
      addressLocality: settings.address.city,
      addressCountry: settings.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: settings.address.lat,
      longitude: settings.address.lng,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: parseOpenTime(settings.hours.monFri),
        closes: parseCloseTime(settings.hours.monFri),
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: parseOpenTime(settings.hours.saturday),
        closes: parseCloseTime(settings.hours.saturday),
      },
    ],
    sameAs: Object.values(settings.socials).filter(Boolean),
  };
}

function parseOpenTime(range: string): string {
  return range.split(/[–-]/)[0]?.trim() || "08:00";
}
function parseCloseTime(range: string): string {
  return range.split(/[–-]/)[1]?.trim() || "18:00";
}

export function vehicleProductJsonLd(model: {
  displayName: string;
  description: string;
  slug: string;
  heroImageUrl: string | null;
  startingPriceUsd: number | null;
  bodyType: string;
  seats: number;
}) {
  // Brand is the first word of the display name ("Soueast S07" -> "Soueast",
  // "212 T01" -> "212") — avoids hardcoding a single manufacturer now that
  // Exceed Limited distributes two brands.
  const brand = model.displayName.split(" ")[0];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: model.displayName,
    description: model.description,
    image: model.heroImageUrl ? [model.heroImageUrl] : undefined,
    url: `${siteUrl()}/models/${model.slug}`,
    brand: { "@type": "Brand", name: brand },
    ...(model.startingPriceUsd !== null && {
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        price: model.startingPriceUsd,
        availability: "https://schema.org/InStock",
        seller: { "@type": "AutoDealer", name: "Exceed Limited" },
      },
    }),
    additionalProperty: [
      { "@type": "PropertyValue", name: "Body type", value: model.bodyType },
      { "@type": "PropertyValue", name: "Seats", value: model.seats },
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function newsArticleJsonLd(article: {
  title: string;
  excerpt?: string | null;
  coverImageUrl: string | null;
  slug: string;
  publishedAt: Date | null;
  updatedAt: Date;
  authorName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt ?? undefined,
    image: article.coverImageUrl ? [article.coverImageUrl] : undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: { "@type": "Person", name: article.authorName },
    mainEntityOfPage: `${siteUrl()}/news/${article.slug}`,
  };
}
