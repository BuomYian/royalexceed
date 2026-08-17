import { Fragment } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { PriceDisplay } from "@/components/vehicle/price-display";
import { cn } from "@/lib/utils";

type CompareModel = {
  slug: string;
  displayName: string;
  thumbnailUrl: string | null;
  startingPriceUsd: number | null;
  priceOnRequest: boolean;
  bodyType: string;
  seats: number;
  specGroups: { title: string; specs: { label: string; value: string; unit: string | null }[] }[];
};

export function CompareTable({ models, usdToSsp }: { models: CompareModel[]; usdToSsp: number }) {
  const groupTitles = [...new Set(models.flatMap((m) => m.specGroups.map((g) => g.title)))];
  const labelsByGroup = new Map<string, string[]>();
  for (const title of groupTitles) {
    const labels = new Set<string>();
    for (const model of models) {
      const group = model.specGroups.find((g) => g.title === title);
      group?.specs.forEach((s) => labels.add(s.label));
    }
    labelsByGroup.set(title, [...labels]);
  }

  function valueFor(model: CompareModel, groupTitle: string, label: string) {
    const spec = model.specGroups.find((g) => g.title === groupTitle)?.specs.find((s) => s.label === label);
    return spec ? `${spec.value}${spec.unit ? ` ${spec.unit}` : ""}` : "—";
  }

  function isDifferent(groupTitle: string, label: string) {
    const values = models.map((m) => valueFor(m, groupTitle, label));
    return new Set(values).size > 1;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-160 border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="w-40 p-3 text-start text-sm text-muted-foreground" />
            {models.map((m) => (
              <th key={m.slug} className="p-3 text-start">
                <Link href={`/models/${m.slug}`} className="block space-y-2 hover:underline">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                    {m.thumbnailUrl && <Image src={m.thumbnailUrl} alt={m.displayName} fill sizes="300px" className="object-cover" />}
                  </div>
                  <p className="font-heading font-bold">{m.displayName}</p>
                </Link>
                <PriceDisplay usdAmount={m.startingPriceUsd} usdToSsp={usdToSsp} priceOnRequest={m.priceOnRequest} size="sm" className="mt-1" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-t border-border p-3 text-sm text-muted-foreground">Body type</td>
            {models.map((m) => <td key={m.slug} className="border-t border-border p-3 text-sm">{m.bodyType}</td>)}
          </tr>
          <tr>
            <td className="border-t border-border p-3 text-sm text-muted-foreground">Seats</td>
            {models.map((m) => <td key={m.slug} className="border-t border-border p-3 text-sm">{m.seats}</td>)}
          </tr>
          {groupTitles.map((groupTitle) => (
            <Fragment key={groupTitle}>
              <tr>
                <td colSpan={models.length + 1} className="border-t border-border bg-muted/40 p-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {groupTitle}
                </td>
              </tr>
              {labelsByGroup.get(groupTitle)!.map((label) => (
                <tr key={`${groupTitle}-${label}`}>
                  <td className="border-t border-border p-3 text-sm text-muted-foreground">{label}</td>
                  {models.map((m) => (
                    <td
                      key={m.slug}
                      className={cn(
                        "border-t border-border p-3 text-sm",
                        isDifferent(groupTitle, label) && "bg-primary/5 font-medium",
                      )}
                    >
                      {valueFor(m, groupTitle, label)}
                    </td>
                  ))}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
