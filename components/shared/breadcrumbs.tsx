import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { StructuredData } from "@/components/shared/structured-data";
import { breadcrumbJsonLd, siteUrl } from "@/lib/seo";

export function Breadcrumbs({ items }: { items: { name: string; url: string }[] }) {
  const absoluteItems = items.map((item) => ({ ...item, url: `${siteUrl()}${item.url}` }));

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <StructuredData data={breadcrumbJsonLd(absoluteItems)} />
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => (
          <li key={item.url} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
            {index === items.length - 1 ? (
              <span aria-current="page" className="text-foreground">{item.name}</span>
            ) : (
              <Link href={item.url} className="hover:text-foreground">{item.name}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
