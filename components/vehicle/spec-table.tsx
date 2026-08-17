export function SpecTable({
  groups,
}: {
  groups: { id: string; title: string; specs: { id: string; label: string; value: string; unit: string | null }[] }[];
}) {
  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.id}>
          <h3 className="mb-3 font-heading text-lg font-bold">{group.title}</h3>
          <dl className="divide-y divide-border rounded-lg border border-border">
            {group.specs.map((spec) => (
              <div key={spec.id} className="flex justify-between gap-4 px-4 py-2.5 text-sm odd:bg-muted/30">
                <dt className="text-muted-foreground">{spec.label}</dt>
                <dd className="text-end font-medium">
                  {spec.value}
                  {spec.unit ? ` ${spec.unit}` : ""}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
