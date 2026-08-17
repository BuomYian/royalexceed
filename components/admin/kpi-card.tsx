import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
  className,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  className?: string;
}) {
  return (
    <Card className={cn(className)}>
      <CardContent className="flex items-start justify-between gap-3 py-1">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 font-heading text-2xl font-bold">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4.5 w-4.5" />
        </div>
      </CardContent>
    </Card>
  );
}
